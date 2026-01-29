/**
 * Nano Banana Inpainting - Gemini API Integration
 * Handles communication with Google's Gemini API for inpainting/editing.
 */

import type { NanoBananaState, NanoBananaVariation } from "../types";

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";

type GeminiModel = NanoBananaState["model"];

const MODEL_MAP: Record<GeminiModel, string> = {
    auto: "gemini-2.0-flash-exp-image-generation",
    "gemini-3-pro": "gemini-2.0-flash-exp-image-generation", // Placeholder - update when available
    "gemini-2.5-flash": "gemini-2.0-flash-exp-image-generation",
};

export type GenerateImageParams = {
    apiKey: string;
    model: GeminiModel;
    prompt: string;
    mode: "replace" | "erase";
    /** Base64 encoded image data (without data URL prefix) */
    baseImage: string;
    /** Base64 encoded mask image (white = area to inpaint) */
    maskImage: string;
    /** Number of variations to generate */
    count: number;
};

export type GenerateImageResult = {
    success: boolean;
    variations: NanoBananaVariation[];
    error?: string;
};

/**
 * Generate inpainted image variations using Gemini API.
 */
export async function generateInpaintedImages(
    params: GenerateImageParams,
): Promise<GenerateImageResult> {
    const { apiKey, model, prompt, mode, baseImage, maskImage, count } = params;

    if (!apiKey) {
        return { success: false, variations: [], error: "API Key is required" };
    }

    const modelName = MODEL_MAP[model];
    const endpoint = `${GEMINI_API_BASE}/models/${modelName}:generateContent?key=${apiKey}`;

    // Construct prompt based on mode
    const finalPrompt =
        mode === "erase"
            ? `Remove or erase the masked area. ${prompt}`
            : `Replace the masked area with: ${prompt}`;

    const variations: NanoBananaVariation[] = [];

    try {
        // Generate multiple variations (sequential for simplicity, could be parallelized)
        for (let i = 0; i < count; i++) {
            const requestBody = {
                contents: [
                    {
                        parts: [
                            { text: finalPrompt },
                            {
                                inlineData: {
                                    mimeType: "image/png",
                                    data: baseImage,
                                },
                            },
                            {
                                inlineData: {
                                    mimeType: "image/png",
                                    data: maskImage,
                                },
                            },
                        ],
                    },
                ],
                generationConfig: {
                    responseModalities: ["TEXT", "IMAGE"],
                },
            };

            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Gemini API error:", errorData);
                return {
                    success: false,
                    variations,
                    error: `API Error: ${errorData?.error?.message || response.statusText}`,
                };
            }

            const data = await response.json();

            // Extract generated image from response
            const candidates = data.candidates || [];
            for (const candidate of candidates) {
                const parts = candidate.content?.parts || [];
                for (const part of parts) {
                    if (part.inlineData?.mimeType?.startsWith("image/")) {
                        variations.push({
                            id: `variation-${Date.now()}-${i}`,
                            dataURL: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
                        });
                    }
                }
            }
        }

        return { success: true, variations };
    } catch (error) {
        console.error("Failed to generate inpainted images:", error);
        return {
            success: false,
            variations: [],
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Convert canvas element to base64 string (without data URL prefix).
 */
export function canvasToBase64(canvas: HTMLCanvasElement): string {
    const dataURL = canvas.toDataURL("image/png");
    return dataURL.replace(/^data:image\/png;base64,/, "");
}

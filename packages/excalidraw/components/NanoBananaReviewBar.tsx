/**
 * NanoBanana Review Bar Component
 * Shown after generation to select between original and variations.
 * Uses native Excalidraw components for consistent styling.
 */
import React from "react";
import clsx from "clsx";

import { useExcalidrawSetAppState } from "./App";
import { useUIAppState } from "../context/ui-appState";
import { ToolButton } from "./ToolButton";
import { FilledButton } from "./FilledButton";
import { Island } from "./Island";
import Stack from "./Stack";
import { PlusIcon, TrashIcon } from "./icons";

import "./NanoBananaReviewBar.scss";

export const NanoBananaReviewBar = () => {
    const appState = useUIAppState();
    const setAppState = useExcalidrawSetAppState();

    // Only show when in reviewing mode
    if (appState.nanobanana.status !== "reviewing") {
        return null;
    }

    const { variations, selectedVariationIndex } = appState.nanobanana;

    const handleSelectVariation = (index: number) => {
        setAppState({
            nanobanana: { ...appState.nanobanana, selectedVariationIndex: index },
        });
    };

    const handleSave = () => {
        // Trigger commit in App.tsx
        setAppState({
            nanobanana: {
                ...appState.nanobanana,
                status: "committing",
            },
        });
    };

    const handleDiscard = () => {
        // Discard: Reset state to idle (App.tsx will handle cleanup)
        setAppState({
            nanobanana: {
                ...appState.nanobanana,
                status: "idle",
                variations: [],
                selectedVariationIndex: 0,
                maskElementIds: [],
                previewElementId: null,
                prompt: "",
            },
        });
    };

    return (
        <div className="nanobanana-review-bar">
            <Island padding={2}>
                <Stack.Row gap={2} align="center">
                    {/* Original Thumbnail */}
                    <ToolButton
                        type="radio"
                        name="nanobanana-variation"
                        id="nanobanana-original"
                        checked={selectedVariationIndex === 0}
                        title="Original"
                        aria-label="Original"
                        onChange={() => handleSelectVariation(0)}
                        icon={
                            <span className="nanobanana-thumbnail-label">Original</span>
                        }
                    />

                    {/* Generated Variations */}
                    {variations.map((variation, index) => (
                        <ToolButton
                            key={variation.id}
                            type="radio"
                            name="nanobanana-variation"
                            id={`nanobanana-variation-${index}`}
                            checked={selectedVariationIndex === index + 1}
                            title={`Variation ${index + 1}`}
                            aria-label={`Variation ${index + 1}`}
                            onChange={() => handleSelectVariation(index + 1)}
                            icon={
                                <img
                                    src={variation.dataURL}
                                    alt={`Variation ${index + 1}`}
                                    className="nanobanana-thumbnail-img"
                                />
                            }
                        />
                    ))}

                    {/* Add More Button (placeholder) */}
                    <ToolButton
                        type="button"
                        icon={PlusIcon}
                        title="Generate more"
                        aria-label="Generate more variations"
                        disabled
                    />

                    {/* Actions */}
                    <div className="nanobanana-review-actions">
                        <FilledButton label="Save" onClick={handleSave} />
                        <ToolButton
                            type="button"
                            icon={TrashIcon}
                            title="Discard"
                            aria-label="Discard changes"
                            onClick={handleDiscard}
                        />
                    </div>
                </Stack.Row>
            </Island>
        </div>
    );
};

export default NanoBananaReviewBar;

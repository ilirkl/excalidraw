import React, { useState } from "react";
import clsx from "clsx";

import { useExcalidrawSetAppState } from "./App";
import { useUIAppState } from "../context/ui-appState";
import { t } from "../i18n";
import { ToolButton } from "./ToolButton";
import { FilledButton } from "./FilledButton";
import { Island } from "./Island";
import Stack from "./Stack";
import { DotsIcon, PlusIcon, TrashIcon } from "./icons";
import DropdownMenu from "./dropdownMenu/DropdownMenu";
import { RadioGroup } from "./RadioGroup";

import "./NanoBananaPromptBar.scss";

const MinusIcon = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

type NanoBananaMode = "replace" | "erase";
type NanoBananaModel = "auto" | "gemini-3-pro" | "gemini-2.5-flash";

export const NanoBananaPromptBar = () => {
    const appState = useUIAppState();
    const setAppState = useExcalidrawSetAppState();

    const [settingsOpen, setSettingsOpen] = useState(false);

    // Only show when freedraw is active and not in reviewing mode
    if (
        appState.activeTool.type !== "freedraw" ||
        appState.nanobanana.status === "reviewing"
    ) {
        return null;
    }

    const { mode, prompt, model, imageCount, status } = appState.nanobanana;

    const handleModeChange = (newMode: NanoBananaMode) => {
        setAppState({
            nanobanana: { ...appState.nanobanana, mode: newMode },
        });
    };

    const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAppState({
            nanobanana: { ...appState.nanobanana, prompt: e.target.value },
        });
    };

    const handleModelChange = (newModel: NanoBananaModel) => {
        setAppState({
            nanobanana: { ...appState.nanobanana, model: newModel },
        });
    };

    const handleImageCountChange = (delta: number) => {
        const newCount = Math.max(1, Math.min(4, imageCount + delta));
        setAppState({
            nanobanana: { ...appState.nanobanana, imageCount: newCount },
        });
    };

    const handleGenerate = () => {
        if (!prompt.trim()) {
            return;
        }
        setAppState({
            nanobanana: { ...appState.nanobanana, status: "generating" },
        });
        // Trigger is handled in App.tsx componentDidUpdate
    };

    const isGenerating = status === "generating";

    return (
        <div className="nanobanana-prompt-bar">
            <Island padding={2}>
                <Stack.Row gap={2} align="center">
                    {/* Mode Toggle using RadioGroup */}
                    <RadioGroup
                        name="nanobanana-mode"
                        onChange={(val) => handleModeChange(val as NanoBananaMode)}
                        value={mode}
                        choices={[
                            { value: "replace", label: "Replace", ariaLabel: "Replace mode" },
                            { value: "erase", label: "Erase", ariaLabel: "Erase mode" },
                        ]}
                    />

                    <div className="vr" />

                    {/* Prompt Input */}
                    <input
                        type="text"
                        className="nanobanana-prompt-input TextInput"
                        placeholder={
                            mode === "erase"
                                ? "Describe what to erase..."
                                : "Describe what to generate..."
                        }
                        value={prompt}
                        onChange={handlePromptChange}
                        disabled={isGenerating}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !isGenerating && prompt.trim()) {
                                handleGenerate();
                            }
                        }}
                    />

                    {/* Settings Menu */}
                    <DropdownMenu open={settingsOpen}>
                        <DropdownMenu.Trigger
                            onToggle={() => setSettingsOpen(!settingsOpen)}
                        >
                            <ToolButton
                                type="button"
                                icon={DotsIcon}
                                title="Generation settings"
                                aria-label="Generation settings"
                                key="settings-trigger"
                            />
                        </DropdownMenu.Trigger>

                        <DropdownMenu.Content
                            onClickOutside={() => setSettingsOpen(false)}
                            onSelect={() => { }} // Keep open on interaction usually, but here handle manually
                            className="nanobanana-settings-dropdown"
                        >
                            {/* Image Count - Zoom Style */}
                            <DropdownMenu.ItemCustom>
                                <div className="nanobanana-setting-row">
                                    <span className="nanobanana-setting-label">Images</span>
                                    <Stack.Row gap={1} align="center" className="nanobanana-count-control">
                                        <ToolButton
                                            type="button"
                                            icon={MinusIcon}
                                            title="Decrease"
                                            aria-label="Decrease image count"
                                            onClick={() => handleImageCountChange(-1)}
                                            disabled={imageCount <= 1}
                                            size="small"
                                            key="minus"
                                        />
                                        <div className="nanobanana-image-count-value">{imageCount}</div>
                                        <ToolButton
                                            type="button"
                                            icon={PlusIcon}
                                            title="Increase"
                                            aria-label="Increase image count"
                                            onClick={() => handleImageCountChange(1)}
                                            disabled={imageCount >= 4}
                                            size="small"
                                            key="plus"
                                        />
                                    </Stack.Row>
                                </div>
                            </DropdownMenu.ItemCustom>

                            <DropdownMenu.Separator />

                            {/* Model Selection - Label + Simple items or RadioGroup? 
                  RadioGroup is cleaner if it fits. 
              */}
                            <DropdownMenu.ItemCustom>
                                <div className="nanobanana-setting-row full-width">
                                    <span className="nanobanana-setting-label" style={{ marginBottom: 8, display: 'block' }}>Model</span>
                                    <RadioGroup
                                        name="nanobanana-model"
                                        onChange={(val) => handleModelChange(val as NanoBananaModel)}
                                        value={model}
                                        choices={[
                                            { value: "auto", label: "Auto" },
                                            { value: "gemini-3-pro", label: "Pro" },
                                            { value: "gemini-2.5-flash", label: "Flash" },
                                        ]}
                                    />
                                </div>
                            </DropdownMenu.ItemCustom>
                        </DropdownMenu.Content>
                    </DropdownMenu>

                    <div className="vr" />

                    {/* Generate Button */}
                    <FilledButton
                        label={isGenerating ? "Generating..." : "Generate"}
                        onClick={handleGenerate}
                        disabled={isGenerating || !prompt.trim()}
                        status={isGenerating ? "loading" : null}
                    />
                </Stack.Row>
            </Island>
        </div>
    );
};

export default NanoBananaPromptBar;

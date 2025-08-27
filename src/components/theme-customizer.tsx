"use client";

import * as React from "react";
import { Palette, Sparkles, RotateCcw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useThemeCustomizer } from "@/hooks/use-theme-customizer";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface ThemeCustomizerProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function ThemeCustomizer({ open, onOpenChange }: ThemeCustomizerProps) {
	const { theme: currentMode } = useTheme();
	const {
		currentTheme,
		loadPreset,
		updateCustomColor,
		resetToPreset,
		themePresets,
	} = useThemeCustomizer();

	const [selectedPreset, setSelectedPreset] = React.useState(
		currentTheme.preset,
	);
	const [customPrimary, setCustomPrimary] = React.useState(
		currentTheme.customColors.primary || "",
	);
	const [customAccent, setCustomAccent] = React.useState(
		currentTheme.customColors.accent || "",
	);

	const handlePresetSelect = (presetId: string) => {
		setSelectedPreset(presetId);
		const newTheme = loadPreset(presetId);
		setCustomPrimary("");
		setCustomAccent("");
	};

	const handleColorChange = (type: "primary" | "accent", value: string) => {
		if (type === "primary") {
			setCustomPrimary(value);
		} else {
			setCustomAccent(value);
		}
		// Convert hex to oklch for consistency
		const oklchColor = hexToOklch(value);
		if (oklchColor) {
			updateCustomColor(type, oklchColor);
		}
	};

	const handleReset = () => {
		resetToPreset();
		setCustomPrimary("");
		setCustomAccent("");
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Palette className="h-5 w-5" />
						Customize Theme
					</DialogTitle>
					<DialogDescription>
						Choose a mood preset or create your own color scheme
					</DialogDescription>
				</DialogHeader>

				<Tabs defaultValue="presets" className="w-full">
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="presets">Mood Presets</TabsTrigger>
						<TabsTrigger value="custom">Custom Colors</TabsTrigger>
					</TabsList>

					<TabsContent value="presets" className="space-y-4">
						<div className="grid grid-cols-2 gap-3">
							{themePresets.map((preset) => (
								<button
									key={preset.id}
									onClick={() => handlePresetSelect(preset.id)}
									className={cn(
										"relative flex flex-col items-start gap-2 p-4 rounded-lg border-2 transition-all",
										"hover:shadow-md hover:scale-[1.02]",
										selectedPreset === preset.id
											? "border-primary bg-accent/10"
											: "border-border hover:border-muted-foreground/50",
									)}
								>
									{selectedPreset === preset.id && (
										<div className="absolute top-2 right-2">
											<Check className="h-4 w-4 text-primary" />
										</div>
									)}

									<div className="flex items-center gap-2">
										<span className="text-2xl">{preset.emoji}</span>
										<span className="font-medium">{preset.name}</span>
									</div>

									<p className="text-xs text-muted-foreground text-left">
										{preset.description}
									</p>

									<div className="flex gap-1 w-full mt-2">
										{/* Color preview circles */}
										<div className="flex gap-1 flex-1">
											<div
												className="h-6 w-6 rounded-full border"
												style={{
													background:
														currentMode === "dark"
															? preset.dark.primary
															: preset.light.primary,
												}}
											/>
											<div
												className="h-6 w-6 rounded-full border"
												style={{
													background:
														currentMode === "dark"
															? preset.dark.accent
															: preset.light.accent,
												}}
											/>
											<div
												className="h-6 w-6 rounded-full border"
												style={{
													background:
														currentMode === "dark"
															? preset.dark.background
															: preset.light.background,
												}}
											/>
										</div>
									</div>
								</button>
							))}
						</div>
					</TabsContent>

					<TabsContent value="custom" className="space-y-4">
						<div className="space-y-4">
							<div>
								<Label htmlFor="primary" className="mb-2 block">
									Primary Color
								</Label>
								<div className="flex gap-2">
									<input
										id="primary"
										type="color"
										value={oklchToHex(
											customPrimary ||
												(currentMode === "dark"
													? currentTheme.dark.primary
													: currentTheme.light.primary),
										)}
										onChange={(e) =>
											handleColorChange("primary", e.target.value)
										}
										className="h-10 w-20 rounded border cursor-pointer"
									/>
									<input
										type="text"
										value={customPrimary || ""}
										onChange={(e) => setCustomPrimary(e.target.value)}
										placeholder="oklch(0.65 0.25 285)"
										className="flex-1 px-3 py-2 border rounded-md bg-background"
									/>
								</div>
								<p className="text-xs text-muted-foreground mt-1">
									Main brand color for buttons and interactive elements
								</p>
							</div>

							<div>
								<Label htmlFor="accent" className="mb-2 block">
									Accent Color
								</Label>
								<div className="flex gap-2">
									<input
										id="accent"
										type="color"
										value={oklchToHex(
											customAccent ||
												(currentMode === "dark"
													? currentTheme.dark.accent
													: currentTheme.light.accent),
										)}
										onChange={(e) =>
											handleColorChange("accent", e.target.value)
										}
										className="h-10 w-20 rounded border cursor-pointer"
									/>
									<input
										type="text"
										value={customAccent || ""}
										onChange={(e) => setCustomAccent(e.target.value)}
										placeholder="oklch(0.92 0.025 55)"
										className="flex-1 px-3 py-2 border rounded-md bg-background"
									/>
								</div>
								<p className="text-xs text-muted-foreground mt-1">
									Secondary color for highlights and special elements
								</p>
							</div>

							<div className="p-4 rounded-lg border bg-muted/50">
								<div className="flex items-center gap-2 mb-3">
									<Sparkles className="h-4 w-4 text-primary" />
									<span className="text-sm font-medium">Preview</span>
								</div>
								<div className="flex gap-2">
									<Button variant="default" size="sm">
										Primary Button
									</Button>
									<Button variant="secondary" size="sm">
										Secondary
									</Button>
									<Button variant="outline" size="sm">
										Outline
									</Button>
									<Button variant="ghost" size="sm">
										Ghost
									</Button>
								</div>
								<div className="mt-3 flex gap-2">
									<div className="h-8 w-8 rounded bg-primary" />
									<div className="h-8 w-8 rounded bg-accent" />
									<div className="h-8 w-8 rounded bg-muted" />
									<div className="h-8 w-8 rounded bg-background border" />
								</div>
							</div>
						</div>
					</TabsContent>
				</Tabs>

				<DialogFooter className="gap-2">
					<Button variant="outline" onClick={handleReset} className="mr-auto">
						<RotateCcw className="h-4 w-4 mr-2" />
						Reset to Preset
					</Button>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button onClick={() => onOpenChange(false)}>Apply Theme</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

// Helper functions for color conversion
function hexToOklch(hex: string): string {
	// Simple conversion - in production, use a proper color library
	try {
		const r = parseInt(hex.slice(1, 3), 16) / 255;
		const g = parseInt(hex.slice(3, 5), 16) / 255;
		const b = parseInt(hex.slice(5, 7), 16) / 255;

		// Approximate conversion to oklch
		const l = Math.sqrt(0.299 * r * r + 0.587 * g * g + 0.114 * b * b);
		const c = Math.sqrt((r - g) ** 2 + (g - b) ** 2) * 0.3;
		const h = Math.atan2(b - g, r - g) * (180 / Math.PI) + 180;

		return `oklch(${l.toFixed(2)} ${c.toFixed(2)} ${h.toFixed(0)})`;
	} catch {
		return hex;
	}
}

function oklchToHex(oklch: string): string {
	// Extract oklch values using regex
	const match = oklch.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/);
	if (!match) return "#6366f1"; // Default fallback color

	const [, l, c, h] = match.map(Number);

	// Approximate conversion back to RGB
	const hRad = (h * Math.PI) / 180;
	const a = c * Math.cos(hRad);
	const b = c * Math.sin(hRad);

	// Simple approximation - not perfectly accurate but good enough for preview
	const r = Math.max(0, Math.min(1, l + a * 0.3));
	const g = Math.max(0, Math.min(1, l - a * 0.11 - b * 0.17));
	const blue = Math.max(0, Math.min(1, l - a * 0.11 + b * 0.17));

	const toHex = (n: number) =>
		Math.round(n * 255)
			.toString(16)
			.padStart(2, "0");
	return `#${toHex(r)}${toHex(g)}${toHex(blue)}`;
}

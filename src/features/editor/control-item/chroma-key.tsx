import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Pipette, RotateCcw, Wand2 } from "lucide-react";
import useStore from "../store/use-store";
import useChromaKeyStore from "../store/use-chroma-key-store";
import { dispatch } from "@designcombo/events";
import { toast } from "sonner";

interface ChromaKeySettings {
	enabled: boolean;
	keyColor: string;
	similarity: number; // 0-1 (tolerance)
	smoothness: number; // 0-1 (edge feathering)
	spill: number; // 0-1 (color spill suppression)
	contrast: number; // 0-2
	brightness: number; // -1 to 1
}

export default function ChromaKeyControl() {
	const { activeIds, trackItemsMap } = useStore();
	const { setChromaKey, getChromaKey } = useChromaKeyStore();
	const [settings, setSettings] = useState<ChromaKeySettings>({
		enabled: false,
		keyColor: "#00FF00", // Default green screen
		similarity: 0.4,
		smoothness: 0.1,
		spill: 0.1,
		contrast: 1,
		brightness: 0,
	});

	const [isPickingColor, setIsPickingColor] = useState(false);

	// Get active video item
	const activeItem =
		activeIds.length === 1 ? trackItemsMap[activeIds[0]] : null;
	const isVideo = activeItem?.type === "video";

	useEffect(() => {
		// Load settings from store
		if (activeItem) {
			const stored = getChromaKey(activeItem.id);
			if (stored) {
				setSettings(stored);
			} else {
				setSettings({
					enabled: false,
					keyColor: "#00FF00",
					similarity: 0.4,
					smoothness: 0.1,
					spill: 0.1,
					contrast: 1,
					brightness: 0,
				});
			}
		}
	}, [activeItem, getChromaKey]);

	const handleSettingChange = (key: keyof ChromaKeySettings, value: any) => {
		const newSettings = { ...settings, [key]: value };
		setSettings(newSettings);

		// Save to store
		if (activeItem) {
			setChromaKey(activeItem.id, newSettings);

			// Force re-render - trigger a state change
			window.dispatchEvent(
				new CustomEvent("chromakey-changed", {
					detail: { itemId: activeItem.id, settings: newSettings },
				}),
			);
		}
	};

	const handleColorPick = () => {
		setIsPickingColor(true);
		toast.info("Click on the video to pick the key color", { duration: 3000 });

		// Set up color picker mode
		dispatch("ENABLE_COLOR_PICKER_MODE", {
			payload: {
				callback: (color: string) => {
					setSettings((prev) => ({ ...prev, keyColor: color }));
					handleSettingChange("keyColor", color);
					setIsPickingColor(false);
					toast.success(`Key color set to ${color}`, { duration: 2000 });
				},
			},
		});
	};

	const handleAutoDetect = () => {
		// Auto-detect green/blue screen
		const canvas = document.createElement("canvas");
		const video = document.querySelector(
			`video[data-item-id="${activeItem?.id}"]`,
		) as HTMLVideoElement;

		if (video) {
			canvas.width = video.videoWidth;
			canvas.height = video.videoHeight;
			const ctx = canvas.getContext("2d");

			if (ctx) {
				ctx.drawImage(video, 0, 0);
				const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
				const pixels = imageData.data;

				// Analyze corners for dominant color
				const corners = [
					{ x: 0, y: 0 },
					{ x: canvas.width - 1, y: 0 },
					{ x: 0, y: canvas.height - 1 },
					{ x: canvas.width - 1, y: canvas.height - 1 },
				];

				let totalR = 0,
					totalG = 0,
					totalB = 0;
				let count = 0;

				corners.forEach((corner) => {
					const idx = (corner.y * canvas.width + corner.x) * 4;
					totalR += pixels[idx];
					totalG += pixels[idx + 1];
					totalB += pixels[idx + 2];
					count++;
				});

				const avgR = Math.round(totalR / count);
				const avgG = Math.round(totalG / count);
				const avgB = Math.round(totalB / count);

				const detectedColor = `#${avgR.toString(16).padStart(2, "0")}${avgG.toString(16).padStart(2, "0")}${avgB.toString(16).padStart(2, "0")}`;

				handleSettingChange("keyColor", detectedColor);
				toast.success(`Auto-detected key color: ${detectedColor}`, {
					duration: 2000,
				});
			}
		}
	};

	const handleReset = () => {
		const defaultSettings: ChromaKeySettings = {
			enabled: false,
			keyColor: "#00FF00",
			similarity: 0.4,
			smoothness: 0.1,
			spill: 0.1,
			contrast: 1,
			brightness: 0,
		};
		setSettings(defaultSettings);

		if (activeItem) {
			dispatch("UPDATE_ITEM_CHROMA_KEY", {
				payload: {
					itemId: activeItem.id,
					chromaKey: defaultSettings,
				},
			});
		}
		toast.success("Chroma key settings reset", { duration: 1000 });
	};

	if (!isVideo) {
		return (
			<div className="flex flex-col gap-4 p-4">
				<div className="text-sm text-muted-foreground text-center">
					Select a video to apply chroma key
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-4 p-4">
			<div className="flex items-center justify-between">
				<Label className="text-base font-semibold">Chroma Key</Label>
				<Button
					size="sm"
					variant="ghost"
					onClick={handleReset}
					title="Reset settings"
				>
					<RotateCcw className="h-4 w-4" />
				</Button>
			</div>

			{/* Enable/Disable */}
			<div className="flex items-center justify-between">
				<Label htmlFor="chroma-enabled">Enable Chroma Key</Label>
				<Switch
					id="chroma-enabled"
					checked={settings.enabled}
					onCheckedChange={(checked) => handleSettingChange("enabled", checked)}
				/>
			</div>

			{settings.enabled && (
				<>
					{/* Key Color Selection */}
					<div className="space-y-2">
						<Label>Key Color</Label>
						<div className="flex gap-2">
							<div className="flex-1 flex items-center gap-2">
								<input
									type="color"
									value={settings.keyColor}
									onChange={(e) =>
										handleSettingChange("keyColor", e.target.value)
									}
									className="w-12 h-8 border rounded cursor-pointer"
								/>
								<span className="text-sm text-muted-foreground">
									{settings.keyColor}
								</span>
							</div>
							<Button
								size="sm"
								variant="outline"
								onClick={handleColorPick}
								disabled={isPickingColor}
							>
								<Pipette className="h-4 w-4" />
							</Button>
							<Button
								size="sm"
								variant="outline"
								onClick={handleAutoDetect}
								title="Auto-detect background color"
							>
								<Wand2 className="h-4 w-4" />
							</Button>
						</div>
					</div>

					{/* Color Presets */}
					<div className="space-y-2">
						<Label>Presets</Label>
						<div className="flex gap-2">
							<button
								className="w-8 h-8 rounded border-2"
								style={{ backgroundColor: "#00FF00" }}
								onClick={() => handleSettingChange("keyColor", "#00FF00")}
								title="Green screen"
							/>
							<button
								className="w-8 h-8 rounded border-2"
								style={{ backgroundColor: "#0000FF" }}
								onClick={() => handleSettingChange("keyColor", "#0000FF")}
								title="Blue screen"
							/>
							<button
								className="w-8 h-8 rounded border-2"
								style={{ backgroundColor: "#FF0000" }}
								onClick={() => handleSettingChange("keyColor", "#FF0000")}
								title="Red screen"
							/>
							<button
								className="w-8 h-8 rounded border-2"
								style={{ backgroundColor: "#FFFFFF" }}
								onClick={() => handleSettingChange("keyColor", "#FFFFFF")}
								title="White screen"
							/>
							<button
								className="w-8 h-8 rounded border-2"
								style={{ backgroundColor: "#000000" }}
								onClick={() => handleSettingChange("keyColor", "#000000")}
								title="Black screen"
							/>
						</div>
					</div>

					{/* Similarity (Tolerance) */}
					<div className="space-y-2">
						<div className="flex justify-between">
							<Label>Similarity</Label>
							<span className="text-sm text-muted-foreground">
								{Math.round(settings.similarity * 100)}%
							</span>
						</div>
						<Slider
							min={0}
							max={100}
							step={1}
							value={[settings.similarity * 100]}
							onValueChange={([value]) =>
								handleSettingChange("similarity", value / 100)
							}
						/>
					</div>

					{/* Smoothness (Edge Feathering) */}
					<div className="space-y-2">
						<div className="flex justify-between">
							<Label>Smoothness</Label>
							<span className="text-sm text-muted-foreground">
								{Math.round(settings.smoothness * 100)}%
							</span>
						</div>
						<Slider
							min={0}
							max={100}
							step={1}
							value={[settings.smoothness * 100]}
							onValueChange={([value]) =>
								handleSettingChange("smoothness", value / 100)
							}
						/>
					</div>

					{/* Spill Suppression */}
					<div className="space-y-2">
						<div className="flex justify-between">
							<Label>Spill Suppression</Label>
							<span className="text-sm text-muted-foreground">
								{Math.round(settings.spill * 100)}%
							</span>
						</div>
						<Slider
							min={0}
							max={100}
							step={1}
							value={[settings.spill * 100]}
							onValueChange={([value]) =>
								handleSettingChange("spill", value / 100)
							}
						/>
					</div>

					{/* Contrast */}
					<div className="space-y-2">
						<div className="flex justify-between">
							<Label>Contrast</Label>
							<span className="text-sm text-muted-foreground">
								{Math.round(settings.contrast * 100)}%
							</span>
						</div>
						<Slider
							min={0}
							max={200}
							step={1}
							value={[settings.contrast * 100]}
							onValueChange={([value]) =>
								handleSettingChange("contrast", value / 100)
							}
						/>
					</div>

					{/* Brightness */}
					<div className="space-y-2">
						<div className="flex justify-between">
							<Label>Brightness</Label>
							<span className="text-sm text-muted-foreground">
								{Math.round(settings.brightness * 100)}%
							</span>
						</div>
						<Slider
							min={-100}
							max={100}
							step={1}
							value={[settings.brightness * 100]}
							onValueChange={([value]) =>
								handleSettingChange("brightness", value / 100)
							}
						/>
					</div>
				</>
			)}
		</div>
	);
}

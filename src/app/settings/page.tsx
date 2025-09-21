"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
	Loader2,
	Palette,
	Video,
	Mic,
	HardDrive,
	Globe,
	Bell,
	Shield,
	Keyboard,
	Monitor,
	Moon,
	Sun,
	Zap,
	Info,
	ArrowLeft,
	Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import KeyboardShortcutsModal, {
	defaultShortcuts,
	type Shortcut,
} from "./keyboard-shortcuts-modal";

interface Settings {
	// Appearance
	theme: string;
	accentColor: string;
	fontSize: string;

	// Video Editor
	autoSave: boolean;
	autoSaveInterval: number;
	defaultQuality: string;
	defaultFrameRate: string;
	showTimeline: boolean;
	snapToGrid: boolean;

	// Audio
	audioNormalization: boolean;
	defaultVolume: number;
	muteOnExport: boolean;

	// Performance
	hardwareAcceleration: boolean;
	cacheSize: string;
	maxUndoHistory: number;

	// Notifications
	projectNotifications: boolean;
	exportNotifications: boolean;
	updateNotifications: boolean;
	emailNotifications: boolean;

	// Keyboard Shortcuts
	shortcuts: Shortcut[];
}

const defaultSettings: Settings = {
	// Appearance
	theme: "dark",
	accentColor: "blue",
	fontSize: "medium",

	// Video Editor
	autoSave: true,
	autoSaveInterval: 5,
	defaultQuality: "1080p",
	defaultFrameRate: "30",
	showTimeline: true,
	snapToGrid: true,

	// Audio
	audioNormalization: true,
	defaultVolume: 80,
	muteOnExport: false,

	// Performance
	hardwareAcceleration: true,
	cacheSize: "2GB",
	maxUndoHistory: 50,

	// Notifications
	projectNotifications: true,
	exportNotifications: true,
	updateNotifications: true,
	emailNotifications: false,

	// Keyboard Shortcuts
	shortcuts: defaultShortcuts,
};

export default function SettingsFunctional() {
	const { isAuthenticated, isLoading } = useAuth();
	const router = useRouter();
	const { theme, setTheme } = useTheme();
	const [showShortcutsModal, setShowShortcutsModal] = useState(false);
	const [saving, setSaving] = useState(false);
	const [settings, setSettings] = useState<Settings>(defaultSettings);

	// Load settings from localStorage on mount
	useEffect(() => {
		const loadSettings = () => {
			try {
				const savedSettings = localStorage.getItem("editorSettings");
				if (savedSettings) {
					const parsed = JSON.parse(savedSettings);
					setSettings({ ...defaultSettings, ...parsed });

					// Apply theme if saved
					if (parsed.theme) {
						setTheme(parsed.theme);
					}

					// Apply accent color
					if (parsed.accentColor) {
						document.documentElement.style.setProperty(
							"--accent-color",
							parsed.accentColor,
						);
					}

					// Apply font size
					if (parsed.fontSize) {
						const sizes = {
							small: "14px",
							medium: "16px",
							large: "18px",
						};
						document.documentElement.style.fontSize =
							sizes[parsed.fontSize as keyof typeof sizes] || "16px";
					}
				}
			} catch (error) {
				console.error("Error loading settings:", error);
			}
		};

		loadSettings();
	}, [setTheme]);

	// Auto-save settings when they change
	useEffect(() => {
		const timer = setTimeout(() => {
			if (settings.autoSave) {
				saveSettingsToLocalStorage();
			}
		}, 1000);

		return () => clearTimeout(timer);
	}, [settings]);

	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			router.push("/auth/login");
		}
	}, [isAuthenticated, isLoading, router]);

	const saveSettingsToLocalStorage = () => {
		try {
			localStorage.setItem("editorSettings", JSON.stringify(settings));

			// Apply settings immediately
			applySettings(settings);
		} catch (error) {
			console.error("Error saving settings:", error);
		}
	};

	const applySettings = (newSettings: Settings) => {
		// Apply theme
		if (newSettings.theme) {
			setTheme(newSettings.theme);
		}

		// Apply accent color
		const colors: Record<string, string> = {
			blue: "#3b82f6",
			green: "#10b981",
			purple: "#8b5cf6",
			red: "#ef4444",
			orange: "#f97316",
		};
		document.documentElement.style.setProperty(
			"--accent-color",
			colors[newSettings.accentColor] || colors.blue,
		);

		// Apply font size
		const sizes = {
			small: "14px",
			medium: "16px",
			large: "18px",
		};
		document.documentElement.style.fontSize =
			sizes[newSettings.fontSize as keyof typeof sizes] || "16px";

		// Apply other settings to relevant stores/contexts
		// This would integrate with your editor stores
		if (typeof window !== "undefined") {
			window.dispatchEvent(
				new CustomEvent("settings-changed", { detail: newSettings }),
			);
		}
	};

	const handleSaveSettings = async () => {
		setSaving(true);
		try {
			// Save to localStorage
			saveSettingsToLocalStorage();

			// Apply settings
			applySettings(settings);

			// Show success message
			toast.success("Sozlamalar saqlandi!", {
				description: "Barcha o'zgarishlar muvaffaqiyatli saqlandi",
			});
		} catch (error) {
			toast.error("Xatolik yuz berdi", {
				description: "Sozlamalarni saqlashda muammo chiqdi",
			});
		} finally {
			setSaving(false);
		}
	};

	const handleResetSettings = () => {
		if (confirm("Barcha sozlamalarni asl holatiga qaytarishni xohlaysizmi?")) {
			setSettings(defaultSettings);
			localStorage.removeItem("editorSettings");
			applySettings(defaultSettings);
			toast.success("Sozlamalar tiklandi", {
				description: "Barcha sozlamalar asl holatiga qaytarildi",
			});
		}
	};

	const handleShortcutsSave = (shortcuts: Shortcut[]) => {
		setSettings({ ...settings, shortcuts });
		toast.success("Tugmalar saqlandi");
	};

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="flex flex-col items-center gap-4">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
					<p className="text-muted-foreground">Sozlamalar yuklanmoqda...</p>
				</div>
			</div>
		);
	}

	if (!isAuthenticated) {
		return null;
	}

	return (
		<div className="w-full h-screen overflow-y-auto overflow-x-hidden">
			<div className="min-h-screen bg-background">
				<div className="container mx-auto py-8 px-4 pb-20">
					<div className="max-w-4xl mx-auto">
						{/* Header */}
						<div className="mb-8 flex items-center justify-between">
							<div>
								<h1 className="text-3xl font-bold">Sozlamalar</h1>
								<p className="text-muted-foreground mt-2">
									Video muharrir tajribangizni sozlang
								</p>
							</div>
							<Link href="/projects">
								<Button variant="outline" className="gap-2">
									<ArrowLeft className="h-4 w-4" />
									Loyihalarga
								</Button>
							</Link>
						</div>

						<div className="grid gap-6">
							{/* Appearance Settings */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Palette className="h-5 w-5" />
										Ko'rinish
									</CardTitle>
									<CardDescription>
										Muharrir ko'rinishini sozlash
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-6">
									<div className="space-y-2">
										<Label htmlFor="theme">Mavzu</Label>
										<div className="flex gap-2">
											<Button
												variant={
													settings.theme === "light" ? "default" : "outline"
												}
												size="sm"
												onClick={() => {
													setSettings({ ...settings, theme: "light" });
													setTheme("light");
												}}
												className="flex-1"
											>
												<Sun className="h-4 w-4 mr-2" />
												Yorug'
											</Button>
											<Button
												variant={
													settings.theme === "dark" ? "default" : "outline"
												}
												size="sm"
												onClick={() => {
													setSettings({ ...settings, theme: "dark" });
													setTheme("dark");
												}}
												className="flex-1"
											>
												<Moon className="h-4 w-4 mr-2" />
												Qorong'u
											</Button>
											<Button
												variant={
													settings.theme === "system" ? "default" : "outline"
												}
												size="sm"
												onClick={() => {
													setSettings({ ...settings, theme: "system" });
													setTheme("system");
												}}
												className="flex-1"
											>
												<Monitor className="h-4 w-4 mr-2" />
												Tizim
											</Button>
										</div>
									</div>

									<div className="space-y-2">
										<Label htmlFor="accentColor">Asosiy rang</Label>
										<Select
											value={settings.accentColor}
											onValueChange={(value) =>
												setSettings({ ...settings, accentColor: value })
											}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="blue">Ko'k</SelectItem>
												<SelectItem value="green">Yashil</SelectItem>
												<SelectItem value="purple">Binafsha</SelectItem>
												<SelectItem value="red">Qizil</SelectItem>
												<SelectItem value="orange">To'q sariq</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div className="space-y-2">
										<Label htmlFor="fontSize">Shrift o'lchami</Label>
										<Select
											value={settings.fontSize}
											onValueChange={(value) =>
												setSettings({ ...settings, fontSize: value })
											}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="small">Kichik</SelectItem>
												<SelectItem value="medium">O'rtacha</SelectItem>
												<SelectItem value="large">Katta</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</CardContent>
							</Card>

							{/* Video Editor Settings */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Video className="h-5 w-5" />
										Video Muharrir
									</CardTitle>
									<CardDescription>
										Video tahrirlash sozlamalari
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-6">
									<div className="flex items-center justify-between">
										<div className="space-y-0.5">
											<Label htmlFor="autoSave">Avtomatik saqlash</Label>
											<p className="text-sm text-muted-foreground">
												Loyihani avtomatik saqlash
											</p>
										</div>
										<Switch
											id="autoSave"
											checked={settings.autoSave}
											onCheckedChange={(checked) =>
												setSettings({ ...settings, autoSave: checked })
											}
										/>
									</div>

									{settings.autoSave && (
										<div className="space-y-2">
											<Label htmlFor="autoSaveInterval">
												Saqlash intervali: {settings.autoSaveInterval} daqiqa
											</Label>
											<Slider
												id="autoSaveInterval"
												min={1}
												max={30}
												step={1}
												value={[settings.autoSaveInterval]}
												onValueChange={([value]) =>
													setSettings({ ...settings, autoSaveInterval: value })
												}
											/>
										</div>
									)}

									<div className="space-y-2">
										<Label htmlFor="defaultQuality">
											Standart eksport sifati
										</Label>
										<Select
											value={settings.defaultQuality}
											onValueChange={(value) =>
												setSettings({ ...settings, defaultQuality: value })
											}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="480p">480p</SelectItem>
												<SelectItem value="720p">720p HD</SelectItem>
												<SelectItem value="1080p">1080p Full HD</SelectItem>
												<SelectItem value="4k">4K Ultra HD</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div className="flex items-center justify-between">
										<div className="space-y-0.5">
											<Label htmlFor="snapToGrid">To'rga yopishish</Label>
											<p className="text-sm text-muted-foreground">
												Timeline'da to'rga yopishishni yoqish
											</p>
										</div>
										<Switch
											id="snapToGrid"
											checked={settings.snapToGrid}
											onCheckedChange={(checked) =>
												setSettings({ ...settings, snapToGrid: checked })
											}
										/>
									</div>
								</CardContent>
							</Card>

							{/* Audio Settings */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Mic className="h-5 w-5" />
										Audio
									</CardTitle>
									<CardDescription>Audio sozlamalari</CardDescription>
								</CardHeader>
								<CardContent className="space-y-6">
									<div className="flex items-center justify-between">
										<div className="space-y-0.5">
											<Label htmlFor="audioNormalization">
												Audio normalizatsiya
											</Label>
											<p className="text-sm text-muted-foreground">
												Audio darajalarini avtomatik tenglashtirish
											</p>
										</div>
										<Switch
											id="audioNormalization"
											checked={settings.audioNormalization}
											onCheckedChange={(checked) =>
												setSettings({
													...settings,
													audioNormalization: checked,
												})
											}
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="defaultVolume">
											Standart tovush: {settings.defaultVolume}%
										</Label>
										<Slider
											id="defaultVolume"
											min={0}
											max={100}
											step={5}
											value={[settings.defaultVolume]}
											onValueChange={([value]) =>
												setSettings({ ...settings, defaultVolume: value })
											}
										/>
									</div>
								</CardContent>
							</Card>

							{/* Performance Settings */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Zap className="h-5 w-5" />
										Ishlash samaradorligi
									</CardTitle>
									<CardDescription>
										Muharrir ishlashini optimallashtirish
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-6">
									<div className="flex items-center justify-between">
										<div className="space-y-0.5">
											<Label htmlFor="hardwareAcceleration">
												Apparat tezlashtirish
											</Label>
											<p className="text-sm text-muted-foreground">
												Yaxshi ishlash uchun GPU'dan foydalanish
											</p>
										</div>
										<Switch
											id="hardwareAcceleration"
											checked={settings.hardwareAcceleration}
											onCheckedChange={(checked) =>
												setSettings({
													...settings,
													hardwareAcceleration: checked,
												})
											}
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="cacheSize">Kesh hajmi</Label>
										<Select
											value={settings.cacheSize}
											onValueChange={(value) =>
												setSettings({ ...settings, cacheSize: value })
											}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="512MB">512 MB</SelectItem>
												<SelectItem value="1GB">1 GB</SelectItem>
												<SelectItem value="2GB">2 GB</SelectItem>
												<SelectItem value="4GB">4 GB</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div className="space-y-2">
										<Label htmlFor="maxUndoHistory">
											Bekor qilish tarixi: {settings.maxUndoHistory} qadam
										</Label>
										<Slider
											id="maxUndoHistory"
											min={10}
											max={100}
											step={10}
											value={[settings.maxUndoHistory]}
											onValueChange={([value]) =>
												setSettings({ ...settings, maxUndoHistory: value })
											}
										/>
									</div>
								</CardContent>
							</Card>

							{/* Keyboard Shortcuts */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Keyboard className="h-5 w-5" />
										Klaviatura Tugmalari
									</CardTitle>
									<CardDescription>
										Klaviatura tugmalarini ko'rish va sozlash
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="space-y-2">
										{settings.shortcuts.slice(0, 5).map((shortcut) => (
											<div
												key={shortcut.id}
												className="flex justify-between py-2"
											>
												<span className="text-sm">{shortcut.name}</span>
												<kbd className="px-2 py-1 text-xs bg-muted rounded">
													{[...shortcut.modifiers, shortcut.key].join("+")}
												</kbd>
											</div>
										))}
									</div>
									<Button
										variant="outline"
										className="w-full mt-4"
										onClick={() => setShowShortcutsModal(true)}
									>
										Tugmalarni Sozlash
									</Button>
								</CardContent>
							</Card>

							{/* Action Buttons */}
							<div className="flex gap-4">
								<Button
									onClick={handleSaveSettings}
									className="flex-1"
									disabled={saving}
								>
									{saving ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Saqlanmoqda...
										</>
									) : (
										<>
											<Check className="mr-2 h-4 w-4" />
											Sozlamalarni Saqlash
										</>
									)}
								</Button>
								<Button
									variant="outline"
									onClick={handleResetSettings}
									className="flex-1"
								>
									Asl holatiga qaytarish
								</Button>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Keyboard Shortcuts Modal */}
			<KeyboardShortcutsModal
				open={showShortcutsModal}
				onClose={() => setShowShortcutsModal(false)}
				shortcuts={settings.shortcuts}
				onSave={handleShortcutsSave}
			/>
		</div>
	);
}

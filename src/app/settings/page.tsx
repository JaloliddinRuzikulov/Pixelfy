"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
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
	Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

export default function SettingsPage() {
	const { isAuthenticated, isLoading } = useAuth();
	const router = useRouter();
	const { theme, setTheme } = useTheme();
	
	// Settings state
	const [settings, setSettings] = useState({
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
	});

	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			router.push("/auth/login");
		}
	}, [isAuthenticated, isLoading, router]);

	const handleSaveSettings = () => {
		// Save settings to localStorage or API
		localStorage.setItem("editorSettings", JSON.stringify(settings));
		// Show success message
		alert("Settings saved successfully!");
	};

	const handleResetSettings = () => {
		if (confirm("Are you sure you want to reset all settings to default?")) {
			// Reset to default settings
			window.location.reload();
		}
	};

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="flex flex-col items-center gap-4">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
					<p className="text-muted-foreground">Loading settings...</p>
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
						<div className="mb-8">
							<h1 className="text-3xl font-bold">Settings</h1>
							<p className="text-muted-foreground mt-2">
								Customize your video editor experience
							</p>
						</div>

						<div className="grid gap-6">
						{/* Appearance Settings */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Palette className="h-5 w-5" />
									Appearance
								</CardTitle>
								<CardDescription>
									Customize the look and feel of the editor
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="space-y-2">
									<Label htmlFor="theme">Theme</Label>
									<div className="flex gap-2">
										<Button
											variant={theme === "light" ? "default" : "outline"}
											size="sm"
											onClick={() => setTheme("light")}
											className="flex-1"
										>
											<Sun className="h-4 w-4 mr-2" />
											Light
										</Button>
										<Button
											variant={theme === "dark" ? "default" : "outline"}
											size="sm"
											onClick={() => setTheme("dark")}
											className="flex-1"
										>
											<Moon className="h-4 w-4 mr-2" />
											Dark
										</Button>
										<Button
											variant={theme === "system" ? "default" : "outline"}
											size="sm"
											onClick={() => setTheme("system")}
											className="flex-1"
										>
											<Monitor className="h-4 w-4 mr-2" />
											System
										</Button>
									</div>
								</div>

								<div className="space-y-2">
									<Label htmlFor="accentColor">Accent Color</Label>
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
											<SelectItem value="blue">Blue</SelectItem>
											<SelectItem value="green">Green</SelectItem>
											<SelectItem value="purple">Purple</SelectItem>
											<SelectItem value="red">Red</SelectItem>
											<SelectItem value="orange">Orange</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div className="space-y-2">
									<Label htmlFor="fontSize">Font Size</Label>
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
											<SelectItem value="small">Small</SelectItem>
											<SelectItem value="medium">Medium</SelectItem>
											<SelectItem value="large">Large</SelectItem>
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
									Video Editor
								</CardTitle>
								<CardDescription>
									Configure video editing preferences
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="flex items-center justify-between">
									<div className="space-y-0.5">
										<Label htmlFor="autoSave">Auto-save</Label>
										<p className="text-sm text-muted-foreground">
											Automatically save your project
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
											Auto-save interval: {settings.autoSaveInterval} minutes
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
									<Label htmlFor="defaultQuality">Default Export Quality</Label>
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

								<div className="space-y-2">
									<Label htmlFor="defaultFrameRate">Default Frame Rate</Label>
									<Select 
										value={settings.defaultFrameRate}
										onValueChange={(value) => 
											setSettings({ ...settings, defaultFrameRate: value })
										}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="24">24 FPS</SelectItem>
											<SelectItem value="30">30 FPS</SelectItem>
											<SelectItem value="60">60 FPS</SelectItem>
											<SelectItem value="120">120 FPS</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div className="flex items-center justify-between">
									<div className="space-y-0.5">
										<Label htmlFor="snapToGrid">Snap to Grid</Label>
										<p className="text-sm text-muted-foreground">
											Enable grid snapping in timeline
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
								<CardDescription>
									Configure audio preferences
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="flex items-center justify-between">
									<div className="space-y-0.5">
										<Label htmlFor="audioNormalization">Audio Normalization</Label>
										<p className="text-sm text-muted-foreground">
											Automatically normalize audio levels
										</p>
									</div>
									<Switch
										id="audioNormalization"
										checked={settings.audioNormalization}
										onCheckedChange={(checked) =>
											setSettings({ ...settings, audioNormalization: checked })
										}
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="defaultVolume">
										Default Volume: {settings.defaultVolume}%
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
									Performance
								</CardTitle>
								<CardDescription>
									Optimize editor performance
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="flex items-center justify-between">
									<div className="space-y-0.5">
										<Label htmlFor="hardwareAcceleration">
											Hardware Acceleration
										</Label>
										<p className="text-sm text-muted-foreground">
											Use GPU for better performance
										</p>
									</div>
									<Switch
										id="hardwareAcceleration"
										checked={settings.hardwareAcceleration}
										onCheckedChange={(checked) =>
											setSettings({ ...settings, hardwareAcceleration: checked })
										}
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="cacheSize">Cache Size</Label>
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
										Max Undo History: {settings.maxUndoHistory} steps
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

						{/* Notifications Settings */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Bell className="h-5 w-5" />
									Notifications
								</CardTitle>
								<CardDescription>
									Manage notification preferences
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center justify-between">
									<div className="space-y-0.5">
										<Label htmlFor="projectNotifications">Project Updates</Label>
										<p className="text-sm text-muted-foreground">
											Notifications about project changes
										</p>
									</div>
									<Switch
										id="projectNotifications"
										checked={settings.projectNotifications}
										onCheckedChange={(checked) =>
											setSettings({ ...settings, projectNotifications: checked })
										}
									/>
								</div>

								<div className="flex items-center justify-between">
									<div className="space-y-0.5">
										<Label htmlFor="exportNotifications">Export Complete</Label>
										<p className="text-sm text-muted-foreground">
											Notify when export finishes
										</p>
									</div>
									<Switch
										id="exportNotifications"
										checked={settings.exportNotifications}
										onCheckedChange={(checked) =>
											setSettings({ ...settings, exportNotifications: checked })
										}
									/>
								</div>

								<div className="flex items-center justify-between">
									<div className="space-y-0.5">
										<Label htmlFor="emailNotifications">Email Notifications</Label>
										<p className="text-sm text-muted-foreground">
											Receive notifications via email
										</p>
									</div>
									<Switch
										id="emailNotifications"
										checked={settings.emailNotifications}
										onCheckedChange={(checked) =>
											setSettings({ ...settings, emailNotifications: checked })
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
									Keyboard Shortcuts
								</CardTitle>
								<CardDescription>
									View and customize keyboard shortcuts
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-2">
									<div className="flex justify-between py-2">
										<span className="text-sm">Play/Pause</span>
										<kbd className="px-2 py-1 text-xs bg-muted rounded">Space</kbd>
									</div>
									<div className="flex justify-between py-2">
										<span className="text-sm">Cut</span>
										<kbd className="px-2 py-1 text-xs bg-muted rounded">S</kbd>
									</div>
									<div className="flex justify-between py-2">
										<span className="text-sm">Delete</span>
										<kbd className="px-2 py-1 text-xs bg-muted rounded">Delete</kbd>
									</div>
									<div className="flex justify-between py-2">
										<span className="text-sm">Undo</span>
										<kbd className="px-2 py-1 text-xs bg-muted rounded">Cmd+Z</kbd>
									</div>
									<div className="flex justify-between py-2">
										<span className="text-sm">Redo</span>
										<kbd className="px-2 py-1 text-xs bg-muted rounded">Cmd+Shift+Z</kbd>
									</div>
								</div>
								<Button variant="outline" className="w-full mt-4">
									Customize Shortcuts
								</Button>
							</CardContent>
						</Card>

						{/* Action Buttons */}
						<div className="flex gap-4">
							<Button onClick={handleSaveSettings} className="flex-1">
								Save Settings
							</Button>
							<Button 
								variant="outline" 
								onClick={handleResetSettings}
								className="flex-1"
							>
								Reset to Default
							</Button>
						</div>

						{/* About Section */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Info className="h-5 w-5" />
									About
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-2">
								<div className="flex justify-between py-1">
									<span className="text-sm text-muted-foreground">Version</span>
									<span className="text-sm font-medium">1.0.0</span>
								</div>
								<div className="flex justify-between py-1">
									<span className="text-sm text-muted-foreground">Build</span>
									<span className="text-sm font-medium">2025.08.26</span>
								</div>
								<div className="flex justify-between py-1">
									<span className="text-sm text-muted-foreground">Environment</span>
									<span className="text-sm font-medium">Development</span>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
			</div>
		</div>
	);
}
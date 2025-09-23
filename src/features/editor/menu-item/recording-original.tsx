"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	Monitor,
	Camera,
	Mic,
	MicOff,
	Video,
	VideoOff,
	Settings,
	Play,
	Pause,
	Square,
	Download,
	Volume2,
	AlertCircle,
	Loader2,
	CheckCircle2,
	MonitorSpeaker,
	Webcam,
	FileAudio,
	Languages,
	Wand2,
	PenTool,
	Sparkles,
} from "lucide-react";

interface RecordingSettings {
	video: boolean;
	audio: boolean;
	audioDevice?: string;
	videoDevice?: string;
	screenShare: boolean;
	quality: "low" | "medium" | "high";
	fps: number;
}

interface TTSSettings {
	text: string;
	language: "uz" | "en" | "ru";
	voice: string;
	speed: number;
	pitch: number;
}

export function Recording() {
	const [activeTab, setActiveTab] = useState("screen-camera");
	const [recordingMode, setRecordingMode] = useState<
		"screen" | "camera" | "both"
	>("screen");
	const [isRecording, setIsRecording] = useState(false);
	const [isPaused, setIsPaused] = useState(false);
	const [recordingTime, setRecordingTime] = useState(0);

	// Recording settings
	const [settings, setSettings] = useState<RecordingSettings>({
		video: true,
		audio: true,
		screenShare: false,
		quality: "high",
		fps: 30,
	});

	// TTS settings
	const [ttsSettings, setTtsSettings] = useState<TTSSettings>({
		text: "",
		language: "uz",
		voice: "aisha",
		speed: 1.0,
		pitch: 1.0,
	});

	const [isGeneratingTTS, setIsGeneratingTTS] = useState(false);

	const handleStartRecording = useCallback(async () => {
		try {
			// Here would be the actual recording implementation
			setIsRecording(true);
			console.log("Starting recording with mode:", recordingMode);
		} catch (error) {
			console.error("Failed to start recording:", error);
		}
	}, [recordingMode]);

	const handleStopRecording = useCallback(() => {
		setIsRecording(false);
		setIsPaused(false);
		setRecordingTime(0);
		console.log("Recording stopped");
	}, []);

	const handlePauseRecording = useCallback(() => {
		setIsPaused(!isPaused);
	}, [isPaused]);

	const handleGenerateTTS = useCallback(async () => {
		if (!ttsSettings.text.trim()) return;

		setIsGeneratingTTS(true);
		try {
			// Here would be the actual TTS generation
			console.log("Generating TTS with settings:", ttsSettings);

			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 2000));

			// Add to timeline after generation
			console.log("TTS generated successfully");
		} catch (error) {
			console.error("TTS generation failed:", error);
		} finally {
			setIsGeneratingTTS(false);
		}
	}, [ttsSettings]);

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
	};

	return (
		<div className="flex flex-col h-full overflow-hidden bg-background">
			{/* Header */}
			<div className="flex-shrink-0 h-12 flex items-center px-4 text-sm font-medium border-b bg-gradient-to-r from-purple-500/10 via-purple-500/5 to-transparent">
				<PenTool className="h-4 w-4 mr-2 text-purple-500" />
				Yozish va yaratish
			</div>

			<Tabs
				value={activeTab}
				onValueChange={setActiveTab}
				className="flex-1 flex flex-col"
			>
				<TabsList className="w-full justify-start rounded-none bg-transparent border-b px-4 h-10">
					<TabsTrigger
						value="screen-camera"
						className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-xs"
					>
						<MonitorSpeaker className="h-3.5 w-3.5 mr-1.5" />
						Ekran va kamera
					</TabsTrigger>
					<TabsTrigger
						value="tts"
						className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-xs"
					>
						<Languages className="h-3.5 w-3.5 mr-1.5" />
						Matnni nutqqa
					</TabsTrigger>
				</TabsList>

				<div className="flex-1 overflow-hidden">
					<TabsContent value="screen-camera" className="h-full m-0">
						<ScrollArea className="h-full">
							<div className="p-4 space-y-4 pb-20">
								{/* Recording Mode Selection */}
								<Card className="overflow-hidden border-purple-500/10 bg-gradient-to-br from-purple-500/5 to-transparent">
									<CardHeader className="pb-3 bg-gradient-to-r from-purple-500/10 to-transparent">
										<CardTitle className="text-base flex items-center gap-2">
											<Video className="h-4 w-4 text-purple-500" />
											Yozib olish rejimi
										</CardTitle>
										<CardDescription className="text-xs">
											Qanday kontent yozib olishni tanlang
										</CardDescription>
									</CardHeader>
									<CardContent>
										<RadioGroup
											value={recordingMode}
											onValueChange={(v) => setRecordingMode(v as any)}
											className="space-y-2"
										>
											<div className="flex items-center space-x-3 p-3 rounded-lg border-2 border-purple-500/20 hover:bg-purple-500/5 hover:border-purple-500/30 transition-all group">
												<RadioGroupItem
													value="screen"
													id="screen"
													className="text-purple-500"
												/>
												<Label
													htmlFor="screen"
													className="flex-1 cursor-pointer"
												>
													<div className="flex items-center gap-2">
														<Monitor className="h-4 w-4 text-purple-500" />
														<span className="font-medium">Ekran</span>
													</div>
													<p className="text-xs text-muted-foreground mt-1">
														Kompyuter ekranini yozib olish
													</p>
												</Label>
											</div>

											<div className="flex items-center space-x-3 p-3 rounded-lg border-2 border-purple-500/20 hover:bg-purple-500/5 hover:border-purple-500/30 transition-all group">
												<RadioGroupItem
													value="camera"
													id="camera"
													className="text-purple-500"
												/>
												<Label
													htmlFor="camera"
													className="flex-1 cursor-pointer"
												>
													<div className="flex items-center gap-2">
														<Camera className="h-4 w-4 text-purple-500" />
														<span className="font-medium">Kamera</span>
													</div>
													<p className="text-xs text-muted-foreground mt-1">
														Veb-kamera orqali yozib olish
													</p>
												</Label>
											</div>

											<div className="flex items-center space-x-3 p-3 rounded-lg border-2 border-purple-500/20 hover:bg-purple-500/5 hover:border-purple-500/30 transition-all group">
												<RadioGroupItem
													value="both"
													id="both"
													className="text-purple-500"
												/>
												<Label htmlFor="both" className="flex-1 cursor-pointer">
													<div className="flex items-center gap-2">
														<MonitorSpeaker className="h-4 w-4 text-purple-500" />
														<span className="font-medium">Ekran + Kamera</span>
													</div>
													<p className="text-xs text-muted-foreground mt-1">
														Ekran va kamerani birgalikda yozib olish
													</p>
												</Label>
											</div>
										</RadioGroup>
									</CardContent>
								</Card>

								{/* Audio Selection */}
								<Card className="overflow-hidden border-blue-500/10 bg-gradient-to-br from-blue-500/5 to-transparent">
									<CardHeader className="pb-3 bg-gradient-to-r from-blue-500/10 to-transparent">
										<CardTitle className="text-base flex items-center gap-2">
											<Volume2 className="h-4 w-4 text-blue-500" />
											Audioni tanlash
										</CardTitle>
										<CardDescription className="text-xs">
											Audio manbalarini sozlash
										</CardDescription>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
											<Label
												htmlFor="microphone"
												className="flex items-center gap-2 cursor-pointer"
											>
												<Mic className="h-4 w-4 text-blue-500" />
												Mikrofon
											</Label>
											<Switch
												id="microphone"
												checked={settings.audio}
												onCheckedChange={(checked) =>
													setSettings({ ...settings, audio: checked })
												}
											/>
										</div>

										{settings.audio && (
											<Select defaultValue="default">
												<SelectTrigger className="h-9">
													<SelectValue placeholder="Mikrofon tanlang" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="default">
														Standart mikrofon
													</SelectItem>
													<SelectItem value="headset">
														Quloqchin mikrofoni
													</SelectItem>
													<SelectItem value="external">
														Tashqi mikrofon
													</SelectItem>
												</SelectContent>
											</Select>
										)}

										<div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
											<Label
												htmlFor="system-audio"
												className="flex items-center gap-2 cursor-pointer"
											>
												<Volume2 className="h-4 w-4 text-blue-500" />
												Tizim audiosi
											</Label>
											<Switch id="system-audio" />
										</div>
									</CardContent>
								</Card>

								{/* Recording Settings */}
								<Card className="overflow-hidden border-green-500/10 bg-gradient-to-br from-green-500/5 to-transparent">
									<CardHeader className="pb-3 bg-gradient-to-r from-green-500/10 to-transparent">
										<CardTitle className="text-base flex items-center gap-2">
											<Settings className="h-4 w-4 text-green-500" />
											Sozlamalar
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4">
										<div>
											<Label className="text-xs font-medium">
												Video sifati
											</Label>
											<Select
												value={settings.quality}
												onValueChange={(v) =>
													setSettings({ ...settings, quality: v as any })
												}
											>
												<SelectTrigger className="mt-2 h-9">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="low">Past (720p)</SelectItem>
													<SelectItem value="medium">O'rta (1080p)</SelectItem>
													<SelectItem value="high">Yuqori (4K)</SelectItem>
												</SelectContent>
											</Select>
										</div>

										<div>
											<Label className="text-xs font-medium">
												Kadr tezligi (FPS)
											</Label>
											<div className="flex items-center gap-4 mt-2">
												<Slider
													value={[settings.fps]}
													onValueChange={([v]) =>
														setSettings({ ...settings, fps: v })
													}
													min={15}
													max={60}
													step={15}
													className="flex-1"
												/>
												<span className="text-sm font-medium w-12 text-center bg-muted px-2 py-1 rounded">
													{settings.fps}
												</span>
											</div>
										</div>
									</CardContent>
								</Card>

								{/* Recording Controls */}
								<Card
									className={`overflow-hidden transition-all ${isRecording ? "border-red-500/50 bg-red-500/5 shadow-lg shadow-red-500/10" : "border-red-500/10 bg-gradient-to-br from-red-500/5 to-transparent"}`}
								>
									<CardContent className="p-6">
										{isRecording ? (
											<div className="space-y-4">
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-3">
														<div className="relative">
															<div className="h-3 w-3 bg-red-500 rounded-full animate-pulse" />
															<div className="absolute inset-0 h-3 w-3 bg-red-500 rounded-full animate-ping" />
														</div>
														<span className="text-sm font-medium">
															Yozilmoqda
														</span>
													</div>
													<span className="text-sm font-mono bg-muted px-2 py-1 rounded">
														{formatTime(recordingTime)}
													</span>
												</div>

												<div className="flex gap-2">
													<Button
														onClick={handlePauseRecording}
														variant="outline"
														className="flex-1"
														size="sm"
													>
														{isPaused ? (
															<>
																<Play className="h-4 w-4 mr-2" />
																Davom ettirish
															</>
														) : (
															<>
																<Pause className="h-4 w-4 mr-2" />
																Pauza
															</>
														)}
													</Button>
													<Button
														onClick={handleStopRecording}
														variant="destructive"
														className="flex-1"
														size="sm"
													>
														<Square className="h-4 w-4 mr-2" />
														To'xtatish
													</Button>
												</div>
											</div>
										) : (
											<Button
												onClick={handleStartRecording}
												className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 shadow-lg"
											>
												<Video className="h-4 w-4 mr-2" />
												Yozishni boshlash
											</Button>
										)}
									</CardContent>
								</Card>
							</div>
						</ScrollArea>
					</TabsContent>

					<TabsContent value="tts" className="h-full m-0">
						<ScrollArea className="h-full">
							<div className="p-4 space-y-4 pb-20">
								{/* TTS Input */}
								<Card className="overflow-hidden border-indigo-500/10 bg-gradient-to-br from-indigo-500/5 to-transparent">
									<CardHeader className="pb-3 bg-gradient-to-r from-indigo-500/10 to-transparent">
										<CardTitle className="text-base flex items-center gap-2">
											<Sparkles className="h-4 w-4 text-indigo-500" />
											Matnni nutqqa aylantirish
										</CardTitle>
										<CardDescription className="text-xs">
											Matn kiriting va uni audio faylga aylantiring
										</CardDescription>
									</CardHeader>
									<CardContent className="space-y-4">
										<div>
											<Label htmlFor="tts-text" className="text-xs font-medium">
												Matn
											</Label>
											<Textarea
												id="tts-text"
												placeholder="O'qilishi kerak bo'lgan matnni kiriting..."
												value={ttsSettings.text}
												onChange={(e) =>
													setTtsSettings({
														...ttsSettings,
														text: e.target.value,
													})
												}
												rows={6}
												className="mt-2 resize-none"
											/>
											<p className="text-xs text-muted-foreground mt-1">
												{ttsSettings.text.length} / 5000 belgi
											</p>
										</div>

										<div className="grid grid-cols-2 gap-4">
											<div>
												<Label className="text-xs font-medium">Til</Label>
												<Select
													value={ttsSettings.language}
													onValueChange={(v) =>
														setTtsSettings({
															...ttsSettings,
															language: v as any,
														})
													}
												>
													<SelectTrigger className="mt-2 h-9">
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="uz">O'zbek</SelectItem>
														<SelectItem value="en">English</SelectItem>
														<SelectItem value="ru">Русский</SelectItem>
													</SelectContent>
												</Select>
											</div>

											<div>
												<Label className="text-xs font-medium">Ovoz</Label>
												<Select
													value={ttsSettings.voice}
													onValueChange={(v) =>
														setTtsSettings({ ...ttsSettings, voice: v })
													}
												>
													<SelectTrigger className="mt-2 h-9">
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="aisha">Aisha (Ayol)</SelectItem>
														<SelectItem value="davron">
															Davron (Erkak)
														</SelectItem>
														<SelectItem value="sevinch">
															Sevinch (Ayol)
														</SelectItem>
														<SelectItem value="jasur">Jasur (Erkak)</SelectItem>
													</SelectContent>
												</Select>
											</div>
										</div>

										<div>
											<Label className="text-xs font-medium">Tezlik</Label>
											<div className="flex items-center gap-4 mt-2">
												<span className="text-xs text-muted-foreground">
													0.5x
												</span>
												<Slider
													value={[ttsSettings.speed]}
													onValueChange={([v]) =>
														setTtsSettings({ ...ttsSettings, speed: v })
													}
													min={0.5}
													max={2}
													step={0.1}
													className="flex-1"
												/>
												<span className="text-xs text-muted-foreground">
													2x
												</span>
												<span className="text-sm font-medium w-12 text-center bg-muted px-2 py-1 rounded">
													{ttsSettings.speed}x
												</span>
											</div>
										</div>

										<div>
											<Label className="text-xs font-medium">
												Ohang balandligi
											</Label>
											<div className="flex items-center gap-4 mt-2">
												<span className="text-xs text-muted-foreground">
													Past
												</span>
												<Slider
													value={[ttsSettings.pitch]}
													onValueChange={([v]) =>
														setTtsSettings({ ...ttsSettings, pitch: v })
													}
													min={0.5}
													max={1.5}
													step={0.1}
													className="flex-1"
												/>
												<span className="text-xs text-muted-foreground">
													Baland
												</span>
												<span className="text-sm font-medium w-12 text-center bg-muted px-2 py-1 rounded">
													{ttsSettings.pitch}x
												</span>
											</div>
										</div>
									</CardContent>
								</Card>

								{/* Generate Button */}
								<Button
									onClick={handleGenerateTTS}
									disabled={!ttsSettings.text.trim() || isGeneratingTTS}
									className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-lg"
								>
									{isGeneratingTTS ? (
										<>
											<Loader2 className="h-4 w-4 mr-2 animate-spin" />
											Yaratilmoqda...
										</>
									) : (
										<>
											<Wand2 className="h-4 w-4 mr-2" />
											Nutqqa aylantirish
										</>
									)}
								</Button>

								{/* Preview Player */}
								{false && ( // This would show when audio is generated
									<Card className="overflow-hidden border-green-500/10 bg-gradient-to-br from-green-500/5 to-transparent">
										<CardHeader className="pb-3 bg-gradient-to-r from-green-500/10 to-transparent">
											<CardTitle className="text-base flex items-center gap-2">
												<FileAudio className="h-4 w-4 text-green-500" />
												Oldindan ko'rish
											</CardTitle>
										</CardHeader>
										<CardContent>
											<audio controls className="w-full">
												<source src="/preview.mp3" type="audio/mpeg" />
											</audio>
											<Button
												variant="outline"
												className="w-full mt-3"
												size="sm"
											>
												<Download className="h-4 w-4 mr-2" />
												Timeline'ga qo'shish
											</Button>
										</CardContent>
									</Card>
								)}
							</div>
						</ScrollArea>
					</TabsContent>
				</div>
			</Tabs>
		</div>
	);
}

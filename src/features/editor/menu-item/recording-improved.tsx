"use client";

import { useState, useCallback, useRef, useEffect } from "react";
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
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
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
	Plus,
	Upload,
	Trash2,
	RotateCcw,
	CircleStop,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "../store/use-store";
import { StateManager } from "@designcombo/state";

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

interface AudioRecording {
	id: string;
	url: string;
	blob: Blob;
	duration: number;
	timestamp: number;
	name: string;
}

export function RecordingImproved() {
	const [activeTab, setActiveTab] = useState("audio-record");
	const [recordingMode, setRecordingMode] = useState<
		"screen" | "camera" | "both" | "audio"
	>("audio");
	const [isRecording, setIsRecording] = useState(false);
	const [isPaused, setIsPaused] = useState(false);
	const [recordingTime, setRecordingTime] = useState(0);
	const [audioLevel, setAudioLevel] = useState(0);
	const [recordings, setRecordings] = useState<AudioRecording[]>([]);
	const [selectedRecording, setSelectedRecording] =
		useState<AudioRecording | null>(null);

	// Refs for audio recording
	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const audioChunksRef = useRef<Blob[]>([]);
	const timerRef = useRef<NodeJS.Timeout>();
	const audioContextRef = useRef<AudioContext | null>(null);
	const analyserRef = useRef<AnalyserNode | null>(null);
	const animationRef = useRef<number>();

	// Store hooks
	const { timeline, playerRef } = useStore();

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

	// Audio level visualization
	const visualizeAudioLevel = useCallback(() => {
		if (!analyserRef.current) return;

		const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
		analyserRef.current.getByteFrequencyData(dataArray);

		const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
		setAudioLevel(Math.min(100, (average / 255) * 150));

		if (isRecording) {
			animationRef.current = requestAnimationFrame(visualizeAudioLevel);
		}
	}, [isRecording]);

	// Start audio recording
	const handleStartAudioRecording = useCallback(async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

			// Setup audio context for visualization
			audioContextRef.current = new AudioContext();
			analyserRef.current = audioContextRef.current.createAnalyser();
			const source = audioContextRef.current.createMediaStreamSource(stream);
			source.connect(analyserRef.current);
			analyserRef.current.fftSize = 256;

			// Setup media recorder
			const mediaRecorder = new MediaRecorder(stream);
			mediaRecorderRef.current = mediaRecorder;
			audioChunksRef.current = [];

			mediaRecorder.ondataavailable = (event) => {
				if (event.data.size > 0) {
					audioChunksRef.current.push(event.data);
				}
			};

			mediaRecorder.onstop = () => {
				const audioBlob = new Blob(audioChunksRef.current, {
					type: "audio/webm",
				});
				const audioUrl = URL.createObjectURL(audioBlob);

				const newRecording: AudioRecording = {
					id: `rec-${Date.now()}`,
					url: audioUrl,
					blob: audioBlob,
					duration: recordingTime,
					timestamp: Date.now(),
					name: `Audio yozuv ${recordings.length + 1}`,
				};

				setRecordings((prev) => [...prev, newRecording]);
				setSelectedRecording(newRecording);
				audioChunksRef.current = [];
			};

			mediaRecorder.start();
			setIsRecording(true);
			setRecordingTime(0);

			// Start timer
			timerRef.current = setInterval(() => {
				setRecordingTime((prev) => prev + 1);
			}, 1000);

			// Start visualization
			visualizeAudioLevel();
		} catch (error) {
			console.error("Failed to start audio recording:", error);
			alert("Mikrofonga ruxsat berilmadi. Brauzer sozlamalaridan tekshiring.");
		}
	}, [recordingTime, recordings.length, visualizeAudioLevel]);

	// Stop audio recording
	const handleStopAudioRecording = useCallback(() => {
		if (
			mediaRecorderRef.current &&
			mediaRecorderRef.current.state !== "inactive"
		) {
			mediaRecorderRef.current.stop();
			mediaRecorderRef.current.stream
				.getTracks()
				.forEach((track) => track.stop());
		}

		if (timerRef.current) {
			clearInterval(timerRef.current);
		}

		if (animationRef.current) {
			cancelAnimationFrame(animationRef.current);
		}

		if (audioContextRef.current) {
			audioContextRef.current.close();
		}

		setIsRecording(false);
		setIsPaused(false);
		setAudioLevel(0);
	}, []);

	// Add audio to timeline
	const handleAddToTimeline = useCallback(
		(recording: AudioRecording) => {
			if (!timeline) return;

			// Create audio track item
			const audioItem = {
				id: `audio-${Date.now()}`,
				type: "audio",
				name: recording.name,
				url: recording.url,
				start: 0,
				duration: recording.duration * 1000, // Convert to milliseconds
				volume: 1,
			};

			// Add to timeline using StateManager
			const stateManager = (timeline as any).stateManager as StateManager;
			if (stateManager) {
				stateManager.addItem("audio", audioItem);
			}

			// Show success message
			const successDiv = document.createElement("div");
			successDiv.className =
				"fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-in slide-in-from-bottom";
			successDiv.textContent = "Audio timeline'ga qo'shildi!";
			document.body.appendChild(successDiv);
			setTimeout(() => successDiv.remove(), 3000);
		},
		[timeline],
	);

	// Delete recording
	const handleDeleteRecording = useCallback(
		(id: string) => {
			setRecordings((prev) => prev.filter((rec) => rec.id !== id));
			if (selectedRecording?.id === id) {
				setSelectedRecording(null);
			}
		},
		[selectedRecording],
	);

	// Generate TTS
	const handleGenerateTTS = useCallback(async () => {
		if (!ttsSettings.text.trim()) return;

		setIsGeneratingTTS(true);
		try {
			const aiServiceUrl =
				process.env.NEXT_PUBLIC_AI_SERVICE_URL || "http://localhost:9001";
			const response = await fetch(`${aiServiceUrl}/test-tts`, {
				method: "POST",
				body: JSON.stringify({
					text: ttsSettings.text,
					tts_method: ttsSettings.voice,
				}),
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (response.ok) {
				const audioBlob = await response.blob();
				const audioUrl = URL.createObjectURL(audioBlob);

				const newRecording: AudioRecording = {
					id: `tts-${Date.now()}`,
					url: audioUrl,
					blob: audioBlob,
					duration: 0, // Will be calculated when added to timeline
					timestamp: Date.now(),
					name: `TTS: ${ttsSettings.text.substring(0, 30)}...`,
				};

				setRecordings((prev) => [...prev, newRecording]);
				setSelectedRecording(newRecording);
				setTtsSettings({ ...ttsSettings, text: "" });
			}
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

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (isRecording) {
				handleStopAudioRecording();
			}
		};
	}, [isRecording, handleStopAudioRecording]);

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
				className="flex-1 flex flex-col h-full"
			>
				<TabsList className="w-full justify-start rounded-none bg-transparent border-b px-4 h-10 flex-shrink-0">
					<TabsTrigger
						value="audio-record"
						className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-xs"
					>
						<Mic className="h-3.5 w-3.5 mr-1.5" />
						Audio yozib olish
					</TabsTrigger>
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

				{/* Audio Recording Tab */}
				<TabsContent
					value="audio-record"
					className="flex-1 m-0 overflow-hidden flex flex-col"
				>
					<div className="flex-1 overflow-y-auto">
						<div className="p-4 space-y-4">
							{/* Recording Controls */}
							<Card
								className={cn(
									"overflow-hidden transition-all duration-300",
									isRecording
										? "border-red-500/50 bg-red-500/5 shadow-lg shadow-red-500/10"
										: "border-red-500/10 bg-gradient-to-br from-red-500/5 to-transparent",
								)}
							>
								<CardHeader className="pb-3">
									<CardTitle className="text-base flex items-center gap-2">
										<Mic className="h-4 w-4 text-red-500" />
										Audio yozib olish
									</CardTitle>
									<CardDescription className="text-xs">
										Mikrofon orqali audio yozib oling va timeline'ga qo'shing
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									{/* Audio Level Indicator */}
									{isRecording && (
										<div className="space-y-2">
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

											{/* Audio Level Bar */}
											<div className="relative h-2 bg-muted rounded-full overflow-hidden">
												<div
													className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-yellow-500 transition-all duration-100"
													style={{ width: `${audioLevel}%` }}
												/>
											</div>
											<p className="text-xs text-muted-foreground">
												Audio darajasi: {Math.round(audioLevel)}%
											</p>
										</div>
									)}

									{/* Recording Buttons */}
									<div className="flex gap-2">
										{!isRecording ? (
											<Button
												onClick={handleStartAudioRecording}
												className="flex-1 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400"
											>
												<Mic className="h-4 w-4 mr-2" />
												Yozishni boshlash
											</Button>
										) : (
											<>
												<Button
													onClick={() => setIsPaused(!isPaused)}
													variant="outline"
													className="flex-1"
													disabled
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
													onClick={handleStopAudioRecording}
													variant="destructive"
													className="flex-1"
												>
													<CircleStop className="h-4 w-4 mr-2" />
													To'xtatish
												</Button>
											</>
										)}
									</div>
								</CardContent>
							</Card>

							{/* Recordings List */}
							{recordings.length > 0 && (
								<Card className="overflow-hidden">
									<CardHeader className="pb-3">
										<CardTitle className="text-base flex items-center gap-2">
											<FileAudio className="h-4 w-4 text-blue-500" />
											Audio yozuvlar
										</CardTitle>
										<CardDescription className="text-xs">
											Yozib olingan audiolarni ko'ring va timeline'ga qo'shing
										</CardDescription>
									</CardHeader>
									<CardContent>
										<div className="space-y-2 max-h-60 overflow-y-auto">
											{recordings.map((recording) => (
												<div
													key={recording.id}
													className={cn(
														"p-3 rounded-lg border cursor-pointer transition-all",
														selectedRecording?.id === recording.id
															? "border-primary bg-primary/5"
															: "border-border hover:bg-muted/50",
													)}
													onClick={() => setSelectedRecording(recording)}
												>
													<div className="flex items-center justify-between">
														<div className="flex-1">
															<p className="text-sm font-medium">
																{recording.name}
															</p>
															<p className="text-xs text-muted-foreground">
																{recording.duration > 0 &&
																	`${formatTime(recording.duration)} • `}
																{new Date(
																	recording.timestamp,
																).toLocaleTimeString()}
															</p>
														</div>
														<div className="flex items-center gap-1">
															<Button
																size="sm"
																variant="ghost"
																onClick={(e) => {
																	e.stopPropagation();
																	handleAddToTimeline(recording);
																}}
															>
																<Plus className="h-3.5 w-3.5" />
															</Button>
															<Button
																size="sm"
																variant="ghost"
																onClick={(e) => {
																	e.stopPropagation();
																	handleDeleteRecording(recording.id);
																}}
															>
																<Trash2 className="h-3.5 w-3.5" />
															</Button>
														</div>
													</div>

													{selectedRecording?.id === recording.id && (
														<div className="mt-3">
															<audio
																controls
																className="w-full h-8"
																src={recording.url}
															/>
															<Button
																variant="default"
																className="w-full mt-2"
																size="sm"
																onClick={() => handleAddToTimeline(recording)}
															>
																<Plus className="h-4 w-4 mr-2" />
																Timeline'ga qo'shish
															</Button>
														</div>
													)}
												</div>
											))}
										</div>
									</CardContent>
								</Card>
							)}

						</div>
					</div>
				</TabsContent>

				{/* Screen/Camera Tab - Keep existing content but with fixed scroll */}
				<TabsContent
					value="screen-camera"
					className="flex-1 m-0 overflow-hidden"
				>
					<ScrollArea className="h-full">
						<div className="p-4 space-y-4 pb-20">
							{/* Previous screen/camera content here */}
							<Alert>
								<Video className="h-4 w-4" />
								<AlertDescription>
									Ekran va kamera yozib olish funksiyasi tez orada qo'shiladi.
								</AlertDescription>
							</Alert>
						</div>
					</ScrollArea>
				</TabsContent>

				{/* TTS Tab - Keep existing but improved */}
				<TabsContent value="tts" className="flex-1 m-0 overflow-hidden">
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
												setTtsSettings({ ...ttsSettings, text: e.target.value })
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
													setTtsSettings({ ...ttsSettings, language: v as any })
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
													<SelectItem value="davron">Davron (Erkak)</SelectItem>
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
											<span className="text-xs text-muted-foreground">2x</span>
											<span className="text-sm font-medium w-12 text-center bg-muted px-2 py-1 rounded">
												{ttsSettings.speed}x
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
										Nutqga aylantirish va timeline'ga qo'shish
									</>
								)}
							</Button>
						</div>
					</ScrollArea>
				</TabsContent>
			</Tabs>
		</div>
	);
}

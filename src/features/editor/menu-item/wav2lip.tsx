"use client";
import React, { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Upload,
	Video,
	Mic,
	Play,
	Download,
	Settings,
	AlertCircle,
} from "lucide-react";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { dispatch } from "@designcombo/events";
import { ADD_ITEMS } from "@designcombo/state";
import { generateId } from "@designcombo/timeline";
import { useI18n } from "@/hooks/use-i18n";

interface Wav2LipUploadState {
	video: File | null;
	text: string;
	isGenerating: boolean;
	generatedVideoUrl: string | null;
	previewUrl?: string | null;
	error: string | null;
	progress: number;
}

export default function Wav2LipMenuItem() {
	const { t } = useI18n();

	const [state, setState] = useState<Wav2LipUploadState>({
		video: null,
		text: "",
		isGenerating: false,
		generatedVideoUrl: null,
		error: null,
		progress: 0,
	});

	const [progressMessage, setProgressMessage] = useState<string>("");

	const [settings, setSettings] = useState({
		ttsMethod: "aisha", // Default to Aisha for best quality
		ttsModel: "gulnoza", // Aisha model
		pads: "0,10,0,0",
		faceDetBatchSize: 4, // Reduced for faster processing
		wav2lipBatchSize: 16, // Reduced for faster processing
		resizeFactor: 2, // Reduced resolution for faster processing
		crop: "0,-1,0,-1",
		static: false,
		fps: 25.0,
		noSmooth: false,
		// No demo mode - only real AI
	});

	const [serviceStatus, setServiceStatus] = useState<
		"checking" | "online" | "offline"
	>("checking");

	useEffect(() => {
		const checkServiceHealth = async () => {
			try {
				const response = await fetch("/api/health/lipsync");
				if (!response.ok) {
					setServiceStatus("offline");
				} else {
					setServiceStatus("online");
				}
			} catch (error) {
				setServiceStatus("offline");
			}
		};
		checkServiceHealth();
	}, []);

	const onVideoDrop = useCallback((acceptedFiles: File[]) => {
		const file = acceptedFiles[0];
		if (file && file.type.startsWith("video/")) {
			setState((prev) => ({ ...prev, video: file, error: null }));
		} else {
			setState((prev) => ({ ...prev, error: "Iltimos, video fayl yuklang" }));
		}
	}, []);

	const {
		getRootProps: getVideoRootProps,
		getInputProps: getVideoInputProps,
		isDragActive: isVideoDragActive,
	} = useDropzone({
		onDrop: onVideoDrop,
		accept: {
			"video/*": [".mp4", ".mov", ".avi", ".mkv"],
		},
		multiple: false,
	});

	const generateLipSyncVideo = async () => {
		if (!state.video || !state.text.trim()) {
			setState((prev) => ({ ...prev, error: "Video va matn kiritish shart" }));
			return;
		}

		setState((prev) => ({
			...prev,
			isGenerating: true,
			error: null,
			progress: 0,
		}));
		setProgressMessage("Tayyorlanmoqda...");

		// Declare progressInterval and controller in the outer scope
		let progressInterval: NodeJS.Timeout | undefined;
		let controller: AbortController | undefined;
		let timeoutId: NodeJS.Timeout | undefined;

		try {
			const formData = new FormData();
			formData.append("video", state.video);
			formData.append("text", state.text);
			formData.append("language", "uz");
			formData.append("tts_method", settings.ttsMethod);
			// Add Aisha model parameter if using Aisha TTS
			if (settings.ttsMethod === "aisha") {
				formData.append("tts_model", settings.ttsModel);
			}
			formData.append("pads", settings.pads);
			formData.append(
				"face_det_batch_size",
				settings.faceDetBatchSize.toString(),
			);
			formData.append(
				"wav2lip_batch_size",
				settings.wav2lipBatchSize.toString(),
			);
			formData.append("resize_factor", settings.resizeFactor.toString());
			formData.append("crop", settings.crop);
			formData.append("static", settings.static.toString());
			formData.append("fps", settings.fps.toString());
			formData.append("no_smooth", settings.noSmooth.toString());

			// Progress updates with messages
			setState((prev) => ({ ...prev, progress: 10 }));
			setProgressMessage("Video yuklanmoqda...");

			const apiUrl = "/api/lipsync/generate-from-text";
			console.log("Sending request to:", apiUrl);

			// Start progress simulation while waiting for response
			progressInterval = setInterval(() => {
				setState((prev) => {
					if (prev.progress < 90) {
						const newProgress = Math.min(prev.progress + Math.random() * 5, 90);

						// Update message based on progress
						if (newProgress < 20) {
							setProgressMessage("Video yuklanmoqda...");
						} else if (newProgress < 40) {
							setProgressMessage("Audio yaratilmoqda...");
						} else if (newProgress < 60) {
							setProgressMessage("Yuz tanlanmoqda...");
						} else if (newProgress < 80) {
							setProgressMessage("Lablar sinxronlanmoqda...");
						} else {
							setProgressMessage("Video tayorlanmoqda...");
						}

						return { ...prev, progress: newProgress };
					}
					return prev;
				});
			}, 1000);

			// Set longer timeout for the request (5 minutes)
			controller = new AbortController();
			timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minutes

			const response = await fetch(apiUrl, {
				method: "POST",
				body: formData,
				signal: controller.signal,
			});

			clearTimeout(timeoutId);
			if (progressInterval) clearInterval(progressInterval);

			console.log("Response status:", response.status);

			if (!response.ok) {
				let errorMessage = "Video yaratishda xatolik";
				try {
					const errorData = await response.json();
					errorMessage = errorData.detail || errorMessage;
				} catch {
					const errorText = await response.text();
					errorMessage = errorText || errorMessage;
				}
				throw new Error(errorMessage);
			}

			setState((prev) => ({ ...prev, progress: 95 }));
			setProgressMessage("Video tayyor!");

			// Get the blob and create URL directly
			const blob = await response.blob();
			const blobUrl = URL.createObjectURL(blob);

			setState((prev) => ({
				...prev,
				generatedVideoUrl: blobUrl,
				isGenerating: false,
				progress: 100,
				error: null,
			}));
			setProgressMessage("Muvaffaqiyatli yakunlandi!");

			// Clear progress message after 2 seconds
			setTimeout(() => setProgressMessage(""), 2000);
		} catch (error) {
			// Clean up intervals and timeouts
			if (progressInterval) clearInterval(progressInterval);
			if (timeoutId) clearTimeout(timeoutId);

			let errorMessage = "Noma'lum xatolik";
			if (error instanceof Error) {
				if (error.name === "AbortError") {
					errorMessage = "Vaqt tugadi - video juda uzun yoki katta hajmda";
				} else if (error.message.includes("timeout")) {
					errorMessage =
						"Jarayon juda uzoq davom etdi. Qisqaroq video yoki kichikroq o'lchamda sinab ko'ring";
				} else {
					errorMessage = error.message;
				}
			}

			setState((prev) => ({
				...prev,
				isGenerating: false,
				error: errorMessage,
				progress: 0,
			}));
			setProgressMessage("");
		}
	};

	const addToTimeline = async () => {
		if (!state.generatedVideoUrl) return;

		try {
			// Get actual video duration
			const videoElement = document.createElement("video");
			videoElement.src = state.generatedVideoUrl;

			// Wait for video metadata to load
			await new Promise((resolve, reject) => {
				videoElement.onloadedmetadata = resolve;
				videoElement.onerror = reject;
				// Set a timeout to prevent infinite waiting
				setTimeout(
					() => reject(new Error("Video metadata loading timeout")),
					5000,
				);
			});

			// Get duration in milliseconds (video.duration is in seconds)
			const durationInMs = Math.round(videoElement.duration * 1000);
			console.log(
				"Video duration detected:",
				videoElement.duration,
				"seconds =",
				durationInMs,
				"ms",
			);

			// Always create video track item with actual duration
			const videoItem = {
				id: generateId(),
				type: "video" as const,
				display: {
					from: 0,
					to: durationInMs,
				},
				trim: {
					from: 0,
					to: durationInMs,
				},
				duration: durationInMs,
				details: {
					src: state.generatedVideoUrl,
				},
				metadata: {
					source: "wav2lip",
					originalText: state.text,
					generatedAt: new Date().toISOString(),
					originalDuration: durationInMs,
				},
				name: `Wav2Lip Video - ${new Date().toLocaleTimeString()}`,
			};

			console.log("Dispatching ADD_ITEMS for Wav2Lip video:", videoItem);
			dispatch(ADD_ITEMS, {
				payload: {
					trackItems: [videoItem],
				},
			});

			// Reset state after adding to timeline
			setState((prev) => ({
				...prev,
				generatedVideoUrl: null,
				video: null,
				text: "",
			}));
		} catch (error) {
			console.error("Error adding Wav2Lip video to timeline:", error);
			setState((prev) => ({
				...prev,
				error: "Timeline'ga qo'shishda xatolik yuz berdi",
			}));
		}
	};

	const resetState = () => {
		setState({
			video: null,
			text: "",
			isGenerating: false,
			generatedVideoUrl: null,
			error: null,
			progress: 0,
		});
	};

	return (
		<div className="flex flex-col h-full overflow-hidden">
			{/* Header */}
			<div className="flex-shrink-0 h-12 flex items-center px-4 text-xs sm:text-sm font-medium border-b bg-gradient-to-r from-pink-500/10 via-pink-500/5 to-transparent">
				<Video className="h-4 w-4 mr-2 text-pink-500" />
				Sinxron
			</div>

			{serviceStatus === "offline" && (
				<div className="px-2 sm:px-4">
					<Alert className="mt-2 sm:mt-4 border-destructive bg-destructive/10">
						<AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-destructive flex-shrink-0" />
						<AlertDescription className="text-xs sm:text-sm text-destructive">
							<strong>AI xizmati ishlamayapti!</strong>
							<br />
							Wav2Lip AI xizmati hozirda mavjud emas.
						</AlertDescription>
					</Alert>
				</div>
			)}

			<div className="flex-1 overflow-y-auto">
				<div className="space-y-3 p-2 sm:p-4">
					{/* Video Upload */}
					<Card>
						<CardHeader>
							<CardTitle className="text-sm sm:text-base flex items-center gap-2">
								<Video className="w-4 h-4" />
								Video yuklash
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div
								{...getVideoRootProps()}
								className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer  ${
									isVideoDragActive
										? "border-primary bg-primary/10"
										: "border-muted-foreground/25 hover:border-primary/50"
								}`}
							>
								<input {...getVideoInputProps()} />
								<Upload className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
								{state.video ? (
									<div>
										<p className="font-medium text-sm">{state.video.name}</p>
										<p className="text-xs text-muted-foreground">
											{(state.video.size / 1024 / 1024).toFixed(2)} MB
										</p>
									</div>
								) : (
									<div>
										<p className="text-sm">Video yuklang</p>
										<p className="text-xs text-muted-foreground">
											MP4, MOV, AVI, MKV
										</p>
									</div>
								)}
							</div>
						</CardContent>
					</Card>

					{/* Text Input */}
					<Card>
						<CardHeader>
							<CardTitle className="text-sm sm:text-base flex items-center gap-2">
								<Mic className="w-4 h-4" />
								O'zbek matni
							</CardTitle>
							<CardDescription className="text-xs sm:text-sm">
								Videodagi shaxs aytadigan matni kiriting
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Textarea
								value={state.text}
								onChange={(e) =>
									setState((prev) => ({ ...prev, text: e.target.value }))
								}
								placeholder="Bu yerga o'zbek tilidagi matni yozing..."
								rows={4}
								className="w-full"
							/>
							<div className="flex items-center justify-between mt-2">
								<span className="text-sm text-muted-foreground">
									{state.text.length} ta belgi
								</span>
								<div className="flex items-center gap-2">
									<Label className="text-xs text-muted-foreground">
										Audio:
									</Label>
									<Select
										value={settings.ttsMethod}
										onValueChange={(value) =>
											setSettings((prev) => ({ ...prev, ttsMethod: value }))
										}
									>
										<SelectTrigger className="w-32">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="aisha">
												<div className="flex items-center gap-1">
													<span className="text-green-500 text-xs">●</span>
													Aisha TTS
													<span className="text-xs text-muted-foreground ml-1">
														★
													</span>
												</div>
											</SelectItem>
											<SelectItem value="pyttsx3">
												<div className="flex items-center gap-1">
													<span className="text-green-500 text-xs">●</span>
													Pyttsx3
												</div>
											</SelectItem>
											<SelectItem value="espeak">
												<div className="flex items-center gap-1">
													<span className="text-green-500 text-xs">●</span>
													Espeak
												</div>
											</SelectItem>
											<SelectItem value="auto">
												<div className="flex items-center gap-1">
													<span className="text-blue-500 text-xs">●</span>
													Avtomatik
												</div>
											</SelectItem>
											<SelectItem value="google">
												<div className="flex items-center gap-1">
													<span className="text-yellow-500 text-xs">●</span>
													Google TTS
												</div>
											</SelectItem>
											<SelectItem value="azure">
												<div className="flex items-center gap-1">
													<span className="text-yellow-500 text-xs">●</span>
													Azure TTS
												</div>
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
							{/* Show Aisha model selector when Aisha TTS is selected */}
							{settings.ttsMethod === "aisha" && (
								<div className="flex items-center gap-2 mt-3">
									<Label className="text-xs text-muted-foreground">Ovoz:</Label>
									<Select
										value={settings.ttsModel}
										onValueChange={(value) =>
											setSettings((prev) => ({ ...prev, ttsModel: value }))
										}
									>
										<SelectTrigger className="w-32">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="gulnoza">
												<div className="flex items-center gap-1">
													<span className="text-pink-500 text-xs">♀</span>
													Gulnoza
												</div>
											</SelectItem>
											<SelectItem value="sardor" disabled>
												<div className="flex items-center gap-1">
													<span className="text-blue-500 text-xs">♂</span>
													Sardor
													<span className="text-xs text-muted-foreground ml-1">
														(Tez kunda)
													</span>
												</div>
											</SelectItem>
										</SelectContent>
									</Select>
									<span className="text-xs text-muted-foreground">
										Yuqori sifatli o'zbek ovozi
									</span>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Advanced Settings */}
					<Collapsible>
						<CollapsibleTrigger asChild>
							<Button variant="outline" size="sm" className="w-full">
								<Settings className="w-4 h-4 mr-2" />
								Qo'shimcha sozlamalar
							</Button>
						</CollapsibleTrigger>
						<CollapsibleContent className="mt-2">
							<Card>
								<CardContent className="pt-4 space-y-3">
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
										<div>
											<Label className="text-xs">Yuz aniqlash partiyasi</Label>
											<Input
												type="number"
												value={settings.faceDetBatchSize}
												onChange={(e) =>
													setSettings((prev) => ({
														...prev,
														faceDetBatchSize: parseInt(e.target.value) || 4,
													}))
												}
												min="1"
												max="16"
												className="h-8"
											/>
										</div>
										<div>
											<Label className="text-xs">Wav2Lip partiyasi</Label>
											<Input
												type="number"
												value={settings.wav2lipBatchSize}
												onChange={(e) =>
													setSettings((prev) => ({
														...prev,
														wav2lipBatchSize: parseInt(e.target.value) || 16,
													}))
												}
												min="1"
												max="128"
												className="h-8"
											/>
										</div>
										<div>
											<Label className="text-xs">O'lcham koeffitsienti</Label>
											<Input
												type="number"
												value={settings.resizeFactor}
												onChange={(e) =>
													setSettings((prev) => ({
														...prev,
														resizeFactor: parseInt(e.target.value) || 2,
													}))
												}
												min="1"
												max="4"
												className="h-8"
											/>
										</div>
										<div>
											<Label className="text-xs">FPS</Label>
											<Input
												type="number"
												value={settings.fps}
												onChange={(e) =>
													setSettings((prev) => ({
														...prev,
														fps: parseFloat(e.target.value) || 25,
													}))
												}
												min="10"
												max="60"
												step="0.1"
												className="h-8"
											/>
										</div>
									</div>
									<div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
										<AlertCircle className="w-4 h-4 text-muted-foreground" />
										<p className="text-xs text-muted-foreground">
											Kichikroq batch va resize qiymatlari tezroq ishlaydi
										</p>
									</div>
								</CardContent>
							</Card>
						</CollapsibleContent>
					</Collapsible>

					{/* Error Display */}
					{state.error && (
						<div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
							<p className="text-sm text-destructive">{state.error}</p>
						</div>
					)}

					{/* Progress */}
					{state.isGenerating && (
						<Card>
							<CardContent className="pt-4">
								<div className="space-y-3">
									<div className="flex items-center justify-between">
										<span className="text-sm font-medium">
											{progressMessage || "Yaratilmoqda..."}
										</span>
										<span className="text-sm font-semibold text-primary">
											{Math.round(state.progress)}%
										</span>
									</div>
									<div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
										<div
											className="bg-gradient-to-r from-primary to-primary/80 h-full rounded-full    relative"
											style={{ width: `${state.progress}%` }}
										>
											<div className="absolute inset-0 bg-white/20 "></div>
										</div>
									</div>
									<div className="text-xs text-muted-foreground text-center">
										{state.progress < 30 &&
											"Bu jarayon bir necha daqiqa davom etishi mumkin..."}
										{state.progress >= 30 &&
											state.progress < 60 &&
											"AI modellar ishlamoqda..."}
										{state.progress >= 60 &&
											state.progress < 90 &&
											"Tez orada tayyor bo'ladi..."}
										{state.progress >= 90 && "Deyarli tayyor!"}
									</div>
								</div>
							</CardContent>
						</Card>
					)}

					{/* Preview */}
					{state.generatedVideoUrl && (
						<Card>
							<CardHeader>
								<CardTitle className="text-sm sm:text-base flex items-center gap-2">
									<Play className="w-4 h-4" />
									Oldindan ko'rish
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									<video
										src={state.previewUrl || state.generatedVideoUrl}
										controls
										className="w-full rounded-lg"
									/>
									<div className="flex gap-2">
										<Button onClick={addToTimeline} className="flex-1">
											Videoni timelinega qo'shish
										</Button>
										<Button variant="outline" onClick={resetState}>
											Yangilash
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>
					)}

					{/* Generate Button */}
					<Button
						onClick={generateLipSyncVideo}
						disabled={!state.video || !state.text.trim() || state.isGenerating}
						className="w-full"
						size="lg"
					>
						{state.isGenerating ? "Yaratilmoqda..." : "Video yaratish"}
					</Button>
				</div>
			</div>
		</div>
	);
}

"use client";
import React, { useState, useCallback, useEffect, useRef } from "react";
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
	Square,
	Pause,
	Volume2,
	FileAudio,
	Trash2,
} from "lucide-react";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { dispatch } from "@designcombo/events";
import { ADD_ITEMS } from "@designcombo/state";
import { generateId } from "@designcombo/timeline";
import { useI18n } from "@/hooks/use-i18n";
import { cn } from "@/lib/utils";
import { uploadBlobToServer } from "@/lib/upload-helper";
import TTSInput from "./components/tts-input";

type AudioMode = "tts" | "record" | "upload";

interface SinxronUploadState {
	video: File | null;
	text: string;
	audioMode: AudioMode;
	audioFile: File | null;
	recordedAudio: Blob | null;
	isRecording: boolean;
	isGenerating: boolean;
	generatedVideoUrl: string | null;
	previewUrl?: string | null;
	error: string | null;
	progress: number;
}

export default function SinxronMenuItem() {
	const { t } = useI18n();

	const [state, setState] = useState<SinxronUploadState>({
		video: null,
		text: "",
		audioMode: "tts",
		audioFile: null,
		recordedAudio: null,
		isRecording: false,
		isGenerating: false,
		generatedVideoUrl: null,
		error: null,
		progress: 0,
	});

	const [progressMessage, setProgressMessage] = useState<string>("");
	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const audioChunksRef = useRef<Blob[]>([]);
	const audioStreamRef = useRef<MediaStream | null>(null);

	const [settings, setSettings] = useState({
		ttsMethod: "aisha",
		ttsModel: "gulnoza",
		ttsLanguage: "uz",
		pads: "0,10,0,0",
		faceDetBatchSize: 4,
		sinxronBatchSize: 16,
		resizeFactor: 2,
		crop: "0,-1,0,-1",
		static: false,
		fps: 25.0,
		noSmooth: false,
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

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (audioStreamRef.current) {
				audioStreamRef.current.getTracks().forEach((track) => track.stop());
			}
		};
	}, []);

	const onVideoDrop = useCallback((acceptedFiles: File[]) => {
		const file = acceptedFiles[0];
		if (file && file.type.startsWith("video/")) {
			setState((prev) => ({ ...prev, video: file, error: null }));
		} else {
			setState((prev) => ({ ...prev, error: "Iltimos, video fayl yuklang" }));
		}
	}, []);

	const onAudioDrop = useCallback((acceptedFiles: File[]) => {
		const file = acceptedFiles[0];
		if (file && file.type.startsWith("audio/")) {
			setState((prev) => ({
				...prev,
				audioFile: file,
				error: null,
				audioMode: "upload",
			}));
		} else {
			setState((prev) => ({
				...prev,
				error: "Iltimos, audio fayl yuklang (MP3, WAV, M4A)",
			}));
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

	const {
		getRootProps: getAudioRootProps,
		getInputProps: getAudioInputProps,
		isDragActive: isAudioDragActive,
	} = useDropzone({
		onDrop: onAudioDrop,
		accept: {
			"audio/*": [".mp3", ".wav", ".m4a", ".aac", ".ogg"],
		},
		multiple: false,
	});

	// Audio recording functions
	const startRecording = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			audioStreamRef.current = stream;

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
				setState((prev) => ({
					...prev,
					recordedAudio: audioBlob,
					isRecording: false,
					audioMode: "record",
				}));
			};

			mediaRecorder.start();
			setState((prev) => ({ ...prev, isRecording: true }));
			toast.success("Ovoz yozish boshlandi");
		} catch (error) {
			console.error("Error starting recording:", error);
			setState((prev) => ({
				...prev,
				error:
					"Mikrofonga kirish rad etildi. Brauzer sozlamalarini tekshiring.",
			}));
			toast.error("Mikrofonga kirish rad etildi");
		}
	};

	const stopRecording = () => {
		if (mediaRecorderRef.current && state.isRecording) {
			mediaRecorderRef.current.stop();
			if (audioStreamRef.current) {
				audioStreamRef.current.getTracks().forEach((track) => track.stop());
			}
			toast.success("Ovoz yozish to'xtatildi");
		}
	};

	const deleteRecording = () => {
		setState((prev) => ({
			...prev,
			recordedAudio: null,
			audioMode: "tts",
		}));
		toast.success("Yozilgan ovoz o'chirildi");
	};

	const deleteAudioFile = () => {
		setState((prev) => ({
			...prev,
			audioFile: null,
			audioMode: "tts",
		}));
		toast.success("Audio fayl o'chirildi");
	};

	const generateLipSyncVideo = async () => {
		// Validation
		if (!state.video) {
			setState((prev) => ({ ...prev, error: "Video yuklash shart" }));
			return;
		}

		if (state.audioMode === "tts" && !state.text.trim()) {
			setState((prev) => ({
				...prev,
				error: "Matn kiritish yoki audio yuklash/yozish shart",
			}));
			return;
		}

		if (state.audioMode === "upload" && !state.audioFile) {
			setState((prev) => ({ ...prev, error: "Audio fayl yuklash shart" }));
			return;
		}

		if (state.audioMode === "record" && !state.recordedAudio) {
			setState((prev) => ({ ...prev, error: "Avval ovoz yozing" }));
			return;
		}

		setState((prev) => ({
			...prev,
			isGenerating: true,
			error: null,
			progress: 0,
		}));
		setProgressMessage("Tayyorlanmoqda...");

		let progressInterval: NodeJS.Timeout | undefined;
		let controller: AbortController | undefined;
		let timeoutId: NodeJS.Timeout | undefined;

		try {
			const formData = new FormData();
			formData.append("video", state.video);

			// Choose API endpoint based on audio mode
			let apiUrl = "";

			if (state.audioMode === "tts") {
				// Use text-to-speech
				apiUrl = "/api/lipsync/generate-from-text";
				formData.append("text", state.text);
				formData.append("language", settings.ttsLanguage);
				formData.append("tts_method", settings.ttsMethod);
				if (settings.ttsMethod === "aisha") {
					formData.append("tts_model", settings.ttsModel);
				}
			} else if (state.audioMode === "upload" && state.audioFile) {
				// Use uploaded audio file
				apiUrl = "/api/lipsync/generate";
				formData.append("audio", state.audioFile);
			} else if (state.audioMode === "record" && state.recordedAudio) {
				// Use recorded audio
				apiUrl = "/api/lipsync/generate";
				const audioFile = new File(
					[state.recordedAudio],
					"recorded-audio.webm",
					{
						type: "audio/webm",
					},
				);
				formData.append("audio", audioFile);
			}

			formData.append("pads", settings.pads);
			formData.append(
				"face_det_batch_size",
				settings.faceDetBatchSize.toString(),
			);
			formData.append(
				"wav2lip_batch_size",
				settings.sinxronBatchSize.toString(),
			);
			formData.append("resize_factor", settings.resizeFactor.toString());
			formData.append("crop", settings.crop);
			formData.append("static", settings.static.toString());
			formData.append("fps", settings.fps.toString());
			formData.append("no_smooth", settings.noSmooth.toString());

			setState((prev) => ({ ...prev, progress: 10 }));
			setProgressMessage("Video yuklanmoqda...");

			console.log("Sending request to:", apiUrl);

			progressInterval = setInterval(() => {
				setState((prev) => {
					if (prev.progress < 90) {
						const newProgress = Math.min(prev.progress + Math.random() * 5, 90);

						if (newProgress < 20) {
							setProgressMessage("Video yuklanmoqda...");
						} else if (newProgress < 40) {
							setProgressMessage(
								state.audioMode === "tts"
									? "Audio yaratilmoqda..."
									: "Audio qayta ishlanmoqda...",
							);
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

			// Use async job submission to bypass Nginx timeout
			let submitUrl = "";
			if (apiUrl.includes("/generate-from-text")) {
				submitUrl = apiUrl.replace('/generate-from-text', '/submit-job-from-text');
			} else {
				submitUrl = apiUrl.replace('/generate', '/submit-job');
			}

			console.log("Submitting job to:", submitUrl);

			const submitResponse = await fetch(submitUrl, {
				method: "POST",
				body: formData,
			});

			if (!submitResponse.ok) {
				throw new Error("Failed to submit job");
			}

			const { job_id } = await submitResponse.json();
			console.log("Job submitted:", job_id);

			setState((prev) => ({ ...prev, progress: 20 }));
			setProgressMessage("Job yaratildi, kutilmoqda...");

			// Poll for status
			let jobStatus = "queued";
			while (jobStatus === "queued" || jobStatus === "processing") {
				await new Promise((resolve) => setTimeout(resolve, 2000)); // Poll every 2s

				const statusUrl = submitUrl
					.replace('/submit-job', `/job/${job_id}/status`)
					.replace('/submit-job-from-text', `/job/${job_id}/status`);
				const statusResponse = await fetch(statusUrl);

				if (!statusResponse.ok) {
					throw new Error("Failed to check status");
				}

				const jobData = await statusResponse.json();
				jobStatus = jobData.status;

				setState((prev) => ({ ...prev, progress: Math.min(jobData.progress || 50, 90) }));
				setProgressMessage(jobData.message || "Qayta ishlanmoqda...");

				if (jobStatus === "completed") {
					if (progressInterval) clearInterval(progressInterval);

					// Download result and save to server
					setState((prev) => ({ ...prev, progress: 95 }));
					setProgressMessage("Video saqlanmoqda...");

					const downloadUrl = submitUrl
						.replace('/submit-job', `/job/${job_id}/download`)
						.replace('/submit-job-from-text', `/job/${job_id}/download`);
					const videoResponse = await fetch(downloadUrl);

					if (!videoResponse.ok) {
						throw new Error("Failed to download result");
					}

					const blob = await videoResponse.blob();

					// Save video to server's public/uploads directory
					const filename = `lipsync_${job_id}_${Date.now()}.mp4`;
					const savedUrl = await uploadBlobToServer(blob, filename, 'lipsync');
					console.log("Video saved to server:", savedUrl);

					setState((prev) => ({
						...prev,
						generatedVideoUrl: savedUrl,
						isGenerating: false,
						progress: 100,
						error: null,
					}));
					setProgressMessage("Muvaffaqiyatli yakunlandi!");
					toast.success("Video muvaffaqiyatli yaratildi!");
					setTimeout(() => setProgressMessage(""), 2000);
					return; // Exit function
				}

				if (jobStatus === "failed") {
					throw new Error(jobData.error || "Processing failed");
				}
			}

			// Old synchronous code removed - now using async job queue
			/*
			const response = await fetch(apiUrl, {
				method: "POST",
				body: formData,
			});

			if (progressInterval) clearInterval(progressInterval);

			console.log("Response status:", response.status);

			if (!response.ok) {
				let errorMessage = "Video yaratishda xatolik";
				try {
					const errorData = await response.json();
					console.error("Error response data:", errorData);
					errorMessage = errorData.detail || errorData.error || errorData.details || errorMessage;

					// More specific error messages
					if (response.status === 502 || response.status === 503) {
						errorMessage = "AI xizmati hozirda mavjud emas. Iltimos, keyinroq urinib ko'ring.";
					} else if (response.status === 504) {
						errorMessage = "Gateway timeout xatolik. Qayta urinib ko'ring.";
					} else if (response.status === 413) {
						errorMessage = "Fayl hajmi juda katta. Kichikroq video yuklang.";
					} else if (response.status === 400) {
						errorMessage = errorData.detail || errorData.error || "Noto'g'ri ma'lumot yuborildi.";
					}
				} catch {
					const errorText = await response.text();
					console.error("Error response text:", errorText);
					errorMessage = errorText || errorMessage;

					// Check for common error patterns
					if (response.status === 502 || response.status === 503) {
						errorMessage = "AI xizmati hozirda mavjud emas. Iltimos, keyinroq urinib ko'ring.";
					}
				}
				throw new Error(errorMessage);
			}

			setState((prev) => ({ ...prev, progress: 95 }));
			setProgressMessage("Video tayyor!");

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
			toast.success("Video muvaffaqiyatli yaratildi!");

			setTimeout(() => setProgressMessage(""), 2000);
			*/
		} catch (error) {
			if (progressInterval) clearInterval(progressInterval);
			if (timeoutId) clearTimeout(timeoutId);

			console.error("Full error details:", error);

			let errorMessage = "Noma'lum xatolik yuz berdi";
			if (error instanceof Error) {
				if (error.name === "AbortError") {
					errorMessage = "So'rov bekor qilindi";
				} else if (error.message.includes("timeout")) {
					errorMessage = "Ulanish vaqti tugadi. Qayta urinib ko'ring";
				} else if (error.message.includes("fetch") || error.message.includes("Failed to fetch")) {
					errorMessage = "Serverga ulanishda xatolik. Internet aloqangizni tekshiring yoki keyinroq urinib ko'ring.";
				} else if (error.message.includes("NetworkError") || error.message.includes("Network")) {
					errorMessage = "Tarmoq xatolik. Internet aloqangizni tekshiring.";
				} else if (error.message.includes("CORS")) {
					errorMessage = "Server konfiguratsiya xatoligi. Administratorga xabar bering.";
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
			toast.error(errorMessage);
		}
	};

	const addToTimeline = async () => {
		if (!state.generatedVideoUrl) return;

		try {
			const videoElement = document.createElement("video");
			videoElement.src = state.generatedVideoUrl;

			await new Promise((resolve, reject) => {
				videoElement.onloadedmetadata = resolve;
				videoElement.onerror = reject;
				setTimeout(
					() => reject(new Error("Video metadata loading timeout")),
					5000,
				);
			});

			const durationInMs = Math.round(videoElement.duration * 1000);

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
					source: "sinxron",
					audioMode: state.audioMode,
					originalText: state.audioMode === "tts" ? state.text : "",
					generatedAt: new Date().toISOString(),
					originalDuration: durationInMs,
				},
				name: `Sinxron Video - ${new Date().toLocaleTimeString()}`,
			};

			console.log("Dispatching ADD_ITEMS for Sinxron video:", videoItem);
			dispatch(ADD_ITEMS, {
				payload: {
					trackItems: [videoItem],
				},
			});

			setState((prev) => ({
				...prev,
				generatedVideoUrl: null,
				video: null,
				text: "",
				audioFile: null,
				recordedAudio: null,
			}));

			toast.success("Video timeline'ga qo'shildi!");
		} catch (error) {
			console.error("Error adding Sinxron video to timeline:", error);
			const errorMessage =
				error instanceof Error ? error.message : String(error);
			setState((prev) => ({
				...prev,
				error: `Timeline'ga qo'shishda xatolik: ${errorMessage}`,
			}));
			toast.error("Timeline'ga qo'shishda xatolik");
		}
	};

	const resetState = () => {
		setState({
			video: null,
			text: "",
			audioMode: "tts",
			audioFile: null,
			recordedAudio: null,
			isRecording: false,
			isGenerating: false,
			generatedVideoUrl: null,
			error: null,
			progress: 0,
		});
	};

	const getAudioSourceInfo = () => {
		if (state.audioMode === "tts" && state.text) {
			return `TTS: ${state.text.substring(0, 50)}${state.text.length > 50 ? "..." : ""}`;
		}
		if (state.audioMode === "upload" && state.audioFile) {
			return `Fayl: ${state.audioFile.name}`;
		}
		if (state.audioMode === "record" && state.recordedAudio) {
			return `Yozilgan: ${(state.recordedAudio.size / 1024).toFixed(1)} KB`;
		}
		return "Audio tanlanmagan";
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
							Sinxron AI xizmati hozirda mavjud emas.
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
								className={cn(
									"border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-colors",
									isVideoDragActive
										? "border-primary bg-primary/10"
										: "border-muted-foreground/25 hover:border-primary/50",
								)}
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

					{/* Audio Input - Tabs */}
					<Card>
						<CardHeader>
							<CardTitle className="text-sm sm:text-base flex items-center gap-2">
								<Volume2 className="w-4 h-4" />
								Audio manbai
							</CardTitle>
							<CardDescription className="text-xs sm:text-sm">
								Audio yaratish, yozish yoki yuklash
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Tabs
								value={state.audioMode}
								onValueChange={(value) =>
									setState((prev) => ({
										...prev,
										audioMode: value as AudioMode,
									}))
								}
							>
								<TabsList className="grid w-full grid-cols-3">
									<TabsTrigger value="tts" className="text-xs">
										<Mic className="w-3 h-3 mr-1" />
										TTS
									</TabsTrigger>
									<TabsTrigger value="record" className="text-xs">
										<Mic className="w-3 h-3 mr-1" />
										Yozish
									</TabsTrigger>
									<TabsTrigger value="upload" className="text-xs">
										<FileAudio className="w-3 h-3 mr-1" />
										Yuklash
									</TabsTrigger>
								</TabsList>

								{/* TTS Tab */}
								<TabsContent value="tts" className="space-y-3 mt-3">
									<TTSInput
										text={state.text}
										onTextChange={(text) =>
											setState((prev) => ({ ...prev, text }))
										}
										settings={{
											ttsMethod: settings.ttsMethod,
											ttsModel: settings.ttsModel,
											ttsLanguage: settings.ttsLanguage,
										}}
										onSettingsChange={(newSettings) =>
											setSettings((prev) => ({ ...prev, ...newSettings }))
										}
									/>
								</TabsContent>

								{/* Record Tab */}
								<TabsContent value="record" className="space-y-3 mt-3">
									{!state.recordedAudio ? (
										<div className="space-y-3">
											<div className="text-center p-4 border-2 border-dashed rounded-lg">
												<Mic className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
												<p className="text-sm text-muted-foreground mb-3">
													Ovozingizni yozing
												</p>
												<Button
													onClick={
														state.isRecording ? stopRecording : startRecording
													}
													variant={
														state.isRecording ? "destructive" : "default"
													}
													size="sm"
												>
													{state.isRecording ? (
														<>
															<Square className="w-4 h-4 mr-2" />
															To'xtatish
														</>
													) : (
														<>
															<Mic className="w-4 h-4 mr-2" />
															Yozishni boshlash
														</>
													)}
												</Button>
											</div>
											{state.isRecording && (
												<div className="flex items-center justify-center gap-2 text-destructive animate-pulse">
													<div className="w-2 h-2 bg-destructive rounded-full"></div>
													<span className="text-sm font-medium">
														Yozilmoqda...
													</span>
												</div>
											)}
										</div>
									) : (
										<div className="space-y-3">
											<div className="p-3 bg-muted/50 rounded-lg">
												<div className="flex items-center justify-between mb-2">
													<span className="text-sm font-medium">
														Yozilgan audio
													</span>
													<span className="text-xs text-muted-foreground">
														{(state.recordedAudio.size / 1024).toFixed(1)} KB
													</span>
												</div>
												<audio
													controls
													src={URL.createObjectURL(state.recordedAudio)}
													className="w-full h-8"
												/>
											</div>
											<div className="flex gap-2">
												<Button
													onClick={startRecording}
													variant="outline"
													size="sm"
													className="flex-1"
												>
													<Mic className="w-4 h-4 mr-2" />
													Qayta yozish
												</Button>
												<Button
													onClick={deleteRecording}
													variant="destructive"
													size="sm"
												>
													<Trash2 className="w-4 h-4" />
												</Button>
											</div>
										</div>
									)}
								</TabsContent>

								{/* Upload Tab */}
								<TabsContent value="upload" className="space-y-3 mt-3">
									{!state.audioFile ? (
										<div
											{...getAudioRootProps()}
											className={cn(
												"border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors",
												isAudioDragActive
													? "border-primary bg-primary/10"
													: "border-muted-foreground/25 hover:border-primary/50",
											)}
										>
											<input {...getAudioInputProps()} />
											<FileAudio className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
											<p className="text-sm">Audio fayl yuklang</p>
											<p className="text-xs text-muted-foreground">
												MP3, WAV, M4A, AAC, OGG
											</p>
										</div>
									) : (
										<div className="space-y-3">
											<div className="p-3 bg-muted/50 rounded-lg">
												<div className="flex items-center justify-between mb-2">
													<span className="text-sm font-medium">
														{state.audioFile.name}
													</span>
													<span className="text-xs text-muted-foreground">
														{(state.audioFile.size / 1024 / 1024).toFixed(2)} MB
													</span>
												</div>
												<audio
													controls
													src={URL.createObjectURL(state.audioFile)}
													className="w-full h-8"
												/>
											</div>
											<div className="flex gap-2">
												<div
													{...getAudioRootProps()}
													className="flex-1 cursor-pointer"
												>
													<input {...getAudioInputProps()} />
													<Button
														variant="outline"
														size="sm"
														className="w-full"
													>
														<Upload className="w-4 h-4 mr-2" />
														Boshqa yuklash
													</Button>
												</div>
												<Button
													onClick={deleteAudioFile}
													variant="destructive"
													size="sm"
												>
													<Trash2 className="w-4 h-4" />
												</Button>
											</div>
										</div>
									)}
								</TabsContent>
							</Tabs>
						</CardContent>
					</Card>

					{/* Generate Button with Advanced Settings */}
					<Collapsible>
						<div className="grid grid-cols-5 gap-2">
							<Button
								onClick={generateLipSyncVideo}
								disabled={
									!state.video ||
									(state.audioMode === "tts" && !state.text.trim()) ||
									(state.audioMode === "upload" && !state.audioFile) ||
									(state.audioMode === "record" && !state.recordedAudio) ||
									state.isGenerating
								}
								className="col-span-4"
								size="lg"
							>
								{state.isGenerating ? "Yaratilmoqda..." : "Video yaratish"}
							</Button>
							<CollapsibleTrigger asChild>
								<Button variant="outline" size="lg" className="col-span-1">
									<Settings className="w-4 h-4" />
								</Button>
							</CollapsibleTrigger>
						</div>

						<CollapsibleContent className="mt-2">
							<Card>
								<CardContent className="pt-4 space-y-3">
									<div className="grid grid-cols-2 gap-2">
										<div>
											<Label className="text-xs">Yuz aniqlash</Label>
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
											<Label className="text-xs">Partiyasi</Label>
											<Input
												type="number"
												value={settings.sinxronBatchSize}
												onChange={(e) =>
													setSettings((prev) => ({
														...prev,
														sinxronBatchSize: parseInt(e.target.value) || 16,
													}))
												}
												min="1"
												max="128"
												className="h-8"
											/>
										</div>
										<div>
											<Label className="text-xs">O'lcham</Label>
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
											Kichikroq qiymatlar tezroq ishlaydi
										</p>
									</div>
								</CardContent>
							</Card>
						</CollapsibleContent>
					</Collapsible>

					{/* Error Display */}
					{state.error && (
						<Alert variant="destructive">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription className="text-sm">
								{state.error}
							</AlertDescription>
						</Alert>
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
											className="bg-gradient-to-r from-primary to-primary/80 h-full rounded-full relative transition-all duration-300"
											style={{ width: `${state.progress}%` }}
										>
											<div className="absolute inset-0 bg-white/20"></div>
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
										src={state.generatedVideoUrl}
										controls
										className="w-full rounded-lg"
									/>
									<div className="p-2 bg-muted/50 rounded text-xs text-muted-foreground">
										<strong>Audio:</strong> {getAudioSourceInfo()}
									</div>
									<div className="flex gap-2">
										<Button onClick={addToTimeline} className="flex-1">
											Timeline'ga qo'shish
										</Button>
										<Button variant="outline" onClick={resetState}>
											Yangilash
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>
					)}
				</div>
			</div>
		</div>
	);
}

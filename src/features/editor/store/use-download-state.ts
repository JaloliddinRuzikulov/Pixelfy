import { IDesign } from "@designcombo/types";
import { create } from "zustand";
interface Output {
	url: string;
	type: string;
}

interface DownloadState {
	projectId: string;
	exporting: boolean;
	exportType: "json" | "mp4";
	progress: number;
	output?: Output;
	payload?: IDesign;
	displayProgressModal: boolean;
	actions: {
		setProjectId: (projectId: string) => void;
		setExporting: (exporting: boolean) => void;
		setExportType: (exportType: "json" | "mp4") => void;
		setProgress: (progress: number) => void;
		setState: (state: Partial<DownloadState>) => void;
		setOutput: (output: Output) => void;
		startExport: () => void;
		setDisplayProgressModal: (displayProgressModal: boolean) => void;
	};
}

//const baseUrl = "https://api.combo.sh/v1";

export const useDownloadState = create<DownloadState>((set, get) => ({
	projectId: "",
	exporting: false,
	exportType: "mp4",
	progress: 0,
	displayProgressModal: false,
	actions: {
		setProjectId: (projectId) => set({ projectId }),
		setExporting: (exporting) => set({ exporting }),
		setExportType: (exportType) => set({ exportType }),
		setProgress: (progress) => set({ progress }),
		setState: (state) => set({ ...state }),
		setOutput: (output) => set({ output }),
		setDisplayProgressModal: (displayProgressModal) =>
			set({ displayProgressModal }),
		startExport: async () => {
			try {
				// Set exporting to true at the start
				set({ exporting: true, displayProgressModal: true, progress: 0 });

				const { payload, exportType } = get();

				if (!payload) throw new Error("Payload is not defined");

				// Handle JSON export
				if (exportType === "json") {
					// Create JSON blob and download
					const jsonBlob = new Blob([JSON.stringify(payload, null, 2)], {
						type: "application/json",
					});
					const url = URL.createObjectURL(jsonBlob);

					set({
						progress: 100,
						exporting: false,
						output: { url, type: "json" },
					});

					// Auto download
					const a = document.createElement("a");
					a.href = url;
					a.download = `project_${Date.now()}.json`;
					document.body.appendChild(a);
					a.click();
					document.body.removeChild(a);

					setTimeout(() => {
						URL.revokeObjectURL(url);
						set({ displayProgressModal: false });
					}, 1000);

					return;
				}

				// Handle MP4 export - use Remotion render API
				console.log("Starting MP4 export with Remotion, payload:", payload);

				// Get chroma key settings from store
				const chromaKeyStore = (
					await import("../store/use-chroma-key-store")
				).default.getState();
				const chromaKeySettings = chromaKeyStore.chromaKeySettings;

				// Use Remotion render API for exact UI match
				const response = await fetch(`/api/remotion-render`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						design: {
							...payload,
						},
						chromaKeySettings, // Pass chroma key settings separately
						options: {
							fps: 30,
							size: payload.size,
							format: "mp4",
						},
					}),
				});

				if (!response.ok) {
					const error = await response.text();
					console.error("Export submit error:", error);
					throw new Error(`Failed to submit export request: ${error}`);
				}

				const jobInfo = await response.json();
				console.log("Export job created:", jobInfo);
				const jobId = jobInfo.jobId;

				if (!jobId) {
					throw new Error("No job ID received from server");
				}

				// Polling for status updates
				const checkStatus = async () => {
					try {
						console.log(`Checking status for job: ${jobId}`);
						const statusResponse = await fetch(
							`/api/remotion-render?id=${jobId}`,
						);

						if (!statusResponse.ok) {
							const errorText = await statusResponse.text();
							console.error("Status response error:", errorText);
							throw new Error(
								`Failed to fetch export status: ${statusResponse.status}`,
							);
						}

						const statusInfo = await statusResponse.json();
						console.log("Status info:", statusInfo);
						const { status, progress, outputUrl, error } = statusInfo;

						// Ensure progress is a number
						const progressValue = typeof progress === "number" ? progress : 0;
						set({ progress: progressValue });

						if (status === "completed") {
							set({
								exporting: false,
								output: { url: outputUrl, type: "mp4" },
								progress: 100,
							});

							// Auto download with full URL
							const downloadUrl = outputUrl.startsWith("http")
								? outputUrl
								: `${window.location.origin}${outputUrl}`;

							const a = document.createElement("a");
							a.href = downloadUrl;
							// Use mp4 extension
							a.download = `video_${Date.now()}.mp4`;
							document.body.appendChild(a);
							a.click();
							document.body.removeChild(a);

							setTimeout(() => {
								set({ displayProgressModal: false });
							}, 1000);
						} else if (status === "failed") {
							throw new Error(error || "Export failed");
						} else if (status === "pending" || status === "processing") {
							setTimeout(checkStatus, 1000);
						} else {
							// Unknown status, keep checking
							setTimeout(checkStatus, 1000);
						}
					} catch (error) {
						console.error("Status check error:", error);
						set({ exporting: false, displayProgressModal: false });
						alert(
							`Export error: ${error instanceof Error ? error.message : "Unknown error"}`,
						);
					}
				};

				// Start checking status after a short delay
				setTimeout(checkStatus, 500);
			} catch (error) {
				console.error("Export error:", error);
				set({ exporting: false, displayProgressModal: false });
				alert(
					`Export failed: ${error instanceof Error ? error.message : "Unknown error"}`,
				);
			}
		},
	},
}));

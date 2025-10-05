import { create } from "zustand";
import { persist } from "zustand/middleware";
import { processUpload, type UploadCallbacks } from "@/utils/upload-service";

interface UploadFile {
	id: string;
	file?: File;
	url?: string;
	type?: string;
	status?: "pending" | "uploading" | "uploaded" | "failed";
	progress?: number;
	error?: string;
}

interface IUploadStore {
	showUploadModal: boolean;
	setShowUploadModal: (showUploadModal: boolean) => void;
	uploadProgress: Record<string, number>;
	setUploadProgress: (uploadProgress: Record<string, number>) => void;
	uploadsVideos: any[];
	setUploadsVideos: (uploadsVideos: any[]) => void;
	uploadsAudios: any[];
	setUploadsAudios: (uploadsAudios: any[]) => void;
	uploadsImages: any[];
	setUploadsImages: (uploadsImages: any[]) => void;
	files: UploadFile[];
	setFiles: (
		files: UploadFile[] | ((prev: UploadFile[]) => UploadFile[]),
	) => void;

	pendingUploads: UploadFile[];
	addPendingUploads: (uploads: UploadFile[]) => void;
	clearPendingUploads: () => void;
	activeUploads: UploadFile[];
	processUploads: () => void;
	updateUploadProgress: (id: string, progress: number) => void;
	setUploadStatus: (
		id: string,
		status: UploadFile["status"],
		error?: string,
	) => void;
	removeUpload: (id: string) => void;
	uploads: any[];
	setUploads: (uploads: any[] | ((prev: any[]) => any[])) => void;
}

// Debug: Clear localStorage on development
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
	const clearStorage = () => {
		console.log("[DEBUG] Clearing upload-store localStorage");
		localStorage.removeItem("upload-store");
	};
	// Uncomment to clear on reload: clearStorage();
}

const useUploadStore = create<IUploadStore>()(
	persist(
		(set, get) => ({
			showUploadModal: false,
			setShowUploadModal: (showUploadModal: boolean) =>
				set({ showUploadModal }),

			uploadProgress: {},
			setUploadProgress: (uploadProgress: Record<string, number>) =>
				set({ uploadProgress }),

			uploadsVideos: [],
			setUploadsVideos: (uploadsVideos: any[]) => set({ uploadsVideos }),

			uploadsAudios: [],
			setUploadsAudios: (uploadsAudios: any[]) => set({ uploadsAudios }),

			uploadsImages: [],
			setUploadsImages: (uploadsImages: any[]) => set({ uploadsImages }),

			files: [],
			setFiles: (
				files: UploadFile[] | ((prev: UploadFile[]) => UploadFile[]),
			) =>
				set((state) => ({
					files:
						typeof files === "function"
							? (files as (prev: UploadFile[]) => UploadFile[])(state.files)
							: files,
				})),

			pendingUploads: [],
			addPendingUploads: (uploads: UploadFile[]) => {
				set((state) => ({
					pendingUploads: [...state.pendingUploads, ...uploads],
				}));
			},
			clearPendingUploads: () => set({ pendingUploads: [] }),

			activeUploads: [],
			processUploads: () => {
				const {
					pendingUploads,
					activeUploads,
					updateUploadProgress,
					setUploadStatus,
					removeUpload,
					setUploads,
				} = get();

				console.log(
					`[STORE] Processing uploads - Pending: ${pendingUploads.length}, Active: ${activeUploads.length}`,
				);

				// Move pending uploads to active with 'uploading' status
				if (pendingUploads.length > 0) {
					console.log(
						`[STORE] Moving ${pendingUploads.length} pending uploads to active`,
					);
					set((state) => ({
						activeUploads: [
							...state.activeUploads,
							...pendingUploads.map((u) => ({
								...u,
								status: "uploading" as const,
								progress: 0,
							})),
						],
						pendingUploads: [],
					}));
				}

				// Get updated activeUploads after moving pending ones
				const currentActiveUploads = get().activeUploads;

				const callbacks: UploadCallbacks = {
					onProgress: (uploadId, progress) => {
						console.log("progress", progress, uploadId);
						updateUploadProgress(uploadId, progress);
					},
					onStatus: (uploadId, status, error) => {
						setUploadStatus(uploadId, status, error);
						if (status === "uploaded") {
							// Remove from active uploads after a delay to show final status
							setTimeout(() => removeUpload(uploadId), 3000);
						} else if (status === "failed") {
							// Remove from active uploads after a delay to show final status
							setTimeout(() => removeUpload(uploadId), 3000);
						}
					},
				};

				console.log("activeUploads", currentActiveUploads);
				// Process all uploading items
				for (const upload of currentActiveUploads.filter(
					(upload) => upload.status === "uploading",
				)) {
					console.log("upload", upload);
					processUpload(
						upload.id,
						{ file: upload.file, url: upload.url },
						callbacks,
					)
						.then((uploadData) => {
							console.log(
								`[STORE] Upload completed successfully for ${upload.id}:`,
								uploadData,
							);
							// Add the complete upload data to the uploads array
							if (uploadData) {
								if (Array.isArray(uploadData)) {
									// URL uploads return an array
									console.log(
										`[STORE] Adding URL upload data for ${upload.id}:`,
										uploadData,
									);
									setUploads((prev) => {
										const newUploads = [...prev, ...uploadData];
										console.log(
											`[STORE] Updated uploads array (${newUploads.length} items):`,
											newUploads.map((u) => ({
												name: u.file?.name || "URL",
												type: u.type,
											})),
										);
										return newUploads;
									});
								} else {
									// File uploads return a single object
									console.log(
										`[STORE] Adding file upload data for ${upload.id}:`,
										uploadData,
									);
									setUploads((prev) => {
										const newUploads = [...prev, uploadData];
										console.log(
											`[STORE] Updated uploads array (${newUploads.length} items):`,
											newUploads.map((u) => ({
												name: u.file?.name || "Unknown",
												type: u.type,
											})),
										);
										return newUploads;
									});
								}
							} else {
								console.warn(
									`[STORE] Upload completed for ${upload.id} but no data returned`,
								);
							}
						})
						.catch((error) => {
							console.error("Upload failed:", error);
							// Make sure to update status on error
							setUploadStatus(
								upload.id,
								"failed",
								error?.message || "Upload failed",
							);
						})
						.finally(() => {
							// Ensure any lingering promises are handled
							console.log(`Upload process completed for ${upload.id}`);
						});
				}
			},
			updateUploadProgress: (id: string, progress: number) =>
				set((state) => ({
					activeUploads: state.activeUploads.map((u) =>
						u.id === id ? { ...u, progress } : u,
					),
				})),
			setUploadStatus: (
				id: string,
				status: UploadFile["status"],
				error?: string,
			) =>
				set((state) => ({
					activeUploads: state.activeUploads.map((u) =>
						u.id === id ? { ...u, status, error } : u,
					),
				})),
			removeUpload: (id: string) =>
				set((state) => ({
					activeUploads: state.activeUploads.filter((u) => u.id !== id),
				})),
			uploads: [],
			setUploads: (uploads: any[] | ((prev: any[]) => any[])) =>
				set((state) => ({
					uploads:
						typeof uploads === "function"
							? (uploads as (prev: any[]) => any[])(state.uploads)
							: uploads,
				})),
		}),
		{
			name: "upload-store",
			partialize: (state) => {
				console.log(`[STORE] Persisting uploads state:`, {
					uploads: state.uploads.length,
				});
				return { uploads: state.uploads };
			},
			onRehydrateStorage: () => (state) => {
				if (state) {
					console.log(`[STORE] Rehydrated uploads state:`, {
						uploads: state.uploads.length,
					});
				}
			},
		},
	),
);

export type { UploadFile };
export default useUploadStore;

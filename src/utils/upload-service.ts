import axios from "axios";

export type UploadProgressCallback = (
	uploadId: string,
	progress: number,
) => void;

export type UploadStatusCallback = (
	uploadId: string,
	status: "uploaded" | "failed",
	error?: string,
) => void;

export interface UploadCallbacks {
	onProgress: UploadProgressCallback;
	onStatus: UploadStatusCallback;
}

export async function processFileUpload(
	uploadId: string,
	file: File,
	callbacks: UploadCallbacks,
): Promise<any> {
	try {
		// Create FormData for file upload
		const formData = new FormData();
		formData.append("file", file);

		// Upload to local server with progress tracking
		const response = await axios
			.post("/api/local-upload", formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
				onUploadProgress: (progressEvent) => {
					const percent = Math.round(
						(progressEvent.loaded * 100) / (progressEvent.total || 1),
					);
					callbacks.onProgress(uploadId, percent);
				},
				validateStatus: (status) => status < 500, // Don't throw on client errors
			})
			.catch((error) => {
				// Handle network errors
				console.error("Upload network error:", error);
				throw new Error(error.message || "Network error during upload");
			});

		if (!response || response.status >= 400) {
			throw new Error(
				`Upload failed with status ${response?.status || "unknown"}`,
			);
		}

		const uploadInfo = response.data;

		// Generate media metadata
		let mediaMetadata = {};
		if (file.type.startsWith("video/")) {
			try {
				const videoUrl = uploadInfo.url;
				const video = document.createElement("video");
				video.src = videoUrl;
				video.crossOrigin = "anonymous";

				await new Promise((resolve, reject) => {
					video.onloadedmetadata = resolve;
					video.onerror = reject;
				});

				// Get video duration and aspect ratio
				const duration = video.duration * 1000; // Convert to ms
				const aspectRatio = video.videoWidth / video.videoHeight;

				// Generate thumbnail
				const canvas = document.createElement("canvas");
				const context = canvas.getContext("2d");

				// Seek to 1 second or 10% of video duration (whichever is smaller)
				video.currentTime = Math.min(1, video.duration * 0.1);

				await new Promise((resolve) => {
					video.onseeked = resolve;
				});

				if (context) {
					canvas.width = video.videoWidth;
					canvas.height = video.videoHeight;
					context.drawImage(video, 0, 0, canvas.width, canvas.height);
					const thumbnailUrl = canvas.toDataURL("image/jpeg", 0.8);

					mediaMetadata = {
						duration,
						aspectRatio,
						thumbnailUrl,
						width: video.videoWidth,
						height: video.videoHeight,
					};
				}
			} catch (error) {
				console.warn("Failed to generate video metadata:", error);
			}
		} else if (file.type.startsWith("audio/")) {
			try {
				const audioUrl = uploadInfo.url;
				const audio = new Audio(audioUrl);

				await new Promise((resolve, reject) => {
					audio.onloadedmetadata = resolve;
					audio.onerror = reject;
				});

				const duration = audio.duration * 1000; // Convert to ms
				mediaMetadata = {
					duration
				};
			} catch (error) {
				console.warn("Failed to generate audio metadata:", error);
			}
		}

		// Construct upload data
		const uploadData = {
			fileName: uploadInfo.fileName,
			filePath: uploadInfo.filePath,
			fileSize: file.size,
			contentType: file.type,
			metadata: {
				uploadedUrl: uploadInfo.url,
				...mediaMetadata
			},
			folder: uploadInfo.folder || null,
			type: file.type.split("/")[0],
			method: "direct",
			origin: "user",
			status: "uploaded",
			isPreview: false,
			url: uploadInfo.url,
		};

		callbacks.onStatus(uploadId, "uploaded");
		return uploadData;
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		console.error("File upload error:", errorMessage);
		callbacks.onStatus(uploadId, "failed", errorMessage);
		// Don't re-throw, just return null to prevent unhandled rejection
		return null;
	}
}

export async function processUrlUpload(
	uploadId: string,
	url: string,
	callbacks: UploadCallbacks,
): Promise<any[]> {
	try {
		// Start with 10% progress
		callbacks.onProgress(uploadId, 10);

		// Upload URL to local server
		const response = await axios.post(
			"/api/local-upload-url",
			{
				url: url,
			},
			{
				headers: { "Content-Type": "application/json" },
			},
		);

		// Update to 50% progress
		callbacks.onProgress(uploadId, 50);

		const uploadInfo = response.data;

		// Construct upload data
		const uploadData = {
			fileName: uploadInfo.fileName,
			filePath: uploadInfo.filePath,
			fileSize: uploadInfo.fileSize || 0,
			contentType: uploadInfo.contentType,
			metadata: { originalUrl: url, uploadedUrl: uploadInfo.url },
			folder: uploadInfo.folder || null,
			type: uploadInfo.contentType.split("/")[0],
			method: "url",
			origin: "user",
			status: "uploaded",
			isPreview: false,
			url: uploadInfo.url,
		};

		// Complete
		callbacks.onProgress(uploadId, 100);
		callbacks.onStatus(uploadId, "uploaded");
		return [uploadData];
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		console.error("URL upload error:", errorMessage);
		callbacks.onStatus(uploadId, "failed", errorMessage);
		// Don't re-throw, just return empty array to prevent unhandled rejection
		return [];
	}
}

export async function processUpload(
	uploadId: string,
	upload: { file?: File; url?: string },
	callbacks: UploadCallbacks,
): Promise<any> {
	try {
		if (upload.file) {
			return await processFileUpload(uploadId, upload.file, callbacks);
		}
		if (upload.url) {
			return await processUrlUpload(uploadId, upload.url, callbacks);
		}
		callbacks.onStatus(uploadId, "failed", "No file or URL provided");
		return null;
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		console.error("Process upload error:", errorMessage);
		callbacks.onStatus(uploadId, "failed", errorMessage);
		return null;
	}
}

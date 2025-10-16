/**
 * Upload a blob/file to the server and return a permanent URL
 * This prevents blob URLs that break when exporting with Remotion
 */
export async function uploadBlobToServer(
	blob: Blob,
	filename: string,
	type: string = "media",
): Promise<string> {
	const formData = new FormData();
	formData.append("file", blob, filename);
	formData.append("type", type);

	const response = await fetch("/api/upload", {
		method: "POST",
		body: formData,
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.details || "Failed to upload file");
	}

	const { url } = await response.json();
	return url;
}

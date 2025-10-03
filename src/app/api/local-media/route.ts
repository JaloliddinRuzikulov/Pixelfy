import { NextRequest, NextResponse } from "next/server";

// Local media database (in production, use a real database)
const MEDIA_DB = {
	images: [
		{
			id: "local_img_1",
			src: "/media/images/sample1.jpg",
			thumbnail: "/media/images/sample1.jpg", // Use same file as thumbnail
			width: 1920,
			height: 1080,
			photographer: "Local Asset",
			alt: "Sample image 1",
		},
		{
			id: "local_img_2",
			src: "/media/images/sample2.jpg",
			thumbnail: "/media/images/sample2.jpg", // Use same file as thumbnail
			width: 1920,
			height: 1080,
			photographer: "Local Asset",
			alt: "Sample image 2",
		},
		{
			id: "local_img_3",
			src: "/media/images/sample3.jpg",
			thumbnail: "/media/images/sample3.jpg", // Use same file as thumbnail
			width: 1920,
			height: 1080,
			photographer: "Local Asset",
			alt: "Sample image 3",
		},
		{
			id: "local_img_4",
			src: "/media/images/sample4.jpg",
			thumbnail: "/media/images/sample4.jpg", // Use same file as thumbnail
			width: 1920,
			height: 1080,
			photographer: "Local Asset",
			alt: "Sample image 4",
		},
	],
	videos: [
		// Use external sample videos since local videos directory is empty
		{
			id: "sample_vid_1",
			src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
			thumbnail:
				"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg",
			duration: 10,
			width: 1920,
			height: 1080,
			user: "Sample Asset",
		},
		{
			id: "sample_vid_2",
			src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
			thumbnail:
				"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg",
			duration: 12,
			width: 1920,
			height: 1080,
			user: "Sample Asset",
		},
		{
			id: "sample_vid_3",
			src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
			thumbnail:
				"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg",
			duration: 15,
			width: 1920,
			height: 1080,
			user: "Sample Asset",
		},
	],
	audio: [
		// Since audio directory is empty, use placeholder data with external sources
		{
			id: "local_audio_1",
			src: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
			title: "Bell Sound",
			duration: 3,
			artist: "Sample Audio",
		},
		{
			id: "local_audio_2",
			src: "https://www.soundjay.com/misc/sounds/typewriter-key-1.wav",
			title: "Typewriter Sound",
			duration: 1,
			artist: "Sample Audio",
		},
	],
};

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const type = searchParams.get("type") || "images";
	const query = searchParams.get("query") || "";
	const page = parseInt(searchParams.get("page") || "1");
	const perPage = parseInt(searchParams.get("per_page") || "20");

	try {
		// Get media based on type
		let media: any[] = MEDIA_DB[type as keyof typeof MEDIA_DB] || [];

		// Filter by query if provided
		if (query) {
			media = media.filter((item: any) => {
				const searchableText =
					`${item.title || ""} ${item.alt || ""} ${item.photographer || ""} ${item.user || ""}`.toLowerCase();
				return searchableText.includes(query.toLowerCase());
			});
		}

		// Pagination
		const start = (page - 1) * perPage;
		const end = start + perPage;
		const paginatedMedia = media.slice(start, end);

		// Transform to match expected format
		const transformedMedia = paginatedMedia.map((item: any) => ({
			id: item.id,
			details: {
				src: item.src,
				width: item.width,
				height: item.height,
				duration: item.duration,
				photographer: item.photographer || item.user || item.artist,
				alt: item.alt || item.title || "Media asset",
			},
			preview: item.thumbnail || item.src,
			type: type.slice(0, -1), // Remove 's' from type
			metadata: {
				local: true,
				...item,
			},
		}));

		// Use 'photos' for images to match Pexels API format
		const responseKey = type === "images" ? "photos" : type;

		return NextResponse.json({
			[responseKey]: transformedMedia,
			total_results: media.length,
			page,
			per_page: perPage,
			next_page: end < media.length ? page + 1 : null,
			prev_page: page > 1 ? page - 1 : null,
		});
	} catch (error) {
		console.error("Local media API error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch local media" },
			{ status: 500 },
		);
	}
}

// Upload handler for local storage
export async function POST(request: NextRequest) {
	try {
		const formData = await request.formData();
		const file = formData.get("file") as File;

		if (!file) {
			return NextResponse.json({ error: "No file provided" }, { status: 400 });
		}

		// In production, save to disk or database
		// For now, return mock response
		const mockUrl = `/media/uploads/${Date.now()}_${file.name}`;

		return NextResponse.json({
			success: true,
			url: mockUrl,
			file: {
				name: file.name,
				size: file.size,
				type: file.type,
			},
		});
	} catch (error) {
		console.error("Upload error:", error);
		return NextResponse.json(
			{ error: "Failed to upload file" },
			{ status: 500 },
		);
	}
}

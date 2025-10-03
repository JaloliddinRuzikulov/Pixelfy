import { NextRequest, NextResponse } from "next/server";

// Sample video data - using freely available video sources
const SAMPLE_VIDEOS = [
	{
		id: "sample_1",
		width: 1920,
		height: 1080,
		duration: 10,
		src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
		preview:
			"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg",
		title: "Big Buck Bunny",
		fps: 30,
	},
	{
		id: "sample_2",
		width: 1920,
		height: 1080,
		duration: 12,
		src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
		preview:
			"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg",
		title: "Elephants Dream",
		fps: 30,
	},
	{
		id: "sample_3",
		width: 1920,
		height: 1080,
		duration: 15,
		src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
		preview:
			"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg",
		title: "For Bigger Blazes",
		fps: 30,
	},
	{
		id: "sample_4",
		width: 1920,
		height: 1080,
		duration: 10,
		src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
		preview:
			"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerEscapes.jpg",
		title: "For Bigger Escapes",
		fps: 30,
	},
	{
		id: "sample_5",
		width: 1920,
		height: 1080,
		duration: 8,
		src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
		preview:
			"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerFun.jpg",
		title: "For Bigger Fun",
		fps: 30,
	},
	{
		id: "sample_6",
		width: 1920,
		height: 1080,
		duration: 9,
		src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
		preview:
			"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerJoyrides.jpg",
		title: "For Bigger Joyrides",
		fps: 30,
	},
];

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const query = searchParams.get("query");
	const page = parseInt(searchParams.get("page") || "1");
	const perPage = parseInt(searchParams.get("per_page") || "15");

	try {
		// Use only the 6 sample videos
		const allVideos = SAMPLE_VIDEOS;

		// Filter videos based on search query
		let filteredVideos = allVideos;
		if (query) {
			filteredVideos = allVideos.filter((video) =>
				video.title.toLowerCase().includes(query.toLowerCase()),
			);
		}

		// Implement pagination
		const startIndex = (page - 1) * perPage;
		const endIndex = startIndex + perPage;
		const paginatedVideos = filteredVideos.slice(startIndex, endIndex);

		// Transform the data to match the expected format for the video editor
		const transformedVideos = paginatedVideos.map((video) => ({
			id: video.id,
			details: {
				src: video.src,
				width: video.width,
				height: video.height,
				duration: video.duration,
				fps: video.fps,
			},
			preview: video.preview,
			type: "video" as const,
			metadata: {
				title: video.title,
				source: "sample",
				user: {
					id: 0,
					name: "Sample User",
					url: "#",
				},
			},
		}));

		const totalPages = Math.ceil(filteredVideos.length / perPage);
		const hasNextPage = page < totalPages;
		const hasPrevPage = page > 1;

		return NextResponse.json({
			videos: transformedVideos,
			total_results: filteredVideos.length,
			page: page,
			per_page: perPage,
			next_page: hasNextPage
				? `?page=${page + 1}&per_page=${perPage}`
				: undefined,
			prev_page: hasPrevPage
				? `?page=${page - 1}&per_page=${perPage}`
				: undefined,
		});
	} catch (error) {
		console.error("Video API error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch videos" },
			{ status: 500 },
		);
	}
}

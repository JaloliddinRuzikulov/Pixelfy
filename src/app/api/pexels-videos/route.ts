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
	{
		id: "sample_7",
		width: 1920,
		height: 1080,
		duration: 11,
		src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
		preview:
			"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerMeltdowns.jpg",
		title: "For Bigger Meltdowns",
		fps: 30,
	},
	{
		id: "sample_8",
		width: 1920,
		height: 1080,
		duration: 14,
		src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
		preview:
			"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/SubaruOutbackOnStreetAndDirt.jpg",
		title: "Subaru Outback On Street And Dirt",
		fps: 30,
	},
	{
		id: "sample_9",
		width: 1920,
		height: 1080,
		duration: 20,
		src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
		preview:
			"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/TearsOfSteel.jpg",
		title: "Tears of Steel",
		fps: 30,
	},
	{
		id: "sample_10",
		width: 1280,
		height: 720,
		duration: 10,
		src: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4",
		preview: "https://test-videos.co.uk/user/pages/images/big_buck_bunny.jpg",
		title: "Big Buck Bunny (720p)",
		fps: 30,
	},
	{
		id: "sample_11",
		width: 1920,
		height: 1080,
		duration: 10,
		src: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4",
		preview:
			"https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=400",
		title: "Sample Video 1",
		fps: 30,
	},
	{
		id: "sample_12",
		width: 1280,
		height: 720,
		duration: 5,
		src: "https://www.w3schools.com/html/mov_bbb.mp4",
		preview:
			"https://images.unsplash.com/photo-1536240478700-b869070f9279?w=400",
		title: "Sample Animation",
		fps: 30,
	},
];

// Generate additional mock videos with placeholder data
function generateMockVideos(count: number, startId: number) {
	const mockVideos = [];
	const themes = [
		"Nature",
		"City",
		"Abstract",
		"Technology",
		"Space",
		"Ocean",
		"Mountain",
		"Forest",
	];
	const colors = [
		"blue",
		"green",
		"red",
		"purple",
		"orange",
		"yellow",
		"cyan",
		"magenta",
	];

	for (let i = 0; i < count; i++) {
		const theme = themes[i % themes.length];
		const color = colors[i % colors.length];
		mockVideos.push({
			id: `mock_${startId + i}`,
			width: 1920,
			height: 1080,
			duration: 5 + Math.floor(Math.random() * 20),
			// Using a placeholder video URL
			src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
			// Using Unsplash for preview images
			preview: `https://source.unsplash.com/400x225/?${theme},${color}`,
			title: `${theme} Video ${startId + i}`,
			fps: 30,
		});
	}
	return mockVideos;
}

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const query = searchParams.get("query");
	const page = parseInt(searchParams.get("page") || "1");
	const perPage = parseInt(searchParams.get("per_page") || "15");

	try {
		// Combine sample videos with mock videos
		const allVideos = [...SAMPLE_VIDEOS, ...generateMockVideos(30, 13)];

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

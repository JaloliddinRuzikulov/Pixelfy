import { NextRequest, NextResponse } from "next/server";

// Generate sample image data using Unsplash Source API (no auth required)
function generateSampleImages(count: number, startId: number, theme?: string) {
	const images = [];
	const themes = theme
		? [theme]
		: [
				"nature",
				"city",
				"technology",
				"abstract",
				"business",
				"food",
				"travel",
				"animals",
				"architecture",
				"people",
				"landscape",
				"ocean",
				"mountain",
				"forest",
				"desert",
			];

	const sizes = [
		{ width: 1920, height: 1080 },
		{ width: 1280, height: 720 },
		{ width: 1600, height: 900 },
		{ width: 2560, height: 1440 },
		{ width: 3840, height: 2160 },
	];

	for (let i = 0; i < count; i++) {
		const currentTheme = themes[i % themes.length];
		const size = sizes[i % sizes.length];
		const imageId = `sample_${startId + i}`;

		images.push({
			id: imageId,
			width: size.width,
			height: size.height,
			photographer: `Photographer ${i + 1}`,
			photographer_url: "#",
			alt: `${currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1)} image ${i + 1}`,
			// Using Unsplash Source API for real images without authentication
			src: {
				original: `https://source.unsplash.com/${size.width}x${size.height}/?${currentTheme}`,
				large2x: `https://source.unsplash.com/1600x900/?${currentTheme}`,
				large: `https://source.unsplash.com/1200x675/?${currentTheme}`,
				medium: `https://source.unsplash.com/800x450/?${currentTheme}`,
				small: `https://source.unsplash.com/400x225/?${currentTheme}`,
				portrait: `https://source.unsplash.com/600x800/?${currentTheme}`,
				landscape: `https://source.unsplash.com/800x600/?${currentTheme}`,
				tiny: `https://source.unsplash.com/200x150/?${currentTheme}`,
			},
			avg_color: "#" + Math.floor(Math.random() * 16777215).toString(16),
		});
	}

	return images;
}

// Static sample images with specific URLs
const STATIC_SAMPLES = [
	{
		id: "static_1",
		width: 1920,
		height: 1080,
		photographer: "Sample Artist",
		photographer_url: "#",
		alt: "Beautiful landscape",
		src: {
			original:
				"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080",
			large2x:
				"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&h=900",
			large:
				"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=675",
			medium:
				"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=450",
			small:
				"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=225",
			portrait:
				"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=800",
			landscape:
				"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600",
			tiny: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=150",
		},
		avg_color: "#4a5568",
	},
	{
		id: "static_2",
		width: 1920,
		height: 1080,
		photographer: "Sample Artist",
		photographer_url: "#",
		alt: "City skyline",
		src: {
			original:
				"https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1920&h=1080",
			large2x:
				"https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1600&h=900",
			large:
				"https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200&h=675",
			medium:
				"https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&h=450",
			small:
				"https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&h=225",
			portrait:
				"https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&h=800",
			landscape:
				"https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&h=600",
			tiny: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=200&h=150",
		},
		avg_color: "#2d3748",
	},
	{
		id: "static_3",
		width: 1920,
		height: 1080,
		photographer: "Sample Artist",
		photographer_url: "#",
		alt: "Abstract art",
		src: {
			original:
				"https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1920&h=1080",
			large2x:
				"https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1600&h=900",
			large:
				"https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1200&h=675",
			medium:
				"https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&h=450",
			small:
				"https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&h=225",
			portrait:
				"https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&h=800",
			landscape:
				"https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&h=600",
			tiny: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=200&h=150",
		},
		avg_color: "#667eea",
	},
];

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const query = searchParams.get("query");
	const page = parseInt(searchParams.get("page") || "1");
	const perPage = parseInt(searchParams.get("per_page") || "20");

	try {
		// Combine static samples with generated images
		const allImages = [
			...STATIC_SAMPLES,
			...generateSampleImages(60, 4, query || undefined),
		];

		// Filter images based on search query if provided
		let filteredImages = allImages;
		if (query) {
			filteredImages = allImages.filter((image) =>
				image.alt.toLowerCase().includes(query.toLowerCase()),
			);
			// If no matches, generate themed images for the query
			if (filteredImages.length < perPage) {
				filteredImages = [
					...filteredImages,
					...generateSampleImages(perPage, 100, query),
				];
			}
		}

		// Implement pagination
		const startIndex = (page - 1) * perPage;
		const endIndex = startIndex + perPage;
		const paginatedImages = filteredImages.slice(startIndex, endIndex);

		// Transform the data to match the expected format for the video editor
		const transformedPhotos = paginatedImages.map((photo) => ({
			id: photo.id,
			details: {
				src: photo.src.large2x,
				width: photo.width,
				height: photo.height,
				photographer: photo.photographer,
				photographer_url: photo.photographer_url,
				alt: photo.alt,
			},
			preview: photo.src.medium,
			type: "image" as const,
			metadata: {
				avg_color: photo.avg_color,
				original_url: photo.src.original,
			},
		}));

		const totalPages = Math.ceil(filteredImages.length / perPage);
		const hasNextPage = page < totalPages;
		const hasPrevPage = page > 1;

		return NextResponse.json({
			photos: transformedPhotos,
			total_results: filteredImages.length,
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
		console.error("Images API error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch images" },
			{ status: 500 },
		);
	}
}

import { NextRequest, NextResponse } from "next/server";

// Static high-quality Unsplash images
const ADDITIONAL_IMAGES = [
	{
		id: "unsplash_1",
		width: 1920,
		height: 1080,
		photographer: "Unsplash",
		photographer_url: "https://unsplash.com",
		alt: "Mountain landscape",
		src: {
			original:
				"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920",
			large2x:
				"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600",
			large:
				"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200",
			medium:
				"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
			small:
				"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
			portrait:
				"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=800",
			landscape:
				"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600",
			tiny: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200",
		},
		avg_color: "#4a5568",
	},
	{
		id: "unsplash_2",
		width: 1920,
		height: 1080,
		photographer: "Unsplash",
		photographer_url: "https://unsplash.com",
		alt: "City skyline",
		src: {
			original:
				"https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1920",
			large2x:
				"https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1600",
			large:
				"https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200",
			medium:
				"https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800",
			small:
				"https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400",
			portrait:
				"https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&h=800",
			landscape:
				"https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&h=600",
			tiny: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=200",
		},
		avg_color: "#2d3748",
	},
	{
		id: "unsplash_3",
		width: 1920,
		height: 1080,
		photographer: "Unsplash",
		photographer_url: "https://unsplash.com",
		alt: "Ocean waves",
		src: {
			original:
				"https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1920",
			large2x:
				"https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1600",
			large:
				"https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1200",
			medium:
				"https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800",
			small:
				"https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400",
			portrait:
				"https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=600&h=800",
			landscape:
				"https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&h=600",
			tiny: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=200",
		},
		avg_color: "#1e40af",
	},
	{
		id: "unsplash_4",
		width: 1920,
		height: 1080,
		photographer: "Unsplash",
		photographer_url: "https://unsplash.com",
		alt: "Forest path",
		src: {
			original:
				"https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920",
			large2x:
				"https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1600",
			large:
				"https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200",
			medium:
				"https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800",
			small:
				"https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400",
			portrait:
				"https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=800",
			landscape:
				"https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600",
			tiny: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200",
		},
		avg_color: "#065f46",
	},
	{
		id: "unsplash_5",
		width: 1920,
		height: 1080,
		photographer: "Unsplash",
		photographer_url: "https://unsplash.com",
		alt: "Desert sunset",
		src: {
			original:
				"https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1920",
			large2x:
				"https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1600",
			large:
				"https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1200",
			medium:
				"https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800",
			small:
				"https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=400",
			portrait:
				"https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=600&h=800",
			landscape:
				"https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&h=600",
			tiny: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=200",
		},
		avg_color: "#ea580c",
	},
	{
		id: "unsplash_6",
		width: 1920,
		height: 1080,
		photographer: "Unsplash",
		photographer_url: "https://unsplash.com",
		alt: "Modern architecture",
		src: {
			original:
				"https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1920",
			large2x:
				"https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1600",
			large:
				"https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1200",
			medium:
				"https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800",
			small:
				"https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=400",
			portrait:
				"https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=600&h=800",
			landscape:
				"https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&h=600",
			tiny: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=200",
		},
		avg_color: "#334155",
	},
	{
		id: "unsplash_7",
		width: 1920,
		height: 1080,
		photographer: "Unsplash",
		photographer_url: "https://unsplash.com",
		alt: "Coffee and workspace",
		src: {
			original:
				"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1920",
			large2x:
				"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1600",
			large:
				"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200",
			medium:
				"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800",
			small:
				"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400",
			portrait:
				"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=800",
			landscape:
				"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=600",
			tiny: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200",
		},
		avg_color: "#78350f",
	},
	{
		id: "unsplash_8",
		width: 1920,
		height: 1080,
		photographer: "Unsplash",
		photographer_url: "https://unsplash.com",
		alt: "Technology and coding",
		src: {
			original:
				"https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1920",
			large2x:
				"https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1600",
			large:
				"https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200",
			medium:
				"https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800",
			small:
				"https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400",
			portrait:
				"https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=800",
			landscape:
				"https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600",
			tiny: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=200",
		},
		avg_color: "#1f2937",
	},
	{
		id: "unsplash_9",
		width: 1920,
		height: 1080,
		photographer: "Unsplash",
		photographer_url: "https://unsplash.com",
		alt: "Colorful abstract",
		src: {
			original:
				"https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1920",
			large2x:
				"https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1600",
			large:
				"https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1200",
			medium:
				"https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800",
			small:
				"https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400",
			portrait:
				"https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&h=800",
			landscape:
				"https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&h=600",
			tiny: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=200",
		},
		avg_color: "#667eea",
	},
	{
		id: "unsplash_10",
		width: 1920,
		height: 1080,
		photographer: "Unsplash",
		photographer_url: "https://unsplash.com",
		alt: "Food photography",
		src: {
			original:
				"https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920",
			large2x:
				"https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600",
			large:
				"https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200",
			medium:
				"https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800",
			small:
				"https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400",
			portrait:
				"https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=800",
			landscape:
				"https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600",
			tiny: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200",
		},
		avg_color: "#dc2626",
	},
];

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
		// Combine all images
		const allImages = [...STATIC_SAMPLES, ...ADDITIONAL_IMAGES];

		// Filter images based on search query if provided
		let filteredImages = allImages;
		if (query) {
			filteredImages = allImages.filter((image) =>
				image.alt.toLowerCase().includes(query.toLowerCase()),
			);
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

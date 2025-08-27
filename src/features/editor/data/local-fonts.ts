// System font definitions - fast and reliable, no external dependencies
export const LOCAL_FONTS = [
	{
		id: "font1",
		name: "Inter",
		family: "Inter, system-ui, -apple-system, sans-serif",
		url: "", // System font with fallback
		weight: 400,
		style: "normal",
		category: "sans-serif",
	},
	{
		id: "font2",
		name: "Inter Bold",
		family: "Inter, system-ui, -apple-system, sans-serif",
		url: "", // System font with fallback
		weight: 700,
		style: "normal",
		category: "sans-serif",
	},
	{
		id: "font3",
		name: "System UI",
		family: "system-ui, -apple-system, sans-serif",
		url: "", // System font
		weight: 400,
		style: "normal",
		category: "sans-serif",
	},
	{
		id: "font4",
		name: "Segoe UI",
		family: "Segoe UI, system-ui, sans-serif",
		url: "", // System font
		weight: 400,
		style: "normal",
		category: "sans-serif",
	},
	{
		id: "font5",
		name: "Helvetica",
		family: "Helvetica, Arial, sans-serif",
		url: "", // System font
		weight: 400,
		style: "normal",
		category: "sans-serif",
	},
	{
		id: "font6",
		name: "Georgia",
		family: "Georgia, serif",
		url: "", // System font
		weight: 400,
		style: "normal",
		category: "serif",
	},
	{
		id: "font7",
		name: "Courier New",
		family: "Courier New",
		url: "", // System font
		weight: 400,
		style: "normal",
		category: "monospace",
	},
	{
		id: "font8",
		name: "Georgia",
		family: "Georgia",
		url: "", // System font
		weight: 400,
		style: "normal",
		category: "serif",
	},
	{
		id: "font9",
		name: "Arial",
		family: "Arial",
		url: "", // System font
		weight: 400,
		style: "normal",
		category: "sans-serif",
	},
	{
		id: "font10",
		name: "Times New Roman",
		family: "Times New Roman",
		url: "", // System font
		weight: 400,
		style: "normal",
		category: "serif",
	},
];

// Helper function to load local fonts with graceful fallback
export async function loadLocalFont(font: (typeof LOCAL_FONTS)[0]) {
	if (!font.url) {
		// System font, no need to load
		return;
	}

	try {
		// Check if font file exists before trying to load
		const response = await fetch(font.url, { method: "HEAD" });

		if (!response.ok) {
			console.warn(`Font file not found: ${font.url}, using system fallback`);
			return;
		}

		const fontFace = new FontFace(font.family, `url(${font.url})`, {
			weight: font.weight.toString(),
			style: font.style,
		});

		await fontFace.load();
		document.fonts.add(fontFace);
		console.log(`Successfully loaded font: ${font.name}`);
	} catch (error) {
		console.warn(
			`Failed to load font ${font.name}, using system fallback:`,
			error,
		);
	}
}

// Load all fonts on initialization
export async function loadAllLocalFonts() {
	const promises = LOCAL_FONTS.filter((font) => font.url) // Only load fonts with URLs
		.map((font) => loadLocalFont(font));

	await Promise.all(promises);
}

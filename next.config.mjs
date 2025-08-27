/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,

	// Image optimization
	images: {
		domains: [
			"cdn.designcombo.dev",
			"ik.imagekit.io",
			"images.pexels.com",
			"fonts.gstatic.com",
		],
		formats: ["image/avif", "image/webp"],
	},

	// Security headers
	async headers() {
		return [
			{
				source: "/:path*",
				headers: [
					{
						key: "X-Frame-Options",
						value: "DENY",
					},
					{
						key: "X-Content-Type-Options",
						value: "nosniff",
					},
					{
						key: "X-XSS-Protection",
						value: "1; mode=block",
					},
					{
						key: "Referrer-Policy",
						value: "strict-origin-when-cross-origin",
					},
				],
			},
		];
	},

	// Experimental features
	experimental: {
		// Enable server actions
		serverActions: {
			bodySizeLimit: "10mb",
		},
	},
};

export default nextConfig;
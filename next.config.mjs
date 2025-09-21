/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: false,

	// Compiler optimizations
	compiler: {
		removeConsole: process.env.NODE_ENV === "production",
	},

	// Image optimization
	images: {
		domains: [
			"cdn.designcombo.dev",
			"ik.imagekit.io",
			"images.pexels.com",
			"fonts.gstatic.com",
			"images.unsplash.com",
			"source.unsplash.com",
		],
		formats: ["image/avif", "image/webp"],
	},

	// Webpack configuration for Remotion
	webpack: (config, { isServer }) => {
		// Fix for esbuild TypeScript definitions
		config.module.rules.push({
			test: /\.d\.ts$/,
			loader: "ignore-loader",
		});

		// Only include Remotion bundler on server-side
		if (!isServer) {
			config.resolve.alias = {
				...config.resolve.alias,
				"@remotion/bundler": false,
				"@remotion/renderer": false,
				esbuild: false,
			};
		}

		return config;
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

	// External packages for server-side only
	serverExternalPackages: [
		"@remotion/bundler",
		"@remotion/renderer",
		"esbuild",
	],
};

export default nextConfig;

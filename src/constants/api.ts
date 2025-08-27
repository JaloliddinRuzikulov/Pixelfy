export const API_ENDPOINTS = {
	CHAT: "/api/chat",
	GENERATE_IMAGE: "/api/generate-image",
	GENERATE_AUDIO: "/api/generate-audio",
	SCHEMA: "/api/schema",
	SCHEME: {
		BASE: "/api/local-scheme",
		CREATE: "/api/local-scheme/create",
		RUN: (id: string) => `/api/local-scheme/run/${id}`,
	},
} as const;

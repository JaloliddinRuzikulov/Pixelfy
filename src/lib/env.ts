import { z } from "zod";

/**
 * Environment variable validation schema
 * Ensures all required env vars are present and valid
 */
const envSchema = z.object({
	// Required API Keys
	PEXELS_API_KEY: z.string().min(1, "Pexels API key is required"),

	// Optional API Keys with defaults
	COMBO_SH_JWT: z.string().default(""),
	GOOGLE_AI_API_KEY: z.string().optional(),

	// Public app config
	NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
	NEXT_PUBLIC_ENABLE_ANALYTICS: z
		.string()
		.transform((val) => val === "true")
		.default("false"),

	// Feature flags
	NEXT_PUBLIC_ENABLE_AI_FEATURES: z
		.string()
		.transform((val) => val === "true")
		.default("true"),
	NEXT_PUBLIC_ENABLE_RECORDING: z
		.string()
		.transform((val) => val === "true")
		.default("true"),
	NEXT_PUBLIC_ENABLE_TEMPLATES: z
		.string()
		.transform((val) => val === "true")
		.default("true"),

	// Node environment
	NODE_ENV: z
		.enum(["development", "production", "test"])
		.default("development"),
});

// Type for validated environment variables
export type Env = z.infer<typeof envSchema>;

// Validate and export environment variables
function validateEnv(): Env {
	try {
		return envSchema.parse(process.env);
	} catch (error) {
		if (error instanceof z.ZodError) {
			console.error("❌ Invalid environment variables:");
			error.errors.forEach((err) => {
				console.error(`  ${err.path.join(".")}: ${err.message}`);
			});

			// Only throw in production, warn in development
			if (process.env.NODE_ENV === "production") {
				throw new Error("Invalid environment variables");
			}

			// Return safe defaults in development
			console.warn("⚠️ Using default values for missing environment variables");
			return envSchema.parse({});
		}
		throw error;
	}
}

export const env = validateEnv();

// Helper functions for feature flags
export const isAIEnabled = () => env.NEXT_PUBLIC_ENABLE_AI_FEATURES;
export const isRecordingEnabled = () => env.NEXT_PUBLIC_ENABLE_RECORDING;
export const isTemplatesEnabled = () => env.NEXT_PUBLIC_ENABLE_TEMPLATES;
export const isProduction = () => env.NODE_ENV === "production";
export const isDevelopment = () => env.NODE_ENV === "development";

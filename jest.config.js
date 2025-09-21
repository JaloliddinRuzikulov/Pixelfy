const nextJest = require("next/jest");

const createJestConfig = nextJest({
	// Provide the path to your Next.js app to load next.config.js and .env files in your test environment
	dir: "./",
});

// Add any custom config to be passed to Jest
const customJestConfig = {
	// Setup files to run after the test framework is installed
	setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],

	// Module name mapper for path aliases
	moduleNameMapper: {
		"^@/(.*)$": "<rootDir>/src/$1",
		"^@designcombo/(.*)$": "<rootDir>/src/vendor/designcombo/$1",
	},

	// Test environment
	testEnvironment: "jest-environment-jsdom",

	// Coverage configuration
	collectCoverageFrom: [
		"src/**/*.{js,jsx,ts,tsx}",
		"!src/**/*.d.ts",
		"!src/**/*.stories.{js,jsx,ts,tsx}",
		"!src/**/index.{js,jsx,ts,tsx}",
		"!src/app/**",
		"!src/**/__tests__/**",
	],

	// Test match patterns
	testMatch: [
		"<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}",
		"<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}",
	],

	// Transform files - simplified
	transform: {
		"^.+\\.(js|jsx|ts|tsx)$": [
			"babel-jest",
			{
				presets: ["next/babel"],
			},
		],
	},

	// Module file extensions
	moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],

	// Ignore patterns
	testPathIgnorePatterns: [
		"<rootDir>/.next/",
		"<rootDir>/node_modules/",
		"<rootDir>/out/",
	],

	// Coverage thresholds
	coverageThreshold: {
		global: {
			branches: 50,
			functions: 50,
			lines: 50,
			statements: 50,
		},
	},
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);

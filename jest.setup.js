// Learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

// Mock environment variables for testing
process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
process.env.PEXELS_API_KEY = "test-pexels-key";
process.env.COMBO_SH_JWT = "test-jwt-token";

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
	writable: true,
	value: jest.fn().mockImplementation((query) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: jest.fn(), // deprecated
		removeListener: jest.fn(), // deprecated
		addEventListener: jest.fn(),
		removeEventListener: jest.fn(),
		dispatchEvent: jest.fn(),
	})),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
	constructor() {}
	disconnect() {}
	observe() {}
	unobserve() {}
	takeRecords() {
		return [];
	}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
	constructor() {}
	disconnect() {}
	observe() {}
	unobserve() {}
};

// Mock canvas
HTMLCanvasElement.prototype.getContext = jest.fn().mockImplementation(() => ({
	fillRect: jest.fn(),
	clearRect: jest.fn(),
	getImageData: jest.fn(() => ({
		data: new Array(4),
	})),
	putImageData: jest.fn(),
	createImageData: jest.fn(() => []),
	setTransform: jest.fn(),
	drawImage: jest.fn(),
	save: jest.fn(),
	fillText: jest.fn(),
	restore: jest.fn(),
	beginPath: jest.fn(),
	moveTo: jest.fn(),
	lineTo: jest.fn(),
	closePath: jest.fn(),
	stroke: jest.fn(),
	translate: jest.fn(),
	scale: jest.fn(),
	rotate: jest.fn(),
	arc: jest.fn(),
	fill: jest.fn(),
	measureText: jest.fn(() => ({ width: 0 })),
	transform: jest.fn(),
	rect: jest.fn(),
	clip: jest.fn(),
}));

// Mock fetch for tests
global.fetch = jest.fn();

// Suppress console errors in tests (optional)
const originalError = console.error;
beforeAll(() => {
	console.error = (...args) => {
		if (
			typeof args[0] === "string" &&
			args[0].includes("Warning: ReactDOM.render")
		) {
			return;
		}
		originalError.call(console, ...args);
	};
});

afterAll(() => {
	console.error = originalError;
});

import React from "react";
import { render, screen } from "@testing-library/react";
import { ErrorBoundary } from "@/components/error-boundary";

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
	if (shouldThrow) {
		throw new Error("Test error");
	}
	return <div>No error</div>;
};

describe("ErrorBoundary", () => {
	// Suppress console.error for these tests
	const originalError = console.error;
	beforeAll(() => {
		console.error = jest.fn();
	});

	afterAll(() => {
		console.error = originalError;
	});

	it("should render children when there is no error", () => {
		render(
			<ErrorBoundary>
				<div>Test content</div>
			</ErrorBoundary>,
		);

		expect(screen.getByText("Test content")).toBeInTheDocument();
	});

	it("should render error UI when child component throws", () => {
		render(
			<ErrorBoundary>
				<ThrowError shouldThrow={true} />
			</ErrorBoundary>,
		);

		expect(screen.getByText("Something went wrong")).toBeInTheDocument();
		expect(screen.getByText("Try Again")).toBeInTheDocument();
	});

	it("should show error details in development mode", () => {
		const originalEnv = process.env.NODE_ENV;
		process.env.NODE_ENV = "development";

		render(
			<ErrorBoundary>
				<ThrowError shouldThrow={true} />
			</ErrorBoundary>,
		);

		expect(
			screen.getByText("Error details (development only)"),
		).toBeInTheDocument();

		process.env.NODE_ENV = originalEnv;
	});

	it("should not show error details in production mode", () => {
		const originalEnv = process.env.NODE_ENV;
		process.env.NODE_ENV = "production";

		render(
			<ErrorBoundary>
				<ThrowError shouldThrow={true} />
			</ErrorBoundary>,
		);

		expect(
			screen.queryByText("Error details (development only)"),
		).not.toBeInTheDocument();

		process.env.NODE_ENV = originalEnv;
	});

	it("should use custom fallback when provided", () => {
		const customFallback = (error: Error, reset: () => void) => (
			<div>
				<p>Custom error: {error.message}</p>
				<button onClick={reset}>Custom reset</button>
			</div>
		);

		render(
			<ErrorBoundary fallback={customFallback}>
				<ThrowError shouldThrow={true} />
			</ErrorBoundary>,
		);

		expect(screen.getByText("Custom error: Test error")).toBeInTheDocument();
		expect(screen.getByText("Custom reset")).toBeInTheDocument();
	});
});

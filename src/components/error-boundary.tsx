"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Home } from "lucide-react";

interface Props {
	children: ReactNode;
	fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface State {
	hasError: boolean;
	error: Error | null;
	errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			hasError: false,
			error: null,
			errorInfo: null,
		};
	}

	static getDerivedStateFromError(error: Error): Partial<State> {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		// Log error to console in development
		if (process.env.NODE_ENV === "development") {
			console.error("ErrorBoundary caught an error:", error, errorInfo);
		}

		// Log to external service in production
		if (
			process.env.NODE_ENV === "production" &&
			typeof window !== "undefined"
		) {
			// Send to analytics/monitoring service
			this.logErrorToService(error, errorInfo);
		}

		this.setState({ errorInfo });
	}

	logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
		// This would send to Sentry, LogRocket, etc.
		const errorData = {
			message: error.message,
			stack: error.stack,
			componentStack: errorInfo.componentStack,
			timestamp: new Date().toISOString(),
			userAgent: navigator.userAgent,
			url: window.location.href,
		};

		// Log to console for now
		console.error("Error logged:", errorData);
	};

	handleReset = () => {
		this.setState({
			hasError: false,
			error: null,
			errorInfo: null,
		});
	};

	handleReload = () => {
		window.location.reload();
	};

	handleGoHome = () => {
		window.location.href = "/";
	};

	render() {
		if (this.state.hasError && this.state.error) {
			// Use custom fallback if provided
			if (this.props.fallback) {
				return this.props.fallback(this.state.error, this.handleReset);
			}

			// Default error UI
			return (
				<div className="flex min-h-screen items-center justify-center bg-background p-4">
					<div className="max-w-md w-full space-y-6 text-center">
						<div className="flex justify-center">
							<div className="rounded-full bg-destructive/10 p-4">
								<AlertCircle className="h-12 w-12 text-destructive" />
							</div>
						</div>

						<div className="space-y-2">
							<h1 className="text-2xl font-bold font-heading">
								Something went wrong
							</h1>
							<p className="text-muted-foreground">
								An unexpected error occurred. Please try again or contact
								support if the problem persists.
							</p>
						</div>

						{process.env.NODE_ENV === "development" && (
							<details className="text-left">
								<summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
									Error details (development only)
								</summary>
								<div className="mt-2 space-y-2">
									<pre className="rounded-lg bg-muted p-3 text-xs overflow-auto max-h-48">
										{this.state.error.message}
									</pre>
									{this.state.error.stack && (
										<pre className="rounded-lg bg-muted p-3 text-xs overflow-auto max-h-48">
											{this.state.error.stack}
										</pre>
									)}
								</div>
							</details>
						)}

						<div className="flex flex-col sm:flex-row gap-3 justify-center">
							<Button onClick={this.handleReset} variant="default">
								<RefreshCw className="mr-2 h-4 w-4" />
								Try Again
							</Button>
							<Button onClick={this.handleReload} variant="outline">
								Reload Page
							</Button>
							<Button onClick={this.handleGoHome} variant="ghost">
								<Home className="mr-2 h-4 w-4" />
								Go Home
							</Button>
						</div>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}

// Specific error boundary for the editor
export class EditorErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			hasError: false,
			error: null,
			errorInfo: null,
		};
	}

	static getDerivedStateFromError(error: Error): Partial<State> {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error("Editor error:", error, errorInfo);
		this.setState({ errorInfo });

		// Try to save user's work before showing error
		this.saveWorkInProgress();
	}

	saveWorkInProgress = () => {
		try {
			// Get current project state from localStorage or state
			const projectState = localStorage.getItem("project_autosave");
			if (projectState) {
				const timestamp = new Date().toISOString();
				localStorage.setItem(`project_backup_${timestamp}`, projectState);
				console.log("Project backed up successfully");
			}
		} catch (e) {
			console.error("Failed to backup project:", e);
		}
	};

	handleRecovery = () => {
		// Try to recover from last saved state
		try {
			const lastSave = localStorage.getItem("project_autosave");
			if (lastSave) {
				// Reload with recovered state
				window.location.reload();
			}
		} catch (e) {
			console.error("Recovery failed:", e);
		}

		this.setState({
			hasError: false,
			error: null,
			errorInfo: null,
		});
	};

	render() {
		if (this.state.hasError && this.state.error) {
			return (
				<div className="flex h-full items-center justify-center bg-muted/50 p-8">
					<div className="max-w-md space-y-4 text-center">
						<AlertCircle className="mx-auto h-12 w-12 text-destructive" />
						<h2 className="text-xl font-semibold">Editor Error</h2>
						<p className="text-sm text-muted-foreground">
							The editor encountered an error. Your work has been automatically
							saved.
						</p>
						<div className="flex gap-3 justify-center">
							<Button onClick={this.handleRecovery} size="sm">
								Recover Work
							</Button>
							<Button
								onClick={() => window.location.reload()}
								variant="outline"
								size="sm"
							>
								Restart Editor
							</Button>
						</div>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function ForceLogoutPage() {
	const [status, setStatus] = useState<
		"idle" | "loading" | "success" | "error"
	>("idle");
	const router = useRouter();

	const handleLogout = async () => {
		setStatus("loading");
		try {
			// Call force logout API
			const response = await fetch("/api/auth/force-logout", {
				method: "POST",
			});

			if (response.ok) {
				setStatus("success");
				// Clear local storage
				localStorage.clear();
				sessionStorage.clear();

				// Redirect to login after 1 second
				setTimeout(() => {
					router.push("/auth/login");
				}, 1000);
			} else {
				setStatus("error");
			}
		} catch (error) {
			console.error("Logout error:", error);
			setStatus("error");
		}
	};

	useEffect(() => {
		// Auto-logout on page load
		handleLogout();
	}, []);

	return (
		<div className="min-h-screen flex items-center justify-center bg-background">
			<div className="max-w-md w-full p-8 space-y-6 text-center">
				<div className="space-y-2">
					<h1 className="text-2xl font-bold">Force Logout</h1>
					<p className="text-muted-foreground">
						Clearing your session and redirecting to login...
					</p>
				</div>

				{status === "loading" && (
					<div className="flex items-center justify-center gap-2">
						<Loader2 className="h-6 w-6 animate-spin text-primary" />
						<span>Logging out...</span>
					</div>
				)}

				{status === "success" && (
					<div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
						<p className="text-green-600 dark:text-green-400 font-medium">
							✓ Logged out successfully!
						</p>
						<p className="text-sm text-muted-foreground mt-2">
							Redirecting to login page...
						</p>
					</div>
				)}

				{status === "error" && (
					<div className="space-y-4">
						<div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
							<p className="text-destructive font-medium">✗ Logout failed</p>
							<p className="text-sm text-muted-foreground mt-2">
								Please try again
							</p>
						</div>
						<Button onClick={handleLogout} className="w-full">
							Try Again
						</Button>
					</div>
				)}

				{status === "idle" && (
					<Button onClick={handleLogout} className="w-full" size="lg">
						Logout Now
					</Button>
				)}
			</div>
		</div>
	);
}

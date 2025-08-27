"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
	children: React.ReactNode;
	fallback?: React.ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
	const { isAuthenticated, isLoading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			router.push("/auth/login");
		}
	}, [isAuthenticated, isLoading, router]);

	if (isLoading) {
		return (
			fallback || (
				<div className="min-h-screen flex items-center justify-center">
					<div className="flex flex-col items-center gap-4">
						<Loader2 className="h-8 w-8 animate-spin" />
						<p className="text-muted-foreground">Loading...</p>
					</div>
				</div>
			)
		);
	}

	if (!isAuthenticated) {
		return null;
	}

	return <>{children}</>;
}

"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";

export function LoginForm() {
	const t = useTranslations("auth.login");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	const { login } = useAuth();
	const router = useRouter();
	const searchParams = useSearchParams();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");

		try {
			await login(email, password);
			// Get return URL from query params or default to /projects
			const returnTo = searchParams.get("returnTo") || "/projects";
			router.push(returnTo);
		} catch (error) {
			setError(
				error instanceof Error ? error.message : t("invalidCredentials"),
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Card className="auth-form-card">
			<CardHeader className="space-y-1 pb-4">
				<CardTitle className="text-xl sm:text-2xl font-bold text-center">
					{t("title")}
				</CardTitle>
				<p className="text-sm text-muted-foreground text-center">
					{t("subtitle")}
				</p>
			</CardHeader>
			<CardContent className="space-y-4">
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="email">{t("email")}</Label>
						<Input
							id="email"
							type="email"
							placeholder={t("emailPlaceholder")}
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							disabled={isLoading}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="password">{t("password")}</Label>
						<div className="relative">
							<Input
								id="password"
								type={showPassword ? "text" : "password"}
								placeholder={t("passwordPlaceholder")}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								disabled={isLoading}
							/>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
								onClick={() => setShowPassword(!showPassword)}
								disabled={isLoading}
							>
								{showPassword ? (
									<EyeOff className="h-4 w-4" />
								) : (
									<Eye className="h-4 w-4" />
								)}
							</Button>
						</div>
					</div>

					{error && (
						<div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
							{error}
						</div>
					)}

					<Button type="submit" className="w-full" disabled={isLoading}>
						{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						{t("signIn")}
					</Button>
				</form>

				<div className="text-center space-y-2">
					<p className="text-sm text-muted-foreground">
						{t("noAccount")}{" "}
						<Link
							href="/auth/register"
							className="text-primary hover:underline font-medium"
						>
							{t("signUp")}
						</Link>
					</p>
					<Link
						href="/auth/forgot-password"
						className="text-sm text-primary hover:underline"
					>
						{t("forgotPassword")}
					</Link>
				</div>
			</CardContent>
		</Card>
	);
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { Loader2, Eye, EyeOff, Check, X } from "lucide-react";

interface PasswordRequirement {
	text: string;
	isValid: boolean;
}

export function RegisterForm() {
	const [formData, setFormData] = useState({
		email: "",
		password: "",
		confirmPassword: "",
		firstName: "",
		lastName: "",
	});
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);

	const { register } = useAuth();
	const router = useRouter();

	// Password validation
	const passwordRequirements: PasswordRequirement[] = [
		{
			text: "At least 8 characters long",
			isValid: formData.password.length >= 8,
		},
		{
			text: "Contains lowercase letter",
			isValid: /[a-z]/.test(formData.password),
		},
		{
			text: "Contains uppercase letter",
			isValid: /[A-Z]/.test(formData.password),
		},
		{
			text: "Contains number",
			isValid: /\d/.test(formData.password),
		},
		{
			text: "Contains special character",
			isValid: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password),
		},
	];

	const isPasswordValid = passwordRequirements.every((req) => req.isValid);
	const doPasswordsMatch = formData.password === formData.confirmPassword;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");

		// Validate passwords match
		if (!doPasswordsMatch) {
			setError("Passwords do not match");
			setIsLoading(false);
			return;
		}

		// Validate password requirements
		if (!isPasswordValid) {
			setError("Password does not meet requirements");
			setIsLoading(false);
			return;
		}

		try {
			await register({
				email: formData.email,
				password: formData.password,
				firstName: formData.firstName || undefined,
				lastName: formData.lastName || undefined,
			});

			setSuccess(true);
		} catch (error) {
			setError(error instanceof Error ? error.message : "Registration failed");
		} finally {
			setIsLoading(false);
		}
	};

	if (success) {
		return (
			<Card className="auth-form-card">
				<CardHeader className="text-center pb-4">
					<CardTitle className="text-xl sm:text-2xl font-bold text-green-600">
						Account Created!
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4 text-center">
					<p className="text-muted-foreground">
						Your account has been created successfully. Please check your email
						to verify your account before signing in.
					</p>
					<Button onClick={() => router.push("/auth/login")} className="w-full">
						Go to Sign In
					</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="auth-form-card">
			<CardHeader className="space-y-1 pb-4">
				<CardTitle className="text-xl sm:text-2xl font-bold text-center">
					Create an account
				</CardTitle>
				<p className="text-sm text-muted-foreground text-center">
					Sign up to start creating amazing videos
				</p>
			</CardHeader>
			<CardContent className="space-y-4">
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="firstName">First name</Label>
							<Input
								id="firstName"
								type="text"
								placeholder="John"
								value={formData.firstName}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										firstName: e.target.value,
									}))
								}
								disabled={isLoading}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="lastName">Last name</Label>
							<Input
								id="lastName"
								type="text"
								placeholder="Doe"
								value={formData.lastName}
								onChange={(e) =>
									setFormData((prev) => ({ ...prev, lastName: e.target.value }))
								}
								disabled={isLoading}
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							type="email"
							placeholder="john@example.com"
							value={formData.email}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, email: e.target.value }))
							}
							required
							disabled={isLoading}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="password">Password</Label>
						<div className="relative">
							<Input
								id="password"
								type={showPassword ? "text" : "password"}
								placeholder="Create a password"
								value={formData.password}
								onChange={(e) =>
									setFormData((prev) => ({ ...prev, password: e.target.value }))
								}
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

						{formData.password && (
							<div className="space-y-2">
								<p className="text-sm text-muted-foreground">
									Password requirements:
								</p>
								<div className="space-y-1">
									{passwordRequirements.map((requirement, index) => (
										<div
											key={index}
											className="flex items-center gap-2 text-sm"
										>
											{requirement.isValid ? (
												<Check className="h-3 w-3 text-green-500" />
											) : (
												<X className="h-3 w-3 text-red-500" />
											)}
											<span
												className={
													requirement.isValid
														? "text-green-600"
														: "text-red-600"
												}
											>
												{requirement.text}
											</span>
										</div>
									))}
								</div>
							</div>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="confirmPassword">Confirm password</Label>
						<div className="relative">
							<Input
								id="confirmPassword"
								type={showConfirmPassword ? "text" : "password"}
								placeholder="Confirm your password"
								value={formData.confirmPassword}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										confirmPassword: e.target.value,
									}))
								}
								required
								disabled={isLoading}
							/>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
								onClick={() => setShowConfirmPassword(!showConfirmPassword)}
								disabled={isLoading}
							>
								{showConfirmPassword ? (
									<EyeOff className="h-4 w-4" />
								) : (
									<Eye className="h-4 w-4" />
								)}
							</Button>
						</div>

						{formData.confirmPassword && (
							<div className="flex items-center gap-2 text-sm">
								{doPasswordsMatch ? (
									<>
										<Check className="h-3 w-3 text-green-500" />
										<span className="text-green-600">Passwords match</span>
									</>
								) : (
									<>
										<X className="h-3 w-3 text-red-500" />
										<span className="text-red-600">Passwords do not match</span>
									</>
								)}
							</div>
						)}
					</div>

					{error && (
						<div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
							{error}
						</div>
					)}

					<Button
						type="submit"
						className="w-full"
						disabled={isLoading || !isPasswordValid || !doPasswordsMatch}
					>
						{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						Create Account
					</Button>
				</form>

				<div className="text-center">
					<p className="text-sm text-muted-foreground">
						Already have an account?{" "}
						<Link
							href="/auth/login"
							className="text-primary hover:underline font-medium"
						>
							Sign in
						</Link>
					</p>
				</div>
			</CardContent>
		</Card>
	);
}

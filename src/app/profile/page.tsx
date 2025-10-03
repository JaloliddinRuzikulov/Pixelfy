"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
	Loader2,
	User,
	Mail,
	Calendar,
	Shield,
	Camera,
	Edit,
	ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { isAdmin } from "@/lib/role-utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";

export default function ProfilePage() {
	const { user, isAuthenticated, isLoading, logout } = useAuth();
	const router = useRouter();
	const [isEditing, setIsEditing] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		email: "",
	});

	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			router.push("/auth/login");
		}

		if (user) {
			setFormData({
				firstName: user.firstName || "",
				lastName: user.lastName || "",
				email: user.email || "",
			});
		}
	}, [isAuthenticated, isLoading, router, user]);

	const handleSave = async () => {
		setIsSaving(true);
		try {
			const response = await fetch("/api/user/profile", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					firstName: formData.firstName,
					lastName: formData.lastName,
				}),
			});

			if (response.ok) {
				setIsEditing(false);
				// Refresh user data
				window.location.reload();
			}
		} catch (error) {
			console.error("Error updating profile:", error);
		} finally {
			setIsSaving(false);
		}
	};

	const handleLogout = async () => {
		await logout();
		router.push("/auth/login");
	};

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="flex flex-col items-center gap-4">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
					<p className="text-muted-foreground">Loading profile...</p>
				</div>
			</div>
		);
	}

	if (!user) {
		return null;
	}

	return (
		<div className="w-full h-screen overflow-y-auto overflow-x-hidden">
			<div className="min-h-screen bg-background">
				{/* Theme and Language controls */}
				<div className="fixed top-4 right-4 flex items-center gap-3 z-50">
					<ThemeToggle />
					<LanguageSwitcher />
				</div>

				<div className="container mx-auto py-8 px-4 pb-20">
					<div className="max-w-4xl mx-auto">
						{/* Header */}
						<div className="mb-8 flex items-start justify-between">
							<div>
								<h1 className="text-3xl font-bold">Profile</h1>
								<p className="text-muted-foreground mt-2">
									Manage your account information and preferences
								</p>
							</div>
							{isAdmin(user) && (
								<Link href="/admin">
									<Button className="gap-2">
										<ShieldCheck className="h-4 w-4" />
										Admin Panel
									</Button>
								</Link>
							)}
						</div>

						<div className="grid gap-6">
							{/* Profile Information Card */}
							<Card>
								<CardHeader className="flex flex-row items-center justify-between">
									<div>
										<CardTitle>Personal Information</CardTitle>
										<CardDescription>
											Update your personal details and profile
										</CardDescription>
									</div>
									{!isEditing && (
										<Button
											variant="outline"
											size="sm"
											onClick={() => setIsEditing(true)}
										>
											<Edit className="h-4 w-4 mr-2" />
											Edit
										</Button>
									)}
								</CardHeader>
								<CardContent>
									<div className="space-y-6">
										{/* Avatar Section */}
										<div className="flex items-center gap-6">
											<div className="relative">
												<Avatar className="h-24 w-24 bg-primary/10">
													{user.avatarUrl ? (
														<img src={user.avatarUrl} alt="Profile" />
													) : (
														<User className="h-12 w-12 text-primary" />
													)}
												</Avatar>
												{isEditing && (
													<Button
														size="sm"
														variant="secondary"
														className="absolute bottom-0 right-0 rounded-full p-2"
													>
														<Camera className="h-4 w-4" />
													</Button>
												)}
											</div>
											<div>
												<div className="flex items-center gap-2 mb-1">
													<h3 className="text-xl font-semibold">
														{user.firstName} {user.lastName}
													</h3>
													{isAdmin(user) && (
														<Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
															Admin
														</Badge>
													)}
												</div>
												<p className="text-muted-foreground">{user.email}</p>
											</div>
										</div>

										{/* Form Fields */}
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<div className="space-y-2">
												<Label htmlFor="firstName">First Name</Label>
												<Input
													id="firstName"
													value={formData.firstName}
													onChange={(e) =>
														setFormData({
															...formData,
															firstName: e.target.value,
														})
													}
													disabled={!isEditing}
												/>
											</div>
											<div className="space-y-2">
												<Label htmlFor="lastName">Last Name</Label>
												<Input
													id="lastName"
													value={formData.lastName}
													onChange={(e) =>
														setFormData({
															...formData,
															lastName: e.target.value,
														})
													}
													disabled={!isEditing}
												/>
											</div>
											<div className="space-y-2">
												<Label htmlFor="email">Email Address</Label>
												<div className="flex items-center gap-2">
													<Input
														id="email"
														value={formData.email}
														disabled
														className="flex-1"
													/>
													{user.emailVerified && (
														<Shield className="h-5 w-5 text-green-500" />
													)}
												</div>
												{!user.emailVerified && (
													<p className="text-sm text-yellow-600">
														Email not verified
													</p>
												)}
											</div>
											<div className="space-y-2">
												<Label>Member Since</Label>
												<Input
													value={new Date(user.createdAt).toLocaleDateString()}
													disabled
												/>
											</div>
										</div>

										{/* Action Buttons */}
										{isEditing && (
											<div className="flex gap-2 justify-end">
												<Button
													variant="outline"
													onClick={() => {
														setIsEditing(false);
														setFormData({
															firstName: user.firstName || "",
															lastName: user.lastName || "",
															email: user.email || "",
														});
													}}
													disabled={isSaving}
												>
													Cancel
												</Button>
												<Button onClick={handleSave} disabled={isSaving}>
													{isSaving && (
														<Loader2 className="h-4 w-4 mr-2 animate-spin" />
													)}
													Save Changes
												</Button>
											</div>
										)}
									</div>
								</CardContent>
							</Card>

							{/* Account Settings Card */}
							<Card>
								<CardHeader>
									<CardTitle>Account Settings</CardTitle>
									<CardDescription>
										Manage your account security and preferences
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									{isAdmin(user) && (
										<div className="flex items-center justify-between p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
											<div className="flex items-center gap-3">
												<ShieldCheck className="h-5 w-5 text-red-600 dark:text-red-400" />
												<div>
													<p className="font-medium text-red-900 dark:text-red-100">
														Administrator Access
													</p>
													<p className="text-sm text-red-700 dark:text-red-300">
														You have full system access
													</p>
												</div>
											</div>
											<Link href="/admin">
												<Button
													size="sm"
													variant="outline"
													className="border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/40"
												>
													Open Admin Panel
												</Button>
											</Link>
										</div>
									)}
									<div className="flex items-center justify-between">
										<div>
											<p className="font-medium">Email Notifications</p>
											<p className="text-sm text-muted-foreground">
												Receive updates about your projects
											</p>
										</div>
										<Button variant="outline" size="sm">
											Configure
										</Button>
									</div>
									<div className="flex items-center justify-between">
										<div>
											<p className="font-medium">Change Password</p>
											<p className="text-sm text-muted-foreground">
												Update your account password
											</p>
										</div>
										<Button variant="outline" size="sm">
											Update
										</Button>
									</div>
									<div className="flex items-center justify-between">
										<div>
											<p className="font-medium">Two-Factor Authentication</p>
											<p className="text-sm text-muted-foreground">
												Add an extra layer of security
											</p>
										</div>
										<Button variant="outline" size="sm">
											Enable
										</Button>
									</div>
								</CardContent>
							</Card>

							{/* Danger Zone */}
							<Card className="border-red-200">
								<CardHeader>
									<CardTitle className="text-red-600">Danger Zone</CardTitle>
									<CardDescription>
										Irreversible actions for your account
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="flex items-center justify-between">
										<div>
											<p className="font-medium">Sign Out</p>
											<p className="text-sm text-muted-foreground">
												Sign out from your account
											</p>
										</div>
										<Button variant="outline" size="sm" onClick={handleLogout}>
											Sign Out
										</Button>
									</div>
									<div className="flex items-center justify-between">
										<div>
											<p className="font-medium text-red-600">Delete Account</p>
											<p className="text-sm text-muted-foreground">
												Permanently delete your account and all data
											</p>
										</div>
										<Button variant="destructive" size="sm">
											Delete Account
										</Button>
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

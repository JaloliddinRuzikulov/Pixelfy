"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/lib/auth";

interface AuthContextType {
	user: User | null;
	isLoading: boolean;
	isAuthenticated: boolean;
	login: (email: string, password: string) => Promise<void>;
	register: (data: RegisterData) => Promise<void>;
	logout: () => Promise<void>;
	refreshUser: () => Promise<void>;
}

interface RegisterData {
	email: string;
	password: string;
	firstName?: string;
	lastName?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const isAuthenticated = !!user;

	// Fetch current user on mount
	useEffect(() => {
		const fetchUser = async () => {
			try {
				const response = await fetch("/api/auth/me");
				if (response.ok) {
					const data = await response.json();
					setUser(data.user);
				}
			} catch (error) {
				console.error("Failed to fetch user:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchUser();
	}, []);

	const login = async (email: string, password: string) => {
		const response = await fetch("/api/auth/login", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ email, password }),
		});

		const data = await response.json();

		if (!response.ok) {
			throw new Error(data.error || "Login failed");
		}

		setUser(data.user);
	};

	const register = async (registerData: RegisterData) => {
		const response = await fetch("/api/auth/register", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(registerData),
		});

		const data = await response.json();

		if (!response.ok) {
			throw new Error(data.error || "Registration failed");
		}

		// Don't automatically log in after registration
		// User needs to verify email first
	};

	const logout = async () => {
		try {
			await fetch("/api/auth/logout", {
				method: "POST",
			});
		} catch (error) {
			console.error("Logout error:", error);
		} finally {
			setUser(null);
		}
	};

	const refreshUser = async () => {
		try {
			const response = await fetch("/api/auth/me");
			if (response.ok) {
				const data = await response.json();
				setUser(data.user);
			} else {
				setUser(null);
			}
		} catch (error) {
			console.error("Failed to refresh user:", error);
			setUser(null);
		}
	};

	const value: AuthContextType = {
		user,
		isLoading,
		isAuthenticated,
		login,
		register,
		logout,
		refreshUser,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}

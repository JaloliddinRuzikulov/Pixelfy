"use client";

import { ReactNode } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import "./auth-layout.css";

interface AuthLayoutProps {
	children: ReactNode;
	title: string;
	subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
	return (
		<div className="auth-layout-container">
			{/* Background decoration */}
			<div className="auth-decoration" />

			{/* Theme and Language controls */}
			<div className="fixed top-4 right-4 flex items-center gap-3 z-50">
				<ThemeToggle />
				<LanguageSwitcher />
			</div>

			<div className="auth-content-wrapper">
				<div className="auth-header">
					<h1 className="auth-title">{title}</h1>
					<p className="auth-subtitle">{subtitle}</p>
				</div>
				{children}
			</div>
		</div>
	);
}

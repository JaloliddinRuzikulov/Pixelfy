"use client";

import { ReactNode } from "react";
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

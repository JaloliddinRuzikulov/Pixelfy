"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useThemeCustomizer } from "@/hooks/use-theme-customizer";

function ThemeInitializer({ children }: { children: React.ReactNode }) {
	// Initialize custom theme on mount
	const { currentTheme, applyTheme } = useThemeCustomizer();

	React.useEffect(() => {
		const isDark = document.documentElement.classList.contains("dark");
		applyTheme(currentTheme, isDark);
	}, []);

	return <>{children}</>;
}

export function ThemeProvider({
	children,
	...props
}: React.ComponentProps<typeof NextThemesProvider>) {
	return (
		<NextThemesProvider {...props}>
			<ThemeInitializer>{children}</ThemeInitializer>
		</NextThemesProvider>
	);
}

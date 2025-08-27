"use client";

import { useEffect, useState } from "react";
import { ThemeColors, themePresets } from "@/lib/theme-presets";

export interface CustomTheme {
	name: string;
	preset: string;
	light: ThemeColors;
	dark: ThemeColors;
	customColors: {
		primary?: string;
		accent?: string;
	};
}

const STORAGE_KEY = "custom-theme-v1";

export function useThemeCustomizer() {
	const [currentTheme, setCurrentTheme] = useState<CustomTheme>(() => {
		if (typeof window !== "undefined") {
			const saved = localStorage.getItem(STORAGE_KEY);
			if (saved) {
				try {
					return JSON.parse(saved);
				} catch {
					// Invalid data, use default
				}
			}
		}

		const defaultPreset = themePresets[0];
		return {
			name: "Custom Theme",
			preset: defaultPreset.id,
			light: defaultPreset.light,
			dark: defaultPreset.dark,
			customColors: {},
		};
	});

	// Apply theme colors to CSS variables
	const applyTheme = (theme: CustomTheme, isDark: boolean) => {
		const root = document.documentElement;
		const colors = isDark ? theme.dark : theme.light;

		// Apply custom colors if set
		const finalColors = {
			...colors,
			...(theme.customColors.primary && {
				primary: theme.customColors.primary,
			}),
			...(theme.customColors.accent && { accent: theme.customColors.accent }),
		};

		// Set CSS variables
		root.style.setProperty("--primary", finalColors.primary);
		root.style.setProperty("--accent", finalColors.accent);
		root.style.setProperty("--background", finalColors.background);
		root.style.setProperty("--foreground", finalColors.foreground);
		root.style.setProperty("--muted", finalColors.muted);
		root.style.setProperty("--card", finalColors.card);
		root.style.setProperty("--border", finalColors.border);

		// Set derived colors
		root.style.setProperty(
			"--primary-foreground",
			isDark ? "oklch(0.14 0.01 250)" : "oklch(0.98 0.002 85)",
		);
		root.style.setProperty(
			"--accent-foreground",
			isDark ? "oklch(0.94 0.006 85)" : "oklch(0.20 0.015 260)",
		);
		root.style.setProperty(
			"--muted-foreground",
			isDark ? "oklch(0.65 0.015 85)" : "oklch(0.48 0.02 260)",
		);
		root.style.setProperty("--card-foreground", finalColors.foreground);
		root.style.setProperty("--popover", finalColors.card);
		root.style.setProperty("--popover-foreground", finalColors.foreground);
		root.style.setProperty("--secondary", finalColors.muted);
		root.style.setProperty("--secondary-foreground", finalColors.foreground);
		root.style.setProperty(
			"--destructive",
			isDark ? "oklch(0.55 0.25 20)" : "oklch(0.54 0.22 25)",
		);
		root.style.setProperty(
			"--destructive-foreground",
			isDark ? "oklch(0.14 0.01 250)" : "oklch(0.98 0.002 85)",
		);
		root.style.setProperty(
			"--input",
			isDark
				? "oklch(from var(--background) calc(l + 0.06) c h)"
				: "oklch(from var(--background) calc(l - 0.015) c h)",
		);
		root.style.setProperty("--ring", finalColors.primary);

		// Update gradients
		root.style.setProperty(
			"--gradient-primary",
			`linear-gradient(135deg, ${finalColors.primary}, oklch(from ${finalColors.primary} calc(l + 0.05) calc(c * 1.1) calc(h + 20)))`,
		);
		root.style.setProperty(
			"--gradient-accent",
			`linear-gradient(135deg, ${finalColors.accent}, oklch(from ${finalColors.accent} calc(l + 0.04) calc(c * 1.1) calc(h + 15)))`,
		);
	};

	// Save theme to localStorage
	const saveTheme = (theme: CustomTheme) => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
		setCurrentTheme(theme);
	};

	// Load preset theme
	const loadPreset = (presetId: string) => {
		const preset = themePresets.find((p) => p.id === presetId);
		if (preset) {
			const newTheme: CustomTheme = {
				name: preset.name,
				preset: preset.id,
				light: preset.light,
				dark: preset.dark,
				customColors: {},
			};
			saveTheme(newTheme);
			return newTheme;
		}
		return currentTheme;
	};

	// Update custom color
	const updateCustomColor = (colorKey: "primary" | "accent", color: string) => {
		const newTheme = {
			...currentTheme,
			customColors: {
				...currentTheme.customColors,
				[colorKey]: color,
			},
		};
		saveTheme(newTheme);
	};

	// Reset to preset colors
	const resetToPreset = () => {
		const preset =
			themePresets.find((p) => p.id === currentTheme.preset) || themePresets[0];
		const newTheme: CustomTheme = {
			name: preset.name,
			preset: preset.id,
			light: preset.light,
			dark: preset.dark,
			customColors: {},
		};
		saveTheme(newTheme);
	};

	// Listen for theme changes
	useEffect(() => {
		const handleThemeChange = () => {
			const isDark = document.documentElement.classList.contains("dark");
			applyTheme(currentTheme, isDark);
		};

		// Initial application
		handleThemeChange();

		// Watch for class changes on html element
		const observer = new MutationObserver(handleThemeChange);
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["class"],
		});

		return () => observer.disconnect();
	}, [currentTheme]);

	return {
		currentTheme,
		loadPreset,
		updateCustomColor,
		resetToPreset,
		applyTheme,
		themePresets,
	};
}

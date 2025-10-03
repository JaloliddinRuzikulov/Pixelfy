import { Inter, Poppins, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { baseUrl, createMetadata } from "@/utils/metadata";
import {
	StoreInitializer,
	BackgroundUploadRunner,
} from "@/components/store-initializer";
import { QueryProvider } from "@/components/query-provider";
import { Analytics } from "@vercel/analytics/react";
import { ErrorBoundary, GlobalErrorHandler } from "@/components/error-boundary";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { IntlProvider } from "@/store/intl-provider";

import "./globals.css";

// Primary font for UI
const inter = Inter({
	subsets: ["latin", "latin-ext"],
	variable: "--font-inter",
	weight: ["300", "400", "500", "600", "700", "800"],
	display: "swap",
	preload: true,
});

// Display font for headings
const poppins = Poppins({
	subsets: ["latin", "latin-ext"],
	variable: "--font-poppins",
	weight: ["400", "500", "600", "700", "800", "900"],
	display: "swap",
	preload: true,
});

// Monospace font for code
const jetbrainsMono = JetBrains_Mono({
	subsets: ["latin", "latin-ext"],
	variable: "--font-mono",
	weight: ["400", "500", "600", "700"],
	display: "swap",
});

export const metadata = createMetadata({
	title: {
		template: "%s | Pixelfy",
		default: "Pixelfy - Video Editor",
	},
	description:
		"Professional online video editor - Create amazing videos with Pixelfy",
	metadataBase: baseUrl,
});

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			suppressHydrationWarning
			className={`${inter.variable} ${poppins.variable} ${jetbrainsMono.variable}`}
		>
			<head>
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link
					rel="preconnect"
					href="https://fonts.gstatic.com"
					crossOrigin="anonymous"
				/>
			</head>
			<body className="antialiased bg-background text-foreground min-h-screen">
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<IntlProvider>
						<AuthProvider>
							<ErrorBoundary>
								<GlobalErrorHandler />
								<QueryProvider>
									{children}
									<StoreInitializer />
									<BackgroundUploadRunner />
									<Toaster />
								</QueryProvider>
							</ErrorBoundary>
						</AuthProvider>
					</IntlProvider>
					<Analytics />
				</ThemeProvider>
			</body>
		</html>
	);
}

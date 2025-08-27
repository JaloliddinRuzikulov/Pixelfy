"use client";

import * as React from "react";
import { Moon, Sun, Monitor, Palette } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ThemeCustomizer } from "./theme-customizer";

export function ThemeToggle() {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = React.useState(false);
	const [showCustomizer, setShowCustomizer] = React.useState(false);

	React.useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return (
			<Button variant="ghost" size="icon" className="h-8 w-8">
				<Sun className="h-4 w-4" />
			</Button>
		);
	}

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8 hover:bg-accent"
					>
						{theme === "dark" ? (
							<Moon className="h-4 w-4" />
						) : theme === "light" ? (
							<Sun className="h-4 w-4" />
						) : (
							<Monitor className="h-4 w-4" />
						)}
						<span className="sr-only">Toggle theme</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="min-w-[120px]">
					<DropdownMenuItem onClick={() => setTheme("light")} className="gap-2">
						<Sun className="h-4 w-4" />
						<span>Light</span>
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => setTheme("dark")} className="gap-2">
						<Moon className="h-4 w-4" />
						<span>Dark</span>
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => setTheme("system")}
						className="gap-2"
					>
						<Monitor className="h-4 w-4" />
						<span>System</span>
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						onClick={() => setShowCustomizer(true)}
						className="gap-2"
					>
						<Palette className="h-4 w-4" />
						<span>Customize Colors</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			{showCustomizer && (
				<ThemeCustomizer
					open={showCustomizer}
					onOpenChange={setShowCustomizer}
				/>
			)}
		</>
	);
}

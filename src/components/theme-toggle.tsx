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
						variant="outline"
						size="sm"
						className="gap-2 h-9 px-3 rounded-full border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-colors"
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
				<DropdownMenuContent align="end" className="w-[180px] rounded-xl border-border/50">
					<DropdownMenuItem
						onClick={() => setTheme("light")}
						className="cursor-pointer rounded-lg py-2.5 px-3 focus:bg-primary/10 gap-3"
					>
						<Sun className="h-4 w-4" />
						<span className="font-medium text-sm">Light</span>
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => setTheme("dark")}
						className="cursor-pointer rounded-lg py-2.5 px-3 focus:bg-primary/10 gap-3"
					>
						<Moon className="h-4 w-4" />
						<span className="font-medium text-sm">Dark</span>
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => setTheme("system")}
						className="cursor-pointer rounded-lg py-2.5 px-3 focus:bg-primary/10 gap-3"
					>
						<Monitor className="h-4 w-4" />
						<span className="font-medium text-sm">System</span>
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						onClick={() => setShowCustomizer(true)}
						className="cursor-pointer rounded-lg py-2.5 px-3 focus:bg-primary/10 gap-3"
					>
						<Palette className="h-4 w-4" />
						<span className="font-medium text-sm">Customize</span>
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

"use client";

import { useState, useTransition } from "react";
import { locales, localeNames, localeFlags, type Locale } from "@/i18n/config";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Languages, Check } from "lucide-react";
import { useLocale } from "next-intl";

export function LanguageSwitcher() {
	const locale = useLocale() as Locale;
	const [isPending, startTransition] = useTransition();
	const [selectedLocale, setSelectedLocale] = useState(locale);

	const handleLanguageChange = (newLocale: Locale) => {
		startTransition(() => {
			// Set cookie for locale persistence
			document.cookie = `locale=${newLocale};path=/;max-age=${60 * 60 * 24 * 365}`;
			setSelectedLocale(newLocale);

			// Reload the page to apply new locale
			window.location.reload();
		});
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					size="sm"
					className="gap-2 h-9 px-3 rounded-full border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-colors"
					disabled={isPending}
				>
					<span className="text-lg">{localeFlags[selectedLocale]}</span>
					<span className="hidden sm:inline-block font-medium text-sm">
						{localeNames[selectedLocale]}
					</span>
					<Languages className="h-3.5 w-3.5 opacity-60" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="end"
				className="w-[180px] rounded-xl border-border/50"
			>
				{locales.map((loc) => (
					<DropdownMenuItem
						key={loc}
						onClick={() => handleLanguageChange(loc)}
						className="cursor-pointer rounded-lg py-2.5 px-3 focus:bg-primary/10"
					>
						<span className="flex items-center gap-3 flex-1">
							<span className="text-lg">{localeFlags[loc]}</span>
							<span className="font-medium text-sm">{localeNames[loc]}</span>
						</span>
						{selectedLocale === loc && (
							<Check className="h-4 w-4 text-primary" />
						)}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

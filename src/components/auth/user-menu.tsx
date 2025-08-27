"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/auth-context";
import { User, Settings, LogOut, ChevronDown, Languages, Moon, Sun } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useTheme } from "next-themes";
import { useI18n } from "@/hooks/use-i18n";

export function UserMenu() {
	const [open, setOpen] = useState(false);
	const { user, logout } = useAuth();
	const router = useRouter();
	const t = useTranslations("common");
	const { theme, setTheme } = useTheme();
	const { locale, changeLocale, locales } = useI18n();
	const [showLanguages, setShowLanguages] = useState(false);

	if (!user) return null;

	const handleLogout = async () => {
		await logout();
		setOpen(false);
		router.push("/");
	};

	const getUserInitials = () => {
		if (user.firstName && user.lastName) {
			return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
		}
		return user.email[0].toUpperCase();
	};

	const getDisplayName = () => {
		if (user.firstName && user.lastName) {
			return `${user.firstName} ${user.lastName}`;
		}
		if (user.firstName) {
			return user.firstName;
		}
		return user.email;
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button variant="ghost" className="h-8 gap-2 px-2 hover:bg-muted/50">
					<Avatar className="h-6 w-6">
						<AvatarImage src={user.avatarUrl || ""} alt={getDisplayName()} />
						<AvatarFallback className="text-xs">
							{getUserInitials()}
						</AvatarFallback>
					</Avatar>
					<span className="hidden md:inline text-sm font-medium">
						{getDisplayName()}
					</span>
					<ChevronDown className="h-3 w-3" />
				</Button>
			</PopoverTrigger>
			<PopoverContent align="end" className="w-56 p-2" sideOffset={8}>
				<div className="flex items-center gap-3 p-2">
					<Avatar className="h-8 w-8">
						<AvatarImage src={user.avatarUrl || ""} alt={getDisplayName()} />
						<AvatarFallback>{getUserInitials()}</AvatarFallback>
					</Avatar>
					<div className="flex-1 min-w-0">
						<p className="text-sm font-medium truncate">{getDisplayName()}</p>
						<p className="text-xs text-muted-foreground truncate">
							{user.email}
						</p>
					</div>
				</div>

				<Separator className="my-2" />

				<div className="space-y-1">
					<Button
						variant="ghost"
						className="w-full justify-start h-8 text-sm font-normal"
						onClick={() => {
							setOpen(false);
							router.push("/profile");
						}}
					>
						<User className="mr-2 h-4 w-4" />
						{t("profile")}
					</Button>

					<Button
						variant="ghost"
						className="w-full justify-start h-8 text-sm font-normal"
						onClick={() => {
							setOpen(false);
							router.push("/settings");
						}}
					>
						<Settings className="mr-2 h-4 w-4" />
						{t("settings")}
					</Button>
				</div>

				<Separator className="my-2" />

				<div className="space-y-1">
					{/* Language Selector */}
					<div className="relative">
						<Button
							variant="ghost"
							className="w-full justify-start h-8 text-sm font-normal"
							onClick={() => setShowLanguages(!showLanguages)}
						>
							<Languages className="mr-2 h-4 w-4" />
							<span className="flex-1 text-left">
								{locale === 'uz' ? "O'zbek" : locale === 'ru' ? 'Русский' : 'English'}
							</span>
							<ChevronDown className={`h-3 w-3 transition-transform ${showLanguages ? 'rotate-180' : ''}`} />
						</Button>
						{showLanguages && (
							<div className="ml-6 mt-1 space-y-1">
								<Button
									variant="ghost"
									className="w-full justify-start h-7 text-xs font-normal"
									onClick={() => {
										changeLocale('uz');
										setShowLanguages(false);
									}}
								>
									🇺🇿 O'zbekcha
								</Button>
								<Button
									variant="ghost"
									className="w-full justify-start h-7 text-xs font-normal"
									onClick={() => {
										changeLocale('ru');
										setShowLanguages(false);
									}}
								>
									🇷🇺 Русский
								</Button>
								<Button
									variant="ghost"
									className="w-full justify-start h-7 text-xs font-normal"
									onClick={() => {
										changeLocale('en');
										setShowLanguages(false);
									}}
								>
									🇬🇧 English
								</Button>
							</div>
						)}
					</div>

					{/* Theme Toggle */}
					<Button
						variant="ghost"
						className="w-full justify-start h-8 text-sm font-normal"
						onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
					>
						{theme === "dark" ? (
							<Moon className="mr-2 h-4 w-4" />
						) : (
							<Sun className="mr-2 h-4 w-4" />
						)}
						{theme === "dark" ? t("lightMode") : t("darkMode")}
					</Button>
				</div>

				<Separator className="my-2" />

				<Button
					variant="ghost"
					className="w-full justify-start h-8 text-sm font-normal text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
					onClick={handleLogout}
				>
					<LogOut className="mr-2 h-4 w-4" />
					{t("logout")}
				</Button>
			</PopoverContent>
		</Popover>
	);
}

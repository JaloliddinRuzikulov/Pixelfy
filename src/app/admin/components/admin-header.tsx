"use client";

import { useState } from "react";
import { User } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Search,
	Bell,
	Sun,
	Moon,
	Settings,
	HelpCircle,
	LogOut,
	User as UserIcon,
	Command,
	Zap,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

interface AdminHeaderProps {
	user: User;
}

export default function AdminHeader({ user }: AdminHeaderProps) {
	const { theme, setTheme } = useTheme();
	const [searchOpen, setSearchOpen] = useState(false);
	const [notifications] = useState([
		{
			id: 1,
			title: "Yangi foydalanuvchi",
			message: "John Doe ro'yxatdan o'tdi",
			time: "5 daqiqa oldin",
			unread: true,
		},
		{
			id: 2,
			title: "Tizim yangilanishi",
			message: "v2.5.0 versiyasi tayyor",
			time: "1 soat oldin",
			unread: true,
		},
		{
			id: 3,
			title: "Xotira ogohlantirishi",
			message: "80% xotira band",
			time: "3 soat oldin",
			unread: false,
		},
	]);

	const userInitials =
		`${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() ||
		user.email[0].toUpperCase();
	const unreadCount = notifications.filter((n) => n.unread).length;

	return (
		<>
			<header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50">
				<div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
					{/* Search bar */}
					<div className="flex-1 max-w-2xl mr-4">
						<Button
							variant="outline"
							className="w-full max-w-sm flex items-center justify-start gap-2 text-sm text-muted-foreground h-9 px-3"
							onClick={() => setSearchOpen(true)}
						>
							<Search className="h-4 w-4 shrink-0" />
							<span className="flex-1 text-left hidden sm:inline">
								Qidirish...
							</span>
							<span className="flex-1 text-left sm:hidden">Qidirish</span>
							<kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex ml-auto">
								<span className="text-xs">⌘</span>K
							</kbd>
						</Button>
					</div>

					{/* Right side actions */}
					<div className="flex items-center gap-2">
						{/* Quick actions */}
						<Button
							variant="ghost"
							size="icon"
							className="relative"
							onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
						>
							{theme === "dark" ? (
								<Sun className="h-4 w-4" />
							) : (
								<Moon className="h-4 w-4" />
							)}
						</Button>

						{/* Notifications */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="icon" className="relative">
									<Bell className="h-4 w-4" />
									{unreadCount > 0 && (
										<span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
											{unreadCount}
										</span>
									)}
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-80">
								<DropdownMenuLabel className="flex items-center justify-between">
									<span>Xabarnomalar</span>
									<Badge variant="secondary">{unreadCount} yangi</Badge>
								</DropdownMenuLabel>
								<DropdownMenuSeparator />
								{notifications.map((notification) => (
									<DropdownMenuItem
										key={notification.id}
										className="flex flex-col items-start gap-1 p-3"
									>
										<div className="flex items-start justify-between w-full">
											<div className="flex-1">
												<p className="text-sm font-medium flex items-center gap-2">
													{notification.title}
													{notification.unread && (
														<span className="h-2 w-2 rounded-full bg-blue-500" />
													)}
												</p>
												<p className="text-xs text-muted-foreground mt-0.5">
													{notification.message}
												</p>
											</div>
										</div>
										<span className="text-xs text-muted-foreground">
											{notification.time}
										</span>
									</DropdownMenuItem>
								))}
								<DropdownMenuSeparator />
								<DropdownMenuItem className="justify-center">
									<Link
										href="/admin/notifications"
										className="text-sm text-blue-600 dark:text-blue-400"
									>
										Barcha xabarnomalar
									</Link>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>

						{/* User menu */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									className="relative h-9 w-9 rounded-full"
								>
									<Avatar className="h-9 w-9">
										<AvatarImage
											src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`}
										/>
										<AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs">
											{userInitials}
										</AvatarFallback>
									</Avatar>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-56">
								<DropdownMenuLabel className="font-normal">
									<div className="flex flex-col space-y-1">
										<p className="text-sm font-medium leading-none">
											{user.firstName} {user.lastName}
										</p>
										<p className="text-xs leading-none text-muted-foreground">
											{user.email}
										</p>
									</div>
								</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuItem>
									<UserIcon className="mr-2 h-4 w-4" />
									<span>Profil</span>
								</DropdownMenuItem>
								<DropdownMenuItem>
									<Settings className="mr-2 h-4 w-4" />
									<span>Sozlamalar</span>
								</DropdownMenuItem>
								<DropdownMenuItem>
									<HelpCircle className="mr-2 h-4 w-4" />
									<span>Yordam</span>
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem asChild>
									<Link
										href="/api/auth/logout"
										className="text-red-600 dark:text-red-400"
									>
										<LogOut className="mr-2 h-4 w-4" />
										<span>Chiqish</span>
									</Link>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			</header>

			{/* Search Dialog */}
			<Dialog open={searchOpen} onOpenChange={setSearchOpen}>
				<DialogContent className="sm:max-w-[525px]">
					<DialogHeader>
						<DialogTitle>Qidirish</DialogTitle>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="flex items-center gap-2">
							<Search className="h-4 w-4 text-muted-foreground" />
							<Input
								type="search"
								placeholder="Qidirish..."
								className="flex-1"
								autoFocus
							/>
						</div>
						<div className="space-y-2">
							<p className="text-sm font-medium text-muted-foreground">
								Tezkor harakatlar
							</p>
							<div className="space-y-1">
								<Button
									variant="ghost"
									className="w-full justify-start"
									onClick={() => {
										setSearchOpen(false);
										window.location.href = "/admin/users";
									}}
								>
									<UserIcon className="mr-2 h-4 w-4" />
									<span>Foydalanuvchilarni boshqarish</span>
								</Button>
								<Button
									variant="ghost"
									className="w-full justify-start"
									onClick={() => {
										setSearchOpen(false);
										window.location.href = "/admin/projects";
									}}
								>
									<Zap className="mr-2 h-4 w-4" />
									<span>Loyihalarni ko'rish</span>
								</Button>
								<Button
									variant="ghost"
									className="w-full justify-start"
									onClick={() => {
										setSearchOpen(false);
										window.location.href = "/admin/settings";
									}}
								>
									<Settings className="mr-2 h-4 w-4" />
									<span>Tizim sozlamalari</span>
								</Button>
							</div>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}

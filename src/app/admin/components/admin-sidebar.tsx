"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "@/lib/auth";
import { cn } from "@/lib/utils";
import {
	LayoutDashboard,
	Users,
	Video,
	Settings,
	ChartBar,
	LogOut,
	Menu,
	X,
	FileText,
	ImageIcon,
	Database,
	Terminal,
	Bell,
	Shield,
	ChevronRight,
	Home,
	Sparkles,
	Package,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

interface AdminSidebarProps {
	user: User;
}

const navigationGroups = [
	{
		title: "Asosiy",
		items: [
			{
				name: "Boshqaruv paneli",
				href: "/admin",
				icon: LayoutDashboard,
				badge: null,
			},
			{
				name: "Statistika",
				href: "/admin/analytics",
				icon: ChartBar,
				badge: null,
			},
		],
	},
	{
		title: "Boshqaruv",
		items: [
			{
				name: "Foydalanuvchilar",
				href: "/admin/users",
				icon: Users,
				badge: "12",
			},
			{
				name: "Obunalar",
				href: "/admin/subscriptions",
				icon: Package,
				badge: "Pro",
			},
			{
				name: "Loyihalar",
				href: "/admin/projects",
				icon: Video,
				badge: null,
			},
			{
				name: "Media kutubxona",
				href: "/admin/media",
				icon: ImageIcon,
				badge: null,
			},
			{
				name: "Shablonlar",
				href: "/admin/templates",
				icon: Sparkles,
				badge: "Yangi",
			},
		],
	},
	{
		title: "Tizim",
		items: [
			{
				name: "Hisobotlar",
				href: "/admin/reports",
				icon: FileText,
				badge: null,
			},
			{
				name: "Zaxira nusxa",
				href: "/admin/backup",
				icon: Database,
				badge: null,
			},
			{
				name: "Tizim jurnallari",
				href: "/admin/logs",
				icon: Terminal,
				badge: null,
			},
			{
				name: "Xabarnomalar",
				href: "/admin/notifications",
				icon: Bell,
				badge: "3",
			},
			{
				name: "Sozlamalar",
				href: "/admin/settings",
				icon: Settings,
				badge: null,
			},
		],
	},
];

export default function AdminSidebar({ user }: AdminSidebarProps) {
	const pathname = usePathname();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [collapsed, setCollapsed] = useState(false);

	const userInitials =
		`${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() ||
		user.email[0].toUpperCase();

	return (
		<TooltipProvider>
			{/* Mobile menu button */}
			<Button
				variant="ghost"
				size="icon"
				onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
				className="fixed top-4 left-4 z-50 lg:hidden"
			>
				{mobileMenuOpen ? (
					<X className="h-5 w-5" />
				) : (
					<Menu className="h-5 w-5" />
				)}
			</Button>

			{/* Desktop sidebar */}
			<div
				className={cn(
					"hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col transition-all duration-300",
					collapsed ? "lg:w-20" : "lg:w-72",
				)}
			>
				<div className="flex flex-col flex-1 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-800/50">
					{/* Logo and brand */}
					<div className="h-16 flex items-center justify-between px-6 border-b border-gray-200/50 dark:border-gray-800/50">
						{!collapsed && (
							<Link href="/admin" className="flex items-center gap-3">
								<div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
									<Shield className="h-5 w-5 text-white" />
								</div>
								<div>
									<h2 className="text-lg font-semibold text-gray-900 dark:text-white">
										Admin Panel
									</h2>
									<p className="text-xs text-gray-500 dark:text-gray-400">
										Pixelfy Control Center
									</p>
								</div>
							</Link>
						)}
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setCollapsed(!collapsed)}
							className="h-8 w-8"
						>
							<ChevronRight
								className={cn(
									"h-4 w-4 transition-transform",
									collapsed ? "" : "rotate-180",
								)}
							/>
						</Button>
					</div>

					{/* Navigation */}
					<ScrollArea className="flex-1 px-3 py-4">
						<nav className="space-y-6">
							{/* Quick actions */}
							<div className={cn("px-3", collapsed && "px-0")}>
								<Link href="/">
									<Button
										variant="outline"
										className={cn(
											"w-full justify-start gap-3 border-dashed",
											collapsed && "justify-center px-2",
										)}
									>
										<Home className="h-4 w-4" />
										{!collapsed && <span>Saytga qaytish</span>}
									</Button>
								</Link>
							</div>

							{/* Navigation groups */}
							{navigationGroups.map((group) => (
								<div key={group.title} className="space-y-1">
									{!collapsed && (
										<h3 className="px-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
											{group.title}
										</h3>
									)}
									{group.items.map((item) => {
										const isActive = pathname === item.href;
										const Icon = item.icon;

										const linkContent = (
											<Link
												key={item.name}
												href={item.href}
												className={cn(
													"group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
													isActive
														? "bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 text-blue-700 dark:text-blue-300 shadow-sm"
														: "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50",
													collapsed && "justify-center px-2",
												)}
											>
												<Icon
													className={cn(
														"flex-shrink-0 transition-colors",
														isActive
															? "text-blue-600 dark:text-blue-400"
															: "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300",
														collapsed ? "h-5 w-5" : "h-4 w-4",
													)}
												/>
												{!collapsed && (
													<>
														<span className="flex-1">{item.name}</span>
														{item.badge && (
															<span
																className={cn(
																	"ml-auto px-2 py-0.5 text-xs rounded-full",
																	item.badge === "Yangi"
																		? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
																		: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
																)}
															>
																{item.badge}
															</span>
														)}
													</>
												)}
											</Link>
										);

										if (collapsed) {
											return (
												<Tooltip key={item.name}>
													<TooltipTrigger asChild>{linkContent}</TooltipTrigger>
													<TooltipContent
														side="right"
														className="flex items-center gap-2"
													>
														<span>{item.name}</span>
														{item.badge && (
															<span
																className={cn(
																	"px-2 py-0.5 text-xs rounded-full",
																	item.badge === "Yangi"
																		? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
																		: "bg-gray-100 dark:bg-gray-800",
																)}
															>
																{item.badge}
															</span>
														)}
													</TooltipContent>
												</Tooltip>
											);
										}

										return linkContent;
									})}
								</div>
							))}
						</nav>
					</ScrollArea>

					{/* User profile */}
					<div className="border-t border-gray-200/50 dark:border-gray-800/50 p-4">
						<div
							className={cn(
								"flex items-center gap-3",
								collapsed && "justify-center",
							)}
						>
							<Avatar
								className={cn(
									"border-2 border-gray-200 dark:border-gray-700",
									collapsed ? "h-10 w-10" : "h-9 w-9",
								)}
							>
								<AvatarImage
									src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`}
								/>
								<AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs">
									{userInitials}
								</AvatarFallback>
							</Avatar>
							{!collapsed && (
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium text-gray-900 dark:text-white truncate">
										{user.firstName} {user.lastName}
									</p>
									<p className="text-xs text-gray-500 dark:text-gray-400 truncate">
										{user.email}
									</p>
								</div>
							)}
							<Tooltip>
								<TooltipTrigger asChild>
									<Link href="/api/auth/logout">
										<Button
											variant="ghost"
											size="icon"
											className="h-8 w-8 flex-shrink-0"
										>
											<LogOut className="h-4 w-4" />
										</Button>
									</Link>
								</TooltipTrigger>
								<TooltipContent>
									<span>Chiqish</span>
								</TooltipContent>
							</Tooltip>
						</div>
					</div>
				</div>
			</div>

			{/* Mobile sidebar */}
			{mobileMenuOpen && (
				<div className="lg:hidden fixed inset-0 z-40 flex">
					<div
						className="fixed inset-0 bg-black/30 backdrop-blur-sm"
						onClick={() => setMobileMenuOpen(false)}
					/>
					<div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-gray-900">
						<div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-800">
							<Link href="/admin" className="flex items-center gap-3">
								<div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
									<Shield className="h-5 w-5 text-white" />
								</div>
								<span className="text-lg font-semibold text-gray-900 dark:text-white">
									Admin Panel
								</span>
							</Link>
						</div>
						<ScrollArea className="flex-1 px-3 py-4">
							<nav className="space-y-6">
								<div className="px-3">
									<Link href="/" onClick={() => setMobileMenuOpen(false)}>
										<Button
											variant="outline"
											className="w-full justify-start gap-3 border-dashed"
										>
											<Home className="h-4 w-4" />
											<span>Saytga qaytish</span>
										</Button>
									</Link>
								</div>
								{navigationGroups.map((group) => (
									<div key={group.title} className="space-y-1">
										<h3 className="px-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
											{group.title}
										</h3>
										{group.items.map((item) => {
											const isActive = pathname === item.href;
											const Icon = item.icon;
											return (
												<Link
													key={item.name}
													href={item.href}
													onClick={() => setMobileMenuOpen(false)}
													className={cn(
														"group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
														isActive
															? "bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 text-blue-700 dark:text-blue-300"
															: "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50",
													)}
												>
													<Icon
														className={cn(
															"h-4 w-4",
															isActive
																? "text-blue-600 dark:text-blue-400"
																: "text-gray-400 dark:text-gray-500",
														)}
													/>
													<span className="flex-1">{item.name}</span>
													{item.badge && (
														<span
															className={cn(
																"ml-auto px-2 py-0.5 text-xs rounded-full",
																item.badge === "Yangi"
																	? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
																	: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
															)}
														>
															{item.badge}
														</span>
													)}
												</Link>
											);
										})}
									</div>
								))}
							</nav>
						</ScrollArea>
						<div className="border-t border-gray-200 dark:border-gray-800 p-4">
							<div className="flex items-center gap-3">
								<Avatar className="h-10 w-10 border-2 border-gray-200 dark:border-gray-700">
									<AvatarImage
										src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`}
									/>
									<AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
										{userInitials}
									</AvatarFallback>
								</Avatar>
								<div className="flex-1">
									<p className="text-sm font-medium text-gray-900 dark:text-white">
										{user.firstName} {user.lastName}
									</p>
									<p className="text-xs text-gray-500 dark:text-gray-400">
										{user.email}
									</p>
								</div>
								<Link href="/api/auth/logout">
									<Button variant="ghost" size="icon">
										<LogOut className="h-4 w-4" />
									</Button>
								</Link>
							</div>
						</div>
					</div>
				</div>
			)}
		</TooltipProvider>
	);
}

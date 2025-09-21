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
	Download,
	Terminal,
	Bell,
} from "lucide-react";
import { useState } from "react";

interface AdminNavigationProps {
	user: User;
}

const navigationItems = [
	{
		name: "Boshqaruv paneli",
		href: "/admin",
		icon: LayoutDashboard,
	},
	{
		name: "Foydalanuvchilar",
		href: "/admin/users",
		icon: Users,
	},
	{
		name: "Loyihalar",
		href: "/admin/projects",
		icon: Video,
	},
	{
		name: "Media kutubxona",
		href: "/admin/media",
		icon: ImageIcon,
	},
	{
		name: "Statistika",
		href: "/admin/analytics",
		icon: ChartBar,
	},
	{
		name: "Hisobotlar",
		href: "/admin/reports",
		icon: FileText,
	},
	{
		name: "Zaxira nusxa",
		href: "/admin/backup",
		icon: Database,
	},
	{
		name: "Tizim jurnallari",
		href: "/admin/logs",
		icon: Terminal,
	},
	{
		name: "Xabarnomalar",
		href: "/admin/notifications",
		icon: Bell,
	},
	{
		name: "Sozlamalar",
		href: "/admin/settings",
		icon: Settings,
	},
];

export default function AdminNavigation({ user }: AdminNavigationProps) {
	const pathname = usePathname();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	return (
		<>
			{/* Mobile menu button */}
			<div className="lg:hidden fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-50">
				<div className="flex items-center justify-between p-4">
					<div className="flex items-center">
						<button
							onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
							className="p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700"
						>
							{mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
						</button>
						<span className="ml-3 text-lg font-semibold text-gray-900 dark:text-white">
							Admin Panel
						</span>
					</div>
					<Link
						href="/"
						className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
					>
						Saytga qaytish
					</Link>
				</div>
			</div>

			{/* Desktop sidebar */}
			<div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col z-40">
				<div className="flex flex-col flex-1 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
					<div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
						<div className="flex items-center flex-shrink-0 px-4">
							<span className="text-2xl font-bold text-gray-900 dark:text-white">
								Admin Panel
							</span>
						</div>
						<nav className="mt-8 flex-1 px-2 space-y-1">
							{navigationItems.map((item) => {
								const isActive = pathname === item.href;
								return (
									<Link
										key={item.name}
										href={item.href}
										className={cn(
											"group flex items-center px-2 py-2 text-sm font-medium rounded-md",
											isActive
												? "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white"
												: "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white",
										)}
									>
										<item.icon
											className={cn(
												"mr-3 h-5 w-5",
												isActive
													? "text-gray-900 dark:text-white"
													: "text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300",
											)}
										/>
										{item.name}
									</Link>
								);
							})}
						</nav>
					</div>
					<div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
						<div className="flex items-center w-full">
							<div className="ml-3 flex-1">
								<p className="text-sm font-medium text-gray-700 dark:text-gray-300">
									{user.firstName} {user.lastName}
								</p>
								<p className="text-xs font-medium text-gray-500 dark:text-gray-400">
									Administrator
								</p>
							</div>
							<Link
								href="/api/auth/logout"
								className="ml-auto p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
							>
								<LogOut size={20} />
							</Link>
						</div>
					</div>
				</div>
			</div>

			{/* Mobile sidebar */}
			{mobileMenuOpen && (
				<div className="lg:hidden fixed inset-0 z-40 flex">
					<div
						className="fixed inset-0 bg-gray-600 bg-opacity-75"
						onClick={() => setMobileMenuOpen(false)}
					/>
					<div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-gray-800">
						<div className="flex-1 h-0 pt-20 pb-4 overflow-y-auto">
							<nav className="px-2 space-y-1">
								{navigationItems.map((item) => {
									const isActive = pathname === item.href;
									return (
										<Link
											key={item.name}
											href={item.href}
											onClick={() => setMobileMenuOpen(false)}
											className={cn(
												"group flex items-center px-2 py-2 text-base font-medium rounded-md",
												isActive
													? "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white"
													: "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white",
											)}
										>
											<item.icon
												className={cn(
													"mr-4 h-6 w-6",
													isActive
														? "text-gray-900 dark:text-white"
														: "text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300",
												)}
											/>
											{item.name}
										</Link>
									);
								})}
							</nav>
						</div>
						<div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
							<div className="flex items-center w-full">
								<div className="ml-3 flex-1">
									<p className="text-base font-medium text-gray-700 dark:text-gray-300">
										{user.firstName} {user.lastName}
									</p>
									<p className="text-sm font-medium text-gray-500 dark:text-gray-400">
										Administrator
									</p>
								</div>
								<Link
									href="/api/auth/logout"
									className="ml-auto p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
								>
									<LogOut size={20} />
								</Link>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
}

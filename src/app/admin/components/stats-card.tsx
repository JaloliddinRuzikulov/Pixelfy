import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
	title: string;
	value: number | string;
	change?: number;
	icon: LucideIcon;
	color?: string;
}

export default function StatsCard({
	title,
	value,
	change,
	icon: Icon,
	color = "bg-blue-500",
}: StatsCardProps) {
	return (
		<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
			<div className="flex items-center justify-between">
				<div>
					<p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
					<p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
						{value}
					</p>
					{change !== undefined && (
						<p
							className={cn(
								"text-sm mt-1",
								change >= 0 ? "text-green-600" : "text-red-600",
							)}
						>
							{change >= 0 ? "+" : ""}
							{change}%
						</p>
					)}
				</div>
				<div className={cn("p-3 rounded-full", color)}>
					<Icon className="h-6 w-6 text-white" />
				</div>
			</div>
		</div>
	);
}

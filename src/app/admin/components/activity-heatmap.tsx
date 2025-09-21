"use client";

import { useEffect, useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

interface DayActivity {
	date: Date;
	count: number;
	level: 0 | 1 | 2 | 3 | 4;
}

export default function ActivityHeatmap() {
	const [activities, setActivities] = useState<DayActivity[]>([]);
	const [loading, setLoading] = useState(true);
	const [hoveredDay, setHoveredDay] = useState<DayActivity | null>(null);

	useEffect(() => {
		generateHeatmapData();
	}, []);

	const generateHeatmapData = async () => {
		try {
			// Fetch real activity data
			const response = await fetch("/api/admin/activities");
			let realActivities: any[] = [];

			if (response.ok) {
				const data = await response.json();
				realActivities = data.activities || [];
			}

			// Generate last 52 weeks (364 days)
			const days: DayActivity[] = [];
			const today = new Date();
			const startDate = new Date(today);
			startDate.setDate(startDate.getDate() - 363); // Go back 363 days

			// Adjust to start from Sunday
			const dayOfWeek = startDate.getDay();
			if (dayOfWeek !== 0) {
				startDate.setDate(startDate.getDate() - dayOfWeek);
			}

			// Generate all days
			for (let i = 0; i < 364; i++) {
				const date = new Date(startDate);
				date.setDate(date.getDate() + i);

				// Don't include future dates
				if (date > today) {
					break;
				}

				// Count activities for this day
				const dayActivities = realActivities.filter((a) => {
					const activityDate = new Date(a.createdAt);
					return activityDate.toDateString() === date.toDateString();
				});

				const count = dayActivities.length;
				let level: 0 | 1 | 2 | 3 | 4 = 0;

				if (count === 0) level = 0;
				else if (count <= 2) level = 1;
				else if (count <= 5) level = 2;
				else if (count <= 10) level = 3;
				else level = 4;

				days.push({ date, count, level });
			}

			setActivities(days);
		} catch (error) {
			console.error("Error loading activity data:", error);
			// Generate empty data as fallback
			generateEmptyData();
		} finally {
			setLoading(false);
		}
	};

	const generateEmptyData = () => {
		const days: DayActivity[] = [];
		const today = new Date();
		const startDate = new Date(today);
		startDate.setDate(startDate.getDate() - 363);

		const dayOfWeek = startDate.getDay();
		if (dayOfWeek !== 0) {
			startDate.setDate(startDate.getDate() - dayOfWeek);
		}

		for (let i = 0; i < 364; i++) {
			const date = new Date(startDate);
			date.setDate(date.getDate() + i);

			if (date > today) break;

			days.push({ date, count: 0, level: 0 });
		}

		setActivities(days);
	};

	const getColorClass = (level: number) => {
		switch (level) {
			case 0:
				return "bg-gray-100 dark:bg-gray-800 hover:ring-2 hover:ring-gray-300 dark:hover:ring-gray-600";
			case 1:
				return "bg-emerald-200 dark:bg-emerald-900/50 hover:ring-2 hover:ring-emerald-300";
			case 2:
				return "bg-emerald-400 dark:bg-emerald-700/50 hover:ring-2 hover:ring-emerald-400";
			case 3:
				return "bg-emerald-600 dark:bg-emerald-500/50 hover:ring-2 hover:ring-emerald-500";
			case 4:
				return "bg-emerald-800 dark:bg-emerald-300/50 hover:ring-2 hover:ring-emerald-600";
			default:
				return "bg-gray-100 dark:bg-gray-800";
		}
	};

	// Group activities by week (7 days per week)
	const weeks: DayActivity[][] = [];
	let currentWeek: DayActivity[] = [];

	activities.forEach((activity, index) => {
		currentWeek.push(activity);
		if (currentWeek.length === 7 || index === activities.length - 1) {
			// Pad the last week if needed
			while (currentWeek.length < 7) {
				const emptyDate = new Date();
				currentWeek.push({ date: emptyDate, count: 0, level: 0 });
			}
			weeks.push(currentWeek);
			currentWeek = [];
		}
	});

	const months = [
		"Yan",
		"Fev",
		"Mar",
		"Apr",
		"May",
		"Iyn",
		"Iyl",
		"Avg",
		"Sen",
		"Okt",
		"Noy",
		"Dek",
	];
	const weekDays = ["Yak", "", "Dush", "", "Chor", "", "Jum"];

	// Get month labels
	const getMonthLabels = () => {
		const labels: { month: string; col: number }[] = [];
		let lastMonth = -1;

		weeks.forEach((week, weekIndex) => {
			const firstDayOfWeek = week[0];
			if (firstDayOfWeek && firstDayOfWeek.date) {
				const month = firstDayOfWeek.date.getMonth();
				if (month !== lastMonth) {
					labels.push({
						month: months[month],
						col: weekIndex,
					});
					lastMonth = month;
				}
			}
		});

		return labels;
	};

	const monthLabels = getMonthLabels();

	// Calculate stats
	const totalActivities = activities.reduce((sum, day) => sum + day.count, 0);
	const activeDays = activities.filter((day) => day.count > 0).length;
	const maxActivity = Math.max(...activities.map((day) => day.count), 0);

	if (loading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Faollik xaritasi</CardTitle>
					<CardDescription>Yillik faollik ko'rinishi</CardDescription>
				</CardHeader>
				<CardContent>
					<Skeleton className="h-32 w-full" />
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Faollik xaritasi</CardTitle>
						<CardDescription>So'nggi 52 haftalik faollik</CardDescription>
					</div>
					<div className="text-right text-sm text-muted-foreground">
						<div>{totalActivities} ta faollik</div>
						<div>{activeDays} kun faol</div>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<div className="w-full overflow-x-auto">
					<div className="min-w-[800px]">
						{/* Month labels */}
						<div className="flex gap-[3px] mb-2 ml-10">
							{monthLabels.map((label, idx) => (
								<div
									key={idx}
									className="text-xs text-muted-foreground"
									style={{
										gridColumn: label.col + 1,
										marginLeft: label.col === 0 ? 0 : `${label.col * 13}px`,
									}}
								>
									{label.month}
								</div>
							))}
						</div>

						{/* Heatmap grid */}
						<div className="flex gap-1">
							{/* Week day labels */}
							<div className="flex flex-col gap-[3px] mr-2">
								{weekDays.map((day, idx) => (
									<div
										key={idx}
										className="h-[11px] text-xs text-muted-foreground flex items-center justify-end pr-1"
									>
										{day}
									</div>
								))}
							</div>

							{/* Activity grid */}
							<TooltipProvider>
								<div className="flex gap-[3px]">
									{weeks.map((week, weekIndex) => (
										<div key={weekIndex} className="flex flex-col gap-[3px]">
											{week.map((day, dayIndex) => {
												const isToday =
													day.date &&
													day.date.toDateString() === new Date().toDateString();
												const isFuture = day.date && day.date > new Date();

												if (isFuture || !day.date) {
													return (
														<div key={dayIndex} className="w-[11px] h-[11px]" />
													);
												}

												return (
													<Tooltip key={dayIndex}>
														<TooltipTrigger asChild>
															<div
																className={`
																	w-[11px] h-[11px] rounded-sm cursor-pointer transition-all
																	${getColorClass(day.level)}
																	${isToday ? "ring-2 ring-blue-500" : ""}
																`}
																onMouseEnter={() => setHoveredDay(day)}
																onMouseLeave={() => setHoveredDay(null)}
															/>
														</TooltipTrigger>
														<TooltipContent>
															<div className="text-sm">
																<div className="font-medium">
																	{day.date.toLocaleDateString("uz-UZ", {
																		weekday: "long",
																		year: "numeric",
																		month: "long",
																		day: "numeric",
																	})}
																</div>
																<div className="text-muted-foreground">
																	{day.count} ta faollik
																</div>
															</div>
														</TooltipContent>
													</Tooltip>
												);
											})}
										</div>
									))}
								</div>
							</TooltipProvider>
						</div>

						{/* Legend */}
						<div className="flex items-center gap-2 mt-4">
							<span className="text-xs text-muted-foreground">Kam</span>
							<div className="flex gap-[3px]">
								{[0, 1, 2, 3, 4].map((level) => (
									<div
										key={level}
										className={`w-[11px] h-[11px] rounded-sm ${getColorClass(level)}`}
									/>
								))}
							</div>
							<span className="text-xs text-muted-foreground">Ko'p</span>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

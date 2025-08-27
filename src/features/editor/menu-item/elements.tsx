import { Button, buttonVariants } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { dispatch } from "@designcombo/events";
import {
	ADD_LINEAL_AUDIO_BARS,
	ADD_RADIAL_AUDIO_BARS,
	ADD_WAVE_AUDIO_BARS,
	ADD_HILL_AUDIO_BARS,
} from "@designcombo/state";
import { generateId } from "@designcombo/timeline";
import { BarChart3, Zap, Sparkles, Shapes } from "lucide-react";

const OPTIONS_LINEAL_BARS = [
	{
		label: "Lineal 1",
		id: "bar_1",
		details: {
			height: 1920 / 20,
			width: 1080,
			linealBarColor: "#F3B3DC",
			lineThickness: 5,
			gapSize: 7,
			roundness: 2,
		},
	},
	{
		label: "Lineal 2",
		id: "bar_2",
		details: {
			height: 1920 / 20,
			width: 1080,
			linealBarColor: "#CBAE9A",
			lineThickness: 7,
			gapSize: 6,
			roundness: 4,
		},
	},
	{
		label: "Lineal 3",
		id: "bar_3",
		details: {
			height: 1920 / 20,
			width: 1080,
			linealBarColor: "#A687DF",
			lineThickness: 2,
			gapSize: 4,
			roundness: 2,
		},
	},
	{
		label: "Lineal 4",
		id: "bar_4",
		details: {
			height: 1920 / 20,
			width: 1080,
			linealBarColor: "#8DD2DE",
			lineThickness: 6,
			gapSize: 7,
			roundness: 2,
			placement: "under",
		},
	},
];

const OPTIONS_WAVE_BARS = [
	{
		label: "Wave 1",
		id: "wave_1",
		details: {
			height: 1920 / 20,
			width: 1080,
			offsetPixelSpeed: 100,
			lineColor: ["#EE8482", "teal"],
			lineGap: 70,
			topRoundness: 0.2,
			bottomRoundness: 0.4,
			sections: 10,
		},
	},
	{
		label: "Wave 2",
		id: "wave_2",
		details: {
			height: 1920 / 20,
			width: 1080,
			lineColor: "#EE8482",
			lines: 6,
			lineGap: 6,
			sections: 10,
			offsetPixelSpeed: -100,
		},
	},
];

const OPTIONS_HILL_BARS = [
	{
		label: "Hill 1",
		id: "hill_1",
		details: {
			height: 1920 / 20,
			width: 1080,
			fillColor: "#92E1B0",
		},
	},
	{
		label: "Hill 2",
		id: "hill_2",
		details: {
			height: 1920 / 20,
			width: 1080,
			fillColor: ["#559B59", "#466CF6", "#E54B41"],
			copies: 3,
			blendMode: "screen",
		},
	},
	{
		label: "Hill 3",
		id: "hill_3",
		details: {
			height: 1920 / 20,
			width: 1080,
			strokeColor: "#E9AB6C",
		},
	},
	{
		label: "Hill 4",
		id: "hill_4",
		details: {
			height: 1920 / 20,
			width: 1080,
			strokeColor: "rgb(100, 120, 250, 0.2)",
			strokeWidth: 2,
			fillColor: "rgb(70, 90, 200, 0.2)",
			copies: 5,
		},
	},
];

export const Elements = () => {
	const handleAddLinealAudioBars = (details: any) => {
		dispatch(ADD_LINEAL_AUDIO_BARS, {
			payload: {
				id: generateId(),
				type: "linealAudioBars",
				details,
				display: { from: 0, to: 10000 },
			},
			options: {},
		});
	};

	const handleAddWaveAudioBars = (details: any) => {
		dispatch(ADD_WAVE_AUDIO_BARS, {
			payload: {
				id: generateId(),
				type: "waveAudioBars",
				details,
				display: { from: 0, to: 10000 },
			},
			options: {},
		});
	};

	const handleAddHillAudioBars = (details: any) => {
		dispatch(ADD_HILL_AUDIO_BARS, {
			payload: {
				id: generateId(),
				type: "hillAudioBars",
				details,
				display: { from: 0, to: 10000 },
			},
			options: {},
		});
	};

	return (
		<div className="flex flex-1 flex-col">
			<div className="flex h-12 flex-none items-center px-4 text-sm font-medium border-b border-border/20">
				Shapes & Elements
			</div>

			<ScrollArea className="flex-1">
				<div className="p-4 space-y-4">
					{/* Audio Visualizers */}
					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<BarChart3 className="w-4 h-4 text-primary" />
							<span className="text-sm font-medium">Audio Visualizers</span>
						</div>
						<div className="grid grid-cols-2 gap-2">
							{OPTIONS_LINEAL_BARS.slice(0, 4).map((bar) => (
								<div
									key={bar.id}
									className="cursor-pointer p-2.5 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/10 hover:bg-primary/10"
									onClick={() => handleAddLinealAudioBars(bar.details)}
								>
									<div className="flex items-center justify-center h-12 mb-2">
										<div className="flex gap-0.5">
											{[...Array(8)].map((_, i) => (
												<div
													key={i}
													className="w-1 bg-primary/60 rounded-full"
													style={{ height: `${Math.random() * 20 + 8}px` }}
												/>
											))}
										</div>
									</div>
									<div className="text-xs text-center font-medium">
										{bar.label}
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Wave Visualizers */}
					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<Zap className="w-4 h-4 text-primary" />
							<span className="text-sm font-medium">Wave Effects</span>
						</div>
						<div className="grid grid-cols-2 gap-2">
							{OPTIONS_WAVE_BARS.map((bar) => (
								<div
									key={bar.id}
									className="cursor-pointer p-2.5 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-lg border border-blue-200/50 dark:border-blue-800/30 hover:bg-blue-50/80 dark:hover:bg-blue-950/30"
									onClick={() => handleAddWaveAudioBars(bar.details)}
								>
									<div className="flex items-center justify-center h-12 mb-2">
										<svg className="w-8 h-6" viewBox="0 0 40 24">
											<path
												d="M2 12 Q10 4 20 12 T38 12"
												stroke="currentColor"
												strokeWidth="2"
												fill="none"
												className="text-blue-500"
											/>
										</svg>
									</div>
									<div className="text-xs text-center font-medium">
										{bar.label}
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Hill Visualizers */}
					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<Sparkles className="w-4 h-4 text-primary" />
							<span className="text-sm font-medium">Hill Effects</span>
						</div>
						<div className="grid grid-cols-2 gap-2">
							{OPTIONS_HILL_BARS.map((bar) => (
								<div
									key={bar.id}
									className="cursor-pointer p-2.5 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border border-green-200/50 dark:border-green-800/30 hover:bg-green-50/80 dark:hover:bg-green-950/30"
									onClick={() => handleAddHillAudioBars(bar.details)}
								>
									<div className="flex items-center justify-center h-12 mb-2">
										<svg className="w-10 h-6" viewBox="0 0 40 24">
											<path
												d="M2 22 Q10 8 20 12 Q30 16 38 10 L38 22 Z"
												fill="currentColor"
												className="text-green-400/60"
											/>
										</svg>
									</div>
									<div className="text-xs text-center font-medium">
										{bar.label}
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Placeholder sections */}
					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<Shapes className="w-4 h-4 text-primary" />
							<span className="text-sm font-medium">Basic Shapes</span>
						</div>
						<div className="flex flex-col items-center justify-center py-8 text-center">
							<div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
								<Shapes className="w-8 h-8 text-muted-foreground" />
							</div>
							<p className="text-sm text-muted-foreground mb-2">
								Shapes coming soon
							</p>
							<p className="text-xs text-muted-foreground/70">
								Basic shapes and elements will be available soon
							</p>
						</div>
					</div>
				</div>
			</ScrollArea>
		</div>
	);
};

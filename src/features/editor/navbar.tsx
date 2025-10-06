import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { dispatch } from "@designcombo/events";
import { HISTORY_UNDO, HISTORY_REDO, DESIGN_RESIZE } from "@designcombo/state";
import { Icons } from "@/components/shared/icons";
import {
	Download,
	ProportionsIcon,
	Palette,
	Menu,
	Home,
	Plus,
	HelpCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type StateManager from "@designcombo/state";
import { generateId } from "@designcombo/timeline";
import type { IDesign } from "@designcombo/types";
import { useDownloadState } from "./store/use-download-state";
import DownloadProgressModal from "./download-progress-modal";
import AutosizeInput from "@/components/ui/autosize-input";
import { debounce } from "lodash";
import {
	useIsLargeScreen,
	useIsMediumScreen,
	useIsSmallScreen,
} from "@/hooks/use-media-query";

import { UserMenu } from "@/components/auth/user-menu";
import { useAuth } from "@/contexts/auth-context";
import useStore from "./store/use-store";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SubscriptionStatus } from "@/components/subscription/subscription-status";

export default function Navbar({
	user,
	stateManager,
	setProjectName,
	projectName,
}: {
	user: any | null;
	stateManager: StateManager;
	setProjectName: (name: string) => void;
	projectName: string;
}) {
	const { isAuthenticated } = useAuth();
	const [title, setTitle] = useState(projectName);
	const isLargeScreen = useIsLargeScreen();
	const isMediumScreen = useIsMediumScreen();
	const isSmallScreen = useIsSmallScreen();

	const handleUndo = () => {
		dispatch(HISTORY_UNDO);
	};

	const handleRedo = () => {
		dispatch(HISTORY_REDO);
	};

	const handleCreateProject = async () => {};

	// Create a debounced function for setting the project name
	const debouncedSetProjectName = useCallback(
		debounce((name: string) => {
			console.log("Debounced setProjectName:", name);
			setProjectName(name);
		}, 2000), // 2 seconds delay
		[],
	);

	// Update the debounced function whenever the title changes
	useEffect(() => {
		debouncedSetProjectName(title);
	}, [title, debouncedSetProjectName]);

	const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setTitle(e.target.value);
	};

	return (
		<div
			style={{
				display: "grid",
				gridTemplateColumns: isLargeScreen ? "320px 1fr 320px" : "1fr 1fr 1fr",
			}}
			className="bg-background/95 backdrop-blur-sm pointer-events-none flex h-14 items-center border-b-2 border-border px-4 gap-3"
		>
			<DownloadProgressModal />

			<div className="flex items-center gap-2">
				<NavigationMenu />

				<div className=" pointer-events-auto flex h-10 items-center px-1.5">
					<Button
						onClick={handleUndo}
						className="text-muted-foreground"
						variant="ghost"
						size="icon"
					>
						<Icons.undo width={20} />
					</Button>
					<Button
						onClick={handleRedo}
						className="text-muted-foreground"
						variant="ghost"
						size="icon"
					>
						<Icons.redo width={20} />
					</Button>
				</div>
			</div>

			<div className="flex h-11 items-center justify-center gap-2">
				{!isSmallScreen && (
					<div className=" pointer-events-auto flex h-10 items-center gap-2 rounded-md px-2.5 text-muted-foreground">
						<AutosizeInput
							name="title"
							value={title}
							onChange={handleTitleChange}
							width={200}
							inputClassName="border-none outline-none px-1 bg-background text-sm font-semibold font-heading text-foreground"
						/>
					</div>
				)}
				<BackgroundColorPicker />
				<ResizeVideo />
			</div>

			<div className="flex h-11 items-center justify-end gap-2">
				<div className="pointer-events-auto flex h-10 items-center gap-2 rounded-md px-2.5">
					<DownloadPopover stateManager={stateManager} />
					{isAuthenticated && <SubscriptionStatus compact />}
					{isAuthenticated && <UserMenu />}
					{!isAuthenticated && (
						<Button asChild size="sm" variant="outline">
							<Link href="/auth/login">Sign In</Link>
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}

const DownloadPopover = ({ stateManager }: { stateManager: StateManager }) => {
	const t = useTranslations("editor");
	const isMediumScreen = useIsMediumScreen();
	const { exporting, actions } = useDownloadState();

	const handleExport = () => {
		// Prevent multiple exports
		if (exporting) {
			console.log("Export already in progress, ignoring click");
			return;
		}

		const state = stateManager.getState();

		const data: IDesign = {
			id: generateId(),
			...state,
			fps: 30,
		} as IDesign;

		actions.setState({ payload: data });
		actions.setExportType("mp4");
		actions.startExport();
	};

	return (
		<Button
			onClick={handleExport}
			disabled={exporting}
			className="flex h-7 gap-1 border border-border"
			size={isMediumScreen ? "sm" : "icon"}
		>
			<Download width={18} />{" "}
			<span className="hidden md:block">
				{exporting ? "Eksport qilinmoqda..." : t("exportVideo")}
			</span>
		</Button>
	);
};

// Resize video options with common aspect ratios
const RESIZE_OPTIONS = [
	{
		label: "16:9",
		icon: "landscape",
		description: "YouTube, TV",
		value: {
			width: 1920,
			height: 1080,
			name: "16:9",
		},
	},
	{
		label: "9:16",
		icon: "portrait",
		description: "TikTok, Shorts",
		value: {
			width: 1080,
			height: 1920,
			name: "9:16",
		},
	},
	{
		label: "1:1",
		icon: "square",
		description: "Instagram",
		value: {
			width: 1080,
			height: 1080,
			name: "1:1",
		},
	},
	{
		label: "4:3",
		icon: "landscape",
		description: "Standard",
		value: {
			width: 1440,
			height: 1080,
			name: "4:3",
		},
	},
	{
		label: "21:9",
		icon: "landscape",
		description: "Ultrawide",
		value: {
			width: 2560,
			height: 1080,
			name: "21:9",
		},
	},
];

const NavigationMenu = () => {
	const t = useTranslations("editor");
	const router = useRouter();

	const handleGoHome = () => {
		router.push("/projects");
	};

	const handleNewProject = () => {
		// Create new project and redirect
		const newProject = {
			id: `project_${Date.now()}`,
			name: t("untitledVideo"),
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		// Add to projects list
		const existingProjects = localStorage.getItem("video-editor-projects");
		const projects = existingProjects ? JSON.parse(existingProjects) : [];
		projects.unshift(newProject);
		localStorage.setItem("video-editor-projects", JSON.stringify(projects));

		// Redirect to new project
		router.push(`/editor?projectId=${newProject.id}`);
	};

	const handleHelp = () => {
		// You can implement help functionality here
		window.open("https://github.com/anthropics/claude-code/issues", "_blank");
	};

	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="pointer-events-auto h-11 w-11 text-muted-foreground hover:text-foreground"
				>
					<Menu className="h-5 w-5" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="start"
				className="w-56 z-[9999] bg-background border shadow-none"
				sideOffset={5}
			>
				<DropdownMenuItem onClick={handleGoHome} className="cursor-pointer">
					<Home className="mr-2 h-4 w-4" />
					{t("backToProjects")}
				</DropdownMenuItem>
				<DropdownMenuItem onClick={handleNewProject} className="cursor-pointer">
					<Plus className="mr-2 h-4 w-4" />
					{t("newProject")}
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={handleHelp} className="cursor-pointer">
					<HelpCircle className="mr-2 h-4 w-4" />
					{t("help")}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

const BackgroundColorPicker = () => {
	const t = useTranslations("editor");
	const { background, setBackground } = useStore();
	const [open, setOpen] = useState(false);
	const [color, setColor] = useState(background.value);

	const handleColorChange = (newColor: string) => {
		setColor(newColor);
		setBackground({ type: "color", value: newColor });
	};

	const presetColors = [
		"#000000",
		"#FFFFFF",
		"#FF0000",
		"#00FF00",
		"#0000FF",
		"#FFFF00",
		"#FF00FF",
		"#00FFFF",
		"#808080",
		"#FFA500",
		"#800080",
		"#FFC0CB",
		"#A52A2A",
		"#FFD700",
		"#C0C0C0",
	];

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					className="pointer-events-auto h-7 gap-2"
					variant="outline"
					size="sm"
				>
					<div
						className="w-4 h-4 rounded border border-border"
						style={{ backgroundColor: color }}
					/>
					<span className="hidden md:block">{t("backgroundColor")}</span>
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-72 p-4">
				<div className="space-y-4">
					<div>
						<label className="text-sm font-medium mb-2 block">
							{t("customColor")}
						</label>
						<div className="flex gap-2">
							<Input
								type="color"
								value={color}
								onChange={(e) => handleColorChange(e.target.value)}
								className="w-16 h-9 p-1 cursor-pointer"
							/>
							<Input
								type="text"
								value={color}
								onChange={(e) => handleColorChange(e.target.value)}
								className="flex-1 h-9"
								placeholder="#000000"
							/>
						</div>
					</div>
					<div>
						<label className="text-sm font-medium mb-2 block">
							{t("presetColors")}
						</label>
						<div className="grid grid-cols-5 gap-2">
							{presetColors.map((presetColor) => (
								<button
									key={presetColor}
									onClick={() => handleColorChange(presetColor)}
									className="w-full h-10 rounded border-2 hover:scale-110 transition-transform"
									style={{
										backgroundColor: presetColor,
										borderColor:
											color === presetColor
												? "var(--primary)"
												: "var(--border)",
									}}
									aria-label={presetColor}
								/>
							))}
						</div>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
};

const ResizeVideo = () => {
	const t = useTranslations("editor");
	const [open, setOpen] = useState(false);

	const handleResize = (options: (typeof RESIZE_OPTIONS)[0]["value"]) => {
		dispatch(DESIGN_RESIZE, {
			payload: {
				...options,
			},
		});
		setOpen(false);
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					className="pointer-events-auto h-7 gap-2"
					variant="outline"
					size="sm"
				>
					<ProportionsIcon className="h-4 w-4" />
					<span className="hidden md:block">{t("resize")}</span>
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-60 p-2">
				<div className="space-y-1">
					{RESIZE_OPTIONS.map((option) => (
						<button
							key={option.value.name}
							onClick={() => handleResize(option.value)}
							className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-left transition-colors"
						>
							<div className="flex-shrink-0">
								{option.icon === "landscape" && (
									<Icons.landscape className="w-5 h-5 text-muted-foreground" />
								)}
								{option.icon === "portrait" && (
									<Icons.portrait className="w-5 h-5 text-muted-foreground" />
								)}
								{option.icon === "square" && (
									<Icons.square className="w-5 h-5 text-muted-foreground" />
								)}
							</div>
							<div className="flex-1 min-w-0">
								<div className="font-medium text-sm">{option.label}</div>
								<div className="text-xs text-muted-foreground">
									{option.description}
								</div>
							</div>
							<div className="text-xs text-muted-foreground">
								{option.value.width}×{option.value.height}
							</div>
						</button>
					))}
				</div>
			</PopoverContent>
		</Popover>
	);
};

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";
import {
	Save,
	Download,
	Share2,
	Undo,
	Redo,
	Settings,
	HelpCircle,
	ChevronDown,
	Film,
	FileText,
	Upload,
	FolderOpen,
	Copy,
	Scissors,
	Clipboard,
	Eye,
	EyeOff,
	Grid,
	Zap,
	Home,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface ModernNavbarProps {
	projectName: string;
	setProjectName: (name: string) => void;
	projectId: string | null;
	stateManager: any;
}

export default function ModernNavbar({
	projectName,
	setProjectName,
	projectId,
	stateManager,
}: ModernNavbarProps) {
	const router = useRouter();
	const [isEditing, setIsEditing] = useState(false);

	const handleSave = () => {
		// Save logic here
		toast.success("Project saved successfully!");
	};

	const handleExport = () => {
		// Export logic here
		toast.info("Exporting video...");
	};

	const handleUndo = () => {
		// Undo logic
		toast.info("Undo");
	};

	const handleRedo = () => {
		// Redo logic
		toast.info("Redo");
	};

	return (
		<div className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
			<div className="flex h-14 items-center px-4 gap-4">
				{/* Logo & Home */}
				<div className="flex items-center gap-2">
					<Button
						variant="ghost"
						size="icon"
						className="text-slate-400 hover:text-white hover:bg-slate-800"
						onClick={() => router.push("/")}
					>
						<Home className="h-5 w-5" />
					</Button>
					<div className="flex items-center gap-2">
						<Film className="h-5 w-5 text-blue-500" />
						<span className="font-semibold text-white">Pixelfy</span>
					</div>
				</div>

				<div className="h-8 w-px bg-slate-700" />

				{/* File Menu */}
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							className="text-slate-300 hover:text-white hover:bg-slate-800"
						>
							File
							<ChevronDown className="ml-1 h-3 w-3" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent className="w-56 bg-slate-900 border-slate-800">
						<DropdownMenuItem className="text-slate-300 hover:text-white hover:bg-slate-800">
							<FileText className="mr-2 h-4 w-4" />
							New Project
							<DropdownMenuShortcut>⌘N</DropdownMenuShortcut>
						</DropdownMenuItem>
						<DropdownMenuItem className="text-slate-300 hover:text-white hover:bg-slate-800">
							<FolderOpen className="mr-2 h-4 w-4" />
							Open Project
							<DropdownMenuShortcut>⌘O</DropdownMenuShortcut>
						</DropdownMenuItem>
						<DropdownMenuItem
							className="text-slate-300 hover:text-white hover:bg-slate-800"
							onClick={handleSave}
						>
							<Save className="mr-2 h-4 w-4" />
							Save
							<DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
						</DropdownMenuItem>
						<DropdownMenuSeparator className="bg-slate-800" />
						<DropdownMenuItem className="text-slate-300 hover:text-white hover:bg-slate-800">
							<Upload className="mr-2 h-4 w-4" />
							Import Media
							<DropdownMenuShortcut>⌘I</DropdownMenuShortcut>
						</DropdownMenuItem>
						<DropdownMenuItem
							className="text-slate-300 hover:text-white hover:bg-slate-800"
							onClick={handleExport}
						>
							<Download className="mr-2 h-4 w-4" />
							Export Video
							<DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>

				{/* Edit Menu */}
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							className="text-slate-300 hover:text-white hover:bg-slate-800"
						>
							Edit
							<ChevronDown className="ml-1 h-3 w-3" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent className="w-56 bg-slate-900 border-slate-800">
						<DropdownMenuItem
							className="text-slate-300 hover:text-white hover:bg-slate-800"
							onClick={handleUndo}
						>
							<Undo className="mr-2 h-4 w-4" />
							Undo
							<DropdownMenuShortcut>⌘Z</DropdownMenuShortcut>
						</DropdownMenuItem>
						<DropdownMenuItem
							className="text-slate-300 hover:text-white hover:bg-slate-800"
							onClick={handleRedo}
						>
							<Redo className="mr-2 h-4 w-4" />
							Redo
							<DropdownMenuShortcut>⌘⇧Z</DropdownMenuShortcut>
						</DropdownMenuItem>
						<DropdownMenuSeparator className="bg-slate-800" />
						<DropdownMenuItem className="text-slate-300 hover:text-white hover:bg-slate-800">
							<Scissors className="mr-2 h-4 w-4" />
							Cut
							<DropdownMenuShortcut>⌘X</DropdownMenuShortcut>
						</DropdownMenuItem>
						<DropdownMenuItem className="text-slate-300 hover:text-white hover:bg-slate-800">
							<Copy className="mr-2 h-4 w-4" />
							Copy
							<DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
						</DropdownMenuItem>
						<DropdownMenuItem className="text-slate-300 hover:text-white hover:bg-slate-800">
							<Clipboard className="mr-2 h-4 w-4" />
							Paste
							<DropdownMenuShortcut>⌘V</DropdownMenuShortcut>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>

				{/* View Menu */}
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							className="text-slate-300 hover:text-white hover:bg-slate-800"
						>
							View
							<ChevronDown className="ml-1 h-3 w-3" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent className="w-56 bg-slate-900 border-slate-800">
						<DropdownMenuItem className="text-slate-300 hover:text-white hover:bg-slate-800">
							<Eye className="mr-2 h-4 w-4" />
							Show Guides
						</DropdownMenuItem>
						<DropdownMenuItem className="text-slate-300 hover:text-white hover:bg-slate-800">
							<Grid className="mr-2 h-4 w-4" />
							Show Grid
						</DropdownMenuItem>
						<DropdownMenuItem className="text-slate-300 hover:text-white hover:bg-slate-800">
							<EyeOff className="mr-2 h-4 w-4" />
							Hide UI
							<DropdownMenuShortcut>Tab</DropdownMenuShortcut>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>

				{/* Project Name */}
				<div className="flex-1 flex items-center justify-center">
					{isEditing ? (
						<Input
							value={projectName}
							onChange={(e) => setProjectName(e.target.value)}
							onBlur={() => setIsEditing(false)}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									setIsEditing(false);
								}
							}}
							className="w-64 bg-slate-800 border-slate-700 text-white text-center"
							autoFocus
						/>
					) : (
						<button
							onClick={() => setIsEditing(true)}
							className="text-white font-medium hover:bg-slate-800 px-4 py-1 rounded transition-colors"
						>
							{projectName}
						</button>
					)}
				</div>

				{/* Action Buttons */}
				<div className="flex items-center gap-2">
					<Button
						variant="ghost"
						size="icon"
						className="text-slate-400 hover:text-white hover:bg-slate-800"
						onClick={handleUndo}
					>
						<Undo className="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="text-slate-400 hover:text-white hover:bg-slate-800"
						onClick={handleRedo}
					>
						<Redo className="h-4 w-4" />
					</Button>

					<div className="h-8 w-px bg-slate-700 mx-2" />

					<Button
						variant="secondary"
						className="bg-slate-800 hover:bg-slate-700 text-white"
						onClick={handleSave}
					>
						<Save className="h-4 w-4 mr-2" />
						Save
					</Button>

					<Button
						className="bg-blue-600 hover:bg-blue-500 text-white"
						onClick={handleExport}
					>
						<Download className="h-4 w-4 mr-2" />
						Export
					</Button>

					<Button
						variant="ghost"
						size="icon"
						className="text-slate-400 hover:text-white hover:bg-slate-800"
					>
						<Share2 className="h-4 w-4" />
					</Button>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="text-slate-400 hover:text-white hover:bg-slate-800"
							>
								<Settings className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							align="end"
							className="w-56 bg-slate-900 border-slate-800"
						>
							<DropdownMenuLabel className="text-slate-400">
								Settings
							</DropdownMenuLabel>
							<DropdownMenuSeparator className="bg-slate-800" />
							<DropdownMenuItem className="text-slate-300 hover:text-white hover:bg-slate-800">
								<Zap className="mr-2 h-4 w-4" />
								Preferences
							</DropdownMenuItem>
							<DropdownMenuItem className="text-slate-300 hover:text-white hover:bg-slate-800">
								<HelpCircle className="mr-2 h-4 w-4" />
								Help & Support
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</div>
	);
}

"use client";

import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Keyboard, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface Shortcut {
	id: string;
	name: string;
	description: string;
	key: string;
	modifiers: string[];
	category: string;
}

const defaultShortcuts: Shortcut[] = [
	// Playback
	{
		id: "play",
		name: "Play/Pause",
		description: "Toggle playback",
		key: "Space",
		modifiers: [],
		category: "Playback",
	},
	{
		id: "stop",
		name: "Stop",
		description: "Stop playback",
		key: "Escape",
		modifiers: [],
		category: "Playback",
	},
	{
		id: "next-frame",
		name: "Next Frame",
		description: "Move to next frame",
		key: "ArrowRight",
		modifiers: [],
		category: "Playback",
	},
	{
		id: "prev-frame",
		name: "Previous Frame",
		description: "Move to previous frame",
		key: "ArrowLeft",
		modifiers: [],
		category: "Playback",
	},

	// Editing
	{
		id: "cut",
		name: "Cut",
		description: "Cut at playhead",
		key: "S",
		modifiers: [],
		category: "Editing",
	},
	{
		id: "copy",
		name: "Copy",
		description: "Copy selection",
		key: "C",
		modifiers: ["Cmd"],
		category: "Editing",
	},
	{
		id: "paste",
		name: "Paste",
		description: "Paste clipboard",
		key: "V",
		modifiers: ["Cmd"],
		category: "Editing",
	},
	{
		id: "delete",
		name: "Delete",
		description: "Delete selection",
		key: "Delete",
		modifiers: [],
		category: "Editing",
	},
	{
		id: "undo",
		name: "Undo",
		description: "Undo last action",
		key: "Z",
		modifiers: ["Cmd"],
		category: "Editing",
	},
	{
		id: "redo",
		name: "Redo",
		description: "Redo last action",
		key: "Z",
		modifiers: ["Cmd", "Shift"],
		category: "Editing",
	},

	// Timeline
	{
		id: "zoom-in",
		name: "Zoom In",
		description: "Zoom in timeline",
		key: "+",
		modifiers: [],
		category: "Timeline",
	},
	{
		id: "zoom-out",
		name: "Zoom Out",
		description: "Zoom out timeline",
		key: "-",
		modifiers: [],
		category: "Timeline",
	},
	{
		id: "fit-timeline",
		name: "Fit Timeline",
		description: "Fit timeline to view",
		key: "F",
		modifiers: [],
		category: "Timeline",
	},
	{
		id: "select-all",
		name: "Select All",
		description: "Select all items",
		key: "A",
		modifiers: ["Cmd"],
		category: "Timeline",
	},

	// File
	{
		id: "save",
		name: "Save",
		description: "Save project",
		key: "S",
		modifiers: ["Cmd"],
		category: "File",
	},
	{
		id: "export",
		name: "Export",
		description: "Export video",
		key: "E",
		modifiers: ["Cmd", "Shift"],
		category: "File",
	},
	{
		id: "import",
		name: "Import",
		description: "Import media",
		key: "I",
		modifiers: ["Cmd"],
		category: "File",
	},
	{
		id: "new-project",
		name: "New Project",
		description: "Create new project",
		key: "N",
		modifiers: ["Cmd"],
		category: "File",
	},
];

interface KeyboardShortcutsModalProps {
	open: boolean;
	onClose: () => void;
	shortcuts: Shortcut[];
	onSave: (shortcuts: Shortcut[]) => void;
}

export default function KeyboardShortcutsModal({
	open,
	onClose,
	shortcuts: initialShortcuts,
	onSave,
}: KeyboardShortcutsModalProps) {
	const [shortcuts, setShortcuts] = useState<Shortcut[]>(initialShortcuts);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [recordingId, setRecordingId] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState("");

	const categories = Array.from(new Set(shortcuts.map((s) => s.category)));

	const handleRecordShortcut = (shortcutId: string) => {
		setRecordingId(shortcutId);

		const handleKeyDown = (e: KeyboardEvent) => {
			e.preventDefault();

			const modifiers: string[] = [];
			if (e.metaKey) modifiers.push("Cmd");
			if (e.ctrlKey && !e.metaKey) modifiers.push("Ctrl");
			if (e.shiftKey) modifiers.push("Shift");
			if (e.altKey) modifiers.push("Alt");

			let key = e.key;
			// Normalize key names
			if (key === " ") key = "Space";
			if (key === "ArrowLeft") key = "←";
			if (key === "ArrowRight") key = "→";
			if (key === "ArrowUp") key = "↑";
			if (key === "ArrowDown") key = "↓";

			// Update the shortcut
			setShortcuts((prev) =>
				prev.map((s) => (s.id === shortcutId ? { ...s, key, modifiers } : s)),
			);

			setRecordingId(null);
			document.removeEventListener("keydown", handleKeyDown);
		};

		document.addEventListener("keydown", handleKeyDown);

		// Auto-cancel after 5 seconds
		setTimeout(() => {
			if (recordingId === shortcutId) {
				setRecordingId(null);
				document.removeEventListener("keydown", handleKeyDown);
			}
		}, 5000);
	};

	const handleResetShortcut = (shortcutId: string) => {
		const defaultShortcut = defaultShortcuts.find((s) => s.id === shortcutId);
		if (defaultShortcut) {
			setShortcuts((prev) =>
				prev.map((s) => (s.id === shortcutId ? defaultShortcut : s)),
			);
		}
	};

	const handleResetAll = () => {
		setShortcuts(defaultShortcuts);
		toast.success("Barcha tugmalar asl holatiga qaytarildi");
	};

	const handleSave = () => {
		// Check for duplicate shortcuts
		const seen = new Map<string, string>();
		let hasDuplicates = false;

		for (const shortcut of shortcuts) {
			const combo = [...shortcut.modifiers, shortcut.key].join("+");
			if (seen.has(combo)) {
				toast.error(
					`Takrorlanuvchi tugma: ${combo} (${seen.get(combo)} va ${shortcut.name})`,
				);
				hasDuplicates = true;
			}
			seen.set(combo, shortcut.name);
		}

		if (!hasDuplicates) {
			onSave(shortcuts);
			onClose();
			toast.success("Tugmalar saqlandi");
		}
	};

	const formatShortcut = (shortcut: Shortcut) => {
		const parts = [...shortcut.modifiers, shortcut.key];
		return parts.join(" + ");
	};

	const filteredShortcuts = shortcuts.filter(
		(s) =>
			s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
			s.key.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="max-w-3xl max-h-[80vh]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Keyboard className="h-5 w-5" />
						Klaviatura Tugmalarini Sozlash
					</DialogTitle>
					<DialogDescription>
						Tugmani o'zgartirish uchun ustiga bosing va yangi kombinatsiyani
						kiriting
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					{/* Search */}
					<div>
						<Input
							placeholder="Tugmalarni qidirish..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full"
						/>
					</div>

					{/* Shortcuts List */}
					<ScrollArea className="h-[400px] pr-4">
						<div className="space-y-6">
							{categories.map((category) => {
								const categoryShortcuts = filteredShortcuts.filter(
									(s) => s.category === category,
								);
								if (categoryShortcuts.length === 0) return null;

								return (
									<div key={category}>
										<h3 className="font-semibold text-sm text-muted-foreground mb-3">
											{category}
										</h3>
										<div className="space-y-2">
											{categoryShortcuts.map((shortcut) => (
												<div
													key={shortcut.id}
													className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
												>
													<div className="flex-1">
														<div className="font-medium text-sm">
															{shortcut.name}
														</div>
														<div className="text-xs text-muted-foreground">
															{shortcut.description}
														</div>
													</div>
													<div className="flex items-center gap-2">
														{recordingId === shortcut.id ? (
															<div className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm animate-pulse">
																Tugmani bosing...
															</div>
														) : (
															<button
																onClick={() =>
																	handleRecordShortcut(shortcut.id)
																}
																className="px-3 py-1 bg-muted hover:bg-muted/80 rounded text-sm font-mono min-w-[100px] text-center"
															>
																{formatShortcut(shortcut)}
															</button>
														)}
														<Button
															size="sm"
															variant="ghost"
															onClick={() => handleResetShortcut(shortcut.id)}
														>
															<RefreshCw className="h-3 w-3" />
														</Button>
													</div>
												</div>
											))}
										</div>
									</div>
								);
							})}
						</div>
					</ScrollArea>

					{/* Actions */}
					<div className="flex justify-between">
						<Button variant="outline" onClick={handleResetAll}>
							<RefreshCw className="h-4 w-4 mr-2" />
							Hammasini Tiklash
						</Button>
						<div className="flex gap-2">
							<Button variant="outline" onClick={onClose}>
								Bekor qilish
							</Button>
							<Button onClick={handleSave}>Saqlash</Button>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

export { defaultShortcuts, type Shortcut };

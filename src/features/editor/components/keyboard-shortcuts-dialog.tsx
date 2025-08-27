import { useState, useEffect } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { useShortcutHelp } from "../hooks/use-keyboard-shortcuts";
import { Keyboard } from "lucide-react";

export const KeyboardShortcutsDialog = () => {
	const [open, setOpen] = useState(false);
	const shortcuts = useShortcutHelp();

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Open on ? or h key
			if (
				e.key === "?" ||
				(e.key === "h" && !e.ctrlKey && !e.metaKey && !e.shiftKey)
			) {
				const target = e.target as HTMLElement;
				if (
					target.tagName === "INPUT" ||
					target.tagName === "TEXTAREA" ||
					target.contentEditable === "true"
				) {
					return;
				}
				e.preventDefault();
				setOpen(true);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);

	// Group shortcuts by category
	const categories = {
		"Basic Editing": [
			"Undo",
			"Redo",
			"Copy",
			"Paste",
			"Cut",
			"Duplicate",
			"Delete",
		],
		Selection: ["Select all", "Deselect"],
		Playback: ["Play/Pause", "Seek", "Go to"],
		Timeline: ["Split", "Track", "Marker"],
		View: ["Zoom"],
		Project: ["Save", "Export"],
		Other: ["Group", "Toggle", "Add"],
	};

	const getCategory = (description: string) => {
		for (const [category, keywords] of Object.entries(categories)) {
			if (
				keywords.some((keyword) =>
					description.toLowerCase().includes(keyword.toLowerCase()),
				)
			) {
				return category;
			}
		}
		return "Other";
	};

	const groupedShortcuts = shortcuts.reduce(
		(acc, shortcut) => {
			const category = getCategory(shortcut.description);
			if (!acc[category]) acc[category] = [];
			acc[category].push(shortcut);
			return acc;
		},
		{} as Record<string, typeof shortcuts>,
	);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Keyboard className="h-5 w-5" />
						Keyboard Shortcuts
					</DialogTitle>
					<DialogDescription>
						Press "?" or "h" anytime to view this help
					</DialogDescription>
				</DialogHeader>

				<div className="mt-4 space-y-6">
					{Object.entries(groupedShortcuts).map(
						([category, categoryShortcuts]) => (
							<div key={category}>
								<h3 className="text-sm font-semibold text-muted-foreground mb-2">
									{category}
								</h3>
								<div className="grid grid-cols-2 gap-2">
									{categoryShortcuts.map((shortcut, index) => (
										<div
											key={index}
											className="flex items-center justify-between p-2 rounded-md bg-muted/50"
										>
											<span className="text-sm">{shortcut.description}</span>
											<kbd className="px-2 py-1 text-xs font-semibold text-muted-foreground bg-background border border-border rounded">
												{shortcut.shortcut}
											</kbd>
										</div>
									))}
								</div>
							</div>
						),
					)}
				</div>

				<div className="mt-6 p-4 bg-muted rounded-md">
					<h4 className="text-sm font-semibold mb-2">Tips:</h4>
					<ul className="text-sm text-muted-foreground space-y-1">
						<li>• Use Ctrl/Cmd + Click to select multiple items</li>
						<li>• Use Shift + Click for range selection</li>
						<li>• Right-click on items for context menu</li>
						<li>• Drag to create a selection box</li>
						<li>• Most actions work on all selected items</li>
					</ul>
				</div>
			</DialogContent>
		</Dialog>
	);
};

import { useState, useEffect } from "react";
import { X } from "lucide-react";

export const KeyboardHelp = () => {
	const [open, setOpen] = useState(false);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Open on ? or h key
			if (e.key === "?" || e.key === "h") {
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
			// Close on Escape
			if (e.key === "Escape" && open) {
				e.preventDefault();
				setOpen(false);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [open]);

	if (!open) return null;

	const shortcuts = [
		{ keys: "Ctrl+Z", desc: "Undo" },
		{ keys: "Ctrl+Y", desc: "Redo" },
		{ keys: "Ctrl+C", desc: "Copy" },
		{ keys: "Ctrl+V", desc: "Paste" },
		{ keys: "Ctrl+X", desc: "Cut" },
		{ keys: "Ctrl+D", desc: "Duplicate" },
		{ keys: "Delete", desc: "Delete selected" },
		{ keys: "Space", desc: "Play/Pause" },
		{ keys: "←/→", desc: "Seek 1 second" },
		{ keys: "Shift+←/→", desc: "Seek 5 seconds" },
		{ keys: "Home", desc: "Go to start" },
		{ keys: "End", desc: "Go to end" },
		{ keys: "Ctrl+A", desc: "Select all" },
		{ keys: "Escape", desc: "Deselect all" },
		{ keys: "Ctrl++", desc: "Zoom in" },
		{ keys: "Ctrl+-", desc: "Zoom out" },
		{ keys: "Ctrl+0", desc: "Zoom to fit" },
		{ keys: "Ctrl+Shift+E", desc: "Export" },
		{ keys: "? or H", desc: "Show this help" },
	];

	return (
		<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
			<div className="bg-background border border-border rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-xl font-semibold">Keyboard Shortcuts</h2>
					<button
						onClick={() => setOpen(false)}
						className="p-1 hover:bg-muted rounded"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				<div className="grid grid-cols-2 gap-2">
					{shortcuts.map((shortcut, index) => (
						<div
							key={index}
							className="flex items-center justify-between p-2 rounded bg-muted/50"
						>
							<span className="text-sm">{shortcut.desc}</span>
							<kbd className="px-2 py-1 text-xs font-semibold bg-background border border-border rounded">
								{shortcut.keys}
							</kbd>
						</div>
					))}
				</div>

				<div className="mt-4 p-3 bg-muted rounded text-sm">
					<p>
						Press{" "}
						<kbd className="px-1 py-0.5 text-xs bg-background border border-border rounded">
							Escape
						</kbd>{" "}
						to close this dialog
					</p>
				</div>
			</div>
		</div>
	);
};

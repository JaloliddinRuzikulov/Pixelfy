import { useEffect, useCallback } from "react";
import { dispatch } from "@designcombo/events";
import {
	HISTORY_UNDO,
	HISTORY_REDO,
	ACTIVE_DELETE,
	LAYER_COPY,
	LAYER_PASTE,
	LAYER_DELETE,
} from "@designcombo/state";
import { toast } from "sonner";

interface ShortcutConfig {
	key: string;
	ctrl?: boolean;
	shift?: boolean;
	alt?: boolean;
	action: () => void;
	description: string;
}

export const useKeyboardShortcuts = (enabled = true) => {
	// Define all shortcuts
	const shortcuts: ShortcutConfig[] = [
		// Basic editing
		{
			key: "z",
			ctrl: true,
			action: () => {
				dispatch(HISTORY_UNDO);
				toast.success("Undo", { duration: 1000 });
			},
			description: "Undo",
		},
		{
			key: "y",
			ctrl: true,
			action: () => {
				dispatch(HISTORY_REDO);
				toast.success("Redo", { duration: 1000 });
			},
			description: "Redo",
		},
		{
			key: "z",
			ctrl: true,
			shift: true,
			action: () => {
				dispatch(HISTORY_REDO);
				toast.success("Redo", { duration: 1000 });
			},
			description: "Redo (alternative)",
		},

		// Copy/Paste/Cut
		{
			key: "c",
			ctrl: true,
			action: () => {
				dispatch(LAYER_COPY);
				toast.success("Copied", { duration: 1000 });
			},
			description: "Copy",
		},
		{
			key: "v",
			ctrl: true,
			action: () => {
				dispatch(LAYER_PASTE);
				toast.success("Pasted", { duration: 1000 });
			},
			description: "Paste",
		},
		{
			key: "x",
			ctrl: true,
			action: () => {
				dispatch("CUT_ITEMS");
				toast.success("Cut", { duration: 1000 });
			},
			description: "Cut",
		},
		{
			key: "d",
			ctrl: true,
			action: () => {
				dispatch(LAYER_COPY);
				setTimeout(() => dispatch(LAYER_PASTE), 100);
				toast.success("Duplicated", { duration: 1000 });
			},
			description: "Duplicate",
		},

		// Delete
		{
			key: "Delete",
			action: () => {
				dispatch(ACTIVE_DELETE);
				toast.success("Deleted", { duration: 1000 });
			},
			description: "Delete selected",
		},
		{
			key: "Backspace",
			action: () => {
				dispatch(ACTIVE_DELETE);
				toast.success("Deleted", { duration: 1000 });
			},
			description: "Delete selected (alternative)",
		},

		// Selection
		{
			key: "a",
			ctrl: true,
			action: () => {
				dispatch("SELECT_ALL");
				toast.success("All selected", { duration: 1000 });
			},
			description: "Select all",
		},
		{
			key: "Escape",
			action: () => {
				dispatch("DESELECT_ALL");
			},
			description: "Deselect all",
		},

		// Playback controls
		{
			key: " ",
			action: () => {
				dispatch("PLAYER:TOGGLE_PLAY");
			},
			description: "Play/Pause",
		},
		{
			key: "ArrowLeft",
			action: () => {
				dispatch("PLAYER:SEEK_BY", { payload: { frames: -30 } }); // 1 second at 30fps
			},
			description: "Seek backward 1s",
		},
		{
			key: "ArrowRight",
			action: () => {
				dispatch("PLAYER:SEEK_BY", { payload: { frames: 30 } }); // 1 second at 30fps
			},
			description: "Seek forward 1s",
		},
		{
			key: "ArrowLeft",
			shift: true,
			action: () => {
				dispatch("PLAYER:SEEK_BY", { payload: { frames: -150 } }); // 5 seconds at 30fps
			},
			description: "Seek backward 5s",
		},
		{
			key: "ArrowRight",
			shift: true,
			action: () => {
				dispatch("PLAYER:SEEK_BY", { payload: { frames: 150 } }); // 5 seconds at 30fps
			},
			description: "Seek forward 5s",
		},
		{
			key: "Home",
			action: () => {
				dispatch("PLAYER:SEEK", { payload: { time: 0 } });
			},
			description: "Go to start",
		},
		{
			key: "End",
			action: () => {
				// We'll just seek to a large time, the player will handle the max
				dispatch("PLAYER:SEEK", { payload: { time: 999999 } });
			},
			description: "Go to end",
		},

		// Zoom controls
		{
			key: "=",
			ctrl: true,
			action: () => {
				dispatch("ZOOM_IN");
				toast.success("Zoom in", { duration: 1000 });
			},
			description: "Zoom in",
		},
		{
			key: "-",
			ctrl: true,
			action: () => {
				dispatch("ZOOM_OUT");
				toast.success("Zoom out", { duration: 1000 });
			},
			description: "Zoom out",
		},
		{
			key: "0",
			ctrl: true,
			action: () => {
				dispatch("ZOOM_FIT");
				toast.success("Zoom to fit", { duration: 1000 });
			},
			description: "Zoom to fit",
		},

		// Save - commented out until save is implemented
		// {
		//   key: 's',
		//   ctrl: true,
		//   action: () => {
		//     dispatch('SAVE_PROJECT');
		//     toast.success('Project saved', { duration: 1000 });
		//   },
		//   description: 'Save project'
		// },

		// Export
		{
			key: "e",
			ctrl: true,
			shift: true,
			action: () => {
				// Trigger export button click
				const exportButton = document.querySelector(
					'button:has(svg[width="18"])',
				) as HTMLButtonElement;
				if (exportButton) {
					exportButton.click();
					toast.success("Opening export dialog...", { duration: 1000 });
				}
			},
			description: "Export video",
		},

		// Timeline navigation - commented out until events are implemented
		// {
		//   key: 'ArrowUp',
		//   action: () => {
		//     dispatch('SELECT_TRACK_ABOVE');
		//   },
		//   description: 'Select track above'
		// },
		// {
		//   key: 'ArrowDown',
		//   action: () => {
		//     dispatch('SELECT_TRACK_BELOW');
		//   },
		//   description: 'Select track below'
		// },

		// // Markers
		// {
		//   key: 'm',
		//   action: () => {
		//     dispatch('ADD_MARKER');
		//     toast.success('Marker added', { duration: 1000 });
		//   },
		//   description: 'Add marker'
		// },

		// // Split
		// {
		//   key: 's',
		//   action: () => {
		//     dispatch('SPLIT_AT_PLAYHEAD');
		//     toast.success('Split at playhead', { duration: 1000 });
		//   },
		//   description: 'Split at playhead'
		// },

		// // Mute
		// {
		//   key: 'm',
		//   ctrl: true,
		//   action: () => {
		//     dispatch('TOGGLE_MUTE');
		//   },
		//   description: 'Toggle mute'
		// },

		// // Lock
		// {
		//   key: 'l',
		//   ctrl: true,
		//   action: () => {
		//     dispatch('TOGGLE_LOCK');
		//   },
		//   description: 'Toggle lock'
		// },

		// // Group/Ungroup
		// {
		//   key: 'g',
		//   ctrl: true,
		//   action: () => {
		//     dispatch('GROUP_ITEMS');
		//     toast.success('Items grouped', { duration: 1000 });
		//   },
		//   description: 'Group items'
		// },
		// {
		//   key: 'g',
		//   ctrl: true,
		//   shift: true,
		//   action: () => {
		//     dispatch('UNGROUP_ITEMS');
		//     toast.success('Items ungrouped', { duration: 1000 });
		//   },
		//   description: 'Ungroup items'
		// }
	];

	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			if (!enabled) return;

			// Don't trigger shortcuts when typing in input fields
			const target = e.target as HTMLElement;
			if (
				target.tagName === "INPUT" ||
				target.tagName === "TEXTAREA" ||
				target.contentEditable === "true"
			) {
				return;
			}

			// Check for matching shortcut
			const matchingShortcut = shortcuts.find((shortcut) => {
				const keyMatch =
					shortcut.key.toLowerCase() === e.key.toLowerCase() ||
					shortcut.key === e.key;
				const ctrlMatch = shortcut.ctrl
					? e.ctrlKey || e.metaKey
					: !(e.ctrlKey || e.metaKey);
				const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
				const altMatch = shortcut.alt ? e.altKey : !e.altKey;

				return keyMatch && ctrlMatch && shiftMatch && altMatch;
			});

			if (matchingShortcut) {
				e.preventDefault();
				e.stopPropagation();
				matchingShortcut.action();
			}
		},
		[enabled],
	);

	useEffect(() => {
		if (enabled) {
			window.addEventListener("keydown", handleKeyDown);
			return () => {
				window.removeEventListener("keydown", handleKeyDown);
			};
		}
	}, [enabled, handleKeyDown]);

	// Return shortcuts list for display in help menu
	return { shortcuts };
};

// Helper hook for displaying shortcuts
export const useShortcutHelp = () => {
	const { shortcuts } = useKeyboardShortcuts(false);

	const formatShortcut = (shortcut: ShortcutConfig) => {
		let keys = [];
		if (shortcut.ctrl) keys.push("Ctrl");
		if (shortcut.shift) keys.push("Shift");
		if (shortcut.alt) keys.push("Alt");

		// Format special keys
		let key = shortcut.key;
		if (key === " ") key = "Space";
		if (key === "ArrowLeft") key = "←";
		if (key === "ArrowRight") key = "→";
		if (key === "ArrowUp") key = "↑";
		if (key === "ArrowDown") key = "↓";

		keys.push(key);
		return keys.join("+");
	};

	return shortcuts.map((s) => ({
		shortcut: formatShortcut(s),
		description: s.description,
	}));
};

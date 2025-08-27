import { useEffect, useCallback, useRef } from "react";
import { dispatch } from "@designcombo/events";
import {
	HISTORY_UNDO,
	HISTORY_REDO,
	LAYER_DELETE,
	LAYER_CLONE,
	LAYER_SELECTION,
	TIMELINE_SCALE_CHANGED,
} from "@designcombo/state";
import useStore from "../store/use-store";
import { toast } from "sonner";
import {
	getNextZoomLevel,
	getPreviousZoomLevel,
	getFitZoomLevel,
} from "../utils/timeline";

export const useSimpleKeyboardShortcuts = (enabled = true) => {
	const { timeline, scale, duration, activeIds, trackItemsMap } = useStore();
	const clipboardRef = useRef<any[]>([]);

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

			// Undo
			if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
				e.preventDefault();
				dispatch(HISTORY_UNDO);
				toast.success("Undo", { duration: 1000 });
				return;
			}

			// Redo
			if (
				(e.ctrlKey || e.metaKey) &&
				(e.key === "y" || (e.key === "z" && e.shiftKey))
			) {
				e.preventDefault();
				dispatch(HISTORY_REDO);
				toast.success("Redo", { duration: 1000 });
				return;
			}

			// Copy
			if ((e.ctrlKey || e.metaKey) && e.key === "c") {
				e.preventDefault();
				if (activeIds && activeIds.length > 0) {
					clipboardRef.current = activeIds
						.map((id) => trackItemsMap[id])
						.filter(Boolean);
					toast.success("Copied", { duration: 1000 });
				}
				return;
			}

			// Paste
			if ((e.ctrlKey || e.metaKey) && e.key === "v") {
				e.preventDefault();
				if (clipboardRef.current.length > 0) {
					// Paste logic will be implemented with proper timeline API
					toast.success("Paste functionality coming soon", { duration: 1000 });
				}
				return;
			}

			// Cut
			if ((e.ctrlKey || e.metaKey) && e.key === "x") {
				e.preventDefault();
				if (activeIds && activeIds.length > 0) {
					clipboardRef.current = activeIds
						.map((id) => trackItemsMap[id])
						.filter(Boolean);
					dispatch(LAYER_DELETE);
					toast.success("Cut", { duration: 1000 });
				}
				return;
			}

			// Duplicate
			if ((e.ctrlKey || e.metaKey) && e.key === "d") {
				e.preventDefault();
				if (activeIds && activeIds.length > 0) {
					dispatch(LAYER_CLONE);
					toast.success("Duplicated", { duration: 1000 });
				}
				return;
			}

			// Play/Pause with spacebar
			if (e.key === " ") {
				e.preventDefault();
				dispatch("PLAYER:TOGGLE_PLAY");
				return;
			}

			// Delete
			if (e.key === "Delete" || e.key === "Backspace") {
				e.preventDefault();
				if (activeIds && activeIds.length > 0) {
					dispatch(LAYER_DELETE);
					toast.success("Deleted", { duration: 1000 });
				}
				return;
			}

			// Timeline zoom with + and -
			if ((e.ctrlKey || e.metaKey) && (e.key === "=" || e.key === "+")) {
				e.preventDefault();
				const nextZoom = getNextZoomLevel(scale);
				if (nextZoom) {
					dispatch(TIMELINE_SCALE_CHANGED, { payload: nextZoom });
					toast.success("Zoom in", { duration: 1000 });
				}
				return;
			}

			if ((e.ctrlKey || e.metaKey) && e.key === "-") {
				e.preventDefault();
				const prevZoom = getPreviousZoomLevel(scale);
				if (prevZoom) {
					dispatch(TIMELINE_SCALE_CHANGED, { payload: prevZoom });
					toast.success("Zoom out", { duration: 1000 });
				}
				return;
			}

			// Zoom to fit
			if ((e.ctrlKey || e.metaKey) && e.key === "0") {
				e.preventDefault();
				const fitZoom = getFitZoomLevel(duration, timeline?.width || 1000);
				if (fitZoom) {
					dispatch(TIMELINE_SCALE_CHANGED, { payload: fitZoom });
					toast.success("Zoom to fit", { duration: 1000 });
				}
				return;
			}

			// Seek with arrow keys
			if (e.key === "ArrowLeft") {
				e.preventDefault();
				const frames = e.shiftKey ? -150 : -30; // 5s or 1s at 30fps
				dispatch("PLAYER:SEEK_BY", { payload: { frames } });
				return;
			}

			if (e.key === "ArrowRight") {
				e.preventDefault();
				const frames = e.shiftKey ? 150 : 30; // 5s or 1s at 30fps
				dispatch("PLAYER:SEEK_BY", { payload: { frames } });
				return;
			}

			// Go to start/end
			if (e.key === "Home") {
				e.preventDefault();
				dispatch("PLAYER:SEEK", { payload: { time: 0 } });
				return;
			}

			if (e.key === "End") {
				e.preventDefault();
				dispatch("PLAYER:SEEK", { payload: { time: duration } });
				return;
			}

			// Select all with Ctrl+A
			if ((e.ctrlKey || e.metaKey) && e.key === "a") {
				e.preventDefault();
				// Select all track items
				const allItemIds = Object.keys(trackItemsMap);
				if (allItemIds.length > 0) {
					dispatch(LAYER_SELECTION, { payload: { activeIds: allItemIds } });
					toast.success("All selected", { duration: 1000 });
				}
				return;
			}

			// Deselect all with Escape
			if (e.key === "Escape") {
				e.preventDefault();
				dispatch(LAYER_SELECTION, { payload: { activeIds: [] } });
				return;
			}

			// Export dialog
			if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "e") {
				e.preventDefault();
				const exportButton = document.querySelector(
					'button:has(svg[width="18"])',
				) as HTMLButtonElement;
				if (exportButton) {
					exportButton.click();
					toast.success("Opening export dialog...", { duration: 1000 });
				}
				return;
			}
		},
		[enabled, timeline, scale, duration, activeIds, trackItemsMap],
	);

	useEffect(() => {
		if (enabled) {
			window.addEventListener("keydown", handleKeyDown);
			return () => {
				window.removeEventListener("keydown", handleKeyDown);
			};
		}
	}, [enabled, handleKeyDown]);
};

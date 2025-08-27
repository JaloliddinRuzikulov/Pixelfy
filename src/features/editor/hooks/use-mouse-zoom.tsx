import { useEffect, useCallback } from "react";
import { dispatch } from "@designcombo/events";

export const useMouseZoom = (
	containerRef: React.RefObject<HTMLElement>,
	enabled = true,
) => {
	const handleWheel = useCallback(
		(e: WheelEvent) => {
			if (!enabled) return;

			// Only zoom when Ctrl/Cmd is held
			if (!e.ctrlKey && !e.metaKey) return;

			e.preventDefault();

			// Zoom based on wheel direction
			if (e.deltaY < 0) {
				dispatch("ZOOM_IN");
			} else if (e.deltaY > 0) {
				dispatch("ZOOM_OUT");
			}
		},
		[enabled],
	);

	useEffect(() => {
		const container = containerRef.current;
		if (!container || !enabled) return;

		// Add passive: false to allow preventDefault
		container.addEventListener("wheel", handleWheel, { passive: false });

		return () => {
			container.removeEventListener("wheel", handleWheel);
		};
	}, [containerRef, handleWheel, enabled]);
};

import { useState, useEffect } from "react";
import { filter, subject } from "@designcombo/events";
import { DRAG_END, DRAG_PREFIX, DRAG_START } from "@designcombo/timeline";

export const useIsDraggingOverTimeline = () => {
	const [isDraggingOverTimeline, setIsDraggingOverTimeline] = useState(false);

	useEffect(() => {
		const dragEvents = subject.pipe(
			filter(({ key }: { key: string }) => key.startsWith(DRAG_PREFIX)),
		);

		const dragEventsSubscription = dragEvents.subscribe(
			(obj: { key: string }) => {
				if (obj.key === DRAG_START) {
					setIsDraggingOverTimeline(true);
				} else if (obj.key === DRAG_END) {
					setIsDraggingOverTimeline(false);
				}
			},
		);

		return () => dragEventsSubscription.unsubscribe();
	}, []);

	return isDraggingOverTimeline;
};

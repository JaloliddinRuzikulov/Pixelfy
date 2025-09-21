import { useEffect } from "react";
import { subject, filter } from "@designcombo/events";
import useStore from "../store/use-store";
import { dispatch } from "@designcombo/events";
import { EDIT_OBJECT } from "@designcombo/state";

export const useChromaKeyEvents = () => {
	const { setState } = useStore();

	useEffect(() => {
		const chromaKeyEvents = subject.pipe(
			filter(({ key }: { key: string }) => key === "UPDATE_ITEM_CHROMA_KEY"),
		);

		const subscription = chromaKeyEvents.subscribe((obj: any) => {
			const { itemId, chromaKey } = obj.value?.payload || {};

			if (itemId && chromaKey !== undefined) {
				// Update the item with chroma key settings
				dispatch(EDIT_OBJECT, {
					payload: {
						[itemId]: {
							chromaKey: chromaKey,
						},
					},
				});
			}
		});

		return () => {
			subscription.unsubscribe();
		};
	}, []);

	useEffect(() => {
		const colorPickerEvents = subject.pipe(
			filter(({ key }: { key: string }) => key === "ENABLE_COLOR_PICKER_MODE"),
		);

		const subscription = colorPickerEvents.subscribe((obj: any) => {
			const { callback } = obj.value?.payload || {};

			if (callback) {
				// Set up color picker mode
				const handleClick = (e: MouseEvent) => {
					const target = e.target as HTMLElement;

					// Check if clicked on video element
					if (target.tagName === "VIDEO" || target.closest("video")) {
						const video =
							target.tagName === "VIDEO"
								? (target as HTMLVideoElement)
								: (target.closest("video") as HTMLVideoElement);

						// Get color at click position
						const canvas = document.createElement("canvas");
						const ctx = canvas.getContext("2d");

						if (ctx && video) {
							canvas.width = video.videoWidth;
							canvas.height = video.videoHeight;
							ctx.drawImage(video, 0, 0);

							// Get click position relative to video
							const rect = video.getBoundingClientRect();
							const x = Math.floor(
								(e.clientX - rect.left) * (video.videoWidth / rect.width),
							);
							const y = Math.floor(
								(e.clientY - rect.top) * (video.videoHeight / rect.height),
							);

							// Get pixel color
							const imageData = ctx.getImageData(x, y, 1, 1);
							const pixel = imageData.data;

							// Convert to hex
							const r = pixel[0].toString(16).padStart(2, "0");
							const g = pixel[1].toString(16).padStart(2, "0");
							const b = pixel[2].toString(16).padStart(2, "0");
							const color = `#${r}${g}${b}`;

							// Call callback with color
							callback(color);

							// Remove event listener
							document.removeEventListener("click", handleClick);
						}
					}
				};

				// Add click listener to document
				setTimeout(() => {
					document.addEventListener("click", handleClick);
				}, 100);

				// Remove listener after 10 seconds if not clicked
				setTimeout(() => {
					document.removeEventListener("click", handleClick);
				}, 10000);
			}
		});

		return () => {
			subscription.unsubscribe();
		};
	}, []);
};

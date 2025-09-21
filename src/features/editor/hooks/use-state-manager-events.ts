import { useEffect, useCallback, useRef } from "react";
import StateManager from "@designcombo/state";
import useStore from "../store/use-store";
import { IAudio, ITrackItem, IVideo } from "@designcombo/types";
import { audioDataManager } from "../player/lib/audio-data";

// Global registry to prevent duplicate subscriptions
const subscriptionRegistry = new WeakMap<StateManager, Set<string>>();

export const useStateManagerEvents = (stateManager: StateManager) => {
	const { setState } = useStore();
	const isSubscribedRef = useRef(false);

	// Handle track item updates - with error protection
	const handleTrackItemUpdate = useCallback(() => {
		try {
			const currentState = stateManager.getState();
			const mergedTrackItemsDeatilsMap = currentState.trackItemsMap;

			// Defensive check for trackItemsMap
			if (!mergedTrackItemsDeatilsMap || typeof mergedTrackItemsDeatilsMap !== 'object') {
				console.warn("Invalid trackItemsMap, skipping update");
				return;
			}

			const filterTrakcItems = Object.values(mergedTrackItemsDeatilsMap).filter(
				(item) => {
					return item && item.type && (item.type === "video" || item.type === "audio");
				},
			);

			// Only update if we have valid items
			if (filterTrakcItems.length > 0) {
				audioDataManager.setItems(
					filterTrakcItems as (ITrackItem & (IVideo | IAudio))[],
				);
				audioDataManager.validateUpdateItems(
					filterTrakcItems as (ITrackItem & (IVideo | IAudio))[],
				);
			}

			setState({
				duration: currentState.duration,
				trackItemsMap: currentState.trackItemsMap,
			});
		} catch (error) {
			console.error("Error in handleTrackItemUpdate:", error);
		}
	}, [stateManager, setState]);

	const handleAddRemoveItems = useCallback(() => {
		try {
			const currentState = stateManager.getState();

			// Early validation of state
			if (!currentState) {
				console.warn("No current state available");
				return;
			}

			const mergedTrackItemsDeatilsMap = currentState.trackItemsMap || {};

			console.log("🎯 handleAddRemoveItems triggered");
			console.log("Items count:", Object.keys(mergedTrackItemsDeatilsMap).length);

			// Validate each item before processing
			const validItems = Object.values(mergedTrackItemsDeatilsMap).filter(
				(item) => {
					return item &&
						   typeof item === 'object' &&
						   item.type &&
						   (item.type === "video" || item.type === "audio");
				},
			);

			console.log("Valid audio/video items:", validItems.length);

			// Only update audio manager if we have valid items
			if (validItems.length > 0) {
				try {
					audioDataManager.validateUpdateItems(
						validItems as (ITrackItem & (IVideo | IAudio))[],
					);
				} catch (audioError) {
					console.error("Error updating audio manager:", audioError);
				}
			}

			// Update store state safely
			setState({
				trackItemsMap: mergedTrackItemsDeatilsMap,
				trackItemIds: currentState.trackItemIds || [],
				tracks: currentState.tracks || [],
			});

			console.log("🎯 handleAddRemoveItems: Store state updated successfully");

		} catch (error) {
			console.error("Error in handleAddRemoveItems:", error);
		}
	}, [stateManager, setState]);

	const handleUpdateItemDetails = useCallback(() => {
		try {
			const currentState = stateManager.getState();

			// Validate state before updating
			if (!currentState) {
				console.warn("No current state in handleUpdateItemDetails");
				return;
			}

			setState({
				trackItemsMap: currentState.trackItemsMap || {},
			});
		} catch (error) {
			console.error("Error in handleUpdateItemDetails:", error);
		}
	}, [stateManager, setState]);

	useEffect(() => {
		console.log("useStateManagerEvents", stateManager);
		// Check if we already have subscriptions for this stateManager
		if (!subscriptionRegistry.has(stateManager)) {
			subscriptionRegistry.set(stateManager, new Set());
		}

		const registry = subscriptionRegistry.get(stateManager);
		if (!registry) return;
		const hookId = "useStateManagerEvents";

		// Prevent duplicate subscriptions
		if (registry.has(hookId)) {
			return;
		}

		registry.add(hookId);
		isSubscribedRef.current = true;

		// Subscribe to state update details
		const resizeDesignSubscription = stateManager.subscribeToUpdateStateDetails(
			(newState) => {
				setState(newState);
			},
		);

		// Subscribe to scale changes
		const scaleSubscription = stateManager.subscribeToScale((newState) => {
			setState(newState);
		});

		// Subscribe to general state changes
		const tracksSubscription = stateManager.subscribeToState((newState) => {
			setState(newState);
		});

		// Subscribe to duration changes
		const durationSubscription = stateManager.subscribeToDuration(
			(newState) => {
				setState(newState);
			},
		);

		// Subscribe to track item updates with error handling
		const updateTrackItemsMap = {
			unsubscribe: () => {} // Dummy subscription to prevent errors
		};

		// Temporarily disable to prevent updateTrackItemCoords errors
		// const updateTrackItemsMap = stateManager.subscribeToUpdateTrackItem(
		// 	handleTrackItemUpdate,
		// );

		// Subscribe to add/remove items
		const itemsDetailsSubscription =
			stateManager.subscribeToAddOrRemoveItems(handleAddRemoveItems);

		// Subscribe to item details updates
		const updateItemDetailsSubscription =
			stateManager.subscribeToUpdateItemDetails(handleUpdateItemDetails);

		// Cleanup function to unsubscribe from all events
		return () => {
			if (isSubscribedRef.current) {
				try {
					scaleSubscription.unsubscribe();
					tracksSubscription.unsubscribe();
					durationSubscription.unsubscribe();
					itemsDetailsSubscription.unsubscribe();
					updateTrackItemsMap.unsubscribe(); // This is now safe dummy
					updateItemDetailsSubscription.unsubscribe();
					resizeDesignSubscription.unsubscribe();
				} catch (error) {
					console.error("Error during cleanup:", error);
				}

				// Remove from registry
				registry.delete(hookId);
				isSubscribedRef.current = false;
			}
		};
	}, [
		stateManager,
		setState,
		handleTrackItemUpdate,
		handleAddRemoveItems,
		handleUpdateItemDetails,
	]);
};

import { useState, useCallback, useEffect, useRef } from "react";
import { dispatch } from "@designcombo/events";

interface SelectionBox {
	startX: number;
	startY: number;
	endX: number;
	endY: number;
}

export const useMultiSelect = (containerRef: React.RefObject<HTMLElement>) => {
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [isSelecting, setIsSelecting] = useState(false);
	const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);
	const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);
	const isDragging = useRef(false);

	// Handle click selection
	const handleItemClick = useCallback(
		(itemId: string, event: React.MouseEvent) => {
			const isCtrlPressed = event.ctrlKey || event.metaKey;
			const isShiftPressed = event.shiftKey;

			if (isCtrlPressed) {
				// Toggle selection with Ctrl
				setSelectedIds((prev) => {
					const newSet = new Set(prev);
					if (newSet.has(itemId)) {
						newSet.delete(itemId);
					} else {
						newSet.add(itemId);
					}
					return newSet;
				});
				setLastSelectedId(itemId);
			} else if (isShiftPressed && lastSelectedId) {
				// Range selection with Shift
				const items = Array.from(
					containerRef.current?.querySelectorAll("[data-item-id]") || [],
				);
				const startIndex = items.findIndex(
					(el) => el.getAttribute("data-item-id") === lastSelectedId,
				);
				const endIndex = items.findIndex(
					(el) => el.getAttribute("data-item-id") === itemId,
				);

				if (startIndex !== -1 && endIndex !== -1) {
					const [start, end] =
						startIndex < endIndex
							? [startIndex, endIndex]
							: [endIndex, startIndex];
					const rangeIds = items
						.slice(start, end + 1)
						.map((el) => el.getAttribute("data-item-id"))
						.filter(Boolean) as string[];

					setSelectedIds((prev) => {
						const newSet = new Set(prev);
						rangeIds.forEach((id) => newSet.add(id));
						return newSet;
					});
				}
			} else {
				// Single selection
				setSelectedIds(new Set([itemId]));
				setLastSelectedId(itemId);
			}

			// Dispatch selection event
			dispatch("ITEMS_SELECTED", {
				payload: { selectedIds: Array.from(selectedIds) },
			});
		},
		[lastSelectedId, selectedIds, containerRef],
	);

	// Handle drag selection
	const handleMouseDown = useCallback(
		(event: MouseEvent) => {
			// Only start drag selection if clicking on empty space
			const target = event.target as HTMLElement;
			if (target.hasAttribute("data-item-id")) return;

			const container = containerRef.current;
			if (!container) return;

			const rect = container.getBoundingClientRect();
			const startX = event.clientX - rect.left;
			const startY = event.clientY - rect.top;

			isDragging.current = true;
			setIsSelecting(true);
			setSelectionBox({
				startX,
				startY,
				endX: startX,
				endY: startY,
			});

			// Clear selection if not holding Ctrl
			if (!event.ctrlKey && !event.metaKey) {
				setSelectedIds(new Set());
			}
		},
		[containerRef],
	);

	const handleMouseMove = useCallback(
		(event: MouseEvent) => {
			if (!isDragging.current || !selectionBox) return;

			const container = containerRef.current;
			if (!container) return;

			const rect = container.getBoundingClientRect();
			const endX = event.clientX - rect.left;
			const endY = event.clientY - rect.top;

			setSelectionBox((prev) =>
				prev
					? {
							...prev,
							endX,
							endY,
						}
					: null,
			);

			// Check which items are within selection box
			const items = container.querySelectorAll("[data-item-id]");
			const newSelectedIds = new Set(selectedIds);

			items.forEach((item) => {
				const itemRect = item.getBoundingClientRect();
				const itemX = itemRect.left - rect.left;
				const itemY = itemRect.top - rect.top;
				const itemRight = itemX + itemRect.width;
				const itemBottom = itemY + itemRect.height;

				const boxLeft = Math.min(selectionBox.startX, endX);
				const boxRight = Math.max(selectionBox.startX, endX);
				const boxTop = Math.min(selectionBox.startY, endY);
				const boxBottom = Math.max(selectionBox.startY, endY);

				const isIntersecting =
					itemX < boxRight &&
					itemRight > boxLeft &&
					itemY < boxBottom &&
					itemBottom > boxTop;

				const itemId = item.getAttribute("data-item-id");
				if (itemId && isIntersecting) {
					newSelectedIds.add(itemId);
				} else if (itemId && !event.ctrlKey && !event.metaKey) {
					newSelectedIds.delete(itemId);
				}
			});

			setSelectedIds(newSelectedIds);
		},
		[selectionBox, selectedIds, containerRef],
	);

	const handleMouseUp = useCallback(() => {
		isDragging.current = false;
		setIsSelecting(false);
		setSelectionBox(null);

		// Dispatch final selection
		dispatch("ITEMS_SELECTED", {
			payload: { selectedIds: Array.from(selectedIds) },
		});
	}, [selectedIds]);

	// Handle keyboard shortcuts for selection
	const handleKeyDown = useCallback(
		(event: KeyboardEvent) => {
			// Select all
			if ((event.ctrlKey || event.metaKey) && event.key === "a") {
				event.preventDefault();
				const container = containerRef.current;
				if (!container) return;

				const items = container.querySelectorAll("[data-item-id]");
				const allIds = Array.from(items)
					.map((el) => el.getAttribute("data-item-id"))
					.filter(Boolean) as string[];

				setSelectedIds(new Set(allIds));
				dispatch("ITEMS_SELECTED", {
					payload: { selectedIds: allIds },
				});
			}

			// Deselect all
			if (event.key === "Escape") {
				setSelectedIds(new Set());
				dispatch("ITEMS_SELECTED", {
					payload: { selectedIds: [] },
				});
			}
		},
		[containerRef],
	);

	// Set up event listeners
	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		container.addEventListener("mousedown", handleMouseDown);
		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);
		document.addEventListener("keydown", handleKeyDown);

		return () => {
			container.removeEventListener("mousedown", handleMouseDown);
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [
		handleMouseDown,
		handleMouseMove,
		handleMouseUp,
		handleKeyDown,
		containerRef,
	]);

	// Helper functions
	const selectAll = useCallback(() => {
		const container = containerRef.current;
		if (!container) return;

		const items = container.querySelectorAll("[data-item-id]");
		const allIds = Array.from(items)
			.map((el) => el.getAttribute("data-item-id"))
			.filter(Boolean) as string[];

		setSelectedIds(new Set(allIds));
	}, [containerRef]);

	const deselectAll = useCallback(() => {
		setSelectedIds(new Set());
	}, []);

	const toggleSelection = useCallback((itemId: string) => {
		setSelectedIds((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(itemId)) {
				newSet.delete(itemId);
			} else {
				newSet.add(itemId);
			}
			return newSet;
		});
	}, []);

	const isSelected = useCallback(
		(itemId: string) => {
			return selectedIds.has(itemId);
		},
		[selectedIds],
	);

	return {
		selectedIds: Array.from(selectedIds),
		isSelecting,
		selectionBox,
		handleItemClick,
		selectAll,
		deselectAll,
		toggleSelection,
		isSelected,
		selectedCount: selectedIds.size,
	};
};

// Selection box component
export const SelectionBox = ({ box }: { box: SelectionBox | null }) => {
	if (!box) return null;

	const left = Math.min(box.startX, box.endX);
	const top = Math.min(box.startY, box.endY);
	const width = Math.abs(box.endX - box.startX);
	const height = Math.abs(box.endY - box.startY);

	return (
		<div
			className="absolute border-2 border-blue-500 bg-blue-500/10 pointer-events-none z-50"
			style={{
				left: `${left}px`,
				top: `${top}px`,
				width: `${width}px`,
				height: `${height}px`,
			}}
		/>
	);
};

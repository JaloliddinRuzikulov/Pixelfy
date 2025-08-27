import { useState, useEffect, useCallback } from "react";
import { dispatch } from "@designcombo/events";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuShortcut,
	ContextMenuSub,
	ContextMenuSubContent,
	ContextMenuSubTrigger,
	ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
	Copy,
	Clipboard,
	Scissors,
	Trash2,
	Layers,
	Lock,
	Unlock,
	Volume2,
	VolumeX,
	Eye,
	EyeOff,
	RotateCw,
	FlipHorizontal,
	FlipVertical,
	Palette,
	SplitSquareHorizontal,
	Group,
	Ungroup,
	AlignLeft,
	AlignCenter,
	AlignRight,
	AlignStartVertical,
	AlignCenterVertical,
	AlignEndVertical,
	BringToFront,
	SendToBack,
	MoveUp,
	MoveDown,
} from "lucide-react";

interface EditorContextMenuProps {
	children: React.ReactNode;
	selectedItems?: any[];
	onAction?: (action: string) => void;
}

export const EditorContextMenu = ({
	children,
	selectedItems = [],
	onAction,
}: EditorContextMenuProps) => {
	const hasSelection = selectedItems.length > 0;
	const multipleSelected = selectedItems.length > 1;
	const isVideo = selectedItems.some((item) => item.type === "video");
	const isAudio = selectedItems.some((item) => item.type === "audio");
	const hasMedia = isVideo || isAudio;

	const handleAction = (action: string, payload?: any) => {
		dispatch(action, payload);
		onAction?.(action);
	};

	return (
		<ContextMenu>
			<ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
			<ContextMenuContent className="w-64">
				{/* Edit Actions */}
				<ContextMenuItem
					onClick={() => handleAction("CUT_ITEMS")}
					disabled={!hasSelection}
				>
					<Scissors className="mr-2 h-4 w-4" />
					Cut
					<ContextMenuShortcut>Ctrl+X</ContextMenuShortcut>
				</ContextMenuItem>

				<ContextMenuItem
					onClick={() => handleAction("COPY_ITEMS")}
					disabled={!hasSelection}
				>
					<Copy className="mr-2 h-4 w-4" />
					Copy
					<ContextMenuShortcut>Ctrl+C</ContextMenuShortcut>
				</ContextMenuItem>

				<ContextMenuItem onClick={() => handleAction("PASTE_ITEMS")}>
					<Clipboard className="mr-2 h-4 w-4" />
					Paste
					<ContextMenuShortcut>Ctrl+V</ContextMenuShortcut>
				</ContextMenuItem>

				<ContextMenuItem
					onClick={() => handleAction("DUPLICATE_ITEMS")}
					disabled={!hasSelection}
				>
					<Layers className="mr-2 h-4 w-4" />
					Duplicate
					<ContextMenuShortcut>Ctrl+D</ContextMenuShortcut>
				</ContextMenuItem>

				<ContextMenuSeparator />

				<ContextMenuItem
					onClick={() => handleAction("DELETE_ITEMS")}
					disabled={!hasSelection}
					className="text-destructive"
				>
					<Trash2 className="mr-2 h-4 w-4" />
					Delete
					<ContextMenuShortcut>Del</ContextMenuShortcut>
				</ContextMenuItem>

				<ContextMenuSeparator />

				{/* Transform Actions */}
				<ContextMenuSub>
					<ContextMenuSubTrigger disabled={!hasSelection}>
						<RotateCw className="mr-2 h-4 w-4" />
						Transform
					</ContextMenuSubTrigger>
					<ContextMenuSubContent className="w-48">
						<ContextMenuItem onClick={() => handleAction("FLIP_HORIZONTAL")}>
							<FlipHorizontal className="mr-2 h-4 w-4" />
							Flip Horizontal
						</ContextMenuItem>
						<ContextMenuItem onClick={() => handleAction("FLIP_VERTICAL")}>
							<FlipVertical className="mr-2 h-4 w-4" />
							Flip Vertical
						</ContextMenuItem>
						<ContextMenuSeparator />
						<ContextMenuItem onClick={() => handleAction("ROTATE_90")}>
							Rotate 90° CW
						</ContextMenuItem>
						<ContextMenuItem onClick={() => handleAction("ROTATE_NEG_90")}>
							Rotate 90° CCW
						</ContextMenuItem>
						<ContextMenuItem onClick={() => handleAction("ROTATE_180")}>
							Rotate 180°
						</ContextMenuItem>
					</ContextMenuSubContent>
				</ContextMenuSub>

				{/* Align Actions */}
				<ContextMenuSub>
					<ContextMenuSubTrigger disabled={!multipleSelected}>
						<AlignLeft className="mr-2 h-4 w-4" />
						Align
					</ContextMenuSubTrigger>
					<ContextMenuSubContent className="w-48">
						<ContextMenuItem onClick={() => handleAction("ALIGN_LEFT")}>
							<AlignLeft className="mr-2 h-4 w-4" />
							Align Left
						</ContextMenuItem>
						<ContextMenuItem onClick={() => handleAction("ALIGN_CENTER")}>
							<AlignCenter className="mr-2 h-4 w-4" />
							Align Center
						</ContextMenuItem>
						<ContextMenuItem onClick={() => handleAction("ALIGN_RIGHT")}>
							<AlignRight className="mr-2 h-4 w-4" />
							Align Right
						</ContextMenuItem>
						<ContextMenuSeparator />
						<ContextMenuItem onClick={() => handleAction("ALIGN_TOP")}>
							<AlignStartVertical className="mr-2 h-4 w-4" />
							Align Top
						</ContextMenuItem>
						<ContextMenuItem onClick={() => handleAction("ALIGN_MIDDLE")}>
							<AlignCenterVertical className="mr-2 h-4 w-4" />
							Align Middle
						</ContextMenuItem>
						<ContextMenuItem onClick={() => handleAction("ALIGN_BOTTOM")}>
							<AlignEndVertical className="mr-2 h-4 w-4" />
							Align Bottom
						</ContextMenuItem>
					</ContextMenuSubContent>
				</ContextMenuSub>

				{/* Layer Actions */}
				<ContextMenuSub>
					<ContextMenuSubTrigger disabled={!hasSelection}>
						<Layers className="mr-2 h-4 w-4" />
						Layer
					</ContextMenuSubTrigger>
					<ContextMenuSubContent className="w-48">
						<ContextMenuItem onClick={() => handleAction("BRING_TO_FRONT")}>
							<BringToFront className="mr-2 h-4 w-4" />
							Bring to Front
							<ContextMenuShortcut>Ctrl+]</ContextMenuShortcut>
						</ContextMenuItem>
						<ContextMenuItem onClick={() => handleAction("BRING_FORWARD")}>
							<MoveUp className="mr-2 h-4 w-4" />
							Bring Forward
						</ContextMenuItem>
						<ContextMenuItem onClick={() => handleAction("SEND_BACKWARD")}>
							<MoveDown className="mr-2 h-4 w-4" />
							Send Backward
						</ContextMenuItem>
						<ContextMenuItem onClick={() => handleAction("SEND_TO_BACK")}>
							<SendToBack className="mr-2 h-4 w-4" />
							Send to Back
							<ContextMenuShortcut>Ctrl+[</ContextMenuShortcut>
						</ContextMenuItem>
					</ContextMenuSubContent>
				</ContextMenuSub>

				<ContextMenuSeparator />

				{/* Group Actions */}
				{multipleSelected && (
					<>
						<ContextMenuItem onClick={() => handleAction("GROUP_ITEMS")}>
							<Group className="mr-2 h-4 w-4" />
							Group
							<ContextMenuShortcut>Ctrl+G</ContextMenuShortcut>
						</ContextMenuItem>
						<ContextMenuItem onClick={() => handleAction("UNGROUP_ITEMS")}>
							<Ungroup className="mr-2 h-4 w-4" />
							Ungroup
							<ContextMenuShortcut>Ctrl+Shift+G</ContextMenuShortcut>
						</ContextMenuItem>
						<ContextMenuSeparator />
					</>
				)}

				{/* Media Actions */}
				{hasMedia && (
					<>
						<ContextMenuItem onClick={() => handleAction("SPLIT_AT_PLAYHEAD")}>
							<SplitSquareHorizontal className="mr-2 h-4 w-4" />
							Split at Playhead
							<ContextMenuShortcut>S</ContextMenuShortcut>
						</ContextMenuItem>

						{isVideo && (
							<ContextMenuItem onClick={() => handleAction("DETACH_AUDIO")}>
								<Volume2 className="mr-2 h-4 w-4" />
								Detach Audio
							</ContextMenuItem>
						)}

						{isAudio && (
							<ContextMenuItem onClick={() => handleAction("TOGGLE_MUTE")}>
								<VolumeX className="mr-2 h-4 w-4" />
								Toggle Mute
								<ContextMenuShortcut>Ctrl+M</ContextMenuShortcut>
							</ContextMenuItem>
						)}

						<ContextMenuSeparator />
					</>
				)}

				{/* Visibility Actions */}
				<ContextMenuItem
					onClick={() => handleAction("TOGGLE_VISIBILITY")}
					disabled={!hasSelection}
				>
					<Eye className="mr-2 h-4 w-4" />
					Toggle Visibility
				</ContextMenuItem>

				<ContextMenuItem
					onClick={() => handleAction("TOGGLE_LOCK")}
					disabled={!hasSelection}
				>
					<Lock className="mr-2 h-4 w-4" />
					Toggle Lock
					<ContextMenuShortcut>Ctrl+L</ContextMenuShortcut>
				</ContextMenuItem>

				<ContextMenuSeparator />

				{/* Effects */}
				<ContextMenuSub>
					<ContextMenuSubTrigger disabled={!hasSelection}>
						<Palette className="mr-2 h-4 w-4" />
						Effects
					</ContextMenuSubTrigger>
					<ContextMenuSubContent className="w-48">
						<ContextMenuItem onClick={() => handleAction("ADD_FADE_IN")}>
							Fade In
						</ContextMenuItem>
						<ContextMenuItem onClick={() => handleAction("ADD_FADE_OUT")}>
							Fade Out
						</ContextMenuItem>
						<ContextMenuItem onClick={() => handleAction("ADD_TRANSITION")}>
							Add Transition
						</ContextMenuItem>
						<ContextMenuSeparator />
						<ContextMenuItem onClick={() => handleAction("RESET_EFFECTS")}>
							Reset Effects
						</ContextMenuItem>
					</ContextMenuSubContent>
				</ContextMenuSub>

				<ContextMenuSeparator />

				{/* Properties */}
				<ContextMenuItem
					onClick={() => handleAction("SHOW_PROPERTIES")}
					disabled={!hasSelection}
				>
					Properties...
					<ContextMenuShortcut>Alt+Enter</ContextMenuShortcut>
				</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	);
};

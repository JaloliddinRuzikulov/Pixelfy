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
					Kesish
					<ContextMenuShortcut>Ctrl+X</ContextMenuShortcut>
				</ContextMenuItem>

				<ContextMenuItem
					onClick={() => handleAction("COPY_ITEMS")}
					disabled={!hasSelection}
				>
					<Copy className="mr-2 h-4 w-4" />
					Nusxalash
					<ContextMenuShortcut>Ctrl+C</ContextMenuShortcut>
				</ContextMenuItem>

				<ContextMenuItem onClick={() => handleAction("PASTE_ITEMS")}>
					<Clipboard className="mr-2 h-4 w-4" />
					Qo'yish
					<ContextMenuShortcut>Ctrl+V</ContextMenuShortcut>
				</ContextMenuItem>

				<ContextMenuItem
					onClick={() => handleAction("DUPLICATE_ITEMS")}
					disabled={!hasSelection}
				>
					<Layers className="mr-2 h-4 w-4" />
					Dublikat qilish
					<ContextMenuShortcut>Ctrl+D</ContextMenuShortcut>
				</ContextMenuItem>

				<ContextMenuSeparator />

				<ContextMenuItem
					onClick={() => handleAction("DELETE_ITEMS")}
					disabled={!hasSelection}
					className="text-destructive"
				>
					<Trash2 className="mr-2 h-4 w-4" />
					O'chirish
					<ContextMenuShortcut>Del</ContextMenuShortcut>
				</ContextMenuItem>

				<ContextMenuSeparator />

				{/* Transform Actions */}
				<ContextMenuSub>
					<ContextMenuSubTrigger disabled={!hasSelection}>
						<RotateCw className="mr-2 h-4 w-4" />
						O'zgartirish
					</ContextMenuSubTrigger>
					<ContextMenuSubContent className="w-48">
						<ContextMenuItem onClick={() => handleAction("FLIP_HORIZONTAL")}>
							<FlipHorizontal className="mr-2 h-4 w-4" />
							Gorizontal aylantirish
						</ContextMenuItem>
						<ContextMenuItem onClick={() => handleAction("FLIP_VERTICAL")}>
							<FlipVertical className="mr-2 h-4 w-4" />
							Vertikal aylantirish
						</ContextMenuItem>
						<ContextMenuSeparator />
						<ContextMenuItem onClick={() => handleAction("ROTATE_90")}>
							90° o'ngga burish
						</ContextMenuItem>
						<ContextMenuItem onClick={() => handleAction("ROTATE_NEG_90")}>
							90° chapga burish
						</ContextMenuItem>
						<ContextMenuItem onClick={() => handleAction("ROTATE_180")}>
							180° burish
						</ContextMenuItem>
					</ContextMenuSubContent>
				</ContextMenuSub>

				{/* Align Actions */}
				<ContextMenuSub>
					<ContextMenuSubTrigger disabled={!multipleSelected}>
						<AlignLeft className="mr-2 h-4 w-4" />
						Tekislash
					</ContextMenuSubTrigger>
					<ContextMenuSubContent className="w-48">
						<ContextMenuItem onClick={() => handleAction("ALIGN_LEFT")}>
							<AlignLeft className="mr-2 h-4 w-4" />
							Chapga tekislash
						</ContextMenuItem>
						<ContextMenuItem onClick={() => handleAction("ALIGN_CENTER")}>
							<AlignCenter className="mr-2 h-4 w-4" />
							Markazga tekislash
						</ContextMenuItem>
						<ContextMenuItem onClick={() => handleAction("ALIGN_RIGHT")}>
							<AlignRight className="mr-2 h-4 w-4" />
							O'ngga tekislash
						</ContextMenuItem>
						<ContextMenuSeparator />
						<ContextMenuItem onClick={() => handleAction("ALIGN_TOP")}>
							<AlignStartVertical className="mr-2 h-4 w-4" />
							Yuqoriga tekislash
						</ContextMenuItem>
						<ContextMenuItem onClick={() => handleAction("ALIGN_MIDDLE")}>
							<AlignCenterVertical className="mr-2 h-4 w-4" />
							Markazga tekislash (vertikal)
						</ContextMenuItem>
						<ContextMenuItem onClick={() => handleAction("ALIGN_BOTTOM")}>
							<AlignEndVertical className="mr-2 h-4 w-4" />
							Pastga tekislash
						</ContextMenuItem>
					</ContextMenuSubContent>
				</ContextMenuSub>

				{/* Layer Actions */}
				<ContextMenuSub>
					<ContextMenuSubTrigger disabled={!hasSelection}>
						<Layers className="mr-2 h-4 w-4" />
						Qatlam
					</ContextMenuSubTrigger>
					<ContextMenuSubContent className="w-48">
						<ContextMenuItem onClick={() => handleAction("BRING_TO_FRONT")}>
							<BringToFront className="mr-2 h-4 w-4" />
							Eng oldinga
							<ContextMenuShortcut>Ctrl+]</ContextMenuShortcut>
						</ContextMenuItem>
						<ContextMenuItem onClick={() => handleAction("BRING_FORWARD")}>
							<MoveUp className="mr-2 h-4 w-4" />
							Oldinga
						</ContextMenuItem>
						<ContextMenuItem onClick={() => handleAction("SEND_BACKWARD")}>
							<MoveDown className="mr-2 h-4 w-4" />
							Orqaga
						</ContextMenuItem>
						<ContextMenuItem onClick={() => handleAction("SEND_TO_BACK")}>
							<SendToBack className="mr-2 h-4 w-4" />
							Eng orqaga
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
							Guruh
							<ContextMenuShortcut>Ctrl+G</ContextMenuShortcut>
						</ContextMenuItem>
						<ContextMenuItem onClick={() => handleAction("UNGROUP_ITEMS")}>
							<Ungroup className="mr-2 h-4 w-4" />
							Guruhdan chiqarish
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
							Ijro nuqtasida bo'lish
							<ContextMenuShortcut>S</ContextMenuShortcut>
						</ContextMenuItem>

						{isVideo && (
							<ContextMenuItem onClick={() => handleAction("DETACH_AUDIO")}>
								<Volume2 className="mr-2 h-4 w-4" />
								Audioni ajratish
							</ContextMenuItem>
						)}

						{isAudio && (
							<ContextMenuItem onClick={() => handleAction("TOGGLE_MUTE")}>
								<VolumeX className="mr-2 h-4 w-4" />
								Ovozni o'chirish/yoqish
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
					Ko'rinishni almashtirish
				</ContextMenuItem>

				<ContextMenuItem
					onClick={() => handleAction("TOGGLE_LOCK")}
					disabled={!hasSelection}
				>
					<Lock className="mr-2 h-4 w-4" />
					Qulflashni almashtirish
					<ContextMenuShortcut>Ctrl+L</ContextMenuShortcut>
				</ContextMenuItem>

				<ContextMenuSeparator />

				{/* Effects */}
				<ContextMenuSub>
					<ContextMenuSubTrigger disabled={!hasSelection}>
						<Palette className="mr-2 h-4 w-4" />
						Effektlar
					</ContextMenuSubTrigger>
					<ContextMenuSubContent className="w-48">
						<ContextMenuItem onClick={() => handleAction("ADD_FADE_IN")}>
							Ochilish
						</ContextMenuItem>
						<ContextMenuItem onClick={() => handleAction("ADD_FADE_OUT")}>
							So'nish
						</ContextMenuItem>
						<ContextMenuItem onClick={() => handleAction("ADD_TRANSITION")}>
							O'tish qo'shish
						</ContextMenuItem>
						<ContextMenuSeparator />
						<ContextMenuItem onClick={() => handleAction("RESET_EFFECTS")}>
							Effektlarni tiklash
						</ContextMenuItem>
					</ContextMenuSubContent>
				</ContextMenuSub>

				<ContextMenuSeparator />

				{/* Properties */}
				<ContextMenuItem
					onClick={() => handleAction("SHOW_PROPERTIES")}
					disabled={!hasSelection}
				>
					Xususiyatlar...
					<ContextMenuShortcut>Alt+Enter</ContextMenuShortcut>
				</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	);
};

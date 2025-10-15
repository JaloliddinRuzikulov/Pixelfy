import useLayoutStore from "./store/use-layout-store";
import { Icons } from "@/components/shared/icons";
import { cn } from "@/lib/utils";
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerDescription,
} from "@/components/ui/drawer";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { MenuItem } from "./menu-item/menu-item";
import { useIsLargeScreen } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import {
	Upload,
	UserCheck,
	Type,
	Library,
	Sparkles,
	FileSpreadsheet,
	PenTool,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

// Use same configuration as sidebar for consistency
const MENU_ITEMS_CONFIG = [
	{
		id: "media",
		icon: Upload,
		labelKey: "media.media",
	},
	{
		id: "wav2lip",
		icon: UserCheck,
		labelKey: "media.wav2lip",
	},
	{
		id: "texts",
		icon: Type,
		labelKey: "media.texts",
	},
	{
		id: "content-library",
		icon: Library,
		labelKey: "media.contentLibrary",
	},
	{
		id: "presentai",
		icon: Sparkles,
		labelKey: "media.presentai",
	},
	{
		id: "office",
		icon: FileSpreadsheet,
		labelKey: "media.office",
	},
	{
		id: "recording",
		icon: PenTool,
		labelKey: "media.recording",
	},
] as const;

// Define menu item data structure
interface MenuItemData {
	id: string;
	label: string;
	icon: any;
}

// Reusable MenuButton component
interface MenuButtonProps {
	item: MenuItemData;
	isActive: boolean;
	onClick: () => void;
}

function MenuButton({ item, isActive, onClick }: MenuButtonProps) {
	const IconComponent = item.icon;
	return (
		<Button
			onClick={onClick}
			variant={isActive ? "default" : "ghost"}
			size={"sm"}
			className={cn(
				"flex items-center gap-1.5",
				isActive ? "" : "text-muted-foreground",
			)}
		>
			<IconComponent className="w-4 h-4" />
			<span className="text-xs">{item.label}</span>
		</Button>
	);
}

export default function MenuListHorizontal() {
	const t = useTranslations();
	const {
		setActiveMenuItem,
		setShowMenuItem,
		activeMenuItem,
		showMenuItem,
		drawerOpen,
		setDrawerOpen,
	} = useLayoutStore();

	const isLargeScreen = useIsLargeScreen();

	// Create menu items with translations
	const menuItems = useMemo(() => {
		return MENU_ITEMS_CONFIG.map((item) => ({
			id: item.id,
			icon: item.icon,
			label: t(item.labelKey),
		}));
	}, [t]);

	const handleMenuItemClick = (menuItem: string) => {
		// Agar bir xil menu item ni bosgan bo'lsa, collapse qil
		if (activeMenuItem === menuItem && drawerOpen) {
			setDrawerOpen(false);
			return;
		}

		setActiveMenuItem(menuItem as any);
		// Use drawer on mobile, sidebar on desktop
		if (!isLargeScreen) {
			setDrawerOpen(true);
		} else {
			setShowMenuItem(true);
		}
	};

	const isMenuItemActive = (itemId: string) => {
		return (
			(drawerOpen && activeMenuItem === itemId) ||
			(showMenuItem && activeMenuItem === itemId)
		);
	};

	return (
		<>
			<div className="flex h-12 items-center border-t bg-muted/30">
				<ScrollArea className="w-full px-2">
					<div className="flex items-center justify-center space-x-2 min-w-max px-2">
						{menuItems.map((item) => (
							<MenuButton
								key={item.id}
								item={item}
								isActive={isMenuItemActive(item.id)}
								onClick={() => handleMenuItemClick(item.id)}
							/>
						))}
					</div>
					<ScrollBar orientation="horizontal" />
				</ScrollArea>
			</div>

			{/* Drawer only on mobile/tablet - conditionally mounted */}
			{!isLargeScreen && (
				<Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
					<DrawerContent className="max-h-[80vh] min-h-[340px] mt-0">
						<VisuallyHidden>
							<DrawerHeader>
								<DrawerTitle>Menu Options</DrawerTitle>
								<DrawerDescription>
									Select from available menu options
								</DrawerDescription>
							</DrawerHeader>
						</VisuallyHidden>

						<div className="flex-1">
							<MenuItem />
						</div>
					</DrawerContent>
				</Drawer>
			)}
		</>
	);
}

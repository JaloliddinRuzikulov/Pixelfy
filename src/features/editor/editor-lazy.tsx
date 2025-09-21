"use client";

import { lazy, Suspense } from "react";
import { Film } from "lucide-react";

// Lazy load heavy components
const Timeline = lazy(() => import("./timeline"));
const Scene = lazy(() => import("./scene"));
const MenuList = lazy(() => import("./menu-list"));
const ControlMenuList = lazy(() => import("./control-menu-list"));
const CropModal = lazy(() => import("./crop-modal/crop-modal"));

// Loading component for lazy loaded sections
export function SectionLoader({ name = "component" }: { name?: string }) {
	return (
		<div className="flex h-full w-full items-center justify-center bg-background/50">
			<div className="flex items-center gap-2 text-muted-foreground">
				<div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
				<span className="text-xs">Loading {name}...</span>
			</div>
		</div>
	);
}

// Export wrapped components with loading states
export function LazyTimeline(props: any) {
	return (
		<Suspense fallback={<SectionLoader name="timeline" />}>
			<Timeline {...props} />
		</Suspense>
	);
}

export function LazyScene(props: any) {
	return (
		<Suspense fallback={<SectionLoader name="preview" />}>
			<Scene {...props} />
		</Suspense>
	);
}

export function LazyMenuList(props: any) {
	return (
		<Suspense fallback={<SectionLoader name="menu" />}>
			<MenuList {...props} />
		</Suspense>
	);
}

export function LazyControlMenuList(props: any) {
	return (
		<Suspense fallback={<SectionLoader name="controls" />}>
			<ControlMenuList {...props} />
		</Suspense>
	);
}

export function LazyCropModal(props: any) {
	return (
		<Suspense fallback={null}>
			<CropModal {...props} />
		</Suspense>
	);
}

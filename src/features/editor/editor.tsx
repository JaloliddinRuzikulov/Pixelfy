"use client";
import Timeline from "./timeline";
import useStore from "./store/use-store";
import Navbar from "./navbar";
import useTimelineEvents from "./hooks/use-timeline-events";
import Scene from "./scene";
import { SceneRef } from "./scene/scene.types";
import StateManager, { DESIGN_LOAD } from "@designcombo/state";
import { useEffect, useRef, useState } from "react";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ImperativePanelHandle } from "react-resizable-panels";
import { getCompactFontData, loadFonts } from "./utils/fonts";
import { SECONDARY_FONT, SECONDARY_FONT_URL } from "./constants/constants";
import MenuList from "./menu-list";
import { MenuItem } from "./menu-item";
import ControlMenuList from "./control-menu-list";
import CropModal from "./crop-modal/crop-modal";
import useDataState from "./store/use-data-state";
import { LOCAL_FONTS, loadAllLocalFonts } from "./data/local-fonts";
import FloatingControl from "./control-item/floating-controls/floating-control";
import { useSceneStore } from "@/store/use-scene-store";
import { dispatch } from "@designcombo/events";
import MenuListHorizontal from "./menu-list-horizontal";
import { useIsLargeScreen } from "@/hooks/use-media-query";
import { ITrackItem } from "@designcombo/types";
import useLayoutStore from "./store/use-layout-store";
import ControlItemHorizontal from "./control-item-horizontal";
import { useSimpleKeyboardShortcuts } from "./hooks/use-simple-keyboard-shortcuts";
import { KeyboardHelp } from "./components/keyboard-help";
import { useChromaKeyEvents } from "./hooks/use-chroma-key-events";
import { useStateManagerEvents } from "./hooks/use-state-manager-events";
import { useTranslations } from "next-intl";

const stateManager = new StateManager({
	size: {
		width: 1080,
		height: 1920,
	},
	duration: 30000,
	tracks: [
		{
			id: "main",
			type: "main",
			items: [],
			magnetic: false,
			static: false,
		},
	],
	trackItemIds: [],
	trackItemsMap: {},
	transitionIds: [],
	transitionsMap: {},
	activeIds: [],
});

const Editor = ({
	tempId,
	id,
	projectId,
}: { tempId?: string; id?: string; projectId?: string | null }) => {
	const t = useTranslations("editor");
	const [projectName, setProjectName] = useState<string>(t("untitledVideo"));
	const [currentProjectId, setCurrentProjectId] = useState<string | null>(
		projectId || null,
	);
	const { scene } = useSceneStore();
	const timelinePanelRef = useRef<ImperativePanelHandle>(null);
	const sceneRef = useRef<SceneRef>(null);
	const { timeline, playerRef } = useStore();
	const { activeIds, trackItemsMap, transitionsMap } = useStore();
	const [loaded, setLoaded] = useState(false);
	const [trackItem, setTrackItem] = useState<ITrackItem | null>(null);
	const {
		setTrackItem: setLayoutTrackItem,
		setFloatingControl,
		setLabelControlItem,
		setTypeControlItem,
		showMenuItem,
	} = useLayoutStore();
	const isLargeScreen = useIsLargeScreen();
	const editorRef = useRef<HTMLDivElement>(null);

	useTimelineEvents();
	useSimpleKeyboardShortcuts(true);
	useChromaKeyEvents();
	useStateManagerEvents(stateManager);

	const { setCompactFonts, setFonts } = useDataState();

	// StateManager event handlers are initialized via useStateManagerEvents hook

	// Load project data if projectId is provided
	useEffect(() => {
		if (projectId) {
			const projects = localStorage.getItem("video-editor-projects");
			if (projects) {
				const projectsList = JSON.parse(projects);
				const project = projectsList.find((p: any) => p.id === projectId);
				if (project) {
					setProjectName(project.name);
					setCurrentProjectId(project.id);

					// Load project state if exists
					const projectState = localStorage.getItem(
						`project-state-${projectId}`,
					);
					if (projectState) {
						const state = JSON.parse(projectState);
						dispatch(DESIGN_LOAD, { payload: state });
					}
				}
			}
		}
	}, [projectId]);

	// Auto-save project state
	useEffect(() => {
		if (!currentProjectId) return;

		const saveInterval = setInterval(() => {
			const state = stateManager.getState();
			localStorage.setItem(
				`project-state-${currentProjectId}`,
				JSON.stringify(state),
			);

			// Update project in projects list
			const projects = localStorage.getItem("video-editor-projects");
			if (projects) {
				const projectsList = JSON.parse(projects);
				const projectIndex = projectsList.findIndex(
					(p: any) => p.id === currentProjectId,
				);
				if (projectIndex !== -1) {
					projectsList[projectIndex].name = projectName;
					projectsList[projectIndex].updatedAt = new Date();
					localStorage.setItem(
						"video-editor-projects",
						JSON.stringify(projectsList),
					);
				}
			}
		}, 5000); // Auto-save every 5 seconds

		return () => clearInterval(saveInterval);
	}, [currentProjectId, projectName]);

	useEffect(() => {
		if (tempId) {
			const fetchVideoJson = async () => {
				try {
					// Use local API instead of external combo.sh
					const response = await fetch(`/api/local-video-json/${id}`);
					if (!response.ok) {
						throw new Error(`HTTP error! status: ${response.status}`);
					}
					const data = await response.json();

					const payload = data.videoJson.json;
					if (payload) {
						dispatch(DESIGN_LOAD, { payload });
					}
				} catch (error) {
					console.error("Error fetching video JSON:", error);
				}
			};
			fetchVideoJson();
		}

		if (id) {
			const fetchSceneById = async () => {
				try {
					const response = await fetch(`/api/scene/${id}`);
					if (!response.ok) {
						throw new Error(`HTTP error! status: ${response.status}`);
					}
					const data = await response.json();
					console.log("Fetched scene data:", data);

					if (data.success && data.scene) {
						// Set project name if available
						if (data.project?.name) {
							setProjectName(data.project.name);
						}

						// Load the scene content into the editor
						if (data.scene.content) {
							dispatch(DESIGN_LOAD, { payload: data.scene.content });
						}
					} else {
						console.error("Failed to fetch scene:", data.error);
					}
				} catch (error) {
					console.error("Error fetching scene by ID:", error);
				}
			};
			fetchSceneById();
		}
	}, [id, tempId]);

	useEffect(() => {
		console.log("scene", scene);
		console.log("timeline", timeline);
		if (scene && timeline) {
			console.log("scene", scene);
			dispatch(DESIGN_LOAD, { payload: scene });
		}
	}, [scene, timeline]);

	useEffect(() => {
		// Load local fonts instead of Google Fonts
		// Convert LOCAL_FONTS to IFont format
		const iFonts = LOCAL_FONTS.map((font) => ({
			id: font.id,
			family: font.family,
			fullName: font.name,
			postScriptName: font.name.replace(/\s+/g, "-"),
			preview: font.url,
			style: font.style,
			url: font.url,
			category: font.category,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			userId: null,
		}));

		// Group fonts by family
		const fontsByFamily = iFonts.reduce(
			(acc, font) => {
				if (!acc[font.family]) {
					acc[font.family] = [];
				}
				acc[font.family].push(font);
				return acc;
			},
			{} as Record<string, typeof iFonts>,
		);

		// Create compact fonts
		const compactFonts = Object.entries(fontsByFamily).map(
			([family, fonts]) => ({
				family,
				name: fonts[0].fullName,
				styles: fonts,
				default: fonts[0],
			}),
		);

		setCompactFonts(compactFonts);
		setFonts(iFonts);

		// Load all local fonts
		loadAllLocalFonts().catch(console.error);
	}, []);

	useEffect(() => {
		const screenHeight = window.innerHeight;
		const desiredHeight = 300;
		const percentage = (desiredHeight / screenHeight) * 100;
		timelinePanelRef.current?.resize(percentage);
	}, []);

	const handleTimelineResize = () => {
		const timelineContainer = document.getElementById("timeline-container");
		if (!timelineContainer) return;

		timeline?.resize(
			{
				height: timelineContainer.clientHeight - 90,
				width: timelineContainer.clientWidth - 40,
			},
			{
				force: true,
			},
		);

		// Trigger zoom recalculation when timeline is resized
		setTimeout(() => {
			sceneRef.current?.recalculateZoom();
		}, 100);
	};

	useEffect(() => {
		const onResize = () => handleTimelineResize();
		window.addEventListener("resize", onResize);
		return () => window.removeEventListener("resize", onResize);
	}, [timeline]);

	useEffect(() => {
		if (activeIds.length === 1) {
			const [id] = activeIds;
			const trackItem = trackItemsMap[id];
			if (trackItem) {
				setTrackItem(trackItem);
				setLayoutTrackItem(trackItem);
			} else console.log(transitionsMap[id]);
		} else {
			setTrackItem(null);
			setLayoutTrackItem(null);
		}
	}, [activeIds, trackItemsMap]);

	useEffect(() => {
		setFloatingControl("");
		setLabelControlItem("");
		setTypeControlItem("");
	}, [isLargeScreen]);

	useEffect(() => {
		setLoaded(true);
	}, []);

	return (
		<div className="flex h-screen w-screen flex-col bg-gradient-to-br from-background via-background/98 to-muted/10">
			<KeyboardHelp />
			<Navbar
				projectName={projectName}
				user={null}
				stateManager={stateManager}
				setProjectName={setProjectName}
			/>
			<div className="flex flex-1">
				<ResizablePanelGroup
					style={{ flex: 1 }}
					direction="horizontal"
					autoSaveId="editor-horizontal-layout"
				>
					{isLargeScreen && (
						<>
							<ResizablePanel
								id="sidebar"
								order={1}
								defaultSize={showMenuItem ? 20 : 5}
								minSize={showMenuItem ? 15 : 5}
								maxSize={showMenuItem ? 35 : 5}
								collapsible={false}
								className="flex flex-none h-[calc(100vh-56px)]"
							>
								<MenuList />
								{showMenuItem && <MenuItem />}
							</ResizablePanel>
							{showMenuItem && (
								<ResizableHandle
									withHandle
									className="w-1 bg-border hover:bg-primary/60 transition-colors"
								/>
							)}
						</>
					)}
					<ResizablePanel
						id="main-content"
						order={2}
						defaultSize={isLargeScreen ? (showMenuItem ? 80 : 95) : 100}
					>
						<ResizablePanelGroup style={{ flex: 1 }} direction="vertical">
							<ResizablePanel
								className="relative border-r-2 border-border"
								defaultSize={70}
							>
								<FloatingControl />
								<div className="flex h-full flex-1">
									{/* Sidebar only on large screens - conditionally mounted */}

									<div
										style={{
											width: "100%",
											height: "100%",
											position: "relative",
											flex: 1,
											overflow: "hidden",
										}}
									>
										<CropModal />
										<Scene ref={sceneRef} stateManager={stateManager} />
									</div>
								</div>
							</ResizablePanel>
							<ResizableHandle className="bg-border hover:bg-primary/60 transition-colors h-1" />
							<ResizablePanel
								className="min-h-[50px] border-t-2 border-border border-r-2"
								ref={timelinePanelRef}
								defaultSize={30}
								onResize={handleTimelineResize}
							>
								{playerRef && <Timeline stateManager={stateManager} />}
							</ResizablePanel>
							{!isLargeScreen && !trackItem && loaded && <MenuListHorizontal />}
							{!isLargeScreen && trackItem && <ControlItemHorizontal />}
						</ResizablePanelGroup>
					</ResizablePanel>
				</ResizablePanelGroup>
				<ControlMenuList />
			</div>
		</div>
	);
};

export default Editor;

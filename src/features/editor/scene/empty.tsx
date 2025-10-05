import useStore from "../store/use-store";
import { useEffect, useRef, useState } from "react";
import { Droppable } from "@/components/ui/droppable";
import { PlusIcon } from "lucide-react";
import { DroppableArea } from "./droppable";
import { dispatch } from "@designcombo/events";
import { ADD_IMAGE, ADD_VIDEO, ADD_AUDIO } from "@designcombo/state";
import { generateId } from "@designcombo/timeline";
import { toast } from "sonner";

const SceneEmpty = () => {
	const [isLoading, setIsLoading] = useState(true);
	const containerRef = useRef<HTMLDivElement>(null);
	const [isDraggingOver, setIsDraggingOver] = useState(false);
	const [desiredSize, setDesiredSize] = useState({ width: 0, height: 0 });
	const { size } = useStore();

	useEffect(() => {
		const container = containerRef.current!;
		const PADDING = 96;
		const containerHeight = container.clientHeight - PADDING;
		const containerWidth = container.clientWidth - PADDING;
		const { width, height } = size;

		const desiredZoom = Math.min(
			containerWidth / width,
			containerHeight / height,
		);
		setDesiredSize({
			width: width * desiredZoom,
			height: height * desiredZoom,
		});
		setIsLoading(false);
	}, [size]);

	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleButtonClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		fileInputRef.current?.click();
	};

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);
		if (!files || files.length === 0) return;

		const options = {
			targetTrackId: "main",
		};

		for (const file of files) {
			const fileType = file.type.split("/")[0];
			const objectUrl = URL.createObjectURL(file);

			const basePayload = {
				id: generateId(),
				name: file.name,
				src: objectUrl,
				file: file,
			};

			try {
				switch (fileType) {
					case "image":
						dispatch(ADD_IMAGE, {
							payload: {
								...basePayload,
								details: {
									width: 0,
									height: 0,
								},
							},
							options,
						});
						toast.success(`Image "${file.name}" qo'shildi`);
						break;
					case "video":
						dispatch(ADD_VIDEO, {
							payload: {
								...basePayload,
								details: {
									width: 0,
									height: 0,
									duration: 0,
								},
							},
							options,
						});
						toast.success(`Video "${file.name}" qo'shildi`);
						break;
					case "audio":
						dispatch(ADD_AUDIO, {
							payload: {
								...basePayload,
								details: {
									duration: 0,
								},
							},
							options,
						});
						toast.success(`Audio "${file.name}" qo'shildi`);
						break;
					default:
						toast.error(`Fayl turi qo'llab-quvvatlanmaydi: ${file.type}`);
				}
			} catch (error) {
				console.error("Error adding file:", error);
				toast.error(`Xatolik: ${file.name} qo'shib bo'lmadi`);
			}
		}

		// Reset input
		if (e.target) {
			e.target.value = "";
		}
	};

	return (
		<div ref={containerRef} className="absolute z-50 flex h-full w-full flex-1">
			{!isLoading ? (
				<DroppableArea
					onDragStateChange={setIsDraggingOver}
					className={`absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center border border-dashed text-center ${
						isDraggingOver ? "border-white bg-white/10" : "border-white/15"
					}`}
					style={{
						width: desiredSize.width,
						height: desiredSize.height,
					}}
				>
					<input
						ref={fileInputRef}
						type="file"
						multiple
						accept="image/*,video/*,audio/*"
						onChange={handleFileChange}
						className="hidden"
					/>
					<div className="flex flex-col items-center justify-center gap-4 pb-12">
						<button
							onClick={handleButtonClick}
							className="cursor-pointer rounded-md border bg-primary p-2 text-secondary hover:bg-primary/90"
							type="button"
						>
							<PlusIcon className="h-5 w-5" aria-hidden="true" />
						</button>
						<div className="flex flex-col gap-px pointer-events-none">
							<p className="text-sm text-muted-foreground">
								Yuklash uchun + tugmasini bosing
							</p>
							<p className="text-xs text-muted-foreground/70">
								Yoki fayllarni shu yerga tashlang
							</p>
						</div>
					</div>
				</DroppableArea>
			) : (
				<div className="flex flex-1 items-center justify-center bg-background-subtle text-sm text-muted-foreground">
					Loading...
				</div>
			)}
		</div>
	);
};

export default SceneEmpty;

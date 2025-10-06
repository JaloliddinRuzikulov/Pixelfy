import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useDownloadState } from "./store/use-download-state";
import { Button } from "@/components/ui/button";
import { CircleCheckIcon, XIcon } from "lucide-react";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { download } from "@/utils/download";

const DownloadProgressModal = () => {
	const { progress, displayProgressModal, output, actions } =
		useDownloadState();
	const isCompleted = progress === 100;

	const handleDownload = async () => {
		if (output?.url) {
			await download(output.url, "untitled.mp4");
			console.log("downloading");
		}
	};
	return (
		<Dialog
			open={displayProgressModal}
			onOpenChange={actions.setDisplayProgressModal}
		>
			<DialogContent className="flex h-[627px] flex-col gap-0 bg-background p-0 sm:max-w-[844px]">
				<DialogTitle className="hidden" />
				<DialogDescription className="hidden" />
				<XIcon
					onClick={() => actions.setDisplayProgressModal(false)}
					className="absolute right-4 top-5 h-5 w-5 text-zinc-400 hover:cursor-pointer hover:text-zinc-500"
				/>
				<div className="flex h-16 items-center border-b px-4 font-medium">
					Yuklab olish
				</div>
				{isCompleted ? (
					<div className="flex flex-1 flex-col items-center justify-center gap-2 space-y-4">
						<div className="flex flex-col items-center space-y-1 text-center">
							<div className="font-semibold">
								<CircleCheckIcon />
							</div>
							<div className="font-bold">Eksport qilindi</div>
							<div className="text-muted-foreground">
								Videoni qurilmangizga yuklab olishingiz mumkin.
							</div>
						</div>
						<Button onClick={handleDownload}>Yuklab olish</Button>
					</div>
				) : (
					<div className="flex flex-1 flex-col items-center justify-center gap-4">
						<div className="text-5xl font-semibold font-heading">
							{Math.floor(progress)}%
						</div>
						<div className="font-bold">Eksport qilinmoqda...</div>
						<div className="text-center text-zinc-500">
							<div>Brauzerni yopish eksportni bekor qilmaydi.</div>
							<div>Video sizning bo'limingizda saqlanadi.</div>
						</div>
						<Button variant={"outline"}>Bekor qilish</Button>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
};

export default DownloadProgressModal;

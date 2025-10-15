import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ADD_AUDIO } from "@designcombo/state";
import { dispatch } from "@designcombo/events";
import { generateId } from "@designcombo/timeline";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

const VOICES = [
	{ id: "alloy", name: "Alloy", desc: "Balanced, natural" },
	{ id: "echo", name: "Echo", desc: "Clear, professional" },
	{ id: "fable", name: "Fable", desc: "Warm, storytelling" },
	{ id: "nova", name: "Nova", desc: "Young, energetic" },
	{ id: "onyx", name: "Onyx", desc: "Deep, confident" },
	{ id: "shimmer", name: "Shimmer", desc: "Soft, gentle" },
];

export const VoiceOver = () => {
	const [text, setText] = useState("");
	const [voice, setVoice] = useState("alloy");
	const [isGenerating, setIsGenerating] = useState(false);

	const generateVoiceOver = async () => {
		if (!text.trim()) {
			toast.error("Please enter some text");
			return;
		}

		setIsGenerating(true);

		try {
			// Mock API call - replace with real implementation
			await new Promise((resolve) => setTimeout(resolve, 2000));

			// Add to timeline with mock audio
			dispatch(ADD_AUDIO, {
				payload: {
					id: generateId(),
					details: {
						src: "https://cdn.designcombo.dev/audio/lofi-study-112191.mp3",
						name: "AI Voice Over",
					},
					metadata: {
						text: text.trim(),
						voice: voice,
					},
				},
				options: {},
			});

			toast.success("Voice over added to timeline!");
			setText("");
		} catch (error) {
			toast.error("Failed to generate voice over");
		} finally {
			setIsGenerating(false);
		}
	};

	return (
		<div className="flex h-full flex-col overflow-hidden">
			<div className="flex h-12 flex-none items-center px-4 text-xs sm:text-sm font-medium border-b border-border/20">
				Generate AI voice over
			</div>

			<ScrollArea className="flex-1 overflow-auto">
				<div className="p-4 space-y-4">
					{/* Text Input */}
					<div className="space-y-2">
						<Label className="text-xs sm:text-sm font-medium">
							Text to speech
						</Label>
						<Textarea
							placeholder="Enter your text here..."
							value={text}
							onChange={(e) => setText(e.target.value)}
							className="min-h-[120px] resize-none"
							maxLength={500}
						/>
						<div className="text-xs text-muted-foreground text-right">
							{text.length}/500 characters
						</div>
					</div>

					{/* Voice Selection */}
					<div className="space-y-2">
						<Label className="text-xs sm:text-sm font-medium">
							Choose voice
						</Label>
						<div className="grid grid-cols-1 gap-1.5">
							{VOICES.map((v) => (
								<Card
									key={v.id}
									className={`cursor-pointer border  hover:bg-muted/50 ${voice === v.id ? "border-primary bg-primary/5" : "border-border"}`}
									onClick={() => setVoice(v.id)}
								>
									<CardContent className="p-2.5">
										<div className="flex items-center justify-between">
											<div>
												<div className="font-medium text-xs sm:text-sm">
													{v.name}
												</div>
												<div className="text-xs sm:text-sm text-muted-foreground">
													{v.desc}
												</div>
											</div>
											<div
												className={`w-3 h-3 rounded-full border-2 ${voice === v.id ? "border-primary bg-primary" : "border-muted-foreground"}`}
											/>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					</div>
				</div>
			</ScrollArea>

			<div className="p-4 border-t flex-none">
				<Button
					onClick={generateVoiceOver}
					disabled={!text.trim() || isGenerating}
					className="w-full text-xs sm:text-sm"
				>
					{isGenerating ? (
						<>
							<Loader2 className="w-4 h-4 mr-2 " />
							Generating...
						</>
					) : (
						<>
							<Sparkles className="w-4 h-4 mr-2" />
							Generate Voice Over
						</>
					)}
				</Button>
			</div>
		</div>
	);
};

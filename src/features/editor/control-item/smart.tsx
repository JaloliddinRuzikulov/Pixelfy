import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wand2, Sparkles, Palette, Type } from "lucide-react";
import useLayoutStore from "../store/use-layout-store";
import { dispatch } from "@designcombo/events";
import { EDIT_TEXT } from "@designcombo/state";

const Smart = () => {
	const [prompt, setPrompt] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const { trackItem } = useLayoutStore();

	const handleAIEnhance = async (type: string) => {
		if (!prompt && type !== "auto-enhance") return;

		setIsLoading(true);

		// Simulate AI processing
		setTimeout(() => {
			// Mock AI responses based on type
			let enhancedText = "";

			switch (type) {
				case "rewrite":
					enhancedText =
						"This is an AI-enhanced version of your text with improved clarity and impact.";
					break;
				case "expand":
					enhancedText =
						"Your original text has been expanded with additional context and details to provide more comprehensive information.";
					break;
				case "summarize":
					enhancedText = "Key points: Enhanced, Improved, Optimized.";
					break;
				case "auto-enhance":
					if (trackItem?.type === "text") {
						enhancedText = "✨ AI-Enhanced Text ✨";
					}
					break;
			}

			if (enhancedText && trackItem?.id) {
				dispatch(EDIT_TEXT, {
					payload: {
						[trackItem.id]: {
							details: {
								text: enhancedText,
							},
						},
					},
				});
			}

			setIsLoading(false);
			setPrompt("");
		}, 1500);
	};

	const handleStyleSuggestion = (style: string) => {
		// Mock style application
		console.log(`Applying ${style} style to element`);
	};

	return (
		<div className="flex flex-1 flex-col">
			<ScrollArea className="flex-1">
				<div className="text-md text-text-primary flex h-12 flex-none items-center px-4 font-medium">
					<Wand2 className="mr-2 h-4 w-4" />
					AI Assistant
				</div>

				<Tabs defaultValue="enhance" className="w-full px-4">
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="enhance">Enhance</TabsTrigger>
						<TabsTrigger value="style">Style</TabsTrigger>
					</TabsList>

					<TabsContent value="enhance" className="space-y-4">
						<div className="space-y-2">
							<p className="text-sm text-muted-foreground">
								AI-powered text enhancement
							</p>
							<Textarea
								placeholder="Describe what you want to change..."
								value={prompt}
								onChange={(e) => setPrompt(e.target.value)}
								className="min-h-[100px]"
							/>
						</div>

						<div className="grid grid-cols-2 gap-2">
							<Button
								size="sm"
								variant="outline"
								onClick={() => handleAIEnhance("rewrite")}
								disabled={isLoading || !prompt}
							>
								<Type className="mr-1 h-3 w-3" />
								Rewrite
							</Button>
							<Button
								size="sm"
								variant="outline"
								onClick={() => handleAIEnhance("expand")}
								disabled={isLoading || !prompt}
							>
								Expand
							</Button>
							<Button
								size="sm"
								variant="outline"
								onClick={() => handleAIEnhance("summarize")}
								disabled={isLoading || !prompt}
							>
								Summarize
							</Button>
							<Button
								size="sm"
								variant="outline"
								onClick={() => handleAIEnhance("auto-enhance")}
								disabled={isLoading}
							>
								<Sparkles className="mr-1 h-3 w-3" />
								Auto
							</Button>
						</div>
					</TabsContent>

					<TabsContent value="style" className="space-y-4">
						<p className="text-sm text-muted-foreground">AI-suggested styles</p>

						<div className="space-y-2">
							<Button
								size="sm"
								variant="outline"
								className="w-full justify-start"
								onClick={() => handleStyleSuggestion("modern")}
							>
								<Palette className="mr-2 h-4 w-4" />
								Modern & Clean
							</Button>
							<Button
								size="sm"
								variant="outline"
								className="w-full justify-start"
								onClick={() => handleStyleSuggestion("playful")}
							>
								<Sparkles className="mr-2 h-4 w-4" />
								Playful & Fun
							</Button>
							<Button
								size="sm"
								variant="outline"
								className="w-full justify-start"
								onClick={() => handleStyleSuggestion("professional")}
							>
								Professional
							</Button>
							<Button
								size="sm"
								variant="outline"
								className="w-full justify-start"
								onClick={() => handleStyleSuggestion("cinematic")}
							>
								Cinematic
							</Button>
						</div>
					</TabsContent>
				</Tabs>

				{isLoading && (
					<div className="mt-4 px-4">
						<div className="rounded-lg bg-muted p-3 text-center text-sm">
							AI is processing...
						</div>
					</div>
				)}
			</ScrollArea>
		</div>
	);
};

export default Smart;

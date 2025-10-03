"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	FileUp,
	FileText,
	Presentation,
	Image as ImageIcon,
	Download,
	Loader2,
	CheckCircle2,
	XCircle,
	ChevronRight,
	Layers,
	FileSpreadsheet,
	Info,
	Trash2,
	Eye,
	Upload,
	FolderOpen,
} from "lucide-react";
import { dispatch } from "@designcombo/events";
import { generateId } from "@designcombo/timeline";
import { ADD_ITEMS } from "@designcombo/state";
import { IImage } from "@designcombo/types";

interface ConvertedDocument {
	id: string;
	name: string;
	type: "pdf" | "ppt" | "pptx";
	pages: string[];
	thumbnails: string[];
	pageCount: number;
	timestamp: number;
}

interface ConversionStatus {
	isConverting: boolean;
	progress: number;
	message: string;
	error?: string;
}

export function Office() {
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [conversionStatus, setConversionStatus] = useState<ConversionStatus>({
		isConverting: false,
		progress: 0,
		message: "",
	});
	const [convertedDocuments, setConvertedDocuments] = useState<
		ConvertedDocument[]
	>([]);
	const [selectedDocument, setSelectedDocument] =
		useState<ConvertedDocument | null>(null);
	const [previewImage, setPreviewImage] = useState<string | null>(null);

	const handleFileSelect = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const file = event.target.files?.[0];
			if (!file) return;

			const validTypes = [
				"application/pdf",
				"application/vnd.ms-powerpoint",
				"application/vnd.openxmlformats-officedocument.presentationml.presentation",
			];
			const fileType = file.type;

			if (
				!validTypes.includes(fileType) &&
				!file.name.match(/\.(pdf|ppt|pptx)$/i)
			) {
				setConversionStatus({
					isConverting: false,
					progress: 0,
					message: "",
					error: "Faqat PDF, PPT va PPTX fayllar qo'llab-quvvatlanadi",
				});
				return;
			}

			setSelectedFile(file);
			setConversionStatus({
				isConverting: false,
				progress: 0,
				message: "",
				error: undefined,
			});
		},
		[],
	);

	const handleConvert = useCallback(async () => {
		if (!selectedFile) return;

		setConversionStatus({
			isConverting: true,
			progress: 10,
			message: "Fayl yuklanmoqda...",
		});

		try {
			const formData = new FormData();
			formData.append("file", selectedFile);
			formData.append("output_format", "PNG");
			formData.append("dpi", "150");

			// Use web app API proxy instead of direct office service URL
			const endpoint = selectedFile.name.toLowerCase().endsWith(".pdf")
				? "/api/office/convert/pdf"
				: "/api/office/convert/powerpoint";

			setConversionStatus({
				isConverting: true,
				progress: 30,
				message: "Fayl konvertatsiya qilinmoqda...",
			});

			const response = await fetch(endpoint, {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				throw new Error(`Konvertatsiya xatosi: ${response.statusText}`);
			}

			setConversionStatus({
				isConverting: true,
				progress: 70,
				message: "Rasmlar yuklanmoqda...",
			});

			const data = await response.json();

			// Log the response for debugging
			console.log("Office service response:", data);

			// Create converted document object
			const fileType = selectedFile.name.toLowerCase().endsWith(".pdf")
				? "pdf"
				: selectedFile.name.toLowerCase().endsWith(".ppt")
					? "ppt"
					: "pptx";

			// Use images array from API response (already has correct proxy URLs)
			const imageUrls = data.images || data.download_urls || [];

			console.log("Image URLs from API:", imageUrls);

			const convertedDoc: ConvertedDocument = {
				id: data.session_id || generateId(),
				name: selectedFile.name || data.file_name,
				type: fileType,
				pages: imageUrls,
				thumbnails: imageUrls,
				pageCount: data.page_count || data.slide_count || imageUrls.length,
				timestamp: Date.now(),
			};

			setConvertedDocuments((prev) => [convertedDoc, ...prev]);
			setSelectedDocument(convertedDoc);
			setSelectedFile(null);

			setConversionStatus({
				isConverting: false,
				progress: 100,
				message: "Konvertatsiya muvaffaqiyatli yakunlandi!",
			});

			// Reset status after 3 seconds
			setTimeout(() => {
				setConversionStatus({
					isConverting: false,
					progress: 0,
					message: "",
				});
			}, 3000);
		} catch (error) {
			console.error("Conversion error:", error);
			setConversionStatus({
				isConverting: false,
				progress: 0,
				message: "",
				error:
					error instanceof Error
						? error.message
						: "Konvertatsiya xatosi yuz berdi. Office service ishga tushirilganini tekshiring.",
			});
		}
	}, [selectedFile]);

	const handleAddToTimeline = useCallback(
		(doc: ConvertedDocument, pageIndex?: number) => {
			const pagesToAdd =
				pageIndex !== undefined ? [doc.pages[pageIndex]] : doc.pages;
			const trackItems: Partial<IImage>[] = [];

			pagesToAdd.forEach((pageUrl, index) => {
				const actualIndex = pageIndex !== undefined ? pageIndex : index;
				const imageItem: Partial<IImage> = {
					id: generateId(),
					type: "image" as const,
					display: {
						from: 0,
						to: 5000,
					},
					trim: {
						from: 0,
						to: 5000,
					},
					duration: 5000,
					details: {
						src: pageUrl,
					},
					metadata: {
						previewUrl: doc.thumbnails[actualIndex] || pageUrl,
						name: `${doc.name} - Sahifa ${actualIndex + 1}`,
						originalDimensions: {
							width: 1920,
							height: 1080,
						},
					},
				};
				trackItems.push(imageItem);

				// Log for debugging
				console.log(`Adding slide ${actualIndex + 1} to timeline:`, {
					url: pageUrl,
					name: imageItem.metadata?.name,
				});
			});

			// Dispatch all items at once
			dispatch(ADD_ITEMS, {
				payload: {
					trackItems: trackItems,
				},
			});

			// Show success message
			const pageCount = pagesToAdd.length;
			const message =
				pageCount > 1
					? `${pageCount} ta sahifa timeline'ga qo'shildi`
					: "Sahifa timeline'ga qo'shildi";

			console.log(message);

			// Also log the full payload for debugging
			console.log("Dispatched track items:", trackItems);
		},
		[],
	);

	const handleDeleteDocument = useCallback(
		(docId: string) => {
			setConvertedDocuments((prev) => prev.filter((doc) => doc.id !== docId));
			if (selectedDocument?.id === docId) {
				setSelectedDocument(null);
			}

			// Cleanup session on server
			const officeServiceUrl =
				process.env.NEXT_PUBLIC_OFFICE_SERVICE_URL || "http://localhost:9002";
			fetch(`${officeServiceUrl}/cleanup/${docId}`, { method: "DELETE" }).catch(
				console.error,
			);
		},
		[selectedDocument],
	);

	const getFileIcon = (type: string) => {
		switch (type) {
			case "pdf":
				return <FileText className="h-5 w-5 text-red-500" />;
			case "ppt":
			case "pptx":
				return <Presentation className="h-5 w-5 text-orange-500" />;
			default:
				return <FileSpreadsheet className="h-5 w-5 text-blue-500" />;
		}
	};

	return (
		<div className="flex flex-col h-full overflow-hidden bg-background">
			{/* Header */}
			<div className="flex-shrink-0 h-12 flex items-center px-4 text-sm font-medium border-b bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
				<FileSpreadsheet className="h-4 w-4 mr-2 text-primary" />
				Office hujjatlar
			</div>

			{/* Content with proper scrolling */}
			<div className="flex-1 overflow-hidden">
				<ScrollArea className="h-full">
					<div className="p-2 sm:p-4 space-y-3 pb-16">
						{/* Upload Section */}
						<Card className="overflow-hidden border-primary/10 bg-gradient-to-br from-background to-muted/20 shadow-sm hover:shadow-md transition-all">
							<CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-transparent">
								<CardTitle className="text-base flex items-center gap-2">
									<Upload className="h-4 w-4 text-primary animate-pulse" />
									Hujjat yuklash
								</CardTitle>
								<CardDescription className="text-xs">
									PDF, PowerPoint fayllarni rasmlarga aylantiring
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="relative border-2 border-dashed border-primary/20 rounded-lg p-8 text-center hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer group overflow-hidden">
									<div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
									<input
										type="file"
										accept=".pdf,.ppt,.pptx"
										onChange={handleFileSelect}
										className="hidden"
										id="office-file-input"
										disabled={conversionStatus.isConverting}
									/>
									<label
										htmlFor="office-file-input"
										className="cursor-pointer relative"
									>
										{selectedFile ? (
											<div className="space-y-2">
												<div className="flex items-center justify-center gap-2">
													{getFileIcon(
														selectedFile.name.split(".").pop()?.toLowerCase() ||
															"",
													)}
													<span className="font-medium text-sm">
														{selectedFile.name}
													</span>
												</div>
												<p className="text-xs text-muted-foreground">
													{(selectedFile.size / 1024 / 1024).toFixed(2)} MB
												</p>
											</div>
										) : (
											<div className="space-y-3">
												<div className="relative mx-auto w-16 h-16">
													<FileUp className="h-16 w-16 mx-auto text-muted-foreground group-hover:text-primary transition-all group-hover:scale-110" />
												</div>
												<div>
													<p className="text-sm font-medium">
														Fayl tanlash uchun bosing
													</p>
													<p className="text-xs text-muted-foreground mt-1">
														PDF, PPT, PPTX (maksimal 50MB)
													</p>
												</div>
											</div>
										)}
									</label>
								</div>

								{/* Conversion Status */}
								{conversionStatus.message && (
									<Alert
										className={`${conversionStatus.error ? "border-destructive bg-destructive/10" : "border-primary bg-primary/10"}`}
									>
										{conversionStatus.error ? (
											<XCircle className="h-4 w-4" />
										) : conversionStatus.progress === 100 ? (
											<CheckCircle2 className="h-4 w-4" />
										) : (
											<Loader2 className="h-4 w-4 animate-spin" />
										)}
										<AlertDescription className="text-xs">
											{conversionStatus.error || conversionStatus.message}
										</AlertDescription>
									</Alert>
								)}

								{conversionStatus.isConverting && (
									<Progress value={conversionStatus.progress} className="h-2" />
								)}

								{/* Convert Button */}
								{selectedFile && !conversionStatus.isConverting && (
									<Button
										onClick={handleConvert}
										className="w-full relative overflow-hidden group"
										size="sm"
										disabled={conversionStatus.isConverting}
									>
										<span className="relative z-10 flex items-center justify-center">
											<ChevronRight className="h-4 w-4 mr-2" />
											Konvertatsiya qilish
										</span>
										<div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 transform translate-x-full group-hover:translate-x-0 transition-transform" />
									</Button>
								)}
							</CardContent>
						</Card>

						{/* Converted Documents */}
						{convertedDocuments.length > 0 && (
							<Card className="overflow-hidden border-blue-500/10 bg-gradient-to-br from-blue-500/5 to-transparent">
								<CardHeader className="pb-3 bg-gradient-to-r from-blue-500/10 to-transparent">
									<CardTitle className="text-base flex items-center gap-2">
										<Layers className="h-4 w-4 text-blue-500" />
										Konvertatsiya qilingan hujjatlar
									</CardTitle>
								</CardHeader>
								<CardContent className="p-3">
									<ScrollArea className="h-[200px]">
										<div className="space-y-2 pr-3">
											{convertedDocuments.map((doc) => (
												<div
													key={doc.id}
													className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
														selectedDocument?.id === doc.id
															? "bg-primary/10 border-primary shadow-sm"
															: "border-border/50 hover:bg-muted/50 hover:border-primary/30"
													}`}
													onClick={() => setSelectedDocument(doc)}
												>
													<div className="flex items-center justify-between">
														<div className="flex items-center gap-3 flex-1 min-w-0">
															{getFileIcon(doc.type)}
															<div className="flex-1 min-w-0">
																<p className="text-sm font-medium truncate">
																	{doc.name}
																</p>
																<p className="text-xs text-muted-foreground">
																	{doc.pageCount} sahifa
																</p>
															</div>
														</div>
														<div className="flex gap-1">
															<Button
																size="sm"
																variant="ghost"
																className="h-8 w-8 p-0"
																onClick={(e) => {
																	e.stopPropagation();
																	handleAddToTimeline(doc);
																}}
															>
																<Download className="h-4 w-4" />
															</Button>
															<Button
																size="sm"
																variant="ghost"
																className="h-8 w-8 p-0 text-destructive hover:text-destructive"
																onClick={(e) => {
																	e.stopPropagation();
																	handleDeleteDocument(doc.id);
																}}
															>
																<Trash2 className="h-4 w-4" />
															</Button>
														</div>
													</div>
												</div>
											))}
										</div>
									</ScrollArea>
								</CardContent>
							</Card>
						)}

						{/* Selected Document Preview */}
						{selectedDocument && (
							<Card className="overflow-hidden border-green-500/10 bg-gradient-to-br from-green-500/5 to-transparent">
								<CardHeader className="pb-3 bg-gradient-to-r from-green-500/10 to-transparent">
									<CardTitle className="text-base flex items-center justify-between">
										<div className="flex items-center gap-2">
											<ImageIcon className="h-4 w-4 text-green-500" />
											Sahifalar
										</div>
										<Button
											size="sm"
											variant="outline"
											onClick={() => handleAddToTimeline(selectedDocument)}
											className="h-7"
										>
											<Download className="h-3 w-3 mr-1" />
											Hammasini qo'shish
										</Button>
									</CardTitle>
								</CardHeader>
								<CardContent className="p-3">
									<Tabs defaultValue="grid" className="mt-0">
										<TabsList className="grid w-full grid-cols-2 h-8 mb-3">
											<TabsTrigger value="grid" className="text-xs">
												Kataklar
											</TabsTrigger>
											<TabsTrigger value="list" className="text-xs">
												Ro'yxat
											</TabsTrigger>
										</TabsList>

										<TabsContent value="grid" className="mt-0">
											<ScrollArea className="h-[280px]">
												<div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pr-3">
													{selectedDocument.thumbnails.map((thumb, index) => (
														<div
															key={index}
															className="group relative aspect-[16/9] rounded-lg overflow-hidden border border-border/50 hover:border-primary/50 transition-all hover:shadow-lg cursor-pointer"
															onClick={() => setPreviewImage(thumb)}
														>
															<img
																src={thumb}
																alt={`Sahifa ${index + 1}`}
																className="w-full h-full object-cover group-hover:scale-105 transition-transform"
															/>
															<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
															<div className="absolute bottom-0 left-0 right-0 p-2 flex items-center justify-between text-white opacity-0 group-hover:opacity-100 transition-opacity">
																<span className="text-xs font-medium">
																	Sahifa {index + 1}
																</span>
																<Button
																	size="sm"
																	variant="secondary"
																	className="h-6 px-2"
																	onClick={(e) => {
																		e.stopPropagation();
																		handleAddToTimeline(
																			selectedDocument,
																			index,
																		);
																	}}
																>
																	<Download className="h-3 w-3" />
																</Button>
															</div>
														</div>
													))}
												</div>
											</ScrollArea>
										</TabsContent>

										<TabsContent value="list" className="mt-0">
											<ScrollArea className="h-[280px]">
												<div className="space-y-1 pr-3">
													{selectedDocument.thumbnails.map((thumb, index) => (
														<div
															key={index}
															className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors group"
														>
															<div className="w-16 h-10 rounded overflow-hidden border border-border/50 flex-shrink-0">
																<img
																	src={thumb}
																	alt={`Sahifa ${index + 1}`}
																	className="w-full h-full object-cover"
																/>
															</div>
															<div className="flex-1">
																<p className="text-sm font-medium">
																	Sahifa {index + 1}
																</p>
															</div>
															<div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
																<Button
																	size="sm"
																	variant="ghost"
																	className="h-7 w-7 p-0"
																	onClick={() => setPreviewImage(thumb)}
																>
																	<Eye className="h-3 w-3" />
																</Button>
																<Button
																	size="sm"
																	variant="ghost"
																	className="h-7 w-7 p-0"
																	onClick={() =>
																		handleAddToTimeline(selectedDocument, index)
																	}
																>
																	<Download className="h-3 w-3" />
																</Button>
															</div>
														</div>
													))}
												</div>
											</ScrollArea>
										</TabsContent>
									</Tabs>
								</CardContent>
							</Card>
						)}

						{/* Preview Modal */}
						{previewImage && (
							<div
								className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
								onClick={() => setPreviewImage(null)}
							>
								<div className="relative max-w-4xl max-h-[90vh] p-4">
									<img
										src={previewImage}
										alt="Preview"
										className="w-full h-full object-contain rounded-lg shadow-2xl"
									/>
									<Button
										variant="secondary"
										size="sm"
										className="absolute top-6 right-6"
										onClick={() => setPreviewImage(null)}
									>
										<XCircle className="h-4 w-4" />
									</Button>
								</div>
							</div>
						)}
					</div>
				</ScrollArea>
			</div>
		</div>
	);
}

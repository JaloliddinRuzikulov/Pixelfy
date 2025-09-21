"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Loader2, Film } from "lucide-react";
import "./editor-styles.css";
import Editor from "@/features/editor/editor";

function EditorLoader() {
	return (
		<div className="flex h-screen w-full items-center justify-center bg-slate-50">
			<div className="flex flex-col items-center gap-4">
				<div className="relative">
					<div className="h-12 w-12 animate-spin rounded-full border-3 border-slate-200 border-t-indigo-600" />
					<Film className="absolute inset-0 m-auto h-5 w-5 text-indigo-600" />
				</div>
				<div className="text-center">
					<h2 className="text-lg font-semibold text-slate-900">
						Loading Editor
					</h2>
					<p className="text-xs text-slate-500 mt-1">Please wait...</p>
				</div>
			</div>
		</div>
	);
}

function EditContent() {
	const searchParams = useSearchParams();
	const projectId = searchParams.get("projectId");

	return <Editor projectId={projectId} />;
}

export default function Page() {
	return (
		<Suspense fallback={<EditorLoader />}>
			<EditContent />
		</Suspense>
	);
}

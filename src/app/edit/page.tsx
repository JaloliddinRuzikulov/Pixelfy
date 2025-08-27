"use client";

import { useSearchParams } from "next/navigation";
import Editor from "@/features/editor";

export default function Page() {
	const searchParams = useSearchParams();
	const projectId = searchParams.get("projectId");
	
	return <Editor projectId={projectId} />;
}

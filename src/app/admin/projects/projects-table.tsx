"use client";

import { useState } from "react";
import {
	Project,
	deleteProject,
	archiveProject,
	restoreProject,
} from "./actions";
import { format } from "date-fns";
import { uz } from "date-fns/locale";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	MoreVertical,
	Eye,
	Archive,
	ArchiveRestore,
	Trash2,
	Download,
	Clock,
} from "lucide-react";
import { toast } from "sonner";

interface ProjectsTableProps {
	projects: Project[];
}

export default function ProjectsTable({
	projects: initialProjects,
}: ProjectsTableProps) {
	const [projects, setProjects] = useState(initialProjects);
	const [loading, setLoading] = useState<string | null>(null);

	const formatDuration = (seconds: number) => {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
	};

	const getStatusBadge = (status: Project["status"]) => {
		switch (status) {
			case "published":
				return (
					<Badge className="bg-green-100 text-green-800">Chop etilgan</Badge>
				);
			case "draft":
				return (
					<Badge className="bg-yellow-100 text-yellow-800">Qoralama</Badge>
				);
			case "archived":
				return <Badge className="bg-gray-100 text-gray-800">Arxivlangan</Badge>;
		}
	};

	const handleDeleteProject = async (projectId: string) => {
		if (!confirm("Bu loyihani o'chirishni xohlaysizmi?")) return;

		setLoading(projectId);
		const result = await deleteProject(projectId);

		if (result.success) {
			setProjects((prev) => prev.filter((p) => p.id !== projectId));
			toast.success("Loyiha o'chirildi");
		} else {
			toast.error("Loyihani o'chirishda xatolik");
		}
		setLoading(null);
	};

	const handleArchiveProject = async (projectId: string) => {
		setLoading(projectId);
		const result = await archiveProject(projectId);

		if (result.success) {
			setProjects((prev) =>
				prev.map((p) =>
					p.id === projectId ? { ...p, status: "archived" as const } : p,
				),
			);
			toast.success("Loyiha arxivlandi");
		} else {
			toast.error("Xatolik yuz berdi");
		}
		setLoading(null);
	};

	const handleRestoreProject = async (projectId: string) => {
		setLoading(projectId);
		const result = await restoreProject(projectId);

		if (result.success) {
			setProjects((prev) =>
				prev.map((p) =>
					p.id === projectId ? { ...p, status: "draft" as const } : p,
				),
			);
			toast.success("Loyiha tiklandi");
		} else {
			toast.error("Xatolik yuz berdi");
		}
		setLoading(null);
	};

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Loyiha nomi</TableHead>
					<TableHead>Foydalanuvchi</TableHead>
					<TableHead>Status</TableHead>
					<TableHead>Davomiyligi</TableHead>
					<TableHead>Eksportlar</TableHead>
					<TableHead>Yaratilgan</TableHead>
					<TableHead>Yangilangan</TableHead>
					<TableHead className="text-right">Amallar</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{projects.map((project) => (
					<TableRow key={project.id}>
						<TableCell>
							<div>
								<p className="font-medium">{project.title}</p>
							</div>
						</TableCell>
						<TableCell>
							<div>
								<p className="text-sm">{project.userName || "Noma'lum"}</p>
								<p className="text-xs text-muted-foreground">
									{project.userEmail}
								</p>
							</div>
						</TableCell>
						<TableCell>{getStatusBadge(project.status)}</TableCell>
						<TableCell>
							<div className="flex items-center gap-1">
								<Clock className="h-3 w-3 text-gray-400" />
								<span className="text-sm">
									{formatDuration(project.duration)}
								</span>
							</div>
						</TableCell>
						<TableCell>
							<div className="flex items-center gap-1">
								<Download className="h-3 w-3 text-gray-400" />
								<span className="text-sm">{project.exportCount}</span>
							</div>
						</TableCell>
						<TableCell className="text-sm">
							{format(new Date(project.createdAt), "dd MMM yyyy", {
								locale: uz,
							})}
						</TableCell>
						<TableCell className="text-sm">
							{format(new Date(project.updatedAt), "dd MMM yyyy", {
								locale: uz,
							})}
						</TableCell>
						<TableCell className="text-right">
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										size="sm"
										disabled={loading === project.id}
									>
										<MoreVertical className="h-4 w-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem>
										<Eye className="mr-2 h-4 w-4" />
										Ko'rish
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									{project.status === "archived" ? (
										<DropdownMenuItem
											onClick={() => handleRestoreProject(project.id)}
										>
											<ArchiveRestore className="mr-2 h-4 w-4" />
											Tiklash
										</DropdownMenuItem>
									) : (
										<DropdownMenuItem
											onClick={() => handleArchiveProject(project.id)}
										>
											<Archive className="mr-2 h-4 w-4" />
											Arxivlash
										</DropdownMenuItem>
									)}
									<DropdownMenuItem
										className="text-red-600"
										onClick={() => handleDeleteProject(project.id)}
									>
										<Trash2 className="mr-2 h-4 w-4" />
										O'chirish
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}

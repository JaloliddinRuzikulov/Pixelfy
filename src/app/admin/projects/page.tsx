import { getAllProjects } from "./actions";
import ProjectsTable from "./projects-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Video, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function ProjectsPage() {
	const projects = await getAllProjects();

	return (
		<div>
			<div className="mb-8 flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white">
						Loyihalar boshqaruvi
					</h1>
					<p className="mt-2 text-gray-600 dark:text-gray-400">
						Barcha foydalanuvchi loyihalarini ko'rish va boshqarish
					</p>
				</div>
				<Link href="/admin">
					<Button variant="outline" className="gap-2">
						<ArrowLeft className="h-4 w-4" />
						Orqaga
					</Button>
				</Link>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-600 dark:text-gray-400">
								Jami loyihalar
							</p>
							<p className="text-2xl font-semibold text-gray-900 dark:text-white">
								{projects.length}
							</p>
						</div>
						<Video className="h-8 w-8 text-blue-500" />
					</div>
				</div>
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-600 dark:text-gray-400">
								Chop etilgan
							</p>
							<p className="text-2xl font-semibold text-gray-900 dark:text-white">
								{projects.filter((p) => p.status === "published").length}
							</p>
						</div>
						<Video className="h-8 w-8 text-green-500" />
					</div>
				</div>
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-600 dark:text-gray-400">
								Qoralama
							</p>
							<p className="text-2xl font-semibold text-gray-900 dark:text-white">
								{projects.filter((p) => p.status === "draft").length}
							</p>
						</div>
						<Video className="h-8 w-8 text-yellow-500" />
					</div>
				</div>
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-600 dark:text-gray-400">
								Arxivlangan
							</p>
							<p className="text-2xl font-semibold text-gray-900 dark:text-white">
								{projects.filter((p) => p.status === "archived").length}
							</p>
						</div>
						<Video className="h-8 w-8 text-gray-500" />
					</div>
				</div>
			</div>

			{/* Search Bar */}
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
				<div className="relative">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
					<Input
						type="search"
						placeholder="Loyihalarni qidirish..."
						className="pl-10"
					/>
				</div>
			</div>

			{/* Projects Table */}
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow">
				<ProjectsTable projects={projects} />
			</div>
		</div>
	);
}

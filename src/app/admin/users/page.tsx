import { getAllUsers } from "./actions";
import UsersTable from "./users-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Search, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function UsersPage() {
	const users = await getAllUsers();

	return (
		<div>
			<div className="mb-8 flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white">
						Foydalanuvchilar boshqaruvi
					</h1>
					<p className="mt-2 text-gray-600 dark:text-gray-400">
						Barcha foydalanuvchilarni ko'rish va boshqarish
					</p>
				</div>
				<Link href="/admin">
					<Button variant="outline" className="gap-2">
						<ArrowLeft className="h-4 w-4" />
						Orqaga
					</Button>
				</Link>
			</div>

			{/* Actions Bar */}
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
				<div className="flex flex-col sm:flex-row gap-4">
					<div className="flex-1 relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
						<Input
							type="search"
							placeholder="Foydalanuvchilarni qidirish..."
							className="pl-10"
						/>
					</div>
					<Button className="gap-2">
						<UserPlus className="h-4 w-4" />
						Yangi foydalanuvchi
					</Button>
				</div>
			</div>

			{/* Users Table */}
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow">
				<UsersTable users={users} />
			</div>
		</div>
	);
}

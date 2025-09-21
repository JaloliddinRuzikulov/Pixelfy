import { redirect } from "next/navigation";
import { getSessionTokenFromCookies } from "@/lib/auth";
import { SessionRepository, UserRepository } from "@/lib/db";
import { isAdmin } from "@/lib/role-utils";
import AdminSidebar from "./components/admin-sidebar";
import AdminHeader from "./components/admin-header";

export default async function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const sessionToken = await getSessionTokenFromCookies();

	if (!sessionToken) {
		redirect("/login");
	}

	const session = await SessionRepository.findByToken(sessionToken);
	if (!session) {
		redirect("/login");
	}

	const user = await UserRepository.findById(session.userId);
	if (!user || !isAdmin(user)) {
		redirect("/");
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
			<AdminSidebar user={user} />
			<div className="lg:pl-72">
				<AdminHeader user={user} />
				<main className="px-4 sm:px-6 lg:px-8 py-6">
					<div className="mx-auto max-w-7xl">{children}</div>
				</main>
			</div>
		</div>
	);
}

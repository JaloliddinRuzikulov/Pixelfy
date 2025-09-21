import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { loadSettings } from "@/lib/settings";
import SettingsForm from "./settings-form";

export default async function SettingsPage() {
	const settings = await loadSettings();

	return (
		<div>
			<div className="mb-8 flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white">
						Tizim sozlamalari
					</h1>
					<p className="mt-2 text-gray-600 dark:text-gray-400">
						Tizim konfiguratsiyasi va sozlamalarini boshqarish
					</p>
				</div>
				<Link href="/admin">
					<Button variant="outline" className="gap-2">
						<ArrowLeft className="h-4 w-4" />
						Orqaga
					</Button>
				</Link>
			</div>

			<SettingsForm initialSettings={settings} />
		</div>
	);
}

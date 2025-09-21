import { getSessionTokenFromCookies } from "@/lib/auth";
import { SessionRepository, UserRepository } from "@/lib/db";
import { redirect } from "next/navigation";
import SubscriptionPlans from "./subscription-plans";
import CurrentPlan from "./current-plan";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function SubscriptionPage() {
	const sessionToken = await getSessionTokenFromCookies();

	if (!sessionToken) {
		redirect("/login");
	}

	const session = await SessionRepository.findByToken(sessionToken);
	if (!session) {
		redirect("/login");
	}

	const user = await UserRepository.findById(session.userId);
	if (!user) {
		redirect("/login");
	}

	// Mock subscription data for now
	const currentPlan = {
		name: "Bepul",
		price: 0,
		features: [
			"5 ta loyiha",
			"720p eksport",
			"Asosiy effektlar",
			"1 GB xotira",
		],
		expiresAt: null,
	};

	return (
		<div className="min-h-screen bg-gradient-to-b from-background to-muted/20 overflow-y-auto">
			<div className="container mx-auto px-4 py-8 pb-20">
				{/* Header */}
				<div className="flex items-center justify-between mb-8">
					<div>
						<h1 className="text-3xl font-bold text-gray-900 dark:text-white">
							Obuna rejalari
						</h1>
						<p className="mt-2 text-gray-600 dark:text-gray-400">
							O'zingizga mos rejani tanlang va barcha imkoniyatlardan
							foydalaning
						</p>
					</div>
					<Link href="/projects">
						<Button variant="outline" className="gap-2">
							<ArrowLeft className="h-4 w-4" />
							Loyihalarga
						</Button>
					</Link>
				</div>

				{/* Current Plan */}
				<CurrentPlan plan={currentPlan} user={user} />

				{/* Available Plans */}
				<SubscriptionPlans currentPlan={currentPlan.name} />
			</div>
		</div>
	);
}

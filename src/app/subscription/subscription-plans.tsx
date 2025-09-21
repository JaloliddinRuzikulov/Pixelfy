"use client";

import { useState, useEffect } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Check, Zap, Crown, Rocket, Package } from "lucide-react";
import { toast } from "sonner";

interface Plan {
	id: string;
	name: string;
	description: string;
	monthlyPrice: number;
	yearlyPrice: number;
	features: string[];
	limits?: {
		projects: number;
		storage: number;
		exportQuality: string;
		teamMembers: number;
	};
	recommended?: boolean;
	active?: boolean;
}

const getIconForPlan = (planName: string) => {
	switch (planName.toLowerCase()) {
		case "bepul":
		case "free":
			return Zap;
		case "professional":
		case "pro":
			return Crown;
		case "biznes":
		case "business":
			return Rocket;
		default:
			return Package;
	}
};

const getColorForPlan = (planName: string) => {
	switch (planName.toLowerCase()) {
		case "bepul":
		case "free":
			return "text-gray-500";
		case "professional":
		case "pro":
			return "text-blue-500";
		case "biznes":
		case "business":
			return "text-purple-500";
		default:
			return "text-gray-500";
	}
};

interface SubscriptionPlansProps {
	currentPlan: string;
}

export default function SubscriptionPlans({
	currentPlan,
}: SubscriptionPlansProps) {
	const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
		"monthly",
	);
	const [loading, setLoading] = useState<string | null>(null);
	const [plans, setPlans] = useState<Plan[]>([]);
	const [loadingPlans, setLoadingPlans] = useState(true);

	useEffect(() => {
		loadPlans();
	}, []);

	const loadPlans = async () => {
		try {
			setLoadingPlans(true);
			const response = await fetch("/api/subscriptions/plans");
			if (response.ok) {
				const data = await response.json();
				setPlans(data.plans || []);
			}
		} catch (error) {
			console.error("Error loading plans:", error);
			toast.error("Rejalarni yuklashda xatolik");
		} finally {
			setLoadingPlans(false);
		}
	};

	const handleSubscribe = async (planId: string) => {
		setLoading(planId);

		// Simulate subscription process
		await new Promise((resolve) => setTimeout(resolve, 2000));

		toast.success("Obuna muvaffaqiyatli faollashtirildi!");
		setLoading(null);
	};

	if (loadingPlans) {
		return (
			<div className="flex justify-center py-12">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
			</div>
		);
	}

	return (
		<div>
			{/* Billing Toggle */}
			<div className="flex items-center justify-center gap-4 mb-8">
				<Label htmlFor="billing-cycle" className="text-sm font-medium">
					Oylik
				</Label>
				<Switch
					id="billing-cycle"
					checked={billingCycle === "yearly"}
					onCheckedChange={(checked) =>
						setBillingCycle(checked ? "yearly" : "monthly")
					}
				/>
				<Label htmlFor="billing-cycle" className="text-sm font-medium">
					Yillik
					<Badge variant="secondary" className="ml-2">
						20% tejash
					</Badge>
				</Label>
			</div>

			{/* Plans Grid */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{plans.map((plan) => {
					const Icon = getIconForPlan(plan.name);
					const colorClass = getColorForPlan(plan.name);
					const price =
						billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
					const isCurrentPlan = plan.name === currentPlan;

					return (
						<Card
							key={plan.id}
							className={`relative ${plan.recommended ? "border-primary shadow-lg" : ""}`}
						>
							{plan.recommended && (
								<Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">
									Tavsiya etiladi
								</Badge>
							)}

							<CardHeader>
								<div className="flex items-center justify-between mb-2">
									<Icon className={`h-8 w-8 ${colorClass}`} />
									{isCurrentPlan && <Badge variant="secondary">Joriy</Badge>}
								</div>
								<CardTitle>{plan.name}</CardTitle>
								<CardDescription>{plan.description}</CardDescription>
								<div className="mt-4">
									<span className="text-3xl font-bold">${price}</span>
									<span className="text-sm text-muted-foreground">
										/{billingCycle === "monthly" ? "oy" : "yil"}
									</span>
								</div>
							</CardHeader>

							<CardContent>
								<ul className="space-y-3">
									{plan.features.map((feature, index) => (
										<li key={index} className="flex items-start gap-2">
											<Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
											<span>{feature}</span>
										</li>
									))}
								</ul>
							</CardContent>

							<CardFooter>
								{isCurrentPlan ? (
									<Button className="w-full" variant="outline" disabled>
										Joriy reja
									</Button>
								) : (
									<Button
										className="w-full"
										variant={plan.recommended ? "default" : "outline"}
										onClick={() => handleSubscribe(plan.id)}
										disabled={loading === plan.id}
									>
										{loading === plan.id ? (
											<>
												<div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
												Yuklanmoqda...
											</>
										) : (
											"Obuna bo'lish"
										)}
									</Button>
								)}
							</CardFooter>
						</Card>
					);
				})}
			</div>

			{/* Comparison Note */}
			<div className="mt-8 text-center text-sm text-muted-foreground">
				<p>Barcha rejalar 7 kunlik bepul sinov muddatini o'z ichiga oladi.</p>
				<p>Istalgan vaqtda bekor qilishingiz mumkin.</p>
			</div>
		</div>
	);
}

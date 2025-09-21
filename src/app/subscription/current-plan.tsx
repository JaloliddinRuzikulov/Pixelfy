import { User } from "@/lib/auth";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";

interface CurrentPlanProps {
	plan: {
		name: string;
		price: number;
		features: string[];
		expiresAt: string | null;
	};
	user: User;
}

export default function CurrentPlan({ plan, user }: CurrentPlanProps) {
	return (
		<Card className="mb-8 border-primary">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Joriy rejangiz</CardTitle>
						<CardDescription>
							{user.firstName} {user.lastName} - {user.email}
						</CardDescription>
					</div>
					<Badge className="text-lg px-4 py-1">{plan.name}</Badge>
				</div>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<h3 className="font-semibold mb-3">Reja imkoniyatlari:</h3>
						<ul className="space-y-2">
							{plan.features.map((feature, index) => (
								<li key={index} className="flex items-center gap-2">
									<Check className="h-4 w-4 text-green-500" />
									<span className="text-sm">{feature}</span>
								</li>
							))}
						</ul>
					</div>
					<div>
						<h3 className="font-semibold mb-3">Reja ma'lumotlari:</h3>
						<div className="space-y-2">
							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">Narxi:</span>
								<span className="font-medium">
									{plan.price === 0 ? "Bepul" : `$${plan.price}/oy`}
								</span>
							</div>
							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">Status:</span>
								<span className="font-medium text-green-600">Faol</span>
							</div>
							{plan.expiresAt && (
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">Tugash sanasi:</span>
									<span className="font-medium">{plan.expiresAt}</span>
								</div>
							)}
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

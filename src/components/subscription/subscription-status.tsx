"use client";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Crown, Zap } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSubscriptionStore } from "@/store/use-subscription-store";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { UpgradeModal } from "./upgrade-modal";

interface SubscriptionStatusProps {
	compact?: boolean;
}

export function SubscriptionStatus({ compact = false }: SubscriptionStatusProps) {
	const t = useTranslations();
	const [showUpgradeModal, setShowUpgradeModal] = useState(false);
	const { 
		plan, 
		getRemainingProjects, 
		getRemainingExports, 
		getRemainingTokens,
		getCurrentLimits 
	} = useSubscriptionStore();

	const limits = getCurrentLimits();
	const remainingProjects = getRemainingProjects();
	const remainingExports = getRemainingExports();
	const remainingTokens = getRemainingTokens();

	const projectsUsagePercent = ((limits.maxProjects - remainingProjects) / limits.maxProjects) * 100;
	const exportsUsagePercent = ((limits.maxExportsPerMonth - remainingExports) / limits.maxExportsPerMonth) * 100;
	const tokensUsagePercent = ((limits.aiTokensPerMonth - remainingTokens) / limits.aiTokensPerMonth) * 100;

	if (compact) {
		return (
			<>
				<div className="flex items-center gap-2">
					{plan === "pro" ? (
						<Badge className="bg-yellow-500 text-yellow-50 gap-1">
							<Crown className="w-3 h-3" />
							{t("subscription.pro")}
						</Badge>
					) : (
						<Button
							variant="outline"
							size="sm"
							className="h-6 text-xs gap-1"
							onClick={() => setShowUpgradeModal(true)}
						>
							<Zap className="w-3 h-3" />
							{t("subscription.upgrade")}
						</Button>
					)}
				</div>

				<UpgradeModal 
					open={showUpgradeModal} 
					onOpenChange={setShowUpgradeModal} 
				/>
			</>
		);
	}

	return (
		<>
			<div className="space-y-4 p-4 border rounded-lg bg-card">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<h3 className="font-semibold">{t("subscription.currentPlan")}</h3>
						{plan === "pro" ? (
							<Badge className="bg-yellow-500 text-yellow-50 gap-1">
								<Crown className="w-3 h-3" />
								{t("subscription.pro")}
							</Badge>
						) : (
							<Badge variant="secondary">{t("subscription.free")}</Badge>
						)}
					</div>
					
					{plan === "free" && (
						<Button 
							size="sm" 
							className="bg-yellow-500 hover:bg-yellow-600 text-yellow-50"
							onClick={() => setShowUpgradeModal(true)}
						>
							<Crown className="w-4 h-4 mr-1" />
							{t("subscription.upgrade")}
						</Button>
					)}
				</div>

				{plan === "free" && (
					<div className="space-y-3">
						{/* Projects Usage */}
						<div>
							<div className="flex justify-between text-sm mb-1">
								<span>{t("subscription.projects")}</span>
								<span className="text-muted-foreground">
									{limits.maxProjects - remainingProjects}/{limits.maxProjects}
								</span>
							</div>
							<Progress value={projectsUsagePercent} className="h-2" />
						</div>

						{/* Exports Usage */}
						<div>
							<div className="flex justify-between text-sm mb-1">
								<span>{t("subscription.exportsThisMonth")}</span>
								<span className="text-muted-foreground">
									{limits.maxExportsPerMonth - remainingExports}/{limits.maxExportsPerMonth}
								</span>
							</div>
							<Progress value={exportsUsagePercent} className="h-2" />
						</div>

						{/* AI Tokens Usage */}
						<div>
							<div className="flex justify-between text-sm mb-1">
								<span>{t("subscription.aiTokens")}</span>
								<span className="text-muted-foreground">
									{(limits.aiTokensPerMonth - remainingTokens).toLocaleString()}/{limits.aiTokensPerMonth.toLocaleString()}
								</span>
							</div>
							<Progress value={tokensUsagePercent} className="h-2" />
						</div>

						{(remainingProjects === 0 || remainingExports === 0 || remainingTokens < 100) && (
							<div className="text-sm text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
								⚠️ {t("subscription.limitWarning")}
							</div>
						)}
					</div>
				)}

				{plan === "pro" && (
					<div className="text-sm text-muted-foreground">
						✨ {t("subscription.unlimitedAccess")}
					</div>
				)}
			</div>

			<UpgradeModal 
				open={showUpgradeModal} 
				onOpenChange={setShowUpgradeModal} 
			/>
		</>
	);
}
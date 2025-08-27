"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, Crown, Zap, Users, Shield, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  useSubscriptionStore,
  SUBSCRIPTION_LIMITS,
} from "@/store/use-subscription-store";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason?: "projects" | "exports" | "tokens" | "watermark" | "effects";
}

export function UpgradeModal({
  open,
  onOpenChange,
  reason,
}: UpgradeModalProps) {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const { plan, setPlan } = useSubscriptionStore();

  const proFeatures = [
    {
      icon: <Crown className="w-5 h-5" />,
      title: t("subscription.unlimited"),
      description: t("subscription.unlimitedDesc"),
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: t("subscription.noWatermark"),
      description: t("subscription.noWatermarkDesc"),
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: t("subscription.advancedEffects"),
      description: t("subscription.advancedEffectsDesc"),
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: t("subscription.collaboration"),
      description: t("subscription.collaborationDesc"),
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: t("subscription.prioritySupport"),
      description: t("subscription.prioritySupportDesc"),
    },
  ];

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      // Simulate payment process
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // For demo purposes, just upgrade to pro
      setPlan("pro");

      // Show success message
      alert(t("subscription.upgradeSuccess"));

      onOpenChange(false);
    } catch (error) {
      console.error("Upgrade failed:", error);
      alert(t("subscription.upgradeError"));
    } finally {
      setLoading(false);
    }
  };

  const getReasonMessage = () => {
    switch (reason) {
      case "projects":
        return t("subscription.limitReachedProjects", {
          limit: SUBSCRIPTION_LIMITS.free.maxProjects,
        });
      case "exports":
        return t("subscription.limitReachedExports", {
          limit: SUBSCRIPTION_LIMITS.free.maxExportsPerMonth,
        });
      case "tokens":
        return t("subscription.limitReachedTokens", {
          limit: SUBSCRIPTION_LIMITS.free.aiTokensPerMonth,
        });
      case "watermark":
        return t("subscription.removeWatermark");
      case "effects":
        return t("subscription.unlockEffects");
      default:
        return t("subscription.upgradeToUnlock");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[95vw] max-w-6xl max-h-[90vh] overflow-y-auto sm:w-[90vw] md:w-[85vw] lg:w-[80vw] xl:max-w-7xl p-4 sm:p-6 z-[9999]"
        style={{ minWidth: "300px" }}
      >
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Crown className="w-6 h-6 text-yellow-500" />
            <DialogTitle className="text-xl sm:text-2xl font-bold">
              {t("subscription.upgradeToPro")}
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm sm:text-base">
            {getReasonMessage()}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 py-6">
          {/* Current Plan */}
          <Card className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base sm:text-lg">
                  {t("subscription.free")}
                </CardTitle>
                <Badge variant="secondary">{t("subscription.current")}</Badge>
              </div>
              <CardDescription>$0 {t("subscription.perMonth")}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  {t("subscription.freeProjects", {
                    count: SUBSCRIPTION_LIMITS.free.maxProjects,
                  })}
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  {t("subscription.freeExports", {
                    count: SUBSCRIPTION_LIMITS.free.maxExportsPerMonth,
                  })}
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  {t("subscription.freeTokens", {
                    count: SUBSCRIPTION_LIMITS.free.aiTokensPerMonth,
                  })}
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-4 h-4 border border-muted-foreground rounded-full" />
                  {t("subscription.withWatermark")}
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="relative border-2 border-yellow-500 shadow-lg">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-yellow-500 text-yellow-50">
                {t("subscription.recommended")}
              </Badge>
            </div>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  {t("subscription.pro")}
                </CardTitle>
              </div>
              <CardDescription className="text-xl sm:text-2xl font-bold text-foreground">
                $9.99 {t("subscription.perMonth")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {proFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="text-yellow-500 mt-0.5">{feature.icon}</div>
                    <div>
                      <div className="font-medium text-sm">{feature.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {feature.description}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full mt-6 bg-yellow-500 hover:bg-yellow-600 text-yellow-50"
                size="lg"
                onClick={handleUpgrade}
                disabled={loading}
              >
                {loading
                  ? t("subscription.processing")
                  : t("subscription.upgradeToPro")}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center pt-4 border-t">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {t("subscription.maybeLater")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

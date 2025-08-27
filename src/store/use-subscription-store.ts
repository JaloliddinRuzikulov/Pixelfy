import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SubscriptionPlan = "free" | "pro";

export interface SubscriptionLimits {
	maxProjects: number;
	maxVideoLength: number; // in seconds
	maxExportsPerMonth: number;
	aiTokensPerMonth: number;
	hasWatermark: boolean;
	hasAdvancedEffects: boolean;
	hasCollaboration: boolean;
	hasPrioritySupport: boolean;
}

export const SUBSCRIPTION_LIMITS: Record<SubscriptionPlan, SubscriptionLimits> = {
	free: {
		maxProjects: 3,
		maxVideoLength: 60, // 1 minute
		maxExportsPerMonth: 5,
		aiTokensPerMonth: 1000,
		hasWatermark: true,
		hasAdvancedEffects: false,
		hasCollaboration: false,
		hasPrioritySupport: false,
	},
	pro: {
		maxProjects: 100,
		maxVideoLength: 3600, // 1 hour
		maxExportsPerMonth: 100,
		aiTokensPerMonth: 50000,
		hasWatermark: false,
		hasAdvancedEffects: true,
		hasCollaboration: true,
		hasPrioritySupport: true,
	},
};

interface SubscriptionUsage {
	projectsCount: number;
	exportsThisMonth: number;
	aiTokensUsed: number;
	lastResetDate: string;
}

interface SubscriptionStore {
	plan: SubscriptionPlan;
	usage: SubscriptionUsage;
	subscriptionEndDate?: string;
	
	// Actions
	setPlan: (plan: SubscriptionPlan) => void;
	updateUsage: (usage: Partial<SubscriptionUsage>) => void;
	incrementProjects: () => void;
	incrementExports: () => void;
	incrementTokens: (tokens: number) => void;
	resetMonthlyUsage: () => void;
	
	// Getters
	getCurrentLimits: () => SubscriptionLimits;
	canCreateProject: () => boolean;
	canExport: () => boolean;
	canUseTokens: (tokens: number) => boolean;
	getRemainingProjects: () => number;
	getRemainingExports: () => number;
	getRemainingTokens: () => number;
}

export const useSubscriptionStore = create<SubscriptionStore>()(
	persist(
		(set, get) => ({
			plan: "free",
			usage: {
				projectsCount: 0,
				exportsThisMonth: 0,
				aiTokensUsed: 0,
				lastResetDate: new Date().toISOString().slice(0, 7), // YYYY-MM
			},
			
			setPlan: (plan) => set({ plan }),
			
			updateUsage: (newUsage) =>
				set((state) => ({
					usage: { ...state.usage, ...newUsage },
				})),
			
			incrementProjects: () =>
				set((state) => ({
					usage: {
						...state.usage,
						projectsCount: state.usage.projectsCount + 1,
					},
				})),
			
			incrementExports: () =>
				set((state) => ({
					usage: {
						...state.usage,
						exportsThisMonth: state.usage.exportsThisMonth + 1,
					},
				})),
			
			incrementTokens: (tokens) =>
				set((state) => ({
					usage: {
						...state.usage,
						aiTokensUsed: state.usage.aiTokensUsed + tokens,
					},
				})),
			
			resetMonthlyUsage: () => {
				const currentMonth = new Date().toISOString().slice(0, 7);
				set((state) => ({
					usage: {
						...state.usage,
						exportsThisMonth: 0,
						aiTokensUsed: 0,
						lastResetDate: currentMonth,
					},
				}));
			},
			
			getCurrentLimits: () => {
				const { plan } = get();
				return SUBSCRIPTION_LIMITS[plan];
			},
			
			canCreateProject: () => {
				const { usage, getCurrentLimits } = get();
				const limits = getCurrentLimits();
				return usage.projectsCount < limits.maxProjects;
			},
			
			canExport: () => {
				const { usage, getCurrentLimits } = get();
				const limits = getCurrentLimits();
				return usage.exportsThisMonth < limits.maxExportsPerMonth;
			},
			
			canUseTokens: (tokens) => {
				const { usage, getCurrentLimits } = get();
				const limits = getCurrentLimits();
				return usage.aiTokensUsed + tokens <= limits.aiTokensPerMonth;
			},
			
			getRemainingProjects: () => {
				const { usage, getCurrentLimits } = get();
				const limits = getCurrentLimits();
				return Math.max(0, limits.maxProjects - usage.projectsCount);
			},
			
			getRemainingExports: () => {
				const { usage, getCurrentLimits } = get();
				const limits = getCurrentLimits();
				return Math.max(0, limits.maxExportsPerMonth - usage.exportsThisMonth);
			},
			
			getRemainingTokens: () => {
				const { usage, getCurrentLimits } = get();
				const limits = getCurrentLimits();
				return Math.max(0, limits.aiTokensPerMonth - usage.aiTokensUsed);
			},
		}),
		{
			name: "subscription-storage",
		}
	)
);
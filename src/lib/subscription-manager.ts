// Global subscription plans manager
// This acts as a simple in-memory database for subscription plans

export interface SubscriptionPlan {
	id: string;
	name: string;
	description: string;
	monthlyPrice: number;
	yearlyPrice: number;
	features: string[];
	limits: {
		projects: number;
		storage: number; // GB
		exportQuality: string;
		teamMembers: number;
	};
	active: boolean;
	recommended: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface UserSubscription {
	id: string;
	userId: string;
	userEmail: string;
	userName: string;
	planId: string;
	planName: string;
	status: "active" | "cancelled" | "expired";
	billingCycle: "monthly" | "yearly";
	startDate: string;
	endDate: string;
	amount: number;
}

class SubscriptionManager {
	private plans: Map<string, SubscriptionPlan> = new Map();
	private subscriptions: Map<string, UserSubscription> = new Map();
	private initialized = false;

	constructor() {
		this.initializeDefaultPlans();
	}

	private initializeDefaultPlans() {
		if (this.initialized) return;

		// Default plans
		const defaultPlans: SubscriptionPlan[] = [
			{
				id: "free",
				name: "Bepul",
				description: "Boshlang'ich foydalanuvchilar uchun",
				monthlyPrice: 0,
				yearlyPrice: 0,
				features: [
					"5 ta loyiha",
					"720p eksport",
					"Asosiy effektlar",
					"1 GB xotira",
					"Email yordam",
					"Watermark bilan",
				],
				limits: {
					projects: 5,
					storage: 1,
					exportQuality: "720p",
					teamMembers: 1,
				},
				active: true,
				recommended: false,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			},
			{
				id: "pro",
				name: "Professional",
				description: "Professional foydalanuvchilar uchun",
				monthlyPrice: 19,
				yearlyPrice: 190,
				features: [
					"Cheksiz loyihalar",
					"1080p eksport",
					"Premium effektlar",
					"10 GB xotira",
					"Tezkor yordam",
					"Watermarksiz",
					"Custom branding",
					"API kirish",
				],
				limits: {
					projects: -1, // unlimited
					storage: 10,
					exportQuality: "1080p",
					teamMembers: 1,
				},
				active: true,
				recommended: true,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			},
			{
				id: "business",
				name: "Biznes",
				description: "Jamoalar va biznes uchun",
				monthlyPrice: 49,
				yearlyPrice: 490,
				features: [
					"Cheksiz loyihalar",
					"4K eksport",
					"Barcha effektlar",
					"100 GB xotira",
					"Ustuvor yordam",
					"API kirish",
					"Jamoa hamkorlik",
					"White label",
					"Analytics dashboard",
					"Custom integrations",
				],
				limits: {
					projects: -1,
					storage: 100,
					exportQuality: "4K",
					teamMembers: 10,
				},
				active: true,
				recommended: false,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			},
		];

		// Initialize with default plans
		defaultPlans.forEach((plan) => {
			this.plans.set(plan.id, plan);
		});

		// Add some mock subscriptions
		const mockSubscriptions: UserSubscription[] = [
			{
				id: "sub1",
				userId: "user1",
				userEmail: "john@example.com",
				userName: "John Doe",
				planId: "pro",
				planName: "Professional",
				status: "active",
				billingCycle: "monthly",
				startDate: "2024-01-01",
				endDate: "2024-02-01",
				amount: 19,
			},
			{
				id: "sub2",
				userId: "user2",
				userEmail: "jane@example.com",
				userName: "Jane Smith",
				planId: "business",
				planName: "Biznes",
				status: "active",
				billingCycle: "yearly",
				startDate: "2024-01-01",
				endDate: "2025-01-01",
				amount: 490,
			},
		];

		mockSubscriptions.forEach((sub) => {
			this.subscriptions.set(sub.id, sub);
		});

		this.initialized = true;
	}

	// Plans CRUD operations
	getAllPlans(): SubscriptionPlan[] {
		return Array.from(this.plans.values());
	}

	getPlan(id: string): SubscriptionPlan | undefined {
		return this.plans.get(id);
	}

	createPlan(
		plan: Omit<SubscriptionPlan, "id" | "createdAt" | "updatedAt">,
	): SubscriptionPlan {
		const newPlan: SubscriptionPlan = {
			...plan,
			id: `plan_${Date.now()}`,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};
		this.plans.set(newPlan.id, newPlan);
		return newPlan;
	}

	updatePlan(
		id: string,
		updates: Partial<SubscriptionPlan>,
	): SubscriptionPlan | null {
		const plan = this.plans.get(id);
		if (!plan) return null;

		const updatedPlan = {
			...plan,
			...updates,
			id: plan.id, // Ensure ID doesn't change
			updatedAt: new Date().toISOString(),
		};
		this.plans.set(id, updatedPlan);
		return updatedPlan;
	}

	deletePlan(id: string): boolean {
		// Don't delete if there are active subscriptions
		const hasActiveSubscriptions = Array.from(this.subscriptions.values()).some(
			(sub) => sub.planId === id && sub.status === "active",
		);

		if (hasActiveSubscriptions) {
			throw new Error("Cannot delete plan with active subscriptions");
		}

		return this.plans.delete(id);
	}

	// Subscriptions CRUD operations
	getAllSubscriptions(): UserSubscription[] {
		return Array.from(this.subscriptions.values());
	}

	getSubscription(id: string): UserSubscription | undefined {
		return this.subscriptions.get(id);
	}

	getUserSubscription(userId: string): UserSubscription | undefined {
		return Array.from(this.subscriptions.values()).find(
			(sub) => sub.userId === userId && sub.status === "active",
		);
	}

	createSubscription(
		subscription: Omit<UserSubscription, "id">,
	): UserSubscription {
		const newSubscription: UserSubscription = {
			...subscription,
			id: `sub_${Date.now()}`,
		};
		this.subscriptions.set(newSubscription.id, newSubscription);
		return newSubscription;
	}

	updateSubscription(
		id: string,
		updates: Partial<UserSubscription>,
	): UserSubscription | null {
		const subscription = this.subscriptions.get(id);
		if (!subscription) return null;

		const updatedSubscription = {
			...subscription,
			...updates,
			id: subscription.id, // Ensure ID doesn't change
		};
		this.subscriptions.set(id, updatedSubscription);
		return updatedSubscription;
	}

	cancelSubscription(id: string): boolean {
		const subscription = this.subscriptions.get(id);
		if (!subscription) return false;

		subscription.status = "cancelled";
		this.subscriptions.set(id, subscription);
		return true;
	}

	// Statistics
	getStats() {
		const subscriptions = this.getAllSubscriptions();
		const activeSubscriptions = subscriptions.filter(
			(s) => s.status === "active",
		);

		return {
			totalRevenue: subscriptions.reduce((sum, sub) => sum + sub.amount, 0),
			activeSubscriptions: activeSubscriptions.length,
			totalSubscriptions: subscriptions.length,
			monthlyRevenue: activeSubscriptions
				.filter((s) => s.billingCycle === "monthly")
				.reduce((sum, sub) => sum + sub.amount, 0),
			yearlyRevenue: activeSubscriptions
				.filter((s) => s.billingCycle === "yearly")
				.reduce((sum, sub) => sum + sub.amount, 0),
			planDistribution: this.getAllPlans().map((plan) => ({
				planId: plan.id,
				planName: plan.name,
				count: subscriptions.filter((s) => s.planId === plan.id).length,
			})),
		};
	}
}

// Singleton instance
const subscriptionManager = new SubscriptionManager();

// Export for use in other files
export default subscriptionManager;

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { isAdmin } from "@/lib/role-utils";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	CreditCard,
	Users,
	Settings,
	Edit,
	Trash2,
	Plus,
	DollarSign,
	TrendingUp,
	Package,
	CheckCircle,
	XCircle,
	AlertCircle,
	Crown,
	Zap,
	Rocket,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface SubscriptionPlan {
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
}

interface UserSubscription {
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

export default function AdminSubscriptions() {
	const router = useRouter();
	const { user, isAuthenticated, isLoading } = useAuth();
	const [plans, setPlans] = useState<SubscriptionPlan[]>([]);

	const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);

	const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
	const [showPlanDialog, setShowPlanDialog] = useState(false);
	const [selectedTab, setSelectedTab] = useState("plans");
	const [loadingData, setLoadingData] = useState(true);

	// Check if user is admin
	useEffect(() => {
		if (!isLoading && (!isAuthenticated || !user || !isAdmin(user))) {
			router.push("/projects");
		}
	}, [isLoading, isAuthenticated, user, router]);

	// Load data from API
	useEffect(() => {
		if (user && isAdmin(user)) {
			loadSubscriptionData();
		}
	}, [user]);

	const loadSubscriptionData = async () => {
		try {
			setLoadingData(true);
			const response = await fetch("/api/admin/subscriptions");
			if (response.ok) {
				const data = await response.json();
				setPlans(data.plans || []);
				setSubscriptions(data.subscriptions || []);
			}
		} catch (error) {
			console.error("Error loading subscription data:", error);
			toast.error("Ma'lumotlarni yuklashda xatolik");
		} finally {
			setLoadingData(false);
		}
	};

	const handleSavePlan = async () => {
		if (editingPlan) {
			try {
				const method = editingPlan.id ? "PUT" : "POST";
				const response = await fetch("/api/admin/subscriptions", {
					method,
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(editingPlan),
				});

				if (response.ok) {
					const data = await response.json();
					if (editingPlan.id) {
						// Update existing plan
						setPlans((prev) =>
							prev.map((p) => (p.id === editingPlan.id ? data.plan : p)),
						);
						toast.success("Reja muvaffaqiyatli yangilandi");
					} else {
						// Add new plan
						setPlans((prev) => [...prev, data.plan]);
						toast.success("Yangi reja qo'shildi");
					}
					setShowPlanDialog(false);
					setEditingPlan(null);
				} else {
					const error = await response.json();
					toast.error(error.error || "Xatolik yuz berdi");
				}
			} catch (error) {
				console.error("Error saving plan:", error);
				toast.error("Rejani saqlashda xatolik");
			}
		}
	};

	const handleDeletePlan = async (planId: string) => {
		try {
			const response = await fetch(`/api/admin/subscriptions?id=${planId}`, {
				method: "DELETE",
			});

			if (response.ok) {
				setPlans((prev) => prev.filter((p) => p.id !== planId));
				toast.success("Reja o'chirildi");
			} else {
				const error = await response.json();
				toast.error(error.error || "Rejani o'chirishda xatolik");
			}
		} catch (error) {
			console.error("Error deleting plan:", error);
			toast.error("Rejani o'chirishda xatolik");
		}
	};

	const handleCancelSubscription = (subId: string) => {
		setSubscriptions((prev) =>
			prev.map((s) =>
				s.id === subId ? { ...s, status: "cancelled" as const } : s,
			),
		);
		toast.success("Obuna bekor qilindi");
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "active":
				return "bg-green-100 text-green-800";
			case "cancelled":
				return "bg-yellow-100 text-yellow-800";
			case "expired":
				return "bg-red-100 text-red-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const getPlanIcon = (planName: string) => {
		switch (planName.toLowerCase()) {
			case "bepul":
				return <Zap className="h-5 w-5" />;
			case "professional":
				return <Crown className="h-5 w-5" />;
			case "biznes":
				return <Rocket className="h-5 w-5" />;
			default:
				return <Package className="h-5 w-5" />;
		}
	};

	if (isLoading || !user || loadingData) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="flex flex-col items-center gap-4">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
					<p className="text-muted-foreground">Yuklanmoqda...</p>
				</div>
			</div>
		);
	}

	if (!isAdmin(user)) {
		return null;
	}

	// Calculate stats
	const totalRevenue = subscriptions.reduce((sum, sub) => sum + sub.amount, 0);
	const activeSubscriptions = subscriptions.filter(
		(s) => s.status === "active",
	).length;
	const monthlyRevenue = subscriptions
		.filter((s) => s.status === "active" && s.billingCycle === "monthly")
		.reduce((sum, sub) => sum + sub.amount, 0);

	return (
		<div className="space-y-6">
			{/* Page Header */}
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Obuna boshqaruvi</h1>
				<p className="text-muted-foreground mt-1">
					Obuna rejalari va foydalanuvchi obunal arini boshqaring
				</p>
			</div>

			{/* Stats Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Jami daromad</CardTitle>
						<DollarSign className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">${totalRevenue}</div>
						<p className="text-xs text-muted-foreground">Barcha obunalardan</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Faol obunalar</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{activeSubscriptions}</div>
						<p className="text-xs text-muted-foreground">
							{subscriptions.length} ta jami
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Oylik daromad</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">${monthlyRevenue}</div>
						<p className="text-xs text-muted-foreground">Oylik obunalardan</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Rejalar soni</CardTitle>
						<Package className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{plans.length}</div>
						<p className="text-xs text-muted-foreground">
							{plans.filter((p) => p.active).length} ta faol
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Main Content */}
			<Tabs value={selectedTab} onValueChange={setSelectedTab}>
				<TabsList className="grid w-full max-w-md grid-cols-3">
					<TabsTrigger value="plans">Rejalar</TabsTrigger>
					<TabsTrigger value="subscriptions">Obunalar</TabsTrigger>
					<TabsTrigger value="settings">Sozlamalar</TabsTrigger>
				</TabsList>

				{/* Plans Tab */}
				<TabsContent value="plans" className="space-y-4">
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<div>
									<CardTitle>Obuna rejalari</CardTitle>
									<CardDescription>
										Mavjud obuna rejalarini boshqaring
									</CardDescription>
								</div>
								<Button
									onClick={() => {
										setEditingPlan({
											id: "",
											name: "",
											description: "",
											monthlyPrice: 0,
											yearlyPrice: 0,
											features: [],
											limits: {
												projects: 5,
												storage: 1,
												exportQuality: "720p",
												teamMembers: 1,
											},
											active: true,
											recommended: false,
										});
										setShowPlanDialog(true);
									}}
									className="gap-2"
								>
									<Plus className="h-4 w-4" />
									Yangi reja
								</Button>
							</div>
						</CardHeader>
						<CardContent>
							<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
								{plans.map((plan) => (
									<Card key={plan.id} className="relative">
										{plan.recommended && (
											<Badge
												className="absolute -top-2 -right-2"
												variant="default"
											>
												Tavsiya etiladi
											</Badge>
										)}
										<CardHeader>
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-2">
													{getPlanIcon(plan.name)}
													<CardTitle className="text-lg">{plan.name}</CardTitle>
												</div>
												<Badge variant={plan.active ? "default" : "secondary"}>
													{plan.active ? "Faol" : "Nofaol"}
												</Badge>
											</div>
											<CardDescription>{plan.description}</CardDescription>
										</CardHeader>
										<CardContent className="space-y-4">
											<div>
												<div className="text-3xl font-bold">
													${plan.monthlyPrice}
													<span className="text-sm font-normal text-muted-foreground">
														/oy
													</span>
												</div>
												<p className="text-sm text-muted-foreground">
													yoki ${plan.yearlyPrice}/yil
												</p>
											</div>
											<div className="space-y-2">
												<p className="text-sm font-medium">Xususiyatlar:</p>
												<ul className="text-sm space-y-1">
													{plan.features.slice(0, 3).map((feature, idx) => (
														<li key={idx} className="flex items-center gap-2">
															<CheckCircle className="h-3 w-3 text-green-500" />
															{feature}
														</li>
													))}
													{plan.features.length > 3 && (
														<li className="text-muted-foreground">
															+{plan.features.length - 3} ko'proq...
														</li>
													)}
												</ul>
											</div>
											<div className="flex gap-2">
												<Button
													variant="outline"
													size="sm"
													onClick={() => {
														setEditingPlan(plan);
														setShowPlanDialog(true);
													}}
												>
													<Edit className="h-4 w-4" />
												</Button>
												<Button
													variant="outline"
													size="sm"
													onClick={() => handleDeletePlan(plan.id)}
													className="text-red-600 hover:text-red-700"
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Subscriptions Tab */}
				<TabsContent value="subscriptions" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Foydalanuvchi obunalari</CardTitle>
							<CardDescription>
								Barcha faol va bekor qilingan obunalar
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Foydalanuvchi</TableHead>
										<TableHead>Reja</TableHead>
										<TableHead>Holat</TableHead>
										<TableHead>Davr</TableHead>
										<TableHead>Boshlanish</TableHead>
										<TableHead>Tugash</TableHead>
										<TableHead>Narx</TableHead>
										<TableHead className="text-right">Amallar</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{subscriptions.map((sub) => (
										<TableRow key={sub.id}>
											<TableCell>
												<div>
													<p className="font-medium">{sub.userName}</p>
													<p className="text-xs text-muted-foreground">
														{sub.userEmail}
													</p>
												</div>
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-2">
													{getPlanIcon(sub.planName)}
													{sub.planName}
												</div>
											</TableCell>
											<TableCell>
												<Badge className={getStatusColor(sub.status)}>
													{sub.status === "active"
														? "Faol"
														: sub.status === "cancelled"
															? "Bekor qilingan"
															: "Muddati tugagan"}
												</Badge>
											</TableCell>
											<TableCell>
												{sub.billingCycle === "monthly" ? "Oylik" : "Yillik"}
											</TableCell>
											<TableCell className="text-sm">
												{new Date(sub.startDate).toLocaleDateString()}
											</TableCell>
											<TableCell className="text-sm">
												{new Date(sub.endDate).toLocaleDateString()}
											</TableCell>
											<TableCell>${sub.amount}</TableCell>
											<TableCell className="text-right">
												{sub.status === "active" && (
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleCancelSubscription(sub.id)}
														className="text-red-600"
													>
														Bekor qilish
													</Button>
												)}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Settings Tab */}
				<TabsContent value="settings" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Obuna sozlamalari</CardTitle>
							<CardDescription>Umumiy obuna tizimi sozlamalari</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="flex items-center justify-between">
								<div>
									<Label>Yangi obunalarga ruxsat</Label>
									<p className="text-sm text-muted-foreground">
										Foydalanuvchilar yangi obuna sotib olishi mumkinmi
									</p>
								</div>
								<Switch defaultChecked />
							</div>
							<div className="flex items-center justify-between">
								<div>
									<Label>Avtomatik yangilash</Label>
									<p className="text-sm text-muted-foreground">
										Obunalarni muddati tugaganda avtomatik yangilash
									</p>
								</div>
								<Switch defaultChecked />
							</div>
							<div className="flex items-center justify-between">
								<div>
									<Label>Sinov muddati</Label>
									<p className="text-sm text-muted-foreground">
										Yangi foydalanuvchilar uchun bepul sinov muddati
									</p>
								</div>
								<Switch />
							</div>
							<div className="space-y-2">
								<Label>To'lov tizimlari</Label>
								<div className="space-y-2">
									<div className="flex items-center justify-between p-3 border rounded-lg">
										<div className="flex items-center gap-3">
											<CreditCard className="h-5 w-5" />
											<div>
												<p className="font-medium">Stripe</p>
												<p className="text-sm text-muted-foreground">
													Kredit karta to'lovlari
												</p>
											</div>
										</div>
										<Switch defaultChecked />
									</div>
									<div className="flex items-center justify-between p-3 border rounded-lg">
										<div className="flex items-center gap-3">
											<CreditCard className="h-5 w-5" />
											<div>
												<p className="font-medium">PayPal</p>
												<p className="text-sm text-muted-foreground">
													PayPal to'lovlari
												</p>
											</div>
										</div>
										<Switch />
									</div>
								</div>
							</div>
							<div className="pt-4">
								<Button>Sozlamalarni saqlash</Button>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			{/* Plan Edit Dialog */}
			<Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>
							{editingPlan?.id ? "Rejani tahrirlash" : "Yangi reja qo'shish"}
						</DialogTitle>
						<DialogDescription>
							Obuna rejasi ma'lumotlarini kiriting
						</DialogDescription>
					</DialogHeader>
					{editingPlan && (
						<div className="grid gap-4 py-4">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label htmlFor="name">Reja nomi</Label>
									<Input
										id="name"
										value={editingPlan.name}
										onChange={(e) =>
											setEditingPlan({ ...editingPlan, name: e.target.value })
										}
									/>
								</div>
								<div>
									<Label htmlFor="status">Holat</Label>
									<Select
										value={editingPlan.active ? "active" : "inactive"}
										onValueChange={(v) =>
											setEditingPlan({ ...editingPlan, active: v === "active" })
										}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="active">Faol</SelectItem>
											<SelectItem value="inactive">Nofaol</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
							<div>
								<Label htmlFor="description">Tavsif</Label>
								<Textarea
									id="description"
									value={editingPlan.description}
									onChange={(e) =>
										setEditingPlan({
											...editingPlan,
											description: e.target.value,
										})
									}
								/>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label htmlFor="monthlyPrice">Oylik narx ($)</Label>
									<Input
										id="monthlyPrice"
										type="number"
										value={editingPlan.monthlyPrice}
										onChange={(e) =>
											setEditingPlan({
												...editingPlan,
												monthlyPrice: Number(e.target.value),
											})
										}
									/>
								</div>
								<div>
									<Label htmlFor="yearlyPrice">Yillik narx ($)</Label>
									<Input
										id="yearlyPrice"
										type="number"
										value={editingPlan.yearlyPrice}
										onChange={(e) =>
											setEditingPlan({
												...editingPlan,
												yearlyPrice: Number(e.target.value),
											})
										}
									/>
								</div>
							</div>
							<div>
								<Label>Xususiyatlar (har birini yangi qatordan yozing)</Label>
								<Textarea
									value={editingPlan.features.join("\n")}
									onChange={(e) =>
										setEditingPlan({
											...editingPlan,
											features: e.target.value
												.split("\n")
												.filter((f) => f.trim()),
										})
									}
									rows={5}
								/>
							</div>
							<div className="flex items-center gap-2">
								<Switch
									checked={editingPlan.recommended}
									onCheckedChange={(checked) =>
										setEditingPlan({ ...editingPlan, recommended: checked })
									}
								/>
								<Label>Tavsiya etilgan reja sifatida belgilash</Label>
							</div>
						</div>
					)}
					<DialogFooter>
						<Button variant="outline" onClick={() => setShowPlanDialog(false)}>
							Bekor qilish
						</Button>
						<Button onClick={handleSavePlan}>Saqlash</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}

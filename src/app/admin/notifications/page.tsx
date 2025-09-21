"use client";

import { useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import {
	ArrowLeft,
	Mail,
	Bell,
	Send,
	Settings,
	Users,
	AlertCircle,
	CheckCircle,
	Clock,
	BellRing,
	MessageSquare,
	UserPlus,
	FileVideo,
	Shield,
	Zap,
	MailOpen,
	MailX,
} from "lucide-react";
import { toast } from "sonner";

interface NotificationTemplate {
	id: string;
	name: string;
	subject: string;
	type: "welcome" | "project" | "admin" | "system" | "marketing";
	enabled: boolean;
	lastSent?: Date;
	sentCount: number;
}

export default function NotificationsPage() {
	const [selectedTab, setSelectedTab] = useState("templates");
	const [testEmail, setTestEmail] = useState("");
	const [emailSubject, setEmailSubject] = useState("");
	const [emailContent, setEmailContent] = useState("");
	const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

	// Mock notification templates
	const [templates] = useState<NotificationTemplate[]>([
		{
			id: "1",
			name: "Xush kelibsiz",
			subject: "Pixelfy'ga xush kelibsiz!",
			type: "welcome",
			enabled: true,
			lastSent: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
			sentCount: 45,
		},
		{
			id: "2",
			name: "Loyiha tugallandi",
			subject: "Loyihangiz muvaffaqiyatli eksport qilindi",
			type: "project",
			enabled: true,
			lastSent: new Date(Date.now() - 5 * 60 * 60 * 1000),
			sentCount: 123,
		},
		{
			id: "3",
			name: "Admin xabarnomasi",
			subject: "Muhim tizim yangilanishi",
			type: "admin",
			enabled: false,
			sentCount: 8,
		},
		{
			id: "4",
			name: "Haftalik hisobot",
			subject: "Sizning haftalik faolligingiz",
			type: "marketing",
			enabled: true,
			lastSent: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
			sentCount: 234,
		},
	]);

	const [notificationSettings, setNotificationSettings] = useState({
		emailEnabled: true,
		smsEnabled: false,
		pushEnabled: true,
		welcomeEmail: true,
		projectNotifications: true,
		systemAlerts: true,
		marketingEmails: false,
		dailyDigest: false,
		weeklyReport: true,
	});

	const handleSendTestEmail = () => {
		if (!testEmail) {
			toast.error("Email manzilini kiriting");
			return;
		}
		toast.success(`Test email ${testEmail} manziliga yuborildi`);
		setTestEmail("");
	};

	const handleSendBulkEmail = () => {
		if (!emailSubject || !emailContent) {
			toast.error("Email mavzusi va matnini kiriting");
			return;
		}
		if (selectedUsers.length === 0) {
			toast.error("Kamida bitta foydalanuvchi tanlang");
			return;
		}
		toast.success(`Email ${selectedUsers.length} ta foydalanuvchiga yuborildi`);
		setEmailSubject("");
		setEmailContent("");
		setSelectedUsers([]);
	};

	const toggleSetting = (key: keyof typeof notificationSettings) => {
		setNotificationSettings((prev) => ({
			...prev,
			[key]: !prev[key],
		}));
		toast.success("Sozlamalar saqlandi");
	};

	const getTemplateIcon = (type: string) => {
		switch (type) {
			case "welcome":
				return <UserPlus className="h-4 w-4" />;
			case "project":
				return <FileVideo className="h-4 w-4" />;
			case "admin":
				return <Shield className="h-4 w-4" />;
			case "system":
				return <AlertCircle className="h-4 w-4" />;
			case "marketing":
				return <Zap className="h-4 w-4" />;
			default:
				return <Mail className="h-4 w-4" />;
		}
	};

	const getTemplateColor = (type: string) => {
		switch (type) {
			case "welcome":
				return "bg-green-100 text-green-800";
			case "project":
				return "bg-blue-100 text-blue-800";
			case "admin":
				return "bg-red-100 text-red-800";
			case "system":
				return "bg-yellow-100 text-yellow-800";
			case "marketing":
				return "bg-purple-100 text-purple-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	return (
		<div>
			<div className="mb-8 flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white">
						Email xabarnomalar
					</h1>
					<p className="mt-2 text-gray-600 dark:text-gray-400">
						Email xabarnomalarni boshqarish va yuborish
					</p>
				</div>
				<Link href="/admin">
					<Button variant="outline" className="gap-2">
						<ArrowLeft className="h-4 w-4" />
						Orqaga
					</Button>
				</Link>
			</div>

			{/* Stats Overview */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Yuborilgan
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-center gap-2">
							<MailOpen className="h-4 w-4 text-green-500" />
							<span className="text-2xl font-bold">1,234</span>
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							Oxirgi 30 kunda
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Ochilgan
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-center gap-2">
							<Mail className="h-4 w-4 text-blue-500" />
							<span className="text-2xl font-bold">89%</span>
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							Ochilish darajasi
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Qaytgan
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-center gap-2">
							<MailX className="h-4 w-4 text-red-500" />
							<span className="text-2xl font-bold">23</span>
						</div>
						<p className="text-xs text-muted-foreground mt-1">Yetkazilmagan</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Obunalar
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-center gap-2">
							<BellRing className="h-4 w-4 text-purple-500" />
							<span className="text-2xl font-bold">456</span>
						</div>
						<p className="text-xs text-muted-foreground mt-1">Faol obunalar</p>
					</CardContent>
				</Card>
			</div>

			<Tabs value={selectedTab} onValueChange={setSelectedTab}>
				<TabsList className="grid w-full max-w-lg grid-cols-4">
					<TabsTrigger value="templates">Shablonlar</TabsTrigger>
					<TabsTrigger value="compose">Yaratish</TabsTrigger>
					<TabsTrigger value="history">Tarix</TabsTrigger>
					<TabsTrigger value="settings">Sozlamalar</TabsTrigger>
				</TabsList>

				{/* Templates Tab */}
				<TabsContent value="templates" className="space-y-6 mt-6">
					<Card>
						<CardHeader>
							<CardTitle>Email shablonlari</CardTitle>
							<CardDescription>
								Tayyor email shablonlarini boshqaring
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{templates.map((template) => (
									<div
										key={template.id}
										className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
									>
										<div className="flex items-center gap-4">
											<div
												className={`p-2 rounded-lg ${getTemplateColor(template.type)}`}
											>
												{getTemplateIcon(template.type)}
											</div>
											<div>
												<h4 className="font-medium">{template.name}</h4>
												<p className="text-sm text-muted-foreground">
													{template.subject}
												</p>
												<div className="flex items-center gap-3 mt-2">
													<span className="text-xs text-muted-foreground">
														Yuborilgan: {template.sentCount}
													</span>
													{template.lastSent && (
														<span className="text-xs text-muted-foreground">
															Oxirgi:{" "}
															{template.lastSent.toLocaleDateString("uz-UZ")}
														</span>
													)}
												</div>
											</div>
										</div>
										<div className="flex items-center gap-2">
											{template.enabled ? (
												<Badge className="bg-green-100 text-green-800">
													Faol
												</Badge>
											) : (
												<Badge variant="outline">O'chirilgan</Badge>
											)}
											<Button variant="outline" size="sm">
												Tahrirlash
											</Button>
											<Button variant="outline" size="sm">
												<Send className="h-4 w-4" />
											</Button>
										</div>
									</div>
								))}
							</div>
							<Button className="w-full mt-4" variant="outline">
								Yangi shablon qo'shish
							</Button>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Compose Tab */}
				<TabsContent value="compose" className="space-y-6 mt-6">
					<Card>
						<CardHeader>
							<CardTitle>Email yaratish</CardTitle>
							<CardDescription>
								Yangi email xabarnoma yarating va yuboring
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<label className="text-sm font-medium">Kimga</label>
								<select className="w-full mt-1 p-2 rounded-md border">
									<option>Barcha foydalanuvchilar</option>
									<option>Faol foydalanuvchilar</option>
									<option>Admin foydalanuvchilar</option>
									<option>Yangi foydalanuvchilar (7 kun)</option>
									<option>Tanlangan foydalanuvchilar</option>
								</select>
							</div>

							<div>
								<label className="text-sm font-medium">Mavzu</label>
								<Input
									placeholder="Email mavzusini kiriting..."
									value={emailSubject}
									onChange={(e) => setEmailSubject(e.target.value)}
									className="mt-1"
								/>
							</div>

							<div>
								<label className="text-sm font-medium">Xabar matni</label>
								<textarea
									placeholder="Email matnini kiriting..."
									value={emailContent}
									onChange={(e) => setEmailContent(e.target.value)}
									className="w-full mt-1 p-3 rounded-md border min-h-[200px]"
								/>
							</div>

							<div className="flex gap-3">
								<Button className="flex-1" onClick={handleSendBulkEmail}>
									<Send className="h-4 w-4 mr-2" />
									Yuborish
								</Button>
								<Button variant="outline">Qoralama saqlash</Button>
								<Button variant="outline">Ko'rib chiqish</Button>
							</div>
						</CardContent>
					</Card>

					{/* Test Email */}
					<Card>
						<CardHeader>
							<CardTitle>Test email</CardTitle>
							<CardDescription>Test email yuboring</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="flex gap-3">
								<Input
									placeholder="Test email manzili..."
									value={testEmail}
									onChange={(e) => setTestEmail(e.target.value)}
									className="flex-1"
								/>
								<Button onClick={handleSendTestEmail}>Test yuborish</Button>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* History Tab */}
				<TabsContent value="history" className="mt-6">
					<Card>
						<CardHeader>
							<CardTitle>Email tarixi</CardTitle>
							<CardDescription>Yuborilgan emaillar tarixi</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								<div className="flex items-center justify-between p-4 rounded-lg border">
									<div className="flex items-center gap-3">
										<CheckCircle className="h-5 w-5 text-green-500" />
										<div>
											<p className="font-medium">Haftalik hisobot yuborildi</p>
											<p className="text-sm text-muted-foreground">
												234 ta foydalanuvchiga
											</p>
										</div>
									</div>
									<div className="text-right">
										<p className="text-sm text-muted-foreground">2 kun oldin</p>
										<p className="text-xs text-green-600">89% ochilgan</p>
									</div>
								</div>

								<div className="flex items-center justify-between p-4 rounded-lg border">
									<div className="flex items-center gap-3">
										<Clock className="h-5 w-5 text-yellow-500" />
										<div>
											<p className="font-medium">Tizim yangilanishi haqida</p>
											<p className="text-sm text-muted-foreground">
												56 ta admin foydalanuvchiga
											</p>
										</div>
									</div>
									<div className="text-right">
										<p className="text-sm text-muted-foreground">5 kun oldin</p>
										<p className="text-xs text-yellow-600">Yuborilmoqda...</p>
									</div>
								</div>

								<div className="flex items-center justify-between p-4 rounded-lg border">
									<div className="flex items-center gap-3">
										<CheckCircle className="h-5 w-5 text-green-500" />
										<div>
											<p className="font-medium">Xush kelibsiz emaili</p>
											<p className="text-sm text-muted-foreground">
												12 ta yangi foydalanuvchiga
											</p>
										</div>
									</div>
									<div className="text-right">
										<p className="text-sm text-muted-foreground">
											1 hafta oldin
										</p>
										<p className="text-xs text-green-600">92% ochilgan</p>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Settings Tab */}
				<TabsContent value="settings" className="mt-6">
					<Card>
						<CardHeader>
							<CardTitle>Xabarnoma sozlamalari</CardTitle>
							<CardDescription>
								Email xabarnoma sozlamalarini boshqaring
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-4">
								<h3 className="text-sm font-medium">Xabarnoma kanallari</h3>
								<div className="space-y-3">
									<div className="flex items-center justify-between p-3 rounded-lg border">
										<div className="flex items-center gap-3">
											<Mail className="h-4 w-4 text-muted-foreground" />
											<div>
												<p className="text-sm font-medium">
													Email xabarnomalar
												</p>
												<p className="text-xs text-muted-foreground">
													Email orqali xabarnomalar yuborish
												</p>
											</div>
										</div>
										<Button
											variant={
												notificationSettings.emailEnabled
													? "default"
													: "outline"
											}
											size="sm"
											onClick={() => toggleSetting("emailEnabled")}
										>
											{notificationSettings.emailEnabled
												? "Yoqilgan"
												: "O'chirilgan"}
										</Button>
									</div>

									<div className="flex items-center justify-between p-3 rounded-lg border">
										<div className="flex items-center gap-3">
											<MessageSquare className="h-4 w-4 text-muted-foreground" />
											<div>
												<p className="text-sm font-medium">SMS xabarnomalar</p>
												<p className="text-xs text-muted-foreground">
													SMS orqali xabarnomalar yuborish
												</p>
											</div>
										</div>
										<Button
											variant={
												notificationSettings.smsEnabled ? "default" : "outline"
											}
											size="sm"
											onClick={() => toggleSetting("smsEnabled")}
										>
											{notificationSettings.smsEnabled
												? "Yoqilgan"
												: "O'chirilgan"}
										</Button>
									</div>

									<div className="flex items-center justify-between p-3 rounded-lg border">
										<div className="flex items-center gap-3">
											<Bell className="h-4 w-4 text-muted-foreground" />
											<div>
												<p className="text-sm font-medium">Push xabarnomalar</p>
												<p className="text-xs text-muted-foreground">
													Brauzer push xabarnomalari
												</p>
											</div>
										</div>
										<Button
											variant={
												notificationSettings.pushEnabled ? "default" : "outline"
											}
											size="sm"
											onClick={() => toggleSetting("pushEnabled")}
										>
											{notificationSettings.pushEnabled
												? "Yoqilgan"
												: "O'chirilgan"}
										</Button>
									</div>
								</div>
							</div>

							<div className="space-y-4 pt-4 border-t">
								<h3 className="text-sm font-medium">Xabarnoma turlari</h3>
								<div className="space-y-3">
									{[
										{
											key: "welcomeEmail",
											label: "Xush kelibsiz emaili",
											desc: "Yangi foydalanuvchilar uchun",
										},
										{
											key: "projectNotifications",
											label: "Loyiha xabarnomalari",
											desc: "Loyiha tugallanganda",
										},
										{
											key: "systemAlerts",
											label: "Tizim ogohlantirishlari",
											desc: "Muhim tizim xabarlari",
										},
										{
											key: "marketingEmails",
											label: "Marketing emaillar",
											desc: "Yangiliklar va takliflar",
										},
										{
											key: "dailyDigest",
											label: "Kunlik xulosa",
											desc: "Har kuni ertalab",
										},
										{
											key: "weeklyReport",
											label: "Haftalik hisobot",
											desc: "Har hafta dushanba kuni",
										},
									].map((item) => (
										<div
											key={item.key}
											className="flex items-center justify-between"
										>
											<div>
												<p className="text-sm font-medium">{item.label}</p>
												<p className="text-xs text-muted-foreground">
													{item.desc}
												</p>
											</div>
											<Button
												variant={
													notificationSettings[
														item.key as keyof typeof notificationSettings
													]
														? "default"
														: "outline"
												}
												size="sm"
												onClick={() =>
													toggleSetting(
														item.key as keyof typeof notificationSettings,
													)
												}
											>
												{notificationSettings[
													item.key as keyof typeof notificationSettings
												]
													? "Yoqilgan"
													: "O'chirilgan"}
											</Button>
										</div>
									))}
								</div>
							</div>

							<div className="pt-4 border-t">
								<Button className="w-full">Sozlamalarni saqlash</Button>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}

"use client";

import { useState } from "react";
import { SystemSettings } from "@/lib/settings";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Save, TestTube, Trash2, Download } from "lucide-react";

interface SettingsFormProps {
	initialSettings: SystemSettings;
}

export default function SettingsForm({ initialSettings }: SettingsFormProps) {
	const [settings, setSettings] = useState(initialSettings);
	const [loading, setLoading] = useState(false);
	const [testingEmail, setTestingEmail] = useState(false);

	const handleSave = async (section: string) => {
		setLoading(true);
		try {
			const response = await fetch("/api/admin/settings", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(settings),
			});

			const data = await response.json();

			if (data.success) {
				toast.success(`${section} sozlamalari saqlandi`);
			} else {
				toast.error(data.error || "Xatolik yuz berdi");
			}
		} catch (error) {
			toast.error("Sozlamalarni saqlashda xatolik");
		} finally {
			setLoading(false);
		}
	};

	const handleTestEmail = async () => {
		setTestingEmail(true);
		try {
			const response = await fetch("/api/admin/settings", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action: "test-email" }),
			});

			const data = await response.json();

			if (data.success) {
				toast.success("Test email muvaffaqiyatli yuborildi");
			} else {
				toast.error("Email yuborishda xatolik");
			}
		} catch (error) {
			toast.error("Xatolik yuz berdi");
		} finally {
			setTestingEmail(false);
		}
	};

	const handleClearCache = async () => {
		try {
			const response = await fetch("/api/admin/settings", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action: "clear-cache" }),
			});

			const data = await response.json();

			if (data.success) {
				toast.success("Kesh tozalandi");
			}
		} catch (error) {
			toast.error("Xatolik yuz berdi");
		}
	};

	const handleBackup = async () => {
		try {
			const response = await fetch("/api/admin/settings", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action: "backup-settings" }),
			});

			const data = await response.json();

			if (data.success) {
				// Download backup as JSON file
				const blob = new Blob([JSON.stringify(data.backup, null, 2)], {
					type: "application/json",
				});
				const url = URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = `settings-backup-${new Date().toISOString()}.json`;
				a.click();
				URL.revokeObjectURL(url);
				toast.success("Zaxira nusxa yuklandi");
			}
		} catch (error) {
			toast.error("Xatolik yuz berdi");
		}
	};

	return (
		<Tabs defaultValue="general" className="space-y-4">
			<TabsList>
				<TabsTrigger value="general">Umumiy</TabsTrigger>
				<TabsTrigger value="security">Xavfsizlik</TabsTrigger>
				<TabsTrigger value="email">Email</TabsTrigger>
				<TabsTrigger value="storage">Saqlash</TabsTrigger>
				<TabsTrigger value="notifications">Bildirishnomalar</TabsTrigger>
			</TabsList>

			<TabsContent value="general" className="space-y-4">
				<Card>
					<CardHeader>
						<CardTitle>Asosiy sozlamalar</CardTitle>
						<CardDescription>Tizimning asosiy konfiguratsiyasi</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="space-y-2">
							<Label htmlFor="site-name">Sayt nomi</Label>
							<Input
								id="site-name"
								value={settings.siteName}
								onChange={(e) =>
									setSettings({ ...settings, siteName: e.target.value })
								}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="site-url">Sayt URL</Label>
							<Input
								id="site-url"
								value={settings.siteUrl}
								onChange={(e) =>
									setSettings({ ...settings, siteUrl: e.target.value })
								}
							/>
						</div>
						<div className="flex items-center justify-between">
							<div>
								<Label htmlFor="maintenance">Texnik xizmat rejimi</Label>
								<p className="text-sm text-muted-foreground">
									Foydalanuvchilar uchun saytni yopish
								</p>
							</div>
							<Switch
								id="maintenance"
								checked={settings.maintenanceMode}
								onCheckedChange={(checked) =>
									setSettings({ ...settings, maintenanceMode: checked })
								}
							/>
						</div>
						<div className="flex items-center justify-between">
							<div>
								<Label htmlFor="registration">Ro'yxatdan o'tish</Label>
								<p className="text-sm text-muted-foreground">
									Yangi foydalanuvchilarga ruxsat berish
								</p>
							</div>
							<Switch
								id="registration"
								checked={settings.registrationEnabled}
								onCheckedChange={(checked) =>
									setSettings({ ...settings, registrationEnabled: checked })
								}
							/>
						</div>
						<div className="flex gap-2">
							<Button onClick={() => handleSave("Umumiy")} disabled={loading}>
								{loading ? (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								) : (
									<Save className="mr-2 h-4 w-4" />
								)}
								Saqlash
							</Button>
							<Button variant="outline" onClick={handleBackup}>
								<Download className="mr-2 h-4 w-4" />
								Zaxira nusxa
							</Button>
						</div>
					</CardContent>
				</Card>
			</TabsContent>

			<TabsContent value="security" className="space-y-4">
				<Card>
					<CardHeader>
						<CardTitle>Xavfsizlik sozlamalari</CardTitle>
						<CardDescription>
							Autentifikatsiya va xavfsizlik parametrlari
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="flex items-center justify-between">
							<div>
								<Label htmlFor="email-verification">Email tasdiqlash</Label>
								<p className="text-sm text-muted-foreground">
									Ro'yxatdan o'tishda emailni tasdiqlash talab qilinadi
								</p>
							</div>
							<Switch
								id="email-verification"
								checked={settings.emailVerificationRequired}
								onCheckedChange={(checked) =>
									setSettings({
										...settings,
										emailVerificationRequired: checked,
									})
								}
							/>
						</div>
						<div className="flex items-center justify-between">
							<div>
								<Label htmlFor="two-factor">
									Ikki faktorli autentifikatsiya
								</Label>
								<p className="text-sm text-muted-foreground">
									Admin foydalanuvchilar uchun majburiy
								</p>
							</div>
							<Switch
								id="two-factor"
								checked={settings.twoFactorEnabled}
								onCheckedChange={(checked) =>
									setSettings({ ...settings, twoFactorEnabled: checked })
								}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="session-timeout">Sessiya vaqti (daqiqa)</Label>
							<Input
								id="session-timeout"
								type="number"
								value={settings.sessionTimeout}
								onChange={(e) =>
									setSettings({
										...settings,
										sessionTimeout: parseInt(e.target.value) || 0,
									})
								}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="max-login-attempts">
								Maksimal kirish urinishlari
							</Label>
							<Input
								id="max-login-attempts"
								type="number"
								value={settings.maxLoginAttempts}
								onChange={(e) =>
									setSettings({
										...settings,
										maxLoginAttempts: parseInt(e.target.value) || 0,
									})
								}
							/>
						</div>
						<Button onClick={() => handleSave("Xavfsizlik")} disabled={loading}>
							{loading ? (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							) : (
								<Save className="mr-2 h-4 w-4" />
							)}
							Saqlash
						</Button>
					</CardContent>
				</Card>
			</TabsContent>

			<TabsContent value="email" className="space-y-4">
				<Card>
					<CardHeader>
						<CardTitle>Email sozlamalari</CardTitle>
						<CardDescription>Email xizmati konfiguratsiyasi</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="space-y-2">
							<Label htmlFor="smtp-host">SMTP Server</Label>
							<Input
								id="smtp-host"
								placeholder="smtp.gmail.com"
								value={settings.smtpHost}
								onChange={(e) =>
									setSettings({ ...settings, smtpHost: e.target.value })
								}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="smtp-port">SMTP Port</Label>
							<Input
								id="smtp-port"
								placeholder="587"
								value={settings.smtpPort}
								onChange={(e) =>
									setSettings({
										...settings,
										smtpPort: parseInt(e.target.value) || 0,
									})
								}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="smtp-user">SMTP Foydalanuvchi</Label>
							<Input
								id="smtp-user"
								placeholder="noreply@pixelfy.uz"
								value={settings.smtpUser}
								onChange={(e) =>
									setSettings({ ...settings, smtpUser: e.target.value })
								}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="smtp-pass">SMTP Parol</Label>
							<Input
								id="smtp-pass"
								type="password"
								placeholder="••••••••"
								value={settings.smtpPassword || ""}
								onChange={(e) =>
									setSettings({ ...settings, smtpPassword: e.target.value })
								}
							/>
						</div>
						<div className="flex items-center justify-between">
							<div>
								<Label htmlFor="smtp-secure">TLS/SSL</Label>
								<p className="text-sm text-muted-foreground">
									Xavfsiz ulanishni yoqish
								</p>
							</div>
							<Switch
								id="smtp-secure"
								checked={settings.smtpSecure}
								onCheckedChange={(checked) =>
									setSettings({ ...settings, smtpSecure: checked })
								}
							/>
						</div>
						<div className="flex gap-2">
							<Button onClick={() => handleSave("Email")} disabled={loading}>
								{loading ? (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								) : (
									<Save className="mr-2 h-4 w-4" />
								)}
								Saqlash
							</Button>
							<Button
								variant="outline"
								onClick={handleTestEmail}
								disabled={testingEmail}
							>
								{testingEmail ? (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								) : (
									<TestTube className="mr-2 h-4 w-4" />
								)}
								Test yuborish
							</Button>
						</div>
					</CardContent>
				</Card>
			</TabsContent>

			<TabsContent value="storage" className="space-y-4">
				<Card>
					<CardHeader>
						<CardTitle>Saqlash sozlamalari</CardTitle>
						<CardDescription>
							Media va fayllarni saqlash konfiguratsiyasi
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="space-y-2">
							<Label htmlFor="max-file-size">Maksimal fayl hajmi (MB)</Label>
							<Input
								id="max-file-size"
								type="number"
								value={settings.maxFileSize}
								onChange={(e) =>
									setSettings({
										...settings,
										maxFileSize: parseInt(e.target.value) || 0,
									})
								}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="max-project-size">
								Maksimal loyiha hajmi (MB)
							</Label>
							<Input
								id="max-project-size"
								type="number"
								value={settings.maxProjectSize}
								onChange={(e) =>
									setSettings({
										...settings,
										maxProjectSize: parseInt(e.target.value) || 0,
									})
								}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="storage-limit">
								Foydalanuvchi uchun limit (GB)
							</Label>
							<Input
								id="storage-limit"
								type="number"
								value={settings.userStorageLimit}
								onChange={(e) =>
									setSettings({
										...settings,
										userStorageLimit: parseInt(e.target.value) || 0,
									})
								}
							/>
						</div>
						<div className="flex items-center justify-between">
							<div>
								<Label htmlFor="s3-storage">S3 saqlash</Label>
								<p className="text-sm text-muted-foreground">
									AWS S3 yoki mos xizmatni ishlatish
								</p>
							</div>
							<Switch
								id="s3-storage"
								checked={settings.s3Enabled}
								onCheckedChange={(checked) =>
									setSettings({ ...settings, s3Enabled: checked })
								}
							/>
						</div>
						<div className="flex gap-2">
							<Button onClick={() => handleSave("Saqlash")} disabled={loading}>
								{loading ? (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								) : (
									<Save className="mr-2 h-4 w-4" />
								)}
								Saqlash
							</Button>
							<Button variant="outline" onClick={handleClearCache}>
								<Trash2 className="mr-2 h-4 w-4" />
								Keshni tozalash
							</Button>
						</div>
					</CardContent>
				</Card>
			</TabsContent>

			<TabsContent value="notifications" className="space-y-4">
				<Card>
					<CardHeader>
						<CardTitle>Bildirishnoma sozlamalari</CardTitle>
						<CardDescription>
							Tizim bildirshnomalari konfiguratsiyasi
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="flex items-center justify-between">
							<div>
								<Label htmlFor="new-user-notify">Yangi foydalanuvchi</Label>
								<p className="text-sm text-muted-foreground">
									Yangi ro'yxatdan o'tishda xabar berish
								</p>
							</div>
							<Switch
								id="new-user-notify"
								checked={settings.notifyNewUser}
								onCheckedChange={(checked) =>
									setSettings({ ...settings, notifyNewUser: checked })
								}
							/>
						</div>
						<div className="flex items-center justify-between">
							<div>
								<Label htmlFor="error-notify">Tizim xatoliklari</Label>
								<p className="text-sm text-muted-foreground">
									Kritik xatoliklar haqida xabar berish
								</p>
							</div>
							<Switch
								id="error-notify"
								checked={settings.notifySystemErrors}
								onCheckedChange={(checked) =>
									setSettings({ ...settings, notifySystemErrors: checked })
								}
							/>
						</div>
						<div className="flex items-center justify-between">
							<div>
								<Label htmlFor="storage-notify">Xotira ogohlantirishi</Label>
								<p className="text-sm text-muted-foreground">
									Xotira 80% dan oshganda xabar berish
								</p>
							</div>
							<Switch
								id="storage-notify"
								checked={settings.notifyStorageWarning}
								onCheckedChange={(checked) =>
									setSettings({ ...settings, notifyStorageWarning: checked })
								}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="admin-email">Admin email</Label>
							<Input
								id="admin-email"
								type="email"
								placeholder="admin@pixelfy.uz"
								value={settings.adminEmail}
								onChange={(e) =>
									setSettings({ ...settings, adminEmail: e.target.value })
								}
							/>
						</div>
						<Button
							onClick={() => handleSave("Bildirishnoma")}
							disabled={loading}
						>
							{loading ? (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							) : (
								<Save className="mr-2 h-4 w-4" />
							)}
							Saqlash
						</Button>
					</CardContent>
				</Card>
			</TabsContent>
		</Tabs>
	);
}

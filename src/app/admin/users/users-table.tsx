"use client";

import { useState } from "react";
import { User, UserRole } from "@/lib/auth";
import { getRoleDisplayName, getRoleBadgeColor } from "@/lib/role-utils";
import {
	updateUserRole,
	deleteUser,
	suspendUser,
	verifyUserEmail,
} from "./actions";
import { format } from "date-fns";
import { uz } from "date-fns/locale";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Shield,
	Users,
	UserX,
	UserCheck,
	MoreVertical,
	Mail,
	Ban,
	Trash2,
} from "lucide-react";
import { toast } from "sonner";

interface UsersTableProps {
	users: (User & { projectCount?: number; lastLogin?: string })[];
}

export default function UsersTable({ users: initialUsers }: UsersTableProps) {
	const [users, setUsers] = useState(initialUsers);
	const [loading, setLoading] = useState<string | null>(null);

	const handleUpdateRole = async (userId: string, newRole: UserRole) => {
		setLoading(userId);
		const result = await updateUserRole(userId, newRole);

		if (result.success) {
			setUsers((prev) =>
				prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
			);
			toast.success(
				`Foydalanuvchi roli ${getRoleDisplayName(newRole)} ga o'zgartirildi`,
			);
		} else {
			toast.error("Rolni o'zgartirishda xatolik yuz berdi");
		}
		setLoading(null);
	};

	const handleDeleteUser = async (userId: string) => {
		if (!confirm("Bu foydalanuvchini o'chirishni xohlaysizmi?")) return;

		setLoading(userId);
		const result = await deleteUser(userId);

		if (result.success) {
			setUsers((prev) => prev.filter((u) => u.id !== userId));
			toast.success("Foydalanuvchi o'chirildi");
		} else {
			toast.error("Foydalanuvchini o'chirishda xatolik");
		}
		setLoading(null);
	};

	const handleSuspendUser = async (userId: string) => {
		setLoading(userId);
		const result = await suspendUser(userId);

		if (result.success) {
			toast.success("Foydalanuvchi to'xtatildi");
		} else {
			toast.error("Xatolik yuz berdi");
		}
		setLoading(null);
	};

	const handleVerifyEmail = async (userId: string) => {
		setLoading(userId);
		const result = await verifyUserEmail(userId);

		if (result.success) {
			setUsers((prev) =>
				prev.map((u) => (u.id === userId ? { ...u, emailVerified: true } : u)),
			);
			toast.success("Email tasdiqlandi");
		} else {
			toast.error("Xatolik yuz berdi");
		}
		setLoading(null);
	};

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Foydalanuvchi</TableHead>
					<TableHead>Rol</TableHead>
					<TableHead>Status</TableHead>
					<TableHead>Loyihalar</TableHead>
					<TableHead>Ro'yxatdan o'tgan</TableHead>
					<TableHead>Oxirgi kirish</TableHead>
					<TableHead className="text-right">Amallar</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{users.map((user) => (
					<TableRow key={user.id}>
						<TableCell>
							<div>
								<p className="font-medium">{user.email}</p>
								{(user.firstName || user.lastName) && (
									<p className="text-sm text-muted-foreground">
										{user.firstName} {user.lastName}
									</p>
								)}
							</div>
						</TableCell>
						<TableCell>
							<Badge className={getRoleBadgeColor(user.role)}>
								{getRoleDisplayName(user.role)}
							</Badge>
						</TableCell>
						<TableCell>
							<div className="flex items-center gap-2">
								{user.emailVerified ? (
									<div className="flex items-center gap-1 text-green-600">
										<UserCheck className="h-4 w-4" />
										<span className="text-sm">Tasdiqlangan</span>
									</div>
								) : (
									<div className="flex items-center gap-1 text-yellow-600">
										<Mail className="h-4 w-4" />
										<span className="text-sm">Tasdiqlanmagan</span>
									</div>
								)}
							</div>
						</TableCell>
						<TableCell>{user.projectCount || 0}</TableCell>
						<TableCell className="text-sm">
							{format(new Date(user.createdAt), "dd MMM yyyy", { locale: uz })}
						</TableCell>
						<TableCell className="text-sm">
							{user.lastLogin
								? format(new Date(user.lastLogin), "dd MMM yyyy, HH:mm", {
										locale: uz,
									})
								: "-"}
						</TableCell>
						<TableCell className="text-right">
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										size="sm"
										disabled={loading === user.id}
									>
										<MoreVertical className="h-4 w-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									{user.role !== "admin" && (
										<DropdownMenuItem
											onClick={() => handleUpdateRole(user.id, "admin")}
										>
											<Shield className="mr-2 h-4 w-4" />
											Admin qilish
										</DropdownMenuItem>
									)}
									{user.role !== "user" && (
										<DropdownMenuItem
											onClick={() => handleUpdateRole(user.id, "user")}
										>
											<Users className="mr-2 h-4 w-4" />
											Oddiy foydalanuvchi qilish
										</DropdownMenuItem>
									)}
									{!user.emailVerified && (
										<DropdownMenuItem
											onClick={() => handleVerifyEmail(user.id)}
										>
											<Mail className="mr-2 h-4 w-4" />
											Emailni tasdiqlash
										</DropdownMenuItem>
									)}
									<DropdownMenuSeparator />
									<DropdownMenuItem onClick={() => handleSuspendUser(user.id)}>
										<Ban className="mr-2 h-4 w-4" />
										To'xtatish
									</DropdownMenuItem>
									<DropdownMenuItem
										className="text-red-600"
										onClick={() => handleDeleteUser(user.id)}
									>
										<Trash2 className="mr-2 h-4 w-4" />
										O'chirish
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}

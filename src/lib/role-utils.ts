import { User, UserRole } from "./auth";

// Role hierarchy - higher index means more privileges
const ROLE_HIERARCHY: Record<UserRole, number> = {
	user: 0,
	admin: 10,
};

// Permission definitions
export const PERMISSIONS = {
	// User management
	VIEW_USERS: ["admin"] as UserRole[],
	MANAGE_USERS: ["admin"] as UserRole[],
	DELETE_USERS: ["admin"] as UserRole[],

	// Project management
	VIEW_ALL_PROJECTS: ["admin"] as UserRole[],
	DELETE_ANY_PROJECT: ["admin"] as UserRole[],
	EDIT_ANY_PROJECT: ["admin"] as UserRole[],

	// System settings
	MANAGE_SETTINGS: ["admin"] as UserRole[],
	VIEW_ANALYTICS: ["admin"] as UserRole[],
	MANAGE_SUBSCRIPTIONS: ["admin"] as UserRole[],

	// Content management
	MANAGE_TEMPLATES: ["admin"] as UserRole[],
	MANAGE_MEDIA_LIBRARY: ["admin"] as UserRole[],
} as const;

export type Permission = keyof typeof PERMISSIONS;

/**
 * Check if a user has a specific permission
 */
export function hasPermission(
	user: User | null,
	permission: Permission,
): boolean {
	if (!user) return false;
	const allowedRoles = PERMISSIONS[permission];
	return allowedRoles.includes(user.role);
}

/**
 * Check if a user has any of the specified permissions
 */
export function hasAnyPermission(
	user: User | null,
	permissions: Permission[],
): boolean {
	if (!user) return false;
	return permissions.some((permission) => hasPermission(user, permission));
}

/**
 * Check if a user has all of the specified permissions
 */
export function hasAllPermissions(
	user: User | null,
	permissions: Permission[],
): boolean {
	if (!user) return false;
	return permissions.every((permission) => hasPermission(user, permission));
}

/**
 * Check if a user is an admin
 */
export function isAdmin(user: User | null): boolean {
	return user?.role === "admin";
}

/**
 * Check if user has higher or equal role than another role
 */
export function hasRoleLevel(user: User | null, targetRole: UserRole): boolean {
	if (!user) return false;
	return ROLE_HIERARCHY[user.role] >= ROLE_HIERARCHY[targetRole];
}

/**
 * Get display name for a role
 */
export function getRoleDisplayName(role: UserRole): string {
	const displayNames: Record<UserRole, string> = {
		admin: "Administrator",
		user: "Foydalanuvchi",
	};
	return displayNames[role] || role;
}

/**
 * Get badge color for a role
 */
export function getRoleBadgeColor(role: UserRole): string {
	const colors: Record<UserRole, string> = {
		admin: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
		user: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
	};
	return colors[role] || "bg-gray-100 text-gray-800";
}

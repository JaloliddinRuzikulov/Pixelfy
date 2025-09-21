import { User, Session, UserRole } from "./auth";
import fs from "fs";
import path from "path";

// File-based storage for development purposes
const DB_FILE = path.join(process.cwd(), "dev-db.json");

interface Database {
	users: (User & { passwordHash: string; lastLogin?: string })[];
	sessions: Session[];
	tokens: any[];
	userIdCounter: number;
	sessionIdCounter: number;
}

// Initialize database file if it doesn't exist
function initDatabase(): Database {
	if (!fs.existsSync(DB_FILE)) {
		const initialDb: Database = {
			users: [],
			sessions: [],
			tokens: [],
			userIdCounter: 1,
			sessionIdCounter: 1,
		};
		fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2));
		return initialDb;
	}

	try {
		const data = fs.readFileSync(DB_FILE, "utf-8");
		return JSON.parse(data);
	} catch (error) {
		console.error("Error reading database file:", error);
		const initialDb: Database = {
			users: [],
			sessions: [],
			tokens: [],
			userIdCounter: 1,
			sessionIdCounter: 1,
		};
		fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2));
		return initialDb;
	}
}

// Load database
function loadDb(): Database {
	return initDatabase();
}

// Save database
function saveDb(db: Database) {
	fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

// User database operations
export class UserRepository {
	static async create(userData: {
		email: string;
		passwordHash: string;
		firstName?: string;
		lastName?: string;
		role?: UserRole;
	}): Promise<User> {
		const db = loadDb();
		const { email, passwordHash, firstName, lastName, role } = userData;

		// Check if user already exists
		const existingUser = db.users.find((u) => u.email === email);
		if (existingUser) {
			throw new Error("User with this email already exists");
		}

		// Admin emails list
		const adminEmails = ["jaloliddinruzikulov@gmail.com", "admin@pixelfy.uz"];

		// First user becomes admin, or if email is in admin list
		const userRole: UserRole =
			role ||
			(db.users.length === 0 || adminEmails.includes(email.toLowerCase())
				? "admin"
				: "user");

		const user = {
			id: db.userIdCounter.toString(),
			email,
			passwordHash,
			firstName: firstName || undefined,
			lastName: lastName || undefined,
			avatarUrl: undefined,
			emailVerified: false,
			role: userRole,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		db.users.push(user);
		db.userIdCounter++;
		saveDb(db);

		return {
			id: user.id,
			email: user.email,
			firstName: user.firstName,
			lastName: user.lastName,
			avatarUrl: user.avatarUrl,
			emailVerified: user.emailVerified,
			role: user.role || "user",
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
		};
	}

	static async findByEmail(
		email: string,
	): Promise<(User & { passwordHash: string }) | null> {
		const db = loadDb();
		const user = db.users.find((u) => u.email === email);
		if (!user) return null;

		return user;
	}

	static async findById(id: string): Promise<User | null> {
		const db = loadDb();
		const user = db.users.find((u) => u.id === id);
		if (!user) return null;

		return {
			id: user.id,
			email: user.email,
			firstName: user.firstName,
			lastName: user.lastName,
			avatarUrl: user.avatarUrl,
			emailVerified: user.emailVerified,
			role: user.role || "user",
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
		};
	}

	static async updateProfile(
		id: string,
		updates: {
			firstName?: string;
			lastName?: string;
			avatarUrl?: string;
		},
	): Promise<User | null> {
		const db = loadDb();
		const userIndex = db.users.findIndex((u) => u.id === id);
		if (userIndex === -1) return null;

		const user = db.users[userIndex];

		if (updates.firstName !== undefined) {
			user.firstName = updates.firstName;
		}
		if (updates.lastName !== undefined) {
			user.lastName = updates.lastName;
		}
		if (updates.avatarUrl !== undefined) {
			user.avatarUrl = updates.avatarUrl;
		}

		user.updatedAt = new Date().toISOString();
		db.users[userIndex] = user;
		saveDb(db);

		return {
			id: user.id,
			email: user.email,
			firstName: user.firstName,
			lastName: user.lastName,
			avatarUrl: user.avatarUrl,
			emailVerified: user.emailVerified,
			role: user.role || "user",
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
		};
	}

	static async updatePassword(
		id: string,
		passwordHash: string,
	): Promise<boolean> {
		const db = loadDb();
		const userIndex = db.users.findIndex((u) => u.id === id);
		if (userIndex === -1) return false;

		db.users[userIndex].passwordHash = passwordHash;
		db.users[userIndex].updatedAt = new Date().toISOString();
		saveDb(db);

		return true;
	}

	static async verifyEmail(id: string): Promise<boolean> {
		const db = loadDb();
		const userIndex = db.users.findIndex((u) => u.id === id);
		if (userIndex === -1) return false;

		db.users[userIndex].emailVerified = true;
		db.users[userIndex].updatedAt = new Date().toISOString();
		saveDb(db);

		return true;
	}

	static async update(
		id: string,
		updates: {
			firstName?: string;
			lastName?: string;
			avatarUrl?: string;
			role?: UserRole;
		},
	): Promise<User> {
		const db = loadDb();
		const userIndex = db.users.findIndex((u) => u.id === id);
		if (userIndex === -1) {
			throw new Error("User not found");
		}

		const user = db.users[userIndex];

		if (updates.firstName !== undefined) {
			user.firstName = updates.firstName;
		}
		if (updates.lastName !== undefined) {
			user.lastName = updates.lastName;
		}
		if (updates.avatarUrl !== undefined) {
			user.avatarUrl = updates.avatarUrl;
		}
		if (updates.role !== undefined) {
			user.role = updates.role;
		}

		user.updatedAt = new Date().toISOString();
		db.users[userIndex] = user;
		saveDb(db);

		return {
			id: user.id,
			email: user.email,
			firstName: user.firstName,
			lastName: user.lastName,
			avatarUrl: user.avatarUrl,
			emailVerified: user.emailVerified,
			role: user.role || "user",
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
		};
	}

	static async findAll(): Promise<User[]> {
		const db = loadDb();
		return db.users.map((user) => ({
			id: user.id,
			email: user.email,
			firstName: user.firstName,
			lastName: user.lastName,
			avatarUrl: user.avatarUrl,
			emailVerified: user.emailVerified,
			role: user.role || "user",
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
			lastLogin: user.lastLogin,
		}));
	}
}

// Session database operations
export class SessionRepository {
	static async create(userId: string, sessionToken: string): Promise<Session> {
		const db = loadDb();
		const expiresAt = new Date(
			Date.now() + 7 * 24 * 60 * 60 * 1000,
		).toISOString(); // 7 days

		const session = {
			id: db.sessionIdCounter.toString(),
			userId,
			sessionToken,
			expiresAt,
		};

		db.sessions.push(session);
		db.sessionIdCounter++;
		saveDb(db);

		return session;
	}

	static async findByToken(sessionToken: string): Promise<Session | null> {
		const db = loadDb();
		const session = db.sessions.find(
			(s) =>
				s.sessionToken === sessionToken && new Date(s.expiresAt) > new Date(),
		);

		if (!session) return null;

		return session;
	}

	static async deleteByToken(sessionToken: string): Promise<boolean> {
		const db = loadDb();
		const index = db.sessions.findIndex((s) => s.sessionToken === sessionToken);
		if (index === -1) return false;

		db.sessions.splice(index, 1);
		saveDb(db);
		return true;
	}

	static async deleteByUserId(userId: string): Promise<boolean> {
		const db = loadDb();
		const initialLength = db.sessions.length;
		db.sessions = db.sessions.filter((s) => s.userId !== userId);
		saveDb(db);
		return db.sessions.length < initialLength;
	}

	static async cleanup(): Promise<number> {
		const db = loadDb();
		const now = new Date();
		const initialLength = db.sessions.length;
		db.sessions = db.sessions.filter((s) => new Date(s.expiresAt) > now);
		saveDb(db);
		return initialLength - db.sessions.length;
	}
}

// Token database operations for email verification and password reset
export class TokenRepository {
	static async createEmailVerificationToken(
		userId: string,
		token: string,
	): Promise<void> {
		const db = loadDb();
		const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

		db.tokens.push({
			type: "email_verification",
			userId,
			token,
			expiresAt,
		});
		saveDb(db);
	}

	static async findEmailVerificationToken(token: string): Promise<{
		userId: string;
		expiresAt: Date;
	} | null> {
		const db = loadDb();
		const tokenData = db.tokens.find(
			(t) => t.type === "email_verification" && t.token === token,
		);

		if (!tokenData) return null;

		return {
			userId: tokenData.userId,
			expiresAt: tokenData.expiresAt,
		};
	}

	static async deleteEmailVerificationToken(token: string): Promise<void> {
		const db = loadDb();
		const index = db.tokens.findIndex(
			(t) => t.type === "email_verification" && t.token === token,
		);

		if (index !== -1) {
			db.tokens.splice(index, 1);
			saveDb(db);
		}
	}

	static async createPasswordResetToken(
		userId: string,
		token: string,
	): Promise<void> {
		const db = loadDb();
		const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

		db.tokens.push({
			type: "password_reset",
			userId,
			token,
			expiresAt,
		});
		saveDb(db);
	}

	static async findPasswordResetToken(token: string): Promise<{
		userId: string;
		expiresAt: Date;
	} | null> {
		const db = loadDb();
		const tokenData = db.tokens.find(
			(t) => t.type === "password_reset" && t.token === token,
		);

		if (!tokenData) return null;

		return {
			userId: tokenData.userId,
			expiresAt: tokenData.expiresAt,
		};
	}

	static async deletePasswordResetToken(token: string): Promise<void> {
		const db = loadDb();
		const index = db.tokens.findIndex(
			(t) => t.type === "password_reset" && t.token === token,
		);

		if (index !== -1) {
			db.tokens.splice(index, 1);
			saveDb(db);
		}
	}
}

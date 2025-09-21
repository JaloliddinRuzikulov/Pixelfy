import { Pool } from "pg";
import { User, Session, UserRole } from "./auth";
import { Kysely, PostgresDialect } from "kysely";
import { createAnalyticsTables } from "./db-analytics";

// Try PostgreSQL first, fallback to memory storage
let useMemoryDb = false;
let pool: Pool;
let kyselyDb: Kysely<any> | null = null;

try {
	if (
		!process.env.DATABASE_URL ||
		process.env.DATABASE_URL.includes(
			"postgresql://postgres:password@localhost",
		)
	) {
		// Development fallback - use memory database
		console.log(
			"Using file-based database for development (PostgreSQL not configured)",
		);
		useMemoryDb = true;
	} else {
		pool = new Pool({
			connectionString: process.env.DATABASE_URL,
			ssl:
				process.env.NODE_ENV === "production"
					? { rejectUnauthorized: false }
					: false,
		});

		// Initialize Kysely for analytics
		kyselyDb = new Kysely({
			dialect: new PostgresDialect({
				pool: pool,
			}),
		});

		// Create analytics tables if they don't exist
		createAnalyticsTables(kyselyDb).catch(console.error);
	}
} catch (error) {
	console.log(
		"PostgreSQL connection failed, falling back to in-memory database:",
		error,
	);
	useMemoryDb = true;
}

export { pool as db, kyselyDb };

// Import file-based implementations for development
import {
	UserRepository as FileUserRepository,
	SessionRepository as FileSessionRepository,
	TokenRepository as FileTokenRepository,
} from "./db-file";

// User database operations
export class UserRepository {
	static async create(userData: {
		email: string;
		passwordHash: string;
		firstName?: string;
		lastName?: string;
		role?: UserRole;
	}): Promise<User> {
		if (useMemoryDb) {
			return FileUserRepository.create(userData);
		}

		const { email, passwordHash, firstName, lastName, role } = userData;

		// Admin emails list
		const adminEmails = ["jaloliddinruzikulov@gmail.com", "admin@pixelfy.uz"];

		// Check if this is the first user (should be admin) or if email is in admin list
		const countResult = await pool.query("SELECT COUNT(*) FROM users");
		const userCount = parseInt(countResult.rows[0].count);
		const userRole =
			role ||
			(userCount === 0 || adminEmails.includes(email.toLowerCase())
				? "admin"
				: "user");

		const result = await pool.query(
			`INSERT INTO users (email, password_hash, first_name, last_name, role) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, email, first_name, last_name, avatar_url, email_verified, role, created_at, updated_at`,
			[email, passwordHash, firstName || null, lastName || null, userRole],
		);

		const row = result.rows[0];
		return {
			id: row.id,
			email: row.email,
			firstName: row.first_name,
			lastName: row.last_name,
			avatarUrl: row.avatar_url,
			emailVerified: row.email_verified,
			role: row.role || "user",
			createdAt: row.created_at,
			updatedAt: row.updated_at,
		};
	}

	static async findByEmail(
		email: string,
	): Promise<(User & { passwordHash: string }) | null> {
		if (useMemoryDb) {
			return FileUserRepository.findByEmail(email);
		}

		const result = await pool.query(
			`SELECT id, email, password_hash, first_name, last_name, avatar_url, email_verified, role, created_at, updated_at 
       FROM users WHERE email = $1`,
			[email],
		);

		if (result.rows.length === 0) return null;

		const row = result.rows[0];
		return {
			id: row.id,
			email: row.email,
			passwordHash: row.password_hash,
			firstName: row.first_name,
			lastName: row.last_name,
			avatarUrl: row.avatar_url,
			emailVerified: row.email_verified,
			role: row.role || "user",
			createdAt: row.created_at,
			updatedAt: row.updated_at,
		};
	}

	static async findById(id: string): Promise<User | null> {
		if (useMemoryDb) {
			return FileUserRepository.findById(id);
		}

		const result = await pool.query(
			`SELECT id, email, first_name, last_name, avatar_url, email_verified, role, created_at, updated_at 
       FROM users WHERE id = $1`,
			[id],
		);

		if (result.rows.length === 0) return null;

		const row = result.rows[0];
		return {
			id: row.id,
			email: row.email,
			firstName: row.first_name,
			lastName: row.last_name,
			avatarUrl: row.avatar_url,
			emailVerified: row.email_verified,
			role: row.role || "user",
			createdAt: row.created_at,
			updatedAt: row.updated_at,
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
		if (useMemoryDb) {
			return FileUserRepository.updateProfile(id, updates);
		}

		const fields = [];
		const values = [];
		let paramCount = 1;

		if (updates.firstName !== undefined) {
			fields.push(`first_name = $${paramCount++}`);
			values.push(updates.firstName);
		}

		if (updates.lastName !== undefined) {
			fields.push(`last_name = $${paramCount++}`);
			values.push(updates.lastName);
		}

		if (updates.avatarUrl !== undefined) {
			fields.push(`avatar_url = $${paramCount++}`);
			values.push(updates.avatarUrl);
		}

		if (fields.length === 0) return this.findById(id);

		values.push(id);

		const result = await pool.query(
			`UPDATE users SET ${fields.join(", ")}, updated_at = NOW() 
       WHERE id = $${paramCount} 
       RETURNING id, email, first_name, last_name, avatar_url, email_verified, created_at, updated_at`,
			values,
		);

		if (result.rows.length === 0) return null;

		const row = result.rows[0];
		return {
			id: row.id,
			email: row.email,
			firstName: row.first_name,
			lastName: row.last_name,
			avatarUrl: row.avatar_url,
			emailVerified: row.email_verified,
			role: row.role || "user",
			createdAt: row.created_at,
			updatedAt: row.updated_at,
		};
	}

	static async updatePassword(
		id: string,
		passwordHash: string,
	): Promise<boolean> {
		if (useMemoryDb) {
			return FileUserRepository.updatePassword(id, passwordHash);
		}

		const result = await pool.query(
			"UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2",
			[passwordHash, id],
		);

		return (result.rowCount ?? 0) > 0;
	}

	static async verifyEmail(id: string): Promise<boolean> {
		if (useMemoryDb) {
			return FileUserRepository.verifyEmail(id);
		}

		const result = await pool.query(
			"UPDATE users SET email_verified = TRUE, updated_at = NOW() WHERE id = $1",
			[id],
		);

		return (result.rowCount ?? 0) > 0;
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
		if (useMemoryDb) {
			return FileUserRepository.update(id, updates);
		}

		const fields: string[] = [];
		const values: any[] = [];
		let paramCount = 1;

		if (updates.firstName !== undefined) {
			fields.push(`first_name = $${paramCount++}`);
			values.push(updates.firstName);
		}
		if (updates.lastName !== undefined) {
			fields.push(`last_name = $${paramCount++}`);
			values.push(updates.lastName);
		}
		if (updates.avatarUrl !== undefined) {
			fields.push(`avatar_url = $${paramCount++}`);
			values.push(updates.avatarUrl);
		}
		if (updates.role !== undefined) {
			fields.push(`role = $${paramCount++}`);
			values.push(updates.role);
		}

		fields.push(`updated_at = NOW()`);
		values.push(id);

		const result = await pool.query(
			`UPDATE users SET ${fields.join(", ")} WHERE id = $${paramCount}
			RETURNING id, email, first_name, last_name, avatar_url, email_verified, role, created_at, updated_at`,
			values,
		);

		if (result.rows.length === 0) {
			throw new Error("User not found");
		}

		const row = result.rows[0];
		return {
			id: row.id,
			email: row.email,
			firstName: row.first_name,
			lastName: row.last_name,
			avatarUrl: row.avatar_url,
			emailVerified: row.email_verified,
			role: row.role || "user",
			createdAt: row.created_at,
			updatedAt: row.updated_at,
		};
	}

	static async findAll(): Promise<User[]> {
		if (useMemoryDb) {
			return FileUserRepository.findAll();
		}

		const result = await pool.query(
			`SELECT id, email, first_name, last_name, avatar_url, email_verified, role, created_at, updated_at, last_login
			FROM users ORDER BY created_at DESC`,
		);

		return result.rows.map((row) => ({
			id: row.id,
			email: row.email,
			firstName: row.first_name,
			lastName: row.last_name,
			avatarUrl: row.avatar_url,
			emailVerified: row.email_verified,
			role: row.role || "user",
			createdAt: row.created_at,
			updatedAt: row.updated_at,
			lastLogin: row.last_login,
		}));
	}
}

// Session database operations
export class SessionRepository {
	static async create(userId: string, sessionToken: string): Promise<Session> {
		if (useMemoryDb) {
			return FileSessionRepository.create(userId, sessionToken);
		}

		const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

		const result = await pool.query(
			`INSERT INTO sessions (user_id, session_token, expires_at) 
       VALUES ($1, $2, $3) 
       RETURNING id, user_id, session_token, expires_at`,
			[userId, sessionToken, expiresAt],
		);

		const row = result.rows[0];
		return {
			id: row.id,
			userId: row.user_id,
			sessionToken: row.session_token,
			expiresAt: row.expires_at,
		};
	}

	static async findByToken(sessionToken: string): Promise<Session | null> {
		if (useMemoryDb) {
			return FileSessionRepository.findByToken(sessionToken);
		}

		const result = await pool.query(
			"SELECT id, user_id, session_token, expires_at FROM sessions WHERE session_token = $1 AND expires_at > NOW()",
			[sessionToken],
		);

		if (result.rows.length === 0) return null;

		const row = result.rows[0];
		return {
			id: row.id,
			userId: row.user_id,
			sessionToken: row.session_token,
			expiresAt: row.expires_at,
		};
	}

	static async deleteByToken(sessionToken: string): Promise<boolean> {
		if (useMemoryDb) {
			return FileSessionRepository.deleteByToken(sessionToken);
		}

		const result = await pool.query(
			"DELETE FROM sessions WHERE session_token = $1",
			[sessionToken],
		);

		return (result.rowCount ?? 0) > 0;
	}

	static async deleteByUserId(userId: string): Promise<boolean> {
		if (useMemoryDb) {
			return FileSessionRepository.deleteByUserId(userId);
		}

		const result = await pool.query("DELETE FROM sessions WHERE user_id = $1", [
			userId,
		]);

		return (result.rowCount ?? 0) > 0;
	}

	static async cleanup(): Promise<number> {
		if (useMemoryDb) {
			return FileSessionRepository.cleanup();
		}

		const result = await pool.query(
			"DELETE FROM sessions WHERE expires_at <= NOW()",
		);

		return result.rowCount ?? 0;
	}
}

// Token database operations for email verification and password reset
export class TokenRepository {
	static async createEmailVerificationToken(
		userId: string,
		token: string,
	): Promise<void> {
		if (useMemoryDb) {
			return FileTokenRepository.createEmailVerificationToken(userId, token);
		}

		const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

		await pool.query(
			"INSERT INTO email_verification_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)",
			[userId, token, expiresAt],
		);
	}

	static async findEmailVerificationToken(token: string): Promise<{
		userId: string;
		expiresAt: Date;
	} | null> {
		if (useMemoryDb) {
			return FileTokenRepository.findEmailVerificationToken(token);
		}

		const result = await pool.query(
			"SELECT user_id, expires_at FROM email_verification_tokens WHERE token = $1",
			[token],
		);

		if (result.rows.length === 0) return null;

		const row = result.rows[0];
		return {
			userId: row.user_id,
			expiresAt: row.expires_at,
		};
	}

	static async deleteEmailVerificationToken(token: string): Promise<void> {
		if (useMemoryDb) {
			return FileTokenRepository.deleteEmailVerificationToken(token);
		}

		await pool.query("DELETE FROM email_verification_tokens WHERE token = $1", [
			token,
		]);
	}

	static async createPasswordResetToken(
		userId: string,
		token: string,
	): Promise<void> {
		if (useMemoryDb) {
			return FileTokenRepository.createPasswordResetToken(userId, token);
		}

		const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

		await pool.query(
			"INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)",
			[userId, token, expiresAt],
		);
	}

	static async findPasswordResetToken(token: string): Promise<{
		userId: string;
		expiresAt: Date;
	} | null> {
		if (useMemoryDb) {
			return FileTokenRepository.findPasswordResetToken(token);
		}

		const result = await pool.query(
			"SELECT user_id, expires_at FROM password_reset_tokens WHERE token = $1",
			[token],
		);

		if (result.rows.length === 0) return null;

		const row = result.rows[0];
		return {
			userId: row.user_id,
			expiresAt: row.expires_at,
		};
	}

	static async deletePasswordResetToken(token: string): Promise<void> {
		if (useMemoryDb) {
			return FileTokenRepository.deletePasswordResetToken(token);
		}

		await pool.query("DELETE FROM password_reset_tokens WHERE token = $1", [
			token,
		]);
	}
}

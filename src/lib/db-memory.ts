import { User, Session } from "./auth";

// In-memory storage for demo/development purposes
let users: (User & { passwordHash: string })[] = [];
let sessions: Session[] = [];
let tokens: any[] = [];

let userIdCounter = 1;
let sessionIdCounter = 1;

// User database operations
export class UserRepository {
	static async create(userData: {
		email: string;
		passwordHash: string;
		firstName?: string;
		lastName?: string;
	}): Promise<User> {
		const { email, passwordHash, firstName, lastName } = userData;
		
		const user = {
			id: userIdCounter.toString(),
			email,
			passwordHash,
			firstName: firstName || undefined,
			lastName: lastName || undefined,
			avatarUrl: undefined,
			emailVerified: false,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};
		
		users.push(user);
		userIdCounter++;
		
		return {
			id: user.id,
			email: user.email,
			firstName: user.firstName,
			lastName: user.lastName,
			avatarUrl: user.avatarUrl,
			emailVerified: user.emailVerified,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
		};
	}

	static async findByEmail(
		email: string,
	): Promise<(User & { passwordHash: string }) | null> {
		const user = users.find(u => u.email === email);
		return user || null;
	}

	static async findById(id: string): Promise<User | null> {
		const user = users.find(u => u.id === id);
		if (!user) return null;
		
		return {
			id: user.id,
			email: user.email,
			firstName: user.firstName,
			lastName: user.lastName,
			avatarUrl: user.avatarUrl,
			emailVerified: user.emailVerified,
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
		const user = users.find(u => u.id === id);
		if (!user) return null;
		
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
		
		return {
			id: user.id,
			email: user.email,
			firstName: user.firstName,
			lastName: user.lastName,
			avatarUrl: user.avatarUrl,
			emailVerified: user.emailVerified,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
		};
	}

	static async updatePassword(
		id: string,
		passwordHash: string,
	): Promise<boolean> {
		const user = users.find(u => u.id === id);
		if (!user) return false;
		
		user.passwordHash = passwordHash;
		user.updatedAt = new Date().toISOString();
		
		return true;
	}

	static async verifyEmail(id: string): Promise<boolean> {
		const user = users.find(u => u.id === id);
		if (!user) return false;
		
		user.emailVerified = true;
		user.updatedAt = new Date().toISOString();
		
		return true;
	}
}

// Session database operations
export class SessionRepository {
	static async create(userId: string, sessionToken: string): Promise<Session> {
		const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

		const session = {
			id: sessionIdCounter.toString(),
			userId,
			sessionToken,
			expiresAt,
		};
		
		sessions.push(session);
		sessionIdCounter++;
		
		return session;
	}

	static async findByToken(sessionToken: string): Promise<Session | null> {
		const session = sessions.find(s => 
			s.sessionToken === sessionToken && 
			new Date(s.expiresAt) > new Date()
		);
		
		return session || null;
	}

	static async deleteByToken(sessionToken: string): Promise<boolean> {
		const index = sessions.findIndex(s => s.sessionToken === sessionToken);
		if (index === -1) return false;
		
		sessions.splice(index, 1);
		return true;
	}

	static async deleteByUserId(userId: string): Promise<boolean> {
		const initialLength = sessions.length;
		sessions = sessions.filter(s => s.userId !== userId);
		return sessions.length < initialLength;
	}

	static async cleanup(): Promise<number> {
		const now = new Date();
		const initialLength = sessions.length;
		sessions = sessions.filter(s => new Date(s.expiresAt) > now);
		return initialLength - sessions.length;
	}
}

// Token database operations for email verification and password reset
export class TokenRepository {
	static async createEmailVerificationToken(
		userId: string,
		token: string,
	): Promise<void> {
		const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
		
		tokens.push({
			type: 'email_verification',
			userId,
			token,
			expiresAt,
		});
	}

	static async findEmailVerificationToken(token: string): Promise<{
		userId: string;
		expiresAt: Date;
	} | null> {
		const tokenData = tokens.find(t => 
			t.type === 'email_verification' && 
			t.token === token
		);
		
		if (!tokenData) return null;
		
		return {
			userId: tokenData.userId,
			expiresAt: tokenData.expiresAt,
		};
	}

	static async deleteEmailVerificationToken(token: string): Promise<void> {
		const index = tokens.findIndex(t => 
			t.type === 'email_verification' && 
			t.token === token
		);
		
		if (index !== -1) {
			tokens.splice(index, 1);
		}
	}

	static async createPasswordResetToken(
		userId: string,
		token: string,
	): Promise<void> {
		const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
		
		tokens.push({
			type: 'password_reset',
			userId,
			token,
			expiresAt,
		});
	}

	static async findPasswordResetToken(token: string): Promise<{
		userId: string;
		expiresAt: Date;
	} | null> {
		const tokenData = tokens.find(t => 
			t.type === 'password_reset' && 
			t.token === token
		);
		
		if (!tokenData) return null;
		
		return {
			userId: tokenData.userId,
			expiresAt: tokenData.expiresAt,
		};
	}

	static async deletePasswordResetToken(token: string): Promise<void> {
		const index = tokens.findIndex(t => 
			t.type === 'password_reset' && 
			t.token === token
		);
		
		if (index !== -1) {
			tokens.splice(index, 1);
		}
	}
}
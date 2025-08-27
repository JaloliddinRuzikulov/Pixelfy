#!/usr/bin/env tsx

import { createReadStream } from "fs";
import { readFile } from "fs/promises";
import { join } from "path";
import { Pool } from "pg";

// Database setup script for authentication system
async function setupAuth() {
	console.log("🚀 Setting up authentication system...");

	// Check for required environment variables
	const requiredEnvVars = ["DATABASE_URL", "JWT_SECRET"];
	const missingEnvVars = requiredEnvVars.filter(
		(envVar) => !process.env[envVar],
	);

	if (missingEnvVars.length > 0) {
		console.error("❌ Missing required environment variables:");
		missingEnvVars.forEach((envVar) => {
			console.error(`   - ${envVar}`);
		});
		console.log(
			"\n💡 Please copy .env.example to .env and fill in the required values.",
		);
		process.exit(1);
	}

	// Connect to database
	const pool = new Pool({
		connectionString: process.env.DATABASE_URL,
		ssl:
			process.env.NODE_ENV === "production"
				? { rejectUnauthorized: false }
				: false,
	});

	try {
		// Test database connection
		await pool.query("SELECT NOW()");
		console.log("✅ Database connection successful");

		// Read and execute migration script
		const migrationPath = join(process.cwd(), "scripts", "auth-migration.sql");
		const migrationSQL = await readFile(migrationPath, "utf-8");

		console.log("🔄 Running database migrations...");
		await pool.query(migrationSQL);
		console.log("✅ Database migrations completed");

		// Verify tables were created
		const tablesResult = await pool.query(`
			SELECT table_name 
			FROM information_schema.tables 
			WHERE table_schema = 'public' 
			AND table_name IN ('users', 'sessions', 'projects', 'email_verification_tokens', 'password_reset_tokens')
			ORDER BY table_name
		`);

		const createdTables = tablesResult.rows.map((row) => row.table_name);
		console.log("✅ Created tables:", createdTables.join(", "));

		console.log("\n🎉 Authentication system setup complete!");
		console.log("\nNext steps:");
		console.log("1. Run 'npm install' to install dependencies");
		console.log("2. Start the development server with 'npm run dev'");
		console.log("3. Visit /auth/register to create your first account");
		console.log("4. Visit /auth/login to sign in");
	} catch (error) {
		console.error("❌ Setup failed:", error);
		process.exit(1);
	} finally {
		await pool.end();
	}
}

// Run setup if this script is executed directly
if (require.main === module) {
	setupAuth().catch(console.error);
}

export default setupAuth;

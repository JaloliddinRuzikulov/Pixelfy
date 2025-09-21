#!/usr/bin/env node
import { config } from "dotenv";
import { UserRepository } from "../src/lib/db";
import { hashPassword } from "../src/lib/auth";

// Load environment variables
config();

const ADMIN_EMAILS = ["jaloliddinruzikulov@gmail.com", "admin@pixelfy.uz"];

async function createAdminUser() {
	console.log("🔧 Admin foydalanuvchi yaratish yoki yangilash...");

	try {
		// Check if user already exists
		const existingUser = await UserRepository.findByEmail(
			"jaloliddinruzikulov@gmail.com",
		);

		if (existingUser) {
			// Update existing user to admin if not already
			if (existingUser.role === "admin") {
				console.log("✅ Foydalanuvchi allaqachon admin!");
				console.log("📧 Email:", existingUser.email);
				console.log("👤 Ism:", existingUser.firstName, existingUser.lastName);
			} else {
				// Update role to admin
				const updated = await UserRepository.update(existingUser.id, {
					role: "admin",
				});
				console.log("✅ Foydalanuvchi admin sifatida yangilandi!");
				console.log("📧 Email:", updated.email);
				console.log("👤 Ism:", updated.firstName, updated.lastName);
				console.log("🛡️ Yangi rol: admin");
			}
			return;
		}

		// Create new admin user with a default password
		const defaultPassword = "Admin@123456"; // You should change this immediately after first login
		const passwordHash = await hashPassword(defaultPassword);

		const adminUser = await UserRepository.create({
			email: "jaloliddinruzikulov@gmail.com",
			passwordHash,
			firstName: "Jaloliddin",
			lastName: "Ruzikulov",
			role: "admin",
		});

		console.log("✅ Admin foydalanuvchi muvaffaqiyatli yaratildi!");
		console.log("📧 Email:", adminUser.email);
		console.log("🔑 Dastlabki parol:", defaultPassword);
		console.log(
			"⚠️  MUHIM: Iltimos, birinchi kirishdan keyin parolni o'zgartiring!",
		);
	} catch (error) {
		console.error("❌ Xatolik:", error);
		process.exit(1);
	}
}

// Run the script
createAdminUser()
	.then(() => {
		console.log("✨ Tayyor!");
		process.exit(0);
	})
	.catch((error) => {
		console.error("❌ Xatolik:", error);
		process.exit(1);
	});

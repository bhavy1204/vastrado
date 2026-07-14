import dotenv from "dotenv";
import mongoose from "mongoose";
import { User } from "../src/models/user.model.js"; // Update path if needed
import path from "path"

dotenv.config({ path: "../.env" });

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL, {
            dbName: ""
        });

        const existingAdmin = await User.findOne({
            email: process.env.ADMIN_EMAIL,
        });

        if (existingAdmin) {
            console.log("✅ Admin already exists.");
            process.exit(0);
        }

        const admin = await User.create({
            fullName: process.env.ADMIN_NAME || "Demo Admin",
            email: process.env.ADMIN_EMAIL,
            password: process.env.ADMIN_PASSWORD,
            role: "admin",
            isEmailVerified: true,
        });

        console.log("✅ Admin created successfully!");
        console.log({
            id: admin._id,
            email: admin.email,
            role: admin.role,
        });

        process.exit(0);
    } catch (error) {
        console.error("❌ Failed to create admin:", error);
        process.exit(1);
    }
};

seedAdmin();

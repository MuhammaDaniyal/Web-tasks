import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req) {
    try {
        console.log("[sign up] Api req started")
        const { username, email, password, role } = await req.json();
        const name = username?.trim();

        // Validate inputs
        if (!name || !password || !email) {
            return NextResponse.json(
                { error: "Name, password, and email are required" },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: "Invalid email format" },
                { status: 400 }
            );
        }

        // Validate password length
        if (password.length < 6) {
            return NextResponse.json(
                { error: "Password must be at least 6 characters" },
                { status: 400 }
            );
        }

        // Connect to database
        await connectToDatabase();
        console.log("[sign up] connected to database")

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        console.log("[sign up] password hashed")

        // Create the new user
        const newUser = new User({
            name,
            email: email,
            password: hashedPassword,
            role: role || "agent"
        });

        // Save to database
        console.log("[sign up] saving user to database");
        await newUser.save();

        return NextResponse.json({ message: "User created successfully. You can now login." }, { status: 201 });

    } catch (error) {
        console.error("Signup error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

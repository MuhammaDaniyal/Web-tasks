import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req) {
    try {
        const { username, password } = await req.json();
        const name = username?.trim();

        if (!name || !password) {
            return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
        }

        await connectToDatabase();

        // 1. Find user in the database
        const user = await User.findOne({ name });
        if (!user) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        // 2. Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        // 3. Generate JWT
        // Defaulting to "secret" if process.env.JWT_SECRET is not set, 
        // though you MUST configure this in production!
        const secret = process.env.JWT_SECRET || "default_jwt_secret";
        const token = jwt.sign(
        { id: user._id, name: user.name, role: user.role }, // add role here
        secret,
        { expiresIn: "7d" } // 1h is too short for development
        );

        const response = NextResponse.json({ message: "Login successful" });

        // 4. Set token in HTTP-only cookie
        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
        });

        return response;

    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
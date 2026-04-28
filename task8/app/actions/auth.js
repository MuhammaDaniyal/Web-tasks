'use server';

import { cookies } from 'next/headers';
import bcrypt from 'bcrypt';
import dbConnect from '../../lib/mongodb';
import User from '../../lib/models/User';

export async function signupUser(formData) {
  try {
    const email = formData.get('email');
    const password = formData.get('password');

    if (!email || !password) {
      return { error: "Email and password are required" };
    }

    await dbConnect();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { error: "Email already registered" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      email,
      password: hashedPassword,
    });

    return { success: true };
  } catch (error) {
    console.error("Signup error:", error);
    return { error: "An unexpected error occurred during signup" };
  }
}

export async function loginUser(formData) {
  try {
    const email = formData.get('email');
    const password = formData.get('password');

    if (!email || !password) {
      return { error: "Email and password are required" };
    }

    await dbConnect();

    const user = await User.findOne({ email });
    if (!user) {
      return { error: "Invalid credentials" };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return { error: "Invalid credentials" };
    }

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('session_user', user.email, {
      httpOnly: true,
      maxAge: 60 * 60 * 24, // 1 day
      secure: process.env.NODE_ENV === 'production',
      path: '/'
    });

    return { success: true };
  } catch (error) {
    console.error("Login error:", error);
    return { error: "An unexpected error occurred during login" };
  }
}

export async function logoutUser() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('session_user');
    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    return { error: "An unexpected error occurred during logout" };
  }
}

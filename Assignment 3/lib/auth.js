import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function getTokenData() {
  try {
    const cookieStore = await cookies();  // ✅ Await the Promise
    const token = cookieStore.get("token")?.value;
    
    if (!token) return null;
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_jwt_secret");
    return decoded;
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}
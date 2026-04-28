import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

// In-memory store — resets on server restart, fine for dev/assignment
const requestCounts = new Map();

function getRateLimitKey(request, payload) {
  return payload?.id || request.ip || "anonymous";
}

function isRateLimited(key, role) {
  if (role === "admin") return false; // admins unlimited

  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const limit = 50;

  if (!requestCounts.has(key)) {
    requestCounts.set(key, { count: 1, windowStart: now });
    return false;
  }

  const entry = requestCounts.get(key);

  // Reset window if 1 minute passed
  if (now - entry.windowStart > windowMs) {
    requestCounts.set(key, { count: 1, windowStart: now });
    return false;
  }

  entry.count += 1;

  if (entry.count > limit) return true;
  return false;
}

export async function middleware(request) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  let payload = null;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "default_jwt_secret");
    const { payload: p } = await jwtVerify(token, secret);
    payload = p;
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Role protection
  if (pathname.startsWith("/admin") && payload.role !== "admin") {
    return NextResponse.redirect(new URL("/agent", request.url));
  }
  if (pathname.startsWith("/agent") && payload.role !== "agent") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // Rate limiting — only on API routes for agents
  if (pathname.startsWith("/api/agent")) {
    const key = getRateLimitKey(request, payload);
    if (isRateLimited(key, payload.role)) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down." },
        { status: 429 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/agent/:path*", "/admin/:path*", "/api/agent/:path*"],
};
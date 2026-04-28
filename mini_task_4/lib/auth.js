import jwt from "jsonwebtoken";

export function verifyAuthToken(token) {
  if (!token) {
    return null;
  }

  const secret = process.env.JWT_SECRET || "default_jwt_secret";

  try {
    return jwt.verify(token, secret);
  } catch {
    return null;
  }
}
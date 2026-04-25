import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";

// Example of Server Component fetching data using a JWT token correctly.
export default async function DashboardPage() {
  // Read token from cookies
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    // Not authenticated -> send them to login
    redirect("/login");
  }

  let decoded;
  try {
    const secret = process.env.JWT_SECRET || "default_jwt_secret";
    decoded = jwt.verify(token, secret);
  } catch (error) {
    console.error("JWT Verification failed:", error);
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-8">
      <div className="max-w-2xl w-full bg-white shadow rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Welcome to your Dashboard
        </h1>
        <p className="text-lg text-gray-600 mb-4">
          Hello, <span className="font-semibold">{decoded.username}</span>!
        </p>
        <div className="bg-blue-50 p-4 rounded text-blue-800 border border-blue-200">
          <p>
            You have successfully logged in using your MongoDB credentials. A JWT token
            has been verified on the server side to grant you access to this page.
          </p>

          <button>
            Go back
          </button>

        </div>
      </div>
    </div>
  );
}

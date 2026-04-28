import Sidebar from "@/components/Sidebar";
import { getTokenData } from "@/lib/auth";

export default async function AgentLayout({ children }) {
  const tokenData = await getTokenData();

  // Check if user is authorized to access agent routes
  if (!tokenData || tokenData.role !== "agent") {
    return (
      <div className="min-h-screen bg-[#0B0B0C] flex items-center justify-center">
        <div className="bg-red-500 text-white p-6 rounded-lg shadow-lg text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">⚠️ Unauthorized Access</h2>
          <p className="mb-6">
            You do not have permission to access the Agent Dashboard. Only agents can access this area.
          </p>
          <a
            href="/admin"
            className="inline-block bg-white text-red-500 px-6 py-2 rounded font-bold hover:bg-gray-100 transition"
          >
            Go to Admin Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0C]">
      <Sidebar role="agent" />
      <main className="ml-56 min-h-screen p-6">
        {children}
      </main>
    </div>
  );
}
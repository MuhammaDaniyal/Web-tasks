"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminAgents() {
  const router = useRouter();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/agents")
      .then(r => { if (r.status === 401) { router.push("/login"); return null; } return r.json(); })
      .then(d => { if (d) { setAgents(d.agents || []); setLoading(false); } });
  }, []);

  function logout() {
    document.cookie = "token=; Max-Age=0; path=/";
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h1 className="text-lg font-medium">Agents</h1>
        <div className="flex items-center gap-5">
          <Link href="/admin" className="text-sm text-blue-600 hover:underline">Dashboard</Link>
          <Link href="/admin/leads" className="text-sm text-blue-600 hover:underline">Leads</Link>
          <button onClick={logout} className="text-sm px-3 py-1 border border-gray-200 rounded-md hover:bg-gray-50">Logout</button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {loading ? (
          <p className="text-sm text-gray-400">Loading...</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {agents.map(agent => (
              <div key={agent._id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium text-sm">
                      {agent.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{agent.name}</p>
                      <p className="text-xs text-gray-400">{agent.email}</p>
                    </div>
                  </div>
                  <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">Agent</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xl font-semibold text-gray-700">{agent.stats.total}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Total</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3">
                    <p className="text-xl font-semibold text-orange-600">{agent.stats.active}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Active</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-xl font-semibold text-green-600">{agent.stats.closed}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Closed</p>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Close rate</span>
                    <span>{agent.stats.total ? Math.round((agent.stats.closed / agent.stats.total) * 100) : 0}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-400 rounded-full transition-all"
                      style={{ width: `${agent.stats.total ? Math.round((agent.stats.closed / agent.stats.total) * 100) : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
            {agents.length === 0 && (
              <p className="text-sm text-gray-400">No agents found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const statusClass = {
  New: "bg-blue-50 text-blue-600",
  Contacted: "bg-yellow-50 text-yellow-700",
  "In Progress": "bg-orange-50 text-orange-600",
  Closed: "bg-green-50 text-green-600",
  Lost: "bg-red-50 text-red-600",
};

const priorityClass = {
  High: "bg-red-50 text-red-600",
  Medium: "bg-orange-50 text-orange-600",
  Low: "bg-green-50 text-green-600",
};

export default function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then(r => { if (r.status === 401) { router.push("/login"); return null; } return r.json(); })
      .then(d => { if (d) { setData(d); setLoading(false); } });
  }, []);

  function logout() {
    document.cookie = "token=; Max-Age=0; path=/";
    router.push("/login");
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen text-gray-400 text-sm">
      Loading...
    </div>
  );

  const { totalLeads, byStatus, byPriority, unassigned, overdue, agents } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h1 className="text-lg font-medium">Dashboard</h1>
        <div className="flex items-center gap-5">
          <Link href="/admin/leads" className="text-sm text-blue-600 hover:underline">Leads</Link>
          <Link href="/admin/agents" className="text-sm text-blue-600 hover:underline">Agents</Link>
          <button onClick={logout} className="text-sm px-3 py-1 border border-gray-200 rounded-md hover:bg-gray-50">
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Leads", value: totalLeads, color: "text-blue-600" },
            { label: "Unassigned", value: unassigned, color: "text-orange-500" },
            { label: "Overdue Follow-ups", value: overdue, color: "text-red-500" },
            { label: "Agents", value: agents.length, color: "text-green-600" },
          ].map(c => (
            <div key={c.label} className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-xs text-gray-400 mb-1">{c.label}</p>
              <p className={`text-3xl font-semibold ${c.color}`}>{c.value}</p>
            </div>
          ))}
        </div>

        {/* Status + Priority */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-medium text-gray-700 mb-4">By Status</h2>
            <div className="space-y-2">
              {byStatus.map(s => (
                <div key={s._id} className="flex justify-between items-center">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusClass[s._id] || "bg-gray-100 text-gray-500"}`}>
                    {s._id}
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="w-28 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-400 rounded-full"
                        style={{ width: `${Math.round((s.count / totalLeads) * 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-4 text-right">{s.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-medium text-gray-700 mb-4">By Priority</h2>
            <div className="space-y-2">
              {byPriority.map(p => (
                <div key={p._id} className="flex justify-between items-center">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${priorityClass[p._id] || "bg-gray-100 text-gray-500"}`}>
                    {p._id}
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="w-28 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-400 rounded-full"
                        style={{ width: `${Math.round((p.count / totalLeads) * 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-4 text-right">{p.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Agent performance */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-medium text-gray-700 mb-4">Agent Performance</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100">
                <th className="pb-2 font-medium">Agent</th>
                <th className="pb-2 font-medium">Total</th>
                <th className="pb-2 font-medium">Active</th>
                <th className="pb-2 font-medium">Closed</th>
                <th className="pb-2 font-medium">Close Rate</th>
              </tr>
            </thead>
            <tbody>
              {agents.map(a => (
                <tr key={a._id} className="border-b border-gray-50 last:border-0">
                  <td className="py-2.5">
                    <p className="font-medium text-gray-800">{a.name}</p>
                    <p className="text-xs text-gray-400">{a.email}</p>
                  </td>
                  <td className="py-2.5">{a.total}</td>
                  <td className="py-2.5 text-orange-600">{a.active}</td>
                  <td className="py-2.5 text-green-600">{a.closed}</td>
                  <td className="py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-400 rounded-full"
                          style={{ width: `${a.total ? Math.round((a.closed / a.total) * 100) : 0}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">
                        {a.total ? Math.round((a.closed / a.total) * 100) : 0}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
              {agents.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-gray-400">No agents found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
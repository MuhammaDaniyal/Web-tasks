"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
    <div className="flex items-center justify-center min-h-screen bg-[#0B0B0C] text-[#A1A1AA] text-sm">
      Loading...
    </div>
  );

  const { totalLeads, byStatus, byPriority, unassigned, overdue, agents } = data;

  const statusStyle = {
    New: "bg-zinc-800 text-zinc-300",
    Contacted: "bg-blue-500/10 text-blue-400",
    "In Progress": "bg-amber-500/10 text-amber-400",
    Closed: "bg-green-500/10 text-green-400",
    Lost: "bg-red-500/10 text-red-400",
  };

  const priorityStyle = {
    High: "bg-red-500/10 text-red-400",
    Medium: "bg-amber-500/10 text-amber-400",
    Low: "bg-green-500/10 text-green-400",
  };

  return (
    <div className="min-h-screen bg-[#0B0B0C] p-6">
      <div className="space-y-6">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-semibold text-[#F5F5F5]">Dashboard</h1>
            <p className="text-xs text-[#A1A1AA]">Overview of your property dealer CRM activity</p>
          </div>
          <button
            onClick={logout}
            className="border border-[#2A2A2E] hover:bg-[#1A1A1D] text-[#A1A1AA] text-sm px-4 py-2 rounded-lg transition-colors duration-200"
          >
            Logout
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Leads", value: totalLeads, color: "text-indigo-400" },
            { label: "Unassigned", value: unassigned, color: "text-amber-400" },
            { label: "Overdue Follow-ups", value: overdue, color: "text-red-400" },
            { label: "Total Agents", value: agents.length, color: "text-green-400" },
          ].map(c => (
            <div key={c.label} className="bg-[#111113] border border-[#2A2A2E] rounded-2xl p-5">
              <p className="text-xs text-[#A1A1AA] mb-2">{c.label}</p>
              <p className={`text-3xl font-semibold ${c.color}`}>{c.value}</p>
            </div>
          ))}
        </div>

        {/* Status + Priority */}
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="bg-[#111113] border border-[#2A2A2E] rounded-2xl p-5">
            <h2 className="text-sm font-medium text-[#F5F5F5] mb-4">By Status</h2>
            <div className="space-y-4">
              {byStatus.map(s => (
                <div key={s._id} className="flex justify-between items-center">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusStyle[s._id] || "bg-zinc-800 text-zinc-300"}`}>
                    {s._id}
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="w-28 h-1.5 bg-[#1A1A1D] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${Math.round((s.count / totalLeads) * 100)}%` }}
                      />
                    </div>
                    <span className="text-sm text-[#F5F5F5] font-medium w-4 text-right">{s.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#111113] border border-[#2A2A2E] rounded-2xl p-5">
            <h2 className="text-sm font-medium text-[#F5F5F5] mb-4">By Priority</h2>
            <div className="space-y-4">
              {byPriority.map(p => (
                <div key={p._id} className="flex justify-between items-center">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${priorityStyle[p._id] || "bg-zinc-800 text-zinc-300"}`}>
                    {p._id}
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="w-28 h-1.5 bg-[#1A1A1D] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full"
                        style={{ width: `${Math.round((p.count / totalLeads) * 100)}%` }}
                      />
                    </div>
                    <span className="text-sm text-[#F5F5F5] font-medium w-4 text-right">{p.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Agent performance */}
        <div className="bg-[#111113] border border-[#2A2A2E] rounded-2xl p-5">
          <h2 className="text-sm font-medium text-[#F5F5F5] mb-4">Agent Performance</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#A1A1AA] border-b border-[#2A2A2E]">
                <th className="pb-2 font-medium">Agent name + email</th>
                <th className="pb-2 font-medium">Total</th>
                <th className="pb-2 font-medium">Active</th>
                <th className="pb-2 font-medium">Closed</th>
                <th className="pb-2 font-medium">Close Rate</th>
              </tr>
            </thead>
            <tbody>
              {agents.map(a => (
                <tr key={a._id} className="border-b border-[#2A2A2E] last:border-0">
                  <td className="py-2.5">
                    <p className="text-sm text-[#F5F5F5] font-medium">{a.name}</p>
                    <p className="text-xs text-[#A1A1AA]">{a.email}</p>
                  </td>
                  <td className="py-2.5 text-[#F5F5F5]">{a.total}</td>
                  <td className="py-2.5 text-amber-400">{a.active}</td>
                  <td className="py-2.5 text-green-400">{a.closed}</td>
                  <td className="py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-[#1A1A1D] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${a.total ? Math.round((a.closed / a.total) * 100) : 0}%` }}
                        />
                      </div>
                      <span className="text-xs text-[#A1A1AA]">
                        {a.total ? Math.round((a.closed / a.total) * 100) : 0}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
              {agents.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-[#A1A1AA]">No agents found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
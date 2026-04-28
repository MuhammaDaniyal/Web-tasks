"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AgentDashboard() {
  const router = useRouter();
  const [leads, setLeads] = useState([]);
  const [filter, setFilter] = useState({ status: "", priority: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
    const interval = setInterval(fetchLeads, 30000);
    return () => clearInterval(interval);
  }, [filter]);

  async function fetchLeads() {
    const params = new URLSearchParams();
    if (filter.status) params.set("status", filter.status);
    if (filter.priority) params.set("priority", filter.priority);

    const res = await fetch(`/api/agent/leads?${params}`);
    if (res.status === 401) {
      router.push("/login");
      return;
    }
    const data = await res.json();
    setLeads(data.leads || []);
    setLoading(false);
  }

  const priorityBadge = {
    High: "bg-red-500/10 text-red-400",
    Medium: "bg-amber-500/10 text-amber-400",
    Low: "bg-green-500/10 text-green-400",
  };

  const statusBadge = {
    New: "bg-zinc-800 text-zinc-300",
    Contacted: "bg-blue-500/10 text-blue-400",
    "In Progress": "bg-amber-500/10 text-amber-400",
    Closed: "bg-green-500/10 text-green-400",
    Lost: "bg-red-500/10 text-red-400",
  };

  const overdueLeads = leads.filter(l =>
    l.followUpDate && new Date(l.followUpDate) < new Date() && !["Closed", "Lost"].includes(l.status)
  );

  return (
    <div className="min-h-screen bg-[#0B0B0C] p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-[#F5F5F5]">My Leads</h1>
          <p className="text-xs text-[#A1A1AA]">Your assigned leads and follow-ups</p>
        </div>
        <button
          onClick={() => {
            document.cookie = "token=; Max-Age=0; path=/";
            router.push("/login");
          }}
          className="border border-[#2A2A2E] hover:bg-[#1A1A1D] text-[#A1A1AA] text-sm px-4 py-2 rounded-lg transition-colors duration-200"
        >
          Logout
        </button>
      </div>

      {overdueLeads.length > 0 && (
        <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-400 text-sm">
          ⚠️ You have {overdueLeads.length} overdue follow-up{overdueLeads.length > 1 ? "s" : ""}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <select
          value={filter.status}
          onChange={e => setFilter({ ...filter, status: e.target.value })}
          className="bg-[#1A1A1D] border border-[#2A2A2E] rounded-lg px-3 py-2 text-sm text-[#F5F5F5] focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">All Statuses</option>
          {["New", "Contacted", "In Progress", "Closed", "Lost"].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select
          value={filter.priority}
          onChange={e => setFilter({ ...filter, priority: e.target.value })}
          className="bg-[#1A1A1D] border border-[#2A2A2E] rounded-lg px-3 py-2 text-sm text-[#F5F5F5] focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">All Priorities</option>
          {["High", "Medium", "Low"].map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => setFilter({ status: "", priority: "" })}
          className="border border-[#2A2A2E] hover:bg-[#1A1A1D] text-[#A1A1AA] text-sm px-4 py-2 rounded-lg transition-colors duration-200"
        >
          Clear
        </button>
      </div>

      {loading ? (
        <p className="text-[#A1A1AA] text-sm">Loading...</p>
      ) : leads.length === 0 ? (
        <div className="text-center py-16 text-[#A1A1AA] text-sm">No leads found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {leads.map(lead => {
            const isOverdue = lead.followUpDate && new Date(lead.followUpDate) < new Date() && !["Closed", "Lost"].includes(lead.status);

            return (
              <button
                key={lead._id}
                type="button"
                onClick={() => router.push(`/agent/leads/${lead._id}`)}
                className="text-left bg-[#111113] border border-[#2A2A2E] rounded-2xl p-5 hover:bg-[#1A1A1D] transition-colors duration-200"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-sm font-medium text-[#F5F5F5] mb-2">{lead.name}</h2>
                    <p className="text-xs text-[#A1A1AA] mb-2">{lead.propertyInterest || "No property interest"}</p>
                    <p className="text-sm text-[#F5F5F5]">Rs. {lead.budget?.toLocaleString()}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${priorityBadge[lead.priority]}`}>{lead.priority}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadge[lead.status]}`}>{lead.status}</span>
                  </div>
                </div>
                {isOverdue && (
                  <div className="text-xs text-red-400 bg-red-500/10 rounded-lg p-2">
                    ⚠️ Follow-up overdue
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

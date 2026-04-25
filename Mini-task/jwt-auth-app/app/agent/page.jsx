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
    // Polling every 30 seconds
    const interval = setInterval(fetchLeads, 30000);
    return () => clearInterval(interval);
  }, [filter]);

  async function fetchLeads() {
    const params = new URLSearchParams();
    if (filter.status) params.set("status", filter.status);
    if (filter.priority) params.set("priority", filter.priority);

    const res = await fetch(`/api/agent/leads?${params}`);
    if (res.status === 401) { router.push("/login"); return; }
    const data = await res.json();
    setLeads(data.leads || []);
    setLoading(false);
  }

  const priorityColor = { High: "#ef4444", Medium: "#f97316", Low: "#22c55e" };
  const overdueLeads = leads.filter(l =>
    l.followUpDate && new Date(l.followUpDate) < new Date() &&
    !["Closed", "Lost"].includes(l.status)
  );

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 500 }}>My Leads</h1>
        <button onClick={() => { document.cookie = "token=; Max-Age=0; path=/"; router.push("/login"); }}
          style={{ padding: "6px 14px", border: "1px solid #e5e7eb", borderRadius: 6, cursor: "pointer" }}>
          Logout
        </button>
      </div>

      {/* Overdue banner */}
      {overdueLeads.length > 0 && (
        <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, padding: "10px 16px", marginBottom: 20, color: "#b91c1c" }}>
          ⚠️ You have {overdueLeads.length} overdue follow-up{overdueLeads.length > 1 ? "s" : ""}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <select value={filter.status} onChange={e => setFilter({ ...filter, status: e.target.value })}
          style={{ padding: "6px 10px", border: "1px solid #d1d5db", borderRadius: 6 }}>
          <option value="">All Statuses</option>
          {["New", "Contacted", "In Progress", "Closed", "Lost"].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select value={filter.priority} onChange={e => setFilter({ ...filter, priority: e.target.value })}
          style={{ padding: "6px 10px", border: "1px solid #d1d5db", borderRadius: 6 }}>
          <option value="">All Priorities</option>
          {["High", "Medium", "Low"].map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {/* Leads list */}
      {loading ? <p>Loading...</p> : leads.length === 0 ? <p style={{ color: "#6b7280" }}>No leads assigned yet.</p> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {leads.map(lead => (
            <div key={lead._id}
              onClick={() => router.push(`/agent/leads/${lead._id}`)}
              style={{ padding: 16, border: "1px solid #e5e7eb", borderRadius: 10, cursor: "pointer", background: "#fff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p style={{ fontWeight: 500, marginBottom: 4 }}>{lead.name}</p>
                  <p style={{ fontSize: 13, color: "#6b7280" }}>{lead.propertyInterest}</p>
                  <p style={{ fontSize: 13, color: "#6b7280" }}>Budget: Rs. {lead.budget?.toLocaleString()}</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                  <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 20, background: priorityColor[lead.priority] + "20", color: priorityColor[lead.priority] }}>
                    {lead.priority}
                  </span>
                  <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 20, background: "#f3f4f6", color: "#374151" }}>
                    {lead.status}
                  </span>
                </div>
              </div>
              {lead.followUpDate && new Date(lead.followUpDate) < new Date() && !["Closed", "Lost"].includes(lead.status) && (
                <p style={{ fontSize: 12, color: "#dc2626", marginTop: 8 }}>⚠️ Follow-up overdue</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
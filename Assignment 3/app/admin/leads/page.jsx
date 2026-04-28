"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLeads() {
  const router = useRouter();
  const [leads, setLeads] = useState([]);
  const [agents, setAgents] = useState([]);
  const [filter, setFilter] = useState({ status: "", priority: "" });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    propertyInterest: "",
    budget: "",
    notes: "",
    assignedTo: "",
  });

  useEffect(() => {
    fetchLeads();
    fetch("/api/admin/agents").then(r => r.json()).then(d => setAgents(d.agents || []));
  }, [filter]);

  async function fetchLeads() {
    const params = new URLSearchParams();
    if (filter.status) params.set("status", filter.status);
    if (filter.priority) params.set("priority", filter.priority);
    const res = await fetch(`/api/admin/leads?${params}`);
    if (res.status === 401) {
      router.push("/login");
      return;
    }
    const data = await res.json();
    setLeads(data.leads || []);
    setLoading(false);
  }

  async function handleCreate(e) {
    e.preventDefault();
    const res = await fetch("/api/admin/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowForm(false);
      setForm({ name: "", email: "", phone: "", propertyInterest: "", budget: "", notes: "", assignedTo: "" });
      fetchLeads();
    }
  }

  async function handleAssign(leadId, agentId) {
    await fetch(`/api/admin/leads/${leadId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignedTo: agentId || null }),
    });
    fetchLeads();
  }

  async function handleStatusUpdate(leadId, status) {
    await fetch(`/api/admin/leads/${leadId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchLeads();
  }

  async function handleDelete(leadId) {
    if (!confirm("Delete this lead?")) return;
    await fetch(`/api/admin/leads/${leadId}`, { method: "DELETE" });
    fetchLeads();
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

  return (
    <div className="min-h-screen bg-[#0B0B0C] p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-[#F5F5F5]">All Leads</h1>
          <p className="text-xs text-[#A1A1AA]">Track, assign, and manage every lead</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg transition-colors duration-200"
        >
          + New Lead
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <select
          value={filter.status}
          onChange={e => setFilter({ ...filter, status: e.target.value })}
          className="bg-[#1A1A1D] border border-[#2A2A2E] rounded-lg px-3 py-2 text-sm text-[#F5F5F5] focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">All Statuses</option>
          {["New", "Contacted", "In Progress", "Closed", "Lost"].map(s => <option key={s}>{s}</option>)}
        </select>
        <select
          value={filter.priority}
          onChange={e => setFilter({ ...filter, priority: e.target.value })}
          className="bg-[#1A1A1D] border border-[#2A2A2E] rounded-lg px-3 py-2 text-sm text-[#F5F5F5] focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">All Priorities</option>
          {["High", "Medium", "Low"].map(p => <option key={p}>{p}</option>)}
        </select>
        <button
          type="button"
          onClick={() => setFilter({ status: "", priority: "" })}
          className="border border-[#2A2A2E] hover:bg-[#1A1A1D] text-[#A1A1AA] text-sm px-4 py-2 rounded-lg transition-colors duration-200"
        >
          Clear
        </button>
        <div className="ml-auto">
          <Link href="/admin" className="text-sm text-indigo-400 hover:text-[#F5F5F5] transition-colors duration-200">
            Dashboard
          </Link>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6">
          <div className="w-full max-w-lg bg-[#111113] border border-[#2A2A2E] rounded-2xl p-5">
            <h2 className="text-sm font-medium text-[#F5F5F5] mb-4">New Lead</h2>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              {[
                { label: "Name *", key: "name", type: "text", required: true },
                { label: "Email", key: "email", type: "email" },
                { label: "Phone", key: "phone", type: "text" },
                { label: "Property Interest", key: "propertyInterest", type: "text" },
                { label: "Budget (Rs) *", key: "budget", type: "number", required: true },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs text-[#A1A1AA] mb-2 block">{f.label}</label>
                  <input
                    type={f.type}
                    required={f.required}
                    value={form[f.key]}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    className="bg-[#1A1A1D] border border-[#2A2A2E] rounded-lg px-3 py-2 text-sm text-[#F5F5F5] focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full"
                  />
                </div>
              ))}
              <div>
                <label className="text-xs text-[#A1A1AA] mb-2 block">Assign To</label>
                <select
                  value={form.assignedTo}
                  onChange={e => setForm({ ...form, assignedTo: e.target.value })}
                  className="bg-[#1A1A1D] border border-[#2A2A2E] rounded-lg px-3 py-2 text-sm text-[#F5F5F5] focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full"
                >
                  <option value="">Unassigned</option>
                  {agents.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-[#A1A1AA] mb-2 block">Notes</label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  className="bg-[#1A1A1D] border border-[#2A2A2E] rounded-lg px-3 py-2 text-sm text-[#F5F5F5] focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full resize-none"
                />
              </div>
              <div className="flex gap-4 pt-2">
                <button type="submit" className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg transition-colors duration-200 flex-1">
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="border border-[#2A2A2E] hover:bg-[#1A1A1D] text-[#A1A1AA] text-sm px-4 py-2 rounded-lg transition-colors duration-200 flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-[#A1A1AA] text-sm">Loading...</p>
      ) : (
        <div className="bg-[#111113] border border-[#2A2A2E] rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-[#2A2A2E]">
              <tr className="text-left text-[#A1A1AA]">
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 font-medium">Budget</th>
                <th className="px-4 py-3 font-medium">Priority</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Assigned To</th>
                <th className="px-4 py-3 font-medium">Follow-up Date</th>
                <th className="px-4 py-3 font-medium">Delete</th>
              </tr>
            </thead>
            <tbody>
              {leads.map(lead => (
                <tr key={lead._id} className="border-b border-[#2A2A2E] last:border-0 hover:bg-[#1A1A1D]">
                  <td className="px-4 py-3 align-top">
                    <button
                      type="button"
                      onClick={() => router.push(`/admin/leads/${lead._id}`)}
                      className="text-left"
                    >
                      <p className="text-sm text-[#F5F5F5] font-medium hover:text-indigo-400 transition-colors duration-200">{lead.name}</p>
                      <p className="text-xs text-[#A1A1AA] mb-2">{lead.propertyInterest}</p>
                    </button>
                    {lead.phone && (
                      <a
                        href={`https://wa.me/${lead.phone}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-green-400 hover:text-green-300 transition-colors duration-200"
                      >
                        WhatsApp
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[#F5F5F5] align-top">Rs. {lead.budget?.toLocaleString()}</td>
                  <td className="px-4 py-3 align-top">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${priorityBadge[lead.priority]}`}>{lead.priority}</span>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <select
                      value={lead.status}
                      onChange={e => handleStatusUpdate(lead._id, e.target.value)}
                      className="bg-[#1A1A1D] border border-[#2A2A2E] rounded-lg px-3 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full"
                    >
                      {['New', 'Contacted', 'In Progress', 'Closed', 'Lost'].map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <select
                      value={lead.assignedTo?._id || ""}
                      onChange={e => handleAssign(lead._id, e.target.value)}
                      className="bg-[#1A1A1D] border border-[#2A2A2E] rounded-lg px-3 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full"
                    >
                      <option value="">Unassigned</option>
                      {agents.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 align-top text-[#A1A1AA]">
                    {lead.followUpDate ? new Date(lead.followUpDate).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <button onClick={() => handleDelete(lead._id)} className="text-red-400 hover:text-red-300 text-sm transition-colors duration-200">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-[#A1A1AA] text-sm">No leads found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

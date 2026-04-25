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
    name: "", email: "", phone: "", propertyInterest: "", budget: "", notes: "", assignedTo: ""
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
    if (res.status === 401) { router.push("/login"); return; }
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

  async function handleDelete(leadId) {
    if (!confirm("Delete this lead?")) return;
    await fetch(`/api/admin/leads/${leadId}`, { method: "DELETE" });
    fetchLeads();
  }

  const priorityColor = { High: "text-red-600 bg-red-50", Medium: "text-orange-600 bg-orange-50", Low: "text-green-600 bg-green-50" };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h1 className="text-lg font-medium">All Leads</h1>
        <div className="flex gap-3 items-center">
          <Link href="/admin" className="text-sm text-blue-600 hover:underline">Dashboard</Link>
          <button onClick={() => setShowForm(true)}
            className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            + New Lead
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Filters */}
        <div className="flex gap-3 mb-6">
          <select value={filter.status} onChange={e => setFilter({ ...filter, status: e.target.value })}
            className="text-sm px-3 py-1.5 border border-gray-200 rounded-md bg-white">
            <option value="">All Statuses</option>
            {["New", "Contacted", "In Progress", "Closed", "Lost"].map(s => <option key={s}>{s}</option>)}
          </select>
          <select value={filter.priority} onChange={e => setFilter({ ...filter, priority: e.target.value })}
            className="text-sm px-3 py-1.5 border border-gray-200 rounded-md bg-white">
            <option value="">All Priorities</option>
            {["High", "Medium", "Low"].map(p => <option key={p}>{p}</option>)}
          </select>
        </div>

        {/* Create form modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
              <h2 className="text-base font-medium mb-4">New Lead</h2>
              <form onSubmit={handleCreate} className="space-y-3">
                {[
                  { label: "Name *", key: "name", type: "text", required: true },
                  { label: "Email", key: "email", type: "email" },
                  { label: "Phone", key: "phone", type: "text" },
                  { label: "Property Interest", key: "propertyInterest", type: "text" },
                  { label: "Budget (Rs) *", key: "budget", type: "number", required: true },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-xs text-gray-500 block mb-1">{f.label}</label>
                    <input type={f.type} required={f.required}
                      value={form[f.key]}
                      onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                      className="w-full text-sm px-3 py-1.5 border border-gray-200 rounded-md" />
                  </div>
                ))}
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Assign To</label>
                  <select value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })}
                    className="w-full text-sm px-3 py-1.5 border border-gray-200 rounded-md">
                    <option value="">Unassigned</option>
                    {agents.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Notes</label>
                  <textarea rows={2} value={form.notes}
                    onChange={e => setForm({ ...form, notes: e.target.value })}
                    className="w-full text-sm px-3 py-1.5 border border-gray-200 rounded-md resize-none" />
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="submit" className="flex-1 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">Create</button>
                  <button type="button" onClick={() => setShowForm(false)}
                    className="flex-1 py-2 border border-gray-200 text-sm rounded-md hover:bg-gray-50">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Leads table */}
        {loading ? <p className="text-gray-500 text-sm">Loading...</p> : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr className="text-left text-gray-500">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Budget</th>
                  <th className="px-4 py-3 font-medium">Priority</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Assigned To</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map(lead => (
                  <tr key={lead._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p
                      className="font-medium text-gray-800 hover:text-blue-600 cursor-pointer"
                      onClick={() => router.push(`/admin/leads/${lead._id}`)}
                    >
                      {lead.name}
                    </p>
                      <p className="text-xs text-gray-400">{lead.propertyInterest}</p>
                    </td>
                    <td className="px-4 py-3">Rs. {lead.budget?.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${priorityColor[lead.priority]}`}>{lead.priority}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{lead.status}</td>
                    <td className="px-4 py-3">
                      <select
                        value={lead.assignedTo?._id || ""}
                        onChange={e => handleAssign(lead._id, e.target.value)}
                        className="text-xs px-2 py-1 border border-gray-200 rounded-md bg-white">
                        <option value="">Unassigned</option>
                        {agents.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/leads/${lead._id}`}
                        className="inline-flex mr-3 text-xs px-2 py-1 border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50"
                      >
                        View
                      </Link>
                      <button onClick={() => handleDelete(lead._id)}
                        className="text-xs text-red-500 hover:text-red-700">Delete</button>
                    </td>
                  </tr>
                ))}
                {leads.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No leads found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function LeadDetail() {
  const router = useRouter();
  const { id } = useParams();
  const [lead, setLead] = useState(null);
  const [activities, setActivities] = useState([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [emailModal, setEmailModal] = useState(false);
  const [emailForm, setEmailForm] = useState({ subject: "", message: "", target: "lead" });

  useEffect(() => {
    const loadData = () => {
      fetchLead();
      fetchActivities();
    };
    loadData();
    const interval = setInterval(loadData, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  async function fetchLead() {
    const res = await fetch(`/api/agent/leads/${id}`);
    if (res.status === 401) { router.push("/login"); return; }
    if (res.status === 404) {
      setLead(undefined);
      return;
    }
    const data = await res.json();
    setLead(data.lead);
  }

  async function fetchActivities() {
    const res = await fetch(`/api/agent/leads/${id}/activities`);
    if (!res.ok) {
      setActivities([]);
      return;
    }
    const data = await res.json();
    setActivities(data.activities || []);
  }

  async function handleUpdate(field, value) {
    setSaving(true);
    setMsg("");
    const res = await fetch(`/api/agent/leads/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    const data = await res.json();
    if (res.ok) {
      setLead(data.lead);
      fetchActivities();
      setMsg("Saved");
      setTimeout(() => setMsg(""), 2000);
    }
    setSaving(false);
  }

  async function handleSendEmail(e) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/agent/leads/${id}/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(emailForm),
    });

    if (res.ok) {
      setMsg("Email sent successfully");
      setEmailModal(false);
      setEmailForm({ subject: "", message: "", target: "lead" });
      fetchActivities();
      setTimeout(() => setMsg(""), 2000);
    } else {
      const error = await res.json();
      setMsg(error.error || "Failed to send email");
    }
    setSaving(false);
  }

  if (lead === null) return <div className="text-center py-16 text-[#A1A1AA] text-sm">Loading...</div>;
  if (lead === undefined) return <div className="text-center py-16 text-[#A1A1AA] text-sm">No leads found.</div>;

  const priorityBadge = {
    High: "bg-red-500/10 text-red-400",
    Medium: "bg-amber-500/10 text-amber-400",
    Low: "bg-green-500/10 text-green-400",
  };

  const actionDot = {
    LEAD_CREATED: "bg-indigo-500",
    LEAD_ASSIGNED: "bg-purple-500",
    STATUS_UPDATED: "bg-amber-400",
    FOLLOWUP_SET: "bg-indigo-500",
    NOTES_UPDATED: "bg-zinc-500",
    LEAD_CLOSED: "bg-green-500",
  };

  return (
    <div className="min-h-screen bg-[#0B0B0C] p-6">
      <div className="flex items-center gap-2 mb-6 text-sm">
        <button
          type="button"
          onClick={() => router.push("/agent")}
          className="text-[#A1A1AA] hover:text-[#F5F5F5] transition-colors duration-200"
        >
          My Leads
        </button>
        <span className="text-[#2A2A2E]">/</span>
        <span className="text-[#F5F5F5]">{lead.name}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-[#111113] border border-[#2A2A2E] rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-[#F5F5F5]">Client Info</h2>
              <span className={`text-xs px-2 py-0.5 rounded-full ${priorityBadge[lead.priority] || "bg-zinc-800 text-zinc-300"}`}>
                {lead.priority}
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-xs text-[#A1A1AA]">Email</span>
                <span className="text-sm text-[#F5F5F5]">{lead.email || "—"}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-xs text-[#A1A1AA]">Phone</span>
                <span className="text-sm text-[#F5F5F5]">{lead.phone || "—"}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-xs text-[#A1A1AA]">Interest</span>
                <span className="text-sm text-[#F5F5F5]">{lead.propertyInterest || "—"}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-xs text-[#A1A1AA]">Budget</span>
                <span className="text-sm text-[#F5F5F5]">Rs. {lead.budget?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-xs text-[#A1A1AA]">Score</span>
                <span className="text-sm text-[#F5F5F5]">{lead.score}</span>
              </div>
            </div>
            {lead.phone && (
              <a
                href={`https://wa.me/${lead.phone}`}
                target="_blank"
                rel="noreferrer"
                className="inline-block bg-green-500/10 text-green-400 text-sm px-4 py-2 rounded-lg transition-colors duration-200"
              >
                WhatsApp
              </a>
            )}
            <button
              onClick={() => setEmailModal(true)}
              className="inline-block bg-blue-500/10 text-blue-400 text-sm px-4 py-2 rounded-lg transition-colors duration-200 ml-2"
            >
              Email
            </button>
          </div>

          <div className="bg-[#111113] border border-[#2A2A2E] rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-medium text-[#F5F5F5]">Assignment</h2>
            <div>
              <label className="text-xs text-[#A1A1AA] mb-2 block">Status</label>
              <select
                value={lead.status}
                onChange={e => handleUpdate("status", e.target.value)}
                className="bg-[#1A1A1D] border border-[#2A2A2E] rounded-lg px-3 py-2 text-sm text-[#F5F5F5] focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full"
              >
                {["New", "Contacted", "In Progress", "Closed", "Lost"].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-[#111113] border border-[#2A2A2E] rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-medium text-[#F5F5F5]">Follow-up</h2>
            <div>
              <label className="text-xs text-[#A1A1AA] mb-2 block">Date</label>
              <input
                type="date"
                value={lead.followUpDate ? new Date(lead.followUpDate).toISOString().split("T")[0] : ""}
                onChange={e => handleUpdate("followUpDate", e.target.value)}
                className="bg-[#1A1A1D] border border-[#2A2A2E] rounded-lg px-3 py-2 text-sm text-[#F5F5F5] focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full"
              />
            </div>
          </div>

          <div className="bg-[#111113] border border-[#2A2A2E] rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-medium text-[#F5F5F5]">Notes</h2>
            <textarea
              rows={4}
              defaultValue={lead.notes}
              onBlur={e => handleUpdate("notes", e.target.value)}
              className="bg-[#1A1A1D] border border-[#2A2A2E] rounded-lg px-3 py-2 text-sm text-[#F5F5F5] focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full resize-none"
            />
            {msg && <p className="text-xs text-green-400">{msg}</p>}
            {saving && <p className="text-xs text-[#A1A1AA]">Saving...</p>}
          </div>
        </div>

        <div>
          <div className="bg-[#111113] border border-[#2A2A2E] rounded-2xl p-5">
            <h2 className="text-sm font-medium text-[#F5F5F5] mb-4">Activity Timeline</h2>
            {activities.length === 0 ? (
              <div className="text-center py-16 text-[#A1A1AA] text-sm">No activities found.</div>
            ) : (
              <div className="relative">
                <div className="absolute left-2 top-0 bottom-0 w-px bg-[#2A2A2E]" />
                <div className="space-y-4">
                  {activities.map(a => (
                    <div key={a._id} className="flex gap-4 relative">
                      <div className={`w-4 h-4 rounded-full mt-0.5 shrink-0 z-10 ${actionDot[a.action] || "bg-zinc-500"}`} />
                      <div>
                        <p className="text-sm text-[#F5F5F5]">{a.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-[#A1A1AA]">{a.performedBy?.name || "System"}</span>
                          <span className="text-[#2A2A2E]">·</span>
                          <span className="text-xs text-[#A1A1AA]">{new Date(a.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {emailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111113] border border-[#2A2A2E] rounded-2xl p-6 max-w-md w-full">
            <h2 className="text-lg font-bold text-[#F5F5F5] mb-4">Send Email to Lead</h2>
            <form onSubmit={handleSendEmail} className="space-y-4">
              <div>
                <label className="text-xs text-[#A1A1AA] mb-2 block">Recipient Email</label>
                <div className="bg-[#1A1A1D] border border-[#2A2A2E] rounded-lg px-3 py-2 text-sm text-[#F5F5F5]">
                  {lead.email || "No email available"}
                </div>
              </div>
              <div>
                <label className="text-xs text-[#A1A1AA] mb-2 block">Subject</label>
                <input
                  type="text"
                  value={emailForm.subject}
                  onChange={e => setEmailForm({ ...emailForm, subject: e.target.value })}
                  placeholder="Email subject"
                  className="bg-[#1A1A1D] border border-[#2A2A2E] rounded-lg px-3 py-2 text-sm text-[#F5F5F5] focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-[#A1A1AA] mb-2 block">Message</label>
                <textarea
                  rows={4}
                  value={emailForm.message}
                  onChange={e => setEmailForm({ ...emailForm, message: e.target.value })}
                  placeholder="Your message..."
                  className="bg-[#1A1A1D] border border-[#2A2A2E] rounded-lg px-3 py-2 text-sm text-[#F5F5F5] focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full resize-none"
                  required
                />
              </div>
              {msg && <p className="text-xs text-red-400">{msg}</p>}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 disabled:opacity-60"
                >
                  {saving ? "Sending..." : "Send"}
                </button>
                <button
                  type="button"
                  onClick={() => setEmailModal(false)}
                  className="flex-1 border border-[#2A2A2E] hover:bg-[#1A1A1D] text-[#A1A1AA] px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
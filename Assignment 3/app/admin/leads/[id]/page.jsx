"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

const actionDot = {
  LEAD_CREATED: "bg-indigo-500",
  LEAD_ASSIGNED: "bg-purple-500",
  STATUS_UPDATED: "bg-amber-400",
  FOLLOWUP_SET: "bg-indigo-500",
  LEAD_CLOSED: "bg-green-500",
  NOTES_UPDATED: "bg-zinc-500",
};

const priorityBadge = {
  High: "bg-red-500/10 text-red-400",
  Medium: "bg-amber-500/10 text-amber-400",
  Low: "bg-green-500/10 text-green-400",
};

export default function AdminLeadDetail() {
  const router = useRouter();
  const { id } = useParams();
  const [lead, setLead] = useState(null);
  const [activities, setActivities] = useState([]);
  const [agents, setAgents] = useState([]);
  const [followUpDate, setFollowUpDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [emailModal, setEmailModal] = useState(false);
  const [emailForm, setEmailForm] = useState({ subject: "", message: "", target: "lead" });
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  useEffect(() => {
    const loadData = () => {
      fetchAll();
      fetch("/api/admin/agents").then(r => r.json()).then(d => setAgents(d.agents || []));
    };
    loadData();
    const interval = setInterval(fetchAll, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  async function fetchAll() {
    const [leadRes, actRes] = await Promise.all([
      fetch(`/api/admin/leads/${id}`),
      fetch(`/api/admin/leads/${id}/activities`),
    ]);

    if (leadRes.status === 401) {
      router.push("/login");
      return;
    }

    if (!leadRes.ok) {
      setLead(undefined);
      setActivities([]);
      return;
    }

    const leadData = await leadRes.json();

    let actData = { activities: [] };
    if (actRes.ok) {
      const contentType = actRes.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        actData = await actRes.json();
      }
    }

    setLead(leadData.lead);
    setActivities(actData.activities || []);

    if (leadData.lead?.followUpDate) {
      setFollowUpDate(new Date(leadData.lead.followUpDate).toISOString().split("T")[0]);
    } else {
      setFollowUpDate("");
    }
  }

  async function handleUpdate(field, value) {
    setSaving(true);
    const res = await fetch(`/api/admin/leads/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });

    const data = await res.json();
    if (res.ok) {
      setLead(data.lead);
      fetchAll();
      flash("Saved");
    }
    setSaving(false);
  }

  async function handleFollowUp() {
    setSaving(true);
    const res = await fetch(`/api/admin/leads/${id}/followup`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ followUpDate }),
    });

    if (res.ok) {
      fetchAll();
      flash("Follow-up saved");
    }
    setSaving(false);
  }

  async function handleSendEmail(e) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/admin/leads/${id}/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(emailForm),
    });

    if (res.ok) {
      flash("Email sent successfully");
      setEmailModal(false);
      setEmailForm({ subject: "", message: "", target: "lead" });
      fetchAll();
    } else {
      const error = await res.json();
      setMsg(error.error || "Failed to send email");
    }
    setSaving(false);
  }

  async function handleGetSuggestion() {
    setAiLoading(true);
    setAiError("");

    try {
      const res = await fetch(`/api/admin/leads/${id}/ai-suggestion`, {
        method: "POST",
      });

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        setAiError(data.error || "Failed to generate suggestion");
        return;
      }

      setAiSuggestion(data.suggestion || "");
    } catch (error) {
      console.error("Failed to get AI suggestion:", error);
      setAiError("Failed to generate suggestion");
    } finally {
      setAiLoading(false);
    }
  }

  function flash(message) {
    setMsg(message);
    setTimeout(() => setMsg(""), 2000);
  }

  const isOverdue = lead?.followUpDate && new Date(lead.followUpDate) < new Date() && !["Closed", "Lost"].includes(lead?.status);

  if (lead === undefined) {
    return <div className="text-center py-16 text-[#A1A1AA] text-sm">No leads found.</div>;
  }

  if (!lead) {
    return <div className="text-center py-16 text-[#A1A1AA] text-sm">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0B0B0C] p-6">
      <div className="flex items-center gap-2 mb-6 text-sm">
        <Link href="/admin/leads" className="text-[#A1A1AA] hover:text-[#F5F5F5] transition-colors duration-200">
          Leads
        </Link>
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
            <div className="space-y-2">
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
            <div>
              <label className="text-xs text-[#A1A1AA] mb-2 block">Assigned Agent</label>
              <select
                value={lead.assignedTo?._id || ""}
                onChange={e => handleUpdate("assignedTo", e.target.value || null)}
                className="bg-[#1A1A1D] border border-[#2A2A2E] rounded-lg px-3 py-2 text-sm text-[#F5F5F5] focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full"
              >
                <option value="">Unassigned</option>
                {agents.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
              </select>
            </div>
          </div>

          <div className={`bg-[#111113] border rounded-2xl p-5 space-y-4 ${isOverdue ? "border-red-400" : "border-[#2A2A2E]"}`}>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-[#F5F5F5]">Follow-up</h2>
              {isOverdue && <span className="text-xs text-red-400">Overdue</span>}
            </div>
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="text-xs text-[#A1A1AA] mb-2 block">Date</label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={e => setFollowUpDate(e.target.value)}
                  className="bg-[#1A1A1D] border border-[#2A2A2E] rounded-lg px-3 py-2 text-sm text-[#F5F5F5] focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full"
                />
              </div>
              <button
                onClick={handleFollowUp}
                disabled={saving}
                className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg transition-colors duration-200 disabled:opacity-60"
              >
                Save
              </button>
              {followUpDate && (
                <button
                  onClick={() => {
                    setFollowUpDate("");
                    handleFollowUp();
                  }}
                  className="border border-[#2A2A2E] hover:bg-[#1A1A1D] text-[#A1A1AA] text-sm px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  Clear
                </button>
              )}
            </div>
            {msg && <p className="text-xs text-green-400">{msg}</p>}
          </div>

          <div className="bg-[#111113] border border-[#2A2A2E] rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-medium text-[#F5F5F5]">Notes</h2>
            <textarea
              rows={4}
              defaultValue={lead.notes}
              onBlur={e => handleUpdate("notes", e.target.value)}
              className="bg-[#1A1A1D] border border-[#2A2A2E] rounded-lg px-3 py-2 text-sm text-[#F5F5F5] focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full resize-none"
              placeholder="Add notes..."
            />
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
                          <span className="text-xs text-[#A1A1AA]">
                            {new Date(a.createdAt).toLocaleDateString("en-PK", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
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

      <div className="mt-6 bg-[#111113] border border-[#2A2A2E] rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-medium text-[#F5F5F5]">AI Follow-up Suggestion</h2>
          <button
            type="button"
            onClick={handleGetSuggestion}
            disabled={aiLoading}
            className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg transition-colors duration-200 disabled:opacity-60"
          >
            {aiLoading ? "Generating..." : "Get Suggestion"}
          </button>
        </div>

        {aiError && (
          <p className="text-sm text-red-400">{aiError}</p>
        )}

        {aiSuggestion && (
          <div className="bg-[#1A1A1D] border border-[#2A2A2E] rounded-lg p-4">
            <p className="text-sm text-[#F5F5F5] whitespace-pre-wrap leading-6">{aiSuggestion}</p>
          </div>
        )}

        {!aiSuggestion && !aiError && (
          <p className="text-xs text-[#A1A1AA]">Generate a contextual next-step suggestion based on this lead's profile and notes.</p>
        )}
      </div>

      {emailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111113] border border-[#2A2A2E] rounded-2xl p-6 max-w-md w-full">
            <h2 className="text-lg font-bold text-[#F5F5F5] mb-4">Send Email</h2>
            <form onSubmit={handleSendEmail} className="space-y-4">
              <div>
                <label className="text-xs text-[#A1A1AA] mb-2 block">Recipient</label>
                <select
                  value={emailForm.target}
                  onChange={e => setEmailForm({ ...emailForm, target: e.target.value })}
                  className="bg-[#1A1A1D] border border-[#2A2A2E] rounded-lg px-3 py-2 text-sm text-[#F5F5F5] focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full"
                >
                  <option value="lead">Lead ({lead.email || "No email"})</option>
                  <option value="agent">Assigned Agent ({lead.assignedTo?.email || "Not assigned"})</option>
                  <option value="admin">Admin</option>
                </select>
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

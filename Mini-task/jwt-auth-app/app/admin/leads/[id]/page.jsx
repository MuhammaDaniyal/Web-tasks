"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

const actionLabel = {
  LEAD_CREATED:   { label: "Lead Created",    color: "bg-blue-500" },
  LEAD_ASSIGNED:  { label: "Assigned",        color: "bg-purple-500" },
  STATUS_UPDATED: { label: "Status Updated",  color: "bg-yellow-500" },
  FOLLOWUP_SET:   { label: "Follow-up Set",   color: "bg-indigo-500" },
  LEAD_CLOSED:    { label: "Closed",          color: "bg-green-500" },
  NOTES_UPDATED:  { label: "Notes Updated",   color: "bg-gray-400" },
};

export default function AdminLeadDetail() {
  const router = useRouter();
  const { id } = useParams();
  const [lead, setLead] = useState(null);
  const [activities, setActivities] = useState([]);
  const [agents, setAgents] = useState([]);
  const [followUpDate, setFollowUpDate] = useState("");
  const [emailTarget, setEmailTarget] = useState("lead");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const [emailMsg, setEmailMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetchAll();
    fetch("/api/admin/agents").then(r => r.json()).then(d => setAgents(d.agents || []));
  }, []);

  async function fetchAll() {
    const [leadRes, actRes] = await Promise.all([
      fetch(`/api/admin/leads/${id}`),
      fetch(`/api/admin/leads/${id}/activities`),
    ]);

    if (leadRes.status === 401) { router.push("/login"); return; }

    const leadData = await leadRes.json();
    const actData = await actRes.json();

    setLead(leadData.lead);
    setActivities(actData.activities || []);
    if (leadData.lead?.followUpDate) {
      setFollowUpDate(new Date(leadData.lead.followUpDate).toISOString().split("T")[0]);
    }

    if (!emailSubject) {
      setEmailSubject(`Update regarding lead: ${leadData.lead?.name || "Client"}`);
    }
    if (!emailMessage) {
      setEmailMessage(
        `Hello,\n\nHere is an update regarding the lead ${leadData.lead?.name || "client"}.\n\nRegards,\nAdmin Team`
      );
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
    if (res.ok) { fetchAll(); flash("Follow-up saved"); }
    setSaving(false);
  }

  function flash(m) {
    setMsg(m);
    setTimeout(() => setMsg(""), 2000);
  }

  async function handleSendEmail() {
    setEmailMsg("");
    setEmailSending(true);

    const res = await fetch(`/api/admin/leads/${id}/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        target: emailTarget,
        subject: emailSubject,
        message: emailMessage,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      setEmailMsg("Email sent successfully");
      fetchAll();
    } else {
      setEmailMsg(data.error || "Failed to send email");
    }

    setEmailSending(false);
  }

  const priorityClass = { High: "bg-red-50 text-red-600", Medium: "bg-orange-50 text-orange-600", Low: "bg-green-50 text-green-600" };
  const isOverdue = lead?.followUpDate && new Date(lead.followUpDate) < new Date() && !["Closed", "Lost"].includes(lead?.status);

  if (!lead) return <div className="flex items-center justify-center min-h-screen text-gray-400 text-sm">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/admin/leads" className="text-sm text-gray-400 hover:text-gray-600">← Leads</Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-medium">{lead.name}</span>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${priorityClass[lead.priority]}`}>
          {lead.priority} Priority · Score {lead.score}
        </span>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 grid md:grid-cols-2 gap-6">

        {/* Left — lead info + controls */}
        <div className="space-y-4">

          {/* Info card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            <h2 className="text-sm font-medium text-gray-700">Client Info</h2>
            {[
              { label: "Email", value: lead.email },
              { label: "Phone", value: lead.phone },
              { label: "Interest", value: lead.propertyInterest },
              { label: "Budget", value: `Rs. ${lead.budget?.toLocaleString()}` },
            ].map(f => (
              <div key={f.label} className="flex justify-between text-sm">
                <span className="text-gray-400">{f.label}</span>
                <span className="text-gray-700">{f.value || "—"}</span>
              </div>
            ))}
            {lead.phone && (
              <a href={`https://wa.me/${lead.phone}`} target="_blank"
                className="inline-block mt-1 text-xs px-3 py-1 bg-green-50 text-green-600 rounded-md hover:bg-green-100">
                WhatsApp
              </a>
            )}
          </div>

          {/* Status + assign */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            <h2 className="text-sm font-medium text-gray-700">Assignment</h2>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Status</label>
              <select
                value={lead.status}
                onChange={e => handleUpdate("status", e.target.value)}
                className="w-full text-sm px-3 py-1.5 border border-gray-200 rounded-md bg-white"
              >
                {["New", "Contacted", "In Progress", "Closed", "Lost"].map(s => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Assigned To</label>
              <select
                value={lead.assignedTo?._id || ""}
                onChange={e => handleUpdate("assignedTo", e.target.value || null)}
                className="w-full text-sm px-3 py-1.5 border border-gray-200 rounded-md bg-white"
              >
                <option value="">Unassigned</option>
                {agents.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
              </select>
            </div>
          </div>

          {/* Follow-up */}
          <div className={`bg-white rounded-xl border p-5 space-y-3 ${isOverdue ? "border-red-300" : "border-gray-200"}`}>
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-medium text-gray-700">Follow-up</h2>
              {isOverdue && <span className="text-xs text-red-500 font-medium">⚠️ Overdue</span>}
            </div>
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="text-xs text-gray-400 block mb-1">Date</label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={e => setFollowUpDate(e.target.value)}
                  className="w-full text-sm px-3 py-1.5 border border-gray-200 rounded-md"
                />
              </div>
              <button
                onClick={handleFollowUp}
                disabled={saving}
                className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Save
              </button>
              {followUpDate && (
                <button
                  onClick={() => { setFollowUpDate(""); handleFollowUp(); }}
                  className="text-sm px-3 py-1.5 border border-gray-200 rounded-md hover:bg-gray-50 text-gray-500"
                >
                  Clear
                </button>
              )}
            </div>
            {msg && <p className="text-xs text-green-600">{msg}</p>}
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-medium text-gray-700 mb-2">Notes</h2>
            <textarea
              rows={4}
              defaultValue={lead.notes}
              onBlur={e => handleUpdate("notes", e.target.value)}
              className="w-full text-sm px-3 py-2 border border-gray-200 rounded-md resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Add notes..."
            />
          </div>

          {/* Email */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            <h2 className="text-sm font-medium text-gray-700">Email</h2>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Send To</label>
              <select
                value={emailTarget}
                onChange={e => setEmailTarget(e.target.value)}
                className="w-full text-sm px-3 py-1.5 border border-gray-200 rounded-md bg-white"
              >
                <option value="lead">Lead {lead.email ? `(${lead.email})` : "(no email)"}</option>
                <option value="agent" disabled={!lead.assignedTo?.email}>
                  Assigned Agent {lead.assignedTo?.email ? `(${lead.assignedTo.email})` : "(not available)"}
                </option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Subject</label>
              <input
                type="text"
                value={emailSubject}
                onChange={e => setEmailSubject(e.target.value)}
                className="w-full text-sm px-3 py-1.5 border border-gray-200 rounded-md"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Message</label>
              <textarea
                rows={4}
                value={emailMessage}
                onChange={e => setEmailMessage(e.target.value)}
                className="w-full text-sm px-3 py-2 border border-gray-200 rounded-md resize-none"
                placeholder="Write your email message..."
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSendEmail}
                disabled={emailSending || !emailSubject || !emailMessage}
                className="text-sm px-3 py-1.5 bg-slate-700 text-white rounded-md hover:bg-slate-800 disabled:opacity-50"
              >
                {emailSending ? "Sending..." : "Send Email"}
              </button>
              {emailMsg && <p className="text-xs text-gray-600">{emailMsg}</p>}
            </div>
          </div>
        </div>

        {/* Right — activity timeline */}
        <div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-medium text-gray-700 mb-4">Activity Timeline</h2>
            {activities.length === 0 ? (
              <p className="text-sm text-gray-400">No activity yet.</p>
            ) : (
              <div className="relative">
                {/* vertical line */}
                <div className="absolute left-2 top-0 bottom-0 w-px bg-gray-100" />
                <div className="space-y-4">
                  {activities.map(a => {
                    const meta = actionLabel[a.action] || { label: a.action, color: "bg-gray-400" };
                    return (
                      <div key={a._id} className="flex gap-4 relative">
                        <div className={`w-4 h-4 rounded-full mt-0.5 shrink-0 z-10 ${meta.color}`} />
                        <div>
                          <p className="text-sm text-gray-700">{a.description}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-gray-400">{a.performedBy?.name}</span>
                            <span className="text-gray-200">·</span>
                            <span className="text-xs text-gray-400">
                              {new Date(a.createdAt).toLocaleDateString("en-PK", {
                                day: "numeric", month: "short", year: "numeric",
                                hour: "2-digit", minute: "2-digit"
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
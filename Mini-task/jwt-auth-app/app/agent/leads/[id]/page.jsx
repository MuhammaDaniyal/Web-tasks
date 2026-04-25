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

  useEffect(() => {
    fetchLead();
    fetchActivities();
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

  if (lead === null) return <p style={{ padding: 24 }}>Loading...</p>;
  if (lead === undefined) return <p style={{ padding: 24 }}>Lead not found.</p>;

  const priorityColor = { High: "#ef4444", Medium: "#f97316", Low: "#22c55e" };

  return (
    <div style={{ padding: 24, maxWidth: 700, margin: "0 auto" }}>
      <button onClick={() => router.push("/agent")}
        style={{ marginBottom: 20, color: "#2563eb", background: "none", border: "none", cursor: "pointer", fontSize: 14 }}>
        ← Back
      </button>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 500 }}>{lead.name}</h1>
        <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 20, background: priorityColor[lead.priority] + "20", color: priorityColor[lead.priority] }}>
          {lead.priority} Priority
        </span>
      </div>

      {/* Lead info */}
      <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 20, marginBottom: 20 }}>
        <p style={{ marginBottom: 8 }}><b>Email:</b> {lead.email || "—"}</p>
        <p style={{ marginBottom: 8 }}><b>Phone:</b> {lead.phone || "—"}</p>
        <p style={{ marginBottom: 8 }}><b>Interest:</b> {lead.propertyInterest || "—"}</p>
        <p style={{ marginBottom: 8 }}><b>Budget:</b> Rs. {lead.budget?.toLocaleString()}</p>
        <p style={{ marginBottom: 16 }}><b>Score:</b> {lead.score}</p>

        {/* WhatsApp button */}
        {lead.phone && (
          <a href={`https://wa.me/${lead.phone}`} target="_blank"
            style={{ display: "inline-block", padding: "6px 14px", background: "#22c55e", color: "#fff", borderRadius: 6, textDecoration: "none", fontSize: 13, marginBottom: 16 }}>
            WhatsApp
          </a>
        )}

        {/* Status update */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 13, color: "#6b7280", display: "block", marginBottom: 4 }}>Status</label>
          <select value={lead.status}
            onChange={e => handleUpdate("status", e.target.value)}
            style={{ padding: "6px 10px", border: "1px solid #d1d5db", borderRadius: 6 }}>
            {["New", "Contacted", "In Progress", "Closed", "Lost"].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Follow-up date */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 13, color: "#6b7280", display: "block", marginBottom: 4 }}>Follow-up Date</label>
          <input type="date"
            value={lead.followUpDate ? new Date(lead.followUpDate).toISOString().split("T")[0] : ""}
            onChange={e => handleUpdate("followUpDate", e.target.value)}
            style={{ padding: "6px 10px", border: "1px solid #d1d5db", borderRadius: 6 }} />
        </div>

        {/* Notes */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 13, color: "#6b7280", display: "block", marginBottom: 4 }}>Notes</label>
          <textarea rows={3} defaultValue={lead.notes}
            onBlur={e => handleUpdate("notes", e.target.value)}
            style={{ width: "100%", padding: "8px", border: "1px solid #d1d5db", borderRadius: 6, resize: "vertical" }} />
        </div>

        {msg && <p style={{ color: "#16a34a", fontSize: 13 }}>{msg}</p>}
        {saving && <p style={{ color: "#6b7280", fontSize: 13 }}>Saving...</p>}
      </div>

      {/* Activity timeline */}
      <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: 12 }}>Activity Timeline</h2>
      {activities.length === 0 ? <p style={{ color: "#6b7280", fontSize: 13 }}>No activity yet.</p> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {activities.map(a => (
            <div key={a._id} style={{ padding: "10px 14px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13 }}>
              <p style={{ marginBottom: 2 }}>{a.description}</p>
              <p style={{ color: "#9ca3af", fontSize: 12 }}>
                {a.performedBy?.name} · {new Date(a.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
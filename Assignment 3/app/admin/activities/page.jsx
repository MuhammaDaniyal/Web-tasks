"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminActivities() {
  const router = useRouter();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ action: "", sortBy: "createdAt", order: "-1" });

  useEffect(() => {
    fetchActivities();
  }, [filter]);

  async function fetchActivities() {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter.action) params.set("action", filter.action);
    params.set("sortBy", filter.sortBy);
    params.set("order", filter.order);

    try {
      const res = await fetch(`/api/admin/activities?${params}`);
      if (res.status === 401) {
        router.push("/login");
        return;
      }

      if (!res.ok) {
        setActivities([]);
        return;
      }

      const data = await res.json();
      setActivities(data.activities || []);
    } catch (error) {
      console.error("Failed to load activities:", error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }

  const actionColors = {
    LEAD_CREATED: "bg-indigo-500/10 text-indigo-400",
    LEAD_ASSIGNED: "bg-purple-500/10 text-purple-400",
    STATUS_UPDATED: "bg-amber-500/10 text-amber-400",
    FOLLOWUP_SET: "bg-indigo-500/10 text-indigo-400",
    NOTES_UPDATED: "bg-zinc-500/10 text-zinc-400",
    LEAD_CLOSED: "bg-green-500/10 text-green-400",
    EMAIL_SENT: "bg-blue-500/10 text-blue-400",
  };

  const actionDot = {
    LEAD_CREATED: "bg-indigo-500",
    LEAD_ASSIGNED: "bg-purple-500",
    STATUS_UPDATED: "bg-amber-400",
    FOLLOWUP_SET: "bg-indigo-500",
    NOTES_UPDATED: "bg-zinc-500",
    LEAD_CLOSED: "bg-green-500",
    EMAIL_SENT: "bg-blue-500",
  };

  return (
    <div className="min-h-screen bg-[#0B0B0C] p-6">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-[#F5F5F5]">Activity Audit Log</h1>
        <p className="text-xs text-[#A1A1AA]">All system activities and changes for audit purposes</p>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <select
          value={filter.action}
          onChange={e => setFilter({ ...filter, action: e.target.value })}
          className="bg-[#1A1A1D] border border-[#2A2A2E] rounded-lg px-3 py-2 text-sm text-[#F5F5F5] focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">All Actions</option>
          {["LEAD_CREATED", "LEAD_ASSIGNED", "STATUS_UPDATED", "FOLLOWUP_SET", "NOTES_UPDATED", "LEAD_CLOSED", "EMAIL_SENT"].map(a => (
            <option key={a} value={a}>{a.replace(/_/g, " ")}</option>
          ))}
        </select>

        <select
          value={filter.sortBy}
          onChange={e => setFilter({ ...filter, sortBy: e.target.value })}
          className="bg-[#1A1A1D] border border-[#2A2A2E] rounded-lg px-3 py-2 text-sm text-[#F5F5F5] focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="createdAt">Sort by Date</option>
          <option value="action">Sort by Action</option>
        </select>

        <select
          value={filter.order}
          onChange={e => setFilter({ ...filter, order: e.target.value })}
          className="bg-[#1A1A1D] border border-[#2A2A2E] rounded-lg px-3 py-2 text-sm text-[#F5F5F5] focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="-1">Newest First</option>
          <option value="1">Oldest First</option>
        </select>

        <button
          type="button"
          onClick={() => setFilter({ action: "", sortBy: "createdAt", order: "-1" })}
          className="border border-[#2A2A2E] hover:bg-[#1A1A1D] text-[#A1A1AA] text-sm px-4 py-2 rounded-lg transition-colors duration-200"
        >
          Reset
        </button>
      </div>

      {loading ? (
        <p className="text-[#A1A1AA] text-sm">Loading activities...</p>
      ) : (
        <div className="space-y-3">
          {activities.length === 0 ? (
            <div className="bg-[#111113] border border-[#2A2A2E] rounded-2xl p-6 text-center text-[#A1A1AA] text-sm">
              No activities found.
            </div>
          ) : (
            activities.map(a => (
              <div key={a._id} className="bg-[#111113] border border-[#2A2A2E] rounded-2xl p-4">
                <div className="flex items-start gap-4">
                  <div className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${actionDot[a.action] || "bg-zinc-500"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${actionColors[a.action] || "bg-zinc-800 text-zinc-300"}`}>
                        {a.action.replace(/_/g, " ")}
                      </span>
                      {a.leadId && (
                        <button
                          onClick={() => router.push(`/admin/leads/${a.leadId._id}`)}
                          className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors duration-200"
                        >
                          Lead: {a.leadId.name}
                        </button>
                      )}
                      {a.leadId?.phone && (
                        <span className="text-xs text-[#A1A1AA]">Phone: {a.leadId.phone}</span>
                      )}
                    </div>
                    <p className="text-sm text-[#F5F5F5] mt-2">{a.description}</p>
                    <div className="flex items-center gap-3 mt-3 flex-wrap">
                      <span className="text-xs text-[#A1A1AA]">
                        By: <span className="font-medium text-[#F5F5F5]">{a.performedBy?.name || "System"}</span>
                        {a.performedBy?.role && <span className="text-[#2A2A2E]"> · {a.performedBy.role}</span>}
                      </span>
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
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

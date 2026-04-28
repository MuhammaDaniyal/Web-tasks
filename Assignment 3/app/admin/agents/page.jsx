"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminAgents() {
  const router = useRouter();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/agents")
      .then(r => {
        if (r.status === 401) {
          router.push("/login");
          return null;
        }
        return r.json();
      })
      .then(d => {
        if (d) {
          setAgents(d.agents || []);
          setLoading(false);
        }
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0B0C] p-6">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-[#F5F5F5]">Agents</h1>
        <p className="text-xs text-[#A1A1AA]">Team workload and performance overview</p>
      </div>

      {loading ? (
        <p className="text-sm text-[#A1A1AA]">Loading...</p>
      ) : agents.length === 0 ? (
        <div className="text-center py-16 text-[#A1A1AA] text-sm">No agents found.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {agents.map(agent => {
            const closeRate = agent.stats.total ? Math.round((agent.stats.closed / agent.stats.total) * 100) : 0;
            const initials = agent.name
              .split(" ")
              .map(n => n[0])
              .join("")
              .toUpperCase();

            return (
              <div key={agent._id} className="bg-[#111113] border border-[#2A2A2E] rounded-2xl p-5">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-sm font-medium">
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#F5F5F5]">{agent.name}</p>
                    <p className="text-xs text-[#A1A1AA]">{agent.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-[#1A1A1D] border border-[#2A2A2E] rounded-lg p-2 text-center">
                    <p className="text-sm text-[#F5F5F5] font-medium">{agent.stats.total}</p>
                    <p className="text-xs text-[#A1A1AA]">Total</p>
                  </div>
                  <div className="bg-[#1A1A1D] border border-[#2A2A2E] rounded-lg p-2 text-center">
                    <p className="text-sm text-amber-400 font-medium">{agent.stats.active}</p>
                    <p className="text-xs text-[#A1A1AA]">Active</p>
                  </div>
                  <div className="bg-[#1A1A1D] border border-[#2A2A2E] rounded-lg p-2 text-center">
                    <p className="text-sm text-green-400 font-medium">{agent.stats.closed}</p>
                    <p className="text-xs text-[#A1A1AA]">Closed</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-[#A1A1AA]">Close Rate</p>
                    <p className="text-xs text-[#A1A1AA]">{closeRate}%</p>
                  </div>
                  <div className="w-full h-1.5 bg-[#1A1A1D] rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${closeRate}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

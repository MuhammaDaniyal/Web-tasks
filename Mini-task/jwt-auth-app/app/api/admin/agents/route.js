import { NextResponse } from "next/server";
import { getTokenData } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Lead from "@/models/Lead";

export async function GET() {
  const user = await getTokenData();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  const agents = await User.find({ role: "agent" }).select("-password");

  const agentsWithStats = await Promise.all(agents.map(async (agent) => {
    const [total, closed, active] = await Promise.all([
      Lead.countDocuments({ assignedTo: agent._id }),
      Lead.countDocuments({ assignedTo: agent._id, status: "Closed" }),
      Lead.countDocuments({ assignedTo: agent._id, status: { $nin: ["Closed", "Lost"] } }),
    ]);
    return { ...agent.toObject(), stats: { total, closed, active } };
  }));

  return NextResponse.json({ agents: agentsWithStats });
}
import { NextResponse } from "next/server";
import { getTokenData } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Activity from "@/models/Activity";
import Lead from "@/models/Lead";
import User from "@/models/User";

export async function GET(request, { params }) {
  const user = await getTokenData();
  if (!user || user.role !== "agent") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  // Make sure this lead belongs to this agent
  const { id } = await params;
  const lead = await Lead.findOne({ _id: id, assignedTo: user.id });
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  const activities = await Activity.find({ leadId: id })
    .populate("performedBy", "name role")
    .sort({ createdAt: -1 });

  return NextResponse.json({ activities });
}
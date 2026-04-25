import { NextResponse } from "next/server";
import { getTokenData } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Lead from "@/models/Lead";
import Activity from "@/models/Activity";

export async function GET(request, { params }) {
  const user = await getTokenData();
  if (!user || user.role !== "agent") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();
  const { id } = await params;
  const lead = await Lead.findOne({ _id: id, assignedTo: user.id });
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  return NextResponse.json({ lead });
}

export async function PUT(request, { params }) {
  const user = await getTokenData();
  if (!user || user.role !== "agent") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  const { id } = await params;
  const lead = await Lead.findOne({ _id: id, assignedTo: user.id });
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  const body = await request.json();

  // Agents can only update these fields
  const allowed = ["status", "notes", "followUpDate"];
  const updates = {};
  for (const key of allowed) {
    if (body[key] !== undefined) updates[key] = body[key];
  }
  updates.lastActivityAt = new Date();

  // Log status change activity
  if (body.status && body.status !== lead.status) {
    await Activity.create({
      leadId: lead._id,
      performedBy: user.id,
      action: "STATUS_UPDATED",
      description: `Status changed from ${lead.status} to ${body.status}`,
    });
  }

  const updated = await Lead.findByIdAndUpdate(id, updates, { returnDocument: "after" });
  return NextResponse.json({ lead: updated });
}
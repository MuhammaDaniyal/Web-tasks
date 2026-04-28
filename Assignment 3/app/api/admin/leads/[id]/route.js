import { sendLeadAssignedEmail } from "@/lib/email";
import { NextResponse } from "next/server";
import { getTokenData } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Lead from "@/models/Lead";
import User from "@/models/User";
import Activity from "@/models/Activity";

export async function GET(request, { params }) {
  const user = await getTokenData();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();
  const { id } = await params;
  const lead = await Lead.findById(id).populate("assignedTo", "name email");
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  return NextResponse.json({ lead });
}

export async function PUT(request, { params }) {
  const user = await getTokenData();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();
  const { id } = await params;
  const body = await request.json();
  const lead = await Lead.findById(id);
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  // Log assignment change
  if (body.assignedTo !== undefined && String(body.assignedTo) !== String(lead.assignedTo)) {
    const agent = await User.findById(body.assignedTo);
    await Activity.create({
      leadId: lead._id,
      performedBy: user.id,
      action: "LEAD_ASSIGNED",
      description: agent ? `Lead assigned to ${agent.name}` : "Lead unassigned",
    });

    if (agent) {
      try {
        await sendLeadAssignedEmail({
          leadName: lead.name,
          budget: lead.budget,
          propertyInterest: lead.propertyInterest,
          agentName: agent.name,
          agentEmail: agent.email,
        });
      } catch (emailErr) {
        console.error("Email failed:", emailErr.message);
      }
    }
  }

  // Log status change
  if (body.status && body.status !== lead.status) {
    await Activity.create({
      leadId: lead._id,
      performedBy: user.id,
      action: "STATUS_UPDATED",
      description: `Status changed from ${lead.status} to ${body.status}`,
    });
  }

  const updated = await Lead.findByIdAndUpdate(
    id,
    { ...body, lastActivityAt: new Date() },
    { returnDocument: "after" }
  ).populate("assignedTo", "name email");

  return NextResponse.json({ lead: updated });
}

export async function DELETE(request, { params }) {
  const user = await getTokenData();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();
  const { id } = await params;
  await Lead.findByIdAndDelete(id);
  await Activity.deleteMany({ leadId: id });

  return NextResponse.json({ message: "Lead deleted" });
}
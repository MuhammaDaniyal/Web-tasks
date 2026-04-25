import { NextResponse } from "next/server";
import { getTokenData } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import { sendLeadCreatedEmail, sendLeadAssignedEmail } from "@/lib/email";
import Lead from "@/models/Lead";
import User from "@/models/User";
import Activity from "@/models/Activity";

export async function GET(request) {
  const user = await getTokenData();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");

  const query = {};
  if (status) query.status = status;
  if (priority) query.priority = priority;

  const leads = await Lead.find(query)
    .populate("assignedTo", "name email")
    .sort({ createdAt: -1 });

  return NextResponse.json({ leads });
}

export async function POST(request) {
  const user = await getTokenData();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  const body = await request.json();
  const { name, email, phone, propertyInterest, budget, notes, assignedTo } = body;

  if (!name || !budget) {
    return NextResponse.json({ error: "Name and budget are required" }, { status: 400 });
  }

  const lead = await Lead.create({
    name, email, phone, propertyInterest,
    budget: Number(budget), notes,
    assignedTo: assignedTo || null,
    lastActivityAt: new Date()
  });

  try {
    if (assignedTo) {
      const agent = await User.findById(assignedTo);
      await sendLeadCreatedEmail({
        leadName: lead.name,
        budget: lead.budget,
        propertyInterest: lead.propertyInterest,
        agentName: agent?.name,
        agentEmail: agent?.email,
      });
      await sendLeadAssignedEmail({
        leadName: lead.name,
        budget: lead.budget,
        propertyInterest: lead.propertyInterest,
        agentName: agent?.name,
        agentEmail: agent?.email,
      });
    } else {
      await sendLeadCreatedEmail({
        leadName: lead.name,
        budget: lead.budget,
        propertyInterest: lead.propertyInterest,
      });
    }
    } catch (emailErr) {
      console.error("Email failed:", emailErr.message); // don't block the response
    }

  await Activity.create({
    leadId: lead._id,
    performedBy: user.id,
    action: "LEAD_CREATED",
    description: `Lead created by admin`,
  });

  if (assignedTo) {
    await Activity.create({
      leadId: lead._id,
      performedBy: user.id,
      action: "LEAD_ASSIGNED",
      description: `Lead assigned on creation`,
    });
  }

  return NextResponse.json({ lead }, { status: 201 });
}
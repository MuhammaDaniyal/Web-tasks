import { NextResponse } from "next/server";
import { getTokenData } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import { isEmailConfigured, sendCustomEmail } from "@/lib/email";
import Lead from "@/models/Lead";
import Activity from "@/models/Activity";

export async function POST(request, { params }) {
  const user = await getTokenData();
  if (!user || user.role !== "agent") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isEmailConfigured()) {
    return NextResponse.json(
      { error: "Email is not configured. Set EMAIL_USER and EMAIL_PASS in env." },
      { status: 400 }
    );
  }

  await connectToDatabase();

  const { id } = await params;
  const lead = await Lead.findById(id);

  // Agents can only email leads assigned to them
  if (!lead || lead.assignedTo?.toString() !== user.id) {
    return NextResponse.json({ error: "Lead not found or not assigned to you" }, { status: 404 });
  }

  const { subject, message } = await request.json();
  if (!subject || !message) {
    return NextResponse.json({ error: "Subject and message are required" }, { status: 400 });
  }

  const to = lead.email || "";
  if (!to) {
    return NextResponse.json({ error: "Lead email not available" }, { status: 400 });
  }

  await sendCustomEmail({
    to,
    subject,
    message,
    leadName: lead.name,
    budget: lead.budget,
    propertyInterest: lead.propertyInterest,
  });

  await Activity.create({
    leadId: lead._id,
    performedBy: user.id,
    action: "EMAIL_SENT",
    description: `Manual email sent to lead`,
  });

  return NextResponse.json({ message: "Email sent successfully" });
}

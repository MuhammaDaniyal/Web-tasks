import { NextResponse } from "next/server";
import { getTokenData } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import { isEmailConfigured, sendCustomEmail } from "@/lib/email";
import Lead from "@/models/Lead";
import Activity from "@/models/Activity";

export async function POST(request, { params }) {
  const user = await getTokenData();
  if (!user || user.role !== "admin") {
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
  const lead = await Lead.findById(id).populate("assignedTo", "name email");
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  const { target, subject, message } = await request.json();
  if (!subject || !message) {
    return NextResponse.json({ error: "Subject and message are required" }, { status: 400 });
  }

  let to = "";
  let recipientLabel = "";

  if (target === "lead") {
    to = lead.email || "";
    recipientLabel = `lead (${lead.name})`;
  } else if (target === "agent") {
    to = lead.assignedTo?.email || "";
    recipientLabel = `assigned agent (${lead.assignedTo?.name || "Unknown"})`;
  } else if (target === "admin") {
    to = process.env.EMAIL_USER || "";
    recipientLabel = "admin";
  } else {
    return NextResponse.json({ error: "Invalid email target" }, { status: 400 });
  }

  if (!to) {
    return NextResponse.json({ error: "Recipient email not available for selected target" }, { status: 400 });
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
    description: `Manual email sent to ${recipientLabel}`,
  });

  return NextResponse.json({ message: "Email sent successfully" });
}

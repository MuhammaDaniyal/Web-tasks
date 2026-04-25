import { NextResponse } from "next/server";
import { getTokenData } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Lead from "@/models/Lead";
import Activity from "@/models/Activity";

export async function PUT(request, { params }) {
  const user = await getTokenData();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();
  const { id } = await params;
  const { followUpDate } = await request.json();

  const lead = await Lead.findByIdAndUpdate(
    id,
    { followUpDate: followUpDate ? new Date(followUpDate) : null, lastActivityAt: new Date() },
    { returnDocument: "after" }
  );

  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  await Activity.create({
    leadId: lead._id,
    performedBy: user.id,
    action: "FOLLOWUP_SET",
    description: followUpDate
      ? `Follow-up date set to ${new Date(followUpDate).toLocaleDateString()}`
      : "Follow-up date cleared",
  });

  return NextResponse.json({ lead });
}
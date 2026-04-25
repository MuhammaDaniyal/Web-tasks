import { NextResponse } from "next/server";
import { getTokenData } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Lead from "@/models/Lead";

export async function GET(request) {
  const user = await getTokenData();
  if (!user || user.role !== "agent") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");

  const query = { assignedTo: user.id };
  if (status) query.status = status;
  if (priority) query.priority = priority;

  const leads = await Lead.find(query).sort({ createdAt: -1 });
  return NextResponse.json({ leads });
}
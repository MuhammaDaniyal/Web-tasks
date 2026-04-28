import { NextResponse } from "next/server";
import { getTokenData } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Activity from "@/models/Activity";
import Lead from "@/models/Lead";
import User from "@/models/User";

export async function GET(request) {
  try {
    const user = await getTokenData();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const order = searchParams.get("order") || "-1"; // -1 for descending, 1 for ascending

    const query = {};
    if (action) {
      query.action = action;
    }

    const activities = await Activity.find(query)
      .populate("leadId", "name phone")
      .populate("performedBy", "name role")
      .sort({ [sortBy]: parseInt(order, 10) })
      .limit(500);

    return NextResponse.json({ activities });
  } catch (error) {
    console.error("Failed to fetch activities:", error);
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 });
  }
}

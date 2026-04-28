import { NextResponse } from "next/server";
import { getTokenData } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Lead from "@/models/Lead";
import User from "@/models/User";

export async function GET() {
  const user = await getTokenData();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  const [totalLeads, byStatus, byPriority, unassigned, overdue, agents] = await Promise.all([
    Lead.countDocuments(),
    Lead.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Lead.aggregate([{ $group: { _id: "$priority", count: { $sum: 1 } } }]),
    Lead.countDocuments({ assignedTo: null }),
    Lead.countDocuments({
      followUpDate: { $lt: new Date() },
      status: { $nin: ["Closed", "Lost"] }
    }),
    User.aggregate([
      { $match: { role: "agent" } },
      {
        $lookup: {
          from: "leads",
          localField: "_id",
          foreignField: "assignedTo",
          as: "leads"
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          total: { $size: "$leads" },
          closed: {
            $size: {
              $filter: { input: "$leads", as: "l", cond: { $eq: ["$$l.status", "Closed"] } }
            }
          },
          active: {
            $size: {
              $filter: { input: "$leads", as: "l", cond: { $not: { $in: ["$$l.status", ["Closed", "Lost"]] } } }
            }
          }
        }
      }
    ])
  ]);

  return NextResponse.json({ totalLeads, byStatus, byPriority, unassigned, overdue, agents });
}
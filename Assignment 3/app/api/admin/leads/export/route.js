import { NextResponse } from "next/server";
import { getTokenData } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Lead from "@/models/Lead";
import ExcelJS from "exceljs";

export async function GET(request) {
  const user = await getTokenData();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectToDatabase();

    const leads = await Lead.find()
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });

    // Create a new workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Leads");

    // Define columns
    worksheet.columns = [
      { header: "Name", key: "name", width: 20 },
      { header: "Email", key: "email", width: 25 },
      { header: "Phone", key: "phone", width: 15 },
      { header: "Property Interest", key: "propertyInterest", width: 20 },
      { header: "Budget (Rs)", key: "budget", width: 15 },
      { header: "Score", key: "score", width: 10 },
      { header: "Priority", key: "priority", width: 12 },
      { header: "Status", key: "status", width: 15 },
      { header: "Assigned To", key: "assignedTo", width: 20 },
      { header: "Follow-up Date", key: "followUpDate", width: 15 },
      { header: "Notes", key: "notes", width: 30 },
      { header: "Created At", key: "createdAt", width: 18 },
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4F46E5" }, // indigo
    };

    // Add data rows
    leads.forEach(lead => {
      worksheet.addRow({
        name: lead.name,
        email: lead.email || "—",
        phone: lead.phone || "—",
        propertyInterest: lead.propertyInterest || "—",
        budget: lead.budget ? `Rs. ${lead.budget.toLocaleString()}` : "—",
        score: lead.score || "—",
        priority: lead.priority || "—",
        status: lead.status || "—",
        assignedTo: lead.assignedTo?.name || "Unassigned",
        followUpDate: lead.followUpDate ? new Date(lead.followUpDate).toLocaleDateString() : "—",
        notes: lead.notes || "—",
        createdAt: new Date(lead.createdAt).toLocaleDateString("en-PK", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Return Excel file
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="leads-${new Date().toISOString().split("T")[0]}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Failed to export leads:", error);
    return NextResponse.json({ error: "Failed to export leads" }, { status: 500 });
  }
}

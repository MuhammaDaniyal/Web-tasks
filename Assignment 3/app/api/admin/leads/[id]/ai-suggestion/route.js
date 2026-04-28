import { NextResponse } from "next/server";
import { getTokenData } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Lead from "@/models/Lead";

export async function POST(request, { params }) {
  const user = await getTokenData();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.GROQ_API_KEY || process.env.AI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GROQ_API_KEY is not set" }, { status: 500 });
  }

  try {
    await connectToDatabase();

    const { id } = await params;
    const lead = await Lead.findById(id);

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const prompt = `You are a CRM follow-up assistant.
Generate a concise follow-up suggestion for this lead.
Keep it practical and actionable.

Lead Details:
- Name: ${lead.name || "Unknown"}
- Status: ${lead.status || "Unknown"}
- Priority: ${lead.priority || "Unknown"}
- Budget: ${lead.budget ? `Rs. ${Number(lead.budget).toLocaleString()}` : "Unknown"}
- Property Interest: ${lead.propertyInterest || "Unknown"}
- Notes: ${lead.notes || "No notes"}

Return:
1) Suggested message to send (2-4 lines)
2) Best next action in one sentence
3) Suggested follow-up timing in one sentence`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
        temperature: 0.4,
        messages: [
          {
            role: "system",
            content: "You are a CRM follow-up assistant. Give concise and actionable sales follow-up suggestions.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Groq API error:", errText);
      return NextResponse.json({ error: "Failed to generate suggestion" }, { status: 502 });
    }

    const data = await response.json();
    const suggestion = data?.choices?.[0]?.message?.content?.trim();

    if (!suggestion) {
      return NextResponse.json({ error: "No suggestion returned by AI" }, { status: 502 });
    }

    return NextResponse.json({ suggestion });
  } catch (error) {
    console.error("AI suggestion failed:", error);
    return NextResponse.json({ error: "Failed to generate suggestion" }, { status: 500 });
  }
}

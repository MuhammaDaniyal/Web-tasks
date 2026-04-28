import nodemailer from "nodemailer";

function isEmailConfigured() {
  return Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);
}

function getTransporter() {
  if (!isEmailConfigured()) {
    throw new Error("Email is not configured. Set EMAIL_USER and EMAIL_PASS.");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

function getFromAddress() {
  return process.env.EMAIL_FROM || process.env.EMAIL_USER;
}

export async function sendLeadCreatedEmail({ leadName, budget, propertyInterest, agentEmail, agentName }) {
  const transporter = getTransporter();

  // Email to admin
  await transporter.sendMail({
    from: getFromAddress(),
    to: process.env.EMAIL_USER, // admin email
    subject: `New Lead: ${leadName}`,
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px">
        <h2 style="color:#1e293b;margin-bottom:16px">New Lead Created</h2>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Name</td><td style="padding:8px 0;font-size:14px;font-weight:500">${leadName}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Budget</td><td style="padding:8px 0;font-size:14px;font-weight:500">Rs. ${Number(budget).toLocaleString()}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Interest</td><td style="padding:8px 0;font-size:14px;font-weight:500">${propertyInterest || "—"}</td></tr>
          ${agentName ? `<tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Assigned To</td><td style="padding:8px 0;font-size:14px;font-weight:500">${agentName}</td></tr>` : ""}
        </table>
        <p style="margin-top:20px;font-size:12px;color:#9ca3af">Property Dealer CRM — Automated Notification</p>
      </div>
    `,
  });
}

export async function sendLeadAssignedEmail({ leadName, budget, propertyInterest, agentEmail, agentName }) {
  const transporter = getTransporter();

  // Email to the agent who got assigned
  await transporter.sendMail({
    from: getFromAddress(),
    to: agentEmail,
    subject: `Lead Assigned to You: ${leadName}`,
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px">
        <h2 style="color:#1e293b;margin-bottom:8px">You have a new lead</h2>
        <p style="color:#6b7280;font-size:14px;margin-bottom:16px">Hi ${agentName}, a lead has been assigned to you.</p>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Client</td><td style="padding:8px 0;font-size:14px;font-weight:500">${leadName}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Budget</td><td style="padding:8px 0;font-size:14px;font-weight:500">Rs. ${Number(budget).toLocaleString()}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Interest</td><td style="padding:8px 0;font-size:14px;font-weight:500">${propertyInterest || "—"}</td></tr>
        </table>
        <p style="margin-top:20px;font-size:12px;color:#9ca3af">Property Dealer CRM — Automated Notification</p>
      </div>
    `,
  });
}

export async function sendCustomEmail({ to, subject, message, leadName, budget, propertyInterest }) {
  const transporter = getTransporter();

  await transporter.sendMail({
    from: getFromAddress(),
    to,
    subject,
    text: message,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px">
        <h2 style="color:#1e293b;margin:0 0 14px">Lead Update</h2>
        <table style="width:100%;border-collapse:collapse;margin-bottom:14px">
          <tr><td style="padding:6px 0;color:#6b7280;font-size:14px">Client</td><td style="padding:6px 0;font-size:14px;font-weight:500">${leadName || "—"}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280;font-size:14px">Budget</td><td style="padding:6px 0;font-size:14px;font-weight:500">Rs. ${Number(budget || 0).toLocaleString()}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280;font-size:14px">Interest</td><td style="padding:6px 0;font-size:14px;font-weight:500">${propertyInterest || "—"}</td></tr>
        </table>
        <div style="white-space:pre-wrap;font-size:14px;line-height:1.5;color:#111827">${message}</div>
        <p style="margin-top:20px;font-size:12px;color:#9ca3af">Property Dealer CRM — Automated Notification</p>
      </div>
    `,
  });
}

export { isEmailConfigured };
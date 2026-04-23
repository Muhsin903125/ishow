import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = "iShowTransformation <noreply@ishowtransformation.com>";
const EMAIL_TYPES = [
  "assessment-submitted",
  "assessment-reviewed",
  "session-scheduled",
  "session-rescheduled",
  "session-cancelled",
  "payment-due-reminder",
  "session-reschedule-request",
] as const;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

export type EmailType = (typeof EMAIL_TYPES)[number];
export type EmailActorRole = "admin" | "trainer" | "customer";

export interface SendEmailPayload {
  type: EmailType;
  to: string;
  data: Record<string, string | number | undefined>;
}

type EmailActor = {
  role: EmailActorRole;
  email?: string | null;
};

type TemplateRule = {
  roles: readonly EmailActorRole[];
  requiredFields: readonly string[];
  selfOnly?: boolean;
};

const TEMPLATE_RULES: Record<EmailType, TemplateRule> = {
  "assessment-submitted": {
    roles: ["customer", "trainer", "admin"],
    requiredFields: ["name"],
    selfOnly: true,
  },
  "assessment-reviewed": {
    roles: ["trainer", "admin"],
    requiredFields: ["name"],
  },
  "session-scheduled": {
    roles: ["trainer", "admin"],
    requiredFields: ["name", "title", "date", "time"],
  },
  "session-rescheduled": {
    roles: ["trainer", "admin"],
    requiredFields: ["name", "date", "time"],
  },
  "session-cancelled": {
    roles: ["trainer", "admin"],
    requiredFields: ["name", "date", "time"],
  },
  "payment-due-reminder": {
    roles: ["trainer", "admin"],
    requiredFields: ["clientName", "amount", "dueDate", "planName"],
  },
  "session-reschedule-request": {
    roles: ["customer", "trainer", "admin"],
    requiredFields: ["clientName", "sessionTitle", "currentDate", "preferredDate"],
  },
};

export function validateEmailPayload(
  body: unknown,
  actor: EmailActor
): SendEmailPayload {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid email payload");
  }

  const payload = body as Record<string, unknown>;
  const type = payload.type;
  const to = payload.to;
  const data = payload.data;

  if (typeof type !== "string" || !EMAIL_TYPES.includes(type as EmailType)) {
    throw new Error("Unsupported email template");
  }

  if (typeof to !== "string" || !EMAIL_REGEX.test(to.trim())) {
    throw new Error("Invalid email recipient");
  }

  if (!data || typeof data !== "object") {
    throw new Error("Invalid email data");
  }

  const rule = TEMPLATE_RULES[type as EmailType];
  if (!rule.roles.includes(actor.role)) {
    throw new Error("You are not allowed to send this email");
  }

  const normalizedTo = to.trim().toLowerCase();
  const actorEmail = actor.email?.trim().toLowerCase();
  if (rule.selfOnly && actorEmail && normalizedTo !== actorEmail) {
    throw new Error("This email template can only be sent to your own address");
  }

  const normalizedData = data as Record<string, string | number | undefined>;
  for (const field of rule.requiredFields) {
    const value = normalizedData[field];
    if (
      value === undefined ||
      value === null ||
      (typeof value === "string" && !value.trim())
    ) {
      throw new Error(`Missing email field: ${field}`);
    }
  }

  return {
    type: type as EmailType,
    to: normalizedTo,
    data: normalizedData,
  };
}

export async function sendEmail({ type, to, data }: SendEmailPayload) {
  if (!resend) {
    return false;
  }

  const { subject, html } = buildEmail(type, data);
  const { error } = await resend.emails.send({ from: FROM, to, subject, html });
  if (error) {
    console.error("[email]", error);
  }

  return !error;
}

function buildEmail(
  type: EmailType,
  data: Record<string, string | number | undefined>
) {
  switch (type) {
    case "assessment-submitted":
      return {
        subject: "Assessment request received - iShowTransformation",
        html: assessmentSubmittedHtml(data),
      };
    case "assessment-reviewed":
      return {
        subject: "Your assessment has been reviewed - iShowTransformation",
        html: assessmentReviewedHtml(data),
      };
    case "session-scheduled":
      return {
        subject: "Session confirmed - iShowTransformation",
        html: sessionScheduledHtml(data),
      };
    case "session-rescheduled":
      return {
        subject: "Session rescheduled - iShowTransformation",
        html: sessionRescheduledHtml(data),
      };
    case "session-cancelled":
      return {
        subject: "Session cancelled - iShowTransformation",
        html: sessionCancelledHtml(data),
      };
    case "payment-due-reminder":
      return {
        subject: `Reminder: Payment due on ${stringValue(data.dueDate)} - iShowTransformation`,
        html: paymentDueReminderHtml(data),
      };
    case "session-reschedule-request":
      return {
        subject: `Reschedule request from ${stringValue(data.clientName, "a client")} - iShowTransformation`,
        html: sessionRescheduleRequestHtml(data),
      };
  }
}

function layout(content: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>iShowTransformation</title>
</head>
<body style="margin:0;padding:0;background:#0f0f11;font-family:Manrope,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0f0f11;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="640" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:640px;">
          <tr>
            <td style="padding:0 0 20px 0;text-align:center;">
              <span style="font-size:24px;font-weight:900;color:#ffffff;">iShow</span><span style="font-size:24px;font-weight:900;color:#f97316;">Transformation</span>
            </td>
          </tr>
          <tr>
            <td style="background:#18181b;border:1px solid #2b2b31;border-radius:18px;padding:36px 32px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding:18px 0 0 0;text-align:center;font-size:12px;color:#71717a;line-height:1.6;">
              Dubai, UAE<br />
              <a href="https://ishowtransformation.com" style="color:#8a8a94;text-decoration:none;">ishowtransformation.com</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function intro(title: string, body: string) {
  return `
    <h1 style="margin:0 0 12px 0;font-size:28px;line-height:1.15;color:#fafafa;font-weight:900;">${title}</h1>
    <p style="margin:0 0 24px 0;font-size:15px;line-height:1.7;color:#b4b4bd;">${body}</p>
  `;
}

function panel(content: string) {
  return `
    <div style="margin:0 0 24px 0;padding:20px 22px;background:#111114;border:1px solid #2b2b31;border-radius:14px;">
      ${content}
    </div>
  `;
}

function detailRow(label: string, value: string) {
  return `
    <tr>
      <td style="padding:8px 0;font-size:12px;font-weight:700;color:#8a8a94;text-transform:uppercase;letter-spacing:0.08em;width:140px;">${label}</td>
      <td style="padding:8px 0;font-size:14px;color:#f4f4f5;font-weight:500;">${value}</td>
    </tr>
  `;
}

function detailsTable(rows: Array<{ label: string; value: string | undefined }>) {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      ${rows
        .filter((row) => row.value)
        .map((row) => detailRow(row.label, row.value as string))
        .join("")}
    </table>
  `;
}

function cta(text: string, href: string) {
  return `
    <div style="padding-top:8px;text-align:center;">
      <a href="${href}" style="display:inline-block;background:#f97316;color:#ffffff;text-decoration:none;font-size:14px;font-weight:800;padding:14px 26px;border-radius:12px;">
        ${text}
      </a>
    </div>
  `;
}

function siteUrl(data: Record<string, string | number | undefined>) {
  return stringValue(data.siteUrl, "https://ishowtransformation.com");
}

function stringValue(value: string | number | undefined, fallback = "") {
  if (value === undefined || value === null) {
    return fallback;
  }

  return String(value);
}

function assessmentSubmittedHtml(d: Record<string, string | number | undefined>) {
  const name = stringValue(d.name, "there");

  return layout(`
    ${intro(`We have your request, ${name}.`, "Your fitness assessment has been received. We will review it and reach out with the next step shortly.")}
    ${panel(`
      <p style="margin:0 0 14px 0;font-size:12px;font-weight:800;color:#f97316;text-transform:uppercase;letter-spacing:0.08em;">What happens next</p>
      <p style="margin:0;font-size:14px;line-height:1.7;color:#d4d4d8;">1. We review your answers.<br />2. We map the right starting point.<br />3. We reach out to schedule your first session.</p>
    `)}
    ${cta("View My Dashboard", `${siteUrl(d)}/dashboard`)}
  `);
}

function assessmentReviewedHtml(d: Record<string, string | number | undefined>) {
  const name = stringValue(d.name, "there");
  const notes = stringValue(d.notes);

  return layout(`
    ${intro(`Your assessment is reviewed, ${name}.`, "Your coach has reviewed your assessment and your plan is moving forward.")}
    ${notes ? panel(`
      <p style="margin:0 0 10px 0;font-size:12px;font-weight:800;color:#f97316;text-transform:uppercase;letter-spacing:0.08em;">Coach note</p>
      <p style="margin:0;font-size:14px;line-height:1.7;color:#d4d4d8;">${notes}</p>
    `) : ""}
    ${cta("Open My Dashboard", `${siteUrl(d)}/dashboard`)}
  `);
}

function sessionScheduledHtml(d: Record<string, string | number | undefined>) {
  return layout(`
    ${intro(`Session confirmed for ${stringValue(d.name, "you")}.`, "Your training session has been scheduled.")}
    ${panel(
      detailsTable([
        { label: "Session", value: stringValue(d.title) },
        { label: "Date", value: stringValue(d.date) },
        { label: "Time", value: stringValue(d.time) },
        { label: "Duration", value: d.duration ? `${stringValue(d.duration)} minutes` : undefined },
        { label: "Location", value: stringValue(d.location) },
        { label: "Notes", value: stringValue(d.notes) },
      ])
    )}
    ${cta("View My Sessions", `${siteUrl(d)}/sessions`)}
  `);
}

function sessionRescheduledHtml(d: Record<string, string | number | undefined>) {
  return layout(`
    ${intro(`Session updated for ${stringValue(d.name, "you")}.`, "Your training session has been moved to a new time.")}
    ${panel(
      detailsTable([
        { label: "Previous date", value: stringValue(d.oldDate) },
        { label: "Previous time", value: stringValue(d.oldTime) },
        { label: "New date", value: stringValue(d.date) },
        { label: "New time", value: stringValue(d.time) },
        { label: "Duration", value: d.duration ? `${stringValue(d.duration)} minutes` : undefined },
      ])
    )}
    ${cta("View My Sessions", `${siteUrl(d)}/sessions`)}
  `);
}

function sessionCancelledHtml(d: Record<string, string | number | undefined>) {
  return layout(`
    ${intro(`Session cancelled for ${stringValue(d.name, "you")}.`, "Your scheduled session has been cancelled.")}
    ${panel(
      detailsTable([
        { label: "Date", value: stringValue(d.date) },
        { label: "Time", value: stringValue(d.time) },
        { label: "Duration", value: d.duration ? `${stringValue(d.duration)} minutes` : undefined },
        { label: "Reason", value: stringValue(d.reason) },
      ])
    )}
    ${cta("View My Sessions", `${siteUrl(d)}/sessions`)}
  `);
}

function paymentDueReminderHtml(d: Record<string, string | number | undefined>) {
  return layout(`
    ${intro(`Payment reminder for ${stringValue(d.clientName, "you")}.`, "This is a reminder that an upcoming payment is due soon.")}
    ${panel(
      detailsTable([
        { label: "Plan", value: stringValue(d.planName) },
        { label: "Amount", value: `AED ${stringValue(d.amount, "0")}` },
        { label: "Due date", value: stringValue(d.dueDate) },
      ])
    )}
    ${cta("View Payments", `${siteUrl(d)}/payments`)}
  `);
}

function sessionRescheduleRequestHtml(d: Record<string, string | number | undefined>) {
  return layout(`
    ${intro(`Reschedule request from ${stringValue(d.clientName, "a client")}.`, "A client has requested a session change.")}
    ${panel(
      detailsTable([
        { label: "Session", value: stringValue(d.sessionTitle) },
        { label: "Current date", value: stringValue(d.currentDate) },
        { label: "Preferred date", value: stringValue(d.preferredDate) },
        { label: "Note", value: stringValue(d.note) },
      ])
    )}
    ${cta("Manage Sessions", `${siteUrl(d)}/trainer/sessions`)}
  `);
}

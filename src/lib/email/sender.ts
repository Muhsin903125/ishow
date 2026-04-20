import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = 'iShowTransformation <noreply@ishowtransformation.com>';

export type EmailType =
  | 'assessment-submitted'
  | 'assessment-reviewed'
  | 'session-scheduled'
  | 'session-rescheduled'
  | 'session-cancelled'
  | 'payment-due-reminder'
  | 'session-reschedule-request';

export interface SendEmailPayload {
  type: EmailType;
  to: string;
  data: Record<string, string | number | undefined>;
}

export async function sendEmail({ type, to, data }: SendEmailPayload) {
  const { subject, html } = buildEmail(type, data);
  const { error } = await resend.emails.send({ from: FROM, to, subject, html });
  if (error) console.error('[email]', error);
  return !error;
}

function buildEmail(type: EmailType, data: Record<string, string | number | undefined>) {
  switch (type) {
    case 'assessment-submitted':
      return {
        subject: 'Assessment request received – iShowTransformation',
        html: assessmentSubmittedHtml(data),
      };
    case 'assessment-reviewed':
      return {
        subject: 'Your assessment has been reviewed – iShowTransformation',
        html: assessmentReviewedHtml(data),
      };
    case 'session-scheduled':
      return {
        subject: 'Session confirmed – iShowTransformation',
        html: sessionScheduledHtml(data),
      };
    case 'session-rescheduled':
      return {
        subject: 'Session rescheduled – iShowTransformation',
        html: sessionRescheduledHtml(data),
      };
    case 'session-cancelled':
      return {
        subject: 'Session cancelled – iShowTransformation',
        html: sessionRescheduledHtml(data), // reuse rescheduled template layout
      };
    case 'payment-due-reminder':
      return {
        subject: `Reminder: Payment due on ${data.dueDate ?? ''} – iShowTransformation`,
        html: paymentDueReminderHtml(data),
      };
    case 'session-reschedule-request':
      return {
        subject: `Reschedule request from ${data.clientName ?? 'a client'} – iShowTransformation`,
        html: sessionRescheduleRequestHtml(data),
      };
  }
}

/* ------------------------------------------------------------------ */
/*  Shared layout wrapper                                               */
/* ------------------------------------------------------------------ */

function layout(content: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>iShowTransformation</title>
</head>
<body style="margin:0;padding:0;background:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#09090b;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

          <!-- Logo header -->
          <tr>
            <td style="padding:0 0 28px 0;text-align:center;">
              <a href="https://ishowtransformation.com" style="text-decoration:none;display:inline-block;">
                <span style="font-size:22px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">iShow</span><span style="font-size:22px;font-weight:900;color:#f97316;letter-spacing:-0.5px;">Transformation</span>
              </a>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#18181b;border:1px solid #27272a;border-radius:16px;padding:40px 40px 32px 40px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:28px 0 0 0;text-align:center;">
              <p style="margin:0;font-size:12px;color:#52525b;line-height:1.6;">
                iShowTransformation · Dubai, UAE<br/>
                <a href="https://ishowtransformation.com" style="color:#71717a;text-decoration:none;">ishowtransformation.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function orangeBtn(text: string, href: string) {
  return `<a href="${href}" style="display:inline-block;background:#f97316;color:#ffffff;font-size:14px;font-weight:800;text-decoration:none;padding:14px 28px;border-radius:12px;letter-spacing:0.2px;">${text}</a>`;
}

function divider() {
  return `<tr><td style="padding:24px 0;"><div style="height:1px;background:#27272a;"></div></td></tr>`;
}

function metaRow(label: string, value: string) {
  return `<tr>
    <td style="padding:6px 0;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="font-size:12px;color:#71717a;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;width:130px;">${label}</td>
          <td style="font-size:14px;color:#f4f4f5;font-weight:500;">${value}</td>
        </tr>
      </table>
    </td>
  </tr>`;
}

/* ------------------------------------------------------------------ */
/*  Assessment Submitted                                                */
/* ------------------------------------------------------------------ */
function assessmentSubmittedHtml(d: Record<string, string | number | undefined>) {
  const name = String(d.name ?? 'there');
  const siteUrl = String(d.siteUrl ?? 'https://ishowtransformation.com');

  return layout(`
    <!-- Icon -->
    <tr><td style="padding-bottom:24px;">
      <div style="width:52px;height:52px;background:rgba(249,115,22,0.12);border:1px solid rgba(249,115,22,0.25);border-radius:14px;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:24px;">📋</span>
      </div>
    </td></tr>

    <!-- Heading -->
    <tr><td style="padding-bottom:10px;">
      <h1 style="margin:0;font-size:26px;font-weight:900;color:#fafafa;letter-spacing:-0.5px;line-height:1.2;">
        We've got your request, ${name}!
      </h1>
    </td></tr>

    <!-- Sub -->
    <tr><td style="padding-bottom:28px;">
      <p style="margin:0;font-size:15px;color:#a1a1aa;line-height:1.7;">
        Your fitness assessment request has been received. Our team will review it shortly and reach out to schedule your first session.
      </p>
    </td></tr>

    <!-- What's next box -->
    <tr><td style="padding-bottom:28px;">
      <div style="background:#09090b;border:1px solid #27272a;border-radius:12px;padding:20px 24px;">
        <p style="margin:0 0 14px 0;font-size:11px;font-weight:700;color:#71717a;text-transform:uppercase;letter-spacing:0.1em;">What happens next</p>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          ${['Our team reviews your assessment (within 24h)', 'We contact you to confirm your session date & time', 'You start your personalised training journey'].map((step, i) => `
          <tr>
            <td style="padding:5px 0;vertical-align:top;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="width:28px;vertical-align:top;padding-top:1px;">
                    <div style="width:22px;height:22px;background:rgba(249,115,22,0.15);border:1px solid rgba(249,115,22,0.3);border-radius:6px;text-align:center;line-height:22px;font-size:11px;font-weight:800;color:#f97316;">${i + 1}</div>
                  </td>
                  <td style="padding-left:10px;font-size:13px;color:#d4d4d8;">${step}</td>
                </tr>
              </table>
            </td>
          </tr>`).join('')}
        </table>
      </div>
    </td></tr>

    ${divider()}

    <tr><td style="padding-top:0;text-align:center;">
      ${orangeBtn('View My Dashboard', `${siteUrl}/dashboard`)}
    </td></tr>
  `);
}

/* ------------------------------------------------------------------ */
/*  Assessment Reviewed                                                 */
/* ------------------------------------------------------------------ */
function assessmentReviewedHtml(d: Record<string, string | number | undefined>) {
  const name = String(d.name ?? 'there');
  const notes = d.notes ? String(d.notes) : '';
  const siteUrl = String(d.siteUrl ?? 'https://ishowtransformation.com');

  return layout(`
    <tr><td style="padding-bottom:24px;">
      <div style="width:52px;height:52px;background:rgba(34,197,94,0.12);border:1px solid rgba(34,197,94,0.25);border-radius:14px;text-align:center;line-height:52px;">
        <span style="font-size:24px;">✅</span>
      </div>
    </td></tr>

    <tr><td style="padding-bottom:10px;">
      <h1 style="margin:0;font-size:26px;font-weight:900;color:#fafafa;letter-spacing:-0.5px;line-height:1.2;">
        Your assessment is reviewed, ${name}!
      </h1>
    </td></tr>

    <tr><td style="padding-bottom:28px;">
      <p style="margin:0;font-size:15px;color:#a1a1aa;line-height:1.7;">
        Great news — your trainer has reviewed your fitness assessment. Your personalised plan is being prepared and your first session will be scheduled soon.
      </p>
    </td></tr>

    ${notes ? `
    <tr><td style="padding-bottom:24px;">
      <div style="background:#09090b;border:1px solid #27272a;border-left:3px solid #f97316;border-radius:12px;padding:20px 24px;">
        <p style="margin:0 0 8px 0;font-size:11px;font-weight:700;color:#71717a;text-transform:uppercase;letter-spacing:0.1em;">Note from your trainer</p>
        <p style="margin:0;font-size:14px;color:#d4d4d8;line-height:1.7;font-style:italic;">"${notes}"</p>
      </div>
    </td></tr>` : ''}

    ${divider()}

    <tr><td style="padding-top:0;text-align:center;">
      ${orangeBtn('View My Dashboard', `${siteUrl}/dashboard`)}
    </td></tr>
  `);
}

/* ------------------------------------------------------------------ */
/*  Session Scheduled                                                   */
/* ------------------------------------------------------------------ */
function sessionScheduledHtml(d: Record<string, string | number | undefined>) {
  const name = String(d.name ?? 'there');
  const title = String(d.title ?? 'Training Session');
  const date = String(d.date ?? '');
  const time = String(d.time ?? '');
  const duration = String(d.duration ?? '60');
  const location = d.location ? String(d.location) : '';
  const notes = d.notes ? String(d.notes) : '';
  const siteUrl = String(d.siteUrl ?? 'https://ishowtransformation.com');

  return layout(`
    <tr><td style="padding-bottom:24px;">
      <div style="width:52px;height:52px;background:rgba(59,130,246,0.12);border:1px solid rgba(59,130,246,0.25);border-radius:14px;text-align:center;line-height:52px;">
        <span style="font-size:24px;">📅</span>
      </div>
    </td></tr>

    <tr><td style="padding-bottom:10px;">
      <h1 style="margin:0;font-size:26px;font-weight:900;color:#fafafa;letter-spacing:-0.5px;line-height:1.2;">
        Session confirmed, ${name}!
      </h1>
    </td></tr>

    <tr><td style="padding-bottom:28px;">
      <p style="margin:0;font-size:15px;color:#a1a1aa;line-height:1.7;">
        Your training session has been scheduled. Here are the details:
      </p>
    </td></tr>

    <!-- Session details card -->
    <tr><td style="padding-bottom:28px;">
      <div style="background:#09090b;border:1px solid #27272a;border-radius:12px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,rgba(249,115,22,0.15),rgba(249,115,22,0.05));border-bottom:1px solid #27272a;padding:16px 24px;">
          <p style="margin:0;font-size:15px;font-weight:800;color:#fafafa;">${title}</p>
        </div>
        <div style="padding:20px 24px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            ${metaRow('📅 Date', date)}
            ${metaRow('🕐 Time', time)}
            ${metaRow('⏱ Duration', `${duration} minutes`)}
            ${location ? metaRow('📍 Location', location) : ''}
            ${notes ? metaRow('📝 Notes', notes) : ''}
          </table>
        </div>
      </div>
    </td></tr>

    ${divider()}

    <tr><td style="padding-top:0;text-align:center;">
      ${orangeBtn('View My Sessions', `${siteUrl}/sessions`)}
    </td></tr>
  `);
}

/* ------------------------------------------------------------------ */
/*  Session Rescheduled                                                 */
/* ------------------------------------------------------------------ */
function sessionRescheduledHtml(d: Record<string, string | number | undefined>) {
  const name = String(d.name ?? 'there');
  const date = String(d.date ?? '');
  const time = String(d.time ?? '');
  const duration = String(d.duration ?? '60');
  const oldDate = d.oldDate ? String(d.oldDate) : '';
  const oldTime = d.oldTime ? String(d.oldTime) : '';
  const siteUrl = String(d.siteUrl ?? 'https://ishowtransformation.com');

  return layout(`
    <tr><td style="padding-bottom:24px;">
      <div style="width:52px;height:52px;background:rgba(234,179,8,0.12);border:1px solid rgba(234,179,8,0.25);border-radius:14px;text-align:center;line-height:52px;">
        <span style="font-size:24px;">🔄</span>
      </div>
    </td></tr>

    <tr><td style="padding-bottom:10px;">
      <h1 style="margin:0;font-size:26px;font-weight:900;color:#fafafa;letter-spacing:-0.5px;line-height:1.2;">
        Session rescheduled, ${name}
      </h1>
    </td></tr>

    <tr><td style="padding-bottom:28px;">
      <p style="margin:0;font-size:15px;color:#a1a1aa;line-height:1.7;">
        Your training session has been moved to a new time. Please update your calendar.
      </p>
    </td></tr>

    ${(oldDate || oldTime) ? `
    <!-- Old time -->
    <tr><td style="padding-bottom:12px;">
      <div style="background:#09090b;border:1px solid #27272a;border-radius:12px;padding:16px 24px;">
        <p style="margin:0 0 10px 0;font-size:11px;font-weight:700;color:#71717a;text-transform:uppercase;letter-spacing:0.1em;">Previous time</p>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          ${oldDate ? metaRow('📅 Was', oldDate) : ''}
          ${oldTime ? metaRow('🕐 At', oldTime) : ''}
        </table>
      </div>
    </td></tr>` : ''}

    <!-- New time -->
    <tr><td style="padding-bottom:28px;">
      <div style="background:#09090b;border:1px solid rgba(249,115,22,0.3);border-radius:12px;overflow:hidden;">
        <div style="background:rgba(249,115,22,0.1);border-bottom:1px solid rgba(249,115,22,0.2);padding:12px 24px;">
          <p style="margin:0;font-size:11px;font-weight:700;color:#f97316;text-transform:uppercase;letter-spacing:0.1em;">New time</p>
        </div>
        <div style="padding:20px 24px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            ${metaRow('📅 Date', date)}
            ${metaRow('🕐 Time', time)}
            ${metaRow('⏱ Duration', `${duration} minutes`)}
          </table>
        </div>
      </div>
    </td></tr>

    ${divider()}

    <tr><td style="padding-top:0;text-align:center;">
      ${orangeBtn('View My Sessions', `${siteUrl}/sessions`)}
    </td></tr>
  `);
}

/* ------------------------------------------------------------------ */
/*  Payment Due Reminder (AU2)                                          */
/* ------------------------------------------------------------------ */
function paymentDueReminderHtml(d: Record<string, string | number | undefined>) {
  const name = String(d.clientName ?? d.name ?? 'there');
  const amount = String(d.amount ?? '0');
  const dueDate = String(d.dueDate ?? '');
  const planName = String(d.planName ?? 'Training Plan');
  const siteUrl = String(d.siteUrl ?? 'https://ishowtransformation.com');

  return layout(`
    <tr><td style="padding-bottom:24px;">
      <div style="width:52px;height:52px;background:rgba(249,115,22,0.12);border:1px solid rgba(249,115,22,0.25);border-radius:14px;text-align:center;line-height:52px;">
        <span style="font-size:24px;">💳</span>
      </div>
    </td></tr>

    <tr><td style="padding-bottom:10px;">
      <h1 style="margin:0;font-size:26px;font-weight:900;color:#fafafa;letter-spacing:-0.5px;line-height:1.2;">
        Payment reminder, ${name}
      </h1>
    </td></tr>

    <tr><td style="padding-bottom:28px;">
      <p style="margin:0;font-size:15px;color:#a1a1aa;line-height:1.7;">
        This is a friendly reminder that your payment for <strong style="color:#f4f4f5;">${planName}</strong> is coming up soon.
      </p>
    </td></tr>

    <tr><td style="padding-bottom:28px;">
      <div style="background:#09090b;border:1px solid #27272a;border-radius:12px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,rgba(249,115,22,0.15),rgba(249,115,22,0.05));border-bottom:1px solid #27272a;padding:16px 24px;">
          <p style="margin:0;font-size:15px;font-weight:800;color:#fafafa;">Payment Details</p>
        </div>
        <div style="padding:20px 24px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            ${metaRow('💰 Amount', 'AED ' + amount)}
            ${metaRow('📅 Due Date', dueDate)}
            ${metaRow('📋 Plan', planName)}
          </table>
        </div>
      </div>
    </td></tr>

    <tr><td style="padding-bottom:16px;">
      <p style="margin:0;font-size:13px;color:#71717a;line-height:1.6;">
        Please ensure your payment is made on time to avoid any interruption to your training. If you have already paid, please ignore this email.
      </p>
    </td></tr>

    ${divider()}

    <tr><td style="padding-top:0;text-align:center;">
      ${orangeBtn('View Payments', `${siteUrl}/payments`)}
    </td></tr>
  `);
}

/* ------------------------------------------------------------------ */
/*  Session Reschedule Request (C4)                                     */
/* ------------------------------------------------------------------ */
function sessionRescheduleRequestHtml(d: Record<string, string | number | undefined>) {
  const clientName = String(d.clientName ?? 'A client');
  const sessionTitle = String(d.sessionTitle ?? d.title ?? 'Training Session');
  const currentDate = String(d.currentDate ?? d.oldDate ?? '');
  const preferredDate = String(d.preferredDate ?? d.date ?? '');
  const note = d.note ? String(d.note) : '';
  const siteUrl = String(d.siteUrl ?? 'https://ishowtransformation.com');

  return layout(`
    <tr><td style="padding-bottom:24px;">
      <div style="width:52px;height:52px;background:rgba(59,130,246,0.12);border:1px solid rgba(59,130,246,0.25);border-radius:14px;text-align:center;line-height:52px;">
        <span style="font-size:24px;">🔄</span>
      </div>
    </td></tr>

    <tr><td style="padding-bottom:10px;">
      <h1 style="margin:0;font-size:26px;font-weight:900;color:#fafafa;letter-spacing:-0.5px;line-height:1.2;">
        Reschedule request from ${clientName}
      </h1>
    </td></tr>

    <tr><td style="padding-bottom:28px;">
      <p style="margin:0;font-size:15px;color:#a1a1aa;line-height:1.7;">
        ${clientName} has requested to reschedule their training session. Please review and update the session accordingly.
      </p>
    </td></tr>

    <tr><td style="padding-bottom:28px;">
      <div style="background:#09090b;border:1px solid #27272a;border-radius:12px;padding:20px 24px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          ${metaRow('📋 Session', sessionTitle)}
          ${metaRow('📅 Current Date', currentDate)}
          ${metaRow('🆕 Preferred Date', preferredDate)}
          ${note ? metaRow('📝 Note', note) : ''}
        </table>
      </div>
    </td></tr>

    ${divider()}

    <tr><td style="padding-top:0;text-align:center;">
      ${orangeBtn('Manage Sessions', `${siteUrl}/trainer/sessions`)}
    </td></tr>
  `);
}

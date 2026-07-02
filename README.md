/**
 * @file notify.ts
 * @description Real e-mail notifications ("Your payslip is available",
 * "You have a new shift scheduled", …).
 *
 * Browsers cannot send e-mail directly — doing so would expose your mail
 * credentials to anyone who opens DevTools. Delivery therefore happens
 * server-side through the Supabase Edge Function `send-email`
 * (supabase/functions/send-email/index.ts), which talks to Resend.
 *
 * Setup (one-off, ~5 minutes) is documented in supabase/EMAIL_SETUP.md.
 * Until the function is deployed, every send returns an honest error —
 * nothing here is simulated.
 */
import { isCloudConfigured, sbInvokeFunction } from './supabase';
import { EmailSettings, Payslip, WorkShift } from '../types';

export const DEFAULT_EMAIL_SETTINGS: EmailSettings = {
  enabled: false,
  fromName: 'Milk Pop',
  notifyNewShift: true,
  notifyPayslip: true,
};

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  fromName?: string;
}

/** Sends an e-mail through the Edge Function. Returns null on success, or an error string. */
export async function sendEmail(input: SendEmailInput): Promise<string | null> {
  if (!isCloudConfigured()) {
    return 'Supabase is not connected — connect it in Company Settings first.';
  }
  if (!input.to || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(input.to)) {
    return `"${input.to || '(empty)'}" is not a valid e-mail address.`;
  }
  try {
    const res = await sbInvokeFunction<{ ok?: boolean; error?: string }>('send-email', input);
    if (res && res.error) return res.error;
    return null;
  } catch (e: any) {
    const msg = String(e?.message || e);
    if (msg.includes('404')) {
      return 'The send-email Edge Function is not deployed yet — see supabase/EMAIL_SETUP.md.';
    }
    return msg;
  }
}

/* ------------------------------------------------------------------ */
/*  Branded HTML templates                                             */
/* ------------------------------------------------------------------ */
const wrap = (title: string, body: string, brandName: string) => `
<div style="font-family:Arial,Helvetica,sans-serif;background:#F7F1E8;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #EBDECE">
    <div style="background:#BD783A;padding:20px 28px">
      <span style="color:#ffffff;font-size:18px;font-weight:800;letter-spacing:2px">${brandName.toUpperCase()}</span>
    </div>
    <div style="padding:28px">
      <h2 style="margin:0 0 12px;color:#2E2A26;font-size:18px">${title}</h2>
      ${body}
    </div>
    <div style="background:#EBDECE;padding:14px 28px;color:#2E2A26;font-size:11px">
      This is an automated message from the ${brandName} staff platform. Please do not reply.
    </div>
  </div>
</div>`;

export function payslipEmailHtml(p: Payslip, currency: string, brandName: string): string {
  const row = (label: string, value: string, strong = false) =>
    `<tr><td style="padding:8px 0;color:#6b6b6b;font-size:13px">${label}</td>
     <td style="padding:8px 0;text-align:right;font-size:13px;color:#2E2A26;${strong ? 'font-weight:800' : ''}">${value}</td></tr>`;
  const body = `
    <p style="color:#2E2A26;font-size:14px;margin:0 0 16px">Hi ${p.employeeName.split(' ')[0]}, your payslip for <b>${p.periodLabel}</b> is now available.</p>
    <table style="width:100%;border-collapse:collapse;border-top:1px solid #EBDECE;border-bottom:1px solid #EBDECE">
      ${row('Pay period', p.periodLabel)}
      ${row('Approved hours', `${p.hoursTotal.toFixed(2)} hrs`)}
      ${row('Hourly rate', `${currency}${p.hourlyRate.toFixed(2)}`)}
      ${row('Gross pay', `${currency}${p.gross.toFixed(2)}`)}
      ${row('Deductions', `${currency}${p.deductions.toFixed(2)}`)}
      ${row('Net pay', `${currency}${p.net.toFixed(2)}`, true)}
    </table>
    <p style="color:#6b6b6b;font-size:12px;margin:16px 0 0">You can also view this payslip any time in your Staff Dashboard.</p>`;
  return wrap('Your payslip is available', body, brandName);
}

export function newShiftEmailHtml(shift: WorkShift, brandName: string): string {
  const niceDate = new Date(shift.date + 'T00:00:00').toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
  const body = `
    <p style="color:#2E2A26;font-size:14px;margin:0 0 16px">Hi ${shift.employeeName.split(' ')[0]}, a new shift has been scheduled for you.</p>
    <div style="background:#F7F1E8;border:1px solid #EBDECE;border-radius:12px;padding:16px">
      <p style="margin:0 0 6px;color:#2E2A26;font-size:14px"><b>${niceDate}</b></p>
      <p style="margin:0 0 6px;color:#2E2A26;font-size:14px">${shift.startTime} – ${shift.endTime} · ${shift.type.toUpperCase()}</p>
      <p style="margin:0;color:#6b6b6b;font-size:13px">${shift.storeName}</p>
      ${shift.notes ? `<p style="margin:8px 0 0;color:#6b6b6b;font-size:12px">Notes: ${shift.notes}</p>` : ''}
    </div>
    <p style="color:#6b6b6b;font-size:12px;margin:16px 0 0">Check your full rota in the Staff Dashboard.</p>`;
  return wrap('You have a new shift scheduled', body, brandName);
}

export function genericEmailHtml(title: string, message: string, brandName: string): string {
  return wrap(title, `<p style="color:#2E2A26;font-size:14px;margin:0">${message}</p>`, brandName);
}

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.EMAIL_FROM ?? "invites@yourdomain.com";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function sendGroupInviteEmail({
  toEmail,
  inviterName,
  groupName,
  token,
  expiresAt,
}: {
  toEmail: string;
  inviterName: string;
  groupName: string;
  token: string;
  expiresAt: Date;
}) {
  const acceptUrl = `${APP_URL}/invite?token=${token}`;
  const expiry = expiresAt.toLocaleDateString("en-US", { dateStyle: "long" });

  await resend.emails.send({
    from: FROM,
    to: toEmail,
    subject: `You've been invited to join ${groupName}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
        <h2 style="margin:0 0 8px">${groupName}</h2>
        <p style="color:#555;margin:0 0 24px">
          <strong>${inviterName}</strong> has invited you to join <strong>${groupName}</strong>.
        </p>
        <a href="${acceptUrl}"
           style="display:inline-block;background:#000;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
          Accept invite
        </a>
        <p style="color:#888;font-size:13px;margin-top:24px">
          This invite expires on ${expiry}. If you didn't expect this, you can ignore it.
        </p>
      </div>
    `,
  });
}

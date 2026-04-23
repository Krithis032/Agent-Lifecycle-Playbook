import { Resend } from 'resend';

function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error(
      'RESEND_API_KEY is not set. Add it to .env.local to enable password reset emails.',
    );
  }
  return new Resend(apiKey);
}

export async function sendPasswordResetEmail(
  to: string,
  resetToken: string,
) {
  const fromAddress = process.env.RESEND_FROM_EMAIL || 'ADP <noreply@resend.dev>';
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

  const resend = getResendClient();

  const { error } = await resend.emails.send({
    from: fromAddress,
    to,
    subject: 'Reset your password — Agent Deployment Playbook',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="display: inline-block; width: 48px; height: 48px; background: #4f46e5; border-radius: 12px; line-height: 48px; color: white; font-weight: bold; font-size: 20px;">A</div>
        </div>
        <h2 style="margin: 0 0 8px; font-size: 20px; font-weight: 700; color: #111;">Reset your password</h2>
        <p style="margin: 0 0 24px; font-size: 14px; color: #555; line-height: 1.6;">
          We received a request to reset your password for the Agent Deployment Playbook. Click the button below to set a new password. This link expires in 1 hour.
        </p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 28px; background: #4f46e5; color: white; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 10px;">
          Reset Password
        </a>
        <p style="margin: 24px 0 0; font-size: 12px; color: #999; line-height: 1.5;">
          If you didn&rsquo;t request this, you can safely ignore this email. Your password will remain unchanged.
        </p>
      </div>
    `,
  });

  if (error) {
    console.error('Resend error:', error);
    throw new Error(`Failed to send reset email: ${error.message}`);
  }
}

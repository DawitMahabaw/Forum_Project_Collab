// ============================================================
// 📑 VISUAL EMAIL TEMPLATES (Keeps your Service Files Clean)
// ============================================================

const escapeHtml = (text) => {
  if (typeof text !== "string") return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

export const getPasswordResetHTML = (resetLink) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <h2 style="color: #fe5000; margin-top: 0; font-size: 22px; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px;">Password Reset Request</h2>
      <p style="color: #334155; font-size: 15px; line-height: 1.5;">Hello,</p>
      <p style="color: #334155; font-size: 15px; line-height: 1.5;">We received a request to change the account credentials associated with this email on Evangadi Forum. Click the action link below to choose a new secure password. This token expires automatically after 15 minutes.</p>
      
      <!-- 🚀 Styled Action Button Button Box -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="background-color: #ea580c; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 15px; display: inline-block;">Reset Password</a>
      </div>
      
      <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin-bottom: 0; border-top: 1px solid #f1f5f9; padding-top: 12px;">If you did not make this request, you can safely disregard this email. Your current password data parameters remain safe and unchanged.</p>
    </div>
  `;
};

export const getEmailVerificationHTML = ({ firstName, verifyLink, expiresHours = 24 }) => {
  const safeName = escapeHtml(firstName || "Developer");
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #1e293b;">
      <div style="border-bottom: 2px solid #f1f5f9; padding-bottom: 16px; margin-bottom: 24px;">
        <span style="font-size: 22px; font-weight: 800; color: #ea580c; letter-spacing: -0.5px;">Evangadi Forum</span>
        <span style="display: block; font-size: 13px; color: #64748b; margin-top: 2px;">Peer review, learning cohorts & technical discussions</span>
      </div>

      <h2 style="color: #0f172a; margin-top: 0; font-size: 20px; font-weight: 700;">Verify your email address</h2>
      
      <p style="color: #334155; font-size: 15px; line-height: 1.6;">Hello ${safeName},</p>
      <p style="color: #334155; font-size: 15px; line-height: 1.6;">
        Welcome to the AI-Powered Evangadi Forum! To complete your registration and activate your account, please confirm that this email address belongs to you by clicking the button below:
      </p>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${verifyLink}" style="background-color: #ea580c; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block; box-shadow: 0 2px 4px rgba(234, 88, 12, 0.2);">
          Verify My Email
        </a>
      </div>

      <p style="color: #64748b; font-size: 13px; line-height: 1.5;">
        This verification link will expire in <strong>${expiresHours} hours</strong>.
      </p>

      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; margin: 24px 0; word-break: break-all;">
        <p style="margin: 0 0 6px 0; font-size: 12px; color: #64748b; font-weight: 600;">Button not working? Copy and paste this link into your browser:</p>
        <a href="${verifyLink}" style="color: #ea580c; font-size: 13px; text-decoration: underline;">${verifyLink}</a>
      </div>

      <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; margin-bottom: 0; border-top: 1px solid #f1f5f9; padding-top: 16px;">
        If you did not create an account on Evangadi Forum, you can safely ignore this email. No account will be activated without verification.
      </p>
    </div>
  `;
};


import nodemailer from 'nodemailer';
import dns from 'dns';

// Force Node.js to resolve IPv4 addresses first to prevent ENETUNREACH on Render/cloud hosts
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

// Configure Nodemailer transporter (supports SMTP or Gmail App Passwords)
const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) return null;

  // Use Nodemailer's built-in Gmail service configuration when sending via Gmail
  if (host === 'smtp.gmail.com' || (user && user.endsWith('@gmail.com'))) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass }
    });
  }

  if (host) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      family: 4,
      connectionTimeout: 10000,
      greetingTimeout: 5000,
      socketTimeout: 10000
    } as any);
  }

  return null;
};

export const sendVerificationEmail = async (email: string, name: string, verificationLink: string): Promise<boolean> => {
  const transporter = createTransporter();
  const recipientName = name || email.split('@')[0];

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your HireTrack Account</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #090d16; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #090d16; padding: 40px 16px;">
        <tr>
          <td align="center">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #111827; border: 1px solid #1f2937; border-radius: 20px; padding: 40px 32px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
              <!-- Logo Header -->
              <tr>
                <td align="center" style="padding-bottom: 28px;">
                  <table border="0" cellspacing="0" cellpadding="0">
                    <tr>
                      <td style="width: 36px; height: 36px; background-color: #6366f1; border-radius: 10px; text-align: center; color: #ffffff; font-weight: 800; font-size: 20px; line-height: 36px;">H</td>
                      <td style="padding-left: 10px; font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.02em;">Hire<span style="color: #6366f1;">Track</span></td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td>
                  <h2 style="font-size: 22px; font-weight: 800; color: #ffffff; margin: 0 0 12px 0; text-align: center;">Verify Your Email Address</h2>
                  <p style="font-size: 15px; color: #9ca3af; margin: 0 0 24px 0; line-height: 1.6; text-align: center;">
                    Hi <strong style="color: #f3f4f6;">${recipientName}</strong>,<br>
                    Welcome to HireTrack! Please click the button below to verify your candidate account and activate your profile.
                  </p>
                </td>
              </tr>

              <!-- Button -->
              <tr>
                <td align="center" style="padding: 12px 0 28px 0;">
                  <a href="${verificationLink}" target="_blank" style="display: inline-block; background-color: #6366f1; color: #ffffff; font-weight: 700; font-size: 15px; padding: 14px 32px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);">
                    Verify Candidate Account →
                  </a>
                </td>
              </tr>

              <!-- Disclaimer -->
              <tr>
                <td style="border-top: 1px solid #1f2937; padding-top: 24px; text-align: center;">
                  <p style="font-size: 13px; color: #6b7280; margin: 0 0 8px 0; line-height: 1.5;">
                    If the button doesn't work, copy and paste this link into your browser:
                  </p>
                  <p style="font-size: 12px; color: #6366f1; word-break: break-all; margin: 0 0 16px 0;">
                    ${verificationLink}
                  </p>
                  <p style="font-size: 12px; color: #4b5563; margin: 0;">
                    If you didn't create a HireTrack account, you can safely ignore this email.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME || 'HireTrack Careers'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
        to: email,
        subject: 'Verify your HireTrack candidate account',
        html: htmlContent
      });
      return true;
    } catch (err: any) {
      console.error('Nodemailer verification email dispatch failed:', err);
      throw new Error(`SMTP Dispatch Error: ${err.message || 'Could not send verification email'}`);
    }
  }

  throw new Error('SMTP Error: Server is missing SMTP_HOST, SMTP_USER, or SMTP_PASS environment variables.');
};

export const sendPasswordResetEmail = async (email: string, name: string, resetLink: string): Promise<boolean> => {
  const transporter = createTransporter();
  const recipientName = name || email.split('@')[0];

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your HireTrack Password</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #090d16; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #090d16; padding: 40px 16px;">
        <tr>
          <td align="center">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #111827; border: 1px solid #1f2937; border-radius: 20px; padding: 40px 32px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
              <!-- Logo Header -->
              <tr>
                <td align="center" style="padding-bottom: 28px;">
                  <table border="0" cellspacing="0" cellpadding="0">
                    <tr>
                      <td style="width: 36px; height: 36px; background-color: #6366f1; border-radius: 10px; text-align: center; color: #ffffff; font-weight: 800; font-size: 20px; line-height: 36px;">H</td>
                      <td style="padding-left: 10px; font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.02em;">Hire<span style="color: #6366f1;">Track</span></td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td>
                  <h2 style="font-size: 22px; font-weight: 800; color: #ffffff; margin: 0 0 12px 0; text-align: center;">Reset Your Password</h2>
                  <p style="font-size: 15px; color: #9ca3af; margin: 0 0 24px 0; line-height: 1.6; text-align: center;">
                    Hi <strong style="color: #f3f4f6;">${recipientName}</strong>,<br>
                    We received a password reset request for your HireTrack account. Click the button below to choose a new password.
                  </p>
                </td>
              </tr>

              <!-- Button -->
              <tr>
                <td align="center" style="padding: 12px 0 28px 0;">
                  <a href="${resetLink}" target="_blank" style="display: inline-block; background-color: #6366f1; color: #ffffff; font-weight: 700; font-size: 15px; padding: 14px 32px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);">
                    Reset Password →
                  </a>
                </td>
              </tr>

              <!-- Disclaimer -->
              <tr>
                <td style="border-top: 1px solid #1f2937; padding-top: 24px; text-align: center;">
                  <p style="font-size: 13px; color: #6b7280; margin: 0 0 8px 0; line-height: 1.5;">
                    If the button doesn't work, copy and paste this link into your browser:
                  </p>
                  <p style="font-size: 12px; color: #6366f1; word-break: break-all; margin: 0 0 16px 0;">
                    ${resetLink}
                  </p>
                  <p style="font-size: 12px; color: #4b5563; margin: 0;">
                    If you didn't request a password reset, you can safely ignore this message.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME || 'HireTrack Careers'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
        to: email,
        subject: 'Reset your HireTrack password',
        html: htmlContent
      });
      return true;
    } catch (err: any) {
      console.error('Nodemailer password reset email dispatch failed:', err);
      throw new Error(`SMTP Dispatch Error: ${err.message || 'Could not send reset password email'}`);
    }
  }

  throw new Error('SMTP Error: Server is missing SMTP_HOST, SMTP_USER, or SMTP_PASS environment variables.');
};

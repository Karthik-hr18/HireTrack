import { Resend } from 'resend';

// Initialize Resend client lazily when API key is provided
const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return null;
  }
  return new Resend(apiKey.trim());
};

const FROM_EMAIL = process.env.EMAIL_FROM || 'HireTrack Support <onboarding@resend.dev>';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

export const sendVerificationEmail = async (toEmail: string, verificationToken: string): Promise<boolean> => {
  const verifyUrl = `${CLIENT_URL}/verify-email?token=${verificationToken}`;
  console.log(`\n======================================================`);
  console.log(`✉️ EMAIL DISPATCH FOR: ${toEmail}`);
  console.log(`Subject: Verify Your HireTrack Email Address`);
  console.log(`Verification Link: ${verifyUrl}`);
  console.log(`======================================================\n`);

  const resend = getResendClient();
  if (!resend) {
    return false;
  }

  try {
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: [toEmail],
        subject: 'Verify Your HireTrack Email Address',
        html: `
          <div style="font-family: Arial, sans-serif; background-color: #0b0f19; color: #f9fafb; padding: 32px; border-radius: 12px; max-width: 540px; margin: 0 auto;">
            <h2 style="color: #6366f1; font-size: 24px; margin-bottom: 16px;">Welcome to HireTrack!</h2>
            <p style="color: #9ca3af; font-size: 15px; line-height: 1.6;">
              Thank you for registering your candidate account. Please click the button below to verify your email address and activate your account features:
            </p>
            <div style="margin: 28px 0; text-align: center;">
              <a href="${verifyUrl}" style="background-color: #6366f1; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block;">
                Verify Email Address
              </a>
            </div>
            <p style="color: #6b7280; font-size: 13px;">
              If the button doesn't work, copy and paste this link into your browser:<br/>
              <a href="${verifyUrl}" style="color: #818cf8;">${verifyUrl}</a>
            </p>
          </div>
        `
      });
    } catch (primaryErr) {
      console.warn('Primary sender failed, retrying via onboarding@resend.dev fallback:', primaryErr);
      await resend.emails.send({
        from: 'HireTrack Support <onboarding@resend.dev>',
        to: [toEmail],
        subject: 'Verify Your HireTrack Email Address',
        html: `
          <div style="font-family: Arial, sans-serif; background-color: #0b0f19; color: #f9fafb; padding: 32px; border-radius: 12px; max-width: 540px; margin: 0 auto;">
            <h2 style="color: #6366f1; font-size: 24px; margin-bottom: 16px;">Welcome to HireTrack!</h2>
            <p style="color: #9ca3af; font-size: 15px; line-height: 1.6;">
              Thank you for registering your candidate account. Please click the button below to verify your email address and activate your account features:
            </p>
            <div style="margin: 28px 0; text-align: center;">
              <a href="${verifyUrl}" style="background-color: #6366f1; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block;">
                Verify Email Address
              </a>
            </div>
            <p style="color: #6b7280; font-size: 13px;">
              If the button doesn't work, copy and paste this link into your browser:<br/>
              <a href="${verifyUrl}" style="color: #818cf8;">${verifyUrl}</a>
            </p>
          </div>
        `
      });
    }
    return true;
  } catch (error) {
    console.error('Failed to send verification email via Resend:', error);
    return false;
  }
};

export const sendPasswordResetEmail = async (toEmail: string, resetToken: string): Promise<boolean> => {
  const resetUrl = `${CLIENT_URL}/reset-password?token=${resetToken}`;
  console.log(`\n======================================================`);
  console.log(`✉️ EMAIL DISPATCH FOR: ${toEmail}`);
  console.log(`Subject: Reset Your HireTrack Password`);
  console.log(`Reset Link: ${resetUrl}`);
  console.log(`======================================================\n`);

  const resend = getResendClient();
  if (!resend) {
    return false;
  }

  try {
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: [toEmail],
        subject: 'Reset Your HireTrack Password',
        html: `
          <div style="font-family: Arial, sans-serif; background-color: #0b0f19; color: #f9fafb; padding: 32px; border-radius: 12px; max-width: 540px; margin: 0 auto;">
            <h2 style="color: #6366f1; font-size: 24px; margin-bottom: 16px;">Password Reset Request</h2>
            <p style="color: #9ca3af; font-size: 15px; line-height: 1.6;">
              We received a request to reset your HireTrack account password. Click the button below to choose a new password (valid for 30 minutes):
            </p>
            <div style="margin: 28px 0; text-align: center;">
              <a href="${resetUrl}" style="background-color: #6366f1; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p style="color: #6b7280; font-size: 13px;">
              If you did not request a password reset, you can safely ignore this email.<br/>
              Direct link: <a href="${resetUrl}" style="color: #818cf8;">${resetUrl}</a>
            </p>
          </div>
        `
      });
    } catch (primaryErr) {
      console.warn('Primary reset sender failed, retrying via onboarding@resend.dev fallback:', primaryErr);
      await resend.emails.send({
        from: 'HireTrack Support <onboarding@resend.dev>',
        to: [toEmail],
        subject: 'Reset Your HireTrack Password',
        html: `
          <div style="font-family: Arial, sans-serif; background-color: #0b0f19; color: #f9fafb; padding: 32px; border-radius: 12px; max-width: 540px; margin: 0 auto;">
            <h2 style="color: #6366f1; font-size: 24px; margin-bottom: 16px;">Password Reset Request</h2>
            <p style="color: #9ca3af; font-size: 15px; line-height: 1.6;">
              We received a request to reset your HireTrack account password. Click the button below to choose a new password (valid for 30 minutes):
            </p>
            <div style="margin: 28px 0; text-align: center;">
              <a href="${resetUrl}" style="background-color: #6366f1; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p style="color: #6b7280; font-size: 13px;">
              If you did not request a password reset, you can safely ignore this email.<br/>
              Direct link: <a href="${resetUrl}" style="color: #818cf8;">${resetUrl}</a>
            </p>
          </div>
        `
      });
    }
    return true;
  } catch (error) {
    console.error('Failed to send password reset email via Resend:', error);
    return false;
  }
};

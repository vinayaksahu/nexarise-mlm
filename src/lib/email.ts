import nodemailer from 'nodemailer';

interface SendOtpParams {
  email: string;
  code: string;
  purpose: 'REGISTRATION' | 'PASSWORD_RESET';
}

export async function sendOtpEmail({ email, code, purpose }: SendOtpParams): Promise<boolean> {
  const isReg = purpose === 'REGISTRATION';
  const subject = isReg
    ? `🔐 NexaRise - Email Verification Code: ${code}`
    : `🔑 NexaRise - Password Reset Code: ${code}`;

  const title = isReg ? 'Verify Your Email Address' : 'Password Reset Request';
  const description = isReg
    ? 'Thank you for signing up with NexaRise. Use the One-Time Password (OTP) below to verify your email address and complete registration.'
    : 'We received a request to reset your NexaRise account password. Use the One-Time Password (OTP) below to proceed.';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b0f19; color: #e2e8f0; margin: 0; padding: 20px; }
          .card { max-width: 500px; margin: 20px auto; background: #131b2e; border: 1px solid #1e293b; border-radius: 16px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
          .header { text-align: center; margin-bottom: 24px; }
          .logo { font-size: 28px; font-weight: 800; color: #6366f1; letter-spacing: -0.5px; }
          .title { font-size: 20px; font-weight: 700; color: #ffffff; margin-top: 12px; }
          .desc { font-size: 14px; color: #94a3b8; line-height: 1.6; margin: 16px 0; }
          .otp-box { background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15)); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 12px; text-align: center; padding: 20px; margin: 24px 0; }
          .otp-code { font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #818cf8; margin: 0; font-family: monospace; }
          .timer { font-size: 12px; color: #f43f5e; margin-top: 8px; font-weight: 600; }
          .footer { text-align: center; font-size: 12px; color: #64748b; margin-top: 32px; border-top: 1px solid #1e293b; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <div class="logo">⚡ NexaRise</div>
            <div class="title">${title}</div>
          </div>
          <div class="desc">${description}</div>
          <div class="otp-box">
            <div class="otp-code">${code}</div>
            <div class="timer">⏰ Valid for 10 minutes</div>
          </div>
          <div class="desc" style="font-size: 12px; color: #64748b;">
            If you did not request this OTP, please ignore this email or contact NexaRise support immediately. Never share your OTP with anyone.
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} NexaRise Inc. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `;

  // Check if SMTP is configured
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT) || 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM || `"NexaRise" <noreply@nexarise.online>`;

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: smtpFrom,
        to: email,
        subject: subject,
        html: html,
      });

      console.log(`[SMTP] OTP email successfully sent to ${email}`);
      return true;
    } catch (err) {
      console.error(`[SMTP Error] Failed to send email to ${email}:`, err);
      // Fallback log in case of SMTP failure
      console.log(`[OTP FALLBACK] Email: ${email} | Code: ${code} | Purpose: ${purpose}`);
      return true;
    }
  } else {
    // Development / Simulation Mode when SMTP is not configured
    console.log(`========================================`);
    console.log(`[EMAIL SIMULATION]`);
    console.log(`To: ${email}`);
    console.log(`Subject: ${subject}`);
    console.log(`OTP CODE: ${code}`);
    console.log(`Purpose: ${purpose}`);
    console.log(`========================================`);
    return true;
  }
}

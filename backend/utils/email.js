import nodemailer from "nodemailer";

const createTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } =
    process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    throw new Error(
      "SMTP configuration is incomplete. SMTP_HOST, SMTP_USER, and SMTP_PASS are required.",
    );
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: SMTP_SECURE === "true",
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
};

export const sendVerificationEmail = async (email, token) => {
  try {
    const transporter = createTransporter();

    const url = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

    const info = await transporter.sendMail({
      from: `"Ledgrace" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Verify your Ledgrace email address",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h2>Welcome to Ledgrace</h2>

          <p>
            Please verify your email address by clicking the button below.
          </p>

          <p>
            <a
              href="${url}"
              style="
                display: inline-block;
                padding: 12px 20px;
                background: #1458ed;
                color: white;
                text-decoration: none;
                border-radius: 8px;
              "
            >
              Verify Email
            </a>
          </p>

          <p>
            Or copy and paste this link into your browser:
          </p>

          <p>${url}</p>
        </div>
      `,
    });

    if (!info?.messageId) {
      throw new Error("SMTP server did not return a message ID.");
    }

    console.log("Verification email sent:", info.messageId);

    return info;
  } catch (error) {
    console.error("Verification email error:", error);

    throw new Error(
      `Verification email could not be sent to ${email}: ${error.message}`,
    );
  }
};

export const sendResetPasswordEmail = async (email, firstName, code) => {
  try {
    const transporter = createTransporter();

    const info = await transporter.sendMail({
      from: `"Ledgrace" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Your Ledgrace Password Reset Code",
      text: `Hello ${firstName || "there"},

We received a request to reset your Ledgrace password.

Your 6-digit verification code is: ${code}

This code will expire in 10 minutes.

If you did not request a password reset, you can safely ignore this email.

Regards,
The Ledgrace Team`,
      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: 0 auto;
          padding: 24px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
        ">

          <h2 style="color: #102348;">
            Hello ${firstName || "there"},
          </h2>

          <p style="
            color: #475569;
            font-size: 15px;
            line-height: 1.7;
          ">
            We received a request to reset your Ledgrace password.
          </p>

          <p style="
            color: #475569;
            font-size: 15px;
            line-height: 1.7;
          ">
            Your 6-digit verification code is:
          </p>

          <div style="
            background: #f4f8ff;
            border: 1px solid #dbeafe;
            border-radius: 10px;
            padding: 18px;
            text-align: center;
            margin: 20px 0;
          ">
            <h1 style="
              margin: 0;
              letter-spacing: 6px;
              color: #1458ed;
              font-size: 32px;
            ">
              ${code}
            </h1>
          </div>

          <p style="
            color: #475569;
            font-size: 15px;
            line-height: 1.7;
          ">
            This code will expire in 5 minutes.
          </p>

          <p style="
            color: #475569;
            font-size: 15px;
            line-height: 1.7;
          ">
            If you didn't request this password reset,
            you can safely ignore this email.
          </p>

          <p style="
            color: #475569;
            margin-top: 24px;
          ">
            Regards,<br />
            The Ledgrace Team
          </p>

        </div>
      `,
    });

    if (!info?.messageId) {
      throw new Error("SMTP server did not return a message ID.");
    }

    console.log("Password reset email sent:", info.messageId);

    return info;
  } catch (error) {
    console.error("Password reset email error:", error);

    throw new Error(
      `Password reset email could not be sent to ${email}: ${error.message}`,
    );
  }
};

export const sendTwoFactorEmail = async (email, firstName, code) => {
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"Ledgrace" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Your Ledgrace sign-in code",
      text: `Hello ${firstName || "there"},\n\nYour Ledgrace sign-in code is: ${code}\n\nThis code expires in 10 minutes.\n\nRegards,\nThe Ledgrace Team`,
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px"><h2>Sign-in verification</h2><p>Your Ledgrace verification code is:</p><p style="font-size:28px;font-weight:700;letter-spacing:6px">${code}</p><p>This code expires in 10 minutes.</p></div>`,
    });
  } catch (error) {
    console.error("Two-factor email error:", error);
    throw new Error(`Two-factor email could not be sent: ${error.message}`);
  }
};

import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

export const sendVerificationEmail = async (userEmail: string) => {
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST!,
    port: parseInt(process.env.EMAIL_PORT!),
    secure: false, // true for port 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER!,
      pass: process.env.EMAIL_PASSWORD!,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_DEFAULT_FROM,
    to: userEmail,
    subject: "Your Atypica Verification Code",
    text: `Your verification code is: ${verificationCode}\n\nThis code will expire in 30 minutes.\n\nIf you didn't request this code, please ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Your Verification Code</h2>
        <p>Please use the following code to verify your email address:</p>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold; margin: 20px 0;">
          ${verificationCode}
        </div>
        <p>This code will expire in 30 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #777;">This is an automated email from Atypica. Please do not reply to this email.</p>
      </div>
    `,
  };

  await prisma.verificationCode.create({
    data: {
      email: userEmail,
      code: verificationCode,
      expiresAt: new Date(Date.now() + 1000 * 60 * 30), // 30 minutes from now
    },
  });

  await transporter.sendMail(mailOptions);
};

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and verification code are required" },
        { status: 400 },
      );
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ message: "Email already verified" });
    }

    // Find the verification code
    const verificationCodeRecord = await prisma.verificationCode.findFirst({
      where: {
        email,
        code,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!verificationCodeRecord) {
      return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 });
    }

    // Mark the user's email as verified
    await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    });

    // Delete all verification codes for this user
    await prisma.verificationCode.deleteMany({
      where: { email },
    });

    return NextResponse.json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

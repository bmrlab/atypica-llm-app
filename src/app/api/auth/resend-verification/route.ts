import { NextResponse } from "next/server";
import { sendVerificationEmail } from "../signup/email";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    // Delete any existing verification codes
    // await prisma.verificationCode.deleteMany({
    //   where: { email },
    // });
    // Send a new verification email
    await sendVerificationEmail(email);
    return NextResponse.json({ message: "Verification code sent successfully" });
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

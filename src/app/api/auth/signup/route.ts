import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { sendVerificationEmail } from "./email";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email.endsWith("@tezign.com")) {
      return NextResponse.json(
        { error: "Only tezign.com email addresses are allowed to register" },
        { status: 403 },
      );
    }

    const exists = await prisma.user.findUnique({
      where: { email },
    });
    if (exists) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword },
    });

    await sendVerificationEmail(user.email);

    return NextResponse.json({
      user: {
        email: user.email,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

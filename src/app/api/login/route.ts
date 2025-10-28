import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { signJwt, setAuthCookies } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/**
 * User login
 * POST /api/login
 * Body: { email, password }
 * Sets HttpOnly cookies with JWT tokens
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = schema.parse(body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        hospital: {
          select: { name: true, code: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "invalid_credentials", message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "invalid_credentials", message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Generate tokens
    const accessToken = signJwt(
      {
        sub: user.id,
        role: user.role,
        hospitalId: user.hospitalId,
      },
      "15m"
    );

    const refreshToken = signJwt(
      {
        sub: user.id,
        type: "refresh",
      },
      "7d"
    );

    // Set cookies
    await setAuthCookies(accessToken, refreshToken);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        hospital: user.hospital,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "validation_error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Login error:", error);
    return NextResponse.json(
      { error: "internal_error" },
      { status: 500 }
    );
  }
}

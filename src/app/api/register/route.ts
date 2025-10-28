import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["ADMIN", "DOCTOR", "FRONT_DESK", "PATIENT"]),
  hospitalCode: z.string().min(1),
});

/**
 * Register a new user
 * POST /api/register
 * Body: { email, password, role, hospitalCode }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, role, hospitalCode } = schema.parse(body);

    // Verify hospital exists
    const hospital = await prisma.hospital.findUnique({
      where: { code: hospitalCode },
    });

    if (!hospital) {
      return NextResponse.json(
        { error: "invalid_hospital", message: "Hospital code not found" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "user_exists", message: "Email already registered" },
        { status: 409 }
      );
    }

    // Hash password and create user
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
        hospitalId: hospital.id,
      },
      select: {
        id: true,
        email: true,
        role: true,
        hospitalId: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      { success: true, user },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "validation_error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "internal_error" },
      { status: 500 }
    );
  }
}

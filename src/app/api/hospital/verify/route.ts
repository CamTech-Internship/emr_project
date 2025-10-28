import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  code: z.string().min(1),
});

/**
 * Verify hospital code
 * POST /api/hospital/verify
 * Body: { code: string }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code } = schema.parse(body);

    const hospital = await prisma.hospital.findUnique({
      where: { code },
      select: { id: true, name: true, code: true },
    });

    return NextResponse.json({
      valid: !!hospital,
      hospitalId: hospital?.id ?? null,
      hospitalName: hospital?.name ?? null,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "validation_error", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "internal_error" },
      { status: 500 }
    );
  }
}

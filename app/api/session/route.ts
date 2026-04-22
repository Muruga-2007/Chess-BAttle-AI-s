import { NextResponse } from "next/server";
import { z } from "zod";
import { createSession } from "@/lib/chess/store";

const createSessionSchema = z.object({
  mode: z.enum(["cloud_vs_cloud", "cloud_vs_local", "local_vs_local"]),
  rulesProfile: z.enum(["strict_fide", "practical_app"]),
  whiteMs: z.number().int().positive().max(60 * 60 * 1000).default(5 * 60 * 1000),
  blackMs: z.number().int().positive().max(60 * 60 * 1000).default(5 * 60 * 1000),
  incrementMs: z.number().int().min(0).max(60 * 1000).default(2000),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createSessionSchema.parse(body);
  const session = createSession(parsed);
  return NextResponse.json(session);
}

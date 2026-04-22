import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    mode: process.env.DEMO_MODE !== "false" ? "demo" : "adapter-ready",
    timestamp: new Date().toISOString(),
  });
}

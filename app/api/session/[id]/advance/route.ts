import { NextResponse } from "next/server";
import { advanceSession } from "@/lib/chess/store";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(_request: Request, { params }: Params) {
  const { id } = await params;
  const session = advanceSession(id);

  if (!session) {
    return NextResponse.json({ message: "Session not found" }, { status: 404 });
  }

  return NextResponse.json(session);
}

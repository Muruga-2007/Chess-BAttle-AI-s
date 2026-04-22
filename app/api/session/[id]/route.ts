import { NextResponse } from "next/server";
import { getSession } from "@/lib/chess/store";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const session = getSession(id);

  if (!session) {
    return NextResponse.json({ message: "Session not found" }, { status: 404 });
  }

  return NextResponse.json(session);
}

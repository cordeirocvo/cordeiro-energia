import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const instalacoes = await prisma.planilhaInstalacao.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: instalacoes });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

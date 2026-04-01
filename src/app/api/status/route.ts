import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const statuses = await prisma.statusOption.findMany({
      orderBy: { createdAt: 'asc' }
    });
    return NextResponse.json({ success: true, data: statuses });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { label } = await req.json();
    if (!label) return NextResponse.json({ success: false, error: "Etiqueta obrigatória" }, { status: 400 });

    const newStatus = await prisma.statusOption.create({
      data: { label }
    });
    return NextResponse.json({ success: true, data: newStatus });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Provável duplicata: " + String(error) }, { status: 500 });
  }
}

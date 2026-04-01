import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, username: true, role: true }
    });
    return NextResponse.json({ success: true, data: users });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { username, password, role } = await req.json();
    if (!username || !password || !role) return NextResponse.json({ success: false, error: "Preencha tudo" }, { status: 400 });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { username, password: hashedPassword, role }
    });
    
    return NextResponse.json({ success: true, data: { id: newUser.id, username: newUser.username, role: newUser.role } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Usuário já existe ou erro: " + String(error) }, { status: 500 });
  }
}

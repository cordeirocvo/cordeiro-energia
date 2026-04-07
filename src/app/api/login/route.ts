import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "CordeiroEnergiaSecretKey2024";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const username = (body.username || "").trim();
    const password = (body.password || "").trim();

    if (!username || !password) {
      return NextResponse.json({ success: false, error: "Preencha todos os campos" }, { status: 400 });
    }

    // Busca case-insensitive para evitar erros de maiúsculas/minúsculas
    let user = await prisma.user.findFirst({ where: { username: { equals: username, mode: "insensitive" } } });

    // Criar o usuário master automaticamente na primeira vez
    if (!user && username === "admin" && password === "admin123") {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      user = await prisma.user.create({
         data: { username: "admin", password: hashedPassword, role: "ADMIN" }
      });
    }

    if (!user) return NextResponse.json({ success: false, error: "Credenciais inválidas" }, { status: 401 });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return NextResponse.json({ success: false, error: "Credenciais inválidas" }, { status: 401 });

    // Gerar token contendo o papel (role) do usuário
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: "12h" });

    // Redirecionamento dinâmico por perfil
    let redirectUrl = "/admin/portal"; // ADMIN → Portal de seleção
    if (user.role === "TV") redirectUrl = "/tv";
    if (user.role === "COMUM") redirectUrl = "/publico";

    const response = NextResponse.json({ success: true, role: user.role, redirectUrl });
    const isSecure = process.env.NODE_ENV === "production";
    response.cookies.set("auth_token", token, { httpOnly: true, secure: isSecure, sameSite: "lax", path: "/", maxAge: 60 * 60 * 12 });
    
    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Recuperar todas as Obras cadastradas (incluindo progresso de OS)
export async function GET() {
  try {
    const obras = await prisma.obra.findMany({
      include: {
        ordensServico: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(obras);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Criar uma nova Obra (Mestre)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nome, cliente, endereco, telefone } = body;

    const novaObra = await prisma.obra.create({
      data: {
        nome: nome || "Obra a Definir",
        cliente: cliente || "Desconhecido",
        endereco,
        telefone
      }
    });

    return NextResponse.json(novaObra, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

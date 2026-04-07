import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Recuperar todas as OS vinculadas a Obras
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let whereClause = {};
    if (status) {
      whereClause = { status };
    }

    const ordens = await prisma.ordemServico.findMany({
      where: whereClause,
      include: {
        obra: true,
        tecnicos: { include: { tecnico: true } },
        fotos: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(ordens);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Criar OS automatizada vinculada a uma Obra
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      cliente, obraId, endereco, telefone, 
      tarefa, dataPrevista 
    } = body;

    let finalObraId = obraId;

    // 1. Criar Obra genérica se não existir
    if (!finalObraId || finalObraId === "NOVA") {
      const novaObra = await prisma.obra.create({
        data: {
          nome: "Obra a Definir",
          cliente: cliente || "Desconhecido",
          endereco,
          telefone
        }
      });
      finalObraId = novaObra.id;
    }

    // 2. Criar a OS
    const novaOS = await prisma.ordemServico.create({
      data: {
        obraId: finalObraId,
        servicoEscopo: tarefa || "Tarefa a Definir",
        dataPrevista: dataPrevista ? new Date(dataPrevista) : null,
      }
    });

    // 3. Criar registro automático no Painel da TV (espelhamento)
    try {
      await prisma.planilhaInstalacao.create({
        data: {
          cliente: cliente || "Desconhecido",
          instalacao: tarefa || "Nova OS Gerada",
          telefoneOriginal: telefone,
          dataPrevista: dataPrevista ? new Date(dataPrevista).toISOString().split('T')[0] : null,
          status: "Ordem de Serviço Aberta",
          solicitacao: `OS Gerada #${novaOS.numeroOS}`
        }
      });
    } catch (err) {
      console.warn("Falha no espelhamento da TV:", err);
    }

    return NextResponse.json({ success: true, os: novaOS }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

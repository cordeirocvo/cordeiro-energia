import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const osId = params.id;
    const body = await request.json();
    const { 
      obraId, 
      status, 
      servicoEscopo, 
      dataPrevista,
      observacoesFinais
    } = body;

    const updatedOS = await prisma.ordemServico.update({
      where: { id: osId },
      data: {
        obraId,
        status,
        servicoEscopo,
        dataPrevista: dataPrevista ? new Date(dataPrevista) : undefined,
        observacoesFinais
      },
      include: { obra: true }
    });

    return NextResponse.json({ success: true, os: updatedOS });
  } catch (error: any) {
    console.error("Erro ao editar OS:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const osId = params.id;
    await prisma.ordemServico.delete({ where: { id: osId } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

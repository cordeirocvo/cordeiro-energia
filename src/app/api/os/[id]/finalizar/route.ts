import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const osId = params.id;
    const body = await request.json();
    const { assinaturaCliente, assinaturaTecnico, observacoesFinais, fotos, pin } = body;

    const osProcessada = await prisma.ordemServico.update({
      where: { id: osId },
      data: {
        status: "FINALIZADA",
        assinaturaCliente,
        assinaturaTecnico,
        observacoesFinais,
        dataFinalizacao: new Date(),
        fotos: {
          create: (fotos || []).map((f: any) => ({
            etapaObra: f.etapa,
            urlFoto: f.base64
          }))
        }
      }
    });

    return NextResponse.json({ success: true, os: osProcessada });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

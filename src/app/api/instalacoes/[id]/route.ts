import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { pushToN8N } from "@/lib/n8n";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();

    const current = await prisma.planilhaInstalacao.findUnique({ where: { id } });
    if (!current) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }

    // Convert arrays/buffers from frontend into Bytes if necessary
    // In JS we can just assume `anexoFotos` and `anexoArquivos` are coming as Base64 Strings,
    // we can save them as bytes using Buffer.from, but Prisma can store them as strings or bytes.
    // If Prisma is expecting Bytes, we should parse it. For simplicity in MVP, if it's base64, save it.
    let dataUpdate = { ...body };
    
    // Remover campos que não podem ser alterados ou que o Prisma gerencia
    delete dataUpdate.id;
    delete dataUpdate.createdAt;
    delete dataUpdate.updatedAt;
    delete dataUpdate.isCriticalParecer;
    delete dataUpdate.diaPrevNum;

    if (dataUpdate.dataSolicitacao) {
        dataUpdate.dataSolicitacao = new Date(dataUpdate.dataSolicitacao);
    }
    
    if (dataUpdate.anexoFotos && typeof dataUpdate.anexoFotos === 'string') {
        dataUpdate.anexoFotos = Buffer.from(dataUpdate.anexoFotos, 'base64');
    }
    if (dataUpdate.anexoArquivos && typeof dataUpdate.anexoArquivos === 'string') {
        dataUpdate.anexoArquivos = Buffer.from(dataUpdate.anexoArquivos, 'base64');
    }

    const updated = await prisma.planilhaInstalacao.update({
      where: { id },
      data: dataUpdate,
    });
    
    // Sincronização concluída (N8N paralizado)

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

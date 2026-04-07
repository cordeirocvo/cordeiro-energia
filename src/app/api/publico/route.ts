import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { pushToN8N } from "@/lib/n8n";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    let dataToSave = { ...body };
    
    // Converter de base64 string para Buffer se presente
    if (dataToSave.anexoFotos && typeof dataToSave.anexoFotos === 'string') {
        dataToSave.anexoFotos = Buffer.from(dataToSave.anexoFotos, 'base64');
    }
    if (dataToSave.anexoArquivos && typeof dataToSave.anexoArquivos === 'string') {
        dataToSave.anexoArquivos = Buffer.from(dataToSave.anexoArquivos, 'base64');
    }

    // Criar uma nova Atividade mapeada pro BD
    const novaAtividade = await prisma.planilhaInstalacao.create({
      data: {
        cliente: dataToSave.cliente || "Novo Cliente",
        rua: dataToSave.endereco || "",
        cidade: dataToSave.cidade || "",
        telefoneCliente: dataToSave.telefone || "",
        solicitacao: dataToSave.solicitacao || "",
        dataSolicitacao: dataToSave.dataSolicitacao ? new Date(dataToSave.dataSolicitacao) : new Date(),
        anexoFotos: dataToSave.anexoFotos || null,
        anexoArquivos: dataToSave.anexoArquivos || null,
        // Campos padrão para nao quebrar regras da UI:
        diaPrev: "999", 
        status: "Nova Solicitação",
        instalacao: "FALSE"
      }
    });

    // Cadastro concluído sem disparo externo (N8N paralizado)

    return NextResponse.json({ success: true, data: { id: novaAtividade.id } });
  } catch (error: any) {
    console.error("Public API Error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { solis } from '@/lib/solis';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    // 1. Verificar se o Sync está ativo no banco
    const config = await prisma.solisConfig.findUnique({
      where: { id: 'default' }
    });

    if (config && !config.active) {
       return NextResponse.json({ message: 'Sincronização desativada nas configurações.' }, { status: 200 });
    }

    // 2. Executar Sincronismo
    await solis.syncAll();

    return NextResponse.json({ 
        message: 'Sincronização concluída com sucesso!',
        timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error: any) {
    console.error('Erro na rota de sync Solis:', error);
    return NextResponse.json({ 
        error: 'Falha ao sincronizar dados da Solis Cloud', 
        details: error.message 
    }, { status: 500 });
  }
}

// Permitir POST para gatilhos manuais ou webhooks
export async function POST(request: Request) {
    return GET(request);
}

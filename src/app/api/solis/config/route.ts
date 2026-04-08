import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const config = await prisma.solisConfig.upsert({
      where: { id: 'default' },
      update: {},
      create: { id: 'default', syncInterval: 10, active: true },
    });
    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar configuração' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { syncInterval, active } = await request.json();
    const config = await prisma.solisConfig.update({
      where: { id: 'default' },
      data: { 
        syncInterval, 
        active 
      },
    });
    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar configuração' }, { status: 500 });
  }
}

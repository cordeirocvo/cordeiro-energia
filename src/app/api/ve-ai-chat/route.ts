import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    // Mock de IA para o Assistente Normativo (Pode ser integrado ao Gemini/OpenAI depois)
    const responses = [
      "De acordo com a NBR 5410, a queda de tensão máxima para circuitos terminais é de 4%.",
      "A NBR 17019 exige o uso de IDR Tipo B se o carregador não possuir proteção RDC-DD interna.",
      "Para carregadores de 7.4kW, recomenda-se disjuntor de 40A e cabos de 6mm² ou 10mm² dependendo da distância.",
      "O sistema BESS exige ventilação adequada e monitoramento de temperatura conforme normas de segurança.",
      "Dimensionamento de SPDA deve seguir a NBR 5419-2 para análise de risco e nível de proteção."
    ];

    const randomReply = responses[Math.floor(Math.random() * responses.length)];

    return NextResponse.json({ reply: `[AI Assistant]: ${randomReply} Sua dúvida sobre '${message}' foi registrada.` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const pushToN8N = async (payload: any, eventType: string = 'UPDATE') => {
  const url = process.env.N8N_WEBHOOK_URL;
  if (!url || url.includes('seu-dominio') || url === '') {
    console.warn("N8N_WEBHOOK_URL não configurado com valor real. Cancelando disparo externo.");
    return;
  }
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
         evento: eventType, 
         dados: payload, 
         timestamp: new Date().toISOString() 
      }),
    });
    
    if (!response.ok) {
       console.error(`Aviso: N8N retornou erro ${response.status}`);
    } else {
       console.log(`Webhook N8N enviado com sucesso para evento: ${eventType}`);
    }
  } catch (err) {
    console.error(`Falha ao contactar servidor N8N para o evento: ${eventType}`, err);
  }
};

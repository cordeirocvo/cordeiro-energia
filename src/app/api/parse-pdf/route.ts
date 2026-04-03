import { NextResponse } from "next/server";

// ─────────────────────────────────────────────────────────────
// Parse de Fatura de Energia (CEMIG / outras concessionárias)
// ─────────────────────────────────────────────────────────────

interface ParsedInvoice {
  concessionaria: string;
  cliente: string;
  contrato: string;
  mesReferencia: string;
  consumoKwhTotal: number;
  consumoKwhPonta?: number;
  consumoKwhForaPonta?: number;
  demandaKw?: number;
  demandaContratadaKw?: number;
  valorTotal: number;
  tarifaMedia: number;          // R$/kWh calculada
  tarifaPonta?: number;         // R$/kWh
  tarifaForaPonta?: number;     // R$/kWh
  tarifaDemanda?: number;       // R$/kW
  classificacaoTarifaria: string; // Grupo A / B, modalidade
  tensaoFornecimento?: string;
  fatorPotencia?: number;
  fieldsManual: string[];       // Campos que precisam de preenchimento manual
  rawText?: string;
}

function extractNumber(text: string, pattern: RegExp): number | undefined {
  const m = text.match(pattern);
  if (!m) return undefined;
  return parseFloat(m[1].replace(/\./g, "").replace(",", "."));
}

function extractString(text: string, pattern: RegExp): string | undefined {
  const m = text.match(pattern);
  return m?.[1]?.trim();
}

function parseCemigInvoice(text: string): ParsedInvoice {
  const fieldsManual: string[] = [];

  // Cliente
  const cliente = extractString(text, /(?:NOME|Cliente|Razão Social)[:\s]+([^\n]+)/i) || "—";

  // Número do contrato/instalação
  const contrato = extractString(text, /(?:N[ºo°]\s*(?:do\s*)?(?:instalação|contrato|fatura|documento))[:\s]+([0-9\-\.\/]+)/i)
    || extractString(text, /(?:Instalação)[:\s]+(\d+)/i) || "—";

  // Mês de referência
  const mesRef = extractString(text, /(?:mês de referência|referência|competência)[:\s]+([A-Za-zÀ-ÿ\/0-9]+)/i)
    || extractString(text, /(\d{2}\/\d{4})/) || "—";

  // Consumo kWh Total
  let consumoTotal = extractNumber(text, /Consumo\s+(?:ativo\s+)?total[:\s]+([\d\.,]+)\s*kWh/i)
    || extractNumber(text, /total\s+de\s+energia[:\s]+([\d\.,]+)\s*kWh/i)
    || extractNumber(text, /Energia\s+(?:elétrica\s+)?(?:ativa\s+)?(?:faturada\s+)?[:\s]*([\d\.,]+)\s*kWh/i)
    || 0;

  // Consumo Ponta / Fora Ponta
  const consumoPonta = extractNumber(text, /(?:Ponta|hp)\s*[:\-]?\s*([\d\.,]+)\s*kWh/i);
  const consumoForaPonta = extractNumber(text, /(?:Fora\s*[Pp]onta|hfp)\s*[:\-]?\s*([\d\.,]+)\s*kWh/i);

  if (!consumoTotal && consumoPonta && consumoForaPonta) {
    consumoTotal = consumoPonta + consumoForaPonta;
  }

  // Demanda
  const demandaKw = extractNumber(text, /Demanda\s+(?:medida|ativa\s+)?[:\s]+([\d\.,]+)\s*kW/i);
  const demandaContrat = extractNumber(text, /Demanda\s+(?:contratada)[:\s]+([\d\.,]+)\s*kW/i);

  // Valor Total
  const valorTotal = extractNumber(text, /(?:TOTAL\s+A\s+PAGAR|Valor\s+Total|Total\s+da\s+fatura)[:\s\n]+([\d\.,]+)/i)
    || extractNumber(text, /R\$\s+([\d\.,]+)\s*$/m) || 0;

  // Tarifas
  const tarifaPonta = extractNumber(text, /tarifa\s+(?:de\s+)?(?:energia\s+)?(?:em\s+)?ponta.*?([\d\.,]+)\s*R\$\/kWh/i);
  const tarifaFP = extractNumber(text, /tarifa\s+(?:de\s+)?(?:energia\s+)?(?:em\s+)?fora\s*ponta.*?([\d\.,]+)\s*R\$\/kWh/i);

  // Tarifa média calculada
  const tarifaMedia = consumoTotal > 0 ? Math.round((valorTotal / consumoTotal) * 100) / 100 : 0;

  // Identificar classificação tarifária
  let classificacao = "Grupo B — Baixa Tensão";
  if (text.match(/Grupo\s+A|Alta\s+Tensão|Sub[GT]|Media\s+Tensão/i)) {
    classificacao = extractString(text, /(?:Grupo|Subgrupo|Modalidade)[:\s]+([^\n]{3,30})/i) || "Grupo A";
  }

  // Verificar campos faltantes
  if (!consumoTotal || consumoTotal === 0) fieldsManual.push("Consumo Total (kWh)");
  if (!valorTotal || valorTotal === 0) fieldsManual.push("Valor Total (R$)");
  if (!demandaKw) fieldsManual.push("Demanda Medida (kW)");
  if (!tarifaMedia) fieldsManual.push("Tarifa Média (R$/kWh)");

  return {
    concessionaria: "CEMIG",
    cliente,
    contrato,
    mesReferencia: mesRef,
    consumoKwhTotal: consumoTotal,
    consumoKwhPonta: consumoPonta,
    consumoKwhForaPonta: consumoForaPonta,
    demandaKw,
    demandaContratadaKw: demandaContrat,
    valorTotal,
    tarifaMedia: tarifaMedia || 0.9,
    tarifaPonta,
    tarifaForaPonta: tarifaFP,
    classificacaoTarifaria: classificacao,
    fieldsManual,
  };
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) return NextResponse.json({ success: false, error: "Nenhum arquivo enviado." }, { status: 400 });

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "pdf") {
      return NextResponse.json({ success: false, error: "Apenas arquivos PDF são suportados." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse PDF — usar pdf-parse dinâmico (não suporta static import no Next.js edge)
    let text = "";
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require("pdf-parse");
      const parsed = await pdfParse(buffer);
      text = parsed.text;
    } catch {
      return NextResponse.json({
        success: false,
        error: "Não foi possível ler o PDF. Verifique se o arquivo não está protegido por senha.",
      }, { status: 422 });
    }

    // Tentar parsear como CEMIG
    const detected = text.toLowerCase().includes("cemig") || text.toLowerCase().includes("companhia energética");
    const invoice = parseCemigInvoice(text);

    return NextResponse.json({
      success: true,
      format: detected ? "CEMIG" : "GENERICA",
      data: invoice,
      rawTextPreview: text.substring(0, 2000),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

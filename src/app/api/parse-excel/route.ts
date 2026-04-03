import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

// ─────────────────────────────────────────────────────────────
// Detecta e parseia formato CEMIG Memória de Massa (XLS/XLSX)
// ─────────────────────────────────────────────────────────────
interface ParsedMemoriaMassa {
  cliente: string;
  medidor: string;
  pontoMedicao: string;
  dataInicial: string;
  dataFinal: string;
  totalRegistros: number;
  tipo: "consumo" | "demanda";
  totalKwh?: number;
  totalKvar?: number;
  peakDemandKw?: number;
  avgPowerFactor: number;
  consumoDiarioMedio: number;       // kWh/dia
  consumoPontaTotal: number;        // kWh em horário de ponta
  consumoForaPontaTotal: number;    // kWh fora de ponta
  percentualPonta: number;          // %
  curvaCarga: HourlySummary[];      // Média por hora do dia
  records: DataRecord[];            // Todos os registros (limitado a 500 para memória)
}

interface DataRecord {
  id: number;
  datetime: string;
  value: number;         // kWh ou kW
  kvarInd: number;
  kvarCap: number;
  fp: number;
  posto: string;
}

interface HourlySummary {
  hour: number;
  avgKwh: number;
  avgKw: number;
  posto: string;
}

function parseDatetime(raw: string): Date | null {
  if (!raw) return null;
  // Format: "12/01/2026 - 23:00"
  const m = raw.match(/(\d{2})\/(\d{2})\/(\d{4})\s*-\s*(\d{2}):(\d{2})/);
  if (!m) return null;
  return new Date(+m[3], +m[2] - 1, +m[1], +m[4], +m[5]);
}

function parseCemigExcel(buffer: Buffer): ParsedMemoriaMassa | null {
  const wb = XLSX.read(buffer, { type: "buffer" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

  if (!rows[0]?.[0]?.toString().includes("Memória de Massa")) return null;

  const cliente = rows[1]?.[0]?.toString().replace("Descrição: ", "") || "—";
  const pontoMedicao = rows[2]?.[0]?.toString().split(":")[1]?.trim() || "—";
  const medidor = rows[3]?.[0]?.toString().split(":")[1]?.trim().split(",")[0].trim() || "—";
  const dataInicial = rows[3]?.[2]?.toString().replace("Data Inicial: ", "") || "";
  const dataFinal = rows[3]?.[4]?.toString().replace("Data Final: ", "") || "";

  // Detectar tipo (consumo ou demanda) pelo header das colunas
  let headerRow = -1;
  let tipo: "consumo" | "demanda" = "consumo";
  for (let i = 5; i < Math.min(15, rows.length); i++) {
    const row = rows[i];
    if (Array.isArray(row) && row[0] === "Id") {
      headerRow = i;
      tipo = row[2]?.toString().toLowerCase().includes("kwh") ? "consumo" : "demanda";
      break;
    }
  }

  if (headerRow === -1) return null;

  const dataRows = rows.slice(headerRow + 1).filter(r => typeof r[0] === "number" && r[1]);
  const totalRegistros = dataRows.length;

  let totalKwh = 0;
  let totalKvar = 0;
  let peakKw = 0;
  let fpSum = 0;
  let pontaKwh = 0;
  let foraPontaKwh = 0;
  const hourBuckets: Record<number, { sum: number; count: number }> = {};

  const records: DataRecord[] = [];

  for (const row of dataRows) {
    const id = +row[0];
    const dt = parseDatetime(row[1]?.toString() || "");
    const val = parseFloat(row[2]) || 0;
    const kvarInd = parseFloat(row[3]) || 0;
    const kvarCap = parseFloat(row[4]) || 0;
    const fp = parseFloat(row[5]) || 0;
    const posto = row[6]?.toString() || "Fora Ponta";

    if (tipo === "consumo") {
      totalKwh += val;
      totalKvar += kvarInd;
      if (posto.toLowerCase().includes("ponta") && !posto.toLowerCase().includes("fora")) {
        pontaKwh += val;
      } else {
        foraPontaKwh += val;
      }
    } else {
      if (val > peakKw) peakKw = val;
    }

    fpSum += fp;

    if (dt) {
      const h = dt.getHours();
      if (!hourBuckets[h]) hourBuckets[h] = { sum: 0, count: 0 };
      hourBuckets[h].sum += val;
      hourBuckets[h].count++;
    }

    if (records.length < 500) {
      records.push({ id, datetime: row[1]?.toString() || "", value: val, kvarInd, kvarCap, fp, posto });
    }
  }

  const avgFp = fpSum / totalRegistros;

  // Calcular dias do período
  const dateStart = parseDatetime(dataInicial?.replace(" - ", " "));
  const dateEnd = parseDatetime(dataFinal?.replace(" - ", " "));
  const daysDiff = dateStart && dateEnd ? Math.ceil((dateEnd.getTime() - dateStart.getTime()) / 86400000) : 30;

  const curvaCarga: HourlySummary[] = Array.from({ length: 24 }, (_, h) => {
    const bucket = hourBuckets[h];
    const avg = bucket ? bucket.sum / bucket.count : 0;
    return {
      hour: h,
      avgKwh: Math.round(avg * 1000) / 1000,
      avgKw: Math.round(avg * 4 * 1000) / 1000, // 4 leituras por hora
      posto: h >= 18 && h < 21 ? "Ponta" : "Fora Ponta",
    };
  });

  return {
    cliente,
    medidor,
    pontoMedicao,
    dataInicial,
    dataFinal,
    totalRegistros,
    tipo,
    totalKwh: tipo === "consumo" ? Math.round(totalKwh * 1000) / 1000 : undefined,
    totalKvar: tipo === "consumo" ? Math.round(totalKvar * 1000) / 1000 : undefined,
    peakDemandKw: tipo === "demanda" ? Math.round(peakKw * 1000) / 1000 : undefined,
    avgPowerFactor: Math.round(avgFp * 100) / 100,
    consumoDiarioMedio: tipo === "consumo" ? Math.round((totalKwh / daysDiff) * 100) / 100 : 0,
    consumoPontaTotal: Math.round(pontaKwh * 1000) / 1000,
    consumoForaPontaTotal: Math.round(foraPontaKwh * 1000) / 1000,
    percentualPonta: totalKwh > 0 ? Math.round((pontaKwh / totalKwh) * 100) : 0,
    curvaCarga,
    records,
  };
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ success: false, error: "Nenhum arquivo enviado." }, { status: 400 });

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["xls", "xlsx", "csv"].includes(ext || "")) {
      return NextResponse.json({ success: false, error: "Formato suportado: XLS, XLSX, CSV." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Tenta parsear como CEMIG primeiro
    const cemigData = parseCemigExcel(buffer);
    if (cemigData) {
      return NextResponse.json({ success: true, format: "CEMIG", data: cemigData });
    }

    // Fallback: lê como tabela genérica
    const wb = XLSX.read(buffer, { type: "buffer" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
    return NextResponse.json({
      success: true,
      format: "GENERICO",
      data: {
        sheets: wb.SheetNames,
        preview: rows.slice(0, 20),
        totalRows: rows.length,
        message: "Formato não reconhecido automaticamente. Revise os dados e preencha manualmente os campos necessários.",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

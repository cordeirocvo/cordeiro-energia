"use client";
import { useState } from "react";
import { jsPDF } from "jspdf";

// ────────────────────────────────────────────────────────────
// TABELAS — NBR 14039:2005 + Guia Prysmian MT
// Cabos 8,7/15kV Cobre XLPE (CNEE/CNEE-CF) enterrados direto
// ────────────────────────────────────────────────────────────

// Ampacidades (A) para cabos MT 8.7/15kV — NBR 14039 Tab. 12/13
// Condições: solo 20°C, resistividade 1.0 K·m/W, profundidade 0.9m
const MT_AMPACITY_DIRECT_BURIED: Record<number, { cu_xlpe_1ph: number; cu_xlpe_3ph: number; al_xlpe_3ph: number }> = {
  35:  { cu_xlpe_1ph: 195, cu_xlpe_3ph: 163, al_xlpe_3ph: 128 },
  50:  { cu_xlpe_1ph: 230, cu_xlpe_3ph: 192, al_xlpe_3ph: 151 },
  70:  { cu_xlpe_1ph: 275, cu_xlpe_3ph: 230, al_xlpe_3ph: 181 },
  95:  { cu_xlpe_1ph: 320, cu_xlpe_3ph: 268, al_xlpe_3ph: 211 },
  120: { cu_xlpe_1ph: 361, cu_xlpe_3ph: 302, al_xlpe_3ph: 237 },
  150: { cu_xlpe_1ph: 405, cu_xlpe_3ph: 338, al_xlpe_3ph: 266 },
  185: { cu_xlpe_1ph: 454, cu_xlpe_3ph: 380, al_xlpe_3ph: 298 },
  240: { cu_xlpe_1ph: 524, cu_xlpe_3ph: 438, al_xlpe_3ph: 344 },
  300: { cu_xlpe_1ph: 592, cu_xlpe_3ph: 495, al_xlpe_3ph: 389 },
  400: { cu_xlpe_1ph: 685, cu_xlpe_3ph: 571, al_xlpe_3ph: 449 },
  500: { cu_xlpe_1ph: 773, cu_xlpe_3ph: 645, al_xlpe_3ph: 507 },
};

// Em eletroduto enterrado (reduzido)
const MT_AMPACITY_IN_DUCT: Record<number, { cu_xlpe_3ph: number; al_xlpe_3ph: number }> = {
  35:  { cu_xlpe_3ph: 128, al_xlpe_3ph: 101 },
  50:  { cu_xlpe_3ph: 150, al_xlpe_3ph: 118 },
  70:  { cu_xlpe_3ph: 180, al_xlpe_3ph: 142 },
  95:  { cu_xlpe_3ph: 210, al_xlpe_3ph: 165 },
  120: { cu_xlpe_3ph: 235, al_xlpe_3ph: 185 },
  150: { cu_xlpe_3ph: 262, al_xlpe_3ph: 207 },
  185: { cu_xlpe_3ph: 295, al_xlpe_3ph: 232 },
  240: { cu_xlpe_3ph: 338, al_xlpe_3ph: 266 },
  300: { cu_xlpe_3ph: 382, al_xlpe_3ph: 300 },
  400: { cu_xlpe_3ph: 440, al_xlpe_3ph: 346 },
  500: { cu_xlpe_3ph: 496, al_xlpe_3ph: 390 },
};

// Fatores de correção — temperatura do solo
const TEMP_CORR_SOIL: Record<number, number> = {
  10: 1.10, 15: 1.05, 20: 1.00, 25: 0.95, 30: 0.90, 35: 0.85, 40: 0.80,
};

// Fatores de correção — resistividade do solo
const RESISTIVITY_CORR: Record<number, number> = {
  0.7: 1.08, 1.0: 1.00, 1.5: 0.92, 2.0: 0.86, 2.5: 0.82, 3.0: 0.78,
};

// Impedância de sequência positiva Z1 (Ω/km) — NBR 14039 / Prysmian
const MT_IMPEDANCE: Record<number, { r1_cu: number; r1_al: number; x1: number }> = {
  35:  { r1_cu: 0.524, r1_al: 0.868, x1: 0.110 },
  50:  { r1_cu: 0.387, r1_al: 0.641, x1: 0.105 },
  70:  { r1_cu: 0.268, r1_al: 0.443, x1: 0.100 },
  95:  { r1_cu: 0.193, r1_al: 0.320, x1: 0.095 },
  120: { r1_cu: 0.153, r1_al: 0.253, x1: 0.092 },
  150: { r1_cu: 0.124, r1_al: 0.206, x1: 0.090 },
  185: { r1_cu: 0.099, r1_al: 0.164, x1: 0.087 },
  240: { r1_cu: 0.075, r1_al: 0.125, x1: 0.083 },
  300: { r1_cu: 0.060, r1_al: 0.100, x1: 0.081 },
  400: { r1_cu: 0.047, r1_al: 0.077, x1: 0.079 },
  500: { r1_cu: 0.037, r1_al: 0.060, x1: 0.077 },
};

// Corrente de curto de 1s — k = 226 (Cu/XLPE)
// S_min = Icc * sqrt(t) / k
const K_THERMAL_MT = { Cu_XLPE: 226, Al_XLPE: 148 };

// Fusíveis de MT (kA and A) e relés sugeridos
const MT_FUSE_RATINGS = [6.3, 10, 16, 25, 31.5, 40, 50, 63, 80, 100, 125, 160, 200];

// Transformadores típicos
const TRANSFORMER_DATA: Record<number, { ucc: number; losses_w: number }> = {
  30:  { ucc: 4.0, losses_w: 610  },
  45:  { ucc: 4.0, losses_w: 810  },
  75:  { ucc: 4.0, losses_w: 1150 },
  112: { ucc: 4.0, losses_w: 1550 },
  150: { ucc: 4.0, losses_w: 1900 },
  225: { ucc: 4.5, losses_w: 2800 },
  300: { ucc: 5.0, losses_w: 3400 },
  500: { ucc: 5.0, losses_w: 5100 },
  750: { ucc: 5.5, losses_w: 7000 },
  1000:{ ucc: 5.5, losses_w: 9500 },
  1500:{ ucc: 5.5, losses_w: 13500},
  2000:{ ucc: 6.0, losses_w: 17000},
};

const MT_SECTIONS = [35, 50, 70, 95, 120, 150, 185, 240, 300, 400, 500];

interface MTInput {
  power: number;           // kVA carga total
  voltage: number;         // kV (8.7/15 = sistema 15kV)
  system: "3F" | "1F";
  material: "Cu" | "Al";
  installation: "direct_buried" | "in_duct";
  length: number;          // m
  soilTemp: number;        // °C
  soilResistivity: number; // K·m/W
  powerFactor: number;
  transformerKVA: number;
  iccSupply: number;       // kA no ponto de entrega (concessionária)
  withTransformer: boolean;
  maxVoltageDrop: number;  // % (tipicamente 3 ou 5%)
  includeProtection: boolean;
}

interface MTResult {
  nominalCurrent: number;
  correctedAmpacity: number;
  sectionByLoading: number;
  sectionByVoltageDrop: number;
  sectionByThermal: number;
  recommendedSection: number;
  voltageDrop: number;
  voltageDropKV: number;
  iccAtLoad: number;
  iccAtLoadBT: number;
  protection: {
    fuseRating: number;
    relayType: string;
    ctRate: string;
    breakingCapacityKA: number;
  };
  warnings: string[];
}

function calcMT(input: MTInput): MTResult {
  const warnings: string[] = [];
  const Vn = input.voltage * 1000; // V
  const sqrt3 = Math.sqrt(3);

  // Corrente nominal
  const In = input.system === "3F"
    ? (input.power * 1000) / (sqrt3 * Vn * input.powerFactor)
    : (input.power * 1000) / (Vn * input.powerFactor);

  // Fator de correção
  const kt = TEMP_CORR_SOIL[input.soilTemp] ?? 1.0;
  const kr = RESISTIVITY_CORR[input.soilResistivity] ?? 1.0;
  const kTotal = kt * kr;

  const ampTable = input.installation === "direct_buried" ? MT_AMPACITY_DIRECT_BURIED : MT_AMPACITY_IN_DUCT;
  const colKey = input.material === "Cu"
    ? (input.installation === "direct_buried" ? "cu_xlpe_3ph" : "cu_xlpe_3ph")
    : "al_xlpe_3ph";

  // Seção pelo aquecimento
  let sectionByLoading = 0;
  for (const s of MT_SECTIONS) {
    const amp = (ampTable[s] as any)?.[colKey] ?? 0;
    if (amp * kTotal >= In) { sectionByLoading = s; break; }
  }

  // Seção pela queda de tensão
  const r1 = input.material === "Cu"
    ? MT_IMPEDANCE[95]?.r1_cu ?? 0.193  // default 95mm² — será recalculado
    : MT_IMPEDANCE[95]?.r1_al ?? 0.320;
  const x1 = MT_IMPEDANCE[95]?.x1 ?? 0.095;
  const sinPhi = Math.sqrt(1 - input.powerFactor ** 2);
  const maxDropV = (input.maxVoltageDrop / 100) * input.voltage * 1000;
  // ΔV ≈ √3 × I × L × (R·cosφ + X·sinφ) / 1000 (L em km)
  // Seção mín: S = ρ*L*I / (ΔV * algo) → usar resistividade
  const rhoAt20 = input.material === "Cu" ? 0.01786 : 0.02857; // Ω·mm²/m
  const dropFactor = input.system === "3F" ? sqrt3 : 2;
  const sectionForDrop = (dropFactor * rhoAt20 * input.length * In) / maxDropV;
  let sectionByVoltageDrop = MT_SECTIONS.find(s => s >= sectionForDrop) || 500;

  // Seção térmica — critério NBR 14039: Smin = Icc*sqrt(t)/k
  const iccPoint = input.iccSupply; // kA
  const k = input.material === "Cu" ? K_THERMAL_MT.Cu_XLPE : K_THERMAL_MT.Al_XLPE;
  const tRelay = 0.5; // s tempo de atuação estimado
  const sectionByThermalCont = (iccPoint * 1000 * Math.sqrt(tRelay)) / k;
  let sectionByThermal = MT_SECTIONS.find(s => s >= sectionByThermalCont) || 500;

  const recommendedSection = Math.max(sectionByLoading, sectionByVoltageDrop, sectionByThermal);

  // Queda de tensão real com seção recomendada
  const r1final = (MT_IMPEDANCE[recommendedSection] ?? MT_IMPEDANCE[240]);
  const R1 = (input.material === "Cu" ? r1final.r1_cu : r1final.r1_al) * (input.length / 1000);
  const X1 = r1final.x1 * (input.length / 1000);
  const dropV = dropFactor * In * (R1 * input.powerFactor + X1 * sinPhi);
  const dropPct = (dropV / (input.voltage * 1000)) * 100;

  // Corrente de curto no ponto (MT)
  const Ztrafo = input.withTransformer
    ? ((TRANSFORMER_DATA[input.transformerKVA]?.ucc ?? 5) / 100) * ((input.voltage * 1000) ** 2 / (input.transformerKVA * 1000))
    : 0;
  const Zcabo = Math.sqrt(R1 ** 2 + X1 ** 2);
  const Zcc = Math.sqrt((Zcabo + Ztrafo * 0.3) ** 2 + ((input.voltage * 1000 / (sqrt3 * input.iccSupply * 1000)) + Ztrafo * 0.95) ** 2);
  const iccAtLoad = (input.voltage * 1000 / sqrt3) / Zcc / 1000; // kA

  // Icc no lado BT do transformador
  const iccAtLoadBT = input.withTransformer
    ? (0.38 * 1000 / sqrt3) / (Ztrafo) / 1000
    : 0;

  // Proteção
  const fuseRating = MT_FUSE_RATINGS.find(f => f >= In * 1.5) || 200;
  const breakingCapKA = Math.max(8, Math.ceil(input.iccSupply));

  if (dropPct > input.maxVoltageDrop) warnings.push(`Queda de tensão ${dropPct.toFixed(2)}% excede o limite de ${input.maxVoltageDrop}%.`);
  if (sectionByThermal > sectionByLoading) warnings.push(`Seção mínima pelo critério térmico (${sectionByThermal}mm²) é maior que pelo aquecimento (${sectionByLoading}mm²).`);
  if (input.length > 3000) warnings.push("Comprimento >3km: considerar regulação de tensão no transformador ou regulador automático.");
  if (input.iccSupply > 16) warnings.push("Icc de suprimento >16kA: verificar poder de interrupção de disjuntores e fusíveis.");

  return {
    nominalCurrent: Math.round(In * 10) / 10,
    correctedAmpacity: Math.round((((ampTable[recommendedSection] as any)?.[colKey] ?? 0) * kTotal) * 10) / 10,
    sectionByLoading,
    sectionByVoltageDrop,
    sectionByThermal,
    recommendedSection,
    voltageDrop: Math.round(dropPct * 100) / 100,
    voltageDropKV: Math.round(dropV / 1000 * 100) / 100,
    iccAtLoad: Math.round(iccAtLoad * 100) / 100,
    iccAtLoadBT: Math.round(iccAtLoadBT * 100) / 100,
    protection: {
      fuseRating,
      relayType: In > 100 ? "Relé ANSI 50/51 + 50N/51N + 67/67N (direcional)" : "Relé ANSI 50/51 + 50N/51N",
      ctRate: `${Math.ceil(In / 5) * 5}/5 A`,
      breakingCapacityKA: breakingCapKA,
    },
    warnings,
  };
}

// ═══════════════════════════════════════════════════════════
export default function MediaTensaoPage() {
  const [input, setInput] = useState<MTInput>({
    power: 500, voltage: 15, system: "3F", material: "Cu",
    installation: "direct_buried", length: 500, soilTemp: 20,
    soilResistivity: 1.0, powerFactor: 0.92, transformerKVA: 500,
    iccSupply: 12, withTransformer: true, maxVoltageDrop: 3,
    includeProtection: true,
  });
  const [result, setResult] = useState<MTResult | null>(null);

  const up = (field: keyof MTInput, val: any) => setInput(p => ({ ...p, [field]: val }));

  const Sel = ({ label, field, opts }: { label: string; field: keyof MTInput; opts: { v: any; l: string }[] }) => (
    <div>
      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">{label}</label>
      <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500"
        value={(input as any)[field]} onChange={e => up(field, isNaN(+e.target.value) ? e.target.value : +e.target.value || e.target.value)}>
        {opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </div>
  );
  const Inp = ({ label, field, step = "1", ...rest }: { label: string; field: keyof MTInput; step?: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
    <div>
      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">{label}</label>
      <input type="number" step={step} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500"
        value={(input as any)[field]} onChange={e => up(field, +e.target.value)} {...rest} />
    </div>
  );

  const genPdf = () => {
    if (!result) return;
    const doc = new jsPDF();
    const blue: [number,number,number] = [26,58,107];
    doc.setFillColor(...blue); doc.rect(0,0,210,30,"F");
    doc.setTextColor(255,255,255); doc.setFontSize(16); doc.setFont("helvetica","bold");
    doc.text("CORDEIRO ENERGIA",14,13);
    doc.setFontSize(10); doc.text("Dimensionamento MT — NBR 14039 + Prysmian Guide",14,22);
    let y = 40; doc.setTextColor(50,50,50); doc.setFont("helvetica","normal"); doc.setFontSize(9);
    [
      ["Tensão", `${input.voltage} kV (sistema ${input.system})`],
      ["Potência", `${input.power} kVA — fp=${input.powerFactor}`],
      ["Comprimento", `${input.length} m`],
      ["Material", `${input.material} — ${input.installation === "direct_buried" ? "Enterrado direto" : "Eletroduto enterrado"}`],
      ["Corrente nominal", `${result.nominalCurrent} A`],
      ["Seção recomendada", `${result.recommendedSection} mm²`],
      ["Ampacidade corrigida", `${result.correctedAmpacity} A`],
      ["Queda de tensão", `${result.voltageDrop}%`],
      ["Icc no ponto MT", `${result.iccAtLoad} kA`],
      ...(input.withTransformer ? [["Icc no lado BT", `${result.iccAtLoadBT} kA`] as [string,string]] : []),
      ["Fusível MT", `${result.protection.fuseRating} A (kA int. ${result.protection.breakingCapacityKA})`],
      ["TC", result.protection.ctRate],
      ["Relé", result.protection.relayType],
    ].forEach(([k,v]) => { doc.text(`${k}:`,14,y); doc.setFont("helvetica","bold"); doc.text(v,90,y); doc.setFont("helvetica","normal"); y+=8; });
    if (result.warnings.length) {
      doc.setTextColor(200,100,0); y+=5;
      result.warnings.forEach(w => { doc.text(`⚠ ${w}`,14,y); y+=8; });
    }
    doc.setFontSize(7); doc.setTextColor(150,150,150);
    doc.text("ABNT NBR 14039:2005 | Guia Prysmian MT | Cordeiro Energia",14,290);
    doc.save(`mt-dimensionamento.pdf`);
  };

  const Row = ({ l, v, bold }: { l: string; v: string|number; bold?: boolean }) => (
    <div className={`flex justify-between py-1.5 border-b border-gray-100 text-sm ${bold ? "font-black text-red-700" : ""}`}>
      <span className="text-gray-600">{l}</span><span className="font-semibold">{v}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="bg-gradient-to-r from-red-800 to-red-900 text-white px-6 py-5 shadow-xl">
        <div className="max-w-6xl mx-auto flex justify-between items-center flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-black">🔌 Média Tensão — 8,7/15kV</h1>
            <p className="text-red-200 text-sm">NBR 14039:2005 + Guia Prysmian | Cabo, queda de tensão, curto-circuito, proteção</p>
          </div>
          <a href="/admin/portal" className="text-sm bg-white/15 hover:bg-white/25 px-4 py-2 rounded-lg font-semibold transition">← Portal</a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-5">
          <div className="bg-white rounded-2xl shadow border p-5">
            <h2 className="font-black text-sm text-gray-700 uppercase tracking-wider mb-4 border-b pb-2">⚙️ Dados do Sistema</h2>
            <div className="grid grid-cols-2 gap-3">
              <Sel label="Tensão Sistema (kV)" field="voltage" opts={[{v:13.8,l:"13,8 kV"},{v:15,l:"15 kV"},{v:25,l:"25 kV"},{v:34.5,l:"34,5 kV"}]} />
              <Sel label="Sistema" field="system" opts={[{v:"3F",l:"Trifásico (3F)"},{v:"1F",l:"Monofásico (1F)"}]} />
              <Inp label="Potência (kVA)" field="power" />
              <Inp label="Fator de Potência" field="powerFactor" step="0.01" min="0.5" max="1" />
              <Inp label="Comprimento (m)" field="length" />
              <Sel label="Material" field="material" opts={[{v:"Cu",l:"Cobre (Cu)"},{v:"Al",l:"Alumínio (Al)"}]} />
              <Sel label="Instalação" field="installation" opts={[{v:"direct_buried",l:"Enterrado Direto"},{v:"in_duct",l:"Eletroduto Enterrado"}]} />
              <Inp label="Temp. Solo (°C)" field="soilTemp" />
              <Sel label="Resist. Solo (K·m/W)" field="soilResistivity" opts={[{v:0.7,l:"0,7 (úmido)"},{v:1.0,l:"1,0 (padrão)"},{v:1.5,l:"1,5"},{v:2.0,l:"2,0"},{v:2.5,l:"2,5"},{v:3.0,l:"3,0 (seco)"}]} />
              <Inp label="Queda Máx. (%)" field="maxVoltageDrop" />
              <Inp label="Icc suprimento (kA)" field="iccSupply" step="0.5" />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow border p-5 space-y-3">
            <h2 className="font-black text-sm text-gray-700 uppercase tracking-wider border-b pb-2">🔧 Transformador + Proteção</h2>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={input.withTransformer} onChange={e => up("withTransformer", e.target.checked)} />
              Incluir transformador no projeto
            </label>
            {input.withTransformer && (
              <Sel label="Potência Trafo (kVA)" field="transformerKVA" opts={Object.keys(TRANSFORMER_DATA).map(t => ({ v: +t, l: t + " kVA" }))} />
            )}
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={input.includeProtection} onChange={e => up("includeProtection", e.target.checked)} />
              Dimensionar proteção (fusíveis, relés, TCs)
            </label>
          </div>

          <button onClick={() => setResult(calcMT(input))}
            className="w-full bg-red-700 text-white font-black py-4 rounded-2xl text-lg hover:bg-red-800 transition shadow-xl">
            🔌 Dimensionar Sistema MT
          </button>
        </div>

        <div className="space-y-5">
          {!result && (
            <div className="bg-white rounded-2xl border shadow p-12 text-center text-gray-400">
              <p className="text-5xl mb-4">🔌</p>
              <p className="font-bold">Configure e clique em "Dimensionar Sistema MT"</p>
            </div>
          )}
          {result && (
            <>
              <div className="bg-red-800 text-white rounded-2xl p-6 text-center shadow-xl">
                <p className="text-red-200 text-sm uppercase tracking-wider mb-1">Seção Recomendada</p>
                <p className="text-6xl font-black">{result.recommendedSection} mm²</p>
                <p className="text-red-200 mt-1">Cobre XLPE 8,7/15kV — CNEE-CF</p>
                <div className={`inline-block mt-3 px-4 py-1.5 rounded-full text-sm font-bold ${result.voltageDrop > input.maxVoltageDrop ? "bg-yellow-400 text-yellow-900" : "bg-green-400 text-green-900"}`}>
                  Queda de tensão: {result.voltageDrop}%
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow border p-5 space-y-1">
                <h3 className="font-black text-sm text-gray-700 uppercase tracking-wider border-b pb-2 mb-3">📐 Dimensionamento do Cabo</h3>
                <Row l="Corrente nominal" v={result.nominalCurrent + " A"} />
                <Row l="Seção pelo aquecimento" v={result.sectionByLoading + " mm²"} />
                <Row l="Seção pela queda de tensão" v={result.sectionByVoltageDrop + " mm²"} />
                <Row l="Seção pelo critério térmico" v={result.sectionByThermal + " mm²"} />
                <Row l="SEÇÃO ADOTADA" v={result.recommendedSection + " mm²"} bold />
                <Row l="Ampacidade corrigida" v={result.correctedAmpacity + " A"} />
                <Row l="Queda de tensão" v={result.voltageDrop + "% (" + result.voltageDropKV + " kV)"} />
              </div>

              <div className="bg-white rounded-2xl shadow border p-5 space-y-1">
                <h3 className="font-black text-sm text-gray-700 uppercase tracking-wider border-b pb-2 mb-3">💥 Corrente de Curto-Circuito</h3>
                <Row l="Icc no ponto MT" v={result.iccAtLoad + " kA"} bold />
                {input.withTransformer && <Row l="Icc no barramento BT" v={result.iccAtLoadBT + " kA"} />}
              </div>

              {input.includeProtection && (
                <div className="bg-white rounded-2xl shadow border p-5 space-y-1">
                  <h3 className="font-black text-sm text-gray-700 uppercase tracking-wider border-b pb-2 mb-3">🛡️ Proteção</h3>
                  <Row l="Fusível MT" v={result.protection.fuseRating + " A"} bold />
                  <Row l="Poder de interrupção mín." v={result.protection.breakingCapacityKA + " kA"} />
                  <Row l="TC (transformador de corrente)" v={result.protection.ctRate} />
                  <div className="bg-gray-50 rounded-xl p-3 mt-2">
                    <p className="text-xs font-bold text-gray-700">Relé de proteção sugerido:</p>
                    <p className="text-xs text-gray-600 mt-1">{result.protection.relayType}</p>
                  </div>
                </div>
              )}

              {result.warnings.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-300 rounded-2xl p-4 space-y-1">
                  {result.warnings.map((w, i) => <p key={i} className="text-sm text-yellow-700 font-semibold">⚠️ {w}</p>)}
                </div>
              )}

              <button onClick={genPdf}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-3 rounded-2xl shadow transition">
                📄 Gerar Relatório PDF
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

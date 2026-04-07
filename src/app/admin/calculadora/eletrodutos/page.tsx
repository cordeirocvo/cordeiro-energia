"use client";
import { useState } from "react";
import { jsPDF } from "jspdf";

// ─── TABELAS NORMATIVAS ──────────────────────────────────────
// Diâmetros externos aproximados de cabos (mm) por seção — NBR 5410 / NBR 16690
const CABLE_OD: Record<number, { pvc: number; xlpe: number; solar: number }> = {
  1.5:  { pvc: 7.2,  xlpe: 7.6,  solar: 0 },
  2.5:  { pvc: 8.1,  xlpe: 8.5,  solar: 0 },
  4:    { pvc: 8.8,  xlpe: 9.4,  solar: 7.4  },
  6:    { pvc: 9.8,  xlpe: 10.5, solar: 8.0  },
  10:   { pvc: 11.5, xlpe: 12.2, solar: 9.5  },
  16:   { pvc: 13.8, xlpe: 14.6, solar: 11.3 },
  25:   { pvc: 16.6, xlpe: 17.6, solar: 13.7 },
  35:   { pvc: 18.8, xlpe: 20.0, solar: 15.6 },
  50:   { pvc: 21.8, xlpe: 23.1, solar: 18.1 },
  70:   { pvc: 25.6, xlpe: 27.1, solar: 21.2 },
  95:   { pvc: 29.6, xlpe: 31.4, solar: 24.8 },
  120:  { pvc: 33.0, xlpe: 35.0, solar: 27.7 },
  150:  { pvc: 36.4, xlpe: 38.6, solar: 30.6 },
  185:  { pvc: 40.3, xlpe: 42.8, solar: 34.0 },
  240:  { pvc: 45.6, xlpe: 48.4, solar: 38.5 },
};

// Diâmetros internos (mm) dos eletrodutos — PVC, IMC, EMT
// NBR IEC 61386 / ABNT NBR 15465
const CONDUIT_ID: { dn: number; label: string; rigid_pvc: number; flex_corrugado: number; aco_imc: number }[] = [
  { dn: 16,  label: "DN 16",  rigid_pvc: 14.2, flex_corrugado: 12.8, aco_imc: 15.2 },
  { dn: 20,  label: "DN 20",  rigid_pvc: 17.8, flex_corrugado: 16.5, aco_imc: 19.3 },
  { dn: 25,  label: "DN 25",  rigid_pvc: 22.6, flex_corrugado: 21.2, aco_imc: 24.3 },
  { dn: 32,  label: "DN 32",  rigid_pvc: 29.2, flex_corrugado: 27.6, aco_imc: 31.2 },
  { dn: 40,  label: "DN 40",  rigid_pvc: 37.0, flex_corrugado: 35.5, aco_imc: 38.7 },
  { dn: 50,  label: "DN 50",  rigid_pvc: 47.0, flex_corrugado: 45.5, aco_imc: 49.3 },
  { dn: 63,  label: "DN 63",  rigid_pvc: 59.5, flex_corrugado: 57.8, aco_imc: 62.1 },
  { dn: 75,  label: "DN 75",  rigid_pvc: 71.0, flex_corrugado: 69.4, aco_imc: 73.5 },
  { dn: 90,  label: "DN 90",  rigid_pvc: 85.2, flex_corrugado: 83.6, aco_imc: 87.0 },
  { dn: 110, label: "DN 110", rigid_pvc: 105.0, flex_corrugado: 103.0, aco_imc: 106.4 },
  { dn: 125, label: "DN 125", rigid_pvc: 119.5, flex_corrugado: 117.2, aco_imc: 121.0 },
];

// Taxa de preenchimento máxima (NBR 5410 Tab. 45 / NEC Table 1)
const FILL_RATE: Record<number, number> = { 1: 0.53, 2: 0.31, 3: 0.40 };

type InsulationType = "pvc" | "xlpe" | "solar";
type ConduitMaterial = "rigid_pvc" | "flex_corrugado" | "aco_imc";
type CircuitType = "CA" | "CC";

interface ConductorLine {
  id: number;
  section: number;
  qty: number;
  insulation: InsulationType;
}

interface ConduitResult {
  totalFilledArea: number;   // mm²
  minConduitArea: number;    // mm²
  recommendedConduit: { dn: number; label: string; id: number; fillRate: number } | null;
  fillRateUsed: number;
  warnings: string[];
  conductors: { section: number; qty: number; od: number; area: number; totalArea: number }[];
}

function calcConduit(conductors: ConductorLine[], material: ConduitMaterial, circuitType: CircuitType): ConduitResult {
  const warnings: string[] = [];
  const n = conductors.reduce((s, c) => s + c.qty, 0);
  const fillRate = FILL_RATE[Math.min(n, 3)] ?? 0.40;

  const conductorDetails = conductors.map(c => {
    const od = CABLE_OD[c.section]?.[c.insulation] ?? 10;
    const area = Math.PI * (od / 2) ** 2;
    return { section: c.section, qty: c.qty, od, area, totalArea: area * c.qty };
  });

  const totalFilled = conductorDetails.reduce((s, c) => s + c.totalArea, 0);
  const minArea = totalFilled / fillRate;

  let recommended: ConduitResult["recommendedConduit"] = null;
  for (const c of CONDUIT_ID) {
    const id = c[material];
    const condArea = Math.PI * (id / 2) ** 2;
    if (condArea >= minArea) {
      recommended = { dn: c.dn, label: c.label, id, fillRate: totalFilled / condArea };
      break;
    }
  }

  if (!recommended) {
    warnings.push("A área total dos condutores excede o maior eletroduto disponível. Use eletrodutos em paralelo.");
  }

  // Alertas normativos
  if (circuitType === "CC") {
    warnings.push("NBR 16690: Para circuitos CC fotovoltaicos, usar eletroduto independente dos circuitos CA.");
    warnings.push("NBR 16612: Cabos solares UV-resistentes recomendados para instalação exposta.");
    if (conductors.some(c => c.insulation !== "solar")) {
      warnings.push("⚠️ Recomenda-se cabo solar (PV-ZZ-F/H1Z2Z2-K) para circuitos CC conforme IEC 62930.");
    }
  }
  if (n > 6) warnings.push("Mais de 6 condutores: aplicar fator de agrupamento conforme NBR 5410 Tab. 42.");

  return {
    totalFilledArea: Math.round(totalFilled * 10) / 10,
    minConduitArea: Math.round(minArea * 10) / 10,
    recommendedConduit: recommended,
    fillRateUsed: fillRate,
    warnings,
    conductors: conductorDetails,
  };
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════
export default function EletrodutosPage() {
  const [circuitType, setCircuitType] = useState<CircuitType>("CA");
  const [material, setMaterial] = useState<ConduitMaterial>("rigid_pvc");
  const [conductors, setConductors] = useState<ConductorLine[]>([
    { id: 1, section: 6, qty: 2, insulation: "pvc" },
    { id: 2, section: 6, qty: 1, insulation: "pvc" },
  ]);
  const [result, setResult] = useState<ConduitResult | null>(null);

  const sections = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240];

  const addLine = () => setConductors(p => [...p, { id: Date.now(), section: 2.5, qty: 1, insulation: circuitType === "CC" ? "solar" : "pvc" }]);
  const removeLine = (id: number) => setConductors(p => p.filter(c => c.id !== id));
  const updateLine = (id: number, field: keyof ConductorLine, val: any) =>
    setConductors(p => p.map(c => c.id === id ? { ...c, [field]: val } : c));

  const handleCalc = () => setResult(calcConduit(conductors, material, circuitType));

  const genPdf = () => {
    if (!result) return;
    const doc = new jsPDF();
    const blue: [number, number, number] = [26, 58, 107];
    doc.setFillColor(...blue);
    doc.rect(0, 0, 210, 30, "F");
    doc.setTextColor(255, 255, 255); doc.setFontSize(16); doc.setFont("helvetica", "bold");
    doc.text("CORDEIRO ENERGIA", 14, 13);
    doc.setFontSize(10);
    doc.text(`Dimensionamento de Eletrodutos — Circuito ${circuitType}`, 14, 22);
    doc.setTextColor(50, 50, 50); doc.setFont("helvetica", "normal"); doc.setFontSize(9);
    let y = 40;
    doc.text("CONDUTORES:", 14, y); y += 8;
    result.conductors.forEach(c => {
      doc.text(`${c.qty}x ${c.section}mm² — Ø${c.od}mm — Área: ${c.totalArea.toFixed(1)}mm²`, 16, y); y += 7;
    });
    y += 3;
    doc.text(`Área total preenchida: ${result.totalFilledArea} mm²`, 14, y); y += 7;
    doc.text(`Taxa de preenchimento: ${(result.fillRateUsed * 100).toFixed(0)}%`, 14, y); y += 7;
    doc.text(`Área mínima necessária: ${result.minConduitArea} mm²`, 14, y); y += 10;
    if (result.recommendedConduit) {
      doc.setFont("helvetica", "bold"); doc.setFontSize(11);
      doc.text(`ELETRODUTO: ${result.recommendedConduit.label} — Ø interno ${result.recommendedConduit.id}mm`, 14, y);
      doc.text(`Taxa de ocupação real: ${(result.recommendedConduit.fillRate * 100).toFixed(1)}%`, 14, y + 8);
      y += 18;
    }
    if (result.warnings.length) {
      doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(200, 100, 0);
      result.warnings.forEach(w => { doc.text(`⚠️ ${w}`, 14, y); y += 8; });
    }
    doc.save(`eletroduto-${circuitType.toLowerCase()}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white px-6 py-5 shadow-xl">
        <div className="max-w-5xl mx-auto flex justify-between items-center flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-black">🔩 Dimensionamento de Eletrodutos</h1>
            <p className="text-slate-300 text-sm">CA: NBR 5410 | CC: NBR 16690 + NBR 16612</p>
          </div>
          <a href="/admin/portal" className="text-sm bg-white/15 hover:bg-white/25 px-4 py-2 rounded-lg font-semibold transition">← Portal</a>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-5">
          {/* Tipo de circuito */}
          <div className="bg-white rounded-2xl shadow border p-5">
            <h2 className="font-black text-sm text-gray-700 uppercase tracking-wider mb-3">Tipo de Circuito</h2>
            <div className="grid grid-cols-2 gap-3">
              {(["CA", "CC"] as CircuitType[]).map(t => (
                <button key={t} onClick={() => { setCircuitType(t); if (t === "CC") setConductors(p => p.map(c => ({ ...c, insulation: "solar" }))); }}
                  className={`p-4 rounded-xl border-2 font-black transition ${circuitType === t ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                  {t === "CA" ? "⚡ Corrente Alternada" : "☀️ Corrente Contínua (DC)"}
                  <p className="text-xs font-normal mt-1 opacity-70">{t === "CA" ? "NBR 5410" : "NBR 16690 + 16612"}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Material do eletroduto */}
          <div className="bg-white rounded-2xl shadow border p-5">
            <h2 className="font-black text-sm text-gray-700 uppercase tracking-wider mb-3">Material do Eletroduto</h2>
            <div className="grid grid-cols-1 gap-2">
              {[
                { v: "rigid_pvc", l: "PVC Rígido", d: "ABNT NBR 15465 — uso interno/embutido" },
                { v: "flex_corrugado", l: "Corrugado Flexível", d: "NBR IEC 61386 — embutido em laje/parede" },
                { v: "aco_imc", l: "Aço IMC/EMT", d: "Uso industrial e externo" },
              ].map(m => (
                <button key={m.v} onClick={() => setMaterial(m.v as ConduitMaterial)}
                  className={`text-left p-3 rounded-xl border-2 transition ${material === m.v ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}>
                  <p className={`text-sm font-bold ${material === m.v ? "text-blue-700" : "text-gray-700"}`}>{m.l}</p>
                  <p className="text-xs text-gray-500">{m.d}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Condutores */}
          <div className="bg-white rounded-2xl shadow border p-5">
            <h2 className="font-black text-sm text-gray-700 uppercase tracking-wider mb-3">Condutores no Eletroduto</h2>
            <div className="space-y-2">
              {conductors.map(c => (
                <div key={c.id} className="flex gap-2 items-center bg-gray-50 rounded-xl p-3">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 font-bold uppercase block mb-1">Seção</label>
                    <select className="w-full border rounded-lg px-2 py-1.5 text-sm"
                      value={c.section} onChange={e => updateLine(c.id, "section", +e.target.value)}>
                      {sections.map(s => <option key={s} value={s}>{s} mm²</option>)}
                    </select>
                  </div>
                  <div className="w-16">
                    <label className="text-xs text-gray-500 font-bold uppercase block mb-1">Qtd</label>
                    <input type="number" min="1" max="10" className="w-full border rounded-lg px-2 py-1.5 text-sm text-center"
                      value={c.qty} onChange={e => updateLine(c.id, "qty", +e.target.value)} />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 font-bold uppercase block mb-1">Isolação</label>
                    <select className="w-full border rounded-lg px-2 py-1.5 text-sm"
                      value={c.insulation} onChange={e => updateLine(c.id, "insulation", e.target.value as InsulationType)}>
                      <option value="pvc">PVC 70°C</option>
                      <option value="xlpe">XLPE 90°C</option>
                      {circuitType === "CC" && <option value="solar">Cabo Solar (PV)</option>}
                    </select>
                  </div>
                  <button onClick={() => removeLine(c.id)} className="mt-4 text-red-400 hover:text-red-600 font-black text-lg">×</button>
                </div>
              ))}
            </div>
            <button onClick={addLine} className="mt-3 w-full border-2 border-dashed border-gray-300 hover:border-blue-400 text-gray-500 hover:text-blue-600 py-2 rounded-xl text-sm font-bold transition">
              + Adicionar Condutor
            </button>
          </div>

          <button onClick={handleCalc} className="w-full bg-slate-800 text-white font-black py-4 rounded-2xl text-lg hover:bg-slate-900 transition shadow-xl">
            🔩 Dimensionar Eletroduto
          </button>
        </div>

        {/* Resultado */}
        <div className="space-y-5">
          {!result && (
            <div className="bg-white rounded-2xl border shadow p-12 text-center text-gray-400">
              <p className="text-5xl mb-4">🔩</p>
              <p className="font-bold">Configure os condutores e clique em "Dimensionar Eletroduto"</p>
            </div>
          )}
          {result && (
            <>
              {result.recommendedConduit ? (
                <div className="bg-slate-800 rounded-2xl p-8 text-white text-center shadow-xl">
                  <p className="text-slate-400 text-sm uppercase tracking-wider mb-2">Eletroduto Recomendado</p>
                  <p className="text-5xl font-black text-white">{result.recommendedConduit.label}</p>
                  <p className="text-slate-300 mt-2">Ø interno {result.recommendedConduit.id} mm</p>
                  <div className={`inline-block mt-4 px-4 py-2 rounded-full font-bold text-sm ${result.recommendedConduit.fillRate > 0.38 ? "bg-yellow-500 text-white" : "bg-green-500 text-white"}`}>
                    Ocupação: {(result.recommendedConduit.fillRate * 100).toFixed(1)}% / {(result.fillRateUsed * 100).toFixed(0)}% máx.
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-300 rounded-2xl p-6 text-red-700 font-bold text-center">
                  ❌ Área excede o maior eletroduto padrão. Use dois eletrodutos em paralelo.
                </div>
              )}

              <div className="bg-white rounded-2xl shadow border p-5">
                <h3 className="font-black text-sm text-gray-700 uppercase tracking-wider mb-3 border-b pb-2">📐 Detalhamento</h3>
                <table className="w-full text-sm">
                  <thead><tr className="text-xs text-gray-500 uppercase border-b">
                    <th className="text-left py-1">Condutor</th>
                    <th className="text-right py-1">Qtd</th>
                    <th className="text-right py-1">Ø ext. (mm)</th>
                    <th className="text-right py-1">Área unit.</th>
                    <th className="text-right py-1">Área total</th>
                  </tr></thead>
                  <tbody>
                    {result.conductors.map((c, i) => (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="py-1.5 font-semibold">{c.section} mm²</td>
                        <td className="py-1.5 text-right">{c.qty}</td>
                        <td className="py-1.5 text-right">{c.od}</td>
                        <td className="py-1.5 text-right">{c.area.toFixed(1)}</td>
                        <td className="py-1.5 text-right font-bold">{c.totalArea.toFixed(1)}</td>
                      </tr>
                    ))}
                    <tr className="font-black text-blue-800 bg-blue-50">
                      <td colSpan={4} className="py-2 pl-2">TOTAL PREENCHIDO</td>
                      <td className="py-2 text-right pr-2">{result.totalFilledArea} mm²</td>
                    </tr>
                  </tbody>
                </table>
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Taxa fill usada</span>
                    <span className="font-bold">{(result.fillRateUsed * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Área mín. eletroduto</span>
                    <span className="font-bold">{result.minConduitArea.toFixed(1)} mm²</span>
                  </div>
                </div>
              </div>

              {result.warnings.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-300 rounded-2xl p-4 space-y-2">
                  <p className="font-black text-yellow-800 text-sm">⚠️ Alertas Normativos</p>
                  {result.warnings.map((w, i) => <p key={i} className="text-sm text-yellow-700">• {w}</p>)}
                </div>
              )}

              <button onClick={genPdf}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-3 rounded-2xl transition shadow">
                📄 Gerar Relatório PDF
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";
import { useState, useRef } from "react";
import { jsPDF } from "jspdf";
import { INVERTERS, BATTERIES, suggestSystem, type Battery, type Inverter } from "@/lib/equipment-db";
import { CRESESB_HSP } from "@/lib/cresesb-data";

// ─── TYPES ────────────────────────────────────────────────
interface ConsumptionData {
  totalKwh: number;
  dailyAvgKwh: number;
  peakKw: number;
  pontaKwh: number;
  foraPontaKwh: number;
  tarifaMedia: number;
  tarifaPonta: number;
  tarifaFP: number;
  tarifaDemanda: number;
  demandaContratadaKw: number;
  cliente: string;
  contrato: string;
  mesRef: string;
  phases: 1 | 3;
}

interface BESSResult {
  usefulCapacityKwh: number;
  nominalCapacityKwh: number;
  peakPowerKw: number;
  suggestedSystems: { inverter: Inverter; battery: Battery; units: number; totalCapacityKwh: number }[];
  selectedResult?: {
    inverter: Inverter;
    battery: Battery;
    units: number;
    totalCapacityKwh: number;
    monthlySavingsR$: number;
    investimentoR$: number;
    paybackYears: number;
    co2Avoided: number;
  };
}

interface SolarBessResult {
  pvPowerKwp: number;
  numModules: number;
  seriesModules: number;
  parallelStrings: number;
  monthlyGenKwh: number;
  monthlySavingsSolarR$: number;
  monthlySavingsBessR$: number;
  totalMonthlySavingsR$: number;
  totalInvestimentoR$: number;
  paybackYears: number;
}

// ─── HELPER ────────────────────────────────────────────────
function Badge({ text, color }: { text: string; color: "green" | "blue" | "orange" | "red" | "gray" }) {
  const cls = {
    green: "bg-green-100 text-green-800 border-green-300",
    blue: "bg-blue-100 text-blue-800 border-blue-300",
    orange: "bg-orange-100 text-orange-800 border-orange-300",
    red: "bg-red-100 text-red-800 border-red-300",
    gray: "bg-gray-100 text-gray-700 border-gray-300",
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${cls[color]}`}>{text}</span>;
}
function Row({ label, value, unit, bold }: { label: string; value: string | number; unit?: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between items-center py-1.5 border-b border-gray-100 last:border-0 ${bold ? "font-bold text-blue-800" : ""}`}>
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-semibold">{value}{unit && <span className="text-gray-400 text-xs ml-1">{unit}</span>}</span>
    </div>
  );
}
function Input(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, ...rest } = props;
  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">{label}</label>
      <input {...rest} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
    </div>
  );
}

// ─── PDF GENERATOR ─────────────────────────────────────────
function generateBESSReport(consumption: ConsumptionData, bessResult: BESSResult, solarResult?: SolarBessResult, selectedIdx?: number) {
  const doc = new jsPDF();
  const blue: [number, number, number] = [26, 58, 107];
  const orange: [number, number, number] = [249, 115, 22];
  const selected = bessResult.suggestedSystems[selectedIdx ?? 0];

  // Header
  doc.setFillColor(...blue);
  doc.rect(0, 0, 210, 35, "F");
  doc.setFillColor(...orange);
  doc.rect(0, 33, 210, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18); doc.setFont("helvetica", "bold");
  doc.text("CORDEIRO ENERGIA", 14, 14);
  doc.setFontSize(11);
  doc.text("Proposta Técnica — Sistema BESS + Fotovoltaico", 14, 24);
  doc.setFontSize(8);
  doc.text(`Emitido em: ${new Date().toLocaleString("pt-BR")}`, 140, 30);

  let y = 45;
  const addSection = (title: string) => {
    doc.setFillColor(240, 244, 255);
    doc.rect(14, y - 4, 182, 8, "F");
    doc.setTextColor(...blue); doc.setFont("helvetica", "bold"); doc.setFontSize(10);
    doc.text(title, 16, y + 1); y += 10;
    doc.setFont("helvetica", "normal"); doc.setTextColor(50, 50, 50); doc.setFontSize(9);
  };
  const addRow = (label: string, value: string) => {
    doc.text(`${label}:`, 16, y); doc.setFont("helvetica", "bold");
    doc.text(value, 90, y); doc.setFont("helvetica", "normal"); y += 7;
    if (y > 275) { doc.addPage(); y = 20; }
  };

  addSection("1. DADOS DO CLIENTE");
  addRow("Cliente", consumption.cliente || "—");
  addRow("Contrato / Instalação", consumption.contrato || "—");
  addRow("Referência", consumption.mesRef || "—");
  y += 3;

  addSection("2. LEVANTAMENTO DE CONSUMO");
  addRow("Consumo Total", `${consumption.totalKwh} kWh`);
  addRow("Consumo Médio Diário", `${consumption.dailyAvgKwh.toFixed(2)} kWh/dia`);
  addRow("Consumo Horário de Ponta", `${consumption.pontaKwh.toFixed(2)} kWh`);
  addRow("Consumo Fora de Ponta", `${consumption.foraPontaKwh.toFixed(2)} kWh`);
  addRow("Demanda de Pico", `${consumption.peakKw.toFixed(2)} kW`);
  addRow("Demanda Contratada", `${consumption.demandaContratadaKw.toFixed(2)} kW`);
  addRow("Tarifa Média", `R$ ${consumption.tarifaMedia.toFixed(4)}/kWh`);
  addRow("Tarifa Ponta", `R$ ${consumption.tarifaPonta.toFixed(4)}/kWh`);
  addRow("Tarifa Fora Ponta", `R$ ${consumption.tarifaFP.toFixed(4)}/kWh`);
  y += 3;

  addSection("3. DIMENSIONAMENTO DO SISTEMA BESS");
  addRow("Capacidade Útil Necessária", `${bessResult.usefulCapacityKwh.toFixed(2)} kWh`);
  addRow("Capacidade Nominal Projetada", `${bessResult.nominalCapacityKwh.toFixed(2)} kWh`);
  addRow("Potência de Pico Necessária", `${bessResult.peakPowerKw.toFixed(2)} kW`);
  y += 3;

  if (selected) {
    addSection("4. EQUIPAMENTOS SUGERIDOS");
    addRow("Inversor Híbrido", `${selected.inverter.brand} ${selected.inverter.model}`);
    addRow("Potência do Inversor", `${selected.inverter.powerKw} kW AC`);
    addRow("Bateria", `${selected.battery.brand} ${selected.battery.model}`);
    addRow("Capacidade por Unidade", `${selected.battery.capacityKwh} kWh`);
    addRow("Quantidade de Baterias", `${selected.units} unidade(s)`);
    addRow("Capacidade Total Instalada", `${selected.totalCapacityKwh.toFixed(2)} kWh`);
    addRow("Química da Bateria", selected.battery.chemistry);
    addRow("Eficiência de Ciclo", `${selected.battery.roundtripEfficiency}%`);
    addRow("Garantia Bateria", `${selected.battery.warranty_years} anos`);
    y += 3;

    const savings = selected.battery.capacityKwh * selected.units * consumption.tarifaPonta * 30;
    const invest = (selected.inverter.priceEstBrl || 0) + selected.units * (selected.battery.priceEstBrl || 0);
    const payback = invest > 0 && savings > 0 ? invest / (savings * 12) : 0;
    addSection("5. ANÁLISE ECONÔMICA (ESTIMATIVA)");
    addRow("Economia Mensal Estimada", `R$ ${savings.toFixed(2)}`);
    addRow("Investimento Total Estimado", `R$ ${invest.toLocaleString("pt-BR")}`);
    addRow("Payback Simples Estimado", `${payback.toFixed(1)} anos`);
  }

  if (solarResult) {
    y += 3;
    addSection("6. SISTEMA FOTOVOLTAICO COMPLEMENTAR");
    addRow("Potência FV Instalada", `${solarResult.pvPowerKwp.toFixed(2)} kWp`);
    addRow("Número de Módulos", `${solarResult.numModules} módulos`);
    addRow("Configuração String", `${solarResult.seriesModules}S × ${solarResult.parallelStrings}P`);
    addRow("Geração Mensal Estimada", `${solarResult.monthlyGenKwh.toFixed(0)} kWh/mês`);
    addRow("Economia Solar Mensal", `R$ ${solarResult.monthlySavingsSolarR$.toFixed(2)}`);
    addRow("Economia BESS Mensal", `R$ ${solarResult.monthlySavingsBessR$.toFixed(2)}`);
    addRow("Economia TOTAL Mensal", `R$ ${solarResult.totalMonthlySavingsR$.toFixed(2)}`);
    addRow("Investimento Total", `R$ ${solarResult.totalInvestimentoR$.toLocaleString("pt-BR")}`);
    addRow("Payback Combinado", `${solarResult.paybackYears.toFixed(1)} anos`);
  }

  // Footer
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFontSize(7); doc.setTextColor(180, 180, 180);
    doc.text("Cordeiro Energia • Proposta Técnica Confidencial • Valores estimados sujeitos a aprovação", 14, 290);
    doc.text(`Pág ${p}/${pages}`, 192, 290);
  }
  doc.save(`proposta-bess-${(consumption.cliente || "cliente").toLowerCase().replace(/\s+/g, "-")}.pdf`);
}

// ═══════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════
export default function BESSPage() {
  const [inputMode, setInputMode] = useState<"upload-xls" | "upload-pdf" | "manual">("manual");
  const [parsing, setParsing] = useState(false);
  const [parseMsg, setParseMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Dados de consumo
  const [consumption, setConsumption] = useState<ConsumptionData>({
    totalKwh: 350,
    dailyAvgKwh: 11.67,
    peakKw: 5.5,
    pontaKwh: 52.5,
    foraPontaKwh: 297.5,
    tarifaMedia: 0.8876,
    tarifaPonta: 1.3214,
    tarifaFP: 0.7831,
    tarifaDemanda: 18.5,
    demandaContratadaKw: 5.0,
    cliente: "",
    contrato: "",
    mesRef: "",
    phases: 1,
  });

  // BESS config
  const [dod, setDod] = useState(90);
  const [autonomyHours, setAutonomyHours] = useState(3);
  const [peakHours, setPeakHours] = useState(3);
  const [bessResult, setBessResult] = useState<BESSResult | null>(null);
  const [selectedSystemIdx, setSelectedSystemIdx] = useState(0);
  const [customBattery, setCustomBattery] = useState<Partial<Battery>>({});
  const [useCustomBattery, setUseCustomBattery] = useState(false);

  // Solar config
  const [calcSolar, setCalcSolar] = useState(true);
  const [modulePower, setModulePower] = useState(550);
  const [solarCity, setSolarCity] = useState("São Paulo-SP");
  const [hspManual, setHspManual] = useState<number | null>(null);
  const [solarResult, setSolarResult] = useState<SolarBessResult | null>(null);
  const [pvPrice, setPvPrice] = useState(3800); // R$/kWp instalado

  // ── Calcular BESS ─────────────────────────────────────────
  const handleCalcBESS = () => {
    const pontaKwh = consumption.pontaKwh || (consumption.totalKwh * 0.15);
    const peakKw = consumption.peakKw || (consumption.totalKwh / 30 / 6);
    const useful = pontaKwh * (autonomyHours / peakHours);
    const nominal = useful / (dod / 100);
    const power = peakKw * 1.25;

    let suggestions = suggestSystem(power, nominal, consumption.phases);

    if (useCustomBattery && customBattery.capacityKwh) {
      const unitsNeeded = Math.ceil(nominal / (customBattery.capacityKwh * (dod / 100)));
      suggestions = [{
        inverter: INVERTERS.find(i => i.phases === consumption.phases) || INVERTERS[0],
        battery: { ...BATTERIES.find(b => b.id === "custom-manual")!, ...customBattery } as Battery,
        units: unitsNeeded,
        totalCapacityKwh: unitsNeeded * (customBattery.capacityKwh || 5),
      }];
    }

    setBessResult({ usefulCapacityKwh: useful, nominalCapacityKwh: nominal, peakPowerKw: power, suggestedSystems: suggestions });
    setSelectedSystemIdx(0);

    // Calcular solar também se ativado
    if (calcSolar) {
      const hsp = hspManual || CRESESB_HSP[solarCity] || 4.55;
      const dailyNeed = consumption.totalKwh / 30;
      const pvKwp = (dailyNeed / hsp) / 0.8;
      const monthlyGen = pvKwp * hsp * 30 * 0.8;
      const savingsSolar = monthlyGen * consumption.tarifaMedia;
      const savingsBess = pontaKwh * (consumption.tarifaPonta - consumption.tarifaFP);
      const totalSavings = savingsSolar + savingsBess;
      const pvInvest = pvKwp * pvPrice;
      const bessInvest = suggestions[0]
        ? (suggestions[0].inverter.priceEstBrl || 0) + suggestions[0].units * (suggestions[0].battery.priceEstBrl || 0)
        : 0;
      const totalInvest = pvInvest + bessInvest;
      const payback = totalSavings > 0 ? totalInvest / totalSavings / 12 : 0;
      const numMod = Math.ceil((pvKwp * 1000) / modulePower);
      setSolarResult({
        pvPowerKwp: Math.round(pvKwp * 100) / 100,
        numModules: numMod,
        seriesModules: Math.ceil(400 / 42),
        parallelStrings: Math.ceil(numMod / Math.ceil(400 / 42)),
        monthlyGenKwh: Math.round(monthlyGen),
        monthlySavingsSolarR$: Math.round(savingsSolar * 100) / 100,
        monthlySavingsBessR$: Math.round(savingsBess * 100) / 100,
        totalMonthlySavingsR$: Math.round(totalSavings * 100) / 100,
        totalInvestimentoR$: Math.round(totalInvest),
        paybackYears: Math.round(payback * 10) / 10,
      });
    }
  };

  // ── Upload de arquivo ──────────────────────────────────────
  const handleUpload = async (mode: "xls" | "pdf") => {
    const f = fileRef.current?.files?.[0];
    if (!f) return;
    setParsing(true);
    setParseMsg("Analisando arquivo...");
    try {
      const fd = new FormData();
      fd.append("file", f);
      const res = await fetch(mode === "xls" ? "/api/parse-excel" : "/api/parse-pdf", { method: "POST", body: fd });
      const json = await res.json();
      if (!json.success) { setParseMsg("Erro: " + json.error); return; }

      if (mode === "xls") {
        const d = json.data;
        setConsumption(prev => ({
          ...prev,
          totalKwh: d.totalKwh || prev.totalKwh,
          dailyAvgKwh: d.consumoDiarioMedio || prev.dailyAvgKwh,
          peakKw: d.peakDemandKw || prev.peakKw,
          pontaKwh: d.consumoPontaTotal || prev.pontaKwh,
          foraPontaKwh: d.consumoForaPontaTotal || prev.foraPontaKwh,
          cliente: d.cliente || prev.cliente,
          contrato: d.pontoMedicao || prev.contrato,
        }));
        setParseMsg(`✅ Lido: ${d.totalRegistros} registros | ${d.totalKwh ?? d.peakDemandKw} kWh/kW total`);
      } else {
        const d = json.data;
        setConsumption(prev => ({
          ...prev,
          totalKwh: d.consumoKwhTotal || prev.totalKwh,
          dailyAvgKwh: (d.consumoKwhTotal || prev.totalKwh) / 30,
          peakKw: d.demandaKw || prev.peakKw,
          pontaKwh: d.consumoKwhPonta || prev.pontaKwh,
          foraPontaKwh: d.consumoKwhForaPonta || prev.foraPontaKwh,
          tarifaMedia: d.tarifaMedia || prev.tarifaMedia,
          tarifaPonta: d.tarifaPonta || prev.tarifaPonta,
          tarifaFP: d.tarifaForaPonta || prev.tarifaFP,
          demandaContratadaKw: d.demandaContratadaKw || prev.demandaContratadaKw,
          cliente: d.cliente || prev.cliente,
          mesRef: d.mesReferencia || prev.mesRef,
          contrato: d.contrato || prev.contrato,
        }));
        setParseMsg(`✅ Fatura ${json.format}: ${d.fieldsManual?.length ? `⚠️ Preencha: ${d.fieldsManual.join(", ")}` : "Todos os campos extraídos"}`);
      }
    } catch { setParseMsg("Erro ao enviar arquivo."); }
    finally { setParsing(false); }
  };

  const selected = bessResult?.suggestedSystems?.[selectedSystemIdx];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white px-6 py-5 shadow-xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-black">☀️🔋 Fotovoltaico + BESS</h1>
            <p className="text-blue-200 text-sm">Dimensionamento solar com armazenamento | Análise de viabilidade econômica</p>
          </div>
          <div className="flex gap-2">
            <a href="/admin/portal" className="text-sm bg-white/15 hover:bg-white/25 text-white px-4 py-2 rounded-lg font-semibold transition">← Portal</a>
            <a href="/admin/calculadora" className="text-sm bg-white/15 hover:bg-white/25 text-white px-4 py-2 rounded-lg font-semibold transition">⚡ Calculadora</a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* ── COL 1: Entrada de Dados ── */}
        <div className="xl:col-span-1 space-y-4">
          {/* Modo de entrada */}
          <div className="bg-white rounded-2xl shadow border p-5">
            <h2 className="font-black text-gray-700 mb-3 text-sm uppercase tracking-wider">📥 Origem dos Dados</h2>
            <div className="flex flex-col gap-2">
              {[
                { id: "upload-xls", label: "📊 Memória de Massa CEMIG (XLS)", desc: "Leitura automática do arquivo CEMIG" },
                { id: "upload-pdf", label: "📄 Fatura de Energia (PDF)", desc: "Extração automática de dados da conta" },
                { id: "manual", label: "✏️ Entrada Manual", desc: "Preencher todos os dados manualmente" },
              ].map(m => (
                <button key={m.id} onClick={() => setInputMode(m.id as any)}
                  className={`text-left p-3 rounded-xl border-2 transition ${inputMode === m.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}>
                  <p className={`text-sm font-bold ${inputMode === m.id ? "text-blue-700" : "text-gray-700"}`}>{m.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{m.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Upload */}
          {(inputMode === "upload-xls" || inputMode === "upload-pdf") && (
            <div className="bg-white rounded-2xl shadow border p-5 space-y-3">
              <h2 className="font-black text-sm text-gray-700 uppercase tracking-wider">📁 Enviar Arquivo</h2>
              <input ref={fileRef} type="file"
                accept={inputMode === "upload-xls" ? ".xls,.xlsx,.csv" : ".pdf"}
                className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:font-bold hover:file:bg-blue-700 cursor-pointer" />
              <button onClick={() => handleUpload(inputMode === "upload-xls" ? "xls" : "pdf")}
                disabled={parsing}
                className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-xl text-sm hover:bg-blue-700 transition disabled:opacity-50">
                {parsing ? "Analisando..." : "📤 Enviar e Analisar"}
              </button>
              {parseMsg && (
                <p className={`text-xs font-semibold p-2 rounded-lg ${parseMsg.startsWith("✅") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{parseMsg}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">Campos não extraídos automaticamente devem ser preenchidos abaixo.</p>
            </div>
          )}

          {/* Dados de consumo */}
          <div className="bg-white rounded-2xl shadow border p-5 space-y-3">
            <h2 className="font-black text-sm text-gray-700 uppercase tracking-wider">⚡ Dados de Consumo</h2>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Cliente" value={consumption.cliente} onChange={e => setConsumption(p => ({ ...p, cliente: e.target.value }))} />
              <Input label="Contrato" value={consumption.contrato} onChange={e => setConsumption(p => ({ ...p, contrato: e.target.value }))} />
              <Input label="Mês Referência" value={consumption.mesRef} onChange={e => setConsumption(p => ({ ...p, mesRef: e.target.value }))} />
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Fases</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  value={consumption.phases} onChange={e => setConsumption(p => ({ ...p, phases: +e.target.value as 1 | 3 }))}>
                  <option value={1}>Monofásico</option>
                  <option value={3}>Trifásico</option>
                </select>
              </div>
              <Input label="Consumo Total (kWh/mês)" type="number" value={consumption.totalKwh} onChange={e => setConsumption(p => ({ ...p, totalKwh: +e.target.value, dailyAvgKwh: +e.target.value / 30 }))} />
              <Input label="Demanda de Pico (kW)" type="number" step="0.1" value={consumption.peakKw} onChange={e => setConsumption(p => ({ ...p, peakKw: +e.target.value }))} />
              <Input label="Consumo Ponta (kWh)" type="number" step="0.01" value={consumption.pontaKwh} onChange={e => setConsumption(p => ({ ...p, pontaKwh: +e.target.value }))} />
              <Input label="Consumo Fora Ponta (kWh)" type="number" step="0.01" value={consumption.foraPontaKwh} onChange={e => setConsumption(p => ({ ...p, foraPontaKwh: +e.target.value }))} />
              <Input label="Tarifa Média (R$/kWh)" type="number" step="0.0001" value={consumption.tarifaMedia} onChange={e => setConsumption(p => ({ ...p, tarifaMedia: +e.target.value }))} />
              <Input label="Tarifa Ponta (R$/kWh)" type="number" step="0.0001" value={consumption.tarifaPonta} onChange={e => setConsumption(p => ({ ...p, tarifaPonta: +e.target.value }))} />
              <Input label="Tarifa FP (R$/kWh)" type="number" step="0.0001" value={consumption.tarifaFP} onChange={e => setConsumption(p => ({ ...p, tarifaFP: +e.target.value }))} />
              <Input label="Dem. Contratada (kW)" type="number" step="0.5" value={consumption.demandaContratadaKw} onChange={e => setConsumption(p => ({ ...p, demandaContratadaKw: +e.target.value }))} />
              <Input label="Tarifa Dem. (R$/kW)" type="number" step="0.01" value={consumption.tarifaDemanda} onChange={e => setConsumption(p => ({ ...p, tarifaDemanda: +e.target.value }))} />
            </div>
          </div>

          {/* BESS Config */}
          <div className="bg-white rounded-2xl shadow border p-5 space-y-3">
            <h2 className="font-black text-sm text-gray-700 uppercase tracking-wider">🔋 Parâmetros BESS</h2>
            <div className="grid grid-cols-2 gap-3">
              <Input label="DoD máximo (%)" type="number" min="50" max="100" value={dod} onChange={e => setDod(+e.target.value)} />
              <Input label="Autonomia desejada (h)" type="number" min="1" max="12" value={autonomyHours} onChange={e => setAutonomyHours(+e.target.value)} />
              <Input label="Horas de ponta (h)" type="number" min="1" max="6" value={peakHours} onChange={e => setPeakHours(+e.target.value)} />
            </div>
            <label className="flex items-center gap-2 text-sm select-none cursor-pointer">
              <input type="checkbox" checked={useCustomBattery} onChange={e => setUseCustomBattery(e.target.checked)} />
              Usar bateria personalizada (manual)
            </label>
            {useCustomBattery && (
              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-xl">
                {[
                  ["Marca", "brand", "text"], ["Modelo", "model", "text"],
                  ["Cap. (kWh)", "capacityKwh", "number"], ["FP (%)", "roundtripEfficiency", "number"],
                  ["Preço (R$)", "priceEstBrl", "number"],
                ].map(([label, key, type]) => (
                  <Input key={String(key)} label={String(label)} type={String(type)}
                    value={(customBattery as any)[key as string] || ""}
                    onChange={e => setCustomBattery(p => ({ ...p, [key as string]: type === "number" ? +e.target.value : e.target.value }))} />
                ))}
              </div>
            )}
          </div>

          {/* Solar Config */}
          <div className="bg-white rounded-2xl shadow border p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-black text-sm text-gray-700 uppercase tracking-wider">☀️ Dimensionamento Solar</h2>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={calcSolar} onChange={e => setCalcSolar(e.target.checked)} />
                Incluir
              </label>
            </div>
            {calcSolar && (
              <div className="grid grid-cols-2 gap-3">
                <Input label="Módulo (Wp)" type="number" value={modulePower} onChange={e => setModulePower(+e.target.value)} />
                <Input label="Preço instalação (R$/kWp)" type="number" value={pvPrice} onChange={e => setPvPrice(+e.target.value)} />
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Cidade (CRESESB)</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    value={solarCity} onChange={e => setSolarCity(e.target.value)}>
                    {Object.entries(CRESESB_HSP).map(([city, hsp]) => (
                      <option key={city} value={city}>{city} — HSP {hsp}</option>
                    ))}
                  </select>
                </div>
                <Input label="HSP Manual (opcional)" type="number" step="0.1" placeholder="Deixe vazio para usar CRESESB"
                  value={hspManual || ""} onChange={e => setHspManual(e.target.value ? +e.target.value : null)} />
              </div>
            )}
          </div>

          <button onClick={handleCalcBESS}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black py-4 rounded-2xl text-lg hover:from-orange-600 hover:to-orange-700 transition shadow-xl">
            🔋 Dimensionar Sistema
          </button>
        </div>

        {/* ── COL 2-3: Resultados ── */}
        <div className="xl:col-span-2 space-y-5">
          {!bessResult && (
            <div className="bg-white rounded-2xl border shadow p-12 text-center text-gray-400">
              <p className="text-5xl mb-4">🔋☀️</p>
              <p className="font-bold text-lg">Preencha os dados e clique em "Dimensionar Sistema"</p>
              <p className="text-sm mt-2">O sistema irá calcular o BESS necessário, sugerir equipamentos compatíveis e gerar a proposta técnica.</p>
            </div>
          )}

          {bessResult && (
            <>
              {/* BESS Resumo */}
              <div className="bg-white rounded-2xl shadow border p-6">
                <h3 className="font-black text-gray-700 mb-4 text-sm uppercase tracking-wider border-b pb-2">📐 Dimensionamento BESS</h3>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {[
                    { label: "Capacidade Útil", value: bessResult.usefulCapacityKwh.toFixed(2), unit: "kWh", color: "blue" },
                    { label: "Capacidade Nominal", value: bessResult.nominalCapacityKwh.toFixed(2), unit: "kWh", color: "orange" },
                    { label: "Potência de Pico", value: bessResult.peakPowerKw.toFixed(2), unit: "kW", color: "green" },
                  ].map(m => (
                    <div key={m.label} className={`rounded-xl p-4 text-center ${m.color === "blue" ? "bg-blue-50" : m.color === "orange" ? "bg-orange-50" : "bg-green-50"}`}>
                      <p className={`text-2xl font-black ${m.color === "blue" ? "text-blue-700" : m.color === "orange" ? "text-orange-600" : "text-green-700"}`}>{m.value}</p>
                      <p className="text-xs text-gray-500 font-semibold">{m.unit}</p>
                      <p className="text-xs text-gray-600 mt-1">{m.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sistemas sugeridos */}
              {bessResult.suggestedSystems.length > 0 ? (
                <div className="bg-white rounded-2xl shadow border p-6">
                  <h3 className="font-black text-gray-700 mb-4 text-sm uppercase tracking-wider border-b pb-2">
                    ⚙️ Sistemas Compatíveis Sugeridos ({bessResult.suggestedSystems.length})
                  </h3>
                  <div className="space-y-3">
                    {bessResult.suggestedSystems.slice(0, 5).map((sys, idx) => {
                      const savings = sys.battery.capacityKwh * sys.units * (consumption.tarifaPonta - consumption.tarifaFP) * 30;
                      const invest = (sys.inverter.priceEstBrl || 0) + sys.units * (sys.battery.priceEstBrl || 0);
                      const pb = savings > 0 ? invest / (savings * 12) : 0;
                      return (
                        <div key={idx} onClick={() => setSelectedSystemIdx(idx)}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition ${selectedSystemIdx === idx ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300"}`}>
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-bold text-gray-800 text-sm">{sys.inverter.brand} {sys.inverter.model}</p>
                              <p className="text-xs text-gray-500">+ {sys.units}× {sys.battery.brand} {sys.battery.model}</p>
                              <div className="flex gap-2 mt-2 flex-wrap">
                                <Badge text={`${sys.inverter.powerKw} kW`} color="blue" />
                                <Badge text={`${sys.totalCapacityKwh.toFixed(1)} kWh`} color="green" />
                                <Badge text={sys.battery.chemistry} color="gray" />
                                <Badge text={`${sys.inverter.phases}F`} color="orange" />
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500">Investimento est.</p>
                              <p className="font-black text-blue-700">R$ {invest.toLocaleString("pt-BR")}</p>
                              <p className="text-xs text-green-600 font-bold">Payback ~{pb.toFixed(1)}a</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-5">
                  <p className="font-bold text-yellow-800">⚠️ Nenhum sistema compatível encontrado nos dados cadastrados.</p>
                  <p className="text-sm text-yellow-700 mt-1">Use a opção "Bateria personalizada" para inserir manualmente os dados de equipamento.</p>
                </div>
              )}

              {/* Detalhe do sistema selecionado */}
              {selected && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="bg-white rounded-2xl shadow border p-5">
                    <h3 className="font-black text-sm text-gray-700 border-b pb-2 mb-3">🔌 Inversor Selecionado</h3>
                    <Row label="Marca / Modelo" value={`${selected.inverter.brand} ${selected.inverter.model}`} />
                    <Row label="Potência AC" value={selected.inverter.powerKw} unit="kW" />
                    <Row label="Fases" value={selected.inverter.phases + "F"} />
                    <Row label="Eficiência" value={selected.inverter.efficiency + "%"} />
                    <Row label="Voc máx entrada" value={selected.inverter.maxVocPerMppt} unit="V" />
                    <Row label="MPPT" value={`${selected.inverter.mpptVoltageRange[0]}–${selected.inverter.mpptVoltageRange[1]} V`} />
                    <Row label="Backup" value={selected.inverter.hasBackup ? `Sim — ${selected.inverter.maxBackupPower} kW` : "Não"} />
                    <Row label="IP" value={selected.inverter.ipRating} />
                    <Row label="Garantia" value={selected.inverter.warranty_years + " anos"} />
                    {selected.inverter.priceEstBrl && <Row label="Preço estimado" value={`R$ ${selected.inverter.priceEstBrl.toLocaleString("pt-BR")}`} bold />}
                  </div>
                  <div className="bg-white rounded-2xl shadow border p-5">
                    <h3 className="font-black text-sm text-gray-700 border-b pb-2 mb-3">🔋 Bateria Selecionada</h3>
                    <Row label="Marca / Modelo" value={`${selected.battery.brand} ${selected.battery.model}`} />
                    <Row label="Cap. por unidade" value={selected.battery.capacityKwh} unit="kWh" />
                    <Row label="Quantidade" value={selected.units} unit="unid." bold />
                    <Row label="Cap. total instalada" value={selected.totalCapacityKwh.toFixed(1)} unit="kWh" bold />
                    <Row label="Química" value={selected.battery.chemistry} />
                    <Row label="Eficiência ciclo" value={selected.battery.roundtripEfficiency + "%"} />
                    <Row label="DoD máx" value={selected.battery.maxDod + "%"} />
                    <Row label="Tensão nominal" value={selected.battery.voltageNominal} unit="V" />
                    <Row label="IP" value={selected.battery.ipRating} />
                    <Row label="Garantia" value={selected.battery.warranty_years + " anos"} />
                    {selected.battery.priceEstBrl && (
                      <>
                        <Row label="Preço unitário" value={`R$ ${selected.battery.priceEstBrl.toLocaleString("pt-BR")}`} />
                        <Row label="Preço total baterias" value={`R$ ${(selected.units * selected.battery.priceEstBrl).toLocaleString("pt-BR")}`} bold />
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Solar */}
              {solarResult && (
                <div className="bg-white rounded-2xl shadow border p-6">
                  <h3 className="font-black text-sm text-gray-700 border-b pb-2 mb-4">☀️ Sistema Fotovoltaico Complementar</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {[
                      { l: "Potência FV", v: solarResult.pvPowerKwp + " kWp", c: "green" },
                      { l: "Módulos", v: solarResult.numModules + " uds", c: "blue" },
                      { l: "Geração/mês", v: solarResult.monthlyGenKwh + " kWh", c: "orange" },
                      { l: "Payback", v: solarResult.paybackYears + " anos", c: "blue" },
                    ].map(m => (
                      <div key={m.l} className={`rounded-xl p-4 text-center ${m.c === "green" ? "bg-green-50" : m.c === "orange" ? "bg-orange-50" : "bg-blue-50"}`}>
                        <p className={`text-xl font-black ${m.c === "green" ? "text-green-700" : m.c === "orange" ? "text-orange-600" : "text-blue-700"}`}>{m.v}</p>
                        <p className="text-xs text-gray-600 mt-1">{m.l}</p>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Row label="Economia solar/mês" value={`R$ ${solarResult.monthlySavingsSolarR$.toFixed(2)}`} />
                    <Row label="Economia BESS/mês" value={`R$ ${solarResult.monthlySavingsBessR$.toFixed(2)}`} />
                    <Row label="Economia TOTAL/mês" value={`R$ ${solarResult.totalMonthlySavingsR$.toFixed(2)}`} bold />
                    <Row label="Investimento total" value={`R$ ${solarResult.totalInvestimentoR$.toLocaleString("pt-BR")}`} bold />
                  </div>
                </div>
              )}

              {/* Botões de relatório */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button onClick={() => generateBESSReport(consumption, bessResult, solarResult ?? undefined, selectedSystemIdx)}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-black py-4 rounded-2xl shadow-lg transition flex items-center justify-center gap-2">
                  📄 Proposta Técnica PDF
                  <span className="text-xs font-normal opacity-80">(comercial + compras)</span>
                </button>
                <button onClick={() => {
                  if (!selected) return;
                  const doc = new jsPDF();
                  doc.setFontSize(14); doc.text("Lista de Materiais — Cordeiro Energia", 14, 20);
                  doc.setFontSize(10);
                  const items = [
                    `1x Inversor Híbrido ${selected.inverter.brand} ${selected.inverter.model} — R$ ${(selected.inverter.priceEstBrl || 0).toLocaleString("pt-BR")}`,
                    `${selected.units}x Bateria ${selected.battery.brand} ${selected.battery.model} — R$ ${(selected.units * (selected.battery.priceEstBrl || 0)).toLocaleString("pt-BR")}`,
                    solarResult ? `${solarResult.numModules}x Módulo FV ${modulePower}Wp — (cotação a definir)` : "",
                    "Cabos DC e AC — (conforme projeto)",
                    "Quadro de proteções — (conforme projeto)",
                  ].filter(Boolean);
                  items.forEach((item, i) => doc.text(`${item}`, 14, 40 + i * 12));
                  doc.save("lista-materiais-bess.pdf");
                }}
                  className="bg-blue-700 hover:bg-blue-800 text-white font-black py-4 rounded-2xl shadow-lg transition flex items-center justify-center gap-2">
                  📦 Lista de Materiais PDF
                  <span className="text-xs font-normal opacity-80">(para compras)</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

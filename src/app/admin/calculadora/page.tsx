"use client";
import { useState, useCallback } from "react";
import { jsPDF } from "jspdf";
import {
  calcCable, calcVoltageDrop, calcShortCircuit,
  calcCircuitBreaker, calcDPS, calcSolar,
  CableInput, VoltageDrpInput, ShortCircuitInput,
  DPSInput, SolarInput, CircuitBreakerInput,
  CableResult, VoltageDrpResult, ShortCircuitResult,
  DPSResult, SolarResult, CircuitBreakerResult,
} from "@/lib/electrical-calc";

// ─── COMPONENTE AUXILIAR ─────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-blue outline-none bg-white" />;
}
function Select({ options, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { options: { value: string; label: string }[] }) {
  return (
    <select {...props} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-blue outline-none bg-white">
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}
function Badge({ status, text }: { status: "OK" | "ATENCAO" | "NOK" | "INFO"; text: string }) {
  const colors = {
    OK: "bg-green-100 text-green-800 border-green-300",
    ATENCAO: "bg-yellow-100 text-yellow-800 border-yellow-300",
    NOK: "bg-red-100 text-red-800 border-red-300",
    INFO: "bg-blue-100 text-blue-800 border-blue-300",
  };
  return <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${colors[status]}`}>{text}</span>;
}
function ResultCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mt-4">
      <h3 className="font-bold text-gray-700 border-b pb-2 mb-4 text-sm uppercase tracking-wider">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
function Row({ label, value, unit, highlight }: { label: string; value: string | number; unit?: string; highlight?: boolean }) {
  return (
    <div className={`flex justify-between items-center py-1 ${highlight ? "font-bold text-brand-blue" : ""}`}>
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-semibold ml-2">{value}{unit ? <span className="text-gray-400 text-xs ml-1">{unit}</span> : null}</span>
    </div>
  );
}

// ─── CRESESB HSP DATA (principais cidades brasileiras) ───────────
const CRESESB_HSP: Record<string, number> = {
  "Manaus-AM": 5.00, "Belém-PA": 4.89, "São Luís-MA": 5.29, "Teresina-PI": 5.73,
  "Fortaleza-CE": 5.76, "Natal-RN": 5.68, "João Pessoa-PB": 5.52, "Recife-PE": 5.32,
  "Maceió-AL": 5.34, "Aracaju-SE": 5.28, "Salvador-BA": 5.43, "Feira de Santana-BA": 5.45,
  "Vitória da Conquista-BA": 5.41, "Ilhéus-BA": 5.28, "Porto Seguro-BA": 5.38,
  "Belo Horizonte-MG": 5.12, "Uberlândia-MG": 5.25, "Montes Claros-MG": 5.50,
  "Vitória-ES": 4.98, "Rio de Janeiro-RJ": 5.03, "Niterói-RJ": 5.01,
  "São Paulo-SP": 4.55, "Campinas-SP": 4.73, "Ribeirão Preto-SP": 5.18,
  "Santos-SP": 4.32, "Sorocaba-SP": 4.60, "Curitiba-PR": 4.10,
  "Londrina-PR": 4.84, "Maringá-PR": 4.88, "Foz do Iguaçu-PR": 4.95,
  "Florianópolis-SC": 4.47, "Joinville-SC": 3.96, "Blumenau-SC": 3.95,
  "Porto Alegre-RS": 4.10, "Caxias do Sul-RS": 4.02, "Pelotas-RS": 4.23,
  "Campo Grande-MS": 5.11, "Dourados-MS": 5.18, "Cuiabá-MT": 5.31,
  "Goiânia-GO": 5.21, "Anápolis-GO": 5.19, "Brasília-DF": 5.27,
  "Palmas-TO": 5.44, "Porto Velho-RO": 4.73, "Rio Branco-AC": 4.55,
  "Macapá-AP": 5.10, "Boa Vista-RR": 5.02,
};

// ─── GERAÇÃO DE PDF ───────────────────────────────────────────────
function generatePDF(title: string, inputs: Record<string, string>, results: Record<string, string>) {
  const doc = new jsPDF();
  const orange = [249, 115, 22] as [number, number, number];
  const blue = [26, 58, 107] as [number, number, number];

  // Cabeçalho
  doc.setFillColor(...blue);
  doc.rect(0, 0, 210, 30, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("CORDEIRO ENERGIA", 14, 13);
  doc.setFontSize(10);
  doc.text(`Relatório Técnico: ${title}`, 14, 22);
  doc.setFontSize(8);
  doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 140, 22);

  // Linha laranja
  doc.setDrawColor(...orange);
  doc.setLineWidth(1.5);
  doc.line(0, 30, 210, 30);

  // Dados de entrada
  doc.setTextColor(26, 58, 107);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("DADOS DE ENTRADA", 14, 42);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  let y = 50;
  for (const [key, val] of Object.entries(inputs)) {
    doc.text(`${key}:`, 14, y);
    doc.text(String(val), 90, y);
    y += 7;
  }

  // Divisor
  doc.setDrawColor(200, 200, 200);
  doc.line(14, y + 2, 196, y + 2);
  y += 10;

  // Resultados
  doc.setTextColor(26, 58, 107);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("RESULTADOS", 14, y);
  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  for (const [key, val] of Object.entries(results)) {
    doc.text(`${key}:`, 14, y);
    doc.setFont("helvetica", "bold");
    doc.text(String(val), 90, y);
    doc.setFont("helvetica", "normal");
    y += 7;
    if (y > 270) { doc.addPage(); y = 20; }
  }

  // Rodapé
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text("Cordeiro Energia • Calculadora Técnica • NBR 5410 / NBR 5419-3 / NBR 16690", 14, 290);
    doc.text(`Pág ${i}/${total}`, 190, 290);
  }

  doc.save(`cordeiro-energia-${title.toLowerCase().replace(/\s+/g, "-")}.pdf`);
}

// ═══════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════
export default function CalculadoraPage() {
  const [activeTab, setActiveTab] = useState<"cabo" | "tensao" | "curto" | "disj" | "dps" | "solar">("cabo");

  // ── ESTADO CABOS ──────────────────
  const [cableInput, setCableInput] = useState<CableInput>({
    power: 5000, voltage: 220, system: "1F", powerFactor: 0.92,
    length: 30, method: "B1", material: "Cu", insulation: "PVC",
    ambientTemp: 30, groupedCircuits: 1, phases: 3, maxVoltageDrop: 4,
  });
  const [cableResult, setCableResult] = useState<CableResult | null>(null);
  const [cableError, setCableError] = useState("");

  // ── ESTADO QUEDA DE TENSÃO ────────
  const [vdInput, setVdInput] = useState<VoltageDrpInput>({
    current: 30, section: 6, length: 30, material: "Cu",
    system: "1F", voltage: 220, powerFactor: 0.92,
  });
  const [vdResult, setVdResult] = useState<VoltageDrpResult | null>(null);

  // ── ESTADO CURTO-CIRCUITO ─────────
  const [ccInput, setCcInput] = useState<ShortCircuitInput>({
    voltage: 220, system: "3F", transformerKVA: 75, transformerUcc: 4,
    cableSection: 10, cableLength: 30, cableMaterial: "Cu", insulation: "PVC", includeArc: true,
  });
  const [ccResult, setCcResult] = useState<ShortCircuitResult | null>(null);

  // ── ESTADO DISJUNTOR ──────────────
  const [cbInput, setCbInput] = useState<CircuitBreakerInput>({
    loadCurrent: 30, cableAmpacity: 50, iccMax: 10, loadType: "iluminacao", curve: "C",
  });
  const [cbResult, setCbResult] = useState<CircuitBreakerResult | null>(null);

  // ── ESTADO DPS ────────────────────
  const [dpsInput, setDpsInput] = useState<DPSInput>({
    installationType: "TT", voltage: 220, locationType: "TIPO2", hasLPZ0A: false, equipmentUw: 1.5,
  });
  const [dpsResult, setDpsResult] = useState<DPSResult | null>(null);

  // ── ESTADO SOLAR ──────────────────
  const [solarInput, setSolarInput] = useState<SolarInput>({
    monthlyConsumption: 350, hsp: 4.55, modulePower: 550, systemVoltage: 220, performanceRatio: 0.80,
    moduleVoc: 49.9, moduleVmp: 41.9, moduleIsc: 13.97, moduleImp: 13.14,
    inverterVmpMin: 90, inverterVmpMax: 580, inverterVocMax: 600, inverterIscMax: 15,
    minTemp: 10, maxTemp: 70,
  });
  const [solarCity, setSolarCity] = useState("São Paulo-SP");
  const [manualHsp, setManualHsp] = useState(false);
  const [solarResult, setSolarResult] = useState<SolarResult | null>(null);

  // ── HANDLERS ──────────────────────
  const handleCable = () => {
    try { setCableError(""); setCableResult(calcCable(cableInput)); }
    catch (e: any) { setCableError(e.message); }
  };
  const handleVd = () => setVdResult(calcVoltageDrop(vdInput));
  const handleCC = () => setCcResult(calcShortCircuit(ccInput));
  const handleCB = () => setCbResult(calcCircuitBreaker(cbInput));
  const handleDPS = () => setDpsResult(calcDPS(dpsInput));
  const handleSolar = () => {
    const hsp = manualHsp ? solarInput.hsp : CRESESB_HSP[solarCity] || 4.5;
    setSolarResult(calcSolar({ ...solarInput, hsp }));
  };

  const systemOpts = [{ value: "1F", label: "Monofásico (1F)" }, { value: "2F", label: "Bifásico (2F)" }, { value: "3F", label: "Trifásico (3F)" }];
  const methodOpts = [
    { value: "B1", label: "B1 — Em eletroduto embutido" },
    { value: "B2", label: "B2 — Em eletroduto aparente" },
    { value: "C",  label: "C — Em parede/bandeja" },
    { value: "E",  label: "E — Ao ar livre (6+lados)" },
    { value: "F",  label: "F — Ao ar livre (toque)" },
  ];
  const materialOpts = [{ value: "Cu", label: "Cobre (Cu)" }, { value: "Al", label: "Alumínio (Al)" }];
  const insulationOpts = [{ value: "PVC", label: "PVC 70°C" }, { value: "XLPE", label: "XLPE/EPR 90°C" }];
  const voltageOpts = [{ value: "127", label: "127 V" }, { value: "220", label: "220 V" }, { value: "380", label: "380 V" }, { value: "440", label: "440 V" }];
  const curveOpts = [{ value: "B", label: "Curva B (resistivo)" }, { value: "C", label: "Curva C (geral)" }, { value: "D", label: "Curva D (motores/trafo)" }];
  const dpsTypeOpts = [
    { value: "TIPO1", label: "Tipo 1 — Entrada (SPDA)" },
    { value: "TIPO2", label: "Tipo 2 — Quadros" },
    { value: "TIPO3", label: "Tipo 3 — Equipamentos" },
  ];
  const netOpts = [{ value: "TN-S", label: "TN-S" }, { value: "TN-C", label: "TN-C" }, { value: "TT", label: "TT" }, { value: "IT", label: "IT" }];

  // ── TABS ──────────────────────────
  const tabs = [
    { id: "cabo",   label: "⚡ Cabos",          color: "blue" },
    { id: "tensao", label: "📉 Queda de Tensão", color: "yellow" },
    { id: "curto",  label: "💥 Curto-Circuito",  color: "red" },
    { id: "disj",   label: "🔘 Disjuntores",     color: "orange" },
    { id: "dps",    label: "⛈️ DPS / SPDA",      color: "purple" },
    { id: "solar",  label: "☀️ Fotovoltaico",    color: "green" },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* HEADER */}
      <div className="bg-brand-blue text-white px-6 py-5 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black tracking-tight">
              ⚡ Calculadora <span className="text-brand-orange">Elétrica</span>
            </h1>
            <p className="text-blue-200 text-sm mt-1">NBR 5410 • NBR 5419-3 • NBR 16690 — Cordeiro Energia</p>
          </div>
          <a href="/admin/portal" className="text-sm bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-semibold transition">
            ← Portal Admin
          </a>
        </div>
      </div>

      {/* TABS */}
      <div className="max-w-7xl mx-auto px-4 pt-4">
        <div className="flex flex-wrap gap-2 bg-white rounded-xl shadow-sm border p-2 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition flex-1 min-w-[130px] ${
                activeTab === tab.id
                  ? "bg-brand-blue text-white shadow"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ═══════ ABA 1: CABOS ═══════ */}
        {activeTab === "cabo" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow border p-6 space-y-4">
              <h2 className="text-lg font-black text-brand-blue border-b border-orange-300 pb-2 border-b-4">Dimensionamento de Cabos</h2>
              <p className="text-xs text-gray-500">Base: ABNT NBR 5410:2004 — Tabelas 36, 38, 40, 42</p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Potência (W)">
                  <Input type="number" value={cableInput.power} onChange={e => setCableInput(p => ({ ...p, power: +e.target.value, current: undefined }))} />
                </Field>
                <Field label="OU Corrente (A)">
                  <Input type="number" placeholder="Opcional" onChange={e => setCableInput(p => ({ ...p, current: +e.target.value || undefined, power: undefined }))} />
                </Field>
                <Field label="Tensão (V)">
                  <Select options={voltageOpts} value={cableInput.voltage} onChange={e => setCableInput(p => ({ ...p, voltage: +e.target.value }))} />
                </Field>
                <Field label="Sistema">
                  <Select options={systemOpts} value={cableInput.system} onChange={e => setCableInput(p => ({ ...p, system: e.target.value as any }))} />
                </Field>
                <Field label="Fator de Potência">
                  <Input type="number" step="0.01" min="0.5" max="1" value={cableInput.powerFactor} onChange={e => setCableInput(p => ({ ...p, powerFactor: +e.target.value }))} />
                </Field>
                <Field label="Comprimento (m)">
                  <Input type="number" value={cableInput.length} onChange={e => setCableInput(p => ({ ...p, length: +e.target.value }))} />
                </Field>
                <Field label="Método Instalação">
                  <Select options={methodOpts} value={cableInput.method} onChange={e => setCableInput(p => ({ ...p, method: e.target.value as any }))} />
                </Field>
                <Field label="Material">
                  <Select options={materialOpts} value={cableInput.material} onChange={e => setCableInput(p => ({ ...p, material: e.target.value as any }))} />
                </Field>
                <Field label="Isolação">
                  <Select options={insulationOpts} value={cableInput.insulation} onChange={e => setCableInput(p => ({ ...p, insulation: e.target.value as any }))} />
                </Field>
                <Field label="Temp. Ambiente (°C)">
                  <Input type="number" value={cableInput.ambientTemp} onChange={e => setCableInput(p => ({ ...p, ambientTemp: +e.target.value }))} />
                </Field>
                <Field label="Circuitos Agrupados">
                  <Input type="number" min="1" max="20" value={cableInput.groupedCircuits} onChange={e => setCableInput(p => ({ ...p, groupedCircuits: +e.target.value }))} />
                </Field>
                <Field label="Queda Máx. (%)">
                  <Select options={[{ value: "3", label: "3% (iluminação)" }, { value: "4", label: "4% (distribuição)" }, { value: "5", label: "5% (forças motrizes)" }]}
                    value={cableInput.maxVoltageDrop}
                    onChange={e => setCableInput(p => ({ ...p, maxVoltageDrop: +e.target.value }))} />
                </Field>
                <Field label="Condutores Carregados">
                  <Select options={[{ value: "2", label: "2 condutores" }, { value: "3", label: "3 condutores" }]}
                    value={cableInput.phases} onChange={e => setCableInput(p => ({ ...p, phases: +e.target.value as any }))} />
                </Field>
              </div>
              <button onClick={handleCable} className="w-full bg-brand-blue text-white font-bold py-3 rounded-xl hover:bg-blue-800 transition shadow">
                ⚡ Calcular Cabo
              </button>
              {cableError && <p className="text-red-600 text-sm font-bold">{cableError}</p>}
            </div>

            {cableResult && (
              <div className="space-y-4">
                <ResultCard title="Resultado do Dimensionamento">
                  <Row label="Corrente de projeto" value={cableResult.nominalCurrent} unit="A" />
                  <Row label="Fator correção temperatura" value={cableResult.tempCorrFactor} />
                  <Row label="Fator agrupamento" value={cableResult.groupingFactor} />
                  <Row label="Seção pelo aquecimento" value={`${cableResult.sectionByHeating} mm²`} />
                  <Row label="Seção pela queda de tensão" value={`${cableResult.sectionByVoltageDrop} mm²`} />
                  <div className="flex justify-between items-center py-2 bg-blue-50 rounded-lg px-3 mt-2">
                    <span className="font-bold text-brand-blue">SEÇÃO RECOMENDADA</span>
                    <span className="text-2xl font-black text-brand-blue">{cableResult.recommendedSection} mm²</span>
                  </div>
                  <Row label="Ampacidade corrigida" value={cableResult.correctedAmpacity} unit="A" />
                  <Row label="Queda de tensão" value={`${cableResult.voltageDrop}% (${cableResult.voltageDropV}V)`}
                    highlight={cableResult.voltageDrop > 4} />
                  <Row label="Reserva de capacidade" value={`${cableResult.ampacityReserve}%`} />
                </ResultCard>
                {cableResult.warnings.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4">
                    <p className="font-bold text-yellow-800 mb-2">⚠️ Alertas</p>
                    {cableResult.warnings.map((w, i) => <p key={i} className="text-sm text-yellow-700">• {w}</p>)}
                  </div>
                )}
                <button onClick={() => generatePDF("Dimensionamento de Cabos", {
                  "Potência / Corrente": cableResult.nominalCurrent + " A",
                  "Tensão": cableInput.voltage + " V",
                  "Sistema": cableInput.system,
                  "Comprimento": cableInput.length + " m",
                  "Método": cableInput.method,
                  "Material": cableInput.material,
                  "Isolação": cableInput.insulation,
                  "Temp. ambiente": cableInput.ambientTemp + "°C",
                }, {
                  "Corrente de projeto": cableResult.nominalCurrent + " A",
                  "Seção pelo aquecimento": cableResult.sectionByHeating + " mm²",
                  "Seção pela queda de tensão": cableResult.sectionByVoltageDrop + " mm²",
                  "SEÇÃO RECOMENDADA": cableResult.recommendedSection + " mm²",
                  "Ampacidade corrigida": cableResult.correctedAmpacity + " A",
                  "Queda de tensão": cableResult.voltageDrop + "%",
                  "Reserva de capacidade": cableResult.ampacityReserve + "%",
                })}
                  className="w-full bg-brand-orange text-white font-bold py-2 rounded-xl hover:bg-orange-600 transition text-sm">
                  📄 Gerar Relatório PDF
                </button>
              </div>
            )}
          </div>
        )}

        {/* ═══════ ABA 2: QUEDA DE TENSÃO ═══════ */}
        {activeTab === "tensao" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow border p-6 space-y-4">
              <h2 className="text-lg font-black text-yellow-700 border-b-4 border-yellow-400 pb-2">Queda de Tensão</h2>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Corrente (A)">
                  <Input type="number" value={vdInput.current} onChange={e => setVdInput(p => ({ ...p, current: +e.target.value }))} />
                </Field>
                <Field label="Seção (mm²)">
                  <Select options={[1.5,2.5,4,6,10,16,25,35,50,70,95,120,150,185,240].map(s => ({ value: String(s), label: s + " mm²" }))}
                    value={vdInput.section} onChange={e => setVdInput(p => ({ ...p, section: +e.target.value }))} />
                </Field>
                <Field label="Comprimento (m)">
                  <Input type="number" value={vdInput.length} onChange={e => setVdInput(p => ({ ...p, length: +e.target.value }))} />
                </Field>
                <Field label="Material">
                  <Select options={materialOpts} value={vdInput.material} onChange={e => setVdInput(p => ({ ...p, material: e.target.value as any }))} />
                </Field>
                <Field label="Sistema">
                  <Select options={[{ value: "1F", label: "Monofásico" }, { value: "3F", label: "Trifásico" }]}
                    value={vdInput.system} onChange={e => setVdInput(p => ({ ...p, system: e.target.value as any }))} />
                </Field>
                <Field label="Tensão (V)">
                  <Select options={voltageOpts} value={vdInput.voltage} onChange={e => setVdInput(p => ({ ...p, voltage: +e.target.value }))} />
                </Field>
                <Field label="Fator de Potência">
                  <Input type="number" step="0.01" min="0.5" max="1" value={vdInput.powerFactor} onChange={e => setVdInput(p => ({ ...p, powerFactor: +e.target.value }))} />
                </Field>
              </div>
              <button onClick={handleVd} className="w-full bg-yellow-500 text-white font-bold py-3 rounded-xl hover:bg-yellow-600 transition shadow">
                📉 Calcular Queda de Tensão
              </button>
            </div>
            {vdResult && (
              <div className="space-y-4">
                <ResultCard title="Resultado — Queda de Tensão">
                  <div className="text-center py-4">
                    <span className={`text-5xl font-black ${vdResult.status === "OK" ? "text-green-600" : vdResult.status === "ATENCAO" ? "text-yellow-500" : "text-red-600"}`}>
                      {vdResult.dropPct}%
                    </span>
                    <p className="text-gray-500 text-sm mt-1">{vdResult.dropV} V de queda</p>
                    <div className="mt-3">
                      <Badge status={vdResult.status} text={
                        vdResult.status === "OK" ? "✅ Dentro do limite" :
                        vdResult.status === "ATENCAO" ? "⚠️ Atenção: entre 3% e 5%" : "❌ Excede o limite"
                      } />
                    </div>
                  </div>
                  <div className="border-t pt-3 space-y-1">
                    <Row label="Limite 3% (iluminação)" value={vdResult.limit3 ? "✅ OK" : "❌ Excede"} />
                    <Row label="Limite 5% (distribuição)" value={vdResult.limit5 ? "✅ OK" : "❌ Excede"} />
                  </div>
                </ResultCard>
                <button onClick={() => generatePDF("Queda de Tensão", {
                  "Corrente": vdInput.current + " A", "Seção": vdInput.section + " mm²",
                  "Comprimento": vdInput.length + " m", "Material": vdInput.material, "Sistema": vdInput.system,
                }, {
                  "Queda de tensão": vdResult.dropV + " V", "Queda (%)": vdResult.dropPct + "%",
                  "Status": vdResult.status, "Limite 3%": vdResult.limit3 ? "OK" : "EXCEDE",
                })}
                  className="w-full bg-brand-orange text-white font-bold py-2 rounded-xl hover:bg-orange-600 transition text-sm">
                  📄 Gerar Relatório PDF
                </button>
              </div>
            )}
          </div>
        )}

        {/* ═══════ ABA 3: CURTO-CIRCUITO ═══════ */}
        {activeTab === "curto" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow border p-6 space-y-4">
              <h2 className="text-lg font-black text-red-700 border-b-4 border-red-400 pb-2">Corrente de Curto-Circuito</h2>
              <p className="text-xs text-gray-500">Base: ABNT NBR 5410 item 5.3 / IEC 60909</p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Tensão (V)">
                  <Select options={voltageOpts} value={ccInput.voltage} onChange={e => setCcInput(p => ({ ...p, voltage: +e.target.value }))} />
                </Field>
                <Field label="Sistema">
                  <Select options={systemOpts} value={ccInput.system} onChange={e => setCcInput(p => ({ ...p, system: e.target.value as any }))} />
                </Field>
                <Field label="Potência Trafo (kVA)">
                  <Select options={[15,30,45,75,112.5,150,225,300,500,750,1000].map(v => ({ value: String(v), label: v + " kVA" }))}
                    value={ccInput.transformerKVA} onChange={e => setCcInput(p => ({ ...p, transformerKVA: +e.target.value }))} />
                </Field>
                <Field label="Ucc do Trafo (%)">
                  <Select options={[{ value: "3.5", label: "3.5%" }, { value: "4", label: "4%" }, { value: "5", label: "5%" }, { value: "6", label: "6%" }, { value: "8", label: "8%" }]}
                    value={ccInput.transformerUcc} onChange={e => setCcInput(p => ({ ...p, transformerUcc: +e.target.value }))} />
                </Field>
                <Field label="Seção do Cabo (mm²)">
                  <Select options={[1.5,2.5,4,6,10,16,25,35,50,70,95,120,150,185,240].map(s => ({ value: String(s), label: s + " mm²" }))}
                    value={ccInput.cableSection} onChange={e => setCcInput(p => ({ ...p, cableSection: +e.target.value }))} />
                </Field>
                <Field label="Comprimento (m)">
                  <Input type="number" value={ccInput.cableLength} onChange={e => setCcInput(p => ({ ...p, cableLength: +e.target.value }))} />
                </Field>
                <Field label="Material">
                  <Select options={materialOpts} value={ccInput.cableMaterial} onChange={e => setCcInput(p => ({ ...p, cableMaterial: e.target.value as any }))} />
                </Field>
                <Field label="Isolação">
                  <Select options={insulationOpts} value={ccInput.insulation} onChange={e => setCcInput(p => ({ ...p, insulation: e.target.value as any }))} />
                </Field>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={ccInput.includeArc} onChange={e => setCcInput(p => ({ ...p, includeArc: e.target.checked }))} />
                Incluir estimativa de corrente de arco elétrico
              </label>
              <button onClick={handleCC} className="w-full bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition shadow">
                💥 Calcular Curto-Circuito
              </button>
            </div>
            {ccResult && (
              <div className="space-y-4">
                <ResultCard title="Resultado — Curto-Circuito">
                  <Row label="Icc máx no barramento" value={ccResult.iccMax + " kA"} highlight />
                  <Row label="Icc no ponto (simétrico)" value={ccResult.iccSymm + " kA"} />
                  <Row label="Icc mínimo (fase-terra)" value={ccResult.iccMin + " kA"} />
                  {ccResult.iccArc !== undefined && <Row label="Icc de arco (estimado)" value={ccResult.iccArc + " kA"} />}
                  <div className="border-t pt-3 mt-3">
                    <Row label="Poder de interrupção mínimo" value={ccResult.breakingCapacity + " kA"} highlight />
                    <Row label="Seção mín. pelo critério térmico" value={ccResult.thermalSection + " mm²"} />
                  </div>
                </ResultCard>
                {ccResult.warnings.length > 0 && (
                  <div className="bg-red-50 border border-red-300 rounded-xl p-4">
                    {ccResult.warnings.map((w, i) => <p key={i} className="text-sm text-red-700 font-semibold">⚠️ {w}</p>)}
                  </div>
                )}
                <button onClick={() => generatePDF("Corrente de Curto-Circuito", {
                  "Trafo": ccInput.transformerKVA + " kVA / Ucc=" + ccInput.transformerUcc + "%",
                  "Cabo": ccInput.cableSection + " mm² × " + ccInput.cableLength + " m",
                }, {
                  "Icc máx barramento": ccResult.iccMax + " kA",
                  "Icc no ponto": ccResult.iccSymm + " kA",
                  "Icc mínimo": ccResult.iccMin + " kA",
                  "Poder de interrupção mín.": ccResult.breakingCapacity + " kA",
                  "Seção mín. térmica": ccResult.thermalSection + " mm²",
                })}
                  className="w-full bg-brand-orange text-white font-bold py-2 rounded-xl hover:bg-orange-600 transition text-sm">
                  📄 Gerar Relatório PDF
                </button>
              </div>
            )}
          </div>
        )}

        {/* ═══════ ABA 4: DISJUNTORES ═══════ */}
        {activeTab === "disj" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow border p-6 space-y-4">
              <h2 className="text-lg font-black text-orange-700 border-b-4 border-orange-400 pb-2">Dimensionamento de Disjuntores</h2>
              <p className="text-xs text-gray-500">ABNT NBR IEC 60947-2 • Ib ≤ In ≤ Iz e I₂ ≤ 1.45·Iz</p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Corrente de carga Ib (A)">
                  <Input type="number" value={cbInput.loadCurrent} onChange={e => setCbInput(p => ({ ...p, loadCurrent: +e.target.value }))} />
                </Field>
                <Field label="Ampacidade do cabo Iz (A)">
                  <Input type="number" value={cbInput.cableAmpacity} onChange={e => setCbInput(p => ({ ...p, cableAmpacity: +e.target.value }))} />
                </Field>
                <Field label="Icc máximo (kA)">
                  <Input type="number" step="0.5" value={cbInput.iccMax} onChange={e => setCbInput(p => ({ ...p, iccMax: +e.target.value }))} />
                </Field>
                <Field label="Tipo de carga">
                  <Select options={[
                    { value: "resistivo", label: "Resistivo" },
                    { value: "iluminacao", label: "Iluminação" },
                    { value: "motor", label: "Motor" },
                    { value: "capacitor", label: "Capacitor" },
                  ]} value={cbInput.loadType} onChange={e => setCbInput(p => ({ ...p, loadType: e.target.value as any }))} />
                </Field>
                <Field label="Curva do disjuntor">
                  <Select options={curveOpts} value={cbInput.curve} onChange={e => setCbInput(p => ({ ...p, curve: e.target.value as any }))} />
                </Field>
              </div>
              <button onClick={handleCB} className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl hover:bg-orange-600 transition shadow">
                🔘 Calcular Disjuntor
              </button>
            </div>
            {cbResult && (
              <div className="space-y-4">
                <ResultCard title="Resultado — Disjuntor">
                  <Row label="Corrente mínima necessária" value={cbResult.requiredIn + " A"} />
                  <div className="flex justify-between items-center py-2 bg-orange-50 rounded-lg px-3">
                    <span className="font-bold text-orange-700">DISJUNTOR RECOMENDADO</span>
                    <span className="text-2xl font-black text-orange-700">{cbResult.recommendedIn} A</span>
                  </div>
                  <Row label="Poder de interrupção mín." value={cbResult.poderDeInterrupcao + " kA"} />
                  <Row label="Verificação I₂ ≤ 1.45·Iz" value={cbResult.i2check ? "✅ Aprovado" : "❌ Reprovado"} highlight={!cbResult.i2check} />
                  <div className="bg-gray-50 rounded-lg p-3 mt-2">
                    <p className="text-xs text-gray-600">{cbResult.curveJustification}</p>
                  </div>
                </ResultCard>
                {cbResult.warnings.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4">
                    {cbResult.warnings.map((w, i) => <p key={i} className="text-sm text-yellow-700">⚠️ {w}</p>)}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ═══════ ABA 5: DPS ═══════ */}
        {activeTab === "dps" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow border p-6 space-y-4">
              <h2 className="text-lg font-black text-purple-700 border-b-4 border-purple-400 pb-2">Dimensionamento de DPS</h2>
              <p className="text-xs text-gray-500">Base: ABNT NBR 5419-3 (IEC 62305-3/4)</p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Localização do DPS">
                  <Select options={dpsTypeOpts} value={dpsInput.locationType} onChange={e => setDpsInput(p => ({ ...p, locationType: e.target.value as any }))} />
                </Field>
                <Field label="Tipo de rede">
                  <Select options={netOpts} value={dpsInput.installationType} onChange={e => setDpsInput(p => ({ ...p, installationType: e.target.value as any }))} />
                </Field>
                <Field label="Tensão nominal (V)">
                  <Select options={[{ value: "220", label: "220 V" }, { value: "380", label: "380 V" }]}
                    value={dpsInput.voltage} onChange={e => setDpsInput(p => ({ ...p, voltage: +e.target.value }))} />
                </Field>
                <Field label="Uw equipamentos (kV)">
                  <Select options={[
                    { value: "0.8", label: "0.8 kV (eletrônico)" },
                    { value: "1.5", label: "1.5 kV (sensível)" },
                    { value: "2.5", label: "2.5 kV (geral)" },
                    { value: "4.0", label: "4.0 kV (industrial)" },
                    { value: "6.0", label: "6.0 kV (padrão)" },
                  ]} value={dpsInput.equipmentUw} onChange={e => setDpsInput(p => ({ ...p, equipmentUw: +e.target.value }))} />
                </Field>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={dpsInput.hasLPZ0A} onChange={e => setDpsInput(p => ({ ...p, hasLPZ0A: e.target.checked }))} />
                SPDA (para-raios) instalado na estrutura
              </label>
              <button onClick={handleDPS} className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl hover:bg-purple-700 transition shadow">
                ⛈️ Dimensionar DPS
              </button>
            </div>
            {dpsResult && (
              <div className="space-y-4">
                <ResultCard title="Resultado — DPS">
                  <Row label="Tipo selecionado" value={dpsResult.type} highlight />
                  <Row label="Tensão de operação (Uc ≥)" value={dpsResult.uc + " V"} />
                  <Row label="Corrente de descarga nominal (In)" value={dpsResult.inNominal + " kA"} />
                  <Row label="Corrente de descarga máx (Imax)" value={dpsResult.imaxPico + " kA"} />
                  <Row label="Nível de proteção (Up)" value={dpsResult.up + " kV"} />
                  <Row label="Forma de onda" value={dpsResult.waveform} />
                  <div className="bg-purple-50 rounded-lg p-3 mt-2">
                    <p className="text-xs font-semibold text-purple-700">📍 Localização:</p>
                    <p className="text-xs text-purple-600 mt-1">{dpsResult.coordenacao}</p>
                  </div>
                </ResultCard>
                {dpsResult.warnings.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4">
                    {dpsResult.warnings.map((w, i) => <p key={i} className="text-sm text-yellow-700">⚠️ {w}</p>)}
                  </div>
                )}
                <button onClick={() => generatePDF("Dimensionamento de DPS", {
                  "Tipo": dpsInput.locationType, "Rede": dpsInput.installationType,
                  "Tensão": dpsInput.voltage + " V", "Uw equipamentos": dpsInput.equipmentUw + " kV",
                }, {
                  "Tipo DPS": dpsResult.type, "Uc mínimo": dpsResult.uc + " V",
                  "In nominal": dpsResult.inNominal + " kA", "Up proteção": dpsResult.up + " kV",
                })}
                  className="w-full bg-brand-orange text-white font-bold py-2 rounded-xl hover:bg-orange-600 transition text-sm">
                  📄 Gerar Relatório PDF
                </button>
              </div>
            )}
          </div>
        )}

        {/* ═══════ ABA 6: SOLAR ═══════ */}
        {activeTab === "solar" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow border p-6 space-y-4">
              <h2 className="text-lg font-black text-green-700 border-b-4 border-green-400 pb-2">Sistema Fotovoltaico</h2>
              <p className="text-xs text-gray-500">ABNT NBR 16690:2019 • IEC 61730 • CRESESB/CEPEL</p>

              <div className="bg-green-50 rounded-xl p-4 space-y-3">
                <p className="text-xs font-bold text-green-800 uppercase">☀️ Irradiação Solar (HSP)</p>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={manualHsp} onChange={e => setManualHsp(e.target.checked)} />
                  Inserir HSP manualmente
                </label>
                {!manualHsp ? (
                  <Field label="Cidade (base CRESESB)">
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white"
                      value={solarCity} onChange={e => { setSolarCity(e.target.value); setSolarInput(p => ({ ...p, hsp: CRESESB_HSP[e.target.value] })); }}>
                      {Object.entries(CRESESB_HSP).map(([city, hsp]) => (
                        <option key={city} value={city}>{city} — HSP: {hsp}</option>
                      ))}
                    </select>
                  </Field>
                ) : (
                  <Field label="HSP (h/dia)">
                    <Input type="number" step="0.1" value={solarInput.hsp} onChange={e => setSolarInput(p => ({ ...p, hsp: +e.target.value }))} />
                  </Field>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Consumo Médio (kWh/mês)">
                  <Input type="number" value={solarInput.monthlyConsumption} onChange={e => setSolarInput(p => ({ ...p, monthlyConsumption: +e.target.value }))} />
                </Field>
                <Field label="Potência do Módulo (Wp)">
                  <Input type="number" value={solarInput.modulePower} onChange={e => setSolarInput(p => ({ ...p, modulePower: +e.target.value }))} />
                </Field>
                <Field label="Performance Ratio">
                  <Input type="number" step="0.01" min="0.6" max="0.95" value={solarInput.performanceRatio} onChange={e => setSolarInput(p => ({ ...p, performanceRatio: +e.target.value }))} />
                </Field>
                <Field label="Tensão rede (V)">
                  <Select options={[{ value: "220", label: "220 V" }, { value: "380", label: "380 V" }]}
                    value={solarInput.systemVoltage} onChange={e => setSolarInput(p => ({ ...p, systemVoltage: +e.target.value as any }))} />
                </Field>
              </div>

              <details className="border rounded-lg">
                <summary className="p-3 text-sm font-bold cursor-pointer text-gray-700">📊 Dados do Módulo Fotovoltaico</summary>
                <div className="p-3 grid grid-cols-2 gap-3">
                  {[
                    ["Voc (V)", "moduleVoc", 0.1], ["Vmp (V)", "moduleVmp", 0.1],
                    ["Isc (A)", "moduleIsc", 0.01], ["Imp (A)", "moduleImp", 0.01],
                    ["Temp. mín. local (°C)", "minTemp", 1], ["Temp. máx. módulo (°C)", "maxTemp", 1],
                  ].map(([label, key, step]) => (
                    <Field key={String(key)} label={String(label)}>
                      <Input type="number" step={Number(step)} value={(solarInput as any)[key as string]}
                        onChange={e => setSolarInput(p => ({ ...p, [key as string]: +e.target.value }))} />
                    </Field>
                  ))}
                </div>
              </details>

              <details className="border rounded-lg">
                <summary className="p-3 text-sm font-bold cursor-pointer text-gray-700">⚙️ Dados do Inversor</summary>
                <div className="p-3 grid grid-cols-2 gap-3">
                  {[
                    ["Vmp mín MPPT (V)", "inverterVmpMin", 1], ["Vmp máx MPPT (V)", "inverterVmpMax", 1],
                    ["Voc máx entrada (V)", "inverterVocMax", 1], ["Isc máx entrada (A)", "inverterIscMax", 0.1],
                  ].map(([label, key, step]) => (
                    <Field key={String(key)} label={String(label)}>
                      <Input type="number" step={Number(step)} value={(solarInput as any)[key as string]}
                        onChange={e => setSolarInput(p => ({ ...p, [key as string]: +e.target.value }))} />
                    </Field>
                  ))}
                </div>
              </details>

              <button onClick={handleSolar} className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition shadow">
                ☀️ Dimensionar Sistema FV
              </button>
            </div>

            {solarResult && (
              <div className="space-y-4">
                <ResultCard title="Resultado — Sistema Fotovoltaico">
                  <div className="flex justify-between items-center py-2 bg-green-50 rounded-lg px-3">
                    <span className="font-bold text-green-700">Potência necessária</span>
                    <span className="text-2xl font-black text-green-700">{solarResult.requiredPower} kWp</span>
                  </div>
                  <Row label="Nº de módulos" value={solarResult.numModules} />
                  <Row label="Módulos em série (por string)" value={solarResult.seriesModules} />
                  <Row label="Strings em paralelo" value={solarResult.parallelStrings} />
                  <div className="border-t pt-3">
                    <Row label="Voc da string (temp. mín)" value={solarResult.stringVoc + " V"} />
                    <Row label="Vmp da string" value={solarResult.stringVmp + " V"} />
                    <Row label="Isc total do array" value={solarResult.arrayIsc + " A"} />
                  </div>
                  <div className="border-t pt-3">
                    <Row label="Fusível de string (gPV)" value={solarResult.fusibleString + " A"} highlight />
                    <Row label="Seção cabo DC" value={solarResult.dcCableSection + " mm²"} highlight />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Fusível: In = 2×Isc — NBR 16690:2019 | Cabo DC: queda ≤1% | comprimento estimado: 20m
                  </p>
                </ResultCard>
                {solarResult.warnings.length > 0 && (
                  <div className="bg-red-50 border border-red-300 rounded-xl p-4">
                    {solarResult.warnings.map((w, i) => <p key={i} className="text-sm text-red-700 font-semibold">⚠️ {w}</p>)}
                  </div>
                )}
                <button onClick={() => generatePDF("Sistema Fotovoltaico", {
                  "Consumo": solarInput.monthlyConsumption + " kWh/mês",
                  "HSP": (manualHsp ? solarInput.hsp : CRESESB_HSP[solarCity]) + " h/dia",
                  "Módulo": solarInput.modulePower + " Wp",
                  "PR": (solarInput.performanceRatio * 100).toFixed(0) + "%",
                }, {
                  "Potência necessária": solarResult.requiredPower + " kWp",
                  "Nº de módulos": String(solarResult.numModules),
                  "Configuração": solarResult.seriesModules + "S × " + solarResult.parallelStrings + "P",
                  "Voc string": solarResult.stringVoc + " V",
                  "Isc array": solarResult.arrayIsc + " A",
                  "Fusível string (gPV)": solarResult.fusibleString + " A",
                  "Cabo DC": solarResult.dcCableSection + " mm²",
                })}
                  className="w-full bg-brand-orange text-white font-bold py-2 rounded-xl hover:bg-orange-600 transition text-sm">
                  📄 Gerar Relatório PDF
                </button>
              </div>
            )}
          </div>
        )}

        <div className="h-10" />
      </div>
    </div>
  );
}

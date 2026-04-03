// ============================================================
// MOTOR DE CÁLCULOS ELÉTRICOS — CORDEIRO ENERGIA
// Base: ABNT NBR 5410:2004 + NBR 5419-3 + IEC 60364
// ============================================================

// ─────────────────────────────────────────────────
// TABELAS NBR 5410 — AMPACIDADES (A)
// Tabela 36: Condutores de cobre com isolação PVC 70°C
// Métodos: B1/B2 (em eletroduto), C (em bandeja/parede), E/F (ao ar livre)
// ─────────────────────────────────────────────────
export const AMPACITY_COPPER_PVC: Record<number, Record<string, number>> = {
  1.5:  { B1_2: 15.5, B1_3: 13.5, B2_2: 17.5, B2_3: 15.5, C_2: 19.5, C_3: 17.5, E_2: 22,   E_3: 18.5 },
  2.5:  { B1_2: 21,   B1_3: 18,   B2_2: 24,   B2_3: 21,   C_2: 27,   C_3: 24,   E_2: 30,   E_3: 25   },
  4:    { B1_2: 28,   B1_3: 24,   B2_2: 32,   B2_3: 28,   C_2: 36,   C_3: 32,   E_2: 40,   E_3: 34   },
  6:    { B1_2: 36,   B1_3: 31,   B2_2: 41,   B2_3: 36,   C_2: 46,   C_3: 41,   E_2: 51,   E_3: 43   },
  10:   { B1_2: 50,   B1_3: 44,   B2_2: 57,   B2_3: 50,   C_2: 63,   C_3: 57,   E_2: 70,   E_3: 60   },
  16:   { B1_2: 68,   B1_3: 60,   B2_2: 76,   B2_3: 68,   C_2: 85,   C_3: 76,   E_2: 94,   E_3: 80   },
  25:   { B1_2: 89,   B1_3: 78,   B2_2: 96,   B2_3: 89,   C_2: 112,  C_3: 96,   E_2: 119,  E_3: 101  },
  35:   { B1_2: 110,  B1_3: 96,   B2_2: 119,  B2_3: 110,  C_2: 138,  C_3: 119,  E_2: 147,  E_3: 126  },
  50:   { B1_2: 134,  B1_3: 117,  B2_2: 144,  B2_3: 134,  C_2: 168,  C_3: 144,  E_2: 179,  E_3: 154  },
  70:   { B1_2: 171,  B1_3: 150,  B2_2: 184,  B2_3: 171,  C_2: 213,  C_3: 184,  E_2: 229,  E_3: 198  },
  95:   { B1_2: 207,  B1_3: 183,  B2_2: 223,  B2_3: 207,  C_2: 258,  C_3: 223,  E_2: 278,  E_3: 241  },
  120:  { B1_2: 239,  B1_3: 212,  B2_2: 259,  B2_3: 239,  C_2: 299,  C_3: 259,  E_2: 322,  E_3: 280  },
  150:  { B1_2: 272,  B1_3: 245,  B2_2: 295,  B2_3: 272,  C_2: 344,  C_3: 295,  E_2: 371,  E_3: 324  },
  185:  { B1_2: 310,  B1_3: 280,  B2_2: 339,  B2_3: 310,  C_2: 392,  C_3: 339,  E_2: 424,  E_3: 371  },
  240:  { B1_2: 365,  B1_3: 330,  B2_2: 400,  B2_3: 365,  C_2: 461,  C_3: 400,  E_2: 500,  E_3: 439  },
};

// Tabela 38: Condutores de cobre com isolação XLPE/EPR 90°C
export const AMPACITY_COPPER_XLPE: Record<number, Record<string, number>> = {
  1.5:  { B1_2: 19.5, B1_3: 17,   B2_2: 22,   B2_3: 19.5, C_2: 24,   C_3: 21,   E_2: 26,   E_3: 22   },
  2.5:  { B1_2: 27,   B1_3: 23,   B2_2: 30,   B2_3: 27,   C_2: 33,   C_3: 30,   E_2: 36,   E_3: 30   },
  4:    { B1_2: 36,   B1_3: 31,   B2_2: 40,   B2_3: 36,   C_2: 45,   C_3: 40,   E_2: 49,   E_3: 41   },
  6:    { B1_2: 46,   B1_3: 40,   B2_2: 51,   B2_3: 46,   C_2: 58,   C_3: 51,   E_2: 63,   E_3: 53   },
  10:   { B1_2: 63,   B1_3: 57,   B2_2: 70,   B2_3: 63,   C_2: 80,   C_3: 70,   E_2: 86,   E_3: 73   },
  16:   { B1_2: 85,   B1_3: 76,   B2_2: 94,   B2_3: 85,   C_2: 107,  C_3: 94,   E_2: 115,  E_3: 98   },
  25:   { B1_2: 112,  B1_3: 101,  B2_2: 119,  B2_3: 112,  C_2: 138,  C_3: 119,  E_2: 149,  E_3: 127  },
  35:   { B1_2: 138,  B1_3: 125,  B2_2: 148,  B2_3: 138,  C_2: 171,  C_3: 148,  E_2: 185,  E_3: 158  },
  50:   { B1_2: 168,  B1_3: 152,  B2_2: 180,  B2_3: 168,  C_2: 209,  C_3: 180,  E_2: 225,  E_3: 192  },
  70:   { B1_2: 213,  B1_3: 194,  B2_2: 232,  B2_3: 213,  C_2: 269,  C_3: 232,  E_2: 289,  E_3: 247  },
  95:   { B1_2: 258,  B1_3: 233,  B2_2: 282,  B2_3: 258,  C_2: 328,  C_3: 282,  E_2: 352,  E_3: 301  },
  120:  { B1_2: 299,  B1_3: 269,  B2_2: 328,  B2_3: 299,  C_2: 382,  C_3: 328,  E_2: 410,  E_3: 351  },
  150:  { B1_2: 344,  B1_3: 309,  B2_2: 379,  B2_3: 344,  C_2: 441,  C_3: 379,  E_2: 473,  E_3: 405  },
  185:  { B1_2: 392,  B1_3: 355,  B2_2: 434,  B2_3: 392,  C_2: 506,  C_3: 434,  E_2: 542,  E_3: 464  },
  240:  { B1_2: 461,  B1_3: 418,  B2_2: 514,  B2_3: 461,  C_2: 599,  C_3: 514,  E_2: 641,  E_3: 550  },
};

// Tabela 40: Fatores de correção por temperatura ambiente (PVC 70°C / XLPE 90°C)
export const TEMP_CORRECTION: Record<number, { pvc: number; xlpe: number }> = {
  10: { pvc: 1.22, xlpe: 1.15 },
  15: { pvc: 1.17, xlpe: 1.12 },
  20: { pvc: 1.12, xlpe: 1.08 },
  25: { pvc: 1.06, xlpe: 1.04 },
  30: { pvc: 1.00, xlpe: 1.00 },
  35: { pvc: 0.94, xlpe: 0.96 },
  40: { pvc: 0.87, xlpe: 0.91 },
  45: { pvc: 0.79, xlpe: 0.87 },
  50: { pvc: 0.71, xlpe: 0.82 },
  55: { pvc: 0.61, xlpe: 0.76 },
  60: { pvc: 0.50, xlpe: 0.71 },
  65: { pvc: 0.00, xlpe: 0.65 },
  70: { pvc: 0.00, xlpe: 0.58 },
};

// Tabela 42: Fatores de agrupamento (circuitos em feixe ou mesmo eletroduto)
export const GROUPING_FACTOR: Record<number, number> = {
  1: 1.00, 2: 0.80, 3: 0.70, 4: 0.65, 5: 0.60,
  6: 0.57, 7: 0.54, 8: 0.52, 9: 0.50, 10: 0.48,
  12: 0.45, 14: 0.43, 16: 0.41, 20: 0.38,
};

// Bitolas comerciais disponíveis (mm²)
export const COMMERCIAL_SECTIONS = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240];

// Disjuntores comerciais padrão (A) — curvas B, C, D
export const CIRCUIT_BREAKERS = [6, 10, 13, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630];

// Resistividade dos condutores (Ω·mm²/m) a 20°C
export const RESISTIVITY = { Cu: 0.01786, Al: 0.02857 };

// ─────────────────────────────────────────────────
// CÁLCULO 1: DIMENSIONAMENTO DE CABOS
// ─────────────────────────────────────────────────
export interface CableInput {
  power?: number;       // W (se não informar corrente)
  current?: number;     // A (se não informar potência)
  voltage: number;      // V (127, 220, 380, 440)
  system: '1F' | '2F' | '3F'; // Mono / Bi / Trifásico
  powerFactor: number;  // cos φ (0 a 1)
  length: number;       // m
  method: 'B1' | 'B2' | 'C' | 'E' | 'F'; // Método instalação NBR 5410
  material: 'Cu' | 'Al';
  insulation: 'PVC' | 'XLPE';
  ambientTemp: number;  // °C
  groupedCircuits: number; // Nº circuitos agrupados
  phases: 2 | 3;        // Condutores carregados no eletroduto
  maxVoltageDrop: number; // % máximo (3 ou 5)
}

export interface CableResult {
  nominalCurrent: number;       // A
  correctedAmpacity: number;    // A por seção recomendada
  sectionByHeating: number;     // mm² pelo aquecimento
  sectionByVoltageDrop: number; // mm² pela queda de tensão
  recommendedSection: number;   // mm² (maior dos dois)
  voltageDrop: number;          // % com seção recomendada
  voltageDropV: number;         // V
  ampacityReserve: number;      // % de reserva
  tempCorrFactor: number;
  groupingFactor: number;
  warnings: string[];
}

export function calcCable(input: CableInput): CableResult {
  const warnings: string[] = [];

  // Corrente de projeto
  let Ib: number;
  if (input.current) {
    Ib = input.current;
  } else if (input.power) {
    if (input.system === '1F') Ib = input.power / (input.voltage * input.powerFactor);
    else if (input.system === '2F') Ib = input.power / (2 * input.voltage * input.powerFactor);
    else Ib = input.power / (Math.sqrt(3) * input.voltage * input.powerFactor);
  } else throw new Error('Informe potência ou corrente');

  // Fatores de correção
  const tempEntry = TEMP_CORRECTION[input.ambientTemp] || TEMP_CORRECTION[30];
  const kt = input.insulation === 'PVC' ? tempEntry.pvc : tempEntry.xlpe;
  const kg = GROUPING_FACTOR[input.groupedCircuits] || (input.groupedCircuits > 20 ? 0.35 : 1.0);

  const correctionFactor = kt * kg;
  const ampacityTable = input.insulation === 'PVC' ? AMPACITY_COPPER_PVC : AMPACITY_COPPER_XLPE;
  const methodKey = `${input.method}_${input.phases}`;

  // Seção pelo aquecimento
  let sectionByHeating = 0;
  for (const section of COMMERCIAL_SECTIONS) {
    const ampacity = ampacityTable[section]?.[methodKey] ?? 0;
    const correctedAmpacity = ampacity * correctionFactor;
    if (correctedAmpacity >= Ib) {
      sectionByHeating = section;
      break;
    }
  }
  if (!sectionByHeating) {
    sectionByHeating = 240;
    warnings.push('Corrente excede a capacidade do maior cabo disponível. Verifique a necessidade de cabos em paralelo.');
  }

  // Seção pela queda de tensão
  const rho = input.material === 'Cu' ? RESISTIVITY.Cu : RESISTIVITY.Al;
  const maxDropV = (input.maxVoltageDrop / 100) * input.voltage;
  const phaseMultiplier = input.system === '3F' ? Math.sqrt(3) : 2;
  // ΔV = (fator × ρ × L × I) / S  → S = (fator × ρ × L × I) / ΔV
  const sectionForDropContinuous = (phaseMultiplier * rho * input.length * Ib) / maxDropV;
  let sectionByVoltageDrop = COMMERCIAL_SECTIONS.find(s => s >= sectionForDropContinuous) || 240;

  // Seção recomendada = maior entre os dois critérios
  const recommendedSection = Math.max(sectionByHeating, sectionByVoltageDrop);

  // Verificação final
  const finalAmpacity = (ampacityTable[recommendedSection]?.[methodKey] ?? 0) * correctionFactor;
  const dropV = (phaseMultiplier * rho * input.length * Ib) / recommendedSection;
  const dropPct = (dropV / input.voltage) * 100;
  const reserve = ((finalAmpacity - Ib) / finalAmpacity) * 100;

  if (dropPct > input.maxVoltageDrop) warnings.push(`Queda de tensão ${dropPct.toFixed(2)}% excede o limite de ${input.maxVoltageDrop}%`);
  if (reserve < 10) warnings.push('Reserva de capacidade menor que 10%. Considere a próxima bitola.');
  if (Ib > 315) warnings.push('Corrente elevada: verifique a necessidade de proteção com disjuntores motorizados ou fusíveis NH.');

  return {
    nominalCurrent: Math.round(Ib * 100) / 100,
    correctedAmpacity: Math.round(finalAmpacity * 10) / 10,
    sectionByHeating,
    sectionByVoltageDrop,
    recommendedSection,
    voltageDrop: Math.round(dropPct * 100) / 100,
    voltageDropV: Math.round(dropV * 100) / 100,
    ampacityReserve: Math.round(reserve * 10) / 10,
    tempCorrFactor: kt,
    groupingFactor: kg,
    warnings,
  };
}

// ─────────────────────────────────────────────────
// CÁLCULO 2: QUEDA DE TENSÃO
// ─────────────────────────────────────────────────
export interface VoltageDrpInput {
  current: number;      // A
  section: number;      // mm²
  length: number;       // m
  material: 'Cu' | 'Al';
  system: '1F' | '3F';
  voltage: number;      // V
  powerFactor: number;
}

export interface VoltageDrpResult {
  dropV: number;
  dropPct: number;
  status: 'OK' | 'ATENCAO' | 'NOK';
  limit3: boolean;
  limit5: boolean;
}

export function calcVoltageDrop(input: VoltageDrpInput): VoltageDrpResult {
  const rho = input.material === 'Cu' ? RESISTIVITY.Cu : RESISTIVITY.Al;
  // Resistência por fase: R = ρ * L / S
  const R = rho * input.length / input.section;
  // Reatância capacitada (estimada para baixa tensão)
  const X = 0.00008 * input.length; // ≈ 0.08 mΩ/m para cabo isolado
  const sinPhi = Math.sqrt(1 - input.powerFactor ** 2);
  const factor = input.system === '3F' ? Math.sqrt(3) : 2;
  const dropV = factor * input.current * (R * input.powerFactor + X * sinPhi);
  const dropPct = (dropV / input.voltage) * 100;
  return {
    dropV: Math.round(dropV * 100) / 100,
    dropPct: Math.round(dropPct * 100) / 100,
    status: dropPct <= 3 ? 'OK' : dropPct <= 5 ? 'ATENCAO' : 'NOK',
    limit3: dropPct <= 3,
    limit5: dropPct <= 5,
  };
}

// ─────────────────────────────────────────────────
// CÁLCULO 3: CORRENTE DE CURTO-CIRCUITO
// Base: NBR 5410 item 5.3 / IEC 60909
// ─────────────────────────────────────────────────
export interface ShortCircuitInput {
  voltage: number;          // V (tensão nominal)
  system: '1F' | '3F';
  transformerKVA: number;   // kVA (potência do trafo)
  transformerUcc: number;   // % (tensão de curto do trafo, tipico 4-6%)
  cableSection: number;     // mm²
  cableLength: number;      // m
  cableMaterial: 'Cu' | 'Al';
  insulation: 'PVC' | 'XLPE';
  includeArc?: boolean;     // Incluir corrente de curto arco
}

export interface ShortCircuitResult {
  iccMax: number;     // kA (curto máximo — no início da instalação)
  iccMin: number;     // kA (curto mínimo — no ponto mais distante)
  iccArc?: number;    // kA (corrente de arco estimada)
  iccSymm: number;    // kA simétrico
  breakingCapacity: number; // kA poder de interrupção mínimo necessário
  thermalSection: number;   // mm² seção mínima para suportar curto
  warnings: string[];
}

export function calcShortCircuit(input: ShortCircuitInput): ShortCircuitResult {
  const warnings: string[] = [];

  // Impedância do transformador
  const Vn = input.voltage;
  const Sn = input.transformerKVA * 1000; // VA
  const Zbase = (Vn ** 2) / Sn;
  const Ztrafo = (input.transformerUcc / 100) * Zbase; // Ω

  // Resistência e reatância do trafo (estimativa: R = 0.3*Z, X = 0.95*Z)
  const Rtrafo = 0.3 * Ztrafo;
  const Xtrafo = Math.sqrt(Ztrafo ** 2 - Rtrafo ** 2);

  // Impedância do cabo
  const rho = input.cableMaterial === 'Cu' ? RESISTIVITY.Cu : RESISTIVITY.Al;
  const Rcabo = (rho * input.cableLength) / input.cableSection;
  const Xcabo = 0.00008 * input.cableLength; // reatância estimada

  // Impedância total
  const Ztotal_R = Rtrafo + Rcabo;
  const Ztotal_X = Xtrafo + Xcabo;
  const Ztotal = Math.sqrt(Ztotal_R ** 2 + Ztotal_X ** 2);

  // Corrente de curto trifásico simétrico máximo (no barramento principal)
  const Icc_max_3F = (1.05 * (Vn / Math.sqrt(3))) / Ztrafo; // kA
  // Corrente de curto no ponto — trifásico
  const Icc_3F_ponto = (1.05 * (Vn / Math.sqrt(3))) / Ztotal;
  // Corrente de curto mínimo (fase-terra, bifásico) ≈ 0.87 × Icc_3F
  const Icc_min = 0.87 * Icc_3F_ponto;
  // Corrente de arco (estimativa IEEE 1584: ~50% do Icc_sym para BT)
  const Icc_arc = input.includeArc ? 0.5 * Icc_3F_ponto : undefined;

  // Seção mínima pelo critério térmico — NBR 5410 (k = 115 para Cu/PVC, 143 Cu/XLPE)
  // S = Icc * sqrt(t) / k  — assume t = 0.2s (tempo de atuação do disjuntor)
  const k = input.insulation === 'PVC' ? 115 : 143;
  const tDisj = 0.2; // s
  const thermalSection = (Icc_3F_ponto * 1000 * Math.sqrt(tDisj)) / k;
  const thermalSectionCommercial = COMMERCIAL_SECTIONS.find(s => s >= thermalSection) || 240;

  if (Icc_max_3F > 25) warnings.push('Corrente de curto elevada (>25kA). Verifique uso de limitadores ou disjuntores de alta capacidade.');
  if (thermalSectionCommercial > input.cableSection) warnings.push(`Seção mínima pelo critério térmico (${thermalSectionCommercial}mm²) é MAIOR que a seção instalada (${input.cableSection}mm²). Risco de dano térmico ao cabo!`);

  return {
    iccMax: Math.round(Icc_max_3F / 1000 * 100) / 100,
    iccMin: Math.round(Icc_min / 1000 * 100) / 100,
    iccSymm: Math.round(Icc_3F_ponto / 1000 * 100) / 100,
    iccArc: Icc_arc ? Math.round(Icc_arc / 1000 * 100) / 100 : undefined,
    breakingCapacity: Math.ceil(Icc_max_3F / 1000),
    thermalSection: thermalSectionCommercial,
    warnings,
  };
}

// ─────────────────────────────────────────────────
// CÁLCULO 4: DISJUNTORES (NBR IEC 60947-2)
// ─────────────────────────────────────────────────
export interface CircuitBreakerInput {
  loadCurrent: number;    // A corrente de projeto
  cableAmpacity: number;  // A ampacidade do cabo (corrigida)
  iccMax: number;         // kA corrente de curto máxima
  loadType: 'resistivo' | 'motor' | 'capacitor' | 'iluminacao';
  curve: 'B' | 'C' | 'D';
}

export interface CircuitBreakerResult {
  requiredIn: number;       // A corrente nominal mínima
  recommendedIn: number;    // A disjuntor comercial recomendado
  poderDeInterrupcao: number; // kA mínimo
  i2check: boolean;         // I2 ≤ 1.45×Iz
  curveJustification: string;
  warnings: string[];
}

export function calcCircuitBreaker(input: CircuitBreakerInput): CircuitBreakerResult {
  const warnings: string[] = [];
  // Regra básica: Ib ≤ In ≤ Iz
  const Iz = input.cableAmpacity;
  const Ib = input.loadCurrent;

  const recommendedIn = CIRCUIT_BREAKERS.find(cb => cb >= Ib && cb <= Iz) ||
                        CIRCUIT_BREAKERS.find(cb => cb >= Ib) || 630;

  if (!CIRCUIT_BREAKERS.find(cb => cb >= Ib && cb <= Iz)) {
    warnings.push(`Não existe disjuntor comercial que satisfaça simultaneamente Ib (${Ib.toFixed(1)}A) ≤ In ≤ Iz (${Iz.toFixed(1)}A). Revise a bitola do cabo.`);
  }

  // Verificação I2 ≤ 1.45 × Iz (NBR 5410 item 9.2.2)
  const I2 = recommendedIn * 1.45;
  const i2check = I2 <= 1.45 * Iz;
  if (!i2check) warnings.push(`I2 = ${I2.toFixed(1)}A > 1.45×Iz = ${(1.45*Iz).toFixed(1)}A. Proteção inadequada.`);

  const curveMap = {
    B: 'Curva B: Recomendada para cargas resistivas e iluminação (disparada entre 3-5×In)',
    C: 'Curva C: Recomendada para uso geral, motores pequenos, transformadores (disparada entre 5-10×In)',
    D: 'Curva D: Recomendada para motores de grande porte, transformadores de alta inércia (disparada entre 10-20×In)',
  };

  return {
    requiredIn: Math.ceil(Ib),
    recommendedIn,
    poderDeInterrupcao: Math.max(6, Math.ceil(input.iccMax)),
    i2check,
    curveJustification: curveMap[input.curve],
    warnings,
  };
}

// ─────────────────────────────────────────────────
// CÁLCULO 5: DPS — NBR 5419-3 (ABNT IEC 62305-3)
// ─────────────────────────────────────────────────
export interface DPSInput {
  installationType: 'TN-S' | 'TN-C' | 'TT' | 'IT';
  voltage: number;          // V (220 ou 380)
  locationType: 'TIPO1' | 'TIPO2' | 'TIPO3';
  hasLPZ0A?: boolean;       // Zona de proteção contra raio (SPDA instalado)
  equipmentUw: number;      // kV tensão suportável dos equipamentos
}

export interface DPSResult {
  type: string;
  uc: number;               // V tensão de operação contínua mínima
  inNominal: number;        // kA corrente de descarga nominal
  imaxPico: number;         // kA corrente de descarga máxima
  up: number;               // kV nível de proteção de tensão
  waveform: string;
  coordenacao: string;
  warnings: string[];
}

export function calcDPS(input: DPSInput): DPSResult {
  const warnings: string[] = [];
  const Uc_min = input.voltage * 1.1; // Uc ≥ 1.1 × Un

  let inNominal: number, imaxPico: number, up: number, waveform: string;

  if (input.locationType === 'TIPO1') {
    inNominal = 12.5; // kA (impulso 10/350μs)
    imaxPico = 25;
    up = 4.0;
    waveform = '10/350 μs (impacto direto)';
    if (!input.hasLPZ0A) warnings.push('DPS Tipo 1 recomendado apenas quando há SPDA (para-raios) instalado.');
  } else if (input.locationType === 'TIPO2') {
    inNominal = 20;  // kA (impulso 8/20μs)
    imaxPico = 40;
    up = 2.5;
    waveform = '8/20 μs (surto induzido)';
  } else {
    inNominal = 5;   // kA
    imaxPico = 10;
    up = 1.5;
    waveform = '8/20 μs (proteção local)';
  }

  // Verificação de coordenação
  const equipUpOk = up <= input.equipmentUw * 0.8;
  if (!equipUpOk) warnings.push(`Nível de proteção Up (${up}kV) pode ser insuficiente para equipamentos com Uw = ${input.equipmentUw}kV. Considere proteção adicional Tipo 3.`);

  const coordenacao = input.locationType === 'TIPO1'
    ? 'Instalar entre o limite LPZ 0A e LPZ 1 (na entrada da instalação / após SPDA)'
    : input.locationType === 'TIPO2'
    ? 'Instalar nos quadros de distribuição secundários (limite LPZ 1 → LPZ 2)'
    : 'Instalar próximo aos equipamentos sensíveis (limite LPZ 2 → LPZ 3)';

  return {
    type: `DPS Tipo ${input.locationType.replace('TIPO', '')} — ${input.installationType}`,
    uc: Math.ceil(Uc_min),
    inNominal,
    imaxPico,
    up,
    waveform,
    coordenacao,
    warnings,
  };
}

// ─────────────────────────────────────────────────
// CÁLCULO 6: SISTEMA FOTOVOLTAICO
// Base: NBR 16690:2019 + IEC 62446
// ─────────────────────────────────────────────────
export interface SolarInput {
  monthlyConsumption: number; // kWh/mês
  hsp: number;                // Horas de Sol Pleno (manual ou CRESESB)
  modulePower: number;        // Wp por módulo
  systemVoltage: 220 | 380;   // V da rede
  performanceRatio: number;   // PR — eficiência global (0.75 a 0.85)
  moduleVoc: number;          // V — Tensão de circuito aberto
  moduleVmp: number;          // V — Tensão ponto máxima potência
  moduleIsc: number;          // A — Corrente de curto-circuito
  moduleImp: number;          // A — Corrente de máxima potência
  inverterVmpMin: number;     // V mínimo MPPT inversor
  inverterVmpMax: number;     // V máximo MPPT inversor
  inverterVocMax: number;     // V máximo de entrada Voc
  inverterIscMax: number;     // A máximo de entrada (por string)
  minTemp: number;            // °C temperatura mínima do local
  maxTemp: number;            // °C temperatura máxima do local
}

export interface SolarResult {
  requiredPower: number;      // kWp necessário
  numModules: number;
  seriesModules: number;      // Módulos em série por string
  parallelStrings: number;    // Strings em paralelo
  stringVoc: number;          // V Voc da string (temp mín)
  stringVmp: number;          // V Vmp da string
  arrayIsc: number;           // A corrente do array
  fusibleString: number;      // A fusível de string recomendado
  dcCableSection: number;     // mm² cabo DC recomendado
  warnings: string[];
}

export function calcSolar(input: SolarInput): SolarResult {
  const warnings: string[] = [];

  // Potência necessária
  const dailyConsumption = input.monthlyConsumption / 30;
  const requiredPower = (dailyConsumption / input.hsp) / input.performanceRatio;

  // Número de módulos
  const numModules = Math.ceil((requiredPower * 1000) / input.modulePower);

  // Configuração string — Tensão de string
  // Fator de correção de temperatura para Voc (coef típico -0.35%/°C)
  const vocTempCoeff = -0.0035;
  const vocMinTemp = input.moduleVoc * (1 + vocTempCoeff * (input.minTemp - 25));
  const vocMaxTemp = input.moduleVoc * (1 + vocTempCoeff * (input.maxTemp - 25));

  // Número de módulos em série: limitado por Voc máx e Vmp mín
  const maxSeriesByVoc = Math.floor(input.inverterVocMax / vocMinTemp);
  const minSeriesByVmp = Math.ceil(input.inverterVmpMin / (input.moduleVmp * (1 + vocTempCoeff * (input.maxTemp - 25))));
  const seriesModules = Math.min(maxSeriesByVoc, Math.floor(input.inverterVmpMax / input.moduleVmp));

  if (seriesModules < minSeriesByVmp) warnings.push('Não é possível garantir a tensão mínima do MPPT nas temperaturas máximas.');

  const parallelStrings = Math.ceil(numModules / seriesModules);
  const stringVoc = seriesModules * vocMinTemp;
  const stringVmp = seriesModules * input.moduleVmp;
  const arrayIsc = parallelStrings * input.moduleIsc;

  // Verificações
  if (stringVoc > input.inverterVocMax) warnings.push(`Voc da string (${stringVoc.toFixed(1)}V) excede o Voc máx do inversor (${input.inverterVocMax}V)!`);

  // Fusível de string — NBR 16690: In_fusível = 2 × Isc, mínimo 10A
  const fusibleCurrent = Math.max(10, Math.ceil(2 * input.moduleIsc));
  const fusibleOptions = [10, 15, 20, 25, 30];
  const fusibleString = fusibleOptions.find(f => f >= fusibleCurrent) || 32;

  // Cabo DC — limitado a 1% de queda ou corrente: usa 1.25 × Isc
  const dcCurrentDesign = 1.25 * input.moduleIsc;
  const dcVoltage = stringVmp;
  const maxDcDrop = 0.01 * dcVoltage; // 1% queda DC
  const dcLength = 20; // m — estimativa padrão (ajustar conforme projeto)
  const sectionDcCalc = (2 * RESISTIVITY.Cu * dcLength * dcCurrentDesign) / maxDcDrop;
  const dcCableSection = COMMERCIAL_SECTIONS.find(s => s >= sectionDcCalc) || 6;

  return {
    requiredPower: Math.round(requiredPower * 100) / 100,
    numModules,
    seriesModules,
    parallelStrings,
    stringVoc: Math.round(stringVoc * 10) / 10,
    stringVmp: Math.round(stringVmp * 10) / 10,
    arrayIsc: Math.round(arrayIsc * 10) / 10,
    fusibleString,
    dcCableSection,
    warnings,
  };
}

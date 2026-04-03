// ============================================================
// BANCO DE EQUIPAMENTOS — CORDEIRO ENERGIA
// Inversores, Baterias e Compatibilidade
// Base: datasheets GoodWe, SolaX, WEG, Solis, KEBA/t-bat
// ============================================================

export interface Battery {
  id: string;
  brand: string;
  model: string;
  capacityKwh: number;         // kWh por módulo/unidade
  voltageNominal: number;      // V DC
  voltageRange: [number, number]; // [Vmin, Vmax]
  maxDischargePower: number;   // kW
  maxChargePower: number;      // kW
  maxDod: number;              // % profundidade máxima de descarga
  roundtripEfficiency: number; // % eficiência ciclagem
  chemistry: 'LFP' | 'NMC' | 'LTO' | 'Lead-Acid';
  maxUnitsParallel: number;    // Máximo de módulos em paralelo
  maxUnitsSerial?: number;
  maxTotalCapacityKwh?: number;
  dimensions: string;          // LxAxP mm
  weightKg: number;
  ipRating: string;
  operating_temp: string;
  warranty_years: number;
  compatibleInverters: string[]; // IDs dos inversores compatíveis
  priceEstBrl?: number;        // Preço estimado BRL por unidade
  observations?: string;
}

export interface Inverter {
  id: string;
  brand: string;
  model: string;
  type: 'HYBRID' | 'STRING' | 'MICRO' | 'OFFGRID';
  powerKw: number;             // kW AC nominal
  phases: 1 | 3;
  maxPvPowerKwp: number;       // kWp DC máximo
  numMppt: number;
  maxVocPerMppt: number;       // V
  mpptVoltageRange: [number, number]; // [Vmin, Vmax] MPPT
  maxIscPerMppt: number;       // A
  maxBatteryVoltage: number;   // V DC
  batteryVoltageRange: [number, number];
  maxChargeCurrent: number;    // A
  maxDischargeCurrent: number; // A
  efficiency: number;          // % eficiência máxima
  gridExportPower?: number;    // kW máximo de exportação
  gridFrequency: string;       // Hz
  gridVoltage: string;         // V
  protections: string[];
  dimensions: string;
  weightKg: number;
  ipRating: string;
  warranty_years: number;
  compatibleBatteries: string[]; // IDs das baterias compatíveis
  hasBackup: boolean;
  maxBackupPower?: number;     // kW
  priceEstBrl?: number;
}

// ─────────────────────────────────────────────────
// BANCO DE BATERIAS
// ─────────────────────────────────────────────────
export const BATTERIES: Battery[] = [
  {
    id: "solax-tbat-hv58",
    brand: "KEBA / SolaX",
    model: "t-bat sys HV 5.8",
    capacityKwh: 5.8,
    voltageNominal: 192,
    voltageRange: [160, 220],
    maxDischargePower: 5.8,
    maxChargePower: 5.8,
    maxDod: 90,
    roundtripEfficiency: 95,
    chemistry: 'LFP',
    maxUnitsParallel: 4,
    maxTotalCapacityKwh: 23.2,
    dimensions: "680×350×140 mm",
    weightKg: 62.5,
    ipRating: "IP55",
    operating_temp: "-10°C a +50°C",
    warranty_years: 10,
    compatibleInverters: ["solax-x1-hybrid-g4", "solax-x3-hybrid-g4"],
    priceEstBrl: 18000,
    observations: "LFP, modular, empilhável. Compatível exclusivamente com inversores SolaX Gen4.",
  },
  {
    id: "goodwe-lynx-home-f-5",
    brand: "GoodWe",
    model: "Lynx Home F 5 kWh",
    capacityKwh: 5.0,
    voltageNominal: 48,
    voltageRange: [44, 58],
    maxDischargePower: 5.0,
    maxChargePower: 5.0,
    maxDod: 90,
    roundtripEfficiency: 95,
    chemistry: 'LFP',
    maxUnitsParallel: 4,
    maxTotalCapacityKwh: 20,
    dimensions: "465×165×695 mm",
    weightKg: 53,
    ipRating: "IP55",
    operating_temp: "-10°C a +50°C",
    warranty_years: 10,
    compatibleInverters: ["goodwe-es-g2-36", "goodwe-es-g2-50", "goodwe-es-g2-60"],
    priceEstBrl: 15000,
  },
  {
    id: "goodwe-lynx-home-f-10",
    brand: "GoodWe",
    model: "Lynx Home F 10 kWh",
    capacityKwh: 10.0,
    voltageNominal: 48,
    voltageRange: [44, 58],
    maxDischargePower: 10.0,
    maxChargePower: 10.0,
    maxDod: 90,
    roundtripEfficiency: 95,
    chemistry: 'LFP',
    maxUnitsParallel: 3,
    maxTotalCapacityKwh: 30,
    dimensions: "465×165×695 mm",
    weightKg: 100,
    ipRating: "IP55",
    operating_temp: "-10°C a +50°C",
    warranty_years: 10,
    compatibleInverters: ["goodwe-es-g2-36", "goodwe-es-g2-50", "goodwe-es-g2-60", "goodwe-et-12kw", "goodwe-et-15kw"],
    priceEstBrl: 28000,
  },
  {
    id: "weg-essw-30",
    brand: "WEG",
    model: "ESSW 30 kWh",
    capacityKwh: 30.0,
    voltageNominal: 600,
    voltageRange: [500, 700],
    maxDischargePower: 30.0,
    maxChargePower: 30.0,
    maxDod: 90,
    roundtripEfficiency: 94,
    chemistry: 'LFP',
    maxUnitsParallel: 8,
    maxTotalCapacityKwh: 240,
    dimensions: "600×250×1060 mm",
    weightKg: 280,
    ipRating: "IP54",
    operating_temp: "0°C a +45°C",
    warranty_years: 10,
    compatibleInverters: ["weg-sunny-tripower-15", "weg-solar-inverter-10"],
    priceEstBrl: 95000,
    observations: "Uso comercial/industrial. Sistema rack modular.",
  },
  {
    id: "solax-triple-power-hv-56",
    brand: "SolaX",
    model: "Triple Power HV 5.6 kWh",
    capacityKwh: 5.6,
    voltageNominal: 200,
    voltageRange: [170, 230],
    maxDischargePower: 5.6,
    maxChargePower: 5.6,
    maxDod: 90,
    roundtripEfficiency: 95,
    chemistry: 'LFP',
    maxUnitsParallel: 4,
    maxTotalCapacityKwh: 22.4,
    dimensions: "680×350×140 mm",
    weightKg: 55,
    ipRating: "IP55",
    operating_temp: "-10°C a +50°C",
    warranty_years: 10,
    compatibleInverters: ["solax-x1-hybrid-g4", "solax-x3-hybrid-g4"],
    priceEstBrl: 16000,
  },
  {
    id: "solis-batt-hv-58",
    brand: "Solis",
    model: "Bateria HV 5.8 kWh",
    capacityKwh: 5.8,
    voltageNominal: 186,
    voltageRange: [155, 210],
    maxDischargePower: 5.0,
    maxChargePower: 5.0,
    maxDod: 90,
    roundtripEfficiency: 95,
    chemistry: 'LFP',
    maxUnitsParallel: 4,
    maxTotalCapacityKwh: 23.2,
    dimensions: "460×170×700 mm",
    weightKg: 60,
    ipRating: "IP55",
    operating_temp: "-10°C a +50°C",
    warranty_years: 10,
    compatibleInverters: ["solis-rh13-36", "solis-rh13-50", "solis-rh13-60"],
    priceEstBrl: 17500,
  },
  {
    id: "custom-manual",
    brand: "Personalizado",
    model: "Inserção Manual",
    capacityKwh: 0,
    voltageNominal: 48,
    voltageRange: [40, 60],
    maxDischargePower: 5,
    maxChargePower: 5,
    maxDod: 80,
    roundtripEfficiency: 90,
    chemistry: 'LFP',
    maxUnitsParallel: 8,
    dimensions: "—",
    weightKg: 0,
    ipRating: "—",
    operating_temp: "—",
    warranty_years: 0,
    compatibleInverters: [],
    observations: "Parâmetros personalizados pelo usuário.",
  },
];

// ─────────────────────────────────────────────────
// BANCO DE INVERSORES
// ─────────────────────────────────────────────────
export const INVERTERS: Inverter[] = [
  {
    id: "solax-x1-hybrid-g4",
    brand: "SolaX",
    model: "X1-Hybrid G4 — 3.7-6.0 kW",
    type: "HYBRID",
    powerKw: 6.0,
    phases: 1,
    maxPvPowerKwp: 9.9,
    numMppt: 2,
    maxVocPerMppt: 580,
    mpptVoltageRange: [90, 520],
    maxIscPerMppt: 14,
    maxBatteryVoltage: 230,
    batteryVoltageRange: [160, 230],
    maxChargeCurrent: 40,
    maxDischargeCurrent: 40,
    efficiency: 97.6,
    gridFrequency: "60 Hz",
    gridVoltage: "220 V monofásico",
    protections: ["Anti-ilhamento", "AFCI", "GFCI", "Proteção UV", "OVP/OCP"],
    dimensions: "395×315×181 mm",
    weightKg: 9.5,
    ipRating: "IP65",
    warranty_years: 10,
    compatibleBatteries: ["solax-tbat-hv58", "solax-triple-power-hv-56"],
    hasBackup: true,
    maxBackupPower: 6.0,
    priceEstBrl: 12000,
  },
  {
    id: "goodwe-es-g2-36",
    brand: "GoodWe",
    model: "ES G2 — 3.6 kW",
    type: "HYBRID",
    powerKw: 3.6,
    phases: 1,
    maxPvPowerKwp: 5.4,
    numMppt: 2,
    maxVocPerMppt: 600,
    mpptVoltageRange: [90, 550],
    maxIscPerMppt: 13,
    maxBatteryVoltage: 58.8,
    batteryVoltageRange: [44, 58.8],
    maxChargeCurrent: 100,
    maxDischargeCurrent: 100,
    efficiency: 97.2,
    gridFrequency: "60 Hz",
    gridVoltage: "220 V monofásico",
    protections: ["Anti-ilhamento", "AFCI", "GFCI", "OVP/OCP"],
    dimensions: "390×210×161 mm",
    weightKg: 9.2,
    ipRating: "IP65",
    warranty_years: 10,
    compatibleBatteries: ["goodwe-lynx-home-f-5", "goodwe-lynx-home-f-10"],
    hasBackup: true,
    maxBackupPower: 3.6,
    priceEstBrl: 9500,
  },
  {
    id: "goodwe-es-g2-50",
    brand: "GoodWe",
    model: "ES G2 — 5.0 kW",
    type: "HYBRID",
    powerKw: 5.0,
    phases: 1,
    maxPvPowerKwp: 7.5,
    numMppt: 2,
    maxVocPerMppt: 600,
    mpptVoltageRange: [90, 550],
    maxIscPerMppt: 13,
    maxBatteryVoltage: 58.8,
    batteryVoltageRange: [44, 58.8],
    maxChargeCurrent: 100,
    maxDischargeCurrent: 100,
    efficiency: 97.4,
    gridFrequency: "60 Hz",
    gridVoltage: "220 V monofásico",
    protections: ["Anti-ilhamento", "AFCI", "GFCI", "OVP/OCP"],
    dimensions: "390×210×161 mm",
    weightKg: 9.5,
    ipRating: "IP65",
    warranty_years: 10,
    compatibleBatteries: ["goodwe-lynx-home-f-5", "goodwe-lynx-home-f-10"],
    hasBackup: true,
    maxBackupPower: 5.0,
    priceEstBrl: 11000,
  },
  {
    id: "goodwe-es-g2-60",
    brand: "GoodWe",
    model: "ES G2 — 6.0 kW",
    type: "HYBRID",
    powerKw: 6.0,
    phases: 1,
    maxPvPowerKwp: 9.0,
    numMppt: 2,
    maxVocPerMppt: 600,
    mpptVoltageRange: [90, 550],
    maxIscPerMppt: 13,
    maxBatteryVoltage: 58.8,
    batteryVoltageRange: [44, 58.8],
    maxChargeCurrent: 100,
    maxDischargeCurrent: 100,
    efficiency: 97.4,
    gridFrequency: "60 Hz",
    gridVoltage: "220 V monofásico",
    protections: ["Anti-ilhamento", "AFCI", "GFCI", "OVP/OCP"],
    dimensions: "390×210×161 mm",
    weightKg: 10.0,
    ipRating: "IP65",
    warranty_years: 10,
    compatibleBatteries: ["goodwe-lynx-home-f-5", "goodwe-lynx-home-f-10"],
    hasBackup: true,
    maxBackupPower: 6.0,
    priceEstBrl: 13000,
  },
  {
    id: "goodwe-et-12kw",
    brand: "GoodWe",
    model: "ET 12 kW Trifásico",
    type: "HYBRID",
    powerKw: 12.0,
    phases: 3,
    maxPvPowerKwp: 18.0,
    numMppt: 2,
    maxVocPerMppt: 1000,
    mpptVoltageRange: [200, 850],
    maxIscPerMppt: 20,
    maxBatteryVoltage: 620,
    batteryVoltageRange: [500, 620],
    maxChargeCurrent: 100,
    maxDischargeCurrent: 100,
    efficiency: 98.0,
    gridFrequency: "60 Hz",
    gridVoltage: "220/380 V trifásico",
    protections: ["Anti-ilhamento", "AFCI", "GFCI", "OVP/OCP", "Arc-Fault"],
    dimensions: "500×420×185 mm",
    weightKg: 21.0,
    ipRating: "IP65",
    warranty_years: 10,
    compatibleBatteries: ["goodwe-lynx-home-f-10"],
    hasBackup: true,
    maxBackupPower: 12.0,
    priceEstBrl: 28000,
  },
  {
    id: "solis-rh13-36",
    brand: "Solis",
    model: "RH13 — 3.6 kW",
    type: "HYBRID",
    powerKw: 3.6,
    phases: 1,
    maxPvPowerKwp: 5.4,
    numMppt: 2,
    maxVocPerMppt: 600,
    mpptVoltageRange: [90, 550],
    maxIscPerMppt: 13,
    maxBatteryVoltage: 210,
    batteryVoltageRange: [155, 210],
    maxChargeCurrent: 50,
    maxDischargeCurrent: 50,
    efficiency: 97.5,
    gridFrequency: "60 Hz",
    gridVoltage: "220 V monofásico",
    protections: ["Anti-ilhamento", "OVP/OCP", "GFCI"],
    dimensions: "400×320×180 mm",
    weightKg: 11.4,
    ipRating: "IP65",
    warranty_years: 10,
    compatibleBatteries: ["solis-batt-hv-58"],
    hasBackup: true,
    maxBackupPower: 3.6,
    priceEstBrl: 8500,
  },
  {
    id: "solis-rh13-50",
    brand: "Solis",
    model: "RH13 — 5.0 kW",
    type: "HYBRID",
    powerKw: 5.0,
    phases: 1,
    maxPvPowerKwp: 7.5,
    numMppt: 2,
    maxVocPerMppt: 600,
    mpptVoltageRange: [90, 550],
    maxIscPerMppt: 13,
    maxBatteryVoltage: 210,
    batteryVoltageRange: [155, 210],
    maxChargeCurrent: 50,
    maxDischargeCurrent: 50,
    efficiency: 97.5,
    gridFrequency: "60 Hz",
    gridVoltage: "220 V monofásico",
    protections: ["Anti-ilhamento", "OVP/OCP", "GFCI"],
    dimensions: "400×320×180 mm",
    weightKg: 11.6,
    ipRating: "IP65",
    warranty_years: 10,
    compatibleBatteries: ["solis-batt-hv-58"],
    hasBackup: true,
    maxBackupPower: 5.0,
    priceEstBrl: 10000,
  },
  {
    id: "weg-essw-inverter",
    brand: "WEG",
    model: "ESSW Inversor 15 kW",
    type: "HYBRID",
    powerKw: 15.0,
    phases: 3,
    maxPvPowerKwp: 22.5,
    numMppt: 2,
    maxVocPerMppt: 1000,
    mpptVoltageRange: [200, 800],
    maxIscPerMppt: 22,
    maxBatteryVoltage: 700,
    batteryVoltageRange: [500, 700],
    maxChargeCurrent: 120,
    maxDischargeCurrent: 120,
    efficiency: 98.0,
    gridFrequency: "60 Hz",
    gridVoltage: "220/380 V trifásico",
    protections: ["Anti-ilhamento", "OVP/OCP", "GFCI", "Arc-Fault"],
    dimensions: "700×550×280 mm",
    weightKg: 45.0,
    ipRating: "IP54",
    warranty_years: 10,
    compatibleBatteries: ["weg-essw-30"],
    hasBackup: true,
    maxBackupPower: 15.0,
    priceEstBrl: 65000,
  },
];

// ─────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────
export function getCompatibleBatteries(inverterId: string): Battery[] {
  const inverter = INVERTERS.find(i => i.id === inverterId);
  if (!inverter) return [];
  return BATTERIES.filter(b => inverter.compatibleBatteries.includes(b.id));
}

export function getCompatibleInverters(batteryId: string): Inverter[] {
  const battery = BATTERIES.find(b => b.id === batteryId);
  if (!battery) return [];
  return INVERTERS.filter(i => battery.compatibleInverters.includes(i.id));
}

export function suggestSystem(peakPowerKw: number, requiredCapacityKwh: number, phases: 1 | 3): {
  inverter: Inverter;
  battery: Battery;
  units: number;
  totalCapacityKwh: number;
}[] {
  const suggestions: ReturnType<typeof suggestSystem> = [];
  for (const inverter of INVERTERS) {
    if (inverter.phases !== phases) continue;
    if (inverter.powerKw < peakPowerKw * 0.9) continue;
    for (const battId of inverter.compatibleBatteries) {
      const battery = BATTERIES.find(b => b.id === battId);
      if (!battery || battery.id === 'custom-manual') continue;
      const unitsNeeded = Math.ceil(requiredCapacityKwh / (battery.capacityKwh * battery.maxDod / 100));
      const unitsMax = battery.maxUnitsParallel;
      if (unitsNeeded > unitsMax) continue;
      suggestions.push({
        inverter,
        battery,
        units: unitsNeeded,
        totalCapacityKwh: unitsNeeded * battery.capacityKwh,
      });
    }
  }
  return suggestions.sort((a, b) => a.inverter.powerKw - b.inverter.powerKw);
}


export interface Vehicle {
  vin?: string;
  make: string;
  model: string;
  year: number;
}

export interface Detection {
  label: string;
  confidence: number;
  geometry: object;
}

export interface Drivetrain {
  motor: string;
  inverter: string;
  gearRatio: number;
}

export interface Battery {
  chemistry: 'LFP' | 'NMC' | 'LTO';
  voltage: number;
  capacity_kWh: number;
  packLayout: string;
}

export interface SafetyRisk {
  code: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  remediation: string;
}

export interface Safety {
  standards: string[];
  risks: SafetyRisk[];
}

export interface BOMItem {
  sku: string;
  qty: number;
  unitCost: number;
  description?: string;
}

export interface Cost {
  parts: number;
  labor: number;
  overhead: number;
  total: number;
}

export interface Export {
  pdfUri?: string;
  jsonUri?: string;
}

export interface ConversionPlan {
  vehicle: Vehicle;
  detections?: Detection[];
  drivetrain: Drivetrain;
  battery: Battery;
  wiring?: string[];
  safety: Safety;
  bom: BOMItem[];
  laborHours: number;
  cost: Cost;
  citations?: { web: { uri: string; title: string; } }[];
  export?: Export;
  summary: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
  citations?: { web: { uri: string; title: string; } }[];
}

export interface GroundingChunk {
  web?: {
      uri: string;
      title: string;
  };
  maps?: {
      uri: string;
      title: string;
      placeAnswerSources?: {
        reviewSnippets?: {
            uri: string;
            title: string;
        }[]
      }
  };
}

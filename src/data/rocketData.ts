export interface EnginePart {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  specs: { label: string; value: string }[];
  /** position when assembled (relative to engine center) */
  assembledPos: [number, number, number];
  /** position when exploded */
  explodedPos: [number, number, number];
  /** material color */
  color: string;
  metalness: number;
  roughness: number;
  /** geometry type for procedural rendering */
  geometry: "lathe" | "cylinder" | "torus" | "box" | "sphere" | "cone";
  /** lathe profile points [radius, y] for lathe geometry */
  profile?: [number, number][];
}

// Scaled 2.5x from original for better visibility
// Refined from 9 → 19 points for smoother throat convergence/divergence transition
const nozzleProfile: [number, number][] = [
  [0.05, 0],       // exit lip
  [0.08, 0.01],
  [0.14, 0.03],
  [0.21, 0.06],
  [0.27, 0.11],
  [0.31, 0.17],
  [0.33, 0.22],
  [0.343, 0.26],   // approaching throat outer bulge
  [0.35, 0.30],    // throat outer bulge (max radius)
  [0.347, 0.34],   // post-throat transition
  [0.335, 0.38],
  [0.31, 0.43],
  [0.28, 0.49],
  [0.24, 0.56],
  [0.20, 0.62],
  [0.16, 0.67],
  [0.125, 0.72],
  [0.095, 0.76],
  [0.075, 0.80],   // top – connects to combustion chamber
];

const chamberProfile: [number, number][] = [
  [0.075, 0],
  [0.09, 0.05],
  [0.125, 0.10],
  [0.15, 0.15],
  [0.15, 0.50],
  [0.14, 0.55],
  [0.125, 0.60],
  [0.09, 0.65],
  [0.09, 0.70],
];

const injectorProfile: [number, number][] = [
  [0, 0],
  [0.15, 0],
  [0.15, 0.04],
  [0.14, 0.05],
  [0.10, 0.055],
  [0, 0.055],
];

export const MERLIN_ENGINE_PARTS: EnginePart[] = [
  {
    id: "nozzle",
    name: "喷管",
    nameEn: "Nozzle",
    description: "Laval 收扩喷管，将高温高压燃气膨胀加速至超音速。再生冷却通道嵌入管壁。",
    specs: [
      { label: "类型", value: "Laval (收扩)" },
      { label: "喉径", value: "0.27 m" },
      { label: "出口径", value: "0.91 m" },
      { label: "面积比", value: "16:1" },
      { label: "冷却", value: "再生冷却" },
    ],
    assembledPos: [0, -0.88, 0],
    explodedPos: [0, -3.0, 0],
    color: "#3a3a44",
    metalness: 0.9,
    roughness: 0.35,
    geometry: "lathe",
    profile: nozzleProfile,
  },
  {
    id: "combustion-chamber",
    name: "燃烧室",
    nameEn: "Combustion Chamber",
    description: "推进剂在室压 9.7 MPa 下混合燃烧，温度达 3,300°C。镍基合金壁内嵌再生冷却通道。",
    specs: [
      { label: "室压", value: "9.7 MPa" },
      { label: "温度", value: "3,300°C" },
      { label: "材料", value: "镍基合金" },
      { label: "冷却", value: "再生冷却" },
    ],
    assembledPos: [0, 0, 0],
    explodedPos: [0, 0.75, 0],
    color: "#8b3a2a",
    metalness: 0.7,
    roughness: 0.4,
    geometry: "lathe",
    profile: chamberProfile,
  },
  {
    id: "injector",
    name: "喷注器",
    nameEn: "Injector",
    description: "多孔平板喷注器，中心+外圈孔阵精确控制燃料与氧化剂的混合比例和分布。",
    specs: [
      { label: "类型", value: "多孔平板" },
      { label: "孔数", value: "~1,000+" },
      { label: "混合比", value: "2.36 (O/F)" },
    ],
    assembledPos: [0, 0.38, 0],
    explodedPos: [0, 1.75, 0],
    color: "#c0c0c8",
    metalness: 0.85,
    roughness: 0.25,
    geometry: "lathe",
    profile: injectorProfile,
  },
  {
    id: "turbopump",
    name: "涡轮泵",
    nameEn: "Turbopump",
    description: "双级离心泵 + 单级涡轮，功率 3,600 kW，转速 36,000 RPM。燃料泵与氧化剂泵同轴驱动。",
    specs: [
      { label: "功率", value: "3,600 kW" },
      { label: "转速", value: "36,000 RPM" },
      { label: "燃料流量", value: "85 kg/s" },
      { label: "氧化剂流量", value: "201 kg/s" },
    ],
    assembledPos: [0.20, 0.13, 0],
    explodedPos: [1.5, 0.25, 0],
    color: "#4a6fa5",
    metalness: 0.8,
    roughness: 0.3,
    geometry: "sphere",
  },
  {
    id: "gas-generator",
    name: "燃气发生器",
    nameEn: "Gas Generator",
    description: "富燃开式循环，少量推进剂燃烧产生燃气驱动涡轮。排气温度约 650°C。",
    specs: [
      { label: "循环方式", value: "富燃开式" },
      { label: "燃气温度", value: "650°C" },
      { label: "流量占比", value: "~3%" },
    ],
    assembledPos: [-0.20, 0.13, 0],
    explodedPos: [-1.38, 0.38, 0],
    color: "#6a8a4a",
    metalness: 0.75,
    roughness: 0.35,
    geometry: "cylinder",
  },
  {
    id: "thrust-frame",
    name: "推力架",
    nameEn: "Thrust Frame",
    description: "锥形承力结构，将发动机推力传递至箭体。Octaweb 布局容纳 9 台发动机。",
    specs: [
      { label: "布局", value: "Octaweb" },
      { label: "材料", value: "钛合金/钢" },
      { label: "数量", value: "9台 (一级)" },
    ],
    assembledPos: [0, 0.63, 0],
    explodedPos: [0, 2.5, 0],
    color: "#5a5a64",
    metalness: 0.7,
    roughness: 0.45,
    geometry: "torus",
  },
  {
    id: "valves",
    name: "阀门组件",
    nameEn: "Valve Assembly",
    description: "主阀、泄压阀、节流阀。机电驱动，响应时间 < 10ms。控制推进剂供给和发动机节流。",
    specs: [
      { label: "类型", value: "机电球阀" },
      { label: "响应", value: "< 10ms" },
      { label: "节流范围", value: "40%-100%" },
    ],
    assembledPos: [0.13, -0.25, 0.13],
    explodedPos: [1.0, -1.0, 0.75],
    color: "#8a6a3a",
    metalness: 0.8,
    roughness: 0.3,
    geometry: "box",
  },
  {
    id: "igniter",
    name: "点火器",
    nameEn: "Igniter",
    description: "位于喷注器中心，TEB/TEA 化学点火。双冗余设计确保可靠点火。",
    specs: [
      { label: "类型", value: "TEB/TEA 化学" },
      { label: "冗余", value: "双冗余" },
      { label: "位置", value: "喷注器中心" },
    ],
    assembledPos: [0, 0.35, 0],
    explodedPos: [0, 2.25, 0],
    color: "#c4a030",
    metalness: 0.6,
    roughness: 0.4,
    geometry: "sphere",
  },
];

export const MERLIN_SPECS = {
  name: "Merlin 1D",
  fullName: "Merlin 1D + MVac",
  thrustSea: "845 kN",
  thrustVacuum: "981 kN",
  isp: "282s / 311s",
  weight: "470 kg",
  thrustWeight: "179.8",
  chamberPressure: "9.7 MPa",
} as const;

export const FALCON9_SPECS = {
  height: "70 m",
  diameter: "3.7 m",
  thrust: "7,607 kN",
  stages: 2,
  enginesStage1: 9,
  enginesStage2: 1,
} as const;

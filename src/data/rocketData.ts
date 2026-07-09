export interface RocketComponent {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  specs: { label: string; value: string }[];
  explodeOffset: [number, number, number];
  position: [number, number, number];
  color: string;
}

export interface EnginePart {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  specs: { label: string; value: string }[];
  explodeOffset: [number, number, number];
  position: [number, number, number];
  color: string;
}

export const ROCKET_SPECS = {
  totalHeight: 70,
  diameter: 3.7,
  thrust: "7,607 kN",
  stages: 2,
} as const;

export const ROCKET_COMPONENTS: RocketComponent[] = [
  {
    id: "fairing",
    name: "整流罩",
    nameEn: "Payload Fairing",
    description: "保护有效载荷在大气层内不受气动加热和压力影响，在上升阶段分离抛弃。",
    specs: [
      { label: "高度", value: "13.1 m" },
      { label: "直径", value: "3.7 m" },
      { label: "材质", value: "碳纤维/铝蜂窝复合材料" },
    ],
    position: [0, 28, 0],
    explodeOffset: [0, 12, 0],
    color: "#e8e8e8",
  },
  {
    id: "stage2",
    name: "二级火箭",
    nameEn: "Second Stage",
    description: "配备单台 Merlin 1D Vacuum 发动机，负责将载荷送入最终轨道。",
    specs: [
      { label: "高度", value: "14.8 m" },
      { label: "直径", value: "3.7 m" },
      { label: "发动机", value: "1 × Merlin 1D Vacuum" },
      { label: "推力", value: "934 kN (真空)" },
      { label: "推进剂", value: "液氧/煤油 (LOX/RP-1)" },
    ],
    position: [0, 14, 0],
    explodeOffset: [0, 6, 0],
    color: "#e8e8e8",
  },
  {
    id: "stage1",
    name: "一级火箭",
    nameEn: "First Stage",
    description: "配备9台 Merlin 1D 发动机，提供起飞推力，可回收复用。",
    specs: [
      { label: "高度", value: "41.2 m" },
      { label: "直径", value: "3.7 m" },
      { label: "发动机", value: "9 × Merlin 1D" },
      { label: "推力", value: "7,607 kN (海平面)" },
      { label: "推进剂", value: "液氧/煤油 (LOX/RP-1)" },
      { label: "可回收", value: "是" },
    ],
    position: [0, -14, 0],
    explodeOffset: [0, -8, 0],
    color: "#e8e8e8",
  },
];

export const ENGINE_PARTS: EnginePart[] = [
  {
    id: "combustion-chamber",
    name: "燃烧室",
    nameEn: "Combustion Chamber",
    description: "推进剂在此混合燃烧，产生高温高压气体驱动火箭飞行。",
    specs: [
      { label: "室压", value: "9.7 MPa" },
      { label: "温度", value: "~3,300°C" },
      { label: "材料", value: "镍基合金 + 再生冷却" },
    ],
    position: [0, 0, 0],
    explodeOffset: [0, 1.5, 0],
    color: "#cc4422",
  },
  {
    id: "turbopump",
    name: "涡轮泵",
    nameEn: "Turbopump",
    description: "将推进剂从储箱高压输送至燃烧室，单台功率约 3,600 kW。",
    specs: [
      { label: "功率", value: "3,600 kW" },
      { label: "转速", value: "36,000 RPM" },
      { label: "燃料流量", value: "85 kg/s" },
    ],
    position: [0, 0, 0],
    explodeOffset: [2, 0, 0],
    color: "#4488cc",
  },
  {
    id: "nozzle",
    name: "喷管",
    nameEn: "Nozzle",
    description: "拉瓦尔喷管，将高温气体膨胀加速至超音速，产生推力。",
    specs: [
      { label: "类型", value: "拉瓦尔 (Laval)" },
      { label: "喉径", value: "~0.3 m" },
      { label: "出口径", value: "~1.2 m" },
      { label: "面积比", value: "16:1 (海平面)" },
    ],
    position: [0, 0, 0],
    explodeOffset: [0, -2, 0],
    color: "#666666",
  },
  {
    id: "gas-generator",
    name: "燃气发生器",
    nameEn: "Gas Generator",
    description: "通过少量推进剂燃烧产生燃气驱动涡轮泵，采用富燃循环。",
    specs: [
      { label: "循环方式", value: "富燃开式循环" },
      { label: "燃气温度", value: "~650°C" },
    ],
    position: [0, 0, 0],
    explodeOffset: [-2, 0, 0],
    color: "#88aa44",
  },
  {
    id: "thrust-frame",
    name: "推力架",
    nameEn: "Thrust Frame",
    description: "将发动机推力传递至箭体结构的承力框架，9台发动机呈九宫格排列。",
    specs: [
      { label: "布局", value: "Octaweb (9台)" },
      { label: "材料", value: "钛合金/钢" },
    ],
    position: [0, 0, 0],
    explodeOffset: [0, -3.5, 0],
    color: "#888888",
  },
];

export const MERLIN_SPECS = {
  name: "Merlin 1D",
  thrustSea: "845 kN",
  thrustVacuum: "981 kN",
  isp: "282s (海平面) / 311s (真空)",
  weight: "470 kg",
  thrustWeight: "179.8",
  chamberPressure: "9.7 MPa",
} as const;

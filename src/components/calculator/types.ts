export type Section = "home" | "calculator" | "breakdown" | "contacts";

export interface RoomDimensions {
  length: string;
  width: string;
  height: string;
  doors: string;
  windows: string;
}

export interface Variant {
  id: string;
  name: string;
  description: string;
  priceCoeff: number;
  features: string[];
}

export interface CalcItem {
  name: string;
  quantity: number;
  unit: string;
  price: number;
  total: number;
  category: string;
}

export interface CalculationResult {
  wallArea: number;
  floorArea: number;
  ceilingArea: number;
  netWallArea: number;
  perimeter: number;
  items: CalcItem[];
  totalCost: number;
}

export interface ChatMessage {
  role: "user" | "manager";
  text: string;
  time: string;
}

export interface Measurements {
  room_width: string;
  room_length_left: string;
  room_length_right: string;
  height_to_sill: string;
  height_sill_to_top: string;
  client_name: string;
  client_phone: string;
  comment: string;
}

export const SAVE_MEASUREMENTS_URL = "https://functions.poehali.dev/bb4233a4-cd8e-48b4-a5b1-a11d3acad3d0";

export const VARIANTS: Variant[] = [
  {
    id: "economy",
    name: "Эконом",
    description: "Базовые материалы среднего качества",
    priceCoeff: 1,
    features: ["Краска 1-го класса", "Ламинат 31 класс", "Российские материалы"],
  },
  {
    id: "standard",
    name: "Стандарт",
    description: "Оптимальное соотношение цена/качество",
    priceCoeff: 1.6,
    features: ["Краска 2-го класса", "Ламинат 32 класс", "Европейские бренды"],
  },
  {
    id: "premium",
    name: "Премиум",
    description: "Материалы высокого класса",
    priceCoeff: 2.8,
    features: ["Дизайнерская краска", "Паркетная доска", "Немецкое качество"],
  },
];

export const MANAGER_REPLIES = [
  "Понял вас! Уточните площадь помещения — это поможет дать точный ответ.",
  "Хороший вопрос. Рекомендую обратить внимание на влагостойкость, если речь о кухне или ванной.",
  "Могу организовать выезд замерщика на следующей неделе — удобно?",
  "Для этого вида работ мы используем только проверенных мастеров с портфолио.",
  "Да, предоставляем гарантию на все виды отделочных работ — 2 года.",
];

export function calcResults(dims: RoomDimensions, coeff: number): CalculationResult | null {
  const l = parseFloat(dims.length);
  const w = parseFloat(dims.width);
  const h = parseFloat(dims.height);
  const doors = parseInt(dims.doors) || 0;
  const windows = parseInt(dims.windows) || 0;
  if (!l || !w || !h) return null;

  const wallArea = 2 * (l + w) * h;
  const floorArea = l * w;
  const ceilingArea = l * w;
  const perimeter = 2 * (l + w);
  const netWallArea = Math.max(0, wallArea - doors * 2.0 - windows * 1.5);

  const items: CalcItem[] = [
    { name: "Грунтовка", quantity: Math.ceil(netWallArea / 10), unit: "л", price: Math.round(180 * coeff), total: Math.ceil(netWallArea / 10) * Math.round(180 * coeff), category: "Стены" },
    { name: "Шпатлёвка финишная", quantity: Math.ceil(netWallArea * 1.2), unit: "кг", price: Math.round(45 * coeff), total: Math.ceil(netWallArea * 1.2) * Math.round(45 * coeff), category: "Стены" },
    { name: "Краска для стен", quantity: Math.ceil(netWallArea / 10), unit: "л", price: Math.round(320 * coeff), total: Math.ceil(netWallArea / 10) * Math.round(320 * coeff), category: "Стены" },
    { name: "Краска потолочная", quantity: Math.ceil(ceilingArea / 10), unit: "л", price: Math.round(280 * coeff), total: Math.ceil(ceilingArea / 10) * Math.round(280 * coeff), category: "Потолок" },
    { name: "Ламинат", quantity: Math.ceil(floorArea * 1.1 * 10) / 10, unit: "м²", price: Math.round(890 * coeff), total: (Math.ceil(floorArea * 1.1 * 10) / 10) * Math.round(890 * coeff), category: "Пол" },
    { name: "Подложка", quantity: Math.ceil(floorArea * 1.05 * 10) / 10, unit: "м²", price: Math.round(85 * coeff), total: (Math.ceil(floorArea * 1.05 * 10) / 10) * Math.round(85 * coeff), category: "Пол" },
    { name: "Плинтус напольный", quantity: Math.ceil(perimeter), unit: "м.п.", price: Math.round(120 * coeff), total: Math.ceil(perimeter) * Math.round(120 * coeff), category: "Пол" },
  ];

  return { wallArea, floorArea, ceilingArea, netWallArea, perimeter, items, totalCost: items.reduce((s, i) => s + i.total, 0) };
}

export function fmt(n: number) {
  return Math.round(n).toLocaleString("ru-RU");
}

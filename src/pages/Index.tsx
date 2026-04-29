import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";

type Section = "home" | "calculator" | "breakdown" | "contacts";

interface RoomDimensions {
  length: string;
  width: string;
  height: string;
  doors: string;
  windows: string;
}

interface Variant {
  id: string;
  name: string;
  description: string;
  priceCoeff: number;
  features: string[];
}

interface CalcItem {
  name: string;
  quantity: number;
  unit: string;
  price: number;
  total: number;
  category: string;
}

interface CalculationResult {
  wallArea: number;
  floorArea: number;
  ceilingArea: number;
  netWallArea: number;
  perimeter: number;
  items: CalcItem[];
  totalCost: number;
}

interface ChatMessage {
  role: "user" | "manager";
  text: string;
  time: string;
}

const VARIANTS: Variant[] = [
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

const MANAGER_REPLIES = [
  "Понял вас! Уточните площадь помещения — это поможет дать точный ответ.",
  "Хороший вопрос. Рекомендую обратить внимание на влагостойкость, если речь о кухне или ванной.",
  "Могу организовать выезд замерщика на следующей неделе — удобно?",
  "Для этого вида работ мы используем только проверенных мастеров с портфолио.",
  "Да, предоставляем гарантию на все виды отделочных работ — 2 года.",
];

function calcResults(dims: RoomDimensions, coeff: number): CalculationResult | null {
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

function fmt(n: number) {
  return Math.round(n).toLocaleString("ru-RU");
}

export default function Index() {
  const [section, setSection] = useState<Section>("home");
  const [dims, setDims] = useState<RoomDimensions>({ length: "", width: "", height: "2.7", doors: "1", windows: "1" });
  const [selectedVariant, setSelectedVariant] = useState("standard");
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "manager", text: "Добрый день! Готов ответить на любые вопросы по материалам, технологиям и стоимости работ.", time: "сейчас" },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [compareMode, setCompareMode] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const variant = VARIANTS.find((v) => v.id === selectedVariant)!;

  const handleCalculate = () => {
    const r = calcResults(dims, variant.priceCoeff);
    setResult(r);
    if (r) setSection("breakdown");
  };

  const handleSend = () => {
    if (!chatInput.trim()) return;
    const now = new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
    setMessages((prev) => [...prev, { role: "user", text: chatInput, time: now }]);
    setChatInput("");
    setTimeout(() => {
      const t = new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
      setMessages((prev) => [...prev, { role: "manager", text: MANAGER_REPLIES[Math.floor(Math.random() * MANAGER_REPLIES.length)], time: t }]);
    }, 1200);
  };

  const handleDownload = () => {
    if (!result) return;
    const lines = [
      "СМЕТА НА ОТДЕЛКУ ПОМЕЩЕНИЯ",
      `Вариант: ${variant.name}`,
      "─".repeat(50),
      ...result.items.map((i) => `${i.name}: ${i.quantity} ${i.unit} × ${fmt(i.price)} ₽ = ${fmt(i.total)} ₽`),
      "─".repeat(50),
      `ИТОГО: ${fmt(result.totalCost)} ₽`,
      `Дата: ${new Date().toLocaleDateString("ru-RU")}`,
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: "smeta.txt" });
    a.click();
  };

  const navItems: { id: Section; label: string }[] = [
    { id: "home", label: "Главная" },
    { id: "calculator", label: "Расчёт" },
    { id: "breakdown", label: "Смета" },
    { id: "contacts", label: "Контакты" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <button onClick={() => setSection("home")} className="font-semibold text-sm tracking-tight flex items-center gap-2">
            <span className="w-6 h-6 bg-foreground rounded-sm flex items-center justify-center">
              <span className="text-background text-xs font-bold">К</span>
            </span>
            Калькулятор отделки
          </button>
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setSection(item.id)}
                className={`nav-link text-sm transition-colors ${section === item.id ? "active font-medium text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <button
            onClick={() => setSection("calculator")}
            className="bg-foreground text-background px-4 py-2 text-xs font-medium hover:bg-zinc-800 transition-colors"
          >
            Рассчитать
          </button>
        </div>
      </header>

      <main className="pt-14">

        {/* ── HOME ── */}
        {section === "home" && (
          <div className="animate-fade-in">
            <section className="max-w-5xl mx-auto px-6 py-24 border-b border-border">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div>
                  <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-6">
                    Профессиональный расчёт · 2026
                  </p>
                  <h1 className="text-5xl font-bold leading-tight tracking-tight mb-6">
                    Точная смета<br />за 30 секунд
                  </h1>
                  <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                    Введите размеры комнаты — получите полный список материалов с ценами, сравнение вариантов и готовую смету.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setSection("calculator")}
                      className="bg-foreground text-background px-8 py-3.5 text-sm font-medium hover:bg-zinc-800 transition-colors"
                    >
                      Рассчитать стоимость →
                    </button>
                    <button
                      onClick={() => setChatOpen(true)}
                      className="border border-border px-6 py-3.5 text-sm font-medium hover:border-foreground transition-colors"
                    >
                      Задать вопрос
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { num: "7", label: "категорий материалов" },
                    { num: "3", label: "варианта отделки" },
                    { num: "∞", label: "расчётов бесплатно" },
                    { num: "PDF", label: "смета для скачивания" },
                  ].map((stat) => (
                    <div key={stat.label} className="border border-border p-6 hover:border-zinc-400 transition-colors">
                      <div className="text-3xl font-bold font-mono mb-1">{stat.num}</div>
                      <div className="text-xs text-muted-foreground">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="max-w-5xl mx-auto px-6 py-20 border-b border-border">
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-10">Как это работает</p>
              <div className="grid grid-cols-1 md:grid-cols-3 border border-border">
                {[
                  { step: "01", title: "Введите размеры", desc: "Длину, ширину, высоту комнаты. Укажите количество дверей и окон — учтём каждый проём." },
                  { step: "02", title: "Выберите вариант", desc: "Эконом, Стандарт или Премиум. Сравните варианты рядом и выберите подходящий." },
                  { step: "03", title: "Получите смету", desc: "Полный список материалов с количеством и стоимостью. Скачайте документ для строителей." },
                ].map((item, i) => (
                  <div key={item.step} className={`p-8 ${i < 2 ? "md:border-r border-border" : ""}`}>
                    <div className="font-mono text-4xl font-bold text-border mb-4">{item.step}</div>
                    <h3 className="font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="max-w-5xl mx-auto px-6 py-20">
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-10">Возможности</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border">
                {[
                  { icon: "Calculator", title: "Точный расчёт", desc: "Учитываем площадь за вычетом дверей и окон, нахлёсты, запас материала." },
                  { icon: "BarChart3", title: "Сравнение вариантов", desc: "Три класса отделки рядом — видна разница в цене и составе материалов." },
                  { icon: "Download", title: "Скачать смету", desc: "Готовый документ с перечнем материалов и итоговой стоимостью." },
                  { icon: "MessageCircle", title: "Чат с менеджером", desc: "Специалист ответит на вопросы по материалам и технологиям отделки." },
                ].map((feat) => (
                  <div key={feat.title} className="bg-background p-8 flex gap-4">
                    <div className="w-10 h-10 border border-border flex items-center justify-center flex-shrink-0">
                      <Icon name={feat.icon} size={18} />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{feat.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ── CALCULATOR ── */}
        {section === "calculator" && (
          <div className="max-w-5xl mx-auto px-6 py-12 animate-fade-in">
            <div className="mb-10">
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-2">Шаг 1 из 2</p>
              <h2 className="text-3xl font-bold tracking-tight">Параметры помещения</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="border border-border p-6">
                  <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-5">Размеры комнаты</p>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    {([["length", "Длина, м"], ["width", "Ширина, м"], ["height", "Высота, м"]] as const).map(([key, label]) => (
                      <div key={key}>
                        <label className="text-xs text-muted-foreground block mb-1.5">{label}</label>
                        <input
                          type="number" step="0.1" min="0"
                          value={dims[key]}
                          onChange={(e) => setDims((d) => ({ ...d, [key]: e.target.value }))}
                          placeholder="0.0"
                          className="w-full border border-border bg-transparent px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-foreground transition-colors"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {([["doors", "Дверей, шт."], ["windows", "Окон, шт."]] as const).map(([key, label]) => (
                      <div key={key}>
                        <label className="text-xs text-muted-foreground block mb-1.5">{label}</label>
                        <input
                          type="number" min="0"
                          value={dims[key]}
                          onChange={(e) => setDims((d) => ({ ...d, [key]: e.target.value }))}
                          className="w-full border border-border bg-transparent px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-foreground transition-colors"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {dims.length && dims.width && dims.height && (
                  <div className="border border-border p-6 animate-fade-in">
                    <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4">Площади</p>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { label: "Пол / потолок", value: `${(parseFloat(dims.length) * parseFloat(dims.width)).toFixed(1)} м²` },
                        { label: "Стены (брутто)", value: `${(2 * (parseFloat(dims.length) + parseFloat(dims.width)) * parseFloat(dims.height)).toFixed(1)} м²` },
                        { label: "Периметр", value: `${(2 * (parseFloat(dims.length) + parseFloat(dims.width))).toFixed(1)} м.п.` },
                      ].map((s) => (
                        <div key={s.label}>
                          <div className="font-mono text-xl font-semibold">{s.value}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4">Вариант отделки</p>
                  <div className="grid grid-cols-3 gap-3">
                    {VARIANTS.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v.id)}
                        className={`border p-4 text-left transition-all ${selectedVariant === v.id ? "border-foreground" : "border-border hover:border-zinc-400"}`}
                      >
                        <div className="font-semibold text-sm mb-1">{v.name}</div>
                        <div className="text-xs text-muted-foreground leading-relaxed">{v.description}</div>
                        <div className="mt-3 text-xs font-mono text-muted-foreground">
                          {v.id === "economy" ? "базовые цены" : v.id === "standard" ? "цены ×1.6" : "цены ×2.8"}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleCalculate}
                  disabled={!dims.length || !dims.width || !dims.height}
                  className="w-full bg-foreground text-background py-4 text-sm font-medium hover:bg-zinc-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Рассчитать смету →
                </button>
              </div>

              <div className="space-y-4">
                <div className="border border-border p-5">
                  <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">Подсказки</p>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex gap-2"><span>—</span>Измерьте длину и ширину вдоль плинтуса</li>
                    <li className="flex gap-2"><span>—</span>Высота — от пола до потолка</li>
                    <li className="flex gap-2"><span>—</span>Стандартная дверь: 2.0 × 0.9 м</li>
                    <li className="flex gap-2"><span>—</span>Стандартное окно: 1.5 × 1.0 м</li>
                  </ul>
                </div>
                <div className="border border-dashed border-border p-5">
                  <p className="text-xs text-muted-foreground mb-3">Нужна консультация?</p>
                  <button onClick={() => setChatOpen(true)} className="text-sm font-medium underline underline-offset-2">
                    Написать менеджеру →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── BREAKDOWN ── */}
        {section === "breakdown" && (
          <div className="max-w-5xl mx-auto px-6 py-12 animate-fade-in">
            <div className="flex items-start justify-between mb-10 flex-wrap gap-4">
              <div>
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-2">Детальная смета</p>
                <h2 className="text-3xl font-bold tracking-tight">Состав расчёта</h2>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setCompareMode(!compareMode)}
                  className={`px-4 py-2 text-sm border transition-colors flex items-center gap-1.5 ${compareMode ? "bg-foreground text-background border-foreground" : "border-border hover:border-foreground"}`}
                >
                  <Icon name="BarChart3" size={14} />
                  Сравнить варианты
                </button>
                {result && (
                  <button
                    onClick={handleDownload}
                    className="px-4 py-2 text-sm bg-foreground text-background hover:bg-zinc-800 transition-colors flex items-center gap-1.5"
                  >
                    <Icon name="Download" size={14} />
                    Скачать смету
                  </button>
                )}
              </div>
            </div>

            {!result && (
              <div className="border border-dashed border-border p-16 text-center">
                <p className="text-muted-foreground mb-4">Сначала введите размеры помещения</p>
                <button onClick={() => setSection("calculator")} className="text-sm font-medium underline underline-offset-2">
                  Перейти к расчёту →
                </button>
              </div>
            )}

            {result && !compareMode && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Стены (нетто)", value: `${result.netWallArea.toFixed(1)} м²` },
                    { label: "Пол", value: `${result.floorArea.toFixed(1)} м²` },
                    { label: "Потолок", value: `${result.ceilingArea.toFixed(1)} м²` },
                    { label: "Периметр", value: `${result.perimeter.toFixed(1)} м.п.` },
                  ].map((s) => (
                    <div key={s.label} className="border border-border p-4">
                      <div className="font-mono text-lg font-semibold">{s.value}</div>
                      <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
                    </div>
                  ))}
                </div>

                <div className="border border-border overflow-hidden">
                  <div className="grid grid-cols-12 text-xs font-mono uppercase tracking-wider text-muted-foreground border-b border-border px-4 py-3 bg-muted">
                    <div className="col-span-5">Материал</div>
                    <div className="col-span-2">Раздел</div>
                    <div className="col-span-2 text-right">Кол-во</div>
                    <div className="col-span-1 text-right">Ед.</div>
                    <div className="col-span-2 text-right">Сумма</div>
                  </div>
                  {result.items.map((item, i) => (
                    <div key={i} className={`grid grid-cols-12 px-4 py-3.5 text-sm ${i < result.items.length - 1 ? "border-b border-border" : ""} hover:bg-muted/50 transition-colors`}>
                      <div className="col-span-5 font-medium">{item.name}</div>
                      <div className="col-span-2 text-muted-foreground">{item.category}</div>
                      <div className="col-span-2 text-right font-mono">{item.quantity}</div>
                      <div className="col-span-1 text-right text-muted-foreground text-xs">{item.unit}</div>
                      <div className="col-span-2 text-right font-mono font-medium">{fmt(item.total)} ₽</div>
                    </div>
                  ))}
                  <div className="grid grid-cols-12 px-4 py-4 bg-foreground text-background">
                    <div className="col-span-10 font-semibold">Итого за материалы</div>
                    <div className="col-span-2 text-right font-mono font-bold text-lg">{fmt(result.totalCost)} ₽</div>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">* Стоимость только материалов. Работы рассчитываются отдельно. Цены актуальны на {new Date().toLocaleDateString("ru-RU")}.</p>
              </div>
            )}

            {compareMode && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
                {VARIANTS.map((v) => {
                  const r = calcResults(dims, v.priceCoeff);
                  const isActive = v.id === selectedVariant;
                  const total = r ? r.totalCost : 0;
                  return (
                    <div key={v.id} className={`border ${isActive ? "border-foreground" : "border-border"}`}>
                      <div className={`p-5 ${isActive ? "bg-foreground text-background" : "bg-muted"}`}>
                        <div className="text-xs font-mono uppercase tracking-widest mb-1 opacity-60">{isActive ? "Текущий выбор" : "Вариант"}</div>
                        <div className="text-xl font-bold">{v.name}</div>
                        <div className="text-sm mt-0.5 opacity-70">{v.description}</div>
                      </div>
                      <div className="p-5">
                        {dims.length && dims.width && dims.height ? (
                          <div className="font-mono text-2xl font-bold mb-4">{fmt(total)} ₽</div>
                        ) : (
                          <div className="text-sm text-muted-foreground mb-4">Введите размеры для расчёта</div>
                        )}
                        <ul className="space-y-2 mb-5">
                          {v.features.map((f) => (
                            <li key={f} className="text-sm text-muted-foreground flex gap-2">
                              <span className="flex-shrink-0">—</span>{f}
                            </li>
                          ))}
                        </ul>
                        <button
                          onClick={() => { setSelectedVariant(v.id); setResult(calcResults(dims, v.priceCoeff)); setCompareMode(false); }}
                          className={`w-full py-2.5 text-sm font-medium transition-colors ${isActive ? "bg-foreground text-background cursor-default" : "border border-border hover:border-foreground hover:bg-muted"}`}
                        >
                          {isActive ? "Выбрано" : "Выбрать"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── CONTACTS ── */}
        {section === "contacts" && (
          <div className="max-w-5xl mx-auto px-6 py-12 animate-fade-in">
            <div className="mb-10">
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-2">Связь</p>
              <h2 className="text-3xl font-bold tracking-tight">Контакты</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="border border-border p-6 space-y-5">
                  {[
                    { icon: "Phone", label: "Телефон", value: "+7 (000) 000-00-00" },
                    { icon: "Mail", label: "Email", value: "info@example.com" },
                    { icon: "MapPin", label: "Адрес", value: "г. Москва, ул. Примерная, 1" },
                    { icon: "Clock", label: "Режим работы", value: "Пн–Пт: 9:00–18:00" },
                  ].map((c) => (
                    <div key={c.label} className="flex items-start gap-4">
                      <div className="w-9 h-9 border border-border flex items-center justify-center flex-shrink-0">
                        <Icon name={c.icon} size={16} />
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-0.5">{c.label}</div>
                        <div className="font-medium">{c.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setChatOpen(true)}
                  className="w-full bg-foreground text-background py-3.5 text-sm font-medium hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
                >
                  <Icon name="MessageCircle" size={16} />
                  Написать в чат
                </button>
              </div>

              <div className="border border-border p-6">
                <h3 className="font-semibold mb-5">Оставить заявку</h3>
                <div className="space-y-4">
                  {[
                    { label: "Имя", type: "text", placeholder: "Иван Иванов" },
                    { label: "Телефон", type: "tel", placeholder: "+7 (999) 999-99-99" },
                  ].map((field) => (
                    <div key={field.label}>
                      <label className="text-xs text-muted-foreground block mb-1.5">{field.label}</label>
                      <input
                        type={field.type}
                        placeholder={field.placeholder}
                        className="w-full border border-border bg-transparent px-3 py-2.5 text-sm focus:outline-none focus:border-foreground transition-colors"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1.5">Вопрос</label>
                    <textarea
                      rows={4}
                      placeholder="Расскажите о вашем проекте..."
                      className="w-full border border-border bg-transparent px-3 py-2.5 text-sm focus:outline-none focus:border-foreground transition-colors resize-none"
                    />
                  </div>
                  <button className="w-full bg-foreground text-background py-3 text-sm font-medium hover:bg-zinc-800 transition-colors">
                    Отправить заявку
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── CHAT ── */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {chatOpen && (
          <div className="w-80 border border-border bg-background shadow-2xl animate-fade-in flex flex-col" style={{ height: 420 }}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-foreground text-background">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-sm font-medium">Менеджер онлайн</span>
              </div>
              <button onClick={() => setChatOpen(false)} className="opacity-60 hover:opacity-100 transition-opacity">
                <Icon name="X" size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  <div className={`max-w-[85%] px-3 py-2 text-sm leading-relaxed ${msg.role === "user" ? "bg-foreground text-background" : "border border-border bg-muted"}`}>
                    {msg.text}
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">{msg.time}</span>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="border-t border-border px-3 py-3 flex gap-2 items-center">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ваш вопрос..."
                className="flex-1 text-sm bg-transparent focus:outline-none"
              />
              <button
                onClick={handleSend}
                className="w-8 h-8 bg-foreground text-background flex items-center justify-center hover:bg-zinc-800 transition-colors"
              >
                <Icon name="Send" size={14} />
              </button>
            </div>
          </div>
        )}
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className="w-12 h-12 bg-foreground text-background flex items-center justify-center shadow-lg hover:bg-zinc-800 transition-colors"
        >
          <Icon name={chatOpen ? "X" : "MessageCircle"} size={20} />
        </button>
      </div>
    </div>
  );
}
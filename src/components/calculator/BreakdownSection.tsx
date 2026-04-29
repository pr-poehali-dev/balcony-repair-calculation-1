import Icon from "@/components/ui/icon";
import {
  CalculationResult,
  RoomDimensions,
  VARIANTS,
  calcResults,
  fmt,
} from "./types";

interface Props {
  result: CalculationResult | null;
  dims: RoomDimensions;
  selectedVariant: string;
  setSelectedVariant: (id: string) => void;
  setResult: (r: CalculationResult | null) => void;
  compareMode: boolean;
  setCompareMode: (v: boolean) => void;
  setSection: (s: "calculator") => void;
  variantName: string;
}

export default function BreakdownSection({
  result, dims,
  selectedVariant, setSelectedVariant, setResult,
  compareMode, setCompareMode,
  setSection,
  variantName,
}: Props) {

  const handleDownload = () => {
    if (!result) return;
    const lines = [
      "СМЕТА НА ОТДЕЛКУ ПОМЕЩЕНИЯ",
      `Вариант: ${variantName}`,
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

  return (
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
  );
}

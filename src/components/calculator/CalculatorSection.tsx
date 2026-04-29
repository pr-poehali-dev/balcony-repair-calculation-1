import Icon from "@/components/ui/icon";
import {
  RoomDimensions,
  Measurements,
  VARIANTS,
  SAVE_MEASUREMENTS_URL,
} from "./types";

interface Props {
  dims: RoomDimensions;
  setDims: React.Dispatch<React.SetStateAction<RoomDimensions>>;
  selectedVariant: string;
  setSelectedVariant: (id: string) => void;
  measurements: Measurements;
  setMeasurements: React.Dispatch<React.SetStateAction<Measurements>>;
  measureSaving: boolean;
  setMeasureSaving: (v: boolean) => void;
  measureSaved: boolean;
  setMeasureSaved: (v: boolean) => void;
  measureError: string;
  setMeasureError: (v: string) => void;
  handleCalculate: () => void;
  setChatOpen: (open: boolean) => void;
}

export default function CalculatorSection({
  dims, setDims,
  selectedVariant, setSelectedVariant,
  measurements, setMeasurements,
  measureSaving, setMeasureSaving,
  measureSaved, setMeasureSaved,
  measureError, setMeasureError,
  handleCalculate,
  setChatOpen,
}: Props) {

  const handleSaveMeasurements = async () => {
    const { room_width, room_length_left, room_length_right, height_to_sill, height_sill_to_top } = measurements;
    if (!room_width || !room_length_left || !room_length_right || !height_to_sill || !height_sill_to_top) {
      setMeasureError("Заполните все поля замеров");
      return;
    }
    setMeasureSaving(true);
    setMeasureError("");
    try {
      const res = await fetch(SAVE_MEASUREMENTS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room_width: parseFloat(room_width),
          room_length_left: parseFloat(room_length_left),
          room_length_right: parseFloat(room_length_right),
          height_to_sill: parseFloat(height_to_sill),
          height_sill_to_top: parseFloat(height_sill_to_top),
          client_name: measurements.client_name,
          client_phone: measurements.client_phone,
          comment: measurements.comment,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMeasureSaved(true);
      } else {
        setMeasureError(data.error || "Ошибка сохранения");
      }
    } catch {
      setMeasureError("Ошибка соединения с сервером");
    } finally {
      setMeasureSaving(false);
    }
  };

  return (
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

          {/* Форма детальных замеров */}
          <div className="border border-border p-6">
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">Замеры окна</p>
            <p className="text-xs text-muted-foreground mb-5">Сохраним точные замеры для мастера</p>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {([
                ["room_width", "Ширина помещения, м"],
                ["room_length_left", "Длина (левая сторона), м"],
                ["room_length_right", "Длина (правая сторона), м"],
                ["height_to_sill", "Высота до подоконника, м"],
                ["height_sill_to_top", "Высота от подоконника до края окна, м"],
              ] as const).map(([key, label]) => (
                <div key={key} className={key === "height_sill_to_top" ? "col-span-2" : ""}>
                  <label className="text-xs text-muted-foreground block mb-1.5">{label}</label>
                  <input
                    type="number" step="0.01" min="0"
                    value={measurements[key]}
                    onChange={(e) => { setMeasureSaved(false); setMeasurements((m) => ({ ...m, [key]: e.target.value })); }}
                    placeholder="0.00"
                    className="w-full border border-border bg-transparent px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-foreground transition-colors"
                  />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">Имя клиента</label>
                <input
                  type="text"
                  value={measurements.client_name}
                  onChange={(e) => setMeasurements((m) => ({ ...m, client_name: e.target.value }))}
                  placeholder="Иван Иванов"
                  className="w-full border border-border bg-transparent px-3 py-2.5 text-sm focus:outline-none focus:border-foreground transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">Телефон</label>
                <input
                  type="tel"
                  value={measurements.client_phone}
                  onChange={(e) => setMeasurements((m) => ({ ...m, client_phone: e.target.value }))}
                  placeholder="+7 (999) 999-99-99"
                  className="w-full border border-border bg-transparent px-3 py-2.5 text-sm focus:outline-none focus:border-foreground transition-colors"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="text-xs text-muted-foreground block mb-1.5">Примечания</label>
              <textarea
                rows={2}
                value={measurements.comment}
                onChange={(e) => setMeasurements((m) => ({ ...m, comment: e.target.value }))}
                placeholder="Особенности, пожелания..."
                className="w-full border border-border bg-transparent px-3 py-2.5 text-sm focus:outline-none focus:border-foreground transition-colors resize-none"
              />
            </div>
            {measureError && <p className="text-xs text-red-500 mb-3">{measureError}</p>}
            {measureSaved ? (
              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 px-4 py-3">
                <Icon name="CheckCircle" size={16} />
                Замеры сохранены! Мастер получит их перед выездом.
              </div>
            ) : (
              <button
                onClick={handleSaveMeasurements}
                disabled={measureSaving}
                className="w-full border border-foreground text-foreground py-3 text-sm font-medium hover:bg-foreground hover:text-background transition-colors disabled:opacity-40"
              >
                {measureSaving ? "Сохранение..." : "Сохранить замеры →"}
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="border border-border p-5">
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">Подсказки</p>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2">Измерьте длину и ширину в доль периметра</li>
              <li className="flex gap-2">Высота от пола до желаемого подоконника</li>
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
  );
}
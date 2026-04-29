import { useState } from "react";
import {
  Section,
  RoomDimensions,
  Measurements,
  CalculationResult,
  ChatMessage,
  VARIANTS,
  MANAGER_REPLIES,
  calcResults,
} from "@/components/calculator/types";
import HomeSection from "@/components/calculator/HomeSection";
import CalculatorSection from "@/components/calculator/CalculatorSection";
import BreakdownSection from "@/components/calculator/BreakdownSection";
import ContactsSection from "@/components/calculator/ContactsSection";
import ChatWidget from "@/components/calculator/ChatWidget";

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

  const [measurements, setMeasurements] = useState<Measurements>({
    room_width: "", room_length_left: "", room_length_right: "",
    height_to_sill: "", height_sill_to_top: "",
    client_name: "", client_phone: "", comment: "",
  });
  const [measureSaving, setMeasureSaving] = useState(false);
  const [measureSaved, setMeasureSaved] = useState(false);
  const [measureError, setMeasureError] = useState("");

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
          <button onClick={() => setSection("home")} className="font-semibold text-sm tracking-tight flex items-center gap-2">Калькулятор балкона - лоджии</button>
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
        {section === "home" && (
          <HomeSection setSection={setSection} setChatOpen={setChatOpen} />
        )}

        {section === "calculator" && (
          <CalculatorSection
            dims={dims} setDims={setDims}
            selectedVariant={selectedVariant} setSelectedVariant={setSelectedVariant}
            measurements={measurements} setMeasurements={setMeasurements}
            measureSaving={measureSaving} setMeasureSaving={setMeasureSaving}
            measureSaved={measureSaved} setMeasureSaved={setMeasureSaved}
            measureError={measureError} setMeasureError={setMeasureError}
            handleCalculate={handleCalculate}
            setChatOpen={setChatOpen}
          />
        )}

        {section === "breakdown" && (
          <BreakdownSection
            result={result}
            dims={dims}
            selectedVariant={selectedVariant}
            setSelectedVariant={setSelectedVariant}
            setResult={setResult}
            compareMode={compareMode}
            setCompareMode={setCompareMode}
            setSection={setSection}
            variantName={variant.name}
          />
        )}

        {section === "contacts" && (
          <ContactsSection setChatOpen={setChatOpen} />
        )}
      </main>

      <ChatWidget
        chatOpen={chatOpen} setChatOpen={setChatOpen}
        messages={messages}
        chatInput={chatInput} setChatInput={setChatInput}
        handleSend={handleSend}
      />
    </div>
  );
}

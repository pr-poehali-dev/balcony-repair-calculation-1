import Icon from "@/components/ui/icon";
import { Section } from "./types";

interface Props {
  setSection: (s: Section) => void;
  setChatOpen: (open: boolean) => void;
}

export default function HomeSection({ setSection, setChatOpen }: Props) {
  return (
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
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">Введите размеры балкона, лоджии — получите полный список материалов с ценами, сравнение вариантов и готовую смету.</p>
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
  );
}

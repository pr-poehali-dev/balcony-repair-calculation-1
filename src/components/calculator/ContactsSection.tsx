import Icon from "@/components/ui/icon";

interface Props {
  setChatOpen: (open: boolean) => void;
}

export default function ContactsSection({ setChatOpen }: Props) {
  return (
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
  );
}

import { useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { ChatMessage } from "./types";

interface Props {
  chatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  messages: ChatMessage[];
  chatInput: string;
  setChatInput: (v: string) => void;
  handleSend: () => void;
}

export default function ChatWidget({
  chatOpen, setChatOpen,
  messages, chatInput, setChatInput, handleSend,
}: Props) {
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  return (
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
  );
}

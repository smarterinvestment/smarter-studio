import { useState, useRef, useEffect } from "react"

type Msg = { role: "user" | "assistant"; text: string }

export default function Chat() {
  const [msgs, setMsgs] = useState<Msg[]>([{ role: "assistant", text: "Hi! Ask me about your niche, video ideas, or channel strategy." }])
  const [input, setInput] = useState("")
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => { ref.current?.scrollIntoView({ behavior: "smooth" }) }, [msgs])

  const send = () => {
    if (!input.trim()) return
    setMsgs(p => [...p, { role: "user", text: input }, { role: "assistant", text: "Placeholder — connect your AI backend for real answers." }])
    setInput("")
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-border bg-surface px-6 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-green" />
        <h1 className="font-semibold">AI Chat</h1>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto p-6">
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-xl rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.role === "user" ? "bg-primary text-white" : "border border-border bg-surface text-white/80"}`}>
              {m.text}
            </div>
          </div>
        ))}
        <div ref={ref} />
      </div>
      <div className="border-t border-border bg-surface p-4">
        <div className="flex items-center gap-3 rounded-xl border border-border bg-bg px-4 py-2 focus-within:border-accent/50">
          <input
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-white/30"
            placeholder="Ask anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
          />
          <button onClick={send} disabled={!input.trim()} className="rounded-lg bg-accent px-3 py-1.5 text-xs font-bold text-bg disabled:opacity-30">Send</button>
        </div>
      </div>
    </div>
  )
}

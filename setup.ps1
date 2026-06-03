# setup.ps1 — Smarter Studio scaffold
New-Item -ItemType Directory -Force -Path src/components, src/pages | Out-Null

# tailwind.config.ts
Set-Content tailwind.config.ts @'
import type { Config } from "tailwindcss"
const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#020c1a",
        primary: "#2979FF",
        accent: "#00E5FF",
        gold: "#FFD740",
        green: "#00C853",
        red: "#FF5252",
        surface: "#071428",
        border: "#0d2240",
      },
      fontFamily: {
        sans: ["Space Grotesk", "ui-sans-serif", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
}
export default config
'@

# postcss.config.js
Set-Content postcss.config.js @'
export default { plugins: { tailwindcss: {}, autoprefixer: {} } }
'@

# vercel.json
Set-Content vercel.json @'
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
'@

# index.html
Set-Content index.html @'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Smarter Studio</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
'@

# src/index.css
Set-Content src/index.css @'
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-bg: #020c1a;
  --color-primary: #2979FF;
  --color-accent: #00E5FF;
  --color-gold: #FFD740;
  --color-green: #00C853;
  --color-red: #FF5252;
  --color-surface: #071428;
  --color-border: #0d2240;
}

@layer base {
  html {
    background-color: var(--color-bg);
    color: white;
    font-family: "Space Grotesk", ui-sans-serif, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  * { box-sizing: border-box; }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: var(--color-bg); }
  ::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--color-primary); }
}
'@

# src/main.tsx
Set-Content src/main.tsx @'
import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.tsx"
import "./index.css"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
'@

# src/App.tsx
Set-Content src/App.tsx @'
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Layout from "./components/Layout"
import Home from "./pages/Home"
import Editor from "./pages/Editor"
import Chat from "./pages/Chat"
import Library from "./pages/Library"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/editor" element={<Editor />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/library" element={<Library />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
'@

# src/components/Layout.tsx
Set-Content src/components/Layout.tsx @'
import { NavLink, Outlet } from "react-router-dom"

const nav = [
  { to: "/", label: "Home" },
  { to: "/editor", label: "Editor" },
  { to: "/chat", label: "Chat" },
  { to: "/library", label: "Library" },
]

export default function Layout() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg text-white">
      <aside className="flex w-52 shrink-0 flex-col border-r border-border bg-surface">
        <div className="flex h-14 items-center border-b border-border px-5">
          <span className="text-lg font-bold">
            <span className="text-primary">Smarter</span>
            <span className="text-accent">Studio</span>
          </span>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {nav.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                "flex items-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors " +
                (isActive ? "bg-primary/20 text-primary" : "text-white/60 hover:bg-white/5 hover:text-white")
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-border p-4">
          <p className="font-mono text-xs text-white/30">v0.1.0</p>
        </div>
      </aside>
      <main className="flex flex-1 flex-col overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
'@

# src/pages/Home.tsx
Set-Content src/pages/Home.tsx @'
const stats = [
  { label: "Total Views", value: "1.24M", color: "text-accent" },
  { label: "Revenue", value: "$8,420", color: "text-gold" },
  { label: "Subscribers", value: "+3,210", color: "text-green" },
  { label: "Avg RPM", value: "$6.80", color: "text-primary" },
]

export default function Home() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Welcome to <span className="text-primary">Smarter</span><span className="text-accent">Studio</span>
        </h1>
        <p className="mt-2 text-white/50">Your AI-powered content intelligence platform.</p>
      </div>
      <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border border-border bg-surface p-5">
            <p className="text-xs uppercase tracking-wider text-white/40">{label}</p>
            <p className={`mt-2 text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { href: "/editor", title: "Script Editor", desc: "Write scripts with AI assistance.", color: "text-accent", btn: "bg-primary text-white", btnLabel: "Open Editor" },
          { href: "/chat", title: "AI Chat", desc: "Ask about your channel and niche.", color: "text-gold", btn: "bg-accent/20 text-accent", btnLabel: "Start Chatting" },
          { href: "/library", title: "Library", desc: "Browse swipe files and ideas.", color: "text-green", btn: "bg-green/20 text-green", btnLabel: "Browse Library" },
        ].map(({ href, title, desc, color, btn, btnLabel }) => (
          <div key={href} className="rounded-xl border border-border bg-surface p-6">
            <h2 className={`mb-2 text-lg font-semibold ${color}`}>{title}</h2>
            <p className="mb-4 text-sm text-white/50">{desc}</p>
            <a href={href} className={`inline-flex rounded-lg px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-80 ${btn}`}>{btnLabel}</a>
          </div>
        ))}
      </div>
    </div>
  )
}
'@

# src/pages/Editor.tsx
Set-Content src/pages/Editor.tsx @'
import { useState } from "react"

const DEFAULT = `# Video Script\n\n## Hook (0-5s)\nOpen with your most compelling hook...\n\n## Main Content\n### Point 1\n### Point 2\n### Point 3\n\n## CTA\nLike, subscribe, and comment below!`

export default function Editor() {
  const [script, setScript] = useState(DEFAULT)
  const words = script.trim().split(/\s+/).filter(Boolean).length

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border bg-surface px-6 py-3">
        <div className="flex items-center gap-3">
          <h1 className="font-semibold">Script Editor</h1>
          <span className="rounded-full bg-primary/20 px-2.5 py-0.5 text-xs text-primary">Draft</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs text-white/30">{words} words · ~{Math.round(words/130)} min</span>
          <button className="rounded-lg bg-primary px-4 py-1.5 text-sm font-semibold transition-opacity hover:opacity-80">Save</button>
          <button className="rounded-lg border border-accent/40 px-4 py-1.5 text-sm font-semibold text-accent hover:bg-accent/10">AI Improve</button>
        </div>
      </div>
      <textarea
        className="flex-1 resize-none bg-bg p-8 font-mono text-sm leading-relaxed text-white/80 outline-none"
        value={script}
        onChange={(e) => setScript(e.target.value)}
        spellCheck={false}
      />
    </div>
  )
}
'@

# src/pages/Chat.tsx
Set-Content src/pages/Chat.tsx @'
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
'@

# src/pages/Library.tsx
Set-Content src/pages/Library.tsx @'
const items = [
  { id: 1, type: "Script", title: "How to grow to 10k subscribers", tag: "Growth", color: "text-primary border-primary/30 bg-primary/10" },
  { id: 2, type: "Swipe", title: "Best hooks from MrBeast thumbnails", tag: "Thumbnails", color: "text-gold border-gold/30 bg-gold/10" },
  { id: 3, type: "Idea", title: "Faceless finance channel concept", tag: "Finance", color: "text-accent border-accent/30 bg-accent/10" },
  { id: 4, type: "Script", title: "Passive income with index funds", tag: "Investing", color: "text-green border-green/30 bg-green/10" },
  { id: 5, type: "Swipe", title: "Viral shorts hook templates", tag: "Shorts", color: "text-primary border-primary/30 bg-primary/10" },
  { id: 6, type: "Idea", title: "Reddit story automation workflow", tag: "Automation", color: "text-gold border-gold/30 bg-gold/10" },
]

export default function Library() {
  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Library</h1>
          <p className="mt-1 text-sm text-white/40">Your saved scripts, swipe files, and ideas.</p>
        </div>
        <button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold hover:opacity-80">+ New Item</button>
      </div>
      <div className="mb-6 flex gap-2">
        {["All", "Scripts", "Swipes", "Ideas"].map((t) => (
          <button key={t} className={`rounded-full px-4 py-1.5 text-xs font-semibold ${t === "All" ? "bg-primary text-white" : "border border-border text-white/50 hover:text-white"}`}>{t}</button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(({ id, type, title, tag, color }) => (
          <div key={id} className="group cursor-pointer rounded-xl border border-border bg-surface p-5 hover:border-white/20">
            <div className="mb-3 flex items-center justify-between">
              <span className={`rounded-md border px-2 py-0.5 text-xs font-semibold ${color}`}>{type}</span>
              <span className="text-xs text-white/30">{tag}</span>
            </div>
            <p className="text-sm font-medium text-white/80 group-hover:text-white">{title}</p>
            <div className="mt-4 flex gap-2">
              <button className="text-xs text-white/30 hover:text-accent">Open</button>
              <span className="text-white/20">·</span>
              <button className="text-xs text-white/30 hover:text-red">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
'@

Write-Host "`nDone! Now run: npm run dev" -ForegroundColor Cyan

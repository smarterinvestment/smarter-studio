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

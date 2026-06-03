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

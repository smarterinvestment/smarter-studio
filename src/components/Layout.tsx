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

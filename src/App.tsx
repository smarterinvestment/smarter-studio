import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom"
import Home from "./pages/Home"
import Editor from "./pages/Editor"
import Chat from "./pages/Chat"
import Library from "./pages/Library"

const nav = [
  { to: "/", label: "Home", end: true },
  { to: "/editor", label: "Editor", end: false },
  { to: "/chat", label: "Chat", end: false },
  { to: "/library", label: "Library", end: false },
]

function Navbar() {
  return (
    <nav style={{ background: "rgba(7,20,40,0.95)", borderBottom: "1px solid #0d2240", backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", height: 52 }}>
        <span style={{ fontWeight: 700, fontSize: 16 }}>
          <span style={{ color: "#2979FF" }}>Smarter</span>
          <span style={{ color: "#00E5FF" }}>Studio</span>
        </span>
        <div style={{ display: "flex", gap: 4 }}>
          {nav.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end} style={({ isActive }) => ({
              padding: "6px 14px", borderRadius: 10, fontSize: 13, fontWeight: 600, textDecoration: "none",
              background: isActive ? "rgba(41,121,255,0.2)" : "transparent",
              color: isActive ? "#2979FF" : "rgba(255,255,255,0.55)",
              transition: "all 0.15s",
            })}>
              {label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: "100vh", background: "#020c1a" }}>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/editor" element={<Editor />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/library" element={<Library />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

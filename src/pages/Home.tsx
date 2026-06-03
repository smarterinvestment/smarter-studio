import { useNavigate } from "react-router-dom"

const cards = [
  { to: "/editor", icon: "🎬", title: "Editor de Carruseles", desc: "Slides SPIN con partículas 3D. Exporta PNG, graba video, copia copy.", color: "#2979FF", badge: "PRO" },
  { to: "/chat", icon: "👑", title: "Rey Salomón IA", desc: "Chat con Claude. Metodología SPIN para conectar con tu audiencia.", color: "#00E5FF", badge: "IA" },
  { to: "/library", icon: "📚", title: "Biblioteca", desc: "Guarda y reutiliza tus diseños. Exporta e importa colecciones.", color: "#FFD740", badge: "LOCAL" },
]

export default function Home() {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight: "calc(100vh - 52px)", background: "#020c1a", fontFamily: "Inter,sans-serif" }}>
      <div style={{ position: "relative", overflow: "hidden", padding: "60px 16px 40px", textAlign: "center" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 50% at 50% 0%,rgba(41,121,255,0.15) 0%,transparent 70%)", pointerEvents: "none" }} />
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#00E5FF", marginBottom: 12 }}>Content Studio</p>
        <h1 style={{ fontSize: "clamp(2rem,6vw,3.5rem)", fontWeight: 800, lineHeight: 1.1, marginBottom: 16,
          background: "linear-gradient(135deg,#2979FF 0%,#00E5FF 50%,#FFD740 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
          Crea contenido viral
        </h1>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.55)", maxWidth: 480, margin: "0 auto" }}>
          Estructura SPIN · Animaciones 3D · Sabiduría del Rey Salomón
        </p>
      </div>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 16px 60px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16 }}>
        {cards.map(c => (
          <div key={c.to} onClick={() => navigate(c.to)}
            style={{ background: "rgba(13,21,38,0.9)", backdropFilter: "blur(20px)", border: "1px solid #0d2240", borderRadius: 20, padding: 24, cursor: "pointer", transition: "all 0.2s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = c.color + "66"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)" }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#0d2240"; (e.currentTarget as HTMLElement).style.transform = "none" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{ fontSize: 32 }}>{c.icon}</span>
              <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: c.color + "22", color: c.color, border: `1px solid ${c.color}44`, alignSelf: "flex-start" }}>{c.badge}</span>
            </div>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: "white", marginBottom: 8 }}>{c.title}</h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{c.desc}</p>
            <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 600, color: c.color }}>
              Abrir <span>›</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

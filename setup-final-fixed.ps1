# setup-final.ps1
# Ejecutar desde: C:\Users\Administrator\smarter-studio
# Reemplaza todo el contenido con el Content Studio completo

Set-Location $PSScriptRoot

Write-Host "Instalando dependencias..." -ForegroundColor Cyan
npm install html2canvas react-router-dom
npm install -D @types/html2canvas 2>$null

Write-Host "Escribiendo archivos..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path src/pages, src/components | Out-Null

# ── index.html ────────────────────────────────────────────────────────────────
Set-Content index.html -Encoding UTF8 @'
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Smarter Studio</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
'@

# ── src/index.css ─────────────────────────────────────────────────────────────
Set-Content src/index.css -Encoding UTF8 @'
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg: #020c1a;
  --primary: #2979FF;
  --accent: #00E5FF;
  --gold: #FFD740;
  --green: #00C853;
  --red: #FF5252;
  --surface: rgba(13,21,38,0.9);
}

@layer base {
  html { background: var(--bg); color: white; font-family: "Inter", sans-serif; -webkit-font-smoothing: antialiased; }
  * { box-sizing: border-box; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: #0d2240; border-radius: 2px; }
}
'@

# ── tailwind.config.ts ────────────────────────────────────────────────────────
Set-Content tailwind.config.ts -Encoding UTF8 @'
import type { Config } from "tailwindcss"
const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#020c1a", primary: "#2979FF", accent: "#00E5FF",
        gold: "#FFD740", green: "#00C853", red: "#FF5252",
        surface: "#071428", border: "#0d2240",
      },
      fontFamily: { sans: ["Inter", "ui-sans-serif", "sans-serif"] },
    },
  },
  plugins: [],
}
export default config
'@

# ── src/main.tsx ──────────────────────────────────────────────────────────────
Set-Content src/main.tsx -Encoding UTF8 @'
import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.tsx"
import "./index.css"
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode><App /></React.StrictMode>
)
'@

# ── src/App.tsx ───────────────────────────────────────────────────────────────
Set-Content src/App.tsx -Encoding UTF8 @'
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
'@

# ── src/pages/Home.tsx ────────────────────────────────────────────────────────
Set-Content src/pages/Home.tsx -Encoding UTF8 @'
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
'@

# ── src/pages/Editor.tsx ──────────────────────────────────────────────────────
Set-Content src/pages/Editor.tsx -Encoding UTF8 @'
import React, { useState, useEffect, useRef, useCallback } from "react"

interface Slide { id: number; label: string; title: string; subtitle: string; body: string }
type Format = "1:1" | "9:16" | "4:5"
type Theme = "#2979FF" | "#00E5FF" | "#FFD740" | "#00C853" | "#FF5252" | "multi"
interface Particle { x: number; y: number; vx: number; vy: number; r: number; op: number; pulse: number; ps: number }

const DIMS: Record<Format, [number, number]> = { "1:1": [1,1], "9:16": [9,16], "4:5": [4,5] }
const LABELS = ["Situación","Problema","Implicación","Necesidad-Solución","Rey Salomón Hook","CTA"]
const THEMES: { c: Theme; name: string }[] = [
  { c:"#2979FF",name:"Azul"},{ c:"#00E5FF",name:"Cyan"},{ c:"#FFD740",name:"Oro"},
  { c:"#00C853",name:"Verde"},{ c:"#FF5252",name:"Rojo"},{ c:"multi",name:"Multi"},
]
const PALETTE = ["#2979FF","#00E5FF","#FFD740","#00C853","#FF5252"]

const SLIDES: Slide[] = [
  { id:1, label:"Situación", title:"¿Sabías que el 80% pierde dinero?", subtitle:"La realidad que nadie te cuenta", body:"La mayoría trabaja toda su vida sin construir riqueza real. El sistema no fue diseñado para enseñarte a prosperar." },
  { id:2, label:"Problema", title:"El problema no es tu salario", subtitle:"Es lo que haces con él", body:"Sin estrategia, cada peso que ganas se escapa entre gastos invisibles, deudas y malos hábitos financieros." },
  { id:3, label:"Implicación", title:"10 años más tarde...", subtitle:"El costo del tiempo perdido", body:"Cada mes sin invertir es dinero que el interés compuesto nunca multiplicará. El tiempo es tu activo más valioso." },
  { id:4, label:"Necesidad-Solución", title:"La solución es más simple", subtitle:"Tres pasos que cambian todo", body:"1. Conoce tu flujo de dinero. 2. Elimina deudas tóxicas. 3. Invierte automáticamente. Eso es todo." },
  { id:5, label:"Rey Salomón Hook", title:'"El que cuida su dinero, cuida su libertad"', subtitle:"Proverbio milenario", body:"Los sabios de todas las épocas entendieron que la prosperidad no es suerte — es disciplina convertida en hábito." },
  { id:6, label:"CTA", title:"¿Listo para cambiar tu historia?", subtitle:"El primer paso es hoy", body:"Sigue esta cuenta para más estrategias. Comenta LISTO y te envío mi guía gratuita." },
]

function rgb(hex: string) {
  return [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16)]
}

function useCanvas(ref: React.RefObject<HTMLCanvasElement>, theme: Theme) {
  const pts = useRef<Particle[]>([])
  const raf = useRef(0)
  const getColor = useCallback((a: number, i: number) => {
    const h = theme === "multi" ? PALETTE[i % PALETTE.length] : theme
    const [r,g,b] = rgb(h)
    return `rgba(${r},${g},${b},${a})`
  }, [theme])
  useEffect(() => {
    const cv = ref.current; if (!cv) return
    const ctx = cv.getContext("2d"); if (!ctx) return
    const resize = () => { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight }
    resize()
    const ro = new ResizeObserver(resize); ro.observe(cv)
    pts.current = Array.from({length:80},()=>({
      x:Math.random()*(cv.width||400), y:Math.random()*(cv.height||600),
      vx:(Math.random()-.5)*.6, vy:(Math.random()-.5)*.6,
      r:Math.random()*2.5+1, op:Math.random()*.5+.3,
      pulse:Math.random()*Math.PI*2, ps:Math.random()*.02+.01,
    }))
    const draw = () => {
      const W=cv.width, H=cv.height
      ctx.clearRect(0,0,W,H)
      const bg=ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,Math.max(W,H)/1.5)
      bg.addColorStop(0,"rgba(7,20,40,1)"); bg.addColorStop(1,"rgba(2,12,26,1)")
      ctx.fillStyle=bg; ctx.fillRect(0,0,W,H)
      const p=pts.current
      for(let i=0;i<p.length;i++) for(let j=i+1;j<p.length;j++){
        const dx=p[i].x-p[j].x, dy=p[i].y-p[j].y, d=Math.sqrt(dx*dx+dy*dy)
        if(d<120){ ctx.beginPath(); ctx.moveTo(p[i].x,p[i].y); ctx.lineTo(p[j].x,p[j].y); ctx.strokeStyle=getColor((1-d/120)*.25,i); ctx.lineWidth=.8; ctx.stroke() }
      }
      p.forEach((pt,i)=>{
        pt.pulse+=pt.ps
        const pf=.85+Math.sin(pt.pulse)*.15, r=pt.r*pf, a=pt.op*pf
        const g=ctx.createRadialGradient(pt.x,pt.y,0,pt.x,pt.y,r*4)
        g.addColorStop(0,getColor(a,i)); g.addColorStop(1,getColor(0,i))
        ctx.beginPath(); ctx.arc(pt.x,pt.y,r*4,0,Math.PI*2); ctx.fillStyle=g; ctx.fill()
        ctx.beginPath(); ctx.arc(pt.x,pt.y,r,0,Math.PI*2); ctx.fillStyle=getColor(Math.min(a*1.5,1),i); ctx.fill()
        pt.x+=pt.vx; pt.y+=pt.vy
        if(pt.x<0||pt.x>W) pt.vx*=-1
        if(pt.y<0||pt.y>H) pt.vy*=-1
      })
      raf.current=requestAnimationFrame(draw)
    }
    draw()
    return ()=>{ cancelAnimationFrame(raf.current); ro.disconnect() }
  },[theme,getColor])
}

export default function Editor() {
  const [slides,setSlides]=useState<Slide[]>(()=>{
    try{ const d=localStorage.getItem("ss-load"); if(d){ localStorage.removeItem("ss-load"); return JSON.parse(d).slides||SLIDES } }catch{}
    return SLIDES
  })
  const [idx,setIdx]=useState(0)
  const [fmt,setFmt]=useState<Format>("4:5")
  const [theme,setTheme]=useState<Theme>("#2979FF")
  const [tab,setTab]=useState<"preview"|"edit">("preview")
  const [toast,setToast]=useState("")
  const [modal,setModal]=useState(false)
  const [saveName,setSaveName]=useState("")
  const cvRef=useRef<HTMLCanvasElement>(null)
  const prevRef=useRef<HTMLDivElement>(null)
  useCanvas(cvRef as React.RefObject<HTMLCanvasElement>,theme)
  const cur=slides[idx]
  const ac=theme==="multi"?"#2979FF":theme
  const upd=(f:keyof Slide,v:string)=>setSlides(p=>p.map(s=>s.id===cur.id?{...s,[f]:v}:s))
  const toast2=(m:string)=>{setToast(m);setTimeout(()=>setToast(""),2500)}

  const [fw,fh]=DIMS[fmt]; let pH=420,pW=(pH*fw)/fh; if(pW>320){pW=320;pH=(pW*fh)/fw}

  const exportPNG=async()=>{
    if(!prevRef.current) return
    try{
      const h2c=(await import("html2canvas")).default
      const c=await h2c(prevRef.current,{backgroundColor:"#020c1a",scale:2,useCORS:true})
      const a=document.createElement("a"); a.download=`slide-${idx+1}.png`; a.href=c.toDataURL(); a.click()
      toast2("PNG exportado ✓")
    }catch{ toast2("Error exportando PNG") }
  }

  const recordVideo=()=>{
    const cv=cvRef.current
    if(!cv||!("captureStream" in cv)){toast2("Navegador no soporta grabación");return}
    try{
      const stream=(cv as HTMLCanvasElement&{captureStream(fps?:number):MediaStream}).captureStream(30)
      const rec=new MediaRecorder(stream,{mimeType:"video/webm"})
      const chunks:Blob[]=[]
      rec.ondataavailable=e=>chunks.push(e.data)
      rec.onstop=()=>{
        const blob=new Blob(chunks,{type:"video/webm"})
        const url=URL.createObjectURL(blob)
        const a=document.createElement("a"); a.href=url; a.download="content-studio.webm"; a.click()
        URL.revokeObjectURL(url); toast2("Video descargado ✓")
      }
      rec.start(); toast2("Grabando 3s...")
      setTimeout(()=>rec.stop(),3000)
    }catch{toast2("Error grabando")}
  }

  const copyCopy=()=>{
    const txt=slides.map(s=>`[${s.label}]\n${s.title}\n${s.subtitle}\n${s.body}`).join("\n\n---\n\n")
    navigator.clipboard.writeText(txt).then(()=>toast2("Copiado ✓"))
  }

  const save=()=>{
    const name=saveName.trim()||`Diseño ${new Date().toLocaleDateString("es")}`
    const d={id:Date.now().toString(),name,theme,fmt,slideCount:slides.length,slides,createdAt:new Date().toISOString()}
    try{
      const raw=localStorage.getItem("ss-library")
      const arr=raw?JSON.parse(raw):[]
      arr.unshift(d); localStorage.setItem("ss-library",JSON.stringify(arr))
      setModal(false); setSaveName(""); toast2("Guardado ✓")
    }catch{toast2("Error guardando")}
  }

  const S: React.CSSProperties = { fontFamily:"Inter,sans-serif" }

  return (
    <div style={{...S, minHeight:"calc(100vh - 52px)", display:"flex", flexDirection:"column", background:"#020c1a"}}>
      {/* Toolbar */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 12px",borderBottom:"1px solid #0d2240",background:"rgba(7,20,40,0.95)",gap:8,flexWrap:"wrap"}}>
        <div style={{display:"flex",gap:4}}>
          {(["1:1","9:16","4:5"] as Format[]).map(f=>(
            <button key={f} onClick={()=>setFmt(f)} style={{padding:"5px 10px",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer",border:`1px solid ${fmt===f?ac+"66":"#0d2240"}`,background:fmt===f?`${ac}22`:"rgba(255,255,255,0.05)",color:fmt===f?ac:"rgba(255,255,255,0.4)"}}>
              {f}
            </button>
          ))}
        </div>
        <div style={{display:"flex",gap:4}}>
          {THEMES.map(t=>(
            <button key={t.c} onClick={()=>setTheme(t.c)} title={t.name}
              style={{width:22,height:22,borderRadius:"50%",cursor:"pointer",border:theme===t.c?"2px solid white":"2px solid transparent",
                background:t.c==="multi"?"linear-gradient(135deg,#2979FF,#00E5FF,#FFD740,#00C853,#FF5252)":t.c,
                boxShadow:theme===t.c?`0 0 8px ${t.c==="multi"?"#2979FF":t.c}`:"none"}} />
          ))}
        </div>
        <button onClick={()=>setModal(true)} style={{padding:"5px 12px",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer",background:"rgba(0,200,83,0.15)",color:"#00C853",border:"1px solid rgba(0,200,83,0.3)"}}>
          Guardar
        </button>
      </div>

      {/* Mobile tabs */}
      <div style={{display:"flex",borderBottom:"1px solid #0d2240"}}>
        {(["preview","edit"] as const).map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:"8px",fontSize:13,fontWeight:600,background:"transparent",border:"none",cursor:"pointer",color:tab===t?ac:"rgba(255,255,255,0.4)",borderBottom:tab===t?`2px solid ${ac}`:"2px solid transparent"}}>
            {t==="preview"?"Vista previa":"Editar"}
          </button>
        ))}
      </div>

      <div style={{display:"flex",flex:1,overflow:"hidden",minHeight:0}}>
        {/* Slide list */}
        <div style={{width:120,flexShrink:0,borderRight:"1px solid #0d2240",overflowY:"auto",background:"rgba(7,20,40,0.8)",display:"none"}}>
          {/* hidden on mobile via tab system */}
        </div>

        {/* Preview */}
        <div style={{flex:1,display:tab==="edit"?"none":"flex",flexDirection:"column",alignItems:"center",overflowY:"auto",padding:"16px",gap:12}}>
          {/* Slide chips */}
          <div style={{display:"flex",gap:6,overflowX:"auto",width:"100%",paddingBottom:4}}>
            {slides.map((s,i)=>(
              <button key={s.id} onClick={()=>setIdx(i)} style={{flexShrink:0,fontSize:11,padding:"5px 10px",borderRadius:20,fontWeight:600,cursor:"pointer",background:i===idx?`${ac}33`:"rgba(255,255,255,0.07)",color:i===idx?ac:"rgba(255,255,255,0.4)",border:`1px solid ${i===idx?ac+"88":"transparent"}`}}>
                {i+1}. {s.label}
              </button>
            ))}
          </div>

          {/* Canvas */}
          <div style={{position:"relative",borderRadius:16,overflow:"hidden",width:pW,height:pH,border:`1px solid ${ac}44`,boxShadow:`0 0 40px ${ac}22`,flexShrink:0}}>
            <canvas ref={cvRef} style={{position:"absolute",inset:0,width:"100%",height:"100%"}} />
            <div ref={prevRef} style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",justifyContent:"space-between",padding:20,background:"rgba(2,12,26,0.45)"}}>
              <span style={{fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:20,alignSelf:"flex-start",background:`${ac}33`,color:ac,border:`1px solid ${ac}66`}}>{cur.label}</span>
              <div>
                <p style={{fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.1em",color:ac,marginBottom:6}}>{cur.subtitle}</p>
                <h2 style={{fontSize:17,fontWeight:800,color:"white",lineHeight:1.3,marginBottom:8}}>{cur.title}</h2>
                <p style={{fontSize:12,lineHeight:1.6,color:"rgba(255,255,255,0.75)"}}>{cur.body}</p>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:10,color:"rgba(255,255,255,0.35)"}}>{idx+1}/{slides.length}</span>
                <div style={{display:"flex",gap:3}}>
                  {slides.map((_,i)=><div key={i} style={{height:5,borderRadius:3,background:i===idx?ac:"rgba(255,255,255,0.2)",width:i===idx?14:5,transition:"all .3s"}} />)}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center"}}>
            {[
              {label:"⬇ PNG",fn:exportPNG,color:ac},
              {label:"● Video",fn:recordVideo,color:"#FF5252"},
              {label:"⎘ Copy",fn:copyCopy,color:"#00E5FF"},
            ].map(b=>(
              <button key={b.label} onClick={b.fn} style={{padding:"8px 16px",borderRadius:12,fontSize:13,fontWeight:600,cursor:"pointer",background:`rgba(${b.color==="rgba(255,82,82,1)"?"255,82,82":b.color==="#FF5252"?"255,82,82":b.color==="#00E5FF"?"0,229,255":"41,121,255"},0.15)`,color:b.color,border:`1px solid ${b.color}44`}}>
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* Edit panel */}
        <div style={{width:"100%",display:tab==="preview"?"none":"flex",flexDirection:"column",overflowY:"auto",background:"rgba(7,20,40,0.8)",borderLeft:"1px solid #0d2240"}}>
          <div style={{padding:"12px 16px",borderBottom:"1px solid #0d2240"}}>
            <p style={{fontSize:13,fontWeight:700,color:"white"}}>Slide {idx+1} — <span style={{color:ac}}>{cur.label}</span></p>
          </div>
          <div style={{padding:16,display:"flex",flexDirection:"column",gap:14}}>
            {([["title","Título",false],["subtitle","Subtítulo",false],["body","Cuerpo",true]] as [keyof Slide,string,boolean][]).map(([f,lbl,multi])=>(
              <div key={f}>
                <label style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.45)",display:"block",marginBottom:6}}>{lbl}</label>
                {multi
                  ? <textarea value={cur[f] as string} onChange={e=>upd(f,e.target.value)} rows={4}
                      style={{width:"100%",borderRadius:12,padding:"10px 12px",fontSize:13,color:"white",background:"rgba(255,255,255,0.05)",border:`1px solid ${ac}33`,fontFamily:"Inter,sans-serif",resize:"none",outline:"none"}}
                      onFocus={e=>e.target.style.borderColor=ac+"99"} onBlur={e=>e.target.style.borderColor=ac+"33"} />
                  : <input type="text" value={cur[f] as string} onChange={e=>upd(f,e.target.value)}
                      style={{width:"100%",borderRadius:12,padding:"10px 12px",fontSize:13,color:"white",background:"rgba(255,255,255,0.05)",border:`1px solid ${ac}33`,fontFamily:"Inter,sans-serif",outline:"none"}}
                      onFocus={e=>e.target.style.borderColor=ac+"99"} onBlur={e=>e.target.style.borderColor=ac+"33"} />
                }
              </div>
            ))}
            <div>
              <label style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.45)",display:"block",marginBottom:6}}>Label SPIN</label>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {LABELS.map(l=>(
                  <button key={l} onClick={()=>upd("label",l)} style={{fontSize:11,padding:"4px 10px",borderRadius:8,fontWeight:600,cursor:"pointer",background:cur.label===l?`${ac}33`:"rgba(255,255,255,0.06)",color:cur.label===l?ac:"rgba(255,255,255,0.4)",border:`1px solid ${cur.label===l?ac+"55":"transparent"}`}}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save modal */}
      {modal&&(
        <div style={{position:"fixed",inset:0,zIndex:50,display:"flex",alignItems:"center",justifyContent:"center",padding:16,background:"rgba(2,12,26,0.85)",backdropFilter:"blur(8px)"}}>
          <div style={{width:"100%",maxWidth:340,borderRadius:20,padding:24,background:"rgba(13,21,38,0.98)",border:"1px solid rgba(0,200,83,0.3)",backdropFilter:"blur(20px)"}}>
            <p style={{fontSize:15,fontWeight:700,color:"white",marginBottom:12}}>Guardar diseño</p>
            <input type="text" placeholder="Nombre..." value={saveName} onChange={e=>setSaveName(e.target.value)}
              style={{width:"100%",borderRadius:12,padding:"10px 12px",fontSize:13,color:"white",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(0,200,83,0.3)",fontFamily:"Inter,sans-serif",outline:"none",marginBottom:14}}
              onKeyDown={e=>e.key==="Enter"&&save()} autoFocus />
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setModal(false)} style={{flex:1,padding:10,borderRadius:12,fontSize:13,fontWeight:600,cursor:"pointer",background:"rgba(255,255,255,0.07)",color:"rgba(255,255,255,0.6)",border:"none"}}>Cancelar</button>
              <button onClick={save} style={{flex:1,padding:10,borderRadius:12,fontSize:13,fontWeight:600,cursor:"pointer",background:"rgba(0,200,83,0.2)",color:"#00C853",border:"1px solid rgba(0,200,83,0.3)"}}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {toast&&<div style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",padding:"10px 20px",borderRadius:30,fontSize:13,fontWeight:600,zIndex:50,background:"rgba(13,21,38,0.95)",border:`1px solid ${ac}55`,color:ac,backdropFilter:"blur(20px)"}}>{toast}</div>}
    </div>
  )
}
'@

# ── src/pages/Chat.tsx ────────────────────────────────────────────────────────
Set-Content src/pages/Chat.tsx -Encoding UTF8 @'
import { useState, useRef, useEffect } from "react"

const LS_KEY = "ss-claude-key"

const SYSTEM = `Eres el Rey Salomón, sabio estratega de contenido digital. Hablas con profundidad, usas metáforas bíblicas y siempre estructuras tus respuestas con metodología SPIN:

🔵 SITUACIÓN: Contexto actual
🔴 PROBLEMA: El dolor real
🟡 IMPLICACIÓN: Consecuencias de no actuar
🟢 NECESIDAD-SOLUCIÓN: La solución concreta y accionable

Ayudas a creadores de contenido sobre finanzas y libertad. Comienzas con una cita de Proverbios.`

const SUGGESTED = [
  "¿Cómo responder a un seguidor molesto con sabiduría?",
  "Dame un hook para mi reel sobre finanzas",
  "Estructura mi carrusel sobre salir de deudas",
  "¿Qué contenido genera más engagement?",
]

const QUICK = [
  { l:"Analizar situación", p:"Analiza la situación de un creador financiero que quiere empezar pero no sabe por dónde." },
  { l:"Identificar problema", p:"Identifica los problemas de una persona de 30 años con deudas y sin ahorros, desde la perspectiva del contenido." },
  { l:"Crear solución", p:"Dame una estrategia de contenido sobre finanzas personales usando metodología SPIN." },
  { l:"Generar CTA", p:"Genera 5 CTAs poderosos para un reel de libertad financiera que generen comentarios y guardados." },
]

interface Msg { id: string; role: "user"|"assistant"; content: string }

function Dots() {
  return (
    <div style={{display:"flex",gap:4,padding:"12px 16px"}}>
      {[0,1,2].map(i=>(
        <div key={i} style={{width:8,height:8,borderRadius:"50%",background:"#00E5FF",animation:`b 1.2s ease-in-out ${i*.2}s infinite`}} />
      ))}
      <style>{`@keyframes b{0%,60%,100%{transform:translateY(0);opacity:.4}30%{transform:translateY(-6px);opacity:1}}`}</style>
    </div>
  )
}

export default function Chat() {
  const [msgs,setMsgs]=useState<Msg[]>([])
  const [input,setInput]=useState("")
  const [loading,setLoading]=useState(false)
  const [key,setKey]=useState(()=>localStorage.getItem(LS_KEY)||"")
  const [keyInput,setKeyInput]=useState("")
  const [showKey,setShowKey]=useState(!localStorage.getItem(LS_KEY))
  const [err,setErr]=useState("")
  const ref=useRef<HTMLDivElement>(null)
  const S={fontFamily:"Inter,sans-serif"}

  useEffect(()=>{ref.current?.scrollIntoView({behavior:"smooth"})},[msgs,loading])

  const saveKey=()=>{
    const k=keyInput.trim()
    if(!k.startsWith("sk-ant-")){setErr("Debe comenzar con sk-ant-");return}
    localStorage.setItem(LS_KEY,k); setKey(k); setShowKey(false); setErr("")
  }

  const send=async(text:string)=>{
    if(!text.trim()||loading) return
    if(!key){setShowKey(true);return}
    const m:Msg={id:Date.now().toString(),role:"user",content:text.trim()}
    setMsgs(p=>[...p,m]); setInput(""); setLoading(true); setErr("")
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json","x-api-key":key,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1024,system:SYSTEM,messages:[...msgs,m].map(x=>({role:x.role,content:x.content}))}),
      })
      if(!res.ok){const e=await res.json().catch(()=>({}));throw new Error((e as {error?:{message?:string}})?.error?.message||`Error ${res.status}`)}
      const d=await res.json() as {content?:{text:string}[]}
      setMsgs(p=>[...p,{id:(Date.now()+1).toString(),role:"assistant",content:d.content?.[0]?.text||"Sin respuesta"}])
    }catch(e){setErr(e instanceof Error?e.message:"Error")}
    finally{setLoading(false)}
  }

  return (
    <div style={{...S,display:"flex",flexDirection:"column",height:"calc(100vh - 52px)",background:"#020c1a"}}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",gap:12,padding:"10px 16px",borderBottom:"1px solid #0d2240",background:"rgba(7,20,40,0.95)",flexShrink:0}}>
        <div style={{width:36,height:36,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,background:"rgba(0,229,255,0.15)",border:"1px solid rgba(0,229,255,0.3)"}}>👑</div>
        <div style={{flex:1}}>
          <p style={{fontSize:14,fontWeight:700,color:"white",margin:0}}>Rey Salomón IA</p>
          <p style={{fontSize:11,color:"#00E5FF",margin:0}}>Estratega de Contenido</p>
        </div>
        <button onClick={()=>setShowKey(v=>!v)} style={{padding:8,borderRadius:8,background:"rgba(255,255,255,0.06)",border:"none",cursor:"pointer",fontSize:14}}>🔑</button>
      </div>

      {/* Key input */}
      {showKey&&(
        <div style={{padding:"10px 16px",borderBottom:"1px solid #0d2240",background:"rgba(0,229,255,0.05)",flexShrink:0}}>
          <p style={{fontSize:11,fontWeight:600,color:"#00E5FF",marginBottom:8}}>Claude API Key</p>
          <div style={{display:"flex",gap:8}}>
            <input type="password" placeholder="sk-ant-api..." value={keyInput} onChange={e=>setKeyInput(e.target.value)}
              style={{flex:1,borderRadius:10,padding:"8px 12px",fontSize:13,color:"white",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(0,229,255,0.3)",fontFamily:"Inter,sans-serif",outline:"none"}}
              onKeyDown={e=>e.key==="Enter"&&saveKey()} />
            <button onClick={saveKey} style={{padding:"8px 16px",borderRadius:10,fontSize:13,fontWeight:600,cursor:"pointer",background:"rgba(0,229,255,0.2)",color:"#00E5FF",border:"1px solid rgba(0,229,255,0.4)"}}>OK</button>
          </div>
          {err&&<p style={{fontSize:11,color:"#FF5252",marginTop:6}}>{err}</p>}
          {key&&<p style={{fontSize:11,color:"#00C853",marginTop:6}}>✓ Key configurada</p>}
        </div>
      )}

      {/* Messages */}
      <div style={{flex:1,overflowY:"auto",padding:"16px",display:"flex",flexDirection:"column",gap:12,minHeight:0}}>
        {msgs.length===0&&(
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",gap:20,textAlign:"center"}}>
            <div>
              <div style={{fontSize:48,marginBottom:10}}>👑</div>
              <h2 style={{fontSize:18,fontWeight:700,color:"white",margin:"0 0 6px"}}>Rey Salomón te escucha</h2>
              <p style={{fontSize:13,color:"rgba(255,255,255,0.45)",margin:0}}>"El que anda con sabios, sabio se volverá" — Prov 13:20</p>
            </div>
            <div style={{width:"100%",maxWidth:400,display:"flex",flexDirection:"column",gap:8}}>
              {SUGGESTED.map((s,i)=>(
                <button key={i} onClick={()=>send(s)}
                  style={{textAlign:"left",fontSize:13,padding:"12px 16px",borderRadius:12,cursor:"pointer",background:"rgba(13,21,38,0.9)",border:"1px solid #0d2240",color:"rgba(255,255,255,0.65)",backdropFilter:"blur(20px)",fontFamily:"Inter,sans-serif"}}
                  onMouseEnter={e=>(e.currentTarget as HTMLElement).style.borderColor="#00E5FF55"}
                  onMouseLeave={e=>(e.currentTarget as HTMLElement).style.borderColor="#0d2240"}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {msgs.map(m=>(
          <div key={m.id} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",gap:8}}>
            {m.role==="assistant"&&<div style={{width:28,height:28,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0,marginTop:4,background:"rgba(0,229,255,0.12)",border:"1px solid rgba(0,229,255,0.25)"}}>👑</div>}
            <div style={{maxWidth:"80%",padding:"10px 14px",fontSize:13,lineHeight:1.6,whiteSpace:"pre-wrap",
              background:m.role==="user"?"rgba(41,121,255,0.25)":"rgba(13,21,38,0.9)",
              border:m.role==="user"?"1px solid rgba(41,121,255,0.4)":"1px solid #0d2240",
              color:m.role==="user"?"#fff":"rgba(255,255,255,0.85)",
              borderRadius:m.role==="user"?"18px 18px 4px 18px":"18px 18px 18px 4px",
              backdropFilter:m.role==="assistant"?"blur(20px)":undefined}}>
              {m.content}
            </div>
          </div>
        ))}
        {loading&&(
          <div style={{display:"flex",gap:8}}>
            <div style={{width:28,height:28,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0,background:"rgba(0,229,255,0.12)",border:"1px solid rgba(0,229,255,0.25)"}}>👑</div>
            <div style={{background:"rgba(13,21,38,0.9)",border:"1px solid #0d2240",borderRadius:"18px 18px 18px 4px"}}><Dots /></div>
          </div>
        )}
        {err&&msgs.length>0&&<div style={{fontSize:12,padding:"8px 14px",borderRadius:10,margin:"0 auto",background:"rgba(255,82,82,0.12)",color:"#FF5252",border:"1px solid rgba(255,82,82,0.25)",maxWidth:360}}>{err}</div>}
        <div ref={ref} />
      </div>

      {/* Quick actions */}
      <div style={{padding:"8px 12px",borderTop:"1px solid #0d2240",overflowX:"auto",flexShrink:0}}>
        <div style={{display:"flex",gap:6,minWidth:"max-content"}}>
          {QUICK.map(q=>(
            <button key={q.l} onClick={()=>send(q.p)} style={{fontSize:11,padding:"5px 12px",borderRadius:20,fontWeight:600,cursor:"pointer",flexShrink:0,background:"rgba(0,229,255,0.1)",color:"#00E5FF",border:"1px solid rgba(0,229,255,0.25)",fontFamily:"Inter,sans-serif"}}>
              {q.l}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div style={{padding:"10px 12px",borderTop:"1px solid #0d2240",background:"rgba(7,20,40,0.95)",flexShrink:0}}>
        <div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
          <textarea value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send(input)}}}
            placeholder="Escribe tu pregunta al Rey Salomón..." rows={1}
            style={{flex:1,borderRadius:14,padding:"10px 14px",fontSize:13,color:"white",background:"rgba(255,255,255,0.06)",border:"1px solid #0d2240",fontFamily:"Inter,sans-serif",resize:"none",outline:"none",maxHeight:100}}
            onFocus={e=>e.target.style.borderColor="rgba(0,229,255,0.4)"} onBlur={e=>e.target.style.borderColor="#0d2240"} />
          <button onClick={()=>send(input)} disabled={!input.trim()||loading}
            style={{width:40,height:40,borderRadius:12,flexShrink:0,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",background:input.trim()&&!loading?"rgba(0,229,255,0.2)":"rgba(255,255,255,0.06)",border:`1px solid ${input.trim()&&!loading?"rgba(0,229,255,0.4)":"#0d2240"}`,fontSize:16,opacity:!input.trim()||loading?.5:1}}>
            ➤
          </button>
        </div>
      </div>
    </div>
  )
}
'@

# ── src/pages/Library.tsx ─────────────────────────────────────────────────────
Set-Content src/pages/Library.tsx -Encoding UTF8 @'
import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"

const LS = "ss-library"
interface Design { id:string; name:string; theme:string; fmt:string; slideCount:number; slides:unknown[]; createdAt:string }
const CLABELS: Record<string,string> = {"#2979FF":"Azul","#00E5FF":"Cyan","#FFD740":"Oro","#00C853":"Verde","#FF5252":"Rojo",multi:"Multi"}

export default function Library() {
  const [designs,setDesigns]=useState<Design[]>([])
  const [toast,setToast]=useState("")
  const [del,setDel]=useState<string|null>(null)
  const importRef=useRef<HTMLInputElement>(null)
  const nav=useNavigate()
  const S={fontFamily:"Inter,sans-serif"}

  useEffect(()=>{try{const r=localStorage.getItem(LS);if(r)setDesigns(JSON.parse(r))}catch{}},[])

  const persist=(d:Design[])=>{setDesigns(d);localStorage.setItem(LS,JSON.stringify(d))}
  const toast2=(m:string)=>{setToast(m);setTimeout(()=>setToast(""),2500)}
  const remove=(id:string)=>{persist(designs.filter(d=>d.id!==id));setDel(null);toast2("Eliminado")}
  const load=(d:Design)=>{localStorage.setItem("ss-load",JSON.stringify(d));nav("/editor")}

  const exportAll=()=>{
    const blob=new Blob([JSON.stringify(designs,null,2)],{type:"application/json"})
    const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download="library.json"; a.click(); URL.revokeObjectURL(url); toast2("Exportado ✓")
  }

  const importJSON=(e:React.ChangeEvent<HTMLInputElement>)=>{
    const file=e.target.files?.[0]; if(!file) return
    const reader=new FileReader()
    reader.onload=ev=>{
      try{
        const p:Design[]=JSON.parse(ev.target?.result as string)
        persist([...designs,...p.filter(x=>!designs.find(d=>d.id===x.id))])
        toast2(`${p.length} importados ✓`)
      }catch{toast2("Error importando")}
    }
    reader.readAsText(file); e.target.value=""
  }

  return (
    <div style={{...S,minHeight:"calc(100vh - 52px)",background:"#020c1a"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",borderBottom:"1px solid #0d2240",position:"sticky",top:52,background:"rgba(7,20,40,0.95)",backdropFilter:"blur(20px)",zIndex:10}}>
        <p style={{fontSize:15,fontWeight:700,color:"white",margin:0}}>📚 Biblioteca <span style={{fontSize:12,color:"rgba(255,255,255,0.35)",fontWeight:400}}>({designs.length})</span></p>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>importRef.current?.click()} style={{fontSize:12,padding:"5px 12px",borderRadius:8,fontWeight:600,cursor:"pointer",background:"rgba(255,215,64,0.1)",color:"#FFD740",border:"1px solid rgba(255,215,64,0.25)"}}>Importar</button>
          <input ref={importRef} type="file" accept=".json" style={{display:"none"}} onChange={importJSON} />
          {designs.length>0&&<button onClick={exportAll} style={{fontSize:12,padding:"5px 12px",borderRadius:8,fontWeight:600,cursor:"pointer",background:"rgba(0,200,83,0.1)",color:"#00C853",border:"1px solid rgba(0,200,83,0.25)"}}>Exportar</button>}
        </div>
      </div>

      <div style={{maxWidth:860,margin:"0 auto",padding:"20px 16px"}}>
        {designs.length===0?(
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"80px 0",textAlign:"center"}}>
            <div style={{fontSize:56,marginBottom:16}}>📚</div>
            <h2 style={{fontSize:20,fontWeight:700,color:"white",marginBottom:8}}>Biblioteca vacía</h2>
            <p style={{fontSize:14,color:"rgba(255,255,255,0.45)",marginBottom:24}}>Guarda tus carruseles desde el Editor.</p>
            <button onClick={()=>nav("/editor")} style={{padding:"10px 24px",borderRadius:12,fontSize:14,fontWeight:600,cursor:"pointer",background:"rgba(255,215,64,0.15)",color:"#FFD740",border:"1px solid rgba(255,215,64,0.3)"}}>
              Ir al Editor
            </button>
          </div>
        ):(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:16}}>
            {designs.map(d=>{
              const color=d.theme==="multi"?"#2979FF":d.theme
              return (
                <div key={d.id}
                  style={{background:"rgba(13,21,38,0.9)",backdropFilter:"blur(20px)",border:"1px solid #0d2240",borderRadius:18,padding:20,transition:"all .2s",cursor:"default"}}
                  onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor=color+"66";(e.currentTarget as HTMLElement).style.transform="translateY(-2px)"}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor="#0d2240";(e.currentTarget as HTMLElement).style.transform="none"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:14,height:14,borderRadius:"50%",background:d.theme==="multi"?"linear-gradient(135deg,#2979FF,#00E5FF,#FFD740)":d.theme,boxShadow:`0 0 6px ${color}66`}} />
                      <span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:20,background:`${color}22`,color}}>{d.fmt}</span>
                    </div>
                    <span style={{fontSize:11,color:"rgba(255,255,255,0.3)"}}>{d.slideCount} slides</span>
                  </div>
                  <h3 style={{fontSize:14,fontWeight:700,color:"white",marginBottom:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d.name}</h3>
                  <p style={{fontSize:11,color:"rgba(255,255,255,0.3)",marginBottom:14}}>{CLABELS[d.theme]??d.theme}</p>
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={()=>load(d)} style={{flex:1,padding:"7px 0",borderRadius:10,fontSize:12,fontWeight:600,cursor:"pointer",background:`${color}22`,color,border:`1px solid ${color}44`}}>Cargar</button>
                    <button onClick={()=>setDel(d.id)} style={{padding:"7px 10px",borderRadius:10,fontSize:12,fontWeight:600,cursor:"pointer",background:"rgba(255,82,82,0.1)",color:"#FF5252",border:"1px solid rgba(255,82,82,0.2)"}}>🗑</button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {del&&(
        <div style={{position:"fixed",inset:0,zIndex:50,display:"flex",alignItems:"center",justifyContent:"center",padding:16,background:"rgba(2,12,26,0.85)",backdropFilter:"blur(8px)"}}>
          <div style={{width:"100%",maxWidth:320,borderRadius:20,padding:24,background:"rgba(13,21,38,0.98)",border:"1px solid rgba(255,82,82,0.3)"}}>
            <p style={{fontSize:15,fontWeight:700,color:"white",marginBottom:8}}>¿Eliminar diseño?</p>
            <p style={{fontSize:13,color:"rgba(255,255,255,0.5)",marginBottom:20}}>Esta acción no se puede deshacer.</p>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setDel(null)} style={{flex:1,padding:10,borderRadius:12,fontSize:13,fontWeight:600,cursor:"pointer",background:"rgba(255,255,255,0.07)",color:"rgba(255,255,255,0.6)",border:"none"}}>Cancelar</button>
              <button onClick={()=>remove(del)} style={{flex:1,padding:10,borderRadius:12,fontSize:13,fontWeight:600,cursor:"pointer",background:"rgba(255,82,82,0.2)",color:"#FF5252",border:"1px solid rgba(255,82,82,0.3)"}}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {toast&&<div style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",padding:"10px 20px",borderRadius:30,fontSize:13,fontWeight:600,zIndex:50,background:"rgba(13,21,38,0.95)",border:"1px solid rgba(255,215,64,0.4)",color:"#FFD740",backdropFilter:"blur(20px)"}}>{toast}</div>}
    </div>
  )
}
'@

# ── Git commit & push ─────────────────────────────────────────────────────────
Write-Host ""
Write-Host "Haciendo commit y push..." -ForegroundColor Cyan
git add .
git commit -m "feat: content studio completo — Editor 3D, Chat Rey Salomon, Library"
git push

Write-Host ""
Write-Host "Done!"


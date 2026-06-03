import React, { useState, useEffect, useRef, useCallback } from "react"

interface Slide { id: number; label: string; title: string; subtitle: string; body: string }
type Format = "1:1" | "9:16" | "4:5"
type Theme = "#2979FF" | "#00E5FF" | "#FFD740" | "#00C853" | "#FF5252" | "multi"
interface Particle { x: number; y: number; vx: number; vy: number; r: number; op: number; pulse: number; ps: number }

const DIMS: Record<Format, [number, number]> = { "1:1": [1,1], "9:16": [9,16], "4:5": [4,5] }
const LABELS = ["Situacion","Problema","Implicacion","Necesidad-Solucion","Rey Salomon Hook","CTA"]
const THEMES: { c: Theme; name: string }[] = [
  { c:"#2979FF",name:"Azul"},{ c:"#00E5FF",name:"Cyan"},{ c:"#FFD740",name:"Oro"},
  { c:"#00C853",name:"Verde"},{ c:"#FF5252",name:"Rojo"},{ c:"multi",name:"Multi"},
]
const PALETTE = ["#2979FF","#00E5FF","#FFD740","#00C853","#FF5252"]

const DEFAULT_SLIDES: Slide[] = [
  { id:1, label:"Situacion", title:"Sabias que el 80% pierde dinero?", subtitle:"La realidad que nadie te cuenta", body:"La mayoria trabaja toda su vida sin construir riqueza real. El sistema no fue disenado para ensenarte a prosperar." },
  { id:2, label:"Problema", title:"El problema no es tu salario", subtitle:"Es lo que haces con el", body:"Sin estrategia, cada peso que ganas se escapa entre gastos invisibles, deudas y malos habitos financieros." },
  { id:3, label:"Implicacion", title:"10 anos mas tarde...", subtitle:"El costo del tiempo perdido", body:"Cada mes sin invertir es dinero que el interes compuesto nunca multiplicara. El tiempo es tu activo mas valioso." },
  { id:4, label:"Necesidad-Solucion", title:"La solucion es mas simple", subtitle:"Tres pasos que cambian todo", body:"1. Conoce tu flujo de dinero. 2. Elimina deudas toxicas. 3. Invierte automaticamente." },
  { id:5, label:"Rey Salomon Hook", title:"El que cuida su dinero, cuida su libertad", subtitle:"Proverbio milenario", body:"Los sabios de todas las epocas entendieron que la prosperidad no es suerte, es disciplina convertida en habito." },
  { id:6, label:"CTA", title:"Listo para cambiar tu historia?", subtitle:"El primer paso es hoy", body:"Sigue esta cuenta para mas estrategias. Comenta LISTO y te envio mi guia gratuita." },
]

function rgb(hex: string): [number,number,number] {
  return [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16)]
}
function rgba(hex: string, a: number, idx = 0): string {
  const h = hex === "multi" ? PALETTE[idx % PALETTE.length] : hex
  const [r,g,b] = rgb(h)
  return `rgba(${r},${g},${b},${a})`
}

function useCanvas(
  ref: React.RefObject<HTMLCanvasElement>,
  theme: Theme,
  slide: Slide,
  accentColor: string,
  recording: boolean,
) {
  const pts = useRef<Particle[]>([])
  const raf = useRef(0)
  const themeRef = useRef(theme)
  const slideRef = useRef(slide)
  const recRef = useRef(recording)
  useEffect(() => { themeRef.current = theme }, [theme])
  useEffect(() => { slideRef.current = slide }, [slide])
  useEffect(() => { recRef.current = recording }, [recording])

  const getColor = useCallback((a: number, i: number) => rgba(themeRef.current, a, i), [])

  useEffect(() => {
    const cv = ref.current; if (!cv) return
    const ctx = cv.getContext("2d"); if (!ctx) return
    const resize = () => { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; initParticles() }
    const initParticles = () => {
      pts.current = Array.from({length:80},()=>({
        x:Math.random()*(cv.width||400), y:Math.random()*(cv.height||600),
        vx:(Math.random()-.5)*.6, vy:(Math.random()-.5)*.6,
        r:Math.random()*2.5+1, op:Math.random()*.5+.3,
        pulse:Math.random()*Math.PI*2, ps:Math.random()*.02+.01,
      }))
    }
    resize()
    const ro = new ResizeObserver(resize); ro.observe(cv)

    const draw = () => {
      const W=cv.width, H=cv.height
      ctx.clearRect(0,0,W,H)
      // Background
      const bg=ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,Math.max(W,H)/1.5)
      bg.addColorStop(0,"rgba(7,20,40,1)"); bg.addColorStop(1,"rgba(2,12,26,1)")
      ctx.fillStyle=bg; ctx.fillRect(0,0,W,H)
      // Connections
      const p=pts.current
      for(let i=0;i<p.length;i++) for(let j=i+1;j<p.length;j++){
        const dx=p[i].x-p[j].x, dy=p[i].y-p[j].y, d=Math.sqrt(dx*dx+dy*dy)
        if(d<120){ ctx.beginPath(); ctx.moveTo(p[i].x,p[i].y); ctx.lineTo(p[j].x,p[j].y); ctx.strokeStyle=getColor((1-d/120)*.25,i); ctx.lineWidth=.8; ctx.stroke() }
      }
      // Particles
      p.forEach((pt,i)=>{
        pt.pulse+=pt.ps
        const pf=.85+Math.sin(pt.pulse)*.15, r=pt.r*pf, a=pt.op*pf
        const g2=ctx.createRadialGradient(pt.x,pt.y,0,pt.x,pt.y,r*4)
        g2.addColorStop(0,getColor(a,i)); g2.addColorStop(1,getColor(0,i))
        ctx.beginPath(); ctx.arc(pt.x,pt.y,r*4,0,Math.PI*2); ctx.fillStyle=g2; ctx.fill()
        ctx.beginPath(); ctx.arc(pt.x,pt.y,r,0,Math.PI*2); ctx.fillStyle=getColor(Math.min(a*1.5,1),i); ctx.fill()
        pt.x+=pt.vx; pt.y+=pt.vy
        if(pt.x<0||pt.x>W) pt.vx*=-1
        if(pt.y<0||pt.y>H) pt.vy*=-1
      })
      // Draw text on canvas during recording
      if(recRef.current) {
        const s=slideRef.current
        const ac=themeRef.current==="multi"?"#2979FF":themeRef.current
        ctx.fillStyle="rgba(2,12,26,0.55)"; ctx.fillRect(0,0,W,H)
        // Label badge
        ctx.fillStyle=ac+"55"; ctx.beginPath()
        const lw=ctx.measureText(s.label).width+20
        ctx.roundRect(16,16,lw,24,12); ctx.fill()
        ctx.fillStyle=ac; ctx.font="bold 11px Inter,sans-serif"; ctx.fillText(s.label,26,32)
        // Subtitle
        ctx.fillStyle=ac; ctx.font="bold 11px Inter,sans-serif"
        ctx.fillText(s.subtitle.toUpperCase().slice(0,40),16,H-100)
        // Title
        ctx.fillStyle="white"; ctx.font=`bold ${Math.floor(W/14)}px Inter,sans-serif`
        const words=s.title.split(" "); let line=""; let y=H-72
        for(const w of words){
          const test=line+w+" "
          if(ctx.measureText(test).width>W-32&&line){ ctx.fillText(line.trim(),16,y); line=w+" "; y+=Math.floor(W/13) }
          else line=test
        }
        ctx.fillText(line.trim(),16,y)
        // Body
        ctx.fillStyle="rgba(255,255,255,0.7)"; ctx.font=`${Math.floor(W/24)}px Inter,sans-serif`
        const bwords=s.body.split(" "); let bl=""; let by=y+Math.floor(W/13)+8
        for(const w of bwords){
          const test=bl+w+" "
          if(ctx.measureText(test).width>W-32&&bl){ ctx.fillText(bl.trim(),16,by); bl=w+" "; by+=Math.floor(W/22) }
          else bl=test
        }
        ctx.fillText(bl.trim(),16,by)
      }
      raf.current=requestAnimationFrame(draw)
    }
    draw()
    return ()=>{ cancelAnimationFrame(raf.current); ro.disconnect() }
  }, [getColor])
}

export default function Editor() {
  const [slides,setSlides]=useState<Slide[]>(()=>{
    try{
      const d=localStorage.getItem("ss-load")
      if(d){ localStorage.removeItem("ss-load"); const p=JSON.parse(d); return p.slides||DEFAULT_SLIDES }
    }catch{}
    return DEFAULT_SLIDES
  })
  const [idx,setIdx]=useState(0)
  const [fmt,setFmt]=useState<Format>("4:5")
  const [theme,setTheme]=useState<Theme>("#2979FF")
  const [recording,setRecording]=useState(false)
  const [toast,setToast]=useState("")
  const [modal,setModal]=useState(false)
  const [saveName,setSaveName]=useState("")
  const cvRef=useRef<HTMLCanvasElement>(null)
  const prevRef=useRef<HTMLDivElement>(null)

  const cur=slides[idx]
  const ac=theme==="multi"?"#2979FF":theme

  useCanvas(cvRef as React.RefObject<HTMLCanvasElement>, theme, cur, ac, recording)

  const upd=(f:keyof Slide,v:string)=>
    setSlides(p=>p.map((s,i)=>i===idx?{...s,[f]:v}:s))

  const toast2=(m:string)=>{setToast(m);setTimeout(()=>setToast(""),2500)}

  const [fw,fh]=DIMS[fmt]
  let pH=Math.min(window.innerHeight-220, 480)
  let pW=(pH*fw)/fh
  const maxW=Math.min(window.innerWidth*0.45, 380)
  if(pW>maxW){pW=maxW;pH=(pW*fh)/fw}

  const exportPNG=async()=>{
    if(!prevRef.current) return
    try{
      const h2c=(await import("html2canvas")).default
      const c=await h2c(prevRef.current,{backgroundColor:"#020c1a",scale:2,useCORS:true,logging:false})
      const a=document.createElement("a"); a.download=`slide-${idx+1}.png`; a.href=c.toDataURL(); a.click()
      toast2("PNG exportado")
    }catch{ toast2("Error exportando") }
  }

  const recordVideo=()=>{
    const cv=cvRef.current
    if(!cv||!("captureStream" in cv)){toast2("Navegador no soporta grabacion");return}
    setRecording(true)
    setTimeout(()=>{
      try{
        const stream=(cv as HTMLCanvasElement&{captureStream(fps?:number):MediaStream}).captureStream(30)
        const rec=new MediaRecorder(stream,{mimeType:"video/webm"})
        const chunks:Blob[]=[]
        rec.ondataavailable=e=>e.data.size>0&&chunks.push(e.data)
        rec.onstop=()=>{
          const blob=new Blob(chunks,{type:"video/webm"})
          const url=URL.createObjectURL(blob)
          const a=document.createElement("a"); a.href=url; a.download=`slide-${idx+1}.webm`; a.click()
          URL.revokeObjectURL(url); setRecording(false); toast2("Video descargado")
        }
        rec.start(); toast2("Grabando 4s con texto...")
        setTimeout(()=>rec.stop(),4000)
      }catch{ setRecording(false); toast2("Error grabando") }
    },200)
  }

  const copyCopy=()=>{
    const txt=slides.map(s=>`[${s.label}]\n${s.title}\n${s.subtitle}\n${s.body}`).join("\n\n---\n\n")
    navigator.clipboard.writeText(txt).then(()=>toast2("Copiado"))
  }

  const saveLib=()=>{
    const name=saveName.trim()||`Diseno ${new Date().toLocaleDateString("es")}`
    const d={id:Date.now().toString(),name,theme,fmt,slideCount:slides.length,slides,createdAt:new Date().toISOString()}
    try{
      const raw=localStorage.getItem("ss-library")
      const arr=raw?JSON.parse(raw):[]
      arr.unshift(d); localStorage.setItem("ss-library",JSON.stringify(arr))
      setModal(false); setSaveName(""); toast2("Guardado en Biblioteca")
    }catch{toast2("Error guardando")}
  }

  const F: React.CSSProperties = {fontFamily:"Inter,sans-serif"}

  return (
    <div style={{...F,display:"flex",flexDirection:"column",height:"calc(100vh - 52px)",background:"#020c1a",overflow:"hidden"}}>

      {/* â”€â”€ Toolbar â”€â”€ */}
      <div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",borderBottom:"1px solid #0d2240",background:"rgba(7,20,40,0.97)",flexShrink:0,flexWrap:"wrap"}}>
        {/* Formats */}
        <div style={{display:"flex",gap:4}}>
          {(["1:1","9:16","4:5"] as Format[]).map(f=>(
            <button key={f} onClick={()=>setFmt(f)}
              style={{padding:"5px 10px",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer",border:`1px solid ${fmt===f?ac+"66":"#0d2240"}`,background:fmt===f?`${ac}22`:"rgba(255,255,255,0.05)",color:fmt===f?ac:"rgba(255,255,255,0.4)"}}>
              {f}
            </button>
          ))}
        </div>
        {/* Themes */}
        <div style={{display:"flex",gap:5,marginLeft:4}}>
          {THEMES.map(t=>(
            <button key={t.c} onClick={()=>setTheme(t.c)} title={t.name}
              style={{width:22,height:22,borderRadius:"50%",cursor:"pointer",padding:0,
                background:t.c==="multi"?"linear-gradient(135deg,#2979FF,#00E5FF,#FFD740,#00C853,#FF5252)":t.c,
                border:theme===t.c?"2px solid white":"2px solid transparent",
                boxShadow:theme===t.c?`0 0 8px ${t.c==="multi"?"#2979FF":t.c}`:"none"}} />
          ))}
        </div>
        {/* Actions */}
        <div style={{display:"flex",gap:6,marginLeft:"auto"}}>
          <button onClick={exportPNG} style={{padding:"5px 12px",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer",background:`${ac}22`,color:ac,border:`1px solid ${ac}44`}}>PNG</button>
          <button onClick={recordVideo} disabled={recording} style={{padding:"5px 12px",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer",background:recording?"rgba(255,82,82,0.3)":"rgba(255,82,82,0.15)",color:"#FF5252",border:"1px solid rgba(255,82,82,0.3)"}}>
            {recording?"Grabando...":"Video"}
          </button>
          <button onClick={copyCopy} style={{padding:"5px 12px",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer",background:"rgba(0,229,255,0.12)",color:"#00E5FF",border:"1px solid rgba(0,229,255,0.3)"}}>Copy</button>
          <button onClick={()=>setModal(true)} style={{padding:"5px 12px",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer",background:"rgba(0,200,83,0.15)",color:"#00C853",border:"1px solid rgba(0,200,83,0.3)"}}>Guardar</button>
        </div>
      </div>

      {/* â”€â”€ Slide chips â”€â”€ */}
      <div style={{display:"flex",gap:6,padding:"8px 12px",overflowX:"auto",borderBottom:"1px solid #0d2240",flexShrink:0}}>
        {slides.map((s,i)=>(
          <button key={s.id} onClick={()=>setIdx(i)}
            style={{flexShrink:0,fontSize:11,padding:"5px 12px",borderRadius:20,fontWeight:600,cursor:"pointer",
              background:i===idx?`${ac}33`:"rgba(255,255,255,0.07)",
              color:i===idx?ac:"rgba(255,255,255,0.45)",
              border:`1px solid ${i===idx?ac+"88":"transparent"}`}}>
            {i+1}. {s.label}
          </button>
        ))}
      </div>

      {/* â”€â”€ Main: Preview | Edit â”€â”€ */}
      <div style={{display:"flex",flex:1,overflow:"hidden",minHeight:0}}>

        {/* Preview */}
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:16,overflowY:"auto",gap:12}}>
          <div style={{position:"relative",borderRadius:16,overflow:"hidden",width:pW,height:pH,border:`1px solid ${ac}44`,boxShadow:`0 0 40px ${ac}22`,flexShrink:0}}>
            <canvas ref={cvRef} style={{position:"absolute",inset:0,width:"100%",height:"100%"}} />
            {!recording&&(
              <div ref={prevRef} style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",justifyContent:"space-between",padding:18,background:"rgba(2,12,26,0.45)"}}>
                <span style={{fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:20,alignSelf:"flex-start",background:`${ac}33`,color:ac,border:`1px solid ${ac}66`}}>{cur.label}</span>
                <div>
                  <p style={{fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.1em",color:ac,marginBottom:6,margin:"0 0 6px"}}>{cur.subtitle}</p>
                  <h2 style={{fontSize:Math.max(14,pW/12),fontWeight:800,color:"white",lineHeight:1.25,margin:"0 0 8px"}}>{cur.title}</h2>
                  <p style={{fontSize:Math.max(10,pW/22),lineHeight:1.55,color:"rgba(255,255,255,0.75)",margin:0}}>{cur.body}</p>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:10,color:"rgba(255,255,255,0.3)"}}>{idx+1}/{slides.length}</span>
                  <div style={{display:"flex",gap:3}}>
                    {slides.map((_,i)=><div key={i} style={{height:5,borderRadius:3,background:i===idx?ac:"rgba(255,255,255,0.2)",width:i===idx?14:5,transition:"all .3s"}} />)}
                  </div>
                </div>
              </div>
            )}
            {recording&&(
              <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <div style={{background:"rgba(255,82,82,0.2)",border:"1px solid #FF5252",borderRadius:20,padding:"8px 16px",color:"#FF5252",fontSize:12,fontWeight:700}}>
                  REC â—
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Edit panel â€” siempre visible */}
        <div style={{width:300,flexShrink:0,borderLeft:"1px solid #0d2240",background:"rgba(7,20,40,0.85)",display:"flex",flexDirection:"column",overflowY:"auto"}}>
          <div style={{padding:"12px 14px",borderBottom:"1px solid #0d2240",background:"rgba(0,0,0,0.2)"}}>
            <p style={{fontSize:13,fontWeight:700,color:"white",margin:0}}>
              Slide {idx+1} <span style={{color:ac}}>â€” {cur.label}</span>
            </p>
            <p style={{fontSize:11,color:"rgba(255,255,255,0.35)",margin:"2px 0 0"}}>Edita el texto de esta diapositiva</p>
          </div>

          <div style={{padding:14,display:"flex",flexDirection:"column",gap:12,flex:1}}>
            {([
              {f:"title" as const, label:"Titulo", multi:false},
              {f:"subtitle" as const, label:"Subtitulo", multi:false},
              {f:"body" as const, label:"Cuerpo del texto", multi:true},
            ]).map(({f,label,multi})=>(
              <div key={f}>
                <label style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.45)",display:"block",marginBottom:5}}>{label}</label>
                {multi
                  ? <textarea value={cur[f] as string} onChange={e=>upd(f,e.target.value)} rows={5}
                      style={{width:"100%",borderRadius:10,padding:"9px 11px",fontSize:13,color:"white",background:"rgba(255,255,255,0.06)",border:`1px solid ${ac}33`,fontFamily:"Inter,sans-serif",resize:"vertical",outline:"none",boxSizing:"border-box"}}
                      onFocus={e=>(e.target.style.borderColor=ac+"99")} onBlur={e=>(e.target.style.borderColor=ac+"33")} />
                  : <input type="text" value={cur[f] as string} onChange={e=>upd(f,e.target.value)}
                      style={{width:"100%",borderRadius:10,padding:"9px 11px",fontSize:13,color:"white",background:"rgba(255,255,255,0.06)",border:`1px solid ${ac}33`,fontFamily:"Inter,sans-serif",outline:"none",boxSizing:"border-box"}}
                      onFocus={e=>(e.target.style.borderColor=ac+"99")} onBlur={e=>(e.target.style.borderColor=ac+"33")} />
                }
              </div>
            ))}

            <div>
              <label style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.45)",display:"block",marginBottom:6}}>Label SPIN</label>
              <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                {LABELS.map(l=>(
                  <button key={l} onClick={()=>upd("label",l)}
                    style={{fontSize:10,padding:"4px 8px",borderRadius:8,fontWeight:600,cursor:"pointer",
                      background:cur.label===l?`${ac}33`:"rgba(255,255,255,0.06)",
                      color:cur.label===l?ac:"rgba(255,255,255,0.4)",
                      border:`1px solid ${cur.label===l?ac+"55":"transparent"}`}}>
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
        <div style={{position:"fixed",inset:0,zIndex:50,display:"flex",alignItems:"center",justifyContent:"center",padding:16,background:"rgba(2,12,26,0.88)",backdropFilter:"blur(8px)"}}>
          <div style={{width:"100%",maxWidth:320,borderRadius:20,padding:24,background:"rgba(13,21,38,0.98)",border:"1px solid rgba(0,200,83,0.3)"}}>
            <p style={{fontSize:15,fontWeight:700,color:"white",marginBottom:12}}>Guardar diseno</p>
            <input type="text" placeholder="Nombre..." value={saveName} onChange={e=>setSaveName(e.target.value)}
              style={{width:"100%",borderRadius:10,padding:"10px 12px",fontSize:13,color:"white",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(0,200,83,0.3)",fontFamily:"Inter,sans-serif",outline:"none",boxSizing:"border-box",marginBottom:14}}
              onKeyDown={e=>e.key==="Enter"&&saveLib()} autoFocus />
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setModal(false)} style={{flex:1,padding:10,borderRadius:10,fontSize:13,fontWeight:600,cursor:"pointer",background:"rgba(255,255,255,0.07)",color:"rgba(255,255,255,0.6)",border:"none"}}>Cancelar</button>
              <button onClick={saveLib} style={{flex:1,padding:10,borderRadius:10,fontSize:13,fontWeight:600,cursor:"pointer",background:"rgba(0,200,83,0.2)",color:"#00C853",border:"1px solid rgba(0,200,83,0.3)"}}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {toast&&<div style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",padding:"10px 20px",borderRadius:30,fontSize:13,fontWeight:600,zIndex:50,background:"rgba(13,21,38,0.95)",border:`1px solid ${ac}55`,color:ac,backdropFilter:"blur(20px)",whiteSpace:"nowrap"}}>{toast}</div>}
    </div>
  )
}

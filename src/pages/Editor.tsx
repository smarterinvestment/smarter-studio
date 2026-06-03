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

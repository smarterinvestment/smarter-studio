import React, { useState, useEffect, useRef, useCallback } from "react"

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface Slide {
  id: number
  label: string
  title: string
  subtitle: string
  body: string
  imagePrompt?: string
  videoPrompt?: string
  voiceover?: string
  duration?: number
}
type Format = "1:1" | "9:16" | "4:5"
type Theme = "#2979FF" | "#00E5FF" | "#FFD740" | "#00C853" | "#FF5252" | "multi"
type RightPanel = "edit" | "storyboard"
interface Particle { x:number;y:number;vx:number;vy:number;r:number;op:number;pulse:number;ps:number }

// â”€â”€â”€ Constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const DIMS: Record<Format,[number,number]> = { "1:1":[1,1],"9:16":[9,16],"4:5":[4,5] }
const SPIN_LABELS = ["Situacion","Problema","Implicacion","Necesidad-Solucion","Rey Salomon Hook","CTA"]
const THEMES: {c:Theme;name:string}[] = [
  {c:"#2979FF",name:"Azul"},{c:"#00E5FF",name:"Cyan"},{c:"#FFD740",name:"Oro"},
  {c:"#00C853",name:"Verde"},{c:"#FF5252",name:"Rojo"},{c:"multi",name:"Multi"},
]
const PALETTE = ["#2979FF","#00E5FF","#FFD740","#00C853","#FF5252"]

const ANGULOS = [
  { id:"escasez",   label:"Escasez",    desc:"El miedo a no tener suficiente",      emoji:"âš¡" },
  { id:"urgencia",  label:"Urgencia",   desc:"El tiempo se acaba, actua ahora",     emoji:"â°" },
  { id:"esperanza", label:"Esperanza",  desc:"Un futuro mejor es posible",          emoji:"ðŸŒŸ" },
  { id:"miedo",     label:"Miedo",      desc:"Las consecuencias de no actuar",      emoji:"ðŸ˜°" },
  { id:"orgullo",   label:"Orgullo",    desc:"Se el ejemplo en tu familia",         emoji:"ðŸ‘‘" },
  { id:"identidad", label:"Identidad",  desc:"Soy quien administra bien",           emoji:"ðŸŽ¯" },
  { id:"conciencia",label:"Conciencia", desc:"El dinero es responsabilidad",        emoji:"ðŸ§ " },
  { id:"amor",      label:"Amor",       desc:"Administrar bien es un acto de amor", emoji:"â¤ï¸" },
]

const CONTENT_TYPES = [
  { id:"carousel", label:"Carrusel", emoji:"ðŸ“±", desc:"6 slides SPIN para Instagram/LinkedIn" },
  { id:"reel",     label:"Reel",     emoji:"ðŸŽ¬", desc:"Guion de video corto 30-60s vertical" },
  { id:"both",     label:"Ambos",    emoji:"âœ¨", desc:"Carrusel + Guion de Reel completo" },
]

const DEFAULT_SLIDES: Slide[] = [
  { id:1,label:"Situacion",title:"Sabias que el 80% pierde dinero?",subtitle:"La realidad que nadie te cuenta",body:"La mayoria trabaja toda su vida sin construir riqueza real.",imagePrompt:"Cinematic wide shot of a busy city street at golden hour, crowds of people walking, shallow depth of field, moody financial district atmosphere, dark tones",videoPrompt:"Time-lapse of busy city intersection, people rushing, money floating away in the wind, slow-motion close-up of empty wallet, dark cinematic grade",voiceover:"El 80% de las personas trabajan toda su vida... y aun asi no construyen riqueza. Hoy te cuento por que.",duration:8 },
  { id:2,label:"Problema",title:"El problema no es tu salario",subtitle:"Es lo que haces con el",body:"Sin estrategia, cada peso se escapa entre gastos invisibles y malos habitos.",imagePrompt:"Close-up of hands holding crumpled money, coins scattered on dark surface, dramatic lighting, financial stress concept, moody atmosphere",videoPrompt:"Money falling through fingers in slow motion, receipts and invoices flying around, person looking stressed at laptop screen, dark blue tones",voiceover:"El problema no es cuanto ganas. Es que sin un sistema, el dinero desaparece solo.",duration:8 },
  { id:3,label:"Implicacion",title:"10 anos mas tarde...",subtitle:"El costo del tiempo perdido",body:"Cada mes sin invertir es dinero que el interes compuesto nunca recuperara.",imagePrompt:"Split screen concept: left side young person with empty piggy bank, right side same person older looking stressed, financial timeline visualization",videoPrompt:"Calendar pages flying fast, clock ticking, compound interest graph declining, aging effect on face, dramatic red and blue color grade",voiceover:"Cada mes que pasa sin invertir... es una oportunidad que el interes compuesto nunca te devuelve.",duration:9 },
  { id:4,label:"Necesidad-Solucion",title:"La solucion es mas simple",subtitle:"Tres pasos que cambian todo",body:"1. Conoce tu flujo. 2. Elimina deudas toxicas. 3. Invierte automaticamente.",imagePrompt:"Clean minimal infographic style, three glowing steps with icons on dark background, gold and blue colors, modern financial planning visualization",videoPrompt:"Animated flowchart appearing step by step, checkmarks appearing, progress bars filling up, optimistic gold and green color palette, upbeat energy",voiceover:"Tres pasos. Solo tres. Conoce tu flujo de dinero, elimina deudas toxicas, e invierte automaticamente.",duration:10 },
  { id:5,label:"Rey Salomon Hook",title:"El que cuida su dinero, cuida su libertad",subtitle:"Proverbio milenario",body:"La prosperidad no es suerte, es disciplina convertida en habito diario.",imagePrompt:"Ancient wisdom meets modern finance: golden book with financial symbols, rays of light, wise atmosphere, deep blue and gold tones, cinematic",videoPrompt:"Slow zoom into ancient golden text transforming into modern financial charts, wisdom symbol overlaid with modern skyline, epic orchestral feel",voiceover:"El Rey Salomon lo sabia hace tres mil anos: la prosperidad no es suerte. Es disciplina hecha habito.",duration:9 },
  { id:6,label:"CTA",title:"Listo para cambiar tu historia?",subtitle:"El primer paso es hoy",body:"Sigue esta cuenta. Comenta LISTO y te envio mi guia gratuita.",imagePrompt:"Motivational: person standing on mountain top looking at bright horizon, sunrise, freedom concept, warm gold and orange tones, aspirational mood",videoPrompt:"Person walking confidently forward, sunrise in background, animated follow/like buttons appearing, clean call-to-action overlay, energetic upbeat ending",voiceover:"Si quieres cambiar tu historia financiera, el primer paso es hoy. Comenta LISTO y te envio mi guia gratuita.",duration:8 },
]

// â”€â”€â”€ Utils â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function rgba2(hex:string,a:number,i=0){
  const h=hex==="multi"?PALETTE[i%PALETTE.length]:hex
  const r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16)
  return `rgba(${r},${g},${b},${a})`
}

// â”€â”€â”€ Particle canvas â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function useCanvas(ref:React.RefObject<HTMLCanvasElement>,theme:Theme,slide:Slide,recording:boolean){
  const pts=useRef<Particle[]>([])
  const raf=useRef(0)
  const thR=useRef(theme); useEffect(()=>{thR.current=theme},[theme])
  const slR=useRef(slide); useEffect(()=>{slR.current=slide},[slide])
  const recR=useRef(recording); useEffect(()=>{recR.current=recording},[recording])
  const gc=useCallback((a:number,i:number)=>rgba2(thR.current,a,i),[])

  useEffect(()=>{
    const cv=ref.current; if(!cv) return
    const ctx=cv.getContext("2d"); if(!ctx) return
    const init=()=>{
      cv.width=cv.offsetWidth; cv.height=cv.offsetHeight
      pts.current=Array.from({length:80},()=>({
        x:Math.random()*(cv.width||400),y:Math.random()*(cv.height||600),
        vx:(Math.random()-.5)*.6,vy:(Math.random()-.5)*.6,
        r:Math.random()*2.5+1,op:Math.random()*.5+.3,
        pulse:Math.random()*Math.PI*2,ps:Math.random()*.02+.01,
      }))
    }
    init()
    const ro=new ResizeObserver(init); ro.observe(cv)
    const draw=()=>{
      const W=cv.width,H=cv.height
      ctx.clearRect(0,0,W,H)
      const bg=ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,Math.max(W,H)/1.5)
      bg.addColorStop(0,"rgba(7,20,40,1)"); bg.addColorStop(1,"rgba(2,12,26,1)")
      ctx.fillStyle=bg; ctx.fillRect(0,0,W,H)
      const p=pts.current
      for(let i=0;i<p.length;i++) for(let j=i+1;j<p.length;j++){
        const dx=p[i].x-p[j].x,dy=p[i].y-p[j].y,d=Math.sqrt(dx*dx+dy*dy)
        if(d<120){ctx.beginPath();ctx.moveTo(p[i].x,p[i].y);ctx.lineTo(p[j].x,p[j].y);ctx.strokeStyle=gc((1-d/120)*.25,i);ctx.lineWidth=.8;ctx.stroke()}
      }
      p.forEach((pt,i)=>{
        pt.pulse+=pt.ps
        const pf=.85+Math.sin(pt.pulse)*.15,r=pt.r*pf,a=pt.op*pf
        const g2=ctx.createRadialGradient(pt.x,pt.y,0,pt.x,pt.y,r*4)
        g2.addColorStop(0,gc(a,i)); g2.addColorStop(1,gc(0,i))
        ctx.beginPath();ctx.arc(pt.x,pt.y,r*4,0,Math.PI*2);ctx.fillStyle=g2;ctx.fill()
        ctx.beginPath();ctx.arc(pt.x,pt.y,r,0,Math.PI*2);ctx.fillStyle=gc(Math.min(a*1.5,1),i);ctx.fill()
        pt.x+=pt.vx;pt.y+=pt.vy
        if(pt.x<0||pt.x>W)pt.vx*=-1
        if(pt.y<0||pt.y>H)pt.vy*=-1
      })
      if(recR.current){
        const s=slR.current,ac=thR.current==="multi"?"#2979FF":thR.current
        ctx.fillStyle="rgba(2,12,26,0.55)";ctx.fillRect(0,0,W,H)
        ctx.fillStyle=ac+"44";ctx.beginPath()
        const lw=ctx.measureText(s.label).width+20
        if(ctx.roundRect)ctx.roundRect(14,14,lw,22,10);else ctx.rect(14,14,lw,22)
        ctx.fill()
        ctx.fillStyle=ac;ctx.font="bold 10px Inter,sans-serif";ctx.fillText(s.label,24,29)
        ctx.fillStyle=ac;ctx.font="bold 10px Inter,sans-serif";ctx.fillText(s.subtitle.toUpperCase().slice(0,40),14,H-90)
        ctx.fillStyle="white";ctx.font=`bold ${Math.max(14,Math.floor(W/13))}px Inter,sans-serif`
        const wds=s.title.split(" ");let ln="",ty=H-68
        for(const w of wds){const t=ln+w+" ";if(ctx.measureText(t).width>W-28&&ln){ctx.fillText(ln.trim(),14,ty);ln=w+" ";ty+=Math.floor(W/12)}else ln=t}
        ctx.fillText(ln.trim(),14,ty)
        ctx.fillStyle="rgba(255,255,255,0.7)";ctx.font=`${Math.max(10,Math.floor(W/24))}px Inter,sans-serif`
        const bw=s.body.split(" ");let bl="",by=ty+Math.floor(W/12)+6
        for(const w of bw){const t=bl+w+" ";if(ctx.measureText(t).width>W-28&&bl){ctx.fillText(bl.trim(),14,by);bl=w+" ";by+=Math.floor(W/22)}else bl=t}
        ctx.fillText(bl.trim(),14,by)
      }
      raf.current=requestAnimationFrame(draw)
    }
    draw()
    return()=>{cancelAnimationFrame(raf.current);ro.disconnect()}
  },[gc])
}

// â”€â”€â”€ Main component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function Editor(){
  const [slides,setSlides]=useState<Slide[]>(()=>{
    try{const d=localStorage.getItem("ss-load");if(d){localStorage.removeItem("ss-load");const p=JSON.parse(d);return p.slides||DEFAULT_SLIDES}}catch{}
    return DEFAULT_SLIDES
  })
  const [idx,setIdx]=useState(0)
  const [fmt,setFmt]=useState<Format>("4:5")
  const [theme,setTheme]=useState<Theme>("#2979FF")
  const [recording,setRecording]=useState(false)
  const [toast,setToast]=useState("")
  const [saveModal,setSaveModal]=useState(false)
  const [saveName,setSaveName]=useState("")
  const [rightPanel,setRightPanel]=useState<RightPanel>("edit")

  // Generator state
  const [topic,setTopic]=useState("")
  const [contentType,setContentType]=useState<string>("both")
  const [selectedAngulos,setSelectedAngulos]=useState<string[]>(["esperanza","identidad"])
  const [generating,setGenerating]=useState(false)
  const [genError,setGenError]=useState("")
  const [reelScript,setReelScript]=useState<string>("")

  const cvRef=useRef<HTMLCanvasElement>(null)
  const prevRef=useRef<HTMLDivElement>(null)
  const cur=slides[idx]
  const ac=theme==="multi"?"#2979FF":theme

  useCanvas(cvRef as React.RefObject<HTMLCanvasElement>,theme,cur,recording)

  const upd=(f:keyof Slide,v:string)=>setSlides(p=>p.map((s,i)=>i===idx?{...s,[f]:v}:s))
  const toast2=(m:string)=>{setToast(m);setTimeout(()=>setToast(""),3000)}

  const [fw,fh]=DIMS[fmt]
  const maxH=Math.min(460,window.innerHeight-200)
  let pH=maxH,pW=(pH*fw)/fh
  const maxW=360; if(pW>maxW){pW=maxW;pH=(pW*fh)/fw}

  // â”€â”€ Generate carousel + storyboard with Claude â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const generateCarousel=async()=>{
    if(!topic.trim()){setGenError("Escribe el tema o principio");return}
    if(selectedAngulos.length===0){setGenError("Selecciona al menos un angulo emocional");return}
    const key=localStorage.getItem("ss-claude-key")
    if(!key){setGenError("Configura tu Claude API Key en /chat primero");return}
    setGenerating(true);setGenError("");setReelScript("")
    const angDesc=selectedAngulos.map(id=>ANGULOS.find(a=>a.id===id)).filter(Boolean).map(a=>`${a!.label}: ${a!.desc}`).join("\n")

    const includeCarousel = contentType==="carousel"||contentType==="both"
    const includeReel = contentType==="reel"||contentType==="both"

    const prompt=`Eres el Rey Salomon, experto en contenido financiero viral para redes sociales.

TEMA: ${topic}
ANGULOS EMOCIONALES (usa estos para el tono, no los menciones literalmente):
${angDesc}

${includeCarousel?`
=== PARTE 1: CARRUSEL INSTAGRAM (6 slides SPIN) ===
Crea 6 slides con estructura SPIN. Responde el JSON del carrusel exactamente en este formato, sin markdown:
CAROUSEL_JSON_START
[
  {"label":"Situacion","title":"...","subtitle":"...","body":"...","imagePrompt":"...","videoPrompt":"...","voiceover":"...","duration":8},
  {"label":"Problema","title":"...","subtitle":"...","body":"...","imagePrompt":"...","videoPrompt":"...","voiceover":"...","duration":8},
  {"label":"Implicacion","title":"...","subtitle":"...","body":"...","imagePrompt":"...","videoPrompt":"...","voiceover":"...","duration":9},
  {"label":"Necesidad-Solucion","title":"...","subtitle":"...","body":"...","imagePrompt":"...","videoPrompt":"...","voiceover":"...","duration":10},
  {"label":"Rey Salomon Hook","title":"...","subtitle":"...","body":"...","imagePrompt":"...","videoPrompt":"...","voiceover":"...","duration":9},
  {"label":"CTA","title":"...","subtitle":"...","body":"...","imagePrompt":"...","videoPrompt":"...","voiceover":"...","duration":8}
]
CAROUSEL_JSON_END

Reglas para el JSON:
- title: maximo 8 palabras, impactante
- subtitle: maximo 6 palabras
- body: 2-3 oraciones concretas
- imagePrompt: descripcion detallada en ingles para Midjourney/Flux, incluye estilo visual, iluminacion, colores, composicion
- videoPrompt: descripcion de movimiento y escena para Higgsfield/Runway/Kling, incluye tipo de camara, movimiento, transicion
- voiceover: texto narrado natural para ese slide, maximo 2 oraciones
- duration: segundos sugeridos para ese slide (entre 6 y 12)
`:""}

${includeReel?`
=== PARTE 2: GUION DE REEL (30-60 segundos) ===
Crea un guion completo de Reel vertical (9:16) sobre el mismo tema.
Formato exacto â€” escribe entre las marcas:
REEL_SCRIPT_START
**DURACION TOTAL**: [X segundos]
**HOOK (0-3s)**: [texto que aparece en pantalla + accion visual]
**ESCENA 1 (3-8s)**: [descripcion visual para Higgsfield] | TEXTO EN PANTALLA: "[texto]" | VOZ: "[narracion]"
**ESCENA 2 (8-15s)**: [descripcion visual] | TEXTO EN PANTALLA: "[texto]" | VOZ: "[narracion]"
**ESCENA 3 (15-25s)**: [descripcion visual] | TEXTO EN PANTALLA: "[texto]" | VOZ: "[narracion]"
**ESCENA 4 (25-38s)**: [descripcion visual] | TEXTO EN PANTALLA: "[texto]" | VOZ: "[narracion]"
**CIERRE CTA (38-50s)**: [descripcion visual] | TEXTO EN PANTALLA: "[texto]" | VOZ: "[narracion]"
**PROMPT HIGGSFIELD**: [prompt completo en ingles para generar el video base con Higgsfield AI, detallado con estilo cinematografico, movimiento de camara, paleta de colores, atmosfera]
**PROMPT IMAGEN THUMBNAIL**: [prompt en ingles para Midjourney/Flux para la miniatura del reel]
**MUSICA SUGERIDA**: [tipo de musica y mood]
REEL_SCRIPT_END
`:""}

Responde con exactamente el contenido solicitado entre las marcas.`

    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json","x-api-key":key,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:4000,messages:[{role:"user",content:prompt}]}),
      })
      if(!res.ok){const e=await res.json().catch(()=>({}));throw new Error((e as {error?:{message?:string}})?.error?.message||`Error ${res.status}`)}
      const data=await res.json() as {content?:{text:string}[]}
      const text=data.content?.[0]?.text||""

      // Parse carousel
      if(includeCarousel){
        const carouselMatch=text.match(/CAROUSEL_JSON_START\s*([\s\S]*?)\s*CAROUSEL_JSON_END/)
        if(carouselMatch){
          const generated=JSON.parse(carouselMatch[1]) as Slide[]
          setSlides(generated.map((s,i)=>({id:i+1,...s})))
          setIdx(0)
        } else {
          // fallback: buscar JSON array
          const jsonMatch=text.match(/\[[\s\S]*?\](?=\s*(?:REEL|$))/)
          if(jsonMatch){
            const generated=JSON.parse(jsonMatch[0]) as Slide[]
            setSlides(generated.map((s,i)=>({id:i+1,...s})))
            setIdx(0)
          }
        }
      }

      // Parse reel script
      if(includeReel){
        const reelMatch=text.match(/REEL_SCRIPT_START\s*([\s\S]*?)\s*REEL_SCRIPT_END/)
        if(reelMatch){
          setReelScript(reelMatch[1].trim())
          setRightPanel("storyboard")
        }
      }

      toast2(includeReel&&includeCarousel?"Carrusel + Reel generados!":includeReel?"Guion de Reel generado!":"Carrusel generado!")
    }catch(e){
      setGenError(e instanceof Error?e.message:"Error generando contenido")
    }finally{setGenerating(false)}
  }

  const toggleAngulo=(id:string)=>{
    setSelectedAngulos(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id])
  }

  // â”€â”€ Export / Record / Copy â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const exportPNG=async()=>{
    if(!prevRef.current)return
    try{const h2c=(await import("html2canvas")).default
      const c=await h2c(prevRef.current,{backgroundColor:"#020c1a",scale:2,useCORS:true,logging:false})
      const a=document.createElement("a");a.download=`slide-${idx+1}.png`;a.href=c.toDataURL();a.click()
      toast2("PNG exportado")}catch{toast2("Error exportando")}
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
          const a=document.createElement("a");a.href=url;a.download=`slide-${idx+1}.webm`;a.click()
          URL.revokeObjectURL(url);setRecording(false);toast2("Video descargado")
        }
        rec.start();toast2("Grabando 4s...")
        setTimeout(()=>rec.stop(),4000)
      }catch{setRecording(false);toast2("Error grabando")}
    },200)
  }

  const copyCopy=()=>{
    const txt=slides.map(s=>`[${s.label}]\n${s.title}\n${s.subtitle}\n${s.body}`).join("\n\n---\n\n")
    navigator.clipboard.writeText(txt).then(()=>toast2("Copiado al portapapeles"))
  }

  const exportStoryboard=()=>{
    const lines:string[]=[]
    lines.push(`GUION VISUAL â€” ${topic||"Contenido"}`)
    lines.push(`Generado: ${new Date().toLocaleDateString("es")}`)
    lines.push(`Angulos: ${selectedAngulos.join(", ")}`)
    lines.push("=".repeat(60))
    lines.push("")
    slides.forEach((s,i)=>{
      lines.push(`SLIDE ${i+1}: ${s.label.toUpperCase()}`)
      lines.push(`TITULO: ${s.title}`)
      lines.push(`SUBTITULO: ${s.subtitle}`)
      lines.push(`CUERPO: ${s.body}`)
      if(s.voiceover) lines.push(`VOZ: ${s.voiceover}`)
      if(s.duration) lines.push(`DURACION: ${s.duration}s`)
      if(s.imagePrompt) lines.push(`\nPROMPT IMAGEN (Midjourney/Flux):\n${s.imagePrompt}`)
      if(s.videoPrompt) lines.push(`\nPROMPT VIDEO (Higgsfield/Runway/Kling):\n${s.videoPrompt}`)
      lines.push("-".repeat(40))
      lines.push("")
    })
    if(reelScript){
      lines.push("=".repeat(60))
      lines.push("GUION REEL")
      lines.push("=".repeat(60))
      lines.push("")
      lines.push(reelScript)
    }
    const blob=new Blob([lines.join("\n")],{type:"text/plain;charset=utf-8"})
    const url=URL.createObjectURL(blob)
    const a=document.createElement("a");a.href=url;a.download=`guion-${(topic||"contenido").replace(/\s+/g,"-").slice(0,30)}.txt`;a.click()
    URL.revokeObjectURL(url)
    toast2("Guion exportado")
  }

  const copySlidePrompts=(s:Slide)=>{
    const txt=[
      s.imagePrompt?`IMAGE PROMPT:\n${s.imagePrompt}`:"",
      s.videoPrompt?`\nVIDEO PROMPT (Higgsfield):\n${s.videoPrompt}`:"",
      s.voiceover?`\nVOICEOVER:\n${s.voiceover}`:"",
    ].filter(Boolean).join("")
    navigator.clipboard.writeText(txt).then(()=>toast2("Prompts copiados"))
  }

  const saveLib=()=>{
    const name=saveName.trim()||topic.trim()||`Diseno ${new Date().toLocaleDateString("es")}`
    const d={id:Date.now().toString(),name,theme,fmt,slideCount:slides.length,slides,reelScript,createdAt:new Date().toISOString()}
    try{
      const raw=localStorage.getItem("ss-library")
      const arr=raw?JSON.parse(raw):[]
      arr.unshift(d);localStorage.setItem("ss-library",JSON.stringify(arr))
      setSaveModal(false);setSaveName("");toast2("Guardado en Biblioteca")
    }catch{toast2("Error guardando")}
  }

  const F:React.CSSProperties={fontFamily:"Inter,sans-serif"}

  // â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return(
    <div style={{...F,display:"flex",flexDirection:"column",height:"calc(100vh - 52px)",background:"#020c1a",overflow:"hidden"}}>

      {/* Toolbar */}
      <div style={{display:"flex",alignItems:"center",gap:8,padding:"7px 12px",borderBottom:"1px solid #0d2240",background:"rgba(7,20,40,0.97)",flexShrink:0,flexWrap:"wrap"}}>
        <div style={{display:"flex",gap:4}}>
          {(["1:1","9:16","4:5"] as Format[]).map(f=>(
            <button key={f} onClick={()=>setFmt(f)} style={{padding:"4px 9px",borderRadius:7,fontSize:11,fontWeight:600,cursor:"pointer",border:`1px solid ${fmt===f?ac+"66":"#0d2240"}`,background:fmt===f?`${ac}22`:"rgba(255,255,255,0.05)",color:fmt===f?ac:"rgba(255,255,255,0.4)"}}>
              {f}
            </button>
          ))}
        </div>
        <div style={{display:"flex",gap:4}}>
          {THEMES.map(t=>(
            <button key={t.c} onClick={()=>setTheme(t.c)} title={t.name}
              style={{width:20,height:20,borderRadius:"50%",cursor:"pointer",padding:0,
                background:t.c==="multi"?"linear-gradient(135deg,#2979FF,#00E5FF,#FFD740,#00C853,#FF5252)":t.c,
                border:theme===t.c?"2px solid white":"2px solid transparent",
                boxShadow:theme===t.c?`0 0 7px ${t.c==="multi"?"#2979FF":t.c}`:"none"}}/>
          ))}
        </div>
        <div style={{display:"flex",gap:5,marginLeft:"auto"}}>
          <button onClick={exportPNG} style={{padding:"4px 10px",borderRadius:7,fontSize:11,fontWeight:600,cursor:"pointer",background:`${ac}22`,color:ac,border:`1px solid ${ac}44`}}>PNG</button>
          <button onClick={recordVideo} disabled={recording} style={{padding:"4px 10px",borderRadius:7,fontSize:11,fontWeight:600,cursor:"pointer",background:recording?"rgba(255,82,82,0.3)":"rgba(255,82,82,0.15)",color:"#FF5252",border:"1px solid rgba(255,82,82,0.3)"}}>
            {recording?"REC...":"Video"}
          </button>
          <button onClick={exportStoryboard} style={{padding:"4px 10px",borderRadius:7,fontSize:11,fontWeight:600,cursor:"pointer",background:"rgba(255,215,64,0.12)",color:"#FFD740",border:"1px solid rgba(255,215,64,0.3)"}}>Guion</button>
          <button onClick={copyCopy} style={{padding:"4px 10px",borderRadius:7,fontSize:11,fontWeight:600,cursor:"pointer",background:"rgba(0,229,255,0.12)",color:"#00E5FF",border:"1px solid rgba(0,229,255,0.3)"}}>Copy</button>
          <button onClick={()=>setSaveModal(true)} style={{padding:"4px 10px",borderRadius:7,fontSize:11,fontWeight:600,cursor:"pointer",background:"rgba(0,200,83,0.15)",color:"#00C853",border:"1px solid rgba(0,200,83,0.3)"}}>Guardar</button>
        </div>
      </div>

      {/* Slide chips */}
      <div style={{display:"flex",gap:5,padding:"6px 12px",overflowX:"auto",borderBottom:"1px solid #0d2240",flexShrink:0}}>
        {slides.map((s,i)=>(
          <button key={s.id} onClick={()=>setIdx(i)}
            style={{flexShrink:0,fontSize:11,padding:"4px 11px",borderRadius:20,fontWeight:600,cursor:"pointer",
              background:i===idx?`${ac}33`:"rgba(255,255,255,0.07)",
              color:i===idx?ac:"rgba(255,255,255,0.45)",
              border:`1px solid ${i===idx?ac+"88":"transparent"}`}}>
            {i+1}. {s.label}
          </button>
        ))}
      </div>

      {/* 3-column layout */}
      <div style={{display:"flex",flex:1,overflow:"hidden",minHeight:0}}>

        {/* LEFT: Generator panel */}
        <div style={{width:260,flexShrink:0,borderRight:"1px solid #0d2240",background:"rgba(4,14,30,0.95)",display:"flex",flexDirection:"column",overflowY:"auto"}}>
          <div style={{padding:"12px 14px"}}>
            <p style={{fontSize:11,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:"#2979FF",margin:"0 0 10px"}}>Generar con IA</p>

            {/* Content type */}
            <div style={{display:"flex",gap:4,marginBottom:10}}>
              {CONTENT_TYPES.map(ct=>(
                <button key={ct.id} onClick={()=>setContentType(ct.id)} title={ct.desc}
                  style={{flex:1,padding:"5px 4px",borderRadius:8,fontSize:10,fontWeight:700,cursor:"pointer",
                    background:contentType===ct.id?"rgba(41,121,255,0.2)":"rgba(255,255,255,0.04)",
                    color:contentType===ct.id?"#2979FF":"rgba(255,255,255,0.4)",
                    border:`1px solid ${contentType===ct.id?"rgba(41,121,255,0.5)":"rgba(255,255,255,0.07)"}`}}>
                  {ct.emoji}<br/>{ct.label}
                </button>
              ))}
            </div>

            {/* Topic input */}
            <label style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.45)",display:"block",marginBottom:5}}>Tema o principio</label>
            <textarea
              value={topic}
              onChange={e=>setTopic(e.target.value)}
              placeholder="Ej: La importancia de ahorrar el 10% de tu sueldo"
              rows={3}
              style={{width:"100%",borderRadius:10,padding:"8px 10px",fontSize:12,color:"white",background:"rgba(255,255,255,0.06)",border:"1px solid #0d2240",fontFamily:"Inter,sans-serif",resize:"none",outline:"none",boxSizing:"border-box"}}
              onFocus={e=>e.target.style.borderColor="#2979FF66"}
              onBlur={e=>e.target.style.borderColor="#0d2240"}
            />

            {/* Angulos emocionales */}
            <p style={{fontSize:11,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:"rgba(255,255,255,0.4)",margin:"12px 0 8px"}}>
              Angulos emocionales
              <span style={{fontSize:10,fontWeight:400,marginLeft:6,color:"rgba(255,255,255,0.25)"}}>{selectedAngulos.length} selec.</span>
            </p>
            <div style={{display:"flex",flexDirection:"column",gap:5}}>
              {ANGULOS.map(a=>{
                const sel=selectedAngulos.includes(a.id)
                return(
                  <button key={a.id} onClick={()=>toggleAngulo(a.id)}
                    style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",borderRadius:10,cursor:"pointer",textAlign:"left",
                      background:sel?"rgba(41,121,255,0.15)":"rgba(255,255,255,0.04)",
                      border:`1px solid ${sel?"rgba(41,121,255,0.4)":"rgba(255,255,255,0.06)"}`,
                      transition:"all .15s"}}>
                    <div style={{width:16,height:16,borderRadius:4,border:`2px solid ${sel?"#2979FF":"rgba(255,255,255,0.2)"}`,background:sel?"#2979FF":"transparent",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                      {sel&&<span style={{color:"white",fontSize:10,lineHeight:1}}>âœ“</span>}
                    </div>
                    <div>
                      <p style={{fontSize:12,fontWeight:600,color:sel?"white":"rgba(255,255,255,0.6)",margin:0}}>{a.emoji} {a.label}</p>
                      <p style={{fontSize:10,color:"rgba(255,255,255,0.3)",margin:0}}>{a.desc}</p>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Error */}
            {genError&&<p style={{fontSize:11,color:"#FF5252",marginTop:8,padding:"6px 8px",background:"rgba(255,82,82,0.1)",borderRadius:8,border:"1px solid rgba(255,82,82,0.2)"}}>{genError}</p>}

            {/* Generate button */}
            <button
              onClick={generateCarousel}
              disabled={generating}
              style={{width:"100%",marginTop:12,padding:"10px",borderRadius:12,fontSize:13,fontWeight:700,cursor:generating?"wait":"pointer",
                background:generating?"rgba(41,121,255,0.2)":"linear-gradient(135deg,#2979FF,#00E5FF)",
                color:"white",border:"none",opacity:generating?.7:1,transition:"all .2s"}}>
              {generating?"Generando...":"âœ¦ Generar Contenido"}
            </button>

            {/* Quick topics */}
            <p style={{fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:"rgba(255,255,255,0.25)",margin:"14px 0 7px"}}>Temas rapidos</p>
            {[
              "Ahorrar el 10% de tu sueldo",
              "Salir de deudas en 12 meses",
              "Fondo de emergencia",
              "Invertir desde cero",
              "El poder del interes compuesto",
              "Gastos hormiga que te roban",
            ].map(t=>(
              <button key={t} onClick={()=>setTopic(t)}
                style={{display:"block",width:"100%",textAlign:"left",fontSize:11,padding:"5px 8px",borderRadius:7,marginBottom:4,cursor:"pointer",background:"transparent",color:"rgba(255,255,255,0.4)",border:"none",fontFamily:"Inter,sans-serif"}}
                onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color="#00E5FF";(e.currentTarget as HTMLElement).style.background="rgba(0,229,255,0.07)"}}
                onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color="rgba(255,255,255,0.4)";(e.currentTarget as HTMLElement).style.background="transparent"}}>
                â€º {t}
              </button>
            ))}
          </div>
        </div>

        {/* CENTER: Canvas preview */}
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:12,overflowY:"auto",gap:10}}>
          <div style={{position:"relative",borderRadius:16,overflow:"hidden",width:pW,height:pH,border:`1px solid ${ac}44`,boxShadow:`0 0 40px ${ac}22`,flexShrink:0}}>
            <canvas ref={cvRef} style={{position:"absolute",inset:0,width:"100%",height:"100%"}}/>
            {!recording&&(
              <div ref={prevRef} style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",justifyContent:"space-between",padding:16,background:"rgba(2,12,26,0.45)"}}>
                <span style={{fontSize:9,fontWeight:700,padding:"2px 9px",borderRadius:20,alignSelf:"flex-start",background:`${ac}33`,color:ac,border:`1px solid ${ac}66`}}>{cur.label}</span>
                <div>
                  <p style={{fontSize:9,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.1em",color:ac,margin:"0 0 5px"}}>{cur.subtitle}</p>
                  <h2 style={{fontSize:Math.max(13,pW/13),fontWeight:800,color:"white",lineHeight:1.25,margin:"0 0 7px"}}>{cur.title}</h2>
                  <p style={{fontSize:Math.max(9,pW/23),lineHeight:1.55,color:"rgba(255,255,255,0.75)",margin:0}}>{cur.body}</p>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:9,color:"rgba(255,255,255,0.3)"}}>{idx+1}/{slides.length}</span>
                  <div style={{display:"flex",gap:3}}>
                    {slides.map((_,i)=><div key={i} style={{height:4,borderRadius:2,background:i===idx?ac:"rgba(255,255,255,0.2)",width:i===idx?12:4,transition:"all .3s"}}/>)}
                  </div>
                </div>
              </div>
            )}
            {recording&&(
              <div style={{position:"absolute",inset:0,display:"flex",alignItems:"flex-start",justifyContent:"flex-end",padding:10}}>
                <div style={{background:"rgba(255,82,82,0.25)",border:"1px solid #FF5252",borderRadius:20,padding:"4px 12px",color:"#FF5252",fontSize:11,fontWeight:700}}>â— REC</div>
              </div>
            )}
          </div>
          {/* Voiceover preview under canvas */}
          {cur.voiceover&&(
            <div style={{width:pW,padding:"8px 12px",borderRadius:10,background:"rgba(41,121,255,0.08)",border:"1px solid rgba(41,121,255,0.2)"}}>
              <p style={{fontSize:9,fontWeight:700,color:"#2979FF",margin:"0 0 3px",textTransform:"uppercase",letterSpacing:"0.08em"}}>VOZ SLIDE {idx+1}</p>
              <p style={{fontSize:11,color:"rgba(255,255,255,0.65)",margin:0,lineHeight:1.5}}>{cur.voiceover}</p>
            </div>
          )}
        </div>

        {/* RIGHT: Edit / Storyboard panel */}
        <div style={{width:280,flexShrink:0,borderLeft:"1px solid #0d2240",background:"rgba(7,20,40,0.85)",display:"flex",flexDirection:"column",overflowY:"auto"}}>

          {/* Panel tabs */}
          <div style={{display:"flex",borderBottom:"1px solid #0d2240",flexShrink:0}}>
            {([{id:"edit" as const,label:"Editar"},{id:"storyboard" as const,label:"Guion Visual"}]).map(tab=>(
              <button key={tab.id} onClick={()=>setRightPanel(tab.id)}
                style={{flex:1,padding:"9px 8px",fontSize:11,fontWeight:700,cursor:"pointer",border:"none",
                  background:rightPanel===tab.id?"rgba(41,121,255,0.1)":"transparent",
                  color:rightPanel===tab.id?ac:"rgba(255,255,255,0.35)",
                  borderBottom:rightPanel===tab.id?`2px solid ${ac}`:"2px solid transparent"}}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* EDIT tab */}
          {rightPanel==="edit"&&(
            <div style={{padding:12,display:"flex",flexDirection:"column",gap:11,flex:1}}>
              <div style={{padding:"8px 10px",borderRadius:8,background:"rgba(0,0,0,0.15)",marginBottom:2}}>
                <p style={{fontSize:12,fontWeight:700,color:"white",margin:0}}>Slide {idx+1} <span style={{color:ac}}>â€” {cur.label}</span></p>
              </div>
              {([
                {f:"title" as const,label:"Titulo",multi:false},
                {f:"subtitle" as const,label:"Subtitulo",multi:false},
                {f:"body" as const,label:"Cuerpo",multi:true},
              ]).map(({f,label,multi})=>(
                <div key={f}>
                  <label style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,0.45)",display:"block",marginBottom:4}}>{label}</label>
                  {multi
                    ?<textarea value={cur[f] as string} onChange={e=>upd(f,e.target.value)} rows={4}
                        style={{width:"100%",borderRadius:9,padding:"8px 10px",fontSize:12,color:"white",background:"rgba(255,255,255,0.06)",border:`1px solid ${ac}33`,fontFamily:"Inter,sans-serif",resize:"vertical",outline:"none",boxSizing:"border-box"}}
                        onFocus={e=>e.target.style.borderColor=ac+"99"} onBlur={e=>e.target.style.borderColor=ac+"33"}/>
                    :<input type="text" value={cur[f] as string} onChange={e=>upd(f,e.target.value)}
                        style={{width:"100%",borderRadius:9,padding:"8px 10px",fontSize:12,color:"white",background:"rgba(255,255,255,0.06)",border:`1px solid ${ac}33`,fontFamily:"Inter,sans-serif",outline:"none",boxSizing:"border-box"}}
                        onFocus={e=>e.target.style.borderColor=ac+"99"} onBlur={e=>e.target.style.borderColor=ac+"33"}/>
                  }
                </div>
              ))}
              <div>
                <label style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,0.45)",display:"block",marginBottom:5}}>Label SPIN</label>
                <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                  {SPIN_LABELS.map(l=>(
                    <button key={l} onClick={()=>upd("label",l)}
                      style={{fontSize:10,padding:"3px 7px",borderRadius:7,fontWeight:600,cursor:"pointer",
                        background:cur.label===l?`${ac}33`:"rgba(255,255,255,0.06)",
                        color:cur.label===l?ac:"rgba(255,255,255,0.4)",
                        border:`1px solid ${cur.label===l?ac+"55":"transparent"}`}}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              {/* Copy prompts button */}
              {(cur.imagePrompt||cur.videoPrompt)&&(
                <button onClick={()=>copySlidePrompts(cur)}
                  style={{padding:"7px 10px",borderRadius:9,fontSize:11,fontWeight:600,cursor:"pointer",background:"rgba(255,215,64,0.1)",color:"#FFD740",border:"1px solid rgba(255,215,64,0.25)",marginTop:4}}>
                  Copiar prompts de este slide
                </button>
              )}
            </div>
          )}

          {/* STORYBOARD tab */}
          {rightPanel==="storyboard"&&(
            <div style={{padding:12,display:"flex",flexDirection:"column",gap:10,flex:1,overflowY:"auto"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                <p style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.5)",margin:0,textTransform:"uppercase",letterSpacing:"0.1em"}}>Guion Visual</p>
                <button onClick={exportStoryboard} style={{fontSize:10,padding:"3px 9px",borderRadius:7,fontWeight:600,cursor:"pointer",background:"rgba(255,215,64,0.12)",color:"#FFD740",border:"1px solid rgba(255,215,64,0.3)"}}>
                  Exportar .txt
                </button>
              </div>

              {/* Per-slide storyboard */}
              {slides.map((s,i)=>(
                <div key={s.id} onClick={()=>setIdx(i)}
                  style={{padding:"10px 11px",borderRadius:11,background:i===idx?"rgba(41,121,255,0.1)":"rgba(255,255,255,0.03)",border:`1px solid ${i===idx?"rgba(41,121,255,0.35)":"rgba(255,255,255,0.06)"}`,cursor:"pointer"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                    <span style={{fontSize:10,fontWeight:700,color:i===idx?ac:"rgba(255,255,255,0.5)"}}>{i+1}. {s.label}</span>
                    {s.duration&&<span style={{fontSize:9,color:"rgba(255,255,255,0.3)"}}>{s.duration}s</span>}
                  </div>
                  {s.voiceover&&(
                    <div style={{marginBottom:5}}>
                      <p style={{fontSize:9,fontWeight:700,color:"#00E5FF",margin:"0 0 2px",textTransform:"uppercase"}}>VOZ</p>
                      <p style={{fontSize:10,color:"rgba(255,255,255,0.6)",margin:0,lineHeight:1.45}}>{s.voiceover}</p>
                    </div>
                  )}
                  {s.imagePrompt&&(
                    <div style={{marginBottom:5}}>
                      <p style={{fontSize:9,fontWeight:700,color:"#FFD740",margin:"0 0 2px",textTransform:"uppercase"}}>IMAGEN</p>
                      <p style={{fontSize:9,color:"rgba(255,255,255,0.45)",margin:0,lineHeight:1.4}}>{s.imagePrompt.slice(0,90)}...</p>
                    </div>
                  )}
                  {s.videoPrompt&&(
                    <div>
                      <p style={{fontSize:9,fontWeight:700,color:"#FF5252",margin:"0 0 2px",textTransform:"uppercase"}}>VIDEO (Higgsfield)</p>
                      <p style={{fontSize:9,color:"rgba(255,255,255,0.45)",margin:0,lineHeight:1.4}}>{s.videoPrompt.slice(0,90)}...</p>
                    </div>
                  )}
                  <button onClick={e=>{e.stopPropagation();copySlidePrompts(s)}}
                    style={{marginTop:6,fontSize:9,padding:"2px 7px",borderRadius:6,fontWeight:600,cursor:"pointer",background:"rgba(255,255,255,0.06)",color:"rgba(255,255,255,0.4)",border:"none"}}>
                    Copiar prompts
                  </button>
                </div>
              ))}

              {/* Reel script */}
              {reelScript&&(
                <div style={{marginTop:8,padding:"10px 11px",borderRadius:11,background:"rgba(255,82,82,0.06)",border:"1px solid rgba(255,82,82,0.2)"}}>
                  <p style={{fontSize:10,fontWeight:700,color:"#FF5252",margin:"0 0 7px",textTransform:"uppercase",letterSpacing:"0.1em"}}>Guion Reel</p>
                  <pre style={{fontSize:9,color:"rgba(255,255,255,0.55)",margin:0,whiteSpace:"pre-wrap",lineHeight:1.55,fontFamily:"Inter,sans-serif"}}>
                    {reelScript}
                  </pre>
                  <button onClick={()=>{navigator.clipboard.writeText(reelScript).then(()=>toast2("Guion copiado"))}}
                    style={{marginTop:8,width:"100%",fontSize:10,padding:"5px",borderRadius:7,fontWeight:600,cursor:"pointer",background:"rgba(255,82,82,0.12)",color:"#FF5252",border:"1px solid rgba(255,82,82,0.25)"}}>
                    Copiar guion completo
                  </button>
                </div>
              )}

              {!reelScript&&slides.every(s=>!s.imagePrompt)&&(
                <div style={{padding:"20px 16px",textAlign:"center"}}>
                  <p style={{fontSize:30,margin:"0 0 8px"}}>ðŸŽ¬</p>
                  <p style={{fontSize:12,color:"rgba(255,255,255,0.4)",margin:0}}>Genera contenido con IA para ver el guion visual aqui</p>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Save modal */}
      {saveModal&&(
        <div style={{position:"fixed",inset:0,zIndex:50,display:"flex",alignItems:"center",justifyContent:"center",padding:16,background:"rgba(2,12,26,0.88)",backdropFilter:"blur(8px)"}}>
          <div style={{width:"100%",maxWidth:300,borderRadius:18,padding:22,background:"rgba(13,21,38,0.98)",border:"1px solid rgba(0,200,83,0.3)"}}>
            <p style={{fontSize:14,fontWeight:700,color:"white",marginBottom:10}}>Guardar diseno</p>
            <input type="text" placeholder={topic||"Nombre..."} value={saveName} onChange={e=>setSaveName(e.target.value)}
              style={{width:"100%",borderRadius:9,padding:"9px 11px",fontSize:12,color:"white",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(0,200,83,0.3)",fontFamily:"Inter,sans-serif",outline:"none",boxSizing:"border-box",marginBottom:12}}
              onKeyDown={e=>e.key==="Enter"&&saveLib()} autoFocus/>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setSaveModal(false)} style={{flex:1,padding:9,borderRadius:9,fontSize:12,fontWeight:600,cursor:"pointer",background:"rgba(255,255,255,0.07)",color:"rgba(255,255,255,0.6)",border:"none"}}>Cancelar</button>
              <button onClick={saveLib} style={{flex:1,padding:9,borderRadius:9,fontSize:12,fontWeight:600,cursor:"pointer",background:"rgba(0,200,83,0.2)",color:"#00C853",border:"1px solid rgba(0,200,83,0.3)"}}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {toast&&<div style={{position:"fixed",bottom:20,left:"50%",transform:"translateX(-50%)",padding:"9px 18px",borderRadius:30,fontSize:12,fontWeight:600,zIndex:50,background:"rgba(13,21,38,0.95)",border:`1px solid ${ac}55`,color:ac,backdropFilter:"blur(20px)",whiteSpace:"nowrap"}}>{toast}</div>}
    </div>
  )
}

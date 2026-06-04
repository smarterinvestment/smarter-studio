import React, { useState, useEffect, useRef, useCallback } from "react"

interface Slide {
  id: number; label: string; title: string; subtitle: string; body: string
  imagePrompt?: string; videoPrompt?: string; voiceover?: string; duration?: number
}
type Format = "1:1" | "9:16" | "4:5"
type Theme = "#2979FF" | "#00E5FF" | "#FFD740" | "#00C853" | "#FF5252" | "multi"
type RightPanel = "edit" | "storyboard"
interface Particle { x:number;y:number;vx:number;vy:number;r:number;op:number;pulse:number;ps:number }

const DIMS: Record<Format,[number,number]> = { "1:1":[1,1],"9:16":[9,16],"4:5":[4,5] }
const SPIN_LABELS = ["Principio Biblico","Realidad Financiera","El Problema Oculto","El Costo del Tiempo","La Herramienta","CTA - Accion Hoy"]
const THEMES: {c:Theme;name:string}[] = [
  {c:"#2979FF",name:"Azul"},{c:"#00E5FF",name:"Cyan"},{c:"#FFD740",name:"Oro"},
  {c:"#00C853",name:"Verde"},{c:"#FF5252",name:"Rojo"},{c:"multi",name:"Multi"},
]
const PALETTE = ["#2979FF","#00E5FF","#FFD740","#00C853","#FF5252"]

const ANGULOS = [
  { id:"escasez",    label:"Escasez",    desc:"El miedo a no tener suficiente",       color:"#FF5252" },
  { id:"urgencia",   label:"Urgencia",   desc:"El tiempo se acaba, actua ahora",      color:"#FFD740" },
  { id:"esperanza",  label:"Esperanza",  desc:"Un futuro mejor es posible",           color:"#00C853" },
  { id:"miedo",      label:"Miedo",      desc:"Las consecuencias de no actuar",       color:"#FF5252" },
  { id:"orgullo",    label:"Orgullo",    desc:"Se el ejemplo en tu familia",          color:"#FFD740" },
  { id:"identidad",  label:"Identidad",  desc:"Soy quien administra bien su dinero",  color:"#2979FF" },
  { id:"conciencia", label:"Conciencia", desc:"El dinero es una responsabilidad",     color:"#00E5FF" },
  { id:"amor",       label:"Amor",       desc:"Administrar bien es un acto de amor",  color:"#FF5252" },
]

const CONTENT_TYPES = [
  { id:"carousel", label:"Carrusel", desc:"6 slides SPIN Instagram/LinkedIn" },
  { id:"reel",     label:"Reel",     desc:"Guion de video corto 30-60s" },
  { id:"both",     label:"Ambos",    desc:"Carrusel + Guion de Reel" },
]

const QUICK_TOPICS = [
  { group: "Principios Rey Salomon", topics: [
    "Honra a Dios con tus primicias y tus graneros se llenaran",
    "El necio gasta todo lo que gana, el sabio guarda para el futuro",
    "Quien da al pobre le presta a Dios y sera recompensado",
    "El que trabaja la tierra tendra abundancia, el que persigue fantasias carece de juicio",
    "Los planes del diligente llevan a la abundancia, los apresurados llevan a la pobreza",
    "El rico gobierna al pobre, el que pide prestado es esclavo del que presta",
  ]},
  { group: "Finanzas Personales", topics: [
    "Ahorrar el 10% de tu sueldo todos los meses",
    "Salir de deudas en 12 meses con el metodo bola de nieve",
    "Construir tu fondo de emergencia desde cero",
    "Invertir desde cero sin saber nada de bolsa",
    "El poder del interes compuesto a largo plazo",
    "Los gastos hormiga que te roban sin que te des cuenta",
  ]},
]

const DEFAULT_SLIDES: Slide[] = [
  { id:1,label:"El Espejo Biblico",title:"Honra a Dios con tus primicias",subtitle:"Proverbios 3:9-10",body:"El primer fruto de todo lo que ganas. No lo que sobra. Lo primero. Esa es la diferencia entre el que prospera y el que siempre le falta. Cuanto tiempo llevas dando las sobras?" },
  { id:2,label:"La Verdad que Duele",title:"7 de cada 10 familias no tienen ahorros",subtitle:"Y trabajan mas de 40 horas a la semana",body:"No es pereza. Trabajan duro. El problema es que nadie les enseno que hacer con lo que ganan. El dinero llega y se va sin dejar rastro." },
  { id:3,label:"El Sistema",title:"Te ensenaron a trabajar, no a prosperar",subtitle:"12 anos de escuela, cero de finanzas",body:"El sistema te preparo para producir dinero para otros. No para construirte a ti. Eso no es tu culpa. Pero seguir igual despues de saberlo, si lo es." },
  { id:4,label:"El Precio del Tiempo",title:"Cada mes que pasa vale miles de pesos",subtitle:"El interes compuesto no perdona",body:"Quien empieza a ahorrar 2000 pesos al mes a los 25 acumula mas del doble que quien empieza a los 35. La diferencia no es el dinero. Es el tiempo que ya paso." },
  { id:5,label:"El Cambio",title:"No tienes que hacer esto solo",subtitle:"El primer paso es tener un plan",body:"Cuando alguien toma control de su dinero, algo cambia por dentro. No es solo la cuenta bancaria. Smarter Investment existe para acompanarte en ese camino, sin tecnicismos." },
  { id:6,label:"La Invitacion",title:"Y si hoy es el dia que todo cambia?",subtitle:"Una decision puede reescribir tu historia",body:"No te estoy vendiendo nada. Solo te pregunto: si alguien que ya estuvo donde tu estas te dijera que hay una forma distinta, le darias una oportunidad?" },
]

function rgba2(hex:string,a:number,i=0){
  const h=hex==="multi"?PALETTE[i%PALETTE.length]:hex
  const r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16)
  return `rgba(${r},${g},${b},${a})`
}

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
    init(); const ro=new ResizeObserver(init); ro.observe(cv)
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
        if(pt.x<0||pt.x>W)pt.vx*=-1; if(pt.y<0||pt.y>H)pt.vy*=-1
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
  const [topic,setTopic]=useState(QUICK_TOPICS[0].topics[0])
  const [contentType,setContentType]=useState<string>("both")
  const [selectedAngulos,setSelectedAngulos]=useState<string[]>(["esperanza","identidad","orgullo"])
  const [generating,setGenerating]=useState(false)
  const [genError,setGenError]=useState("")
  const [reelScript,setReelScript]=useState<string>("")
  const [activeGroup,setActiveGroup]=useState(0)
  const [apiKey,setApiKey]=useState(()=>localStorage.getItem("ss-claude-key")||"")
  const [showKey,setShowKey]=useState(false)

  const cvRef=useRef<HTMLCanvasElement>(null)
  const prevRef=useRef<HTMLDivElement>(null)
  const cur=slides[idx]
  const ac=theme==="multi"?"#FFD740":themesetTimeout(()=>setToast(""),3000)}

  const [fw,fh]=DIMS[fmt]
  const maxH=Math.min(460,window.innerHeight-200)
  let pH=maxH,pW=(pH*fw)/fh
  const maxW=360; if(pW>maxW){pW=maxW;pH=(pW*fh)/fw}

  const generateCarousel=async()=>{
    if(!topic.trim()){setGenError("Escribe el tema o principio");return}
    if(selectedAngulos.length===0){setGenError("Selecciona al menos un angulo emocional");return}
    const key=apiKey.trim()
    if(!key){setGenError("Ingresa tu Claude API Key arriba");return}
    localStorage.setItem("ss-claude-key",key)
    setGenerating(true);setGenError("");setReelScript("")
    const angDesc=selectedAngulos.map(id=>ANGULOS.find(a=>a.id===id)).filter(Boolean).map(a=>`${a!.label}: ${a!.desc}`).join("\n")
    const includeCarousel=contentType==="carousel"||contentType==="both"
    const includeReel=contentType==="reel"||contentType==="both"

    const prompt=`Eres el Rey Salomon â€” sabio financiero, consejero biblico y estratega de contenido viral para redes sociales.

Tu mision: crear contenido que DESPIERTE conciencia financiera, genere CURIOSIDAD, mueva EMOCIONES profundas y dirija al lector a tomar accion con la herramienta Smarter Investment.

PRINCIPIO O TEMA BASE: ${topic}
ANGULOS EMOCIONALES para guiar el tono (no mencionar literalmente):
${angDesc}

ESTRUCTURA DE 6 SLIDES â€” sigue este orden exacto:
1. PRINCIPIO BIBLICO: Abre con el versiculo o principio de Salomon relacionado al tema. Genera asombro y autoridad espiritual. Que el lector sienta que hay sabiduria antigua detras de cada consejo.
2. REALIDAD FINANCIERA: Estadistica o verdad impactante que genera conciencia. El lector debe pensar "eso me esta pasando a mi". Usa numeros reales, porcentajes, datos que sorprendan.
3. EL PROBLEMA OCULTO: Nombra el problema que nadie quiere ver. El sistema, la educacion, los habitos. Genera tension y reconocimiento. El lector dice "ahora entiendo por que".
4. EL COSTO DEL TIEMPO: Muestra lo que pierde cada mes que no actua. Usa el interes compuesto, ejemplos concretos con dinero real. Genera urgencia sin miedo, con claridad matematica.
5. LA HERRAMIENTA â€” SMARTER INVESTMENT: Presenta la solucion. Smarter Investment es un consultor financiero inteligente que analiza tu situacion, te da un plan personalizado y te acompana a construir riqueza paso a paso. Sencillo, poderoso, accesible.
6. CTA ACCION HOY: Llamada a la accion directa hacia Smarter Investment. Urgente, clara, con beneficio inmediato. Comenta, entra, descarga, actua. El primer paso es gratis.

${includeCarousel?`=== PARTE 1: CARRUSEL INSTAGRAM 6 SLIDES ===
Responde el JSON exactamente entre estas marcas, sin markdown:
CAROUSEL_JSON_START
[
  {"label":"Principio Biblico","title":"...","subtitle":"libro capitulo:versiculo","body":"...","voiceover":"...","imagePrompt":"...","videoPrompt":"...","duration":9},
  {"label":"Realidad Financiera","title":"...","subtitle":"dato impactante","body":"...","voiceover":"...","imagePrompt":"...","videoPrompt":"...","duration":8},
  {"label":"El Problema Oculto","title":"...","subtitle":"la raiz del problema","body":"...","voiceover":"...","imagePrompt":"...","videoPrompt":"...","duration":9},
  {"label":"El Costo del Tiempo","title":"...","subtitle":"matematica que duele","body":"...","voiceover":"...","imagePrompt":"...","videoPrompt":"...","duration":10},
  {"label":"La Herramienta","title":"...","subtitle":"Smarter Investment","body":"...","voiceover":"...","imagePrompt":"...","videoPrompt":"...","duration":10},
  {"label":"CTA - Accion Hoy","title":"...","subtitle":"el momento es ahora","body":"...","voiceover":"...","imagePrompt":"...","videoPrompt":"...","duration":8}
]
CAROUSEL_JSON_END
Reglas: title maximo 8 palabras con gancho fuerte, subtitle referencia biblica o dato concreto, body 2-3 oraciones poderosas y concretas, voiceover narracion natural 1-2 oraciones, imagePrompt descripcion visual en ingles para Midjourney estilo cinematografico oscuro con dorado, videoPrompt escena en movimiento para Higgsfield con camara cinematografica.`:""}

${includeReel?`=== PARTE 2: GUION REEL VERTICAL 9:16 (45-60 segundos) ===
REEL_SCRIPT_START
DURACION TOTAL: [X segundos]
HOOK (0-4s): [frase de apertura impactante en pantalla] | VISUAL: [escena de apertura] | VOZ: [narracion del hook]
PRINCIPIO (4-12s): [versiculo o sabiduria en pantalla] | VISUAL: [escena] | VOZ: [narracion]
PROBLEMA (12-22s): [realidad financiera en pantalla] | VISUAL: [escena] | VOZ: [narracion]
URGENCIA (22-35s): [costo del tiempo en pantalla] | VISUAL: [escena con numeros] | VOZ: [narracion]
SOLUCION (35-48s): [Smarter Investment como respuesta] | VISUAL: [escena de app/herramienta] | VOZ: [narracion]
CTA (48-58s): [llamada a accion clara] | VISUAL: [escena motivacional] | VOZ: [cierre poderoso]
PROMPT HIGGSFIELD: [prompt completo en ingles para video cinematografico, dark financial theme, gold accents, dramatic lighting, camera movements]
MUSICA: [tipo de musica y mood]
REEL_SCRIPT_END`:""}

Responde SOLO con el contenido entre las marcas indicadas. SÃ© poderoso, biblico, concreto y viral.`

    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json","x-api-key":key,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:4000,messages:[{role:"user",content:prompt}]}),
      })
      if(!res.ok){const e=await res.json().catch(()=>({}));throw new Error((e as {error?:{message?:string}})?.error?.message||`Error ${res.status}`)}
      const data=await res.json() as {content?:{text:string}[]}
      const text=data.content?.[0]?.text||""
      if(includeCarousel){
        const m=text.match(/CAROUSEL_JSON_START\s*([\s\S]*?)\s*CAROUSEL_JSON_END/)
        if(m){setSlides(JSON.parse(m[1]).map((s:Slide,i:number)=>({id:i+1,...s})));setIdx(0)}
      }
      if(includeReel){
        const m=text.match(/REEL_SCRIPT_START\s*([\s\S]*?)\s*REEL_SCRIPT_END/)
        if(m){setReelScript(m[1].trim());setRightPanel("storyboard")}
      }
      toast2(includeReel&&includeCarousel?"Carrusel + Reel generados!":includeReel?"Reel generado!":"Carrusel generado!")
    }catch(e){
      setGenError(e instanceof Error?e.message:"Error generando contenido")
    }finally{setGenerating(false)}
  }

  const toggleAngulo=(id:string)=>setSelectedAngulos(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id])

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
    navigator.clipboard.writeText(txt).then(()=>toast2("Copiado!"))
  }

  const copySlidePrompts=(s:Slide)=>{
    const txt=[s.imagePrompt?`IMAGE:\n${s.imagePrompt}`:"",s.videoPrompt?`\nVIDEO (Higgsfield):\n${s.videoPrompt}`:"",s.voiceover?`\nVOZ:\n${s.voiceover}`:""].filter(Boolean).join("")
    navigator.clipboard.writeText(txt).then(()=>toast2("Prompts copiados"))
  }

  const exportStoryboard=()=>{
    const lines:string[]=[]
    lines.push(`GUION VISUAL - ${topic||"Contenido"}`)
    lines.push(`Fecha: ${new Date().toLocaleDateString("es")}`)
    lines.push(`Angulos: ${selectedAngulos.join(", ")}`)
    lines.push("=".repeat(60))
    slides.forEach((s,i)=>{
      lines.push(`\nSLIDE ${i+1}: ${s.label.toUpperCase()}`)
      lines.push(`TITULO: ${s.title}`)
      lines.push(`SUBTITULO: ${s.subtitle}`)
      lines.push(`CUERPO: ${s.body}`)
      if(s.voiceover)lines.push(`VOZ: ${s.voiceover}`)
      if(s.duration)lines.push(`DURACION: ${s.duration}s`)
      if(s.imagePrompt)lines.push(`\nPROMPT IMAGEN:\n${s.imagePrompt}`)
      if(s.videoPrompt)lines.push(`\nPROMPT VIDEO (Higgsfield):\n${s.videoPrompt}`)
      lines.push("-".repeat(40))
    })
    if(reelScript){lines.push("\n"+"=".repeat(60));lines.push("GUION REEL");lines.push("=".repeat(60));lines.push(reelScript)}
    const blob=new Blob([lines.join("\n")],{type:"text/plain;charset=utf-8"})
    const url=URL.createObjectURL(blob)
    const a=document.createElement("a");a.href=url;a.download=`guion-${(topic||"contenido").replace(/\s+/g,"-").slice(0,30)}.txt`;a.click()
    URL.revokeObjectURL(url);toast2("Guion exportado")
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

      {/* 3 columns */}
      <div style={{display:"flex",flex:1,overflow:"hidden",minHeight:0}}>

        {/* LEFT */}
        <div style={{width:255,flexShrink:0,borderRight:"1px solid #0d2240",background:"rgba(4,14,30,0.95)",display:"flex",flexDirection:"column",overflowY:"auto"}}>
          <div style={{padding:"12px 14px"}}>
            <p style={{fontSize:11,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:"#2979FF",margin:"0 0 10px"}}>Generar con IA</p>

            {/* Content type */}
            <div style={{display:"flex",gap:4,marginBottom:10}}>
              {CONTENT_TYPES.map(ct=>(
                <button key={ct.id} onClick={()=>setContentType(ct.id)} title={ct.desc}
                  style={{flex:1,padding:"6px 4px",borderRadius:8,fontSize:11,fontWeight:700,cursor:"pointer",
                    background:contentType===ct.id?"rgba(41,121,255,0.2)":"rgba(255,255,255,0.04)",
                    color:contentType===ct.id?"#2979FF":"rgba(255,255,255,0.4)",
                    border:`1px solid ${contentType===ct.id?"rgba(41,121,255,0.5)":"rgba(255,255,255,0.07)"}`}}>
                  {ct.label}
                </button>
              ))}
            </div>

            {/* Topic */}
            <label style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.45)",display:"block",marginBottom:4}}>Tema o principio</label>
            <textarea value={topic} onChange={e=>setTopic(e.target.value)}
              placeholder="Ej: Honra a Dios con tus primicias..." rows={3}
              style={{width:"100%",borderRadius:10,padding:"8px 10px",fontSize:12,color:"white",background:"rgba(255,255,255,0.06)",border:"1px solid #0d2240",fontFamily:"Inter,sans-serif",resize:"none",outline:"none",boxSizing:"border-box"}}
              onFocus={e=>e.target.style.borderColor="#2979FF66"} onBlur={e=>e.target.style.borderColor="#0d2240"}/>

            {/* Angulos */}
            <p style={{fontSize:11,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:"rgba(255,255,255,0.4)",margin:"12px 0 8px"}}>
              Angulos emocionales
              <span style={{fontSize:10,fontWeight:400,marginLeft:6,color:"rgba(255,255,255,0.25)"}}>{selectedAngulos.length} sel.</span>
            </p>
            <div style={{display:"flex",flexDirection:"column",gap:4}}>
              {ANGULOS.map(a=>{
                const sel=selectedAngulos.includes(a.id)
                return(
                  <button key={a.id} onClick={()=>toggleAngulo(a.id)}
                    style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",borderRadius:10,cursor:"pointer",textAlign:"left",
                      background:sel?`${a.color}18`:"rgba(255,255,255,0.04)",
                      border:`1px solid ${sel?a.color+"55":"rgba(255,255,255,0.06)"}`,transition:"all .15s"}}>
                    <div style={{width:15,height:15,borderRadius:4,border:`2px solid ${sel?a.color:"rgba(255,255,255,0.2)"}`,background:sel?a.color:"transparent",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                      {sel&&<span style={{color:"white",fontSize:9,lineHeight:1,fontWeight:900}}>v</span>}
                    </div>
                    <div>
                      <p style={{fontSize:12,fontWeight:600,color:sel?"white":"rgba(255,255,255,0.55)",margin:0}}>{a.label}</p>
                      <p style={{fontSize:10,color:"rgba(255,255,255,0.28)",margin:0}}>{a.desc}</p>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* API Key */}
            <div style={{marginTop:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                <label style={{fontSize:11,fontWeight:600,color:apiKey?"#00C853":"rgba(255,255,255,0.45)"}}>
                  {apiKey?"API Key configurada":"Claude API Key"}
                </label>
                <button onClick={()=>setShowKey(p=>!p)} style={{fontSize:10,color:"rgba(255,255,255,0.3)",background:"none",border:"none",cursor:"pointer",padding:0}}>
                  {showKey?"ocultar":"mostrar"}
                </button>
              </div>
              <input
                type={showKey?"text":"password"}
                value={apiKey}
                onChange={e=>{setApiKey(e.target.value);localStorage.setItem("ss-claude-key",e.target.value)}}
                placeholder="sk-ant-..."
                style={{width:"100%",borderRadius:9,padding:"7px 10px",fontSize:11,color:"white",background:"rgba(255,255,255,0.06)",border:`1px solid ${apiKey?"rgba(0,200,83,0.4)":"rgba(255,82,82,0.3)"}`,fontFamily:"Inter,sans-serif",outline:"none",boxSizing:"border-box"}}
              />
            </div>

            {genError&&<p style={{fontSize:11,color:"#FF5252",marginTop:8,padding:"6px 8px",background:"rgba(255,82,82,0.1)",borderRadius:8,border:"1px solid rgba(255,82,82,0.2)"}}>{genError}</p>}

            <button onClick={generateCarousel} disabled={generating}
              style={{width:"100%",marginTop:12,padding:"10px",borderRadius:12,fontSize:13,fontWeight:700,cursor:generating?"wait":"pointer",
                background:generating?"rgba(41,121,255,0.2)":"linear-gradient(135deg,#2979FF,#00E5FF)",
                color:"white",border:"none",opacity:generating?.7:1,transition:"all .2s"}}>
              {generating?"Generando...":"Generar Contenido"}
            </button>

            {/* Quick topics groups */}
            <div style={{marginTop:14}}>
              <div style={{display:"flex",gap:4,marginBottom:8}}>
                {QUICK_TOPICS.map((g,i)=>(
                  <button key={i} onClick={()=>setActiveGroup(i)}
                    style={{flex:1,padding:"4px 6px",borderRadius:7,fontSize:9,fontWeight:700,cursor:"pointer",
                      background:activeGroup===i?"rgba(255,215,64,0.15)":"rgba(255,255,255,0.04)",
                      color:activeGroup===i?"#FFD740":"rgba(255,255,255,0.3)",
                      border:`1px solid ${activeGroup===i?"rgba(255,215,64,0.4)":"rgba(255,255,255,0.06)"}`}}>
                    {i===0?"Rey Salomon":"Finanzas"}
                  </button>
                ))}
              </div>
              {QUICK_TOPICS[activeGroup].topics.map(t=>(
                <button key={t} onClick={()=>setTopic(t)}
                  style={{display:"block",width:"100%",textAlign:"left",fontSize:11,padding:"5px 8px",borderRadius:7,marginBottom:3,cursor:"pointer",background:"transparent",color:"rgba(255,255,255,0.4)",border:"none",fontFamily:"Inter,sans-serif"}}
                  onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color=activeGroup===0?"#FFD740":"#00E5FF";(e.currentTarget as HTMLElement).style.background=activeGroup===0?"rgba(255,215,64,0.07)":"rgba(0,229,255,0.07)"}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color="rgba(255,255,255,0.4)";(e.currentTarget as HTMLElement).style.background="transparent"}}>
                  {">"} {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CENTER */}
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:12,overflowY:"auto",gap:10}}>
          <div style={{position:"relative",borderRadius:16,overflow:"hidden",width:pW,height:pH,border:`1px solid ${ac}44`,boxShadow:`0 0 40px ${ac}22`,flexShrink:0}}>
            <canvas ref={cvRef} style={{position:"absolute",inset:0,width:"100%",height:"100%"}}/>
            {!recording&&(
              <div ref={prevRef} style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",justifyContent:"space-between",padding:16,background:"rgba(2,12,26,0.45)"}}>
                
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
                <div style={{background:"rgba(255,82,82,0.25)",border:"1px solid #FF5252",borderRadius:20,padding:"4px 12px",color:"#FF5252",fontSize:11,fontWeight:700}}>REC</div>
              </div>
            )}
          </div>
          {cur.voiceover&&(
            <div style={{width:pW,padding:"8px 12px",borderRadius:10,background:"rgba(41,121,255,0.08)",border:"1px solid rgba(41,121,255,0.2)"}}>
              <p style={{fontSize:9,fontWeight:700,color:"#2979FF",margin:"0 0 3px",textTransform:"uppercase",letterSpacing:"0.08em"}}>VOZ SLIDE {idx+1}</p>
              <p style={{fontSize:11,color:"rgba(255,255,255,0.65)",margin:0,lineHeight:1.5}}>{cur.voiceover}</p>
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div style={{width:275,flexShrink:0,borderLeft:"1px solid #0d2240",background:"rgba(7,20,40,0.85)",display:"flex",flexDirection:"column"}}>
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

          {rightPanel==="edit"&&(
            <div style={{padding:12,display:"flex",flexDirection:"column",gap:11,flex:1,overflowY:"auto"}}>
              <div style={{padding:"7px 10px",borderRadius:8,background:"rgba(0,0,0,0.15)"}}>
                <p style={{fontSize:12,fontWeight:700,color:"white",margin:0}}>Slide {idx+1} <span style={{color:ac}}>â€” {cur.label}</span></p>
              </div>
              {([{f:"title" as const,label:"Titulo",multi:false},{f:"subtitle" as const,label:"Subtitulo",multi:false},{f:"body" as const,label:"Cuerpo",multi:true}]).map(({f,label,multi})=>(
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
              {(cur.imagePrompt||cur.videoPrompt)&&(
                <button onClick={()=>copySlidePrompts(cur)}
                  style={{padding:"7px 10px",borderRadius:9,fontSize:11,fontWeight:600,cursor:"pointer",background:"rgba(255,215,64,0.1)",color:"#FFD740",border:"1px solid rgba(255,215,64,0.25)"}}>
                  Copiar prompts de este slide
                </button>
              )}
            </div>
          )}

          {rightPanel==="storyboard"&&(
            <div style={{padding:12,display:"flex",flexDirection:"column",gap:8,flex:1,overflowY:"auto"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <p style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.5)",margin:0,textTransform:"uppercase",letterSpacing:"0.1em"}}>Guion Visual</p>
                <button onClick={exportStoryboard} style={{fontSize:10,padding:"3px 9px",borderRadius:7,fontWeight:600,cursor:"pointer",background:"rgba(255,215,64,0.12)",color:"#FFD740",border:"1px solid rgba(255,215,64,0.3)"}}>
                  Exportar .txt
                </button>
              </div>
              {slides.map((s,i)=>(
                <div key={s.id} onClick={()=>setIdx(i)}
                  style={{padding:"9px 11px",borderRadius:11,background:i===idx?"rgba(41,121,255,0.1)":"rgba(255,255,255,0.03)",border:`1px solid ${i===idx?"rgba(41,121,255,0.35)":"rgba(255,255,255,0.06)"}`,cursor:"pointer"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                    <span style={{fontSize:10,fontWeight:700,color:i===idx?ac:"rgba(255,255,255,0.5)"}}>{i+1}. {s.label}</span>
                    {s.duration&&<span style={{fontSize:9,color:"rgba(255,255,255,0.3)"}}>{s.duration}s</span>}
                  </div>
                  {s.voiceover&&<p style={{fontSize:10,color:"rgba(255,255,255,0.6)",margin:"0 0 4px",lineHeight:1.45}}>{s.voiceover}</p>}
                  {s.videoPrompt&&<p style={{fontSize:9,color:"rgba(255,82,82,0.7)",margin:0,lineHeight:1.3}}>{s.videoPrompt.slice(0,80)}...</p>}
                  <button onClick={e=>{e.stopPropagation();copySlidePrompts(s)}}
                    style={{marginTop:5,fontSize:9,padding:"2px 7px",borderRadius:6,fontWeight:600,cursor:"pointer",background:"rgba(255,255,255,0.06)",color:"rgba(255,255,255,0.4)",border:"none"}}>
                    Copiar prompts
                  </button>
                </div>
              ))}
              {reelScript&&(
                <div style={{padding:"10px 11px",borderRadius:11,background:"rgba(255,82,82,0.06)",border:"1px solid rgba(255,82,82,0.2)"}}>
                  <p style={{fontSize:10,fontWeight:700,color:"#FF5252",margin:"0 0 7px",textTransform:"uppercase"}}>Guion Reel</p>
                  <pre style={{fontSize:9,color:"rgba(255,255,255,0.55)",margin:0,whiteSpace:"pre-wrap",lineHeight:1.55,fontFamily:"Inter,sans-serif"}}>{reelScript}</pre>
                  <button onClick={()=>navigator.clipboard.writeText(reelScript).then(()=>toast2("Copiado!"))}
                    style={{marginTop:8,width:"100%",fontSize:10,padding:"5px",borderRadius:7,fontWeight:600,cursor:"pointer",background:"rgba(255,82,82,0.12)",color:"#FF5252",border:"1px solid rgba(255,82,82,0.25)"}}>
                    Copiar guion completo
                  </button>
                </div>
              )}
              {!reelScript&&slides.every(s=>!s.voiceover)&&(
                <div style={{padding:"20px",textAlign:"center"}}>
                  <p style={{fontSize:28,margin:"0 0 8px"}}>&#127916;</p>
                  <p style={{fontSize:12,color:"rgba(255,255,255,0.4)",margin:0}}>Genera contenido con IA para ver el guion aqui</p>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

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
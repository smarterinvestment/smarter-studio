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

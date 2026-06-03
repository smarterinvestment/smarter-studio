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

import { useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import CookieBanner from "./CookieBanner";

const TONES = [
  { id: "professionell", label: "Professionell" },
  { id: "optimistisch", label: "Optimistisch" },
  { id: "konservativ", label: "Konservativ" },
  { id: "investorenfokus", label: "Investorenfokus" },
];

const PERIODS = [
  "Q1 2026","Q2 2026","Q3 2026","Q4 2026",
  "Januar 2026","Februar 2026","März 2026","April 2026","Mai 2026","Juni 2026",
  "Juli 2026","August 2026","September 2026","Oktober 2026","November 2026","Dezember 2026",
  "Geschäftsjahr 2026",
  "Q1 2025","Q2 2025","Q3 2025","Q4 2025",
  "Januar 2025","Februar 2025","März 2025","April 2025","Mai 2025","Juni 2025",
  "Juli 2025","August 2025","September 2025","Oktober 2025","November 2025","Dezember 2025",
  "Geschäftsjahr 2025","Geschäftsjahr 2024"
];

const INDUSTRIES = ["Technologie / Software","Handel / E-Commerce","Produktion / Industrie","Dienstleistungen","Immobilien","Gesundheit / Medizin","Gastronomie / Hotellerie","Bauwesen"];
const REPORT_TYPES = ["Quartalsreport (kompakt)","Jahresabschluss (detailliert)","Investoren-Update","Management-Zusammenfassung","Bankgespräch Vorbereitung"];

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', system-ui, sans-serif; background: #f4f6fb; color: #1a2236; }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #f0f2f8; }
  ::-webkit-scrollbar-thumb { background: #7c3aed; border-radius: 3px; }

  /* CARD */
  .card {
    background: #fff;
    border: 1px solid #e5e9f2;
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 16px;
    transition: box-shadow 0.25s, border-color 0.25s, transform 0.25s;
    box-shadow: 0 2px 8px rgba(26,34,54,0.06);
  }
  .card:hover {
    box-shadow: 0 8px 32px rgba(124,58,237,0.1);
    border-color: #c4b5fd;
    transform: translateY(-1px);
  }

  /* PRIMARY BUTTON */
  .btn-primary {
    position: relative; overflow: hidden;
    background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
    color: #fff; border: none; border-radius: 12px;
    font-family: 'Inter', sans-serif; font-weight: 700; font-size: 15px;
    cursor: pointer; letter-spacing: -0.01em;
    transition: transform 0.25s cubic-bezier(.34,1.56,.64,1), box-shadow 0.25s;
    box-shadow: 0 4px 18px rgba(124,58,237,0.35);
  }
  .btn-primary::before {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 60%);
    opacity: 0; transition: opacity 0.2s;
  }
  .btn-primary:hover:not(:disabled) { transform: translateY(-3px) scale(1.015); box-shadow: 0 12px 36px rgba(124,58,237,0.45); }
  .btn-primary:hover:not(:disabled)::before { opacity: 1; }
  .btn-primary:active:not(:disabled) { transform: translateY(0) scale(0.99); }
  .btn-primary:disabled { background: #e5e9f2; color: #a0aec0; box-shadow: none; cursor: not-allowed; }

  /* SUCCESS BUTTON */
  .btn-success {
    position: relative; overflow: hidden;
    background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
    color: #fff; border: none; border-radius: 12px;
    font-family: 'Inter', sans-serif; font-weight: 700; font-size: 15px;
    cursor: pointer; letter-spacing: -0.01em;
    transition: transform 0.25s cubic-bezier(.34,1.56,.64,1), box-shadow 0.25s;
    box-shadow: 0 4px 18px rgba(124,58,237,0.35);
  }
  .btn-success::before {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 60%);
    opacity: 0; transition: opacity 0.2s;
  }
  .btn-success:hover:not(:disabled) { transform: translateY(-3px) scale(1.015); box-shadow: 0 12px 36px rgba(124,58,237,0.45); }
  .btn-success:hover:not(:disabled)::before { opacity: 1; }
  .btn-success:active:not(:disabled) { transform: translateY(0) scale(0.99); }
  .btn-success:disabled { background: #e5e9f2; color: #a0aec0; box-shadow: none; cursor: not-allowed; }

  /* MODE TAB */
  .mode-tab {
    position: relative; overflow: hidden;
    border-radius: 16px; padding: 20px 18px; cursor: pointer; text-align: left;
    background: #fff; border: 1.5px solid #e5e9f2;
    box-shadow: 0 2px 8px rgba(26,34,54,0.05);
    transition: transform 0.25s cubic-bezier(.34,1.56,.64,1), box-shadow 0.25s, border-color 0.25s;
  }
  .mode-tab:hover { transform: translateY(-4px); box-shadow: 0 12px 36px rgba(124,58,237,0.12); border-color: #c4b5fd; }
  .mode-tab-active { border: 2px solid #7c3aed; box-shadow: 0 4px 20px rgba(124,58,237,0.18); background: #faf7ff; }

  /* TONE BUTTON */
  .tone-btn {
    border-radius: 8px; padding: 8px 16px; font-size: 13px;
    cursor: pointer; font-family: 'Inter', sans-serif; font-weight: 500;
    border: 1.5px solid #e5e9f2; background: #f8f9fc; color: #5a6580;
    transition: all 0.2s cubic-bezier(.34,1.56,.64,1);
  }
  .tone-btn:hover { transform: translateY(-2px) scale(1.04); border-color: #c4b5fd; background: #faf7ff; color: #6d28d9; box-shadow: 0 4px 14px rgba(124,58,237,0.15); }
  .tone-btn-active { background: linear-gradient(135deg,#7c3aed,#6d28d9) !important; color: #fff !important; border-color: transparent !important; box-shadow: 0 4px 14px rgba(124,58,237,0.35) !important; }

  /* KPI BOX */
  .kpi-box {
    background: #f8f9fc; border: 1.5px solid #e5e9f2; border-radius: 12px; padding: 14px;
    transition: all 0.2s cubic-bezier(.34,1.56,.64,1);
  }
  .kpi-box:hover, .kpi-box:focus-within { border-color: #a78bfa; background: #faf7ff; box-shadow: 0 4px 18px rgba(124,58,237,0.12); transform: translateY(-2px); }

  /* OUTPUT CARD */
  .output-card {
    background: #fff; border: 1px solid #e5e9f2; border-radius: 18px; overflow: hidden;
    margin-top: 20px; box-shadow: 0 4px 24px rgba(26,34,54,0.08);
    animation: fadeInUp 0.4s cubic-bezier(.34,1.56,.64,1) forwards;
  }

  /* SMALL BUTTONS */
  .copy-btn { background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); border-radius: 8px; padding: 6px 14px; font-size: 12px; color: #fff; cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.2s; }
  .copy-btn:hover { background: rgba(255,255,255,0.28); transform: translateY(-1px); }

  .pdf-btn { background: rgba(255,255,255,0.18); border: 1px solid rgba(255,255,255,0.35); border-radius: 8px; padding: 6px 14px; font-size: 12px; color: #fff; cursor: pointer; font-family: 'Inter', sans-serif; font-weight: 700; transition: all 0.2s; }
  .pdf-btn:hover { background: rgba(255,255,255,0.3); transform: translateY(-1px); }

  .tag-btn { background: #fef3c7; border: 1px solid #fde68a; border-radius: 100px; padding: 5px 14px; font-size: 12px; color: #92400e; cursor: pointer; font-family: 'Inter', sans-serif; font-weight: 600; transition: all 0.2s cubic-bezier(.34,1.56,.64,1); }
  .tag-btn:hover { background: #fde68a; transform: translateY(-2px) scale(1.05); box-shadow: 0 4px 12px rgba(251,191,36,0.3); }

  .footer-link { color: #7c3aed; text-decoration: none; font-weight: 600; font-size: 13px; transition: all 0.2s; display: inline-block; font-family: 'Inter', sans-serif; border-bottom: 1px solid transparent; padding-bottom: 1px; }
  .footer-link:hover { color: #6d28d9; border-bottom-color: #6d28d9; transform: translateY(-1px); }

  .upsell-btn { background: linear-gradient(135deg,#7c3aed,#6d28d9); border: none; border-radius: 10px; padding: 9px 18px; font-size: 12px; color: #fff; cursor: pointer; font-family: 'Inter', sans-serif; font-weight: 700; white-space: nowrap; transition: all 0.25s cubic-bezier(.34,1.56,.64,1); box-shadow: 0 4px 14px rgba(124,58,237,0.3); }
  .upsell-btn:hover { transform: translateY(-2px) scale(1.04); box-shadow: 0 8px 24px rgba(124,58,237,0.45); }

  /* INPUTS */
  select, input, textarea {
    font-family: 'Inter', sans-serif !important;
    background: #f8f9fc !important; color: #1a2236 !important;
    border: 1.5px solid #e5e9f2 !important; border-radius: 10px !important;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s !important;
  }
  select option { background: #fff; color: #1a2236; }
  select:focus, input:focus, textarea:focus {
    outline: none !important; border-color: #7c3aed !important;
    box-shadow: 0 0 0 3px rgba(124,58,237,0.12) !important; background: #fff !important;
  }
  input::placeholder, textarea::placeholder { color: #a0aec0 !important; }

  /* DRAG ZONE */
  .drag-zone { border: 2px dashed #d4c6f8; border-radius: 14px; padding: 48px 20px; text-align: center; cursor: pointer; background: #faf7ff; transition: all 0.25s; }
  .drag-zone:hover, .drag-zone-active { border-color: #7c3aed; background: #f3eeff; box-shadow: inset 0 0 30px rgba(124,58,237,0.05); }

  /* ANIMATIONS */
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  .fade-in-up { animation: fadeInUp 0.4s cubic-bezier(.34,1.56,.64,1) forwards; }
  @keyframes pulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.75); } }
  .pulse { animation: pulse 2s infinite; }
  @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
`;

function renderMd(text) {
  return text
    .replace(/^### (.+)$/gm, '<h3 style="font-size:11px;font-weight:700;margin:20px 0 7px;color:#7c3aed;text-transform:uppercase;letter-spacing:0.1em;font-family:Inter,sans-serif">$1</h3>')
    .replace(/^## (.+)$/gm,  '<h2 style="font-size:18px;font-weight:700;margin:26px 0 11px;color:#1a2236;border-bottom:2px solid #f0ebff;padding-bottom:10px;font-family:Inter,sans-serif">$1</h2>')
    .replace(/^# (.+)$/gm,   '<h1 style="font-size:24px;font-weight:800;margin:0 0 18px;color:#1a2236;font-family:Inter,sans-serif;letter-spacing:-0.03em">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#6d28d9;font-weight:700">$1</strong>')
    .replace(/^---$/gm, '<hr style="border:none;border-top:1.5px solid #f0ebff;margin:22px 0"/>')
    .replace(/\n\n/g, "<br/><br/>")
    .replace(/\n/g, "<br/>");
}

function fmt(n) { if (!n) return ""; return Number(n).toLocaleString("de-DE"); }

async function downloadPDF(text, company) {
  const { jsPDF } = await import('https://esm.sh/jspdf@2.5.1');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth(), pageH = doc.internal.pageSize.getHeight();
  const margin = 20, maxW = pageW - margin * 2;
  let y = margin;
  doc.setFillColor(26,34,54); doc.rect(0,0,pageW,18,'F');
  doc.setTextColor(255,255,255); doc.setFontSize(10); doc.setFont('helvetica','bold');
  doc.text('BWA-Generator · Finanzreport', margin, 12);
  doc.setFont('helvetica','normal'); doc.setFontSize(8);
  doc.text('bwa-generator.de', pageW-margin, 12, {align:'right'});
  y = 30;
  for (const line of text.split('\n')) {
    if (y > pageH-25) { doc.addPage(); doc.setFillColor(26,34,54); doc.rect(0,0,pageW,18,'F'); y=30; }
    if (line.startsWith('# ')) {
      doc.setFontSize(18); doc.setFont('helvetica','bold'); doc.setTextColor(26,34,54);
      const w=doc.splitTextToSize(line.replace(/^# /,''),maxW); doc.text(w,margin,y); y+=w.length*9+4;
    } else if (line.startsWith('## ')) {
      if(y>30){doc.setDrawColor(200,185,240);doc.setLineWidth(0.5);doc.line(margin,y,pageW-margin,y);y+=5;}
      doc.setFontSize(13); doc.setFont('helvetica','bold'); doc.setTextColor(124,58,237);
      const w=doc.splitTextToSize(line.replace(/^## /,''),maxW); doc.text(w,margin,y); y+=w.length*7+3;
    } else if (line.startsWith('### ')) {
      doc.setFontSize(11); doc.setFont('helvetica','bold'); doc.setTextColor(109,40,217);
      const w=doc.splitTextToSize(line.replace(/^### /,''),maxW); doc.text(w,margin,y); y+=w.length*6+2;
    } else if (line.startsWith('---')) {
      doc.setDrawColor(220,210,245); doc.setLineWidth(0.3); doc.line(margin,y,pageW-margin,y); y+=5;
    } else if (line.trim()==='') { y+=3;
    } else {
      const clean=line.replace(/\*\*(.+?)\*\*/g,'$1').replace(/^- /,'• ');
      doc.setFontSize(10); doc.setFont('helvetica','normal'); doc.setTextColor(55,65,81);
      const w=doc.splitTextToSize(clean,maxW); doc.text(w,margin,y); y+=w.length*5.5+1;
    }
  }
  const tp=doc.internal.getNumberOfPages();
  for(let p=1;p<=tp;p++){
    doc.setPage(p); doc.setFillColor(248,247,255); doc.rect(0,pageH-12,pageW,12,'F');
    doc.setFontSize(8); doc.setFont('helvetica','normal'); doc.setTextColor(154,165,180);
    doc.text('© 2026 BWA-Generator · bwa-generator.de',margin,pageH-5);
    doc.text(`Seite ${p} von ${tp}`,pageW-margin,pageH-5,{align:'right'});
  }
  doc.save(`Finanzreport_${(company||'Report').replace(/\s/g,'_')}.pdf`);
}

export default function App() {
  const [mode, setMode] = useState("upload");
  const [tone, setTone] = useState("professionell");
  const [reportType, setReportType] = useState("Quartalsreport (kompakt)");
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileData, setFileData] = useState(null);
  const [status, setStatus] = useState("");
  const fileRef = useRef();
  const [form, setForm] = useState({ company:"",period:"Q1 2026",industry:"Technologie / Software",revenue:"",revenuePrev:"",profit:"",costs:"",liquidity:"",employees:"",context:"" });
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  useEffect(()=>{
    const p=new URLSearchParams(window.location.search);
    if(p.get("paid")==="true"&&p.get("session_id")){verifyAndGenerate(p.get("session_id"));window.history.replaceState({},"","/");}
    else if(p.get("paid")==="false"){setStatus("Zahlung abgebrochen.");window.history.replaceState({},"","/");}
  },[]);

  const verifyAndGenerate=async(sid)=>{
    setLoading(true);setStatus("Zahlung wird verifiziert...");
    try{const r=await fetch("/api/verify-payment",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({session_id:sid})});
    const d=await r.json();if(d.paid){setPaid(true);const s=JSON.parse(sessionStorage.getItem("reportData")||"{}");await doGenerate(s);}else setStatus("Zahlung nicht bestätigt.");}
    catch(e){setStatus("Fehler: "+e.message);}setLoading(false);
  };

  const toBase64=f=>new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result.split(",")[1]);r.onerror=rej;r.readAsDataURL(f);});
  const extractExcel=f=>new Promise((res,rej)=>{const r=new FileReader();r.onload=e=>{try{const wb=XLSX.read(e.target.result,{type:"array"});let t="";wb.SheetNames.forEach(n=>{t+=`\n=== Blatt: ${n} ===\n`;t+=XLSX.utils.sheet_to_csv(wb.Sheets[n]);});res(t);}catch(err){rej(err);}};r.onerror=rej;r.readAsArrayBuffer(f);});

  const handleFile=async f=>{
    if(!f)return;setFileName(f.name);setReport("");setPaid(false);setStatus("Datei wird eingelesen...");
    try{if(f.name.endsWith(".pdf")){const b=await toBase64(f);setFileData({type:"pdf",content:b});setStatus("Bereit zur Analyse");}
    else if(f.name.match(/\.(xlsx|xls|csv)$/)){const t=await extractExcel(f);setFileData({type:"excel",content:t});setStatus("Bereit zur Analyse");}
    else{setStatus("Bitte PDF oder Excel hochladen.");setFileData(null);}}
    catch(e){setStatus("Fehler: "+e.message);setFileData(null);}
  };

  const onDrop=e=>{e.preventDefault();setDragOver(false);handleFile(e.dataTransfer.files[0]);};
  const resetFile=()=>{setFileName("");setFileData(null);setReport("");setStatus("");setPaid(false);};

  const longPromptSuffix=`Schreibe AUSFÜHRLICH — mindestens 800-1000 Wörter. Struktur: # [Titel], ## Executive Summary, ## Umsatz- & Ergebnisentwicklung, ## Kostenstruktur & Effizienzanalyse, ## Liquidität & Finanzielle Stabilität, ## Stärken & Risiken, ## Branchenvergleich & Benchmarks, ## Strategische Empfehlungen & Maßnahmenplan. Nutze **fett** für Zahlen.`;

  const buildMessages=data=>{
    const{mode,fileData,form,reportType,tone}=data;
    if(mode==="upload"&&fileData){
      const base=`Du bist ein erfahrener Senior-Finanzanalyst mit 20 Jahren Erfahrung. Analysiere diese BWA detailliert und erstelle einen ${reportType} auf Deutsch. Ton: ${tone}. ${longPromptSuffix}`;
      if(fileData.type==="pdf")return[{role:"user",content:[{type:"document",source:{type:"base64",media_type:"application/pdf",data:fileData.content}},{type:"text",text:base}]}];
      return[{role:"user",content:`${base}\n\nBWA-DATEN:\n${fileData.content}`}];
    }
    const{company,period,industry,revenue,revenuePrev,profit,costs,liquidity,employees,context}=form;
    const growth=revenue&&revenuePrev?(((revenue-revenuePrev)/revenuePrev)*100).toFixed(1):null;
    const margin=revenue&&profit?((profit/revenue)*100).toFixed(1):null;
    return[{role:"user",content:`Du bist ein erfahrener Senior-Finanzanalyst. Erstelle einen ${reportType} auf Deutsch.\n\nUnternehmen: ${company||"Musterunternehmen GmbH"} | Branche: ${industry} | Zeitraum: ${period} | Ton: ${tone}\n\nKENNZAHLEN:\n- Umsatz: ${revenue?fmt(revenue)+" €":"k.A."}\n- Vorjahr: ${revenuePrev?fmt(revenuePrev)+" €":"k.A."}\n- Wachstum: ${growth?growth+"%":"k.A."}\n- Gewinn/EBIT: ${profit?fmt(profit)+" €":"k.A."}\n- EBIT-Marge: ${margin?margin+"%":"k.A."}\n- Kosten: ${costs?fmt(costs)+" €":"k.A."}\n- Liquidität: ${liquidity?fmt(liquidity)+" €":"k.A."}\n- Mitarbeiter: ${employees||"k.A."}\n\nKONTEXT: ${context||"Keine Besonderheiten."}\n\n${longPromptSuffix}`}];
  };

  const doGenerate=async data=>{
    setLoading(true);setStatus("");
    try{const msgs=buildMessages(data&&Object.keys(data).length>0?data:{mode,fileData,form,reportType,tone});
    const r=await fetch("/api/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:8000,messages:msgs})});
    const d=await r.json();setReport(d.content?.[0]?.text||"Fehler beim Generieren.");}
    catch(e){setReport("Fehler: "+e.message);}setLoading(false);
  };

  const handlePay=async()=>{
    setPaying(true);sessionStorage.setItem("reportData",JSON.stringify({mode,fileData,form,reportType,tone}));
    try{const r=await fetch("/api/checkout",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({priceId:"price_1TDZD4D0HqBbjmyliXljmdkY",mode:"payment"})});
    const d=await r.json();if(d.url)window.location.href=d.url;else setStatus(d.error||"Fehler beim Checkout.");}
    catch(e){setStatus("Fehler: "+e.message);}setPaying(false);
  };

  const inp={background:"#f8f9fc",border:"1.5px solid #e5e9f2",borderRadius:10,padding:"11px 14px",color:"#1a2236",fontSize:14,outline:"none",width:"100%",fontFamily:"'Inter',sans-serif",boxSizing:"border-box"};
  const isUpload=mode==="upload";

  return(
    <>
      <style>{CSS}</style>
      <div style={{background:"#f4f6fb",minHeight:"100vh"}}>
        <CookieBanner/>

        {/* Nav */}
        <nav style={{background:"#fff",borderBottom:"1px solid #e5e9f2",padding:"0 32px",display:"flex",alignItems:"center",justifyContent:"space-between",height:64,position:"sticky",top:0,zIndex:100,boxShadow:"0 2px 12px rgba(26,34,54,0.06)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:36,height:36,background:"linear-gradient(135deg,#7c3aed,#6d28d9)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:17,fontWeight:800,boxShadow:"0 4px 12px rgba(124,58,237,0.4)"}}>B</div>
            <span style={{fontFamily:"'Inter',sans-serif",fontWeight:800,fontSize:17,color:"#1a2236",letterSpacing:"-0.04em"}}>BWA<span style={{color:"#7c3aed"}}>-</span>Generator</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:20}}>
            <div style={{fontSize:13,color:"#8492a6",fontFamily:"'Inter',sans-serif"}}>
              Manuell: <strong style={{color:"#16a34a"}}>Kostenlos</strong>
              <span style={{margin:"0 10px",color:"#dde3ef"}}>·</span>
              Upload: <strong style={{color:"#7c3aed"}}>19,00 €</strong>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6,background:"#f3eeff",border:"1px solid #ddd6fe",borderRadius:100,padding:"5px 14px"}}>
              <span className="pulse" style={{width:6,height:6,background:"#7c3aed",borderRadius:"50%",display:"inline-block"}}></span>
              <span style={{fontSize:11,color:"#7c3aed",fontFamily:"monospace",letterSpacing:"0.08em",fontWeight:700}}>KI AKTIV</span>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <div style={{background:"linear-gradient(135deg,#1a2236 0%,#2d1b69 50%,#4c1d95 100%)",padding:"64px 20px 56px",textAlign:"center",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(ellipse at 20% 60%, rgba(167,139,250,0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 30%, rgba(124,58,237,0.2) 0%, transparent 50%)",pointerEvents:"none"}}/>
          <div style={{position:"relative",zIndex:1,maxWidth:680,margin:"0 auto"}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:7,background:"rgba(167,139,250,0.15)",border:"1px solid rgba(196,181,253,0.3)",borderRadius:100,padding:"6px 16px",fontSize:11,color:"#ddd6fe",letterSpacing:"0.12em",textTransform:"uppercase",fontFamily:"monospace",marginBottom:24}}>
              <span style={{width:5,height:5,background:"#a78bfa",borderRadius:"50%",display:"inline-block"}}></span>
              Powered by Claude AI
            </div>
            <h1 style={{fontFamily:"'Inter',sans-serif",fontSize:"clamp(30px,5vw,54px)",fontWeight:900,color:"#fff",margin:"0 0 12px",letterSpacing:"-0.04em",lineHeight:1.05}}>
              Professionelle Finanzreports<br/>
              <span style={{color:"#c4b5fd"}}>in Sekunden</span>
            </h1>
            <p style={{fontFamily:"'Inter',sans-serif",fontSize:16,color:"#a5b4c8",margin:"0 auto 26px",lineHeight:1.8,fontWeight:400,maxWidth:520}}>
              Die Auswertung einer BWA kostet oft <span style={{color:"#fbbf24",fontWeight:600}}>Stunden wertvoller Zeit</span>. Unser KI-Tool analysiert deine BWA in Sekunden und erstellt einen professionellen Report.
            </p>
            <div style={{background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:12,padding:"12px 22px",marginBottom:28,display:"inline-block"}}>
              <span style={{fontSize:13,color:"#c4b5fd",fontFamily:"'Inter',sans-serif"}}>
                💼 Perfekt für <strong style={{color:"#fff"}}>Steuerberater</strong>, <strong style={{color:"#fff"}}>Buchhalter</strong> & <strong style={{color:"#fff"}}>Unternehmer</strong>
              </span>
            </div>
            <div style={{display:"flex",justifyContent:"center",gap:24,flexWrap:"wrap"}}>
              {[["✓","BWA Upload mit PDF-Download","#a78bfa"],["✓","Manuelle Eingabe kostenlos","#6ee7b7"],["✓","5 Berichtstypen & Töne","#c4b5fd"],["✓","Ergebnis in unter 30 Sekunden","#fbbf24"]].map(([icon,text,color])=>(
                <div key={text} style={{display:"flex",alignItems:"center",gap:7,fontSize:13,fontFamily:"'Inter',sans-serif",fontWeight:500}}>
                  <span style={{color,fontWeight:800}}>{icon}</span>
                  <span style={{color:"#94a3b8"}}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{maxWidth:800,margin:"0 auto",padding:"32px 16px 80px"}}>

          {/* Mode Tabs */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:20}}>
            {[
              {id:"upload",icon:"📂",title:"BWA hochladen",sub:"PDF, Excel, CSV",badge:"19,00 €",bc:"#7c3aed",bg:"#f3eeff"},
              {id:"manual",icon:"✏️",title:"Manuell eingeben",sub:"Zahlen direkt eintragen",badge:"Kostenlos",bc:"#16a34a",bg:"#f0fdf4"}
            ].map(({id,icon,title,sub,badge,bc,bg})=>(
              <button key={id} className={`mode-tab ${mode===id?"mode-tab-active":""}`}
                onClick={()=>{setMode(id);setReport("");setPaid(false);setStatus("");}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                  <span style={{fontSize:26}}>{icon}</span>
                  <span style={{background:bg,color:bc,fontSize:12,fontWeight:700,padding:"4px 12px",borderRadius:100,fontFamily:"'Inter',sans-serif"}}>{badge}</span>
                </div>
                <div style={{fontSize:15,fontWeight:700,color:"#1a2236",marginBottom:3,fontFamily:"'Inter',sans-serif"}}>{title}</div>
                <div style={{fontSize:12,color:"#8492a6",fontFamily:"'Inter',sans-serif"}}>{sub}</div>
              </button>
            ))}
          </div>

          {/* Upload Zone */}
          {isUpload&&(
            <div className="card">
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
                <div style={{fontSize:11,fontFamily:"monospace",letterSpacing:"0.1em",textTransform:"uppercase",color:"#a0aec0"}}>BWA-Datei hochladen</div>
                <div style={{fontSize:12,color:"#7c3aed",fontWeight:600,fontFamily:"'Inter',sans-serif"}}>📄 Inkl. PDF-Download</div>
              </div>
              {!fileName?(
                <div className={`drag-zone ${dragOver?"drag-zone-active":""}`}
                  onDragOver={e=>{e.preventDefault();setDragOver(true);}} onDragLeave={()=>setDragOver(false)} onDrop={onDrop} onClick={()=>fileRef.current.click()}>
                  <div style={{fontSize:46,marginBottom:12,display:"inline-block",animation:"float 3s ease-in-out infinite"}}>📊</div>
                  <div style={{fontSize:16,fontWeight:700,color:"#1a2236",marginBottom:5,fontFamily:"'Inter',sans-serif"}}>BWA hier ablegen oder klicken</div>
                  <div style={{fontSize:13,color:"#8492a6",marginBottom:18,fontFamily:"'Inter',sans-serif"}}>KI erkennt automatisch alle Kennzahlen</div>
                  <div style={{display:"flex",justifyContent:"center",gap:8}}>
                    {[["PDF","#dc2626"],["XLSX","#16a34a"],["XLS","#7c3aed"],["CSV","#d97706"]].map(([f,c])=>(
                      <span key={f} style={{background:`${c}12`,border:`1px solid ${c}40`,borderRadius:7,padding:"4px 12px",fontSize:11,color:c,fontFamily:"monospace",fontWeight:700}}>{f}</span>
                    ))}
                  </div>
                  <input ref={fileRef} type="file" accept=".pdf,.xlsx,.xls,.csv" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0])}/>
                </div>
              ):(
                <div style={{display:"flex",alignItems:"center",gap:12,background:"#f3eeff",border:"1.5px solid #ddd6fe",borderRadius:12,padding:"14px 18px"}}>
                  <span style={{fontSize:28}}>{fileName.endsWith(".pdf")?"📄":"📊"}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,fontWeight:700,color:"#7c3aed",fontFamily:"'Inter',sans-serif"}}>{fileName}</div>
                    <div style={{fontSize:12,color:"#8492a6",marginTop:2,fontFamily:"'Inter',sans-serif"}}>✓ {status}</div>
                  </div>
                  <button onClick={resetFile} style={{background:"#fff",border:"1.5px solid #e5e9f2",borderRadius:8,padding:"5px 12px",fontSize:12,color:"#8492a6",cursor:"pointer",fontFamily:"'Inter',sans-serif"}}>✕</button>
                </div>
              )}
            </div>
          )}

          {/* Unternehmensdaten Upload */}
          {isUpload&&(
            <div className="card">
              <div style={{fontSize:11,fontFamily:"monospace",letterSpacing:"0.1em",textTransform:"uppercase",color:"#a0aec0",marginBottom:16}}>Unternehmensdaten</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div style={{display:"flex",flexDirection:"column",gap:5}}>
                  <label style={{fontSize:12,color:"#5a6580",fontWeight:600,fontFamily:"'Inter',sans-serif"}}>Unternehmensname</label>
                  <input style={inp} placeholder="z.B. Müller GmbH" value={form.company} onChange={e=>set("company",e.target.value)}/>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:5}}>
                  <label style={{fontSize:12,color:"#5a6580",fontWeight:600,fontFamily:"'Inter',sans-serif"}}>Berichtszeitraum</label>
                  <select style={inp} value={form.period} onChange={e=>set("period",e.target.value)}>{PERIODS.map(p=><option key={p}>{p}</option>)}</select>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:5,gridColumn:"1/-1"}}>
                  <label style={{fontSize:12,color:"#5a6580",fontWeight:600,fontFamily:"'Inter',sans-serif"}}>Branche</label>
                  <select style={inp} value={form.industry} onChange={e=>set("industry",e.target.value)}>{INDUSTRIES.map(i=><option key={i}>{i}</option>)}</select>
                </div>
              </div>
            </div>
          )}

          {/* Kontext Upload */}
          {isUpload&&(
            <div style={{background:"#fffbeb",border:"1.5px solid #fde68a",borderRadius:16,padding:24,marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                <span style={{fontSize:18}}>⚡</span>
                <div style={{fontSize:12,fontFamily:"'Inter',sans-serif",letterSpacing:"0.08em",textTransform:"uppercase",color:"#92400e",fontWeight:700}}>Kontext angeben — für präzisere Reports</div>
              </div>
              <p style={{fontSize:13,color:"#78350f",lineHeight:1.6,margin:"0 0 12px",fontFamily:"'Inter',sans-serif"}}>Je mehr Kontext du angibst, desto präziser wird dein Report.</p>
              <textarea value={form.context} onChange={e=>set("context",e.target.value)}
                placeholder="z.B. Neukunde gewonnen (+80.000 € Jahresumsatz), Produktlaunch im März, 2 neue Mitarbeiter..."
                style={{...inp,background:"#fff",border:"1.5px solid #fde68a",minHeight:90,resize:"vertical",lineHeight:1.6}}/>
              <div style={{display:"flex",gap:8,marginTop:10,flexWrap:"wrap"}}>
                {["Neukunde gewonnen","Produktlaunch","Personalaufbau","Investitionen","Marktveränderung","Bankgespräch"].map(tag=>(
                  <button key={tag} className="tag-btn" onClick={()=>set("context",form.context?form.context+", "+tag:tag)}>+ {tag}</button>
                ))}
              </div>
            </div>
          )}

          {/* Manual Mode */}
          {!isUpload&&(
            <>
              <div style={{background:"#f0fdf4",border:"1.5px solid #bbf7d0",borderRadius:14,padding:"14px 18px",marginBottom:14,display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:20}}>🎁</span>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:"#16a34a",fontFamily:"'Inter',sans-serif"}}>Kostenlos — keine Zahlung nötig</div>
                  <div style={{fontSize:12,color:"#4d7c5f",fontFamily:"'Inter',sans-serif"}}>Report anzeigen & kopieren. PDF nur im BWA-Upload verfügbar.</div>
                </div>
              </div>
              <div className="card">
                <div style={{fontSize:11,fontFamily:"monospace",letterSpacing:"0.1em",textTransform:"uppercase",color:"#a0aec0",marginBottom:16}}>Unternehmensdaten</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  <div style={{display:"flex",flexDirection:"column",gap:5}}>
                    <label style={{fontSize:12,color:"#5a6580",fontWeight:600,fontFamily:"'Inter',sans-serif"}}>Unternehmensname</label>
                    <input style={inp} placeholder="z.B. Müller GmbH" value={form.company} onChange={e=>set("company",e.target.value)}/>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:5}}>
                    <label style={{fontSize:12,color:"#5a6580",fontWeight:600,fontFamily:"'Inter',sans-serif"}}>Berichtszeitraum</label>
                    <select style={inp} value={form.period} onChange={e=>set("period",e.target.value)}>{PERIODS.map(p=><option key={p}>{p}</option>)}</select>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:5,gridColumn:"1/-1"}}>
                    <label style={{fontSize:12,color:"#5a6580",fontWeight:600,fontFamily:"'Inter',sans-serif"}}>Branche</label>
                    <select style={inp} value={form.industry} onChange={e=>set("industry",e.target.value)}>{INDUSTRIES.map(i=><option key={i}>{i}</option>)}</select>
                  </div>
                </div>
              </div>
              <div className="card">
                <div style={{fontSize:11,fontFamily:"monospace",letterSpacing:"0.1em",textTransform:"uppercase",color:"#a0aec0",marginBottom:16}}>Finanzkennzahlen</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
                  {[["Umsatz","revenue","€"],["Vorjahr","revenuePrev","€"],["Gewinn/EBIT","profit","€"],["Kosten","costs","€"],["Liquidität","liquidity","€"],["Mitarbeiter","employees","FTE"]].map(([label,key,unit])=>(
                    <div key={key} className="kpi-box">
                      <div style={{fontSize:10,fontFamily:"monospace",color:"#a0aec0",letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:5}}>{label}</div>
                      <div style={{display:"flex",alignItems:"center",gap:4}}>
                        <input type="number" placeholder="0" value={form[key]} onChange={e=>set(key,e.target.value)}
                          style={{background:"transparent",border:"none",color:"#1a2236",fontSize:17,fontWeight:700,fontFamily:"'Inter',sans-serif",outline:"none",width:"100%",boxShadow:"none"}}/>
                        <span style={{fontSize:12,color:"#a0aec0",fontFamily:"monospace"}}>{unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card">
                <div style={{fontSize:11,fontFamily:"monospace",letterSpacing:"0.1em",textTransform:"uppercase",color:"#a0aec0",marginBottom:12}}>Kontext (optional)</div>
                <textarea value={form.context} onChange={e=>set("context",e.target.value)} placeholder="z.B. Neukunde gewonnen, Produktlaunch, unerwartete Kosten..."
                  style={{...inp,minHeight:85,resize:"vertical",lineHeight:1.6}}/>
              </div>
            </>
          )}

          {/* Settings */}
          <div className="card">
            <div style={{fontSize:11,fontFamily:"monospace",letterSpacing:"0.1em",textTransform:"uppercase",color:"#a0aec0",marginBottom:16}}>Report-Einstellungen</div>
            <div style={{display:"flex",flexDirection:"column",gap:16}}>
              <div>
                <label style={{fontSize:12,color:"#5a6580",fontWeight:600,fontFamily:"'Inter',sans-serif",display:"block",marginBottom:7}}>Berichtstyp</label>
                <select style={inp} value={reportType} onChange={e=>setReportType(e.target.value)}>{REPORT_TYPES.map(r=><option key={r}>{r}</option>)}</select>
              </div>
              <div>
                <label style={{fontSize:12,color:"#5a6580",fontWeight:600,fontFamily:"'Inter',sans-serif",display:"block",marginBottom:9}}>Ton des Berichts</label>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {TONES.map(t=>(
                    <button key={t.id} className={`tone-btn ${tone===t.id?"tone-btn-active":""}`} onClick={()=>setTone(t.id)}>{t.label}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div style={{marginTop:4}}>
            {isUpload?(
              !report&&(
                <button className="btn-primary" onClick={handlePay} disabled={!fileData||paying||loading}
                  style={{width:"100%",padding:"18px",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",gap:12}}>
                  {paying||loading
                    ?<span>⏳ {loading?"Report wird generiert...":"Weiterleitung zu Stripe..."}</span>
                    :<><span>💳</span><span>19,00 € bezahlen & Report generieren</span><span style={{opacity:0.55,fontSize:12}}>· Stripe</span></>}
                </button>
              )
            ):(
              <button className="btn-success" onClick={()=>doGenerate({})} disabled={loading}
                style={{width:"100%",padding:"18px",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",gap:12}}>
                {loading?<span>⏳ Report wird generiert...</span>:<><span>⚡</span><span>Report kostenlos generieren</span></>}
              </button>
            )}
          </div>

          {status&&!loading&&(
            <div style={{background:"#f3eeff",border:"1.5px solid #ddd6fe",borderRadius:10,padding:"11px 16px",marginTop:12,fontSize:13,color:"#7c3aed",fontFamily:"'Inter',sans-serif"}}>{status}</div>
          )}

          {/* Output */}
          {(loading||report)&&(
            <div className="output-card">
              <div style={{background:"linear-gradient(135deg,#1a2236,#2d1b69)",padding:"14px 22px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{width:8,height:8,borderRadius:"50%",background:"#22c55e",display:"inline-block",boxShadow:"0 0 8px rgba(34,197,94,0.7)"}}></span>
                  <span style={{fontFamily:"monospace",fontSize:11,color:"#a78bfa",letterSpacing:"0.1em"}}>FINANZREPORT · KI-GENERIERT</span>
                </div>
                {report&&(
                  <div style={{display:"flex",gap:8}}>
                    <button className="copy-btn" onClick={()=>{navigator.clipboard.writeText(report);setCopied(true);setTimeout(()=>setCopied(false),2000);}}>
                      {copied?"✓ Kopiert!":"📋 Kopieren"}
                    </button>
                    {isUpload&&<button className="pdf-btn" onClick={()=>downloadPDF(report,form.company)}>⬇ PDF</button>}
                  </div>
                )}
              </div>
              {loading&&(
                <div style={{padding:"30px 28px",color:"#8492a6",fontSize:14,display:"flex",alignItems:"center",gap:10,fontFamily:"'Inter',sans-serif"}}>
                  <span className="pulse" style={{width:8,height:8,background:"#7c3aed",borderRadius:"50%",display:"inline-block"}}></span>
                  KI analysiert und verfasst Report...
                </div>
              )}
              {report&&(
                <>
                  <div style={{padding:"30px 34px 34px",fontSize:15,lineHeight:1.9,fontFamily:"Georgia,serif",color:"#2d3748"}} dangerouslySetInnerHTML={{__html:renderMd(report)}}/>
                  {!isUpload&&(
                    <div style={{margin:"0 30px 26px",background:"#f3eeff",border:"1.5px dashed #ddd6fe",borderRadius:12,padding:"14px 18px",display:"flex",alignItems:"center",gap:14}}>
                      <span style={{fontSize:22}}>📄</span>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,fontWeight:700,color:"#7c3aed",fontFamily:"'Inter',sans-serif",marginBottom:2}}>PDF-Download verfügbar</div>
                        <div style={{fontSize:12,color:"#8492a6",fontFamily:"'Inter',sans-serif"}}>Lade deine BWA hoch (19,00 €) um den Report als PDF herunterzuladen.</div>
                      </div>
                      <button className="upsell-btn" onClick={()=>{setMode("upload");setReport("");}}>BWA hochladen →</button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{borderTop:"1px solid #e5e9f2",background:"#fff",padding:"28px 32px",textAlign:"center"}}>
          <p style={{fontSize:12,color:"#a0aec0",fontFamily:"'Inter',sans-serif",margin:"0 0 10px"}}>© 2026 Sergej Nikoleisen · BWA-Generator</p>
          <div style={{display:"flex",justifyContent:"center",gap:24,flexWrap:"wrap"}}>
            <a href="/impressum" className="footer-link">Impressum</a>
            <a href="/datenschutz" className="footer-link">Datenschutz</a>
            <a href="/agb" className="footer-link">AGB</a>
          </div>
        </div>
      </div>
    </>
  );
}

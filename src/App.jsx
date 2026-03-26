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
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

* { box-sizing: border-box; }
body { margin: 0; font-family: 'Outfit', system-ui, sans-serif; }

/* ── PRIMARY BUTTON ── */
.btn-primary {
  background: linear-gradient(135deg, #1a4fd6 0%, #0a2d8a 100%);
  color: #fff; border: none; border-radius: 14px;
  font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 15px;
  cursor: pointer; position: relative; overflow: hidden;
  transition: transform 0.22s cubic-bezier(.4,0,.2,1), box-shadow 0.22s, filter 0.22s;
  box-shadow: 0 4px 20px rgba(26,79,214,0.38), 0 1px 4px rgba(0,0,0,0.08);
}
.btn-primary::before {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 60%);
  opacity: 1;
}
.btn-primary::after {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(circle at 50% 0%, rgba(255,255,255,0.25), transparent 70%);
  opacity: 0; transition: opacity 0.3s;
}
.btn-primary:hover:not(:disabled) {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 14px 40px rgba(26,79,214,0.55), 0 2px 8px rgba(0,0,0,0.1);
  filter: brightness(1.08);
}
.btn-primary:hover:not(:disabled)::after { opacity: 1; }
.btn-primary:active:not(:disabled) {
  transform: translateY(0) scale(0.98);
  box-shadow: 0 4px 12px rgba(26,79,214,0.3);
  filter: brightness(0.96);
}
.btn-primary:disabled { background: #e2e8f0; color: #9aa5b4; box-shadow: none; cursor: not-allowed; }

/* ── SUCCESS BUTTON ── */
.btn-success {
  background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
  color: #fff; border: none; border-radius: 14px;
  font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 15px;
  cursor: pointer; position: relative; overflow: hidden;
  transition: transform 0.22s cubic-bezier(.4,0,.2,1), box-shadow 0.22s, filter 0.22s;
  box-shadow: 0 4px 20px rgba(22,163,74,0.35), 0 1px 4px rgba(0,0,0,0.08);
}
.btn-success::before {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 60%);
}
.btn-success::after {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(circle at 50% 0%, rgba(255,255,255,0.25), transparent 70%);
  opacity: 0; transition: opacity 0.3s;
}
.btn-success:hover:not(:disabled) {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 14px 40px rgba(22,163,74,0.5), 0 2px 8px rgba(0,0,0,0.1);
  filter: brightness(1.08);
}
.btn-success:hover:not(:disabled)::after { opacity: 1; }
.btn-success:active:not(:disabled) {
  transform: translateY(0) scale(0.98);
  filter: brightness(0.96);
}
.btn-success:disabled { background: #e2e8f0; color: #9aa5b4; box-shadow: none; cursor: not-allowed; }

/* ── CARD ── */
.card {
  background: #fff;
  border: 1.5px solid #e8eef8;
  border-radius: 18px;
  padding: 26px;
  margin-bottom: 16px;
  transition: box-shadow 0.25s cubic-bezier(.4,0,.2,1), border-color 0.25s, transform 0.25s;
  box-shadow: 0 2px 10px rgba(26,79,214,0.04);
}
.card:hover {
  box-shadow: 0 10px 36px rgba(26,79,214,0.10);
  border-color: #b8ccf8;
  transform: translateY(-2px);
}

/* ── MODE TABS ── */
.mode-tab {
  border-radius: 16px; padding: 18px 16px; cursor: pointer; text-align: left;
  transition: transform 0.22s cubic-bezier(.4,0,.2,1), box-shadow 0.22s, border-color 0.22s;
}
.mode-tab:hover {
  transform: translateY(-5px);
  box-shadow: 0 14px 40px rgba(26,79,214,0.15) !important;
}

/* ── TONE BUTTONS ── */
.tone-btn {
  border-radius: 10px; padding: 9px 18px; font-size: 13px;
  cursor: pointer; font-family: 'Outfit', sans-serif; font-weight: 500;
  transition: transform 0.18s cubic-bezier(.4,0,.2,1), box-shadow 0.18s, background 0.18s, border-color 0.18s;
}
.tone-btn:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 20px rgba(26,79,214,0.2);
}

/* ── KPI BOXES ── */
.kpi-box {
  background: #f8fafc; border: 1.5px solid #e8eef6; border-radius: 12px; padding: 14px;
  transition: all 0.22s cubic-bezier(.4,0,.2,1);
}
.kpi-box:hover, .kpi-box:focus-within {
  border-color: #93b4f8; background: #f0f5ff;
  box-shadow: 0 6px 20px rgba(26,79,214,0.13);
  transform: translateY(-2px);
}

/* ── OUTPUT CARD ── */
.output-card {
  background: #fff; border: 1.5px solid #e2e8f0; border-radius: 18px;
  overflow: hidden; margin-top: 20px;
  box-shadow: 0 6px 32px rgba(0,0,0,0.08);
  transition: box-shadow 0.25s, transform 0.25s;
}
.output-card:hover {
  box-shadow: 0 16px 52px rgba(0,0,0,0.13);
  transform: translateY(-2px);
}

/* ── COPY / PDF BUTTONS ── */
.copy-btn {
  background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.25);
  border-radius: 9px; padding: 7px 15px; font-size: 12px; color: #fff;
  cursor: pointer; font-family: 'Outfit', sans-serif;
  transition: background 0.18s, transform 0.18s, box-shadow 0.18s;
  backdrop-filter: blur(4px);
}
.copy-btn:hover {
  background: rgba(255,255,255,0.24);
  transform: translateY(-2px);
  box-shadow: 0 4px 14px rgba(0,0,0,0.15);
}

.pdf-btn {
  background: rgba(26,79,214,0.22); border: 1px solid rgba(147,180,248,0.45);
  border-radius: 9px; padding: 7px 15px; font-size: 12px; color: #93b4f8;
  cursor: pointer; font-family: 'Outfit', sans-serif; font-weight: 700;
  transition: all 0.18s cubic-bezier(.4,0,.2,1);
  backdrop-filter: blur(4px);
}
.pdf-btn:hover {
  background: rgba(26,79,214,0.45);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(26,79,214,0.4);
  color: #fff;
}

/* ── TAG BUTTONS ── */
.tag-btn {
  background: #fef3c7; border: 1px solid #fcd34d; border-radius: 100px;
  padding: 4px 14px; font-size: 12px; color: #92400e;
  cursor: pointer; font-family: 'Outfit', sans-serif; font-weight: 600;
  transition: transform 0.15s cubic-bezier(.4,0,.2,1), box-shadow 0.15s, background 0.15s;
}
.tag-btn:hover {
  background: #fde68a;
  transform: translateY(-2px) scale(1.07);
  box-shadow: 0 5px 14px rgba(251,191,36,0.38);
}

/* ── FOOTER LINK ── */
.footer-link {
  color: #1a4fd6; text-decoration: none; font-weight: 600; font-size: 13px;
  display: inline-block; font-family: 'Outfit', sans-serif;
  transition: color 0.15s, transform 0.15s;
  position: relative;
}
.footer-link::after {
  content: ''; position: absolute; bottom: -2px; left: 0; right: 0;
  height: 1.5px; background: #1a4fd6;
  transform: scaleX(0); transform-origin: left;
  transition: transform 0.22s cubic-bezier(.4,0,.2,1);
}
.footer-link:hover { color: #0a2d8a; transform: translateY(-1px); }
.footer-link:hover::after { transform: scaleX(1); }

/* ── UPSELL BUTTON ── */
.upsell-btn {
  background: linear-gradient(135deg, #1a4fd6, #0a2d8a);
  border: none; border-radius: 10px; padding: 9px 18px;
  font-size: 12px; color: #fff; cursor: pointer;
  font-family: 'Outfit', sans-serif; font-weight: 700; white-space: nowrap;
  transition: transform 0.18s cubic-bezier(.4,0,.2,1), box-shadow 0.18s, filter 0.18s;
  box-shadow: 0 4px 16px rgba(26,79,214,0.32);
}
.upsell-btn:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 10px 28px rgba(26,79,214,0.48);
  filter: brightness(1.1);
}

/* ── INPUTS / SELECTS ── */
select, input, textarea {
  font-family: 'Outfit', sans-serif !important;
  transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
}
select:focus, input:focus, textarea:focus {
  outline: none;
  border-color: #1a4fd6 !important;
  box-shadow: 0 0 0 3px rgba(26,79,214,0.1) !important;
  background: #fafcff !important;
}

/* ── ANIMATIONS ── */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
.fade-in-up { animation: fadeInUp 0.45s cubic-bezier(.4,0,.2,1) forwards; }

@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.5; transform: scale(0.8); }
}
.pulse { animation: pulse 2s infinite; }
`;
function renderMd(text) {
  return text
    .replace(/^### (.+)$/gm, '<h3 style="font-size:13px;font-weight:700;margin:20px 0 6px;color:#1e3a6e;text-transform:uppercase;letter-spacing:0.07em;font-family:Outfit,sans-serif">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="font-size:18px;font-weight:700;margin:26px 0 10px;color:#0d1f3c;border-bottom:2px solid #dde8f8;padding-bottom:8px;font-family:Outfit,sans-serif">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="font-size:23px;font-weight:800;margin:0 0 16px;color:#0d1f3c;font-family:Outfit,sans-serif;letter-spacing:-0.02em">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#1a4fd6;font-weight:700">$1</strong>')
    .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0"/>')
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

  doc.setFillColor(13,31,60); doc.rect(0,0,pageW,18,'F');
  doc.setTextColor(255,255,255); doc.setFontSize(10); doc.setFont('helvetica','bold');
  doc.text('BWA-Generator · Finanzreport', margin, 12);
  doc.setFont('helvetica','normal'); doc.setFontSize(8);
  doc.text('bwa-generator.de', pageW-margin, 12, {align:'right'});
  y = 30;

  for (const line of text.split('\n')) {
    if (y > pageH-25) { doc.addPage(); doc.setFillColor(13,31,60); doc.rect(0,0,pageW,18,'F'); y=30; }
    if (line.startsWith('# ')) {
      doc.setFontSize(18); doc.setFont('helvetica','bold'); doc.setTextColor(13,31,60);
      const w=doc.splitTextToSize(line.replace(/^# /,''),maxW); doc.text(w,margin,y); y+=w.length*9+4;
    } else if (line.startsWith('## ')) {
      if(y>30){doc.setDrawColor(221,232,248);doc.setLineWidth(0.5);doc.line(margin,y,pageW-margin,y);y+=5;}
      doc.setFontSize(13); doc.setFont('helvetica','bold'); doc.setTextColor(26,79,214);
      const w=doc.splitTextToSize(line.replace(/^## /,''),maxW); doc.text(w,margin,y); y+=w.length*7+3;
    } else if (line.startsWith('### ')) {
      doc.setFontSize(11); doc.setFont('helvetica','bold'); doc.setTextColor(30,59,110);
      const w=doc.splitTextToSize(line.replace(/^### /,''),maxW); doc.text(w,margin,y); y+=w.length*6+2;
    } else if (line.startsWith('---')) {
      doc.setDrawColor(200,210,230); doc.setLineWidth(0.3); doc.line(margin,y,pageW-margin,y); y+=5;
    } else if (line.trim()==='') { y+=3;
    } else {
      const clean=line.replace(/\*\*(.+?)\*\*/g,'$1').replace(/^- /,'• ');
      doc.setFontSize(10); doc.setFont('helvetica','normal'); doc.setTextColor(55,65,81);
      const w=doc.splitTextToSize(clean,maxW); doc.text(w,margin,y); y+=w.length*5.5+1;
    }
  }

  const tp=doc.internal.getNumberOfPages();
  for(let p=1;p<=tp;p++){
    doc.setPage(p); doc.setFillColor(248,250,252); doc.rect(0,pageH-12,pageW,12,'F');
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

  const inp={background:"#f8fafc",border:"1.5px solid #e2e8f0",borderRadius:10,padding:"11px 14px",color:"#0d1f3c",fontSize:14,outline:"none",width:"100%",fontFamily:"'Outfit',sans-serif",boxSizing:"border-box"};
  const isUpload=mode==="upload";

  return(
    <>
      <style>{CSS}</style>
      <div style={{background:"#f0f4fb",minHeight:"100vh"}}>
        <CookieBanner/>

        {/* Nav */}
        <nav style={{background:"#fff",borderBottom:"1px solid #e8eef8",padding:"0 32px",display:"flex",alignItems:"center",justifyContent:"space-between",height:62,position:"sticky",top:0,zIndex:100,boxShadow:"0 2px 12px rgba(13,31,60,0.06)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:36,height:36,background:"linear-gradient(135deg,#1a4fd6,#0a2d8a)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:17,fontWeight:800,boxShadow:"0 4px 12px rgba(26,79,214,0.3)"}}>B</div>
            <span style={{fontFamily:"'Outfit',sans-serif",fontWeight:800,fontSize:17,color:"#0d1f3c",letterSpacing:"-0.03em"}}>BWA<span style={{color:"#1a4fd6"}}>-</span>Generator</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:20}}>
            <div style={{fontSize:13,color:"#6b7c99",fontFamily:"'Outfit',sans-serif"}}>
              Manuell: <strong style={{color:"#16a34a"}}>Kostenlos</strong>
              <span style={{margin:"0 10px",color:"#d1d5db"}}>·</span>
              BWA-Upload: <strong style={{color:"#1a4fd6"}}>19,00 €</strong>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6,background:"#f0f5ff",border:"1px solid #c7d8fb",borderRadius:100,padding:"5px 14px"}}>
              <span className="pulse" style={{width:6,height:6,background:"#1a4fd6",borderRadius:"50%",display:"inline-block"}}></span>
              <span style={{fontSize:11,color:"#1a4fd6",fontFamily:"monospace",letterSpacing:"0.06em",fontWeight:600}}>KI AKTIV</span>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <div style={{background:"linear-gradient(160deg,#0d1f3c 0%,#1a3a7a 100%)",padding:"56px 20px 48px",textAlign:"center",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(ellipse at 15% 60%, rgba(26,79,214,0.2) 0%, transparent 55%), radial-gradient(ellipse at 85% 40%, rgba(26,79,214,0.14) 0%, transparent 55%)",pointerEvents:"none"}}></div>
          <div style={{position:"relative",zIndex:1,maxWidth:660,margin:"0 auto"}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:7,background:"rgba(26,79,214,0.2)",border:"1px solid rgba(147,180,248,0.35)",borderRadius:100,padding:"6px 16px",fontSize:11,color:"#93b4f8",letterSpacing:"0.1em",textTransform:"uppercase",fontFamily:"monospace",marginBottom:20}}>
              <span style={{width:6,height:6,background:"#93b4f8",borderRadius:"50%",display:"inline-block"}}></span>
              Powered by Claude AI
            </div>
            <h1 style={{fontFamily:"'Outfit',sans-serif",fontSize:"clamp(28px,5vw,50px)",fontWeight:900,color:"#fff",margin:"0 0 18px",letterSpacing:"-0.04em",lineHeight:1.05}}>
              Professionelle Finanzreports<br/>
              <span style={{color:"#93b4f8"}}>in Sekunden</span>
            </h1>
            <p style={{fontFamily:"'Outfit',sans-serif",fontSize:16,color:"#7a9cc8",margin:"0 auto 22px",lineHeight:1.75,fontWeight:300,maxWidth:540}}>
              Die Auswertung einer BWA kostet Steuerberater & Unternehmer oft <span style={{color:"#fbbf24",fontWeight:600}}>Stunden wertvoller Zeit</span>. Unser KI-Tool analysiert deine BWA in Sekunden und erstellt einen professionellen Report mit konkreten Handlungsempfehlungen.
            </p>
            <div style={{background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:12,padding:"12px 22px",marginBottom:26,display:"inline-block"}}>
              <span style={{fontSize:13,color:"#93b4f8",fontFamily:"'Outfit',sans-serif"}}>
                💼 Perfekt für <strong style={{color:"#fff"}}>Steuerberater</strong>, <strong style={{color:"#fff"}}>Buchhalter</strong> & <strong style={{color:"#fff"}}>Unternehmer</strong>
              </span>
            </div>
            <div style={{display:"flex",justifyContent:"center",gap:22,flexWrap:"wrap"}}>
              {[["✓","BWA Upload mit PDF-Download","#93b4f8"],["✓","Manuelle Eingabe kostenlos","#6ee7b7"],["✓","5 Berichtstypen & Töne","#93b4f8"],["✓","Ergebnis in unter 30 Sekunden","#6ee7b7"]].map(([icon,text,color])=>(
                <div key={text} style={{display:"flex",alignItems:"center",gap:7,fontSize:13,color,fontFamily:"'Outfit',sans-serif",fontWeight:500}}>
                  <span style={{fontWeight:800}}>{icon}</span><span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{maxWidth:780,margin:"0 auto",padding:"30px 16px 70px"}}>

          {/* Mode Tabs */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:20}}>
            {[{id:"upload",icon:"📂",title:"BWA hochladen",sub:"PDF, Excel, CSV",badge:"19,00 €",bc:"#1a4fd6",bg:"#e8f0ff"},{id:"manual",icon:"✏️",title:"Manuell eingeben",sub:"Zahlen direkt eintragen",badge:"Kostenlos",bc:"#16a34a",bg:"#f0fdf4"}].map(({id,icon,title,sub,badge,bc,bg})=>(
              <button key={id} className="mode-tab" onClick={()=>{setMode(id);setReport("");setPaid(false);setStatus("");}}
                style={{background:mode===id?"#fff":"#f8fafc",border:mode===id?"2px solid #1a4fd6":"1.5px solid #e2e8f0",boxShadow:mode===id?"0 6px 24px rgba(26,79,214,0.14)":"none"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                  <span style={{fontSize:24}}>{icon}</span>
                  <span style={{background:bg,color:bc,fontSize:12,fontWeight:700,padding:"4px 12px",borderRadius:100,border:`1px solid ${bc}30`,fontFamily:"'Outfit',sans-serif"}}>{badge}</span>
                </div>
                <div style={{fontSize:15,fontWeight:700,color:"#0d1f3c",marginBottom:3,fontFamily:"'Outfit',sans-serif"}}>{title}</div>
                <div style={{fontSize:12,color:"#9aa5b4",fontFamily:"'Outfit',sans-serif"}}>{sub}</div>
              </button>
            ))}
          </div>

          {/* Upload Zone */}
          {isUpload&&(
            <div className="card">
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
                <div style={{fontSize:11,fontFamily:"monospace",letterSpacing:"0.1em",textTransform:"uppercase",color:"#b0bdd4"}}>BWA-Datei hochladen</div>
                <div style={{fontSize:12,color:"#1a4fd6",fontWeight:600,fontFamily:"'Outfit',sans-serif"}}>📄 Inkl. PDF-Download</div>
              </div>
              {!fileName?(
                <div onDragOver={e=>{e.preventDefault();setDragOver(true);}} onDragLeave={()=>setDragOver(false)} onDrop={onDrop} onClick={()=>fileRef.current.click()}
                  style={{border:`2px dashed ${dragOver?"#1a4fd6":"#c8d8f0"}`,borderRadius:14,padding:"44px 20px",textAlign:"center",cursor:"pointer",background:dragOver?"#f0f5ff":"#fafcff",transition:"all 0.2s"}}>
                  <div style={{fontSize:44,marginBottom:12}}>📊</div>
                  <div style={{fontSize:16,fontWeight:700,color:"#0d1f3c",marginBottom:5,fontFamily:"'Outfit',sans-serif"}}>BWA hier ablegen oder klicken</div>
                  <div style={{fontSize:13,color:"#7a8fa8",marginBottom:16,fontFamily:"'Outfit',sans-serif"}}>KI erkennt automatisch alle Kennzahlen</div>
                  <div style={{display:"flex",justifyContent:"center",gap:8}}>
                    {[["PDF","#dc2626"],["XLSX","#16a34a"],["XLS","#2563eb"],["CSV","#d97706"]].map(([f,c])=>(
                      <span key={f} style={{background:`${c}18`,border:`1px solid ${c}50`,borderRadius:7,padding:"4px 12px",fontSize:11,color:c,fontFamily:"monospace",fontWeight:700}}>{f}</span>
                    ))}
                  </div>
                  <input ref={fileRef} type="file" accept=".pdf,.xlsx,.xls,.csv" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0])}/>
                </div>
              ):(
                <div style={{display:"flex",alignItems:"center",gap:12,background:"#f0f7ff",border:"1.5px solid #c7d8fb",borderRadius:12,padding:"14px 18px"}}>
                  <span style={{fontSize:28}}>{fileName.endsWith(".pdf")?"📄":"📊"}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,fontWeight:700,color:"#1a4fd6",fontFamily:"'Outfit',sans-serif"}}>{fileName}</div>
                    <div style={{fontSize:12,color:"#6b7c99",marginTop:2,fontFamily:"'Outfit',sans-serif"}}>✓ {status}</div>
                  </div>
                  <button onClick={resetFile} style={{background:"none",border:"1.5px solid #c7d8fb",borderRadius:8,padding:"5px 12px",fontSize:12,color:"#6b7c99",cursor:"pointer",transition:"all 0.15s"}}>✕</button>
                </div>
              )}
            </div>
          )}

          {/* Upload Unternehmensdaten */}
          {isUpload&&(
            <div className="card">
              <div style={{fontSize:11,fontFamily:"monospace",letterSpacing:"0.1em",textTransform:"uppercase",color:"#b0bdd4",marginBottom:16}}>Unternehmensdaten</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div style={{display:"flex",flexDirection:"column",gap:5}}>
                  <label style={{fontSize:12,color:"#6b7c99",fontWeight:600,fontFamily:"'Outfit',sans-serif"}}>Unternehmensname</label>
                  <input style={inp} placeholder="z.B. Müller GmbH" value={form.company} onChange={e=>set("company",e.target.value)}/>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:5}}>
                  <label style={{fontSize:12,color:"#6b7c99",fontWeight:600,fontFamily:"'Outfit',sans-serif"}}>Berichtszeitraum</label>
                  <select style={inp} value={form.period} onChange={e=>set("period",e.target.value)}>{PERIODS.map(p=><option key={p}>{p}</option>)}</select>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:5,gridColumn:"1/-1"}}>
                  <label style={{fontSize:12,color:"#6b7c99",fontWeight:600,fontFamily:"'Outfit',sans-serif"}}>Branche</label>
                  <select style={inp} value={form.industry} onChange={e=>set("industry",e.target.value)}>{INDUSTRIES.map(i=><option key={i}>{i}</option>)}</select>
                </div>
              </div>
            </div>
          )}

          {/* Upload Kontext */}
          {isUpload&&(
            <div style={{background:"#fffbeb",border:"2px solid #fbbf24",borderRadius:16,padding:24,marginBottom:16,boxShadow:"0 4px 16px rgba(251,191,36,0.1)"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                <span style={{fontSize:18}}>⚠️</span>
                <div style={{fontSize:12,fontFamily:"'Outfit',sans-serif",letterSpacing:"0.08em",textTransform:"uppercase",color:"#92400e",fontWeight:700}}>Wichtig — Kontext angeben</div>
              </div>
              <p style={{fontSize:13,color:"#78350f",lineHeight:1.6,margin:"0 0 12px",fontFamily:"'Outfit',sans-serif"}}>
                Je mehr Kontext du angibst, desto präziser wird dein Report. Erwähne besondere Ereignisse, Veränderungen oder Ziele.
              </p>
              <textarea value={form.context} onChange={e=>set("context",e.target.value)} placeholder="z.B. Neukunde gewonnen (+80.000 € Jahresumsatz), Produktlaunch im März, 2 neue Mitarbeiter, Ziel: Bankgespräch vorbereiten..."
                style={{background:"#fff",border:"1.5px solid #fcd34d",borderRadius:10,padding:"12px 14px",color:"#0d1f3c",fontSize:14,outline:"none",width:"100%",fontFamily:"'Outfit',sans-serif",minHeight:90,resize:"vertical",lineHeight:1.6,boxSizing:"border-box"}}/>
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
                  <div style={{fontSize:13,fontWeight:700,color:"#16a34a",fontFamily:"'Outfit',sans-serif"}}>Kostenlos — keine Zahlung nötig</div>
                  <div style={{fontSize:12,color:"#4d7c5f",fontFamily:"'Outfit',sans-serif"}}>Report anzeigen & kopieren. PDF-Download nur im BWA-Upload verfügbar.</div>
                </div>
              </div>
              <div className="card">
                <div style={{fontSize:11,fontFamily:"monospace",letterSpacing:"0.1em",textTransform:"uppercase",color:"#b0bdd4",marginBottom:16}}>Unternehmensdaten</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  <div style={{display:"flex",flexDirection:"column",gap:5}}>
                    <label style={{fontSize:12,color:"#6b7c99",fontWeight:600,fontFamily:"'Outfit',sans-serif"}}>Unternehmensname</label>
                    <input style={inp} placeholder="z.B. Müller GmbH" value={form.company} onChange={e=>set("company",e.target.value)}/>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:5}}>
                    <label style={{fontSize:12,color:"#6b7c99",fontWeight:600,fontFamily:"'Outfit',sans-serif"}}>Berichtszeitraum</label>
                    <select style={inp} value={form.period} onChange={e=>set("period",e.target.value)}>{PERIODS.map(p=><option key={p}>{p}</option>)}</select>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:5,gridColumn:"1/-1"}}>
                    <label style={{fontSize:12,color:"#6b7c99",fontWeight:600,fontFamily:"'Outfit',sans-serif"}}>Branche</label>
                    <select style={inp} value={form.industry} onChange={e=>set("industry",e.target.value)}>{INDUSTRIES.map(i=><option key={i}>{i}</option>)}</select>
                  </div>
                </div>
              </div>
              <div className="card">
                <div style={{fontSize:11,fontFamily:"monospace",letterSpacing:"0.1em",textTransform:"uppercase",color:"#b0bdd4",marginBottom:16}}>Finanzkennzahlen</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
                  {[["Umsatz","revenue","€"],["Vorjahr","revenuePrev","€"],["Gewinn/EBIT","profit","€"],["Kosten","costs","€"],["Liquidität","liquidity","€"],["Mitarbeiter","employees","FTE"]].map(([label,key,unit])=>(
                    <div key={key} className="kpi-box">
                      <div style={{fontSize:10,fontFamily:"monospace",color:"#9aa5b4",letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:5}}>{label}</div>
                      <div style={{display:"flex",alignItems:"center",gap:4}}>
                        <input type="number" placeholder="0" value={form[key]} onChange={e=>set(key,e.target.value)} style={{background:"transparent",border:"none",color:"#0d1f3c",fontSize:16,fontWeight:700,fontFamily:"'Outfit',monospace",outline:"none",width:"100%"}}/>
                        <span style={{fontSize:12,color:"#9aa5b4",fontFamily:"monospace"}}>{unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card">
                <div style={{fontSize:11,fontFamily:"monospace",letterSpacing:"0.1em",textTransform:"uppercase",color:"#b0bdd4",marginBottom:12}}>Kontext (optional)</div>
                <textarea value={form.context} onChange={e=>set("context",e.target.value)} placeholder="z.B. Neukunde gewonnen, Produktlaunch, unerwartete Kosten..."
                  style={{...inp,minHeight:85,resize:"vertical",lineHeight:1.6}}/>
              </div>
            </>
          )}

          {/* Settings */}
          <div className="card">
            <div style={{fontSize:11,fontFamily:"monospace",letterSpacing:"0.1em",textTransform:"uppercase",color:"#b0bdd4",marginBottom:16}}>Report-Einstellungen</div>
            <div style={{display:"flex",flexDirection:"column",gap:16}}>
              <div>
                <label style={{fontSize:12,color:"#6b7c99",fontWeight:600,fontFamily:"'Outfit',sans-serif",display:"block",marginBottom:7}}>Berichtstyp</label>
                <select style={inp} value={reportType} onChange={e=>setReportType(e.target.value)}>{REPORT_TYPES.map(r=><option key={r}>{r}</option>)}</select>
              </div>
              <div>
                <label style={{fontSize:12,color:"#6b7c99",fontWeight:600,fontFamily:"'Outfit',sans-serif",display:"block",marginBottom:9}}>Ton des Berichts</label>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {TONES.map(t=>(
                    <button key={t.id} className="tone-btn" onClick={()=>setTone(t.id)}
                      style={{background:tone===t.id?"linear-gradient(135deg,#1a4fd6,#0a2d8a)":"#f8fafc",border:`1.5px solid ${tone===t.id?"#1a4fd6":"#e2e8f0"}`,color:tone===t.id?"#fff":"#4a5568",boxShadow:tone===t.id?"0 4px 14px rgba(26,79,214,0.25)":"none"}}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          {isUpload?(
            !report&&(
              <button className="btn-primary" onClick={handlePay} disabled={!fileData||paying||loading}
                style={{width:"100%",padding:"17px",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
                {paying||loading?<span>⏳ {loading?"Report wird generiert...":"Weiterleitung zu Stripe..."}</span>
                  :<><span>💳</span><span>19,00 € bezahlen & Report generieren</span><span style={{opacity:0.6,fontSize:12}}>· Stripe</span></>}
              </button>
            )
          ):(
            <button className="btn-success" onClick={()=>doGenerate({})} disabled={loading}
              style={{width:"100%",padding:"17px",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
              {loading?"⏳ Report wird generiert...":<><span>⚡</span><span>Report kostenlos generieren</span></>}
            </button>
          )}

          {status&&!loading&&(
            <div style={{background:"#f0f7ff",border:"1.5px solid #c7d8fb",borderRadius:10,padding:"11px 16px",marginTop:12,fontSize:13,color:"#1a4fd6",fontFamily:"'Outfit',sans-serif"}}>
              {status}
            </div>
          )}

          {/* Output */}
          {(loading||report)&&(
            <div className="output-card fade-in-up">
              <div style={{background:"linear-gradient(135deg,#0d1f3c,#1a3a7a)",padding:"14px 22px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{width:8,height:8,borderRadius:"50%",background:"#22c55e",display:"inline-block"}}></span>
                  <span style={{fontFamily:"monospace",fontSize:11,color:"#93b4f8",letterSpacing:"0.08em"}}>FINANZREPORT · KI-GENERIERT</span>
                </div>
                {report&&(
                  <div style={{display:"flex",gap:8}}>
                    <button className="copy-btn" onClick={()=>{navigator.clipboard.writeText(report);setCopied(true);setTimeout(()=>setCopied(false),2000);}}>
                      {copied?"✓ Kopiert!":"📋 Kopieren"}
                    </button>
                    {isUpload&&<button className="pdf-btn" onClick={()=>downloadPDF(report,form.company)}>⬇ PDF herunterladen</button>}
                  </div>
                )}
              </div>
              {loading&&<div style={{padding:"28px 26px",color:"#9aa5b4",fontSize:14,display:"flex",alignItems:"center",gap:10,fontFamily:"'Outfit',sans-serif"}}><span>⟳</span> KI analysiert und verfasst Report...</div>}
              {report&&(
                <>
                  <div style={{padding:"28px 32px 32px",fontSize:15,lineHeight:1.85,fontFamily:"Georgia,serif"}} dangerouslySetInnerHTML={{__html:renderMd(report)}}/>
                  {!isUpload&&(
                    <div style={{margin:"0 32px 28px",background:"#f8fafc",border:"1.5px dashed #c7d8fb",borderRadius:12,padding:"14px 18px",display:"flex",alignItems:"center",gap:12}}>
                      <span style={{fontSize:22}}>📄</span>
                      <div>
                        <div style={{fontSize:13,fontWeight:700,color:"#1a4fd6",fontFamily:"'Outfit',sans-serif",marginBottom:2}}>PDF-Download verfügbar</div>
                        <div style={{fontSize:12,color:"#6b7c99",fontFamily:"'Outfit',sans-serif"}}>Lade deine BWA hoch (19,00 €) um den Report als PDF herunterzuladen.</div>
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
        <div style={{borderTop:"1px solid #e2e8f0",background:"#fff",padding:"28px 32px",textAlign:"center"}}>
          <p style={{fontSize:12,color:"#9aa5b4",fontFamily:"'Outfit',sans-serif",margin:"0 0 10px"}}>© 2026 Sergej Nikoleisen · BWA-Generator</p>
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

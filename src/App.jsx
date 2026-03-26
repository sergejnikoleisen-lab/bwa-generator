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
  body { font-family: 'Inter', system-ui, sans-serif; background: #0f0b1a; color: #e2e8f0; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #1a1428; }
  ::-webkit-scrollbar-thumb { background: #6d28d9; border-radius: 3px; }

  .glass {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 20px;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    transition: border-color 0.3s, box-shadow 0.3s, transform 0.3s;
  }
  .glass:hover {
    border-color: rgba(167,139,250,0.35);
    box-shadow: 0 8px 40px rgba(109,40,217,0.2), inset 0 1px 0 rgba(255,255,255,0.08);
  }

  .btn-primary {
    position: relative; overflow: hidden;
    background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #4c1d95 100%);
    color: #fff; border: none; border-radius: 14px;
    font-family: 'Inter', sans-serif; font-weight: 700; font-size: 15px;
    cursor: pointer; letter-spacing: -0.01em;
    transition: transform 0.25s cubic-bezier(.34,1.56,.64,1), box-shadow 0.25s ease;
    box-shadow: 0 4px 20px rgba(124,58,237,0.4), inset 0 1px 0 rgba(255,255,255,0.15);
  }
  .btn-primary::before {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 60%);
    opacity: 0; transition: opacity 0.25s;
  }
  .btn-primary:hover:not(:disabled) {
    transform: translateY(-3px) scale(1.015);
    box-shadow: 0 16px 48px rgba(124,58,237,0.5), inset 0 1px 0 rgba(255,255,255,0.2);
  }
  .btn-primary:hover:not(:disabled)::before { opacity: 1; }
  .btn-primary:active:not(:disabled) { transform: translateY(-1px) scale(0.99); }
  .btn-primary:disabled { background: #1a1428; color: #4a5568; box-shadow: none; cursor: not-allowed; }

  .btn-success {
    position: relative; overflow: hidden;
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%);
    color: #fff; border: none; border-radius: 14px;
    font-family: 'Inter', sans-serif; font-weight: 700; font-size: 15px;
    cursor: pointer; letter-spacing: -0.01em;
    transition: transform 0.25s cubic-bezier(.34,1.56,.64,1), box-shadow 0.25s ease;
    box-shadow: 0 4px 20px rgba(22,163,74,0.4), inset 0 1px 0 rgba(255,255,255,0.15);
  }
  .btn-success::before {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 60%);
    opacity: 0; transition: opacity 0.25s;
  }
  .btn-success:hover:not(:disabled) {
    transform: translateY(-3px) scale(1.015);
    box-shadow: 0 16px 48px rgba(22,163,74,0.5), inset 0 1px 0 rgba(255,255,255,0.2);
  }
  .btn-success:hover:not(:disabled)::before { opacity: 1; }
  .btn-success:active:not(:disabled) { transform: translateY(-1px) scale(0.99); }
  .btn-success:disabled { background: #1a1428; color: #4a5568; box-shadow: none; cursor: not-allowed; }

  .mode-tab {
    position: relative; overflow: hidden;
    border-radius: 18px; padding: 20px 18px; cursor: pointer; text-align: left;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    transition: transform 0.3s cubic-bezier(.34,1.56,.64,1), box-shadow 0.3s, border-color 0.3s, background 0.3s;
  }
  .mode-tab::before {
    content: ''; position: absolute; inset: 0; border-radius: 18px;
    background: linear-gradient(135deg, rgba(124,58,237,0.12), transparent);
    opacity: 0; transition: opacity 0.3s;
  }
  .mode-tab:hover { transform: translateY(-5px) scale(1.01); box-shadow: 0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(167,139,250,0.3); border-color: rgba(167,139,250,0.3); }
  .mode-tab:hover::before { opacity: 1; }
  .mode-tab-active { background: rgba(124,58,237,0.12); border: 1.5px solid rgba(99,137,255,0.5); box-shadow: 0 8px 32px rgba(124,58,237,0.2), inset 0 1px 0 rgba(255,255,255,0.08); }

  .tone-btn {
    border-radius: 10px; padding: 9px 18px; font-size: 13px;
    cursor: pointer; font-family: 'Inter', sans-serif; font-weight: 500;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.04); color: #94a3b8;
    transition: transform 0.2s cubic-bezier(.34,1.56,.64,1), box-shadow 0.2s, background 0.2s, color 0.2s, border-color 0.2s;
  }
  .tone-btn:hover { transform: translateY(-2px) scale(1.05); box-shadow: 0 8px 24px rgba(124,58,237,0.25); border-color: rgba(167,139,250,0.4); color: #fff; }
  .tone-btn-active { background: linear-gradient(135deg,#7c3aed,#6d28d9) !important; color: #fff !important; border-color: transparent !important; box-shadow: 0 4px 16px rgba(124,58,237,0.4) !important; }

  .kpi-box {
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 14px; padding: 14px;
    transition: all 0.25s cubic-bezier(.34,1.56,.64,1);
  }
  .kpi-box:hover, .kpi-box:focus-within { border-color: rgba(167,139,250,0.45); background: rgba(124,58,237,0.12); box-shadow: 0 8px 24px rgba(124,58,237,0.2); transform: translateY(-2px); }

  .output-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.09); border-radius: 20px; overflow: hidden; margin-top: 20px; box-shadow: 0 8px 40px rgba(0,0,0,0.4); animation: fadeInUp 0.45s cubic-bezier(.34,1.56,.64,1) forwards; }

  .copy-btn { background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.15); border-radius: 9px; padding: 6px 14px; font-size: 12px; color: #cbd5e1; cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.2s cubic-bezier(.34,1.56,.64,1); }
  .copy-btn:hover { background: rgba(255,255,255,0.14); transform: translateY(-2px); color: #fff; }

  .pdf-btn { background: rgba(124,58,237,0.2); border: 1px solid rgba(167,139,250,0.35); border-radius: 9px; padding: 6px 14px; font-size: 12px; color: #ddd6fe; cursor: pointer; font-family: 'Inter', sans-serif; font-weight: 700; transition: all 0.2s cubic-bezier(.34,1.56,.64,1); }
  .pdf-btn:hover { background: rgba(124,58,237,0.4); transform: translateY(-2px); box-shadow: 0 8px 20px rgba(124,58,237,0.35); }

  .tag-btn { background: rgba(251,191,36,0.1); border: 1px solid rgba(251,191,36,0.3); border-radius: 100px; padding: 5px 14px; font-size: 12px; color: #fbbf24; cursor: pointer; font-family: 'Inter', sans-serif; font-weight: 600; transition: all 0.2s cubic-bezier(.34,1.56,.64,1); }
  .tag-btn:hover { background: rgba(251,191,36,0.2); transform: translateY(-2px) scale(1.06); box-shadow: 0 6px 16px rgba(251,191,36,0.25); }

  .footer-link { color: #9d7fea; text-decoration: none; font-weight: 500; font-size: 13px; transition: all 0.2s; display: inline-block; font-family: 'Inter', sans-serif; padding-bottom: 1px; border-bottom: 1px solid transparent; }
  .footer-link:hover { color: #ddd6fe; border-bottom-color: #ddd6fe; transform: translateY(-1px); }

  .upsell-btn { background: linear-gradient(135deg,#7c3aed,#6d28d9); border: none; border-radius: 10px; padding: 9px 18px; font-size: 12px; color: #fff; cursor: pointer; font-family: 'Inter', sans-serif; font-weight: 700; white-space: nowrap; transition: all 0.25s cubic-bezier(.34,1.56,.64,1); box-shadow: 0 4px 14px rgba(124,58,237,0.35); }
  .upsell-btn:hover { transform: translateY(-2px) scale(1.05); box-shadow: 0 10px 28px rgba(124,58,237,0.45); }

  select, input, textarea { font-family: 'Inter', sans-serif !important; background: rgba(255,255,255,0.04) !important; color: #e2e8f0 !important; border: 1px solid rgba(255,255,255,0.1) !important; border-radius: 10px !important; transition: border-color 0.2s, box-shadow 0.2s, background 0.2s !important; }
  select option { background: #1a1428; color: #e2e8f0; }
  select:focus, input:focus, textarea:focus { outline: none !important; border-color: rgba(167,139,250,0.6) !important; box-shadow: 0 0 0 3px rgba(124,58,237,0.15) !important; background: rgba(124,58,237,0.08) !important; }
  input::placeholder, textarea::placeholder { color: #4a5568 !important; }

  .drag-zone { border: 2px dashed rgba(167,139,250,0.3); border-radius: 16px; padding: 48px 20px; text-align: center; cursor: pointer; background: rgba(37,99,235,0.03); transition: all 0.25s ease; }
  .drag-zone:hover, .drag-zone-active { border-color: rgba(167,139,250,0.6); background: rgba(124,58,237,0.1); box-shadow: inset 0 0 40px rgba(124,58,237,0.07); }

  .orb { position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0; }

  @keyframes fadeInUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
  .fade-in-up { animation: fadeInUp 0.45s cubic-bezier(.34,1.56,.64,1) forwards; }
  @keyframes pulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.75); } }
  .pulse { animation: pulse 2s infinite; }
  @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
  .shimmer-text { background: linear-gradient(90deg, #ddd6fe 0%, #fff 40%, #ddd6fe 60%, #c4b5fd 100%); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: shimmer 4s linear infinite; }
  @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
`;

function renderMd(text) {
  return text
    .replace(/^### (.+)$/gm, '<h3 style="font-size:12px;font-weight:700;margin:22px 0 8px;color:#6699ff;text-transform:uppercase;letter-spacing:0.1em;font-family:Inter,sans-serif">$1</h3>')
    .replace(/^## (.+)$/gm,  '<h2 style="font-size:18px;font-weight:700;margin:28px 0 12px;color:#e2e8f0;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:10px;font-family:Inter,sans-serif">$1</h2>')
    .replace(/^# (.+)$/gm,   '<h1 style="font-size:24px;font-weight:800;margin:0 0 18px;color:#fff;font-family:Inter,sans-serif;letter-spacing:-0.03em">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#c4b5fd;font-weight:700">$1</strong>')
    .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:24px 0"/>')
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
  doc.setFillColor(6,9,18); doc.rect(0,0,pageW,18,'F');
  doc.setTextColor(255,255,255); doc.setFontSize(10); doc.setFont('helvetica','bold');
  doc.text('BWA-Generator · Finanzreport', margin, 12);
  doc.setFont('helvetica','normal'); doc.setFontSize(8);
  doc.text('bwa-generator.de', pageW-margin, 12, {align:'right'});
  y = 30;
  for (const line of text.split('\n')) {
    if (y > pageH-25) { doc.addPage(); doc.setFillColor(6,9,18); doc.rect(0,0,pageW,18,'F'); y=30; }
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

  const inp={background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,padding:"11px 14px",color:"#e2e8f0",fontSize:14,outline:"none",width:"100%",fontFamily:"'Inter',sans-serif",boxSizing:"border-box"};
  const isUpload=mode==="upload";

  return(
    <>
      <style>{CSS}</style>
      <div style={{background:"#0f0b1a",minHeight:"100vh",position:"relative",overflow:"hidden"}}>

        <div className="orb" style={{width:600,height:600,background:"radial-gradient(circle,rgba(124,58,237,0.12),transparent 70%)",top:-200,left:-100}}/>
        <div className="orb" style={{width:500,height:500,background:"radial-gradient(circle,rgba(109,40,217,0.1),transparent 70%)",top:200,right:-150}}/>
        <div className="orb" style={{width:400,height:400,background:"radial-gradient(circle,rgba(124,58,237,0.07),transparent 70%)",bottom:100,left:"30%"}}/>

        <CookieBanner/>

        <nav style={{background:"rgba(15,11,26,0.85)",borderBottom:"1px solid rgba(255,255,255,0.07)",padding:"0 32px",display:"flex",alignItems:"center",justifyContent:"space-between",height:62,position:"sticky",top:0,zIndex:100,backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,position:"relative",zIndex:1}}>
            <div style={{width:36,height:36,background:"linear-gradient(135deg,#7c3aed,#6d28d9)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:17,fontWeight:800,boxShadow:"0 4px 16px rgba(124,58,237,0.45)"}}>B</div>
            <span style={{fontFamily:"'Inter',sans-serif",fontWeight:800,fontSize:17,color:"#fff",letterSpacing:"-0.04em"}}>BWA<span style={{color:"#a78bfa"}}>-</span>Generator</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:20,position:"relative",zIndex:1}}>
            <div style={{fontSize:13,color:"#64748b",fontFamily:"'Inter',sans-serif"}}>
              Manuell: <strong style={{color:"#4ade80"}}>Kostenlos</strong>
              <span style={{margin:"0 10px",color:"#1a1428"}}>·</span>
              Upload: <strong style={{color:"#c4b5fd"}}>19,00 €</strong>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6,background:"rgba(124,58,237,0.12)",border:"1px solid rgba(167,139,250,0.3)",borderRadius:100,padding:"5px 14px"}}>
              <span className="pulse" style={{width:6,height:6,background:"#a78bfa",borderRadius:"50%",display:"inline-block"}}></span>
              <span style={{fontSize:11,color:"#c4b5fd",fontFamily:"monospace",letterSpacing:"0.08em",fontWeight:600}}>KI AKTIV</span>
            </div>
          </div>
        </nav>

        <div style={{padding:"72px 20px 64px",textAlign:"center",position:"relative",zIndex:1}}>
          <div style={{position:"relative",zIndex:1,maxWidth:700,margin:"0 auto"}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(124,58,237,0.12)",border:"1px solid rgba(167,139,250,0.3)",borderRadius:100,padding:"7px 18px",fontSize:11,color:"#ddd6fe",letterSpacing:"0.12em",textTransform:"uppercase",fontFamily:"monospace",marginBottom:28}}>
              <span style={{width:5,height:5,background:"#a78bfa",borderRadius:"50%",display:"inline-block"}}></span>
              Powered by Claude AI
            </div>
            <h1 style={{fontFamily:"'Inter',sans-serif",fontSize:"clamp(32px,5.5vw,58px)",fontWeight:900,color:"#fff",margin:"0 0 8px",letterSpacing:"-0.05em",lineHeight:1.0}}>Professionelle</h1>
            <h1 style={{fontFamily:"'Inter',sans-serif",fontSize:"clamp(32px,5.5vw,58px)",fontWeight:900,margin:"0 0 24px",letterSpacing:"-0.05em",lineHeight:1.0}}>
              <span className="shimmer-text">Finanzreports in Sekunden</span>
            </h1>
            <p style={{fontFamily:"'Inter',sans-serif",fontSize:16,color:"#64748b",margin:"0 auto 28px",lineHeight:1.8,fontWeight:400,maxWidth:520}}>
              Die Auswertung einer BWA kostet oft <span style={{color:"#fbbf24",fontWeight:600}}>Stunden wertvoller Zeit</span>. Unser KI-Tool analysiert deine BWA in Sekunden und erstellt einen professionellen Report mit Handlungsempfehlungen.
            </p>
            <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,padding:"13px 24px",marginBottom:32,display:"inline-block",backdropFilter:"blur(10px)"}}>
              <span style={{fontSize:13,color:"#94a3b8",fontFamily:"'Inter',sans-serif"}}>
                💼 Perfekt für <strong style={{color:"#e2e8f0"}}>Steuerberater</strong>, <strong style={{color:"#e2e8f0"}}>Buchhalter</strong> & <strong style={{color:"#e2e8f0"}}>Unternehmer</strong>
              </span>
            </div>
            <div style={{display:"flex",justifyContent:"center",gap:24,flexWrap:"wrap"}}>
              {[["✓","BWA Upload mit PDF-Download","#c4b5fd"],["✓","Manuelle Eingabe kostenlos","#4ade80"],["✓","5 Berichtstypen & Töne","#a78bfa"],["✓","Ergebnis in unter 30 Sekunden","#fb923c"]].map(([icon,text,color])=>(
                <div key={text} style={{display:"flex",alignItems:"center",gap:7,fontSize:13,fontFamily:"'Inter',sans-serif",fontWeight:500}}>
                  <span style={{fontWeight:800,color}}>{icon}</span><span style={{color:"#94a3b8"}}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{maxWidth:800,margin:"0 auto",padding:"0 16px 80px",position:"relative",zIndex:1}}>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:20}}>
            {[
              {id:"upload",icon:"📂",title:"BWA hochladen",sub:"PDF, Excel, CSV",badge:"19,00 €",badgeColor:"#c4b5fd",badgeBg:"rgba(124,58,237,0.15)"},
              {id:"manual",icon:"✏️",title:"Manuell eingeben",sub:"Zahlen direkt eintragen",badge:"Kostenlos",badgeColor:"#4ade80",badgeBg:"rgba(34,197,94,0.12)"}
            ].map(({id,icon,title,sub,badge,badgeColor,badgeBg})=>(
              <button key={id} className={`mode-tab ${mode===id?"mode-tab-active":""}`}
                onClick={()=>{setMode(id);setReport("");setPaid(false);setStatus("");}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10,position:"relative",zIndex:1}}>
                  <span style={{fontSize:26}}>{icon}</span>
                  <span style={{background:badgeBg,color:badgeColor,fontSize:12,fontWeight:700,padding:"4px 13px",borderRadius:100,fontFamily:"'Inter',sans-serif"}}>{badge}</span>
                </div>
                <div style={{fontSize:15,fontWeight:700,color:"#e2e8f0",marginBottom:3,fontFamily:"'Inter',sans-serif",position:"relative",zIndex:1}}>{title}</div>
                <div style={{fontSize:12,color:"#475569",fontFamily:"'Inter',sans-serif",position:"relative",zIndex:1}}>{sub}</div>
              </button>
            ))}
          </div>

          {isUpload&&(
            <div className="glass" style={{padding:24,marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
                <div style={{fontSize:11,fontFamily:"monospace",letterSpacing:"0.1em",textTransform:"uppercase",color:"#475569"}}>BWA-Datei hochladen</div>
                <div style={{fontSize:12,color:"#c4b5fd",fontWeight:600,fontFamily:"'Inter',sans-serif"}}>📄 Inkl. PDF-Download nach Zahlung</div>
              </div>
              {!fileName?(
                <div className={`drag-zone ${dragOver?"drag-zone-active":""}`}
                  onDragOver={e=>{e.preventDefault();setDragOver(true);}} onDragLeave={()=>setDragOver(false)} onDrop={onDrop} onClick={()=>fileRef.current.click()}>
                  <div style={{fontSize:48,marginBottom:14,display:"inline-block",animation:"float 3s ease-in-out infinite"}}>📊</div>
                  <div style={{fontSize:16,fontWeight:700,color:"#e2e8f0",marginBottom:6,fontFamily:"'Inter',sans-serif"}}>BWA hier ablegen oder klicken</div>
                  <div style={{fontSize:13,color:"#475569",marginBottom:18,fontFamily:"'Inter',sans-serif"}}>KI erkennt automatisch alle Kennzahlen</div>
                  <div style={{display:"flex",justifyContent:"center",gap:8}}>
                    {[["PDF","#f87171"],["XLSX","#4ade80"],["XLS","#c4b5fd"],["CSV","#fb923c"]].map(([f,c])=>(
                      <span key={f} style={{background:`${c}15`,border:`1px solid ${c}40`,borderRadius:8,padding:"5px 13px",fontSize:11,color:c,fontFamily:"monospace",fontWeight:700}}>{f}</span>
                    ))}
                  </div>
                  <input ref={fileRef} type="file" accept=".pdf,.xlsx,.xls,.csv" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0])}/>
                </div>
              ):(
                <div style={{display:"flex",alignItems:"center",gap:12,background:"rgba(124,58,237,0.12)",border:"1px solid rgba(167,139,250,0.3)",borderRadius:14,padding:"14px 18px"}}>
                  <span style={{fontSize:28}}>{fileName.endsWith(".pdf")?"📄":"📊"}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,fontWeight:700,color:"#c4b5fd",fontFamily:"'Inter',sans-serif"}}>{fileName}</div>
                    <div style={{fontSize:12,color:"#475569",marginTop:3,fontFamily:"'Inter',sans-serif"}}>✓ {status}</div>
                  </div>
                  <button onClick={resetFile} style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"6px 13px",fontSize:12,color:"#64748b",cursor:"pointer",fontFamily:"'Inter',sans-serif"}}>✕</button>
                </div>
              )}
            </div>
          )}

          {isUpload&&(
            <div className="glass" style={{padding:24,marginBottom:16}}>
              <div style={{fontSize:11,fontFamily:"monospace",letterSpacing:"0.1em",textTransform:"uppercase",color:"#475569",marginBottom:18}}>Unternehmensdaten</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  <label style={{fontSize:12,color:"#64748b",fontWeight:600,fontFamily:"'Inter',sans-serif"}}>Unternehmensname</label>
                  <input style={inp} placeholder="z.B. Müller GmbH" value={form.company} onChange={e=>set("company",e.target.value)}/>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  <label style={{fontSize:12,color:"#64748b",fontWeight:600,fontFamily:"'Inter',sans-serif"}}>Berichtszeitraum</label>
                  <select style={inp} value={form.period} onChange={e=>set("period",e.target.value)}>{PERIODS.map(p=><option key={p}>{p}</option>)}</select>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:6,gridColumn:"1/-1"}}>
                  <label style={{fontSize:12,color:"#64748b",fontWeight:600,fontFamily:"'Inter',sans-serif"}}>Branche</label>
                  <select style={inp} value={form.industry} onChange={e=>set("industry",e.target.value)}>{INDUSTRIES.map(i=><option key={i}>{i}</option>)}</select>
                </div>
              </div>
            </div>
          )}

          {isUpload&&(
            <div style={{background:"rgba(251,191,36,0.06)",border:"1px solid rgba(251,191,36,0.2)",borderRadius:20,padding:24,marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:12}}>
                <span style={{fontSize:18}}>⚡</span>
                <div style={{fontSize:12,fontFamily:"'Inter',sans-serif",letterSpacing:"0.08em",textTransform:"uppercase",color:"#fbbf24",fontWeight:700}}>Kontext angeben — für präzisere Reports</div>
              </div>
              <p style={{fontSize:13,color:"#a16207",lineHeight:1.6,margin:"0 0 12px",fontFamily:"'Inter',sans-serif"}}>Je mehr Kontext du angibst, desto präziser wird dein Report.</p>
              <textarea value={form.context} onChange={e=>set("context",e.target.value)}
                placeholder="z.B. Neukunde gewonnen (+80.000 € Jahresumsatz), Produktlaunch im März, 2 neue Mitarbeiter, Ziel: Bankgespräch..."
                style={{...inp,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(251,191,36,0.2)",minHeight:90,resize:"vertical",lineHeight:1.6}}/>
              <div style={{display:"flex",gap:8,marginTop:12,flexWrap:"wrap"}}>
                {["Neukunde gewonnen","Produktlaunch","Personalaufbau","Investitionen","Marktveränderung","Bankgespräch"].map(tag=>(
                  <button key={tag} className="tag-btn" onClick={()=>set("context",form.context?form.context+", "+tag:tag)}>+ {tag}</button>
                ))}
              </div>
            </div>
          )}

          {!isUpload&&(
            <>
              <div style={{background:"rgba(34,197,94,0.07)",border:"1px solid rgba(74,222,128,0.2)",borderRadius:16,padding:"14px 20px",marginBottom:14,display:"flex",alignItems:"center",gap:12}}>
                <span style={{fontSize:20}}>🎁</span>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:"#4ade80",fontFamily:"'Inter',sans-serif"}}>Kostenlos — keine Zahlung nötig</div>
                  <div style={{fontSize:12,color:"#475569",fontFamily:"'Inter',sans-serif"}}>Report anzeigen & kopieren. PDF nur im BWA-Upload verfügbar.</div>
                </div>
              </div>
              <div className="glass" style={{padding:24,marginBottom:16}}>
                <div style={{fontSize:11,fontFamily:"monospace",letterSpacing:"0.1em",textTransform:"uppercase",color:"#475569",marginBottom:18}}>Unternehmensdaten</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  <div style={{display:"flex",flexDirection:"column",gap:6}}>
                    <label style={{fontSize:12,color:"#64748b",fontWeight:600,fontFamily:"'Inter',sans-serif"}}>Unternehmensname</label>
                    <input style={inp} placeholder="z.B. Müller GmbH" value={form.company} onChange={e=>set("company",e.target.value)}/>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:6}}>
                    <label style={{fontSize:12,color:"#64748b",fontWeight:600,fontFamily:"'Inter',sans-serif"}}>Berichtszeitraum</label>
                    <select style={inp} value={form.period} onChange={e=>set("period",e.target.value)}>{PERIODS.map(p=><option key={p}>{p}</option>)}</select>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:6,gridColumn:"1/-1"}}>
                    <label style={{fontSize:12,color:"#64748b",fontWeight:600,fontFamily:"'Inter',sans-serif"}}>Branche</label>
                    <select style={inp} value={form.industry} onChange={e=>set("industry",e.target.value)}>{INDUSTRIES.map(i=><option key={i}>{i}</option>)}</select>
                  </div>
                </div>
              </div>
              <div className="glass" style={{padding:24,marginBottom:16}}>
                <div style={{fontSize:11,fontFamily:"monospace",letterSpacing:"0.1em",textTransform:"uppercase",color:"#475569",marginBottom:18}}>Finanzkennzahlen</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
                  {[["Umsatz","revenue","€"],["Vorjahr","revenuePrev","€"],["Gewinn/EBIT","profit","€"],["Kosten","costs","€"],["Liquidität","liquidity","€"],["Mitarbeiter","employees","FTE"]].map(([label,key,unit])=>(
                    <div key={key} className="kpi-box">
                      <div style={{fontSize:10,fontFamily:"monospace",color:"#475569",letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:6}}>{label}</div>
                      <div style={{display:"flex",alignItems:"center",gap:4}}>
                        <input type="number" placeholder="0" value={form[key]} onChange={e=>set(key,e.target.value)}
                          style={{background:"transparent",border:"none",color:"#e2e8f0",fontSize:17,fontWeight:700,fontFamily:"'Inter',sans-serif",outline:"none",width:"100%",boxShadow:"none"}}/>
                        <span style={{fontSize:12,color:"#475569",fontFamily:"monospace"}}>{unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="glass" style={{padding:24,marginBottom:16}}>
                <div style={{fontSize:11,fontFamily:"monospace",letterSpacing:"0.1em",textTransform:"uppercase",color:"#475569",marginBottom:14}}>Kontext (optional)</div>
                <textarea value={form.context} onChange={e=>set("context",e.target.value)} placeholder="z.B. Neukunde gewonnen, Produktlaunch, unerwartete Kosten..."
                  style={{...inp,minHeight:85,resize:"vertical",lineHeight:1.6}}/>
              </div>
            </>
          )}

          <div className="glass" style={{padding:24,marginBottom:16}}>
            <div style={{fontSize:11,fontFamily:"monospace",letterSpacing:"0.1em",textTransform:"uppercase",color:"#475569",marginBottom:18}}>Report-Einstellungen</div>
            <div style={{display:"flex",flexDirection:"column",gap:18}}>
              <div>
                <label style={{fontSize:12,color:"#64748b",fontWeight:600,fontFamily:"'Inter',sans-serif",display:"block",marginBottom:8}}>Berichtstyp</label>
                <select style={inp} value={reportType} onChange={e=>setReportType(e.target.value)}>{REPORT_TYPES.map(r=><option key={r}>{r}</option>)}</select>
              </div>
              <div>
                <label style={{fontSize:12,color:"#64748b",fontWeight:600,fontFamily:"'Inter',sans-serif",display:"block",marginBottom:10}}>Ton des Berichts</label>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {TONES.map(t=>(
                    <button key={t.id} className={`tone-btn ${tone===t.id?"tone-btn-active":""}`} onClick={()=>setTone(t.id)}>{t.label}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{marginTop:20}}>
            {isUpload?(
              !report&&(
                <button className="btn-primary" onClick={handlePay} disabled={!fileData||paying||loading}
                  style={{width:"100%",padding:"18px",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",gap:12}}>
                  {paying||loading
                    ?<span style={{fontFamily:"'Inter',sans-serif"}}>⏳ {loading?"Report wird generiert...":"Weiterleitung zu Stripe..."}</span>
                    :<><span>💳</span><span style={{fontFamily:"'Inter',sans-serif"}}>19,00 € bezahlen & Report generieren</span><span style={{opacity:0.5,fontSize:12}}>· Stripe</span></>}
                </button>
              )
            ):(
              <button className="btn-success" onClick={()=>doGenerate({})} disabled={loading}
                style={{width:"100%",padding:"18px",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",gap:12}}>
                {loading?<span>⏳ Report wird generiert...</span>:<><span>⚡</span><span style={{fontFamily:"'Inter',sans-serif"}}>Report kostenlos generieren</span></>}
              </button>
            )}
          </div>

          {status&&!loading&&(
            <div style={{background:"rgba(124,58,237,0.12)",border:"1px solid rgba(167,139,250,0.3)",borderRadius:12,padding:"12px 18px",marginTop:12,fontSize:13,color:"#c4b5fd",fontFamily:"'Inter',sans-serif"}}>{status}</div>
          )}

          {(loading||report)&&(
            <div className="output-card">
              <div style={{background:"rgba(255,255,255,0.03)",borderBottom:"1px solid rgba(255,255,255,0.07)",padding:"14px 22px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{width:8,height:8,borderRadius:"50%",background:"#22c55e",display:"inline-block",boxShadow:"0 0 8px rgba(34,197,94,0.6)"}}></span>
                  <span style={{fontFamily:"monospace",fontSize:11,color:"#475569",letterSpacing:"0.1em"}}>FINANZREPORT · KI-GENERIERT</span>
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
                <div style={{padding:"32px 28px",color:"#475569",fontSize:14,display:"flex",alignItems:"center",gap:12,fontFamily:"'Inter',sans-serif"}}>
                  <span className="pulse" style={{width:8,height:8,background:"#a78bfa",borderRadius:"50%",display:"inline-block"}}></span>
                  KI analysiert und verfasst Report...
                </div>
              )}
              {report&&(
                <>
                  <div style={{padding:"32px 36px 36px",fontSize:15,lineHeight:1.9,fontFamily:"Georgia,serif",color:"#cbd5e1"}} dangerouslySetInnerHTML={{__html:renderMd(report)}}/>
                  {!isUpload&&(
                    <div style={{margin:"0 32px 28px",background:"rgba(124,58,237,0.1)",border:"1px dashed rgba(167,139,250,0.3)",borderRadius:14,padding:"16px 20px",display:"flex",alignItems:"center",gap:14}}>
                      <span style={{fontSize:22}}>📄</span>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,fontWeight:700,color:"#c4b5fd",fontFamily:"'Inter',sans-serif",marginBottom:2}}>PDF-Download verfügbar</div>
                        <div style={{fontSize:12,color:"#475569",fontFamily:"'Inter',sans-serif"}}>Lade deine BWA hoch (19,00 €) um den Report als PDF herunterzuladen.</div>
                      </div>
                      <button className="upsell-btn" onClick={()=>{setMode("upload");setReport("");}}>BWA hochladen →</button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <div style={{borderTop:"1px solid rgba(255,255,255,0.06)",background:"rgba(15,11,26,0.8)",padding:"28px 32px",textAlign:"center",position:"relative",zIndex:1,backdropFilter:"blur(20px)"}}>
          <p style={{fontSize:12,color:"#334155",fontFamily:"'Inter',sans-serif",margin:"0 0 12px"}}>© 2026 Sergej Nikoleisen · BWA-Generator</p>
          <div style={{display:"flex",justifyContent:"center",gap:28,flexWrap:"wrap"}}>
            <a href="/impressum" className="footer-link">Impressum</a>
            <a href="/datenschutz" className="footer-link">Datenschutz</a>
            <a href="/agb" className="footer-link">AGB</a>
          </div>
        </div>
      </div>
    </>
  );
}

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

function renderMd(text) {
  return text
    .replace(/^### (.+)$/gm, '<h3 style="font-size:13px;font-weight:700;margin:20px 0 6px;color:#1e3a6e;text-transform:uppercase;letter-spacing:0.07em;font-family:system-ui,sans-serif">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="font-size:17px;font-weight:700;margin:26px 0 10px;color:#0d1f3c;border-bottom:2px solid #dde8f8;padding-bottom:8px;font-family:system-ui,sans-serif">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="font-size:22px;font-weight:800;margin:0 0 16px;color:#0d1f3c;font-family:system-ui,sans-serif">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#1a4fd6;font-weight:700">$1</strong>')
    .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0"/>')
    .replace(/\n\n/g, "<br/><br/>")
    .replace(/\n/g, "<br/>");
}

function fmt(n) {
  if (!n) return "";
  return Number(n).toLocaleString("de-DE");
}

async function downloadPDF(text, company) {
  const { jsPDF } = await import('https://esm.sh/jspdf@2.5.1');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxW = pageW - margin * 2;
  let y = margin;

  doc.setFillColor(13, 31, 60);
  doc.rect(0, 0, pageW, 18, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('BWA-Generator · Finanzreport', margin, 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('bwa-generator.de', pageW - margin, 12, { align: 'right' });
  y = 30;

  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (y > pageH - 25) { doc.addPage(); doc.setFillColor(13, 31, 60); doc.rect(0, 0, pageW, 18, 'F'); y = 30; }
    if (line.startsWith('# ')) {
      doc.setFontSize(18); doc.setFont('helvetica', 'bold'); doc.setTextColor(13, 31, 60);
      const w = doc.splitTextToSize(line.replace(/^# /, ''), maxW);
      doc.text(w, margin, y); y += w.length * 9 + 4;
    } else if (line.startsWith('## ')) {
      if (y > 30) { doc.setDrawColor(221, 232, 248); doc.setLineWidth(0.5); doc.line(margin, y, pageW - margin, y); y += 5; }
      doc.setFontSize(13); doc.setFont('helvetica', 'bold'); doc.setTextColor(26, 79, 214);
      const w = doc.splitTextToSize(line.replace(/^## /, ''), maxW);
      doc.text(w, margin, y); y += w.length * 7 + 3;
    } else if (line.startsWith('### ')) {
      doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(30, 59, 110);
      const w = doc.splitTextToSize(line.replace(/^### /, ''), maxW);
      doc.text(w, margin, y); y += w.length * 6 + 2;
    } else if (line.startsWith('---')) {
      doc.setDrawColor(200, 210, 230); doc.setLineWidth(0.3); doc.line(margin, y, pageW - margin, y); y += 5;
    } else if (line.trim() === '') {
      y += 3;
    } else {
      const clean = line.replace(/\*\*(.+?)\*\*/g, '$1').replace(/^- /, '• ');
      doc.setFontSize(10); doc.setFont('helvetica', 'normal'); doc.setTextColor(55, 65, 81);
      const w = doc.splitTextToSize(clean, maxW);
      doc.text(w, margin, y); y += w.length * 5.5 + 1;
    }
  }

  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFillColor(248, 250, 252); doc.rect(0, pageH - 12, pageW, 12, 'F');
    doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(154, 165, 180);
    doc.text('© 2026 BWA-Generator · bwa-generator.de', margin, pageH - 5);
    doc.text(`Seite ${p} von ${totalPages}`, pageW - margin, pageH - 5, { align: 'right' });
  }
  doc.save(`Finanzreport_${(company || 'Report').replace(/\s/g, '_')}.pdf`);
}

// Reusable styled components
const Card = ({ children, style = {}, hoverable = false }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => hoverable && setHovered(true)}
      onMouseLeave={() => hoverable && setHovered(false)}
      style={{
        background: "#fff",
        border: `1.5px solid ${hovered ? "#1a4fd6" : "#e2e8f0"}`,
        borderRadius: 16,
        padding: 24,
        boxShadow: hovered ? "0 8px 32px rgba(26,79,214,0.12)" : "0 1px 4px rgba(0,0,0,0.05)",
        transition: "all 0.22s cubic-bezier(.4,0,.2,1)",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        ...style
      }}
    >
      {children}
    </div>
  );
};

const PrimaryBtn = ({ children, onClick, disabled, style = {} }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%", padding: "15px", border: "none", borderRadius: 12,
        fontSize: 15, fontWeight: 700, fontFamily: "system-ui,sans-serif",
        cursor: disabled ? "not-allowed" : "pointer",
        background: disabled ? "#e2e8f0" : hovered ? "linear-gradient(135deg,#2563eb,#1a4fd6)" : "linear-gradient(135deg,#1a4fd6,#0a2d8a)",
        color: disabled ? "#9aa5b4" : "#fff",
        boxShadow: disabled ? "none" : hovered ? "0 8px 28px rgba(26,79,214,0.45)" : "0 4px 16px rgba(26,79,214,0.28)",
        transform: disabled ? "none" : hovered ? "translateY(-2px) scale(1.01)" : "translateY(0) scale(1)",
        transition: "all 0.2s cubic-bezier(.4,0,.2,1)",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
        letterSpacing: "0.02em",
        ...style
      }}
    >
      {children}
    </button>
  );
};

const GreenBtn = ({ children, onClick, disabled }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%", padding: "15px", border: "none", borderRadius: 12,
        fontSize: 15, fontWeight: 700, fontFamily: "system-ui,sans-serif",
        cursor: disabled ? "not-allowed" : "pointer",
        background: disabled ? "#e2e8f0" : hovered ? "linear-gradient(135deg,#22c55e,#16a34a)" : "linear-gradient(135deg,#16a34a,#15803d)",
        color: disabled ? "#9aa5b4" : "#fff",
        boxShadow: disabled ? "none" : hovered ? "0 8px 28px rgba(22,163,74,0.4)" : "0 4px 16px rgba(22,163,74,0.25)",
        transform: disabled ? "none" : hovered ? "translateY(-2px) scale(1.01)" : "translateY(0) scale(1)",
        transition: "all 0.2s cubic-bezier(.4,0,.2,1)",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
      }}
    >
      {children}
    </button>
  );
};

const ToneBtn = ({ label, active, onClick }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: active ? "linear-gradient(135deg,#1a4fd6,#0a2d8a)" : hovered ? "#f0f5ff" : "#f8fafc",
        border: `1.5px solid ${active ? "#1a4fd6" : hovered ? "#1a4fd6" : "#e2e8f0"}`,
        borderRadius: 9, padding: "9px 18px", fontSize: 13,
        color: active ? "#fff" : hovered ? "#1a4fd6" : "#4a5568",
        cursor: "pointer", fontFamily: "system-ui,sans-serif",
        fontWeight: active ? 700 : 500,
        transition: "all 0.18s cubic-bezier(.4,0,.2,1)",
        transform: hovered && !active ? "translateY(-1px)" : "translateY(0)",
        boxShadow: active ? "0 4px 12px rgba(26,79,214,0.25)" : hovered ? "0 2px 8px rgba(26,79,214,0.1)" : "none",
      }}
    >
      {label}
    </button>
  );
};

const ModeTab = ({ id, icon, title, sub, badge, badgeColor, badgeBg, active, onClick }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: active ? "#fff" : hovered ? "#fafcff" : "#f8fafc",
        border: active ? "2px solid #1a4fd6" : `1.5px solid ${hovered ? "#c7d8fb" : "#e2e8f0"}`,
        borderRadius: 14, padding: "18px 16px", cursor: "pointer", textAlign: "left",
        transition: "all 0.2s cubic-bezier(.4,0,.2,1)",
        boxShadow: active ? "0 4px 20px rgba(26,79,214,0.14)" : hovered ? "0 4px 16px rgba(26,79,214,0.08)" : "none",
        transform: hovered && !active ? "translateY(-2px)" : "translateY(0)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
        <span style={{ background: badgeBg, color: badgeColor, fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 100, border: `1px solid ${badgeColor}30` }}>{badge}</span>
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#0d1f3c", marginBottom: 2 }}>{title}</div>
      <div style={{ fontSize: 12, color: "#9aa5b4" }}>{sub}</div>
    </button>
  );
};

const inp = {
  background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 9,
  padding: "11px 13px", color: "#0d1f3c", fontSize: 14, outline: "none",
  width: "100%", fontFamily: "system-ui,sans-serif", boxSizing: "border-box",
  transition: "border-color 0.18s, box-shadow 0.18s",
};

const FocusInput = ({ style = {}, ...props }) => {
  const [focused, setFocused] = useState(false);
  return (
    <input
      {...props}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{ ...inp, ...style, border: `1.5px solid ${focused ? "#1a4fd6" : "#e2e8f0"}`, boxShadow: focused ? "0 0 0 3px rgba(26,79,214,0.08)" : "none" }}
    />
  );
};

const FocusSelect = ({ style = {}, children, ...props }) => {
  const [focused, setFocused] = useState(false);
  return (
    <select
      {...props}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{ ...inp, ...style, border: `1.5px solid ${focused ? "#1a4fd6" : "#e2e8f0"}`, boxShadow: focused ? "0 0 0 3px rgba(26,79,214,0.08)" : "none" }}
    >
      {children}
    </select>
  );
};

export default function App() {
  const [mode, setMode] = useState("upload");
  const [tone, setTone] = useState("professionell");
  const [reportType, setReportType] = useState("Quartalsreport (kompakt)");
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileData, setFileData] = useState(null);
  const [status, setStatus] = useState("");
  const fileRef = useRef();

  const [form, setForm] = useState({
    company: "", period: "Q1 2026", industry: "Technologie / Software",
    revenue: "", revenuePrev: "", profit: "", costs: "", liquidity: "", employees: "", context: "",
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paidParam = params.get("paid");
    const sessionId = params.get("session_id");
    if (paidParam === "true" && sessionId) { verifyAndGenerate(sessionId); window.history.replaceState({}, "", "/"); }
    else if (paidParam === "false") { setStatus("Zahlung abgebrochen."); window.history.replaceState({}, "", "/"); }
  }, []);

  const verifyAndGenerate = async (sessionId) => {
    setLoading(true); setStatus("Zahlung wird verifiziert...");
    try {
      const res = await fetch("/api/verify-payment", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ session_id: sessionId }) });
      const data = await res.json();
      if (data.paid) { const saved = JSON.parse(sessionStorage.getItem("reportData") || "{}"); await doGenerate(saved); }
      else setStatus("Zahlung nicht bestätigt.");
    } catch (e) { setStatus("Fehler: " + e.message); }
    setLoading(false);
  };

  const toBase64 = (file) => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result.split(",")[1]); r.onerror = rej; r.readAsDataURL(file); });
  const extractExcel = (file) => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = (e) => { try { const wb = XLSX.read(e.target.result, { type: "array" }); let text = ""; wb.SheetNames.forEach(n => { text += `\n=== Blatt: ${n} ===\n`; text += XLSX.utils.sheet_to_csv(wb.Sheets[n]); }); res(text); } catch (err) { rej(err); } };
    r.onerror = rej; r.readAsArrayBuffer(file);
  });

  const handleFile = async (file) => {
    if (!file) return;
    setFileName(file.name); setReport(""); setStatus("Datei wird eingelesen...");
    try {
      if (file.name.endsWith(".pdf")) { const b64 = await toBase64(file); setFileData({ type: "pdf", content: b64 }); setStatus("Bereit zur Analyse"); }
      else if (file.name.match(/\.(xlsx|xls|csv)$/)) { const text = await extractExcel(file); setFileData({ type: "excel", content: text }); setStatus("Bereit zur Analyse"); }
      else { setStatus("Bitte PDF oder Excel hochladen."); setFileData(null); }
    } catch (e) { setStatus("Fehler: " + e.message); setFileData(null); }
  };

  const onDrop = (e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); };
  const resetFile = () => { setFileName(""); setFileData(null); setReport(""); setStatus(""); };

  const buildMessages = (data) => {
    const { mode, fileData, form, reportType, tone } = data;
    const prompt = `Du bist ein erfahrener Senior-Finanzanalyst und Unternehmensberater mit 20 Jahren Erfahrung. Erstelle einen umfassenden, professionellen ${reportType} auf Deutsch. Ton: ${tone}. Schreibe AUSFÜHRLICH — mindestens 800-1000 Wörter. Struktur: # Titel, ## Executive Summary, ## Umsatz- & Ergebnisentwicklung, ## Kostenstruktur & Effizienzanalyse, ## Liquidität & Finanzielle Stabilität, ## Stärken & Risiken, ## Branchenvergleich & Benchmarks, ## Strategische Empfehlungen & Maßnahmenplan. Nutze **fett** für Zahlen.`;
    if (mode === "upload" && fileData) {
      if (fileData.type === "pdf") return [{ role: "user", content: [{ type: "document", source: { type: "base64", media_type: "application/pdf", data: fileData.content } }, { type: "text", text: prompt }] }];
      return [{ role: "user", content: `${prompt}\n\nBWA-DATEN:\n${fileData.content}\n\nKONTEXT: ${form?.context || ""}` }];
    }
    const { company, period, industry, revenue, revenuePrev, profit, costs, liquidity, employees, context } = form;
    const growth = revenue && revenuePrev ? (((revenue - revenuePrev) / revenuePrev) * 100).toFixed(1) : null;
    const margin = revenue && profit ? ((profit / revenue) * 100).toFixed(1) : null;
    return [{ role: "user", content: `${prompt}\n\nUnternehmen: ${company || "Musterunternehmen GmbH"} | Branche: ${industry} | Zeitraum: ${period}\n\nKENNZAHLEN:\n- Umsatz: ${revenue ? fmt(revenue) + " €" : "k.A."}\n- Vorjahr: ${revenuePrev ? fmt(revenuePrev) + " €" : "k.A."}\n- Wachstum: ${growth ? growth + "%" : "k.A."}\n- Gewinn/EBIT: ${profit ? fmt(profit) + " €" : "k.A."}\n- EBIT-Marge: ${margin ? margin + "%" : "k.A."}\n- Kosten: ${costs ? fmt(costs) + " €" : "k.A."}\n- Liquidität: ${liquidity ? fmt(liquidity) + " €" : "k.A."}\n- Mitarbeiter: ${employees || "k.A."}\n\nKONTEXT: ${context || "Keine Besonderheiten."}` }];
  };

  const doGenerate = async (data) => {
    setLoading(true); setStatus("");
    try {
      const messages = buildMessages(data && Object.keys(data).length > 0 ? data : { mode, fileData, form, reportType, tone });
      const res = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 8000, messages }) });
      const d = await res.json();
      setReport(d.content?.[0]?.text || "Fehler beim Generieren.");
    } catch (e) { setReport("Fehler: " + e.message); }
    setLoading(false);
  };

  const handlePayAndGenerate = async () => {
    setPaying(true);
    sessionStorage.setItem("reportData", JSON.stringify({ mode, fileData, form, reportType, tone }));
    try {
      const res = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ priceId: "price_1TDZD4D0HqBbjmyliXljmdkY", mode: "payment" }) });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setStatus(data.error || "Fehler beim Erstellen der Checkout-Session.");
    } catch (e) { setStatus("Fehler: " + e.message); }
    setPaying(false);
  };

  const isUpload = mode === "upload";
  const canUpload = !!fileData;

  return (
    <div style={{ background: "#f0f4fb", minHeight: "100vh", fontFamily: "system-ui,sans-serif" }}>
      <CookieBanner />

      {/* Nav */}
      <nav style={{ background: "#fff", borderBottom: "1px solid #e8eef8", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 62, position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 12px rgba(26,79,214,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#1a4fd6,#0a2d8a)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 17, fontWeight: 800, boxShadow: "0 4px 12px rgba(26,79,214,0.3)" }}>B</div>
          <div>
            <span style={{ fontWeight: 800, fontSize: 17, color: "#0d1f3c", letterSpacing: "-0.02em" }}>BWA</span>
            <span style={{ color: "#1a4fd6", fontWeight: 800, fontSize: 17 }}>-</span>
            <span style={{ fontWeight: 800, fontSize: 17, color: "#0d1f3c", letterSpacing: "-0.02em" }}>Generator</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ fontSize: 13, color: "#6b7c99" }}>
            Manuell: <strong style={{ color: "#16a34a" }}>Kostenlos</strong>
            <span style={{ margin: "0 8px", color: "#d1d5db" }}>·</span>
            BWA-Upload: <strong style={{ color: "#1a4fd6" }}>19,00 €</strong>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#f0f5ff", border: "1px solid #c7d8fb", borderRadius: 100, padding: "5px 13px" }}>
            <span style={{ width: 7, height: 7, background: "#1a4fd6", borderRadius: "50%", display: "inline-block", animation: "pulse 2s infinite" }}></span>
            <span style={{ fontSize: 11, color: "#1a4fd6", fontFamily: "monospace", letterSpacing: "0.06em", fontWeight: 700 }}>KI AKTIV</span>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ background: "linear-gradient(160deg,#0d1f3c 0%,#1a3a7a 100%)", padding: "52px 20px 44px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(ellipse at 15% 60%, rgba(26,79,214,0.18) 0%, transparent 55%), radial-gradient(ellipse at 85% 40%, rgba(26,79,214,0.12) 0%, transparent 55%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 640, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(26,79,214,0.18)", border: "1px solid rgba(147,180,248,0.3)", borderRadius: 100, padding: "5px 14px", fontSize: 11, color: "#93b4f8", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "monospace", marginBottom: 18 }}>
            <span style={{ width: 5, height: 5, background: "#93b4f8", borderRadius: "50%", display: "inline-block" }} />
            Powered by Claude AI
          </div>
          <h1 style={{ fontSize: "clamp(26px,5vw,46px)", fontWeight: 800, color: "#fff", margin: "0 0 16px", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
            Professionelle Finanzreports<br />
            <span style={{ color: "#93b4f8" }}>in Sekunden</span>
          </h1>
          <p style={{ fontSize: 15, color: "#7a9cc8", margin: "0 auto 20px", lineHeight: 1.8, fontWeight: 300, maxWidth: 520 }}>
            Die Auswertung einer BWA kostet Steuerberater & Unternehmer oft <span style={{ color: "#fbbf24", fontWeight: 600 }}>Stunden wertvoller Zeit</span>. Unser KI-Tool analysiert deine BWA in Sekunden und erstellt automatisch einen professionellen Report — mit konkreten Handlungsempfehlungen, Stärken & Risiken.
          </p>
          <div style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "12px 20px", marginBottom: 24, display: "inline-block" }}>
            <span style={{ fontSize: 13, color: "#93b4f8" }}>💼 Perfekt für <strong style={{ color: "#fff" }}>Steuerberater</strong>, <strong style={{ color: "#fff" }}>Buchhalter</strong> & <strong style={{ color: "#fff" }}>Unternehmer</strong></span>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 20, flexWrap: "wrap" }}>
            {[["✓","BWA Upload mit PDF-Download","#93b4f8"],["✓","Manuelle Eingabe kostenlos","#6ee7b7"],["✓","5 Berichtstypen & Töne","#93b4f8"],["✓","Ergebnis in unter 30 Sekunden","#6ee7b7"]].map(([icon, text, color]) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color }}>
                <span style={{ fontWeight: 700 }}>{icon}</span><span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 780, margin: "0 auto", padding: "28px 16px 60px" }}>

        {/* Mode Tabs */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          <ModeTab id="upload" icon="📂" title="BWA hochladen" sub="PDF, Excel, CSV" badge="19,00 €" badgeColor="#1a4fd6" badgeBg="#e8f0ff" active={mode === "upload"} onClick={() => { setMode("upload"); setReport(""); setStatus(""); }} />
          <ModeTab id="manual" icon="✏️" title="Manuell eingeben" sub="Zahlen direkt eintragen" badge="Kostenlos" badgeColor="#16a34a" badgeBg="#f0fdf4" active={mode === "manual"} onClick={() => { setMode("manual"); setReport(""); setStatus(""); }} />
        </div>

        {/* Upload */}
        {mode === "upload" && (
          <Card hoverable>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontFamily: "monospace", letterSpacing: "0.1em", textTransform: "uppercase", color: "#9aa5b4" }}>BWA-Datei hochladen</div>
              <div style={{ fontSize: 12, color: "#1a4fd6", fontWeight: 600 }}>📄 Inkl. PDF-Download nach Zahlung</div>
            </div>
            {!fileName ? (
              <div onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={onDrop} onClick={() => fileRef.current.click()}
                style={{ border: `2px dashed ${dragOver ? "#1a4fd6" : "#c8d8f0"}`, borderRadius: 12, padding: "40px 20px", textAlign: "center", cursor: "pointer", background: dragOver ? "#f0f5ff" : "#fafcff", transition: "all 0.2s" }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>📊</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#0d1f3c", marginBottom: 4 }}>BWA hier ablegen oder klicken</div>
                <div style={{ fontSize: 13, color: "#7a8fa8", marginBottom: 16 }}>KI erkennt automatisch alle Kennzahlen</div>
                <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
                  {[["PDF","#dc2626"],["XLSX","#16a34a"],["XLS","#2563eb"],["CSV","#d97706"]].map(([f,c]) => (
                    <span key={f} style={{ background: `${c}18`, border: `1px solid ${c}50`, borderRadius: 6, padding: "4px 10px", fontSize: 11, color: c, fontFamily: "monospace", fontWeight: 700 }}>{f}</span>
                  ))}
                </div>
                <input ref={fileRef} type="file" accept=".pdf,.xlsx,.xls,.csv" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#f0f7ff", border: "1px solid #c7d8fb", borderRadius: 10, padding: "14px 16px" }}>
                <span style={{ fontSize: 26 }}>{fileName.endsWith(".pdf") ? "📄" : "📊"}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#1a4fd6" }}>{fileName}</div>
                  <div style={{ fontSize: 12, color: "#6b7c99", marginTop: 2 }}>✓ {status}</div>
                </div>
                <button onClick={resetFile} style={{ background: "none", border: "1px solid #c7d8fb", borderRadius: 6, padding: "4px 10px", fontSize: 12, color: "#6b7c99", cursor: "pointer", transition: "all 0.15s" }}>✕</button>
              </div>
            )}
          </Card>
        )}

        {/* Unternehmensdaten Upload */}
        {mode === "upload" && (
          <Card style={{ marginTop: 14 }}>
            <div style={{ fontSize: 11, fontFamily: "monospace", letterSpacing: "0.1em", textTransform: "uppercase", color: "#9aa5b4", marginBottom: 16 }}>Unternehmensdaten</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label style={{ fontSize: 12, color: "#6b7c99", fontWeight: 600 }}>Unternehmensname</label>
                <FocusInput placeholder="z.B. Müller GmbH" value={form.company} onChange={e => set("company", e.target.value)} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label style={{ fontSize: 12, color: "#6b7c99", fontWeight: 600 }}>Berichtszeitraum</label>
                <FocusSelect value={form.period} onChange={e => set("period", e.target.value)}>
                  {PERIODS.map(p => <option key={p}>{p}</option>)}
                </FocusSelect>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5, gridColumn: "1/-1" }}>
                <label style={{ fontSize: 12, color: "#6b7c99", fontWeight: 600 }}>Branche</label>
                <FocusSelect value={form.industry} onChange={e => set("industry", e.target.value)}>
                  {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
                </FocusSelect>
              </div>
            </div>
          </Card>
        )}

        {/* Kontext Upload */}
        {mode === "upload" && (
          <div style={{ background: "#fffbeb", border: "2px solid #fbbf24", borderRadius: 14, padding: 22, marginTop: 14, boxShadow: "0 2px 8px rgba(251,191,36,0.12)", transition: "box-shadow 0.2s" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 18 }}>⚠️</span>
              <div style={{ fontSize: 12, fontFamily: "monospace", letterSpacing: "0.08em", textTransform: "uppercase", color: "#92400e", fontWeight: 700 }}>Wichtig — Kontext angeben</div>
            </div>
            <p style={{ fontSize: 13, color: "#78350f", lineHeight: 1.6, margin: "0 0 12px" }}>Je mehr Kontext du angibst, desto präziser wird dein Report.</p>
            <textarea value={form.context} onChange={e => set("context", e.target.value)} placeholder="z.B. Neukunde gewonnen, Produktlaunch, 2 neue Mitarbeiter, unerwartete Reparatur (12.000 €), Ziel: Bankgespräch..." style={{ background: "#fff", border: "1.5px solid #fcd34d", borderRadius: 8, padding: "12px 14px", color: "#0d1f3c", fontSize: 14, outline: "none", width: "100%", fontFamily: "system-ui,sans-serif", minHeight: 90, resize: "vertical", lineHeight: 1.6, boxSizing: "border-box" }} />
            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              {["Neukunde gewonnen","Produktlaunch","Personalaufbau","Investitionen","Marktveränderung","Bankgespräch"].map(tag => (
                <button key={tag} onClick={() => set("context", form.context ? form.context + ", " + tag : tag)}
                  style={{ background: "#fef3c7", border: "1px solid #fcd34d", borderRadius: 100, padding: "4px 12px", fontSize: 12, color: "#92400e", cursor: "pointer", fontFamily: "system-ui,sans-serif", fontWeight: 600, transition: "all 0.15s" }}>
                  + {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Manual Mode */}
        {mode === "manual" && (
          <>
            <div style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: 12, padding: "12px 16px", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 18 }}>🎁</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#16a34a" }}>Kostenlos — keine Zahlung nötig</div>
                <div style={{ fontSize: 12, color: "#4d7c5f" }}>Report anzeigen & kopieren. PDF-Download nur im BWA-Upload verfügbar.</div>
              </div>
            </div>

            <Card>
              <div style={{ fontSize: 11, fontFamily: "monospace", letterSpacing: "0.1em", textTransform: "uppercase", color: "#9aa5b4", marginBottom: 16 }}>Unternehmensdaten</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  <label style={{ fontSize: 12, color: "#6b7c99", fontWeight: 600 }}>Unternehmensname</label>
                  <FocusInput placeholder="z.B. Müller GmbH" value={form.company} onChange={e => set("company", e.target.value)} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  <label style={{ fontSize: 12, color: "#6b7c99", fontWeight: 600 }}>Berichtszeitraum</label>
                  <FocusSelect value={form.period} onChange={e => set("period", e.target.value)}>
                    {PERIODS.map(p => <option key={p}>{p}</option>)}
                  </FocusSelect>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 5, gridColumn: "1/-1" }}>
                  <label style={{ fontSize: 12, color: "#6b7c99", fontWeight: 600 }}>Branche</label>
                  <FocusSelect value={form.industry} onChange={e => set("industry", e.target.value)}>
                    {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
                  </FocusSelect>
                </div>
              </div>
            </Card>

            <Card style={{ marginTop: 14 }}>
              <div style={{ fontSize: 11, fontFamily: "monospace", letterSpacing: "0.1em", textTransform: "uppercase", color: "#9aa5b4", marginBottom: 16 }}>Finanzkennzahlen</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
                {[["Umsatz","revenue","€"],["Vorjahr","revenuePrev","€"],["Gewinn/EBIT","profit","€"],["Kosten","costs","€"],["Liquidität","liquidity","€"],["Mitarbeiter","employees","FTE"]].map(([label,key,unit]) => (
                  <KpiField key={key} label={label} unit={unit} value={form[key]} onChange={e => set(key, e.target.value)} />
                ))}
              </div>
            </Card>

            <Card style={{ marginTop: 14 }}>
              <div style={{ fontSize: 11, fontFamily: "monospace", letterSpacing: "0.1em", textTransform: "uppercase", color: "#9aa5b4", marginBottom: 12 }}>Kontext (optional)</div>
              <textarea value={form.context} onChange={e => set("context", e.target.value)} placeholder="z.B. Neukunde gewonnen, Produktlaunch, unerwartete Kosten..." style={{ ...inp, minHeight: 80, resize: "vertical", lineHeight: 1.6 }} />
            </Card>
          </>
        )}

        {/* Settings */}
        <Card style={{ marginTop: 14 }}>
          <div style={{ fontSize: 11, fontFamily: "monospace", letterSpacing: "0.1em", textTransform: "uppercase", color: "#9aa5b4", marginBottom: 16 }}>Report-Einstellungen</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, color: "#6b7c99", fontWeight: 600, display: "block", marginBottom: 6 }}>Berichtstyp</label>
              <FocusSelect value={reportType} onChange={e => setReportType(e.target.value)}>
                {REPORT_TYPES.map(r => <option key={r}>{r}</option>)}
              </FocusSelect>
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#6b7c99", fontWeight: 600, display: "block", marginBottom: 8 }}>Ton</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {TONES.map(t => <ToneBtn key={t.id} label={t.label} active={tone === t.id} onClick={() => setTone(t.id)} />)}
              </div>
            </div>
          </div>
        </Card>

        {/* Buttons */}
        <div style={{ marginTop: 16 }}>
          {isUpload ? (
            !report && <PrimaryBtn onClick={handlePayAndGenerate} disabled={!canUpload || paying || loading}>
              {paying || loading ? <span>⏳ {loading ? "Report wird generiert..." : "Weiterleitung zu Stripe..."}</span> : <><span>💳</span><span>19,00 € bezahlen & Report generieren</span><span style={{ opacity: 0.6, fontSize: 12 }}>· Stripe</span></>}
            </PrimaryBtn>
          ) : (
            <GreenBtn onClick={() => doGenerate({})} disabled={loading}>
              {loading ? "⏳ Report wird generiert..." : <><span>⚡</span><span>Report kostenlos generieren</span></>}
            </GreenBtn>
          )}
        </div>

        {status && !loading && (
          <div style={{ background: "#f0f7ff", border: "1px solid #c7d8fb", borderRadius: 8, padding: "10px 14px", marginTop: 10, fontSize: 13, color: "#1a4fd6" }}>{status}</div>
        )}

        {/* Output */}
        {(loading || report) && (
          <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 16, overflow: "hidden", marginTop: 20, boxShadow: "0 6px 28px rgba(0,0,0,0.09)" }}>
            <div style={{ background: "linear-gradient(135deg,#0d1f3c,#1a3a7a)", padding: "14px 22px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
                <span style={{ fontFamily: "monospace", fontSize: 11, color: "#93b4f8", letterSpacing: "0.08em" }}>FINANZREPORT · KI-GENERIERT</span>
              </div>
              {report && (
                <div style={{ display: "flex", gap: 8 }}>
                  <CopyBtn onClick={() => { navigator.clipboard.writeText(report); setCopied(true); setTimeout(() => setCopied(false), 2000); }} copied={copied} />
                  {isUpload && <DownloadBtn onClick={() => downloadPDF(report, form.company)} />}
                </div>
              )}
            </div>
            {loading && <div style={{ padding: "28px 24px", color: "#9aa5b4", fontSize: 14, display: "flex", alignItems: "center", gap: 10 }}>⟳ KI analysiert und verfasst Report...</div>}
            {report && (
              <>
                <div style={{ padding: "28px 32px 32px", fontSize: 15, lineHeight: 1.8, fontFamily: "Georgia,serif" }} dangerouslySetInnerHTML={{ __html: renderMd(report) }} />
                {!isUpload && (
                  <div style={{ margin: "0 32px 24px", background: "#f8fafc", border: "1.5px dashed #c7d8fb", borderRadius: 10, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 22 }}>📄</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#1a4fd6", marginBottom: 2 }}>PDF-Download verfügbar</div>
                      <div style={{ fontSize: 12, color: "#6b7c99" }}>Lade deine BWA hoch (19,00 €) um den Report als PDF herunterzuladen.</div>
                    </div>
                    <button onClick={() => { setMode("upload"); setReport(""); }} style={{ marginLeft: "auto", background: "#1a4fd6", border: "none", borderRadius: 7, padding: "7px 14px", fontSize: 12, color: "#fff", cursor: "pointer", fontFamily: "system-ui,sans-serif", fontWeight: 700, whiteSpace: "nowrap", transition: "all 0.15s" }}>
                      BWA hochladen →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Footer */}
      </div>

      <div style={{ borderTop: "1px solid #e2e8f0", background: "#fff", padding: "24px 32px", textAlign: "center" }}>
        <p style={{ fontSize: 12, color: "#9aa5b4", margin: "0 0 8px" }}>© 2026 Sergej Nikoleisen · BWA-Generator</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 20 }}>
          {[["Impressum","/impressum"],["Datenschutz","/datenschutz"],["AGB","/agb"]].map(([label, href]) => (
            <FooterLink key={href} label={label} href={href} />
          ))}
        </div>
      </div>
    </div>
  );
}

function KpiField({ label, unit, value, onChange }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ background: focused ? "#f0f5ff" : "#f8fafc", border: `1.5px solid ${focused ? "#1a4fd6" : "#e8eef6"}`, borderRadius: 10, padding: "12px 14px", transition: "all 0.18s", boxShadow: focused ? "0 0 0 3px rgba(26,79,214,0.06)" : "none" }}>
      <div style={{ fontSize: 10, fontFamily: "monospace", color: "#9aa5b4", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 5 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <input type="number" placeholder="0" value={value} onChange={onChange} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{ background: "transparent", border: "none", color: "#0d1f3c", fontSize: 16, fontWeight: 700, fontFamily: "monospace", outline: "none", width: "100%" }} />
        <span style={{ fontSize: 12, color: "#9aa5b4", fontFamily: "monospace" }}>{unit}</span>
      </div>
    </div>
  );
}

function CopyBtn({ onClick, copied }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background: hovered ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 7, padding: "5px 13px", fontSize: 12, color: "#fff", cursor: "pointer", fontFamily: "system-ui,sans-serif", transition: "all 0.15s", transform: hovered ? "translateY(-1px)" : "none" }}>
      {copied ? "✓ Kopiert!" : "📋 Kopieren"}
    </button>
  );
}

function DownloadBtn({ onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background: hovered ? "rgba(26,79,214,0.5)" : "rgba(26,79,214,0.3)", border: "1px solid rgba(147,180,248,0.4)", borderRadius: 7, padding: "5px 13px", fontSize: 12, color: "#93b4f8", cursor: "pointer", fontFamily: "system-ui,sans-serif", fontWeight: 700, transition: "all 0.15s", transform: hovered ? "translateY(-1px)" : "none" }}>
      ⬇ PDF herunterladen
    </button>
  );
}

function FooterLink({ label, href }) {
  const [hovered, setHovered] = useState(false);
  return (
    <a href={href} onMouseEnter={() => { }} onMouseLeave={() => { }}
      style={{ color: "#1a4fd6", textDecoration: "none", fontWeight: 600, fontSize: 13, transition: "all 0.15s", borderBottom: hovered ? "1px solid #1a4fd6" : "1px solid transparent", paddingBottom: 1 }}
      onMouseOver={e => e.target.style.borderBottomColor = "#1a4fd6"}
      onMouseOut={e => e.target.style.borderBottomColor = "transparent"}>
      {label}
    </a>
  );
}

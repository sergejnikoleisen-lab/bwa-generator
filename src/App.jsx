import { useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";

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

function downloadPDF(text, company) {
  const content = text.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Finanzreport_${company || 'Report'}.txt`;
  a.click();
  URL.revokeObjectURL(url);
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

  const [form, setForm] = useState({
    company: "", period: "Q4 2025", industry: "Technologie / Software",
    revenue: "", revenuePrev: "", profit: "", costs: "", liquidity: "", employees: "", context: "",
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paidParam = params.get("paid");
    const sessionId = params.get("session_id");
    if (paidParam === "true" && sessionId) {
      verifyAndGenerate(sessionId);
      window.history.replaceState({}, "", "/");
    } else if (paidParam === "false") {
      setStatus("Zahlung abgebrochen.");
      window.history.replaceState({}, "", "/");
    }
  }, []);

  const verifyAndGenerate = async (sessionId) => {
    setLoading(true);
    setStatus("Zahlung wird verifiziert...");
    try {
      const res = await fetch("/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId })
      });
      const data = await res.json();
      if (data.paid) {
        setPaid(true);
        const savedData = JSON.parse(sessionStorage.getItem("reportData") || "{}");
        await doGenerate(savedData);
      } else {
        setStatus("Zahlung nicht bestätigt.");
      }
    } catch (e) {
      setStatus("Fehler: " + e.message);
    }
    setLoading(false);
  };

  const toBase64 = (file) => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(",")[1]);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

  const extractExcel = (file) => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: "array" });
        let text = "";
        wb.SheetNames.forEach(name => {
          text += `\n=== Blatt: ${name} ===\n`;
          text += XLSX.utils.sheet_to_csv(wb.Sheets[name]);
        });
        res(text);
      } catch (err) { rej(err); }
    };
    r.onerror = rej;
    r.readAsArrayBuffer(file);
  });

  const handleFile = async (file) => {
    if (!file) return;
    setFileName(file.name);
    setReport("");
    setPaid(false);
    setStatus("Datei wird eingelesen...");
    try {
      if (file.name.endsWith(".pdf")) {
        const b64 = await toBase64(file);
        setFileData({ type: "pdf", content: b64 });
        setStatus("Bereit zur Analyse");
      } else if (file.name.match(/\.(xlsx|xls|csv)$/)) {
        const text = await extractExcel(file);
        setFileData({ type: "excel", content: text });
        setStatus("Bereit zur Analyse");
      } else {
        setStatus("Bitte PDF oder Excel hochladen.");
        setFileData(null);
      }
    } catch (e) {
      setStatus("Fehler: " + e.message);
      setFileData(null);
    }
  };

  const onDrop = (e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); };
  const resetFile = () => { setFileName(""); setFileData(null); setReport(""); setStatus(""); setPaid(false); };

  const buildMessages = (data) => {
    const { mode, fileData, form, reportType, tone } = data;
    if (mode === "upload" && fileData) {
      if (fileData.type === "pdf") {
        return [{ role: "user", content: [
          { type: "document", source: { type: "base64", media_type: "application/pdf", data: fileData.content } },
          { type: "text", text: `Du bist ein erfahrener Finanzanalyst. Analysiere diese BWA und erstelle einen professionellen ${reportType} auf Deutsch. Ton: ${tone}. Struktur: # Titel, ## Executive Summary, ## Umsatz & Ergebnis, ## Kostenstruktur, ## Liquidität, ## Stärken & Risiken, ## Ausblick & Empfehlungen. Nutze **fett** für Zahlen.` }
        ]}];
      } else {
        return [{ role: "user", content: `Du bist ein erfahrener Finanzanalyst. Analysiere diese BWA und erstelle einen professionellen ${reportType} auf Deutsch.\n\nTon: ${tone}\n\nBWA-DATEN:\n${fileData.content}\n\nStruktur: # Titel, ## Executive Summary, ## Umsatz & Ergebnis, ## Kostenstruktur, ## Liquidität, ## Stärken & Risiken, ## Ausblick & Empfehlungen. Nutze **fett** für Zahlen.` }];
      }
    } else {
      const { company, period, industry, revenue, revenuePrev, profit, costs, liquidity, employees, context } = form;
      const growth = revenue && revenuePrev ? (((revenue - revenuePrev) / revenuePrev) * 100).toFixed(1) : null;
      const margin = revenue && profit ? ((profit / revenue) * 100).toFixed(1) : null;
      return [{ role: "user", content: `Du bist ein erfahrener Finanzanalyst. Erstelle einen ${reportType} auf Deutsch.\n\nUnternehmen: ${company || "Musterunternehmen GmbH"} | Branche: ${industry} | Zeitraum: ${period} | Ton: ${tone}\n\nKENNZAHLEN:\n- Umsatz: ${revenue ? fmt(revenue) + " €" : "k.A."}\n- Vorjahr: ${revenuePrev ? fmt(revenuePrev) + " €" : "k.A."}\n- Wachstum: ${growth ? growth + "%" : "k.A."}\n- Gewinn/EBIT: ${profit ? fmt(profit) + " €" : "k.A."}\n- EBIT-Marge: ${margin ? margin + "%" : "k.A."}\n- Kosten: ${costs ? fmt(costs) + " €" : "k.A."}\n- Liquidität: ${liquidity ? fmt(liquidity) + " €" : "k.A."}\n- Mitarbeiter: ${employees || "k.A."}\n\nKONTEXT: ${context || "Keine Besonderheiten."}\n\nStruktur: # Titel, ## Executive Summary, ## Ergebnisentwicklung, ## Kostenstruktur, ## Liquidität, ## Highlights, ## Ausblick & Empfehlungen. Nutze **fett** für Zahlen.` }];
    }
  };

  const doGenerate = async (data) => {
    setLoading(true);
    setStatus("");
    try {
      const messages = buildMessages(data && Object.keys(data).length > 0 ? data : { mode, fileData, form, reportType, tone });
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 6000, messages })
      });
      const data2 = await res.json();
      setReport(data2.content?.[0]?.text || "Fehler beim Generieren.");
    } catch (e) {
      setReport("Fehler: " + e.message);
    }
    setLoading(false);
  };

  const handlePayAndGenerate = async () => {
    setPaying(true);
    sessionStorage.setItem("reportData", JSON.stringify({ mode, fileData, form, reportType, tone }));
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: "price_1TCT6dDzSxUnxOnbCbsa6CKk", mode: "payment" })
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setStatus("Fehler beim Erstellen der Checkout-Session.");
    } catch (e) {
      setStatus("Fehler: " + e.message);
    }
    setPaying(false);
  };

  const canUploadGenerate = !!fileData;
  const isUpload = mode === "upload";

  const inp = { background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 12px", color: "#0d1f3c", fontSize: 14, outline: "none", width: "100%", fontFamily: "system-ui,sans-serif", boxSizing: "border-box" };

  return (
    <div style={{ background: "#f0f4fb", minHeight: "100vh", fontFamily: "system-ui,sans-serif" }}>

      {/* Nav */}
      <nav style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60, position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 0 #e2e8f0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, background: "linear-gradient(135deg,#1a4fd6,#0a2d8a)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 16, fontWeight: 800 }}>B</div>
          <div>
            <span style={{ fontWeight: 800, fontSize: 16, color: "#0d1f3c", letterSpacing: "-0.02em" }}>BWA</span>
            <span style={{ color: "#1a4fd6", fontWeight: 800, fontSize: 16 }}>.</span>
            <span style={{ fontWeight: 800, fontSize: 16, color: "#0d1f3c", letterSpacing: "-0.02em" }}>Generator</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 13, color: "#6b7c99", fontFamily: "system-ui,sans-serif" }}>
            Manuell: <strong style={{ color: "#16a34a" }}>Kostenlos</strong>
            <span style={{ margin: "0 8px", color: "#d1d5db" }}>·</span>
            BWA-Upload: <strong style={{ color: "#1a4fd6" }}>19,00 €</strong>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#f0f5ff", border: "1px solid #c7d8fb", borderRadius: 100, padding: "4px 12px" }}>
            <span style={{ width: 6, height: 6, background: "#1a4fd6", borderRadius: "50%", display: "inline-block" }}></span>
            <span style={{ fontSize: 11, color: "#1a4fd6", fontFamily: "monospace", letterSpacing: "0.06em" }}>KI AKTIV</span>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ background: "linear-gradient(160deg,#0d1f3c 0%,#1a3a7a 100%)", padding: "48px 20px 40px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundImage: "radial-gradient(ellipse at 15% 60%, rgba(26,79,214,0.18) 0%, transparent 55%), radial-gradient(ellipse at 85% 40%, rgba(26,79,214,0.12) 0%, transparent 55%)", pointerEvents: "none" }}></div>
        <div style={{ position: "relative", zIndex: 1, maxWidth: 600, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(26,79,214,0.18)", border: "1px solid rgba(147,180,248,0.3)", borderRadius: 100, padding: "5px 14px", fontSize: 11, color: "#93b4f8", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "monospace", marginBottom: 18 }}>
            <span style={{ width: 5, height: 5, background: "#93b4f8", borderRadius: "50%", display: "inline-block" }}></span>
            Powered by Claude AI
          </div>
          <h1 style={{ fontSize: "clamp(26px,5vw,44px)", fontWeight: 800, color: "#fff", margin: "0 0 12px", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
            Professionelle Finanzreports<br />
            <span style={{ color: "#93b4f8" }}>in Sekunden</span>
          </h1>
          <p style={{ fontSize: 15, color: "#7a9cc8", margin: "0 auto 28px", lineHeight: 1.7, fontWeight: 300, maxWidth: 460 }}>
            BWA hochladen oder Kennzahlen manuell eingeben — KI erstellt automatisch einen professionellen Bericht.
          </p>

          {/* Value props */}
          <div style={{ display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap" }}>
            {[["✓","BWA Upload mit PDF-Download","#93b4f8"],["✓","Manuelle Eingabe kostenlos","#6ee7b7"],["✓","5 Berichtstypen & Töne","#93b4f8"]].map(([icon, text, color]) => (
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
          {[
            { id: "upload", icon: "📂", title: "BWA hochladen", sub: "PDF, Excel, CSV", badge: "19,00 €", badgeColor: "#1a4fd6", badgeBg: "#e8f0ff" },
            { id: "manual", icon: "✏️", title: "Manuell eingeben", sub: "Zahlen direkt eintragen", badge: "Kostenlos", badgeColor: "#16a34a", badgeBg: "#f0fdf4" },
          ].map(({ id, icon, title, sub, badge, badgeColor, badgeBg }) => (
            <button key={id} onClick={() => { setMode(id); setReport(""); setPaid(false); setStatus(""); }}
              style={{ background: mode === id ? "#fff" : "#f8fafc", border: mode === id ? "2px solid #1a4fd6" : "1.5px solid #e2e8f0", borderRadius: 14, padding: "18px 16px", cursor: "pointer", textAlign: "left", transition: "all 0.15s", boxShadow: mode === id ? "0 4px 16px rgba(26,79,214,0.12)" : "none" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 22 }}>{icon}</span>
                <span style={{ background: badgeBg, color: badgeColor, fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 100, border: `1px solid ${badgeColor}30` }}>{badge}</span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#0d1f3c", marginBottom: 2 }}>{title}</div>
              <div style={{ fontSize: 12, color: "#9aa5b4" }}>{sub}</div>
            </button>
          ))}
        </div>

        {/* Upload Mode */}
        {mode === "upload" && (
          <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: 22, marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontFamily: "monospace", letterSpacing: "0.1em", textTransform: "uppercase", color: "#9aa5b4" }}>BWA-Datei hochladen</div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#1a4fd6", fontWeight: 600 }}>
                <span>📄</span> Inkl. PDF-Download nach Zahlung
              </div>
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
                <button onClick={resetFile} style={{ background: "none", border: "1px solid #c7d8fb", borderRadius: 6, padding: "4px 10px", fontSize: 12, color: "#6b7c99", cursor: "pointer" }}>✕</button>
              </div>
            )}
          </div>
        )}

        {/* Unternehmensdaten für Upload Mode */}
        {mode === "upload" && (
          <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: 22, marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize: 11, fontFamily: "monospace", letterSpacing: "0.1em", textTransform: "uppercase", color: "#9aa5b4", marginBottom: 16 }}>Unternehmensdaten</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label style={{ fontSize: 12, color: "#6b7c99", fontWeight: 600 }}>Unternehmensname</label>
                <input style={inp} placeholder="z.B. Müller GmbH" value={form.company} onChange={e => set("company", e.target.value)} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label style={{ fontSize: 12, color: "#6b7c99", fontWeight: 600 }}>Berichtszeitraum</label>
                <select style={inp} value={form.period} onChange={e => set("period", e.target.value)}>
                  {PERIODS.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5, gridColumn: "1/-1" }}>
                <label style={{ fontSize: 12, color: "#6b7c99", fontWeight: 600 }}>Branche</label>
                <select style={inp} value={form.industry} onChange={e => set("industry", e.target.value)}>
                  {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Kontext für Upload Mode */}
        {mode === "upload" && (
          <div style={{ background: "#fffbeb", border: "2px solid #fbbf24", borderRadius: 14, padding: 22, marginBottom: 16, boxShadow: "0 2px 8px rgba(251,191,36,0.15)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 18 }}>⚠️</span>
              <div style={{ fontSize: 12, fontFamily: "monospace", letterSpacing: "0.08em", textTransform: "uppercase", color: "#92400e", fontWeight: 700 }}>Wichtig — Kontext angeben</div>
            </div>
            <p style={{ fontSize: 13, color: "#78350f", lineHeight: 1.6, margin: "0 0 12px", fontFamily: "system-ui,sans-serif" }}>
              Je mehr Kontext du angibst, desto präziser und wertvoller wird dein Report. Erwähne besondere Ereignisse, Veränderungen oder Ziele im Berichtszeitraum.
            </p>
            <textarea value={form.context} onChange={e => set("context", e.target.value)} placeholder="z.B. Neukunde gewonnen (+80.000 € Jahresumsatz), Produktlaunch im März, 2 neue Mitarbeiter eingestellt, unerwartete Maschinenreparatur (12.000 €), Ziel: Bankgespräch vorbereiten..." style={{ background: "#fff", border: "1.5px solid #fcd34d", borderRadius: 8, padding: "12px 14px", color: "#0d1f3c", fontSize: 14, outline: "none", width: "100%", fontFamily: "system-ui,sans-serif", minHeight: 100, resize: "vertical", lineHeight: 1.6, boxSizing: "border-box" }} />
            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              {["Neukunde gewonnen","Produktlaunch","Personalaufbau","Investitionen","Marktveränderung","Bankgespräch"].map(tag => (
                <button key={tag} onClick={() => set("context", form.context ? form.context + ", " + tag : tag)}
                  style={{ background: "#fef3c7", border: "1px solid #fcd34d", borderRadius: 100, padding: "4px 12px", fontSize: 12, color: "#92400e", cursor: "pointer", fontFamily: "system-ui,sans-serif", fontWeight: 600 }}>
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

            <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: 22, marginBottom: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
              <div style={{ fontSize: 11, fontFamily: "monospace", letterSpacing: "0.1em", textTransform: "uppercase", color: "#9aa5b4", marginBottom: 16 }}>Unternehmensdaten</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  <label style={{ fontSize: 12, color: "#6b7c99", fontWeight: 600 }}>Unternehmensname</label>
                  <input style={inp} placeholder="z.B. Müller GmbH" value={form.company} onChange={e => set("company", e.target.value)} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  <label style={{ fontSize: 12, color: "#6b7c99", fontWeight: 600 }}>Berichtszeitraum</label>
                  <select style={inp} value={form.period} onChange={e => set("period", e.target.value)}>
                    {PERIODS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 5, gridColumn: "1/-1" }}>
                  <label style={{ fontSize: 12, color: "#6b7c99", fontWeight: 600 }}>Branche</label>
                  <select style={inp} value={form.industry} onChange={e => set("industry", e.target.value)}>
                    {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: 22, marginBottom: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
              <div style={{ fontSize: 11, fontFamily: "monospace", letterSpacing: "0.1em", textTransform: "uppercase", color: "#9aa5b4", marginBottom: 16 }}>Finanzkennzahlen</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
                {[["Umsatz","revenue","€"],["Vorjahr","revenuePrev","€"],["Gewinn/EBIT","profit","€"],["Kosten","costs","€"],["Liquidität","liquidity","€"],["Mitarbeiter","employees","FTE"]].map(([label,key,unit]) => (
                  <div key={key} style={{ background: "#f8fafc", border: "1px solid #e8eef6", borderRadius: 10, padding: "12px 14px" }}>
                    <div style={{ fontSize: 10, fontFamily: "monospace", color: "#9aa5b4", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 5 }}>{label}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <input type="number" placeholder="0" value={form[key]} onChange={e => set(key, e.target.value)} style={{ background: "transparent", border: "none", color: "#0d1f3c", fontSize: 16, fontWeight: 700, fontFamily: "monospace", outline: "none", width: "100%" }} />
                      <span style={{ fontSize: 12, color: "#9aa5b4", fontFamily: "monospace" }}>{unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: 22, marginBottom: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
              <div style={{ fontSize: 11, fontFamily: "monospace", letterSpacing: "0.1em", textTransform: "uppercase", color: "#9aa5b4", marginBottom: 12 }}>Kontext (optional)</div>
              <textarea value={form.context} onChange={e => set("context", e.target.value)} placeholder="z.B. Neukunde gewonnen, Produktlaunch, unerwartete Kosten..." style={{ ...inp, minHeight: 80, resize: "vertical", lineHeight: 1.6 }} />
            </div>
          </>
        )}

        {/* Settings */}
        <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: 22, marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize: 11, fontFamily: "monospace", letterSpacing: "0.1em", textTransform: "uppercase", color: "#9aa5b4", marginBottom: 16 }}>Report-Einstellungen</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, color: "#6b7c99", fontWeight: 600, display: "block", marginBottom: 6 }}>Berichtstyp</label>
              <select value={reportType} onChange={e => setReportType(e.target.value)} style={inp}>
                {REPORT_TYPES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#6b7c99", fontWeight: 600, display: "block", marginBottom: 8 }}>Ton</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {TONES.map(t => (
                  <button key={t.id} onClick={() => setTone(t.id)} style={{ background: tone === t.id ? "linear-gradient(135deg,#1a4fd6,#0a2d8a)" : "#f8fafc", border: `1.5px solid ${tone === t.id ? "#1a4fd6" : "#e2e8f0"}`, borderRadius: 8, padding: "8px 16px", fontSize: 13, color: tone === t.id ? "#fff" : "#4a5568", cursor: "pointer", fontFamily: "system-ui,sans-serif", fontWeight: tone === t.id ? 700 : 400, transition: "all 0.15s" }}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {isUpload ? (
          !report ? (
            <button onClick={handlePayAndGenerate} disabled={!canUploadGenerate || paying || loading} style={{ width: "100%", padding: "17px", background: !canUploadGenerate || paying || loading ? "#e2e8f0" : "linear-gradient(135deg,#1a4fd6,#0a2d8a)", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700, color: !canUploadGenerate || paying || loading ? "#9aa5b4" : "#fff", cursor: !canUploadGenerate || paying || loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: !canUploadGenerate || paying || loading ? "none" : "0 4px 20px rgba(26,79,214,0.3)", fontFamily: "system-ui,sans-serif" }}>
              {paying || loading ? (
                <span>⏳ {loading ? "Report wird generiert..." : "Weiterleitung zu Stripe..."}</span>
              ) : (
                <><span>💳</span><span>19,00 € bezahlen & Report generieren</span><span style={{ opacity: 0.6, fontSize: 12 }}>· Stripe</span></>
              )}
            </button>
          ) : null
        ) : (
          <button onClick={() => doGenerate({})} disabled={loading} style={{ width: "100%", padding: "17px", background: loading ? "#e2e8f0" : "linear-gradient(135deg,#16a34a,#15803d)", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700, color: loading ? "#9aa5b4" : "#fff", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: loading ? "none" : "0 4px 20px rgba(22,163,74,0.3)", fontFamily: "system-ui,sans-serif" }}>
            {loading ? "⏳ Report wird generiert..." : <><span>⚡</span><span>Report kostenlos generieren</span></>}
          </button>
        )}

        {status && !loading && (
          <div style={{ background: "#f0f7ff", border: "1px solid #c7d8fb", borderRadius: 8, padding: "10px 14px", marginTop: 10, fontSize: 13, color: "#1a4fd6" }}>
            {status}
          </div>
        )}

        {/* Output */}
        {(loading || report) && (
          <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, overflow: "hidden", marginTop: 20, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
            {/* Output Header */}
            <div style={{ background: "linear-gradient(135deg,#0d1f3c,#1a3a7a)", padding: "14px 22px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", display: "inline-block" }}></span>
                <span style={{ fontFamily: "monospace", fontSize: 11, color: "#93b4f8", letterSpacing: "0.08em" }}>FINANZREPORT · KI-GENERIERT</span>
              </div>
              {report && (
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => { navigator.clipboard.writeText(report); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                    style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 6, padding: "5px 12px", fontSize: 12, color: "#fff", cursor: "pointer", fontFamily: "system-ui,sans-serif" }}>
                    {copied ? "✓ Kopiert!" : "📋 Kopieren"}
                  </button>
                  {isUpload && (
                    <button onClick={() => downloadPDF(report, form.company)}
                      style={{ background: "rgba(26,79,214,0.3)", border: "1px solid rgba(147,180,248,0.4)", borderRadius: 6, padding: "5px 12px", fontSize: 12, color: "#93b4f8", cursor: "pointer", fontFamily: "system-ui,sans-serif", fontWeight: 700 }}>
                      ⬇ PDF herunterladen
                    </button>
                  )}
                </div>
              )}
            </div>

            {loading && (
              <div style={{ padding: "28px 24px", color: "#9aa5b4", fontSize: 14, display: "flex", alignItems: "center", gap: 10 }}>
                <span>⟳</span> KI analysiert und verfasst Report...
              </div>
            )}
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
                    <button onClick={() => { setMode("upload"); setReport(""); }} style={{ marginLeft: "auto", background: "#1a4fd6", border: "none", borderRadius: 7, padding: "7px 14px", fontSize: 12, color: "#fff", cursor: "pointer", fontFamily: "system-ui,sans-serif", fontWeight: 700, whiteSpace: "nowrap" }}>
                      BWA hochladen →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

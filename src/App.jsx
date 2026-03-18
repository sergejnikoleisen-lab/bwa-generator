import { useState, useRef } from "react";
import * as XLSX from "xlsx";

const TONES = [
  { id: "professionell", label: "Professionell" },
  { id: "optimistisch", label: "Optimistisch" },
  { id: "konservativ", label: "Konservativ" },
  { id: "investorenfokus", label: "Investorenfokus" },
];

const PERIODS = ["Q1 2025","Q2 2025","Q3 2025","Q4 2025","Geschäftsjahr 2025","Geschäftsjahr 2024"];
const INDUSTRIES = ["Technologie / Software","Handel / E-Commerce","Produktion / Industrie","Dienstleistungen","Immobilien","Gesundheit / Medizin","Gastronomie / Hotellerie","Bauwesen"];
const REPORT_TYPES = ["Quartalsreport (kompakt)","Jahresabschluss (detailliert)","Investoren-Update","Management-Zusammenfassung","Bankgespräch Vorbereitung"];

function renderMd(text) {
  return text
    .replace(/^### (.+)$/gm, '<h3 style="font-size:14px;font-weight:700;margin:20px 0 6px;color:#1a2b4a;text-transform:uppercase;letter-spacing:0.06em">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="font-size:18px;font-weight:700;margin:28px 0 10px;color:#0a1628;border-bottom:2px solid #e8f0fb;padding-bottom:8px">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="font-size:24px;font-weight:800;margin:0 0 16px;color:#0a1628">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#1a4fd6;font-weight:700">$1</strong>')
    .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0"/>')
    .replace(/\n\n/g, "<br/><br/>")
    .replace(/\n/g, "<br/>");
}

function fmt(n) {
  if (!n) return "";
  return Number(n).toLocaleString("de-DE");
}

export default function App() {
  const [mode, setMode] = useState("upload");
  const [tone, setTone] = useState("professionell");
  const [reportType, setReportType] = useState("Quartalsreport (kompakt)");
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false);
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

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const resetFile = () => { setFileName(""); setFileData(null); setReport(""); setStatus(""); };

  const generate = async () => {
    setLoading(true);
    setReport("");
    try {
      let messages;
      if (mode === "upload" && fileData) {
        if (fileData.type === "pdf") {
          messages = [{ role: "user", content: [
            { type: "document", source: { type: "base64", media_type: "application/pdf", data: fileData.content } },
            { type: "text", text: `Du bist ein erfahrener Finanzanalyst. Analysiere diese BWA und erstelle einen professionellen ${reportType} auf Deutsch. Ton: ${tone}. Struktur: # Titel, ## Executive Summary, ## Umsatz & Ergebnis, ## Kostenstruktur, ## Liquidität, ## Stärken & Risiken, ## Ausblick & Empfehlungen. Nutze **fett** für Zahlen.` }
          ]}];
        } else {
          messages = [{ role: "user", content: `Du bist ein erfahrener Finanzanalyst. Analysiere diese BWA und erstelle einen professionellen ${reportType} auf Deutsch.\n\nTon: ${tone}\n\nBWA-DATEN:\n${fileData.content}\n\nStruktur: # Titel, ## Executive Summary, ## Umsatz & Ergebnis, ## Kostenstruktur, ## Liquidität, ## Stärken & Risiken, ## Ausblick & Empfehlungen. Nutze **fett** für Zahlen.` }];
        }
      } else {
        const { company, period, industry, revenue, revenuePrev, profit, costs, liquidity, employees, context } = form;
        const growth = revenue && revenuePrev ? (((revenue - revenuePrev) / revenuePrev) * 100).toFixed(1) : null;
        const margin = revenue && profit ? ((profit / revenue) * 100).toFixed(1) : null;
        messages = [{ role: "user", content: `Du bist ein erfahrener Finanzanalyst. Erstelle einen ${reportType} auf Deutsch.\n\nUnternehmen: ${company || "Musterunternehmen GmbH"} | Branche: ${industry} | Zeitraum: ${period} | Ton: ${tone}\n\nKENNZAHLEN:\n- Umsatz: ${revenue ? fmt(revenue) + " €" : "k.A."}\n- Vorjahr: ${revenuePrev ? fmt(revenuePrev) + " €" : "k.A."}\n- Wachstum: ${growth ? growth + "%" : "k.A."}\n- Gewinn/EBIT: ${profit ? fmt(profit) + " €" : "k.A."}\n- EBIT-Marge: ${margin ? margin + "%" : "k.A."}\n- Kosten: ${costs ? fmt(costs) + " €" : "k.A."}\n- Liquidität: ${liquidity ? fmt(liquidity) + " €" : "k.A."}\n- Mitarbeiter: ${employees || "k.A."}\n\nKONTEXT: ${context || "Keine Besonderheiten."}\n\nStruktur: # Titel, ## Executive Summary, ## Ergebnisentwicklung, ## Kostenstruktur, ## Liquidität, ## Highlights, ## Ausblick & Empfehlungen. Nutze **fett** für Zahlen.` }];
      }

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 6000, messages })
      });
      const data = await res.json();
      setReport(data.content?.[0]?.text || "Fehler beim Generieren.");
    } catch (e) {
      setReport("Fehler: " + e.message);
    }
    setLoading(false);
  };

  const canGenerate = mode === "upload" ? !!fileData : true;

  return (
    <div style={{ background: "#f4f7fc", minHeight: "100vh", fontFamily: "'Georgia', serif", color: "#0a1628" }}>

      {/* Top Navigation */}
      <nav style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "0 40px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, background: "linear-gradient(135deg, #1a4fd6, #0a2d8a)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 16, fontWeight: 800 }}>B</div>
          <span style={{ fontWeight: 700, fontSize: 17, letterSpacing: "-0.02em", color: "#0a1628" }}>BWA<span style={{ color: "#1a4fd6" }}>.</span>Generator</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f0f5ff", border: "1px solid #c7d8fb", borderRadius: 100, padding: "4px 12px" }}>
          <span style={{ width: 7, height: 7, background: "#1a4fd6", borderRadius: "50%", display: "inline-block", animation: "pulse 2s infinite" }}></span>
          <span style={{ fontSize: 12, color: "#1a4fd6", fontFamily: "monospace", letterSpacing: "0.06em" }}>KI AKTIV</span>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #0a1628 0%, #1a2d5a 100%)", padding: "52px 40px 48px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 20% 50%, rgba(26,79,214,0.15) 0%, transparent 60%), radial-gradient(circle at 80% 50%, rgba(26,79,214,0.1) 0%, transparent 60%)" }}></div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-block", background: "rgba(26,79,214,0.2)", border: "1px solid rgba(26,79,214,0.4)", borderRadius: 100, padding: "5px 16px", fontSize: 11, color: "#93b4f8", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "monospace", marginBottom: 20 }}>
            Powered by Claude AI
          </div>
          <h1 style={{ fontSize: "clamp(28px,5vw,48px)", fontWeight: 800, color: "#fff", margin: "0 0 12px", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
            Professionelle Finanzreports<br />
            <span style={{ color: "#93b4f8" }}>in wenigen Sekunden</span>
          </h1>
          <p style={{ fontSize: 16, color: "#7a9cc8", maxWidth: 500, margin: "0 auto", lineHeight: 1.7, fontFamily: "system-ui, sans-serif", fontWeight: 300 }}>
            BWA hochladen oder Kennzahlen eingeben — KI erstellt automatisch einen professionellen Report für Steuerberater, Banken & Investoren.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 20px 60px" }}>

        {/* Mode Tabs */}
        <div style={{ display: "flex", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 4, marginBottom: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", gap: 4 }}>
          {[["upload", "📂", "BWA hochladen", "PDF, Excel, CSV"], ["manual", "✏️", "Manuell eingeben", "Zahlen direkt eintragen"]].map(([id, icon, title, sub]) => (
            <button key={id} onClick={() => setMode(id)} style={{ flex: 1, padding: "12px 8px", borderRadius: 9, border: "none", cursor: "pointer", background: mode === id ? "linear-gradient(135deg, #1a4fd6, #0a2d8a)" : "transparent", color: mode === id ? "#fff" : "#6b7c99", fontFamily: "system-ui, sans-serif", transition: "all 0.2s", textAlign: "center" }}>
              <div style={{ fontSize: 18, marginBottom: 2 }}>{icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{title}</div>
              <div style={{ fontSize: 11, opacity: 0.7 }}>{sub}</div>
            </button>
          ))}
        </div>

        {/* Upload Mode */}
        {mode === "upload" && (
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: 24, marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: 11, fontFamily: "monospace", letterSpacing: "0.1em", textTransform: "uppercase", color: "#9aa5b4", marginBottom: 16 }}>BWA-Datei hochladen</div>
            {!fileName ? (
              <div onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={onDrop} onClick={() => fileRef.current.click()}
                style={{ border: `2px dashed ${dragOver ? "#1a4fd6" : "#c8d8f0"}`, borderRadius: 10, padding: "36px 20px", textAlign: "center", cursor: "pointer", background: dragOver ? "#f0f5ff" : "#fafcff", transition: "all 0.2s" }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>📊</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#0a1628", marginBottom: 4, fontFamily: "system-ui, sans-serif" }}>BWA hier ablegen oder klicken</div>
                <div style={{ fontSize: 13, color: "#7a8fa8", fontFamily: "system-ui, sans-serif", marginBottom: 14 }}>KI erkennt automatisch alle Kennzahlen</div>
                <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
                  {[["PDF", "#dc2626"], ["XLSX", "#16a34a"], ["XLS", "#2563eb"], ["CSV", "#d97706"]].map(([f, c]) => (
                    <span key={f} style={{ background: `${c}15`, border: `1px solid ${c}40`, borderRadius: 5, padding: "3px 10px", fontSize: 11, color: c, fontFamily: "monospace", fontWeight: 700 }}>{f}</span>
                  ))}
                </div>
                <input ref={fileRef} type="file" accept=".pdf,.xlsx,.xls,.csv" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#f0f7ff", border: "1px solid #c7d8fb", borderRadius: 10, padding: "14px 18px" }}>
                <span style={{ fontSize: 28 }}>{fileName.endsWith(".pdf") ? "📄" : "📊"}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#1a4fd6", fontFamily: "system-ui, sans-serif" }}>{fileName}</div>
                  <div style={{ fontSize: 12, color: "#6b7c99", marginTop: 2, fontFamily: "system-ui, sans-serif" }}>✓ {status}</div>
                </div>
                <button onClick={resetFile} style={{ marginLeft: "auto", background: "none", border: "1px solid #c7d8fb", borderRadius: 6, padding: "4px 10px", fontSize: 12, color: "#6b7c99", cursor: "pointer", fontFamily: "system-ui, sans-serif" }}>✕ Entfernen</button>
              </div>
            )}
          </div>
        )}

        {/* Manual Mode */}
        {mode === "manual" && (
          <>
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: 24, marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <div style={{ fontSize: 11, fontFamily: "monospace", letterSpacing: "0.1em", textTransform: "uppercase", color: "#9aa5b4", marginBottom: 16 }}>Unternehmensdaten</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[["Unternehmensname", "company", "text", "z.B. Müller GmbH"], ["Branche", "industry", "select", null], ["Berichtszeitraum", "period", "select", null]].map(([label, key, type, ph]) => (
                  <div key={key} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    <label style={{ fontSize: 12, color: "#6b7c99", fontWeight: 600, fontFamily: "system-ui, sans-serif" }}>{label}</label>
                    {type === "select" ? (
                      <select value={form[key]} onChange={e => set(key, e.target.value)} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 12px", color: "#0a1628", fontSize: 14, outline: "none", fontFamily: "system-ui, sans-serif" }}>
                        {(key === "period" ? PERIODS : INDUSTRIES).map(o => <option key={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 12px", color: "#0a1628", fontSize: 14, outline: "none", fontFamily: "system-ui, sans-serif" }} placeholder={ph} value={form[key]} onChange={e => set(key, e.target.value)} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: 24, marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <div style={{ fontSize: 11, fontFamily: "monospace", letterSpacing: "0.1em", textTransform: "uppercase", color: "#9aa5b4", marginBottom: 16 }}>Finanzkennzahlen</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
                {[["Umsatz","revenue","€"],["Vorjahr Umsatz","revenuePrev","€"],["Gewinn / EBIT","profit","€"],["Kosten gesamt","costs","€"],["Liquidität","liquidity","€"],["Mitarbeiter","employees","FTE"]].map(([label, key, unit]) => (
                  <div key={key} style={{ background: "#f8fafc", border: "1px solid #e8eef6", borderRadius: 10, padding: "12px 14px" }}>
                    <div style={{ fontSize: 10, fontFamily: "monospace", color: "#9aa5b4", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 5 }}>{label}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <input type="number" placeholder="0" value={form[key]} onChange={e => set(key, e.target.value)} style={{ background: "transparent", border: "none", color: "#0a1628", fontSize: 16, fontWeight: 700, fontFamily: "monospace", outline: "none", width: "100%" }} />
                      <span style={{ fontSize: 12, color: "#9aa5b4", fontFamily: "monospace" }}>{unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: 24, marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <div style={{ fontSize: 11, fontFamily: "monospace", letterSpacing: "0.1em", textTransform: "uppercase", color: "#9aa5b4", marginBottom: 12 }}>Kontext (optional)</div>
              <textarea value={form.context} onChange={e => set("context", e.target.value)} placeholder="z.B. Neukunde gewonnen, Produktlaunch, unerwartete Kosten..." style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 12px", color: "#0a1628", fontSize: 14, outline: "none", width: "100%", fontFamily: "system-ui, sans-serif", minHeight: 80, resize: "vertical", lineHeight: 1.6, boxSizing: "border-box" }} />
            </div>
          </>
        )}

        {/* Settings */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: 24, marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: 11, fontFamily: "monospace", letterSpacing: "0.1em", textTransform: "uppercase", color: "#9aa5b4", marginBottom: 16 }}>Report-Einstellungen</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, color: "#6b7c99", fontWeight: 600, fontFamily: "system-ui, sans-serif", display: "block", marginBottom: 6 }}>Berichtstyp</label>
              <select value={reportType} onChange={e => setReportType(e.target.value)} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 12px", color: "#0a1628", fontSize: 14, outline: "none", width: "100%", fontFamily: "system-ui, sans-serif" }}>
                {REPORT_TYPES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#6b7c99", fontWeight: 600, fontFamily: "system-ui, sans-serif", display: "block", marginBottom: 8 }}>Ton des Berichts</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {TONES.map(t => (
                  <button key={t.id} onClick={() => setTone(t.id)} style={{ background: tone === t.id ? "linear-gradient(135deg, #1a4fd6, #0a2d8a)" : "#f8fafc", border: `1px solid ${tone === t.id ? "#1a4fd6" : "#e2e8f0"}`, borderRadius: 8, padding: "8px 16px", fontSize: 13, color: tone === t.id ? "#fff" : "#4a5568", cursor: "pointer", fontFamily: "system-ui, sans-serif", fontWeight: tone === t.id ? 600 : 400, transition: "all 0.15s" }}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <button onClick={generate} disabled={!canGenerate || loading} style={{ width: "100%", padding: "16px", background: !canGenerate || loading ? "#e2e8f0" : "linear-gradient(135deg, #1a4fd6, #0a2d8a)", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700, color: !canGenerate || loading ? "#9aa5b4" : "#fff", cursor: !canGenerate || loading ? "not-allowed" : "pointer", fontFamily: "system-ui, sans-serif", letterSpacing: "0.02em", boxShadow: !canGenerate || loading ? "none" : "0 4px 16px rgba(26,79,214,0.3)", transition: "all 0.2s" }}>
          {loading ? "⏳ KI generiert Report..." : "⚡ Finanzreport generieren"}
        </button>

        {/* Output */}
        {(loading || report) && (
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden", marginTop: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
            <div style={{ background: "linear-gradient(135deg, #0a1628, #1a2d5a)", padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }}></div>
                <span style={{ fontFamily: "monospace", fontSize: 12, color: "#93b4f8", letterSpacing: "0.08em" }}>FINANZREPORT · GENERIERT VON KI</span>
              </div>
              {report && (
                <button onClick={() => { navigator.clipboard.writeText(report); setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 6, padding: "5px 14px", fontSize: 12, color: "#fff", cursor: "pointer", fontFamily: "system-ui, sans-serif" }}>
                  {copied ? "✓ Kopiert!" : "📋 Kopieren"}
                </button>
              )}
            </div>
            {loading && (
              <div style={{ padding: "28px 24px", color: "#9aa5b4", fontSize: 14, fontFamily: "system-ui, sans-serif", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span> KI analysiert Kennzahlen und verfasst Report...
              </div>
            )}
            {report && (
              <div style={{ padding: "28px 32px 32px", fontSize: 15, lineHeight: 1.8, fontFamily: "Georgia, serif" }} dangerouslySetInnerHTML={{ __html: renderMd(report) }} />
            )}
          </div>
        )}

        {/* Footer Hint */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "16px 20px", display: "flex", gap: 12, marginTop: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <span style={{ fontSize: 20 }}>💡</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1a4fd6", marginBottom: 3, fontFamily: "system-ui, sans-serif" }}>Als SaaS verkaufen: 49–99€/Monat</div>
            <div style={{ fontSize: 13, color: "#6b7c99", lineHeight: 1.5, fontFamily: "system-ui, sans-serif" }}>Steuerberater & Buchhalter sparen 30–60 Min. pro Report. 10 Kunden = 500–1.000€/Monat.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

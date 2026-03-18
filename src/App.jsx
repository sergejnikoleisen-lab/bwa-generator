import { useState, useRef } from "react";
import * as XLSX from "xlsx";

const TONES = [
  { id: "professionell", label: "📊 Professionell" },
  { id: "optimistisch", label: "🚀 Optimistisch" },
  { id: "konservativ", label: "🏦 Konservativ" },
  { id: "investorenfokus", label: "💼 Investorenfokus" },
];

const PERIODS = ["Q1 2025","Q2 2025","Q3 2025","Q4 2025","Geschäftsjahr 2025","Geschäftsjahr 2024"];
const INDUSTRIES = ["Technologie / Software","Handel / E-Commerce","Produktion / Industrie","Dienstleistungen","Immobilien","Gesundheit / Medizin","Gastronomie / Hotellerie","Bauwesen"];
const REPORT_TYPES = ["Quartalsreport (kompakt)","Jahresabschluss (detailliert)","Investoren-Update","Management-Zusammenfassung","Bankgespräch Vorbereitung"];

function renderMd(text) {
  return text
    .replace(/^### (.+)$/gm, '<h3 style="font-size:15px;font-weight:700;margin:18px 0 6px;color:#e2e8e7">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="font-size:18px;font-weight:700;margin:22px 0 8px;color:#00e5a0">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="font-size:22px;font-weight:800;margin:0 0 14px;color:#f0f6f5">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#00e5a0">$1</strong>')
    .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid #1e2729;margin:16px 0"/>')
    .replace(/\n\n/g, "<br/><br/>")
    .replace(/\n/g, "<br/>");
}

function fmt(n) {
  if (!n) return "";
  return Number(n).toLocaleString("de-DE");
}

export default function App() {
  const [mode, setMode] = useState("upload"); // "upload" | "manual"
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
        setStatus("✓ PDF bereit");
      } else if (file.name.match(/\.(xlsx|xls|csv)$/)) {
        const text = await extractExcel(file);
        setFileData({ type: "excel", content: text });
        setStatus("✓ Excel bereit");
      } else {
        setStatus("⚠ Bitte PDF oder Excel hochladen.");
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

  const resetFile = () => {
    setFileName(""); setFileData(null); setReport(""); setStatus("");
  };

  const generate = async () => {
    setLoading(true);
    setReport("");

    try {
      let messages;

      if (mode === "upload" && fileData) {
        if (fileData.type === "pdf") {
          messages = [{
            role: "user",
            content: [
              { type: "document", source: { type: "base64", media_type: "application/pdf", data: fileData.content } },
              { type: "text", text: `Du bist ein erfahrener Finanzanalyst. Analysiere diese BWA und erstelle direkt einen professionellen ${reportType} auf Deutsch. Ton: ${tone}. Struktur: # Titel, ## Executive Summary, ## Umsatz & Ergebnis, ## Kostenstruktur, ## Liquidität, ## Stärken & Risiken, ## Ausblick & Empfehlungen. Nutze **fett** für Zahlen. Ca. 400-500 Wörter.` }
            ]
          }];
        } else {
          messages = [{
            role: "user",
            content: `Du bist ein erfahrener Finanzanalyst. Analysiere diese BWA-Daten und erstelle einen professionellen ${reportType} auf Deutsch.\n\nTon: ${tone}\n\nBWA-DATEN:\n${fileData.content}\n\nStruktur: # Titel, ## Executive Summary, ## Umsatz & Ergebnis, ## Kostenstruktur, ## Liquidität, ## Stärken & Risiken, ## Ausblick & Empfehlungen. Nutze **fett** für Zahlen. Ca. 400-500 Wörter.`
          }];
        }
      } else {
        const { company, period, industry, revenue, revenuePrev, profit, costs, liquidity, employees, context } = form;
        const growth = revenue && revenuePrev ? (((revenue - revenuePrev) / revenuePrev) * 100).toFixed(1) : null;
        const margin = revenue && profit ? ((profit / revenue) * 100).toFixed(1) : null;
        messages = [{
          role: "user",
          content: `Du bist ein erfahrener Finanzanalyst. Erstelle einen ${reportType} auf Deutsch.\n\nUnternehmen: ${company || "Musterunternehmen GmbH"} | Branche: ${industry} | Zeitraum: ${period} | Ton: ${tone}\n\nKENNZAHLEN:\n- Umsatz: ${revenue ? fmt(revenue) + " €" : "k.A."}\n- Vorjahr: ${revenuePrev ? fmt(revenuePrev) + " €" : "k.A."}\n- Wachstum: ${growth ? growth + "%" : "k.A."}\n- Gewinn/EBIT: ${profit ? fmt(profit) + " €" : "k.A."}\n- EBIT-Marge: ${margin ? margin + "%" : "k.A."}\n- Kosten: ${costs ? fmt(costs) + " €" : "k.A."}\n- Liquidität: ${liquidity ? fmt(liquidity) + " €" : "k.A."}\n- Mitarbeiter: ${employees || "k.A."}\n\nKONTEXT: ${context || "Keine Besonderheiten."}\n\nStruktur: # Titel, ## Executive Summary, ## Ergebnisentwicklung, ## Kostenstruktur, ## Liquidität, ## Highlights, ## Ausblick & Empfehlungen. Nutze **fett** für Zahlen. Ca. 400 Wörter.`
        }];
      }

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages })
      });
      const data = await res.json();
      setReport(data.content?.[0]?.text || "Fehler beim Generieren.");
    } catch (e) {
      setReport("Fehler: " + e.message);
    }
    setLoading(false);
  };

  const canGenerate = mode === "upload" ? !!fileData : true;

  const S = {
    wrap: { background: "#0a0e0f", minHeight: "100vh", fontFamily: "'Segoe UI',sans-serif", color: "#e8f0ef", paddingBottom: 60 },
    header: { textAlign: "center", padding: "36px 20px 28px", borderBottom: "1px solid #1e2729" },
    badge: { display: "inline-block", background: "rgba(0,229,160,0.1)", border: "1px solid rgba(0,229,160,0.25)", borderRadius: 100, padding: "4px 14px", fontSize: 11, color: "#00e5a0", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 },
    h1: { fontSize: "clamp(26px,5vw,44px)", fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 8px", lineHeight: 1.1 },
    sub: { fontSize: 13, color: "#6b8280", maxWidth: 460, margin: "0 auto", lineHeight: 1.6 },
    body: { maxWidth: 740, margin: "0 auto", padding: "0 16px" },

    // Mode Tabs
    tabs: { display: "flex", background: "#111618", border: "1px solid #1e2729", borderRadius: 12, padding: 4, marginTop: 20, gap: 4 },
    tab: (active) => ({
      flex: 1, padding: "12px 8px", borderRadius: 9, border: "none", cursor: "pointer",
      background: active ? "#0a0e0f" : "transparent",
      color: active ? "#e8f0ef" : "#6b8280",
      fontFamily: "inherit", fontSize: 14, fontWeight: active ? 600 : 400,
      transition: "all 0.2s",
      boxShadow: active ? "0 1px 4px rgba(0,0,0,0.4)" : "none",
      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
    }),

    card: { background: "#111618", border: "1px solid #1e2729", borderRadius: 14, padding: "22px", marginTop: 14 },
    cardTitle: { fontSize: 10, fontFamily: "monospace", letterSpacing: "0.12em", textTransform: "uppercase", color: "#3d5250", marginBottom: 16 },

    dropzone: (over) => ({
      border: `2px dashed ${over ? "#00e5a0" : "#1e2729"}`, borderRadius: 12,
      padding: "36px 20px", textAlign: "center", cursor: "pointer",
      background: over ? "rgba(0,229,160,0.04)" : "#0a0e0f", transition: "all 0.2s",
    }),
    fileLoaded: { display: "flex", alignItems: "center", gap: 12, background: "rgba(0,229,160,0.06)", border: "1px solid rgba(0,229,160,0.2)", borderRadius: 10, padding: "14px 18px" },
    removeBtn: { marginLeft: "auto", background: "none", border: "1px solid #1e2729", borderRadius: 6, padding: "4px 10px", fontSize: 12, color: "#6b8280", cursor: "pointer" },

    grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
    field: { display: "flex", flexDirection: "column", gap: 5 },
    label: { fontSize: 12, color: "#6b8280", fontWeight: 500 },
    input: { background: "#0a0e0f", border: "1px solid #1e2729", borderRadius: 8, padding: "10px 12px", color: "#e8f0ef", fontSize: 14, outline: "none", width: "100%", fontFamily: "inherit" },
    select: { background: "#0a0e0f", border: "1px solid #1e2729", borderRadius: 8, padding: "10px 12px", color: "#e8f0ef", fontSize: 14, outline: "none", width: "100%", fontFamily: "inherit" },
    textarea: { background: "#0a0e0f", border: "1px solid #1e2729", borderRadius: 8, padding: "10px 12px", color: "#e8f0ef", fontSize: 14, outline: "none", width: "100%", fontFamily: "inherit", minHeight: 80, resize: "vertical", lineHeight: 1.6 },

    kpiGrid: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 },
    kpiBox: { background: "#0a0e0f", border: "1px solid #1e2729", borderRadius: 10, padding: "12px" },
    kpiLabel: { fontSize: 10, fontFamily: "monospace", color: "#3d5250", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 5 },
    kpiRow: { display: "flex", alignItems: "center", gap: 4 },
    kpiUnit: { fontSize: 12, color: "#6b8280", fontFamily: "monospace" },
    kpiInput: { background: "transparent", border: "none", color: "#e8f0ef", fontSize: 15, fontWeight: 600, fontFamily: "monospace", outline: "none", width: "100%" },

    toneGroup: { display: "flex", gap: 8, flexWrap: "wrap" },
    toneBtn: (active) => ({ background: active ? "rgba(0,229,160,0.1)" : "#0a0e0f", border: `1px solid ${active ? "#00e5a0" : "#1e2729"}`, borderRadius: 8, padding: "7px 13px", fontSize: 13, color: active ? "#00e5a0" : "#6b8280", cursor: "pointer", fontFamily: "inherit" }),

    btn: (disabled) => ({ width: "100%", padding: "14px", background: disabled ? "#1e2729" : "#00e5a0", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, color: disabled ? "#3d5250" : "#0a0e0f", cursor: disabled ? "not-allowed" : "pointer", marginTop: 8, fontFamily: "inherit" }),

    outputCard: { background: "#111618", border: "1px solid #1e2729", borderRadius: 14, overflow: "hidden", marginTop: 16 },
    toolbar: { background: "#171d1f", borderBottom: "1px solid #1e2729", padding: "10px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" },
    dots: { display: "flex", gap: 6 },
    copyBtn: { background: "#0a0e0f", border: "1px solid #1e2729", borderRadius: 6, padding: "4px 12px", fontSize: 12, color: "#6b8280", cursor: "pointer", fontFamily: "inherit" },
    reportBody: { padding: "24px 26px 28px", fontSize: 14, lineHeight: 1.75 },
    statusBar: { background: "rgba(0,229,160,0.06)", border: "1px solid rgba(0,229,160,0.15)", borderRadius: 8, padding: "9px 14px", marginTop: 10, fontSize: 13, color: "#00b87a", fontFamily: "monospace" },
    hint: { background: "rgba(0,229,160,0.04)", border: "1px solid rgba(0,229,160,0.12)", borderRadius: 12, padding: "16px 20px", display: "flex", gap: 12, marginTop: 16 },
  };

  return (
    <div style={S.wrap}>
      <div style={S.header}>
        <div style={S.badge}>⚡ BWA-Upload & Manuelle Eingabe · Claude AI</div>
        <h1 style={S.h1}>Finanz<span style={{ color: "#00e5a0" }}>Report</span><br/>Generator</h1>
        <p style={S.sub}>BWA hochladen oder Zahlen manuell eingeben — KI erstellt in Sekunden einen professionellen Report.</p>
      </div>

      <div style={S.body}>

        {/* Mode Switch */}
        <div style={S.tabs}>
          <button style={S.tab(mode === "upload")} onClick={() => setMode("upload")}>
            📂 BWA hochladen
          </button>
          <button style={S.tab(mode === "manual")} onClick={() => setMode("manual")}>
            ✏️ Manuell eingeben
          </button>
        </div>

        {/* UPLOAD MODE */}
        {mode === "upload" && (
          <div style={S.card}>
            <div style={S.cardTitle}>BWA-Datei hochladen</div>
            {!fileName ? (
              <div
                style={S.dropzone(dragOver)}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => fileRef.current.click()}
              >
                <div style={{ fontSize: 38, marginBottom: 10 }}>📂</div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 5 }}>BWA hier reinziehen oder klicken</div>
                <div style={{ fontSize: 13, color: "#6b8280", marginBottom: 14 }}>KI liest alle Kennzahlen automatisch aus</div>
                <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
                  {[["PDF","255,100,100"],["XLSX","100,200,100"],["XLS","100,150,255"],["CSV","200,200,100"]].map(([f,c]) => (
                    <span key={f} style={{ background: `rgba(${c},0.1)`, border: `1px solid rgba(${c},0.25)`, borderRadius: 6, padding: "3px 10px", fontSize: 11, color: `rgb(${c})`, fontFamily: "monospace" }}>{f}</span>
                  ))}
                </div>
                <input ref={fileRef} type="file" accept=".pdf,.xlsx,.xls,.csv" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
              </div>
            ) : (
              <div style={S.fileLoaded}>
                <span style={{ fontSize: 26 }}>{fileName.endsWith(".pdf") ? "📄" : "📊"}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#00e5a0" }}>{fileName}</div>
                  <div style={{ fontSize: 12, color: "#6b8280", marginTop: 2 }}>{status}</div>
                </div>
                <button style={S.removeBtn} onClick={resetFile}>✕</button>
              </div>
            )}
          </div>
        )}

        {/* MANUAL MODE */}
        {mode === "manual" && (
          <>
            <div style={S.card}>
              <div style={S.cardTitle}>Unternehmensdaten</div>
              <div style={S.grid2}>
                <div style={S.field}>
                  <label style={S.label}>Unternehmensname</label>
                  <input style={S.input} placeholder="z.B. Müller GmbH" value={form.company} onChange={e => set("company", e.target.value)} />
                </div>
                <div style={S.field}>
                  <label style={S.label}>Berichtszeitraum</label>
                  <select style={S.select} value={form.period} onChange={e => set("period", e.target.value)}>
                    {PERIODS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div style={S.field}>
                  <label style={S.label}>Branche</label>
                  <select style={S.select} value={form.industry} onChange={e => set("industry", e.target.value)}>
                    {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div style={S.card}>
              <div style={S.cardTitle}>Finanzkennzahlen</div>
              <div style={S.kpiGrid}>
                {[
                  { label: "Umsatz", key: "revenue", unit: "€" },
                  { label: "Vorjahr Umsatz", key: "revenuePrev", unit: "€" },
                  { label: "Gewinn / EBIT", key: "profit", unit: "€" },
                  { label: "Kosten gesamt", key: "costs", unit: "€" },
                  { label: "Liquidität", key: "liquidity", unit: "€" },
                  { label: "Mitarbeiter", key: "employees", unit: "FTE" },
                ].map(({ label, key, unit }) => (
                  <div key={key} style={S.kpiBox}>
                    <div style={S.kpiLabel}>{label}</div>
                    <div style={S.kpiRow}>
                      <input style={S.kpiInput} type="number" placeholder="0" value={form[key]} onChange={e => set(key, e.target.value)} />
                      <span style={S.kpiUnit}>{unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={S.card}>
              <div style={S.cardTitle}>Kontext (optional)</div>
              <textarea style={S.textarea} placeholder="z.B. Neukunde gewonnen, Produktlaunch, unerwartete Kosten..." value={form.context} onChange={e => set("context", e.target.value)} />
            </div>
          </>
        )}

        {/* Gemeinsame Einstellungen */}
        <div style={S.card}>
          <div style={S.cardTitle}>Report-Einstellungen</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={S.field}>
              <label style={S.label}>Berichtstyp</label>
              <select style={S.select} value={reportType} onChange={e => setReportType(e.target.value)}>
                {REPORT_TYPES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div style={S.field}>
              <label style={S.label}>Ton des Berichts</label>
              <div style={S.toneGroup}>
                {TONES.map(t => (
                  <button key={t.id} style={S.toneBtn(tone === t.id)} onClick={() => setTone(t.id)}>{t.label}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <button style={S.btn(!canGenerate || loading)} onClick={generate} disabled={!canGenerate || loading}>
          {loading ? "⏳ KI generiert Report..." : "⚡ Finanzreport generieren"}
        </button>

        {mode === "upload" && status && !loading && (
          <div style={S.statusBar}>◈ {status}</div>
        )}

        {/* Output */}
        {(loading || report) && (
          <div style={S.outputCard}>
            <div style={S.toolbar}>
              <div style={S.dots}>
                {["#ff5f57","#ffbd2e","#28c840"].map(c => (
                  <span key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c, display: "block" }} />
                ))}
              </div>
              <span style={{ fontFamily: "monospace", fontSize: 11, color: "#3d5250", letterSpacing: "0.06em" }}>FINANZREPORT.MD</span>
              {report && (
                <button style={S.copyBtn} onClick={() => { navigator.clipboard.writeText(report); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
                  {copied ? "✓ Kopiert!" : "📋 Kopieren"}
                </button>
              )}
            </div>
            {loading && (
              <div style={{ padding: "22px 26px", fontFamily: "monospace", fontSize: 13, color: "#3d5250" }}>
                ⟳ KI analysiert und verfasst Report...
              </div>
            )}
            {report && (
              <div style={S.reportBody} dangerouslySetInnerHTML={{ __html: renderMd(report) }} />
            )}
          </div>
        )}

        <div style={S.hint}>
          <span style={{ fontSize: 20 }}>💡</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#00e5a0", marginBottom: 3 }}>Als SaaS: 49–99€/Monat</div>
            <div style={{ fontSize: 13, color: "#6b8280", lineHeight: 1.5 }}>Steuerberater & Buchhalter sparen 30–60 Min. pro Report. 10 Kunden = 500–1.000€/Monat.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

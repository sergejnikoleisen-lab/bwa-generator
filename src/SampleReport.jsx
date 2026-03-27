import { useState } from "react";

const KPI = ({ label, value, badge, badgeColor }) => (
  <div style={{ background: "#f8fafc", borderRadius: 10, padding: "14px 16px", border: "1px solid #e8eef6" }}>
    <div style={{ fontSize: 10, color: "#9aa5b4", textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: "monospace", marginBottom: 5 }}>{label}</div>
    <div style={{ fontSize: 20, fontWeight: 700, color: "#0d1f3c", marginBottom: 3 }}>{value}</div>
    <div style={{ fontSize: 11, fontWeight: 600, color: badgeColor }}>{badge}</div>
  </div>
);

const Section = ({ title }) => (
  <div style={{ fontSize: 15, fontWeight: 700, color: "#0d1f3c", borderBottom: "2px solid #dde8f8", paddingBottom: 8, margin: "22px 0 10px", fontFamily: "system-ui,sans-serif" }}>{title}</div>
);

const P = ({ children }) => (
  <p style={{ fontSize: 13, color: "#4a5568", lineHeight: 1.75, margin: "0 0 10px", fontFamily: "system-ui,sans-serif" }}>{children}</p>
);

export default function SampleReport() {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <div style={{ marginBottom: 20 }}>
      {/* Toggle Button */}
      <button
        onClick={() => setOpen(o => !o)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: "100%", padding: "14px 20px",
          background: hovered ? "#f0f5ff" : "#f8faff",
          border: `1.5px solid ${hovered ? "#1a4fd6" : "#c7d8fb"}`,
          borderRadius: open ? "12px 12px 0 0" : 12,
          cursor: "pointer", fontFamily: "system-ui,sans-serif",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          transition: "all 0.2s",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18 }}>👁</span>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#1a4fd6" }}>Beispiel-Report ansehen</div>
            <div style={{ fontSize: 12, color: "#6b7c99" }}>So sieht dein fertiger KI-Finanzreport aus</div>
          </div>
        </div>
        <span style={{ fontSize: 16, color: "#1a4fd6", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
      </button>

      {/* Report Preview */}
      {open && (
        <div style={{ background: "#fff", border: "1.5px solid #c7d8fb", borderTop: "none", borderRadius: "0 0 12px 12px", overflow: "hidden" }}>

          {/* Report Header */}
          <div style={{ background: "linear-gradient(135deg,#0d1f3c,#1a3a7a)", padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
              <span style={{ fontFamily: "monospace", fontSize: 11, color: "#93b4f8", letterSpacing: "0.08em" }}>FINANZREPORT · KI-GENERIERT</span>
            </div>
            <span style={{ fontSize: 11, color: "#475569", fontFamily: "monospace" }}>bwa-generator.de</span>
          </div>

          {/* Report Body */}
          <div style={{ padding: "28px 32px", position: "relative" }}>

            {/* Watermark */}
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%) rotate(-30deg)", fontSize: 64, fontWeight: 800, color: "rgba(26,79,214,0.05)", pointerEvents: "none", letterSpacing: "0.2em", whiteSpace: "nowrap", zIndex: 0 }}>MUSTER</div>

            <div style={{ position: "relative", zIndex: 1 }}>
              {/* Badge */}
              <div style={{ display: "inline-block", background: "#fef3c7", color: "#7c5a00", fontSize: 11, padding: "4px 12px", borderRadius: 100, border: "1px solid #fcd34d", marginBottom: 14, fontWeight: 600, fontFamily: "system-ui,sans-serif" }}>
                Beispiel · Mustermann GmbH · Q1 2026
              </div>

              <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0d1f3c", margin: "0 0 4px", fontFamily: "system-ui,sans-serif" }}>Quartalsreport Q1 2026</h1>
              <p style={{ fontSize: 13, color: "#9aa5b4", margin: "0 0 20px", fontFamily: "system-ui,sans-serif" }}>Mustermann GmbH · Technologie / Software · Erstellt von BWA-Generator KI</p>

              {/* KPIs */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 10, marginBottom: 4 }}>
                <KPI label="Umsatz" value="148.500 €" badge="▲ +12,4% ggü. Vorjahr" badgeColor="#16a34a" />
                <KPI label="EBIT" value="23.760 €" badge="Marge: 16,0%" badgeColor="#16a34a" />
                <KPI label="Kosten" value="124.740 €" badge="▲ +8,1% ggü. Vorjahr" badgeColor="#b45309" />
                <KPI label="Liquidität" value="87.200 €" badge="Stabil ✓" badgeColor="#16a34a" />
              </div>

              <Section title="Executive Summary" />
              <P>Die Mustermann GmbH verzeichnet im ersten Quartal 2026 eine <strong style={{ color: "#1a4fd6" }}>erfreuliche Umsatzentwicklung von 148.500 €</strong>, was einem Wachstum von 12,4% gegenüber dem Vorjahreszeitraum entspricht. Das Betriebsergebnis (EBIT) von <strong style={{ color: "#1a4fd6" }}>23.760 €</strong> bei einer Marge von 16,0% liegt im gesunden Bereich für die Branche.</P>

              <Section title="Umsatz- & Ergebnisentwicklung" />
              <P>Der Umsatzzuwachs von 12,4% ist primär auf den Ausbau des Bestandskundengeschäfts zurückzuführen. Die EBIT-Marge von 16,0% liegt <strong style={{ color: "#1a4fd6" }}>2,3 Prozentpunkte über dem Branchendurchschnitt</strong> von 13,7% und deutet auf eine effiziente Kostenstruktur hin.</P>

              <Section title="Strategische Empfehlungen" />
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {[
                  ["#e0f2fe","#0369a1","1","Vertrieb ausbauen:","Die starke Marge von 16% bietet Spielraum für Investitionen. Empfehlung: 1–2 zusätzliche Vertriebsmitarbeiter bis Q3 2026."],
                  ["#fef3c7","#92400e","2","Kostenentwicklung beobachten:","Der Kostenanstieg von 8,1% sollte im nächsten Quartal genau analysiert werden — insbesondere Personalkosten und externe Dienstleister."],
                  ["#dcfce7","#166534","3","Liquiditätsreserve erhöhen:","87.200 € entsprechen ca. 2,1 Monatsgehältern. Empfehlung: Zielgröße auf 3 Monatsgehälter als strategische Reserve erhöhen."],
                ].map(([bg, color, num, title, text]) => (
                  <div key={num} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "10px 0", borderBottom: "0.5px solid #f0f4f8" }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: bg, color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>{num}</div>
                    <div style={{ fontSize: 13, color: "#4a5568", lineHeight: 1.6, fontFamily: "system-ui,sans-serif" }}>
                      <strong style={{ color: "#0d1f3c" }}>{title}</strong> {text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Disclaimer */}
              <div style={{ background: "#f0f5ff", border: "1px solid #c7d8fb", borderRadius: 9, padding: "12px 16px", marginTop: 20, fontSize: 12, color: "#4a5568", fontFamily: "system-ui,sans-serif", lineHeight: 1.6 }}>
                <strong style={{ color: "#1a4fd6" }}>Dies ist ein Beispiel-Report.</strong> Echte Reports basieren auf deiner BWA und enthalten spezifische Zahlen, tiefere Analysen aller Kostenpositionen und individuelle Empfehlungen auf 3–5 Seiten — als PDF downloadbar.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

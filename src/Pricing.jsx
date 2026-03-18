import { useState } from "react";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: "4,19",
    period: "einmalig",
    priceId: "price_1TCT7BDzSxUnxOnbpC7xC6Xz",
    description: "Perfekt zum Ausprobieren",
    color: "#6b7c99",
    accent: "#e2e8f0",
    reports: "1 Report",
    features: [
      "1 Finanzreport",
      "BWA Upload (PDF & Excel)",
      "5 Berichtstypen",
      "KI-Analyse & Empfehlungen",
      "Report kopieren & speichern",
    ],
    cta: "Jetzt starten",
    popular: false,
  },
  {
    id: "pro",
    name: "Professional",
    price: "19",
    period: "/ Monat",
    priceId: "price_1TCT6dDzSxUnxOnbCbsa6CKk",
    description: "Ideal für Steuerberater & KMUs",
    color: "#1a4fd6",
    accent: "#f0f5ff",
    reports: "Unbegrenzte Reports",
    features: [
      "Unbegrenzte Finanzreports",
      "BWA Upload (PDF & Excel)",
      "Alle 5 Berichtstypen",
      "KI-Analyse & Empfehlungen",
      "Report kopieren & Download",
      "Priorität-Support",
    ],
    cta: "Professional wählen",
    popular: true,
  },
  {
    id: "agency",
    name: "Kanzlei",
    price: "39",
    period: "/ Monat",
    priceId: "price_1TCT43DzSxUnxOnbhJzfGm9Y",
    description: "Für Kanzleien & Buchhalter",
    color: "#0a2d8a",
    accent: "#e8eeff",
    reports: "Unbegrenzt + Team",
    features: [
      "Unbegrenzte Finanzreports",
      "BWA Upload (PDF & Excel)",
      "Alle 5 Berichtstypen",
      "KI-Analyse & Empfehlungen",
      "Report kopieren & Download",
      "Bis zu 5 Team-Mitglieder",
      "White-Label Reports",
      "Priorität-Support",
    ],
    cta: "Kanzlei wählen",
    popular: false,
  },
];

export default function Pricing() {
  const [loading, setLoading] = useState(null);
  const [annual, setAnnual] = useState(false);

  const handleCheckout = async (plan) => {
    setLoading(plan.id);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: plan.priceId, mode: plan.period === "einmalig" ? "payment" : "subscription" })
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (e) {
      alert("Fehler: " + e.message);
    }
    setLoading(null);
  };

  return (
    <div style={{ background: "#f4f7fc", minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>

      {/* Nav */}
      <nav style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "0 40px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, background: "linear-gradient(135deg, #1a4fd6, #0a2d8a)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 16, fontWeight: 800 }}>B</div>
          <span style={{ fontWeight: 700, fontSize: 17, letterSpacing: "-0.02em", color: "#0a1628" }}>BWA<span style={{ color: "#1a4fd6" }}>.</span>Generator</span>
        </div>
        <a href="/" style={{ fontSize: 14, color: "#1a4fd6", fontWeight: 600, textDecoration: "none" }}>← Zurück zur App</a>
      </nav>

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #0a1628 0%, #1a2d5a 100%)", padding: "56px 20px 52px", textAlign: "center" }}>
        <div style={{ display: "inline-block", background: "rgba(26,79,214,0.2)", border: "1px solid rgba(26,79,214,0.4)", borderRadius: 100, padding: "5px 16px", fontSize: 11, color: "#93b4f8", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "monospace", marginBottom: 20 }}>
          Transparent & Fair
        </div>
        <h1 style={{ fontSize: "clamp(28px,5vw,46px)", fontWeight: 800, color: "#fff", margin: "0 0 12px", letterSpacing: "-0.03em" }}>
          Einfache Preise.<br /><span style={{ color: "#93b4f8" }}>Keine versteckten Kosten.</span>
        </h1>
        <p style={{ fontSize: 16, color: "#7a9cc8", maxWidth: 440, margin: "0 auto", lineHeight: 1.7, fontWeight: 300 }}>
          Wähle den Plan der zu dir passt — von der einmaligen Nutzung bis zur Kanzlei-Lösung.
        </p>
      </div>

      {/* Plans */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 20px 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, alignItems: "start" }}>
          {PLANS.map((plan) => (
            <div key={plan.id} style={{
              background: "#fff",
              border: plan.popular ? `2px solid #1a4fd6` : "1px solid #e2e8f0",
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: plan.popular ? "0 8px 32px rgba(26,79,214,0.15)" : "0 2px 8px rgba(0,0,0,0.06)",
              position: "relative",
              transform: plan.popular ? "scale(1.03)" : "scale(1)",
              transition: "transform 0.2s",
            }}>
              {plan.popular && (
                <div style={{ background: "linear-gradient(135deg, #1a4fd6, #0a2d8a)", padding: "8px 0", textAlign: "center", fontSize: 12, fontWeight: 700, color: "#fff", letterSpacing: "0.08em" }}>
                  ⭐ BELIEBTESTER PLAN
                </div>
              )}

              <div style={{ padding: "28px 28px 0" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: plan.color, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>{plan.name}</div>
                <div style={{ fontSize: 13, color: "#9aa5b4", marginBottom: 20 }}>{plan.description}</div>

                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 6 }}>
                  <span style={{ fontSize: 42, fontWeight: 800, color: "#0a1628", letterSpacing: "-0.03em" }}>{plan.price}€</span>
                  <span style={{ fontSize: 14, color: "#9aa5b4" }}>{plan.period}</span>
                </div>

                <div style={{ background: plan.accent, border: `1px solid ${plan.color}20`, borderRadius: 8, padding: "8px 12px", fontSize: 13, color: plan.color, fontWeight: 700, marginBottom: 24, display: "inline-block" }}>
                  {plan.reports}
                </div>

                <div style={{ borderTop: "1px solid #f0f4f8", paddingTop: 20, marginBottom: 24 }}>
                  {plan.features.map((f, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      <span style={{ width: 18, height: 18, background: `${plan.color}15`, border: `1px solid ${plan.color}30`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: plan.color, flexShrink: 0, fontWeight: 700 }}>✓</span>
                      <span style={{ fontSize: 14, color: "#4a5568" }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ padding: "0 28px 28px" }}>
                <button
                  onClick={() => handleCheckout(plan)}
                  disabled={loading === plan.id}
                  style={{
                    width: "100%",
                    padding: "14px",
                    background: plan.popular ? "linear-gradient(135deg, #1a4fd6, #0a2d8a)" : "#f8fafc",
                    border: plan.popular ? "none" : `1px solid ${plan.color}40`,
                    borderRadius: 10,
                    fontSize: 15,
                    fontWeight: 700,
                    color: plan.popular ? "#fff" : plan.color,
                    cursor: loading === plan.id ? "not-allowed" : "pointer",
                    opacity: loading === plan.id ? 0.7 : 1,
                    fontFamily: "system-ui, sans-serif",
                    boxShadow: plan.popular ? "0 4px 16px rgba(26,79,214,0.3)" : "none",
                    transition: "all 0.2s",
                  }}
                >
                  {loading === plan.id ? "⏳ Weiterleitung..." : plan.cta}
                </button>
                <div style={{ textAlign: "center", fontSize: 11, color: "#9aa5b4", marginTop: 10 }}>
                  🔒 Sichere Zahlung via Stripe
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div style={{ display: "flex", justifyContent: "center", gap: 32, marginTop: 48, flexWrap: "wrap" }}>
          {[["🔒", "SSL-verschlüsselt"], ["💳", "Alle Karten akzeptiert"], ["↩️", "Jederzeit kündbar"], ["🇩🇪", "DSGVO-konform"]].map(([icon, text]) => (
            <div key={text} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#6b7c99" }}>
              <span>{icon}</span><span>{text}</span>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div style={{ maxWidth: 600, margin: "48px auto 0", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 32, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0a1628", marginBottom: 24, textAlign: "center" }}>Häufige Fragen</h2>
          {[
            ["Kann ich jederzeit kündigen?", "Ja, monatliche Abos können jederzeit zum Ende des Abrechnungszeitraums gekündigt werden."],
            ["Was passiert nach der Zahlung?", "Du wirst sofort zurück zur App geleitet und kannst deinen Report generieren."],
            ["Welche Dateiformate werden unterstützt?", "PDF, Excel (XLSX, XLS) und CSV werden unterstützt."],
            ["Ist meine BWA sicher?", "Ja, deine Daten werden nur zur Report-Erstellung verwendet und nicht gespeichert."],
          ].map(([q, a]) => (
            <div key={q} style={{ borderBottom: "1px solid #f0f4f8", paddingBottom: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0a1628", marginBottom: 6 }}>{q}</div>
              <div style={{ fontSize: 13, color: "#6b7c99", lineHeight: 1.6 }}>{a}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

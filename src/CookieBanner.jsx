import { useState, useEffect } from "react";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) setVisible(true);
  }, []);

  const acceptAll = () => {
    localStorage.setItem("cookie_consent", JSON.stringify({ necessary: true, analytics: true, date: new Date().toISOString() }));
    // Enable Google Analytics
    window.gtag && window.gtag('consent', 'update', { analytics_storage: 'granted' });
    setVisible(false);
  };

  const acceptSelected = () => {
    localStorage.setItem("cookie_consent", JSON.stringify({ ...preferences, date: new Date().toISOString() }));
    if (preferences.analytics) {
      window.gtag && window.gtag('consent', 'update', { analytics_storage: 'granted' });
    } else {
      window.gtag && window.gtag('consent', 'update', { analytics_storage: 'denied' });
    }
    setVisible(false);
  };

  const rejectAll = () => {
    localStorage.setItem("cookie_consent", JSON.stringify({ necessary: true, analytics: false, date: new Date().toISOString() }));
    window.gtag && window.gtag('consent', 'update', { analytics_storage: 'denied' });
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <>
      {/* Overlay */}
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 9998, backdropFilter: "blur(2px)" }} />

      {/* Banner */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 9999,
        background: "#fff", borderTop: "2px solid #1a4fd6",
        boxShadow: "0 -8px 32px rgba(0,0,0,0.15)",
        maxHeight: "90vh", overflowY: "auto",
        fontFamily: "system-ui, sans-serif",
      }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "28px 24px" }}>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 18 }}>
            <div style={{ width: 44, height: 44, background: "linear-gradient(135deg,#1a4fd6,#0a2d8a)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>🍪</div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0d1f3c", margin: "0 0 4px" }}>Datenschutz & Cookies</h2>
              <p style={{ fontSize: 13, color: "#6b7c99", margin: 0, lineHeight: 1.5 }}>
                Wir verwenden Cookies und ähnliche Technologien, um unsere Website zu verbessern. Einige sind technisch notwendig, andere helfen uns zu verstehen wie du unsere Seite nutzt.
              </p>
            </div>
          </div>

          {/* Details Toggle */}
          {!showDetails ? (
            <button onClick={() => setShowDetails(true)} style={{ background: "none", border: "none", color: "#1a4fd6", fontSize: 13, cursor: "pointer", padding: 0, marginBottom: 20, fontFamily: "system-ui,sans-serif", fontWeight: 600, textDecoration: "underline" }}>
              Einstellungen anpassen ▾
            </button>
          ) : (
            <div style={{ marginBottom: 20 }}>
              <button onClick={() => setShowDetails(false)} style={{ background: "none", border: "none", color: "#1a4fd6", fontSize: 13, cursor: "pointer", padding: "0 0 14px", fontFamily: "system-ui,sans-serif", fontWeight: 600, textDecoration: "underline" }}>
                Einstellungen ausblenden ▴
              </button>

              {/* Necessary Cookies */}
              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "14px 16px", marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0d1f3c" }}>✅ Notwendige Cookies</div>
                  <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 100, padding: "3px 10px", fontSize: 11, color: "#16a34a", fontWeight: 700 }}>Immer aktiv</div>
                </div>
                <p style={{ fontSize: 12, color: "#6b7c99", margin: 0, lineHeight: 1.5 }}>
                  Technisch notwendig für den Betrieb der Website. Speichern z.B. deinen Zahlungsstatus und Session-Daten. Können nicht deaktiviert werden.
                </p>
              </div>

              {/* Analytics Cookies */}
              <div style={{ background: "#f8fafc", border: `1px solid ${preferences.analytics ? "#c7d8fb" : "#e2e8f0"}`, borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0d1f3c" }}>📊 Analyse-Cookies</div>
                  <button
                    onClick={() => setPreferences(p => ({ ...p, analytics: !p.analytics }))}
                    style={{
                      width: 44, height: 24, borderRadius: 100, border: "none", cursor: "pointer",
                      background: preferences.analytics ? "#1a4fd6" : "#d1d5db",
                      position: "relative", transition: "background 0.2s", flexShrink: 0
                    }}
                  >
                    <span style={{
                      position: "absolute", top: 2, left: preferences.analytics ? 22 : 2,
                      width: 20, height: 20, background: "#fff", borderRadius: "50%",
                      transition: "left 0.2s", display: "block"
                    }} />
                  </button>
                </div>
                <p style={{ fontSize: 12, color: "#6b7c99", margin: 0, lineHeight: 1.5 }}>
                  Google Analytics — hilft uns zu verstehen wie Besucher unsere Seite nutzen (Seitenaufrufe, Verweildauer, Herkunft). Keine personenbezogenen Daten werden gespeichert. Anbieter: Google Ireland Ltd., Gordon House, Dublin 4.
                </p>
              </div>
            </div>
          )}

          {/* Links */}
          <div style={{ fontSize: 12, color: "#9aa5b4", marginBottom: 20 }}>
            Mehr Infos in unserer{" "}
            <a href="/datenschutz" style={{ color: "#1a4fd6", fontWeight: 600 }}>Datenschutzerklärung</a>
            {" "}und den{" "}
            <a href="/impressum" style={{ color: "#1a4fd6", fontWeight: 600 }}>Impressum</a>.
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={acceptAll} style={{
              flex: 1, minWidth: 160, padding: "13px 20px",
              background: "linear-gradient(135deg,#1a4fd6,#0a2d8a)", border: "none",
              borderRadius: 10, fontSize: 14, fontWeight: 700, color: "#fff",
              cursor: "pointer", fontFamily: "system-ui,sans-serif",
              boxShadow: "0 4px 14px rgba(26,79,214,0.3)"
            }}>
              ✓ Alle akzeptieren
            </button>

            {showDetails && (
              <button onClick={acceptSelected} style={{
                flex: 1, minWidth: 160, padding: "13px 20px",
                background: "#f0f5ff", border: "1.5px solid #1a4fd6",
                borderRadius: 10, fontSize: 14, fontWeight: 700, color: "#1a4fd6",
                cursor: "pointer", fontFamily: "system-ui,sans-serif"
              }}>
                Auswahl speichern
              </button>
            )}

            <button onClick={rejectAll} style={{
              flex: 1, minWidth: 160, padding: "13px 20px",
              background: "#f8fafc", border: "1.5px solid #e2e8f0",
              borderRadius: 10, fontSize: 14, fontWeight: 600, color: "#6b7c99",
              cursor: "pointer", fontFamily: "system-ui,sans-serif"
            }}>
              Nur notwendige
            </button>
          </div>

          <p style={{ fontSize: 11, color: "#c0ccd8", margin: "14px 0 0", textAlign: "center" }}>
            Du kannst deine Einwilligung jederzeit in der Datenschutzerklärung widerrufen.
          </p>
        </div>
      </div>
    </>
  );
}

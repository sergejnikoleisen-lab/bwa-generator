import { useState } from "react";

const NAV = () => (
  <nav style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60, position: "sticky", top: 0, zIndex: 100 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 34, height: 34, background: "linear-gradient(135deg,#1a4fd6,#0a2d8a)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 16, fontWeight: 800 }}>B</div>
      <div>
        <span style={{ fontWeight: 800, fontSize: 16, color: "#0d1f3c" }}>BWA</span>
        <span style={{ color: "#1a4fd6", fontWeight: 800, fontSize: 16 }}>-</span>
        <span style={{ fontWeight: 800, fontSize: 16, color: "#0d1f3c" }}>Generator</span>
      </div>
    </div>
    <a href="/" style={{ fontSize: 14, color: "#1a4fd6", fontWeight: 600, textDecoration: "none" }}>← Zurück zur App</a>
  </nav>
);

const Section = ({ title, children }) => (
  <div style={{ marginBottom: 36 }}>
    <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0d1f3c", marginBottom: 14, paddingBottom: 10, borderBottom: "2px solid #dde8f8" }}>{title}</h2>
    <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.8, fontFamily: "system-ui,sans-serif" }}>{children}</div>
  </div>
);

const P = ({ children }) => <p style={{ margin: "0 0 10px" }}>{children}</p>;

function Impressum() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 20px 60px" }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "inline-block", background: "#f0f5ff", border: "1px solid #c7d8fb", borderRadius: 100, padding: "4px 14px", fontSize: 11, color: "#1a4fd6", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "monospace", marginBottom: 12 }}>Rechtliches</div>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "#0d1f3c", margin: "0 0 8px", letterSpacing: "-0.02em" }}>Impressum</h1>
        <p style={{ fontSize: 14, color: "#9aa5b4", fontFamily: "system-ui,sans-serif" }}>Angaben gemäß § 5 TMG</p>
      </div>

      <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 16, padding: 32, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>

        <Section title="Anbieter">
          <P><strong>Sergej Nikoleisen</strong></P>
          <P>Annenstr. 2<br />33332 Gütersloh<br />Deutschland</P>
        </Section>

        <Section title="Kontakt">
          <P>E-Mail: <a href="mailto:bwagenerator@gmail.com" style={{ color: "#1a4fd6" }}>bwagenerator@gmail.com</a></P>
          <P style={{ fontSize: 13, color: "#6b7c99", fontStyle: "italic" }}>
            Hinweis: Eine Telefonnummer ist gemäß § 5 Abs. 1 Nr. 2 TMG nicht zwingend erforderlich, wenn eine andere schnelle elektronische Kontaktaufnahme möglich ist.
          </P>
        </Section>

        <Section title="Verantwortlich für den Inhalt">
          <P>Sergej Nikoleisen<br />Annenstr. 2<br />33332 Gütersloh</P>
        </Section>

        <Section title="Steuerliche Angaben">
          <P>Steuernummer: <strong>351/2443/4375</strong></P>
          <P>Gemäß <strong>§ 19 UStG</strong> (Kleinunternehmerregelung) wird keine Umsatzsteuer berechnet und ausgewiesen.</P>
        </Section>

        <Section title="Haftungsausschluss">
          <P><strong>Haftung für Inhalte:</strong> Die Inhalte dieser Website wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Die durch den KI-generierten Reports erstellten Inhalte dienen ausschließlich als Informationsgrundlage und stellen keine Rechts- oder Steuerberatung dar.</P>
          <P><strong>Haftung für Links:</strong> Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen Einfluss haben. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.</P>
        </Section>

        <Section title="Urheberrecht">
          <P>Die durch den Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.</P>
        </Section>

        <Section title="Streitschlichtung">
          <P>Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" style={{ color: "#1a4fd6" }}>https://ec.europa.eu/consumers/odr/</a></P>
          <P>Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</P>
        </Section>

      </div>
    </div>
  );
}

function Datenschutz() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 20px 60px" }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "inline-block", background: "#f0f5ff", border: "1px solid #c7d8fb", borderRadius: 100, padding: "4px 14px", fontSize: 11, color: "#1a4fd6", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "monospace", marginBottom: 12 }}>Rechtliches</div>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "#0d1f3c", margin: "0 0 8px", letterSpacing: "-0.02em" }}>Datenschutzerklärung</h1>
        <p style={{ fontSize: 14, color: "#9aa5b4", fontFamily: "system-ui,sans-serif" }}>Gemäß DSGVO · Stand: März 2026</p>
      </div>

      <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 16, padding: 32, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>

        <Section title="1. Verantwortlicher">
          <P>Sergej Nikoleisen<br />Annenstr. 2<br />33332 Gütersloh<br />E-Mail: <a href="mailto:bwagenerator@gmail.com" style={{ color: "#1a4fd6" }}>bwagenerator@gmail.com</a></P>
        </Section>

        <Section title="2. Erhobene Daten & Zweck">
          <P><strong>Hochgeladene Dateien (BWA):</strong> Von dir hochgeladene Dateien (PDF, Excel) werden ausschließlich zur Erstellung des Finanzreports verwendet. Sie werden nicht dauerhaft gespeichert und nach der Verarbeitung nicht weitergegeben.</P>
          <P><strong>Manuell eingegebene Daten:</strong> Finanzkennzahlen und Unternehmensdaten, die du manuell eingibst, werden nur für die Dauer der Sitzung gespeichert und nicht persistent gesichert.</P>
          <P><strong>Zahlungsdaten:</strong> Zahlungen werden über Stripe verarbeitet. Wir erhalten keine vollständigen Kreditkartendaten. Stripe verarbeitet die Daten gemäß eigener Datenschutzrichtlinie (stripe.com/de/privacy).</P>
          <P><strong>Server-Logs:</strong> Bei der Nutzung unserer Website speichert unser Hosting-Anbieter (Vercel) automatisch Zugriffsdaten (IP-Adresse, Zeitstempel, aufgerufene Seiten). Diese dienen der Sicherheit und werden nach 30 Tagen gelöscht.</P>
        </Section>

        <Section title="3. KI-Verarbeitung">
          <P>Zur Erstellung der Finanzreports werden deine Daten an die Anthropic API (Claude AI) übermittelt. Anthropic verarbeitet diese Daten gemäß ihrer Datenschutzrichtlinie. Wir empfehlen, keine hochsensiblen personenbezogenen Daten in die Reports einzubeziehen.</P>
          <P>Anthropic Datenschutz: <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "#1a4fd6" }}>anthropic.com/privacy</a></P>
        </Section>

        <Section title="4. Rechtsgrundlage">
          <P>Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) für zahlungspflichtige Leistungen sowie Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse) für die technische Bereitstellung des Dienstes.</P>
        </Section>

        <Section title="5. Drittanbieter">
          <P><strong>Vercel Inc.</strong> (Hosting) — 340 Pine Street, San Francisco, CA, USA. Vercel ist unter dem EU-US Data Privacy Framework zertifiziert.</P>
          <P><strong>Stripe Inc.</strong> (Zahlungsabwicklung) — 510 Townsend Street, San Francisco, CA, USA. Stripe ist unter dem EU-US Data Privacy Framework zertifiziert.</P>
          <P><strong>Anthropic PBC</strong> (KI-Verarbeitung) — 548 Market Street, San Francisco, CA, USA.</P>
        </Section>

        <Section title="6. Deine Rechte">
          <P>Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch. Wende dich dafür an: <a href="mailto:bwagenerator@gmail.com" style={{ color: "#1a4fd6" }}>bwagenerator@gmail.com</a></P>
          <P>Außerdem hast du das Recht, dich bei der zuständigen Aufsichtsbehörde zu beschweren. In NRW ist dies die Landesbeauftragte für Datenschutz und Informationsfreiheit NRW.</P>
        </Section>

        <Section title="7. Cookies">
          <P>Diese Website verwendet keine Marketing-Cookies oder Tracking-Tools. Technisch notwendige Session-Daten (z. B. Zahlungsstatus) werden im Browser-SessionStorage gespeichert und beim Schließen des Tabs gelöscht.</P>
        </Section>

        <Section title="8. Änderungen">
          <P>Wir behalten uns vor, diese Datenschutzerklärung bei Bedarf anzupassen. Die aktuelle Version ist stets auf dieser Seite abrufbar.</P>
        </Section>

      </div>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("impressum");

  return (
    <div style={{ background: "#f0f4fb", minHeight: "100vh", fontFamily: "Georgia,serif" }}>
      <NAV />

      {/* Page Tabs */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 20px", display: "flex", gap: 0 }}>
          {[["impressum","Impressum"],["datenschutz","Datenschutz"]].map(([id, label]) => (
            <button key={id} onClick={() => setPage(id)} style={{ background: "none", border: "none", borderBottom: page === id ? "3px solid #1a4fd6" : "3px solid transparent", padding: "14px 20px", fontSize: 14, fontWeight: page === id ? 700 : 400, color: page === id ? "#1a4fd6" : "#6b7c99", cursor: "pointer", fontFamily: "system-ui,sans-serif", transition: "all 0.15s", marginBottom: -1 }}>
              {label}
            </button>
          ))}
          <a href="/agb" style={{ textDecoration: "none", borderBottom: "3px solid transparent", padding: "14px 20px", fontSize: 14, fontWeight: 400, color: "#6b7c99", display: "block", marginBottom: -1 }}>AGB</a>
        </div>
      </div>

      {page === "impressum" ? <Impressum /> : <Datenschutz />}

      {/* Footer */}
      <div style={{ borderTop: "1px solid #e2e8f0", background: "#fff", padding: "24px 32px", textAlign: "center" }}>
        <p style={{ fontSize: 12, color: "#9aa5b4", fontFamily: "system-ui,sans-serif", margin: "0 0 6px" }}>© 2026 Sergej Nikoleisen · BWA-Generator</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 20 }}>
          <button onClick={() => setPage("impressum")} style={{ background: "none", border: "none", color: "#1a4fd6", cursor: "pointer", fontSize: 13, fontFamily: "system-ui,sans-serif", fontWeight: 600 }}>Impressum</button>
          <button onClick={() => setPage("datenschutz")} style={{ background: "none", border: "none", color: "#1a4fd6", cursor: "pointer", fontSize: 13, fontFamily: "system-ui,sans-serif", fontWeight: 600 }}>Datenschutz</button>
          <a href="/agb" style={{ color: "#1a4fd6", textDecoration: "none", fontWeight: 600, fontSize: 13 }}>AGB</a>
        </div>
      </div>
    </div>
  );
}

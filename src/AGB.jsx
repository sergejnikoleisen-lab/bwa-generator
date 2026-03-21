import { useState } from "react";

const NAV = () => (
  <nav style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60, position: "sticky", top: 0, zIndex: 100 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 34, height: 34, background: "linear-gradient(135deg,#1a4fd6,#0a2d8a)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 16, fontWeight: 800 }}>B</div>
      <div>
        <span style={{ fontWeight: 800, fontSize: 16, color: "#0d1f3c" }}>BWA</span>
        <span style={{ color: "#1a4fd6", fontWeight: 800, fontSize: 16 }}>.</span>
        <span style={{ fontWeight: 800, fontSize: 16, color: "#0d1f3c" }}>Generator</span>
      </div>
    </div>
    <a href="/" style={{ fontSize: 14, color: "#1a4fd6", fontWeight: 600, textDecoration: "none" }}>← Zurück zur App</a>
  </nav>
);

const Section = ({ num, title, children }) => (
  <div style={{ marginBottom: 32 }}>
    <h2 style={{ fontSize: 17, fontWeight: 800, color: "#0d1f3c", marginBottom: 12, paddingBottom: 10, borderBottom: "2px solid #dde8f8" }}>
      § {num} {title}
    </h2>
    <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.8, fontFamily: "system-ui,sans-serif" }}>{children}</div>
  </div>
);

const P = ({ children }) => <p style={{ margin: "0 0 10px" }}>{children}</p>;

export default function AGB() {
  return (
    <div style={{ background: "#f0f4fb", minHeight: "100vh", fontFamily: "Georgia,serif" }}>
      <NAV />

      {/* Page Tabs */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 20px", display: "flex", gap: 0 }}>
          {[["impressum","Impressum"],["datenschutz","Datenschutz"],["agb","AGB"]].map(([id, label]) => (
            <a key={id} href={`/${id}`} style={{ textDecoration: "none", borderBottom: id === "agb" ? "3px solid #1a4fd6" : "3px solid transparent", padding: "14px 20px", fontSize: 14, fontWeight: id === "agb" ? 700 : 400, color: id === "agb" ? "#1a4fd6" : "#6b7c99", display: "block", marginBottom: -1 }}>
              {label}
            </a>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 20px 60px" }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "inline-block", background: "#f0f5ff", border: "1px solid #c7d8fb", borderRadius: 100, padding: "4px 14px", fontSize: 11, color: "#1a4fd6", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "monospace", marginBottom: 12 }}>Rechtliches</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "#0d1f3c", margin: "0 0 8px", letterSpacing: "-0.02em" }}>Allgemeine Geschäftsbedingungen</h1>
          <p style={{ fontSize: 14, color: "#9aa5b4", fontFamily: "system-ui,sans-serif" }}>Stand: März 2026</p>
        </div>

        <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 16, padding: 32, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>

          <Section num="1" title="Geltungsbereich">
            <P>Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Verträge zwischen Sergej Nikoleisen, Annenstr. 2, 33332 Gütersloh (nachfolgend „Anbieter") und den Nutzern des Dienstes BWA-Generator unter bwa-generator.de (nachfolgend „Nutzer").</P>
            <P>Abweichende Bedingungen des Nutzers werden nicht anerkannt, es sei denn, der Anbieter stimmt ihrer Geltung ausdrücklich schriftlich zu.</P>
          </Section>

          <Section num="2" title="Leistungsbeschreibung">
            <P>Der BWA-Generator ist ein KI-gestützter Dienst zur automatischen Erstellung von Finanzreports auf Basis von hochgeladenen BWA-Dateien (PDF, Excel, CSV) oder manuell eingegebener Finanzkennzahlen.</P>
            <P><strong>Kostenlose Leistung:</strong> Die manuelle Eingabe von Finanzkennzahlen und die Anzeige des generierten Reports sind kostenlos. Ein PDF-Download ist in der kostenlosen Version nicht enthalten.</P>
            <P><strong>Kostenpflichtige Leistung:</strong> Das Hochladen einer BWA-Datei und die anschließende KI-Analyse inkl. PDF-Download des Reports ist eine kostenpflichtige Einzelleistung zum Preis von 19,00 € (inkl. MwSt.).</P>
            <P>Die generierten Reports dienen ausschließlich als Informationsgrundlage und stellen keine Steuer-, Rechts- oder Anlageberatung dar.</P>
          </Section>

          <Section num="3" title="Vertragsschluss">
            <P>Die Darstellung des Dienstes auf der Website stellt kein rechtlich bindendes Angebot dar. Durch Klick auf den Bezahl-Button und Abschluss des Zahlungsvorgangs gibt der Nutzer ein verbindliches Angebot zum Kauf der kostenpflichtigen Leistung ab.</P>
            <P>Der Vertrag kommt mit Bestätigung der Zahlung durch den Zahlungsdienstleister Stripe zustande.</P>
          </Section>

          <Section num="4" title="Preise & Zahlung">
            <P>Der Preis für die kostenpflichtige BWA-Analyse beträgt <strong>19,00 € (inkl. gesetzlicher MwSt.)</strong> pro Report.</P>
            <P>Die Zahlung erfolgt über den Zahlungsdienstleister Stripe. Akzeptierte Zahlungsmittel sind Kreditkarte (Visa, Mastercard, American Express) sowie weitere von Stripe angebotene Methoden.</P>
            <P>Die Zahlung ist mit Abschluss des Checkout-Vorgangs sofort fällig.</P>
          </Section>

          <Section num="5" title="Widerrufsrecht">
            <P>Verbrauchern steht grundsätzlich ein Widerrufsrecht zu. Da es sich bei dem Dienst um eine digitale Leistung handelt, die sofort nach Zahlungsbestätigung erbracht wird, erlischt das Widerrufsrecht gemäß § 356 Abs. 5 BGB mit Beginn der Ausführung der Dienstleistung, sofern der Nutzer ausdrücklich zugestimmt hat und bestätigt hat, dass er sein Widerrufsrecht mit Beginn der Vertragsausführung verliert.</P>
            <P>Durch Abschluss der Zahlung stimmt der Nutzer zu, dass die Leistungserbringung sofort beginnt und das Widerrufsrecht damit erlischt.</P>
          </Section>

          <Section num="6" title="Datenschutz & Datenverarbeitung">
            <P>Hochgeladene Dateien (BWA) werden ausschließlich zur Erstellung des angeforderten Reports verwendet und nicht dauerhaft gespeichert. Details zur Datenverarbeitung sind in unserer <a href="/datenschutz" style={{ color: "#1a4fd6" }}>Datenschutzerklärung</a> beschrieben.</P>
          </Section>

          <Section num="7" title="Haftungsbeschränkung">
            <P>Der Anbieter haftet nicht für die inhaltliche Richtigkeit der durch die KI generierten Reports. Die Ergebnisse sind technologiebedingt nicht fehlerfrei und ersetzen keine professionelle steuerliche oder betriebswirtschaftliche Beratung.</P>
            <P>Die Haftung des Anbieters ist auf Vorsatz und grobe Fahrlässigkeit beschränkt. Eine Haftung für entgangenen Gewinn, mittelbare Schäden oder Folgeschäden ist ausgeschlossen, soweit gesetzlich zulässig.</P>
          </Section>

          <Section num="8" title="Verfügbarkeit">
            <P>Der Anbieter bemüht sich um eine hohe Verfügbarkeit des Dienstes, übernimmt jedoch keine Garantie für eine ununterbrochene Verfügbarkeit. Wartungsarbeiten, technische Störungen oder Ausfälle bei Drittanbietern (Vercel, Anthropic, Stripe) können die Verfügbarkeit vorübergehend einschränken.</P>
          </Section>

          <Section num="9" title="Änderungen der AGB">
            <P>Der Anbieter behält sich vor, diese AGB mit Wirkung für die Zukunft zu ändern. Änderungen werden auf der Website bekannt gegeben. Für bereits abgeschlossene Verträge gelten die zum Zeitpunkt des Vertragsschlusses gültigen AGB.</P>
          </Section>

          <Section num="10" title="Anwendbares Recht & Gerichtsstand">
            <P>Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts.</P>
            <P>Gerichtsstand für Streitigkeiten mit Unternehmern ist Gütersloh. Für Verbraucher gilt der gesetzliche Gerichtsstand.</P>
          </Section>

          <Section num="11" title="Salvatorische Klausel">
            <P>Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt. Anstelle der unwirksamen Bestimmung gilt die gesetzliche Regelung.</P>
          </Section>

          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "16px 20px", marginTop: 8 }}>
            <div style={{ fontSize: 13, color: "#6b7c99", fontFamily: "system-ui,sans-serif" }}>
              <strong style={{ color: "#0d1f3c" }}>Kontakt:</strong> Sergej Nikoleisen · Annenstr. 2 · 33332 Gütersloh · <a href="mailto:bwagenerator@gmail.com" style={{ color: "#1a4fd6" }}>bwagenerator@gmail.com</a>
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid #e2e8f0", background: "#fff", padding: "24px 32px", textAlign: "center" }}>
        <p style={{ fontSize: 12, color: "#9aa5b4", fontFamily: "system-ui,sans-serif", margin: "0 0 6px" }}>© 2026 Sergej Nikoleisen · BWA-Generator</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 20 }}>
          <a href="/impressum" style={{ color: "#1a4fd6", textDecoration: "none", fontWeight: 600, fontSize: 13 }}>Impressum</a>
          <a href="/datenschutz" style={{ color: "#1a4fd6", textDecoration: "none", fontWeight: 600, fontSize: 13 }}>Datenschutz</a>
          <a href="/agb" style={{ color: "#1a4fd6", textDecoration: "none", fontWeight: 600, fontSize: 13 }}>AGB</a>
        </div>
      </div>
    </div>
  );
}

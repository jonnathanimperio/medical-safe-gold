# DATENSCHUTZRICHTLINIE

**Medical Safe Gold - Sicheres Medizinisches Terminplanungssystem**
**Version 1.0 | Letzte Aktualisierung: Maerz 2026**

---

## 1. EINFUEHRUNG

Diese Datenschutzrichtlinie beschreibt, wie Medical Safe Gold ("wir", "unser" oder "Software") die Informationen der Benutzer ("Sie" oder "Benutzer") erhebt, verwendet, speichert und schuetzt. Durch die Nutzung der Software stimmen Sie den in dieser Richtlinie beschriebenen Praktiken zu.

## 2. ERHOBENE DATEN

### 2.1 Daten zur Lizenzvalidierung
Wir erheben ausschliesslich die folgenden Daten fuer Zwecke der Lizenzvalidierung und -aktivierung:
- **Benutzer-E-Mail**: zur Identifizierung und lizenzbezogenen Kommunikation;
- **Maschinen-ID**: eindeutige Geraetekennung, zur Bindung der Lizenz an autorisierte Hardware und zur Verhinderung unbefugter Nutzung;
- **Lizenzschluessel/CRM**: Aktivierungscode, der beim Kauf bereitgestellt wird.

### 2.2 Patientendaten
In die Software eingegebene Patientendaten (Namen, Verfahren, Daten, Zeiten, CPF und Telefonnummern) werden:
- Lokal mit dem AES-256-Algorithmus (militaerische Verschluesselung) vor der Uebertragung verschluesselt;
- In verschluesselter Form in der MongoDB Atlas Cloud-Datenbank gespeichert;
- Nur vom Benutzer zugaenglich, der den Verschluesselungsschluessel besitzt.

**Wir haben KEINEN Zugang zu entschluesselten Patientendaten.**

## 3. ZAHLUNGEN UND FINANZDATEN

### 3.1 Externer Zahlungs-Gateway
Alle Zahlungen werden ausschliesslich ueber externe und sichere Zahlungs-Gateways (Stripe, PayPal oder aehnlich) abgewickelt.

### 3.2 Kartendaten
**Wir erheben, speichern, verarbeiten oder haben KEINEN Zugang zu Kredit- oder Debitkartendaten.** Alle Finanztransaktionen erfolgen direkt auf der Plattform des Zahlungs-Gateways, der PCI-DSS-zertifiziert ist.

### 3.3 Transaktionsinformationen
Vom Zahlungs-Gateway erhalten wir nur:
- Zahlungsbestaetigung (genehmigt/abgelehnt);
- Transaktions-ID fuer Kontroll- und Erstattungszwecke;
- Mit dem Kauf verknuepfte E-Mail.

## 4. SPEICHERUNG UND SICHERHEIT

### 4.1 Verschluesselung
- Alle sensiblen Daten werden mit Fernet (AES-256-CBC) verschluesselt;
- Verschluesselungsschluessel werden lokal auf dem Geraet des Benutzers gespeichert;
- Die Serverkommunikation verwendet verschluesselte Verbindungen (TLS/SSL).

### 4.2 Infrastruktur
- Die Datenbank wird auf MongoDB Atlas gehostet, mit Servern, die internationalen Sicherheitsstandards entsprechen;
- Automatische Backups werden von der Atlas-Infrastruktur durchgefuehrt.

## 5. DATENWEITERGABE

**Wir verkaufen, vermieten oder teilen personenbezogene Daten NICHT mit Dritten**, ausser:
- Wenn gesetzlich oder durch Gerichtsbeschluss vorgeschrieben;
- Zur Erfuellung gesetzlicher oder regulatorischer Verpflichtungen;
- Mit dem Zahlungs-Gateway, beschraenkt auf das unbedingt Notwendige zur Abwicklung der Transaktion.

## 6. BENUTZERRECHTE

Der Benutzer hat das Recht:
- Auf seine gespeicherten personenbezogenen Daten zuzugreifen;
- Die Berichtigung falscher Daten zu verlangen;
- Die Loeschung seiner Daten zu verlangen (Recht auf Vergessenwerden);
- Die Einwilligung jederzeit zu widerrufen;
- Die Datenuebertragbarkeit zu verlangen.

Zur Ausuebung dieser Rechte kontaktieren Sie den Support per E-Mail.

## 7. DATENSPEICHERUNG

- Lizenzdaten werden beibehalten, solange die Lizenz aktiv ist;
- Nach einem Loeschungsantrag werden die Daten innerhalb von 30 Tagen entfernt;
- Transaktionsdaten werden fuer den durch das geltende Steuerrecht vorgeschriebenen Zeitraum aufbewahrt.

## 8. COOKIES UND TRACKING

Die Desktop-Software verwendet KEINE Cookies, Tracker oder Verhaltensmonitoring-Technologien.

## 9. MINDERJAEHRIGE

Die Software ist nicht fuer Minderjaehrige unter 18 Jahren bestimmt. Wir erheben nicht absichtlich Daten von Minderjaehrigen.

## 10. AENDERUNGEN DIESER RICHTLINIE

Wir behalten uns das Recht vor, diese Datenschutzrichtlinie zu aktualisieren. Wesentliche Aenderungen werden ueber die Software oder per E-Mail mitgeteilt.

## 11. KONTAKT

Bei Fragen zum Datenschutz:
- E-Mail: jonnathancoelhosilvacoelho@gmail.com
- WhatsApp: +55 (11) 94849-6712

## 12. RECHTLICHE KONFORMITAET

Diese Richtlinie entspricht:
- Allgemeines Datenschutzgesetz (LGPD) - Brasilien;
- Datenschutz-Grundverordnung (DSGVO) - Europaeische Union;
- Geltende Verbraucherschutzgesetze.

---

*Letzte Aktualisierung: Maerz 2026*

# DATENSCHUTZRICHTLINIE

**Medical Safe Gold - Sicheres Medizinisches Terminplanungssystem**
**Version 1.0 | Letzte Aktualisierung: Maerz 2026**

---

## IDENTIFIKATION DES DATENVERANTWORTLICHEN

- **Verantwortlicher:** Jonnathan Coelho Silva
- **CPF (Brasilianische Steuer-ID):** 380.792.048-02
- **Adresse:** Rua Aloisio Stofel, Nr. 45, Bairro Jardim Alvorada, Brasilien
- **E-Mail:** jonnathancoelhosilvacoelho@gmail.com
- **WhatsApp:** +55 (11) 94849-6712

## DATENSCHUTZBEAUFTRAGTER (DPO)

Gemaess Art. 41 der LGPD ist der Datenschutzbeauftragte:
- **Name:** Jonnathan Coelho Silva
- **E-Mail:** jonnathancoelhosilvacoelho@gmail.com
- **WhatsApp:** +55 (11) 94849-6712

---

## 1. EINFUEHRUNG

Diese Datenschutzrichtlinie beschreibt, wie Medical Safe Gold ("wir", "unser" oder "Software") die Informationen der Benutzer ("Sie" oder "Benutzer") erhebt, verwendet, speichert und schuetzt. Durch die Nutzung der Software stimmen Sie den in dieser Richtlinie beschriebenen Praktiken zu.

## 2. ERHOBENE DATEN

### 2.1 Authentifizierungs- und Zugangsdaten
Wir erheben ausschliesslich die folgenden Daten fuer Authentifizierungs- und Servicezwecke:
- **Benutzer-E-Mail**: zur Identifizierung, Anmeldung und Kommunikation;
- **Passwort**: sicher gespeichert mit kryptographischem Hashing (bcrypt), niemals im Klartext;
- **Maschinen-ID**: eindeutige Geraetekennung, zur Bindung des Kontos an autorisierte Hardware.

### 2.2 Patientendaten
In die Software eingegebene Patientendaten (Namen, Verfahren, Daten, Zeiten, CPF und Telefonnummern) werden:
- Lokal mit dem AES-256-Algorithmus (militaerische Verschluesselung) vor der Uebertragung verschluesselt;
- In verschluesselter Form in der MongoDB Atlas Cloud-Datenbank gespeichert;
- Nur vom Benutzer zugaenglich, der den Verschluesselungsschluessel besitzt.

**Wir haben KEINEN Zugang zu entschluesselten Patientendaten.**

## 3. RECHTSGRUNDLAGE FUER DIE DATENVERARBEITUNG (LGPD)

Die Verarbeitung personenbezogener Daten basiert auf den folgenden Rechtsgrundlagen gemaess Art. 7 des Gesetzes 13.709/2018 (LGPD - Brasilianisches Datenschutzgesetz):
- **Vertragsdurchfuehrung** (Art. 7, V): fuer Daten, die zur Erbringung des Dienstes erforderlich sind (E-Mail, Maschinen-ID);
- **Einwilligung** (Art. 7, I): fuer Patientendaten, die vom Benutzer in die Software eingegeben werden. Da es sich um sensible Gesundheitsdaten handelt (Art. 11, LGPD), ist die Einwilligung spezifisch und ausdruecklich;
- **Gesetzliche Verpflichtung** (Art. 7, II): fuer die Aufbewahrung von Steuer- und Transaktionsdaten.

## 4. ZAHLUNGEN UND FINANZDATEN

### 4.1 Externer Zahlungs-Gateway
Alle Zahlungen werden ausschliesslich ueber einen externen und sicheren Zahlungs-Gateway (Mercado Pago) abgewickelt.

### 4.2 Kartendaten
**Wir erheben, speichern, verarbeiten oder haben KEINEN Zugang zu Kredit- oder Debitkartendaten.** Alle Finanztransaktionen erfolgen direkt auf der Plattform des Zahlungs-Gateways, der PCI-DSS-zertifiziert ist.

### 4.3 Transaktionsinformationen
Vom Zahlungs-Gateway erhalten wir nur:
- Zahlungsbestaetigung (genehmigt/abgelehnt);
- Transaktions-ID fuer Kontroll- und Erstattungszwecke;
- Mit dem Kauf verknuepfte E-Mail.

## 5. SPEICHERUNG UND SICHERHEIT

### 5.1 Verschluesselung
- Alle sensiblen Daten werden mit Fernet (AES-256-CBC) verschluesselt;
- Passwoerter sind mit bcrypt-Hashing (10 Salt-Runden) geschuetzt;
- Verschluesselungsschluessel werden lokal auf dem Geraet des Benutzers gespeichert;
- Die Serverkommunikation verwendet verschluesselte Verbindungen (TLS/SSL).

### 5.2 Infrastruktur
- Die Datenbank wird auf MongoDB Atlas gehostet, mit Servern, die internationalen Sicherheitsstandards entsprechen;
- Automatische Backups werden von der Atlas-Infrastruktur durchgefuehrt.

## 6. DATENWEITERGABE

**Wir verkaufen, vermieten oder teilen personenbezogene Daten NICHT mit Dritten**, ausser:
- Wenn gesetzlich oder durch Gerichtsbeschluss vorgeschrieben;
- Zur Erfuellung gesetzlicher oder regulatorischer Verpflichtungen;
- Mit dem Zahlungs-Gateway, beschraenkt auf das unbedingt Notwendige zur Abwicklung der Transaktion.

## 7. BENUTZERRECHTE

Der Benutzer hat das Recht:
- Auf seine gespeicherten personenbezogenen Daten zuzugreifen;
- Die Berichtigung falscher Daten zu verlangen;
- Die Loeschung seiner Daten zu verlangen (Recht auf Vergessenwerden);
- Die Einwilligung jederzeit zu widerrufen;
- Die Datenuebertragbarkeit zu verlangen;
- Ueber die Weitergabe von Daten an Dritte informiert zu werden.

Zur Ausuebung dieser Rechte kontaktieren Sie den Datenschutzbeauftragten (DPO) per E-Mail.

## 8. DATENSPEICHERUNG

- Kontodaten werden beibehalten, solange das Konto aktiv ist;
- Nach einem Loeschungsantrag werden die Daten innerhalb von 30 Tagen entfernt;
- Transaktionsdaten werden fuer den durch das geltende Steuerrecht vorgeschriebenen Zeitraum aufbewahrt.

## 9. COOKIES UND TRACKING

Die Desktop-Software verwendet KEINE Cookies, Tracker oder Verhaltensmonitoring-Technologien.

## 10. MINDERJAEHRIGE

Die Software ist nicht fuer Minderjaehrige unter 18 Jahren bestimmt. Wir erheben nicht absichtlich Daten von Minderjaehrigen.

## 11. AENDERUNGEN DIESER RICHTLINIE

Wir behalten uns das Recht vor, diese Datenschutzrichtlinie zu aktualisieren. Wesentliche Aenderungen werden ueber die Software oder per E-Mail mitgeteilt.

## 12. KONTAKT

Bei Fragen zum Datenschutz:
- **Datenschutzbeauftragter (DPO):** Jonnathan Coelho Silva
- **E-Mail:** jonnathancoelhosilvacoelho@gmail.com
- **WhatsApp:** +55 (11) 94849-6712

## 13. RECHTLICHE KONFORMITAET

Diese Richtlinie entspricht:
- Allgemeines Datenschutzgesetz (LGPD) - Brasilien;
- Datenschutz-Grundverordnung (DSGVO) - Europaeische Union;
- Geltende Verbraucherschutzgesetze.

---

*Letzte Aktualisierung: Maerz 2026*

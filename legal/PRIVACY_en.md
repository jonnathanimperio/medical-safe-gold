# PRIVACY POLICY

**Medical Safe Gold - Secure Medical Scheduling System**
**Version 1.0 | Last updated: March 2026**

---

## DATA CONTROLLER IDENTIFICATION

- **Controller:** Jonnathan Coelho Silva
- **CPF (Brazilian Tax ID):** 380.792.048-02
- **Address:** Rua Aloisio Stofel, n. 45, Bairro Jardim Alvorada, Brazil
- **Email:** jonnathancoelhosilvacoelho@gmail.com
- **WhatsApp:** +55 (11) 94849-6712

## DATA PROTECTION OFFICER (DPO)

In compliance with Art. 41 of the LGPD, the Data Protection Officer is:
- **Name:** Jonnathan Coelho Silva
- **Email:** jonnathancoelhosilvacoelho@gmail.com
- **WhatsApp:** +55 (11) 94849-6712

---

## 1. INTRODUCTION

This Privacy Policy describes how Medical Safe Gold ("we", "our" or "Software") collects, uses, stores, and protects user information ("you" or "User"). By using the Software, you agree to the practices described in this policy.

## 2. DATA COLLECTED

### 2.1 Authentication and Access Data
We collect exclusively the following data for authentication and service operation purposes:
- **User Email**: used for identification, login, and communication;
- **Password**: stored securely with cryptographic hashing (bcrypt), never in plain text;
- **Machine ID**: unique device identifier, used to bind the account to authorized hardware.

### 2.2 Patient Data
Patient data entered into the Software (names, procedures, dates, times, CPF and phone numbers) are:
- Encrypted locally with AES-256 algorithm (military-grade encryption) before transmission;
- Stored in encrypted form in the MongoDB Atlas cloud database;
- Accessible only by the User who holds the encryption key.

**We do NOT have access to decrypted patient data.**

## 3. LEGAL BASIS FOR DATA PROCESSING (LGPD)

The processing of personal data is based on the following legal grounds under Art. 7 of Law 13.709/2018 (LGPD - Brazilian General Data Protection Law):
- **Contract performance** (Art. 7, V): for data necessary to provide the service (email, machine ID);
- **Consent** (Art. 7, I): for patient data entered by the User into the Software. As this involves sensitive health data (Art. 11, LGPD), consent is specific and explicit;
- **Legal obligation** (Art. 7, II): for retention of fiscal and transactional data.

## 4. PAYMENTS AND FINANCIAL DATA

### 4.1 External Payment Gateway
All payments are processed exclusively through an external and secure payment gateway (Mercado Pago).

### 4.2 Card Data
**We do NOT collect, store, process, or have access to credit or debit card data.** All financial transactions occur directly on the payment gateway platform, which holds PCI-DSS certification.

### 4.3 Transaction Information
We receive from the payment gateway only:
- Payment confirmation (approved/declined);
- Transaction ID for control and refund purposes;
- Email associated with the purchase.

## 5. STORAGE AND SECURITY

### 5.1 Encryption
- All sensitive data is encrypted with Fernet (AES-256-CBC);
- Passwords are protected with bcrypt hashing (10 salt rounds);
- Encryption keys are stored locally on the User's device;
- Server communication uses encrypted connection (TLS/SSL).

### 5.2 Infrastructure
- The database is hosted on MongoDB Atlas, with servers compliant with international security standards;
- Automatic backups are performed by the Atlas infrastructure.

## 6. DATA SHARING

**We do NOT sell, rent, or share personal data with third parties**, except:
- When required by law or court order;
- To fulfill legal or regulatory obligations;
- With the payment gateway, limited to what is strictly necessary to process the transaction.

## 7. USER RIGHTS

The User has the right to:
- Access their stored personal data;
- Request correction of incorrect data;
- Request deletion of their data (right to be forgotten);
- Revoke consent at any time;
- Request data portability;
- Be informed about data sharing with third parties.

To exercise any of these rights, contact the Data Protection Officer (DPO) via the support email.

## 8. DATA RETENTION

- Account data is maintained while the account is active;
- After a deletion request, data will be removed within 30 days;
- Transaction data is maintained for the period required by applicable tax legislation.

## 9. COOKIES AND TRACKING

The desktop Software does NOT use cookies, trackers, or behavioral monitoring technologies.

## 10. MINORS

The Software is not intended for minors under 18 years of age. We do not intentionally collect data from minors.

## 11. CHANGES TO THIS POLICY

We reserve the right to update this Privacy Policy. Significant changes will be communicated through the Software or by email.

## 12. CONTACT

For questions about privacy and data protection:
- **DPO:** Jonnathan Coelho Silva
- **Email:** jonnathancoelhosilvacoelho@gmail.com
- **WhatsApp:** +55 (11) 94849-6712

## 13. LEGAL COMPLIANCE

This policy complies with:
- General Data Protection Law (LGPD) - Brazil;
- General Data Protection Regulation (GDPR) - European Union;
- Applicable consumer protection legislation.

---

*Last updated: March 2026*

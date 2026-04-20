# PRIVACY POLICY

**Medical Safe Gold - Secure Medical Scheduling System**
**Version 1.0 | Last updated: March 2026**

---

## 1. INTRODUCTION

This Privacy Policy describes how Medical Safe Gold ("we", "our" or "Software") collects, uses, stores, and protects user information ("you" or "User"). By using the Software, you agree to the practices described in this policy.

## 2. DATA COLLECTED

### 2.1 License Validation Data
We collect exclusively the following data for license validation and activation purposes:
- **User Email**: used for identification and license-related communication;
- **Machine ID**: unique device identifier, used to bind the license to authorized hardware and prevent unauthorized use;
- **License Key/CRM**: activation code provided at the time of purchase.

### 2.2 Patient Data
Patient data entered into the Software (names, procedures, dates, times, CPF and phone numbers) are:
- Encrypted locally with AES-256 algorithm (military-grade encryption) before transmission;
- Stored in encrypted form in the MongoDB Atlas cloud database;
- Accessible only by the User who holds the encryption key.

**We do NOT have access to decrypted patient data.**

## 3. PAYMENTS AND FINANCIAL DATA

### 3.1 External Payment Gateway
All payments are processed exclusively through external and secure payment gateways (Stripe, PayPal, or similar).

### 3.2 Card Data
**We do NOT collect, store, process, or have access to credit or debit card data.** All financial transactions occur directly on the payment gateway platform, which holds PCI-DSS certification.

### 3.3 Transaction Information
We receive from the payment gateway only:
- Payment confirmation (approved/declined);
- Transaction ID for control and refund purposes;
- Email associated with the purchase.

## 4. STORAGE AND SECURITY

### 4.1 Encryption
- All sensitive data is encrypted with Fernet (AES-256-CBC);
- Encryption keys are stored locally on the User's device;
- Server communication uses encrypted connection (TLS/SSL).

### 4.2 Infrastructure
- The database is hosted on MongoDB Atlas, with servers compliant with international security standards;
- Automatic backups are performed by the Atlas infrastructure.

## 5. DATA SHARING

**We do NOT sell, rent, or share personal data with third parties**, except:
- When required by law or court order;
- To fulfill legal or regulatory obligations;
- With the payment gateway, limited to what is strictly necessary to process the transaction.

## 6. USER RIGHTS

The User has the right to:
- Access their stored personal data;
- Request correction of incorrect data;
- Request deletion of their data (right to be forgotten);
- Revoke consent at any time;
- Request data portability.

To exercise any of these rights, contact support via email.

## 7. DATA RETENTION

- License data is maintained while the license is active;
- After a deletion request, data will be removed within 30 days;
- Transaction data is maintained for the period required by applicable tax legislation.

## 8. COOKIES AND TRACKING

The desktop Software does NOT use cookies, trackers, or behavioral monitoring technologies.

## 9. MINORS

The Software is not intended for minors under 18 years of age. We do not intentionally collect data from minors.

## 10. CHANGES TO THIS POLICY

We reserve the right to update this Privacy Policy. Significant changes will be communicated through the Software or by email.

## 11. CONTACT

For questions about privacy and data protection:
- Email: jonnathancoelhosilvacoelho@gmail.com
- WhatsApp: +55 (11) 94849-6712

## 12. LEGAL COMPLIANCE

This policy complies with:
- General Data Protection Law (LGPD) - Brazil;
- General Data Protection Regulation (GDPR) - European Union;
- Applicable consumer protection legislation.

---

*Last updated: March 2026*

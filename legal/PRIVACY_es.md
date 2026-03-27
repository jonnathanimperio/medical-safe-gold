# POLITICA DE PRIVACIDAD

**Medical Safe Gold - Sistema de Programacion Medica Segura**
**Version 1.0 | Ultima actualizacion: Marzo de 2026**

---

## IDENTIFICACION DEL RESPONSABLE DE DATOS

- **Responsable:** Jonnathan Coelho Silva
- **CPF (ID Fiscal Brasileno):** 380.792.048-02
- **Direccion:** Rua Aloisio Stofel, n. 45, Bairro Jardim Alvorada, Brasil
- **Email:** jonnathancoelhosilvacoelho@gmail.com
- **WhatsApp:** +55 (11) 94849-6712

## DELEGADO DE PROTECCION DE DATOS (DPO)

De conformidad con el Art. 41 de la LGPD, el Delegado de Proteccion de Datos es:
- **Nombre:** Jonnathan Coelho Silva
- **Email:** jonnathancoelhosilvacoelho@gmail.com
- **WhatsApp:** +55 (11) 94849-6712

---

## 1. INTRODUCCION

Esta Politica de Privacidad describe como Medical Safe Gold ("nosotros", "nuestro" o "Software") recopila, utiliza, almacena y protege la informacion de los usuarios ("usted" o "Usuario"). Al utilizar el Software, usted acepta las practicas descritas en esta politica.

## 2. DATOS RECOPILADOS

### 2.1 Datos de Autenticacion y Acceso
Recopilamos exclusivamente los siguientes datos con fines de autenticacion y funcionamiento del servicio:
- **Correo electronico del Usuario**: utilizado para identificacion, inicio de sesion y comunicacion;
- **Contrasena**: almacenada de forma segura con hashing criptografico (bcrypt), nunca en texto plano;
- **ID de la Maquina (Machine ID)**: identificador unico del dispositivo, utilizado para vincular la cuenta al hardware autorizado.

### 2.2 Datos de Pacientes
Los datos de pacientes ingresados en el Software (nombres, procedimientos, fechas, horarios, CPF y numeros de telefono) son:
- Cifrados localmente con algoritmo AES-256 (cifrado de grado militar) antes de ser transmitidos;
- Almacenados de forma cifrada en la base de datos MongoDB Atlas en la nube;
- Accesibles solo por el Usuario que posee la clave de cifrado.

**NO tenemos acceso a los datos descifrados de los pacientes.**

## 3. BASE LEGAL PARA TRATAMIENTO DE DATOS (LGPD)

El tratamiento de datos personales se fundamenta en las siguientes bases legales previstas en el Art. 7 de la Ley 13.709/2018 (LGPD - Ley General de Proteccion de Datos de Brasil):
- **Ejecucion de contrato** (Art. 7, V): para datos necesarios para la prestacion del servicio (correo electronico, ID de la maquina);
- **Consentimiento** (Art. 7, I): para datos de pacientes ingresados por el Usuario en el Software. Al tratarse de datos sensibles de salud (Art. 11, LGPD), el consentimiento es especifico y explicito;
- **Obligacion legal** (Art. 7, II): para la retencion de datos fiscales y transaccionales.

## 4. PAGOS Y DATOS FINANCIEROS

### 4.1 Pasarela de Pago Externa
Todos los pagos son procesados exclusivamente por pasarela de pago externa y segura (Mercado Pago).

### 4.2 Datos de Tarjeta
**NO recopilamos, almacenamos, procesamos ni tenemos acceso a datos de tarjetas de credito o debito.** Todas las transacciones financieras ocurren directamente en la plataforma de la pasarela de pago, que posee certificacion PCI-DSS.

### 4.3 Informacion de Transaccion
Recibimos de la pasarela de pago unicamente:
- Confirmacion de pago (aprobado/rechazado);
- ID de la transaccion para fines de control y reembolso;
- Correo electronico asociado a la compra.

## 5. ALMACENAMIENTO Y SEGURIDAD

### 5.1 Cifrado
- Todos los datos sensibles son cifrados con Fernet (AES-256-CBC);
- Las contrasenas son protegidas con hashing bcrypt (10 salt rounds);
- Las claves de cifrado se almacenan localmente en el dispositivo del Usuario;
- La comunicacion con el servidor utiliza conexion cifrada (TLS/SSL).

### 5.2 Infraestructura
- La base de datos esta alojada en MongoDB Atlas, con servidores en conformidad con estandares internacionales de seguridad;
- Los respaldos automaticos son realizados por la infraestructura de Atlas.

## 6. COMPARTICION DE DATOS

**NO vendemos, alquilamos ni compartimos datos personales con terceros**, excepto:
- Cuando sea requerido por ley u orden judicial;
- Para cumplir obligaciones legales o regulatorias;
- Con la pasarela de pago, limitado a lo estrictamente necesario para procesar la transaccion.

## 7. DERECHOS DEL USUARIO

El Usuario tiene derecho a:
- Acceder a sus datos personales almacenados;
- Solicitar la correccion de datos incorrectos;
- Solicitar la eliminacion de sus datos (derecho al olvido);
- Revocar el consentimiento en cualquier momento;
- Solicitar la portabilidad de los datos;
- Ser informado sobre la comparticion de datos con terceros.

Para ejercer cualquiera de estos derechos, contacte al Delegado de Proteccion de Datos (DPO) por correo electronico.

## 8. RETENCION DE DATOS

- Los datos de cuenta se mantienen mientras la cuenta este activa;
- Tras una solicitud de eliminacion, los datos seran removidos en un plazo de 30 dias;
- Los datos de transaccion se mantienen por el periodo exigido por la legislacion fiscal aplicable.

## 9. COOKIES Y RASTREO

El Software de escritorio NO utiliza cookies, rastreadores ni tecnologias de monitoreo de comportamiento.

## 10. MENORES DE EDAD

El Software no esta destinado a menores de 18 anos. No recopilamos intencionalmente datos de menores.

## 11. CAMBIOS EN ESTA POLITICA

Nos reservamos el derecho de actualizar esta Politica de Privacidad. Los cambios significativos seran comunicados a traves del Software o por correo electronico.

## 12. CONTACTO

Para dudas sobre privacidad y proteccion de datos:
- **DPO:** Jonnathan Coelho Silva
- **Email:** jonnathancoelhosilvacoelho@gmail.com
- **WhatsApp:** +55 (11) 94849-6712

## 13. CONFORMIDAD LEGAL

Esta politica cumple con:
- Ley General de Proteccion de Datos (LGPD) - Brasil;
- Reglamento General de Proteccion de Datos (GDPR) - Union Europea;
- Legislaciones de proteccion al consumidor aplicables.

---

*Ultima actualizacion: Marzo de 2026*

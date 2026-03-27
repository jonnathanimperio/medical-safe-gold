# POLITICA DE PRIVACIDAD

**Medical Safe Gold - Sistema de Programacion Medica Segura**
**Version 1.0 | Ultima actualizacion: Marzo de 2026**

---

## 1. INTRODUCCION

Esta Politica de Privacidad describe como Medical Safe Gold ("nosotros", "nuestro" o "Software") recopila, utiliza, almacena y protege la informacion de los usuarios ("usted" o "Usuario"). Al utilizar el Software, usted acepta las practicas descritas en esta politica.

## 2. DATOS RECOPILADOS

### 2.1 Datos para Validacion de Licencia
Recopilamos exclusivamente los siguientes datos con fines de validacion y activacion de licencia:
- **Correo electronico del Usuario**: utilizado para identificacion y comunicacion relacionada con la licencia;
- **ID de la Maquina (Machine ID)**: identificador unico del dispositivo, utilizado para vincular la licencia al hardware autorizado y prevenir el uso no autorizado;
- **Clave de Licencia/CRM**: codigo de activacion proporcionado al momento de la compra.

### 2.2 Datos de Pacientes
Los datos de pacientes ingresados en el Software (nombres, procedimientos, fechas, horarios, CPF y numeros de telefono) son:
- Cifrados localmente con algoritmo AES-256 (cifrado de grado militar) antes de ser transmitidos;
- Almacenados de forma cifrada en la base de datos MongoDB Atlas en la nube;
- Accesibles solo por el Usuario que posee la clave de cifrado.

**NO tenemos acceso a los datos descifrados de los pacientes.**

## 3. PAGOS Y DATOS FINANCIEROS

### 3.1 Pasarela de Pago Externa
Todos los pagos son procesados exclusivamente por pasarelas de pago externas y seguras (Stripe, PayPal o similar).

### 3.2 Datos de Tarjeta
**NO recopilamos, almacenamos, procesamos ni tenemos acceso a datos de tarjetas de credito o debito.** Todas las transacciones financieras ocurren directamente en la plataforma de la pasarela de pago, que posee certificacion PCI-DSS.

### 3.3 Informacion de Transaccion
Recibimos de la pasarela de pago unicamente:
- Confirmacion de pago (aprobado/rechazado);
- ID de la transaccion para fines de control y reembolso;
- Correo electronico asociado a la compra.

## 4. ALMACENAMIENTO Y SEGURIDAD

### 4.1 Cifrado
- Todos los datos sensibles son cifrados con Fernet (AES-256-CBC);
- Las claves de cifrado se almacenan localmente en el dispositivo del Usuario;
- La comunicacion con el servidor utiliza conexion cifrada (TLS/SSL).

### 4.2 Infraestructura
- La base de datos esta alojada en MongoDB Atlas, con servidores en conformidad con estandares internacionales de seguridad;
- Los respaldos automaticos son realizados por la infraestructura de Atlas.

## 5. COMPARTICION DE DATOS

**NO vendemos, alquilamos ni compartimos datos personales con terceros**, excepto:
- Cuando sea requerido por ley u orden judicial;
- Para cumplir obligaciones legales o regulatorias;
- Con la pasarela de pago, limitado a lo estrictamente necesario para procesar la transaccion.

## 6. DERECHOS DEL USUARIO

El Usuario tiene derecho a:
- Acceder a sus datos personales almacenados;
- Solicitar la correccion de datos incorrectos;
- Solicitar la eliminacion de sus datos (derecho al olvido);
- Revocar el consentimiento en cualquier momento;
- Solicitar la portabilidad de los datos.

Para ejercer cualquiera de estos derechos, contacte al soporte por correo electronico.

## 7. RETENCION DE DATOS

- Los datos de licencia se mantienen mientras la licencia este activa;
- Tras una solicitud de eliminacion, los datos seran removidos en un plazo de 30 dias;
- Los datos de transaccion se mantienen por el periodo exigido por la legislacion fiscal aplicable.

## 8. COOKIES Y RASTREO

El Software de escritorio NO utiliza cookies, rastreadores ni tecnologias de monitoreo de comportamiento.

## 9. MENORES DE EDAD

El Software no esta destinado a menores de 18 anos. No recopilamos intencionalmente datos de menores.

## 10. CAMBIOS EN ESTA POLITICA

Nos reservamos el derecho de actualizar esta Politica de Privacidad. Los cambios significativos seran comunicados a traves del Software o por correo electronico.

## 11. CONTACTO

Para dudas sobre privacidad y proteccion de datos:
- Email: jonnathancoelhosilvacoelho@gmail.com
- WhatsApp: +55 (11) 94849-6712

## 12. CONFORMIDAD LEGAL

Esta politica cumple con:
- Ley General de Proteccion de Datos (LGPD) - Brasil;
- Reglamento General de Proteccion de Datos (GDPR) - Union Europea;
- Legislaciones de proteccion al consumidor aplicables.

---

*Ultima actualizacion: Marzo de 2026*

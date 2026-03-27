# POLITICA DE PRIVACIDADE

**Medical Safe Gold - Sistema de Agendamento Medico Seguro**
**Versao 1.0 | Ultima atualizacao: Marco de 2026**

---

## IDENTIFICACAO DO CONTROLADOR DE DADOS

- **Controlador:** Jonnathan Coelho Silva
- **CPF:** 380.792.048-02
- **Endereco:** Rua Aloisio Stofel, n. 45, Bairro Jardim Alvorada
- **E-mail:** jonnathancoelhosilvacoelho@gmail.com
- **WhatsApp:** +55 (11) 94849-6712

## ENCARREGADO DE PROTECAO DE DADOS (DPO)

Em conformidade com o Art. 41 da LGPD, o Encarregado de Protecao de Dados e:
- **Nome:** Jonnathan Coelho Silva
- **E-mail:** jonnathancoelhosilvacoelho@gmail.com
- **WhatsApp:** +55 (11) 94849-6712

---

## 1. INTRODUCAO

Esta Politica de Privacidade descreve como o Medical Safe Gold ("nos", "nosso" ou "Software") coleta, utiliza, armazena e protege as informacoes dos usuarios ("voce" ou "Usuario"). Ao utilizar o Software, voce concorda com as praticas descritas nesta politica.

## 2. DADOS COLETADOS

### 2.1 Dados para Autenticacao e Acesso
Coletamos exclusivamente os seguintes dados para fins de autenticacao e funcionamento do servico:
- **E-mail do Usuario**: utilizado para identificacao, login e comunicacao;
- **Senha**: armazenada de forma segura com hashing criptografico (bcrypt), nunca em texto puro;
- **ID da Maquina (Machine ID)**: identificador unico do dispositivo, usado para vincular a conta ao hardware autorizado.

### 2.2 Dados de Pacientes
Os dados de pacientes inseridos no Software (nomes, procedimentos, datas, horarios, CPF e numeros de telefone) sao:
- Criptografados localmente com algoritmo AES-256 (criptografia de nivel militar) antes de serem transmitidos;
- Armazenados de forma criptografada no banco de dados MongoDB Atlas em nuvem;
- Acessiveis apenas pelo Usuario que possui a chave de criptografia.

**Nos NAO temos acesso aos dados descriptografados dos pacientes.**

## 3. BASE LEGAL PARA TRATAMENTO DE DADOS (LGPD)

O tratamento de dados pessoais fundamenta-se nas seguintes bases legais previstas no Art. 7 da Lei 13.709/2018 (LGPD):
- **Execucao de contrato** (Art. 7, V): para dados necessarios a prestacao do servico (e-mail, ID da maquina);
- **Consentimento** (Art. 7, I): para dados de pacientes inseridos pelo Usuario no Software. Por se tratar de dados sensiveis de saude (Art. 11, LGPD), o consentimento e especifico e destacado;
- **Cumprimento de obrigacao legal** (Art. 7, II): para retencao de dados fiscais e transacionais.

## 4. PAGAMENTOS E DADOS FINANCEIROS

### 4.1 Gateway de Pagamento Externo
Todos os pagamentos sao processados exclusivamente por gateway de pagamento externo e seguro (Mercado Pago).

### 4.2 Dados de Cartao
**NAO coletamos, armazenamos, processamos ou temos acesso a dados de cartao de credito ou debito.** Todas as transacoes financeiras ocorrem diretamente na plataforma do gateway de pagamento, que possui certificacao PCI-DSS.

### 4.3 Informacoes de Transacao
Recebemos do gateway de pagamento apenas:
- Confirmacao de pagamento (aprovado/recusado);
- ID da transacao para fins de controle e reembolso;
- E-mail associado a compra.

## 5. ARMAZENAMENTO E SEGURANCA

### 5.1 Criptografia
- Todos os dados sensiveis sao criptografados com Fernet (AES-256-CBC);
- Senhas sao protegidas com hashing bcrypt (10 salt rounds);
- As chaves de criptografia sao armazenadas localmente no dispositivo do Usuario;
- A comunicacao com o servidor utiliza conexao criptografada (TLS/SSL).

### 5.2 Infraestrutura
- O banco de dados esta hospedado no MongoDB Atlas, com servidores em conformidade com padroes internacionais de seguranca;
- Backups automaticos sao realizados pela infraestrutura do Atlas.

## 6. COMPARTILHAMENTO DE DADOS

**NAO vendemos, alugamos ou compartilhamos dados pessoais com terceiros**, exceto:
- Quando exigido por lei ou ordem judicial;
- Para cumprir obrigacoes legais ou regulatorias;
- Com o gateway de pagamento, limitado ao estritamente necessario para processar a transacao.

## 7. DIREITOS DO USUARIO

O Usuario tem direito a:
- Acessar seus dados pessoais armazenados;
- Solicitar a correcao de dados incorretos;
- Solicitar a exclusao de seus dados (direito ao esquecimento);
- Revogar o consentimento a qualquer momento;
- Solicitar a portabilidade dos dados;
- Ser informado sobre o compartilhamento de dados com terceiros.

Para exercer qualquer destes direitos, entre em contato com o Encarregado de Dados (DPO) pelo e-mail de suporte.

## 8. RETENCAO DE DADOS

- Dados de conta sao mantidos enquanto a conta estiver ativa;
- Apos solicitacao de exclusao, os dados serao removidos em ate 30 dias;
- Dados de transacao sao mantidos pelo periodo exigido pela legislacao fiscal aplicavel.

## 9. COOKIES E RASTREAMENTO

O Software desktop NAO utiliza cookies, rastreadores ou tecnologias de monitoramento de comportamento.

## 10. MENORES DE IDADE

O Software nao e destinado a menores de 18 anos. Nao coletamos intencionalmente dados de menores.

## 11. ALTERACOES NESTA POLITICA

Reservamo-nos o direito de atualizar esta Politica de Privacidade. Alteracoes significativas serao comunicadas por meio do Software ou por e-mail.

## 12. CONTATO

Para duvidas sobre privacidade e protecao de dados:
- **Encarregado (DPO):** Jonnathan Coelho Silva
- **E-mail:** jonnathancoelhosilvacoelho@gmail.com
- **WhatsApp:** +55 (11) 94849-6712

## 13. CONFORMIDADE LEGAL

Esta politica esta em conformidade com:
- Lei Geral de Protecao de Dados (LGPD) - Brasil;
- Regulamento Geral de Protecao de Dados (GDPR) - Uniao Europeia;
- Legislacoes de protecao ao consumidor aplicaveis.

---

*Ultima atualizacao: Marco de 2026*

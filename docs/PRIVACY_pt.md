# POLITICA DE PRIVACIDADE

**Medical Safe Gold - Sistema de Agendamento Medico Seguro**
**Versao 1.0 | Ultima atualizacao: Marco de 2026**

---

## 1. INTRODUCAO

Esta Politica de Privacidade descreve como o Medical Safe Gold ("nos", "nosso" ou "Software") coleta, utiliza, armazena e protege as informacoes dos usuarios ("voce" ou "Usuario"). Ao utilizar o Software, voce concorda com as praticas descritas nesta politica.

## 2. DADOS COLETADOS

### 2.1 Dados para Validacao de Licenca
Coletamos exclusivamente os seguintes dados para fins de validacao e ativacao da licenca:
- **E-mail do Usuario**: utilizado para identificacao e comunicacao sobre a licenca;
- **ID da Maquina (Machine ID)**: identificador unico do dispositivo, usado para vincular a licenca ao hardware autorizado e prevenir uso nao autorizado;
- **Chave de Licenca/CRM**: codigo de ativacao fornecido no momento da compra.

### 2.2 Dados de Pacientes
Os dados de pacientes inseridos no Software (nomes, procedimentos, datas, horarios, CPF e numeros de telefone) sao:
- Criptografados localmente com algoritmo AES-256 (criptografia de nivel militar) antes de serem transmitidos;
- Armazenados de forma criptografada no banco de dados MongoDB Atlas em nuvem;
- Acessiveis apenas pelo Usuario que possui a chave de criptografia.

**Nos NAO temos acesso aos dados descriptografados dos pacientes.**

## 3. PAGAMENTOS E DADOS FINANCEIROS

### 3.1 Gateway de Pagamento Externo
Todos os pagamentos sao processados exclusivamente por gateways de pagamento externos e seguros (Stripe, PayPal ou similar).

### 3.2 Dados de Cartao
**NAO coletamos, armazenamos, processamos ou temos acesso a dados de cartao de credito ou debito.** Todas as transacoes financeiras ocorrem diretamente na plataforma do gateway de pagamento, que possui certificacao PCI-DSS.

### 3.3 Informacoes de Transacao
Recebemos do gateway de pagamento apenas:
- Confirmacao de pagamento (aprovado/recusado);
- ID da transacao para fins de controle e reembolso;
- E-mail associado a compra.

## 4. ARMAZENAMENTO E SEGURANCA

### 4.1 Criptografia
- Todos os dados sensiveis sao criptografados com Fernet (AES-256-CBC);
- As chaves de criptografia sao armazenadas localmente no dispositivo do Usuario;
- A comunicacao com o servidor utiliza conexao criptografada (TLS/SSL).

### 4.2 Infraestrutura
- O banco de dados esta hospedado no MongoDB Atlas, com servidores em conformidade com padroes internacionais de seguranca;
- Backups automaticos sao realizados pela infraestrutura do Atlas.

## 5. COMPARTILHAMENTO DE DADOS

**NAO vendemos, alugamos ou compartilhamos dados pessoais com terceiros**, exceto:
- Quando exigido por lei ou ordem judicial;
- Para cumprir obrigacoes legais ou regulatorias;
- Com o gateway de pagamento, limitado ao estritamente necessario para processar a transacao.

## 6. DIREITOS DO USUARIO

O Usuario tem direito a:
- Acessar seus dados pessoais armazenados;
- Solicitar a correcao de dados incorretos;
- Solicitar a exclusao de seus dados (direito ao esquecimento);
- Revogar o consentimento a qualquer momento;
- Solicitar a portabilidade dos dados.

Para exercer qualquer destes direitos, entre em contato pelo e-mail de suporte.

## 7. RETENCAO DE DADOS

- Dados de licenca sao mantidos enquanto a licenca estiver ativa;
- Apos solicitacao de exclusao, os dados serao removidos em ate 30 dias;
- Dados de transacao sao mantidos pelo periodo exigido pela legislacao fiscal aplicavel.

## 8. COOKIES E RASTREAMENTO

O Software desktop NAO utiliza cookies, rastreadores ou tecnologias de monitoramento de comportamento.

## 9. MENORES DE IDADE

O Software nao e destinado a menores de 18 anos. Nao coletamos intencionalmente dados de menores.

## 10. ALTERACOES NESTA POLITICA

Reservamo-nos o direito de atualizar esta Politica de Privacidade. Alteracoes significativas serao comunicadas por meio do Software ou por e-mail.

## 11. CONTATO

Para duvidas sobre privacidade e protecao de dados:
- E-mail: jonnathancoelhosilvacoelho@gmail.com
- WhatsApp: +55 (11) 94849-6712

## 12. CONFORMIDADE LEGAL

Esta politica esta em conformidade com:
- Lei Geral de Protecao de Dados (LGPD) - Brasil;
- Regulamento Geral de Protecao de Dados (GDPR) - Uniao Europeia;
- Legislacoes de protecao ao consumidor aplicaveis.

---

*Ultima atualizacao: Marco de 2026*

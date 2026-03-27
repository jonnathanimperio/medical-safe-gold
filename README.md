# Medical Safe Gold

Aplicativo desktop seguro para agendamento medico, construido com Electron. Todos os dados dos pacientes sao criptografados com Fernet (AES-256) antes de serem armazenados.

## Funcionalidades

- Cadastro e login com e-mail e senha
- Agendamento de consultas (nome, servico, dia, hora, CPF, WhatsApp)
- Criptografia ponta-a-ponta dos dados dos pacientes (Fernet/AES-256)
- Busca e filtro de agendamentos
- Exclusao segura de registros
- Recuperacao de senha por e-mail
- Interface em 4 idiomas (Portugues, Ingles, Alemao, Espanhol)
- Licenciamento por chave (mensal e anual)
- Landing page inclusa

## Requisitos

- [Node.js](https://nodejs.org/) 18 ou superior
- [npm](https://www.npmjs.com/) (incluido com o Node.js)
- Backend API rodando (ver secao Backend)

## Instalacao

```bash
# Clone o repositorio
git clone https://github.com/jonnathanimperio/medical-safe-gold.git
cd medical-safe-gold

# Instale as dependencias
npm install
```

## Configuracao

O app se conecta ao backend atraves da URL definida no arquivo `config.json` na raiz do projeto:

```json
{
  "api_url": "http://localhost:8000"
}
```

**Para apontar para um servidor remoto (producao):**

```json
{
  "api_url": "https://seu-servidor.com"
}
```

O app procura o `config.json` em duas localizacoes (nesta ordem):
1. Na pasta do projeto (ao lado do `main.js`)
2. Na pasta de dados do usuario (`%APPDATA%/medical-safe-gold/` no Windows)

Se nenhum `config.json` for encontrado, o app usa `http://localhost:8000` como padrao.

## Como rodar (modo desenvolvimento)

1. Primeiro, inicie o backend (ver secao Backend abaixo)
2. Depois, inicie o app:

```bash
npm start
```

O app vai abrir uma janela desktop com a interface do Medical Safe Gold.

## Como gerar o instalador (.exe / .dmg / .AppImage)

```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux
```

Os arquivos gerados ficam na pasta `dist/`.

## Estrutura do Projeto

```
medical-safe-gold/
├── main.js                  # Processo principal do Electron (IPC, API, criptografia)
├── preload.js               # Bridge segura entre main e renderer
├── config.json              # Configuracao da URL do backend
├── package.json             # Dependencias e scripts
├── assets/                  # Icones e imagens de fundo
│   ├── icon.ico
│   ├── icon.png
│   ├── bg-medical.jpg
│   ├── bg-alerts.jpg
│   ├── bg-search.jpg
│   ├── bg-summary.jpg
│   └── bg-vault.jpg
├── renderer/                # Interface do usuario (frontend)
│   ├── index.html           # HTML principal
│   ├── app.js               # Logica do frontend
│   ├── styles.css           # Estilos CSS
│   └── translations.js      # Traducoes (PT/EN/DE/ES)
├── landing/                 # Landing page para download/venda
│   ├── index.html
│   ├── privacy.html
│   ├── EULA_*.md
│   └── PRIVACY_*.md
└── legal/                   # Documentos legais (EULA, Privacidade, Licenca)
    ├── LICENSE.rtf
    ├── EULA_*.md
    └── PRIVACY_*.md
```

## Backend (API)

O app precisa de um backend API rodando para funcionar. O backend esta no repositorio separado:

**Repositorio:** [jonnathanimperio/medical-safe-gold-api](https://github.com/jonnathanimperio/medical-safe-gold-api)

O backend usa:
- **FastAPI** (Python)
- **MongoDB Atlas** (banco de dados na nuvem)
- **Fernet** (criptografia dos dados)

### Variaveis de ambiente do backend

| Variavel    | Descricao                          |
|-------------|------------------------------------|
| `MONGO_URI` | URI de conexao com o MongoDB Atlas |
| `MASTER_KEY`| Chave mestre para criptografia     |

## Tecnologias

- **Electron** 28 - Framework desktop multiplataforma
- **Fernet** - Criptografia simetrica (AES-256-CBC)
- **MongoDB Atlas** - Banco de dados na nuvem
- **FastAPI** - Backend API (Python)
- **electron-builder** - Empacotamento e distribuicao

## Seguranca

- Dados dos pacientes sao criptografados antes de sair do app
- Cada usuario tem sua propria chave de criptografia
- Comunicacao via HTTPS com autenticacao JWT
- Identificacao por machine ID para vincular licenca ao dispositivo
- Nenhum dado sensivel e armazenado em texto puro

## Licenca

Proprietary - Todos os direitos reservados.
Veja os termos completos em `legal/EULA_pt.md`.

## Autor

**Jonnathan Coelho Silva**

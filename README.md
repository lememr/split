# Split - Sistema de Load Balance de Páginas

Sistema de roteamento inteligente e distribuição de carga para páginas de marketing (MHT Digital Split).

## O que é o Split?

O Split é um sistema que permite gerenciar múltiplas páginas de destino e distribuir o tráfego entre elas com base em regras configuráveis. Ideal para testes A/B, balanceamento de carga entre servidores, ou campanhas com múltiplas variações de landing page.

## Features

- **CRUD de Páginas**: Cadastro, edição, listagem e exclusão de páginas com URLs, pesos e status
- **Distribuição de Carga**: Algoritmo de rotação ponderada para balancear tráfego entre páginas ativas
- **Tracking de Clicks**: Registro de redirecionamentos com timestamp, IP e user-agent
- **Analytics em Tempo Real**: Estatísticas de acessos por página e período
- **Dashboard Administrativo**: Interface limpa para gerenciar tudo via web

## Stack

- **Next.js 14.2** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS 3.4**
- **Vercel KV** (Redis serverless para persistência)
- **Lucide React** (ícones)

## Estrutura de Arquivos

```
split/
├── app/
│   ├── api/
│   │   ├── pages/
│   │   │   └── route.ts        # CRUD de páginas
│   │   ├── redirect/
│   │   │   └── route.ts        # Endpoint de redirecionamento
│   │   ├── track/
│   │   │   └── route.ts        # Registro de eventos
│   │   └── stats/
│   │       └── route.ts        # Estatísticas
│   ├── dashboard/
│   │   └── page.tsx            # Painel administrativo
│   ├── globals.css             # Estilos globais + Tailwind
│   ├── layout.tsx              # Layout raiz
│   └── page.tsx                # Página inicial
├── components/                  # Componentes React reutilizáveis
├── lib/
│   ├── kv.ts                   # Cliente Vercel KV
│   └── utils.ts                # Helpers
├── public/
├── next.config.js              # Configuração Next.js
├── tailwind.config.ts          # Configuração Tailwind
├── tsconfig.json               # Configuração TypeScript
├── postcss.config.js           # PostCSS
├── package.json                # Dependências
└── .env.example                # Variáveis de ambiente
```

## Como rodar local

1. **Instalar dependências**:
   ```bash
   npm install
   ```

2. **Configurar variáveis de ambiente**:
   ```bash
   cp .env.example .env.local
   # Edite .env.local com suas credenciais Vercel KV
   ```

3. **Iniciar servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```

4. Acesse `http://localhost:3000`

## Como fazer deploy

1. **Criar projeto na Vercel**:
   ```bash
   vercel
   ```

2. **Configurar Vercel KV**:
   - No dashboard da Vercel, vá em **Storage** > **Create KV Database**
   - Conecte o KV ao seu projeto

3. **Configurar variáveis de ambiente** no dashboard da Vercel:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `NEXT_PUBLIC_SPLIT_URL`

4. **Deploy**:
   ```bash
   vercel --prod
   ```

## Variáveis de Ambiente

| Variável | Descrição | Obrigatório |
|----------|-----------|-------------|
| `KV_REST_API_URL` | Endpoint REST do Vercel KV | Sim |
| `KV_REST_API_TOKEN` | Token de acesso ao KV | Sim |
| `NEXT_PUBLIC_SPLIT_URL` | URL pública da aplicação | Sim |

## API Endpoints

### `/api/pages`

- `GET` - Lista todas as páginas
- `POST` - Cria nova página (`{ name, url, weight, active }`)
- `PUT` - Atualiza página existente
- `DELETE` - Remove página

### `/api/redirect`

- `GET` - Retorna URL de destino baseada na distribuição de pesos

### `/api/track`

- `POST` - Registra evento de redirecionamento (`{ pageId, ip, ua }`)

### `/api/stats`

- `GET` - Retorna estatísticas de acessos (por página e período)

## Licença

MIT

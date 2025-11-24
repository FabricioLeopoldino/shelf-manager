# SmartShelf Manager

Sistema completo de gerenciamento de inventário com integração Shopify.

## 🚀 Características

- ✅ Gerenciamento completo de inventário
- ✅ Sistema de pallets e localizações
- ✅ Integração com Shopify
- ✅ Logs de auditoria completos
- ✅ WebSocket para atualizações em tempo real
- ✅ Dashboard com estatísticas
- ✅ Autenticação JWT integrada com LeautoTech Portal
- ✅ Interface responsiva (mobile, tablet, desktop)
- ✅ Pronto para deploy no Render.com

## 📦 Tecnologias

### Backend
- **Framework**: Express.js (Node.js)
- **ORM**: Sequelize
- **Banco de Dados**: PostgreSQL
- **Autenticação**: JWT
- **WebSocket**: Socket.IO
- **API Externa**: Shopify REST API

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Routing**: React Router v6
- **Icons**: Lucide React

## 🛠️ Instalação Local

### Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- npm ou pnpm

### Passos

#### 1. Backend

```bash
cd backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite .env com suas configurações

# Iniciar servidor de desenvolvimento
npm run dev
```

Servidor rodando em: `http://localhost:3000`

#### 2. Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite .env com suas configurações

# Iniciar servidor de desenvolvimento
npm run dev
```

Frontend rodando em: `http://localhost:5173`

#### 3. Build Completo (Produção)

```bash
cd backend

# Este comando vai:
# 1. Instalar deps do frontend
# 2. Buildar React
# 3. Copiar build para backend/public
npm run build:frontend

# Iniciar servidor em modo produção
npm start
```

## 📁 Estrutura do Projeto

```
shelf-manager/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js       # Configuração Sequelize
│   │   ├── middleware/
│   │   │   └── auth.js           # Middleware JWT
│   │   ├── models/
│   │   │   ├── Item.js           # Model de Item
│   │   │   ├── Pallet.js         # Model de Pallet
│   │   │   ├── Log.js            # Model de Log
│   │   │   └── index.js          # Exportação de models
│   │   ├── routes/
│   │   │   ├── auth.js           # Rotas de autenticação
│   │   │   ├── inventory.js     # Rotas de inventário
│   │   │   ├── pallets.js        # Rotas de pallets
│   │   │   ├── shopify.js        # Rotas Shopify
│   │   │   └── logs.js           # Rotas de logs
│   │   └── server.js             # Servidor Express
│   ├── public/                   # Build do React (gerado)
│   ├── package.json
│   ├── .env.example
│   └── build-frontend.sh         # Script de build
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── Layout.jsx        # Layout principal
    │   ├── pages/
    │   │   ├── Dashboard.jsx     # Dashboard
    │   │   ├── Inventory.jsx     # Inventário
    │   │   ├── Pallets.jsx       # Pallets
    │   │   ├── Logs.jsx          # Logs
    │   │   └── NotFound.jsx      # 404
    │   ├── services/
    │   │   └── api.js            # Cliente API
    │   ├── utils/
    │   │   └── store.js          # Zustand stores
    │   ├── App.jsx               # Componente principal
    │   ├── main.jsx              # Entry point
    │   └── index.css             # Estilos globais
    ├── public/
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    └── package.json
```

## 🗄️ Banco de Dados

### Modelos

#### Item (Inventário)
- `id` (UUID)
- `sku` (String, único)
- `name` (String)
- `description` (Text)
- `category` (String)
- `quantity` (Integer)
- `minQuantity` (Integer)
- `maxQuantity` (Integer)
- `price` (Decimal)
- `cost` (Decimal)
- `location` (String)
- `barcode` (String)
- `shopifyProductId` (String)
- `shopifyVariantId` (String)
- `imageUrl` (String)
- `status` (Enum: active, inactive, discontinued)
- `palletId` (FK → Pallet)

#### Pallet
- `id` (UUID)
- `palletNumber` (String, único)
- `location` (String)
- `status` (Enum: available, in_use, full, maintenance)
- `capacity` (Integer)
- `currentLoad` (Integer)
- `notes` (Text)

#### Log
- `id` (UUID)
- `action` (String)
- `entityType` (String)
- `entityId` (String)
- `userEmail` (String)
- `details` (JSONB)
- `ipAddress` (String)
- `userAgent` (String)
- `createdAt` (Timestamp)

### Sincronização

O Sequelize sincroniza automaticamente os modelos com o banco na inicialização:

```javascript
await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
```

## 🔌 API Endpoints

### Autenticação

- `POST /api/auth/verify` - Verificar token JWT
- `GET /api/auth/me` - Obter usuário atual
- `POST /api/auth/refresh` - Renovar token

### Inventário

- `GET /api/inventory` - Listar itens (com paginação e filtros)
- `GET /api/inventory/:id` - Obter item específico
- `POST /api/inventory` - Criar novo item
- `PUT /api/inventory/:id` - Atualizar item
- `DELETE /api/inventory/:id` - Deletar item
- `PATCH /api/inventory/:id/quantity` - Atualizar quantidade
- `GET /api/inventory/stats/summary` - Estatísticas

### Pallets

- `GET /api/pallets` - Listar pallets
- `GET /api/pallets/:id` - Obter pallet específico
- `POST /api/pallets` - Criar novo pallet
- `PUT /api/pallets/:id` - Atualizar pallet
- `DELETE /api/pallets/:id` - Deletar pallet
- `POST /api/pallets/:id/items/:itemId` - Atribuir item ao pallet
- `DELETE /api/pallets/:id/items/:itemId` - Remover item do pallet

### Shopify

- `GET /api/shopify/products` - Listar produtos Shopify
- `POST /api/shopify/sync` - Sincronizar produtos
- `PUT /api/shopify/inventory/:id` - Atualizar estoque no Shopify

### Logs

- `GET /api/logs` - Listar logs (com filtros)
- `GET /api/logs/:id` - Obter log específico
- `GET /api/logs/stats/summary` - Estatísticas de logs
- `DELETE /api/logs/cleanup` - Limpar logs antigos

### Health Check

- `GET /api/health` - Status do servidor

## 🔐 Autenticação

O sistema aceita dois tipos de tokens JWT:

1. **Token do LeautoTech Portal** - Validado com `LEAUTOTECH_JWT_SECRET`
2. **Token Interno** - Validado com `JWT_SECRET`

### Fluxo de Autenticação

1. Usuário faz login no LeautoTech Portal
2. Portal gera token JWT com `LEAUTOTECH_JWT_SECRET`
3. Usuário é redirecionado para SmartShelf com token na URL
4. SmartShelf valida token e permite acesso
5. Token é armazenado no localStorage/sessionStorage

### Uso da API

```javascript
// Headers necessários
Authorization: Bearer <token-jwt>
Content-Type: application/json
```

## 🛍️ Integração Shopify

### Configuração

1. Crie um app privado no Shopify Admin
2. Obtenha o Access Token
3. Configure variáveis de ambiente:

```env
SHOPIFY_STORE_URL=https://sua-loja.myshopify.com
SHOPIFY_ACCESS_TOKEN=shpat_xxxxxxxxxxxxx
```

### Funcionalidades

- ✅ Importar produtos do Shopify
- ✅ Sincronizar inventário
- ✅ Atualizar quantidades no Shopify
- ✅ Manter SKUs sincronizados

### Sincronização

```bash
# Via API
POST /api/shopify/sync

# Resultado
{
  "message": "Shopify sync completed",
  "results": {
    "created": 10,
    "updated": 5,
    "errors": []
  }
}
```

## 🌐 Deploy no Render.com

### Configuração Rápida

1. **Root Directory**: `backend`
2. **Build Command**: `npm install && npm run build:frontend`
3. **Start Command**: `npm start`
4. **Environment**: Node

### Variáveis de Ambiente Necessárias

```env
PORT=3000
NODE_ENV=production
CORS_ORIGIN=*

# Database
DB_HOST=<render-postgres-host>
DB_PORT=5432
DB_USER=<db-user>
DB_PASSWORD=<db-password>
DB_NAME=smartshelf_db
DB_SSL=true

# JWT
JWT_SECRET=<chave-interna>
LEAUTOTECH_JWT_SECRET=<mesma-do-portal>

# Shopify (opcional)
SHOPIFY_STORE_URL=https://sua-loja.myshopify.com
SHOPIFY_ACCESS_TOKEN=<token>
```

### Banco de Dados PostgreSQL

1. Crie um PostgreSQL no Render
2. Use a **Internal Database URL** nas variáveis de ambiente
3. O Sequelize vai criar as tabelas automaticamente

## 🎨 Personalização

### Cores do Tema

Edite `frontend/tailwind.config.js`:

```javascript
colors: {
  primary: {
    500: '#4caf50',  // Verde principal
    // ... outras variações
  }
}
```

### Logo

Substitua o ícone de engrenagem em `frontend/src/components/Layout.jsx`.

## 📊 WebSocket (Tempo Real)

O sistema usa Socket.IO para atualizações em tempo real:

### Eventos Emitidos

- `inventory:created` - Novo item criado
- `inventory:updated` - Item atualizado
- `inventory:deleted` - Item deletado
- `inventory:quantity_updated` - Quantidade atualizada
- `pallet:created` - Novo pallet criado
- `pallet:updated` - Pallet atualizado
- `pallet:deleted` - Pallet deletado
- `shopify:synced` - Sincronização Shopify concluída

### Uso no Frontend

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

socket.on('inventory:created', (item) => {
  console.log('Novo item:', item);
  // Atualizar UI
});
```

## 🐛 Troubleshooting

### Erro: "Unable to connect to the database"

Verifique:
- PostgreSQL está rodando
- Credenciais corretas no `.env`
- `DB_SSL=true` em produção (Render)

### Erro: "Frontend não carrega"

```bash
# Rebuildar frontend
cd backend
npm run build:frontend
```

### Erro: "Invalid or expired token"

- Verifique se `LEAUTOTECH_JWT_SECRET` é igual no Portal e SmartShelf
- Token expira em 24h por padrão

### Erro: "Shopify API error"

- Verifique se `SHOPIFY_STORE_URL` está correto
- Verifique se `SHOPIFY_ACCESS_TOKEN` é válido
- Certifique-se que o app tem permissões necessárias

## 📝 Logs e Auditoria

Todas as ações são registradas automaticamente:

- Criação, atualização e deleção de itens
- Alterações de quantidade
- Operações com pallets
- Sincronizações Shopify
- Limpeza de logs

### Limpeza de Logs Antigos

```bash
# Via API (deletar logs > 90 dias)
DELETE /api/logs/cleanup?days=90
```

## 📄 Licença

MIT License - LeautoTech © 2025

## 🤝 Suporte

Para suporte, consulte o `DEPLOYMENT_GUIDE.md` ou entre em contato com a equipe LeautoTech.

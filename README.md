# Kuroukai Free API

API simples para gerar e gerenciar chaves de acesso gratuitas, ideal para integração com bots do Discord.

## Características

- 🔑 Geração automática de chaves de acesso
- ⏰ Sistema de expiração configurável
- 👤 Associação de chaves a usuários (Discord ID)
- 📊 Rastreamento de uso e estatísticas
- 🔒 Validação segura de chaves
- 🌐 Endpoint especial para arquivo .js com tela preta

## Instalação

### 🚀 Deploy no Railway (Recomendado)

**Para colocar no ar rapidamente:**

1. **Faça fork** deste repositório
2. Acesse [Railway.app](https://railway.app)
3. Clique em **"Deploy from GitHub repo"**
4. Selecione este repositório
5. Aguarde o deploy automático
6. Sua API estará online!

📖 **[Guia Completo de Deploy no Railway →](./RAILWAY_DEPLOY.md)**

### 💻 Instalação Local

```bash
git clone https://github.com/Kuroukai/Kuroukai-free-api.git
cd Kuroukai-free-api
npm install
npm start
```

## API Endpoints

### 1. Criar Nova Chave

**POST** `/api/keys/create`

```json
{
  "user_id": "discord_user_id",
  "hours": 24
}
```

**Resposta:**
```json
{
  "msg": "Key created successfully",
  "code": 200,
  "data": {
    "key_id": "uuid-gerado",
    "user_id": "discord_user_id",
    "expires_at": "2024-01-01T12:00:00.000Z",
    "valid_for_hours": 24
  }
}
```

### 2. Validar Chave

**GET** `/api/keys/validate/:keyId`

**Resposta:**
```json
{
  "valid": true,
  "key_id": "uuid-da-chave",
  "user_id": "discord_user_id",
  "status": "active",
  "created_at": "2024-01-01T00:00:00.000Z",
  "expires_at": "2024-01-02T00:00:00.000Z",
  "time_remaining": {
    "expired": false,
    "remaining": 86400000,
    "hours": 24,
    "minutes": 0,
    "formatted": "24h 0m"
  },
  "usage_count": 1,
  "code": 200
}
```

### 3. Informações da Chave

**GET** `/api/keys/info/:keyId`

Retorna informações detalhadas sobre uma chave específica.

### 4. Listar Chaves do Usuário
### 5. Deletar Chave

**DELETE** `/api/keys/:keyId`

Deleta uma chave específica pelo seu `keyId`.

**Resposta:**
```json
{
  "msg": "Key deleted successfully",
  "code": 200,
  "key_id": "uuid-da-chave"
}
```

Se a chave não existir:
```json
{
  "error": "Chave não encontrada",
  "code": 404
}
```


**GET** `/api/keys/user/:userId`

Retorna todas as chaves associadas a um usuário.

### 6. Endpoint Especial - Arquivo .js

**GET** `/bind/:keyId.js`

Retorna um arquivo JavaScript que:
- Define o fundo da página como preto
- Exibe o JSON de resposta na tela
- Retorna `{ "msg": "Binding is ok, you can now use it normally.", "code": 200 }` se válido

### 7. Health Check

**GET** `/health`

Verifica se a API está funcionando.

## Exemplo de Uso com Discord Bot

```javascript
// Criar uma chave para um usuário
const response = await fetch('http://localhost:3000/api/keys/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    user_id: interaction.user.id,
    hours: 24
  })
});

const data = await response.json();
console.log('Nova chave criada:', data.data.key_id);

// Validar uma chave
const validationResponse = await fetch(`http://localhost:3000/api/keys/validate/${keyId}`);
const validation = await validationResponse.json();

if (validation.valid) {
  console.log('Chave válida! Tempo restante:', validation.time_remaining.formatted);
} else {
  console.log('Chave inválida ou expirada');
}
```

## Estrutura do Banco de Dados

As chaves são armazenadas com as seguintes informações:

- `key_id`: Identificador único (UUID)
- `user_id`: ID do usuário (Discord ID)
- `created_at`: Data e hora da criação
- `expires_at`: Data e hora de expiração
- `last_accessed`: Último acesso à chave
- `usage_count`: Número de vezes que a chave foi usada
- `status`: Status da chave (active, expired, revoked)
- `ip_address`: IP de origem da criação
- `created_by`: Origem da criação (api, bot, etc.)

## Configuração

- **Porta**: Configurável via `PORT` environment variable (padrão: 3000)
- **Duração padrão**: 24 horas (configurável por requisição)
- **Banco de dados**: SQLite local (`keys.db`)

## Segurança

- Helmet.js para headers de segurança
- CORS configurado
- Validação de entrada
- Rate limiting recomendado para produção

## Desenvolvimento

```bash
# Modo de desenvolvimento com auto-reload
npm run dev

# Verificar health da API
curl http://localhost:3000/health
```

## 🚀 Deploy em Produção

### Railway (Gratuito)

1. Faça fork deste repositório
2. Conecte ao [Railway.app](https://railway.app)
3. Deploy automático configurado!

**Arquivos incluídos para Railway:**
- `railway.json` - Configuração do Railway
- `Procfile` - Definição de processo
- `.env.example` - Variáveis de ambiente

📖 **[Guia completo de deploy →](./RAILWAY_DEPLOY.md)**

### Outras plataformas

Esta API é compatível com:
- Heroku
- Vercel
- DigitalOcean App Platform
- Google Cloud Run
- AWS Elastic Beanstalk

## Licença

ISC

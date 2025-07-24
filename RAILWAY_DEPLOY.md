# 🚀 Deploy no Railway - Guia Completo

Este guia contém **todos os passos necessários** para fazer deploy da Kuroukai Free API no Railway.

## 📋 Pré-requisitos

- [x] Conta no GitHub
- [x] Conta no Railway (gratuita)
- [x] Git instalado localmente
- [x] Node.js instalado (para testar localmente)

## 🔧 1. Preparação Local

### 1.1 Clone o projeto (se ainda não tiver)
```bash
git clone https://github.com/Kuroukai/Kuroukai-free-api.git
cd Kuroukai-free-api
```

### 1.2 Instale as dependências
```bash
npm install
```

### 1.3 Teste localmente
```bash
# Iniciar o servidor
npm start

# Em outro terminal, teste a API
npm test
```

### 1.4 Verifique se tudo está funcionando
Acesse: `http://localhost:3000`

Você deve ver:
```json
{
  "msg": "Kuroukai Free API",
  "code": 200,
  "endpoints": { ... }
}
```

## 🌐 2. Deploy no Railway

### 2.1 Acesse o Railway
1. Vá para [https://railway.app](https://railway.app)
2. Clique em **"Start a New Project"**
3. Escolha **"Deploy from GitHub repo"**

### 2.2 Conecte seu GitHub
1. Clique em **"Login with GitHub"**
2. Autorize o Railway a acessar seus repositórios
3. Selecione o repositório **"Kuroukai/Kuroukai-free-api"**

### 2.3 Configure o projeto
1. **Nome do projeto**: `kuroukai-free-api` (ou o que preferir)
2. **Branch**: `main` (ou a branch que você está usando)
3. Clique em **"Deploy Now"**

### 2.4 Aguarde o build
- O Railway detectará automaticamente que é um projeto Node.js
- Utilizará o arquivo `railway.json` para configurações
- O processo levará alguns minutos

## ⚙️ 3. Configurações do Railway

### 3.1 Variáveis de ambiente (se necessário)
1. No dashboard do Railway, vá para **"Variables"**
2. Adicione (somente se necessário):
   ```
   NODE_ENV=production
   ```

> **Nota**: A variável `PORT` é definida automaticamente pelo Railway.

### 3.2 Configurações automáticas aplicadas
- ✅ **Health check**: `/health`
- ✅ **Build command**: `npm install`
- ✅ **Start command**: `npm start`
- ✅ **Restart policy**: Reinicia em caso de falha

## 🔗 4. Obter a URL da API

### 4.1 No dashboard do Railway:
1. Clique no seu projeto
2. Vá para **"Settings"** → **"Domains"**
3. Clique em **"Generate Domain"**
4. Sua API estará disponível em: `https://seu-projeto.up.railway.app`

### 4.2 Teste sua API online:
```bash
# Health check
curl https://seu-projeto.up.railway.app/health

# Endpoint principal
curl https://seu-projeto.up.railway.app/

# Criar uma chave de teste
curl -X POST https://seu-projeto.up.railway.app/api/keys/create \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test_user", "hours": 24}'
```

## 🧪 5. Teste da API Implantada

### 5.1 Teste básico via browser
Acesse: `https://seu-projeto.up.railway.app`

### 5.2 Teste criação de chave
```javascript
// Exemplo de teste completo
const API_URL = 'https://seu-projeto.up.railway.app';

// 1. Criar chave
const response = await fetch(`${API_URL}/api/keys/create`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user_id: 'discord_user_123',
    hours: 24
  })
});

const result = await response.json();
console.log('Chave criada:', result.data.key_id);

// 2. Validar chave
const validation = await fetch(`${API_URL}/api/keys/validate/${result.data.key_id}`);
const validationResult = await validation.json();
console.log('Chave válida:', validationResult.valid);

// 3. Teste visual (tela preta)
// Acesse: https://seu-projeto.up.railway.app/test/[sua-chave-aqui]
```

## 🎯 6. Integração com Discord Bot

### 6.1 Configure a URL base no seu bot:
```javascript
// No seu bot do Discord
const API_BASE_URL = 'https://seu-projeto.up.railway.app';

// Função para criar chave
async function createAccessKey(userId, hours = 24) {
  const response = await fetch(`${API_BASE_URL}/api/keys/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, hours })
  });
  
  return await response.json();
}

// Função para validar chave
async function validateKey(keyId) {
  const response = await fetch(`${API_BASE_URL}/api/keys/validate/${keyId}`);
  return await response.json();
}
```

## 📊 7. Monitoramento

### 7.1 Logs no Railway
1. No dashboard, vá para **"Deployments"**
2. Clique no deployment ativo
3. Vá para **"View Logs"**

### 7.2 Métricas
- No dashboard, visualize uso de CPU, memória e tráfego
- Configure alertas se necessário

## 🔧 8. Comandos Úteis

### 8.1 Para desenvolvimento local:
```bash
# Instalar dependências
npm install

# Rodar em modo desenvolvimento
npm run dev

# Rodar testes
npm test

# Rodar em produção local
npm start
```

### 8.2 Para update no Railway:
```bash
# Fazer alterações no código
git add .
git commit -m "Suas alterações"
git push origin main

# O Railway fará o deploy automaticamente
```

## ❗ 9. Troubleshooting

### 9.1 Build falhou
- Verifique se `package.json` está correto
- Certifique-se de que todas as dependências estão listadas
- Veja os logs de build no Railway

### 9.2 App não inicia
- Verifique os logs no Railway
- Confirme se o comando `npm start` funciona localmente
- Verifique se o arquivo `index.js` existe

### 9.3 Health check falha
- Teste o endpoint `/health` localmente
- Verifique se está retornando status 200
- Confirme se a porta está sendo lida do `process.env.PORT`

### 9.4 Database não funciona
- O SQLite funciona automaticamente no Railway
- O arquivo `keys.db` será criado na primeira execução
- Para dados persistentes, considere upgrade do plano Railway

## 🎉 10. Checklist Final

- [ ] ✅ API deployada com sucesso
- [ ] ✅ URL pública funcionando
- [ ] ✅ Health check respondendo
- [ ] ✅ Endpoint de criação de chaves funcionando
- [ ] ✅ Endpoint de validação funcionando
- [ ] ✅ Endpoint visual (`/test/:keyId`) funcionando
- [ ] ✅ Integração com Discord bot testada
- [ ] ✅ Logs sendo monitorados

## 📞 Suporte

Se tiver problemas:
1. Verifique os logs no Railway dashboard
2. Teste localmente primeiro
3. Confirme se todos os arquivos estão commitados
4. Verifique se não há erros de sintaxe

---

🚀 **Pronto!** Sua API está rodando no Railway e pronta para uso com seu Discord bot!
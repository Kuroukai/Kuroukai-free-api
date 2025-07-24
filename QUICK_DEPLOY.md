# 🚀 Comandos Rápidos - Deploy Railway

## ⚡ Deploy Rápido (5 minutos)

### 1. Preparação Local
```bash
# Clone o repositório (se necessário)
git clone https://github.com/Kuroukai/Kuroukai-free-api.git
cd Kuroukai-free-api

# Instale dependências
npm install

# Teste localmente
npm start
# Em outro terminal: npm test
```

### 2. Deploy no Railway
1. **Acesse**: https://railway.app
2. **Clique**: "Start a New Project"
3. **Escolha**: "Deploy from GitHub repo" 
4. **Selecione**: "Kuroukai/Kuroukai-free-api"
5. **Aguarde**: Build automático (~2-3 minutos)
6. **Configure domínio**: Settings → Domains → Generate Domain

### 3. Teste da API Online
```bash
# Substitua YOUR-PROJECT por sua URL do Railway
export API_URL="https://your-project.up.railway.app"

# Health check
curl $API_URL/health

# Criar chave
curl -X POST $API_URL/api/keys/create \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test_user", "hours": 24}'

# Validar chave (use o key_id retornado acima)
curl $API_URL/api/keys/validate/[SEU-KEY-ID]
```

## 🔧 Comandos de Desenvolvimento

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento (auto-reload)
npm run dev

# Rodar em produção
npm start

# Executar testes
npm test

# Verificar configuração para deploy
./verify-deploy.sh
```

## 🌐 URLs Importantes

### Local
- API: http://localhost:3000
- Health: http://localhost:3000/health
- Teste visual: http://localhost:3000/test/[key-id]

### Railway (após deploy)
- API: https://seu-projeto.up.railway.app
- Health: https://seu-projeto.up.railway.app/health
- Teste visual: https://seu-projeto.up.railway.app/test/[key-id]

## 🤖 Integração Discord Bot

```javascript
// Configure a URL da sua API do Railway
const API_BASE_URL = 'https://seu-projeto.up.railway.app';

// Criar chave para usuário
const result = await fetch(`${API_BASE_URL}/api/keys/create`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user_id: interaction.user.id,
    hours: 24
  })
});

const keyData = await result.json();
console.log('Chave criada:', keyData.data.key_id);

// URL para binding visual (tela preta)
const bindingURL = `${API_BASE_URL}/bind/${keyData.data.key_id}.js`;
```

## 📁 Arquivos Criados para Railway

- ✅ `railway.json` - Configuração do Railway
- ✅ `Procfile` - Definição de processo 
- ✅ `.env.example` - Variáveis de ambiente
- ✅ `RAILWAY_DEPLOY.md` - Guia completo
- ✅ `verify-deploy.sh` - Script de verificação

## 🎯 Checklist Rápido

- [ ] Repositório clonado/forkado
- [ ] Dependências instaladas (`npm install`)
- [ ] Testado localmente (`npm test`)
- [ ] Deploy feito no Railway
- [ ] URL pública obtida
- [ ] API testada online
- [ ] Integração com Discord bot configurada

---

**💡 Dica**: Use o arquivo `RAILWAY_DEPLOY.md` para instruções mais detalhadas!
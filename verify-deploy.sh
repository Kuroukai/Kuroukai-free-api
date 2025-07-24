#!/bin/bash

# Verificação de Deploy - Railway
# Este script verifica se a API está pronta para deploy

echo "🔧 Verificando configuração para Railway..."

# Verificar arquivos necessários
echo "📋 Verificando arquivos necessários:"

files=("package.json" "index.js" "railway.json" "Procfile" ".env.example")
all_files_exist=true

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file (FALTANDO)"
        all_files_exist=false
    fi
done

if [ "$all_files_exist" = true ]; then
    echo "  🎉 Todos os arquivos necessários estão presentes!"
else
    echo "  ⚠️ Alguns arquivos estão faltando. Verifique antes do deploy."
    exit 1
fi

# Verificar package.json
echo ""
echo "📦 Verificando package.json:"

if grep -q '"start"' package.json; then
    echo "  ✅ Script 'start' encontrado"
else
    echo "  ❌ Script 'start' não encontrado"
    exit 1
fi

if grep -q '"express"' package.json; then
    echo "  ✅ Dependência 'express' encontrada"
else
    echo "  ❌ Dependência 'express' não encontrada"
    exit 1
fi

# Verificar se usa process.env.PORT
echo ""
echo "🌐 Verificando configuração de porta:"

if grep -q "process.env.PORT" index.js; then
    echo "  ✅ Usa process.env.PORT (necessário para Railway)"
else
    echo "  ❌ Não usa process.env.PORT"
    exit 1
fi

# Verificar endpoint de health
echo ""
echo "🏥 Verificando health check:"

if grep -q "/health" index.js; then
    echo "  ✅ Endpoint '/health' encontrado"
else
    echo "  ❌ Endpoint '/health' não encontrado"
    exit 1
fi

echo ""
echo "🎯 Verificação concluída com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "  1. Commit e push das alterações"
echo "  2. Acesse railway.app"
echo "  3. Deploy from GitHub repo"
echo "  4. Selecione este repositório"
echo "  5. Aguarde o deploy automático"
echo ""
echo "📖 Guia completo: RAILWAY_DEPLOY.md"
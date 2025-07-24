#!/usr/bin/env node

// Script de teste para demonstrar o uso da Kuroukai Free API
// Execute com: node test-api.js

const API_URL = 'http://localhost:3000';

async function testAPI() {
  console.log('🔧 Testando Kuroukai Free API...\n');

  try {
    // 1. Verificar se a API está funcionando
    console.log('1. Verificando saúde da API...');
    const healthResponse = await fetch(`${API_URL}/health`);
    const health = await healthResponse.json();
    console.log(`   ✅ API Status: ${health.msg}\n`);

    // 2. Criar uma nova chave
    console.log('2. Criando nova chave para usuário de teste...');
    const createResponse = await fetch(`${API_URL}/api/keys/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: 'test_user_12345',
        hours: 24
      })
    });
    const newKey = await createResponse.json();
    console.log(`   ✅ Chave criada: ${newKey.data.key_id}`);
    console.log(`   📅 Expira em: ${newKey.data.expires_at}\n`);

    const keyId = newKey.data.key_id;

    // 3. Validar a chave
    console.log('3. Validando a chave criada...');
    const validateResponse = await fetch(`${API_URL}/api/keys/validate/${keyId}`);
    const validation = await validateResponse.json();
    console.log(`   ✅ Chave válida: ${validation.valid}`);
    console.log(`   ⏰ Tempo restante: ${validation.time_remaining.formatted}`);
    console.log(`   📊 Usos: ${validation.usage_count}\n`);

    // 4. Obter informações da chave
    console.log('4. Obtendo informações detalhadas da chave...');
    const infoResponse = await fetch(`${API_URL}/api/keys/info/${keyId}`);
    const info = await infoResponse.json();
    console.log(`   📋 Status: ${info.data.status}`);
    console.log(`   👤 Usuário: ${info.data.user_id}`);
    console.log(`   🕒 Criada em: ${info.data.created_at}\n`);

    // 5. Listar chaves do usuário
    console.log('5. Listando todas as chaves do usuário...');
    const userKeysResponse = await fetch(`${API_URL}/api/keys/user/test_user_12345`);
    const userKeys = await userKeysResponse.json();
    console.log(`   📝 Total de chaves: ${userKeys.keys.length}`);
    userKeys.keys.forEach((key, index) => {
      console.log(`   ${index + 1}. ${key.key_id} - ${key.valid ? 'Válida' : 'Expirada'}`);
    });

    // 6. Demonstrar URL de binding
    console.log(`\n6. URL para validação visual (tela preta):`);
    console.log(`   🌐 ${API_URL}/bind/${keyId}.js`);
    console.log(`   🧪 Teste visual: ${API_URL}/test/${keyId}`);

    console.log('\n✨ Todos os testes passaram com sucesso!');
    console.log('\n💡 Dicas para integração com Discord:');
    console.log('   - Use o user.id do Discord como user_id');
    console.log('   - Configure a duração das chaves conforme necessário');
    console.log('   - Monitore o uso através dos endpoints de validação');
    console.log('   - Use o endpoint /bind/:keyId.js para validação visual');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
    console.log('\n🔧 Certifique-se de que a API está rodando em http://localhost:3000');
    console.log('   Execute: npm start');
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  testAPI();
}

module.exports = { testAPI };
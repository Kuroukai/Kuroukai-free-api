// Exemplo de integração com Discord.js
// Este arquivo demonstra como usar a Kuroukai Free API com um bot do Discord

const { Client, GatewayIntentBits, SlashCommandBuilder } = require('discord.js');

// URL da API (ajuste conforme necessário)
const API_BASE_URL = 'http://localhost:3000';

// Funções utilitárias para interagir com a API
class KuroukaiAPI {
  static async createKey(userId, hours = 24) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/keys/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, hours })
      });
      return await response.json();
    } catch (error) {
      console.error('Erro ao criar chave:', error);
      return null;
    }
  }

  static async validateKey(keyId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/keys/validate/${keyId}`);
      return await response.json();
    } catch (error) {
      console.error('Erro ao validar chave:', error);
      return null;
    }
  }

  static async getUserKeys(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/keys/user/${userId}`);
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar chaves do usuário:', error);
      return null;
    }
  }

  static getBindingURL(keyId) {
    return `${API_BASE_URL}/bind/${keyId}.js`;
  }
}

// Comandos do Discord Bot
const commands = [
  new SlashCommandBuilder()
    .setName('getkey')
    .setDescription('Gera uma nova chave de acesso gratuita')
    .addIntegerOption(option =>
      option.setName('hours')
        .setDescription('Duração da chave em horas (padrão: 24)')
        .setMinValue(1)
        .setMaxValue(168) // máximo 7 dias
    ),
  
  new SlashCommandBuilder()
    .setName('checkkey')
    .setDescription('Verifica o status de uma chave')
    .addStringOption(option =>
      option.setName('key')
        .setDescription('ID da chave para verificar')
        .setRequired(true)
    ),
  
  new SlashCommandBuilder()
    .setName('mykeys')
    .setDescription('Lista todas suas chaves ativas'),
];

// Exemplo de uso com Discord Bot
/*
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.on('ready', () => {
  console.log(`Bot conectado como ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName, user } = interaction;

  switch (commandName) {
    case 'getkey':
      const hours = interaction.options.getInteger('hours') || 24;
      const keyData = await KuroukaiAPI.createKey(user.id, hours);
      
      if (keyData && keyData.code === 200) {
        await interaction.reply({
          content: `✅ Nova chave criada!
**Key ID:** \`${keyData.data.key_id}\`
**Duração:** ${hours} horas
**Expira em:** <t:${Math.floor(new Date(keyData.data.expires_at).getTime() / 1000)}:R>
**Link de validação:** ${KuroukaiAPI.getBindingURL(keyData.data.key_id)}`,
          ephemeral: true
        });
      } else {
        await interaction.reply({
          content: '❌ Erro ao criar chave. Tente novamente.',
          ephemeral: true
        });
      }
      break;

    case 'checkkey':
      const keyId = interaction.options.getString('key');
      const validation = await KuroukaiAPI.validateKey(keyId);
      
      if (validation && validation.key_id) {
        const status = validation.valid ? '✅ Válida' : '❌ Expirada/Inválida';
        const timeRemaining = validation.time_remaining.expired 
          ? 'Expirada' 
          : validation.time_remaining.formatted;
        
        await interaction.reply({
          content: `**Status da Chave:** ${status}
**Tempo restante:** ${timeRemaining}
**Usos:** ${validation.usage_count}
**Último acesso:** ${validation.last_accessed || 'Nunca'}`,
          ephemeral: true
        });
      } else {
        await interaction.reply({
          content: '❌ Chave não encontrada.',
          ephemeral: true
        });
      }
      break;

    case 'mykeys':
      const userKeys = await KuroukaiAPI.getUserKeys(user.id);
      
      if (userKeys && userKeys.keys.length > 0) {
        const keysList = userKeys.keys
          .slice(0, 5) // limita a 5 chaves
          .map(key => {
            const status = key.valid ? '✅' : '❌';
            const time = key.time_remaining.expired ? 'Expirada' : key.time_remaining.formatted;
            return `${status} \`${key.key_id.substring(0, 8)}...\` - ${time}`;
          })
          .join('\n');
        
        await interaction.reply({
          content: `**Suas chaves (${userKeys.keys.length} total):**\n${keysList}`,
          ephemeral: true
        });
      } else {
        await interaction.reply({
          content: '❌ Você não possui chaves ativas.',
          ephemeral: true
        });
      }
      break;
  }
});

// client.login('SEU_TOKEN_DO_BOT');
*/

module.exports = { KuroukaiAPI, commands };
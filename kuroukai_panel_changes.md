# 🔧 Mudanças no Painel de Controle (Kuroukai Control Panel)

Lista detalhada de mudanças para aplicar no painel de chaves, com foco em segurança, usabilidade e organização.

---

## 1. Botão para gerar senhas temporárias
- Exiba um botão seguro na aba **Authentication** para gerar senhas temporárias.
- A senha deve ser:
  - Aleatória (sugestão: `crypto.randomUUID()`).
  - Visível apenas uma vez (ex: para copiar no momento da criação).
- **Não exibir** senha diretamente na interface após criada, exceto no momento de geração.

---

## 2. Correção visual do `search-type`
- O seletor está com bug: ao alternar entre `userid` e `keyid`, ambas ficam com fundo branco e ilegíveis.
- Corrigir o estilo para:
  - Destacar a **opção selecionada** (ex: fundo escuro ou borda azul).
  - Manter **bom contraste** em todas as opções.
  - Garantir legibilidade independente do tema ou estado.

---

## 3. Geração de senhas temporárias com duração configurável
- Na aba **Authentication**, adicione:
  - Um **botão para gerar senha temporária**.
  - Um **campo de input** para definir a **duração da validade** da senha (ex: `2 horas`, `5 dias`, etc).
- Integre isso ao backend para respeitar o tempo de expiração.

---

## 4. Exibir chaves recentes na inicialização
- Ao abrir a tela de pesquisa:
  - Se **nenhum `userid` ou `keyid`** tiver sido buscado, exibir automaticamente as **últimas 10 ou 20 chaves criadas**.
- Mostrar essas chaves em um formato de tabela ou lista com:
  - ID da chave
  - Tipo (free/premium se houver)
  - Tempo restante ou validade
  - Status (ativo/inativo)
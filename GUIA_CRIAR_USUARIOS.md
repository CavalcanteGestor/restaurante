# 📘 Guia: Como Criar Usuários no Sistema

Este guia explica como criar usuários (admin e recepcionista) no sistema de gestão de reservas.

## 🎯 Método 1: Interface Administrativa (Recomendado)

### Passo 1: Fazer Login como Admin
1. Acesse o sistema: `http://localhost:3000/login`
2. Faça login com uma conta de administrador existente

### Passo 2: Acessar Gerenciamento de Usuários
1. No menu lateral, clique em **"Usuários"** (apenas visível para admins)
2. Ou acesse diretamente: `http://localhost:3000/admin/usuarios`

### Passo 3: Criar Novo Usuário
1. Clique no botão **"Novo Usuário"** (canto superior direito)
2. Preencha o formulário:
   - **Nome Completo**: Nome do usuário
   - **Email**: Email único (será usado para login)
   - **Telefone**: (Opcional)
   - **Senha**: Mínimo 6 caracteres
   - **Tipo de Usuário**: 
     - **Administrador**: Acesso completo ao sistema
     - **Recepcionista**: Acesso limitado (reservas, mesas, conversas, WhatsApp)
   - **Função**: (Opcional) Selecione uma função da lista
3. Clique em **"Criar Usuário"**

### Passo 4: Usuário Criado!
O usuário será criado automaticamente e poderá fazer login imediatamente.

---

## 🔧 Método 2: Via Supabase Dashboard (Primeiro Admin)

Se você ainda não tem nenhum admin, você precisa criar o primeiro manualmente:

### Passo 1: Criar Usuário no Supabase Auth
1. Acesse o **Supabase Dashboard**: https://supabase.com/dashboard
2. Vá em **Authentication > Users**
3. Clique em **"Add user"** ou **"Create new user"**
4. Preencha:
   - **Email**: `admin@bistro.com` (ou outro email)
   - **Password**: Escolha uma senha forte
   - Marque **"Auto Confirm User"** (importante!)
5. Clique em **"Create user"**
6. **Copie o User ID** (UUID) que aparece

### Passo 2: Criar Registro na Tabela `usuarios`
1. No Supabase Dashboard, vá em **SQL Editor**
2. Execute o seguinte SQL (substitua `USER_ID_AQUI` pelo UUID copiado):

```sql
INSERT INTO usuarios (id, nome, email, status, tipo, funcao_id)
VALUES (
  'USER_ID_AQUI',  -- Cole o UUID do usuário criado no Auth
  'Administrador',
  'admin@bistro.com',  -- Mesmo email usado no Auth
  true,
  'admin',
  (SELECT id FROM funcoes WHERE nome = 'Administrador' LIMIT 1)
);
```

### Passo 3: Fazer Login
1. Acesse: `http://localhost:3000/login`
2. Use o email e senha criados
3. Você será redirecionado para `/admin`

---

## 📋 Criar Recepcionista

### Via Interface (Recomendado)
1. Faça login como admin
2. Vá em **Admin > Usuários > Novo Usuário**
3. Preencha:
   - Nome: `Maria Silva`
   - Email: `maria@bistro.com`
   - Senha: `senha123`
   - Tipo: **Recepcionista**
4. Clique em **"Criar Usuário"**

### Via SQL (Alternativo)
```sql
-- 1. Criar no Auth primeiro (via Dashboard)
-- 2. Depois executar:

INSERT INTO usuarios (id, nome, email, status, tipo, funcao_id)
VALUES (
  'USER_ID_DO_RECEPCIONISTA',
  'Maria Silva',
  'maria@bistro.com',
  true,
  'recepcionista',
  (SELECT id FROM funcoes WHERE nome = 'Recepcionista' LIMIT 1)
);
```

---

## 🔐 Permissões por Tipo

### 👑 Administrador (`admin`)
- ✅ Acesso completo ao sistema
- ✅ Gerenciar usuários
- ✅ Ver todos os relatórios
- ✅ Configurar automatizações
- ✅ Acessar logs e auditoria
- ✅ Adicionar mesas
- ✅ Todas as funcionalidades

### 👤 Recepcionista (`recepcionista`)
- ✅ Dashboard com visão do dia
- ✅ Criar e editar reservas
- ✅ Visualizar mesas
- ✅ Atender via WhatsApp
- ✅ Ver conversas
- ❌ Não pode gerenciar usuários
- ❌ Não pode ver relatórios completos
- ❌ Não pode acessar configurações admin

---

## 🛠️ Gerenciar Usuários Existentes

### Editar Usuário
1. Vá em **Admin > Usuários**
2. Clique no ícone de **editar** (lápis) na linha do usuário
3. Altere os dados desejados
4. **Nota**: Para alterar a senha, preencha o campo "Senha" (opcional)
5. Clique em **"Atualizar Usuário"**

### Desativar Usuário
1. Vá em **Admin > Usuários**
2. Clique em **editar** no usuário
3. Desmarque **"Status: Ativo"**
4. Salve

### Deletar Usuário
1. Vá em **Admin > Usuários**
2. Clique no ícone de **lixeira** (vermelho)
3. Confirme a exclusão
4. **Atenção**: Esta ação não pode ser desfeita!

---

## ⚠️ Importante

1. **Primeiro Admin**: Deve ser criado manualmente via Supabase Dashboard
2. **Emails Únicos**: Cada email só pode ser usado uma vez
3. **Senhas**: Mínimo 6 caracteres (recomendado: 8+ com letras, números e símbolos)
4. **Auto-confirmar**: Sempre marque "Auto Confirm User" ao criar no Supabase
5. **Status**: Usuários inativos não conseguem fazer login

---

## 🚨 Solução de Problemas

### "Email já cadastrado"
- O email já existe no sistema
- Use outro email ou edite o usuário existente

### "Erro ao criar usuário"
- Verifique se o Supabase está configurado corretamente
- Verifique as variáveis de ambiente
- Veja o console do navegador para mais detalhes

### "Usuário não consegue fazer login"
- Verifique se o status está como `true` na tabela `usuarios`
- Verifique se o email está confirmado no Supabase Auth
- Verifique se o tipo está correto (`admin` ou `recepcionista`)

---

## 📞 Suporte

Se tiver problemas, verifique:
1. Console do navegador (F12)
2. Logs do servidor Next.js
3. Supabase Dashboard > Logs

---

**Sistema de Gestão de Reservas - Est! Est!! Est!!! Ristorante** 🍝


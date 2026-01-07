# 🚀 Criar Primeiro Usuário - Guia Rápido

## ❌ Erro 401: Credenciais Inválidas

O erro `401` significa que o usuário não existe ou as credenciais estão incorretas.

## ✅ Solução: Criar o Primeiro Usuário

### Método 1: Via Supabase Dashboard (Recomendado)

1. **Acesse o Supabase Dashboard**
   - Vá em: https://supabase.com/dashboard
   - Selecione seu projeto

2. **Criar Usuário no Auth**
   - Vá em: **Authentication > Users**
   - Clique em: **"Add user"** ou **"Create new user"**
   - Preencha:
     - **Email**: `admin@bistro.com` (ou outro email)
     - **Password**: Escolha uma senha forte (ex: `Admin123!`)
     - ✅ **IMPORTANTE**: Marque **"Auto Confirm User"**
   - Clique em: **"Create user"**
   - **Copie o User ID** (UUID) que aparece

3. **Criar Registro na Tabela `usuarios`**
   - Vá em: **SQL Editor**
   - Execute este SQL (substitua `USER_ID_AQUI` pelo UUID copiado):

```sql
INSERT INTO usuarios (id, nome, email, status, tipo)
VALUES (
  'USER_ID_AQUI',  -- Cole o UUID aqui
  'Administrador',
  'admin@bistro.com',  -- Mesmo email usado no Auth
  true,
  'admin'
);
```

4. **Fazer Login**
   - Acesse: http://localhost:3000/login
   - Email: `admin@bistro.com`
   - Senha: A senha que você criou

---

### Método 2: Via SQL Direto (Alternativo)

Se preferir criar tudo via SQL:

1. **No Supabase Dashboard > SQL Editor**, execute:

```sql
-- 1. Criar usuário no Auth (substitua os valores)
-- Nota: Isso requer a função admin do Supabase
-- É mais fácil usar o Método 1 acima

-- 2. Depois de criar no Auth, pegue o UUID e execute:
INSERT INTO usuarios (id, nome, email, status, tipo)
VALUES (
  'UUID_DO_USUARIO_AQUI',
  'Administrador',
  'admin@bistro.com',
  true,
  'admin'
);
```

---

## 🔍 Verificar se o Usuário Foi Criado

### Verificar no Supabase Auth:
1. Vá em: **Authentication > Users**
2. Procure pelo email que você criou
3. Verifique se está **"Confirmed"**

### Verificar na Tabela `usuarios`:
1. Vá em: **Table Editor > usuarios**
2. Procure pelo registro com o mesmo `id` do usuário do Auth
3. Verifique se `status = true` e `tipo = 'admin'`

---

## ⚠️ Problemas Comuns

### "Invalid login credentials" (401)
- ✅ Verifique se o email está correto
- ✅ Verifique se a senha está correta
- ✅ Verifique se o usuário existe no Supabase Auth
- ✅ Verifique se o usuário está "Confirmed"

### "Dados do usuário não encontrados"
- ✅ Verifique se existe um registro na tabela `usuarios` com o mesmo `id` do Auth
- ✅ Execute o SQL acima para criar o registro

### "Sua conta está desativada"
- ✅ Na tabela `usuarios`, verifique se `status = true`
- ✅ Se estiver `false`, altere para `true`:

```sql
UPDATE usuarios 
SET status = true 
WHERE email = 'admin@bistro.com';
```

---

## 📝 Exemplo Completo

**Email**: `admin@bistro.com`  
**Senha**: `Admin123!`  
**Tipo**: `admin`

Após criar, você poderá:
- Fazer login no sistema
- Acessar todas as funcionalidades de admin
- Criar outros usuários via interface

---

**Sistema de Gestão de Reservas - Est! Est!! Est!!! Ristorante** 🍝


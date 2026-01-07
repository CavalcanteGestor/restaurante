# 🔧 Corrigir Usuário Admin - Guia Rápido

## ✅ Situação Atual

Você já tem:
- ✅ Usuário criado no Supabase Auth: `admin@bistro.com`
- ✅ Registro na tabela `usuarios` com o mesmo ID

## ❌ Problema

A tabela `usuarios` não tem as colunas necessárias (`nome`, `email`, `status`, `tipo`) ou elas estão vazias.

## 🔧 Solução: Atualizar o Registro

### Passo 1: Adicionar Colunas (se necessário)

No **Supabase Dashboard > SQL Editor**, execute:

```sql
-- Adicionar colunas se não existirem
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS nome VARCHAR,
ADD COLUMN IF NOT EXISTS email VARCHAR,
ADD COLUMN IF NOT EXISTS telefone VARCHAR,
ADD COLUMN IF NOT EXISTS status BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS tipo VARCHAR;
```

### Passo 2: Atualizar o Registro do Usuário

Execute este SQL (substitua o ID pelo seu, se diferente):

```sql
UPDATE usuarios 
SET 
  nome = 'Administrador',
  email = 'admin@bistro.com',
  status = true,
  tipo = 'admin'
WHERE id = 'ae765585-b987-4d16-8ad4-1b65f0388bdf';
```

**Nota**: O ID `ae765585-b987-4d16-8ad4-1b65f0388bdf` é o que aparece nas suas imagens. Se for diferente, use o ID correto do seu usuário.

### Passo 3: Verificar

Execute para confirmar:

```sql
SELECT id, nome, email, status, tipo, funcao_id 
FROM usuarios 
WHERE email = 'admin@bistro.com';
```

Deve retornar:
- `nome`: `Administrador`
- `email`: `admin@bistro.com`
- `status`: `true`
- `tipo`: `admin`

### Passo 4: Testar Login

1. Acesse: http://localhost:3000/login
2. Email: `admin@bistro.com`
3. Senha: A senha que você criou no Supabase Auth
4. Deve funcionar! 🎉

---

## 📋 Alternativa: Via Interface do Supabase

Se preferir usar a interface:

1. Vá em: **Table Editor > usuarios**
2. Clique no registro do usuário
3. Preencha/edite:
   - `nome`: `Administrador`
   - `email`: `admin@bistro.com`
   - `status`: `true` (marcado)
   - `tipo`: `admin`
4. Clique em **Save**

---

## ⚠️ Se as Colunas Não Existem

Se ao tentar atualizar der erro de coluna não encontrada, execute primeiro:

```sql
-- Verificar estrutura atual
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
AND table_schema = 'public';
```

Depois adicione as colunas faltantes com o ALTER TABLE acima.

---

**Sistema de Gestão de Reservas - Est! Est!! Est!!! Ristorante** 🍝


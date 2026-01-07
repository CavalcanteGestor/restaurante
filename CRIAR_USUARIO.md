# Como Criar um Usuário para Login

## Passo a Passo

### 1. Criar Usuário no Supabase Auth

1. Acesse o Supabase Dashboard: https://supabase.com/dashboard
2. Selecione seu projeto: **bistrolumi**
3. Vá em **Authentication** > **Users**
4. Clique em **Add User** > **Create new user**
5. Preencha:
   - **Email**: `admin@bistro.com`
   - **Password**: `admin123` (ou outra senha segura)
   - **Auto Confirm User**: ✅ (marcar)

### 2. Criar Registro na Tabela `usuarios`

Após criar o usuário no Auth, você precisa criar um registro correspondente na tabela `usuarios`:

1. No Supabase Dashboard, vá em **SQL Editor**
2. Execute o seguinte SQL (substitua o `USER_ID` pelo ID do usuário criado no Auth):

```sql
-- Primeiro, pegue o ID do usuário criado no Auth
-- Vá em Authentication > Users e copie o UUID do usuário

-- Depois execute (substitua 'USER_ID_AQUI' pelo UUID real):
INSERT INTO usuarios (id, nome, email, status, tipo, funcao_id)
VALUES (
  'USER_ID_AQUI',  -- Substitua pelo UUID do usuário do Auth
  'Administrador',
  'admin@bistro.com',
  true,
  'admin',
  (SELECT id FROM funcoes WHERE nome = 'Administrador' LIMIT 1)
);
```

### 3. Alternativa: Usar o SQL Editor Direto

Se preferir, você pode criar tudo de uma vez:

```sql
-- 1. Criar função se não existir
INSERT INTO funcoes (nome, descricao, ativa, permissoes)
VALUES (
  'Administrador',
  'Administrador do sistema com acesso total',
  true,
  '{"*": ["*"]}'::jsonb
)
ON CONFLICT (nome) DO NOTHING;

-- 2. Depois criar o usuário no Auth manualmente
-- 3. E então executar (com o UUID do usuário):
INSERT INTO usuarios (id, nome, email, status, tipo, funcao_id)
VALUES (
  'SEU_UUID_AQUI',
  'Administrador',
  'admin@bistro.com',
  true,
  'admin',
  (SELECT id FROM funcoes WHERE nome = 'Administrador' LIMIT 1)
);
```

## Credenciais de Teste Sugeridas

- **Email**: `admin@bistro.com`
- **Senha**: `admin123` (ou a que você escolher)

## Após Criar o Usuário

1. Acesse: http://localhost:3000/login
2. Faça login com as credenciais criadas
3. Você será redirecionado para o dashboard

## Verificar se Funcionou

Execute no SQL Editor:

```sql
SELECT u.id, u.nome, u.email, u.status, f.nome as funcao
FROM usuarios u
LEFT JOIN funcoes f ON u.funcao_id = f.id
WHERE u.email = 'admin@bistro.com';
```

Se retornar um registro, está tudo certo! 🎉


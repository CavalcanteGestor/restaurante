# 🔧 Solução: Erro "Invalid API key" no Login

## ❌ Problema
Ao tentar fazer login, aparece o erro: **"Invalid API key"**

## ✅ Solução

### Passo 1: Verificar se o arquivo `.env.local` existe

Execute no terminal (na pasta do projeto):
```bash
npm run check-env
```

Ou verifique manualmente se existe o arquivo `.env.local` na raiz do projeto.

### Passo 2: Criar/Configurar o arquivo `.env.local`

Se o arquivo não existir, crie-o na raiz do projeto com o seguinte conteúdo:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

### Passo 3: Obter as Chaves do Supabase

1. **Acesse o Supabase Dashboard**: https://supabase.com/dashboard
2. **Selecione seu projeto**
3. **Vá em**: Settings > API
4. **Copie os valores**:
   - **Project URL** → Cole em `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → Cole em `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Passo 4: Verificar se as chaves estão corretas

Execute novamente:
```bash
npm run check-env
```

Deve mostrar:
```
✅ NEXT_PUBLIC_SUPABASE_URL: https://...
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: eyJhbGc...
```

### Passo 5: Reiniciar o servidor

**IMPORTANTE**: Após configurar o `.env.local`, você DEVE reiniciar o servidor Next.js:

1. Pare o servidor (Ctrl+C no terminal)
2. Inicie novamente:
```bash
npm run dev
```

### Passo 6: Verificar se o usuário existe

O erro também pode ocorrer se o usuário não existir no Supabase Auth. Para criar o primeiro usuário:

#### Opção A: Via Supabase Dashboard (Recomendado para primeiro admin)

1. Acesse: **Supabase Dashboard > Authentication > Users**
2. Clique em **"Add user"** ou **"Create new user"**
3. Preencha:
   - **Email**: `admin@bistro.com`
   - **Password**: Escolha uma senha forte
   - ✅ **Marque "Auto Confirm User"** (IMPORTANTE!)
4. Clique em **"Create user"**
5. **Copie o User ID** (UUID) que aparece
6. Vá em **SQL Editor** e execute:

```sql
INSERT INTO usuarios (id, nome, email, status, tipo)
VALUES (
  'USER_ID_AQUI',  -- Cole o UUID copiado
  'Administrador',
  'admin@bistro.com',  -- Mesmo email usado no Auth
  true,
  'admin'
);
```

#### Opção B: Via Interface do Sistema (Se já tiver um admin)

1. Faça login com um admin existente
2. Vá em **Admin > Usuários > Novo Usuário**
3. Preencha o formulário e crie o usuário

---

## 🔍 Verificações Adicionais

### Verificar se as variáveis estão sendo carregadas

No console do navegador (F12), execute:
```javascript
console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20))
```

**Nota**: Variáveis `NEXT_PUBLIC_*` são expostas no cliente. Se aparecer `undefined`, o servidor precisa ser reiniciado.

### Verificar se o usuário está ativo

No Supabase Dashboard:
1. Vá em **Authentication > Users**
2. Verifique se o usuário existe e está **"Confirmed"**
3. Verifique se na tabela `usuarios` o campo `status` está como `true`

---

## 🚨 Erros Comuns

### "Invalid API key"
- ✅ Verifique se copiou a chave **anon public** (não a service_role)
- ✅ Verifique se não há espaços extras no `.env.local`
- ✅ Reinicie o servidor após alterar o `.env.local`

### "Invalid login credentials"
- ✅ Verifique se o email e senha estão corretos
- ✅ Verifique se o usuário existe no Supabase Auth

### "Email not confirmed"
- ✅ No Supabase Dashboard, marque o usuário como "Confirmed"
- ✅ Ou use "Auto Confirm User" ao criar o usuário

### "Dados do usuário não encontrados"
- ✅ Verifique se existe um registro na tabela `usuarios` com o mesmo `id` do usuário do Auth
- ✅ Execute o SQL acima para criar o registro

---

## 📞 Ainda com problemas?

1. Verifique o console do navegador (F12 > Console) para mais detalhes
2. Verifique os logs do servidor Next.js no terminal
3. Verifique os logs do Supabase: Dashboard > Logs > API

---

**Sistema de Gestão de Reservas - Est! Est!! Est!!! Ristorante** 🍝


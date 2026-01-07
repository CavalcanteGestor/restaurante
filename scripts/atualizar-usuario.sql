-- Script para atualizar o registro do usuário admin na tabela usuarios
-- Execute este SQL no Supabase SQL Editor

-- Primeiro, verifique se as colunas necessárias existem
-- Se não existirem, execute os ALTER TABLE abaixo:

-- Adicionar colunas se não existirem
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS nome VARCHAR,
ADD COLUMN IF NOT EXISTS email VARCHAR,
ADD COLUMN IF NOT EXISTS telefone VARCHAR,
ADD COLUMN IF NOT EXISTS status BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS tipo VARCHAR;

-- Atualizar o registro do usuário admin
-- Substitua 'ae765585-b987-4d16-8ad4-1b65f0388bdf' pelo ID correto do seu usuário
UPDATE usuarios 
SET 
  nome = 'Administrador',
  email = 'admin@bistro.com',
  status = true,
  tipo = 'admin'
WHERE id = 'ae765585-b987-4d16-8ad4-1b65f0388bdf';

-- Verificar o resultado
SELECT id, nome, email, status, tipo, funcao_id 
FROM usuarios 
WHERE id = 'ae765585-b987-4d16-8ad4-1b65f0388bdf';


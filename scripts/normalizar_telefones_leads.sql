-- Script para normalizar telefones na tabela leads
-- Remove @s.whatsapp.net e caracteres não numéricos
-- Remove duplicatas mantendo o lead mais recente

-- Primeiro, vamos criar uma função auxiliar para normalizar telefones
CREATE OR REPLACE FUNCTION normalize_phone(phone TEXT) 
RETURNS TEXT AS $$
BEGIN
  RETURN regexp_replace(regexp_replace(phone, '@.*$', ''), '[^0-9]', '', 'g');
END;
$$ LANGUAGE plpgsql;

-- Atualizar todos os telefones para formato normalizado
UPDATE leads 
SET telefone = normalize_phone(telefone)
WHERE telefone IS NOT NULL;

-- Identificar duplicatas por telefone normalizado
-- Mantém o lead com ID maior (mais recente) e remove os outros
DO $$
DECLARE
  dup RECORD;
BEGIN
  FOR dup IN 
    SELECT normalize_phone(telefone) as telefone_norm, array_agg(id ORDER BY id DESC) as ids
    FROM leads
    WHERE telefone IS NOT NULL 
      AND normalize_phone(telefone) != ''
      AND normalize_phone(telefone) NOT LIKE '%[A-Za-z]%' -- Remove telefones inválidos como "Francisco"
    GROUP BY normalize_phone(telefone)
    HAVING COUNT(*) > 1
  LOOP
    -- Mantém o primeiro (mais recente) e remove os outros
    DELETE FROM leads 
    WHERE id = ANY(dup.ids[2:array_length(dup.ids, 1)]);
    
    -- Atualiza o telefone do lead mantido para o formato normalizado
    UPDATE leads 
    SET telefone = dup.telefone_norm
    WHERE id = dup.ids[1];
  END LOOP;
END $$;

-- Limpar telefones inválidos (que contêm letras)
DELETE FROM leads 
WHERE telefone IS NOT NULL 
  AND normalize_phone(telefone) LIKE '%[A-Za-z]%'
  AND telefone != normalize_phone(telefone);

-- Remover a função auxiliar (opcional, pode manter para uso futuro)
-- DROP FUNCTION IF EXISTS normalize_phone(TEXT);

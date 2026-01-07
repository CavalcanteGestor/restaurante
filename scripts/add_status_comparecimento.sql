-- Adicionar campo status_comparecimento na tabela reservas
-- Status possíveis: 'agendado', 'compareceu', 'nao_compareceu', 'cancelado'

-- Adicionar coluna se não existir
ALTER TABLE public.reservas 
ADD COLUMN IF NOT EXISTS status_comparecimento text DEFAULT 'agendado';

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_reservas_status_comparecimento 
ON public.reservas(status_comparecimento);

-- Adicionar constraint para validar valores
ALTER TABLE public.reservas
DROP CONSTRAINT IF EXISTS reservas_status_comparecimento_check;

ALTER TABLE public.reservas
ADD CONSTRAINT reservas_status_comparecimento_check 
CHECK (status_comparecimento IN ('agendado', 'compareceu', 'nao_compareceu', 'cancelado'));

-- Comentário explicativo
COMMENT ON COLUMN public.reservas.status_comparecimento IS 
'Status de comparecimento: agendado (confirmado mas ainda não chegou), compareceu (cliente chegou), nao_compareceu (não veio), cancelado (cancelou antes)';

-- Atualizar reservas existentes baseado no etapa
UPDATE public.reservas
SET status_comparecimento = CASE
  WHEN etapa = 'cancelado' THEN 'cancelado'
  WHEN etapa = 'confirmado' OR etapa = 'interesse' OR etapa = 'pendente' THEN 'agendado'
  ELSE 'agendado'
END
WHERE status_comparecimento IS NULL OR status_comparecimento = 'agendado';


-- Criar tabela para armazenar mensagens automáticas enviadas
CREATE TABLE IF NOT EXISTS public.mensagens_automaticas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reserva_id UUID REFERENCES public.reservas(id) ON DELETE CASCADE,
  telefone TEXT NOT NULL,
  nome TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('nao_comparecimento', 'atraso', 'lembrete', 'outro')),
  status TEXT NOT NULL DEFAULT 'enviada' CHECK (status IN ('enviada', 'erro', 'cancelada', 'pendente')),
  data_envio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  erro TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_mensagens_reserva ON public.mensagens_automaticas(reserva_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_data ON public.mensagens_automaticas(data_envio DESC);
CREATE INDEX IF NOT EXISTS idx_mensagens_tipo ON public.mensagens_automaticas(tipo);
CREATE INDEX IF NOT EXISTS idx_mensagens_status ON public.mensagens_automaticas(status);
CREATE INDEX IF NOT EXISTS idx_mensagens_telefone ON public.mensagens_automaticas(telefone);

-- Comentários explicativos
COMMENT ON TABLE public.mensagens_automaticas IS 'Registro de todas as mensagens automáticas enviadas pelo sistema';
COMMENT ON COLUMN public.mensagens_automaticas.tipo IS 'Tipo de mensagem: nao_comparecimento, atraso, lembrete, outro';
COMMENT ON COLUMN public.mensagens_automaticas.status IS 'Status do envio: enviada, erro, cancelada, pendente';


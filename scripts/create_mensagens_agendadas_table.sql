-- Criar tabela mensagens_agendadas
CREATE TABLE IF NOT EXISTS public.mensagens_agendadas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reserva_id UUID REFERENCES public.reservas(id) ON DELETE SET NULL,
  telefone TEXT NOT NULL,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('confirmacao', 'cancelamento', 'atraso', 'lembrete')),
  mensagem TEXT NOT NULL,
  agendado_para TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'enviada', 'cancelada', 'erro')),
  enviado_em TIMESTAMPTZ,
  erro TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_mensagens_agendadas_status ON public.mensagens_agendadas(status);
CREATE INDEX IF NOT EXISTS idx_mensagens_agendadas_agendado_para ON public.mensagens_agendadas(agendado_para);
CREATE INDEX IF NOT EXISTS idx_mensagens_agendadas_reserva_id ON public.mensagens_agendadas(reserva_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_agendadas_telefone ON public.mensagens_agendadas(telefone);
CREATE INDEX IF NOT EXISTS idx_mensagens_agendadas_tipo ON public.mensagens_agendadas(tipo);

-- Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar updated_at
CREATE TRIGGER update_mensagens_agendadas_updated_at
BEFORE UPDATE ON public.mensagens_agendadas
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Adicionar campos tipo_mensagem e conversation_id na tabela conversas (se ainda não existirem)
ALTER TABLE public.conversas 
ADD COLUMN IF NOT EXISTS tipo_mensagem TEXT,
ADD COLUMN IF NOT EXISTS conversation_id TEXT;

-- Criar índice para tipo_mensagem
CREATE INDEX IF NOT EXISTS idx_conversas_tipo_mensagem ON public.conversas(tipo_mensagem);
CREATE INDEX IF NOT EXISTS idx_conversas_conversation_id ON public.conversas(conversation_id);


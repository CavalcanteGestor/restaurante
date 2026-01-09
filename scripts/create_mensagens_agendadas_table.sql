-- Criar tabela mensagens_agendadas (sem foreign key inicialmente)
CREATE TABLE IF NOT EXISTS public.mensagens_agendadas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reserva_id UUID,
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

-- Adicionar foreign key apenas se a tabela reservas existir
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'reservas') THEN
    -- Adicionar constraint de foreign key se a tabela reservas existir
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint 
      WHERE conname = 'mensagens_agendadas_reserva_id_fkey'
    ) THEN
      ALTER TABLE public.mensagens_agendadas 
      ADD CONSTRAINT mensagens_agendadas_reserva_id_fkey 
      FOREIGN KEY (reserva_id) 
      REFERENCES public.reservas(id) 
      ON DELETE SET NULL;
    END IF;
  END IF;
END $$;

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
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'conversas') THEN
    ALTER TABLE public.conversas 
    ADD COLUMN IF NOT EXISTS tipo_mensagem TEXT,
    ADD COLUMN IF NOT EXISTS conversation_id TEXT;

    -- Criar índice para tipo_mensagem
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_conversas_tipo_mensagem') THEN
      CREATE INDEX idx_conversas_tipo_mensagem ON public.conversas(tipo_mensagem);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_conversas_conversation_id') THEN
      CREATE INDEX idx_conversas_conversation_id ON public.conversas(conversation_id);
    END IF;
  END IF;
END $$;


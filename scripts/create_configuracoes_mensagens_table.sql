-- Criar tabela para configurações de mensagens automáticas
CREATE TABLE IF NOT EXISTS public.configuracoes_mensagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL UNIQUE CHECK (tipo IN ('nao_comparecimento', 'atraso', 'lembrete', 'outro')),
  template TEXT NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  posicao_nome TEXT NOT NULL DEFAULT 'inicio' CHECK (posicao_nome IN ('inicio', 'meio', 'fim', 'custom')),
  placeholder_nome TEXT NOT NULL DEFAULT '{nome}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir template padrão para não comparecimento
INSERT INTO public.configuracoes_mensagens (tipo, template, posicao_nome, placeholder_nome)
VALUES (
  'nao_comparecimento',
  'Olá {nome}! Notamos que você tinha uma reserva para hoje às {horario_reserva} e ainda não chegou. Você ainda vai conseguir vir? Se precisar remarcar ou cancelar, estamos à disposição! 😊',
  'inicio',
  '{nome}'
) ON CONFLICT (tipo) DO NOTHING;

-- Índices
CREATE INDEX IF NOT EXISTS idx_config_mensagens_tipo ON public.configuracoes_mensagens(tipo);
CREATE INDEX IF NOT EXISTS idx_config_mensagens_ativo ON public.configuracoes_mensagens(ativo) WHERE ativo = true;

-- Comentários
COMMENT ON TABLE public.configuracoes_mensagens IS 'Configurações de templates de mensagens automáticas';
COMMENT ON COLUMN public.configuracoes_mensagens.template IS 'Template da mensagem com placeholders: {nome}, {horario_reserva}, {data_reserva}, etc';
COMMENT ON COLUMN public.configuracoes_mensagens.posicao_nome IS 'Onde o nome aparece: inicio, meio, fim, custom';
COMMENT ON COLUMN public.configuracoes_mensagens.placeholder_nome IS 'Placeholder usado para o nome (ex: {nome}, Olá [NOME]!)';


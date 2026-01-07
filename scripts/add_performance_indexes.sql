-- Índices de performance para otimizar queries frequentes

-- Índices para tabela reservas
CREATE INDEX IF NOT EXISTS idx_reservas_data_horario ON public.reservas(data_reserva, horario_reserva);
CREATE INDEX IF NOT EXISTS idx_reservas_status_comparecimento ON public.reservas(status_comparecimento) WHERE status_comparecimento IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_reservas_data_status ON public.reservas(data_reserva, status_comparecimento);
CREATE INDEX IF NOT EXISTS idx_reservas_etapa ON public.reservas(etapa) WHERE etapa IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_reservas_telefone ON public.reservas(telefone);
CREATE INDEX IF NOT EXISTS idx_reservas_turno ON public.reservas(turno) WHERE turno IS NOT NULL;

-- Índice composto para queries de reservas atrasadas
CREATE INDEX IF NOT EXISTS idx_reservas_atrasadas ON public.reservas(data_reserva, horario_reserva, status_comparecimento, etapa) 
WHERE data_reserva >= CURRENT_DATE - INTERVAL '7 days';

-- Índices para tabela leads
CREATE INDEX IF NOT EXISTS idx_leads_telefone ON public.leads(telefone);
CREATE INDEX IF NOT EXISTS idx_leads_etapa ON public.leads(etapa) WHERE etapa IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_data_ultima_msg ON public.leads(data_ultima_msg DESC) WHERE data_ultima_msg IS NOT NULL;

-- Índices para tabela conversas
CREATE INDEX IF NOT EXISTS idx_conversas_numero ON public.conversas(numero);
CREATE INDEX IF NOT EXISTS idx_conversas_data ON public.conversas(data_mensagem DESC) WHERE data_mensagem IS NOT NULL;

-- Comentários
COMMENT ON INDEX idx_reservas_data_horario IS 'Otimiza queries que filtram por data e horário';
COMMENT ON INDEX idx_reservas_atrasadas IS 'Otimiza verificação de reservas atrasadas (últimos 7 dias)';


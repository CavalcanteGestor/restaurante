# Changelog

## [1.0.0] - 2025-01-XX

### Adicionado
- Sistema completo de gestão de reservas
- Dashboard com métricas em tempo real
- CRUD completo de reservas (criar, editar, cancelar)
- Gestão de mesas com visualização em grid e mapa
- Chat WhatsApp integrado para atendimento humano
- Sistema de mensagens automáticas para atrasos
- Gestão completa de leads e conversas
- Relatórios e analytics com gráficos
- Calendário de reservas
- Sistema de autenticação com Supabase
- Regras de negócio MCPS implementadas
- Integração com Evolution API para WhatsApp
- Atualização automática de contexto de leads

### Funcionalidades Principais

#### Reservas
- Lista de reservas com filtros avançados
- Criação de reservas com validação de disponibilidade
- Edição e cancelamento de reservas
- Vista de calendário mensal
- Detecção automática de atrasos (>15 min)

#### Mesas
- Lista de mesas com filtros
- Mapa visual por ambiente
- Detalhes de cada mesa com histórico
- Validação de regras MCPS

#### WhatsApp
- Interface de chat tipo WhatsApp Web
- Lista de conversas ativas (atendimento humano)
- Envio de mensagens
- Histórico completo de conversas
- Informações do lead ao lado do chat

#### Automatizações
- Detecção de reservas atrasadas
- Envio de mensagens automáticas
- Atualização automática de contexto

#### Leads
- Lista de leads com filtros
- Detalhes completos do lead
- Timeline de interações
- Histórico de reservas relacionadas

#### Relatórios
- Métricas principais
- Gráficos de reservas por dia
- Gráficos de ocupação por turno
- Taxa de cancelamento
- Exportação de dados

### Tecnologias
- Next.js 15+ (App Router)
- React 19+
- TypeScript 5+
- Tailwind CSS 4+
- Supabase (PostgreSQL)
- shadcn/ui
- Recharts
- Evolution API


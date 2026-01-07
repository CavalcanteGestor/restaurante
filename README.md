# Sistema de Gestão de Reservas - Est! Est!! Est!!!

Sistema completo de gestão de reservas para recepcionistas do restaurante Est! Est!! Est!!! Ristorante.

## Funcionalidades

- ✅ Dashboard com métricas em tempo real
- ✅ CRUD completo de reservas
- ✅ Gestão de mesas com visualização
- ✅ Chat WhatsApp integrado para atendimento humano
- ✅ Sistema de mensagens automáticas (atraso 15min)
- ✅ Gestão de leads e conversas
- ✅ Relatórios e analytics
- ✅ Configurações administrativas

## Tecnologias

- **Next.js 15+** (App Router)
- **React 19+**
- **TypeScript**
- **Tailwind CSS**
- **Supabase** (PostgreSQL)
- **shadcn/ui** (Componentes UI)
- **Recharts** (Gráficos)

## Configuração

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente:
```bash
# Copie o arquivo de exemplo
cp env.local.example .env.local

# Edite o arquivo .env.local com suas credenciais
```

3. Configure as variáveis no arquivo `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EVOLUTION_API_URL=your_evolution_api_url
EVOLUTION_API_KEY=your_evolution_api_key
EVOLUTION_INSTANCE_NAME=Bistro
```

4. Execute o projeto:
```bash
npm run dev
```

## Estrutura do Projeto

```
app/
├── (auth)/          # Rotas de autenticação
├── (dashboard)/    # Área protegida
│   ├── reservas/   # Gestão de reservas
│   ├── mesas/      # Gestão de mesas
│   ├── whatsapp/   # Chat WhatsApp
│   ├── leads/      # Gestão de leads
│   ├── conversas/  # Histórico de conversas
│   ├── automatizacoes/ # Mensagens automáticas
│   ├── relatorios/ # Relatórios
│   └── admin/      # Configurações admin
└── api/            # API Routes

components/          # Componentes React
lib/                 # Utilitários e queries
types/               # Tipos TypeScript
```

## Regras de Negócio (MCPS)

O sistema implementa as seguintes regras:

1. **Uso Pessoal vs Corporativo**: Salão Externo, Segundo Andar Externo Coberto e Sala "Cinema" são apenas para uso pessoal
2. **Apenas Eventos**: Terraço (61-82) e Empório (41-52) só podem ser reservados para eventos
3. **Junções de Mesas**: Validação de junções permitidas
4. **Mídia Corporativa**: Regras específicas para uso de TV em eventos corporativos
5. **Disponibilidade Real**: Verificação de conflitos de horário e capacidade

## Integração com n8n

O sistema utiliza as mesmas tabelas do banco de dados que o workflow n8n, permitindo integração completa:
- Tabela `reservas`
- Tabela `leads`
- Tabela `conversas`
- Tabela `mesas`
- Tabela `atendimento_humano`

## Mensagens Automáticas

O sistema envia mensagens automáticas quando:
- Cliente atrasa mais de 15 minutos
- (Futuro) Lembrete de reserva 1 dia antes
- (Futuro) Follow-up pós-visita

Todas as mensagens automáticas atualizam o contexto do lead automaticamente.

## Licença

Proprietário - Est! Est!! Est!!! Ristorante

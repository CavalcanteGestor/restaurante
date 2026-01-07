-- ============================================
-- WhatsApp (Evolution API) - Storage próprio
-- NÃO usar a tabela public.conversas (é da IA)
-- ============================================

create extension if not exists pgcrypto;

create table if not exists public.whatsapp_messages (
  id uuid primary key default gen_random_uuid(),
  instance_name text not null,
  wa_message_id text null,
  remote_jid text null,
  phone text not null,
  from_me boolean not null default false,
  message_type text not null default 'text',
  body text not null,
  media_url text null,
  "timestamp" timestamptz not null,
  raw jsonb null,
  created_at timestamptz not null default now()
);

-- Evitar duplicatas quando o webhook reenviar eventos
create unique index if not exists whatsapp_messages_instance_wa_message_id_uniq
  on public.whatsapp_messages (instance_name, wa_message_id)
  where wa_message_id is not null;

create index if not exists whatsapp_messages_instance_phone_ts_idx
  on public.whatsapp_messages (instance_name, phone, "timestamp" desc);

-- RLS (ajuste conforme sua política de segurança)
alter table public.whatsapp_messages enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'whatsapp_messages'
      and policyname = 'whatsapp_messages_read_authenticated'
  ) then
    create policy whatsapp_messages_read_authenticated
      on public.whatsapp_messages
      for select
      to authenticated
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'whatsapp_messages'
      and policyname = 'whatsapp_messages_write_authenticated'
  ) then
    create policy whatsapp_messages_write_authenticated
      on public.whatsapp_messages
      for insert
      to authenticated
      with check (true);
  end if;
end $$;



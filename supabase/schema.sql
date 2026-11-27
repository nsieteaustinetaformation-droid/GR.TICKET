-- GRTK — Schéma Supabase (international, garantie, paiement groupé)
-- À exécuter dans le SQL Editor de Supabase.
-- Le script est idempotent : vous pouvez le relancer sans écraser vos événements.

create table if not exists public.events (
  id text primary key,
  title text not null,
  slug text not null unique,
  subtitle text,
  category text not null,
  description text not null default '',
  venue text not null default '',
  city text not null default '',
  address text not null default '',
  date text not null default '',
  doors_open_time text not null default '',
  start_time text not null default '',
  image_url text not null default '',
  banner_url text,
  artist_name text not null default '',
  organizer text not null default '',
  status text not null default 'published',
  featured boolean not null default false
);

-- Nouvelles colonnes : chaque événement appartient à un organisateur connecté.
alter table public.events add column if not exists owner_id text;
alter table public.events add column if not exists commission_percent integer not null default 10;
alter table public.events add column if not exists payout_method text;
alter table public.events add column if not exists payout_phone text;

create table if not exists public.ticket_types (
  id text primary key,
  event_id text not null references public.events(id) on delete cascade,
  name text not null,
  price integer not null default 0,
  total_quantity integer not null default 0,
  sold_quantity integer not null default 0,
  description text,
  benefits text[] not null default '{}'
);

create table if not exists public.orders (
  id text primary key,
  event_id text not null,
  event_title text not null,
  buyer_name text not null,
  buyer_phone text not null,
  payment_method text not null,
  payment_status text not null,
  total_amount integer not null default 0,
  ticket_count integer not null default 0,
  tickets jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.scans (
  id text primary key,
  ticket_id text not null,
  ticket_code text not null,
  event_id text not null,
  event_title text not null,
  scanner_id text not null,
  scanner_name text not null,
  door text not null,
  result text not null,
  timestamp timestamptz not null default now(),
  buyer_name text not null default '',
  ticket_type_name text not null default '',
  offline_sync boolean not null default false
);

create index if not exists ticket_types_event_id_idx on public.ticket_types(event_id);
create index if not exists orders_event_id_idx on public.orders(event_id);
create index if not exists scans_event_id_idx on public.scans(event_id);
create index if not exists events_owner_id_idx on public.events(owner_id);

alter table public.events enable row level security;
alter table public.ticket_types enable row level security;
alter table public.orders enable row level security;
alter table public.scans enable row level security;

-- On supprime les anciennes policies publiques (écriture libre) après mise à jour.
drop policy if exists "public read events" on public.events;
drop policy if exists "public read ticket types" on public.ticket_types;
drop policy if exists "public read orders" on public.orders;
drop policy if exists "public read scans" on public.scans;
drop policy if exists "public insert events" on public.events;
drop policy if exists "public insert ticket types" on public.ticket_types;
drop policy if exists "public insert orders" on public.orders;
drop policy if exists "public insert scans" on public.scans;

-- Lecture publique des événements et de leurs billets.
drop policy if exists "events are readable by everyone" on public.events;
create policy "events are readable by everyone" on public.events
  for select to anon, authenticated using (true);

drop policy if exists "ticket types are readable by everyone" on public.ticket_types;
create policy "ticket types are readable by everyone" on public.ticket_types
  for select to anon, authenticated using (true);

-- Seul l'organisateur connecté peut créer/modifier ses événements et ses billets.
drop policy if exists "owners manage their events" on public.events;
create policy "owners manage their events" on public.events
  for all to authenticated
  using (owner_id = auth.uid()::text)
  with check (owner_id = auth.uid()::text);

drop policy if exists "owners manage their ticket types" on public.ticket_types;
create policy "owners manage their ticket types" on public.ticket_types
  for all to authenticated
  using (exists (
    select 1 from public.events e
    where e.id = ticket_types.event_id and e.owner_id = auth.uid()::text
  ))
  with check (exists (
    select 1 from public.events e
    where e.id = ticket_types.event_id and e.owner_id = auth.uid()::text
  ));

-- Les ventes et les scans ne sont visibles que par l'organisateur concerné.
drop policy if exists "owners read their orders" on public.orders;
create policy "owners read their orders" on public.orders
  for select to authenticated
  using (exists (
    select 1 from public.events e
    where e.id = orders.event_id and e.owner_id = auth.uid()::text
  ));

drop policy if exists "authenticated users create orders" on public.orders;
create policy "authenticated users create orders" on public.orders
  for insert to authenticated with check (true);

drop policy if exists "owners read their scans" on public.scans;
create policy "owners read their scans" on public.scans
  for select to authenticated
  using (exists (
    select 1 from public.events e
    where e.id = scans.event_id and e.owner_id = auth.uid()::text
  ));

drop policy if exists "authenticated users create scans" on public.scans;
create policy "authenticated users create scans" on public.scans
  for insert to authenticated with check (true);

-- Autoriser l'inscription (email + mot de passe) via Supabase Auth :
-- Project Settings → Authentication → Providers → Email doit être activé.

-- ============================================================================
-- INTERNATIONALISATION — données de configuration, aucune valeur dans le code
-- ============================================================================

create table if not exists public.countries (
  code text primary key,
  name text not null,
  currency text not null,
  time_zone text not null,
  locale text not null default 'en',
  guarantee_reserve_minor bigint not null default 0
);

create table if not exists public.currencies (
  code text primary key,
  digits integer not null default 2,
  symbol text not null default ''
);

create table if not exists public.tax_rules (
  id text primary key,
  country_code text not null references public.countries(code) on delete cascade,
  label text not null,
  rate numeric not null default 0,
  mode text not null default 'exclusive' check (mode in ('inclusive', 'exclusive'))
);

create table if not exists public.payment_providers (
  code text primary key,
  label_key text not null,
  config jsonb not null default '{}'::jsonb,
  active boolean not null default true
);

create table if not exists public.payment_methods (
  code text primary key,
  provider_code text not null references public.payment_providers(code),
  country_code text references public.countries(code),
  currency text,
  active boolean not null default true
);

create table if not exists public.guarantee_policies (
  id text primary key,
  country_code text not null references public.countries(code) on delete cascade,
  compensation_percent numeric not null default 0,
  claim_window_hours integer not null default 72,
  reserve_minor bigint not null default 0
);

-- Données de configuration : ajouter un pays = ajouter une ligne, sans code.
insert into public.countries (code, name, currency, time_zone, locale, guarantee_reserve_minor) values
  ('CG', 'Congo', 'XAF', 'Africa/Brazzaville', 'fr', 0),
  ('CD', 'DR Congo', 'CDF', 'Africa/Kinshasa', 'fr', 0),
  ('FR', 'France', 'EUR', 'Europe/Paris', 'fr', 0),
  ('BE', 'Belgium', 'EUR', 'Europe/Brussels', 'fr', 0),
  ('KE', 'Kenya', 'KES', 'Africa/Nairobi', 'en', 0),
  ('US', 'United States', 'USD', 'America/New_York', 'en', 0),
  ('GB', 'United Kingdom', 'GBP', 'Europe/London', 'en', 0)
on conflict (code) do nothing;

insert into public.currencies (code, digits, symbol) values
  ('XAF', 0, 'FCFA'), ('CDF', 2, 'FC'), ('EUR', 2, '€'),
  ('KES', 2, 'KSh'), ('USD', 2, '$'), ('GBP', 2, '£')
on conflict (code) do nothing;

insert into public.tax_rules (id, country_code, label, rate, mode) values
  ('CG-default', 'CG', 'TVA', 0, 'exclusive'),
  ('CD-default', 'CD', 'TVA', 0, 'exclusive'),
  ('FR-default', 'FR', 'TVA', 0.2, 'inclusive'),
  ('BE-default', 'BE', 'TVA', 0.21, 'inclusive'),
  ('KE-default', 'KE', 'VAT', 0.16, 'inclusive'),
  ('US-default', 'US', 'Sales tax', 0, 'exclusive'),
  ('GB-default', 'GB', 'VAT', 0.2, 'inclusive')
on conflict (id) do nothing;

insert into public.payment_providers (code, label_key, config, active) values
  ('card', 'payment.card', '{}'::jsonb, true),
  ('mobile-money', 'payment.mobileMoney', '{}'::jsonb, true)
on conflict (code) do nothing;

insert into public.payment_methods (code, provider_code, country_code, currency, active) values
  ('card', 'card', null, null, true),
  ('mtn', 'mobile-money', 'CG', 'XAF', true),
  ('airtel', 'mobile-money', 'CG', 'XAF', true),
  ('mtn', 'mobile-money', 'CD', 'CDF', true),
  ('airtel', 'mobile-money', 'CD', 'CDF', true),
  ('orange', 'mobile-money', 'CD', 'CDF', true),
  ('mpesa', 'mobile-money', 'KE', 'KES', true),
  ('wallet', 'mobile-money', null, null, true)
on conflict (code, provider_code, country_code) do nothing;

insert into public.guarantee_policies (id, country_code, compensation_percent, claim_window_hours, reserve_minor) values
  ('CG-default', 'CG', 0, 72, 0),
  ('CD-default', 'CD', 0, 72, 0),
  ('FR-default', 'FR', 0, 72, 0),
  ('BE-default', 'BE', 0, 72, 0),
  ('KE-default', 'KE', 0, 72, 0),
  ('US-default', 'US', 0, 72, 0),
  ('GB-default', 'GB', 0, 72, 0)
on conflict (id) do nothing;

alter table public.events add column if not exists country_code text references public.countries(code);
alter table public.events add column if not exists currency text;
alter table public.events add column if not exists time_zone text;
alter table public.events add column if not exists start_at_utc timestamptz;
alter table public.events add column if not exists locale text default 'fr';
alter table public.events add column if not exists tax_rule_id text references public.tax_rules(id);
alter table public.events add column if not exists branding jsonb not null default '{}'::jsonb;
alter table public.events add column if not exists guarantee_enabled boolean not null default true;
alter table public.events add column if not exists split_enabled boolean not null default true;
alter table public.events add column if not exists group_validation_mode text not null default 'all_or_nothing';
alter table public.events add column if not exists hold_hours integer not null default 24;
alter table public.events add column if not exists resale_cap_percent numeric not null default 1;
alter table public.events add column if not exists installments_enabled boolean not null default false;

-- ============================================================================
-- GARANTIE GRTK + PAYEZ À PLUSIEURS
-- ============================================================================

create table if not exists public.reservations (
  id text primary key,
  event_id text not null references public.events(id) on delete cascade,
  quantity integer not null check (quantity > 0),
  seat_start integer not null,
  expires_at timestamptz not null,
  group_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.group_payments (
  id text primary key,
  token text not null unique,
  event_id text not null references public.events(id) on delete cascade,
  initiator_account text not null,
  initiator_name text not null,
  country_code text not null references public.countries(code),
  currency text not null,
  validation_mode text not null default 'all_or_nothing' check (validation_mode in ('all_or_nothing', 'paid_seats')),
  quantity integer not null,
  total_amount_minor bigint not null,
  hold_hours integer not null default 24,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  status text not null default 'open',
  reminder_half_sent boolean not null default false,
  reminder_final_sent boolean not null default false
);

create table if not exists public.group_shares (
  id text primary key,
  group_id text not null references public.group_payments(id) on delete cascade,
  seat_index integer not null,
  holder_name text,
  amount_minor bigint not null,
  status text not null default 'pending',
  idempotency_key text,
  payment_method text,
  ticket_id text,
  paid_at timestamptz,
  unique (group_id, seat_index)
);

create table if not exists public.payment_intents (
  id text primary key,
  group_id text references public.group_payments(id) on delete cascade,
  share_id text references public.group_shares(id) on delete cascade,
  provider_code text not null,
  method_code text not null,
  amount_minor bigint not null,
  currency text not null,
  status text not null,
  external_ref text not null unique,
  idempotency_key text not null,
  created_at timestamptz not null default now(),
  unique (provider_code, idempotency_key)
);

create table if not exists public.tickets (
  id text primary key,
  event_id text not null references public.events(id) on delete cascade,
  group_id text references public.group_payments(id) on delete cascade,
  holder_name text not null,
  holder_account_id text not null,
  device_id text not null,
  seat_label text not null,
  price_minor bigint not null,
  currency text not null,
  status text not null default 'active',
  qr_version integer not null default 1,
  created_at timestamptz not null default now(),
  unique (event_id, seat_label)
);

create table if not exists public.qr_tokens (
  id text primary key,
  ticket_id text not null references public.tickets(id) on delete cascade,
  token_hash text not null unique,
  version integer not null,
  window_start timestamptz not null,
  device_id text not null,
  used_at timestamptz
);

create table if not exists public.device_bindings (
  id text primary key,
  account_id text not null,
  device_id text not null unique,
  public_key text not null,
  revoked boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.transfers (
  id text primary key,
  ticket_id text not null references public.tickets(id) on delete cascade,
  from_account text not null,
  to_account text not null,
  price_minor bigint not null,
  old_qr_version integer not null,
  new_qr_version integer not null,
  created_at timestamptz not null default now()
);

create table if not exists public.scan_logs (
  id text primary key,
  ticket_id text not null references public.tickets(id) on delete cascade,
  scanner_id text not null,
  nonce text not null,
  result text not null,
  reason text,
  created_at timestamptz not null default now(),
  unique (nonce, scanner_id)
);

create table if not exists public.refund_claims (
  id text primary key,
  ticket_id text not null references public.tickets(id) on delete cascade,
  reason text not null,
  photo_url text,
  status text not null default 'pending',
  decision text,
  amount_minor bigint not null,
  decided_at timestamptz,
  decided_by text,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id text primary key default gen_random_uuid()::text,
  action text not null,
  actor text not null,
  entity_id text not null,
  metadata jsonb not null default '{}'::jsonb,
  ip_address text,
  created_at timestamptz not null default now()
);

create index if not exists reservations_event_idx on public.reservations(event_id, expires_at);
create index if not exists groups_token_idx on public.group_payments(token);
create index if not exists groups_expires_idx on public.group_payments(expires_at) where status = 'open';
create index if not exists shares_group_idx on public.group_shares(group_id);
create index if not exists intents_idempotency_idx on public.payment_intents(idempotency_key);
create index if not exists tickets_event_idx on public.tickets(event_id);
create index if not exists tickets_holder_idx on public.tickets(holder_account_id);
create index if not exists qr_tokens_ticket_idx on public.qr_tokens(ticket_id, version);
create index if not exists scans_ticket_idx on public.scan_logs(ticket_id);
create index if not exists claims_status_idx on public.refund_claims(status);
create index if not exists audit_entity_idx on public.audit_logs(entity_id, created_at desc);

-- Réservation atomique : verrouille la ligne événement puis compte les places actives.
create or replace function public.reserve_seats(
  p_event_id text,
  p_quantity integer,
  p_capacity integer,
  p_hold_hours integer default 24,
  p_group_id text default null
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_held integer;
  v_reservation_id text := gen_random_uuid()::text;
  v_expires timestamptz := now() + (p_hold_hours || ' hours')::interval;
begin
  if p_quantity is null or p_quantity <= 0 then
    return jsonb_build_object('ok', false, 'error', 'INVALID_QUANTITY');
  end if;

  perform 1 from public.events where id = p_event_id for update;

  select coalesce(sum(quantity), 0) into v_held
  from public.reservations
  where event_id = p_event_id and expires_at > now();

  if v_held + p_quantity > p_capacity then
    return jsonb_build_object('ok', false, 'error', 'SOLD_OUT');
  end if;

  insert into public.reservations(id, event_id, quantity, seat_start, expires_at, group_id)
  values (v_reservation_id, p_event_id, p_quantity, v_held + 1, v_expires, p_group_id);

  return jsonb_build_object(
    'ok', true,
    'reservation', jsonb_build_object(
      'id', v_reservation_id,
      'quantity', p_quantity,
      'seatStart', v_held + 1,
      'expiresAt', v_expires
    )
  );
end;
$$;

-- RLS : lecture des paiements par les participants, du reste par l'organisateur.
alter table public.reservations enable row level security;
alter table public.group_payments enable row level security;
alter table public.group_shares enable row level security;
alter table public.payment_intents enable row level security;
alter table public.tickets enable row level security;
alter table public.qr_tokens enable row level security;
alter table public.device_bindings enable row level security;
alter table public.transfers enable row level security;
alter table public.scan_logs enable row level security;
alter table public.refund_claims enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists "participants read group" on public.group_payments;
create policy "participants read group" on public.group_payments
  for select to anon, authenticated using (true);

drop policy if exists "participants read shares" on public.group_shares;
create policy "participants read shares" on public.group_shares
  for select to anon, authenticated using (true);

drop policy if exists "owners read their tickets" on public.tickets;
create policy "owners read their tickets" on public.tickets
  for select to authenticated
  using (
    holder_account_id = auth.uid()::text
    or exists (
      select 1 from public.events e
      where e.id = tickets.event_id and e.owner_id = auth.uid()::text
    )
  );

drop policy if exists "holders read their claims" on public.refund_claims;
create policy "holders read their claims" on public.refund_claims
  for select to authenticated
  using (exists (
    select 1 from public.tickets t
    where t.id = refund_claims.ticket_id and t.holder_account_id = auth.uid()::text
  ));

-- RGPD : un compte peut demander la suppression de ses données personnelles.
create or replace function public.delete_my_data()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.qr_tokens where device_id in (
    select device_id from public.device_bindings where account_id = auth.uid()::text
  );
  delete from public.device_bindings where account_id = auth.uid()::text;
  delete from public.tickets where holder_account_id = auth.uid()::text;
end;
$$;

-- ============================================================================
-- IMAGES — bucket public, avatar et galerie (bloc idempotent)
-- ============================================================================

-- Bucket public : les URL renvoyées par /api/v1/uploads sont directement lisibles.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'grtk-images', 'grtk-images', true, 8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "grtk images are publicly readable" on storage.objects;
create policy "grtk images are publicly readable" on storage.objects
  for select to anon, authenticated using (bucket_id = 'grtk-images');

-- Le serveur upload avec la clé service_role (bypass RLS) et génère les chemins.
-- Ces policies ne couvrent que les accès directs depuis le navigateur.
drop policy if exists "authenticated users upload grtk images" on storage.objects;
create policy "authenticated users upload grtk images" on storage.objects
  for insert to authenticated with check (bucket_id = 'grtk-images');

drop policy if exists "users delete their grtk images" on storage.objects;
create policy "users delete their grtk images" on storage.objects
  for delete to authenticated using (bucket_id = 'grtk-images');

create table if not exists public.profiles (
  id text primary key,
  full_name text not null default '',
  avatar_url text,
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists avatar_url text;

alter table public.profiles enable row level security;

drop policy if exists "profiles are readable by everyone" on public.profiles;
create policy "profiles are readable by everyone" on public.profiles
  for select to anon, authenticated using (true);

drop policy if exists "users manage their profile" on public.profiles;
create policy "users manage their profile" on public.profiles
  for all to authenticated
  using (id = auth.uid()::text)
  with check (id = auth.uid()::text);

create table if not exists public.event_gallery (
  id text primary key default gen_random_uuid()::text,
  event_id text not null references public.events(id) on delete cascade,
  url text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists event_gallery_event_idx on public.event_gallery(event_id, position);

alter table public.event_gallery enable row level security;

drop policy if exists "gallery images are readable by everyone" on public.event_gallery;
create policy "gallery images are readable by everyone" on public.event_gallery
  for select to anon, authenticated using (true);

drop policy if exists "owners manage their gallery" on public.event_gallery;
create policy "owners manage their gallery" on public.event_gallery
  for all to authenticated
  using (exists (
    select 1 from public.events e
    where e.id = event_gallery.event_id and e.owner_id = auth.uid()::text
  ))
  with check (exists (
    select 1 from public.events e
    where e.id = event_gallery.event_id and e.owner_id = auth.uid()::text
  ));

-- GODMAN RECORDS TIKET — Schéma Supabase
-- À exécuter une seule fois dans le SQL Editor de Supabase.

create table if not exists public.events (
  id text primary key,
  title text not null,
  slug text not null unique,
  subtitle text,
  category text not null,
  description text not null default '',
  venue text not null default '',
  city text not null default 'Brazzaville',
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

alter table public.events enable row level security;
alter table public.ticket_types enable row level security;
alter table public.orders enable row level security;
alter table public.scans enable row level security;

-- Lecture publique (clé anon)
drop policy if exists "public read events" on public.events;
create policy "public read events" on public.events for select to anon, authenticated using (true);

drop policy if exists "public read ticket types" on public.ticket_types;
create policy "public read ticket types" on public.ticket_types for select to anon, authenticated using (true);

drop policy if exists "public read orders" on public.orders;
create policy "public read orders" on public.orders for select to anon, authenticated using (true);

drop policy if exists "public read scans" on public.scans;
create policy "public read scans" on public.scans for select to anon, authenticated using (true);

-- Écriture publique pour la démo (à restreindre plus tard avec l'authentification)
drop policy if exists "public insert events" on public.events;
create policy "public insert events" on public.events for insert to anon, authenticated with check (true);

drop policy if exists "public insert ticket types" on public.ticket_types;
create policy "public insert ticket types" on public.ticket_types for insert to anon, authenticated with check (true);

drop policy if exists "public insert orders" on public.orders;
create policy "public insert orders" on public.orders for insert to anon, authenticated with check (true);

drop policy if exists "public insert scans" on public.scans;
create policy "public insert scans" on public.scans for insert to anon, authenticated with check (true);

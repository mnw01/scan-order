-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Products Table (Menu Items)
create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  price numeric not null,
  category text not null, -- 'recommended', 'staple', 'soup', etc.
  image_url text,
  is_available boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Tables Table (Restaurant Tables)
create table if not exists public.tables (
  id uuid primary key default uuid_generate_v4(),
  table_number text not null unique,
  qr_code_url text,
  status text default 'available', -- 'available', 'occupied', 'dining'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Orders Table
create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  table_id uuid references public.tables(id),
  table_number text, -- Denormalized for easier query
  status text default 'pending', -- 'pending', 'cooking', 'served', 'completed', 'cancelled'
  total_amount numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Order Items Table
create table if not exists public.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references public.orders(id),
  product_id uuid references public.products(id),
  product_name text, -- Denormalized
  price numeric,
  quantity int default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Realtime
alter publication supabase_realtime add table public.products;
alter publication supabase_realtime add table public.tables;
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.order_items;

-- Enable RLS (Row Level Security) - Simplistic policy for demo
alter table public.products enable row level security;
alter table public.tables enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Allow anon access for demo purposes (modify for production!)
create policy "Enable all access for anon" on public.products for all using (true) with check (true);
create policy "Enable all access for anon" on public.tables for all using (true) with check (true);
create policy "Enable all access for anon" on public.orders for all using (true) with check (true);
create policy "Enable all access for anon" on public.order_items for all using (true) with check (true);

-- Insert Dummy Data
insert into public.products (name, category, price, description, image_url) values
('招牌红烧肉', 'recommended', 58, '肥而不腻，入口即化', 'https://images.unsplash.com/photo-1529193591184-b1d580690dd4?auto=format&fit=crop&w=800&q=80'),
('清蒸鲈鱼', 'recommended', 88, '鲜嫩多汁，原汁原味', 'https://images.unsplash.com/photo-1535914616238-d62f44dc0c3c?auto=format&fit=crop&w=800&q=80'),
('干炒牛河', 'staple', 28, '镬气十足', 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=80'),
('番茄蛋汤', 'soup', 12, '酸甜开胃', 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80');

insert into public.tables (table_number) values ('1'), ('2'), ('3'), ('4'), ('5');

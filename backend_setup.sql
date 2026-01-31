-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ==========================================
-- 1. Tables Setup
-- ==========================================

-- 1.1 Restaurants Table
create table if not exists public.restaurants (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  owner_id uuid, -- Link to Supabase Auth User ID
  logo_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 1.2 Menu Items Table (Replaces products)
create table if not exists public.menu_items (
  id uuid primary key default uuid_generate_v4(),
  restaurant_id uuid references public.restaurants(id) not null,
  name text not null,
  description text,
  price numeric not null,
  stock int default -1, -- -1 means unlimited
  category text not null,
  image_url text,
  is_available boolean default true,
  options jsonb, -- Stores customization options
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 1.3 Cart Items Table
create table if not exists public.cart_items (
  id uuid primary key default uuid_generate_v4(),
  restaurant_id uuid references public.restaurants(id) not null,
  table_number text not null,
  menu_item_id uuid references public.menu_items(id) not null,
  quantity int not null default 1,
  selected_options jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 1.4 Orders Table
create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  restaurant_id uuid references public.restaurants(id) not null,
  table_number text not null,
  status text default 'pending', -- pending, preparing, served, completed
  total_amount numeric default 0,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 1.5 Order Items Table
create table if not exists public.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references public.orders(id) not null,
  menu_item_id uuid references public.menu_items(id),
  quantity int not null,
  unit_price numeric not null,
  selected_options jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================
-- 2. Realtime Enablement
-- ==========================================
-- ==========================================
-- 2. Realtime Enablement (Safe Mode)
-- ==========================================
do $$
begin
  -- Restaurants
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'restaurants') then
    alter publication supabase_realtime add table public.restaurants;
  end if;
  
  -- Menu Items
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'menu_items') then
    alter publication supabase_realtime add table public.menu_items;
  end if;

  -- Cart Items
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'cart_items') then
    alter publication supabase_realtime add table public.cart_items;
  end if;

  -- Orders
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'orders') then
    alter publication supabase_realtime add table public.orders;
  end if;

  -- Order Items
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'order_items') then
    alter publication supabase_realtime add table public.order_items;
  end if;
end $$;

-- ==========================================
-- 3. Row Level Security (RLS)
-- ==========================================
-- For demo purposes, we will allow public read/write access.
-- generic permissive policies
alter table public.restaurants enable row level security;
create policy "Allow public access" on public.restaurants for all using (true) with check (true);

alter table public.menu_items enable row level security;
create policy "Allow public access" on public.menu_items for all using (true) with check (true);

alter table public.cart_items enable row level security;
create policy "Allow public access" on public.cart_items for all using (true) with check (true);

alter table public.orders enable row level security;
create policy "Allow public access" on public.orders for all using (true) with check (true);

alter table public.order_items enable row level security;
create policy "Allow public access" on public.order_items for all using (true) with check (true);

-- ==========================================
-- 4. Stored Procedures (RPC)
-- ==========================================

-- 4.1 Checkout Cart
create or replace function public.checkout_cart(
  p_restaurant_id uuid,
  p_table_number text,
  p_notes text default null
) returns uuid as $$
declare
  v_order_id uuid;
  v_total_amount numeric;
  v_item record;
begin
  -- 1. Calculate total
  select coalesce(sum(c.quantity * m.price), 0)
  into v_total_amount
  from public.cart_items c
  join public.menu_items m on c.menu_item_id = m.id
  where c.restaurant_id = p_restaurant_id 
    and c.table_number = p_table_number;

  if v_total_amount = 0 then
    raise exception 'Cart is empty';
  end if;

  -- 2. Create Order
  insert into public.orders (restaurant_id, table_number, total_amount, notes, status)
  values (p_restaurant_id, p_table_number, v_total_amount, p_notes, 'pending')
  returning id into v_order_id;

  -- 3. Move items from Cart to Order Items
  insert into public.order_items (order_id, menu_item_id, quantity, unit_price, selected_options)
  select 
    v_order_id,
    c.menu_item_id,
    c.quantity,
    m.price,
    c.selected_options
  from public.cart_items c
  join public.menu_items m on c.menu_item_id = m.id
  where c.restaurant_id = p_restaurant_id 
    and c.table_number = p_table_number;

  -- 4. Clear Cart
  delete from public.cart_items
  where restaurant_id = p_restaurant_id 
    and table_number = p_table_number;

  return v_order_id;
end;
$$ language plpgsql;

-- ==========================================
-- 5. Seed Data
-- ==========================================

do $$
declare
  v_restaurant_id uuid;
begin
  -- Create Demo Restaurant if not exists
  if not exists (select 1 from public.restaurants where slug = 'demo-restaurant') then
    insert into public.restaurants (name, slug, logo_url)
    values (
      '米其林大饭店 (Demo)', 
      'demo-restaurant',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=100&q=80'
    )
    returning id into v_restaurant_id;

    -- Insert Menu Items
    insert into public.menu_items (restaurant_id, name, category, price, description, image_url, options) values
    (
      v_restaurant_id, 
      '招牌红烧肉', 
      'recommended', 
      58, 
      '肥而不腻，入口即化，经典本帮口味', 
      'https://images.unsplash.com/photo-1529193591184-b1d580690dd4?auto=format&fit=crop&w=800&q=80',
      '[{"name": "辣度", "choices": ["微辣", "中辣", "特辣"], "required": false}]'::jsonb
    ),
    (
      v_restaurant_id, 
      '清蒸鲈鱼', 
      'recommended', 
      88, 
      '每日新鲜活鱼，肉质鲜嫩', 
      'https://images.unsplash.com/photo-1535914616238-d62f44dc0c3c?auto=format&fit=crop&w=800&q=80',
      '[]'::jsonb
    ),
    (
      v_restaurant_id, 
      '干炒牛河', 
      'staple', 
      28, 
      '镬气十足，牛肉嫩滑', 
      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=80',
      '[]'::jsonb
    ),
    (
      v_restaurant_id, 
      '珍珠奶茶', 
      'drinks', 
      18, 
      'Q弹珍珠，香醇奶茶', 
      'https://images.unsplash.com/photo-1541658016709-82535e94bc69?auto=format&fit=crop&w=800&q=80',
      '[{"name": "甜度", "choices": ["全糖", "半糖", "三分糖"], "required": true}, {"name": "温度", "choices": ["热", "少冰", "去冰"], "required": true}]'::jsonb
    );
  end if;
end $$;

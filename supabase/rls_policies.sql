-- Row Level Security Policies for Multi-Tenant Data Isolation
-- Run this AFTER schema.sql

-- Enable RLS on all tables
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RESTAURANTS POLICIES
-- ============================================
-- Anyone can read restaurant info
CREATE POLICY "Restaurants are publicly readable"
  ON restaurants FOR SELECT
  USING (true);

-- Only owners can update their restaurant
CREATE POLICY "Owners can update their restaurant"
  ON restaurants FOR UPDATE
  USING (auth.uid() = owner_id);

-- Authenticated users can create restaurants
CREATE POLICY "Authenticated users can create restaurants"
  ON restaurants FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- MENU ITEMS POLICIES
-- ============================================
-- Anyone can read menu items
CREATE POLICY "Menu items are publicly readable"
  ON menu_items FOR SELECT
  USING (true);

-- Only restaurant owners can manage menu items
CREATE POLICY "Owners can insert menu items"
  ON menu_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM restaurants 
      WHERE id = menu_items.restaurant_id 
      AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners can update menu items"
  ON menu_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM restaurants 
      WHERE id = menu_items.restaurant_id 
      AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners can delete menu items"
  ON menu_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM restaurants 
      WHERE id = menu_items.restaurant_id 
      AND owner_id = auth.uid()
    )
  );

-- ============================================
-- ORDERS POLICIES
-- ============================================
-- Restaurant owners can view their orders
CREATE POLICY "Owners can view restaurant orders"
  ON orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM restaurants 
      WHERE id = orders.restaurant_id 
      AND owner_id = auth.uid()
    )
  );

-- Anyone can create orders (customers placing orders)
CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  WITH CHECK (true);

-- Owners can update order status
CREATE POLICY "Owners can update orders"
  ON orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM restaurants 
      WHERE id = orders.restaurant_id 
      AND owner_id = auth.uid()
    )
  );

-- ============================================
-- ORDER ITEMS POLICIES
-- ============================================
-- Order items follow parent order permissions
CREATE POLICY "Order items readable with order access"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      JOIN restaurants r ON o.restaurant_id = r.id
      WHERE o.id = order_items.order_id 
      AND r.owner_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can insert order items"
  ON order_items FOR INSERT
  WITH CHECK (true);

-- ============================================
-- CART ITEMS POLICIES
-- ============================================
-- Cart items are accessible by anyone (no auth required for customers)
CREATE POLICY "Cart items are publicly accessible"
  ON cart_items FOR SELECT
  USING (true);

CREATE POLICY "Anyone can add to cart"
  ON cart_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update cart items"
  ON cart_items FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete cart items"
  ON cart_items FOR DELETE
  USING (true);

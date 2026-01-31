-- Atomic Checkout RPC Function
-- This function moves cart items to an order in a single transaction
-- Run this AFTER schema.sql

CREATE OR REPLACE FUNCTION checkout_cart(
  p_restaurant_id UUID,
  p_table_number TEXT,
  p_notes TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_id UUID;
  v_total DECIMAL(10,2);
  v_item_count INTEGER;
BEGIN
  -- Lock cart rows and calculate total
  SELECT 
    COALESCE(SUM(ci.quantity * mi.price), 0),
    COUNT(ci.id)
  INTO v_total, v_item_count
  FROM cart_items ci
  JOIN menu_items mi ON ci.menu_item_id = mi.id
  WHERE ci.restaurant_id = p_restaurant_id 
    AND ci.table_number = p_table_number
  FOR UPDATE OF ci;
  
  -- Check if cart is empty
  IF v_item_count = 0 THEN
    RAISE EXCEPTION 'Cart is empty';
  END IF;
  
  -- Create the order
  INSERT INTO orders (restaurant_id, table_number, total_amount, notes)
  VALUES (p_restaurant_id, p_table_number, v_total, p_notes)
  RETURNING id INTO v_order_id;
  
  -- Copy cart items to order items
  INSERT INTO order_items (order_id, menu_item_id, quantity, selected_options, unit_price)
  SELECT 
    v_order_id,
    ci.menu_item_id,
    ci.quantity,
    ci.selected_options,
    mi.price
  FROM cart_items ci
  JOIN menu_items mi ON ci.menu_item_id = mi.id
  WHERE ci.restaurant_id = p_restaurant_id 
    AND ci.table_number = p_table_number;
  
  -- Clear the cart
  DELETE FROM cart_items 
  WHERE restaurant_id = p_restaurant_id 
    AND table_number = p_table_number;
  
  RETURN v_order_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION checkout_cart TO public;
GRANT EXECUTE ON FUNCTION checkout_cart TO anon;
GRANT EXECUTE ON FUNCTION checkout_cart TO authenticated;

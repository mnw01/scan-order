-- Seed Data for Testing
-- Creates a demo restaurant with sample menu items

-- Insert demo restaurant (use a fixed UUID for testing)
INSERT INTO restaurants (id, name, slug, logo_url)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Demo Restaurant',
  'demo',
  NULL
)
ON CONFLICT (slug) DO NOTHING;

-- Insert menu items for the demo restaurant
INSERT INTO menu_items (restaurant_id, category, name, price, options, image_url, is_available)
VALUES
  -- Beverages
  ('00000000-0000-0000-0000-000000000001', '饮品', '珍珠奶茶', 18.00, 
   '[{"name": "甜度", "choices": ["无糖", "三分糖", "五分糖", "正常"], "required": true}, {"name": "冰量", "choices": ["去冰", "少冰", "正常冰"], "required": true}]'::jsonb,
   NULL, true),
  ('00000000-0000-0000-0000-000000000001', '饮品', '柠檬绿茶', 15.00,
   '[{"name": "甜度", "choices": ["无糖", "三分糖", "正常"], "required": true}]'::jsonb,
   NULL, true),
  ('00000000-0000-0000-0000-000000000001', '饮品', '芒果冰沙', 22.00, '[]'::jsonb, NULL, true),
  
  -- Main Dishes
  ('00000000-0000-0000-0000-000000000001', '主食', '红烧牛肉面', 38.00,
   '[{"name": "辣度", "choices": ["不辣", "微辣", "中辣", "特辣"], "required": true}]'::jsonb,
   NULL, true),
  ('00000000-0000-0000-0000-000000000001', '主食', '蛋炒饭', 25.00, '[]'::jsonb, NULL, true),
  ('00000000-0000-0000-0000-000000000001', '主食', '宫保鸡丁盖饭', 32.00,
   '[{"name": "辣度", "choices": ["微辣", "中辣"], "required": true}]'::jsonb,
   NULL, true),
  
  -- Sides
  ('00000000-0000-0000-0000-000000000001', '小食', '炸鸡翅 (6个)', 28.00, '[]'::jsonb, NULL, true),
  ('00000000-0000-0000-0000-000000000001', '小食', '薯条', 15.00,
   '[{"name": "调味", "choices": ["原味", "椒盐", "番茄酱"]}]'::jsonb,
   NULL, true),
  ('00000000-0000-0000-0000-000000000001', '小食', '春卷 (4个)', 18.00, '[]'::jsonb, NULL, true),
  
  -- Desserts
  ('00000000-0000-0000-0000-000000000001', '甜点', '芒果布丁', 16.00, '[]'::jsonb, NULL, true),
  ('00000000-0000-0000-0000-000000000001', '甜点', '抹茶蛋糕', 22.00, '[]'::jsonb, NULL, true)
ON CONFLICT DO NOTHING;

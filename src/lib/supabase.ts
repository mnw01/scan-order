import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase is configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
    console.warn(
        '⚠️ Supabase 未配置！请创建 .env 文件并添加以下内容：\n' +
        'VITE_SUPABASE_URL=your_supabase_project_url\n' +
        'VITE_SUPABASE_ANON_KEY=your_supabase_anon_key'
    );
}

// Create Supabase client with fallback for development
// Using placeholder URL to avoid crash when env vars are missing
export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key'
);

// Helper to get a typed real-time channel for cart items
export function getCartChannel(restaurantId: string, tableNumber: string) {
    return supabase.channel(`cart-${restaurantId}-${tableNumber}`);
}

// Helper to get a typed real-time channel for orders
export function getOrdersChannel(restaurantId: string) {
    return supabase.channel(`orders-${restaurantId}`);
}

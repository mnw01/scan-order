// Database types for the multi-tenant restaurant system

export type OrderStatus = 'pending' | 'preparing' | 'served' | 'completed';

export interface Restaurant {
    id: string;
    name: string;
    slug: string;
    owner_id: string | null;
    logo_url: string | null;
    created_at: string;
}

export interface MenuItemOption {
    name: string;
    choices: string[];
    required?: boolean;
}

export interface MenuItem {
    id: string;
    restaurant_id: string;
    category: string;
    name: string;
    price: number;
    stock: number;
    description?: string;
    options: MenuItemOption[];
    image_url: string | null;
    is_available: boolean;
    created_at: string;
}

export interface Order {
    id: string;
    restaurant_id: string;
    table_number: string;
    status: OrderStatus;
    total_amount: number;
    notes: string | null;
    created_at: string;
}

export interface OrderItem {
    id: string;
    order_id: string;
    menu_item_id: string;
    quantity: number;
    selected_options: Record<string, string>;
    unit_price: number;
    // Joined fields
    menu_item?: MenuItem;
}

export interface OrderWithItems extends Order {
    order_items: OrderItem[];
}

export interface CartItem {
    id: string;
    restaurant_id: string;
    table_number: string;
    menu_item_id: string;
    quantity: number;
    selected_options: Record<string, string>;
    created_at: string;
    // Joined fields
    menu_item?: MenuItem;
}

// Supabase Database types
export interface Database {
    public: {
        Tables: {
            restaurants: {
                Row: Restaurant;
                Insert: Omit<Restaurant, 'id' | 'created_at'>;
                Update: Partial<Omit<Restaurant, 'id'>>;
            };
            menu_items: {
                Row: MenuItem;
                Insert: Omit<MenuItem, 'id' | 'created_at'>;
                Update: Partial<Omit<MenuItem, 'id'>>;
            };
            orders: {
                Row: Order;
                Insert: Omit<Order, 'id' | 'created_at' | 'status'>;
                Update: Partial<Omit<Order, 'id'>>;
            };
            order_items: {
                Row: OrderItem;
                Insert: Omit<OrderItem, 'id'>;
                Update: Partial<Omit<OrderItem, 'id'>>;
            };
            cart_items: {
                Row: CartItem;
                Insert: Omit<CartItem, 'id' | 'created_at'>;
                Update: Partial<Omit<CartItem, 'id'>>;
            };
        };
        Functions: {
            checkout_cart: {
                Args: { p_restaurant_id: string; p_table_number: string };
                Returns: string;
            };
        };
    };
}

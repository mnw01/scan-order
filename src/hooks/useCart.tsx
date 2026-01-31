import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { CartItem, MenuItem } from '../lib/types';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface CartContextType {
    items: CartItem[];
    isLoading: boolean;
    error: string | null;
    addItem: (menuItem: MenuItem, quantity: number, selectedOptions: Record<string, string>) => Promise<void>;
    updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
    removeItem: (cartItemId: string) => Promise<void>;
    checkout: (notes?: string) => Promise<string>;
    totalAmount: number;
    totalItems: number;
}

const CartContext = createContext<CartContextType | null>(null);

interface CartProviderProps {
    children: ReactNode;
    restaurantId: string;
    tableNumber: string;
}

export function CartProvider({ children, restaurantId, tableNumber }: CartProviderProps) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch cart items with menu item details
    const fetchCartItems = useCallback(async () => {
        try {
            const { data, error: fetchError } = await supabase
                .from('cart_items')
                .select(`
          *,
          menu_item:menu_items(*)
        `)
                .eq('restaurant_id', restaurantId)
                .eq('table_number', tableNumber)
                .order('created_at', { ascending: true });

            if (fetchError) throw fetchError;
            setItems(data || []);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load cart');
        } finally {
            setIsLoading(false);
        }
    }, [restaurantId, tableNumber]);

    // Set up real-time subscription
    useEffect(() => {
        fetchCartItems();

        // Subscribe to cart changes
        const channel: RealtimeChannel = supabase
            .channel(`cart:${restaurantId}:${tableNumber}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'cart_items',
                    filter: `restaurant_id=eq.${restaurantId}`,
                },
                (payload) => {
                    // Only handle changes for our table
                    if (payload.new && 'table_number' in payload.new && payload.new.table_number !== tableNumber) {
                        return;
                    }
                    if (payload.old && 'table_number' in payload.old && payload.old.table_number !== tableNumber) {
                        return;
                    }
                    // Refetch to get joined data
                    fetchCartItems();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [restaurantId, tableNumber, fetchCartItems]);

    // Add item to cart
    const addItem = async (menuItem: MenuItem, quantity: number, selectedOptions: Record<string, string>) => {
        try {
            // Check if same item with same options exists
            const existingItem = items.find(
                item =>
                    item.menu_item_id === menuItem.id &&
                    JSON.stringify(item.selected_options) === JSON.stringify(selectedOptions)
            );

            if (existingItem) {
                // Update quantity
                await updateQuantity(existingItem.id, existingItem.quantity + quantity);
            } else {
                // Insert new item
                const { error: insertError } = await supabase
                    .from('cart_items')
                    .insert({
                        restaurant_id: restaurantId,
                        table_number: tableNumber,
                        menu_item_id: menuItem.id,
                        quantity,
                        selected_options: selectedOptions,
                    });

                if (insertError) throw insertError;
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add item');
            throw err;
        }
    };

    // Update quantity
    const updateQuantity = async (cartItemId: string, quantity: number) => {
        try {
            if (quantity <= 0) {
                await removeItem(cartItemId);
                return;
            }

            const { error: updateError } = await supabase
                .from('cart_items')
                .update({ quantity })
                .eq('id', cartItemId);

            if (updateError) throw updateError;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update quantity');
            throw err;
        }
    };

    // Remove item
    const removeItem = async (cartItemId: string) => {
        try {
            const { error: deleteError } = await supabase
                .from('cart_items')
                .delete()
                .eq('id', cartItemId);

            if (deleteError) throw deleteError;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to remove item');
            throw err;
        }
    };

    // Checkout using RPC
    const checkout = async (notes?: string): Promise<string> => {
        try {
            const { data, error: checkoutError } = await supabase
                .rpc('checkout_cart', {
                    p_restaurant_id: restaurantId,
                    p_table_number: tableNumber,
                    p_notes: notes || null,
                });

            if (checkoutError) throw checkoutError;
            return data as string;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Checkout failed';
            setError(message);
            throw new Error(message);
        }
    };

    // Calculate totals
    const totalAmount = items.reduce((sum, item) => {
        const price = item.menu_item?.price || 0;
        return sum + price * item.quantity;
    }, 0);

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                items,
                isLoading,
                error,
                addItem,
                updateQuantity,
                removeItem,
                checkout,
                totalAmount,
                totalItems,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}

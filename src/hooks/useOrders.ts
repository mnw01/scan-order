import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { Order, OrderWithItems, Restaurant } from '../lib/types';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface UseOrdersResult {
    orders: OrderWithItems[];
    isLoading: boolean;
    error: string | null;
    updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
    refetch: () => Promise<void>;
}

export function useOrders(restaurantId: string | null, onNewOrder?: () => void): UseOrdersResult {
    const [orders, setOrders] = useState<OrderWithItems[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const channelRef = useRef<RealtimeChannel | null>(null);

    const fetchOrders = useCallback(async () => {
        if (!restaurantId) return;

        try {
            setIsLoading(true);
            setError(null);

            const { data, error: fetchError } = await supabase
                .from('orders')
                .select(`
          *,
          order_items (
            *,
            menu_item:menu_items(*)
          )
        `)
                .eq('restaurant_id', restaurantId)
                .in('status', ['pending', 'preparing', 'served'])
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;
            setOrders(data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load orders');
        } finally {
            setIsLoading(false);
        }
    }, [restaurantId]);

    // Set up real-time subscription
    useEffect(() => {
        if (!restaurantId) return;

        fetchOrders();

        // Subscribe to order changes for this restaurant only
        const channel = supabase
            .channel(`orders:${restaurantId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'orders',
                    filter: `restaurant_id=eq.${restaurantId}`,
                },
                () => {
                    // Refetch to get full order with items
                    fetchOrders();
                    // Trigger new order callback (for audio notification)
                    onNewOrder?.();
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'orders',
                    filter: `restaurant_id=eq.${restaurantId}`,
                },
                () => {
                    fetchOrders();
                }
            )
            .subscribe();

        channelRef.current = channel;

        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
            }
        };
    }, [restaurantId, fetchOrders, onNewOrder]);

    const updateOrderStatus = async (orderId: string, status: Order['status']) => {
        try {
            const { error: updateError } = await supabase
                .from('orders')
                .update({ status })
                .eq('id', orderId);

            if (updateError) throw updateError;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update order');
            throw err;
        }
    };

    return {
        orders,
        isLoading,
        error,
        updateOrderStatus,
        refetch: fetchOrders,
    };
}

// Hook to get restaurant by slug with ownership check
export function useRestaurantWithAuth(slug: string) {
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isOwner, setIsOwner] = useState(false);

    useEffect(() => {
        async function fetchRestaurant() {
            try {
                setIsLoading(true);
                setError(null);

                // Get current user
                const { data: { user } } = await supabase.auth.getUser();

                // Fetch restaurant
                const { data, error: fetchError } = await supabase
                    .from('restaurants')
                    .select('*')
                    .eq('slug', slug)
                    .single();

                if (fetchError) {
                    if (fetchError.code === 'PGRST116') {
                        setError('Restaurant not found');
                    } else {
                        throw fetchError;
                    }
                    return;
                }

                setRestaurant(data);
                setIsOwner(user?.id === data.owner_id);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load restaurant');
            } finally {
                setIsLoading(false);
            }
        }

        if (slug) {
            fetchRestaurant();
        }
    }, [slug]);

    return { restaurant, isLoading, error, isOwner };
}

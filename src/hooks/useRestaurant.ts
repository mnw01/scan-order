import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Restaurant, MenuItem } from '../lib/types';

interface UseRestaurantResult {
    restaurant: Restaurant | null;
    menuItems: MenuItem[];
    categories: string[];
    isLoading: boolean;
    error: string | null;
}

export function useRestaurant(slug: string): UseRestaurantResult {
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchRestaurantData() {
            try {
                setIsLoading(true);
                setError(null);

                // Fetch restaurant by slug
                const { data: restaurantData, error: restaurantError } = await supabase
                    .from('restaurants')
                    .select('*')
                    .eq('slug', slug)
                    .single();

                if (restaurantError) {
                    if (restaurantError.code === 'PGRST116') {
                        setError('Restaurant not found');
                    } else {
                        throw restaurantError;
                    }
                    return;
                }

                setRestaurant(restaurantData);

                // Fetch menu items for this restaurant
                const { data: menuData, error: menuError } = await supabase
                    .from('menu_items')
                    .select('*')
                    .eq('restaurant_id', restaurantData.id)
                    .eq('is_available', true)
                    .order('category')
                    .order('name');

                if (menuError) throw menuError;

                setMenuItems(menuData || []);

                // Extract unique categories
                const uniqueCategories = [...new Set((menuData || []).map(item => item.category))];
                setCategories(uniqueCategories);

            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load restaurant');
            } finally {
                setIsLoading(false);
            }
        }

        if (slug) {
            fetchRestaurantData();
        }
    }, [slug]);

    return { restaurant, menuItems, categories, isLoading, error };
}

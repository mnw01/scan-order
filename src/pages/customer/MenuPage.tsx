import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { ShoppingBag, Loader2, Store } from 'lucide-react';
import { useRestaurant } from '../../hooks/useRestaurant';
import { CartProvider, useCart } from '../../hooks/useCart';
import { MenuCard } from '../../components/customer/MenuCard';
import { CategoryTabs } from '../../components/customer/CategoryTabs';
import { ItemModal } from '../../components/customer/ItemModal';
import { CartSheet } from '../../components/customer/CartSheet';
import type { MenuItem } from '../../lib/types';
import { NotFoundPage } from '../../pages/NotFoundPage';

function MenuPageContent() {
    const { restaurantSlug, tableId } = useParams<{ restaurantSlug: string; tableId: string }>();
    const { restaurant, menuItems, categories, isLoading, error } = useRestaurant(restaurantSlug || '');
    const { totalItems, addItem } = useCart();

    const [activeCategory, setActiveCategory] = useState('all');
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

    // Filter items by category
    const filteredItems = useMemo(() => {
        if (activeCategory === 'all') return menuItems;
        return menuItems.filter(item => item.category === activeCategory);
    }, [menuItems, activeCategory]);

    const handleAddToCart = async (quantity: number, selectedOptions: Record<string, string>) => {
        if (!selectedItem) return;
        try {
            await addItem(selectedItem, quantity, selectedOptions);
        } catch (err) {
            console.error('Failed to add to cart:', err);
        }
    };

    const handleCheckoutSuccess = (orderId: string) => {
        setIsCartOpen(false);
        setOrderSuccess(orderId);
        setTimeout(() => setOrderSuccess(null), 5000);
    };

    // Error state - restaurant not found
    if (error === 'Restaurant not found') {
        return <NotFoundPage />;
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
                    <p className="text-neutral-400">加载中...</p>
                </div>
            </div>
        );
    }

    // General error state
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                        <Store className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-2">加载失败</h2>
                    <p className="text-neutral-400">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-24">
            {/* Header */}
            <header className="sticky top-0 z-30 glass-dark">
                <div className="safe-area-top" />
                <div className="px-4 py-4">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <h1 className="text-xl font-bold text-white">{restaurant?.name}</h1>
                            <p className="text-sm text-neutral-400">桌号: {tableId}</p>
                        </div>
                        {restaurant?.logo_url && (
                            <img
                                src={restaurant.logo_url}
                                alt={restaurant.name}
                                className="w-12 h-12 rounded-xl object-cover"
                            />
                        )}
                    </div>

                    {/* Category Tabs */}
                    <CategoryTabs
                        categories={categories}
                        activeCategory={activeCategory}
                        onCategoryChange={setActiveCategory}
                    />
                </div>
            </header>

            {/* Order Success Toast */}
            {orderSuccess && (
                <div className="fixed top-4 left-4 right-4 z-50 animate-slide-down">
                    <div className="glass bg-green-500/20 border-green-500/50 rounded-xl p-4 text-center">
                        <p className="text-green-400 font-medium">🎉 下单成功！</p>
                        <p className="text-sm text-neutral-400 mt-1">订单号: {orderSuccess.slice(0, 8)}...</p>
                    </div>
                </div>
            )}

            {/* Menu Grid */}
            <main className="px-4 py-4">
                {filteredItems.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-neutral-500">该分类暂无商品</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        {filteredItems.map((item) => (
                            <MenuCard
                                key={item.id}
                                item={item}
                                onAddClick={setSelectedItem}
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* Floating Cart Button */}
            {totalItems > 0 && (
                <button
                    onClick={() => setIsCartOpen(true)}
                    className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full 
                     bg-primary-500 text-white shadow-lg shadow-primary-500/30
                     flex items-center justify-center
                     hover:bg-primary-400 active:scale-95 transition-all
                     animate-bounce-in"
                >
                    <ShoppingBag className="w-6 h-6" />
                    <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full 
                           bg-white text-primary-500 text-xs font-bold
                           flex items-center justify-center">
                        {totalItems}
                    </span>
                </button>
            )}

            {/* Item Modal */}
            {selectedItem && (
                <ItemModal
                    item={selectedItem}
                    onClose={() => setSelectedItem(null)}
                    onAddToCart={handleAddToCart}
                />
            )}

            {/* Cart Sheet */}
            <CartSheet
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                onCheckoutSuccess={handleCheckoutSuccess}
            />
        </div>
    );
}

export function MenuPage() {
    const { restaurantSlug, tableId } = useParams<{ restaurantSlug: string; tableId: string }>();
    const { restaurant, isLoading, error } = useRestaurant(restaurantSlug || '');

    // Show 404 if restaurant not found
    if (!isLoading && error === 'Restaurant not found') {
        return <NotFoundPage />;
    }

    // Need restaurant ID for CartProvider
    if (!restaurant) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
            </div>
        );
    }

    return (
        <CartProvider restaurantId={restaurant.id} tableNumber={tableId || '1'}>
            <MenuPageContent />
        </CartProvider>
    );
}

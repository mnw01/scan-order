import { useState, useRef, useCallback } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Volume2, VolumeX, Loader2, RefreshCw, ChefHat, Clock, UtensilsCrossed } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useOrders, useRestaurantWithAuth } from '../../hooks/useOrders';
import { OrderCard } from '../../components/kitchen/OrderCard';
import { NotFoundPage } from '../NotFoundPage';
import type { OrderStatus } from '../../lib/types';

export function KitchenDashboard() {
    const { restaurantSlug } = useParams<{ restaurantSlug: string }>();
    const { user, isLoading: authLoading } = useAuth();
    const { restaurant, isLoading: restaurantLoading, error: restaurantError } = useRestaurantWithAuth(restaurantSlug || '');

    const [soundEnabled, setSoundEnabled] = useState(false);
    const [view, setView] = useState<'list' | 'kanban'>('list');
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Handle new order notification
    const handleNewOrder = useCallback(() => {
        if (soundEnabled && audioRef.current) {
            audioRef.current.play().catch(console.error);
        }
    }, [soundEnabled]);

    const { orders, isLoading: ordersLoading, updateOrderStatus, refetch } = useOrders(
        restaurant?.id || null,
        handleNewOrder
    );

    // Enable sound with user interaction
    const enableSound = () => {
        if (!audioRef.current) {
            audioRef.current = new Audio('/notification.mp3');
            audioRef.current.volume = 0.5;
        }
        // Play silent audio to unlock audio context
        audioRef.current.play().then(() => {
            audioRef.current?.pause();
            audioRef.current!.currentTime = 0;
            setSoundEnabled(true);
        }).catch(() => {
            // Create a simple beep as fallback
            const ctx = new AudioContext();
            const oscillator = ctx.createOscillator();
            oscillator.connect(ctx.destination);
            oscillator.start();
            oscillator.stop(ctx.currentTime + 0.1);
            setSoundEnabled(true);
        });
    };

    const handleStatusChange = async (orderId: string, status: OrderStatus) => {
        try {
            await updateOrderStatus(orderId, status);
        } catch (err) {
            console.error('Failed to update status:', err);
        }
    };

    // Group orders by status for kanban view
    const ordersByStatus = {
        pending: orders.filter(o => o.status === 'pending'),
        preparing: orders.filter(o => o.status === 'preparing'),
        served: orders.filter(o => o.status === 'served'),
    };

    // Loading state
    if (authLoading || restaurantLoading) {
        return (
            <div className="min-h-screen bg-animated-gradient flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
            </div>
        );
    }

    // Not authenticated
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Restaurant not found
    if (restaurantError === 'Restaurant not found') {
        return <NotFoundPage />;
    }

    return (
        <div className="min-h-screen bg-neutral-950">
            {/* Header */}
            <header className="sticky top-0 z-30 navbar-glass">
                <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/20">
                            <ChefHat className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">{restaurant?.name}</h1>
                            <p className="text-sm text-neutral-400">厨房管理</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Sound Toggle */}
                        <button
                            onClick={soundEnabled ? () => setSoundEnabled(false) : enableSound}
                            className={`btn-secondary flex items-center gap-2 ${soundEnabled ? 'border-green-500/50 text-green-400 bg-green-500/10' : ''
                                }`}
                        >
                            {soundEnabled ? (
                                <>
                                    <Volume2 className="w-4 h-4" />
                                    <span className="hidden sm:inline">声音已开启</span>
                                </>
                            ) : (
                                <>
                                    <VolumeX className="w-4 h-4" />
                                    <span className="hidden sm:inline">开启声音</span>
                                </>
                            )}
                        </button>

                        {/* Refresh */}
                        <button
                            onClick={() => refetch()}
                            className="btn-ghost p-2"
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>

                        {/* View Toggle */}
                        <div className="hidden sm:flex glass-card rounded-lg p-1">
                            <button
                                onClick={() => setView('list')}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${view === 'list' ? 'bg-gradient-to-r from-red-500/20 to-orange-500/10 text-white' : 'text-neutral-400 hover:text-white'
                                    }`}
                            >
                                列表
                            </button>
                            <button
                                onClick={() => setView('kanban')}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${view === 'kanban' ? 'bg-gradient-to-r from-red-500/20 to-orange-500/10 text-white' : 'text-neutral-400 hover:text-white'
                                    }`}
                            >
                                看板
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="p-6">
                {ordersLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                    </div>
                ) : orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
                        <div className="w-20 h-20 rounded-full bg-neutral-800/50 flex items-center justify-center mb-4">
                            <Clock className="w-10 h-10 opacity-50" />
                        </div>
                        <p className="text-lg">暂无待处理订单</p>
                        <p className="text-sm mt-2 text-neutral-600">新订单将实时显示在这里</p>
                    </div>
                ) : view === 'kanban' ? (
                    /* Kanban View */
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Pending Column */}
                        <div>
                            <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                <Clock className="w-5 h-5 text-amber-500" />
                                <h2 className="font-semibold text-white">待处理</h2>
                                <span className="badge-pending ml-auto">{ordersByStatus.pending.length}</span>
                            </div>
                            <div className="space-y-4">
                                {ordersByStatus.pending.map(order => (
                                    <OrderCard
                                        key={order.id}
                                        order={order}
                                        onStatusChange={handleStatusChange}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Preparing Column */}
                        <div>
                            <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                                <ChefHat className="w-5 h-5 text-blue-500" />
                                <h2 className="font-semibold text-white">制作中</h2>
                                <span className="badge-preparing ml-auto">{ordersByStatus.preparing.length}</span>
                            </div>
                            <div className="space-y-4">
                                {ordersByStatus.preparing.map(order => (
                                    <OrderCard
                                        key={order.id}
                                        order={order}
                                        onStatusChange={handleStatusChange}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Served Column */}
                        <div>
                            <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                                <UtensilsCrossed className="w-5 h-5 text-purple-500" />
                                <h2 className="font-semibold text-white">已上菜</h2>
                                <span className="badge-served ml-auto">{ordersByStatus.served.length}</span>
                            </div>
                            <div className="space-y-4">
                                {ordersByStatus.served.map(order => (
                                    <OrderCard
                                        key={order.id}
                                        order={order}
                                        onStatusChange={handleStatusChange}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    /* List View */
                    <div className="max-w-2xl mx-auto space-y-4">
                        {orders.map(order => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                onStatusChange={handleStatusChange}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

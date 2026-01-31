import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, ShoppingBag, DollarSign, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface OrderWithItems {
    id: string;
    total_amount: number;
    order_items: Array<{
        quantity: number;
        unit_price: number;
        menu_item: { name: string } | null;
    }>;
}

interface SalesStats {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    topItems: { name: string; quantity: number; revenue: number }[];
}

export function SalesReport() {
    const [stats, setStats] = useState<SalesStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [dateRange, setDateRange] = useState<'today' | 'week' | 'month'>('today');

    useEffect(() => {
        async function fetchStats() {
            try {
                setIsLoading(true);
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                // Get user's restaurant
                const { data: restaurant } = await supabase
                    .from('restaurants')
                    .select('id')
                    .eq('owner_id', user.id)
                    .single();

                if (!restaurant) return;

                // Calculate date filter
                const now = new Date();
                let startDate: Date;
                switch (dateRange) {
                    case 'today':
                        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                        break;
                    case 'week':
                        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        break;
                    case 'month':
                        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                        break;
                }

                // Fetch orders with items
                const { data: orders } = await supabase
                    .from('orders')
                    .select(`
            id,
            total_amount,
            order_items (
              quantity,
              unit_price,
              menu_item:menu_items(name)
            )
          `)
                    .eq('restaurant_id', restaurant.id)
                    .gte('created_at', startDate.toISOString())
                    .eq('status', 'completed');

                const typedOrders = (orders || []) as unknown as OrderWithItems[];

                // Calculate stats
                const totalRevenue = typedOrders.reduce((sum, o) => sum + o.total_amount, 0);
                const totalOrders = typedOrders.length;
                const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

                // Calculate top items
                const itemMap = new Map<string, { quantity: number; revenue: number }>();
                typedOrders.forEach(order => {
                    order.order_items?.forEach((item) => {
                        const name = item.menu_item?.name || 'Unknown';
                        const existing = itemMap.get(name) || { quantity: 0, revenue: 0 };
                        itemMap.set(name, {
                            quantity: existing.quantity + item.quantity,
                            revenue: existing.revenue + item.quantity * item.unit_price,
                        });
                    });
                });

                const topItems = Array.from(itemMap.entries())
                    .map(([name, data]) => ({ name, ...data }))
                    .sort((a, b) => b.revenue - a.revenue)
                    .slice(0, 5);

                setStats({ totalRevenue, totalOrders, averageOrderValue, topItems });
            } catch (err) {
                console.error('Failed to fetch stats:', err);
            } finally {
                setIsLoading(false);
            }
        }

        fetchStats();
    }, [dateRange]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">销售报表</h1>
                    <p className="text-neutral-400">查看您的餐厅业绩</p>
                </div>

                {/* Date Range Selector */}
                <div className="flex bg-neutral-800 rounded-lg p-1">
                    {(['today', 'week', 'month'] as const).map((range) => (
                        <button
                            key={range}
                            onClick={() => setDateRange(range)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${dateRange === range
                                ? 'bg-primary-500 text-white'
                                : 'text-neutral-400 hover:text-white'
                                }`}
                        >
                            {range === 'today' ? '今日' : range === 'week' ? '本周' : '本月'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="card p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                            <p className="text-sm text-neutral-400">总收入</p>
                            <p className="text-2xl font-bold text-white">¥{stats?.totalRevenue.toFixed(2)}</p>
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                            <ShoppingBag className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm text-neutral-400">总订单</p>
                            <p className="text-2xl font-bold text-white">{stats?.totalOrders}</p>
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-sm text-neutral-400">平均客单价</p>
                            <p className="text-2xl font-bold text-white">¥{stats?.averageOrderValue.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Selling Items */}
            <div className="card">
                <div className="p-6 border-b border-neutral-800">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-primary-500" />
                        热销商品 Top 5
                    </h2>
                </div>
                <div className="divide-y divide-neutral-800">
                    {!stats?.topItems.length ? (
                        <div className="p-6 text-center text-neutral-500">
                            暂无数据
                        </div>
                    ) : (
                        stats.topItems.map((item, index) => (
                            <div key={item.name} className="flex items-center gap-4 p-4">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${index === 0 ? 'bg-amber-500 text-black' :
                                    index === 1 ? 'bg-neutral-400 text-black' :
                                        index === 2 ? 'bg-amber-700 text-white' :
                                            'bg-neutral-800 text-neutral-400'
                                    }`}>
                                    {index + 1}
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-white">{item.name}</p>
                                    <p className="text-sm text-neutral-400">销售 {item.quantity} 份</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-primary-500">¥{item.revenue.toFixed(2)}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

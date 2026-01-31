import { OrderWithItems, OrderStatus } from '../../lib/types';
import { Clock, ChefHat, UtensilsCrossed, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface OrderCardProps {
    order: OrderWithItems;
    onStatusChange: (orderId: string, status: OrderStatus) => void;
}

const statusConfig: Record<OrderStatus, { label: string; icon: typeof Clock; color: string; next?: OrderStatus; nextLabel?: string }> = {
    pending: {
        label: '待处理',
        icon: Clock,
        color: 'amber',
        next: 'preparing',
        nextLabel: '开始制作'
    },
    preparing: {
        label: '制作中',
        icon: ChefHat,
        color: 'blue',
        next: 'served',
        nextLabel: '已上菜'
    },
    served: {
        label: '已上菜',
        icon: UtensilsCrossed,
        color: 'purple',
        next: 'completed',
        nextLabel: '完成订单'
    },
    completed: {
        label: '已完成',
        icon: CheckCircle,
        color: 'green'
    },
};

export function OrderCard({ order, onStatusChange }: OrderCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const config = statusConfig[order.status];
    const Icon = config.icon;

    // Calculate time since order
    const orderTime = new Date(order.created_at);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - orderTime.getTime()) / 60000);
    const timeDisplay = diffMinutes < 60
        ? `${diffMinutes} 分钟前`
        : `${Math.floor(diffMinutes / 60)} 小时前`;

    return (
        <div className={`glass-card rounded-xl overflow-hidden transition-all duration-300 relative ${order.status === 'pending' ? 'ring-2 ring-amber-500/50 shadow-lg shadow-amber-500/10' : ''
            }`}>
            {/* Status indicator bar */}
            <div className={`order-status-bar ${order.status}`} />

            {/* Header */}
            <div
                className="p-4 pl-6 cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        {/* Table Number */}
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neutral-700 to-neutral-800 flex items-center justify-center border border-white/5">
                            <span className="text-lg font-bold text-white">{order.table_number}</span>
                        </div>

                        <div>
                            <p className="text-sm text-neutral-400">桌号</p>
                            <p className="font-semibold text-white">#{order.id.slice(0, 8)}</p>
                        </div>
                    </div>

                    {/* Status Badge */}
                    <div className={`badge-${order.status} flex items-center gap-1.5`}>
                        <Icon className="w-3.5 h-3.5" />
                        {config.label}
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-neutral-400">
                        <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-neutral-500" />
                            {order.order_items?.length || 0} 件
                        </span>
                        <span className="price-gradient font-semibold">¥{order.total_amount.toFixed(2)}</span>
                        <span>{timeDisplay}</span>
                    </div>

                    <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                        <ChevronDown className="w-5 h-5 text-neutral-500" />
                    </div>
                </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="border-t border-white/5 animate-fade-in">
                    {/* Order Items */}
                    <div className="p-4 pl-6 space-y-3">
                        {order.order_items?.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-neutral-800/50">
                                <div className="flex-1">
                                    <p className="font-medium text-white">
                                        {item.menu_item?.name}
                                        <span className="ml-2 text-primary-400">× {item.quantity}</span>
                                    </p>
                                    {Object.keys(item.selected_options || {}).length > 0 && (
                                        <p className="text-xs text-neutral-500 mt-1">
                                            {Object.entries(item.selected_options || {})
                                                .map(([key, value]) => `${key}: ${value}`)
                                                .join(' | ')}
                                        </p>
                                    )}
                                </div>
                                <span className="text-neutral-400 font-medium">
                                    ¥{(item.unit_price * item.quantity).toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Notes */}
                    {order.notes && (
                        <div className="px-4 pl-6 pb-4">
                            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                                <p className="text-sm text-amber-400">📝 备注: {order.notes}</p>
                            </div>
                        </div>
                    )}

                    {/* Action Button */}
                    {config.next && (
                        <div className="p-4 pl-6 border-t border-white/5">
                            <button
                                onClick={() => onStatusChange(order.id, config.next!)}
                                className={`w-full py-3 rounded-xl font-semibold transition-all duration-200
                  ${order.status === 'pending'
                                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black hover:shadow-lg hover:shadow-amber-500/30'
                                        : order.status === 'preparing'
                                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-blue-500/30'
                                            : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/30'
                                    }`}
                            >
                                {config.nextLabel}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

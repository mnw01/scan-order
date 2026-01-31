import { useState } from 'react';
import { X, Minus, Plus, ShoppingBag, Loader2, Sparkles } from 'lucide-react';
import { useCart } from '../../hooks/useCart';

interface CartSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onCheckoutSuccess: (orderId: string) => void;
}

export function CartSheet({ isOpen, onClose, onCheckoutSuccess }: CartSheetProps) {
    const { items, totalAmount, totalItems, updateQuantity, removeItem, checkout, isLoading } = useCart();
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCheckout = async () => {
        try {
            setIsCheckingOut(true);
            setError(null);
            const orderId = await checkout();
            onCheckoutSuccess(orderId);
        } catch (err) {
            setError(err instanceof Error ? err.message : '下单失败，请重试');
        } finally {
            setIsCheckingOut(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div
                className="sheet-backdrop animate-fade-in"
                onClick={onClose}
            />

            {/* Sheet Content */}
            <div className="sheet-content-premium animate-slide-up">
                {/* Handle */}
                <div className="flex justify-center pt-4 pb-2">
                    <div className="w-12 h-1 rounded-full bg-neutral-700" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                            <ShoppingBag className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">购物车</h2>
                            <span className="text-sm text-neutral-500">{totalItems} 件商品</span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-neutral-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="max-h-[50vh] overflow-y-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                        </div>
                    ) : items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-neutral-500">
                            <div className="w-20 h-20 rounded-full bg-neutral-800/50 flex items-center justify-center mb-4">
                                <ShoppingBag className="w-10 h-10 opacity-50" />
                            </div>
                            <p className="text-lg">购物车是空的</p>
                            <p className="text-sm text-neutral-600 mt-1">快去添加美食吧~</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {items.map((item) => (
                                <div key={item.id} className="flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-colors">
                                    {/* Item Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-white truncate">
                                            {item.menu_item?.name}
                                        </h3>
                                        {Object.keys(item.selected_options || {}).length > 0 && (
                                            <p className="text-xs text-neutral-500 mt-0.5">
                                                {Object.entries(item.selected_options || {})
                                                    .map(([, value]) => value)
                                                    .join(' / ')}
                                            </p>
                                        )}
                                        <p className="price-gradient font-semibold mt-1">
                                            ¥{((item.menu_item?.price || 0) * item.quantity).toFixed(2)}
                                        </p>
                                    </div>

                                    {/* Quantity Controls */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => {
                                                if (item.quantity <= 1) {
                                                    removeItem(item.id);
                                                } else {
                                                    updateQuantity(item.id, item.quantity - 1);
                                                }
                                            }}
                                            className="w-8 h-8 rounded-full bg-neutral-800 text-white
                                 flex items-center justify-center hover:bg-neutral-700 transition-colors"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>

                                        <span className="w-8 text-center font-medium text-white">
                                            {item.quantity}
                                        </span>

                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            className="w-8 h-8 rounded-full bg-neutral-800 text-white
                                 flex items-center justify-center hover:bg-neutral-700 transition-colors"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mx-6 mb-4 p-4 glass-card border-red-500/30 rounded-xl">
                        <p className="text-red-400 text-sm text-center">{error}</p>
                    </div>
                )}

                {/* Footer */}
                {items.length > 0 && (
                    <div className="p-6 border-t border-white/5 safe-area-bottom">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-neutral-400">总计</span>
                            <span className="text-2xl font-bold text-gradient-premium">
                                ¥{totalAmount.toFixed(2)}
                            </span>
                        </div>

                        <button
                            onClick={handleCheckout}
                            disabled={isCheckingOut}
                            className="btn-glow w-full flex items-center justify-center gap-2"
                        >
                            {isCheckingOut ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>下单中...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    <span>确认下单</span>
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

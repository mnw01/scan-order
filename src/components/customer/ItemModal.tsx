import { useState } from 'react';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { MenuItem, MenuItemOption } from '../../lib/types';

interface ItemModalProps {
    item: MenuItem;
    onClose: () => void;
    onAddToCart: (quantity: number, selectedOptions: Record<string, string>) => void;
}

export function ItemModal({ item, onClose, onAddToCart }: ItemModalProps) {
    const [quantity, setQuantity] = useState(1);
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
        // Initialize with first choice for each option
        const defaults: Record<string, string> = {};
        if (item.options) {
            item.options.forEach((option: MenuItemOption) => {
                if (option.choices.length > 0) {
                    defaults[option.name] = option.choices[0];
                }
            });
        }
        return defaults;
    });

    const handleOptionChange = (optionName: string, choice: string) => {
        setSelectedOptions(prev => ({
            ...prev,
            [optionName]: choice,
        }));
    };

    const handleAddToCart = () => {
        onAddToCart(quantity, selectedOptions);
        onClose();
    };

    const totalPrice = item.price * quantity;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-lg glass-card rounded-t-3xl animate-slide-up max-h-[85vh] overflow-hidden">
                {/* Gradient top border */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500" />

                {/* Header Image */}
                <div className="relative h-52 bg-neutral-800 overflow-hidden">
                    {item.image_url ? (
                        <>
                            <img
                                src={item.image_url}
                                alt={item.name}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent" />
                        </>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900">
                            <span className="text-6xl">🍽️</span>
                        </div>
                    )}

                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-10 h-10 rounded-full glass-premium
                       text-white flex items-center justify-center hover:bg-white/20 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="max-h-[calc(85vh-13rem-5rem)] overflow-y-auto">
                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {/* Title and Price */}
                        <div>
                            <h2 className="text-2xl font-bold text-white">{item.name}</h2>
                            {item.description && (
                                <p className="text-neutral-400 mt-2 text-sm">{item.description}</p>
                            )}
                            <p className="text-gradient-premium text-2xl font-bold mt-3">
                                ¥{item.price.toFixed(2)}
                            </p>
                        </div>

                        {/* Options */}
                        {item.options && item.options.length > 0 && (
                            <div className="space-y-5">
                                {item.options.map((option: MenuItemOption) => (
                                    <div key={option.name}>
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="font-medium text-white">{option.name}</span>
                                            {option.required && (
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">必选</span>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {option.choices.map((choice) => (
                                                <button
                                                    key={choice}
                                                    onClick={() => handleOptionChange(option.name, choice)}
                                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                          ${selectedOptions[option.name] === choice
                                                            ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/20'
                                                            : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700 border border-white/5'
                                                        }`}
                                                >
                                                    {choice}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Quantity Selector */}
                        <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-800/50 border border-white/5">
                            <span className="font-medium text-white">数量</span>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                    disabled={quantity <= 1}
                                    className="w-10 h-10 rounded-full bg-neutral-700 text-white
                           flex items-center justify-center
                           hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Minus className="w-5 h-5" />
                                </button>

                                <span className="text-xl font-semibold text-white w-8 text-center">
                                    {quantity}
                                </span>

                                <button
                                    onClick={() => setQuantity(q => q + 1)}
                                    className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 text-white
                           flex items-center justify-center hover:shadow-lg hover:shadow-red-500/30 transition-all"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Add to Cart Button */}
                <div className="p-6 pt-4 border-t border-white/5 safe-area-bottom">
                    <button
                        onClick={handleAddToCart}
                        className="btn-glow w-full flex items-center justify-center gap-3"
                    >
                        <ShoppingBag className="w-5 h-5" />
                        <span>加入购物车</span>
                        <span className="px-2 py-0.5 rounded-full bg-white/20 text-sm">
                            ¥{totalPrice.toFixed(2)}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}

import { MenuItem } from '../../lib/types';
import { Plus, ImageOff } from 'lucide-react';

interface MenuCardProps {
    item: MenuItem;
    onAddClick: (item: MenuItem) => void;
}

export function MenuCard({ item, onAddClick }: MenuCardProps) {
    const hasOptions = item.options && item.options.length > 0;

    return (
        <div className="card-interactive group cursor-pointer" onClick={() => onAddClick(item)}>
            {/* Image */}
            <div className="relative aspect-[4/3] bg-neutral-800 overflow-hidden">
                {item.image_url ? (
                    <>
                        <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900">
                        <ImageOff className="w-12 h-12 text-neutral-700" />
                    </div>
                )}

                {/* Stock badge */}
                {item.stock === 0 && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
                        <span className="text-white font-semibold text-lg px-4 py-2 rounded-full bg-red-500/20 border border-red-500/30">售罄</span>
                    </div>
                )}

                {/* Options indicator */}
                {hasOptions && item.stock !== 0 && (
                    <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm text-xs text-white/80">
                        可选规格
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                <h3 className="font-semibold text-white mb-1 line-clamp-1 group-hover:text-gradient transition-colors duration-300">
                    {item.name}
                </h3>

                {item.description && (
                    <p className="text-xs text-neutral-500 mb-2 line-clamp-1">
                        {item.description}
                    </p>
                )}

                <div className="flex items-center justify-between mt-2">
                    <span className="price-gradient font-bold text-lg">
                        ¥{item.price.toFixed(2)}
                    </span>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onAddClick(item);
                        }}
                        disabled={item.stock === 0}
                        className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-orange-500 text-white 
                       flex items-center justify-center
                       hover:shadow-lg hover:shadow-red-500/30 hover:scale-110
                       active:scale-95 transition-all duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}

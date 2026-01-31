import { useState, useEffect } from 'react';
import {
    Plus,
    Pencil,
    Trash2,
    Loader2,
    Search,
    X,
    Save
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { MenuItem, Restaurant } from '../../lib/types';

interface MenuItemFormData {
    name: string;
    category: string;
    price: number;
    image_url: string | null;
    is_available: boolean;
    options: MenuItem['options'];
}

export function MenuManager() {
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

    // Fetch restaurant and menu items
    useEffect(() => {
        async function fetchData() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                // Get user's restaurant
                const { data: restaurantData } = await supabase
                    .from('restaurants')
                    .select('*')
                    .eq('owner_id', user.id)
                    .single();

                if (!restaurantData) return;
                setRestaurant(restaurantData);

                // Fetch menu items
                const { data: menuData } = await supabase
                    .from('menu_items')
                    .select('*')
                    .eq('restaurant_id', restaurantData.id)
                    .order('category')
                    .order('name');

                setMenuItems((menuData as MenuItem[]) || []);
            } catch (err) {
                console.error('Failed to fetch data:', err);
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, []);

    // Get unique categories
    const categories = [...new Set(menuItems.map(item => item.category))];

    // Filter items
    const filteredItems = menuItems.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const handleEdit = (item: MenuItem) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const handleDelete = async (itemId: string) => {
        if (!confirm('确定要删除这个菜品吗？')) return;

        try {
            await supabase.from('menu_items').delete().eq('id', itemId);
            setMenuItems(items => items.filter(i => i.id !== itemId));
        } catch (err) {
            console.error('Failed to delete item:', err);
        }
    };

    const handleSave = async (formData: MenuItemFormData) => {
        if (!restaurant) return;

        try {
            if (editingItem) {
                // Update existing item
                const { data, error } = await supabase
                    .from('menu_items')
                    .update({
                        name: formData.name,
                        category: formData.category,
                        price: formData.price,
                        image_url: formData.image_url,
                        is_available: formData.is_available,
                        options: formData.options,
                    })
                    .eq('id', editingItem.id)
                    .select()
                    .single();

                if (error) throw error;
                setMenuItems(items => items.map(i => i.id === editingItem.id ? (data as MenuItem) : i));
            } else {
                // Create new item
                const { data, error } = await supabase
                    .from('menu_items')
                    .insert({
                        restaurant_id: restaurant.id,
                        name: formData.name,
                        category: formData.category,
                        price: formData.price,
                        stock: -1,
                        image_url: formData.image_url,
                        is_available: formData.is_available,
                        options: formData.options,
                    })
                    .select()
                    .single();

                if (error) throw error;
                setMenuItems(items => [...items, data as MenuItem]);
            }
            setIsModalOpen(false);
        } catch (err) {
            console.error('Failed to save item:', err);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
        );
    }

    if (!restaurant) {
        return (
            <div className="text-center py-20">
                <p className="text-neutral-400">请先创建您的餐厅</p>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">菜单管理</h1>
                    <p className="text-neutral-400">{restaurant.name}</p>
                </div>
                <button onClick={handleAdd} className="btn-primary inline-flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    添加菜品
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                    <input
                        type="text"
                        placeholder="搜索菜品..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input w-full pl-12"
                    />
                </div>

                {/* Category Filter */}
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="input min-w-[120px]"
                >
                    <option value="all">全部分类</option>
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            {/* Menu Items Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-neutral-800">
                                <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-400">菜品</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-400">分类</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-400">价格</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-400">状态</th>
                                <th className="text-right px-6 py-4 text-sm font-semibold text-neutral-400">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-neutral-500">
                                        暂无菜品
                                    </td>
                                </tr>
                            ) : (
                                filteredItems.map((item) => (
                                    <tr key={item.id} className="border-b border-neutral-800 last:border-0 hover:bg-white/5">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-lg bg-neutral-800 overflow-hidden">
                                                    {item.image_url ? (
                                                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-xl">🍽️</div>
                                                    )}
                                                </div>
                                                <span className="font-medium text-white">{item.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-neutral-400">{item.category}</td>
                                        <td className="px-6 py-4 text-primary-500 font-semibold">¥{item.price.toFixed(2)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`badge ${item.is_available ? 'bg-green-500/20 text-green-400' : 'bg-neutral-700 text-neutral-400'}`}>
                                                {item.is_available ? '在售' : '下架'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                                >
                                                    <Pencil className="w-4 h-4 text-neutral-400" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-400" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit/Create Modal */}
            {isModalOpen && (
                <MenuItemModal
                    item={editingItem}
                    categories={categories}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
}

// Menu Item Modal Component
interface MenuItemModalProps {
    item: MenuItem | null;
    categories: string[];
    onClose: () => void;
    onSave: (data: MenuItemFormData) => void;
}

function MenuItemModal({ item, categories, onClose, onSave }: MenuItemModalProps) {
    const [formData, setFormData] = useState({
        name: item?.name || '',
        category: item?.category || '',
        price: item?.price?.toString() || '',
        image_url: item?.image_url || '',
        is_available: item?.is_available ?? true,
        options: item?.options || [],
    });
    const [newCategory, setNewCategory] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        await onSave({
            name: formData.name,
            category: formData.category || newCategory,
            price: parseFloat(formData.price) || 0,
            image_url: formData.image_url || null,
            is_available: formData.is_available,
            options: formData.options,
        });

        setIsSaving(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-lg bg-neutral-900 rounded-2xl border border-neutral-800 shadow-2xl animate-bounce-in">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-neutral-800">
                    <h2 className="text-xl font-bold text-white">
                        {item ? '编辑菜品' : '添加菜品'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
                        <X className="w-5 h-5 text-neutral-400" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">菜品名称</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData(d => ({ ...d, name: e.target.value }))}
                            required
                            className="input w-full"
                            placeholder="例如：珍珠奶茶"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">分类</label>
                        <div className="flex gap-2">
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData(d => ({ ...d, category: e.target.value }))}
                                className="input flex-1"
                            >
                                <option value="">选择分类...</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                            <input
                                type="text"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                className="input flex-1"
                                placeholder="或输入新分类"
                            />
                        </div>
                    </div>

                    {/* Price */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">价格 (¥)</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.price}
                            onChange={(e) => setFormData(d => ({ ...d, price: e.target.value }))}
                            required
                            className="input w-full"
                            placeholder="0.00"
                        />
                    </div>

                    {/* Image URL */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">图片URL（可选）</label>
                        <input
                            type="url"
                            value={formData.image_url}
                            onChange={(e) => setFormData(d => ({ ...d, image_url: e.target.value }))}
                            className="input w-full"
                            placeholder="https://..."
                        />
                    </div>

                    {/* Availability */}
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="is_available"
                            checked={formData.is_available}
                            onChange={(e) => setFormData(d => ({ ...d, is_available: e.target.checked }))}
                            className="w-5 h-5 rounded bg-neutral-800 border-neutral-700 text-primary-500 focus:ring-primary-500"
                        />
                        <label htmlFor="is_available" className="text-neutral-300">可销售</label>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={onClose} className="btn-secondary flex-1">
                            取消
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="btn-primary flex-1 flex items-center justify-center gap-2"
                        >
                            {isSaving ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    保存
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

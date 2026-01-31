interface CategoryTabsProps {
    categories: string[];
    activeCategory: string;
    onCategoryChange: (category: string) => void;
}

export function CategoryTabs({ categories, activeCategory, onCategoryChange }: CategoryTabsProps) {
    const allCategories = ['all', ...categories];

    const getCategoryLabel = (category: string) => {
        if (category === 'all') return '全部';
        return category;
    };

    return (
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-2 -mx-1 px-1">
            {allCategories.map((category) => (
                <button
                    key={category}
                    onClick={() => onCategoryChange(category)}
                    className={`tab-pill ${activeCategory === category ? 'active' : ''}`}
                >
                    {getCategoryLabel(category)}
                </button>
            ))}
        </div>
    );
}

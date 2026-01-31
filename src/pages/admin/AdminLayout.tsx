import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
    ChefHat,
    UtensilsCrossed,
    BarChart3,
    Settings,
    LogOut,
    Menu,
    X
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

const navItems = [
    { path: '/admin', icon: UtensilsCrossed, label: '菜单管理', end: true },
    { path: '/admin/reports', icon: BarChart3, label: '销售报表' },
    { path: '/admin/settings', icon: Settings, label: '设置' },
];

export function AdminLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { signOut, user } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-neutral-950 flex">
            {/* Mobile Sidebar Backdrop */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 sidebar-premium
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                {/* Logo */}
                <div className="p-6 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 
                            flex items-center justify-center shadow-lg shadow-red-500/20">
                            <ChefHat className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-white">餐厅管理</h1>
                            <p className="text-xs text-neutral-500 truncate max-w-[140px]">{user?.email}</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.end}
                            onClick={() => setIsSidebarOpen(false)}
                            className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl
                font-medium transition-all duration-200
                ${isActive
                                    ? 'bg-gradient-to-r from-red-500/20 to-orange-500/10 text-white border-l-2 border-red-500 ml-0.5'
                                    : 'text-neutral-400 hover:bg-white/5 hover:text-white'}
              `}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                {/* Sign Out */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5">
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl w-full
                       text-neutral-400 hover:bg-red-500/10 hover:text-red-400
                       font-medium transition-all duration-200"
                    >
                        <LogOut className="w-5 h-5" />
                        退出登录
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen">
                {/* Mobile Header */}
                <header className="sticky top-0 z-30 navbar-glass lg:hidden">
                    <div className="px-4 py-3 flex items-center justify-between">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                        >
                            <Menu className="w-6 h-6 text-white" />
                        </button>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                                <ChefHat className="w-4 h-4 text-white" />
                            </div>
                            <h1 className="font-semibold text-white">餐厅管理</h1>
                        </div>
                        <div className="w-10" />
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

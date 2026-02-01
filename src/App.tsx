import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MenuPage } from './pages/customer/MenuPage';
import { KitchenDashboard } from './pages/kitchen/KitchenDashboard';
import { AdminLayout } from './pages/admin/AdminLayout';
import { MenuManager } from './pages/admin/MenuManager';
import { SalesReport } from './pages/admin/SalesReport';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { HomePage } from './pages/HomePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home Page */}
        <Route path="/" element={<HomePage />} />

        {/* Customer Side */}
        <Route path="/r/:restaurantSlug/table/:tableId" element={<MenuPage />} />
        <Route path="/restaurant/:restaurantSlug/table/:tableId" element={<MenuPage />} />

        {/* Kitchen Side (Protected) */}
        <Route
          path="/kitchen/:restaurantSlug"
          element={
            <ProtectedRoute>
              <KitchenDashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin Side (Protected) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<MenuManager />} />
          <Route path="reports" element={<SalesReport />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

// Placeholder settings page
function AdminSettings() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-4">设置</h1>
      <div className="card p-6">
        <p className="text-neutral-400">餐厅设置功能即将推出...</p>
      </div>
    </div>
  );
}

export default App;

import React, { useEffect } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Users, FolderTree, LogOut, Home } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { redirect: '/admin' } });
    } else if (user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user || user.role !== 'admin') return null;

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
      isActive ? 'bg-[#ff6b6b] text-white' : 'text-gray-300 hover:bg-white/10'
    }`;

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-64 bg-[#1a2332] text-white flex flex-col">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#ff6b6b] rounded-lg flex items-center justify-center font-bold">A</div>
            <span className="font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>AnkoChina Admin</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <NavLink to="/admin" end className={linkClass}><LayoutDashboard className="w-4 h-4" /> Dashboard</NavLink>
          <NavLink to="/admin/products" className={linkClass}><Package className="w-4 h-4" /> Products</NavLink>
          <NavLink to="/admin/categories" className={linkClass}><FolderTree className="w-4 h-4" /> Categories</NavLink>
          <NavLink to="/admin/orders" className={linkClass}><ShoppingBag className="w-4 h-4" /> Orders</NavLink>
          <NavLink to="/admin/users" className={linkClass}><Users className="w-4 h-4" /> Users</NavLink>
        </nav>
        <div className="p-4 border-t border-white/10 space-y-1">
          <button onClick={() => navigate('/')} className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/10">
            <Home className="w-4 h-4" /> View Store
          </button>
          <button onClick={() => { logout(); navigate('/'); }} className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/10">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-x-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;

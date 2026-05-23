import React, { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Users, FolderTree, LogOut, Home, Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user || user.role !== 'admin') {
    navigate(user ? '/' : '/login', { state: { redirect: '/admin' } });
    return null;
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
      isActive ? 'bg-[#ff6b6b] text-white' : 'text-gray-300 hover:bg-white/10'
    }`;

  const handleNavClick = () => setSidebarOpen(false);

  const sidebarContent = (
    <>
      <div className="p-6 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#ff6b6b] rounded-lg flex items-center justify-center font-bold">A</div>
          <span className="font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>AnkoChina Admin</span>
        </div>
        <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        <NavLink to="/admin" end className={linkClass} onClick={handleNavClick}><LayoutDashboard className="w-4 h-4" /> Dashboard</NavLink>
        <NavLink to="/admin/products" className={linkClass} onClick={handleNavClick}><Package className="w-4 h-4" /> Bidhaa</NavLink>
        <NavLink to="/admin/categories" className={linkClass} onClick={handleNavClick}><FolderTree className="w-4 h-4" /> Makundi</NavLink>
        <NavLink to="/admin/orders" className={linkClass} onClick={handleNavClick}><ShoppingBag className="w-4 h-4" /> Oda</NavLink>
        <NavLink to="/admin/users" className={linkClass} onClick={handleNavClick}><Users className="w-4 h-4" /> Watumiaji</NavLink>
      </nav>
      <div className="p-4 border-t border-white/10 space-y-1">
        <button onClick={() => { handleNavClick(); navigate('/'); }} className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/10">
          <Home className="w-4 h-4" /> Tazama Duka
        </button>
        <button onClick={() => { logout(); navigate('/'); }} className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/10">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 bg-[#1a2332] text-white flex-col fixed inset-y-0 left-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#1a2332] text-white flex flex-col transform transition-transform duration-200 lg:hidden ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {sidebarContent}
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:ml-64 min-w-0">
        {/* Mobile top bar */}
        <div className="lg:hidden sticky top-0 z-20 bg-white border-b px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="p-1 hover:bg-gray-100 rounded">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#ff6b6b] rounded flex items-center justify-center font-bold text-white text-xs">A</div>
            <span className="font-bold text-sm" style={{ fontFamily: 'Playfair Display, serif' }}>AnkoChina Admin</span>
          </div>
        </div>
        <main className="overflow-x-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

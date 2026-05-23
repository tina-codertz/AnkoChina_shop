import React, { useEffect, useState } from 'react';
import { DollarSign, ShoppingBag, Users, Package, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatPrice, formatDate } from '@/lib/format';

const StatCard: React.FC<{ icon: any; label: string; value: string; trend?: string; color: string }> = ({ icon: Icon, label, value, trend, color }) => (
  <div className="bg-white p-6 rounded-xl">
    <div className="flex items-start justify-between">
      <div>
        <div className="text-sm text-gray-500">{label}</div>
        <div className="text-2xl font-bold mt-2">{value}</div>
        {trend && <div className="flex items-center gap-1 text-xs text-green-600 mt-1"><TrendingUp className="w-3 h-3" /> {trend}</div>}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
  </div>
);

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({ revenue: 0, orders: 0, users: 0, products: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const [{ data: orders }, { count: userCount }, { count: productCount }] = await Promise.all([
        supabase.from('ecom_orders').select('*').order('created_at', { ascending: false }),
        supabase.from('app_users').select('id', { count: 'exact', head: true }),
        supabase.from('ecom_products').select('id', { count: 'exact', head: true }),
      ]);
      const paidOrders = (orders || []).filter(o => ['paid', 'shipped', 'delivered'].includes(o.status));
      setStats({
        revenue: paidOrders.reduce((s, o) => s + o.total, 0),
        orders: orders?.length || 0,
        users: userCount || 0,
        products: productCount || 0,
      });
      setRecentOrders((orders || []).slice(0, 5));

      const { data: lowStockData } = await supabase
        .from('ecom_products')
        .select('*')
        .lt('inventory_qty', 50)
        .order('inventory_qty')
        .limit(5);
      setLowStock(lowStockData || []);
    };
    load();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-[#1a2332] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Dashboard</h1>
      <p className="text-gray-500 mb-8">Welcome back. Here's what's happening with your store.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={DollarSign} label="Total Revenue" value={formatPrice(stats.revenue)} color="bg-green-500" />
        <StatCard icon={ShoppingBag} label="Total Orders" value={String(stats.orders)} color="bg-blue-500" />
        <StatCard icon={Users} label="Customers" value={String(stats.users)} color="bg-purple-500" />
        <StatCard icon={Package} label="Products" value={String(stats.products)} color="bg-[#ff6b6b]" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6">
          <h2 className="font-semibold mb-4">Recent Orders</h2>
          {recentOrders.length === 0 ? (
            <div className="text-sm text-gray-500 text-center py-8">No orders yet</div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map(o => (
                <div key={o.id} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div>
                    <div className="font-medium text-sm">#{o.id.substring(0, 8).toUpperCase()}</div>
                    <div className="text-xs text-gray-500">{formatDate(o.created_at)} • {o.status}</div>
                  </div>
                  <div className="font-semibold">{formatPrice(o.total)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-6">
          <h2 className="font-semibold mb-4">Low Stock Alert</h2>
          {lowStock.length === 0 ? (
            <div className="text-sm text-gray-500 text-center py-8">All products well stocked</div>
          ) : (
            <div className="space-y-3">
              {lowStock.map(p => (
                <div key={p.id} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <img src={p.images?.[0]} alt={p.name} className="w-10 h-10 rounded object-cover" />
                    <div>
                      <div className="font-medium text-sm line-clamp-1">{p.name}</div>
                      <div className="text-xs text-gray-500">{p.sku}</div>
                    </div>
                  </div>
                  <div className={`text-sm font-semibold ${p.inventory_qty < 20 ? 'text-red-600' : 'text-yellow-600'}`}>
                    {p.inventory_qty} left
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

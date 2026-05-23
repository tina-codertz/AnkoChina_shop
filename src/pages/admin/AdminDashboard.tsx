import React, { useEffect, useState } from 'react';
import { DollarSign, ShoppingBag, Users, Package, TrendingUp } from 'lucide-react';
import { api } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/format';

const StatCard: React.FC<{ icon: any; label: string; value: string; trend?: string; color: string }> = ({ icon: Icon, label, value, trend, color }) => (
  <div className="bg-white p-4 sm:p-6 rounded-xl">
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <div className="text-xs sm:text-sm text-gray-500">{label}</div>
        <div className="text-lg sm:text-2xl font-bold mt-1 sm:mt-2 truncate">{value}</div>
        {trend && <div className="flex items-center gap-1 text-xs text-green-600 mt-1"><TrendingUp className="w-3 h-3" /> {trend}</div>}
      </div>
      <div className={`p-2 sm:p-3 rounded-lg shrink-0 ${color}`}>
        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
      </div>
    </div>
  </div>
);

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({ revenue: 0, orders: 0, users: 0, products: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);

  useEffect(() => {
    api.get<{
      stats: { revenue: number; totalOrders: number; totalUsers: number; totalProducts: number };
      recentOrders: any[];
      lowStock: any[];
    }>('/admin/dashboard').then(({ data }) => {
      if (data) {
        setStats({
          revenue: data.stats.revenue,
          orders: data.stats.totalOrders,
          users: data.stats.totalUsers,
          products: data.stats.totalProducts,
        });
        setRecentOrders(data.recentOrders || []);
        setLowStock(data.lowStock || []);
      }
    });
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-[#1a2332] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Dashboard</h1>
      <p className="text-gray-500 mb-6 sm:mb-8">Karibu tena. Hivi ndivyo duka linavyoendelea.</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <StatCard icon={DollarSign} label="Mapato Yote" value={formatPrice(stats.revenue)} color="bg-green-500" />
        <StatCard icon={ShoppingBag} label="Oda Zote" value={String(stats.orders)} color="bg-blue-500" />
        <StatCard icon={Users} label="Wateja" value={String(stats.users)} color="bg-purple-500" />
        <StatCard icon={Package} label="Bidhaa" value={String(stats.products)} color="bg-[#ff6b6b]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl p-6">
          <h2 className="font-semibold mb-4">Oda za Karibuni</h2>
          {recentOrders.length === 0 ? (
            <div className="text-sm text-gray-500 text-center py-8">Bado hakuna oda</div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map(o => (
                <div key={o.id} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div>
                    <div className="font-medium text-sm">#{o.id.substring(0, 8).toUpperCase()}</div>
                    <div className="text-xs text-gray-500">{formatDate(o.created_at)} &bull; {o.status}</div>
                  </div>
                  <div className="font-semibold">{formatPrice(o.total)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-6">
          <h2 className="font-semibold mb-4">Bidhaa Zinazoisha</h2>
          {lowStock.length === 0 ? (
            <div className="text-sm text-gray-500 text-center py-8">Bidhaa zote zina stoki ya kutosha</div>
          ) : (
            <div className="space-y-3">
              {lowStock.map(p => (
                <div key={p.id} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="font-medium text-sm line-clamp-1">{p.name}</div>
                    </div>
                  </div>
                  <div className={`text-sm font-semibold ${p.inventory_qty < 5 ? 'text-red-600' : 'text-yellow-600'}`}>
                    {p.inventory_qty} zimebaki
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

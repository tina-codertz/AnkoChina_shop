import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package } from 'lucide-react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/format';
import { Button } from '@/components/ui/button';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
};

const Orders: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { redirect: '/orders' } });
      return;
    }
    api.get<{ orders: any[] }>('/orders')
      .then(({ data }) => {
        setOrders(data?.orders || []);
        setLoading(false);
      });
  }, [user, navigate]);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>My Orders</h1>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 mb-4">No orders yet</p>
            <Link to="/products"><Button className="bg-[#1a2332]">Start Shopping</Button></Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-xl p-6 flex flex-col md:flex-row md:items-center gap-4 justify-between">
                <div>
                  <div className="text-xs text-gray-500">Order #{order.id.substring(0, 8).toUpperCase()}</div>
                  <div className="text-sm text-gray-500 mt-1">{formatDate(order.created_at)}</div>
                  <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-gray-100'}`}>
                    {order.status?.toUpperCase()}
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">{formatPrice(order.total)}</div>
                  <Link to={`/order-confirmation/${order.id}`}>
                    <Button variant="outline" size="sm" className="mt-2">View Details</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Orders;

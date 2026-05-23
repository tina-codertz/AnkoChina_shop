import React, { useEffect, useState } from 'react';
import { Eye, X } from 'lucide-react';
import { api } from '@/lib/api';
import { formatPrice, formatDateTime } from '@/lib/format';
import { toast } from '@/components/ui/use-toast';

const STATUSES = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [viewing, setViewing] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState('all');

  const load = async () => {
    const { data } = await api.get<{ orders: any[] }>('/admin/orders');
    setOrders(data?.orders || []);
  };

  useEffect(() => { load(); }, []);

  const handleStatusChange = async (orderId: string, status: string) => {
    const { error } = await api.patch(`/admin/orders/${orderId}`, { status });
    if (error) { toast({ title: 'Error', variant: 'destructive' }); return; }
    toast({ title: 'Status updated' });
    load();
  };

  const viewOrder = async (order: any) => {
    const { data } = await api.get<any>(`/admin/orders/${order.id}`);
    if (data) {
      setViewing(data);
      setItems(data.items || []);
    }
  };

  const filtered = filterStatus === 'all' ? orders : orders.filter(o => o.status === filterStatus);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Orders</h1>
      <p className="text-gray-500 text-sm mb-6">{orders.length} total orders</p>

      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={() => setFilterStatus('all')} className={`px-3 py-1 rounded-full text-sm ${filterStatus === 'all' ? 'bg-[#1a2332] text-white' : 'bg-white'}`}>All</button>
        {STATUSES.map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-1 rounded-full text-sm capitalize ${filterStatus === s ? 'bg-[#1a2332] text-white' : 'bg-white'}`}>{s}</button>
        ))}
      </div>

      <div className="bg-white rounded-xl overflow-x-auto">
        <table className="w-full text-sm min-w-[500px]">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Order #</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(o => (
              <tr key={o.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs">#{o.id.substring(0, 8).toUpperCase()}</td>
                <td className="px-4 py-3 text-gray-600">{formatDateTime(o.created_at)}</td>
                <td className="px-4 py-3 font-semibold">{formatPrice(o.total)}</td>
                <td className="px-4 py-3">
                  <select value={o.status} onChange={e => handleStatusChange(o.id, e.target.value)} className="px-2 py-1 border rounded text-xs">
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => viewOrder(o)} className="p-1 hover:bg-gray-200 rounded"><Eye className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="p-12 text-center text-gray-500">No orders</div>}
      </div>

      {viewing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold">Order #{viewing.id.substring(0, 8).toUpperCase()}</h2>
              <button onClick={() => setViewing(null)} className="p-1"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Shipping Address</h3>
                <div className="text-sm text-gray-600">
                  <div>{viewing.shipping_address?.name}</div>
                  <div>{viewing.shipping_address?.email}</div>
                  <div>{viewing.shipping_address?.address}</div>
                  <div>{viewing.shipping_address?.city}, {viewing.shipping_address?.state} {viewing.shipping_address?.zip}</div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Items</h3>
                {items.map(i => (
                  <div key={i.id} className="flex justify-between py-2 border-b last:border-0 text-sm">
                    <div>{i.product_name} x {i.quantity}</div>
                    <div>{formatPrice(i.total)}</div>
                  </div>
                ))}
              </div>
              <div className="text-sm space-y-1">
                <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(viewing.subtotal)}</span></div>
                <div className="flex justify-between"><span>Shipping</span><span>{formatPrice(viewing.shipping)}</span></div>
                <div className="flex justify-between"><span>Tax</span><span>{formatPrice(viewing.tax)}</span></div>
                <div className="flex justify-between font-bold border-t pt-2 mt-2"><span>Total</span><span>{formatPrice(viewing.total)}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;

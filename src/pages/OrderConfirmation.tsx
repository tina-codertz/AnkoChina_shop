import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Package, Mail } from 'lucide-react';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/format';
import { Button } from '@/components/ui/button';

const OrderConfirmation: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;
    api.get<any>(`/orders/${id}`).then(({ data }) => {
      if (data) {
        setOrder(data);
        setItems(data.items || []);
      }
    });
  }, [id]);

  if (!order) {
    return <Layout><div className="text-center py-16 text-gray-500">Loading order...</div></Layout>;
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl p-8 text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Thank You!</h1>
          <p className="text-gray-600 mb-2">Your order has been placed successfully.</p>
          <div className="text-sm text-gray-500">Order ID: <span className="font-mono font-medium">{order.id}</span></div>
          <div className="text-sm text-gray-500 mt-1">Placed on {formatDate(order.created_at)}</div>
          <div className="flex items-center justify-center gap-1 text-sm text-gray-500 mt-3">
            <Mail className="w-4 h-4" /> A confirmation email has been sent
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 mb-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><Package className="w-5 h-5" /> Order Items</h2>
          <div className="space-y-3">
            {items.map(item => (
              <div key={item.id} className="flex justify-between py-2 border-b last:border-0">
                <div>
                  <div className="font-medium">{item.product_name}</div>
                  {item.variant_title && <div className="text-sm text-gray-500">{item.variant_title}</div>}
                  <div className="text-sm text-gray-500">Qty: {item.quantity}</div>
                </div>
                <div className="font-medium">{formatPrice(item.total)}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t space-y-1 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>{formatPrice(order.shipping)}</span></div>
            <div className="flex justify-between"><span>Tax</span><span>{formatPrice(order.tax)}</span></div>
            <div className="flex justify-between font-bold text-base pt-2 border-t mt-2">
              <span>Total</span><span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 mb-6">
          <h2 className="font-semibold mb-3">Shipping Address</h2>
          <div className="text-sm text-gray-600">
            <div>{order.shipping_address?.name}</div>
            <div>{order.shipping_address?.address}</div>
            <div>{order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.zip}</div>
            <div>{order.shipping_address?.country}</div>
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <Link to="/products"><Button variant="outline">Continue Shopping</Button></Link>
          <Link to="/orders"><Button className="bg-[#1a2332]">View Orders</Button></Link>
        </div>
      </div>
    </Layout>
  );
};

export default OrderConfirmation;

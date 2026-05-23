import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import Layout from '@/components/Layout';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/format';
import { Button } from '@/components/ui/button';

const Cart: React.FC = () => {
  const { cart, updateQuantity, removeFromCart, subtotal } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-gray-500 mb-6">Looks like you haven't added anything yet.</p>
          <Link to="/products"><Button size="lg" className="bg-[#1a2332]">Browse Products</Button></Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-[#1a2332] mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.map(item => (
              <div key={item.product_id + (item.variant_id || '')} className="bg-white rounded-xl p-4 flex gap-4">
                <Link to={`/products/${item.handle || ''}`} className="flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-lg" />
                </Link>
                <div className="flex-1">
                  <Link to={`/products/${item.handle || ''}`}>
                    <h3 className="font-medium text-[#1a2332] hover:text-[#ff6b6b]">{item.name}</h3>
                  </Link>
                  {item.variant_title && <div className="text-sm text-gray-500">{item.variant_title}</div>}
                  <div className="text-sm text-gray-500 mt-1">{formatPrice(item.price)} each</div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="inline-flex items-center border rounded-lg overflow-hidden">
                      <button onClick={() => updateQuantity(item.product_id, item.quantity - 1, item.variant_id)} className="px-2 py-1 hover:bg-gray-100"><Minus className="w-3 h-3" /></button>
                      <span className="px-3 text-sm font-medium">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product_id, item.quantity + 1, item.variant_id)} className="px-2 py-1 hover:bg-gray-100"><Plus className="w-3 h-3" /></button>
                    </div>
                    <button onClick={() => removeFromCart(item.product_id, item.variant_id)} className="text-gray-400 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="text-right font-semibold">{formatPrice(item.price * item.quantity)}</div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 sticky top-24">
              <h2 className="font-bold text-lg mb-4">Order Summary</h2>
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                <div className="flex justify-between"><span>Shipping</span><span className="text-green-600">Free</span></div>
                <div className="flex justify-between text-gray-500"><span>Tax</span><span>Calculated at checkout</span></div>
              </div>
              <div className="border-t pt-4 mb-4 flex justify-between font-bold text-lg">
                <span>Total</span><span>{formatPrice(subtotal)}</span>
              </div>
              <Button onClick={() => navigate('/checkout')} className="w-full bg-[#ff6b6b] hover:bg-[#ff5252]" size="lg">
                Checkout <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Link to="/products" className="block text-center text-sm text-gray-500 hover:text-[#1a2332] mt-4">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Cart;

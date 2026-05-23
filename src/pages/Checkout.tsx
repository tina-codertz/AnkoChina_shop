import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, MessageCircle } from 'lucide-react';
import Layout from '@/components/Layout';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

interface AddrFields {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
}

const Checkout: React.FC = () => {
  const { cart, subtotal, clearCart } = useCart();
  const { user, login, register } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<'auth' | 'shipping'>(user ? 'shipping' : 'auth');
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'guest'>('register');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);

  const [addr, setAddr] = useState<AddrFields>({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
  });

  useEffect(() => {
    if (user) {
      setAddr(a => ({ ...a, name: user.name || a.name, email: user.email || a.email }));
      if (step === 'auth') setStep('shipping');
    }
  }, [user]);

  useEffect(() => {
    if (cart.length === 0 && step !== 'auth') navigate('/cart');
  }, [cart, step, navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    let res;
    if (authMode === 'login') res = await login(authEmail, authPassword);
    else res = await register(authEmail, authPassword, authName);
    setAuthLoading(false);
    if (res.success) {
      toast({ title: authMode === 'login' ? 'Karibu tena!' : 'Akaunti imetengenezwa!' });
      setStep('shipping');
    } else {
      toast({ title: 'Hitilafu', description: res.error, variant: 'destructive' });
    }
  };

  const continueAsGuest = () => setStep('shipping');

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderLoading(true);

    const { data: order, error } = await api.post<{ id: string }>('/orders', {
      items: cart.map(item => ({
        product_id: item.product_id,
        variant_id: item.variant_id || null,
        product_name: item.name,
        variant_title: item.variant_title || null,
        sku: item.sku || null,
        quantity: item.quantity,
        unit_price: item.price,
      })),
      shipping_address: addr,
      customer_email: addr.email,
      customer_name: addr.name,
      customer_phone: addr.phone,
    });

    setOrderLoading(false);

    if (order) {
      const whatsappMsg = encodeURIComponent(
        `Habari, nimetuma oda yangu kwenye duka.\n\n` +
        `*Oda #${order.id.substring(0, 8).toUpperCase()}*\n` +
        `Jina: ${addr.name}\n` +
        `Simu: ${addr.phone}\n` +
        `Anwani: ${addr.address}, ${addr.city}\n\n` +
        cart.map((item, i) => `${i + 1}. ${item.name} x${item.quantity} — ${formatPrice(item.price * item.quantity)}`).join('\n') +
        `\n\n*Jumla: ${formatPrice(subtotal)}*\n\nNaomba msaada wa malipo.`
      );

      clearCart();
      window.open(`https://wa.me/255672679480?text=${whatsappMsg}`, '_blank');
      navigate(`/order-confirmation/${order.id}`);
    } else {
      toast({ title: 'Hitilafu', description: error || 'Imeshindikana kutuma oda.', variant: 'destructive' });
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Maliza Oda</h1>

        <div className="flex items-center gap-2 mb-8 text-sm">
          <div className={`px-3 py-1 rounded-full ${step === 'auth' ? 'bg-[#1a2332] text-white' : 'bg-gray-200'}`}>1. Akaunti</div>
          <div className="w-8 h-px bg-gray-300" />
          <div className={`px-3 py-1 rounded-full ${step === 'shipping' ? 'bg-[#1a2332] text-white' : 'bg-gray-200'}`}>2. Anwani & Agiza</div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {step === 'auth' && (
              <div className="bg-white rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4">Login au tengeneza akaunti</h2>
                <div className="flex gap-2 mb-4">
                  <Button variant={authMode === 'register' ? 'default' : 'outline'} onClick={() => setAuthMode('register')} size="sm">Tengeneza Akaunti</Button>
                  <Button variant={authMode === 'login' ? 'default' : 'outline'} onClick={() => setAuthMode('login')} size="sm">Login</Button>
                  <Button variant="outline" onClick={continueAsGuest} size="sm">Endelea bila Akaunti</Button>
                </div>
                <form onSubmit={handleAuth} className="space-y-3">
                  {authMode === 'register' && (
                    <input type="text" required value={authName} onChange={e => setAuthName(e.target.value)} placeholder="Jina kamili"
                      className="w-full px-3 py-2 border rounded-md" />
                  )}
                  <input type="email" required value={authEmail} onChange={e => setAuthEmail(e.target.value)} placeholder="Email"
                    className="w-full px-3 py-2 border rounded-md" />
                  <input type="password" required value={authPassword} onChange={e => setAuthPassword(e.target.value)} placeholder="Password" minLength={6}
                    className="w-full px-3 py-2 border rounded-md" />
                  <Button type="submit" disabled={authLoading} className="w-full bg-[#1a2332]">
                    {authLoading ? 'Subiri...' : (authMode === 'register' ? 'Sign Up na Endelea' : 'Login na Endelea')}
                  </Button>
                </form>
              </div>
            )}

            {step === 'shipping' && (
              <form onSubmit={handlePlaceOrder} className="bg-white rounded-xl p-6 space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2 mb-2"><MapPin className="w-5 h-5" /> Anwani ya Usafirishaji</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input required placeholder="Jina kamili" value={addr.name} onChange={e => setAddr({...addr, name: e.target.value})}
                    className="sm:col-span-2 px-3 py-2 border rounded-md" />
                  <input required type="email" placeholder="Email" value={addr.email} onChange={e => setAddr({...addr, email: e.target.value})}
                    className="px-3 py-2 border rounded-md" />
                  <input required placeholder="Namba ya simu" value={addr.phone} onChange={e => setAddr({...addr, phone: e.target.value})}
                    className="px-3 py-2 border rounded-md" />
                  <input required placeholder="Anwani" value={addr.address} onChange={e => setAddr({...addr, address: e.target.value})}
                    className="sm:col-span-2 px-3 py-2 border rounded-md" />
                  <input required placeholder="Jiji/Mji" value={addr.city} onChange={e => setAddr({...addr, city: e.target.value})}
                    className="px-3 py-2 border rounded-md" />
                  <input placeholder="Mkoa" value={addr.state} onChange={e => setAddr({...addr, state: e.target.value})}
                    className="px-3 py-2 border rounded-md" />
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
                  <p className="font-medium mb-1">Jinsi ya kumaliza oda:</p>
                  <p>Baada ya kutuma oda, utapelekwa kwenye WhatsApp ili kukamilisha malipo na admin. Oda yako itarekodiwa moja kwa moja.</p>
                </div>

                <Button type="submit" disabled={orderLoading} className="w-full bg-green-600 hover:bg-green-700" size="lg">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  {orderLoading ? 'Inatuma...' : 'Tuma Oda na Wasiliana WhatsApp'}
                </Button>
              </form>
            )}
          </div>

          <div>
            <div className="bg-white rounded-xl p-6 sticky top-24">
              <h3 className="font-semibold mb-4">Muhtasari wa Oda</h3>
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {cart.map(i => (
                  <div key={i.product_id + (i.variant_id || '')} className="flex gap-3 text-sm">
                    <img src={i.image} alt={i.name} className="w-12 h-12 rounded object-cover" />
                    <div className="flex-1">
                      <div className="font-medium line-clamp-1">{i.name}</div>
                      <div className="text-gray-500">Idadi {i.quantity}</div>
                    </div>
                    <div className="font-medium">{formatPrice(i.price * i.quantity)}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-1 text-sm border-t pt-3">
                <div className="flex justify-between"><span>Jumla ndogo</span><span>{formatPrice(subtotal)}</span></div>
                <div className="flex justify-between"><span>Usafirishaji</span><span className="text-gray-500">Itajulikana</span></div>
              </div>
              <div className="border-t mt-3 pt-3 flex justify-between font-bold text-lg">
                <span>Jumla</span><span>{formatPrice(subtotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;

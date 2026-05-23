import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Lock, CreditCard, MapPin } from 'lucide-react';
import Layout from '@/components/Layout';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const STRIPE_ACCOUNT_ID = 'acct_1TZpgkHCv76fvWSG';
const stripePromise = STRIPE_ACCOUNT_ID
  ? loadStripe('pk_live_51OJhJBHdGQpsHqInIzu7c6PzGPSH0yImD4xfpofvxvFZs0VFhPRXZCyEgYkkhOtBOXFWvssYASs851mflwQvjnrl00T6DbUwWZ', { stripeAccount: STRIPE_ACCOUNT_ID })
  : null;

interface AddrFields {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

const PaymentForm: React.FC<{ onSuccess: (pi: any) => void }> = ({ onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError('');
    const { error: submitError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });
    if (submitError) {
      setError(submitError.message || 'Payment failed');
      setLoading(false);
    } else if (paymentIntent?.status === 'succeeded') {
      onSuccess(paymentIntent);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && <div className="text-sm text-red-600">{error}</div>}
      <Button type="submit" disabled={!stripe || loading} className="w-full bg-[#ff6b6b] hover:bg-[#ff5252]" size="lg">
        <Lock className="w-4 h-4 mr-2" /> {loading ? 'Processing...' : 'Pay Now'}
      </Button>
    </form>
  );
};

const Checkout: React.FC = () => {
  const { cart, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<'auth' | 'shipping' | 'payment'>(user ? 'shipping' : 'auth');
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'guest'>('register');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [addr, setAddr] = useState<AddrFields>({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
  });
  const [shipping, setShipping] = useState(0);
  const [tax, setTax] = useState(0);
  const [clientSecret, setClientSecret] = useState('');
  const [paymentError, setPaymentError] = useState('');

  const { login, register } = useAuth();

  useEffect(() => {
    if (user) {
      setAddr(a => ({ ...a, name: user.name || a.name, email: user.email || a.email }));
      if (step === 'auth') setStep('shipping');
    }
  }, [user]);

  useEffect(() => {
    if (cart.length === 0 && step !== 'auth') navigate('/cart');
  }, [cart, step, navigate]);

  const total = subtotal + shipping + tax;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    let res;
    if (authMode === 'login') res = await login(authEmail, authPassword);
    else res = await register(authEmail, authPassword, authName);
    setAuthLoading(false);
    if (res.success) {
      toast({ title: authMode === 'login' ? 'Welcome back!' : 'Account created!' });
      setStep('shipping');
    } else {
      toast({ title: 'Error', description: res.error, variant: 'destructive' });
    }
  };

  const continueAsGuest = () => {
    setStep('shipping');
  };

  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: taxData } = await api.post<{ taxCents: number }>('/checkout/calculate-tax', {
      state: addr.state,
      subtotal,
    });
    const taxCents = taxData?.taxCents || 0;
    setTax(taxCents);
    const totalCents = subtotal + 0 + taxCents;

    const { data, error } = await api.post<{ clientSecret: string }>('/checkout/create-payment-intent', {
      amount: totalCents,
      currency: 'usd',
    });
    if (error || !data?.clientSecret) {
      setPaymentError('Unable to initialize payment. Please try again.');
      return;
    }
    setClientSecret(data.clientSecret);
    setStep('payment');
  };

  const handlePaymentSuccess = async (paymentIntent: any) => {
    try {
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
        stripe_payment_intent_id: paymentIntent.id,
      });

      if (order) {
        clearCart();
        navigate(`/order-confirmation/${order.id}`);
      }
    } catch (err) {
      toast({ title: 'Order error', description: 'Payment succeeded but order creation failed.', variant: 'destructive' });
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Checkout</h1>

        {/* Steps indicator */}
        <div className="flex items-center gap-2 mb-8 text-sm">
          <div className={`px-3 py-1 rounded-full ${step === 'auth' ? 'bg-[#1a2332] text-white' : 'bg-gray-200'}`}>1. Account</div>
          <div className="w-8 h-px bg-gray-300" />
          <div className={`px-3 py-1 rounded-full ${step === 'shipping' ? 'bg-[#1a2332] text-white' : 'bg-gray-200'}`}>2. Shipping</div>
          <div className="w-8 h-px bg-gray-300" />
          <div className={`px-3 py-1 rounded-full ${step === 'payment' ? 'bg-[#1a2332] text-white' : 'bg-gray-200'}`}>3. Payment</div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {step === 'auth' && (
              <div className="bg-white rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4">Sign in or create an account</h2>
                <div className="flex gap-2 mb-4">
                  <Button variant={authMode === 'register' ? 'default' : 'outline'} onClick={() => setAuthMode('register')} size="sm">Create Account</Button>
                  <Button variant={authMode === 'login' ? 'default' : 'outline'} onClick={() => setAuthMode('login')} size="sm">Sign In</Button>
                  <Button variant="outline" onClick={continueAsGuest} size="sm">Continue as Guest</Button>
                </div>
                <form onSubmit={handleAuth} className="space-y-3">
                  {authMode === 'register' && (
                    <input type="text" required value={authName} onChange={e => setAuthName(e.target.value)} placeholder="Full Name"
                      className="w-full px-3 py-2 border rounded-md" />
                  )}
                  <input type="email" required value={authEmail} onChange={e => setAuthEmail(e.target.value)} placeholder="Email"
                    className="w-full px-3 py-2 border rounded-md" />
                  <input type="password" required value={authPassword} onChange={e => setAuthPassword(e.target.value)} placeholder="Password" minLength={6}
                    className="w-full px-3 py-2 border rounded-md" />
                  <Button type="submit" disabled={authLoading} className="w-full bg-[#1a2332]">
                    {authLoading ? 'Please wait...' : (authMode === 'register' ? 'Create Account & Continue' : 'Sign In & Continue')}
                  </Button>
                </form>
              </div>
            )}

            {step === 'shipping' && (
              <form onSubmit={handleProceedToPayment} className="bg-white rounded-xl p-6 space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2 mb-2"><MapPin className="w-5 h-5" /> Shipping Address</h2>
                <div className="grid grid-cols-2 gap-4">
                  <input required placeholder="Full Name" value={addr.name} onChange={e => setAddr({...addr, name: e.target.value})}
                    className="col-span-2 px-3 py-2 border rounded-md" />
                  <input required type="email" placeholder="Email" value={addr.email} onChange={e => setAddr({...addr, email: e.target.value})}
                    className="px-3 py-2 border rounded-md" />
                  <input placeholder="Phone" value={addr.phone} onChange={e => setAddr({...addr, phone: e.target.value})}
                    className="px-3 py-2 border rounded-md" />
                  <input required placeholder="Address" value={addr.address} onChange={e => setAddr({...addr, address: e.target.value})}
                    className="col-span-2 px-3 py-2 border rounded-md" />
                  <input required placeholder="City" value={addr.city} onChange={e => setAddr({...addr, city: e.target.value})}
                    className="px-3 py-2 border rounded-md" />
                  <input required placeholder="State (e.g., CA)" value={addr.state} onChange={e => setAddr({...addr, state: e.target.value})} maxLength={2}
                    className="px-3 py-2 border rounded-md uppercase" />
                  <input required placeholder="ZIP" value={addr.zip} onChange={e => setAddr({...addr, zip: e.target.value})}
                    className="px-3 py-2 border rounded-md" />
                  <input required placeholder="Country" value={addr.country} onChange={e => setAddr({...addr, country: e.target.value})}
                    className="px-3 py-2 border rounded-md" />
                </div>
                <Button type="submit" className="w-full bg-[#1a2332]" size="lg">Continue to Payment</Button>
              </form>
            )}

            {step === 'payment' && (
              <div className="bg-white rounded-xl p-6">
                <h2 className="text-xl font-semibold flex items-center gap-2 mb-4"><CreditCard className="w-5 h-5" /> Payment</h2>
                {!stripePromise ? (
                  <div className="bg-yellow-50 p-4 rounded-lg text-yellow-800 text-sm">Payment processing is being set up.</div>
                ) : paymentError ? (
                  <div className="bg-red-50 p-4 rounded-lg text-red-800 text-sm">{paymentError}</div>
                ) : clientSecret ? (
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <PaymentForm onSuccess={handlePaymentSuccess} />
                  </Elements>
                ) : (
                  <div className="text-gray-500">Loading payment form...</div>
                )}
                <button onClick={() => setStep('shipping')} className="mt-4 text-sm text-gray-500 hover:text-[#1a2332]">
                  &larr; Back to shipping
                </button>
              </div>
            )}
          </div>

          <div>
            <div className="bg-white rounded-xl p-6 sticky top-24">
              <h3 className="font-semibold mb-4">Order Summary</h3>
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {cart.map(i => (
                  <div key={i.product_id + (i.variant_id || '')} className="flex gap-3 text-sm">
                    <img src={i.image} alt={i.name} className="w-12 h-12 rounded object-cover" />
                    <div className="flex-1">
                      <div className="font-medium line-clamp-1">{i.name}</div>
                      <div className="text-gray-500">Qty {i.quantity}</div>
                    </div>
                    <div className="font-medium">{formatPrice(i.price * i.quantity)}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-1 text-sm border-t pt-3">
                <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                <div className="flex justify-between"><span>Shipping</span><span className="text-green-600">Free</span></div>
                <div className="flex justify-between"><span>Tax</span><span>{formatPrice(tax)}</span></div>
              </div>
              <div className="border-t mt-3 pt-3 flex justify-between font-bold text-lg">
                <span>Total</span><span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = (location.state as any)?.redirect || '/';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: 'Password fupi sana', description: 'Angalau herufi 6 zinahitajika.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const res = await register(email, password, name);
    setLoading(false);
    if (res.success) {
      toast({ title: 'Akaunti imetengenezwa!' });
      navigate(redirect);
    } else {
      toast({ title: 'Sign up imeshindikana', description: res.error, variant: 'destructive' });
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-center mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Tengeneza Akaunti</h1>
          <p className="text-center text-gray-500 mb-6">Jiunge nasi leo</p>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Jina Kamili</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-[#ff6b6b]" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-[#ff6b6b]" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} minLength={6}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-[#ff6b6b]" />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-[#ff6b6b] hover:bg-[#ff5252]">
              {loading ? 'Inatengeneza...' : 'Tengeneza Akaunti'}
            </Button>
          </form>

          <div className="text-center text-sm text-gray-600 mt-6">
            Una akaunti tayari? <Link to="/login" state={{ redirect }} className="text-[#ff6b6b] font-medium">Login</Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Register;

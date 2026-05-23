import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = (location.state as any)?.redirect || '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res.success) {
      toast({ title: 'Welcome back!' });
      navigate(redirect);
    } else {
      toast({ title: 'Login failed', description: res.error, variant: 'destructive' });
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-center mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Welcome Back</h1>
          <p className="text-center text-gray-500 mb-6">Sign in to your account</p>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-[#ff6b6b]" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-[#ff6b6b]" />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-[#ff6b6b] hover:bg-[#ff5252]">
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="text-center text-sm text-gray-600 mt-6">
            Don't have an account? <Link to="/register" state={{ redirect }} className="text-[#ff6b6b] font-medium">Sign up</Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;

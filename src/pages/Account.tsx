import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const Account: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { redirect: '/account' } });
      return;
    }
    setName(user.name || '');
    setPhone(user.phone || '');
  }, [user, navigate]);

  if (!user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await updateProfile({ name, phone });
    setLoading(false);
    toast({ title: res.success ? 'Imehifadhiwa' : 'Hitilafu', description: res.error, variant: res.success ? 'default' : 'destructive' });
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>Akaunti Yangu</h1>
        <div className="bg-white rounded-2xl p-6">
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" value={user.email} disabled className="w-full px-3 py-2 border rounded-md bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Jina Kamili</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Simu</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
            </div>
            <Button type="submit" disabled={loading} className="bg-[#1a2332]">
              {loading ? 'Inahifadhi...' : 'Hifadhi'}
            </Button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Account;

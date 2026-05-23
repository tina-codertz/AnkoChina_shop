import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';

const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    const { error } = await api.post('/newsletter/subscribe', { email });
    if (error) {
      toast({ title: 'Error', description: 'Please try again.', variant: 'destructive' });
    } else {
      toast({ title: 'Subscribed!', description: 'Thanks for joining our newsletter.' });
      setEmail('');
    }
    setSubmitting(false);
  };

  return (
    <footer className="bg-[#1a2332] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#ff6b6b] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="text-xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>AnkoChina</span>
            </div>
            <p className="text-sm text-gray-400 mb-4 max-w-sm">
              Discover premium products curated for the modern lifestyle. Quality you can trust.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Your email"
                required
                className="flex-1 px-3 py-2 text-sm rounded-md bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-[#ff6b6b]"
              />
              <Button type="submit" disabled={submitting} className="bg-[#ff6b6b] hover:bg-[#ff5252]">
                <Mail className="w-4 h-4" />
              </Button>
            </form>
            <div className="flex gap-3 mt-6">
              <a href="#" className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#ff6b6b] transition"><Facebook className="w-4 h-4" /></a>
              <a href="#" className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#ff6b6b] transition"><Twitter className="w-4 h-4" /></a>
              <a href="#" className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#ff6b6b] transition"><Instagram className="w-4 h-4" /></a>
              <a href="#" className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#ff6b6b] transition"><Youtube className="w-4 h-4" /></a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/products" className="hover:text-white">All Products</Link></li>
              <li><Link to="/collections/electronics" className="hover:text-white">Electronics</Link></li>
              <li><Link to="/collections/fashion" className="hover:text-white">Fashion</Link></li>
              <li><Link to="/collections/sale" className="hover:text-white">Sale</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-700 text-center text-xs text-gray-500">
          &copy; {new Date().getFullYear()} AnkoChina. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;

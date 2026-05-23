import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Mail, Phone, MessageCircle } from 'lucide-react';
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
      toast({ title: 'Hitilafu', description: 'Jaribu tena.', variant: 'destructive' });
    } else {
      toast({ title: 'Umejisajili!', description: 'Asante kwa kujiunga nasi.' });
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
              Bidhaa bora kutoka China kwa bei nafuu. Ubora unaoweza kuuamini.
            </p>

            <div className="space-y-2 mb-6 text-sm text-gray-400">
              <a href="https://wa.me/255672679480" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white">
                <MessageCircle className="w-4 h-4 text-green-500" /> WhatsApp: 0672 679 480
              </a>
              <a href="tel:+255671584909" className="flex items-center gap-2 hover:text-white">
                <Phone className="w-4 h-4 text-[#ff6b6b]" /> Simu: 0671 584 909
              </a>
            </div>

            <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Barua pepe yako"
                required
                className="flex-1 px-3 py-2 text-sm rounded-md bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-[#ff6b6b]"
              />
              <Button type="submit" disabled={submitting} className="bg-[#ff6b6b] hover:bg-[#ff5252]">
                <Mail className="w-4 h-4" />
              </Button>
            </form>
            <div className="flex gap-3 mt-6">
              <a href="https://www.tiktok.com/@anko_china" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#ff6b6b] transition text-sm font-bold">
                T
              </a>
              <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#ff6b6b] transition"><Instagram className="w-4 h-4" /></a>
              <a href="https://wa.me/255672679480" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-green-600 transition"><MessageCircle className="w-4 h-4" /></a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Duka</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/products" className="hover:text-white">Bidhaa Zote</Link></li>
              <li><Link to="/collections/electronics" className="hover:text-white">Elektroniki</Link></li>
              <li><Link to="/collections/fashion" className="hover:text-white">Mitindo</Link></li>
              <li><Link to="/collections/sale" className="hover:text-white">Punguzo</Link></li>
            </ul>

            <h4 className="font-semibold mb-3 mt-6">Wasiliana Nasi</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="https://wa.me/255672679480" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                  WhatsApp: 0672 679 480
                </a>
              </li>
              <li>
                <a href="tel:+255671584909" className="hover:text-white">
                  Simu: 0671 584 909
                </a>
              </li>
              <li>
                <a href="https://www.tiktok.com/@anko_china" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                  TikTok: @anko_china
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-700 text-center text-xs text-gray-500">
          &copy; {new Date().getFullYear()} AnkoChina. Haki zote zimehifadhiwa.
        </div>
      </div>
    </footer>
  );
};

export default Footer;

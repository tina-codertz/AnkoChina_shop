import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, TrendingUp, Award } from 'lucide-react';
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';

const HERO_IMAGE = 'https://d64gsuwffb70l.cloudfront.net/6a102606978e06760a2ea96b_1779443451765_1ae303c2.png';

const Home: React.FC = () => {
  const [featured, setFeatured] = useState<any[]>([]);
  const [newest, setNewest] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);

  useEffect(() => {
    api.get<{ products: any[] }>('/products?sort=newest&limit=8')
      .then(({ data }) => setNewest(data?.products || []));
    api.get<{ products: any[] }>('/products?limit=8')
      .then(({ data }) => setFeatured(data?.products || []));
    api.get<{ collections: any[] }>('/collections')
      .then(({ data }) => setCollections(data?.collections || []));
  }, []);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative h-[600px] overflow-hidden">
        <img src={HERO_IMAGE} alt="Hero" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a2332]/90 via-[#1a2332]/60 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="max-w-xl text-white">
            <div className="inline-flex items-center gap-2 bg-[#ff6b6b]/20 backdrop-blur px-3 py-1 rounded-full text-xs font-medium mb-6">
              <Sparkles className="w-3 h-3" /> Bidhaa Mpya 2026
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
              Bidhaa Bora<br /><span className="text-[#ff6b6b]">Bei Nafuu</span>
            </h1>
            <p className="text-lg text-gray-200 mb-8 max-w-md">
              Pata bidhaa bora kutoka China kwa bei nzuri. Ubora, mtindo, na ubunifu katika kila bidhaa.
            </p>
            <div className="flex gap-4">
              <Link to="/products">
                <Button size="lg" className="bg-[#ff6b6b] hover:bg-[#ff5252] text-white px-8">
                  Nunua Sasa <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <a href="https://wa.me/255672679480" target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur text-white border-white/30 hover:bg-green-600 hover:border-green-600">
                  WhatsApp
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1a2332]" style={{ fontFamily: 'Playfair Display, serif' }}>Aina za Bidhaa</h2>
          <p className="text-gray-600 mt-2">Pata unachokitafuta</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {collections.map(c => (
            <Link key={c.id} to={`/collections/${c.handle}`} className="group">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-[#1a2332] to-[#2a3548] flex items-center justify-center text-white p-4 hover:scale-105 transition-transform shadow-md">
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {c.title.charAt(0)}
                  </div>
                  <div className="text-xs md:text-sm font-medium">{c.title}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 text-[#ff6b6b] mb-2">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-semibold uppercase tracking-wider">Maarufu</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1a2332]" style={{ fontFamily: 'Playfair Display, serif' }}>Bidhaa Maarufu</h2>
            </div>
            <Link to="/products" className="hidden md:flex items-center gap-1 text-sm font-medium text-[#1a2332] hover:text-[#ff6b6b]">
              Tazama Zote <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featured.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* WhatsApp Banner */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#1a2332] to-[#2a3548] rounded-3xl p-12 text-center text-white">
          <Award className="w-12 h-12 text-[#ff6b6b] mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>Ubora wa Hali ya Juu</h2>
          <p className="text-gray-300 max-w-xl mx-auto mb-3">
            Kila bidhaa imechaguliwa kwa makini na kupimwa ili kutimiza viwango vyetu vya ubora.
          </p>
          <p className="text-gray-300 max-w-xl mx-auto mb-6">
            Wasiliana nasi kupitia WhatsApp kwa maagizo na maswali yoyote.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="https://wa.me/255672679480" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-green-600 hover:bg-green-700">WhatsApp: 0672 679 480</Button>
            </a>
            <Link to="/products">
              <Button size="lg" className="bg-[#ff6b6b] hover:bg-[#ff5252]">Tazama Bidhaa</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="pb-16 bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 text-[#ff6b6b] mb-2">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-semibold uppercase tracking-wider">Mpya</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1a2332]" style={{ fontFamily: 'Playfair Display, serif' }}>Zilizofika Hivi Karibuni</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {newest.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Home;

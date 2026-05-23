import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';

const Products: React.FC = () => {
  const { handle } = useParams<{ handle?: string }>();
  const location = useLocation();
  const queryParam = new URLSearchParams(location.search).get('q') || '';

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(queryParam);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sort, setSort] = useState('featured');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200000]);
  const [collectionTitle, setCollectionTitle] = useState<string>('');

  useEffect(() => {
    setSearch(queryParam);
  }, [queryParam]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      if (handle) {
        const { data } = await api.get<{ collection: any; products: any[] }>(`/collections/${handle}`);
        if (data) {
          setCollectionTitle(data.collection?.title || '');
          setProducts(data.products || []);
        }
      } else {
        setCollectionTitle('');
        const { data } = await api.get<{ products: any[] }>('/products?limit=200');
        setProducts(data?.products || []);
      }
      setLoading(false);
    };
    load();
  }, [handle]);

  const productTypes = useMemo(() => {
    const types = [...new Set(products.map(p => p.product_type).filter(Boolean))];
    return types;
  }, [products]);

  const filtered = useMemo(() => {
    let result = [...products];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.product_type?.toLowerCase().includes(q)
      );
    }
    if (selectedType !== 'all') {
      result = result.filter(p => p.product_type === selectedType);
    }
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
    switch (sort) {
      case 'price-asc': result.sort((a, b) => a.price - b.price); break;
      case 'price-desc': result.sort((a, b) => b.price - a.price); break;
      case 'name': result.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'newest': result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); break;
    }
    return result;
  }, [products, search, selectedType, sort, priceRange]);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#1a2332]" style={{ fontFamily: 'Playfair Display, serif' }}>
            {collectionTitle || (queryParam ? `Tafuta: "${queryParam}"` : 'Bidhaa Zote')}
          </h1>
          <p className="text-gray-600 mt-1">Bidhaa {filtered.length}</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <SlidersHorizontal className="w-4 h-4" />
                <h3 className="font-semibold">Chuja</h3>
              </div>

              <div className="mb-6">
                <label className="text-sm font-medium block mb-2">Tafuta</label>
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Tafuta..."
                  className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:border-[#ff6b6b]"
                />
              </div>

              {!handle && productTypes.length > 0 && (
                <div className="mb-6">
                  <label className="text-sm font-medium block mb-2">Aina</label>
                  <div className="space-y-1">
                    <button
                      onClick={() => setSelectedType('all')}
                      className={`w-full text-left text-sm px-2 py-1 rounded ${selectedType === 'all' ? 'bg-[#1a2332] text-white' : 'hover:bg-gray-100'}`}
                    >
                      Zote
                    </button>
                    {productTypes.map(t => (
                      <button
                        key={t}
                        onClick={() => setSelectedType(t)}
                        className={`w-full text-left text-sm px-2 py-1 rounded ${selectedType === t ? 'bg-[#1a2332] text-white' : 'hover:bg-gray-100'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-6">
                <label className="text-sm font-medium block mb-2">Bei ya Juu: TSh {(priceRange[1] / 100).toLocaleString()}</label>
                <input
                  type="range"
                  min={0}
                  max={200000}
                  step={1000}
                  value={priceRange[1]}
                  onChange={e => setPriceRange([0, Number(e.target.value)])}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">Panga kwa</label>
                <select
                  value={sort}
                  onChange={e => setSort(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-md"
                >
                  <option value="featured">Maarufu</option>
                  <option value="newest">Mpya</option>
                  <option value="price-asc">Bei: Chini kwenda Juu</option>
                  <option value="price-desc">Bei: Juu kwenda Chini</option>
                  <option value="name">Jina A-Z</option>
                </select>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => { setSearch(''); setSelectedType('all'); setSort('featured'); setPriceRange([0, 200000]); }}
                className="w-full mt-4"
              >
                Futa Vyote
              </Button>
            </div>
          </aside>

          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="aspect-square bg-gray-200 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl">
                <p className="text-gray-500">Hakuna bidhaa zilizopatikana.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filtered.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Products;

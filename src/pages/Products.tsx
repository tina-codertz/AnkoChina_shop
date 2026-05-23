import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/format';

const Products: React.FC = () => {
  const { handle } = useParams<{ handle?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParam = new URLSearchParams(location.search).get('q') || '';

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(queryParam);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sort, setSort] = useState('featured');
  const [maxPrice, setMaxPrice] = useState<number>(0);
  const [priceLimit, setPriceLimit] = useState<number>(0);
  const [collectionTitle, setCollectionTitle] = useState<string>('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    setSearch(queryParam);
  }, [queryParam]);

  useEffect(() => {
    setSelectedType('all');
    setSort('featured');
    setPriceLimit(0);

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

  useEffect(() => {
    if (products.length > 0) {
      const highest = Math.max(...products.map(p => p.price));
      setMaxPrice(highest);
      setPriceLimit(prev => prev === 0 ? highest : prev);
    }
  }, [products]);

  const productTypes = useMemo(() => {
    return [...new Set(products.map(p => p.product_type).filter(Boolean))].sort();
  }, [products]);

  const filtered = useMemo(() => {
    let result = [...products];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.product_type?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q)
      );
    }
    if (selectedType !== 'all') {
      result = result.filter(p => p.product_type === selectedType);
    }
    if (priceLimit > 0 && priceLimit < maxPrice) {
      result = result.filter(p => p.price <= priceLimit);
    }
    switch (sort) {
      case 'price-asc': result.sort((a, b) => a.price - b.price); break;
      case 'price-desc': result.sort((a, b) => b.price - a.price); break;
      case 'name': result.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'newest': result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); break;
    }
    return result;
  }, [products, search, selectedType, sort, priceLimit, maxPrice]);

  const hasActiveFilters = search !== '' || selectedType !== 'all' || sort !== 'featured' || (priceLimit > 0 && priceLimit < maxPrice);

  const clearFilters = () => {
    setSearch('');
    setSelectedType('all');
    setSort('featured');
    setPriceLimit(maxPrice);
    if (queryParam) navigate('/products');
  };

  const activeFilterCount = [
    search !== '',
    selectedType !== 'all',
    sort !== 'featured',
    priceLimit > 0 && priceLimit < maxPrice,
  ].filter(Boolean).length;

  const filterContent = (
    <>
      <div className="mb-5">
        <label className="text-sm font-medium block mb-2">Tafuta</label>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Jina, aina, maelezo..."
          className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:border-[#ff6b6b] focus:ring-1 focus:ring-[#ff6b6b]"
        />
      </div>

      {productTypes.length > 0 && (
        <div className="mb-5">
          <label className="text-sm font-medium block mb-2">Aina</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedType === 'all'
                  ? 'bg-[#1a2332] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Zote
            </button>
            {productTypes.map(t => (
              <button
                key={t}
                onClick={() => setSelectedType(selectedType === t ? 'all' : t)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selectedType === t
                    ? 'bg-[#1a2332] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {maxPrice > 0 && (
        <div className="mb-5">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium">Bei</label>
            <span className="text-xs text-gray-500">
              {priceLimit >= maxPrice ? 'Zote' : `hadi ${formatPrice(priceLimit)}`}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={maxPrice}
            step={Math.max(100, Math.round(maxPrice / 100))}
            value={priceLimit || maxPrice}
            onChange={e => setPriceLimit(Number(e.target.value))}
            className="w-full accent-[#ff6b6b]"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>TSh 0</span>
            <span>{formatPrice(maxPrice)}</span>
          </div>
        </div>
      )}

      <div className="mb-5">
        <label className="text-sm font-medium block mb-2">Panga kwa</label>
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:border-[#ff6b6b]"
        >
          <option value="featured">Maarufu</option>
          <option value="newest">Mpya</option>
          <option value="price-asc">Bei: Chini kwenda Juu</option>
          <option value="price-desc">Bei: Juu kwenda Chini</option>
          <option value="name">Jina A-Z</option>
        </select>
      </div>

      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={clearFilters}
          className="w-full"
        >
          <X className="w-3 h-3 mr-1" /> Futa Vyote
        </Button>
      )}
    </>
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#1a2332]" style={{ fontFamily: 'Playfair Display, serif' }}>
              {collectionTitle || (queryParam ? `Tafuta: "${queryParam}"` : 'Bidhaa Zote')}
            </h1>
            <p className="text-gray-600 mt-1">
              {loading ? 'Inapakia...' : `Bidhaa ${filtered.length}${filtered.length !== products.length ? ` kati ya ${products.length}` : ''}`}
            </p>
          </div>

          {/* Mobile filter toggle */}
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="lg:hidden self-start flex items-center gap-2 px-4 py-2 bg-white rounded-lg border text-sm font-medium hover:bg-gray-50"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Chuja
            {activeFilterCount > 0 && (
              <span className="bg-[#ff6b6b] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
            <ChevronDown className={`w-4 h-4 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Mobile filters */}
        {filtersOpen && (
          <div className="lg:hidden bg-white rounded-xl p-4 mb-6 border">
            {filterContent}
          </div>
        )}

        {/* Active filter chips (mobile & desktop) */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-4">
            {search && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#1a2332]/10 text-[#1a2332] rounded-full text-xs font-medium">
                Tafuta: "{search}"
                <button onClick={() => { setSearch(''); if (queryParam) navigate('/products'); }} className="hover:text-[#ff6b6b]"><X className="w-3 h-3" /></button>
              </span>
            )}
            {selectedType !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#1a2332]/10 text-[#1a2332] rounded-full text-xs font-medium">
                Aina: {selectedType}
                <button onClick={() => setSelectedType('all')} className="hover:text-[#ff6b6b]"><X className="w-3 h-3" /></button>
              </span>
            )}
            {priceLimit > 0 && priceLimit < maxPrice && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#1a2332]/10 text-[#1a2332] rounded-full text-xs font-medium">
                Bei: hadi {formatPrice(priceLimit)}
                <button onClick={() => setPriceLimit(maxPrice)} className="hover:text-[#ff6b6b]"><X className="w-3 h-3" /></button>
              </span>
            )}
            {sort !== 'featured' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#1a2332]/10 text-[#1a2332] rounded-full text-xs font-medium">
                {sort === 'newest' ? 'Mpya' : sort === 'price-asc' ? 'Bei chini' : sort === 'price-desc' ? 'Bei juu' : 'Jina A-Z'}
                <button onClick={() => setSort('featured')} className="hover:text-[#ff6b6b]"><X className="w-3 h-3" /></button>
              </span>
            )}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl p-5 sticky top-24">
              <div className="flex items-center gap-2 mb-5">
                <SlidersHorizontal className="w-4 h-4" />
                <h3 className="font-semibold">Chuja</h3>
                {activeFilterCount > 0 && (
                  <span className="bg-[#ff6b6b] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-auto">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              {filterContent}
            </div>
          </aside>

          {/* Products grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="aspect-square bg-gray-200 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl">
                <p className="text-gray-500 mb-4">Hakuna bidhaa zilizopatikana.</p>
                {hasActiveFilters && (
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Futa vichujio
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
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

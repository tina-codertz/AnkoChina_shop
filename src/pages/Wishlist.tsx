import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/format';
import { Button } from '@/components/ui/button';

const Wishlist: React.FC = () => {
  const { user } = useAuth();
  const { wishlistIds, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { redirect: '/wishlist' } });
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);
      const { data } = await api.get<{ products: any[] }>('/wishlist');
      setProducts(data?.products || []);
      setLoading(false);
    };
    load();
  }, [wishlistIds, user]);

  const handleMoveToCart = (product: any) => {
    addToCart({
      product_id: product.id,
      name: product.name,
      sku: product.sku || product.handle,
      price: product.price,
      image: product.images?.[0],
      handle: product.handle,
    }, 1);
    toggleWishlist(product.id, product.name);
  };

  const handleAddAll = () => {
    products.forEach(p => {
      const inStock = p.inventory_qty == null || p.inventory_qty > 0;
      if (inStock) {
        addToCart({
          product_id: p.id,
          name: p.name,
          sku: p.sku || p.handle,
          price: p.price,
          image: p.images?.[0],
          handle: p.handle,
        }, 1);
      }
    });
  };

  if (!user) return null;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#1a2332]" style={{ fontFamily: 'Playfair Display, serif' }}>
              Favorites
            </h1>
            <p className="text-gray-600 mt-1">
              Bidhaa {products.length} zimehifadhiwa
            </p>
          </div>
          {products.length > 0 && (
            <Button onClick={handleAddAll} className="bg-[#ff6b6b] hover:bg-[#ff5252]">
              <ShoppingCart className="w-4 h-4 mr-2" /> Ongeza Zote Kwenye Kikapu
            </Button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl h-64 animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-[#ff6b6b]/10 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-[#ff6b6b]" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Orodha yako ni tupu</h2>
            <p className="text-gray-500 mb-6">Hifadhi bidhaa unazozipenda ili uzitazame baadaye.</p>
            <Link to="/products">
              <Button className="bg-[#1a2332]">Tazama Bidhaa</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(p => {
              const inStock = p.inventory_qty == null || p.inventory_qty > 0;
              return (
                <div key={p.id} className="bg-white rounded-xl overflow-hidden group">
                  <Link to={`/products/${p.handle}`} className="block relative aspect-square overflow-hidden bg-gray-100">
                    <img
                      src={p.images?.[0]}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {!inStock && (
                      <div className="absolute top-3 left-3 bg-gray-700 text-white text-xs px-2 py-1 rounded-full font-semibold">
                        IMEISHA
                      </div>
                    )}
                  </Link>
                  <div className="p-4">
                    <div className="text-xs text-gray-500 mb-1">{p.product_type}</div>
                    <Link to={`/products/${p.handle}`}>
                      <h3 className="font-medium text-[#1a2332] hover:text-[#ff6b6b] line-clamp-1">{p.name}</h3>
                    </Link>
                    <div className="mt-1 font-bold text-lg text-[#1a2332]">{formatPrice(p.price)}</div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        onClick={() => handleMoveToCart(p)}
                        disabled={!inStock}
                        className="flex-1 bg-[#1a2332] hover:bg-[#2a3548]"
                        size="sm"
                      >
                        <ShoppingCart className="w-4 h-4 mr-1" /> Ongeza Kwenye Kikapu
                      </Button>
                      <button
                        onClick={() => toggleWishlist(p.id, p.name)}
                        className="p-2 rounded-md border text-gray-500 hover:text-red-500 hover:border-red-500 transition-colors"
                        aria-label="Ondoa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Wishlist;

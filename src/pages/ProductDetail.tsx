import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Minus, Plus, ShoppingCart, ArrowLeft, Check, MessageCircle } from 'lucide-react';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/format';
import { Button } from '@/components/ui/button';
import WishlistButton from '@/components/WishlistButton';

const ProductDetail: React.FC = () => {
  const { handle } = useParams<{ handle: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const load = async () => {
      if (!handle) return;
      setLoading(true);
      setQuantity(1);
      const { data } = await api.get(`/products/${handle}`);
      setProduct(data);
      setLoading(false);
    };
    load();
  }, [handle]);

  if (loading) {
    return <Layout><div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-500">Inapakia...</div></Layout>;
  }

  if (!product) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Bidhaa haipatikani</h1>
          <Link to="/products"><Button>Tazama Bidhaa</Button></Link>
        </div>
      </Layout>
    );
  }

  const inStock = product.inventory_qty == null || product.inventory_qty > 0;

  const handleAdd = () => {
    if (!inStock) return;
    addToCart({
      product_id: product.id,
      name: product.name,
      sku: product.sku || product.handle,
      price: product.price,
      image: product.images?.[0],
      handle: product.handle,
    }, quantity);
  };

  const whatsappMessage = encodeURIComponent(
    `Habari, nataka kuagiza bidhaa hii:\n\n` +
    `*${product.name}*\n` +
    `Bei: ${formatPrice(product.price)}\n` +
    `Idadi: ${quantity}\n\n` +
    `Naomba msaada zaidi.`
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-600 hover:text-[#1a2332] mb-6">
          <ArrowLeft className="w-4 h-4" /> Rudi
        </button>

        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <div className="aspect-square rounded-2xl overflow-hidden bg-white">
              <img src={product.images?.[0]} alt={product.name} className="w-full h-full object-cover" />
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-500 mb-2">{product.product_type}</div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#1a2332] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              {product.name}
            </h1>
            <div className="text-3xl font-bold text-[#1a2332] mb-6">{formatPrice(product.price)}</div>

            <div className="flex items-center gap-2 mb-6">
              {inStock ? (
                <>
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">Inapatikana</span>
                  {product.inventory_qty != null && (
                    <span className="text-sm text-gray-500">({product.inventory_qty} zimebaki)</span>
                  )}
                </>
              ) : (
                <span className="text-sm text-red-600 font-medium">Imeisha</span>
              )}
            </div>

            <p className="text-gray-700 mb-8 leading-relaxed">{product.description}</p>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Idadi</label>
              <div className="inline-flex items-center border rounded-lg overflow-hidden">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 hover:bg-gray-100"><Minus className="w-4 h-4" /></button>
                <span className="px-4 py-2 font-medium min-w-[3rem] text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-2 hover:bg-gray-100"><Plus className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <Button onClick={handleAdd} disabled={!inStock} size="lg" variant="outline" className="flex-1 border-[#1a2332] text-[#1a2332] hover:bg-[#1a2332] hover:text-white">
                <ShoppingCart className="w-5 h-5 mr-2" /> Ongeza Kwenye Kikapu
              </Button>
              <a href={`https://wa.me/255672679480?text=${whatsappMessage}`} target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button size="lg" className="w-full bg-green-600 hover:bg-green-700">
                  <MessageCircle className="w-5 h-5 mr-2" /> Agiza kwa WhatsApp
                </Button>
              </a>
            </div>
            <div className="mb-8">
              <WishlistButton productId={product.id} productName={product.name} variant="full" />
            </div>

            <div className="mt-6 text-sm text-gray-600 space-y-1">
              <div><span className="font-medium">SKU:</span> {product.sku || product.handle}</div>
              {product.tags?.length > 0 && (
                <div>
                  <span className="font-medium">Tags:</span> {product.tags.join(', ')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Minus, Plus, ShoppingCart, ArrowLeft, Truck, Shield, RefreshCw, Check } from 'lucide-react';
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
    return <Layout><div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-500">Loading...</div></Layout>;
  }

  if (!product) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <Link to="/products"><Button>Browse Products</Button></Link>
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

  const handleBuyNow = () => {
    handleAdd();
    navigate('/cart');
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-600 hover:text-[#1a2332] mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
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
                  <span className="text-sm text-green-600 font-medium">In Stock</span>
                  {product.inventory_qty != null && (
                    <span className="text-sm text-gray-500">({product.inventory_qty} available)</span>
                  )}
                </>
              ) : (
                <span className="text-sm text-red-600 font-medium">Out of Stock</span>
              )}
            </div>

            <p className="text-gray-700 mb-8 leading-relaxed">{product.description}</p>

            {/* Quantity */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Quantity</label>
              <div className="inline-flex items-center border rounded-lg overflow-hidden">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 hover:bg-gray-100"><Minus className="w-4 h-4" /></button>
                <span className="px-4 py-2 font-medium min-w-[3rem] text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-2 hover:bg-gray-100"><Plus className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <Button onClick={handleAdd} disabled={!inStock} size="lg" variant="outline" className="flex-1 border-[#1a2332] text-[#1a2332] hover:bg-[#1a2332] hover:text-white">
                <ShoppingCart className="w-5 h-5 mr-2" /> Add to Cart
              </Button>
              <Button onClick={handleBuyNow} disabled={!inStock} size="lg" className="flex-1 bg-[#ff6b6b] hover:bg-[#ff5252]">
                Buy Now
              </Button>
            </div>
            <div className="mb-8">
              <WishlistButton productId={product.id} productName={product.name} variant="full" />
            </div>


            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-white rounded-xl border">
              <div className="text-center">
                <Truck className="w-5 h-5 mx-auto mb-1 text-[#ff6b6b]" />
                <div className="text-xs font-medium">Free Shipping</div>
              </div>
              <div className="text-center">
                <RefreshCw className="w-5 h-5 mx-auto mb-1 text-[#ff6b6b]" />
                <div className="text-xs font-medium">30-Day Returns</div>
              </div>
              <div className="text-center">
                <Shield className="w-5 h-5 mx-auto mb-1 text-[#ff6b6b]" />
                <div className="text-xs font-medium">Secure Payment</div>
              </div>
            </div>

            {/* Meta */}
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

import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/format';
import { Button } from '@/components/ui/button';
import WishlistButton from './WishlistButton';

interface ProductCardProps {
  product: any;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      product_id: product.id,
      name: product.name,
      sku: product.sku || product.handle,
      price: product.price,
      image: product.images?.[0],
      handle: product.handle,
    }, 1);
  };

  const inStock = product.inventory_qty == null || product.inventory_qty > 0;
  const isSale = product.tags?.includes('sale');
  const isNew = product.tags?.includes('new');

  return (
    <Link to={`/products/${product.handle}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100 mb-3">
        <img
          src={product.images?.[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {isSale && <span className="bg-[#ff6b6b] text-white text-xs px-2 py-1 rounded-full font-semibold">PUNGUZO</span>}
          {isNew && <span className="bg-[#1a2332] text-white text-xs px-2 py-1 rounded-full font-semibold">MPYA</span>}
          {!inStock && <span className="bg-gray-700 text-white text-xs px-2 py-1 rounded-full font-semibold">IMEISHA</span>}
        </div>
        <div className="absolute top-3 right-3">
          <WishlistButton productId={product.id} productName={product.name} size="sm" />
        </div>
        <Button
          onClick={handleAdd}
          disabled={!inStock}
          size="sm"
          className="absolute bottom-3 right-3 bg-white text-[#1a2332] hover:bg-[#1a2332] hover:text-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
        >
          <ShoppingCart className="w-4 h-4" />
        </Button>
      </div>
      <div className="px-1">
        <div className="text-xs text-gray-500 mb-1">{product.product_type}</div>
        <h3 className="text-sm font-medium text-[#1a2332] line-clamp-1 group-hover:text-[#ff6b6b] transition-colors">{product.name}</h3>
        <div className="mt-1 font-semibold text-[#1a2332]">{formatPrice(product.price)}</div>
      </div>
    </Link>
  );
};

export default ProductCard;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useWishlist } from '@/contexts/WishlistContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface WishlistButtonProps {
  productId: string;
  productName?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'full';
}

const WishlistButton: React.FC<WishlistButtonProps> = ({ productId, productName, className, size = 'md', variant = 'icon' }) => {
  const { user } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const navigate = useNavigate();
  const active = isInWishlist(productId);

  const sizes = { sm: 'w-7 h-7', md: 'w-9 h-9', lg: 'w-11 h-11' };
  const iconSizes = { sm: 'w-3.5 h-3.5', md: 'w-4 h-4', lg: 'w-5 h-5' };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/login', { state: { redirect: window.location.pathname } });
      return;
    }
    toggleWishlist(productId, productName);
  };

  if (variant === 'full') {
    return (
      <button
        onClick={handleClick}
        className={cn(
          'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-colors',
          active ? 'bg-[#ff6b6b]/10 border-[#ff6b6b] text-[#ff6b6b]' : 'border-gray-300 text-gray-700 hover:border-[#ff6b6b] hover:text-[#ff6b6b]',
          className
        )}
        aria-label={active ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <Heart className={cn('w-4 h-4', active && 'fill-[#ff6b6b]')} />
        <span className="text-sm font-medium">{active ? 'Imehifadhiwa' : 'Hifadhi'}</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        'rounded-full flex items-center justify-center bg-white shadow-md transition-all hover:scale-110',
        sizes[size],
        className
      )}
      aria-label={active ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart className={cn(iconSizes[size], active ? 'fill-[#ff6b6b] text-[#ff6b6b]' : 'text-gray-600')} />
    </button>
  );
};

export default WishlistButton;

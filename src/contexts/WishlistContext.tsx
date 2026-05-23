import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from './AuthContext';
import { toast } from '@/components/ui/use-toast';

interface WishlistContextType {
  wishlistIds: Set<string>;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string, productName?: string) => Promise<void>;
  refreshWishlist: () => Promise<void>;
  count: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());

  const refreshWishlist = useCallback(async () => {
    if (!user) {
      setWishlistIds(new Set());
      return;
    }
    const { data } = await api.get<{ products: any[] }>('/wishlist');
    if (data?.products) {
      setWishlistIds(new Set(data.products.map((p: any) => p.id)));
    }
  }, [user]);

  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  const isInWishlist = (productId: string) => wishlistIds.has(productId);

  const toggleWishlist = async (productId: string, productName?: string) => {
    if (!user) {
      toast({ title: 'Sign in required', description: 'Please log in to save favorites.', variant: 'destructive' });
      return;
    }
    if (wishlistIds.has(productId)) {
      const { error } = await api.delete(`/wishlist/${productId}`);
      if (!error) {
        setWishlistIds(prev => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });
        toast({ title: 'Removed from wishlist', description: productName });
      }
    } else {
      const { error } = await api.post(`/wishlist/${productId}`);
      if (!error) {
        setWishlistIds(prev => new Set(prev).add(productId));
        toast({ title: 'Added to wishlist', description: productName });
      }
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlistIds, isInWishlist, toggleWishlist, refreshWishlist, count: wishlistIds.size }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
};

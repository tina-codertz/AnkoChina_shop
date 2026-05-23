import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
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
    const { data } = await supabase
      .from('wishlist')
      .select('product_id')
      .eq('user_id', user.id);
    setWishlistIds(new Set((data || []).map(w => w.product_id)));
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
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);
      if (!error) {
        setWishlistIds(prev => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });
        toast({ title: 'Removed from wishlist', description: productName });
      }
    } else {
      const { error } = await supabase
        .from('wishlist')
        .insert({ user_id: user.id, product_id: productId });
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

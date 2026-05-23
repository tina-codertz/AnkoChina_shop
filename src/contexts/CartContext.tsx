import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from '@/components/ui/use-toast';

export interface CartItem {
  product_id: string;
  variant_id?: string;
  quantity: number;
  name: string;
  variant_title?: string;
  sku?: string;
  price: number; // cents
  image?: string;
  handle?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeFromCart: (product_id: string, variant_id?: string) => void;
  updateQuantity: (product_id: string, quantity: number, variant_id?: string) => void;
  clearCart: () => void;
  subtotal: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const KEY = 'ecom_cart';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY);
      if (stored) setCart(JSON.parse(stored));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(cart));
  }, [cart]);

  const addToCart: CartContextType['addToCart'] = (item, quantity = 1) => {
    setCart(prev => {
      const idx = prev.findIndex(c => c.product_id === item.product_id && c.variant_id === item.variant_id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + quantity };
        return updated;
      }
      return [...prev, { ...item, quantity }];
    });
    toast({ title: 'Added to cart', description: item.name });
  };

  const removeFromCart: CartContextType['removeFromCart'] = (product_id, variant_id) => {
    setCart(prev => prev.filter(c => !(c.product_id === product_id && c.variant_id === variant_id)));
  };

  const updateQuantity: CartContextType['updateQuantity'] = (product_id, quantity, variant_id) => {
    if (quantity <= 0) return removeFromCart(product_id, variant_id);
    setCart(prev => prev.map(c => 
      c.product_id === product_id && c.variant_id === variant_id ? { ...c, quantity } : c
    ));
  };

  const clearCart = () => setCart([]);

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const itemCount = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, subtotal, itemCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};

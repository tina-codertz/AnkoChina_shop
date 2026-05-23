import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, X, LogOut, LayoutDashboard, Package, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const [collections, setCollections] = useState<any[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    api.get<{ collections: any[] }>('/collections')
      .then(({ data }) => setCollections(data?.collections || []));
  }, []);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="bg-[#1a2332] text-white text-xs py-2 text-center">
        Free shipping on all orders • 30-day returns • Secure checkout
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#1a2332] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <span className="text-xl font-bold text-[#1a2332]" style={{ fontFamily: 'Playfair Display, serif' }}>AnkoChina</span>
            </Link>
            <nav className="hidden lg:flex items-center gap-6">
              <Link to="/products" className="text-sm font-medium text-gray-700 hover:text-[#ff6b6b] transition-colors">All</Link>
              {collections.slice(0, 6).map(c => (
                <Link key={c.id} to={`/collections/${c.handle}`} className="text-sm font-medium text-gray-700 hover:text-[#ff6b6b] transition-colors">
                  {c.title}
                </Link>
              ))}
            </nav>
          </div>

          <form onSubmit={onSearch} className="hidden md:flex flex-1 max-w-md mx-8 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-full bg-gray-100 border-0 focus:outline-none focus:ring-2 focus:ring-[#ff6b6b]"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </form>

          <div className="flex items-center gap-1">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5 text-sm">
                    <div className="font-medium">{user.name || user.email}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </div>
                  <DropdownMenuSeparator />
                  {user.role === 'admin' && (
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      <LayoutDashboard className="w-4 h-4 mr-2" /> Admin Dashboard
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => navigate('/account')}>
                    <User className="w-4 h-4 mr-2" /> My Account
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/orders')}>
                    <Package className="w-4 h-4 mr-2" /> My Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/wishlist')}>
                    <Heart className="w-4 h-4 mr-2" /> My Wishlist
                    {wishlistCount > 0 && <span className="ml-auto text-xs bg-[#ff6b6b] text-white rounded-full px-2">{wishlistCount}</span>}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { logout(); navigate('/'); }}>
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                <User className="w-5 h-5 md:mr-2" />
                <span className="hidden md:inline">Sign In</span>
              </Button>
            )}
            {user && (
              <Link to="/wishlist" className="relative hidden sm:inline-flex">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Heart className="w-5 h-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#ff6b6b] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                      {wishlistCount}
                    </span>
                  )}
                </Button>
              </Link>
            )}
            <Link to="/cart" className="relative">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#ff6b6b] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                    {itemCount}
                  </span>
                )}
              </Button>
            </Link>
            <button className="lg:hidden ml-1" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4 space-y-2">
            <form onSubmit={onSearch} className="relative mb-3">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 text-sm rounded-full bg-gray-100 border-0"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </form>
            <Link to="/products" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm font-medium hover:bg-gray-100 rounded">All Products</Link>
            {collections.map(c => (
              <Link key={c.id} to={`/collections/${c.handle}`} onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm font-medium hover:bg-gray-100 rounded">
                {c.title}
              </Link>
            ))}
            {user && (
              <Link to="/wishlist" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm font-medium hover:bg-gray-100 rounded">
                My Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

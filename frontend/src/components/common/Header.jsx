import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShoppingBag, 
  Search, 
  User, 
  MapPin, 
  Phone, 
  Clock, 
  Menu, 
  X, 
  ShieldCheck, 
  ChevronDown,
  LogOut,
  LayoutDashboard,
  PackageCheck,
  Store,
  Sparkles,
  Flame
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { ProductService } from '../../api/services';
import { getProductImageUrl, getUserAvatarUrl } from '../../utils/imageUrl';

const Header = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalItemCount, subtotal, setIsCartOpen } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const searchRef = useRef(null);
  const userMenuRef = useRef(null);

  // Debounced Live Search
  useEffect(() => {
    const fetchLiveSearch = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        setShowSearchDropdown(false);
        return;
      }
      try {
        setIsSearching(true);
        const data = await ProductService.getAll({ search: searchQuery.trim() });
        setSearchResults(data.slice(0, 5));
        setShowSearchDropdown(true);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(fetchLiveSearch, 250);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Click outside to close search dropdown & user menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchDropdown(false);
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-kirana-beige/80 transition-all">
      {/* 1. Top Announcement Bar */}
      <div className="bg-gradient-to-r from-kirana-green via-kirana-green-dark to-kirana-green text-white text-xs sm:text-sm py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 truncate">
            <span className="bg-kirana-orange text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full tracking-wide inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Special
            </span>
            <span className="font-medium truncate">
              Pure Mandi Spices & Groceries • Free Delivery above ₹249 • Open 7 AM - 9:30 PM
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-6 text-xs text-kirana-sand font-medium">
            <a href="tel:7295077559" className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Phone className="w-3.5 h-3.5 text-kirana-orange-light" />
              Order on Call: <strong className="text-white">7295077559</strong>
            </a>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-kirana-mustard" />
              Near Mahavir Chowk Ganguli, Benipatti
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo & Store Identity */}
          <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-kirana-orange to-kirana-orange-dark flex items-center justify-center shadow-md shadow-kirana-orange/20 text-white font-black text-xl group-hover:scale-105 transition-transform">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-outfit font-black text-lg sm:text-xl text-kirana-brown-dark tracking-tight leading-none group-hover:text-kirana-orange transition-colors">
                  UPENDRA
                </span>
                <span className="bg-kirana-green/10 text-kirana-green text-[10px] font-bold px-1.5 py-0.5 rounded border border-kirana-green/20">
                  ESTD. 1998
                </span>
              </div>
              <span className="block text-[11px] sm:text-xs font-semibold text-kirana-brown-light tracking-wide uppercase">
                General Stores & Kirana
              </span>
            </div>
          </Link>

          {/* Live Search Bar */}
          <div ref={searchRef} className="hidden lg:block flex-1 max-w-xl relative">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <div className="absolute left-3.5 text-kirana-brown-muted pointer-events-none">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search Jeera, Arhar Dal, Haldi, Desi Ghee, Chips, Namkeen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim() && setShowSearchDropdown(true)}
                className="w-full bg-kirana-sand/70 focus:bg-white border border-kirana-beige focus:border-kirana-orange rounded-full py-2.5 pl-10 pr-24 text-sm text-kirana-brown-dark placeholder-kirana-brown-muted/80 outline-none transition-all shadow-inner focus:shadow-md"
              />
              <button
                type="submit"
                className="absolute right-1.5 bg-gradient-to-r from-kirana-orange to-kirana-orange-dark hover:from-kirana-orange-dark hover:to-kirana-orange text-white text-xs font-semibold px-4 py-1.5 rounded-full transition-all shadow-sm"
              >
                Search
              </button>
            </form>

            {/* Search Dropdown Popup */}
            {showSearchDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-kirana-lg border border-kirana-beige p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                {isSearching ? (
                  <div className="p-4 text-center text-xs text-kirana-brown-muted">Searching groceries...</div>
                ) : searchResults.length > 0 ? (
                  <div className="divide-y divide-kirana-sand/80">
                    <div className="px-3 py-1.5 text-[11px] font-bold text-kirana-brown-muted uppercase tracking-wider">
                      Matching Grocery Items ({searchResults.length})
                    </div>
                    {searchResults.map((prod) => (
                      <Link
                        key={prod.id}
                        to={`/products/${prod.id}`}
                        onClick={() => setShowSearchDropdown(false)}
                        className="flex items-center gap-3 p-2.5 hover:bg-kirana-sand/50 rounded-xl transition-colors group"
                      >
                        <img
                          src={getProductImageUrl(prod.image)}
                          alt={prod.name}
                          className="w-11 h-11 object-cover rounded-lg border border-kirana-beige"
                          onError={(e) => {
                            e.target.src = '/assets/images/spices.jpg';
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-kirana-brown-dark group-hover:text-kirana-orange truncate">
                            {prod.name}
                          </h4>
                          <p className="text-xs text-kirana-brown-light truncate">
                            {prod.hindi_name ? `${prod.hindi_name} • ` : ''}{prod.category_name}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-kirana-green">
                            ₹{prod.price}
                          </span>
                          <span className="text-[10px] text-kirana-brown-muted block">
                            /{prod.unit}
                          </span>
                        </div>
                      </Link>
                    ))}
                    <Link
                      to={`/products?search=${encodeURIComponent(searchQuery)}`}
                      onClick={() => setShowSearchDropdown(false)}
                      className="block text-center py-2 text-xs font-bold text-kirana-orange hover:underline"
                    >
                      View all results for "{searchQuery}" →
                    </Link>
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-kirana-brown-muted">
                    No items found matching "{searchQuery}". Try searching for 'Dal', 'Haldi', or 'Jeera'.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Action Icons & Controls */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            
            {/* Delivery Location Pill */}
            <div className="hidden xl:flex items-center gap-2 bg-kirana-cream px-3 py-1.5 rounded-full border border-kirana-beige text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-kirana-brown-light font-medium">Deliver in <strong className="text-kirana-green">30-45 mins</strong></span>
            </div>

            {/* Cart Trigger Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 bg-kirana-orange/10 hover:bg-kirana-orange/20 text-kirana-orange border border-kirana-orange/30 px-3.5 py-2 rounded-2xl transition-all btn-press group"
              aria-label="Open Cart"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {totalItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-kirana-orange text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                    {totalItemCount}
                  </span>
                )}
              </div>
              <div className="hidden sm:block text-left text-xs">
                <span className="block font-bold leading-tight">
                  {totalItemCount > 0 ? `₹${subtotal}` : 'My Cart'}
                </span>
                <span className="text-[10px] text-kirana-orange-dark font-medium">
                  {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}
                </span>
              </div>
            </button>

            {/* User Account / Login */}
            <div ref={userMenuRef} className="relative">
              {isAuthenticated ? (
                <div>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 bg-kirana-sand/80 hover:bg-kirana-sand text-kirana-brown-dark px-2.5 py-1.5 rounded-2xl border border-kirana-beige transition-all btn-press text-xs font-semibold"
                  >
                    <div className="w-7 h-7 rounded-full bg-kirana-green text-white flex items-center justify-center font-bold text-xs overflow-hidden border border-kirana-beige shadow-sm">
                      {getUserAvatarUrl(user?.profile_image) ? (
                        <img
                          src={getUserAvatarUrl(user.profile_image)}
                          alt={user?.full_name || 'User'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <span>{user?.full_name ? user.full_name[0].toUpperCase() : 'U'}</span>
                      )}
                    </div>
                    <span className="hidden md:inline max-w-[100px] truncate">{user?.full_name || 'Account'}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-kirana-brown-muted" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-kirana-lg border border-kirana-beige py-2 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-2 border-b border-kirana-sand flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-kirana-green text-white flex items-center justify-center font-bold text-sm overflow-hidden border border-kirana-beige flex-shrink-0">
                          {getUserAvatarUrl(user?.profile_image) ? (
                            <img
                              src={getUserAvatarUrl(user.profile_image)}
                              alt={user?.full_name || 'User'}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <span>{user?.full_name ? user.full_name[0].toUpperCase() : 'U'}</span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-kirana-brown-dark truncate">{user.full_name}</p>
                          <p className="text-[11px] text-kirana-brown-muted truncate">{user.email}</p>
                          <span className={`inline-block mt-0.5 text-[9px] font-bold px-2 py-0.2 rounded-full ${isAdmin ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                            {isAdmin ? '★ Store Admin' : 'Customer'}
                          </span>
                        </div>
                      </div>

                      <Link
                        to="/orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-kirana-brown-dark hover:bg-kirana-sand/60 font-medium"
                      >
                        <PackageCheck className="w-4 h-4 text-kirana-orange" /> My Orders & Tracking
                      </Link>

                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-kirana-brown-dark hover:bg-kirana-sand/60 font-medium"
                      >
                        <User className="w-4 h-4 text-kirana-green" /> Profile & Addresses
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-kirana-brown-dark hover:bg-kirana-mustard-soft font-bold text-kirana-orange-dark border-t border-b border-kirana-sand"
                        >
                          <LayoutDashboard className="w-4 h-4 text-kirana-orange" /> Shopkeeper Admin Suite
                        </Link>
                      )}

                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 font-medium text-left transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/signin"
                    className="flex items-center gap-1.5 bg-gradient-to-r from-kirana-green to-kirana-green-dark hover:from-kirana-green-dark hover:to-kirana-green text-white px-3.5 py-2 rounded-2xl text-xs font-bold shadow-sm transition-all btn-press"
                  >
                    <User className="w-4 h-4" />
                    <span>Sign In</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-kirana-brown-dark hover:bg-kirana-sand rounded-xl border border-kirana-beige"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* 3. Secondary Category Bar (Desktop) */}
        <nav className="hidden lg:flex items-center justify-between pt-3 mt-2 border-t border-kirana-sand/80 text-xs font-semibold text-kirana-brown-light">
          <div className="flex items-center space-x-6">
            <Link
              to="/"
              className={`hover:text-kirana-orange transition-colors flex items-center gap-1.5 ${location.pathname === '/' ? 'text-kirana-orange font-bold' : ''}`}
            >
              <Store className="w-4 h-4" /> Home
            </Link>
            <Link
              to="/products"
              className={`hover:text-kirana-orange transition-colors ${location.pathname === '/products' ? 'text-kirana-orange font-bold' : ''}`}
            >
              All Groceries
            </Link>
            <Link
              to="/categories"
              className={`hover:text-kirana-orange transition-colors ${location.pathname === '/categories' ? 'text-kirana-orange font-bold' : ''}`}
            >
              Categories
            </Link>
            <Link
              to="/products?category=pulses-dal"
              className="hover:text-kirana-orange transition-colors"
            >
              Pulses & Dal
            </Link>
            <Link
              to="/products?category=spices-masala"
              className="hover:text-kirana-orange transition-colors"
            >
              Spices & Masala
            </Link>
            <Link
              to="/products?category=dry-fruits"
              className="hover:text-kirana-orange transition-colors"
            >
              Dry Fruits
            </Link>
            <Link
              to="/products?category=namkeen-snacks"
              className="hover:text-kirana-orange transition-colors"
            >
              Namkeen & Snacks
            </Link>
            <Link
              to="/products?category=oils-ghee"
              className="hover:text-kirana-orange transition-colors"
            >
              Oils & Ghee
            </Link>
            <Link
              to="/products?category=daily-essentials"
              className="hover:text-kirana-orange transition-colors"
            >
              Daily Essentials
            </Link>
            <Link
              to="/about"
              className={`hover:text-kirana-orange transition-colors ${location.pathname === '/about' ? 'text-kirana-orange font-bold' : ''}`}
            >
              About Our Store
            </Link>
            <Link
              to="/contact"
              className={`hover:text-kirana-orange transition-colors ${location.pathname === '/contact' ? 'text-kirana-orange font-bold' : ''}`}
            >
              Contact & Store Timing
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-kirana-orange font-bold flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" /> Best Quality Guaranteed
            </span>
          </div>
        </nav>
      </div>

      {/* 4. Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-kirana-beige px-4 py-4 space-y-4 shadow-xl animate-in slide-in-from-top-2">
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3 text-kirana-brown-muted" />
            <input
              type="text"
              placeholder="Search groceries, dals, spices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-kirana-sand border border-kirana-beige rounded-xl py-2 pl-9 pr-4 text-xs text-kirana-brown-dark outline-none focus:border-kirana-orange"
            />
          </form>

          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-kirana-sand/50 hover:bg-kirana-sand flex items-center gap-2"
            >
              <Store className="w-4 h-4 text-kirana-orange" /> Home
            </Link>
            <Link
              to="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-kirana-sand/50 hover:bg-kirana-sand flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4 text-kirana-green" /> All Products
            </Link>
            <Link
              to="/categories"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-kirana-sand/50 hover:bg-kirana-sand flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-kirana-mustard-dark" /> Categories
            </Link>
            <Link
              to="/orders"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-kirana-sand/50 hover:bg-kirana-sand flex items-center gap-2"
            >
              <PackageCheck className="w-4 h-4 text-kirana-orange" /> My Orders
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-kirana-sand/50 hover:bg-kirana-sand flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-kirana-green" /> About Store
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-kirana-sand/50 hover:bg-kirana-sand flex items-center gap-2"
            >
              <Phone className="w-4 h-4 text-kirana-orange" /> Contact Us
            </Link>
          </div>

          {isAdmin && (
            <Link
              to="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-center py-2 bg-kirana-orange text-white rounded-xl text-xs font-bold shadow"
            >
              Go to Admin Panel
            </Link>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;

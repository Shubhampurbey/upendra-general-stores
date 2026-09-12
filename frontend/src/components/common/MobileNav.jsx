import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Store, ShoppingBag, Grid, PackageCheck, User } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const MobileNav = () => {
  const location = useLocation();
  const { totalItemCount, setIsCartOpen } = useCart();
  const { isAuthenticated } = useAuth();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-kirana-beige px-1.5 py-1.5 shadow-2xl safe-area-bottom w-full max-w-full">
      <nav className="grid grid-cols-5 items-center justify-items-center w-full max-w-lg mx-auto" aria-label="Mobile Navigation">
        {/* 1. Home */}
        <Link
          to="/"
          className={`flex flex-col items-center justify-center w-full py-1 px-1 rounded-xl transition-all ${
            isActive('/') ? 'text-kirana-orange font-bold' : 'text-kirana-brown-muted hover:text-kirana-brown-dark'
          }`}
        >
          <Store className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Home</span>
        </Link>

        {/* 2. Shop */}
        <Link
          to="/products"
          className={`flex flex-col items-center justify-center w-full py-1 px-1 rounded-xl transition-all ${
            isActive('/products') ? 'text-kirana-orange font-bold' : 'text-kirana-brown-muted hover:text-kirana-brown-dark'
          }`}
        >
          <ShoppingBag className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Shop</span>
        </Link>

        {/* 3. Categories */}
        <Link
          to="/categories"
          className={`flex flex-col items-center justify-center w-full py-1 px-1 rounded-xl transition-all ${
            isActive('/categories') ? 'text-kirana-orange font-bold' : 'text-kirana-brown-muted hover:text-kirana-brown-dark'
          }`}
        >
          <Grid className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Categories</span>
        </Link>

        {/* 4. Cart Drawer Trigger */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center justify-center w-full py-1 px-1 rounded-xl text-kirana-brown-muted hover:text-kirana-orange transition-all"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 mb-0.5 text-kirana-orange" />
            {totalItemCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-kirana-orange text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {totalItemCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight font-bold text-kirana-orange">Cart</span>
        </button>

        {/* 5. Profile / Sign In */}
        <Link
          to={isAuthenticated ? "/profile" : "/signin"}
          className={`flex flex-col items-center justify-center w-full py-1 px-1 rounded-xl transition-all ${
            isActive('/profile') || isActive('/orders') || isActive('/signin')
              ? 'text-kirana-orange font-bold'
              : 'text-kirana-brown-muted hover:text-kirana-brown-dark'
          }`}
        >
          {isAuthenticated ? (
            <>
              <User className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight">Profile</span>
            </>
          ) : (
            <>
              <User className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight">Sign In</span>
            </>
          )}
        </Link>
      </nav>
    </div>
  );
};

export default MobileNav;

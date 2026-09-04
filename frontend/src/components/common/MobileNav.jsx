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
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-kirana-beige px-3 py-2 shadow-2xl">
      <div className="flex items-center justify-around">
        {/* Home */}
        <Link
          to="/"
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            isActive('/') ? 'text-kirana-orange font-bold' : 'text-kirana-brown-muted hover:text-kirana-brown-dark'
          }`}
        >
          <Store className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Home</span>
        </Link>

        {/* Shop */}
        <Link
          to="/products"
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            isActive('/products') ? 'text-kirana-orange font-bold' : 'text-kirana-brown-muted hover:text-kirana-brown-dark'
          }`}
        >
          <ShoppingBag className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Shop</span>
        </Link>

        {/* Categories */}
        <Link
          to="/categories"
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            isActive('/categories') ? 'text-kirana-orange font-bold' : 'text-kirana-brown-muted hover:text-kirana-brown-dark'
          }`}
        >
          <Grid className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Categories</span>
        </Link>

        {/* Cart Drawer Trigger */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center justify-center py-1 px-2 rounded-xl text-kirana-brown-muted hover:text-kirana-orange transition-all"
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

        {/* Account / Orders */}
        <Link
          to={isAuthenticated ? "/orders" : "/signin"}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            isActive('/orders') || isActive('/signin') || isActive('/profile')
              ? 'text-kirana-orange font-bold'
              : 'text-kirana-brown-muted hover:text-kirana-brown-dark'
          }`}
        >
          {isAuthenticated ? (
            <>
              <PackageCheck className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight">Orders</span>
            </>
          ) : (
            <>
              <User className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight">Sign In</span>
            </>
          )}
        </Link>
      </div>
    </div>
  );
};

export default MobileNav;

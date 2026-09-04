import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Grid, 
  ShoppingBag, 
  Users, 
  Settings, 
  ArrowLeft, 
  LogOut, 
  Store, 
  Sparkles,
  Sliders,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getUserAvatarUrl } from '../../utils/imageUrl';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();

  const navItems = [
    { name: 'Dashboard Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Products Management', path: '/admin/products', icon: Package },
    { name: 'Quick Price & Stock Editor', path: '/admin/inventory', icon: DollarSign },
    { name: 'Categories', path: '/admin/categories', icon: Grid },
    { name: 'Orders & Fulfillment', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Customer Directory', path: '/admin/customers', icon: Users },
  ];

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-kirana-cream flex flex-col md:flex-row">
      
      {/* 1. Sidebar */}
      <aside className="w-full md:w-64 bg-kirana-brown-dark text-kirana-sand flex-shrink-0 flex flex-col justify-between border-r border-kirana-brown-light/20">
        <div>
          {/* Brand Header */}
          <div className="p-5 border-b border-kirana-brown-light/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-kirana-orange text-white flex items-center justify-center font-black text-lg shadow-md">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-outfit font-black text-base text-white tracking-tight">
                  UPENDRA STORES
                </h1>
                <span className="text-[10px] font-bold text-kirana-mustard uppercase tracking-wider block">
                  Shopkeeper Admin
                </span>
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="p-3 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                    active
                      ? 'bg-kirana-orange text-white shadow-md shadow-kirana-orange/30'
                      : 'text-kirana-sand/80 hover:bg-kirana-brown hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-kirana-brown-light/20 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs font-semibold text-kirana-sand/80 hover:bg-kirana-brown hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-kirana-orange" />
            <span>Customer Website</span>
          </Link>

          <button
            onClick={() => {
              logout();
              navigate('/signin');
            }}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-900/30 transition-colors text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Admin Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-kirana-beige/80 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div>
            <span className="text-xs text-kirana-brown-muted font-semibold">Store Management Portal</span>
            <h2 className="font-outfit font-black text-xl text-kirana-brown-dark">
              Upendra General Stores Control Center
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-kirana-green/10 text-kirana-green border border-kirana-green/30 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Store Open
            </span>
            <div className="w-8 h-8 rounded-full bg-kirana-orange text-white flex items-center justify-center font-bold text-xs shadow-sm overflow-hidden border border-kirana-beige">
              {getUserAvatarUrl(user?.profile_image) ? (
                <img
                  src={getUserAvatarUrl(user.profile_image)}
                  alt={user?.full_name || 'Admin'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <span>{user?.full_name ? user.full_name[0].toUpperCase() : 'A'}</span>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </div>
      </main>

    </div>
  );
};

export default AdminLayout;

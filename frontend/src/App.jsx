import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Common UI
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import MobileNav from './components/common/MobileNav';
import CartDrawer from './components/cart/CartDrawer';

// Public Pages
import Home from './pages/public/Home';
import Products from './pages/public/Products';
import ProductDetail from './pages/public/ProductDetail';
import Categories from './pages/public/Categories';
import About from './pages/public/About';
import Contact from './pages/public/Contact';
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';
import AdminLogin from './pages/auth/AdminLogin';
import AccessDenied from './pages/public/AccessDenied';

// Customer Pages
import CartPage from './pages/customer/CartPage';
import Checkout from './pages/customer/Checkout';
import OrderConfirmation from './pages/customer/OrderConfirmation';
import MyOrders from './pages/customer/MyOrders';
import Profile from './pages/customer/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminPriceStock from './pages/admin/AdminPriceStock';
import AdminCategories from './pages/admin/AdminCategories';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCustomers from './pages/admin/AdminCustomers';

// Protected Customer Route
const ProtectedCustomerRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-12 text-center text-xs text-kirana-brown-muted gap-2">
        <div className="w-7 h-7 border-2 border-kirana-orange border-t-transparent rounded-full animate-spin"></div>
        <span>Verifying customer session...</span>
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }
  return children;
};

// Protected Admin Route (Shows Access Denied 403 if normal customer)
const ProtectedAdminRoute = ({ children }) => {
  const { user, isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-12 text-center text-xs text-kirana-brown-muted gap-2">
        <div className="w-7 h-7 border-2 border-kirana-brown-dark border-t-transparent rounded-full animate-spin"></div>
        <span>Checking administrator authorization...</span>
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/admin-login" state={{ from: location }} replace />;
  }
  if (!isAdmin) {
    return <AccessDenied />;
  }
  return children;
};

function AppLayout({ children }) {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin') && location.pathname !== '/admin-login';

  return (
    <div className="min-h-screen flex flex-col bg-kirana-cream text-kirana-brown-dark font-sans selection:bg-kirana-orange selection:text-white">
      {!isAdminRoute && <Header />}
      <div className="flex-1">
        {children}
      </div>
      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <MobileNav />}
      <CartDrawer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#2D2319',
              color: '#FAF7F2',
              borderRadius: '16px',
              fontSize: '12px',
              fontWeight: '600',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)',
            },
            success: {
              iconTheme: {
                primary: '#1E5128',
                secondary: '#FFFFFF',
              },
            },
            error: {
              iconTheme: {
                primary: '#E85D04',
                secondary: '#FFFFFF',
              },
            },
          }}
        />

        <AppLayout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/access-denied" element={<AccessDenied />} />

            {/* Customer Protected Routes */}
            <Route
              path="/cart"
              element={
                <ProtectedCustomerRoute>
                  <CartPage />
                </ProtectedCustomerRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedCustomerRoute>
                  <Checkout />
                </ProtectedCustomerRoute>
              }
            />
            <Route
              path="/order-confirmation/:orderId"
              element={
                <ProtectedCustomerRoute>
                  <OrderConfirmation />
                </ProtectedCustomerRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedCustomerRoute>
                  <MyOrders />
                </ProtectedCustomerRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedCustomerRoute>
                  <Profile />
                </ProtectedCustomerRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={<Navigate to="/admin/dashboard" replace />}
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedAdminRoute>
                  <AdminDashboard />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <ProtectedAdminRoute>
                  <AdminProducts />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/inventory"
              element={
                <ProtectedAdminRoute>
                  <AdminPriceStock />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/categories"
              element={
                <ProtectedAdminRoute>
                  <AdminCategories />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <ProtectedAdminRoute>
                  <AdminOrders />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/customers"
              element={
                <ProtectedAdminRoute>
                  <AdminCustomers />
                </ProtectedAdminRoute>
              }
            />

            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;

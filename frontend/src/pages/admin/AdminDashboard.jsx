import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  Package, 
  AlertTriangle, 
  Users, 
  ArrowRight,
  Plus,
  DollarSign
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { AdminService } from '../../api/services';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await AdminService.getDashboardData();
      setData(res);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await AdminService.updateOrderStatus(orderId, newStatus);
      toast.success(`Order ${orderId} marked as ${newStatus}`);
      fetchDashboard();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="py-20 text-center">
          <div className="w-12 h-12 border-4 border-kirana-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xs text-kirana-brown-light">Loading store metrics...</p>
        </div>
      </AdminLayout>
    );
  }

  const metrics = data?.metrics || {};

  return (
    <AdminLayout>
      <div className="space-y-8">
        
        {/* Top Quick Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-kirana-sand to-white p-5 rounded-3xl border border-kirana-beige">
          <div>
            <h2 className="font-outfit font-black text-xl text-kirana-brown-dark">
              Daily Store Management Summary
            </h2>
            <p className="text-xs text-kirana-brown-light">
              Live orders and inventory metrics for Upendra General Stores
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/products"
              className="px-4 py-2 rounded-xl bg-kirana-orange hover:bg-kirana-orange-dark text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </Link>
            <Link
              to="/admin/inventory"
              className="px-4 py-2 rounded-xl bg-white hover:bg-kirana-sand border border-kirana-beige text-kirana-brown-dark text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all"
            >
              <DollarSign className="w-4 h-4 text-kirana-green" />
              <span>Quick Price Editor</span>
            </Link>
          </div>
        </div>

        {/* 1. KPI Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          {/* Total Revenue */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-kirana-beige shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-kirana-brown-muted uppercase tracking-wider">Total Sales</span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                ₹
              </div>
            </div>
            <h3 className="font-outfit font-black text-2xl sm:text-3xl text-kirana-green">
              ₹{metrics.total_sales || '0.00'}
            </h3>
            <span className="text-[11px] text-kirana-brown-light font-medium block">
              Across all customer orders
            </span>
          </div>

          {/* Pending Orders */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-kirana-beige shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-kirana-brown-muted uppercase tracking-wider">Pending Orders</span>
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <h3 className="font-outfit font-black text-2xl sm:text-3xl text-amber-600">
              {metrics.pending_orders || 0}
            </h3>
            <span className="text-[11px] text-amber-700 font-semibold block">
              Requires packing / fulfillment
            </span>
          </div>

          {/* Low Stock Alerts */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-kirana-beige shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-kirana-brown-muted uppercase tracking-wider">Low Stock Alerts</span>
              <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <h3 className="font-outfit font-black text-2xl sm:text-3xl text-red-600">
              {metrics.low_stock_products || 0}
            </h3>
            <span className="text-[11px] text-red-600 font-semibold block">
              Items with ≤ 5kg / 5 units left
            </span>
          </div>

          {/* Total Customers */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-kirana-beige shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-kirana-brown-muted uppercase tracking-wider">Total Customers</span>
              <div className="w-10 h-10 rounded-2xl bg-kirana-orange-soft text-kirana-orange flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <h3 className="font-outfit font-black text-2xl sm:text-3xl text-kirana-brown-dark">
              {metrics.total_customers || 0}
            </h3>
            <span className="text-[11px] text-kirana-brown-light block">
              Registered neighborhood buyers
            </span>
          </div>

        </div>

        {/* 2. Recent Orders & Status Management */}
        <div className="bg-white rounded-3xl border border-kirana-beige p-6 shadow-kirana space-y-5">
          <div className="flex items-center justify-between border-b border-kirana-sand pb-4">
            <div>
              <h3 className="font-outfit font-black text-lg text-kirana-brown-dark">
                Recent Orders Fulfillment
              </h3>
              <p className="text-xs text-kirana-brown-light">
                Update delivery progress in 1-click
              </p>
            </div>
            <Link
              to="/admin/orders"
              className="text-xs font-bold text-kirana-orange hover:underline flex items-center gap-1"
            >
              <span>View All Orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-kirana-sand/60 text-kirana-brown-dark uppercase text-[10px] font-extrabold tracking-wider">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Items Count</th>
                  <th className="py-3 px-4">Bill Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 rounded-r-xl">Change Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-kirana-sand">
                {data?.recent_orders?.map((ord) => (
                  <tr key={ord.id} className="hover:bg-kirana-sand/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-kirana-brown-dark">
                      {ord.order_id}
                    </td>
                    <td className="py-3 px-4 font-semibold text-kirana-brown-dark">
                      {ord.customer_name}
                    </td>
                    <td className="py-3 px-4 text-kirana-brown-light">
                      {ord.customer_phone}
                    </td>
                    <td className="py-3 px-4">
                      {ord.items?.length || 0} items
                    </td>
                    <td className="py-3 px-4 font-outfit font-bold text-kirana-green">
                      ₹{ord.total_amount}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        {ord.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={ord.status}
                        onChange={(e) => handleStatusChange(ord.order_id, e.target.value)}
                        className="bg-kirana-sand border border-kirana-beige rounded-xl py-1 px-2 text-xs font-bold text-kirana-brown-dark outline-none cursor-pointer"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="preparing">Preparing</option>
                        <option value="out_for_delivery">Out for Delivery</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Category Products Overview */}
        <div className="bg-white rounded-3xl border border-kirana-beige p-6 shadow-kirana space-y-4">
          <h3 className="font-outfit font-black text-lg text-kirana-brown-dark">
            Category Breakdown
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {data?.categories?.map((cat) => (
              <div key={cat.id} className="p-3 bg-kirana-cream rounded-2xl border border-kirana-beige flex items-center justify-between">
                <span className="font-bold text-xs text-kirana-brown-dark truncate">{cat.name}</span>
                <span className="text-[10px] font-black bg-white px-2 py-0.5 rounded-full border border-kirana-beige text-kirana-orange">
                  {cat.prod_count} items
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;

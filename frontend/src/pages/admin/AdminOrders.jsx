import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Clock, 
  CheckCircle2, 
  Phone, 
  MapPin, 
  Eye, 
  X, 
  ExternalLink, 
  Navigation,
  CreditCard,
  ShieldCheck,
  Check,
  AlertCircle
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { AdminService } from '../../api/services';
import toast from 'react-hot-toast';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [viewOrder, setViewOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await AdminService.getAllOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await AdminService.updateOrderStatus(orderId, newStatus);
      toast.success(`Order ${orderId} updated to ${newStatus}`);
      fetchOrders();
      if (viewOrder && viewOrder.order_id === orderId) {
        setViewOrder((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      toast.error('Failed to update order status');
    }
  };

  const filtered = orders.filter((o) => {
    const matchSearch =
      o.order_id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_phone.includes(search) ||
      (o.transaction_id && o.transaction_id.toLowerCase().includes(search.toLowerCase()));
    
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchPayment = paymentFilter === 'all' || o.payment_status === paymentFilter;

    return matchSearch && matchStatus && matchPayment;
  });

  const getPaymentStatusBadge = (paymentStatus) => {
    switch (paymentStatus) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
            <Check className="w-3 h-3" />
            <span>Paid</span>
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-300">
            <AlertCircle className="w-3 h-3" />
            <span>Failed</span>
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-300">
            <Clock className="w-3 h-3" />
            <span>Processing</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-800 border border-gray-300">
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3 h-3" />
            <span>Pending</span>
          </span>
        );
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-outfit font-black text-2xl text-kirana-brown-dark">
              Order Fulfillment & Payment Audit
            </h1>
            <p className="text-xs text-kirana-brown-light">
              Manage incoming customer grocery orders and audit real payment gateway statuses
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-kirana-brown-muted" />
              <input
                type="text"
                placeholder="Search by ID, name, phone, txn..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-white border border-kirana-beige rounded-2xl py-2 pl-9 pr-4 text-xs outline-none focus:border-kirana-orange shadow-sm"
              />
            </div>

            {/* Payment Status Filter */}
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="bg-white border border-kirana-beige rounded-2xl py-2 px-3 text-xs font-bold text-kirana-brown-dark outline-none cursor-pointer shadow-sm"
            >
              <option value="all">All Payments</option>
              <option value="paid">✓ Paid</option>
              <option value="pending">⏳ Pending</option>
              <option value="failed">✗ Failed</option>
            </select>

            {/* Order Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-kirana-beige rounded-2xl py-2 px-3 text-xs font-bold text-kirana-brown-dark outline-none cursor-pointer shadow-sm"
            >
              <option value="all">All Statuses ({orders.length})</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="preparing">Preparing</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-3xl border border-kirana-beige shadow-kirana overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-kirana-sand/60 text-kirana-brown-dark uppercase text-[10px] font-extrabold tracking-wider border-b border-kirana-beige">
                <tr>
                  <th className="py-3.5 px-4">Order ID & Date</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Delivery Address</th>
                  <th className="py-3.5 px-4">Bill Amount</th>
                  <th className="py-3.5 px-4">Payment Method</th>
                  <th className="py-3.5 px-4">Payment Status</th>
                  <th className="py-3.5 px-4">Transaction ID</th>
                  <th className="py-3.5 px-4">Order Status</th>
                  <th className="py-3.5 px-4">Update Status</th>
                  <th className="py-3.5 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-kirana-sand">
                {loading ? (
                  <tr>
                    <td colSpan="10" className="py-12 text-center text-kirana-brown-muted">
                      Loading orders...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="py-12 text-center text-kirana-brown-muted">
                      No matching orders found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((ord) => (
                    <tr key={ord.id} className="hover:bg-kirana-sand/30 transition-colors">
                      {/* Order ID */}
                      <td className="py-3 px-4 font-mono font-bold text-kirana-brown-dark">
                        {ord.order_id}
                        <span className="text-[10px] text-kirana-brown-muted block font-normal">
                          {new Date(ord.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="py-3 px-4">
                        <span className="font-bold text-kirana-brown-dark block">{ord.customer_name}</span>
                        <span className="text-[11px] text-kirana-brown-light flex items-center gap-1">
                          <Phone className="w-3 h-3 text-kirana-orange" /> {ord.customer_phone}
                        </span>
                      </td>

                      {/* Delivery Address */}
                      <td className="py-3 px-4 max-w-xs text-kirana-brown-light">
                        <span className="block truncate font-medium text-kirana-brown-dark">
                          {ord.delivery_address || 'No address text'}
                        </span>
                        <span className="text-[11px] text-kirana-brown-muted block truncate">
                          {ord.village_area && `${ord.village_area}, `}{ord.city} {ord.pincode && ` - ${ord.pincode}`}
                        </span>
                        {ord.latitude && ord.longitude && (
                          <a
                            href={`https://www.google.com/maps?q=${ord.latitude},${ord.longitude}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-lg transition-colors"
                          >
                            <MapPin className="w-3 h-3 text-emerald-600" />
                            <span>GPS ({ord.latitude.toFixed(4)}, {ord.longitude.toFixed(4)})</span>
                          </a>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-4 font-outfit font-black text-sm text-kirana-green">
                        ₹{ord.total_amount}
                      </td>

                      {/* Payment Method */}
                      <td className="py-3 px-4">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-kirana-sand text-kirana-brown-dark border border-kirana-beige">
                          {ord.payment_method}
                        </span>
                      </td>

                      {/* Payment Status */}
                      <td className="py-3 px-4">
                        {getPaymentStatusBadge(ord.payment_status)}
                      </td>

                      {/* Transaction ID */}
                      <td className="py-3 px-4 font-mono text-[11px] text-kirana-brown-muted max-w-[120px] truncate">
                        {ord.transaction_id || '—'}
                      </td>

                      {/* Order Status */}
                      <td className="py-3 px-4">
                        <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                          {ord.status.replace(/_/g, ' ')}
                        </span>
                      </td>

                      {/* Update Status */}
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

                      {/* Details button */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setViewOrder(ord)}
                          className="px-3 py-1.5 rounded-xl bg-kirana-sand hover:bg-kirana-beige text-kirana-brown-dark font-bold text-xs inline-flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-kirana-orange" />
                          <span>View ({ord.items?.length || 0})</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Details Modal */}
        {viewOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-kirana-brown-dark/70 backdrop-blur-sm">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-kirana-beige overflow-hidden max-h-[90vh] flex flex-col">
              
              <div className="p-5 bg-gradient-to-r from-kirana-sand to-white border-b border-kirana-beige flex items-center justify-between">
                <div>
                  <h3 className="font-outfit font-black text-lg text-kirana-brown-dark">
                    Order Details: {viewOrder.order_id}
                  </h3>
                  <span className="text-xs text-kirana-brown-muted">
                    Placed: {new Date(viewOrder.created_at).toLocaleString('en-IN')}
                  </span>
                </div>
                <button onClick={() => setViewOrder(null)} className="p-1.5 rounded-full hover:bg-kirana-sand">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6 text-xs">
                
                {/* Customer & Destination */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-kirana-sand/40 p-4 rounded-2xl border border-kirana-beige">
                  <div>
                    <span className="font-bold uppercase text-[10px] text-kirana-brown-muted block mb-1">Customer Info:</span>
                    <p className="font-bold text-kirana-brown-dark">{viewOrder.customer_name}</p>
                    <p className="text-kirana-brown-light">📞 {viewOrder.customer_phone}</p>
                    {viewOrder.customer_email && <p className="text-kirana-brown-light">✉️ {viewOrder.customer_email}</p>}
                  </div>

                  <div>
                    <span className="font-bold uppercase text-[10px] text-kirana-brown-muted block mb-1">Delivery Destination:</span>
                    <p className="text-kirana-brown-dark font-medium leading-relaxed">
                      {viewOrder.delivery_address || 'No street specified'}, {viewOrder.village_area && `${viewOrder.village_area}, `}{viewOrder.city} - {viewOrder.pincode}
                    </p>
                    {viewOrder.latitude && viewOrder.longitude && (
                      <div className="mt-2 pt-2 border-t border-kirana-beige flex items-center gap-2">
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${viewOrder.latitude},${viewOrder.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-sm transition-all"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>Google Maps Navigation</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Verified Payment Information Card */}
                <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200/80 space-y-2">
                  <span className="font-bold uppercase text-[10px] text-amber-900 block">
                    Payment Gateway & Verification Audit:
                  </span>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-kirana-brown-muted text-[10px] block">Payment Method:</span>
                      <span className="font-bold uppercase text-kirana-brown-dark">{viewOrder.payment_method}</span>
                    </div>

                    <div>
                      <span className="text-kirana-brown-muted text-[10px] block">Payment Status:</span>
                      {getPaymentStatusBadge(viewOrder.payment_status)}
                    </div>

                    <div>
                      <span className="text-kirana-brown-muted text-[10px] block">Gateway:</span>
                      <span className="font-bold capitalize text-kirana-brown-dark">{viewOrder.payment_gateway || 'Razorpay'}</span>
                    </div>

                    <div>
                      <span className="text-kirana-brown-muted text-[10px] block">Paid Timestamp:</span>
                      <span className="font-medium text-kirana-brown-dark">
                        {viewOrder.paid_at ? new Date(viewOrder.paid_at).toLocaleString('en-IN') : 'Not Yet Paid'}
                      </span>
                    </div>
                  </div>

                  {viewOrder.transaction_id && (
                    <div className="pt-2 border-t border-amber-200 flex items-center gap-2 text-[11px]">
                      <span className="font-bold text-amber-900">Transaction ID:</span>
                      <span className="font-mono font-bold text-kirana-brown-dark bg-white px-2.5 py-0.5 rounded border border-amber-200">
                        {viewOrder.transaction_id}
                      </span>
                    </div>
                  )}
                </div>

                {/* Items List */}
                <div>
                  <span className="font-bold uppercase text-[10px] text-kirana-brown-muted block mb-2">
                    Packaged Grocery Items ({viewOrder.items?.length || 0}):
                  </span>
                  <div className="divide-y divide-kirana-sand border border-kirana-beige rounded-2xl overflow-hidden">
                    {viewOrder.items?.map((item, idx) => (
                      <div key={idx} className="p-3 bg-white flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.product_image || '/assets/images/spices.jpg'}
                            alt={item.product_name}
                            className="w-10 h-10 object-cover rounded-xl border border-kirana-beige"
                          />
                          <div>
                            <h4 className="font-bold text-kirana-brown-dark">{item.product_name}</h4>
                            <span className="text-[11px] text-kirana-brown-muted">
                              Quantity: <strong>{item.quantity} {item.unit}</strong>
                            </span>
                          </div>
                        </div>
                        <span className="font-outfit font-bold text-kirana-green">
                          ₹{item.subtotal}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Grand Total */}
                <div className="flex justify-between items-baseline pt-3 border-t border-kirana-sand font-bold text-sm">
                  <span>Grand Total:</span>
                  <span className="font-outfit font-black text-xl text-kirana-green">
                    ₹{viewOrder.total_amount}
                  </span>
                </div>

              </div>

            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};

export default AdminOrders;

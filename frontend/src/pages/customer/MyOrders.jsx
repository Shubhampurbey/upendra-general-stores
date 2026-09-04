import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  PackageCheck, 
  Clock, 
  CheckCircle2, 
  Truck, 
  ShoppingBag, 
  MapPin, 
  Phone, 
  Calendar, 
  ChevronDown, 
  RotateCcw,
  Sparkles,
  AlertCircle,
  CreditCard,
  QrCode,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { OrderService, PaymentService } from '../../api/services';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { loadRazorpayScript } from '../../utils/loadRazorpay';
import toast from 'react-hot-toast';

const MyOrders = () => {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingOrderId, setPayingOrderId] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await OrderService.getMyOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [isAuthenticated]);

  const handleRetryPayment = async (order) => {
    try {
      setPayingOrderId(order.order_id);
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        toast.error('Could not load payment gateway. Please check connection.');
        setPayingOrderId(null);
        return;
      }

      const gatewayData = await PaymentService.createPaymentOrder(order.order_id, order.payment_method || 'upi');

      const rzpOptions = {
        key: gatewayData.key_id,
        amount: gatewayData.amount,
        currency: gatewayData.currency || 'INR',
        name: 'Upendra General Stores',
        description: `Order #${order.order_id}`,
        order_id: gatewayData.gateway_order_id,
        prefill: {
          name: order.customer_name,
          email: order.customer_email || '',
          contact: order.customer_phone,
        },
        theme: {
          color: '#E85D04',
        },
        modal: {
          ondismiss: async () => {
            setPayingOrderId(null);
            await PaymentService.recordFailure(order.order_id, 'Customer closed payment window');
            toast.error('Payment cancelled.');
          },
        },
        handler: async (response) => {
          try {
            toast.loading('Verifying payment signature...', { id: 'retry-verify' });
            const verifyRes = await PaymentService.verifyPayment({
              order_id: order.order_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.success) {
              toast.success('Payment Verified! Order marked as PAID.', { id: 'retry-verify' });
              fetchOrders();
            } else {
              toast.error(verifyRes.error || 'Payment verification failed.', { id: 'retry-verify' });
            }
          } catch (e) {
            toast.error('Server verification error.', { id: 'retry-verify' });
          } finally {
            setPayingOrderId(null);
          }
        },
      };

      const rzp = new window.Razorpay(rzpOptions);
      rzp.open();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to open payment gateway.');
      setPayingOrderId(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (activeFilter === 'all') return true;
    return o.status === activeFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'preparing': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'out_for_delivery': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'delivered': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPaymentStatusBadge = (paymentStatus) => {
    switch (paymentStatus) {
      case 'paid':
        return <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">✓ Paid</span>;
      case 'failed':
        return <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-red-100 text-red-800 border border-red-200">✗ Failed</span>;
      case 'processing':
        return <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 border border-sky-200">⏳ Processing</span>;
      case 'cancelled':
        return <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-800 border border-zinc-200">Cancelled</span>;
      default:
        return <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200">Pending</span>;
    }
  };

  const timelineSteps = [
    { key: 'pending', label: 'Order Received' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'preparing', label: 'Packing at Store' },
    { key: 'out_for_delivery', label: 'Out for Delivery' },
    { key: 'delivered', label: 'Delivered' },
  ];

  const getStepIndex = (status) => {
    switch (status) {
      case 'pending': return 0;
      case 'confirmed': return 1;
      case 'preparing': return 2;
      case 'out_for_delivery': return 3;
      case 'delivered': return 4;
      default: return -1;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black text-kirana-orange uppercase tracking-wider">
            Live Order Tracking
          </span>
          <h1 className="font-outfit font-black text-2xl sm:text-3xl text-kirana-brown-dark mt-1">
            My Grocery Orders
          </h1>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
          {['all', 'pending', 'preparing', 'out_for_delivery', 'delivered'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3.5 py-1.5 rounded-xl font-bold capitalize whitespace-nowrap transition-all ${
                activeFilter === filter
                  ? 'bg-kirana-orange text-white shadow-sm'
                  : 'bg-white border border-kirana-beige text-kirana-brown-dark hover:bg-kirana-sand'
              }`}
            >
              {filter.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-3xl p-6 border border-kirana-beige animate-pulse h-48"></div>
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-kirana-beige text-center space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 mx-auto rounded-full bg-kirana-sand flex items-center justify-center text-kirana-brown-muted">
            <PackageCheck className="w-8 h-8" />
          </div>
          <h3 className="font-outfit font-bold text-xl text-kirana-brown-dark">
            No Orders Found
          </h3>
          <p className="text-xs text-kirana-brown-light">
            You don't have any orders under the selected filter.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-kirana-orange text-white text-xs font-bold px-6 py-2.5 rounded-2xl shadow"
          >
            Start Shopping Groceries
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const currentStep = getStepIndex(order.status);
            const isCancelled = order.status === 'cancelled';
            const canRetryOnlinePay = 
              (order.payment_method === 'upi' || order.payment_method === 'card') && 
              order.payment_status !== 'paid' && 
              order.status !== 'cancelled';

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-kirana-beige p-6 sm:p-8 shadow-kirana space-y-6"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-kirana-sand gap-3">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-black text-sm text-kirana-brown-dark">
                        {order.order_id}
                      </span>
                      <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${getStatusColor(order.status)}`}>
                        {order.status.replace(/_/g, ' ')}
                      </span>
                      {getPaymentStatusBadge(order.payment_status)}
                    </div>
                    <span className="text-[11px] text-kirana-brown-muted block mt-0.5">
                      Placed on: {new Date(order.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div>
                      <span className="text-kirana-brown-muted block text-[10px]">Total Bill</span>
                      <span className="font-outfit font-black text-lg text-kirana-green">
                        ₹{order.total_amount}
                      </span>
                    </div>

                    {canRetryOnlinePay && (
                      <button
                        onClick={() => handleRetryPayment(order)}
                        disabled={payingOrderId === order.order_id}
                        className="px-4 py-2 rounded-xl bg-kirana-orange hover:bg-kirana-orange-dark text-white font-bold text-xs shadow transition-all flex items-center gap-1.5"
                      >
                        {payingOrderId === order.order_id ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Opening Gateway...</span>
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Pay ₹{order.total_amount} Now</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Visual Tracking Timeline */}
                {!isCancelled && (
                  <div className="bg-kirana-cream p-4 sm:p-5 rounded-2xl border border-kirana-beige/80">
                    <span className="text-[11px] font-bold text-kirana-brown-muted uppercase tracking-wider block mb-3">
                      Order Status Timeline
                    </span>
                    <div className="grid grid-cols-5 gap-1 relative">
                      {timelineSteps.map((step, idx) => {
                        const isDone = idx <= currentStep;
                        const isCurrent = idx === currentStep;

                        return (
                          <div key={idx} className="flex flex-col items-center text-center space-y-1.5 relative">
                            {/* Dot / Checkmark */}
                            <div
                              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all z-10 ${
                                isDone
                                  ? 'bg-kirana-green text-white shadow-sm'
                                  : 'bg-kirana-beige text-kirana-brown-muted'
                              } ${isCurrent ? 'ring-4 ring-kirana-green/20 scale-110' : ''}`}
                            >
                              {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                            </div>
                            <span
                              className={`text-[9px] sm:text-[11px] font-semibold leading-tight ${
                                isDone ? 'text-kirana-brown-dark' : 'text-kirana-brown-muted'
                              }`}
                            >
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Items List */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-kirana-brown-dark uppercase tracking-wider block">
                    Ordered Grocery Items:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {order.items?.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-kirana-sand/40 p-3 rounded-2xl border border-kirana-beige flex items-center gap-3 text-xs"
                      >
                        <img
                          src={item.product_image || '/assets/images/spices.jpg'}
                          alt={item.product_name}
                          className="w-12 h-12 object-cover rounded-xl border border-kirana-beige flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-kirana-brown-dark truncate">
                            {item.product_name}
                          </h4>
                          <p className="text-[11px] text-kirana-brown-light">
                            {item.quantity} {item.unit} • ₹{item.subtotal}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Address, Payment & Notes */}
                <div className="pt-3 border-t border-kirana-sand flex flex-col sm:flex-row sm:items-center justify-between text-xs text-kirana-brown-light gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <MapPin className="w-4 h-4 text-kirana-orange flex-shrink-0" />
                    <span>
                      Delivering to: <strong className="text-kirana-brown-dark">{order.delivery_address}, {order.village_area && `${order.village_area}, `}{order.city}</strong>
                    </span>
                    {order.latitude && order.longitude && (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                        📍 GPS Tagged
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-kirana-brown-muted">
                      Method: <strong className="uppercase text-kirana-brown-dark">{order.payment_method}</strong>
                    </span>
                    {order.transaction_id && (
                      <span className="text-[11px] font-mono text-kirana-brown-muted bg-kirana-sand px-2 py-0.5 rounded">
                        Txn: {order.transaction_id}
                      </span>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default MyOrders;

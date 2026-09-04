import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  ShoppingBag, 
  MapPin, 
  Phone, 
  Clock, 
  ArrowRight, 
  Printer, 
  PackageCheck,
  Store,
  Sparkles,
  CreditCard,
  QrCode,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { OrderService } from '../../api/services';


const OrderConfirmation = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!location.state?.order);

  useEffect(() => {
    // Fire celebratory confetti for customer
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#E85D04', '#1E5128', '#E5A93C', '#F48C06'],
      });
    } catch (e) {
      console.error(e);
    }

    if (!order && orderId) {
      const fetchOrder = async () => {
        try {
          setLoading(true);
          const data = await OrderService.getOrderById(orderId);
          setOrder(data);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchOrder();
    }
  }, [orderId]);

  const handlePrint = () => {
    window.print();
  };

  const isPaid = order?.payment_status === 'paid';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      {/* 1. Celebration & Status Banner */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-kirana-beige shadow-kirana text-center space-y-4 relative overflow-hidden">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-inner ${
          isPaid ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-700'
        }`}>
          {isPaid ? <CheckCircle2 className="w-10 h-10" /> : <Clock className="w-10 h-10" />}
        </div>

        <div>
          <span className="text-xs font-black text-kirana-orange uppercase tracking-wider block">
            {isPaid ? 'Payment Verified & Order Confirmed!' : 'Order Placed Successfully!'}
          </span>
          <h1 className="font-outfit font-black text-2xl sm:text-4xl text-kirana-brown-dark mt-1">
            Thank You for Shopping Local!
          </h1>
          <p className="text-xs sm:text-sm text-kirana-brown-light max-w-md mx-auto mt-2">
            Upendra General Stores has received your grocery order. We are packing your fresh Mandi items for delivery.
          </p>
        </div>

        {/* Order ID & Payment Pill */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          <div className="inline-flex items-center gap-2 bg-kirana-sand/80 border border-kirana-beige px-4 py-2 rounded-2xl">
            <span className="text-xs text-kirana-brown-muted font-bold">Order ID:</span>
            <span className="font-mono font-black text-sm text-kirana-brown-dark">
              {order?.order_id || orderId}
            </span>
          </div>

          <div className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl text-xs font-black uppercase border ${
            isPaid 
              ? 'bg-emerald-100 text-emerald-900 border-emerald-300' 
              : 'bg-amber-100 text-amber-900 border-amber-300'
          }`}>
            <span>Payment Status:</span>
            <span>{order?.payment_status || 'Pending'}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Link
            to="/orders"
            className="px-6 py-2.5 rounded-2xl bg-kirana-orange hover:bg-kirana-orange-dark text-white text-xs font-bold shadow-md transition-all flex items-center gap-2"
          >
            <PackageCheck className="w-4 h-4" />
            <span>Track in My Orders</span>
          </Link>

          <button
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-2xl bg-white hover:bg-kirana-sand border border-kirana-beige text-kirana-brown-dark text-xs font-bold transition-all flex items-center gap-2"
          >
            <Printer className="w-4 h-4 text-kirana-brown-muted" />
            <span>Print Receipt</span>
          </button>

          <Link
            to="/products"
            className="px-5 py-2.5 rounded-2xl bg-kirana-sand hover:bg-kirana-beige text-kirana-brown-dark text-xs font-bold transition-all"
          >
            Continue Shopping
          </Link>
        </div>
      </div>

      {/* 2. Order Summary Details */}
      {order && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-kirana-beige shadow-kirana space-y-6">
          <h3 className="font-outfit font-black text-lg text-kirana-brown-dark border-b border-kirana-sand pb-3">
            Order Receipt & Payment Breakdown
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Customer & Address */}
            <div className="space-y-2">
              <span className="font-bold text-kirana-brown-dark uppercase tracking-wider block text-[11px]">
                Delivery Destination:
              </span>
              <p className="font-bold text-kirana-brown-dark">{order.customer_name}</p>
              <p className="text-kirana-brown-light">📞 {order.customer_phone}</p>
              <p className="text-kirana-brown-light leading-relaxed">
                {order.delivery_address}, {order.village_area && `${order.village_area}, `}{order.city}, {order.state} {order.pincode && `- ${order.pincode}`}
              </p>
              {order.latitude && order.longitude && (
                <span className="text-[10px] text-emerald-700 font-bold block pt-1">
                  📍 Real GPS Location Tagged ({order.latitude}, {order.longitude})
                </span>
              )}
            </div>

            {/* Payment & Status Meta */}
            <div className="space-y-2 bg-kirana-sand/40 p-4 rounded-2xl border border-kirana-beige">
              <span className="font-bold text-kirana-brown-dark uppercase tracking-wider block text-[11px]">
                Payment Verification Details:
              </span>
              
              <div className="flex justify-between py-1 border-b border-kirana-beige">
                <span className="text-kirana-brown-muted">Payment Mode:</span>
                <span className="uppercase font-bold text-kirana-brown-dark">{order.payment_method}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-kirana-beige">
                <span className="text-kirana-brown-muted">Payment Status:</span>
                <span className={`font-black uppercase px-2 py-0.5 rounded text-[10px] ${
                  isPaid ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'
                }`}>
                  {order.payment_status}
                </span>
              </div>

              {order.transaction_id && (
                <div className="flex justify-between py-1 border-b border-kirana-beige font-mono">
                  <span className="text-kirana-brown-muted">Txn / Payment ID:</span>
                  <span className="font-bold text-kirana-brown-dark">{order.transaction_id}</span>
                </div>
              )}

              {order.paid_at && (
                <div className="flex justify-between py-1 border-b border-kirana-beige">
                  <span className="text-kirana-brown-muted">Paid At:</span>
                  <span className="text-kirana-brown-dark font-medium">
                    {new Date(order.paid_at).toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              <div className="flex justify-between py-1">
                <span className="text-kirana-brown-muted">Fulfillment Status:</span>
                <span className="font-bold text-kirana-orange uppercase capitalize">
                  {order.status.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* Ordered Items Table */}
          <div className="pt-4 border-t border-kirana-sand">
            <span className="font-bold text-kirana-brown-dark uppercase tracking-wider block text-[11px] mb-3">
              Items Breakdown:
            </span>
            <div className="divide-y divide-kirana-sand">
              {order.items?.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-kirana-brown-dark">{item.product_name}</h4>
                    <span className="text-[11px] text-kirana-brown-light">
                      {item.quantity} {item.unit}
                    </span>
                  </div>
                  <span className="font-outfit font-bold text-kirana-green">
                    ₹{item.subtotal}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic UPI Payment Card for Pending UPI Orders */}
          {order.payment_method === 'upi' && !isPaid && (
            <div className="bg-amber-50/70 p-6 rounded-3xl border-2 border-amber-200 text-center space-y-4">
              <div className="flex items-center justify-center gap-1.5 text-amber-900 font-bold text-xs">
                <QrCode className="w-4 h-4 text-kirana-orange" />
                <span>Complete UPI Payment for this Order</span>
              </div>

              <div className="inline-block p-3 bg-white rounded-2xl shadow-md border border-amber-200">
                <QRCodeSVG 
                  value={`upi://pay?pa=7050830610@ptsbi&pn=Upendra%20General%20Stores&am=${Number(order.total_amount).toFixed(2)}&cu=INR&tn=Order%20${order.order_id}`}
                  size={140} 
                  level="H" 
                />
              </div>

              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-xl border border-amber-200 text-xs font-mono">
                  <span className="text-kirana-brown-muted">Pay to:</span>
                  <strong className="text-kirana-orange">7050830610@ptsbi</strong>
                </div>
                <p className="text-[11px] text-amber-900 font-medium">
                  Scan using Google Pay, PhonePe, Paytm or any UPI app to pay <strong>₹{order.total_amount}</strong>.
                </p>
              </div>
            </div>
          )}

          {/* Total */}
          <div className="pt-4 border-t border-kirana-beige flex justify-between items-baseline text-xs">
            <div>
              <span className="text-kirana-brown-light block">Delivery Fee: ₹{order.delivery_charge}</span>
              <span className="font-outfit font-bold text-sm text-kirana-brown-dark">
                {isPaid ? 'Total Amount Paid:' : 'Total Amount Due:'}
              </span>
            </div>
            <span className="font-outfit font-black text-2xl text-kirana-green">
              ₹{order.total_amount}
            </span>
          </div>


        </div>
      )}

    </div>
  );
};

export default OrderConfirmation;

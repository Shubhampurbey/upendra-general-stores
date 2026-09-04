import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  MapPin, 
  Phone, 
  User, 
  ShoppingBag, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  CheckCircle2, 
  LocateFixed, 
  Store,
  Wallet,
  CreditCard,
  QrCode,
  Smartphone,
  ExternalLink,
  Lock,
  Copy,
  AlertCircle,
  RefreshCw,
  X,
  Check,
  Zap,
  Info
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { OrderService, PaymentService } from '../../api/services';
import { getProductImageUrl } from '../../utils/imageUrl';
import { loadRazorpayScript } from '../../utils/loadRazorpay';
import toast from 'react-hot-toast';

const SHOP_UPI_ID = '7050830610@ptsbi';
const SHOP_NAME = 'Upendra General Stores';

const Checkout = () => {
  const { items, subtotal, deliveryCharge, grandTotal, totalItemCount, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    customer_name: user?.full_name || '',
    customer_email: user?.email || '',
    customer_phone: user?.mobile || '',
    delivery_address: user?.address || '',
    village_area: user?.village_area || '',
    city: user?.city || 'Varanasi',
    state: 'Uttar Pradesh',
    pincode: user?.pincode || '221001',
    latitude: null,
    longitude: null,
    payment_method: 'upi', // Default to UPI as requested
    notes: '',
  });

  const [locating, setLocating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copiedVPA, setCopiedVPA] = useState(false);
  const [enteredUtr, setEnteredUtr] = useState('');
  const [showUtrField, setShowUtrField] = useState(false);

  // Active bill total based on delivery vs pickup
  const effectiveTotal = formData.payment_method === 'store_pickup' ? subtotal : grandTotal;
  
  // Standard NPCI Dynamic UPI URI Format:
  // upi://pay?pa=7050830610@ptsbi&pn=Upendra%20General%20Stores&am=<ORDER_AMOUNT>&cu=INR
  const dynamicUpiUrl = `upi://pay?pa=${SHOP_UPI_ID}&pn=${encodeURIComponent(SHOP_NAME)}&am=${Number(effectiveTotal).toFixed(2)}&cu=INR&tn=${encodeURIComponent('Upendra Store Grocery Order')}`;

  // App-specific intent URLs for mobile
  const appIntents = {
    gpay: `gpay://upi/pay?pa=${SHOP_UPI_ID}&pn=${encodeURIComponent(SHOP_NAME)}&am=${Number(effectiveTotal).toFixed(2)}&cu=INR&tn=${encodeURIComponent('Order Payment')}`,
    phonepe: `phonepe://upi/pay?pa=${SHOP_UPI_ID}&pn=${encodeURIComponent(SHOP_NAME)}&am=${Number(effectiveTotal).toFixed(2)}&cu=INR&tn=${encodeURIComponent('Order Payment')}`,
    paytm: `paytmmp://upi/pay?pa=${SHOP_UPI_ID}&pn=${encodeURIComponent(SHOP_NAME)}&am=${Number(effectiveTotal).toFixed(2)}&cu=INR&tn=${encodeURIComponent('Order Payment')}`,
    mobikwik: `mobikwik://upi/pay?pa=${SHOP_UPI_ID}&pn=${encodeURIComponent(SHOP_NAME)}&am=${Number(effectiveTotal).toFixed(2)}&cu=INR&tn=${encodeURIComponent('Order Payment')}`,
    universal: dynamicUpiUrl,
  };

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        customer_name: prev.customer_name || user.full_name,
        customer_email: prev.customer_email || user.email,
        customer_phone: prev.customer_phone || user.mobile,
        delivery_address: prev.delivery_address || user.address,
        village_area: prev.village_area || user.village_area,
        city: prev.city || user.city || 'Varanasi',
        pincode: prev.pincode || user.pincode || '221001',
      }));
    }
  }, [user]);

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="font-outfit font-bold text-2xl text-kirana-brown-dark">
          Your Cart is Empty
        </h2>
        <p className="text-xs text-kirana-brown-light">
          Please add items to your cart before proceeding to checkout.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 bg-kirana-orange text-white text-xs font-bold px-6 py-3 rounded-2xl"
        >
          Browse Groceries
        </Link>
      </div>
    );
  }

  // High Accuracy Geolocation & Reverse Geocoding
  const handleUseCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }

    setLocating(true);
    const toastId = toast.loading('Detecting your live GPS location...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const lat = parseFloat(latitude.toFixed(6));
        const lng = parseFloat(longitude.toFixed(6));

        let road = '';
        let village = '';
        let city = '';
        let pincode = '';

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
            {
              headers: {
                'Accept-Language': 'en-IN,en;q=0.9,hi;q=0.8',
              },
            }
          );
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            
            road = addr.road || addr.street || addr.neighbourhood || addr.suburb || data.display_name?.split(',')[0] || '';
            village = addr.neighbourhood || addr.suburb || addr.village || addr.residential || addr.county || '';
            city = addr.city || addr.town || addr.municipality || addr.state_district || 'Varanasi';
            pincode = addr.postcode || '';
          }
        } catch (e) {
          console.warn('Reverse geocoding fetch failed, falling back to coordinates:', e);
        }

        setFormData((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
          delivery_address: prev.delivery_address || road || `GPS Location (${lat}, ${lng})`,
          village_area: prev.village_area || village || '',
          city: prev.city || city || 'Varanasi',
          pincode: prev.pincode || pincode || '221001',
        }));

        setLocating(false);
        toast.success(`Live GPS Location attached! (Accuracy ~${Math.round(accuracy || 10)}m)`, { id: toastId });
      },
      (error) => {
        setLocating(false);
        console.error('Geo error:', error);
        toast.error('Could not detect location. Please grant location permission or type address.', { id: toastId });
      },
      { timeout: 15000, enableHighAccuracy: true, maximumAge: 0 }
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCopyUpiId = () => {
    navigator.clipboard.writeText(SHOP_UPI_ID);
    setCopiedVPA(true);
    toast.success('UPI ID copied successfully: 7050830610@ptsbi', { duration: 3500 });
    setTimeout(() => setCopiedVPA(false), 3000);
  };

  // Launch mobile UPI app deep-link
  const handleOpenUpiApp = (appName, intentUrl) => {
    // Open intent link on mobile devices
    window.location.href = intentUrl;
    toast(`Opening ${appName}... Complete ₹${effectiveTotal} payment & confirm below.`, {
      icon: '📱',
      duration: 5000
    });
    setShowUtrField(true);
  };

  // Main Checkout & Order Placement Handler
  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!formData.customer_name || !formData.customer_phone || !formData.delivery_address) {
      toast.error('Please fill in your name, phone number, and delivery address.');
      return;
    }

    try {
      setLoading(true);
      
      // Step 1: Create Order in Backend with initial "Pending" payment status
      const orderPayload = {
        ...formData,
        notes: enteredUtr ? `${formData.notes || ''} [UPI Ref/UTR: ${enteredUtr}]`.trim() : formData.notes,
        items: items.map((item) => ({
          product_id: item.product.id,
          product_name: item.product.name,
          category_name: item.product.category_name,
          quantity: item.quantity,
          unit: item.unit,
          unit_price: item.product.price,
          subtotal: item.subtotal,
          product_image: item.product.image,
        })),
      };

      const createdOrder = await OrderService.createOrder(orderPayload);

      // Flow A: CASH ON DELIVERY / STORE PICKUP
      if (formData.payment_method === 'cod' || formData.payment_method === 'store_pickup' || formData.payment_method === 'upi_cod') {
        clearCart();
        toast.success('Order Placed Successfully!');
        navigate(`/order-confirmation/${createdOrder.order_id}`, { state: { order: createdOrder } });
        return;
      }

      // Flow B: UPI SCAN & PAY / DIRECT UPI APPS with UTR submission
      if (formData.payment_method === 'upi' && enteredUtr) {
        clearCart();
        toast.success(`Order Placed! UPI Reference ${enteredUtr} recorded (Status: Pending Verification).`, { duration: 5000 });
        navigate(`/order-confirmation/${createdOrder.order_id}`, { state: { order: createdOrder } });
        return;
      }

      // Flow C: CARD / ONLINE GATEWAY PAYMENT or Instant UPI Gateway Verification
      if (formData.payment_method === 'card') {
        const isScriptLoaded = await loadRazorpayScript();
        if (!isScriptLoaded) {
          toast.error('Could not connect to payment gateway. Please try again.');
          setLoading(false);
          return;
        }

        const gatewayData = await PaymentService.createPaymentOrder(
          createdOrder.order_id, 
          formData.payment_method
        );

        const rzpOptions = {
          key: gatewayData.key_id,
          amount: gatewayData.amount,
          currency: gatewayData.currency || 'INR',
          name: SHOP_NAME,
          description: `Order #${createdOrder.order_id}`,
          order_id: gatewayData.gateway_order_id,
          prefill: {
            name: formData.customer_name,
            email: formData.customer_email || 'customer@upendrastore.in',
            contact: formData.customer_phone,
          },
          theme: {
            color: '#E85D04',
          },
          modal: {
            ondismiss: async () => {
              setLoading(false);
              await PaymentService.recordFailure(
                createdOrder.order_id, 
                'Payment window closed before completing transaction.'
              );
              toast.error('Payment was not completed. Order remains Pending in My Orders.', { duration: 4000 });
              navigate('/orders');
            },
          },
          handler: async (response) => {
            try {
              toast.loading('Verifying payment signature with backend...', { id: 'verify-toast' });
              
              const verifyResult = await PaymentService.verifyPayment({
                order_id: createdOrder.order_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              if (verifyResult.success) {
                clearCart();
                toast.success('Payment Verified! Order marked as PAID.', { id: 'verify-toast' });
                navigate(`/order-confirmation/${createdOrder.order_id}`, { 
                  state: { order: verifyResult.order } 
                });
              } else {
                toast.error(verifyResult.error || 'Payment verification failed.', { id: 'verify-toast' });
                navigate('/orders');
              }
            } catch (verifyErr) {
              console.error('Verification error:', verifyErr);
              toast.error(
                verifyErr.response?.data?.error || 'Payment verification failed on server.', 
                { id: 'verify-toast' }
              );
              navigate('/orders');
            } finally {
              setLoading(false);
            }
          },
        };

        const rzp = new window.Razorpay(rzpOptions);
        rzp.on('payment.failed', async (resp) => {
          setLoading(false);
          const errorDesc = resp.error?.description || 'Payment rejected by bank';
          await PaymentService.recordFailure(createdOrder.order_id, errorDesc);
          toast.error(`Payment Failed: ${errorDesc}`);
        });
        rzp.open();
        return;
      }

      // Default UPI flow: Order placed in Pending status, clearing cart and redirecting to confirmation with receipt
      clearCart();
      toast.success('UPI Order Placed! Please complete payment of exact amount.', { duration: 5000 });
      navigate(`/order-confirmation/${createdOrder.order_id}`, { state: { order: createdOrder } });

    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div>
        <span className="text-xs font-black text-kirana-orange uppercase tracking-wider">
          Fast & Safe Checkout
        </span>
        <h1 className="font-outfit font-black text-2xl sm:text-4xl text-kirana-brown-dark mt-1">
          Delivery Address & Payment
        </h1>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Address & Payment Selection */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. Customer Information */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-kirana-beige shadow-kirana space-y-4">
            <h3 className="font-outfit font-bold text-lg text-kirana-brown-dark flex items-center gap-2">
              <User className="w-5 h-5 text-kirana-orange" />
              <span>Customer Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-kirana-brown-dark uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="customer_name"
                  required
                  placeholder="e.g. Ramesh Chandra"
                  value={formData.customer_name}
                  onChange={handleChange}
                  className="w-full bg-kirana-sand/40 focus:bg-white border border-kirana-beige focus:border-kirana-orange rounded-2xl py-2.5 px-4 text-xs text-kirana-brown-dark outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-kirana-brown-dark uppercase tracking-wider mb-1.5">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  name="customer_phone"
                  required
                  placeholder="e.g. 9876543210"
                  value={formData.customer_phone}
                  onChange={handleChange}
                  className="w-full bg-kirana-sand/40 focus:bg-white border border-kirana-beige focus:border-kirana-orange rounded-2xl py-2.5 px-4 text-xs text-kirana-brown-dark outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-kirana-brown-dark uppercase tracking-wider mb-1.5">
                Email Address (Optional)
              </label>
              <input
                type="email"
                name="customer_email"
                placeholder="customer@gmail.com"
                value={formData.customer_email}
                onChange={handleChange}
                className="w-full bg-kirana-sand/40 focus:bg-white border border-kirana-beige focus:border-kirana-orange rounded-2xl py-2.5 px-4 text-xs text-kirana-brown-dark outline-none transition-all"
              />
            </div>
          </div>

          {/* 2. Delivery Location Section */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-kirana-beige shadow-kirana space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-kirana-sand pb-3">
              <div>
                <h3 className="font-outfit font-bold text-lg text-kirana-brown-dark flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-kirana-green" />
                  <span>Real Delivery Location</span>
                </h3>
                <p className="text-[11px] text-kirana-brown-muted">
                  Auto-detect GPS location or enter address for exact doorstep delivery
                </p>
              </div>

              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={locating}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white text-xs font-black px-4 py-2.5 rounded-2xl shadow-sm transition-all btn-press"
              >
                <LocateFixed className={`w-4 h-4 ${locating ? 'animate-spin' : ''}`} />
                <span>{locating ? 'Detecting Live GPS...' : '📍 Auto-Detect Live GPS'}</span>
              </button>
            </div>

            {formData.latitude ? (
              <div className="p-3.5 bg-emerald-50 text-emerald-900 text-xs rounded-2xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <span className="font-bold">📍 Real GPS Attached: ({formData.latitude}, {formData.longitude})</span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${formData.latitude},${formData.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:underline bg-emerald-100 px-2.5 py-1 rounded-xl"
                  >
                    <span>Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between text-xs text-amber-900">
                <span className="text-[11px]">
                  💡 <strong>Tip:</strong> Click "Auto-Detect Live GPS" to automatically link your exact doorstep location!
                </span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-kirana-brown-dark uppercase tracking-wider mb-1.5">
                House / Flat No. & Street Name *
              </label>
              <input
                type="text"
                name="delivery_address"
                required
                placeholder="e.g. House No. 45, Near Mahavir Chowk"
                value={formData.delivery_address}
                onChange={handleChange}
                className="w-full bg-kirana-sand/40 focus:bg-white border border-kirana-beige focus:border-kirana-orange rounded-2xl py-2.5 px-4 text-xs text-kirana-brown-dark outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-kirana-brown-dark uppercase tracking-wider mb-1.5">
                  Village / Area
                </label>
                <input
                  type="text"
                  name="village_area"
                  placeholder="e.g. Ganguli"
                  value={formData.village_area}
                  onChange={handleChange}
                  className="w-full bg-kirana-sand/40 focus:bg-white border border-kirana-beige rounded-2xl py-2.5 px-3 text-xs text-kirana-brown-dark outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-kirana-brown-dark uppercase tracking-wider mb-1.5">
                  City / Town
                </label>
                <input
                  type="text"
                  name="city"
                  placeholder="Varanasi"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full bg-kirana-sand/40 focus:bg-white border border-kirana-beige rounded-2xl py-2.5 px-3 text-xs text-kirana-brown-dark outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-kirana-brown-dark uppercase tracking-wider mb-1.5">
                  PIN Code
                </label>
                <input
                  type="text"
                  name="pincode"
                  placeholder="221001"
                  value={formData.pincode}
                  onChange={handleChange}
                  className="w-full bg-kirana-sand/40 focus:bg-white border border-kirana-beige rounded-2xl py-2.5 px-3 text-xs text-kirana-brown-dark outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-kirana-brown-dark uppercase tracking-wider mb-1.5">
                Delivery Instructions (Optional)
              </label>
              <input
                type="text"
                name="notes"
                placeholder="e.g. Please ring doorbell twice"
                value={formData.notes}
                onChange={handleChange}
                className="w-full bg-kirana-sand/40 focus:bg-white border border-kirana-beige rounded-2xl py-2.5 px-4 text-xs text-kirana-brown-dark outline-none"
              />
            </div>
          </div>

          {/* 3. Comprehensive Payment Methods Section */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-kirana-beige shadow-kirana space-y-5">
            <div className="flex items-center justify-between border-b border-kirana-sand pb-3">
              <div>
                <h3 className="font-outfit font-bold text-lg text-kirana-brown-dark flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-kirana-orange" />
                  <span>Choose Payment Method</span>
                </h3>
                <p className="text-[11px] text-kirana-brown-muted">
                  Select your preferred mode of payment
                </p>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                <Lock className="w-3 h-3 text-emerald-600" />
                <span>100% Secure & Verified</span>
              </div>
            </div>

            {/* Payment Method Cards */}
            <div className="space-y-3.5">
              
              {/* Option 1: UPI (Scan & Pay / UPI Apps) */}
              <div className={`rounded-2xl border-2 transition-all overflow-hidden ${
                formData.payment_method === 'upi' ? 'border-kirana-orange bg-kirana-orange-soft/20 shadow-md' : 'border-kirana-beige hover:bg-kirana-sand/20'
              }`}>
                <label className="flex items-start gap-3.5 p-4 cursor-pointer">
                  <input
                    type="radio"
                    name="payment_method"
                    value="upi"
                    checked={formData.payment_method === 'upi'}
                    onChange={handleChange}
                    className="mt-1 text-kirana-orange focus:ring-kirana-orange"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-kirana-brown-dark flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-kirana-orange fill-kirana-orange" />
                        <span>UPI Payment (Dynamic QR & Direct UPI Apps)</span>
                      </span>
                      <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-md border border-emerald-300">
                        Instant & Zero Fee
                      </span>
                    </div>
                    <span className="text-[11px] text-kirana-brown-light block mt-1">
                      Scan the dynamic QR code or pay using GPay, PhonePe, Paytm, MobiKwik to <strong>{SHOP_UPI_ID}</strong>.
                    </span>
                  </div>
                </label>

                {/* Expanded UPI Interface */}
                {formData.payment_method === 'upi' && (
                  <div className="p-5 sm:p-6 bg-white border-t border-kirana-beige space-y-6 animate-fadeIn">
                    
                    {/* Pay Exact Amount Banner */}
                    <div className="p-3.5 bg-gradient-to-r from-kirana-sand to-amber-50 rounded-2xl border border-kirana-beige flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-kirana-orange text-white flex items-center justify-center font-bold text-xs shadow-sm">
                          ₹
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-extrabold text-kirana-brown-muted block">Order Total</span>
                          <span className="font-outfit font-black text-base text-kirana-green">Pay exactly ₹{effectiveTotal}</span>
                        </div>
                      </div>
                      <span className="text-[11px] text-kirana-brown-dark font-semibold bg-white/80 px-3 py-1.5 rounded-xl border border-kirana-beige text-center">
                        Payee: <strong>{SHOP_NAME}</strong>
                      </span>
                    </div>

                    {/* Scan & Pay QR Section */}
                    <div className="bg-kirana-sand/30 p-5 rounded-3xl border border-kirana-beige text-center space-y-3.5">
                      <div className="flex items-center justify-center gap-1.5">
                        <QrCode className="w-4 h-4 text-kirana-orange" />
                        <span className="font-outfit font-black text-xs text-kirana-brown-dark uppercase tracking-wider">
                          Scan & Pay
                        </span>
                      </div>

                      {/* Crisp Dynamic QR Code */}
                      <div className="inline-block p-4 bg-white rounded-3xl shadow-md border-2 border-kirana-beige">
                        <QRCodeSVG 
                          value={dynamicUpiUrl} 
                          size={180} 
                          level="H" 
                          includeMargin={false}
                        />
                      </div>

                      {/* Payee UPI ID display & One-Click Copy */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-center gap-2">
                          <div className="font-mono font-black text-xs text-kirana-brown-dark bg-white px-4 py-2 rounded-2xl border border-kirana-beige shadow-sm flex items-center gap-2">
                            <span className="text-kirana-brown-muted font-normal text-[11px]">UPI ID:</span>
                            <span className="text-kirana-orange">{SHOP_UPI_ID}</span>
                          </div>
                          <button
                            type="button"
                            onClick={handleCopyUpiId}
                            className={`px-3.5 py-2 rounded-2xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm ${
                              copiedVPA 
                                ? 'bg-emerald-600 text-white' 
                                : 'bg-kirana-orange hover:bg-kirana-orange-dark text-white'
                            }`}
                          >
                            {copiedVPA ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedVPA ? 'Copied!' : 'Copy UPI ID'}</span>
                          </button>
                        </div>
                        <p className="text-[11px] text-kirana-brown-muted">
                          Scan using Google Pay, PhonePe, Paytm, BHIM, Cred, MobiKwik or any banking scanner.
                        </p>
                      </div>
                    </div>

                    {/* Pay using UPI App Buttons */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-2">
                        <span className="h-px bg-kirana-beige flex-1"></span>
                        <span className="text-xs font-bold text-kirana-brown-dark uppercase tracking-wider">
                          Or Pay using UPI App
                        </span>
                        <span className="h-px bg-kirana-beige flex-1"></span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {/* Google Pay */}
                        <button
                          type="button"
                          onClick={() => handleOpenUpiApp('Google Pay', appIntents.gpay)}
                          className="p-3 bg-white hover:bg-kirana-sand/50 border border-kirana-beige rounded-2xl text-center space-y-1.5 transition-all hover:border-kirana-orange shadow-sm btn-press group"
                        >
                          <div className="w-8 h-8 mx-auto rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs group-hover:scale-110 transition-transform">
                            G
                          </div>
                          <span className="font-bold text-[11px] text-kirana-brown-dark block">Google Pay</span>
                          <span className="text-[9px] text-emerald-600 font-bold block">Open App ↗</span>
                        </button>

                        {/* PhonePe */}
                        <button
                          type="button"
                          onClick={() => handleOpenUpiApp('PhonePe', appIntents.phonepe)}
                          className="p-3 bg-white hover:bg-kirana-sand/50 border border-kirana-beige rounded-2xl text-center space-y-1.5 transition-all hover:border-kirana-orange shadow-sm btn-press group"
                        >
                          <div className="w-8 h-8 mx-auto rounded-full bg-purple-50 text-purple-700 flex items-center justify-center font-black text-xs group-hover:scale-110 transition-transform">
                            Pe
                          </div>
                          <span className="font-bold text-[11px] text-kirana-brown-dark block">PhonePe</span>
                          <span className="text-[9px] text-emerald-600 font-bold block">Open App ↗</span>
                        </button>

                        {/* Paytm */}
                        <button
                          type="button"
                          onClick={() => handleOpenUpiApp('Paytm', appIntents.paytm)}
                          className="p-3 bg-white hover:bg-kirana-sand/50 border border-kirana-beige rounded-2xl text-center space-y-1.5 transition-all hover:border-kirana-orange shadow-sm btn-press group"
                        >
                          <div className="w-8 h-8 mx-auto rounded-full bg-sky-50 text-sky-600 flex items-center justify-center font-black text-xs group-hover:scale-110 transition-transform">
                            Pay
                          </div>
                          <span className="font-bold text-[11px] text-kirana-brown-dark block">Paytm</span>
                          <span className="text-[9px] text-emerald-600 font-bold block">Open App ↗</span>
                        </button>

                        {/* MobiKwik / Other */}
                        <button
                          type="button"
                          onClick={() => handleOpenUpiApp('MobiKwik', appIntents.mobikwik)}
                          className="p-3 bg-white hover:bg-kirana-sand/50 border border-kirana-beige rounded-2xl text-center space-y-1.5 transition-all hover:border-kirana-orange shadow-sm btn-press group"
                        >
                          <div className="w-8 h-8 mx-auto rounded-full bg-amber-50 text-amber-700 flex items-center justify-center font-black text-xs group-hover:scale-110 transition-transform">
                            M
                          </div>
                          <span className="font-bold text-[11px] text-kirana-brown-dark block">MobiKwik</span>
                          <span className="text-[9px] text-emerald-600 font-bold block">Open App ↗</span>
                        </button>
                      </div>

                      {/* Universal UPI App launcher */}
                      <button
                        type="button"
                        onClick={() => handleOpenUpiApp('Your UPI App', appIntents.universal)}
                        className="w-full py-2.5 px-4 rounded-2xl bg-kirana-sand hover:bg-kirana-beige border border-kirana-beige text-kirana-brown-dark text-xs font-bold flex items-center justify-center gap-2 transition-all btn-press"
                      >
                        <Smartphone className="w-4 h-4 text-kirana-orange" />
                        <span>Pay using Any Other Supported UPI App (BHIM, Cred, Banking Apps)</span>
                      </button>
                    </div>

                    {/* UTR / Transaction ID Entry Field (Optional for instant matching) */}
                    <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                          <span>📝 12-Digit UPI Ref / UTR Number (Optional)</span>
                        </label>
                        <span className="text-[10px] text-emerald-800 font-medium">Faster Fulfillment</span>
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. 423589123456 (from GPay / PhonePe / Paytm receipt)"
                        value={enteredUtr}
                        onChange={(e) => setEnteredUtr(e.target.value)}
                        className="w-full bg-white border border-emerald-300 focus:border-emerald-600 rounded-xl py-2 px-3 text-xs text-kirana-brown-dark outline-none font-mono"
                      />
                      <p className="text-[10px] text-emerald-800">
                        After transferring to <strong>{SHOP_UPI_ID}</strong>, enter the 12-digit UTR from your UPI app receipt to attach to your order.
                      </p>
                    </div>

                  </div>
                )}
              </div>

              {/* Option 2: Cash on Delivery */}
              <label className={`flex items-start gap-3.5 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                formData.payment_method === 'cod' ? 'border-kirana-orange bg-kirana-orange-soft/30 shadow-sm' : 'border-kirana-beige hover:bg-kirana-sand/30'
              }`}>
                <input
                  type="radio"
                  name="payment_method"
                  value="cod"
                  checked={formData.payment_method === 'cod'}
                  onChange={handleChange}
                  className="mt-1 text-kirana-orange focus:ring-kirana-orange"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-kirana-brown-dark flex items-center gap-1.5">
                      <span>💵 Cash on Delivery (COD)</span>
                    </span>
                    <span className="text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
                      Pay at Doorstep
                    </span>
                  </div>
                  <span className="text-[11px] text-kirana-brown-light block mt-1">
                    Pay with cash when our delivery person delivers your fresh grocery package.
                  </span>
                </div>
              </label>

              {/* Option 3: Card Payment */}
              <div className={`rounded-2xl border-2 transition-all overflow-hidden ${
                formData.payment_method === 'card' ? 'border-kirana-orange bg-kirana-orange-soft/20 shadow-sm' : 'border-kirana-beige'
              }`}>
                <label className="flex items-start gap-3.5 p-4 cursor-pointer">
                  <input
                    type="radio"
                    name="payment_method"
                    value="card"
                    checked={formData.payment_method === 'card'}
                    onChange={handleChange}
                    className="mt-1 text-kirana-orange focus:ring-kirana-orange"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-kirana-brown-dark flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-kirana-orange" />
                        <span>Credit / Debit Card</span>
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">Visa</span>
                        <span className="text-[9px] font-bold bg-red-100 text-red-800 px-1.5 py-0.5 rounded">Mastercard</span>
                        <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">RuPay</span>
                      </div>
                    </div>
                    <span className="text-[11px] text-kirana-brown-light block mt-1">
                      Pay securely with Visa, Mastercard, RuPay, Maestro via PCI-DSS compliant gateway.
                    </span>
                  </div>
                </label>

                {formData.payment_method === 'card' && (
                  <div className="p-5 bg-white border-t border-kirana-beige/70 space-y-3 animate-fadeIn">
                    <div className="bg-kirana-sand/40 p-4 rounded-2xl border border-kirana-beige space-y-2">
                      <div className="flex items-center gap-2 text-kirana-brown-dark font-bold text-xs">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>PCI-DSS Level 1 Encrypted Checkout</span>
                      </div>
                      <p className="text-[11px] text-kirana-brown-light leading-relaxed">
                        For maximum financial security, your card details are processed directly through the certified payment gateway with RBI 3D-Secure OTP. We never store card details.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Option 4: Store Pickup */}
              <label className={`flex items-start gap-3.5 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                formData.payment_method === 'store_pickup' ? 'border-kirana-orange bg-kirana-orange-soft/30 shadow-sm' : 'border-kirana-beige hover:bg-kirana-sand/30'
              }`}>
                <input
                  type="radio"
                  name="payment_method"
                  value="store_pickup"
                  checked={formData.payment_method === 'store_pickup'}
                  onChange={handleChange}
                  className="mt-1 text-kirana-orange focus:ring-kirana-orange"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-kirana-brown-dark flex items-center gap-1.5">
                      <Store className="w-4 h-4 text-kirana-brown-dark" />
                      <span>🏬 Pay at Store / Self Pickup</span>
                    </span>
                    <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                      Free Delivery
                    </span>
                  </div>
                  <span className="text-[11px] text-kirana-brown-light block mt-1">
                    We pack your items in advance; you collect and pay cash/UPI at the store counter.
                  </span>
                </div>
              </label>

            </div>
          </div>

        </div>

        {/* Right Column: Order Summary & Place Order */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-kirana-beige shadow-kirana space-y-5 sticky top-24">
            <h3 className="font-outfit font-black text-lg text-kirana-brown-dark border-b border-kirana-sand pb-3">
              Order Items ({totalItemCount})
            </h3>

            {/* List of items */}
            <div className="divide-y divide-kirana-sand/80 max-h-60 overflow-y-auto pr-1 space-y-2">
              {items.map((item) => (
                <div key={item.id} className="pt-2 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={getProductImageUrl(item.product?.image)}
                      alt={item.product?.name}
                      className="w-10 h-10 object-cover rounded-lg border border-kirana-beige flex-shrink-0"
                      onError={(e) => {
                        e.target.src = '/assets/images/spices.jpg';
                      }}
                    />
                    <div className="truncate">
                      <h4 className="font-bold text-kirana-brown-dark truncate">
                        {item.product?.name}
                      </h4>
                      <span className="text-[11px] text-kirana-brown-light">
                        {item.quantity} {item.unit}
                      </span>
                    </div>
                  </div>
                  <span className="font-outfit font-bold text-kirana-green">
                    ₹{item.subtotal}
                  </span>
                </div>
              ))}
            </div>

            {/* Bill Details */}
            <div className="pt-3 border-t border-kirana-sand space-y-2 text-xs">
              <div className="flex justify-between text-kirana-brown-light">
                <span>Items Subtotal:</span>
                <span className="font-bold text-kirana-brown-dark">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-kirana-brown-light">
                <span>Delivery Fee:</span>
                {deliveryCharge === 0 || formData.payment_method === 'store_pickup' ? (
                  <span className="font-bold text-emerald-600">FREE</span>
                ) : (
                  <span className="font-bold text-kirana-brown-dark">₹{deliveryCharge}</span>
                )}
              </div>
              <div className="pt-3 border-t border-kirana-beige flex justify-between items-baseline">
                <span className="font-outfit font-bold text-base text-kirana-brown-dark">Grand Total:</span>
                <span className="font-outfit font-black text-2xl text-kirana-green">
                  ₹{effectiveTotal}
                </span>
              </div>
            </div>

            {/* Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-kirana-orange to-kirana-orange-dark hover:from-kirana-orange-dark hover:to-kirana-orange text-white text-xs sm:text-sm font-black tracking-wide shadow-lg shadow-kirana-orange/30 flex items-center justify-center gap-2 transition-all btn-press disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing Order...</span>
                </div>
              ) : (
                <>
                  <span>
                    {formData.payment_method === 'cod' || formData.payment_method === 'store_pickup' 
                      ? 'Confirm & Place Order' 
                      : formData.payment_method === 'upi'
                      ? `Confirm UPI Order (₹${effectiveTotal})`
                      : `Proceed to Pay ₹${effectiveTotal}`}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="p-3 bg-kirana-cream rounded-2xl border border-kirana-beige flex items-center gap-2.5 text-[11px] text-kirana-brown-light">
              <ShieldCheck className="w-4 h-4 text-kirana-green flex-shrink-0" />
              <span>Upendra General Stores guarantees authentic billing and fresh grocery packing.</span>
            </div>
          </div>
        </div>

      </form>

    </div>
  );
};

export default Checkout;

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Trash2, Plus, Minus, Truck, Sparkles, ArrowLeft } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { getProductImageUrl } from '../../utils/imageUrl';

const CartPage = () => {
  const {
    items,
    subtotal,
    deliveryCharge,
    grandTotal,
    totalItemCount,
    deliveryThreshold,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  const navigate = useNavigate();

  const freeDeliveryRemaining = Math.max(0, deliveryThreshold - subtotal);
  const progressPercent = Math.min(100, (subtotal / deliveryThreshold) * 100);

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-20 h-20 mx-auto rounded-full bg-kirana-sand flex items-center justify-center text-kirana-brown-muted">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="font-outfit font-bold text-2xl text-kirana-brown-dark">
          Your Grocery Cart is Empty
        </h2>
        <p className="text-xs text-kirana-brown-light max-w-sm mx-auto">
          You haven't added any spices, dals or grocery items to your bag yet.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 bg-kirana-orange hover:bg-kirana-orange-dark text-white text-xs font-bold px-6 py-3 rounded-2xl shadow-md transition-all"
        >
          <span>Browse Groceries</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-black text-kirana-orange uppercase tracking-wider">
            Review Your Order
          </span>
          <h1 className="font-outfit font-black text-2xl sm:text-3xl text-kirana-brown-dark">
            Shopping Cart ({totalItemCount} {totalItemCount === 1 ? 'item' : 'items'})
          </h1>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Items List */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Free Delivery Bar */}
          <div className="bg-white p-4 rounded-2xl border border-kirana-beige shadow-sm">
            {freeDeliveryRemaining > 0 ? (
              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-1.5 text-kirana-orange-dark">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-kirana-orange" />
                    Add ₹{freeDeliveryRemaining.toFixed(2)} more for FREE Home Delivery
                  </span>
                  <span>{Math.round(progressPercent)}%</span>
                </div>
                <div className="w-full h-2.5 bg-kirana-sand rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-kirana-orange to-kirana-mustard rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>🎉 You qualify for <strong>FREE Local Doorstep Delivery</strong>!</span>
              </div>
            )}
          </div>

          {/* Table / List of items */}
          <div className="bg-white rounded-3xl border border-kirana-beige shadow-kirana divide-y divide-kirana-sand">
            {items.map((item) => {
              const isGram = item.unit === 'g';
              const step = isGram ? 50 : 1;

              return (
                <div key={item.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <img
                      src={getProductImageUrl(item.product?.image)}
                      alt={item.product?.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-2xl border border-kirana-beige flex-shrink-0"
                      onError={(e) => {
                        e.target.src = '/assets/images/spices.jpg';
                      }}
                    />
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-kirana-orange">
                        {item.product?.category_name}
                      </span>
                      <h3 className="font-outfit font-bold text-base text-kirana-brown-dark">
                        {item.product?.name}
                      </h3>
                      {item.product?.hindi_name && (
                        <p className="text-xs font-hindi text-kirana-brown-light font-medium">
                          {item.product.hindi_name}
                        </p>
                      )}
                      <p className="text-xs text-kirana-green font-semibold mt-1">
                        Base: ₹{item.product?.price} / {item.product?.unit}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                    {/* Stepper */}
                    <div className="flex items-center bg-kirana-sand rounded-2xl p-1 border border-kirana-beige">
                      <button
                        onClick={() => updateQuantity(item.id, Math.max(0, parseFloat(item.quantity) - step))}
                        className="w-8 h-8 rounded-xl bg-white text-kirana-brown-dark hover:bg-kirana-beige flex items-center justify-center font-bold text-xs transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-black text-kirana-brown-dark min-w-[50px] text-center">
                        {item.quantity} {item.unit}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, parseFloat(item.quantity) + step)}
                        className="w-8 h-8 rounded-xl bg-white text-kirana-brown-dark hover:bg-kirana-beige flex items-center justify-center font-bold text-xs transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Subtotal */}
                    <div className="text-right min-w-[70px]">
                      <span className="font-outfit font-black text-lg text-kirana-green block">
                        ₹{item.subtotal}
                      </span>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-kirana-brown-muted hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-kirana-orange hover:underline pt-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Add more grocery items</span>
          </Link>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-3xl p-6 border border-kirana-beige shadow-kirana space-y-4 sticky top-24">
            <h3 className="font-outfit font-black text-lg text-kirana-brown-dark border-b border-kirana-sand pb-3">
              Order Bill Summary
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-kirana-brown-light">
                <span>Items Subtotal ({totalItemCount} items):</span>
                <span className="font-bold text-kirana-brown-dark">₹{subtotal}</span>
              </div>

              <div className="flex justify-between text-kirana-brown-light">
                <span>Delivery Charge:</span>
                {deliveryCharge === 0 ? (
                  <span className="font-bold text-emerald-600">FREE</span>
                ) : (
                  <span className="font-bold text-kirana-brown-dark">₹{deliveryCharge}</span>
                )}
              </div>

              <div className="pt-3 border-t border-kirana-beige flex justify-between items-baseline">
                <span className="font-outfit font-bold text-sm text-kirana-brown-dark">Grand Total:</span>
                <span className="font-outfit font-black text-2xl text-kirana-green">₹{grandTotal}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-kirana-orange to-kirana-orange-dark hover:from-kirana-orange-dark hover:to-kirana-orange text-white text-xs sm:text-sm font-black tracking-wide shadow-lg shadow-kirana-orange/30 flex items-center justify-center gap-2 transition-all btn-press"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-[11px] text-kirana-brown-muted text-center leading-relaxed">
              Safe & Contactless Local Delivery • Cash on Delivery / UPI Supported
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default CartPage;

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Sparkles, Truck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { getProductImageUrl } from '../../utils/imageUrl';

const CartDrawer = () => {
  const {
    items,
    subtotal,
    deliveryCharge,
    grandTotal,
    totalItemCount,
    deliveryThreshold,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const freeDeliveryRemaining = Math.max(0, deliveryThreshold - subtotal);
  const progressPercent = Math.min(100, (subtotal / deliveryThreshold) * 100);

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-kirana-brown-dark/60 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-kirana-beige animate-in slide-in-from-right duration-300">
          
          {/* 1. Header */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-kirana-sand via-white to-kirana-sand border-b border-kirana-beige flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-kirana-orange text-white flex items-center justify-center font-bold">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-outfit font-black text-lg text-kirana-brown-dark">
                  Your Grocery Cart
                </h2>
                <span className="text-xs text-kirana-brown-muted">
                  {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'} selected
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-full hover:bg-kirana-sand text-kirana-brown-muted hover:text-kirana-brown-dark transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 2. Free Delivery Goal Tracker */}
          <div className="bg-kirana-cream px-4 py-3 border-b border-kirana-beige">
            {freeDeliveryRemaining > 0 ? (
              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                  <span className="text-kirana-orange-dark flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-kirana-orange" />
                    Add <strong>₹{freeDeliveryRemaining.toFixed(2)}</strong> more for <strong>FREE Delivery</strong>
                  </span>
                  <span className="text-kirana-brown-muted">{Math.round(progressPercent)}%</span>
                </div>
                <div className="w-full h-2 bg-kirana-beige rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-kirana-orange to-kirana-mustard rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>🎉 Congratulations! You unlocked <strong>FREE Delivery</strong></span>
              </div>
            )}
          </div>

          {/* 3. Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {items.length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-kirana-sand flex items-center justify-center text-kirana-brown-muted">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="font-outfit font-bold text-lg text-kirana-brown-dark">
                    Your cart is empty
                  </h3>
                  <p className="text-xs text-kirana-brown-light max-w-xs mx-auto mt-1">
                    Looks like you haven't added your daily groceries yet. Browse our pure spices, dals, and snacks!
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/products');
                  }}
                  className="inline-flex items-center gap-2 bg-kirana-orange hover:bg-kirana-orange-dark text-white text-xs font-bold px-6 py-2.5 rounded-full shadow-md transition-all"
                >
                  Browse Groceries →
                </button>
              </div>
            ) : (
              items.map((item) => {
                const isGram = item.unit === 'g';
                const step = isGram ? 50 : 1;

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-kirana-beige/90 p-3 shadow-sm hover:shadow-md transition-shadow flex items-center gap-3"
                  >
                    <img
                      src={getProductImageUrl(item.product?.image)}
                      alt={item.product?.name}
                      className="w-16 h-16 object-cover rounded-xl border border-kirana-beige flex-shrink-0"
                      onError={(e) => {
                        e.target.src = '/assets/images/spices.jpg';
                      }}
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="font-outfit font-bold text-sm text-kirana-brown-dark truncate">
                        {item.product?.name}
                      </h4>
                      <p className="text-xs text-kirana-brown-light">
                        {item.quantity} {item.unit} • ₹{item.product?.price}/{item.product?.unit}
                      </p>

                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity Stepper */}
                        <div className="flex items-center bg-kirana-sand rounded-xl p-0.5 border border-kirana-beige">
                          <button
                            onClick={() => updateQuantity(item.id, Math.max(0, parseFloat(item.quantity) - step))}
                            className="w-6 h-6 rounded-lg bg-white text-kirana-brown-dark hover:bg-kirana-beige flex items-center justify-center text-xs font-bold transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-black text-kirana-brown-dark min-w-[36px] text-center">
                            {item.quantity}
                            <span className="text-[10px] text-kirana-brown-muted font-medium ml-0.5">{item.unit}</span>
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, parseFloat(item.quantity) + step)}
                            className="w-6 h-6 rounded-lg bg-white text-kirana-brown-dark hover:bg-kirana-beige flex items-center justify-center text-xs font-bold transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Subtotal */}
                        <span className="font-outfit font-black text-sm text-kirana-green">
                          ₹{item.subtotal}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1.5 text-kirana-brown-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* 4. Footer & Checkout CTA */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 bg-kirana-sand/40 border-t border-kirana-beige space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-kirana-brown-light">
                  <span>Item Subtotal:</span>
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
                <div className="pt-2 border-t border-kirana-beige flex justify-between items-baseline">
                  <span className="font-outfit font-bold text-sm text-kirana-brown-dark">Total Amount:</span>
                  <span className="font-outfit font-black text-xl text-kirana-green">₹{grandTotal}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={clearCart}
                  className="py-3 px-3 rounded-2xl border border-kirana-beige hover:bg-white text-xs font-bold text-kirana-brown-muted hover:text-red-600 transition-colors"
                  title="Empty Cart"
                >
                  Clear
                </button>
                <button
                  onClick={handleCheckoutClick}
                  className="flex-1 py-3 px-6 rounded-2xl bg-gradient-to-r from-kirana-orange to-kirana-orange-dark hover:from-kirana-orange-dark hover:to-kirana-orange text-white text-xs sm:text-sm font-black tracking-wide shadow-md shadow-kirana-orange/30 flex items-center justify-center gap-2 transition-all btn-press"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CartDrawer;

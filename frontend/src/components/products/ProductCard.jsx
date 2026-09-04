import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ShoppingBag, Sparkles, Scale } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { getProductImageUrl } from '../../utils/imageUrl';
import CustomQuantityModal from './CustomQuantityModal';

const ProductCard = ({ product }) => {
  const { addToCart, items } = useCart();
  const [modalOpen, setModalOpen] = useState(false);

  const isWeightProduct = product.unit === 'kg' || product.unit === 'g';
  const isOutOfStock = !product.is_available || parseFloat(product.stock_quantity) <= 0;

  // Check if item is already in cart
  const cartItem = items.find((i) => i.product.id === product.id);

  // Quick 1-click add default
  const handleQuickAdd = (e, qty, unit) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, qty, unit);
  };

  return (
    <>
      <div className="bg-white rounded-3xl border border-kirana-beige/80 p-3.5 sm:p-4 shadow-kirana hover:shadow-kirana-lg transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
        
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-2">
          {product.badge ? (
            <span className="bg-gradient-to-r from-amber-500 to-kirana-orange text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-sm">
              {product.badge}
            </span>
          ) : (
            <span className="text-[10px] font-bold text-kirana-brown-muted uppercase tracking-wider">
              {product.category_name}
            </span>
          )}

          {isOutOfStock ? (
            <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
              Out of Stock
            </span>
          ) : (
            <span className="text-[10px] font-semibold text-kirana-green flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> In Stock
            </span>
          )}
        </div>

        {/* Product Image Link */}
        <Link to={`/products/${product.id}`} className="block relative mb-3 overflow-hidden rounded-2xl bg-kirana-sand/40 aspect-square">
          <img
            src={getProductImageUrl(product.image)}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.src = '/assets/images/spices.jpg';
            }}
          />
        </Link>

        {/* Product Info */}
        <div className="flex-1 mb-3">
          <Link to={`/products/${product.id}`} className="block group-hover:text-kirana-orange transition-colors">
            <h3 className="font-outfit font-bold text-sm sm:text-base text-kirana-brown-dark line-clamp-1 leading-snug">
              {product.name}
            </h3>
            {product.hindi_name && (
              <p className="text-xs text-kirana-brown-light font-medium font-hindi line-clamp-1 mt-0.5">
                {product.hindi_name}
              </p>
            )}
          </Link>
          <p className="text-[11px] text-kirana-brown-muted line-clamp-2 mt-1 leading-relaxed">
            {product.description || 'Pure quality authentic Indian kirana product.'}
          </p>
        </div>

        {/* Pricing & Action */}
        <div>
          {/* Price display */}
          <div className="flex items-baseline justify-between mb-3 pt-2 border-t border-kirana-sand/80">
            <div>
              <span className="font-outfit font-black text-lg sm:text-xl text-kirana-green">
                ₹{product.price}
              </span>
              <span className="text-xs text-kirana-brown-muted font-medium ml-1">
                / {product.unit}
              </span>
            </div>
            {isWeightProduct && (
              <span className="text-[10px] text-kirana-orange font-bold bg-kirana-orange/10 px-2 py-0.5 rounded-md">
                Custom Qty
              </span>
            )}
          </div>

          {/* Quick Selection Chips for Weight items */}
          {isWeightProduct && !isOutOfStock && (
            <div className="grid grid-cols-4 gap-1 mb-2">
              <button
                type="button"
                onClick={(e) => handleQuickAdd(e, 100, 'g')}
                className="text-[10px] font-bold py-1 bg-kirana-sand/70 hover:bg-kirana-orange hover:text-white rounded-lg border border-kirana-beige transition-colors text-center"
                title="Add 100g"
              >
                100g
              </button>
              <button
                type="button"
                onClick={(e) => handleQuickAdd(e, 250, 'g')}
                className="text-[10px] font-bold py-1 bg-kirana-sand/70 hover:bg-kirana-orange hover:text-white rounded-lg border border-kirana-beige transition-colors text-center"
                title="Add 250g (पाव)"
              >
                250g
              </button>
              <button
                type="button"
                onClick={(e) => handleQuickAdd(e, 500, 'g')}
                className="text-[10px] font-bold py-1 bg-kirana-sand/70 hover:bg-kirana-orange hover:text-white rounded-lg border border-kirana-beige transition-colors text-center"
                title="Add 500g (आधा किलो)"
              >
                500g
              </button>
              <button
                type="button"
                onClick={(e) => handleQuickAdd(e, 1, 'kg')}
                className="text-[10px] font-bold py-1 bg-kirana-sand/70 hover:bg-kirana-orange hover:text-white rounded-lg border border-kirana-beige transition-colors text-center"
                title="Add 1kg"
              >
                1kg
              </button>
            </div>
          )}

          {/* Main Action Button */}
          {isOutOfStock ? (
            <button
              disabled
              className="w-full py-2.5 rounded-2xl bg-gray-100 text-gray-400 text-xs font-bold cursor-not-allowed text-center"
            >
              Unavailable
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-kirana-green to-kirana-green-dark hover:from-kirana-orange hover:to-kirana-orange-dark text-white text-xs font-bold shadow-sm transition-all duration-300 flex items-center justify-center gap-1.5 btn-press group"
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
              <span>{isWeightProduct ? 'Choose Quantity & Add' : 'Add to Cart'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Custom Quantity Modal */}
      <CustomQuantityModal
        product={product}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
};

export default ProductCard;

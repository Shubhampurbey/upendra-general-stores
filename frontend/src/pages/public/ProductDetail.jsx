import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  Scale, 
  HeartHandshake, 
  CheckCircle2, 
  Plus, 
  Minus 
} from 'lucide-react';
import { ProductService } from '../../api/services';
import { useCart } from '../../context/CartContext';
import { getProductImageUrl } from '../../utils/imageUrl';
import ProductCard from '../../components/products/ProductCard';

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart, calculateItemPrice } = useCart();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Custom Quantity States
  const [selectedUnit, setSelectedUnit] = useState('g');
  const [quantity, setQuantity] = useState(250);
  const [customInput, setCustomInput] = useState('250');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await ProductService.getById(id);
        setProduct(data);
        
        const isWeight = data.unit === 'kg' || data.unit === 'g';
        setSelectedUnit(isWeight ? 'g' : data.unit);
        setQuantity(isWeight ? 250 : 1);
        setCustomInput(isWeight ? '250' : '1');

        // Fetch related products
        if (data.category) {
          const related = await ProductService.getAll({ category: data.category });
          setRelatedProducts(related.filter((p) => p.id !== data.id).slice(0, 4));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-kirana-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-xs text-kirana-brown-light">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-kirana-brown-dark">Product Not Found</h2>
        <Link to="/products" className="text-xs font-bold text-kirana-orange hover:underline mt-2 inline-block">
          ← Return to All Groceries
        </Link>
      </div>
    );
  }

  const isWeightProduct = product.unit === 'kg' || product.unit === 'g';
  const isOutOfStock = !product.is_available || parseFloat(product.stock_quantity) <= 0;

  const weightPresets = [
    { label: '50g', qty: 50, unit: 'g' },
    { label: '100g', qty: 100, unit: 'g' },
    { label: '250g (पाव)', qty: 250, unit: 'g' },
    { label: '500g (आधा किलो)', qty: 500, unit: 'g' },
    { label: '1 kg', qty: 1, unit: 'kg' },
    { label: '2 kg', qty: 2, unit: 'kg' },
    { label: '5 kg', qty: 5, unit: 'kg' },
  ];

  const piecePresets = [
    { label: '1 Packet', qty: 1, unit: product.unit },
    { label: '2 Packets', qty: 2, unit: product.unit },
    { label: '3 Packets', qty: 3, unit: product.unit },
    { label: '5 Packets', qty: 5, unit: product.unit },
  ];

  const presets = isWeightProduct ? weightPresets : piecePresets;

  const handlePresetSelect = (preset) => {
    setSelectedUnit(preset.unit);
    setQuantity(preset.qty);
    setCustomInput(preset.qty.toString());
  };

  const handleCustomChange = (e) => {
    const val = e.target.value;
    setCustomInput(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      setQuantity(num);
    }
  };

  const handleUnitChange = (newUnit) => {
    setSelectedUnit(newUnit);
    let newQty = quantity;
    if (newUnit === 'kg' && selectedUnit === 'g') {
      newQty = parseFloat((quantity / 1000).toFixed(3));
    } else if (newUnit === 'g' && selectedUnit === 'kg') {
      newQty = Math.round(quantity * 1000);
    }
    setQuantity(newQty);
    setCustomInput(newQty.toString());
  };

  const calculatedTotal = calculateItemPrice(product, quantity, selectedUnit);

  const handleAddToCart = () => {
    if (quantity > 0) {
      addToCart(product, quantity, selectedUnit);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Breadcrumb / Back Link */}
      <div>
        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-kirana-brown-light hover:text-kirana-orange transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Groceries</span>
        </Link>
      </div>

      {/* Main Product Card */}
      <div className="bg-white rounded-3xl border border-kirana-beige p-6 sm:p-10 shadow-kirana">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left: Product Image */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-3xl overflow-hidden bg-kirana-sand/40 border-2 border-kirana-beige aspect-square relative shadow-inner">
              <img
                src={getProductImageUrl(product.image)}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = '/assets/images/spices.jpg';
                }}
              />
              {product.badge && (
                <span className="absolute top-4 left-4 bg-gradient-to-r from-amber-500 to-kirana-orange text-white text-xs font-black px-3 py-1 rounded-full shadow-md">
                  {product.badge}
                </span>
              )}
            </div>

            {/* Quick Mandi Freshness note */}
            <div className="p-3.5 rounded-2xl bg-kirana-cream border border-kirana-beige flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-kirana-green flex-shrink-0" />
              <p className="text-[11px] text-kirana-brown-light leading-snug">
                <strong>Upendra Quality Guarantee:</strong> Sourced directly from local farmer mandis. 100% unadulterated & naturally packed.
              </p>
            </div>
          </div>

          {/* Right: Info & Interactive Quantity Engine */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-kirana-orange">
                  {product.category_name}
                </span>
                <span className="text-kirana-brown-muted">•</span>
                <span className="text-xs text-kirana-green font-semibold">
                  {isOutOfStock ? 'Out of Stock' : 'In Stock & Fresh'}
                </span>
              </div>

              <h1 className="font-outfit font-black text-2xl sm:text-4xl text-kirana-brown-dark leading-tight">
                {product.name}
              </h1>

              {product.hindi_name && (
                <p className="text-sm font-hindi font-semibold text-kirana-brown-light mt-1">
                  {product.hindi_name}
                </p>
              )}

              {/* Price Banner */}
              <div className="mt-4 flex items-baseline gap-2 pb-4 border-b border-kirana-sand">
                <span className="font-outfit font-black text-3xl text-kirana-green">
                  ₹{product.price}
                </span>
                <span className="text-sm text-kirana-brown-light font-bold">
                  / {product.unit}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-kirana-brown-dark uppercase tracking-wider">
                Product Description
              </h4>
              <p className="text-xs sm:text-sm text-kirana-brown-light leading-relaxed">
                {product.description || 'Authentic quality Indian grocery item directly packed at Upendra General Stores.'}
              </p>
            </div>

            {/* Quantity Selector Engine */}
            {!isOutOfStock ? (
              <div className="bg-kirana-sand/50 p-5 rounded-3xl border border-kirana-beige space-y-4">
                
                {/* Presets */}
                <div>
                  <label className="block text-xs font-bold text-kirana-brown-dark uppercase tracking-wider mb-2 flex justify-between">
                    <span>Select Desired Quantity</span>
                    <span className="text-[11px] text-kirana-orange font-medium">Quick Presets</span>
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {presets.map((p, idx) => {
                      const isSelected = selectedUnit === p.unit && quantity === p.qty;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handlePresetSelect(p)}
                          className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all text-center ${
                            isSelected
                              ? 'bg-kirana-orange text-white border-kirana-orange shadow-sm scale-[1.02]'
                              : 'bg-white hover:bg-kirana-sand border-kirana-beige text-kirana-brown-dark'
                          }`}
                        >
                          {p.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Exact Input */}
                <div className="flex items-center gap-3 pt-2">
                  <div className="flex-1 flex items-center bg-white border border-kirana-beige rounded-2xl p-1 shadow-inner">
                    <button
                      type="button"
                      onClick={() => {
                        const step = selectedUnit === 'g' ? 50 : 0.5;
                        const newQ = Math.max(step, quantity - step);
                        setQuantity(newQ);
                        setCustomInput(newQ.toString());
                      }}
                      className="w-10 h-10 rounded-xl bg-kirana-sand hover:bg-kirana-beige text-kirana-brown-dark font-bold flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <input
                      type="number"
                      step={selectedUnit === 'g' ? '10' : '0.1'}
                      min="1"
                      value={customInput}
                      onChange={handleCustomChange}
                      className="flex-1 text-center font-outfit font-black text-lg text-kirana-brown-dark outline-none bg-transparent"
                    />

                    <button
                      type="button"
                      onClick={() => {
                        const step = selectedUnit === 'g' ? 50 : 0.5;
                        const newQ = quantity + step;
                        setQuantity(newQ);
                        setCustomInput(newQ.toString());
                      }}
                      className="w-10 h-10 rounded-xl bg-kirana-sand hover:bg-kirana-beige text-kirana-brown-dark font-bold flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {isWeightProduct ? (
                    <div className="flex bg-white rounded-2xl border border-kirana-beige p-1 shadow-inner">
                      <button
                        type="button"
                        onClick={() => handleUnitChange('g')}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                          selectedUnit === 'g' ? 'bg-kirana-green text-white shadow' : 'text-kirana-brown-light'
                        }`}
                      >
                        Grams (g)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUnitChange('kg')}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                          selectedUnit === 'kg' ? 'bg-kirana-green text-white shadow' : 'text-kirana-brown-light'
                        }`}
                      >
                        Kg
                      </button>
                    </div>
                  ) : (
                    <div className="bg-white px-4 py-2.5 rounded-2xl border border-kirana-beige text-xs font-bold text-kirana-brown-dark capitalize">
                      {product.unit}s
                    </div>
                  )}
                </div>

                {/* Live Price Calculation Box */}
                <div className="bg-gradient-to-r from-kirana-orange-soft to-amber-50 p-4 rounded-2xl border border-kirana-orange-border flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-kirana-orange-dark uppercase tracking-wider block">
                      Total for {quantity} {selectedUnit}
                    </span>
                    <span className="text-xs text-kirana-brown-light">Inclusive of all local taxes</span>
                  </div>
                  <span className="font-outfit font-black text-2xl text-kirana-green">
                    ₹{calculatedTotal}
                  </span>
                </div>

                {/* Add to Cart Button */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-kirana-orange to-kirana-orange-dark hover:from-kirana-orange-dark hover:to-kirana-orange text-white text-sm font-black tracking-wide shadow-lg shadow-kirana-orange/30 flex items-center justify-center gap-2 transition-all btn-press"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>Add {quantity} {selectedUnit} to Cart • ₹{calculatedTotal}</span>
                </button>
              </div>
            ) : (
              <div className="p-4 bg-red-50 text-red-700 text-xs font-bold rounded-2xl border border-red-200 text-center">
                Currently Out of Stock. Shopkeeper will restock shortly.
              </div>
            )}

          </div>

        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-outfit font-black text-xl text-kirana-brown-dark">
              More in {product.category_name}
            </h3>
            <Link
              to={`/products?category=${product.category}`}
              className="text-xs font-bold text-kirana-orange hover:underline"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductDetail;

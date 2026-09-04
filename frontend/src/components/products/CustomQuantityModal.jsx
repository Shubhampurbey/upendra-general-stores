import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Check, Scale, Sparkles, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { getProductImageUrl } from '../../utils/imageUrl';

const CustomQuantityModal = ({ product, isOpen, onClose }) => {
  const { addToCart, calculateItemPrice } = useCart();

  if (!isOpen || !product) return null;

  const isWeightProduct = product.unit === 'kg' || product.unit === 'g';
  
  // States
  const [selectedUnit, setSelectedUnit] = useState(isWeightProduct ? 'g' : product.unit);
  const [quantity, setQuantity] = useState(isWeightProduct ? 250 : 1);
  const [customInput, setCustomInput] = useState(isWeightProduct ? '250' : '1');

  // Common quick chips for Indian grocery stores
  const weightPresets = [
    { label: '50g', qty: 50, unit: 'g' },
    { label: '100g', qty: 100, unit: 'g' },
    { label: '250g (पाव)', qty: 250, unit: 'g' },
    { label: '500g (आधा किलो)', qty: 500, unit: 'g' },
    { label: '750g', qty: 750, unit: 'g' },
    { label: '1 kg', qty: 1, unit: 'kg' },
    { label: '2 kg', qty: 2, unit: 'kg' },
    { label: '5 kg', qty: 5, unit: 'kg' },
  ];

  const piecePresets = [
    { label: '1 Packet', qty: 1, unit: product.unit },
    { label: '2 Packets', qty: 2, unit: product.unit },
    { label: '3 Packets', qty: 3, unit: product.unit },
    { label: '5 Packets', qty: 5, unit: product.unit },
    { label: '10 Packets', qty: 10, unit: product.unit },
  ];

  const presets = isWeightProduct ? weightPresets : piecePresets;

  // Handle Preset Click
  const handlePresetSelect = (preset) => {
    setSelectedUnit(preset.unit);
    setQuantity(preset.qty);
    setCustomInput(preset.qty.toString());
  };

  // Handle Custom Numeric Change
  const handleCustomChange = (e) => {
    const val = e.target.value;
    setCustomInput(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      setQuantity(num);
    }
  };

  // Unit Toggle Change
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

  // Instant calculated total
  const calculatedTotal = calculateItemPrice(product, quantity, selectedUnit);

  const handleAdd = () => {
    if (quantity > 0) {
      addToCart(product, quantity, selectedUnit);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-kirana-brown-dark/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-kirana-beige overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-kirana-sand via-white to-kirana-sand p-5 border-b border-kirana-beige flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <img
              src={getProductImageUrl(product.image)}
              alt={product.name}
              className="w-14 h-14 object-cover rounded-2xl border-2 border-white shadow-md flex-shrink-0"
              onError={(e) => {
                e.target.src = '/assets/images/spices.jpg';
              }}
            />
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-kirana-orange">
                {product.category_name}
              </span>
              <h3 className="font-outfit font-bold text-lg text-kirana-brown-dark leading-snug">
                {product.name}
              </h3>
              {product.hindi_name && (
                <p className="text-xs text-kirana-brown-light font-medium font-hindi">
                  {product.hindi_name}
                </p>
              )}
              <div className="mt-1 text-xs font-semibold text-kirana-green">
                Base Price: ₹{product.price} / {product.unit}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-kirana-beige/60 text-kirana-brown-muted hover:text-kirana-brown-dark transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          
          {/* Quick Preset Selector Chips */}
          <div>
            <label className="block text-xs font-bold text-kirana-brown-dark uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span>Quick Select Quantities</span>
              <span className="text-[11px] text-kirana-orange font-medium">Click any to select</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {presets.map((p, idx) => {
                const isSelected = selectedUnit === p.unit && quantity === p.qty;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePresetSelect(p)}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                      isSelected
                        ? 'bg-kirana-orange text-white border-kirana-orange shadow-md shadow-kirana-orange/20 scale-[1.02]'
                        : 'bg-kirana-sand/60 hover:bg-kirana-sand border-kirana-beige text-kirana-brown-dark'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Numeric Quantity & Unit Selector */}
          <div className="bg-kirana-cream p-4 rounded-2xl border border-kirana-beige/80 space-y-3">
            <label className="block text-xs font-bold text-kirana-brown-dark uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-kirana-orange" />
                Or Enter Custom Quantity:
              </span>
              <span className="text-[11px] text-kirana-brown-light font-normal">Exact custom weight</span>
            </label>

            <div className="flex items-center gap-3">
              {/* Stepper / Input */}
              <div className="flex-1 flex items-center bg-white border border-kirana-beige rounded-2xl p-1 shadow-inner">
                <button
                  type="button"
                  onClick={() => {
                    const step = selectedUnit === 'g' ? 50 : 0.5;
                    const newQ = Math.max(step, quantity - step);
                    setQuantity(newQ);
                    setCustomInput(newQ.toString());
                  }}
                  className="w-10 h-10 rounded-xl bg-kirana-sand hover:bg-kirana-beige/80 text-kirana-brown-dark font-bold flex items-center justify-center transition-colors"
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
                  className="w-10 h-10 rounded-xl bg-kirana-sand hover:bg-kirana-beige/80 text-kirana-brown-dark font-bold flex items-center justify-center transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Unit Dropdown / Selector */}
              {isWeightProduct ? (
                <div className="flex bg-white rounded-2xl border border-kirana-beige p-1 shadow-inner">
                  <button
                    type="button"
                    onClick={() => handleUnitChange('g')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      selectedUnit === 'g'
                        ? 'bg-kirana-green text-white shadow'
                        : 'text-kirana-brown-light hover:text-kirana-brown-dark'
                    }`}
                  >
                    Grams (g)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUnitChange('kg')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      selectedUnit === 'kg'
                        ? 'bg-kirana-green text-white shadow'
                        : 'text-kirana-brown-light hover:text-kirana-brown-dark'
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
          </div>

          {/* Automatic Price Calculation Display Box */}
          <div className="bg-gradient-to-br from-kirana-orange-soft to-amber-50 p-4 rounded-2xl border border-kirana-orange-border flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-kirana-orange-dark uppercase tracking-wider block">
                Calculated Price
              </span>
              <span className="text-xs text-kirana-brown-light font-medium">
                {product.name} ({quantity} {selectedUnit})
              </span>
            </div>
            <div className="text-right">
              <span className="font-outfit font-black text-2xl text-kirana-green">
                ₹{calculatedTotal}
              </span>
              <span className="text-[10px] text-kirana-brown-muted block">
                (Inclusive of all taxes)
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer CTA */}
        <div className="bg-kirana-sand/50 p-5 border-t border-kirana-beige flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-2xl border border-kirana-beige hover:bg-white text-xs font-bold text-kirana-brown-dark transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAdd}
            className="flex-[2] py-3 px-6 rounded-2xl bg-gradient-to-r from-kirana-orange to-kirana-orange-dark hover:from-kirana-orange-dark hover:to-kirana-orange text-white text-xs font-black tracking-wide shadow-md shadow-kirana-orange/30 flex items-center justify-center gap-2 transition-all btn-press"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Add {quantity} {selectedUnit} • ₹{calculatedTotal}</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default CustomQuantityModal;

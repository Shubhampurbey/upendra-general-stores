import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartService } from '../api/services';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load cart from server (if authenticated) or from local storage (if guest)
  const fetchCart = async () => {
    if (isAuthenticated) {
      try {
        setLoading(true);
        const data = await CartService.getCart();
        setItems(data.items || []);
      } catch (err) {
        console.error('Failed to load user cart:', err);
      } finally {
        setLoading(false);
      }
    } else {
      const localCart = localStorage.getItem('upendra_guest_cart');
      if (localCart) {
        try {
          setItems(JSON.parse(localCart));
        } catch (e) {
          setItems([]);
        }
      }
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated]);

  // Sync guest cart to local storage
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('upendra_guest_cart', JSON.stringify(items));
    }
  }, [items, isAuthenticated]);

  /**
   * Calculate subtotal for an item based on quantity and unit
   */
  const calculateItemPrice = (product, quantity, unit) => {
    const q = parseFloat(quantity) || 0;
    const basePrice = parseFloat(product.price) || 0;

    if (unit === 'g' && product.unit === 'kg') {
      return parseFloat(((basePrice * q) / 1000).toFixed(2));
    } else if (unit === 'kg' && product.unit === 'kg') {
      return parseFloat((basePrice * q).toFixed(2));
    } else {
      return parseFloat((basePrice * q).toFixed(2));
    }
  };

  /**
   * Add to Cart with custom quantity and unit
   */
  const addToCart = async (product, quantity = 1, unit = null) => {
    const targetUnit = unit || (product.unit === 'kg' ? 'kg' : product.unit);
    const subtotal = calculateItemPrice(product, quantity, targetUnit);

    if (isAuthenticated) {
      try {
        await CartService.addItem({
          product_id: product.id,
          quantity: quantity,
          unit: targetUnit,
        });
        await fetchCart();
        toast.success(`Added ${quantity}${targetUnit} ${product.name} to cart!`);
      } catch (err) {
        toast.error(err.response?.data?.error || 'Could not add to cart.');
      }
    } else {
      // Guest Cart
      setItems((prevItems) => {
        const existingIdx = prevItems.findIndex(
          (item) => item.product.id === product.id && item.unit === targetUnit
        );

        if (existingIdx > -1) {
          const updated = [...prevItems];
          const newQty = parseFloat((parseFloat(updated[existingIdx].quantity) + parseFloat(quantity)).toFixed(2));
          const newSubtotal = calculateItemPrice(product, newQty, targetUnit);
          updated[existingIdx] = {
            ...updated[existingIdx],
            quantity: newQty,
            subtotal: newSubtotal,
          };
          return updated;
        } else {
          return [
            ...prevItems,
            {
              id: `guest-${Date.now()}-${Math.random()}`,
              product,
              quantity,
              unit: targetUnit,
              unit_price: product.price,
              subtotal,
            },
          ];
        }
      });
      toast.success(`Added ${quantity}${targetUnit} ${product.name} to cart!`);
    }
  };

  /**
   * Update Item Quantity
   */
  const updateQuantity = async (itemId, newQuantity) => {
    const qty = parseFloat(newQuantity);
    if (qty <= 0) {
      return removeItem(itemId);
    }

    if (isAuthenticated) {
      try {
        await CartService.updateItem(itemId, qty);
        await fetchCart();
      } catch (err) {
        toast.error('Failed to update cart quantity.');
      }
    } else {
      setItems((prev) =>
        prev.map((item) => {
          if (item.id === itemId) {
            const newSubtotal = calculateItemPrice(item.product, qty, item.unit);
            return { ...item, quantity: qty, subtotal: newSubtotal };
          }
          return item;
        })
      );
    }
  };

  /**
   * Remove Item
   */
  const removeItem = async (itemId) => {
    if (isAuthenticated) {
      try {
        await CartService.removeItem(itemId);
        await fetchCart();
        toast.success('Item removed from cart');
      } catch (err) {
        toast.error('Failed to remove item.');
      }
    } else {
      setItems((prev) => prev.filter((item) => item.id !== itemId));
      toast.success('Item removed from cart');
    }
  };

  /**
   * Clear entire cart
   */
  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        await CartService.clearCart();
        setItems([]);
      } catch (err) {
        console.error(err);
      }
    } else {
      setItems([]);
      localStorage.removeItem('upendra_guest_cart');
    }
  };

  // Calculated totals
  const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.subtotal) || 0), 0);
  const totalItemCount = items.length;
  const deliveryThreshold = 249;
  const standardDeliveryCharge = 30;
  const deliveryCharge = subtotal >= deliveryThreshold || subtotal === 0 ? 0 : standardDeliveryCharge;
  const grandTotal = subtotal + deliveryCharge;

  return (
    <CartContext.Provider
      value={{
        items,
        subtotal: parseFloat(subtotal.toFixed(2)),
        deliveryCharge,
        grandTotal: parseFloat(grandTotal.toFixed(2)),
        totalItemCount,
        deliveryThreshold,
        loading,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        fetchCart,
        calculateItemPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

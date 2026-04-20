import { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const cartData = Cookies.get('cart');
    if (cartData) {
      setCart(JSON.parse(cartData));
    }
  }, []);

  useEffect(() => {
    Cookies.set('cart', JSON.stringify(cart), { expires: 7 });
  }, [cart]);

  const addItem = (item) => {
    setCart((prev) => {
      const existing = prev.find(
        (cartItem) => cartItem.id === item.id && cartItem.selectedPackSize === item.selectedPackSize && cartItem.selectedFlavour === item.selectedFlavour
      );

      if (existing) {
        return prev.map((cartItem) =>
          cartItem.id === item.id && cartItem.selectedPackSize === item.selectedPackSize && cartItem.selectedFlavour === item.selectedFlavour
            ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
            : cartItem
        );
      }

      return [
        ...prev,
        {
          cartId: Date.now() + Math.random(),
          ...item,
        },
      ];
    });
  };

  const updateItem = (cartId, field, value) => {
    setCart((prev) =>
      prev.map((item) => (item.cartId === cartId ? { ...item, [field]: value } : item))
    );
  };

  const removeItem = (cartId) => {
    setCart((prev) => prev.filter((item) => item.cartId !== cartId));
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, addItem, updateItem, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
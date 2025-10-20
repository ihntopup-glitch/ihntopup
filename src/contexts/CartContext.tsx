"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { TopUpCardData } from '@/lib/data';

export type CartItem = {
  card: TopUpCardData;
  quantity: number;
  selectedOption?: { name: string; price: number };
};

type CartContextType = {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (cardId: string, optionName?: string) => void;
  updateQuantity: (cardId: string, quantity: number, optionName?: string) => void;
  clearCart: () => void;
  cartCount: number;
  totalPrice: number;
};

const CartContext = createContext<CartContextType | null>(null);

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('ihn-cart');
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }
    } catch (error) {
      console.error("Failed to parse cart from localStorage", error);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('ihn-cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = useCallback((itemToAdd: CartItem) => {
    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(
        item => item.card.id === itemToAdd.card.id && item.selectedOption?.name === itemToAdd.selectedOption?.name
      );

      if (existingItemIndex > -1) {
        const newItems = [...prevItems];
        newItems[existingItemIndex].quantity += itemToAdd.quantity;
        return newItems;
      } else {
        return [...prevItems, itemToAdd];
      }
    });
  }, []);

  const removeFromCart = useCallback((cardId: string, optionName?: string) => {
    setCartItems(prevItems =>
      prevItems.filter(
        item => !(item.card.id === cardId && item.selectedOption?.name === optionName)
      )
    );
  }, []);

  const updateQuantity = useCallback((cardId: string, quantity: number, optionName?: string) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.card.id === cardId && item.selectedOption?.name === optionName
          ? { ...item, quantity: Math.max(0, quantity) }
          : item
      ).filter(item => item.quantity > 0)
    );
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  const totalPrice = cartItems.reduce((total, item) => {
    const price = item.selectedOption?.price ?? item.card.price;
    return total + price * item.quantity;
  }, 0);

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount,
    totalPrice,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

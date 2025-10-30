
"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { TopUpCardData } from '@/lib/data';
import { useAuthContext } from './AuthContext';

export type CartItem = {
  card: TopUpCardData;
  quantity: number;
  selectedOption?: { name: string; price: number };
};

// Unique identifier for a cart item
const getCartItemId = (item: CartItem) => `${item.card.id}-${item.selectedOption?.name}`;


type CartContextType = {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (cardId: string, optionName?: string) => void;
  removeItems: (itemsToRemove: CartItem[]) => void;
  updateQuantity: (cardId: string, quantity: number, optionName?: string) => void;
  clearCart: () => void;
  cartCount: number;

  // New state and functions for selective checkout
  selectedItemIds: string[];
  toggleSelectItem: (itemId: string) => void;
  selectAllItems: () => void;
  clearSelection: () => void;
  getSelectedItems: () => CartItem[];
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
  const { firebaseUser } = useAuthContext();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  const getCartKey = useCallback(() => {
    if (!firebaseUser) return null;
    return `ihn-cart-${firebaseUser.uid}`;
  }, [firebaseUser]);


  useEffect(() => {
    const cartKey = getCartKey();
    if (!cartKey) {
        // Clear cart if user logs out
        setCartItems([]);
        setSelectedItemIds([]);
        return;
    }

    try {
      const storedCart = localStorage.getItem(cartKey);
      if (storedCart) {
        const parsedCart = JSON.parse(storedCart);
        setCartItems(parsedCart);
        setSelectedItemIds(parsedCart.map(getCartItemId));
      } else {
        // If no cart for this user, clear the state
        setCartItems([]);
        setSelectedItemIds([]);
      }
    } catch (error) {
      console.error("Failed to parse cart from localStorage", error);
    }
  }, [getCartKey]);

  useEffect(() => {
    const cartKey = getCartKey();
    if (cartKey) {
        localStorage.setItem(cartKey, JSON.stringify(cartItems));
    }
  }, [cartItems, getCartKey]);

  const addToCart = useCallback((itemToAdd: CartItem) => {
    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(
        item => item.card.id === itemToAdd.card.id && item.selectedOption?.name === itemToAdd.selectedOption?.name
      );

      let newItems;
      if (existingItemIndex > -1) {
        newItems = [...prevItems];
        newItems[existingItemIndex].quantity += itemToAdd.quantity;
      } else {
        newItems = [...prevItems, itemToAdd];
      }
       // Auto-select the newly added item
      setSelectedItemIds(currentSelected => {
          const newItemId = getCartItemId(itemToAdd);
          if (currentSelected.includes(newItemId)) return currentSelected;
          return [...currentSelected, newItemId];
      });

      return newItems;
    });
  }, []);

  const removeFromCart = useCallback((cardId: string, optionName?: string) => {
    const itemIdToRemove = getCartItemId({ card: { id: cardId }, selectedOption: { name: optionName } } as any);
    setCartItems(prevItems =>
      prevItems.filter(
        item => !(item.card.id === cardId && item.selectedOption?.name === optionName)
      )
    );
     setSelectedItemIds(prevIds => prevIds.filter(id => id !== itemIdToRemove));
  }, []);

  const removeItems = useCallback((itemsToRemove: CartItem[]) => {
    const idsToRemove = itemsToRemove.map(getCartItemId);
    setCartItems(prevItems => prevItems.filter(item => !idsToRemove.includes(getCartItemId(item))));
    setSelectedItemIds(prevIds => prevIds.filter(id => !idsToRemove.includes(id)));
  }, []);


  const updateQuantity = useCallback((cardId: string, quantity: number, optionName?: string) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.card.id === cardId && item.selectedOption?.name === optionName
          ? { ...item, quantity: Math.max(1, quantity) } // Prevent quantity from being less than 1
          : item
      ).filter(item => item.quantity > 0)
    );
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    setSelectedItemIds([]);
    const cartKey = getCartKey();
    if (cartKey) {
        localStorage.removeItem(cartKey);
    }
  }, [getCartKey]);

  const toggleSelectItem = useCallback((itemId: string) => {
    setSelectedItemIds(prevIds => 
      prevIds.includes(itemId)
        ? prevIds.filter(id => id !== itemId)
        : [...prevIds, itemId]
    );
  }, []);

  const selectAllItems = useCallback(() => {
    setSelectedItemIds(cartItems.map(getCartItemId));
  }, [cartItems]);

  const clearSelection = useCallback(() => {
    setSelectedItemIds([]);
  }, []);
  
  const getSelectedItems = useCallback(() => {
    return cartItems.filter(item => selectedItemIds.includes(getCartItemId(item)));
  }, [cartItems, selectedItemIds]);

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    removeItems,
    updateQuantity,
    clearCart,
    cartCount,
    selectedItemIds,
    toggleSelectItem,
    selectAllItems,
    clearSelection,
    getSelectedItems
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

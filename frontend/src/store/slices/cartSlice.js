import { createSlice } from '@reduxjs/toolkit';
import { logout } from './authSlice.js';

/**
 * @typedef {Object} CartItem
 * @property {string} variantId
 * @property {string} productId
 * @property {string} productName
 * @property {string} variantName
 * @property {string} sku
 * @property {string} image
 * @property {number} quantity
 * @property {number} price
 */

/**
 * @typedef {Object} CartState
 * @property {CartItem[]} items
 * @property {boolean} isOpen - Cart drawer open state
 * @property {string|null} sessionId - Session ID for guest carts
 */

/** @type {CartState} */
const initialState = {
  items: [],
  isOpen: false,
  sessionId: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCart: (state, action) => {
      state.items = action.payload.items || [];
      if (action.payload.sessionId) {
        state.sessionId = action.payload.sessionId;
      }
    },
    addItem: (state, action) => {
      const { variantId, quantity = 1, ...itemData } = action.payload;
      const existingItem = state.items.find((item) => item.variantId === variantId);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({ variantId, quantity, ...itemData });
      }
    },
    updateItemQuantity: (state, action) => {
      const { variantId, quantity } = action.payload;
      const item = state.items.find((item) => item.variantId === variantId);

      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter((i) => i.variantId !== variantId);
        } else {
          item.quantity = quantity;
        }
      }
    },
    removeItem: (state, action) => {
      const variantId = action.payload;
      state.items = state.items.filter((item) => item.variantId !== variantId);
    },
    clearCart: (state) => {
      state.items = [];
    },
    toggleCartDrawer: (state) => {
      state.isOpen = !state.isOpen;
    },
    openCartDrawer: (state) => {
      state.isOpen = true;
    },
    closeCartDrawer: (state) => {
      state.isOpen = false;
    },
    setSessionId: (state, action) => {
      state.sessionId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logout.fulfilled, (state) => {
      state.items = [];
      state.isOpen = false;
    });
  },
});

export const {
  setCart,
  addItem,
  updateItemQuantity,
  removeItem,
  clearCart,
  toggleCartDrawer,
  openCartDrawer,
  closeCartDrawer,
  setSessionId,
} = cartSlice.actions;

// Selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartIsOpen = (state) => state.cart.isOpen;
export const selectSessionId = (state) => state.cart.sessionId;

export const selectCartItemCount = (state) =>
  state.cart.items.reduce((sum, item) => sum + item.quantity, 0);

export const selectCartSubtotal = (state) =>
  state.cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

export const selectCartItemByVariantId = (variantId) => (state) =>
  state.cart.items.find((item) => item.variantId === variantId);

export default cartSlice.reducer;

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  validateCart,
} from '../services/cartService';
import { openCartDrawer, setCart } from '../store/slices/cartSlice';

/**
 * Query keys for cart
 */
export const cartKeys = {
  all: ['cart'],
  detail: () => [...cartKeys.all, 'detail'],
  validation: () => [...cartKeys.all, 'validation'],
};

/**
 * Hook to fetch and manage cart
 */
export function useCart() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  const cartQuery = useQuery({
    queryKey: cartKeys.detail(),
    queryFn: getCart,
    staleTime: 30 * 1000, // 30 seconds
  });

  // Sync server cart data to Redux for badge count
  useEffect(() => {
    if (cartQuery.data) {
      dispatch(setCart({ items: cartQuery.data.items || [] }));
    }
  }, [cartQuery.data, dispatch]);

  const addItemMutation = useMutation({
    mutationFn: ({ variantId, quantity }) => addToCart(variantId, quantity),
    onSuccess: (data) => {
      queryClient.setQueryData(cartKeys.detail(), data);
      dispatch(setCart({ items: data.items || [] }));
      dispatch(openCartDrawer());
    },
    onError: () => {
      // Refetch to get the true cart state after a failed add
      queryClient.invalidateQueries({ queryKey: cartKeys.detail() });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ variantId, quantity }) => updateCartItem(variantId, quantity),
    onSuccess: (data) => {
      queryClient.setQueryData(cartKeys.detail(), data);
      dispatch(setCart({ items: data.items || [] }));
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.detail() });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: (variantId) => removeFromCart(variantId),
    onSuccess: (data) => {
      queryClient.setQueryData(cartKeys.detail(), data);
      dispatch(setCart({ items: data.items || [] }));
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.detail() });
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: clearCart,
    onSuccess: (data) => {
      queryClient.setQueryData(cartKeys.detail(), data);
      dispatch(setCart({ items: [] }));
    },
  });

  return {
    cart: cartQuery.data,
    isLoading: cartQuery.isLoading,
    isError: cartQuery.isError,
    error: cartQuery.error,
    refetch: cartQuery.refetch,

    addItem: addItemMutation.mutate,
    addItemAsync: addItemMutation.mutateAsync,
    isAdding: addItemMutation.isPending,
    addError: addItemMutation.error,

    updateItem: updateItemMutation.mutate,
    updateItemAsync: updateItemMutation.mutateAsync,
    isUpdating: updateItemMutation.isPending,
    updateError: updateItemMutation.error,

    removeItem: removeItemMutation.mutate,
    removeItemAsync: removeItemMutation.mutateAsync,
    isRemoving: removeItemMutation.isPending,

    clearCart: clearCartMutation.mutate,
    clearCartAsync: clearCartMutation.mutateAsync,
    isClearing: clearCartMutation.isPending,
  };
}

/**
 * Hook to validate cart before checkout
 */
export function useValidateCart() {
  return useMutation({
    mutationFn: validateCart,
  });
}

/**
 * Hook to invalidate cart cache (useful after login/logout)
 */
export function useInvalidateCart() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: cartKeys.all });
  };
}

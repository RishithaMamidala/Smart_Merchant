import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMerchantOrders,
  getMerchantOrder,
  updateOrderStatus,
  shipOrder,
  deliverOrder,
  cancelOrder,
  updateOrderNotes,
} from '../services/merchantOrderService.js';

/**
 * Hook to fetch merchant orders with pagination and filters
 * @param {Object} params
 * @returns {import('@tanstack/react-query').UseQueryResult}
 */
export function useMerchantOrders(params = {}) {
  return useQuery({
    queryKey: ['merchantOrders', params],
    queryFn: () => getMerchantOrders(params),
    keepPreviousData: true,
  });
}

/**
 * Hook to fetch a single order
 * @param {string} orderNumber
 * @returns {import('@tanstack/react-query').UseQueryResult}
 */
export function useMerchantOrder(orderNumber) {
  return useQuery({
    queryKey: ['merchantOrder', orderNumber],
    queryFn: () => getMerchantOrder(orderNumber),
    enabled: !!orderNumber,
  });
}

/**
 * Hook to update order status
 * @returns {import('@tanstack/react-query').UseMutationResult}
 */
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderNumber, status }) => updateOrderStatus(orderNumber, status),
    onSuccess: (_, { orderNumber }) => {
      queryClient.invalidateQueries({ queryKey: ['merchantOrders'] });
      queryClient.invalidateQueries({ queryKey: ['merchantOrder', orderNumber] });
    },
  });
}

/**
 * Hook to ship an order
 * @returns {import('@tanstack/react-query').UseMutationResult}
 */
export function useShipOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderNumber, trackingInfo }) => shipOrder(orderNumber, trackingInfo),
    onSuccess: (_, { orderNumber }) => {
      queryClient.invalidateQueries({ queryKey: ['merchantOrders'] });
      queryClient.invalidateQueries({ queryKey: ['merchantOrder', orderNumber] });
    },
  });
}

/**
 * Hook to deliver an order
 * @returns {import('@tanstack/react-query').UseMutationResult}
 */
export function useDeliverOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deliverOrder,
    onSuccess: (_, orderNumber) => {
      queryClient.invalidateQueries({ queryKey: ['merchantOrders'] });
      queryClient.invalidateQueries({ queryKey: ['merchantOrder', orderNumber] });
    },
  });
}

/**
 * Hook to cancel an order
 * @returns {import('@tanstack/react-query').UseMutationResult}
 */
export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderNumber, reason }) => cancelOrder(orderNumber, reason),
    onSuccess: (_, { orderNumber }) => {
      queryClient.invalidateQueries({ queryKey: ['merchantOrders'] });
      queryClient.invalidateQueries({ queryKey: ['merchantOrder', orderNumber] });
    },
  });
}

/**
 * Hook to update order notes
 * @returns {import('@tanstack/react-query').UseMutationResult}
 */
export function useUpdateOrderNotes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderNumber, notes }) => updateOrderNotes(orderNumber, notes),
    onSuccess: (_, { orderNumber }) => {
      queryClient.invalidateQueries({ queryKey: ['merchantOrder', orderNumber] });
    },
  });
}

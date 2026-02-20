import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as customerService from '../services/customerService.js';

/**
 * Hook to fetch customer profile
 * @returns {Object} Query result
 */
export function useProfile() {
  return useQuery({
    queryKey: ['customer-profile'],
    queryFn: customerService.getProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to update customer profile
 * @returns {Object} Mutation result
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates) => customerService.updateProfile(updates),
    onSuccess: (data) => {
      queryClient.setQueryData(['customer-profile'], data);
    },
  });
}

/**
 * Hook to change password
 * @returns {Object} Mutation result
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }) =>
      customerService.changePassword(currentPassword, newPassword),
  });
}

/**
 * Hook to fetch order history
 * @param {Object} params
 * @returns {Object} Query result
 */
export function useOrderHistory(params = {}) {
  return useQuery({
    queryKey: ['customer-orders', params],
    queryFn: () => customerService.getOrderHistory(params),
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to fetch single order
 * @param {string} orderNumber
 * @returns {Object} Query result
 */
export function useCustomerOrder(orderNumber) {
  return useQuery({
    queryKey: ['customer-order', orderNumber],
    queryFn: () => customerService.getOrder(orderNumber),
    enabled: !!orderNumber,
  });
}

/**
 * Hook to add address
 * @returns {Object} Mutation result
 */
export function useAddAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (address) => customerService.addAddress(address),
    onSuccess: (data) => {
      queryClient.setQueryData(['customer-profile'], data);
    },
  });
}

/**
 * Hook to update address
 * @returns {Object} Mutation result
 */
export function useUpdateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ addressId, updates }) =>
      customerService.updateAddress(addressId, updates),
    onSuccess: (data) => {
      queryClient.setQueryData(['customer-profile'], data);
    },
  });
}

/**
 * Hook to delete address
 * @returns {Object} Mutation result
 */
export function useDeleteAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (addressId) => customerService.deleteAddress(addressId),
    onSuccess: (data) => {
      queryClient.setQueryData(['customer-profile'], data);
    },
  });
}

/**
 * Hook to set default address
 * @returns {Object} Mutation result
 */
export function useSetDefaultAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (addressId) => customerService.setDefaultAddress(addressId),
    onSuccess: (data) => {
      queryClient.setQueryData(['customer-profile'], data);
    },
  });
}

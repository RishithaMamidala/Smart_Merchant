import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMerchantProducts,
  getMerchantProduct,
  createProduct,
  updateProduct,
  archiveProduct,
  restoreProduct,
  getProductVariants,
  updateVariant,
  adjustInventory,
  bulkUpdateVariants,
} from '../services/merchantProductService.js';

/**
 * Hook to fetch merchant products with pagination and filters
 * @param {Object} params
 * @returns {import('@tanstack/react-query').UseQueryResult}
 */
export function useMerchantProducts(params = {}) {
  return useQuery({
    queryKey: ['merchantProducts', params],
    queryFn: () => getMerchantProducts(params),
    keepPreviousData: true,
  });
}

/**
 * Hook to fetch a single merchant product
 * @param {string} productId
 * @returns {import('@tanstack/react-query').UseQueryResult}
 */
export function useMerchantProduct(productId) {
  return useQuery({
    queryKey: ['merchantProduct', productId],
    queryFn: () => getMerchantProduct(productId),
    enabled: !!productId,
  });
}

/**
 * Hook to create a new product
 * @returns {import('@tanstack/react-query').UseMutationResult}
 */
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchantProducts'] });
      queryClient.invalidateQueries({ queryKey: ['merchantCategories'] }); // Update category counts
    },
  });
}

/**
 * Hook to update a product
 * @returns {import('@tanstack/react-query').UseMutationResult}
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, data }) => updateProduct(productId, data),
    onSuccess: (data, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ['merchantProducts'] });
      queryClient.invalidateQueries({ queryKey: ['merchantProduct', productId] });
      queryClient.invalidateQueries({ queryKey: ['merchantCategories'] }); // Update category counts
    },
  });
}

/**
 * Hook to archive a product
 * @returns {import('@tanstack/react-query').UseMutationResult}
 */
export function useArchiveProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: archiveProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchantProducts'] });
      queryClient.invalidateQueries({ queryKey: ['merchantCategories'] }); // Update category counts
    },
  });
}

/**
 * Hook to restore a product
 * @returns {import('@tanstack/react-query').UseMutationResult}
 */
export function useRestoreProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: restoreProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchantProducts'] });
      queryClient.invalidateQueries({ queryKey: ['merchantCategories'] }); // Update category counts
    },
  });
}

/**
 * Hook to fetch product variants
 * @param {string} productId
 * @returns {import('@tanstack/react-query').UseQueryResult}
 */
export function useProductVariants(productId) {
  return useQuery({
    queryKey: ['productVariants', productId],
    queryFn: () => getProductVariants(productId),
    enabled: !!productId,
  });
}

/**
 * Hook to update a variant
 * @returns {import('@tanstack/react-query').UseMutationResult}
 */
export function useUpdateVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ variantId, data }) => updateVariant(variantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productVariants'] });
      queryClient.invalidateQueries({ queryKey: ['merchantProduct'] });
    },
  });
}

/**
 * Hook to adjust variant inventory
 * @returns {import('@tanstack/react-query').UseMutationResult}
 */
export function useAdjustInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ variantId, adjustment, reason }) =>
      adjustInventory(variantId, adjustment, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productVariants'] });
      queryClient.invalidateQueries({ queryKey: ['merchantProducts'] });
    },
  });
}

/**
 * Hook to bulk update variants
 * @returns {import('@tanstack/react-query').UseMutationResult}
 */
export function useBulkUpdateVariants() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, variants }) => bulkUpdateVariants(productId, variants),
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ['productVariants', productId] });
      queryClient.invalidateQueries({ queryKey: ['merchantProduct', productId] });
    },
  });
}

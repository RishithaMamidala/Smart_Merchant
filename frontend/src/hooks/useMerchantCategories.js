import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMerchantCategories,
  getMerchantCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
} from '../services/merchantCategoryService.js';

/**
 * Hook to fetch merchant categories
 * @param {Object} [params]
 * @returns {import('@tanstack/react-query').UseQueryResult}
 */
export function useMerchantCategories(params = {}) {
  return useQuery({
    queryKey: ['merchantCategories', params],
    queryFn: () => getMerchantCategories(params),
  });
}

/**
 * Hook to fetch a single category
 * @param {string} categoryId
 * @returns {import('@tanstack/react-query').UseQueryResult}
 */
export function useMerchantCategory(categoryId) {
  return useQuery({
    queryKey: ['merchantCategory', categoryId],
    queryFn: () => getMerchantCategory(categoryId),
    enabled: !!categoryId,
  });
}

/**
 * Hook to create a category
 * @returns {import('@tanstack/react-query').UseMutationResult}
 */
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchantCategories'] });
    },
  });
}

/**
 * Hook to update a category
 * @returns {import('@tanstack/react-query').UseMutationResult}
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ categoryId, data }) => updateCategory(categoryId, data),
    onSuccess: (_, { categoryId }) => {
      queryClient.invalidateQueries({ queryKey: ['merchantCategories'] });
      queryClient.invalidateQueries({ queryKey: ['merchantCategory', categoryId] });
    },
  });
}

/**
 * Hook to delete a category
 * @returns {import('@tanstack/react-query').UseMutationResult}
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchantCategories'] });
    },
  });
}

/**
 * Hook to reorder categories
 * @returns {import('@tanstack/react-query').UseMutationResult}
 */
export function useReorderCategories() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reorderCategories,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchantCategories'] });
    },
  });
}

import { useQuery } from '@tanstack/react-query';
import {
  getProducts,
  getProductBySlug,
  searchProducts,
  getFeaturedProducts,
} from '../services/productService';
import { getCategories, getCategoryBySlug } from '../services/categoryService';

/**
 * Query keys for products
 */
export const productKeys = {
  all: ['products'],
  lists: () => [...productKeys.all, 'list'],
  list: (filters) => [...productKeys.lists(), filters],
  details: () => [...productKeys.all, 'detail'],
  detail: (slug) => [...productKeys.details(), slug],
  search: (query) => [...productKeys.all, 'search', query],
  featured: () => [...productKeys.all, 'featured'],
};

/**
 * Query keys for categories
 */
export const categoryKeys = {
  all: ['categories'],
  lists: () => [...categoryKeys.all, 'list'],
  detail: (slug) => [...categoryKeys.all, 'detail', slug],
};

/**
 * Hook to fetch products with filters
 * @param {Object} filters
 * @param {Object} [options] - React Query options
 */
export function useProducts(filters = {}, options = {}) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => getProducts(filters),
    ...options,
  });
}

/**
 * Hook to fetch single product by slug
 * @param {string} slug
 * @param {Object} [options] - React Query options
 */
export function useProduct(slug, options = {}) {
  return useQuery({
    queryKey: productKeys.detail(slug),
    queryFn: () => getProductBySlug(slug),
    enabled: !!slug,
    ...options,
  });
}

/**
 * Hook to search products
 * @param {string} query
 * @param {Object} [searchOptions]
 * @param {Object} [queryOptions] - React Query options
 */
export function useProductSearch(query, searchOptions = {}, queryOptions = {}) {
  return useQuery({
    queryKey: productKeys.search({ query, ...searchOptions }),
    queryFn: () => searchProducts(query, searchOptions),
    enabled: !!query && query.length >= 2,
    ...queryOptions,
  });
}

/**
 * Hook to fetch featured products
 * @param {number} [limit]
 * @param {Object} [options] - React Query options
 */
export function useFeaturedProducts(limit = 8, options = {}) {
  return useQuery({
    queryKey: productKeys.featured(),
    queryFn: () => getFeaturedProducts(limit),
    ...options,
  });
}

/**
 * Hook to fetch all categories
 * @param {Object} [options] - React Query options
 */
export function useCategories(options = {}) {
  return useQuery({
    queryKey: categoryKeys.lists(),
    queryFn: getCategories,
    staleTime: 5 * 60 * 1000, // Categories don't change often
    ...options,
  });
}

/**
 * Hook to fetch single category by slug
 * @param {string} slug
 * @param {Object} [options] - React Query options
 */
export function useCategory(slug, options = {}) {
  return useQuery({
    queryKey: categoryKeys.detail(slug),
    queryFn: () => getCategoryBySlug(slug),
    enabled: !!slug,
    ...options,
  });
}

import { useQuery } from '@tanstack/react-query';
import {
  getDashboardMetrics,
  getSalesData,
  getTopProducts,
  getCategoryBreakdown,
  getInventoryStatus,
  getOrdersBreakdown,
  getRevenueSummary,
} from '../services/analyticsService.js';

/**
 * Hook to fetch dashboard metrics
 * @param {string} period
 * @returns {import('@tanstack/react-query').UseQueryResult}
 */
export function useDashboardMetrics(period = 'month') {
  return useQuery({
    queryKey: ['analytics', 'dashboard', period],
    queryFn: () => getDashboardMetrics(period),
  });
}

/**
 * Hook to fetch sales data over time
 * @param {Object} params
 * @returns {import('@tanstack/react-query').UseQueryResult}
 */
export function useSalesData(params = {}) {
  return useQuery({
    queryKey: ['analytics', 'sales', params],
    queryFn: () => getSalesData(params),
  });
}

/**
 * Hook to fetch top products
 * @param {Object} params
 * @returns {import('@tanstack/react-query').UseQueryResult}
 */
export function useTopProducts(params = {}) {
  return useQuery({
    queryKey: ['analytics', 'topProducts', params],
    queryFn: () => getTopProducts(params),
  });
}

/**
 * Hook to fetch category breakdown
 * @param {string} period
 * @returns {import('@tanstack/react-query').UseQueryResult}
 */
export function useCategoryBreakdown(period = 'month') {
  return useQuery({
    queryKey: ['analytics', 'categories', period],
    queryFn: () => getCategoryBreakdown(period),
  });
}

/**
 * Hook to fetch inventory status
 * @returns {import('@tanstack/react-query').UseQueryResult}
 */
export function useInventoryStatus() {
  return useQuery({
    queryKey: ['analytics', 'inventory'],
    queryFn: getInventoryStatus,
  });
}

/**
 * Hook to fetch orders breakdown
 * @param {string} period
 * @returns {import('@tanstack/react-query').UseQueryResult}
 */
export function useOrdersBreakdown(period = 'month') {
  return useQuery({
    queryKey: ['analytics', 'orders', period],
    queryFn: () => getOrdersBreakdown(period),
  });
}

/**
 * Hook to fetch revenue summary
 * @param {string} period
 * @returns {import('@tanstack/react-query').UseQueryResult}
 */
export function useRevenueSummary(period = 'month') {
  return useQuery({
    queryKey: ['analytics', 'revenue', period],
    queryFn: () => getRevenueSummary(period),
  });
}

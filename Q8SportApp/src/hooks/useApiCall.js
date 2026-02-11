import { useState, useCallback, useRef, useEffect } from 'react';
import Logger from '../utils/logger';

/**
 * Custom hook for managing API loading states with automatic error recovery
 * Prevents infinite loading by ensuring loading state is always reset
 * 
 * @param {Function} apiFunction - Async function to call
 * @param {Object} options - Configuration options
 * @returns {Object} Loading state and fetch function
 */
export const useApiCall = (apiFunction, options = {}) => {
  const {
    initialLoading = false,
    onSuccess = null,
    onError = null,
    timeout = 30000, // 30 seconds default
    retries = 0,
  } = options;

  const [loading, setLoading] = useState(initialLoading);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const mountedRef = useRef(true);
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const execute = useCallback(async (...args) => {
    if (!mountedRef.current) return;

    setLoading(true);
    setError(null);

    // Setup timeout to force reset loading state
    timeoutRef.current = setTimeout(() => {
      if (mountedRef.current && loading) {
        Logger.warn('API call timeout - forcing loading state reset');
        setLoading(false);
        setError(new Error('انتهت مهلة الطلب'));
      }
    }, timeout);

    let attempts = 0;
    const maxAttempts = retries + 1;

    while (attempts < maxAttempts) {
      try {
        const result = await apiFunction(...args);
        
        if (mountedRef.current) {
          setData(result);
          setError(null);
          if (onSuccess) {
            onSuccess(result);
          }
        }
        
        clearTimeout(timeoutRef.current);
        if (mountedRef.current) {
          setLoading(false);
        }
        return result;
      } catch (err) {
        attempts++;
        
        if (attempts >= maxAttempts) {
          Logger.error('API call failed after retries:', err);
          
          if (mountedRef.current) {
            setError(err);
            if (onError) {
              onError(err);
            }
          }
          
          clearTimeout(timeoutRef.current);
          if (mountedRef.current) {
            setLoading(false);
          }
          throw err;
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
      }
    }
  }, [apiFunction, onSuccess, onError, timeout, retries, loading]);

  const reset = useCallback(() => {
    if (mountedRef.current) {
      setLoading(false);
      setError(null);
      setData(null);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
  }, []);

  return {
    loading,
    error,
    data,
    execute,
    reset,
  };
};

/**
 * Custom hook for paginated data fetching with loading states
 */
export const usePaginatedData = (fetchFunction, itemsPerPage = 10) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadData = useCallback(async (pageNum = 1, isRefreshing = false) => {
    if (!mountedRef.current) return;

    try {
      if (pageNum === 1) {
        isRefreshing ? setRefreshing(true) : setLoading(true);
      } else {
        setLoadingMore(true);
      }

      setError(null);
      const result = await fetchFunction(pageNum, itemsPerPage);
      
      if (!mountedRef.current) return;

      const newData = result.data || result;
      
      if (pageNum === 1) {
        setData(newData);
      } else {
        setData(prev => [...prev, ...newData]);
      }
      
      setPage(pageNum);
      setHasMore(newData.length >= itemsPerPage);
    } catch (err) {
      Logger.error('Paginated data load error:', err);
      if (mountedRef.current) {
        setError(err);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    }
  }, [fetchFunction, itemsPerPage]);

  const refresh = useCallback(() => {
    loadData(1, true);
  }, [loadData]);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore && !loading) {
      loadData(page + 1, false);
    }
  }, [loadData, page, loadingMore, hasMore, loading]);

  const reset = useCallback(() => {
    if (mountedRef.current) {
      setData([]);
      setPage(1);
      setHasMore(true);
      setError(null);
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, []);

  return {
    data,
    loading,
    refreshing,
    loadingMore,
    hasMore,
    error,
    loadData,
    refresh,
    loadMore,
    reset,
  };
};

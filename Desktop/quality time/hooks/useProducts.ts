import { useState, useEffect, useCallback } from 'react';
import { Product } from '../types';
import ProductService from '../services/ProductService';

interface UseProductsOptions {
  category?: string;
  searchQuery?: string;
  sortBy?: string;
  autoFetch?: boolean;
}

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createProduct: (productData: Omit<Product, 'id' | 'created_at'>) => Promise<Product>;
  updateProduct: (id: string, productData: Partial<Product>) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
  searchProducts: (query: string) => Promise<Product[]>;
  getProductsByCategory: (category: string) => Promise<Product[]>;
}

export const useProducts = (options: UseProductsOptions = {}): UseProductsReturn => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let fetchedProducts: Product[];
      
      if (options.category) {
        fetchedProducts = await ProductService.getProductsByCategory(options.category);
      } else if (options.searchQuery) {
        fetchedProducts = await ProductService.searchProducts(options.searchQuery);
      } else {
        fetchedProducts = await ProductService.getAllProducts();
      }
      
      // تطبيق الترتيب إذا تم تحديده
      if (options.sortBy) {
        const sortField = options.sortBy.startsWith('-') ? options.sortBy.substring(1) : options.sortBy;
        const order = options.sortBy.startsWith('-') ? 'desc' : 'asc';
        
        fetchedProducts.sort((a, b) => {
          let aValue = a[sortField as keyof Product];
          let bValue = b[sortField as keyof Product];

          if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = (bValue as string).toLowerCase();
          }

          if (order === 'asc') {
            return aValue > bValue ? 1 : -1;
          } else {
            return aValue < bValue ? 1 : -1;
          }
        });
      }
      
      setProducts(fetchedProducts);
    } catch (err: any) {
      setError(err.message || 'فشل في جلب المنتجات');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [options.category, options.searchQuery, options.sortBy]);

  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchProducts();
    }
  }, [fetchProducts, options.autoFetch]);

  const createProduct = async (productData: Omit<Product, 'id' | 'created_at'>): Promise<Product> => {
    try {
      const newProduct = await ProductService.createProduct(productData);
      setProducts(prev => [newProduct, ...prev]);
      return newProduct;
    } catch (err: any) {
      const errorMessage = err.message || 'فشل في إضافة المنتج';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>): Promise<Product> => {
    try {
      const updatedProduct = await ProductService.updateProduct(id, productData);
      setProducts(prev => 
        prev.map(product => 
          product.id === id ? updatedProduct : product
        )
      );
      return updatedProduct;
    } catch (err: any) {
      const errorMessage = err.message || 'فشل في تحديث المنتج';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteProduct = async (id: string): Promise<void> => {
    try {
      await ProductService.deleteProduct(id);
      setProducts(prev => prev.filter(product => product.id !== id));
    } catch (err: any) {
      const errorMessage = err.message || 'فشل في حذف المنتج';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const searchProducts = async (query: string): Promise<Product[]> => {
    try {
      return await ProductService.searchProducts(query);
    } catch (err: any) {
      const errorMessage = err.message || 'فشل في البحث عن المنتجات';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const getProductsByCategory = async (category: string): Promise<Product[]> => {
    try {
      return await ProductService.getProductsByCategory(category);
    } catch (err: any) {
      const errorMessage = err.message || 'فشل في جلب المنتجات حسب الفئة';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
    getProductsByCategory
  };
};

export default useProducts;

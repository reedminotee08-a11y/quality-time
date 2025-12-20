import { Product } from '../types';
import SupabaseService from './SupabaseService';

class ProductService {
  // جلب جميع المنتجات
  async getAllProducts(): Promise<Product[]> {
    try {
      return await SupabaseService.getAllProducts();
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error('فشل في جلب المنتجات');
    }
  }

  // جلب منتج واحد بالمعرف
  async getProductById(id: string): Promise<Product | null> {
    try {
      return await SupabaseService.getProductById(id);
    } catch (error) {
      console.error('Error fetching product:', error);
      throw new Error('فشل في جلب المنتج');
    }
  }

  // إضافة منتج جديد
  async createProduct(productData: Omit<Product, 'id' | 'created_at'>): Promise<Product> {
    try {
      return await SupabaseService.createProduct(productData);
    } catch (error) {
      console.error('Error creating product:', error);
      throw new Error('فشل في إضافة المنتج');
    }
  }

  // تحديث منتج موجود
  async updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
    try {
      return await SupabaseService.updateProduct(id, productData);
    } catch (error) {
      console.error('Error updating product:', error);
      throw new Error('فشل في تحديث المنتج');
    }
  }

  // حذف منتج
  async deleteProduct(id: string): Promise<void> {
    try {
      await SupabaseService.deleteProduct(id);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw new Error('فشل في حذف المنتج');
    }
  }

  // رفع صورة المنتج
  async uploadProductImage(file: File): Promise<string> {
    try {
      return await SupabaseService.uploadProductImage(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('فشل في رفع الصورة');
    }
  }

  // البحث عن المنتجات
  async searchProducts(query: string): Promise<Product[]> {
    try {
      return await SupabaseService.searchProducts(query);
    } catch (error) {
      console.error('Error searching products:', error);
      throw new Error('فشل في البحث عن المنتجات');
    }
  }

  // جلب المنتجات حسب الفئة
  async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      return await SupabaseService.getProductsByCategory(category);
    } catch (error) {
      console.error('Error fetching products by category:', error);
      throw new Error('فشل في جلب المنتجات حسب الفئة');
    }
  }
}

export default new ProductService();

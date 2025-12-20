import { supabase } from '../supabaseClient';
import { Product, Order, OrderItem, Review, CartItem } from '../types';

class SupabaseService {
  // === PRODUCTS ===
  
  async getAllProducts(): Promise<Product[]> {
    try {
      console.log('Fetching all products...');
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error fetching products:', error);
        throw error;
      }
      
      console.log('Products fetched:', data?.length || 0, 'products');
      return data || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error('فشل في جلب المنتجات');
    }
  }

  async getProductById(id: string): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw new Error('فشل في جلب المنتج');
    }
  }

  async createProduct(productData: Omit<Product, 'id' | 'created_at'>): Promise<Product> {
    try {
      console.log('Creating product with data:', JSON.stringify(productData, null, 2));
      
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();

      if (error) {
        console.error('Supabase error creating product:', error);
        throw error;
      }
      
      console.log('Product created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw new Error('فشل في إضافة المنتج');
    }
  }

  async updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw new Error('فشل في تحديث المنتج');
    }
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw new Error('فشل في حذف المنتج');
    }
  }

  async searchProducts(query: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .or(`name.ilike.%${query}%,brand.ilike.%${query}%,description.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching products:', error);
      throw new Error('فشل في البحث عن المنتجات');
    }
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .eq('category', category)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching products by category:', error);
      throw new Error('فشل في جلب المنتجات حسب الفئة');
    }
  }

  async uploadProductImage(file: File): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('فشل في رفع الصورة');
    }
  }

  // === ORDERS ===
  
  async createOrder(orderData: Omit<Order, 'id' | 'created_at'>): Promise<Order> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error('فشل في إنشاء الطلب');
    }
  }

  async getOrdersByUserId(userId: string): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw new Error('فشل في جلب الطلبات');
    }
  }

  async getAllOrders(): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching all orders:', error);
      throw new Error('فشل في جلب جميع الطلبات');
    }
  }

  async updateOrderStatus(id: string, status: Order['status']): Promise<Order> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          status,
          updated_at: new Date().toISOString(),
          ...(status === 'SHIPPED' && { shipped_at: new Date().toISOString() }),
          ...(status === 'DELIVERED' && { delivered_at: new Date().toISOString() })
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw new Error('فشل في تحديث حالة الطلب');
    }
  }

  // === CART ===
  
  async getCartItems(userId: string): Promise<CartItem[]> {
    try {
      const { data, error } = await supabase
        .from('cart')
        .select(`
          *,
          products:product_id(*)
        `)
        .eq('user_id', userId);

      if (error) throw error;
      
      return (data || []).map(item => ({
        ...item.products,
        quantity: item.quantity,
        addedAt: item.created_at
      })) as CartItem[];
    } catch (error) {
      console.error('Error fetching cart items:', error);
      throw new Error('فشل في جلب عناصر السلة');
    }
  }

  async addToCart(userId: string, productId: string, quantity: number = 1): Promise<void> {
    try {
      const { error } = await supabase
        .from('cart')
        .upsert({
          user_id: userId,
          product_id: productId,
          quantity,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,product_id'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw new Error('فشل في إضافة المنتج للسلة');
    }
  }

  async updateCartItem(userId: string, productId: string, quantity: number): Promise<void> {
    try {
      if (quantity <= 0) {
        await this.removeFromCart(userId, productId);
        return;
      }

      const { error } = await supabase
        .from('cart')
        .update({ 
          quantity,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('product_id', productId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw new Error('فشل في تحديث كمية المنتج');
    }
  }

  async removeFromCart(userId: string, productId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw new Error('فشل في حذف المنتج من السلة');
    }
  }

  async clearCart(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw new Error('فشل في تفريغ السلة');
    }
  }

  // === USER PROFILES ===
  
  async getUserProfile(userId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw new Error('فشل في جلب ملف المستخدم');
    }
  }

  async createUserProfile(profileData: any): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert([profileData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw new Error('فشل في إنشاء ملف المستخدم');
    }
  }

  async updateUserProfile(userId: string, profileData: any): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(profileData)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw new Error('فشل في تحديث ملف المستخدم');
    }
  }

  // === REVIEWS ===
  
  async createReview(reviewData: Omit<Review, 'id' | 'created_at'>): Promise<Review> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert([reviewData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating review:', error);
      throw new Error('فشل في إضافة التقييم');
    }
  }

  async getProductReviews(productId: string): Promise<Review[]> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching product reviews:', error);
      throw new Error('فشل في جلب تقييمات المنتج');
    }
  }

  async getUserReviews(userId: string): Promise<Review[]> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      throw new Error('فشل في جلب تقييمات المستخدم');
    }
  }

  // === WISHLIST ===
  
  async getWishlist(userId: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select(`
          *,
          products:product_id(*)
        `)
        .eq('user_id', userId);

      if (error) throw error;
      
      return (data || []).map(item => item.products) as Product[];
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      throw new Error('فشل في جلب قائمة الرغبات');
    }
  }

  async addToWishlist(userId: string, productId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('wishlist')
        .insert([{
          user_id: userId,
          product_id: productId
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw new Error('فشل في إضافة المنتج لقائمة الرغبات');
    }
  }

  async removeFromWishlist(userId: string, productId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw new Error('فشل في حذف المنتج من قائمة الرغبات');
    }
  }

  async isInWishlist(userId: string, productId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();

      if (error && error.code === 'PGRST116') return false; // Not found
      if (error) throw error;
      
      return !!data;
    } catch (error) {
      console.error('Error checking wishlist:', error);
      return false;
    }
  }

  // === CATEGORIES & BRANDS ===
  
  async getCategories(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw new Error('فشل في جلب الفئات');
    }
  }

  async getBrands(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching brands:', error);
      throw new Error('فشل في جلب الماركات');
    }
  }

  // === SETTINGS ===
  
  async getSettings(): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .order('key', { ascending: true });

      if (error) throw error;
      
      const settings: any = {};
      (data || []).forEach(setting => {
        settings[setting.key] = setting.value;
      });
      
      return settings;
    } catch (error) {
      console.error('Error fetching settings:', error);
      throw new Error('فشل في جلب الإعدادات');
    }
  }

  async updateSetting(key: string, value: any): Promise<void> {
    try {
      const { error } = await supabase
        .from('settings')
        .update({ 
          value,
          updated_at: new Date().toISOString()
        })
        .eq('key', key);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating setting:', error);
      throw new Error('فشل في تحديث الإعدادات');
    }
  }
}

export default new SupabaseService();

import { Product } from '../types';

// التحقق من صحة بيانات المنتج
export const validateProduct = (product: Partial<Product>): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  if (!product.name || product.name.trim().length < 2) {
    errors.name = 'اسم المنتج يجب أن يكون حرفين على الأقل';
  }

  if (!product.brand || product.brand.trim().length < 2) {
    errors.brand = 'اسم الماركة يجب أن يكون حرفين على الأقل';
  }

  if (!product.price || product.price <= 0) {
    errors.price = 'السعر يجب أن يكون أكبر من صفر';
  }

  if (product.old_price && product.old_price <= 0) {
    errors.old_price = 'السعر القديم يجب أن يكون أكبر من صفر';
  }

  if (product.stock_quantity === undefined || product.stock_quantity < 0) {
    errors.stock_quantity = 'المخزون لا يمكن أن يكون سالباً';
  }

  if (!product.category || product.category.trim().length < 2) {
    errors.category = 'الفئة مطلوبة';
  }

  if (!product.images || product.images.length === 0) {
    errors.images = 'يجب رفع صورة واحدة على الأقل';
  }

  // التحقق من صحة روابط الصور
  if (product.images) {
    product.images.forEach((image, index) => {
      if (!image || !image.trim()) {
        errors[`image_${index}`] = `الصورة ${index + 1} غير صالحة`;
      } else if (!isValidUrl(image.trim())) {
        errors[`image_${index}`] = `رابط الصورة ${index + 1} غير صالح`;
      }
    });
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// التحقق من صحة الرابط
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// تنسيق السعر للعرض
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('ar-DZ', {
    style: 'currency',
    currency: 'DZD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price).replace('د.ج.‏', 'دج');
};

// حساب نسبة الخصم
export const calculateDiscountPercentage = (oldPrice: number, newPrice: number): number => {
  if (!oldPrice || oldPrice <= newPrice) return 0;
  return Math.round(((oldPrice - newPrice) / oldPrice) * 100);
};

// الحصول على حالة المخزون
export const getStockStatus = (quantity: number): {
  text: string;
  color: string;
  bgColor: string;
  borderColor: string;
  isLow: boolean;
  isOutOfStock: boolean;
} => {
  if (quantity === 0) {
    return {
      text: 'نفذت الكمية',
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20',
      isLow: false,
      isOutOfStock: true
    };
  }

  if (quantity <= 3) {
    return {
      text: `متبقي ${quantity} قطع`,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
      isLow: true,
      isOutOfStock: false
    };
  }

  return {
    text: 'متوفر',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    isLow: false,
    isOutOfStock: false
  };
};

// البحث في المنتجات
export const searchProducts = (products: Product[], query: string): Product[] => {
  if (!query.trim()) return products;

  const searchTerm = query.toLowerCase().trim();
  
  return products.filter(product => {
    return (
      product.name.toLowerCase().includes(searchTerm) ||
      product.brand.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm)
    );
  });
};

// فلترة المنتجات حسب الفئة
export const filterProductsByCategory = (products: Product[], category: string): Product[] => {
  if (!category || category === 'الكل') return products;
  
  return products.filter(product => product.category === category);
};

// فلترة المنتجات حسب نطاق السعر
export const filterProductsByPriceRange = (
  products: Product[], 
  minPrice: number, 
  maxPrice: number
): Product[] => {
  return products.filter(product => 
    product.price >= minPrice && product.price <= maxPrice
  );
};

// ترتيب المنتجات
export const sortProducts = (
  products: Product[], 
  sortBy: string, 
  sortOrder: 'asc' | 'desc' = 'desc'
): Product[] => {
  const sorted = [...products];
  
  const sortField = sortBy.startsWith('-') ? sortBy.substring(1) : sortBy;
  const order = sortBy.startsWith('-') ? 'desc' : sortOrder;

  sorted.sort((a, b) => {
    let aValue = a[sortField as keyof Product];
    let bValue = b[sortField as keyof Product];

    // التعامل مع القيم النصية
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    // التعامل مع القيم الرقمية
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return order === 'asc' ? aValue - bValue : bValue - aValue;
    }

    // التعامل مع القيم النصية
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const comparison = aValue.localeCompare(bValue, 'ar');
      return order === 'asc' ? comparison : -comparison;
    }

    // القيم الافتراضية
    return 0;
  });

  return sorted;
};

// الحصول على المنتجات الأكثر مبيعاً (محاكاة)
export const getBestSellingProducts = (products: Product[], limit: number = 8): Product[] => {
  // في تطبيق حقيقي، سيتم هذا بناءً على بيانات المبيعات الفعلية
  // هنا نقوم بترتيب عشوائي للمحاكاة
  return [...products]
    .sort(() => Math.random() - 0.5)
    .slice(0, limit);
};

// الحصول على المنتجات الجديدة
export const getNewProducts = (products: Product[], limit: number = 8): Product[] => {
  return [...products]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit);
};

// الحصول على المنتجات المميزة
export const getFeaturedProducts = (products: Product[], limit: number = 8): Product[] => {
  // في تطبيق حقيقي، سيتم هذا بناءً على حقل مخصص في المنتج
  // هنا نختار المنتجات ذات السعر الأعلى كمثال
  return [...products]
    .sort((a, b) => b.price - a.price)
    .slice(0, limit);
};

// الحصول على المنتجات المشابهة
export const getSimilarProducts = (product: Product, allProducts: Product[], limit: number = 4): Product[] => {
  return allProducts
    .filter(p => 
      p.id !== product.id && 
      (p.category === product.category || p.brand === product.brand)
    )
    .sort((a, b) => {
      // الأولوية لنفس الفئة ثم نفس الماركة
      const aScore = (a.category === product.category ? 2 : 0) + (a.brand === product.brand ? 1 : 0);
      const bScore = (b.category === product.category ? 2 : 0) + (b.brand === product.brand ? 1 : 0);
      return bScore - aScore;
    })
    .slice(0, limit);
};

// حساب متوسط تقييمات المنتج (محاكاة)
export const calculateAverageRating = (product: Product): number => {
  // في تطبيق حقيقي، سيتم هذا بناءً على بيانات التقييمات الفعلية
  // هنا نقوم بإنشاء تقييم عشوائي للمحاكاة
  return Math.round((Math.random() * 2 + 3) * 10) / 10; // بين 3.0 و 5.0
};

// توليد slug للمنتج
export const generateProductSlug = (product: Product): string => {
  return product.name
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

// التحقق مما إذا كان المنتج في الخصم
export const isOnSale = (product: Product): boolean => {
  return !!(product.old_price && product.old_price > product.price);
};

// الحصول على سعر المنتج مع العملة
export const getProductPrice = (product: Product): { current: string; old?: string; discount?: number } => {
  const current = formatPrice(product.price);
  const result: { current: string; old?: string; discount?: number } = { current };

  if (product.old_price && product.old_price > product.price) {
    result.old = formatPrice(product.old_price);
    result.discount = calculateDiscountPercentage(product.old_price, product.price);
  }

  return result;
};

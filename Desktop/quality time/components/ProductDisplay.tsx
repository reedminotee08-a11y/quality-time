import React, { useState, useEffect } from 'react';
import { Search, Filter, Grid, List, ShoppingCart, Star, Crown, Eye } from 'lucide-react';
import ProductCard from './ProductCard';
import Button from './Button';
import ProductService from '../services/ProductService';
import { Product } from '../types';

interface ProductDisplayProps {
  addToCart: (product: Product) => void;
  viewMode?: 'grid' | 'list';
  showFilters?: boolean;
  category?: string;
  searchQuery?: string;
}

const ProductDisplay: React.FC<ProductDisplayProps> = ({ 
  addToCart, 
  viewMode: initialViewMode = 'grid',
  showFilters = true,
  category,
  searchQuery
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(initialViewMode);
  const [searchTerm, setSearchTerm] = useState(searchQuery || '');
  const [selectedCategory, setSelectedCategory] = useState(category || '');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000000 });

  // الفئات المتاحة
  const categories = [
    'الكل',
    'ساعات رجالية',
    'ساعات نسائية',
    'ساعات ذكية',
    'ساعات كلاسيكية',
    'ساعات رياضية'
  ];

  // خيارات الترتيب
  const sortOptions = [
    { value: 'created_at', label: 'الأحدث أولاً' },
    { value: 'price', label: 'السعر: من الأقل للأعلى' },
    { value: '-price', label: 'السعر: من الأعلى للأقل' },
    { value: 'name', label: 'الاسم: أ-ي' },
    { value: 'stock_quantity', label: 'المخزون: الأكثر أولاً' }
  ];

  // جلب المنتجات
  useEffect(() => {
    fetchProducts();
  }, []);

  // تطبيق الفلاتر
  useEffect(() => {
    applyFilters();
  }, [products, searchTerm, selectedCategory, sortBy, sortOrder, priceRange]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const fetchedProducts = await ProductService.getAllProducts();
      setProducts(fetchedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    // فلترة البحث
    if (searchTerm.trim()) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // فلترة الفئة
    if (selectedCategory && selectedCategory !== 'الكل') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // فلترة السعر
    filtered = filtered.filter(product =>
      product.price >= priceRange.min && product.price <= priceRange.max
    );

    // الترتيب
    const sortField = sortBy.startsWith('-') ? sortBy.substring(1) : sortBy;
    const order = sortBy.startsWith('-') ? 'desc' : 'asc';
    
    filtered.sort((a, b) => {
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

    setFilteredProducts(filtered);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSortBy('created_at');
    setPriceRange({ min: 0, max: 1000000 });
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { text: 'نفذت الكمية', color: 'text-red-400' };
    if (quantity <= 3) return { text: 'متبقي قليل', color: 'text-amber-400' };
    return { text: 'متوفر', color: 'text-emerald-400' };
  };

  // عرض حالة التحميل
  if (loading) {
    return (
      <div className="min-h-screen bg-[#050b18] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h3 className="text-lg font-bold text-white mb-2">جاري تحميل المنتجات</h3>
          <p className="text-gray-400">يرجى الانتظار...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050b18] text-white" dir="rtl">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 md:py-8">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-[#c5a059] text-xs md:text-sm font-bold uppercase tracking-[0.3em] mb-3">Our Collection</h2>
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4">تشكيلة الساعات الفاخرة</h1>
          <div className="w-24 h-1 bg-[#c5a059] mx-auto rounded-full"></div>
        </div>

        {/* الفلاتر والبحث */}
        {showFilters && (
          <div className="bg-[#0a1128]/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8">
            <form onSubmit={handleSearch} className="space-y-6">
              {/* البحث */}
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="ابحث عن منتج..."
                      className="w-full pr-12 pl-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white focus:outline-none focus:border-gold transition-colors"
                    />
                  </div>
                </div>
                <Button type="submit" variant="primary">
                  <Search size={18} className="ml-2" />
                  بحث
                </Button>
                <Button type="button" variant="secondary" onClick={clearFilters}>
                  مسح الفلاتر
                </Button>
              </div>

              {/* الفلاتر المتقدمة */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* الفئة */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">الفئة</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white focus:outline-none focus:border-gold transition-colors"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* الترتيب */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">الترتيب حسب</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white focus:outline-none focus:border-gold transition-colors"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                {/* نطاق السعر */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">السعر الأدنى</label>
                  <input
                    type="number"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white focus:outline-none focus:border-gold transition-colors"
                    min="0"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">السعر الأعلى</label>
                  <input
                    type="number"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white focus:outline-none focus:border-gold transition-colors"
                    min="0"
                    placeholder="1000000"
                  />
                </div>
              </div>
            </form>
          </div>
        )}

        {/* عرض النتائج ووضع العرض */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-gray-400">
            {filteredProducts.length === 0 
              ? 'لا توجد منتجات مطابقة' 
              : `عرض ${filteredProducts.length} منتج`
            }
          </div>
          <div className="flex bg-black/30 border border-white/10 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-3 ${viewMode === 'grid' ? 'bg-gold/20 text-gold' : 'text-gray-400 hover:text-white'}`}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-3 ${viewMode === 'list' ? 'bg-gold/20 text-gold' : 'text-gray-400 hover:text-white'}`}
            >
              <List size={18} />
            </button>
          </div>
        </div>

        {/* عرض المنتجات */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <Filter size={48} className="text-gray-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">لا توجد منتجات</h3>
            <p className="text-gray-400 mb-8">لم يتم العثور على منتجات مطابقة للفلاتر المحددة</p>
            <Button variant="primary" onClick={clearFilters}>
              مسح الفلاتر
            </Button>
          </div>
        ) : viewMode === 'grid' ? (
          /* عرض الشبكة */
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 justify-items-center">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                image={product.images?.[0] || 'https://via.placeholder.com/400x400'}
                title={product.name}
                price={Number(product.price)}
                brand={product.brand}
                stock={product.stock_quantity}
                onAddToCart={() => addToCart(product)}
              />
            ))}
          </div>
        ) : (
          /* عرض القائمة */
          <div className="bg-[#0a1128]/50 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-black/30 border-b border-white/10">
                  <tr>
                    <th className="p-6 font-bold text-gray-400 text-sm uppercase tracking-wider">المنتج</th>
                    <th className="p-6 font-bold text-gray-400 text-sm uppercase tracking-wider">الماركة</th>
                    <th className="p-6 font-bold text-gray-400 text-sm uppercase tracking-wider">السعر</th>
                    <th className="p-6 font-bold text-gray-400 text-sm uppercase tracking-wider">المخزون</th>
                    <th className="p-6 font-bold text-gray-400 text-sm uppercase tracking-wider">الحالة</th>
                    <th className="p-6 font-bold text-gray-400 text-sm uppercase tracking-wider">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => {
                    const stockStatus = getStockStatus(product.stock_quantity);
                    return (
                      <tr key={product.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-6">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-black/30 rounded-lg border border-white/10 overflow-hidden flex-shrink-0">
                              <img 
                                src={product.images?.[0] || 'https://via.placeholder.com/400x400'} 
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <h3 className="font-bold text-white mb-1">{product.name}</h3>
                              {product.category && (
                                <div className="text-sm text-gray-400">{product.category}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="font-bold text-gold">{product.brand}</div>
                        </td>
                        <td className="p-6">
                          <div className="font-bold text-gold text-lg">
                            {Number(product.price).toLocaleString()} دج
                          </div>
                          {product.old_price > 0 && (
                            <div className="text-sm text-gray-500 line-through">
                              {Number(product.old_price).toLocaleString()} دج
                            </div>
                          )}
                        </td>
                        <td className="p-6">
                          <div className="text-lg font-bold">{product.stock_quantity}</div>
                          <div className="text-xs text-gray-500">قطعة</div>
                        </td>
                        <td className="p-6">
                          <div className={`font-bold ${stockStatus.color}`}>
                            {stockStatus.text}
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => window.open(`/product/${product.id}`, '_blank')}
                            >
                              <Eye size={16} className="ml-1" />
                              عرض
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => addToCart(product)}
                              disabled={product.stock_quantity === 0}
                            >
                              <ShoppingCart size={16} className="ml-1" />
                              إضافة
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDisplay;

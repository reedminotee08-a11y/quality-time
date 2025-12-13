import React, { useState, useEffect } from 'react';
import { supabase, uploadImage } from '../../lib/supabase';
import { Product } from '../../types';
import { 
  Plus, Edit, Trash2, Search, Filter, Grid, List, 
  Package, Camera, X, Save, Eye, Copy, Share2,
  AlertTriangle, CheckCircle, XCircle, Loader2
} from 'lucide-react';

interface ProductManagementProps {
  onProductUpdate?: () => void;
}

export const ProductManagement: React.FC<ProductManagementProps> = ({ onProductUpdate }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: '', 
    brand: '', 
    price: 0, 
    description: '', 
    stock_quantity: 0, 
    specs: {}, 
    images: []
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let query = supabase.from('products').select('*');
      
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%`);
      }
      
      if (filterCategory !== 'all') {
        query = query.eq('brand', filterCategory);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let imageUrls = editingProduct?.images || [];
      
      // Upload new images
      if (imageFiles.length > 0) {
        const uploadPromises = imageFiles.map(async (file) => {
          const url = await uploadImage(file);
          return url;
        });
        
        const newUrls = await Promise.all(uploadPromises);
        imageUrls = [...newUrls, ...imageUrls];
      }
      
      const productData = {
        ...productForm,
        images: imageUrls,
        price: Number(productForm.price),
        stock_quantity: Number(productForm.stock_quantity)
      };
      
      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData]);
        
        if (error) throw error;
      }
      
      setIsModalOpen(false);
      resetForm();
      fetchProducts();
      onProductUpdate?.();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('خطأ في حفظ المنتج');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    
    try {
      await supabase.from('products').delete().eq('id', id);
      fetchProducts();
      onProductUpdate?.();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('خطأ في حذف المنتج');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;
    if (!window.confirm(`هل أنت متأكد من حذف ${selectedProducts.length} منتج؟`)) return;
    
    try {
      await supabase.from('products').delete().in('id', selectedProducts);
      setSelectedProducts([]);
      fetchProducts();
      onProductUpdate?.();
    } catch (error) {
      console.error('Error bulk deleting products:', error);
      alert('خطأ في حذف المنتجات');
    }
  };

  const handleDuplicateProduct = async (product: Product) => {
    try {
      const duplicatedProduct = {
        ...product,
        name: `${product.name} (نسخة)`,
        id: undefined,
        created_at: undefined
      };
      
      delete duplicatedProduct.id;
      delete duplicatedProduct.created_at;
      
      const { error } = await supabase.from('products').insert([duplicatedProduct]);
      if (error) throw error;
      
      fetchProducts();
      onProductUpdate?.();
    } catch (error) {
      console.error('Error duplicating product:', error);
      alert('خطأ في نسخ المنتج');
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setProductForm({
      name: '', 
      brand: '', 
      price: 0, 
      description: '', 
      stock_quantity: 0, 
      specs: {}, 
      images: []
    });
    setImageFiles([]);
    setUploadProgress(0);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setProductForm(product);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { status: 'نفد المخزون', color: 'red', icon: XCircle };
    if (quantity < 5) return { status: 'مخزون منخفض', color: 'yellow', icon: AlertTriangle };
    return { status: 'متوفر', color: 'green', icon: CheckCircle };
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.brand === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const uniqueBrands = Array.from(new Set(products.map(p => p.brand)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">إدارة المنتجات</h2>
          <p className="text-gray-400 text-sm mt-1">إدارة وتحديث كتالوج الساعات</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={handleBulkDelete}
            disabled={selectedProducts.length === 0}
            className="bg-red-500/10 hover:bg-red-500/20 text-red-500 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" /> حذف المحدد ({selectedProducts.length})
          </button>
          
          <button 
            onClick={openAddModal}
            className="bg-gold-500 hover:bg-gold-400 text-dark-900 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors shadow-lg shadow-gold-500/10"
          >
            <Plus className="w-4 h-4" /> إضافة منتج
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-dark-700/50 p-4 rounded-xl border border-white/5">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1 lg:max-w-md">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="بحث عن منتج..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-dark-900/50 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white outline-none focus:border-gold-500 transition-colors"
            />
          </div>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-dark-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-gold-500 transition-colors"
          >
            <option value="all">كل العلامات التجارية</option>
            {uniqueBrands.map(brand => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
          
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 rounded-lg transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-gold-500 text-dark-900' 
                  : 'bg-dark-900/50 text-gray-400 hover:text-white'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2.5 rounded-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-gold-500 text-dark-900' 
                  : 'bg-dark-900/50 text-gray-400 hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid/List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-12 h-12 text-gold-500 animate-spin" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-dark-700/30 rounded-xl border border-white/5">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-500 opacity-50" />
          <p className="text-gray-400 text-lg">لا توجد منتجات</p>
          <p className="text-gray-500 text-sm mt-2">أضف منتجك الأول للبدء</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => {
            const stockStatus = getStockStatus(product.stock_quantity);
            const StatusIcon = stockStatus.icon;
            
            return (
              <div key={product.id} className="bg-dark-700/50 rounded-xl border border-white/5 overflow-hidden group hover:border-gold-500/30 transition-all">
                {/* Checkbox */}
                <div className="absolute top-3 left-3 z-10">
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedProducts([...selectedProducts, product.id]);
                      } else {
                        setSelectedProducts(selectedProducts.filter(id => id !== product.id));
                      }
                    }}
                    className="w-4 h-4 rounded border-white/20 bg-dark-900/50 text-gold-500 focus:ring-gold-500 focus:ring-offset-0"
                  />
                </div>
                
                {/* Product Image */}
                <div className="aspect-square bg-dark-900 relative overflow-hidden">
                  <img
                    src={product.images?.[0] || 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=600'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  
                  {/* Stock Status Badge */}
                  <div className="absolute top-3 right-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-${stockStatus.color}-500/10 text-${stockStatus.color}-500 border border-${stockStatus.color}-500/20`}>
                      <StatusIcon className="w-3 h-3" />
                      {stockStatus.status}
                    </span>
                  </div>
                  
                  {/* Actions Overlay */}
                  <div className="absolute inset-0 bg-dark-900/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 p-4">
                    <button
                      onClick={() => openEditModal(product)}
                      className="p-2 bg-gold-500/20 hover:bg-gold-500/30 text-gold-500 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDuplicateProduct(product)}
                      className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Product Info */}
                <div className="p-4">
                  <div className="mb-2">
                    <p className="text-xs text-gold-500 font-bold tracking-widest uppercase">{product.brand}</p>
                    <h3 className="text-white font-medium mt-1 truncate">{product.name}</h3>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-lg font-bold text-gold-500">{product.price.toLocaleString()} د.ج</p>
                      <p className="text-xs text-gray-500">المخزون: {product.stock_quantity}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-dark-700/30 rounded-xl border border-white/5 overflow-hidden">
          <table className="w-full">
            <thead className="bg-dark-900/50 text-gray-400 font-medium uppercase text-xs tracking-wider border-b border-white/5">
              <tr>
                <th className="p-4 text-right">
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === filteredProducts.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedProducts(filteredProducts.map(p => p.id));
                      } else {
                        setSelectedProducts([]);
                      }
                    }}
                    className="w-4 h-4 rounded border-white/20 bg-dark-900/50 text-gold-500 focus:ring-gold-500 focus:ring-offset-0"
                  />
                </th>
                <th className="p-4 text-right">المنتج</th>
                <th className="p-4 text-right">السعر</th>
                <th className="p-4 text-right">المخزون</th>
                <th className="p-4 text-right">الحالة</th>
                <th className="p-4 text-right">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredProducts.map(product => {
                const stockStatus = getStockStatus(product.stock_quantity);
                const StatusIcon = stockStatus.icon;
                
                return (
                  <tr key={product.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProducts([...selectedProducts, product.id]);
                          } else {
                            setSelectedProducts(selectedProducts.filter(id => id !== product.id));
                          }
                        }}
                        className="w-4 h-4 rounded border-white/20 bg-dark-900/50 text-gold-500 focus:ring-gold-500 focus:ring-offset-0"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg bg-dark-900 border border-white/10 overflow-hidden flex-shrink-0">
                          <img
                            src={product.images?.[0] || 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=600'}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-white font-medium">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-gold-500 font-medium">{product.price.toLocaleString()} د.ج</p>
                    </td>
                    <td className="p-4">
                      <p className="text-white">{product.stock_quantity} قطعة</p>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-${stockStatus.color}-500/10 text-${stockStatus.color}-500 border border-${stockStatus.color}-500/20`}>
                        <StatusIcon className="w-3 h-3" />
                        {stockStatus.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-2 bg-dark-900 border border-white/10 rounded-lg hover:border-blue-400 hover:text-blue-400 text-gray-400 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDuplicateProduct(product)}
                          className="p-2 bg-dark-900 border border-white/10 rounded-lg hover:border-green-400 hover:text-green-400 text-gray-400 transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-2 bg-dark-900 border border-white/10 rounded-lg hover:border-red-400 hover:text-red-400 text-gray-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="bg-dark-800 w-full max-w-4xl rounded-xl border border-white/10 max-h-[90vh] overflow-y-auto relative z-10 shadow-2xl">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-dark-700/50">
              <div>
                <h2 className="text-xl text-white font-serif font-bold">
                  {editingProduct ? 'تعديل الساعة' : 'إضافة ساعة جديدة'}
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  {editingProduct ? 'تحديث تفاصيل المنتج' : 'إضافة منتج جديد للكتالوج'}
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white p-2 hover:bg-white/5 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveProduct} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">اسم المنتج *</label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                    className="w-full bg-dark-900 border border-white/10 p-3 rounded-lg text-white outline-none focus:border-gold-500 transition-colors"
                    placeholder="مثال: Royal Oak Chronograph"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">العلامة التجارية *</label>
                  <input
                    type="text"
                    required
                    value={productForm.brand}
                    onChange={(e) => setProductForm({...productForm, brand: e.target.value})}
                    className="w-full bg-dark-900 border border-white/10 p-3 rounded-lg text-white outline-none focus:border-gold-500 transition-colors"
                    placeholder="مثال: Audemars Piguet"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">السعر (د.ج) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500 font-serif">د.ج</span>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={productForm.price}
                      onChange={(e) => setProductForm({...productForm, price: parseFloat(e.target.value)})}
                      className="w-full bg-dark-900 border border-white/10 p-3 pl-16 rounded-lg text-white outline-none focus:border-gold-500 transition-colors"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">كمية المخزون *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={productForm.stock_quantity}
                    onChange={(e) => setProductForm({...productForm, stock_quantity: parseInt(e.target.value)})}
                    className="w-full bg-dark-900 border border-white/10 p-3 rounded-lg text-white outline-none focus:border-gold-500 transition-colors"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">الوصف *</label>
                <textarea
                  required
                  rows={4}
                  value={productForm.description}
                  onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                  className="w-full bg-dark-900 border border-white/10 p-3 rounded-lg text-white outline-none focus:border-gold-500 transition-colors resize-none"
                  placeholder="وصف تفصيلي للساعة يشمل الميزات، المواد، التصميم..."
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">المواصفات الفنية</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="الحركة: Automatic"
                    className="w-full bg-dark-900 border border-white/10 p-3 rounded-lg text-white outline-none focus:border-gold-500 transition-colors"
                  />
                  <input
                    type="text"
                    placeholder="مقاومة الماء: 100m"
                    className="w-full bg-dark-900 border border-white/10 p-3 rounded-lg text-white outline-none focus:border-gold-500 transition-colors"
                  />
                  <input
                    type="text"
                    placeholder="المادة: Stainless Steel"
                    className="w-full bg-dark-900 border border-white/10 p-3 rounded-lg text-white outline-none focus:border-gold-500 transition-colors"
                  />
                  <input
                    type="text"
                    placeholder="القطر: 42mm"
                    className="w-full bg-dark-900 border border-white/10 p-3 rounded-lg text-white outline-none focus:border-gold-500 transition-colors"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">الصور</label>
                <div className="border-2 border-dashed border-white/10 rounded-lg p-8 text-center hover:border-gold-500/50 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
                    className="hidden"
                    id="product-images"
                  />
                  <label htmlFor="product-images" className="cursor-pointer">
                    <Camera className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                    <p className="text-white font-medium mb-2">رفع صور المنتج</p>
                    <p className="text-gray-500 text-sm mb-4">PNG, JPG, GIF حتى 10MB. يمكنك رفع عدة صور.</p>
                    <div className="bg-gold-500/10 text-gold-500 px-4 py-2 rounded-lg inline-block font-medium hover:bg-gold-500/20 transition-colors">
                      اختر الصور
                    </div>
                  </label>
                  
                  {imageFiles.length > 0 && (
                    <div className="mt-4 text-left">
                      <p className="text-sm text-gray-400 mb-2">الصور المختارة:</p>
                      <div className="space-y-1">
                        {imageFiles.map((file, index) => (
                          <div key={index} className="text-xs text-gray-500 bg-dark-900/50 p-2 rounded">
                            {file.name} ({(file.size / 1024 / 1024).toFixed(2)}MB)
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-white/10">
                <div className="text-sm text-gray-500">
                  * الحقول الإلزامية
                </div>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-2 rounded-lg font-medium text-gray-400 hover:text-white transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-gold-500 text-dark-900 px-6 py-2 rounded-lg font-bold hover:bg-gold-400 shadow-lg shadow-gold-500/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : 'حفظ التغييرات'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

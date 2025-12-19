import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { 
  Package, 
  LayoutDashboard, 
  ShoppingCart, 
  TrendingUp, 
  Clock, 
  AlertCircle,
  LogOut, 
  PlusCircle, 
  ListOrdered, 
  DollarSign, 
  Menu, 
  X, 
  Loader2, 
  BarChart3, 
  Users,
  Edit2, 
  Trash2, 
  ImageIcon,
  Upload,
  Tag,
  Boxes,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  Eye,
  MoreVertical,
  Shield,
  AlertTriangle,
  CheckCircle,
  Download,
  Grid,
  List
} from 'lucide-react';
import Button from '../components/Button';
import { Product } from '../types';
import { useToast } from '../App';

const AdminProducts: React.FC = () => {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const s = (val: any): string => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'object') {
      try { return val.name || val.id || JSON.stringify(val); } catch (e) { return 'Object'; }
    }
    return String(val);
  };

  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    price: 0,
    old_price: 0,
    description: '',
    stock_quantity: 0,
    category: '',
    images: [''],
    specs: {}
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        setProducts(data);
      }
    } catch (error: any) {
      showToast('خطأ في تحميل المنتجات: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };


  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = '/login';
    } catch (error) {
      showToast('خطأ في تسجيل الخروج', 'error');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // التحقق من حجم الصورة
    if (file.size > 5 * 1024 * 1024) {
      showToast('حجم الصورة يجب أن يكون أقل من 5MB', 'error');
      return;
    }

    // التحقق من نوع الصورة
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showToast('يرجى رفع صورة بصيغة JPEG, PNG أو WebP', 'error');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('uploads')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, images: [publicUrl] }));
      showToast('تم رفع الصورة بنجاح', 'success');
    } catch (error: any) {
      console.error('Upload error:', error);
      showToast('خطأ أثناء الرفع: ' + error.message, 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.images[0] || formData.images[0].trim() === '') {
      showToast('يرجى رفع صورة للمنتج', 'error');
      return;
    }

    if (formData.price <= 0) {
      showToast('يرجى إدخال سعر صحيح', 'error');
      return;
    }

    if (formData.stock_quantity < 0) {
      showToast('المخزون لا يمكن أن يكون سالباً', 'error');
      return;
    }

    const dataToSave = {
      ...formData,
      images: formData.images.filter(img => img && img.trim() !== ''),
      specs: formData.specs || {},
      updated_at: new Date().toISOString()
    };

    try {
      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(dataToSave)
          .eq('id', editingProduct.id);
        
        if (error) throw error;
        
        showToast('تم تحديث المنتج بنجاح', 'success');
      } else {
        const { error } = await supabase
          .from('products')
          .insert([{ ...dataToSave, created_at: new Date().toISOString() }]);
        
        if (error) throw error;
        
        showToast('تم إضافة المنتج بنجاح', 'success');
      }
      
      setIsModalOpen(false);
      fetchProducts();
    } catch (error: any) {
      showToast('خطأ في حفظ المنتج: ' + error.message, 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      showToast('تم حذف المنتج بنجاح', 'info');
      fetchProducts();
      setShowDeleteConfirm(null);
    } catch (error: any) {
      showToast('خطأ في حذف المنتج: ' + error.message, 'error');
    }
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: s(p.name),
      brand: s(p.brand),
      price: Number(p.price),
      old_price: Number(p.old_price || 0),
      description: s(p.description),
      stock_quantity: p.stock_quantity,
      category: s(p.category),
      images: p.images.length > 0 ? p.images : [''],
      specs: p.specs || {}
    });
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({ 
      name: '', 
      brand: '', 
      price: 0, 
      old_price: 0, 
      description: '', 
      stock_quantity: 10, 
      category: '', 
      images: [''], 
      specs: {} 
    });
    setIsModalOpen(true);
  };

  const exportProducts = async () => {
    try {
      const csvContent = [
        ['الاسم', 'الماركة', 'السعر', 'المخزون', 'الفئة', 'تاريخ الإضافة'],
        ...products.map(p => [
          s(p.name),
          s(p.brand),
          Number(p.price).toLocaleString(),
          p.stock_quantity,
          s(p.category),
          new Date(p.created_at).toLocaleDateString('ar-DZ')
        ])
      ].map(row => row.join(',')).join('\n');
      
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `products_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showToast('تم تصدير البيانات بنجاح', 'success');
    } catch (error) {
      showToast('خطأ في تصدير البيانات', 'error');
    }
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { text: 'نفذت الكمية', color: 'bg-red-500/10 text-red-500 border-red-500/10' };
    if (quantity <= 5) return { text: 'مخزون قليل', color: 'bg-amber-500/10 text-amber-500 border-amber-500/10' };
    return { text: 'متوفر', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050b18] to-[#0a1128] text-white flex flex-col md:flex-row">
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[55] md:hidden animate-in fade-in duration-200"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 right-0 h-screen w-64 bg-[#0a1128]/90 backdrop-blur-xl border-l border-white/10 flex flex-col z-[58] shadow-2xl transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
        <div className="p-8 border-b border-white/10">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img 
                src="https://mayiosolklryjbxxfohi.supabase.co/storage/v1/object/public/logo/logo.png" 
                alt="Logo" 
                className="w-16 h-16 filter brightness-110"
              />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gold rounded-full border-2 border-[#0a1128]"></div>
            </div>
            <div className="text-center">
              <span className="text-[10px] font-black text-gold tracking-[0.3em] uppercase block">Inventory Panel</span>
              <span className="text-[8px] text-gray-500 font-medium mt-1 block">V 1.0.0</span>
            </div>
          </div>
        </div>
        
        <nav className="flex-grow p-6 space-y-2 text-right">
          <div className="mb-4">
            <div className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-3 px-2">القائمة الرئيسية</div>
            <Link 
              to="/admin/dashboard" 
              className="flex flex-row-reverse items-center gap-4 p-4 text-gray-400 hover:text-white hover:bg-white/5 transition-all rounded-lg group"
            >
              <LayoutDashboard size={20} className="group-hover:scale-110 transition-transform" />
              <span className="font-medium">لوحة التحكم</span>
            </Link>
            <Link 
              to="/admin/products" 
              className="flex flex-row-reverse items-center gap-4 p-4 bg-gradient-to-l from-gold/20 to-transparent text-gold border-r-2 border-gold font-bold rounded-lg shadow-lg shadow-gold/10"
            >
              <Package size={20} />
              <span>المنتجات</span>
              <span className="mr-auto bg-gold/20 text-gold text-xs px-2 py-1 rounded-full">
                {products.length}
              </span>
            </Link>
            <Link 
              to="/admin/orders" 
              className="flex flex-row-reverse items-center gap-4 p-4 text-gray-400 hover:text-white hover:bg-white/5 transition-all rounded-lg group"
            >
              <ShoppingCart size={20} className="group-hover:scale-110 transition-transform" />
              <span className="font-medium">الطلبات</span>
            </Link>
          </div>
          
          <div className="mt-8">
            <div className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-3 px-2">إحصائيات سريعة</div>
            <div className="space-y-2">
              <div className="p-3 bg-white/5 rounded-lg">
                <div className="text-xs text-gray-400">إجمالي المنتجات</div>
                <div className="text-lg font-bold text-white">{products.length}</div>
              </div>
              <div className="p-3 bg-white/5 rounded-lg">
                <div className="text-xs text-gray-400">منخفضة المخزون</div>
                <div className="text-lg font-bold text-amber-500">
                  {products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= 5).length}
                </div>
              </div>
            </div>
          </div>
        </nav>
        
        <div className="p-6 border-t border-white/10">
          <Button 
            variant="danger" 
            fullWidth
            onClick={handleLogout}
            className="shadow-lg shadow-red-500/10"
          >
            <LogOut size={18} className="ml-2" />
            <span>تسجيل الخروج</span>
          </Button>
          <div className="mt-4 text-center text-[10px] text-gray-500">
            {new Date().toLocaleDateString('ar-DZ')}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-4 md:p-8 text-right">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="فتح القائمة"
              >
                <Menu size={20} />
              </button>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Link to="/admin/dashboard" className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-gold hover:text-black transition-colors group">
                    <ArrowLeft size={18} className="group-hover:scale-110 transition-transform" />
                  </Link>
                  <h1 className="text-2xl md:text-3xl font-bold text-white">إدارة المنتجات</h1>
                  <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-gold/10 text-gold rounded-full text-sm">
                    <Shield size={14} />
                    <span>مسؤول النظام</span>
                  </div>
                </div>
                <p className="text-gray-400 text-sm">إدارة وتعديل المنتجات الفاخرة</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="primary"
                onClick={openAddModal}
                className="shadow-lg shadow-gold/20 hover:shadow-gold/30"
              >
                <PlusCircle size={18} className="ml-2" />
                <span>إضافة منتج جديد</span>
              </Button>
              <Button 
                variant="secondary"
                onClick={exportProducts}
              >
                <Download size={18} className="ml-2" />
                <span>تصدير</span>
              </Button>
            </div>
          </div>

          {/* Filters and Search */}
        </header>

        {/* View Mode Toggle */}
        <div className="flex justify-end mb-6">
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

        {/* Products Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(product => {
              const stockStatus = getStockStatus(product.stock_quantity);
              return (
                <div key={product.id} className="group bg-[#0a1128]/50 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:border-gold/30 transition-all duration-300 hover:shadow-2xl hover:shadow-gold/5">
                  <div className="relative">
                    <div className="aspect-square overflow-hidden bg-black/20">
                      <img 
                        src={product.images[0]} 
                        alt={s(product.name)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="absolute top-4 left-4">
                      <div className={`px-3 py-1 rounded-full text-xs font-bold ${stockStatus.color}`}>
                        {stockStatus.text}
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={() => openEditModal(product)}
                          className="shadow-lg"
                        >
                          <Edit2 size={16} />
                        </Button>
                        <Button
                          variant="danger"
                          size="icon"
                          onClick={() => setShowDeleteConfirm(product.id)}
                          className="shadow-lg"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="mb-3">
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider">{s(product.brand)}</span>
                      <h3 className="text-lg font-bold text-white mt-1 line-clamp-1">{s(product.name)}</h3>
                      {product.category && (
                        <div className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-white/5 rounded text-xs text-gray-400">
                          <Tag size={10} />
                          {s(product.category)}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-gold">
                          {Number(product.price).toLocaleString()} دج
                        </div>
                        {product.old_price > 0 && (
                          <div className="text-sm text-gray-500 line-through">
                            {Number(product.old_price).toLocaleString()} دج
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-gray-400">
                        {product.stock_quantity} قطع
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-white/5 flex justify-between">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowDeleteConfirm(product.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        حذف
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => openEditModal(product)}
                      >
                        تعديل
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-[#0a1128]/50 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-black/30 border-b border-white/10">
                  <tr>
                    <th className="p-6 font-bold text-gray-400 text-sm uppercase tracking-wider">المنتج</th>
                    <th className="p-6 font-bold text-gray-400 text-sm uppercase tracking-wider">الفئة</th>
                    <th className="p-6 font-bold text-gray-400 text-sm uppercase tracking-wider">السعر</th>
                    <th className="p-6 font-bold text-gray-400 text-sm uppercase tracking-wider">المخزون</th>
                    <th className="p-6 font-bold text-gray-400 text-sm uppercase tracking-wider">الحالة</th>
                    <th className="p-6 font-bold text-gray-400 text-sm uppercase tracking-wider">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => {
                    const stockStatus = getStockStatus(product.stock_quantity);
                    return (
                      <tr key={product.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                        <td className="p-6">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-black/30 rounded-lg border border-white/10 overflow-hidden flex-shrink-0">
                              <img 
                                src={product.images[0]} 
                                alt={s(product.name)}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            </div>
                            <div>
                              <div className="font-bold text-white mb-1">{s(product.name)}</div>
                              <div className="text-sm text-gray-400">{s(product.brand)}</div>
                              {product.description && (
                                <div className="text-xs text-gray-500 mt-2 line-clamp-1">{s(product.description)}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg text-sm">
                            <Tag size={12} />
                            {s(product.category) || 'غير مصنف'}
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="font-bold text-gold text-lg">{Number(product.price).toLocaleString()} دج</div>
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
                          <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold ${stockStatus.color}`}>
                            {stockStatus.text}
                            {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
                              <AlertTriangle size={12} />
                            )}
                            {product.stock_quantity === 0 && (
                              <X size={12} />
                            )}
                            {product.stock_quantity > 5 && (
                              <CheckCircle size={12} />
                            )}
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="secondary"
                              size="icon"
                              onClick={() => openEditModal(product)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Edit2 size={16} />
                            </Button>
                            <Button
                              variant="danger"
                              size="icon"
                              onClick={() => setShowDeleteConfirm(product.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 size={16} />
                            </Button>
                            <div className="lg:hidden">
                              <button className="p-2 text-gray-400 hover:text-white">
                                <MoreVertical size={18} />
                              </button>
                            </div>
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

        {/* Empty State */}
        {products.length === 0 && !loading && (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package size={48} className="text-gray-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">لا توجد منتجات</h3>
            <p className="text-gray-400 mb-8">لا توجد منتجات حالياً</p>
            <Button
              variant="primary"
              onClick={openAddModal}
            >
              <PlusCircle size={18} className="ml-2" />
              إضافة أول منتج
            </Button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h3 className="text-lg font-bold text-white mb-2">جاري تحميل المنتجات</h3>
            <p className="text-gray-400">يرجى الانتظار...</p>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
            <div className="bg-[#0a1128] border border-white/10 rounded-xl p-8 max-w-md w-full animate-scale-in">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle size={32} className="text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">تأكيد الحذف</h3>
                <p className="text-gray-400">هل أنت متأكد من رغبتك في حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء.</p>
              </div>
              <div className="flex gap-4">
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => setShowDeleteConfirm(null)}
                >
                  إلغاء
                </Button>
                <Button
                  variant="danger"
                  fullWidth
                  onClick={() => handleDelete(showDeleteConfirm)}
                >
                  <Trash2 size={18} className="ml-2" />
                  حذف المنتج
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl overflow-y-auto">
            <div className="bg-[#0a1128] border border-white/10 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-[#0a1128] border-b border-white/10 p-6 flex items-center justify-between z-10">
                <h3 className="text-2xl font-bold text-white">
                  {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsModalOpen(false)}
                  className="hover:bg-white/10"
                >
                  <X size={24} />
                </Button>
              </div>
              
              <form onSubmit={handleSave} className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        اسم المنتج *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white focus:outline-none focus:border-gold transition-colors"
                        placeholder="أدخل اسم المنتج"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        الماركة *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.brand}
                        onChange={(e) => setFormData({...formData, brand: e.target.value})}
                        className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white focus:outline-none focus:border-gold transition-colors"
                        placeholder="أدخل اسم الماركة"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        الفئة
                      </label>
                      <input
                        type="text"
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white focus:outline-none focus:border-gold transition-colors"
                        placeholder="أدخل الفئة"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          السعر *
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">دج</span>
                          <input
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            value={formData.price}
                            onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                            className="w-full pl-12 pr-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white focus:outline-none focus:border-gold transition-colors"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          المخزون *
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          value={formData.stock_quantity}
                          onChange={(e) => setFormData({...formData, stock_quantity: Number(e.target.value)})}
                          className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white focus:outline-none focus:border-gold transition-colors"
                          placeholder="0"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        الوصف
                      </label>
                      <textarea
                        rows={4}
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white focus:outline-none focus:border-gold transition-colors resize-none"
                        placeholder="أدخل وصف المنتج..."
                      />
                    </div>
                  </div>
                  
                  {/* Right Column */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        صورة المنتج *
                      </label>
                      <div 
                        className={`border-2 ${formData.images[0] ? 'border-white/10' : 'border-dashed border-gold/30'} rounded-xl p-8 bg-black/20 transition-all cursor-pointer hover:border-gold/50 group`}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileUpload}
                          className="hidden"
                          accept="image/*"
                        />
                        
                        {uploading ? (
                          <div className="text-center">
                            <Loader2 className="w-12 h-12 animate-spin text-gold mx-auto mb-4" />
                            <p className="text-sm text-gray-400">جاري رفع الصورة...</p>
                          </div>
                        ) : formData.images[0] ? (
                          <div className="relative">
                            <img
                              src={formData.images[0]}
                              alt="معاينة"
                              className="w-full h-48 object-contain rounded-lg"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                              <Upload size={24} className="text-white" />
                            </div>
                          </div>
                        ) : (
                          <div className="text-center">
                            <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                              <ImageIcon size={24} className="text-gold" />
                            </div>
                            <p className="text-gold font-medium mb-2">انقر لرفع صورة</p>
                            <p className="text-xs text-gray-400">JPG, PNG, WebP (حد أقصى 5MB)</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {formData.images[0] && (
                      <div className="flex justify-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setFormData({...formData, images: ['']})}
                          className="text-red-400 hover:text-red-300"
                        >
                          إزالة الصورة
                        </Button>
                      </div>
                    )}
                    
                    <div className="pt-8 border-t border-white/10">
                      <div className="flex gap-4">
                        <Button
                          type="submit"
                          variant="primary"
                          loading={uploading}
                          className="flex-grow"
                        >
                          {editingProduct ? 'حفظ التغييرات' : 'إضافة المنتج'}
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => setIsModalOpen(false)}
                        >
                          إلغاء
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-4 text-center">
                        * الحقول المميزة بإشارة النجمة إلزامية
                      </p>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Pagination */}
        {products.length > 0 && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
            <div className="text-sm text-gray-400">
              عرض 1-{products.length} من {products.length} منتج
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <ArrowRight size={18} />
              </button>
              <span className="px-4 py-2 bg-gold/10 text-gold rounded-lg font-bold">1</span>
              <button className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
                <ArrowLeft size={18} />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminProducts;
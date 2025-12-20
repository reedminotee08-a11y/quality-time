import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  LayoutDashboard, 
  ShoppingCart, 
  PlusCircle, 
  Edit2, 
  Trash2, 
  Download,
  Grid,
  List,
  Search,
  Filter,
  LogOut,
  Menu,
  X,
  Shield,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import Button from '../components/Button';
import ModernProductForm from '../components/ModernProductForm';
import ProductService from '../services/ProductService';
import { Product } from '../types';

const NewAdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // الفئات المتاحة
  const categories = [
    'الكل',
    'ساعات رجالية',
    'ساعات نسائية',
    'ساعات ذكية',
    'ساعات كلاسيكية',
    'ساعات رياضية'
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [products, searchTerm, selectedCategory]);

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

    setFilteredProducts(filtered);
  };

  const handleDelete = async (id: string) => {
    try {
      await ProductService.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleProductSaved = () => {
    fetchProducts();
  };

  const exportProducts = async () => {
    try {
      const csvContent = [
        ['الاسم', 'الماركة', 'السعر', 'المخزون', 'الفئة', 'تاريخ الإضافة'],
        ...filteredProducts.map(p => [
          p.name,
          p.brand,
          Number(p.price).toLocaleString(),
          p.stock_quantity,
          p.category,
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
    } catch (error) {
      console.error('Error exporting products:', error);
    }
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { text: 'نفذت الكمية', color: 'bg-red-500/10 text-red-500 border-red-500/10' };
    if (quantity <= 5) return { text: 'مخزون قليل', color: 'bg-amber-500/10 text-amber-500 border-amber-500/10' };
    return { text: 'متوفر', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10' };
  };

  const handleLogout = () => {
    window.location.href = '/admin/login';
  };

  return (
    <div className="dark-theme min-h-screen bg-gradient-to-b from-[#050b18] to-[#0a1128] text-white flex flex-col md:flex-row">
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-[55] md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 right-0 h-screen w-64 bg-[#0a1128]/90 border-l border-white/10 flex flex-col z-[58] transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
        <div className="p-8 border-b border-white/10">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img 
                src="https://ranhfnjyqwuoiarosxrk.supabase.co/storage/v1/object/public/logo/unnamed2%20(1).png" 
                alt="Logo" 
                className="w-16 h-16 filter brightness-110"
              />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gold rounded-full border-2 border-[#0a1128]"></div>
            </div>
            <div className="text-center">
              <span className="text-[10px] font-black text-gold tracking-[0.3em] uppercase block">Inventory Panel</span>
              <span className="text-[8px] text-gray-500 font-medium mt-1 block">V 2.0.0</span>
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
              className="flex flex-row-reverse items-center gap-4 p-4 bg-gradient-to-l from-gold/20 to-transparent text-gold border-r-2 border-gold font-bold rounded-lg"
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
              >
                <Menu size={20} />
              </button>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Link to="/admin/dashboard" className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-gold hover:text-black transition-colors">
                    <X size={18} className="rotate-45" />
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
                className="shadow-lg shadow-gold/20"
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
          <div className="bg-[#0a1128]/50 border border-white/10 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h3 className="text-sm font-bold text-white mb-4">البحث والتصفية</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white focus:outline-none focus:border-gold transition-colors"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                <div className="flex bg-black/30 border border-white/10 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`flex-1 p-3 ${viewMode === 'grid' ? 'bg-gold/20 text-gold' : 'text-gray-400 hover:text-white'}`}
                  >
                    <Grid size={18} className="mx-auto" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex-1 p-3 ${viewMode === 'list' ? 'bg-gold/20 text-gold' : 'text-gray-400 hover:text-white'}`}
                  >
                    <List size={18} className="mx-auto" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Products Display */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h3 className="text-lg font-bold text-white mb-2">جاري تحميل المنتجات</h3>
            <p className="text-gray-400">يرجى الانتظار...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package size={48} className="text-gray-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">لا توجد منتجات</h3>
            <p className="text-gray-400 mb-8">لا توجد منتجات حالياً</p>
            <Button variant="primary" onClick={openAddModal}>
              <PlusCircle size={18} className="ml-2" />
              إضافة أول منتج
            </Button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => {
              const stockStatus = getStockStatus(product.stock_quantity);
              return (
                <div key={product.id} className="group bg-[#0a1128]/50 border border-white/10 rounded-xl overflow-hidden hover:border-gold/30 transition-all duration-300">
                  <div className="relative">
                    <div className="aspect-square overflow-hidden bg-black/20">
                      <img 
                        src={product.images[0]} 
                        alt={product.name}
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
                        >
                          <Edit2 size={16} />
                        </Button>
                        <Button
                          variant="danger"
                          size="icon"
                          onClick={() => setShowDeleteConfirm(product.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="mb-3">
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider">{product.brand}</span>
                      <h3 className="text-lg font-bold text-white mt-1 line-clamp-1">{product.name}</h3>
                      {product.category && (
                        <div className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-white/5 rounded text-xs text-gray-400">
                          <Filter size={10} />
                          {product.category}
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
          <div className="bg-[#0a1128]/50 border border-white/10 rounded-xl overflow-hidden">
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
                  {filteredProducts.map(product => {
                    const stockStatus = getStockStatus(product.stock_quantity);
                    return (
                      <tr key={product.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-6">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-black/30 rounded-lg border border-white/10 overflow-hidden">
                              <img 
                                src={product.images[0]} 
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <div className="font-bold text-white mb-1">{product.name}</div>
                              <div className="text-sm text-gray-400">{product.brand}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg text-sm">
                            <Filter size={12} />
                            {product.category || 'غير مصنف'}
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
                            >
                              <Edit2 size={16} />
                            </Button>
                            <Button
                              variant="danger"
                              size="icon"
                              onClick={() => setShowDeleteConfirm(product.id)}
                            >
                              <Trash2 size={16} />
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

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80">
            <div className="bg-[#0a1128] border border-white/10 rounded-xl p-8 max-w-md w-full">
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

        {/* Product Upload Modal */}
        {isModalOpen && (
          <ModernProductForm
            onClose={() => setIsModalOpen(false)}
            onSuccess={handleProductSaved}
            editingProduct={editingProduct}
          />
        )}
      </main>
    </div>
  );
};

export default NewAdminProducts;

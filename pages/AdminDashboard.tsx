import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase, uploadImage } from '../lib/supabase';
import { Product, Order } from '../types';
import { 
  Loader2, Plus, Edit, Trash2, Package, Grid, LogOut, 
  CheckCircle2, XCircle, DollarSign, ShoppingBag, 
  Activity, Search, Filter, ChevronDown, MoreHorizontal 
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { session, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('orders');
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<Partial<Product>>({
      name: '', brand: '', price: 0, description: '', stock_quantity: 0, specs: {}, images: []
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const { data: productsData } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (productsData) setProducts(productsData);

      const { data: ordersData } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (ordersData) setOrders(ordersData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingData(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (error) {
      alert('Login failed');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      let imageUrls = editingProduct?.images || [];
      if (imageFile) {
        const url = await uploadImage(imageFile);
        if (url) imageUrls = [url, ...imageUrls];
      }

      const productData = { ...productForm, images: imageUrls };
      
      if (editingProduct) {
        await supabase.from('products').update(productData).eq('id', editingProduct.id);
      } else {
        await supabase.from('products').insert([productData]);
      }
      setIsModalOpen(false);
      setImageFile(null);
      setEditingProduct(null);
      setProductForm({ name: '', brand: '', price: 0, description: '', stock_quantity: 0, specs: {}, images: [] });
      fetchData();
    } catch (e) {
        console.error(e);
        alert('Error saving product');
    } finally {
        setLoginLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if(!window.confirm('Are you sure you want to delete this item?')) return;
    await supabase.from('products').delete().eq('id', id);
    fetchData();
  };

  const handleUpdateOrderStatus = async (id: string, status: string) => {
      await supabase.from('orders').update({ status }).eq('id', id);
      fetchData();
  };

  // Stats Calculations
  const totalRevenue = orders.reduce((acc, order) => order.status !== 'CANCELLED' ? acc + order.total : acc, 0);
  const pendingOrders = orders.filter(o => o.status === 'PENDING').length;
  const lowStockProducts = products.filter(p => p.stock_quantity < 5).length;

  if (authLoading) return <div className="min-h-screen flex items-center justify-center text-gold-500 bg-dark-800"><Loader2 className="animate-spin w-10 h-10" /></div>;

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-dark-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?q=80&w=2574')] bg-cover opacity-10"></div>
        <div className="w-full max-w-md bg-dark-700/80 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl relative z-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-serif text-white mb-2">Admin Portal</h2>
            <p className="text-gray-400">Secure access for management only</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider font-bold mb-2 block">Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-dark-900/50 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-gold-500 transition-colors" placeholder="admin@qualitytime.com" />
            </div>
            <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider font-bold mb-2 block">Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-dark-900/50 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-gold-500 transition-colors" placeholder="••••••••" />
            </div>
            <button disabled={loginLoading} className="w-full bg-gradient-to-r from-gold-600 to-gold-400 text-dark-900 py-4 rounded-lg font-bold hover:shadow-lg hover:shadow-gold-500/20 transition-all transform hover:-translate-y-0.5">
                {loginLoading ? <Loader2 className="animate-spin mx-auto"/> : 'Access Dashboard'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-800 pb-12">
      {/* Top Header */}
      <header className="bg-dark-700/50 backdrop-blur-lg border-b border-white/5 sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
              <div>
                <h1 className="text-2xl text-white font-serif font-bold">Dashboard</h1>
                <p className="text-xs text-gray-400">Welcome back, Admin</p>
              </div>
              <div className="flex items-center gap-4">
                  <div className="hidden md:flex items-center gap-2 bg-dark-900/50 border border-white/10 px-3 py-1.5 rounded-full text-xs text-gray-400">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    System Operational
                  </div>
                  <button onClick={handleLogout} className="text-gray-400 hover:text-white flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg transition-colors text-sm font-medium">
                      <LogOut className="w-4 h-4" /> Logout
                  </button>
              </div>
          </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 mt-8 space-y-8">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-dark-700/50 backdrop-blur p-6 rounded-xl border border-white/5 shadow-lg group hover:border-gold-500/30 transition-colors">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-gold-500/10 rounded-lg text-gold-500">
                        <DollarSign className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded">+12%</span>
                </div>
                <h3 className="text-gray-400 text-sm font-medium">Total Revenue</h3>
                <p className="text-2xl font-bold text-white mt-1">{totalRevenue.toLocaleString()} DA</p>
            </div>

            <div className="bg-dark-700/50 backdrop-blur p-6 rounded-xl border border-white/5 shadow-lg group hover:border-gold-500/30 transition-colors">
                 <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
                        <ShoppingBag className="w-6 h-6" />
                    </div>
                </div>
                <h3 className="text-gray-400 text-sm font-medium">Total Orders</h3>
                <p className="text-2xl font-bold text-white mt-1">{orders.length}</p>
            </div>

            <div className="bg-dark-700/50 backdrop-blur p-6 rounded-xl border border-white/5 shadow-lg group hover:border-gold-500/30 transition-colors">
                 <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400">
                        <Activity className="w-6 h-6" />
                    </div>
                    {pendingOrders > 0 && <span className="text-xs font-bold text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded">{pendingOrders} Pending</span>}
                </div>
                <h3 className="text-gray-400 text-sm font-medium">Pending Processing</h3>
                <p className="text-2xl font-bold text-white mt-1">{pendingOrders}</p>
            </div>

            <div className="bg-dark-700/50 backdrop-blur p-6 rounded-xl border border-white/5 shadow-lg group hover:border-gold-500/30 transition-colors">
                 <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-pink-500/10 rounded-lg text-pink-400">
                        <Package className="w-6 h-6" />
                    </div>
                     {lowStockProducts > 0 && <span className="text-xs font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded">{lowStockProducts} Low Stock</span>}
                </div>
                <h3 className="text-gray-400 text-sm font-medium">Total Products</h3>
                <p className="text-2xl font-bold text-white mt-1">{products.length}</p>
            </div>
        </div>

        {/* Controls Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
             <div className="bg-dark-700/50 p-1 rounded-lg border border-white/5 inline-flex">
                <button 
                    onClick={() => setActiveTab('orders')} 
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === 'orders' ? 'bg-gold-500 text-dark-900 shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                    <ShoppingBag className="w-4 h-4"/> Orders
                </button>
                <button 
                    onClick={() => setActiveTab('products')} 
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === 'products' ? 'bg-gold-500 text-dark-900 shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                    <Grid className="w-4 h-4"/> Inventory
                </button>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
                <div className="relative group flex-1 md:w-64">
                    <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3 group-focus-within:text-gold-500 transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search..." 
                        className="w-full bg-dark-700/50 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white outline-none focus:border-gold-500 transition-colors"
                    />
                </div>
                {activeTab === 'products' && (
                    <button 
                        onClick={() => {
                            setEditingProduct(null);
                            setProductForm({ name: '', brand: '', price: 0, description: '', stock_quantity: 0, specs: {}, images: [] });
                            setIsModalOpen(true);
                        }}
                        className="bg-gold-500 hover:bg-gold-400 text-dark-900 px-4 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors shadow-lg shadow-gold-500/10"
                    >
                        <Plus className="w-4 h-4"/> <span className="hidden sm:inline">Add Product</span>
                    </button>
                )}
            </div>
        </div>

        {/* Content Area */}
        <div className="bg-dark-700/30 rounded-xl border border-white/5 overflow-hidden shadow-2xl">
            {activeTab === 'orders' ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-dark-900/50 text-gray-400 font-medium uppercase text-xs tracking-wider border-b border-white/5">
                            <tr>
                                <th className="p-5">Order Details</th>
                                <th className="p-5">Customer</th>
                                <th className="p-5">Amount</th>
                                <th className="p-5">Status</th>
                                <th className="p-5">Date</th>
                                <th className="p-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {orders.map(order => (
                                <tr key={order.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="p-5">
                                        <div className="font-mono text-gold-500 font-medium">{order.id}</div>
                                        <div className="text-gray-500 text-xs mt-1">{order.items.length} Items</div>
                                    </td>
                                    <td className="p-5">
                                        <div className="text-white font-medium">{order.customer_name}</div>
                                        <div className="text-xs text-gray-500">{order.phone}</div>
                                    </td>
                                    <td className="p-5">
                                        <div className="font-bold text-white">{order.total.toLocaleString()} DA</div>
                                        <div className="text-xs text-gray-500">{order.delivery_method === 'stop_desk' ? 'Stop Desk' : 'Home Delivery'}</div>
                                    </td>
                                    <td className="p-5">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                                            order.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 
                                            order.status === 'DELIVERED' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                            order.status === 'CANCELLED' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                            'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                        }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${
                                                order.status === 'PENDING' ? 'bg-yellow-500' : 
                                                order.status === 'DELIVERED' ? 'bg-green-500' :
                                                order.status === 'CANCELLED' ? 'bg-red-500' :
                                                'bg-blue-500'
                                            }`}></span>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="p-5 text-gray-400">
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="p-5 text-right">
                                        <div className="relative inline-block">
                                            <select 
                                                value={order.status} 
                                                onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                                className="bg-dark-900 border border-white/10 rounded-md py-1.5 pl-3 pr-8 text-xs text-white outline-none appearance-none cursor-pointer hover:border-gold-500 focus:border-gold-500 transition-colors"
                                            >
                                                <option value="PENDING">Pending</option>
                                                <option value="CONFIRMED">Confirmed</option>
                                                <option value="SHIPPED">Shipped</option>
                                                <option value="DELIVERED">Delivered</option>
                                                <option value="CANCELLED">Cancelled</option>
                                            </select>
                                            <ChevronDown className="w-3 h-3 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"/>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-dark-900/50 text-gray-400 font-medium uppercase text-xs tracking-wider border-b border-white/5">
                            <tr>
                                <th className="p-5">Product</th>
                                <th className="p-5">Price</th>
                                <th className="p-5">Stock</th>
                                <th className="p-5">Status</th>
                                <th className="p-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {products.map(product => (
                                <tr key={product.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="p-5">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded bg-dark-900 border border-white/10 overflow-hidden flex-shrink-0">
                                                <img src={product.images?.[0]} className="w-full h-full object-cover" alt=""/>
                                            </div>
                                            <div>
                                                <div className="font-bold text-white">{product.name}</div>
                                                <div className="text-xs text-gray-500">{product.brand}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <div className="text-gold-500 font-mono font-medium">{product.price.toLocaleString()} DA</div>
                                    </td>
                                    <td className="p-5">
                                        <div className="text-white">{product.stock_quantity} <span className="text-gray-500 text-xs">units</span></div>
                                    </td>
                                    <td className="p-5">
                                        {product.stock_quantity > 5 ? (
                                            <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded border border-green-500/20">In Stock</span>
                                        ) : product.stock_quantity > 0 ? (
                                            <span className="text-xs font-bold text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded border border-yellow-500/20">Low Stock</span>
                                        ) : (
                                            <span className="text-xs font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded border border-red-500/20">Out of Stock</span>
                                        )}
                                    </td>
                                    <td className="p-5 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => {
                                                    setEditingProduct(product);
                                                    setProductForm(product);
                                                    setIsModalOpen(true);
                                                }}
                                                className="p-2 bg-dark-900 border border-white/10 rounded-lg hover:border-blue-400 hover:text-blue-400 text-gray-400 transition-colors"
                                            >
                                                <Edit className="w-4 h-4"/>
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteProduct(product.id)}
                                                className="p-2 bg-dark-900 border border-white/10 rounded-lg hover:border-red-400 hover:text-red-400 text-gray-400 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4"/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            
            {/* Empty States */}
            {((activeTab === 'orders' && orders.length === 0) || (activeTab === 'products' && products.length === 0)) && !loadingData && (
                <div className="p-12 text-center text-gray-500">
                    <div className="bg-white/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 opacity-50"/>
                    </div>
                    <p>No records found.</p>
                </div>
            )}
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
            <div className="bg-dark-800 w-full max-w-2xl rounded-xl border border-white/10 max-h-[90vh] overflow-y-auto relative z-10 shadow-2xl">
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-dark-700/50">
                    <div>
                        <h2 className="text-xl text-white font-serif font-bold">{editingProduct ? 'Edit Timepiece' : 'Add New Timepiece'}</h2>
                        <p className="text-xs text-gray-400 mt-1">Fill in the details below to update your catalog.</p>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white p-2 hover:bg-white/5 rounded-full transition-colors"><XCircle /></button>
                </div>
                
                <form onSubmit={handleSaveProduct} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Product Name</label>
                            <input className="w-full bg-dark-900 border border-white/10 p-3 rounded-lg text-white outline-none focus:border-gold-500 transition-colors" placeholder="e.g. Royal Oak" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Brand Name</label>
                            <input className="w-full bg-dark-900 border border-white/10 p-3 rounded-lg text-white outline-none focus:border-gold-500 transition-colors" placeholder="e.g. Audemars Piguet" value={productForm.brand} onChange={e => setProductForm({...productForm, brand: e.target.value})} required />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Price (DA)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-3 text-gray-500 font-serif">DA</span>
                                <input type="number" className="w-full bg-dark-900 border border-white/10 p-3 pl-10 rounded-lg text-white outline-none focus:border-gold-500 transition-colors" placeholder="0.00" value={productForm.price} onChange={e => setProductForm({...productForm, price: parseFloat(e.target.value)})} required />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Stock Quantity</label>
                            <input type="number" className="w-full bg-dark-900 border border-white/10 p-3 rounded-lg text-white outline-none focus:border-gold-500 transition-colors" placeholder="0" value={productForm.stock_quantity} onChange={e => setProductForm({...productForm, stock_quantity: parseInt(e.target.value)})} required />
                        </div>
                    </div>

                    <div className="space-y-2">
                         <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Description</label>
                        <textarea rows={4} className="w-full bg-dark-900 border border-white/10 p-3 rounded-lg text-white outline-none focus:border-gold-500 transition-colors" placeholder="Detailed description of the timepiece..." value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} required />
                    </div>
                    
                    <div className="bg-dark-900/50 p-4 rounded-lg border border-white/10 border-dashed hover:border-gold-500/50 transition-colors">
                        <label className="flex flex-col items-center justify-center cursor-pointer">
                            <div className="bg-white/5 p-3 rounded-full mb-3 text-gold-500">
                                <Package className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-medium text-white mb-1">Upload Product Image</span>
                            <span className="text-xs text-gray-500 mb-4">PNG, JPG up to 5MB</span>
                            <input type="file" onChange={e => setImageFile(e.target.files?.[0] || null)} className="hidden"/>
                            <div className="bg-white/10 text-white px-4 py-2 rounded text-xs font-bold hover:bg-white/20 transition-colors">
                                {imageFile ? imageFile.name : 'Choose File'}
                            </div>
                        </label>
                    </div>

                    <div className="flex justify-end gap-4 pt-4 border-t border-white/10">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded-lg font-medium text-gray-400 hover:text-white transition-colors">Cancel</button>
                        <button type="submit" disabled={loginLoading} className="bg-gold-500 text-dark-900 px-6 py-2 rounded-lg font-bold hover:bg-gold-400 shadow-lg shadow-gold-500/20 transition-all transform hover:-translate-y-0.5">
                             {loginLoading ? <Loader2 className="animate-spin" /> : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};
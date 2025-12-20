import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { supabase } from './supabaseClient';
import { CartItem, Product, UserSession } from './types';
import { CheckCircle, AlertCircle, Info, Loader2 } from 'lucide-react';
import ErrorBoundary from './components/ErrorBoundary';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminOrders from './pages/AdminOrders';

// Context Types
interface ToastContextType {
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

// Create Contexts
const ToastContext = createContext<ToastContextType>({
  showToast: () => {}
});

const CartContext = createContext<CartContextType>({
  cart: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  cartCount: 0,
  cartTotal: 0
});

// Custom Hooks
export const useToast = () => useContext(ToastContext);
export const useCart = () => useContext(CartContext);

// Toast Component
const ToastNotification: React.FC<{
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info
  };

  const styles = {
    success: 'bg-green-500/10 border-green-500/20 text-green-400',
    error: 'bg-red-500/10 border-red-500/20 text-red-400',
    info: 'bg-[#c5a059]/10 border-[#c5a059]/20 text-[#c5a059]'
  };

  const Icon = icons[type];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] animate-fade-in-up">
      <div className={`flex items-center gap-3 px-6 py-3 rounded-lg border backdrop-blur-xl shadow-2xl ${styles[type]}`}>
        <Icon size={20} className="flex-shrink-0" />
        <span className="font-bold tracking-tight text-sm whitespace-nowrap">{message}</span>
        <button
          onClick={onClose}
          className="ml-2 opacity-60 hover:opacity-100 transition-opacity"
          aria-label="إغلاق التنبيه"
        >
          ×
        </button>
      </div>
    </div>
  );
};

// Loading Component
const AppLoading: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#050b18]">
    <div className="text-center">
      <Loader2 size={48} className="animate-spin text-[#c5a059] mx-auto mb-4" />
      <p className="text-gray-400">جاري تحميل التطبيق...</p>
    </div>
  </div>
);

// Scroll to Top on Route Change
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  return null;
};

// Main App Component
const App: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [session, setSession] = useState<UserSession | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Calculate cart metrics
  const cartCount = (cart || []).reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = (cart || []).reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Load initial data
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Load cart from localStorage
        const savedCart = localStorage.getItem('qt_cart');
        if (savedCart) {
          try {
            setCart(JSON.parse(savedCart));
          } catch (error) {
            console.error('Failed to parse cart:', error);
            localStorage.removeItem('qt_cart');
          }
        }

        // Load session
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setSession({
            id: session.user.id,
            email: session.user.email,
            user_metadata: session.user.user_metadata,
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            expires_at: session.expires_at
          });
        }

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          if (session) {
            setSession({
              id: session.user.id,
              email: session.user.email,
              user_metadata: session.user.user_metadata,
              access_token: session.access_token,
              refresh_token: session.refresh_token,
              expires_at: session.expires_at
            });
          } else {
            setSession(null);
          }
        });

        return () => subscription.unsubscribe();
      } catch (error) {
        console.error('App initialization error:', error);
        showToast('حدث خطأ أثناء تحميل التطبيق', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('qt_cart', JSON.stringify(cart));
    } catch (error) {
      console.error('Failed to save cart:', error);
      showToast('حدث خطأ في حفظ السلة', 'error');
    }
  }, [cart]);

  // Toast functions
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  // Cart functions
  const addToCart = useCallback((product: Product) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.id === product.id);
      
      if (existingIndex >= 0) {
        // Update quantity if product exists
        const updatedCart = [...prev];
        updatedCart[existingIndex] = {
          ...updatedCart[existingIndex],
          quantity: updatedCart[existingIndex].quantity + 1
        };
        return updatedCart;
      } else {
        // Add new product
        return [...prev, {
          ...product,
          quantity: 1,
          addedAt: new Date().toISOString()
        }];
      }
    });
    
    showToast(`تم إضافة ${product.name} إلى السلة`);
  }, [showToast]);

  const removeFromCart = useCallback((id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
    showToast('تم حذف المنتج من السلة', 'info');
  }, [showToast]);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(id);
      return;
    }
    
    if (quantity > 99) {
      showToast('لا يمكن إضافة أكثر من 99 قطعة', 'error');
      return;
    }

    setCart(prev => prev.map(item => 
      item.id === id ? { ...item, quantity } : item
    ));
  }, [removeFromCart, showToast]);

  const clearCart = useCallback(() => {
    setCart([]);
    showToast('تم تفريغ السلة', 'info');
  }, [showToast]);

  // Protected Route Component
  const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    if (!session) {
      return <Navigate to="/admin/login" replace />;
    }
    return <>{children}</>;
  };

  if (isLoading) {
    return <AppLoading />;
  }

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <Router>
          <ToastContext.Provider value={{ showToast }}>
            <CartContext.Provider value={{
              cart,
              addToCart,
              removeFromCart,
              updateQuantity,
              clearCart,
              cartCount,
              cartTotal
            }}>
              <div className="flex flex-col min-h-screen bg-[#050b18] text-white">
                <ScrollToTop />
                
                <Navbar cartCount={cartCount} />
                
                <main className="flex-grow pt-20 md:pt-24 pb-8 md:pb-12">
                  <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                    <ErrorBoundary>
                      <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<HomePage />} />
                        <Route 
                          path="/products" 
                          element={<ProductsPage addToCart={addToCart} />} 
                        />
                        <Route 
                          path="/product/:id" 
                          element={<ProductDetailsPage addToCart={addToCart} />} 
                        />
                        <Route 
                          path="/cart" 
                          element={<CartPage cart={cart} removeFromCart={removeFromCart} updateQuantity={updateQuantity} />} 
                        />
                        <Route 
                          path="/checkout" 
                          element={<CheckoutPage cart={cart} clearCart={clearCart} />} 
                        />
                        
                        {/* Admin Routes */}
                        <Route 
                          path="/admin/login" 
                          element={session ? <Navigate to="/admin/dashboard" /> : <AdminLogin />} 
                        />
                        <Route 
                          path="/admin/dashboard" 
                          element={
                            <ProtectedRoute>
                              <AdminDashboard />
                            </ProtectedRoute>
                          } 
                        />
                        <Route 
                          path="/admin/products" 
                          element={
                            <ProtectedRoute>
                              <AdminProducts />
                            </ProtectedRoute>
                          } 
                        />
                        <Route 
                          path="/admin/orders" 
                          element={
                            <ProtectedRoute>
                              <AdminOrders />
                            </ProtectedRoute>
                          } 
                        />
                        
                        {/* Fallback Route */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </ErrorBoundary>
                  </div>
                </main>

                <Footer />
                
                {/* Toast Notifications */}
                {toast && (
                  <ToastNotification
                    message={toast.message}
                    type={toast.type}
                    onClose={hideToast}
                  />
                )}
              </div>
            </CartContext.Provider>
          </ToastContext.Provider>
        </Router>
      </HelmetProvider>
    </ErrorBoundary>
  );
};

export default App;
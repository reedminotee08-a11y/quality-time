import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, Trash2, Plus, Minus, Shield, CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, cartTotal, notification } = useCart();
  const { isAdmin } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const location = useLocation();

  const closeCart = () => setIsCartOpen(false);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-dark-800 text-gray-200">
      {/* Navigation */}
      <nav className="fixed w-full z-50 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Mobile Menu Button (Left) */}
            <div className="md:hidden flex items-center mr-4">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="text-gray-300 hover:text-white p-2"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>

            <Link to="/" className="flex items-center gap-3 group mr-auto md:mr-0">
              <span className="font-serif text-xl font-bold tracking-wider text-white">
                Quality <span className="text-gold-500">Time</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className={`text-sm tracking-widest uppercase hover:text-gold-500 transition-colors ${location.pathname === '/' ? 'text-gold-500' : 'text-gray-300'}`}>
                Collection
              </Link>
              {isAdmin && (
                <Link to="/admin" className={`text-sm tracking-widest uppercase hover:text-gold-500 transition-colors ${location.pathname.startsWith('/admin') ? 'text-gold-500' : 'text-gray-300'}`}>
                  Dashboard
                </Link>
              )}
              
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-gray-300 hover:text-gold-500 transition-colors"
              >
                <ShoppingBag className="h-5 w-5" />
                {cart.length > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-dark-900 transform translate-x-1/4 -translate-y-1/4 bg-gold-500 rounded-full">
                    {cart.reduce((a, b) => a + b.quantity, 0)}
                  </span>
                )}
              </button>
              
              {!isAdmin && (
                  <Link to="/admin" className="text-gray-400 hover:text-white transition-colors">
                      <Shield className="h-4 w-4"/>
                  </Link>
              )}
            </div>
            
            {/* Mobile Cart Button (Right) */}
             <div className="md:hidden flex items-center">
               <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-gray-300 hover:text-gold-500 transition-colors"
              >
                <ShoppingBag className="h-6 w-6" />
                {cart.length > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-dark-900 transform translate-x-1/4 -translate-y-1/4 bg-gold-500 rounded-full">
                    {cart.reduce((a, b) => a + b.quantity, 0)}
                  </span>
                )}
              </button>
             </div>
          </div>
        </div>
      </nav>
      
      {/* Mobile Menu Sidebar */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsMobileMenuOpen(false)} />
          
          {/* Sidebar */}
          <div className="absolute inset-y-0 left-0 w-3/4 max-w-xs bg-dark-800 border-r border-white/10 shadow-2xl flex flex-col animate-slide-in-left">
             <div className="flex items-center justify-between p-6 border-b border-white/10">
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2">
                     <span className="font-serif text-lg font-bold text-white">
                        Quality <span className="text-gold-500">Time</span>
                    </span>
                </Link>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400 hover:text-white">
                  <X className="h-6 w-6" />
                </button>
             </div>
             
             <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                <Link 
                    to="/" 
                    onClick={() => setIsMobileMenuOpen(false)} 
                    className={`block px-4 py-3 rounded-md text-base font-medium transition-colors ${location.pathname === '/' ? 'bg-white/5 text-gold-500' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}
                >
                    Collection
                </Link>

                <button 
                    onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsCartOpen(true);
                    }}
                    className="w-full text-left px-4 py-3 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors flex items-center justify-between"
                >
                    <span>Cart</span>
                    {cart.length > 0 && (
                        <span className="bg-gold-500 text-dark-900 text-xs font-bold px-2 py-0.5 rounded-full">
                            {cart.reduce((a, b) => a + b.quantity, 0)}
                        </span>
                    )}
                </button>
                
                <Link 
                    to="/admin" 
                    onClick={() => setIsMobileMenuOpen(false)} 
                     className={`block px-4 py-3 rounded-md text-base font-medium transition-colors ${location.pathname.startsWith('/admin') ? 'bg-white/5 text-gold-500' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}
                >
                    {isAdmin ? 'Dashboard' : 'Admin Portal'}
                </Link>
             </div>

             <div className="p-6 border-t border-white/10 bg-dark-900/50">
                 <div className="text-xs text-gray-600 text-center">
                    © Quality Time dz by :abdou . insta : 0.ab._.dou.0
                 </div>
             </div>
          </div>
        </div>
      )}

      {/* Cart Sidebar */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[60] overflow-hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={closeCart} />
          <div className="fixed inset-y-0 right-0 max-w-md w-full flex">
            <div className="h-full w-full flex flex-col bg-dark-800 border-l border-white/10 shadow-xl">
              <div className="flex items-center justify-between px-6 py-6 border-b border-white/10">
                <h2 className="text-xl font-serif font-bold text-white">Your Selection</h2>
                <button onClick={closeCart} className="text-gray-400 hover:text-white">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Your cart is currently empty.</p>
                    <button onClick={closeCart} className="mt-4 text-gold-500 hover:text-gold-400 font-medium">
                      Continue Shopping
                    </button>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="flex gap-4 bg-white/5 p-4 rounded-lg border border-white/5">
                      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-white/10">
                        <img
                          src={item.images?.[0] || 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=200'}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <h3 className="text-base font-medium text-white">{item.name}</h3>
                          <p className="mt-1 text-sm text-gray-400">{item.brand}</p>
                          <p className="mt-1 text-sm text-gold-500 font-medium">{item.price.toLocaleString()} DA</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center border border-white/20 rounded">
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1 hover:bg-white/10"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="px-2 text-sm">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1 hover:bg-white/10"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-gray-500 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="border-t border-white/10 p-6 bg-dark-900">
                  <div className="flex justify-between text-base font-medium text-white mb-6">
                    <p>Subtotal</p>
                    <p>{cartTotal.toLocaleString()} DA</p>
                  </div>
                  <Link
                    to="/checkout"
                    onClick={closeCart}
                    className="flex w-full items-center justify-center rounded-sm bg-gold-500 px-6 py-4 text-base font-bold text-dark-900 shadow-sm hover:bg-gold-400 transition-all duration-300"
                  >
                    Proceed to Checkout
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[100] animate-fade-in-up">
            <div className="bg-dark-900/90 backdrop-blur-md border border-gold-500/50 text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-3">
                <CheckCircle className="text-gold-500 w-5 h-5" />
                <span className="font-medium text-sm">{notification}</span>
            </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow pt-16">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-dark-900 border-t border-white/5 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-xs text-gray-600">
            <p>© Quality Time dz / by :abdou / insta : 0.ab._.dou.0</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
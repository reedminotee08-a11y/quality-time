import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { ProductDetails } from './pages/ProductDetails';
import { Checkout } from './pages/Checkout';
import { EnhancedAdminDashboard } from './components/admin/EnhancedAdminDashboard';
import { CartProvider } from './context/CartContext';
import { EnhancedAuthProvider } from './context/EnhancedAuthContext';

function App() {
  return (
    <HashRouter>
      <EnhancedAuthProvider>
        <CartProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/admin" element={<EnhancedAdminDashboard />} />
            </Routes>
          </Layout>
        </CartProvider>
      </EnhancedAuthProvider>
    </HashRouter>
  );
}

export default App;

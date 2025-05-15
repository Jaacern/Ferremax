import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Componentes comunes
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

// Páginas de autenticación
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ChangePassword from './pages/Auth/ChangePassword';

// Páginas de catálogo
import ProductCatalog from './pages/Catalog/ProductCatalog';
import ProductPage from './pages/Catalog/ProductPage';

// Páginas de carrito
import ShoppingCart from './pages/Cart/ShoppingCart';
import Checkout from './pages/Cart/Checkout';
import PaymentSuccess from './pages/Cart/PaymentSuccess';

// Página de inicio (aún no la hemos creado, pero la necesitamos)
import Home from './pages/Home';

function App() {
  return (
    <Router>
      <div className="App d-flex flex-column min-vh-100">
        <Navbar />
        <main className="flex-grow-1">
          <Routes>
            {/* Ruta principal */}
            <Route path="/" element={<Home />} />
            
            {/* Rutas de autenticación */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/change-password" element={<ChangePassword />} />
            
            {/* Rutas de productos */}
            <Route path="/products" element={<ProductCatalog />} />
            <Route path="/products/:id" element={<ProductPage />} />
            
            {/* Rutas de carrito */}
            <Route path="/cart" element={<ShoppingCart />} />
            <Route path="/checkout" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <Checkout />
              </ProtectedRoute>
            } />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            
            {/* Ruta para páginas no encontradas */}
            <Route path="*" element={
              <div className="container py-5 text-center">
                <h1>404 - Página no encontrada</h1>
                <p>La página que estás buscando no existe.</p>
              </div>
            } />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
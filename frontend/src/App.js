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

// Página de inicio
import Home from './pages/Home';

// Páginas del panel de administración
import AdminDashboard from './pages/Admin/Dashboard';
import ProductManagement from './pages/Admin/ProductManagement';
import UserManagement from './pages/Admin/UserManagement';
import OrderManagement from './pages/Admin/OrderManagement';
import BranchManagement from './pages/Admin/BranchManagement';
import AdminStockPage from './pages/Admin/AdminStockPage';  

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
            <Route
              path="/checkout"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <Checkout />
                </ProtectedRoute>
              }
            />
            <Route path="/payment-success" element={<PaymentSuccess />} />

            {/* Rutas de administración protegidas */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ProductManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <UserManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <OrderManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/branches"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <BranchManagement />
                </ProtectedRoute>
              }
            />
            <Route                                   /* <-- NUEVA RUTA */
              path="/admin/stock"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminStockPage />
                </ProtectedRoute>
              }
            />

            {/* Ruta para páginas no encontradas */}
            <Route
              path="*"
              element={
                <div className="container py-5 text-center">
                  <h1>404 - Página no encontrada</h1>
                  <p>La página que estás buscando no existe.</p>
                </div>
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
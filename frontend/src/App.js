import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Componentes comunes
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Loading from './components/common/Loading';
import ProtectedRoute from './components/common/ProtectedRoute';

// Páginas
import Home from './pages/Home';

// Páginas de Autenticación
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ChangePassword from './pages/Auth/ChangePassword';

// Páginas de Catálogo
import ProductCatalog from './pages/Catalog/ProductCatalog';
import ProductPage from './pages/Catalog/ProductPage';

// Páginas de Carrito
import ShoppingCart from './pages/Cart/ShoppingCart';
import Checkout from './pages/Cart/Checkout';
import PaymentSuccess from './pages/Cart/PaymentSuccess';

// Páginas de Usuario
import Profile from './pages/User/Profile';
import Addresses from './pages/User/Addresses';
import Orders from './pages/User/Orders';

// Páginas de Admin
import AdminDashboard from './pages/Admin/Dashboard';
import ProductManagement from './pages/Admin/ProductManagement';
import UserManagement from './pages/Admin/UserManagement';
import OrderManagement from './pages/Admin/OrderManagement';
import BranchManagement from './pages/Admin/BranchManagement';

// Páginas de Vendedor
import VendorDashboard from './pages/Vendor/Dashboard';
import OrdersToApprove from './pages/Vendor/OrdersToApprove';
import ProductInventory from './pages/Vendor/ProductInventory';

// Páginas de Bodeguero
import WarehouseDashboard from './pages/Warehouse/Dashboard';
import PendingOrders from './pages/Warehouse/PendingOrders';
import StockManagement from './pages/Warehouse/StockManagement';

// Páginas de Contador
import AccountantDashboard from './pages/Accountant/Dashboard';
import PaymentsManagement from './pages/Accountant/PaymensManagement';
import SalesReport from './pages/Accountant/SalesReport';

// Importar acciones de Redux
import { getProfile, selectIsAuthenticated, selectUserRole, selectPasswordChangeRequired } from './store/auth.slice';
import { ROLES } from './config';

function App() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userRole = useSelector(selectUserRole);
  const passwordChangeRequired = useSelector(selectPasswordChangeRequired);

  // Verificar sesión activa al cargar la aplicación
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getProfile());
    }
  }, [dispatch, isAuthenticated]);

  // Función para determinar la redirección basada en el rol
  const getDashboardRoute = () => {
    if (!isAuthenticated) return '/login';
    
    // Si se requiere cambio de contraseña, redirigir a la página de cambio
    if (passwordChangeRequired) {
      return '/change-password';
    }
    
    // Redirigir según el rol
    switch (userRole) {
      case ROLES.ADMIN:
        return '/admin/dashboard';
      case ROLES.VENDOR:
        return '/vendor/dashboard';
      case ROLES.WAREHOUSE:
        return '/warehouse/dashboard';
      case ROLES.ACCOUNTANT:
        return '/accountant/dashboard';
      case ROLES.CUSTOMER:
        return '/profile';
      default:
        return '/';
    }
  };

  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
        <Navbar />
        <main className="flex-grow-1">
          <Routes>
            {/* Rutas públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/products" element={<ProductCatalog />} />
            <Route path="/products/:id" element={<ProductPage />} />
            <Route path="/cart" element={<ShoppingCart />} />
            
            {/* Ruta para cambio de contraseña obligatorio */}
            <Route 
              path="/change-password" 
              element={
                <ProtectedRoute isAllowed={isAuthenticated}>
                  <ChangePassword />
                </ProtectedRoute>
              } 
            />
            
            {/* Rutas para clientes autenticados */}
            <Route 
              path="/checkout" 
              element={
                <ProtectedRoute isAllowed={isAuthenticated && !passwordChangeRequired}>
                  <Checkout />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/payment/success" 
              element={
                <ProtectedRoute isAllowed={isAuthenticated && !passwordChangeRequired}>
                  <PaymentSuccess />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute isAllowed={isAuthenticated && !passwordChangeRequired}>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/addresses" 
              element={
                <ProtectedRoute isAllowed={isAuthenticated && !passwordChangeRequired}>
                  <Addresses />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/orders" 
              element={
                <ProtectedRoute isAllowed={isAuthenticated && !passwordChangeRequired}>
                  <Orders />
                </ProtectedRoute>
              } 
            />
            
            {/* Rutas de Admin */}
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute isAllowed={isAuthenticated && userRole === ROLES.ADMIN && !passwordChangeRequired}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/products" 
              element={
                <ProtectedRoute isAllowed={isAuthenticated && userRole === ROLES.ADMIN && !passwordChangeRequired}>
                  <ProductManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <ProtectedRoute isAllowed={isAuthenticated && userRole === ROLES.ADMIN && !passwordChangeRequired}>
                  <UserManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/orders" 
              element={
                <ProtectedRoute isAllowed={isAuthenticated && userRole === ROLES.ADMIN && !passwordChangeRequired}>
                  <OrderManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/branches" 
              element={
                <ProtectedRoute isAllowed={isAuthenticated && userRole === ROLES.ADMIN && !passwordChangeRequired}>
                  <BranchManagement />
                </ProtectedRoute>
              } 
            />
            
            {/* Rutas de Vendedor */}
            <Route 
              path="/vendor/dashboard" 
              element={
                <ProtectedRoute isAllowed={isAuthenticated && userRole === ROLES.VENDOR && !passwordChangeRequired}>
                  <VendorDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/vendor/orders" 
              element={
                <ProtectedRoute isAllowed={isAuthenticated && userRole === ROLES.VENDOR && !passwordChangeRequired}>
                  <OrdersToApprove />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/vendor/inventory" 
              element={
                <ProtectedRoute isAllowed={isAuthenticated && userRole === ROLES.VENDOR && !passwordChangeRequired}>
                  <ProductInventory />
                </ProtectedRoute>
              } 
            />
            
            {/* Rutas de Bodeguero */}
            <Route 
              path="/warehouse/dashboard" 
              element={
                <ProtectedRoute isAllowed={isAuthenticated && userRole === ROLES.WAREHOUSE && !passwordChangeRequired}>
                  <WarehouseDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/warehouse/orders" 
              element={
                <ProtectedRoute isAllowed={isAuthenticated && userRole === ROLES.WAREHOUSE && !passwordChangeRequired}>
                  <PendingOrders />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/warehouse/stock" 
              element={
                <ProtectedRoute isAllowed={isAuthenticated && userRole === ROLES.WAREHOUSE && !passwordChangeRequired}>
                  <StockManagement />
                </ProtectedRoute>
              } 
            />
            
            {/* Rutas de Contador */}
            <Route 
              path="/accountant/dashboard" 
              element={
                <ProtectedRoute isAllowed={isAuthenticated && userRole === ROLES.ACCOUNTANT && !passwordChangeRequired}>
                  <AccountantDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/accountant/payments" 
              element={
                <ProtectedRoute isAllowed={isAuthenticated && userRole === ROLES.ACCOUNTANT && !passwordChangeRequired}>
                  <PaymentsManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/accountant/reports" 
              element={
                <ProtectedRoute isAllowed={isAuthenticated && userRole === ROLES.ACCOUNTANT && !passwordChangeRequired}>
                  <SalesReport />
                </ProtectedRoute>
              } 
            />
            
            {/* Ruta de redirección al dashboard según rol */}
            <Route 
              path="/dashboard" 
              element={<Navigate replace to={getDashboardRoute()} />} 
            />
            
            {/* Redirección por defecto */}
            <Route path="*" element={<Navigate replace to="/" />} />
          </Routes>
        </main>
        <Footer />
        
        {/* Contenedor de notificaciones toast */}
        <ToastContainer 
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </Router>
  );
}

export default App;
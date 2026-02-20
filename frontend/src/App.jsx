import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store/index.js';
import { initializeAuth } from './store/slices/authSlice.js';
import { QueryProvider } from './providers/QueryProvider.jsx';
import Header from './components/layout/Header.jsx';
import Footer from './components/layout/Footer.jsx';
import CartDrawer from './components/cart/CartDrawer.jsx';
import DashboardLayout from './components/layout/DashboardLayout.jsx';
import { MerchantRoute, CustomerRoute } from './components/layout/ProtectedRoute.jsx';
import { PageLoading } from './components/ui/Loading.jsx';
import ErrorBoundary from './components/ui/ErrorBoundary.jsx';

// Storefront page components
import HomePage from './pages/HomePage.jsx';
import ProductsPage from './pages/ProductsPage.jsx';
import ProductDetailPage from './pages/ProductDetailPage.jsx';
import CategoryPage from './pages/CategoryPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import OrderConfirmationPage from './pages/OrderConfirmationPage.jsx';

// Customer account pages
import LoginPage from './pages/storefront/LoginPage.jsx';
import RegisterPage from './pages/storefront/RegisterPage.jsx';
import AccountPage from './pages/storefront/AccountPage.jsx';
import OrderHistoryPage from './pages/storefront/OrderHistoryPage.jsx';

// Merchant auth pages
import MerchantLoginPage from './pages/merchant/MerchantLoginPage.jsx';
import MerchantRegisterPage from './pages/merchant/MerchantRegisterPage.jsx';

// Dashboard page components
import DashboardHomePage from './pages/dashboard/DashboardHomePage.jsx';
import ProductsListPage from './pages/dashboard/ProductsListPage.jsx';
import ProductFormPage from './pages/dashboard/ProductFormPage.jsx';
import CategoriesPage from './pages/dashboard/CategoriesPage.jsx';
import AnalyticsPage from './pages/dashboard/AnalyticsPage.jsx';
import OrdersListPage from './pages/dashboard/OrdersListPage.jsx';
import OrderDetailPage from './pages/dashboard/OrderDetailPage.jsx';
import NotificationsPage from './pages/dashboard/NotificationsPage.jsx';

/**
 * Dispatch initializeAuth on mount to restore session from httpOnly cookie
 */
function AuthInitializer() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);
  return null;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function NotFoundPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center animate-fade-in-up">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-surface-100 mb-6">
        <span className="font-display text-4xl text-surface-400">?</span>
      </div>
      <h1 className="font-display text-5xl text-surface-900 mb-3">Page not found</h1>
      <p className="text-surface-500 text-lg mb-8 max-w-md mx-auto">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <a href="/" className="btn btn-primary">Back to Home</a>
    </div>
  );
}

/**
 * Storefront layout with header, footer, and cart drawer
 */
function StorefrontLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-surface-50">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
    </div>
  );
}

/**
 * Main App component
 */
function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <PersistGate loading={<PageLoading />} persistor={persistor}>
          <AuthInitializer />
          <QueryProvider>
            <BrowserRouter>
              <ScrollToTop />
              <Routes>
              {/* Storefront routes */}
              <Route
                path="/"
                element={
                  <StorefrontLayout>
                    <HomePage />
                  </StorefrontLayout>
                }
              />
              <Route
                path="/products"
                element={
                  <StorefrontLayout>
                    <ProductsPage />
                  </StorefrontLayout>
                }
              />
              <Route
                path="/products/:slug"
                element={
                  <StorefrontLayout>
                    <ProductDetailPage />
                  </StorefrontLayout>
                }
              />
              <Route
                path="/category/:slug"
                element={
                  <StorefrontLayout>
                    <CategoryPage />
                  </StorefrontLayout>
                }
              />
              <Route
                path="/checkout"
                element={
                  <StorefrontLayout>
                    <CheckoutPage />
                  </StorefrontLayout>
                }
              />
              <Route
                path="/order/confirmation"
                element={
                  <StorefrontLayout>
                    <OrderConfirmationPage />
                  </StorefrontLayout>
                }
              />

              {/* Customer account routes */}
              <Route
                path="/login"
                element={
                  <StorefrontLayout>
                    <LoginPage />
                  </StorefrontLayout>
                }
              />
              <Route
                path="/register"
                element={
                  <StorefrontLayout>
                    <RegisterPage />
                  </StorefrontLayout>
                }
              />
              <Route
                path="/account"
                element={
                  <StorefrontLayout>
                    <CustomerRoute>
                      <AccountPage />
                    </CustomerRoute>
                  </StorefrontLayout>
                }
              />
              <Route
                path="/account/orders"
                element={
                  <StorefrontLayout>
                    <CustomerRoute>
                      <OrderHistoryPage />
                    </CustomerRoute>
                  </StorefrontLayout>
                }
              />

              {/* Dashboard routes */}
              <Route path="/dashboard" element={<MerchantRoute><DashboardLayout /></MerchantRoute>}>
                <Route index element={<DashboardHomePage />} />
                <Route path="products" element={<ProductsListPage />} />
                <Route path="products/new" element={<ProductFormPage />} />
                <Route path="products/:id/edit" element={<ProductFormPage />} />
                <Route path="categories" element={<CategoriesPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="orders" element={<OrdersListPage />} />
                <Route path="orders/:orderNumber" element={<OrderDetailPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
              </Route>

              {/* Merchant auth routes */}
              <Route path="/merchant/login" element={<MerchantLoginPage />} />
              <Route path="/merchant/register" element={<MerchantRegisterPage />} />

              {/* 404 */}
              <Route
                path="*"
                element={
                  <StorefrontLayout>
                    <NotFoundPage />
                  </StorefrontLayout>
                }
              />
              </Routes>
            </BrowserRouter>
          </QueryProvider>
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;

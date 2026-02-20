import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectUserType, selectAuthLoading } from '../../store/slices/authSlice.js';
import Loading from '../ui/Loading.jsx';

/**
 * Protected route component that requires authentication
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {'merchant'|'customer'|null} [props.requiredType] - Required user type
 * @param {string} [props.redirectTo] - Redirect path if not authenticated
 */
export function ProtectedRoute({
  children,
  requiredType = null,
  redirectTo = '/login',
}) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userType = useSelector(selectUserType);
  const isLoading = useSelector(selectAuthLoading);
  const location = useLocation();

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" />
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check user type if required
  if (requiredType && userType !== requiredType) {
    const redirectPath = userType === 'merchant' ? '/dashboard' : '/';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
}

/**
 * Route that requires merchant authentication
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export function MerchantRoute({ children }) {
  return (
    <ProtectedRoute requiredType="merchant" redirectTo="/merchant/login">
      {children}
    </ProtectedRoute>
  );
}

/**
 * Route that requires customer authentication
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export function CustomerRoute({ children }) {
  return (
    <ProtectedRoute requiredType="customer" redirectTo="/login">
      {children}
    </ProtectedRoute>
  );
}

export default ProtectedRoute;

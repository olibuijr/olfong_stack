import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LoadingSpinner from '../common/LoadingSpinner';

const ProtectedRoute = ({ children, requiredRole, requiredRoles }) => {
  const { isAuthenticated, user, isLoading } = useSelector((state) => state.auth);
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    const loginPath = (requiredRole === 'ADMIN' || requiredRoles?.includes('ADMIN')) ? '/admin-login' : '/login';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // Check if role matches (support both single role and multiple roles)
  if (requiredRole || requiredRoles) {
    const allowedRoles = requiredRoles || [requiredRole];
    if (!allowedRoles.includes(user?.role)) {
      return <Navigate to="/" replace />;
    }
  }

  return children || <Outlet />;
};

export default ProtectedRoute;



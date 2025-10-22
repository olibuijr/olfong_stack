import { useSelector } from 'react-redux';

/**
 * Hook to check if the current user is an admin
 * @returns {boolean} True if user is admin, false otherwise
 */
const useAdmin = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  return isAuthenticated && user?.role === 'ADMIN';
};

export default useAdmin;
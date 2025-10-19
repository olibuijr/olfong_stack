import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { kenniLogin } from '../store/slices/authSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { parseFragment } from '../utils/oidc';

const AuthCallback = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const { idToken, state, error } = parseFragment(location.hash);
    const expectedState = sessionStorage.getItem('kenni_oidc_state');
    sessionStorage.removeItem('kenni_oidc_state');

    if (error) {
      navigate('/login');
      return;
    }
    if (!idToken || !state || state !== expectedState) {
      navigate('/login');
      return;
    }

    dispatch(kenniLogin({ idToken }))
      .unwrap()
      .then(() => navigate('/'))
      .catch(() => navigate('/login'));
  }, [dispatch, navigate, location.hash]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="large" />
    </div>
  );
};

export default AuthCallback;



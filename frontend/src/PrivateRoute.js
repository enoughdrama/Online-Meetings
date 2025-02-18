import { useContext, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContext';

function PrivateRoute({ children, requiredRoles = [] }) {
  const { user, login } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const storedToken = localStorage.getItem('token');

    if (user) {
      setIsAuthenticated(true);
      checkPermissions(user);
    } else if (storedUser && storedToken) {
      login(storedUser, storedToken);
      setIsAuthenticated(true);
      checkPermissions(storedUser);
    } else {
      setIsAuthenticated(false);
    }

    setLoading(false);
  }, [user, login]);

  const checkPermissions = (user) => {
    if (requiredRoles.length === 0 || requiredRoles.includes(user.role) || user.role === 'admin') {
      setHasPermission(true);
    } else {
      setHasPermission(false);
    }
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} />;
  }

  if (!hasPermission) {
    return <Navigate to="/" state={{ from: location }} />;
  }

  return children;
}

export default PrivateRoute;

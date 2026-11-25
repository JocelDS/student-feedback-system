import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import Spinner from './Spinner.jsx';

// Only lets logged-in admins see the page. (The backend ALSO checks the token,
// so hiding the page here is for user experience, not security.)
export default function ProtectedRoute({ children }) {
  const { isAdmin, checking } = useAuth();
  if (checking) return <Spinner label="Checking your session..." />;
  if (!isAdmin) return <Navigate to="/admin/login" replace />;
  return children;
}

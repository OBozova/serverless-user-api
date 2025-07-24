import { Navigate } from 'react-router-dom';
import { isAuthenticated, isAdmin } from '../utils/auth';
import type { JSX } from 'react';

type Props = {
  children: JSX.Element;
  adminOnly?: boolean;
};

export default function ProtectedRoute({ children, adminOnly = false }: Props) {
  if (!isAuthenticated()) return <Navigate to="/login" />;
  if (adminOnly && !isAdmin()) return <Navigate to="/" />;

  return children;
}

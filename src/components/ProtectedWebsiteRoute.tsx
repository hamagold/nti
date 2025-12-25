import { Navigate } from 'react-router-dom';
import { useWebsiteStore } from '@/store/websiteStore';

interface ProtectedWebsiteRouteProps {
  children: React.ReactNode;
}

export const ProtectedWebsiteRoute = ({ children }: ProtectedWebsiteRouteProps) => {
  const { isWebsiteAdminAuthenticated } = useWebsiteStore();

  if (!isWebsiteAdminAuthenticated) {
    return <Navigate to="/website-admin" replace />;
  }

  return <>{children}</>;
};

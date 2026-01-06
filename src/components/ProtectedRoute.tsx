import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { usePermissions } from '@/hooks/usePermissions';
import type { Permission } from '@/store/settingsStore';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: Permission;
  fallbackPath?: string;
}

export function ProtectedRoute({ children, requiredPermission, fallbackPath }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const { hasPermission, permissionsLoading } = usePermissions();

  if (isLoading || permissionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">چاوەڕێ بکە...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to={fallbackPath ?? '/'} replace />;
  }

  return <>{children}</>;
}

import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { getAdminAccessErrorMessage, verifyAdminAccess } from '@/lib/adminAccess';

export function AdminRoute() {
  const location = useLocation();
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [hasAdminAccess, setHasAdminAccess] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkAdminAccess = async () => {
      setIsCheckingAccess(true);

      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        if (isMounted) {
          setHasAdminAccess(false);
          setIsCheckingAccess(false);
        }
        return;
      }

      const access = await verifyAdminAccess(data.user);

      if (!access.allowed) {
        await supabase.auth.signOut();
        toast.error(getAdminAccessErrorMessage(access.reason));
      }

      if (isMounted) {
        setHasAdminAccess(access.allowed);
        setIsCheckingAccess(false);
      }
    };

    checkAdminAccess();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isCheckingAccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!hasAdminAccess) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  Users,
  Globe,
  CheckSquare,
  Stamp,
  Settings,
  LogOut,
  FileText,
  Tags,
} from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: Users, label: 'Users', href: '/admin/users' },
  { icon: Globe, label: 'Countries', href: '/admin/countries' },
  { icon: Stamp, label: 'Visa Types', href: '/admin/visa-types' },
  { icon: CheckSquare, label: 'Checklists', href: '/admin/checklists' },
  { icon: FileText, label: 'Articles', href: '/admin/articles' },
  { icon: Tags, label: 'Article Categories', href: '/admin/article-categories' },
  { icon: Settings, label: 'Settings', href: '/admin/settings' },
];

export function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [adminEmail, setAdminEmail] = useState('');

  useEffect(() => {
    const loadAdminUser = async () => {
      const { data } = await supabase.auth.getUser();
      setAdminEmail(data.user?.email ?? '');
    };

    loadAdminUser();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  return (
    <aside className="sticky top-0 h-screen w-64 border-r border-border bg-sidebar flex flex-col">
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <img src="/favicon.png" alt="UniPilot logo" className="h-8 w-8 object-contain" />
        <span className="text-lg font-semibold text-sidebar-foreground">UniPilot Admin</span>
      </div>
      
      <nav className="flex-1 space-y-1 p-4 scrollbar-thin overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href || 
            (item.href !== '/admin' && location.pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
            <span className="text-xs font-medium text-primary">AD</span>
          </div>
          <div className="flex-1 truncate">
            <p className="text-sm font-medium text-sidebar-foreground">Admin</p>
            <p className="text-xs text-muted-foreground truncate">{adminEmail || 'admin@unipilot.app'}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors mt-2"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}

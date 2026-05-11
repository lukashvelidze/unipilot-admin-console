import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DataTable } from '@/components/admin/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, MoreHorizontal, Shield, Ban, Mail, Loader2, Users, Globe, CreditCard } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  country_origin: string | null;
  destination_country: string | null;
  level_of_study: string | null;
  visa_type: string | null;
  subscription_tier: string | null;
  created_at: string;
  updated_at: string;
}

interface UserStats {
  total: number;
  byTier: Record<string, number>;
  byDestination: Record<string, number>;
  thisMonth: number;
}

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UserStats>({ total: 0, byTier: {}, byDestination: {}, thisMonth: 0 });
  const { toast } = useToast();

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error loading users', description: error.message, variant: 'destructive' });
    } else {
      const users = data || [];
      setProfiles(users);

      // Calculate stats
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const byTier: Record<string, number> = {};
      const byDestination: Record<string, number> = {};
      let thisMonth = 0;

      users.forEach(user => {
        // Count by tier
        const tier = user.subscription_tier || 'free';
        byTier[tier] = (byTier[tier] || 0) + 1;

        // Count by destination
        if (user.destination_country) {
          byDestination[user.destination_country] = (byDestination[user.destination_country] || 0) + 1;
        }

        // Count this month
        if (new Date(user.created_at) >= startOfMonth) {
          thisMonth++;
        }
      });

      setStats({ total: users.length, byTier, byDestination, thisMonth });
    }
    setLoading(false);
  };

  const filteredUsers = profiles.filter(user =>
    (user.full_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (user.email?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const columns = [
    {
      key: 'full_name',
      header: 'User',
      render: (user: Profile) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
            <span className="text-xs font-medium text-primary">
              {getInitials(user.full_name)}
            </span>
          </div>
          <div>
            <p className="font-medium text-foreground">{user.full_name || 'N/A'}</p>
            <p className="text-sm text-muted-foreground">{user.email || 'N/A'}</p>
          </div>
        </div>
      )
    },
    {
      key: 'destination_country',
      header: 'Destination',
      render: (user: Profile) => user.destination_country || '-'
    },
    {
      key: 'visa_type',
      header: 'Visa Type',
      render: (user: Profile) => user.visa_type || '-'
    },
    {
      key: 'subscription_tier',
      header: 'Tier',
      render: (user: Profile) => (
        <StatusBadge status={user.subscription_tier === 'premium' ? 'success' : user.subscription_tier === 'standard' ? 'warning' : 'default'}>
          {user.subscription_tier || 'free'}
        </StatusBadge>
      )
    },
    {
      key: 'created_at',
      header: 'Joined',
      render: (user: Profile) => formatDate(user.created_at)
    },
    {
      key: 'actions',
      header: '',
      render: (user: Profile) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Mail className="mr-2 h-4 w-4" />
              Send Email
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <Ban className="mr-2 h-4 w-4" />
              Ban User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  ];

  const topDestinations = Object.entries(stats.byDestination)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Users</h1>
          <p className="text-muted-foreground">Manage user accounts and permissions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <Users className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.thisMonth}</p>
                <p className="text-sm text-muted-foreground">New This Month</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
                <CreditCard className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.byTier['premium'] || 0}</p>
                <p className="text-sm text-muted-foreground">Premium Users</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <Globe className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">
                  {topDestinations.map(([country]) => country).join(', ') || '-'}
                </p>
                <p className="text-sm text-muted-foreground">Top Destinations</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border rounded-lg">
            No users found
          </div>
        ) : (
          <DataTable columns={columns} data={filteredUsers} />
        )}
      </div>
    </AdminLayout>
  );
}

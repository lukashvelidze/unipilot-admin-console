import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { StatsCard } from '@/components/admin/StatsCard';
import { DataTable } from '@/components/admin/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { supabase } from '@/lib/supabase';
import { Users, Globe, CheckSquare, Stamp, Loader2, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardStats {
  totalCountries: number;
  totalVisaTypes: number;
  totalChecklists: number;
}

interface RecentProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  subscription_tier: string | null;
  created_at: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCountries: 0,
    totalVisaTypes: 0,
    totalChecklists: 0,
  });
  const [recentProfiles, setRecentProfiles] = useState<RecentProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);

    const [countriesRes, visaTypesRes, checklistsRes, profilesRes] = await Promise.all([
      supabase.from('destination_countries').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('visa_types').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('checklists').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('id, full_name, email, subscription_tier, created_at').order('created_at', { ascending: false }).limit(5)
    ]);

    setStats({
      totalCountries: countriesRes.count || 0,
      totalVisaTypes: visaTypesRes.count || 0,
      totalChecklists: checklistsRes.count || 0,
    });

    setRecentProfiles(profilesRes.data || []);
    setLoading(false);
  };

  const userColumns = [
    {
      key: 'full_name',
      header: 'Name',
      render: (user: RecentProfile) => user.full_name || 'N/A'
    },
    {
      key: 'email',
      header: 'Email',
      render: (user: RecentProfile) => user.email || 'N/A'
    },
    {
      key: 'subscription_tier',
      header: 'Tier',
      render: (user: RecentProfile) => (
        <StatusBadge status={user.subscription_tier === 'premium' ? 'success' : 'default'}>
          {user.subscription_tier || 'free'}
        </StatusBadge>
      )
    },
    {
      key: 'created_at',
      header: 'Joined',
      render: (user: RecentProfile) => new Date(user.created_at).toLocaleDateString()
    },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your UniPilot platform</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Countries"
            value={stats.totalCountries}
            icon={<Globe className="h-5 w-5 text-primary" />}
          />
          <StatsCard
            title="Visa Types"
            value={stats.totalVisaTypes}
            icon={<Stamp className="h-5 w-5 text-primary" />}
          />
          <StatsCard
            title="Checklists"
            value={stats.totalChecklists}
            icon={<CheckSquare className="h-5 w-5 text-primary" />}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Recent Users</h2>
            </div>
            {recentProfiles.length > 0 ? (
              <DataTable columns={userColumns} data={recentProfiles} />
            ) : (
              <div className="text-center py-8 text-muted-foreground border rounded-lg">
                No users found
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
            </div>
            <div className="grid gap-3">
              <Link
                to="/admin/checklists"
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 hover:bg-accent transition-colors"
              >
                <CheckSquare className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Manage Checklists</p>
                  <p className="text-sm text-muted-foreground">Add or edit visa checklists and items</p>
                </div>
              </Link>
              <Link
                to="/admin/visa-types"
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 hover:bg-accent transition-colors"
              >
                <Stamp className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Manage Visa Types</p>
                  <p className="text-sm text-muted-foreground">Configure visa types per country</p>
                </div>
              </Link>
              <Link
                to="/admin/articles"
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 hover:bg-accent transition-colors"
              >
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Manage Articles</p>
                  <p className="text-sm text-muted-foreground">Create, edit, and publish guidance</p>
                </div>
              </Link>
              <Link
                to="/admin/countries"
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 hover:bg-accent transition-colors"
              >
                <Globe className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Manage Countries</p>
                  <p className="text-sm text-muted-foreground">Add or edit destination countries</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

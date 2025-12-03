import { AdminLayout } from '@/components/admin/AdminLayout';
import { StatsCard } from '@/components/admin/StatsCard';
import { DataTable } from '@/components/admin/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { mockDashboardStats, mockUsers, mockChecklists, mockCountries, mockVisaTypes } from '@/data/mockData';
import { Users, Crown, Globe, CheckSquare, Stamp, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const recentUsers = mockUsers.slice(0, 5);

  const userColumns = [
    { key: 'fullName', header: 'Name' },
    { key: 'email', header: 'Email' },
    { 
      key: 'subscriptionTier', 
      header: 'Tier',
      render: (user: typeof mockUsers[0]) => (
        <StatusBadge status={user.subscriptionTier === 'premium' ? 'success' : 'default'}>
          {user.subscriptionTier}
        </StatusBadge>
      )
    },
    { key: 'createdAt', header: 'Joined' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your UniPilot platform</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatsCard
            title="Total Users"
            value={mockDashboardStats.totalUsers.toLocaleString()}
            icon={<Users className="h-5 w-5 text-primary" />}
            trend={{ value: 12, label: 'vs last month' }}
          />
          <StatsCard
            title="Active Users"
            value={mockDashboardStats.activeUsers.toLocaleString()}
            icon={<TrendingUp className="h-5 w-5 text-primary" />}
            trend={{ value: 8, label: 'vs last month' }}
          />
          <StatsCard
            title="Premium Users"
            value={mockDashboardStats.premiumUsers.toLocaleString()}
            icon={<Crown className="h-5 w-5 text-primary" />}
            trend={{ value: 23, label: 'vs last month' }}
          />
          <StatsCard
            title="Countries"
            value={mockCountries.filter(c => c.isActive).length}
            icon={<Globe className="h-5 w-5 text-primary" />}
          />
          <StatsCard
            title="Visa Types"
            value={mockVisaTypes.filter(v => v.isActive).length}
            icon={<Stamp className="h-5 w-5 text-primary" />}
          />
          <StatsCard
            title="Checklists"
            value={mockChecklists.length}
            icon={<CheckSquare className="h-5 w-5 text-primary" />}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Recent Users</h2>
              <Link to="/admin/users" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>
            <DataTable columns={userColumns} data={recentUsers} />
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
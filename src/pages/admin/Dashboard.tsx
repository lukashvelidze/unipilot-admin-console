import { AdminLayout } from '@/components/admin/AdminLayout';
import { StatsCard } from '@/components/admin/StatsCard';
import { DataTable } from '@/components/admin/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { mockDashboardStats, mockDocuments, mockUsers } from '@/data/mockData';
import { Users, FileText, Crown, Clock, Globe, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const recentUsers = mockUsers.slice(0, 5);
  const pendingDocs = mockDocuments.filter(d => !d.isVerified && !d.isRejected).slice(0, 5);

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

  const docColumns = [
    { key: 'userName', header: 'User' },
    { key: 'categoryName', header: 'Category' },
    { key: 'originalName', header: 'File' },
    { key: 'createdAt', header: 'Uploaded' },
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
            title="Pending Reviews"
            value={mockDashboardStats.pendingDocuments}
            icon={<Clock className="h-5 w-5 text-primary" />}
          />
          <StatsCard
            title="Total Documents"
            value={mockDashboardStats.totalDocuments.toLocaleString()}
            icon={<FileText className="h-5 w-5 text-primary" />}
          />
          <StatsCard
            title="Countries"
            value={mockDashboardStats.totalCountries}
            icon={<Globe className="h-5 w-5 text-primary" />}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Recent Users</h2>
              <a href="/admin/users" className="text-sm text-primary hover:underline">
                View all
              </a>
            </div>
            <DataTable columns={userColumns} data={recentUsers} />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Pending Documents</h2>
              <a href="/admin/documents" className="text-sm text-primary hover:underline">
                View all
              </a>
            </div>
            <DataTable columns={docColumns} data={pendingDocs} />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
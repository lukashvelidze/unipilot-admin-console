import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DataTable } from '@/components/admin/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { mockUsers, User } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, MoreHorizontal, Shield, Ban, Mail } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredUsers = mockUsers.filter(user =>
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    { 
      key: 'fullName', 
      header: 'User',
      render: (user: User) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
            <span className="text-xs font-medium text-primary">
              {user.fullName.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div>
            <p className="font-medium text-foreground">{user.fullName}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
      )
    },
    { 
      key: 'status', 
      header: 'Status',
      render: (user: User) => (
        <div className="flex gap-2">
          {user.isSuperAdmin && <StatusBadge status="info">Admin</StatusBadge>}
          {user.isBanned && <StatusBadge status="error">Banned</StatusBadge>}
          {!user.isSuperAdmin && !user.isBanned && <StatusBadge status="success">Active</StatusBadge>}
        </div>
      )
    },
    { 
      key: 'subscriptionTier', 
      header: 'Tier',
      render: (user: User) => (
        <StatusBadge status={user.subscriptionTier === 'premium' ? 'success' : 'default'}>
          {user.subscriptionTier}
        </StatusBadge>
      )
    },
    { key: 'createdAt', header: 'Joined' },
    { key: 'lastSignIn', header: 'Last Sign In' },
    { 
      key: 'actions', 
      header: '',
      render: (user: User) => (
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
            <DropdownMenuItem>
              <Shield className="mr-2 h-4 w-4" />
              {user.isSuperAdmin ? 'Remove Admin' : 'Make Admin'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <Ban className="mr-2 h-4 w-4" />
              {user.isBanned ? 'Unban User' : 'Ban User'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Users</h1>
          <p className="text-muted-foreground">Manage user accounts and permissions</p>
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

        <DataTable columns={columns} data={filteredUsers} />
      </div>
    </AdminLayout>
  );
}
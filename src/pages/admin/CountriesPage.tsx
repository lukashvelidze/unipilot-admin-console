import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DataTable } from '@/components/admin/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { mockCountries } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, MoreHorizontal, Edit, Trash2, Power } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

type Country = typeof mockCountries[0] & { id: string };

export default function CountriesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [countries, setCountries] = useState(mockCountries);
  const { toast } = useToast();
  
  const filteredCountries = countries
    .filter(country =>
      country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.code.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .map(c => ({ ...c, id: c.code }));

  const toggleActive = (code: string) => {
    setCountries(prev => prev.map(c => 
      c.code === code ? { ...c, isActive: !c.isActive } : c
    ));
    toast({ title: 'Status updated', description: 'Country status has been changed.' });
  };

  const columns = [
    { key: 'code', header: 'Code' },
    { key: 'name', header: 'Country Name' },
    { 
      key: 'isActive', 
      header: 'Status',
      render: (country: Country) => (
        <StatusBadge status={country.isActive ? 'success' : 'default'}>
          {country.isActive ? 'Active' : 'Inactive'}
        </StatusBadge>
      )
    },
    { 
      key: 'actions', 
      header: '',
      render: (country: Country) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toggleActive(country.code)}>
              <Power className="mr-2 h-4 w-4" />
              {country.isActive ? 'Deactivate' : 'Activate'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Countries</h1>
            <p className="text-muted-foreground">Manage destination and origin countries</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Country
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search countries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <DataTable columns={columns} data={filteredCountries} />
      </div>
    </AdminLayout>
  );
}
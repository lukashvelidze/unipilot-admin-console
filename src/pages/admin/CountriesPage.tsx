import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DataTable } from '@/components/admin/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { mockCountries, Country } from '@/data/mockData';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

type CountryWithId = Country & { id: string };

export default function CountriesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [countries, setCountries] = useState<CountryWithId[]>(
    mockCountries.map(c => ({ ...c, id: c.code }))
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCountry, setEditingCountry] = useState<CountryWithId | null>(null);
  const [formData, setFormData] = useState({ code: '', name: '' });
  const { toast } = useToast();
  
  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleActive = (code: string) => {
    setCountries(prev => prev.map(c => 
      c.code === code ? { ...c, isActive: !c.isActive } : c
    ));
    toast({ title: 'Status updated' });
  };

  const handleDelete = (code: string) => {
    setCountries(prev => prev.filter(c => c.code !== code));
    toast({ title: 'Country deleted' });
  };

  const openCreateDialog = () => {
    setEditingCountry(null);
    setFormData({ code: '', name: '' });
    setIsDialogOpen(true);
  };

  const openEditDialog = (country: CountryWithId) => {
    setEditingCountry(country);
    setFormData({ code: country.code, name: country.name });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.code || !formData.name) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    if (editingCountry) {
      setCountries(prev => prev.map(c => 
        c.id === editingCountry.id ? { ...c, name: formData.name } : c
      ));
      toast({ title: 'Country updated' });
    } else {
      if (countries.some(c => c.code === formData.code.toUpperCase())) {
        toast({ title: 'Country code already exists', variant: 'destructive' });
        return;
      }
      const newCountry: CountryWithId = {
        id: formData.code.toUpperCase(),
        code: formData.code.toUpperCase(),
        name: formData.name,
        isActive: true,
      };
      setCountries(prev => [...prev, newCountry]);
      toast({ title: 'Country created' });
    }
    setIsDialogOpen(false);
  };

  const columns = [
    { key: 'code', header: 'Code' },
    { key: 'name', header: 'Country Name' },
    { 
      key: 'isActive', 
      header: 'Status',
      render: (country: CountryWithId) => (
        <StatusBadge status={country.isActive ? 'success' : 'default'}>
          {country.isActive ? 'Active' : 'Inactive'}
        </StatusBadge>
      )
    },
    { 
      key: 'actions', 
      header: '',
      render: (country: CountryWithId) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openEditDialog(country)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toggleActive(country.code)}>
              <Power className="mr-2 h-4 w-4" />
              {country.isActive ? 'Deactivate' : 'Activate'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(country.code)}>
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
            <p className="text-muted-foreground">Manage destination countries</p>
          </div>
          <Button onClick={openCreateDialog}>
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCountry ? 'Edit Country' : 'Add Country'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Country Code *</Label>
              <Input 
                value={formData.code} 
                onChange={(e) => setFormData(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="e.g., US, UK, DE"
                maxLength={3}
                disabled={!!editingCountry}
              />
            </div>
            <div className="space-y-2">
              <Label>Country Name *</Label>
              <Input 
                value={formData.name} 
                onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g., United States"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{editingCountry ? 'Save Changes' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
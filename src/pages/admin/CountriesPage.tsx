import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DataTable } from '@/components/admin/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { Country } from '@/data/mockData';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, MoreHorizontal, Edit, Trash2, Power, Loader2 } from 'lucide-react';
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
  const [countries, setCountries] = useState<CountryWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCountry, setEditingCountry] = useState<CountryWithId | null>(null);
  const [formData, setFormData] = useState({ code: '', name: '' });
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('destination_countries')
      .select('*')
      .order('name');

    if (error) {
      toast({ title: 'Error loading countries', description: error.message, variant: 'destructive' });
    } else {
      setCountries((data || []).map(c => ({ ...c, id: c.code })));
    }
    setLoading(false);
  };

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleActive = async (code: string) => {
    const country = countries.find(c => c.code === code);
    if (!country) return;

    const { error } = await supabase
      .from('destination_countries')
      .update({ is_active: !country.is_active })
      .eq('code', code);

    if (error) {
      toast({ title: 'Error updating status', description: error.message, variant: 'destructive' });
    } else {
      setCountries(prev => prev.map(c =>
        c.code === code ? { ...c, is_active: !c.is_active } : c
      ));
      toast({ title: 'Status updated' });
    }
  };

  const handleDelete = async (code: string) => {
    const { error } = await supabase
      .from('destination_countries')
      .delete()
      .eq('code', code);

    if (error) {
      toast({ title: 'Error deleting country', description: error.message, variant: 'destructive' });
    } else {
      setCountries(prev => prev.filter(c => c.code !== code));
      toast({ title: 'Country deleted' });
    }
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

  const handleSubmit = async () => {
    if (!formData.code || !formData.name) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    setSubmitting(true);

    if (editingCountry) {
      const { error } = await supabase
        .from('destination_countries')
        .update({ name: formData.name })
        .eq('code', editingCountry.code);

      if (error) {
        toast({ title: 'Error updating country', description: error.message, variant: 'destructive' });
      } else {
        setCountries(prev => prev.map(c =>
          c.id === editingCountry.id ? { ...c, name: formData.name } : c
        ));
        toast({ title: 'Country updated' });
        setIsDialogOpen(false);
      }
    } else {
      const { error } = await supabase
        .from('destination_countries')
        .insert({
          code: formData.code.toUpperCase(),
          name: formData.name,
          is_active: true
        });

      if (error) {
        toast({ title: 'Error creating country', description: error.message, variant: 'destructive' });
      } else {
        const newCountry: CountryWithId = {
          id: formData.code.toUpperCase(),
          code: formData.code.toUpperCase(),
          name: formData.name,
          is_active: true,
        };
        setCountries(prev => [...prev, newCountry]);
        toast({ title: 'Country created' });
        setIsDialogOpen(false);
      }
    }
    setSubmitting(false);
  };

  const columns = [
    { key: 'code', header: 'Code' },
    { key: 'name', header: 'Country Name' },
    {
      key: 'is_active',
      header: 'Status',
      render: (country: CountryWithId) => (
        <StatusBadge status={country.is_active ? 'success' : 'default'}>
          {country.is_active ? 'Active' : 'Inactive'}
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
              {country.is_active ? 'Deactivate' : 'Activate'}
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

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <DataTable columns={columns} data={filteredCountries} />
        )}
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
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingCountry ? 'Save Changes' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

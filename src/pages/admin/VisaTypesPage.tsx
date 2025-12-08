import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DataTable } from '@/components/admin/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { VisaType, Country } from '@/data/mockData';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, MoreHorizontal, Edit, Trash2, Power, Loader2, Filter, Users } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

export default function VisaTypesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [visaTypes, setVisaTypes] = useState<VisaType[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVisa, setEditingVisa] = useState<VisaType | null>(null);
  const [formData, setFormData] = useState({
    country_code: '',
    code: '',
    title: '',
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [userCounts, setUserCounts] = useState<Record<string, number>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [visaRes, countryRes, profilesRes] = await Promise.all([
      supabase.from('visa_types').select('*').order('title'),
      supabase.from('destination_countries').select('*').eq('is_active', true).order('name'),
      supabase.from('profiles').select('visa_type')
    ]);

    if (visaRes.error) {
      toast({ title: 'Error loading visa types', description: visaRes.error.message, variant: 'destructive' });
    } else {
      setVisaTypes(visaRes.data || []);
    }

    if (countryRes.error) {
      toast({ title: 'Error loading countries', description: countryRes.error.message, variant: 'destructive' });
    } else {
      setCountries(countryRes.data || []);
    }

    if (!profilesRes.error && profilesRes.data) {
      const counts: Record<string, number> = {};
      profilesRes.data.forEach(profile => {
        if (profile.visa_type) {
          counts[profile.visa_type] = (counts[profile.visa_type] || 0) + 1;
        }
      });
      setUserCounts(counts);
    }

    setLoading(false);
  };

  const filteredVisaTypes = visaTypes.filter(visa => {
    const matchesSearch = visa.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      visa.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCountry = countryFilter === 'all' || visa.country_code === countryFilter;
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && visa.is_active) ||
      (statusFilter === 'inactive' && !visa.is_active);
    return matchesSearch && matchesCountry && matchesStatus;
  });

  const toggleActive = async (id: string) => {
    const visa = visaTypes.find(v => v.id === id);
    if (!visa) return;

    const { error } = await supabase
      .from('visa_types')
      .update({ is_active: !visa.is_active })
      .eq('id', id);

    if (error) {
      toast({ title: 'Error updating status', description: error.message, variant: 'destructive' });
    } else {
      setVisaTypes(prev => prev.map(v =>
        v.id === id ? { ...v, is_active: !v.is_active } : v
      ));
      toast({ title: 'Status updated' });
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('visa_types')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: 'Error deleting visa type', description: error.message, variant: 'destructive' });
    } else {
      setVisaTypes(prev => prev.filter(v => v.id !== id));
      toast({ title: 'Visa type deleted' });
    }
  };

  const openCreateDialog = () => {
    setEditingVisa(null);
    setFormData({ country_code: '', code: '', title: '', description: '' });
    setIsDialogOpen(true);
  };

  const openEditDialog = (visa: VisaType) => {
    setEditingVisa(visa);
    setFormData({
      country_code: visa.country_code || '',
      code: visa.code,
      title: visa.title,
      description: visa.description || ''
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.country_code || !formData.code || !formData.title) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    setSubmitting(true);

    if (editingVisa) {
      const { error } = await supabase
        .from('visa_types')
        .update({
          country_code: formData.country_code,
          code: formData.code,
          title: formData.title,
          description: formData.description || null
        })
        .eq('id', editingVisa.id);

      if (error) {
        toast({ title: 'Error updating visa type', description: error.message, variant: 'destructive' });
      } else {
        setVisaTypes(prev => prev.map(v =>
          v.id === editingVisa.id ? {
            ...v,
            country_code: formData.country_code,
            code: formData.code,
            title: formData.title,
            description: formData.description || null
          } : v
        ));
        toast({ title: 'Visa type updated' });
        setIsDialogOpen(false);
      }
    } else {
      const { data, error } = await supabase
        .from('visa_types')
        .insert({
          country_code: formData.country_code,
          code: formData.code,
          title: formData.title,
          description: formData.description || null,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        toast({ title: 'Error creating visa type', description: error.message, variant: 'destructive' });
      } else {
        setVisaTypes(prev => [...prev, data]);
        toast({ title: 'Visa type created' });
        setIsDialogOpen(false);
      }
    }
    setSubmitting(false);
  };

  const getCountryName = (code: string | null) => countries.find(c => c.code === code)?.name || code || '-';

  const columns = [
    { key: 'code', header: 'Code' },
    { key: 'title', header: 'Title' },
    {
      key: 'country_code',
      header: 'Country',
      render: (visa: VisaType) => getCountryName(visa.country_code)
    },
    {
      key: 'description',
      header: 'Description',
      render: (visa: VisaType) => (
        <span className="text-muted-foreground truncate max-w-[200px] block">
          {visa.description || '-'}
        </span>
      )
    },
    {
      key: 'user_count',
      header: 'Users',
      render: (visa: VisaType) => (
        <div className="flex items-center gap-1.5">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>{userCounts[visa.code] || 0}</span>
        </div>
      )
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (visa: VisaType) => (
        <StatusBadge status={visa.is_active ? 'success' : 'default'}>
          {visa.is_active ? 'Active' : 'Inactive'}
        </StatusBadge>
      )
    },
    {
      key: 'actions',
      header: '',
      render: (visa: VisaType) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openEditDialog(visa)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toggleActive(visa.id)}>
              <Power className="mr-2 h-4 w-4" />
              {visa.is_active ? 'Deactivate' : 'Activate'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(visa.id)}>
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
            <h1 className="text-2xl font-bold text-foreground">Visa Types</h1>
            <p className="text-muted-foreground">Manage visa types for each country</p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Add Visa Type
          </Button>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search visa types..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={countryFilter} onValueChange={setCountryFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {countries.map(country => (
                <SelectItem key={country.code} value={country.code}>{country.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <DataTable columns={columns} data={filteredVisaTypes} />
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingVisa ? 'Edit Visa Type' : 'Add Visa Type'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Country *</Label>
              <Select value={formData.country_code} onValueChange={(v) => setFormData(f => ({ ...f, country_code: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map(country => (
                    <SelectItem key={country.code} value={country.code}>{country.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Visa Code *</Label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData(f => ({ ...f, code: e.target.value }))}
                placeholder="e.g., F1, TIER4"
              />
            </div>
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g., F-1 Student Visa"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))}
                placeholder="Brief description of the visa type"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingVisa ? 'Save Changes' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

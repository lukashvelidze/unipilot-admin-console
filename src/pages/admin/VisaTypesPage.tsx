import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DataTable } from '@/components/admin/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { mockVisaTypes, mockCountries, VisaType } from '@/data/mockData';
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
  const [visaTypes, setVisaTypes] = useState(mockVisaTypes);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVisa, setEditingVisa] = useState<VisaType | null>(null);
  const [formData, setFormData] = useState({ 
    country_code: '', 
    code: '', 
    title: '', 
    description: '' 
  });
  const { toast } = useToast();
  
  const filteredVisaTypes = visaTypes.filter(visa =>
    visa.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    visa.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleActive = (id: string) => {
    setVisaTypes(prev => prev.map(v => 
      v.id === id ? { ...v, is_active: !v.is_active } : v
    ));
    toast({ title: 'Status updated' });
  };

  const handleDelete = (id: string) => {
    setVisaTypes(prev => prev.filter(v => v.id !== id));
    toast({ title: 'Visa type deleted' });
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

  const handleSubmit = () => {
    if (!formData.country_code || !formData.code || !formData.title) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    if (editingVisa) {
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
    } else {
      const newVisa: VisaType = {
        id: crypto.randomUUID(),
        country_code: formData.country_code,
        code: formData.code,
        title: formData.title,
        description: formData.description || null,
        is_active: true,
      };
      setVisaTypes(prev => [...prev, newVisa]);
      toast({ title: 'Visa type created' });
    }
    setIsDialogOpen(false);
  };

  const getCountryName = (code: string | null) => mockCountries.find(c => c.code === code)?.name || code || '-';

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

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search visa types..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <DataTable columns={columns} data={filteredVisaTypes} />
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
                  {mockCountries.filter(c => c.is_active).map(country => (
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
            <Button onClick={handleSubmit}>{editingVisa ? 'Save Changes' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

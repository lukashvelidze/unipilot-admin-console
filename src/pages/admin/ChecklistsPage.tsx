import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { mockChecklists, mockChecklistItems, mockVisaTypes, mockCountries, Checklist, ChecklistItem } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Search, Plus, ChevronRight, ChevronDown, Edit, Trash2, GripVertical } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';

export default function ChecklistsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [checklists, setChecklists] = useState(mockChecklists);
  const [checklistItems, setChecklistItems] = useState(mockChecklistItems);
  const [expandedChecklists, setExpandedChecklists] = useState<Set<string>>(new Set());
  
  const [isChecklistDialogOpen, setIsChecklistDialogOpen] = useState(false);
  const [editingChecklist, setEditingChecklist] = useState<Checklist | null>(null);
  const [checklistForm, setChecklistForm] = useState({ 
    country_code: '', 
    visa_type: '', 
    title: '', 
    subscription_tier: 'free' as Checklist['subscription_tier'],
    sort_order: 0
  });
  
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null);
  const [currentChecklistId, setCurrentChecklistId] = useState<string | null>(null);
  const [itemForm, setItemForm] = useState({ 
    label: '', 
    field_type: 'checkbox',
    sort_order: 0,
    metadata: '{}'
  });
  
  const { toast } = useToast();

  const filteredChecklists = checklists.filter(checklist => {
    const matchesSearch = checklist.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCountry = selectedCountry === 'all' || checklist.country_code === selectedCountry;
    return matchesSearch && matchesCountry;
  });

  const toggleExpand = (id: string) => {
    setExpandedChecklists(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getVisaTypesForCountry = (countryCode: string) => 
    mockVisaTypes.filter(v => v.country_code === countryCode && v.is_active);

  const getItemsForChecklist = (checklistId: string) => 
    checklistItems.filter(item => item.checklist_id === checklistId).sort((a, b) => a.sort_order - b.sort_order);

  const getVisaTitle = (code: string) => mockVisaTypes.find(v => v.code === code)?.title || code;
  const getCountryName = (code: string) => mockCountries.find(c => c.code === code)?.name || code;

  // Checklist CRUD
  const openChecklistDialog = (checklist?: Checklist) => {
    if (checklist) {
      setEditingChecklist(checklist);
      setChecklistForm({ 
        country_code: checklist.country_code || '', 
        visa_type: checklist.visa_type, 
        title: checklist.title, 
        subscription_tier: checklist.subscription_tier,
        sort_order: checklist.sort_order
      });
    } else {
      setEditingChecklist(null);
      setChecklistForm({ country_code: '', visa_type: '', title: '', subscription_tier: 'free', sort_order: 0 });
    }
    setIsChecklistDialogOpen(true);
  };

  const handleChecklistSubmit = () => {
    if (!checklistForm.country_code || !checklistForm.visa_type || !checklistForm.title) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    if (editingChecklist) {
      setChecklists(prev => prev.map(c => 
        c.id === editingChecklist.id ? { 
          ...c, 
          country_code: checklistForm.country_code,
          visa_type: checklistForm.visa_type,
          title: checklistForm.title,
          subscription_tier: checklistForm.subscription_tier,
          sort_order: checklistForm.sort_order
        } : c
      ));
      toast({ title: 'Checklist updated' });
    } else {
      const newChecklist: Checklist = {
        id: crypto.randomUUID(),
        country_code: checklistForm.country_code,
        visa_type: checklistForm.visa_type,
        title: checklistForm.title,
        subscription_tier: checklistForm.subscription_tier,
        sort_order: checklists.filter(c => c.visa_type === checklistForm.visa_type).length + 1,
      };
      setChecklists(prev => [...prev, newChecklist]);
      toast({ title: 'Checklist created' });
    }
    setIsChecklistDialogOpen(false);
  };

  const deleteChecklist = (id: string) => {
    setChecklists(prev => prev.filter(c => c.id !== id));
    setChecklistItems(prev => prev.filter(item => item.checklist_id !== id));
    toast({ title: 'Checklist deleted' });
  };

  // Item CRUD
  const openItemDialog = (checklistId: string, item?: ChecklistItem) => {
    setCurrentChecklistId(checklistId);
    if (item) {
      setEditingItem(item);
      setItemForm({ 
        label: item.label, 
        field_type: item.field_type,
        sort_order: item.sort_order,
        metadata: JSON.stringify(item.metadata, null, 2)
      });
    } else {
      setEditingItem(null);
      setItemForm({ label: '', field_type: 'checkbox', sort_order: 0, metadata: '{}' });
    }
    setIsItemDialogOpen(true);
  };

  const handleItemSubmit = () => {
    if (!itemForm.label || !currentChecklistId) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    let parsedMetadata: Record<string, unknown> = {};
    try {
      parsedMetadata = JSON.parse(itemForm.metadata);
    } catch {
      toast({ title: 'Invalid JSON in metadata', variant: 'destructive' });
      return;
    }

    if (editingItem) {
      setChecklistItems(prev => prev.map(i => 
        i.id === editingItem.id ? { 
          ...i, 
          label: itemForm.label,
          field_type: itemForm.field_type,
          sort_order: itemForm.sort_order,
          metadata: parsedMetadata
        } : i
      ));
      toast({ title: 'Item updated' });
    } else {
      const newItem: ChecklistItem = {
        id: crypto.randomUUID(),
        checklist_id: currentChecklistId,
        label: itemForm.label,
        field_type: itemForm.field_type,
        sort_order: getItemsForChecklist(currentChecklistId).length + 1,
        metadata: parsedMetadata,
      };
      setChecklistItems(prev => [...prev, newItem]);
      toast({ title: 'Item added' });
    }
    setIsItemDialogOpen(false);
  };

  const deleteItem = (id: string) => {
    setChecklistItems(prev => prev.filter(i => i.id !== id));
    toast({ title: 'Item deleted' });
  };

  const tierColors: Record<string, 'default' | 'info' | 'warning' | 'success'> = {
    free: 'default',
    basic: 'info',
    standard: 'warning',
    premium: 'success',
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Checklists</h1>
            <p className="text-muted-foreground">Manage visa checklists and their items</p>
          </div>
          <Button onClick={() => openChecklistDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Checklist
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search checklists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={selectedCountry} onValueChange={setSelectedCountry}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {mockCountries.filter(c => c.is_active).map(country => (
                <SelectItem key={country.code} value={country.code}>{country.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          {filteredChecklists.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No checklists found. Create your first checklist to get started.
            </div>
          ) : (
            filteredChecklists.map(checklist => {
              const isExpanded = expandedChecklists.has(checklist.id);
              const items = getItemsForChecklist(checklist.id);
              
              return (
                <div key={checklist.id} className="rounded-lg border border-border bg-card overflow-hidden">
                  <div 
                    className="flex items-center gap-3 p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => toggleExpand(checklist.id)}
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{checklist.title}</span>
                        <StatusBadge status={tierColors[checklist.subscription_tier]}>
                          {checklist.subscription_tier}
                        </StatusBadge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {getCountryName(checklist.country_code || '')} • {getVisaTitle(checklist.visa_type)} • {items.length} items
                      </p>
                    </div>
                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openChecklistDialog(checklist)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteChecklist(checklist.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="border-t border-border bg-muted/30 p-4">
                      <div className="space-y-2">
                        {items.map(item => (
                          <div key={item.id} className="flex items-center gap-3 rounded-md border border-border bg-card p-3">
                            <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-foreground">{item.label}</p>
                              <p className="text-xs text-muted-foreground">
                                Type: {item.field_type} • Sort: {item.sort_order}
                                {Object.keys(item.metadata).length > 0 && ` • Has metadata`}
                              </p>
                            </div>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openItemDialog(checklist.id, item)}>
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteItem(item.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ))}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full mt-2"
                          onClick={() => openItemDialog(checklist.id)}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Item
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Checklist Dialog */}
      <Dialog open={isChecklistDialogOpen} onOpenChange={setIsChecklistDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingChecklist ? 'Edit Checklist' : 'Add Checklist'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Country *</Label>
              <Select value={checklistForm.country_code} onValueChange={(v) => setChecklistForm(f => ({ ...f, country_code: v, visa_type: '' }))}>
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
              <Label>Visa Type *</Label>
              <Select 
                value={checklistForm.visa_type} 
                onValueChange={(v) => setChecklistForm(f => ({ ...f, visa_type: v }))}
                disabled={!checklistForm.country_code}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select visa type" />
                </SelectTrigger>
                <SelectContent>
                  {getVisaTypesForCountry(checklistForm.country_code).map(visa => (
                    <SelectItem key={visa.code} value={visa.code}>{visa.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input 
                value={checklistForm.title} 
                onChange={(e) => setChecklistForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g., Pre-Application Documents"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Subscription Tier</Label>
                <Select 
                  value={checklistForm.subscription_tier} 
                  onValueChange={(v) => setChecklistForm(f => ({ ...f, subscription_tier: v as Checklist['subscription_tier'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Input 
                  type="number"
                  value={checklistForm.sort_order} 
                  onChange={(e) => setChecklistForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsChecklistDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleChecklistSubmit}>{editingChecklist ? 'Save Changes' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Item Dialog */}
      <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Item' : 'Add Item'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Label *</Label>
              <Input 
                value={itemForm.label} 
                onChange={(e) => setItemForm(f => ({ ...f, label: e.target.value }))}
                placeholder="e.g., Valid Passport"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Field Type</Label>
                <Select 
                  value={itemForm.field_type} 
                  onValueChange={(v) => setItemForm(f => ({ ...f, field_type: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checkbox">Checkbox</SelectItem>
                    <SelectItem value="text">Text Input</SelectItem>
                    <SelectItem value="file">File Upload</SelectItem>
                    <SelectItem value="date">Date Picker</SelectItem>
                    <SelectItem value="select">Dropdown Select</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Input 
                  type="number"
                  value={itemForm.sort_order} 
                  onChange={(e) => setItemForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Metadata (JSON)</Label>
              <Textarea 
                value={itemForm.metadata} 
                onChange={(e) => setItemForm(f => ({ ...f, metadata: e.target.value }))}
                placeholder='{"options": ["opt1", "opt2"]}'
                className="font-mono text-sm h-24"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsItemDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleItemSubmit}>{editingItem ? 'Save Changes' : 'Add Item'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

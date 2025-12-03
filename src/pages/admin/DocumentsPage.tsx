import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DataTable } from '@/components/admin/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { mockDocuments, Document } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, CheckCircle, XCircle, Eye, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [documents, setDocuments] = useState(mockDocuments);
  const { toast } = useToast();
  
  const filteredDocs = documents.filter(doc =>
    doc.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.originalName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleVerify = (docId: string) => {
    setDocuments(docs => docs.map(d => 
      d.id === docId ? { ...d, isVerified: true, isRejected: false } : d
    ));
    toast({ title: 'Document verified', description: 'The document has been marked as verified.' });
  };

  const handleReject = (docId: string) => {
    setDocuments(docs => docs.map(d => 
      d.id === docId ? { ...d, isRejected: true, isVerified: false } : d
    ));
    toast({ title: 'Document rejected', description: 'The document has been marked as rejected.' });
  };

  const getStatusBadge = (doc: Document) => {
    if (doc.isVerified) return <StatusBadge status="success">Verified</StatusBadge>;
    if (doc.isRejected) return <StatusBadge status="error">Rejected</StatusBadge>;
    return <StatusBadge status="warning">Pending</StatusBadge>;
  };

  const columns = [
    { 
      key: 'document', 
      header: 'Document',
      render: (doc: Document) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
            <FileText className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium text-foreground">{doc.originalName}</p>
            <p className="text-sm text-muted-foreground">{doc.categoryName}</p>
          </div>
        </div>
      )
    },
    { key: 'userName', header: 'User' },
    { 
      key: 'status', 
      header: 'Status',
      render: (doc: Document) => getStatusBadge(doc)
    },
    { key: 'createdAt', header: 'Uploaded' },
    { 
      key: 'adminNotes', 
      header: 'Notes',
      render: (doc: Document) => (
        <span className="text-sm text-muted-foreground">
          {doc.adminNotes || '—'}
        </span>
      )
    },
    { 
      key: 'actions', 
      header: 'Actions',
      render: (doc: Document) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Eye className="h-4 w-4" />
          </Button>
          {!doc.isVerified && !doc.isRejected && (
            <>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-success hover:text-success"
                onClick={() => handleVerify(doc.id)}
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => handleReject(doc.id)}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      )
    },
  ];

  const pendingCount = documents.filter(d => !d.isVerified && !d.isRejected).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Documents</h1>
          <p className="text-muted-foreground">
            Review and manage user documents • {pendingCount} pending review
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
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

        <DataTable columns={columns} data={filteredDocs} />
      </div>
    </AdminLayout>
  );
}
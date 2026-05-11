import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ArticleForm } from '@/components/admin/ArticleForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function ArticleCreatePage() {
  const navigate = useNavigate();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">New Article</h1>
            <p className="text-muted-foreground">Create and publish a new article for students.</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/admin/articles')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to list
          </Button>
        </div>

        <ArticleForm onSuccess={() => navigate('/admin/articles')} />
      </div>
    </AdminLayout>
  );
}

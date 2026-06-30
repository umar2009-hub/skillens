import React, { useEffect, useState } from 'react';
import { FileText, Clock, ExternalLink, Loader2, RotateCcw, XCircle, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { uploadService } from '@/services/upload.service';
import toast from 'react-hot-toast';

export function RecentUploads() {
  const { user } = useAuth();
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUploads = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('id, filename, created_at, status')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(4);

      if (!error && data) {
        setUploads(data);
      }
    } catch (err) {
      console.error('Error fetching recent uploads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUploads();

    if (!user?.id) return;

    // Real-time subscription to refresh on changes
    const channel = supabase
      .channel('recent_uploads_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'documents',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchUploads();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleRetry = async (id) => {
    setUploads(prev => prev.map(item => item.id === id ? { ...item, status: 'queued' } : item));
    toast.loading('Initiating retry...', { id: 'retry-toast' });
    try {
      await uploadService.retryDocument(id);
      toast.success('Retry initiated!', { id: 'retry-toast' });
    } catch (err) {
      toast.error('Failed to retry document', { id: 'retry-toast' });
      fetchUploads();
    }
  };

  const handleCancel = async (id) => {
    setUploads(prev => prev.map(item => item.id === id ? { ...item, status: 'cancelled' } : item));
    toast.loading('Cancelling...', { id: 'cancel-toast' });
    try {
      await uploadService.cancelDocument(id);
      toast.success('Cancelled successfully', { id: 'cancel-toast' });
    } catch (err) {
      toast.error('Failed to cancel', { id: 'cancel-toast' });
      fetchUploads();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this document? This cannot be undone.")) return;
    
    setUploads(prev => prev.filter(item => item.id !== id));
    toast.loading('Deleting document...', { id: 'delete-toast' });
    try {
      await uploadService.deleteDocument(id);
      toast.success('Document deleted successfully', { id: 'delete-toast' });
    } catch (err) {
      toast.error('Failed to delete document', { id: 'delete-toast' });
      fetchUploads();
    }
  };

  const getColorClasses = (color) => {
    switch (color) {
      case 'emerald': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'primary': return 'bg-primary/10 text-primary border-primary/20';
      case 'red': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-white/10 text-white/70 border-white/20';
    }
  };

  const getIconClasses = (color) => {
    switch (color) {
      case 'emerald': return 'bg-emerald-500/10 text-emerald-400';
      case 'primary': return 'bg-primary/10 text-primary';
      case 'red': return 'bg-red-500/10 text-red-400';
      default: return 'bg-white/5 text-white/50';
    }
  };

  const getStatusInfo = (status) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('completed')) return { label: 'Completed', color: 'emerald', canView: true };
    if (s.includes('fail') || s.includes('error') || s.includes('cancel')) return { label: 'Failed', color: 'red', canRetry: true };
    if (s === 'uploaded' || s === 'queued') return { label: 'Queued', color: 'white', canCancel: true };
    return { label: 'Processing', color: 'primary', canCancel: true };
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto mt-20 relative z-10 flex justify-center py-10">
        <Loader2 className="animate-spin text-muted-foreground" size={24} />
      </div>
    );
  }

  if (uploads.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-20 relative z-10">
      <h3 className="text-xl font-bold text-white mb-6">Recent Uploads</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {uploads.map((item) => {
          const statusInfo = getStatusInfo(item.status);
          
          return (
            <Card key={item.id} className="p-4 bg-background/60 hover:bg-background/80 transition-colors border-white/5 group flex items-center justify-between">
              <div className="flex items-center gap-4 min-w-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${getIconClasses(statusInfo.color)}`}>
                  <FileText size={20} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-white truncate pr-4" title={item.filename}>{item.filename}</h4>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>{formatDate(item.created_at)}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded border text-[10px] font-medium ${getColorClasses(statusInfo.color)}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 flex-shrink-0">
                {statusInfo.canView ? (
                  <Link 
                    to={ROUTES.DOCUMENT.replace(':id', item.id)}
                    className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center transition-colors hover:bg-emerald-500/20"
                    title="View Document Summary"
                  >
                    <ExternalLink size={14} />
                  </Link>
                ) : (
                  <button disabled className="w-8 h-8 rounded-lg bg-white/5 text-white/30 flex items-center justify-center transition-colors opacity-50 cursor-not-allowed">
                    <ExternalLink size={14} />
                  </button>
                )}

                {statusInfo.canRetry && (
                  <button 
                    onClick={() => handleRetry(item.id)}
                    className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center transition-colors hover:bg-blue-500/20"
                    title="Retry Processing"
                  >
                    <RotateCcw size={14} />
                  </button>
                )}

                {statusInfo.canCancel && (
                  <button 
                    onClick={() => handleCancel(item.id)}
                    className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center transition-colors hover:bg-red-500/20"
                    title="Cancel Processing"
                  >
                    <XCircle size={14} />
                  </button>
                )}
                
                {(!statusInfo.canRetry && !statusInfo.canCancel) && (
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="w-8 h-8 rounded-lg bg-red-500/5 text-red-400/50 flex items-center justify-center transition-colors hover:bg-red-500/10 hover:text-red-400"
                    title="Delete Document"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

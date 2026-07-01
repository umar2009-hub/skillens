import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { pageTransition } from '@/constants/animations';
import { Card, CardContent } from '@/components/ui/Card';
import { FileText, Loader2, ArrowRight, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '@/services/api';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/contexts/AuthContext';

export function DocumentsList() {
  const { session } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!session?.access_token) return;
      try {
        const response = await api.get('/documents', {
          headers: { Authorization: `Bearer ${session.access_token}` }
        });
        setDocuments(response.data || []);
      } catch (err) {
        setError(err.message || 'Failed to fetch documents');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDocuments();
  }, [session?.access_token]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle2 size={16} className="text-emerald-400" />;
      case 'processing': 
      case 'extracting':
      case 'generating': return <Loader2 size={16} className="text-primary animate-spin" />;
      case 'failed': return <AlertCircle size={16} className="text-red-400" />;
      default: return <Clock size={16} className="text-muted-foreground" />;
    }
  };

  const formatFilename = (filename) => {
    if (!filename) return 'Untitled Document';
    return filename
      .replace(/\.[^/.]+$/, "") // Remove extension
      .replace(/[_-]/g, " ")    // Replace underscores/hyphens with spaces
      .replace(/\b\w/g, l => l.toUpperCase()); // Title case
  };

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div {...pageTransition} className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-1">My Documents</h2>
          <p className="text-muted-foreground">All your uploaded study materials and notes.</p>
        </div>
        <Link to={ROUTES.UPLOAD} className="hidden md:inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all bg-white text-black hover:bg-white/90 h-10 px-4 py-2 shadow-sm">
          Upload New Document
        </Link>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading your documents...</p>
        </div>
      ) : error ? (
        <Card className="border-red-500/20 bg-red-500/10">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-red-400" />
            <p className="text-white font-medium">Failed to load documents</p>
            <p className="text-sm text-red-300">{error}</p>
          </CardContent>
        </Card>
      ) : documents.length === 0 ? (
        <Card className="bg-white/5 border-dashed border-white/10">
          <CardContent className="p-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <p className="text-lg text-white font-medium">No documents yet</p>
              <p className="text-sm text-muted-foreground max-w-sm mt-1">Upload your first PDF or study material to get started with AI notes, flashcards, and quizzes.</p>
            </div>
            <Link to={ROUTES.UPLOAD} className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium">
              Upload Document
            </Link>
          </CardContent>
        </Card>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <motion.div key={doc.id} variants={itemVariants}>
              <Link to={ROUTES.DOCUMENT.replace(':id', doc.id)}>
                <Card className="hover:border-primary/50 hover:bg-white/5 transition-all duration-300 cursor-pointer group h-full flex flex-col hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-primary/20 hover:-translate-y-1 bg-black/40 backdrop-blur-sm border-white/5">
                  <CardContent className="p-5 flex flex-col h-full gap-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="p-2.5 rounded-xl bg-primary/20 text-primary">
                        <FileText size={20} />
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium capitalize">
                        {getStatusIcon(doc.status)}
                        <span className="text-muted-foreground">{doc.status}</span>
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-white leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                        {formatFilename(doc.filename)}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        <Clock size={12} /> {formatDate(doc.created_at)}
                      </p>
                    </div>

                    <div className="pt-4 mt-auto border-t border-white/10 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground group-hover:text-white transition-colors">View Details</span>
                      <ArrowRight size={16} className="text-primary opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}

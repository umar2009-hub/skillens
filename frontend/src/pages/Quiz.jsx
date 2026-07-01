import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { pageTransition } from '@/constants/animations';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { BrainCircuit, Search, FileText, ChevronRight, Clock, BookOpen, Target, Filter } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import api from '@/services/api';
import { supabase } from '@/lib/supabase';
import { ROUTES } from '@/constants/routes';

export function Quiz() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters and Search
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' | 'oldest'

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        const response = await api.get('/documents', {
          headers: { Authorization: `Bearer ${session?.access_token}` }
        });
        setDocuments(response.data || []);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch documents for quizzes.');
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, []);

  const filteredDocuments = useMemo(() => {
    let result = documents;
    
    if (searchQuery) {
      result = result.filter(doc => doc.filename.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    
    if (sortOrder === 'newest') {
      result = result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else {
      result = result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }

    return result;
  }, [documents, searchQuery, sortOrder]);

  return (
    <motion.div {...pageTransition} className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-br from-primary/10 to-transparent p-6 rounded-2xl border border-primary/10">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
            <BrainCircuit className="text-primary" size={32} />
            Quiz Gateway
          </h2>
          <p className="text-muted-foreground">Select a document to test your knowledge with an adaptive AI quiz.</p>
        </div>
        <Link 
          to={ROUTES.UPLOAD}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-bold transition-all bg-white text-black hover:bg-white/90 h-12 px-6 shadow-lg gap-2 shrink-0"
        >
          Upload Material
        </Link>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
             <Card key={i} className="animate-pulse">
               <CardContent className="p-6 h-48 bg-white/5" />
             </Card>
          ))}
        </div>
      ) : error ? (
        <EmptyState title="Error Loading Quizzes" description={error} />
      ) : documents.length === 0 ? (
        <EmptyState 
          icon={BookOpen} 
          title="No Learning Materials" 
          description="Upload your first document to generate adaptive quizzes." 
          action={
            <Link to={ROUTES.UPLOAD} className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-colors">
              Upload Document
            </Link>
          }
        />
      ) : (
        <>
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input 
                type="text" 
                placeholder="Search topics or documents..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl h-12 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter size={16} className="text-muted-foreground hidden sm:block" />
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl h-12 px-4 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none flex-1 sm:w-auto"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          <AnimatePresence mode="popLayout">
            {filteredDocuments.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredDocuments.map((doc, i) => (
                  <motion.div
                    key={doc.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: i * 0.05 }}
                  >
                    <Link to={`/documents/${doc.id}?tab=quiz`} className="block h-full">
                      <Card className="h-full hover:border-primary/50 hover:bg-white/[0.03] transition-all group flex flex-col">
                        <CardHeader className="pb-3 flex-1">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                              <FileText size={18} className="text-blue-400 group-hover:scale-110 transition-transform" />
                            </div>
                            <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full shrink-0">
                              Ready
                            </span>
                          </div>
                          <CardTitle className="text-lg line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                            {doc.filename}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                            <Clock size={14} /> {new Date(doc.created_at).toLocaleDateString()}
                          </p>
                        </CardHeader>
                        <CardContent className="pt-0 pb-4">
                           <div className="w-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white flex items-center justify-center gap-2 h-10 rounded-lg font-medium text-sm transition-all">
                              Start Quiz <Target size={16} />
                           </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full">
                 <EmptyState 
                   icon={Search} 
                   title="No Results Found" 
                   description={`No documents matched "${searchQuery}".`}
                 />
               </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </motion.div>
  )
}

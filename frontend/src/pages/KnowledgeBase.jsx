import React, { useEffect, useState } from 'react';
import { Search, Hash, Clock } from 'lucide-react';

const KnowledgeBase = () => {
  const [articles, setArticles] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/articles?q=${search}`);
        const data = await res.json();
        setArticles(data);
      } catch(e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    
    // Debounce search slightly
    const timeout = setTimeout(fetchArticles, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  return (
    <div className="flex-1 p-8 max-w-7xl mx-auto w-full">
      <div className="mb-12 text-center mt-10">
        <h1 className="text-4xl font-extrabold text-white mb-4">Knowledge Base</h1>
        <p className="text-slate-400 max-w-2xl mx-auto">Explore AI-generated articles directly curated from live support flows. Search for instant solutions.</p>
        
        <div className="mt-8 max-w-2xl mx-auto relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Search articles by title or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-full py-4 pl-12 pr-6 text-white outline-none focus:border-blue-500 focus:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12 text-blue-400">Loading library...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.length === 0 ? (
            <div className="col-span-full text-center p-12 text-slate-500 glass-panel">No articles found. Generate some in the dashboard!</div>
          ) : (
             articles.map(article => (
               <div key={article._id || article.id} className="glass-panel p-6 flex flex-col hover:border-blue-500/50 transition-colors group cursor-pointer">
                 <div className="flex justify-between items-start mb-4">
                   <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2">{article.title}</h3>
                 </div>
                 <p className="text-slate-400 text-sm line-clamp-3 mb-6 flex-1">
                   <strong className="text-slate-300">Issue:</strong> {article.problem}
                 </p>
                 <div className="mt-auto border-t border-slate-800 pt-4 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <span className="px-2 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded text-xs font-bold uppercase tracking-wider">
                       {article.category}
                     </span>
                     {article.tags?.slice(0,1).map(t => (
                       <span key={t} className="flex items-center text-xs text-slate-500"><Hash size={12}/>{t}</span>
                     ))}
                   </div>
                   {article.createdAt && (
                     <div className="flex items-center text-xs text-slate-500 gap-1">
                       <Clock size={12} />
                       {new Date(article.createdAt).toLocaleDateString()}
                     </div>
                   )}
                 </div>
               </div>
             ))
          )}
        </div>
      )}
    </div>
  );
};

export default KnowledgeBase;

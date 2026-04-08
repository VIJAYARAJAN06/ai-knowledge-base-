import React, { useState } from 'react';
import { ReactFlow, Background, Controls } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

const initialNodes = [
  { id: 'start', position: { x: 50, y: 100 }, data: { label: 'User Chat' }, type: 'input' },
  { id: 'analyzer', position: { x: 250, y: 100 }, data: { label: 'Analyzer Agent' } },
  { id: 'decision', position: { x: 450, y: 100 }, data: { label: 'Decision Agent' } },
  { id: 'generator', position: { x: 650, y: 50 }, data: { label: 'Generator Agent' } },
  { id: 'categorize', position: { x: 650, y: 150 }, data: { label: 'Categorization Agent' } },
  { id: 'end', position: { x: 850, y: 100 }, data: { label: 'Knowledge Article' }, type: 'output' },
];

const initialEdges = [
  { id: 'e1', source: 'start', target: 'analyzer', animated: false },
  { id: 'e2', source: 'analyzer', target: 'decision', animated: false },
  { id: 'e3', source: 'decision', target: 'generator', animated: false },
  { id: 'e4', source: 'decision', target: 'categorize', animated: false },
  { id: 'e5', source: 'generator', target: 'end', animated: false },
  { id: 'e6', source: 'categorize', target: 'end', animated: false },
];

const Dashboard = () => {
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [article, setArticle] = useState(null);
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [saving, setSaving] = useState(false);

  const token = useAuthStore(state => state.token);
  const navigate = useNavigate();

  const updateGraphState = (agentName, status) => {
    let nodeId = null;
    if (agentName.includes('Analyzer')) nodeId = 'analyzer';
    if (agentName.includes('Decision')) nodeId = 'decision';
    if (agentName.includes('Generator')) nodeId = 'generator';
    if (agentName.includes('Categorization')) nodeId = 'categorize';
    if (agentName.includes('Orchestrator') && status === 'success') nodeId = 'end';

    if (nodeId) {
      setNodes(nds => nds.map(n => {
        if (n.id === nodeId) {
          const bgColor = status === 'processing' ? '#3b82f6' : status === 'success' ? '#10b981' : status === 'error' ? '#ef4444' : 'white';
          const color = status === 'processing' || status === 'success' || status === 'error' ? 'white' : 'black';
          return { ...n, style: { backgroundColor: bgColor, color, fontWeight: 'bold' } };
        }
        return n;
      }));
      if (status === 'processing') {
         setEdges(eds => eds.map(e => e.target === nodeId ? { ...e, animated: true } : e));
      } else if (status === 'success') {
         setEdges(eds => eds.map(e => e.target === nodeId ? { ...e, animated: false, style: { stroke: '#10b981' } } : e));
      }
    }
  };

  const generateArticle = async () => {
    if (!chatInput) return;
    setLoading(true);
    setLogs([]);
    setArticle(null);
    setNodes(initialNodes);
    setEdges(initialEdges);

    updateGraphState('Analyzer', 'processing');

    try {
      const response = await fetch('http://localhost:5000/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatText: chatInput }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n\n').filter(line => line.trim().startsWith('data: '));
        
        for (const line of lines) {
          const dataStr = line.replace('data: ', '');
          try {
            const data = JSON.parse(dataStr);
             console.log(data)
            if (data.type === 'FINAL_RESULT') {
              // Format steps as string for editing textarea
              setArticle({
                ...data.payload,
                stepsStr: data.payload.steps ? data.payload.steps.join('\n') : ''
              });
              setLoading(false);
            } else if (data.type === 'ERROR') {
              setLogs(prev => [...prev, data]);
              setLoading(false);
            } else {
              setLogs(prev => [...prev, data]);
              updateGraphState(data.agent, data.status);
            }
          } catch(e) {}
        }
      }
    } catch(err) {
      setLoading(false);
    }
  };

  const saveToDatabase = async () => {
    if (!article || !token) return;
    setSaving(true);
    try {
      const payload = {
        ...article,
        steps: article.stepsStr.split('\n').filter(s => s.trim() !== '')
      };
      const res = await fetch('http://localhost:5000/api/articles/save', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        navigate('/knowledge');
      } else {
        alert('Failed to save article.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 flex p-6 gap-6 max-h-[calc(100vh-64px)] overflow-hidden">
      {/* Input Section */}
      <div className="w-1/3 flex flex-col gap-4">
        <div className="glass-panel p-6 flex-1 flex flex-col h-1/2">
          <h2 className="text-xl font-bold mb-4">Support Chat Input</h2>
          <textarea 
            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg p-4 text-slate-200 focus:outline-none focus:border-blue-500 resize-none mb-4"
            placeholder="Paste customer support chat here..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
          />
          <button 
            onClick={generateArticle} 
            disabled={loading}
            className={'py-3 rounded-lg font-bold transition-all text-white ' + (loading ? 'bg-slate-700 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.5)]')}
          >
            {loading ? 'Agents Analyzing...' : 'Generate Article'}
          </button>
        </div>

        {/* Logs */}
        <div className="glass-panel p-6 h-1/2 overflow-y-auto">
          <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">Agent Stream Logs</h3>
          <div className="space-y-2">
            {logs.map((log, i) => (
              <div key={i} className={`text-sm border-l-2 pl-3 ${log.type === 'ERROR' ? 'border-red-500' : 'border-slate-700'}`}>
                <span className={`font-bold ${log.type === 'ERROR' ? 'text-red-400' : 'text-blue-400'}`}>
                  {log.agent || 'SYSTEM'}: 
                </span>
                <span className="text-slate-300 ml-1">{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Output Section */}
      <div className="w-2/3 flex flex-col gap-6">
        {/* Agent Graph */}
        <div className="glass-panel h-64 rounded-xl overflow-hidden border border-slate-700 relative">
          <ReactFlow nodes={nodes} edges={edges} fitView>
             <Background color="#1e293b" />
             <Controls showInteractive={false} />
          </ReactFlow>
          <div className="absolute top-2 left-4 text-xs font-bold text-slate-400 bg-slate-900 border border-slate-700 px-2 py-1 rounded">Agent Routing Visualization</div>
        </div>

        {/* Article Preview / Edit Before Save */}
        <div className="glass-panel flex-1 p-8 overflow-y-auto w-full relative">
          {article ? (
            <div className="space-y-4 pb-16">
               <div className="flex justify-between items-center bg-blue-900/20 p-3 rounded border border-blue-800/30 mb-6">
                 <span className="text-blue-300 text-sm">Review and edit the AI-generated results before committing to the Knowledge Base.</span>
               </div>
               
               <div>
                 <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Title</label>
                 <input 
                   type="text" 
                   value={article.title} 
                   onChange={e => setArticle({...article, title: e.target.value})} 
                   className="w-full bg-slate-900/50 border-b border-slate-700 py-2 text-2xl font-bold text-white focus:outline-none focus:border-blue-500" 
                 />
               </div>

               <div>
                 <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Problem Context</label>
                 <textarea 
                   value={article.problem} 
                   onChange={e => setArticle({...article, problem: e.target.value})} 
                   className="w-full bg-slate-900/50 border border-slate-700 rounded p-3 text-slate-300 min-h-[80px] focus:outline-none focus:border-emerald-500" 
                 />
               </div>

               <div>
                 <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Solution Blueprint</label>
                 <textarea 
                   value={article.solution} 
                   onChange={e => setArticle({...article, solution: e.target.value})} 
                   className="w-full bg-slate-900/50 border border-slate-700 rounded p-3 text-slate-300 min-h-[80px] focus:outline-none focus:border-blue-500" 
                 />
               </div>

               <div>
                 <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Sequential Steps</label>
                 <textarea 
                   value={article.stepsStr}
                   onChange={e => setArticle({...article, stepsStr: e.target.value})} 
                   className="w-full bg-slate-900/50 border border-slate-700 rounded p-3 text-slate-300 min-h-[120px] focus:outline-none focus:border-indigo-500" 
                   placeholder="Step 1...&#10;Step 2..." 
                 />
               </div>

               <div className="flex gap-4">
                 <div className="w-1/2">
                   <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Assigned Category</label>
                   <input 
                     type="text" 
                     value={article.category} 
                     onChange={e => setArticle({...article, category: e.target.value})} 
                     className="w-full bg-slate-900/50 border-b border-slate-700 py-2 text-purple-400 font-bold focus:outline-none focus:border-purple-500" 
                   />
                 </div>
               </div>

               <div className="absolute bottom-6 right-8">
                 <button 
                  onClick={saveToDatabase}
                  disabled={saving}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-lg shadow-emerald-600/30 transition-transform hover:scale-105"
                 >
                   {saving ? 'Saving...' : 'Save to Knowledge Base'}
                 </button>
               </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500">
              <div className="w-16 h-16 rounded-2xl bg-slate-800/50 flex items-center justify-center mb-4 border border-slate-700/50">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
              </div>
              <p>Execute the multi-agent pipeline to generate an editable layout.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

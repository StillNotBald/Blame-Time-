import React, { useState, useMemo } from 'react';
import { Incident, LOVData } from '../types';
import { User, CheckCircle, Clock, ArrowRight, Save } from 'lucide-react';

interface SMEWorklistProps {
  incidents: Incident[];
  lovs: LOVData;
  onUpdateIncident: (incident: Incident) => void;
}

const SMEWorklistScreen: React.FC<SMEWorklistProps> = ({ incidents, lovs, onUpdateIncident }) => {
  const [smeName, setSmeName] = useState('');
  const [activeTab, setActiveTab] = useState<'Active' | 'Resolved'>('Active');

  // Get unique SMEs from data for autocomplete suggestion (optional)
  const knownSMEs = useMemo(() => {
    const names = new Set(incidents.map(i => i.sme).filter(Boolean));
    return Array.from(names);
  }, [incidents]);

  const myTasks = useMemo(() => {
    if (!smeName) return [];
    return incidents.filter(i => 
      i.sme.toLowerCase() === smeName.toLowerCase()
    );
  }, [incidents, smeName]);

  const displayedTasks = useMemo(() => {
    const isResolved = (status: string) => ['Resolved', 'Closed'].includes(status);
    if (activeTab === 'Resolved') {
      return myTasks.filter(i => isResolved(i.status));
    }
    return myTasks.filter(i => !isResolved(i.status));
  }, [myTasks, activeTab]);

  const handleQuickResolve = (incident: Incident) => {
    const updated = {
      ...incident,
      status: 'Resolved',
      resolvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      updates: [...incident.updates, {
        timestamp: new Date().toISOString(),
        user: 'SME',
        type: 'status_change',
        message: 'Marked as Resolved via Worklist'
      } as const] // Type assertion to fix literal type issue if strictly typed
    };
    onUpdateIncident(updated);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-900">SME Worklist</h1>
           <p className="text-gray-500 mt-1">Focus on your assigned tickets and technical resolutions.</p>
        </div>

        {/* SME Selector */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
           <User className="text-gray-400" size={18} />
           <input 
             list="sme-suggestions"
             placeholder="Enter your name..."
             value={smeName}
             onChange={(e) => setSmeName(e.target.value)}
             className="outline-none text-sm text-gray-700 w-48"
           />
           <datalist id="sme-suggestions">
             {knownSMEs.map(name => <option key={name} value={name} />)}
           </datalist>
        </div>
      </div>

      {!smeName ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <User size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Who are you?</h3>
          <p className="text-gray-500">Please enter your name above to see your assigned tickets.</p>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex gap-1 mb-6 border-b border-gray-200">
             <button 
               onClick={() => setActiveTab('Active')}
               className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'Active' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
             >
               Active Tasks ({myTasks.filter(i => !['Resolved','Closed'].includes(i.status)).length})
             </button>
             <button 
               onClick={() => setActiveTab('Resolved')}
               className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'Resolved' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
             >
               Resolved History
             </button>
          </div>

          {/* Task Grid */}
          <div className="grid grid-cols-1 gap-4">
             {displayedTasks.length === 0 ? (
               <div className="text-center py-10 text-gray-500">
                 No {activeTab.toLowerCase()} tickets found for {smeName}.
               </div>
             ) : (
               displayedTasks.map(ticket => (
                 <div key={ticket.id} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all">
                   <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${ticket.priority.includes('P1') ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                             {ticket.priority}
                          </span>
                          <span className="text-xs text-gray-500">#{ticket.id}</span>
                          <span className="text-xs text-gray-400">• {new Date(ticket.timestamp).toLocaleDateString()}</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">{ticket.summary}</h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{ticket.description || "No description provided."}</p>
                      </div>
                      
                      {activeTab === 'Active' && (
                        <button 
                          onClick={() => handleQuickResolve(ticket)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 text-xs font-bold rounded border border-green-200 hover:bg-green-100"
                        >
                          <CheckCircle size={14} /> Resolve
                        </button>
                      )}
                   </div>
                   
                   <div className="flex items-center gap-6 text-sm text-gray-500 pt-4 border-t border-gray-100">
                      <div>
                        <span className="block text-xs font-semibold text-gray-400 uppercase">Warroom</span>
                        {ticket.warroom}
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-gray-400 uppercase">Status</span>
                        {ticket.status}
                      </div>
                      <div className="ml-auto">
                         <a href={`#/command-center?warroom=${encodeURIComponent(ticket.warroom)}`} className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center gap-1">
                           View Full Details <ArrowRight size={12} />
                         </a>
                      </div>
                   </div>
                 </div>
               ))
             )}
          </div>
        </>
      )}
    </div>
  );
};

export default SMEWorklistScreen;
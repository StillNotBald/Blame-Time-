import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Incident, LOVData, IncidentFilters } from '../types';
import FilterBar from './FilterBar';
import WorkflowStepper from './WorkflowStepper';
import { Clock, MessageSquare, User, Save, ChevronRight, Layout, AlertOctagon, Trash2, X, Filter, Maximize2, Minimize2, FileText, History, Info } from 'lucide-react';

interface CommandCenterProps {
  incidents: Incident[];
  lovs: LOVData;
  onUpdateIncident: (updatedIncident: Incident) => void;
  onDeleteIncident: (id: string) => void;
}

const CommandCenterScreen: React.FC<CommandCenterProps> = ({ incidents, lovs, onUpdateIncident, onDeleteIncident }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [isDeleting, setIsDeleting] = useState(false);
  
  // View States
  const [isListVisible, setIsListVisible] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'requestor' | 'audit'>('overview');

  const [filters, setFilters] = useState<IncidentFilters>({
    search: '', category: '', priority: '', status: '', warroom: '', impactCategory: ''
  });

  // Sync Filters & Deep Linking
  useEffect(() => {
    const newFilters: IncidentFilters = { search: '', category: '', priority: '', status: '', warroom: '', impactCategory: '' };
    
    const w = searchParams.get('warroom');
    if (w) newFilters.warroom = w === 'Unassigned' ? 'Unassigned' : w;
    const p = searchParams.get('priority');
    if (p) newFilters.priority = p;
    const s = searchParams.get('status');
    if (s) newFilters.status = s;
    const sg = searchParams.get('statusGroup');
    if (sg) newFilters.statusGroup = sg as any;

    setFilters(prev => ({ ...prev, ...newFilters }));

    const tId = searchParams.get('ticketId');
    if (tId) setSelectedId(tId);
  }, [searchParams]);

  const clearFilters = () => {
    setFilters({ search: '', category: '', priority: '', status: '', warroom: '', impactCategory: '' });
    setSearchParams({});
  };

  const checkStatusGroup = (incident: Incident, group?: string) => {
    const activeStatuses = ['New', 'Acknowledged', 'In Progress', 'ReOpen', 'Outage', 'Need more info'];
    const bauStatuses = ['Return to BAU', 'Duplicate', 'Invalid Issue', 'Post Hypercare'];
    if (group === 'active') return activeStatuses.includes(incident.status);
    if (group === 'bau') return bauStatuses.includes(incident.status);
    if (group === 'resolved') return incident.status === 'Resolved';
    if (group === 'closed') return incident.status === 'Closed';
    return true;
  };

  const filteredList = useMemo(() => {
    return incidents.filter(item => {
      if (filters.search) {
        const s = filters.search.toLowerCase();
        if (!item.summary.toLowerCase().includes(s) && !item.id.toLowerCase().includes(s)) return false;
      }
      if (filters.category && item.category !== filters.category) return false;
      if (filters.priority && !item.priority.includes(filters.priority)) return false;
      if (filters.status && item.status !== filters.status) return false;
      if (filters.warroom && item.warroom !== filters.warroom) return false;
      if (filters.impactCategory && item.impactCategory !== filters.impactCategory) return false;
      if (filters.statusGroup && !checkStatusGroup(item, filters.statusGroup)) return false;
      return true;
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [incidents, filters]);

  const selectedIncident = useMemo(() => incidents.find(i => i.id === selectedId), [incidents, selectedId]);
  const [editForm, setEditForm] = useState<Partial<Incident>>({});
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (selectedIncident) {
      setEditForm(JSON.parse(JSON.stringify(selectedIncident)));
      setNewComment('');
      setIsDeleting(false);
      // Auto-hide list on mobile or small screens when selected
      if (window.innerWidth < 768) setIsListVisible(false);
    }
  }, [selectedIncident]);

  const handleDelete = () => {
    if (isDeleting && selectedId) {
      onDeleteIncident(selectedId);
      setSelectedId(null);
      setIsDeleting(false);
    } else {
      setIsDeleting(true);
      setTimeout(() => setIsDeleting(false), 3000);
    }
  };

  const handleSave = () => {
    if (!selectedIncident) return;
    
    const updated: Incident = {
      ...selectedIncident,
      ...editForm,
      updatedAt: new Date().toISOString(),
      updates: [...selectedIncident.updates]
    };

    const changes: string[] = [];
    if (editForm.status !== selectedIncident.status) changes.push(`Status: ${editForm.status}`);
    if (editForm.priority !== selectedIncident.priority) changes.push(`Priority: ${editForm.priority}`);
    if (editForm.warroom !== selectedIncident.warroom) changes.push(`Warroom: ${editForm.warroom}`);
    if (editForm.sme !== selectedIncident.sme) changes.push(`SME: ${editForm.sme}`);

    if (changes.length > 0) {
      updated.updates.push({
        timestamp: new Date().toISOString(),
        user: 'Warroom',
        type: 'status_change',
        message: `Updated: ${changes.join(', ')}`
      });
    }

    if (newComment.trim()) {
      updated.updates.push({
        timestamp: new Date().toISOString(),
        user: 'Warroom',
        type: 'comment',
        message: newComment
      });
    }

    if ((updated.status === 'Resolved' || updated.status === 'Closed') && !selectedIncident.resolvedAt) {
      updated.resolvedAt = new Date().toISOString();
    }

    onUpdateIncident(updated);
    setNewComment('');
  };

  const getAge = (isoString: string) => {
    const diff = Date.now() - new Date(isoString).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    return `${hours}h ago`;
  };

  const handleChange = (field: keyof Incident, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex flex-col h-full bg-gray-100">
      <FilterBar filters={filters} setFilters={setFilters} lovs={lovs} onClear={clearFilters} />
      
      {/* Filters Active Banner */}
      {(filters.statusGroup || filters.warroom || filters.priority) && (
        <div className="bg-white px-4 py-2 border-b border-gray-200 flex items-center gap-2 overflow-x-auto">
             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide shrink-0">Active View:</span>
             {filters.statusGroup && <span className="badge-pill bg-blue-100 text-blue-800">{filters.statusGroup} <X size={10} className="cursor-pointer" onClick={()=>setFilters(f=>({...f, statusGroup:undefined}))}/></span>}
             {filters.warroom && <span className="badge-pill bg-purple-100 text-purple-800">{filters.warroom} <X size={10} className="cursor-pointer" onClick={()=>setFilters(f=>({...f, warroom:''}))}/></span>}
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT PANEL: Ticket List */}
        {isListVisible && (
          <div className={`${selectedId ? 'w-80 hidden md:block' : 'w-full'} bg-white border-r border-gray-200 overflow-y-auto custom-scrollbar flex-shrink-0 flex flex-col`}>
            <div className="p-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center text-xs font-semibold text-gray-500">
               <span>{filteredList.length} TICKETS</span>
               {selectedId && <button onClick={() => setIsListVisible(false)} className="md:hidden"><X size={14}/></button>}
            </div>
            {filteredList.map(item => (
              <div 
                key={item.id}
                onClick={() => { setSelectedId(item.id); setIsListVisible(true); }}
                className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 group relative ${selectedId === item.id ? 'bg-blue-50/50 border-l-4 border-l-blue-600' : 'border-l-4 border-l-transparent'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${item.priority.includes('P1') ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>{item.priority.split(':')[0]}</span>
                  <span className="text-[10px] text-gray-400">{getAge(item.timestamp)}</span>
                </div>
                <h4 className="text-xs font-semibold text-gray-900 leading-snug mb-1 line-clamp-2">{item.summary}</h4>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-gray-500 truncate max-w-[100px]">{item.warroom}</span>
                  <span className={`text-[10px] px-1.5 rounded ${item.status==='Resolved'?'text-green-700 bg-green-50':'text-gray-500 bg-gray-100'}`}>{item.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* RIGHT PANEL: Details */}
        <div className="flex-1 overflow-y-auto bg-gray-50 custom-scrollbar flex flex-col relative">
          {!selectedIncident ? (
             <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
               <Layout size={48} className="opacity-10 mb-4"/>
               <p>Select a ticket to view details</p>
             </div>
          ) : (
             <>
               {/* Fixed Header */}
               <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0 sticky top-0 z-10 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                     <div>
                        <div className="flex items-center gap-2 mb-1">
                          {!isListVisible && (
                             <button onClick={() => setIsListVisible(true)} className="mr-2 text-gray-400 hover:text-blue-600"><Layout size={18}/></button>
                          )}
                          <span className="text-lg font-bold text-gray-900">{selectedIncident.id}</span>
                          {selectedIncident.priority.includes('P1') && <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1"><AlertOctagon size={10}/> CRITICAL</span>}
                        </div>
                        <h1 className="text-xl font-bold text-gray-800 leading-tight">{selectedIncident.summary}</h1>
                     </div>
                     <div className="flex items-center gap-2">
                        {/* Compact List Toggle */}
                        <button 
                           onClick={() => setIsListVisible(!isListVisible)} 
                           className="text-gray-400 hover:text-gray-700 p-2 rounded hover:bg-gray-100 hidden md:block" 
                           title={isListVisible ? "Expand View" : "Show List"}
                        >
                           {isListVisible ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
                        </button>
                        <button onClick={handleDelete} className={`p-2 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors`}>
                           {isDeleting ? <span className="text-xs font-bold text-red-600">Sure?</span> : <Trash2 size={18} />}
                        </button>
                     </div>
                  </div>
                  
                  {/* Workflow & Quick Actions */}
                  <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                     <div className="flex-1 w-full"><WorkflowStepper incident={selectedIncident} /></div>
                     <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm flex items-center gap-2 transition-transform active:scale-95 shrink-0">
                        <Save size={16} /> Save Changes
                     </button>
                  </div>
               </div>

               {/* Tabs Navigation */}
               <div className="bg-white border-b border-gray-200 px-6 flex items-center gap-6 text-sm font-medium text-gray-500">
                  <button onClick={()=>setActiveTab('overview')} className={`py-3 border-b-2 transition-colors ${activeTab==='overview'?'border-blue-600 text-blue-600':'border-transparent hover:text-gray-800'}`}>Overview</button>
                  <button onClick={()=>setActiveTab('requestor')} className={`py-3 border-b-2 transition-colors ${activeTab==='requestor'?'border-blue-600 text-blue-600':'border-transparent hover:text-gray-800'}`}>Requestor Info</button>
                  <button onClick={()=>setActiveTab('audit')} className={`py-3 border-b-2 transition-colors ${activeTab==='audit'?'border-blue-600 text-blue-600':'border-transparent hover:text-gray-800'}`}>Audit Log</button>
               </div>

               {/* Tab Content */}
               <div className="p-6 max-w-5xl mx-auto w-full space-y-6">
                  
                  {/* TAB 1: OVERVIEW */}
                  {activeTab === 'overview' && (
                    <div className="animate-in fade-in duration-300 space-y-6">
                       {/* Compact Triage Bar */}
                       <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                          <div>
                             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Priority</label>
                             <select value={editForm.priority} onChange={(e)=>handleChange('priority',e.target.value)} className="w-full mt-1 text-sm border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                                {lovs.priorities.map(p=><option key={p} value={p}>{p}</option>)}
                             </select>
                          </div>
                          <div>
                             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Warroom</label>
                             <select value={editForm.warroom} onChange={(e)=>handleChange('warroom',e.target.value)} className="w-full mt-1 text-sm border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                                <option value="Unassigned">Unassigned</option>
                                {lovs.warrooms.map(w=><option key={w} value={w}>{w}</option>)}
                             </select>
                          </div>
                          <div>
                             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">SME</label>
                             <input value={editForm.sme||''} onChange={(e)=>handleChange('sme',e.target.value)} className="w-full mt-1 text-sm border-gray-300 rounded-lg shadow-sm" placeholder="Assign SME..." />
                          </div>
                          <div>
                             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Status</label>
                             <select value={editForm.status} onChange={(e)=>handleChange('status',e.target.value)} className={`w-full mt-1 text-sm font-semibold border-gray-300 rounded-lg shadow-sm ${editForm.status==='Resolved'?'text-green-700 bg-green-50':''}`}>
                                {lovs.statuses.map(s=><option key={s} value={s}>{s}</option>)}
                             </select>
                          </div>
                       </div>

                       {/* Description & Comment */}
                       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          <div className="lg:col-span-2 space-y-4">
                             <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2"><FileText size={16}/> Description</h3>
                                <textarea 
                                  value={editForm.description||''} 
                                  onChange={(e)=>handleChange('description',e.target.value)}
                                  className="w-full text-sm text-gray-700 border-gray-200 rounded-lg focus:ring-0 focus:border-blue-500 min-h-[120px]"
                                />
                             </div>
                             {selectedIncident.attachment && (
                                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                   <span className="text-xs font-bold text-gray-400 uppercase mb-2 block">Attachment</span>
                                   <img src={selectedIncident.attachment} alt="Proof" className="rounded-lg max-h-64 object-contain border border-gray-100" />
                                </div>
                             )}
                          </div>
                          <div className="lg:col-span-1">
                             <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 h-full">
                                <h3 className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2"><MessageSquare size={16}/> Internal Note</h3>
                                <textarea 
                                   value={newComment}
                                   onChange={(e)=>setNewComment(e.target.value)}
                                   placeholder="Add triage notes, root cause analysis, or status updates..."
                                   className="w-full h-32 bg-white border-blue-200 rounded-lg text-sm p-3 focus:ring-2 focus:ring-blue-200 outline-none resize-none"
                                />
                                <p className="text-xs text-blue-700 mt-2 opacity-80">Notes are added to the audit log upon saving.</p>
                             </div>
                          </div>
                       </div>
                    </div>
                  )}

                  {/* TAB 2: REQUESTOR INFO */}
                  {activeTab === 'requestor' && (
                     <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-in slide-in-from-left-2 duration-300">
                        <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4 flex items-center gap-2"><Info size={16}/> Contact & Location</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-4">
                              <div><label className="text-xs text-gray-500">Name</label><input value={editForm.requestorName} onChange={(e)=>handleChange('requestorName',e.target.value)} className="input-field w-full border rounded px-2 py-1 text-sm"/></div>
                              <div><label className="text-xs text-gray-500">Email</label><input value={editForm.requestorEmail} onChange={(e)=>handleChange('requestorEmail',e.target.value)} className="input-field w-full border rounded px-2 py-1 text-sm"/></div>
                              <div><label className="text-xs text-gray-500">Channel</label>
                                 <select value={editForm.channelType} onChange={(e)=>handleChange('channelType',e.target.value)} className="input-field w-full border rounded px-2 py-1 text-sm">
                                    {lovs.channels.map(c=><option key={c} value={c}>{c}</option>)}
                                 </select>
                              </div>
                           </div>
                           <div className="space-y-4">
                              <div><label className="text-xs text-gray-500">Store Name</label><input value={editForm.storeName} onChange={(e)=>handleChange('storeName',e.target.value)} className="input-field w-full border rounded px-2 py-1 text-sm"/></div>
                              <div><label className="text-xs text-gray-500">Store ID</label><input value={editForm.storeId} onChange={(e)=>handleChange('storeId',e.target.value)} className="input-field w-full border rounded px-2 py-1 text-sm"/></div>
                              <div><label className="text-xs text-gray-500">Region</label>
                                 <select value={editForm.region} onChange={(e)=>handleChange('region',e.target.value)} className="input-field w-full border rounded px-2 py-1 text-sm">
                                    <option value="">Select</option>{lovs.regions.map(r=><option key={r} value={r}>{r}</option>)}
                                 </select>
                              </div>
                           </div>
                        </div>
                     </div>
                  )}

                  {/* TAB 3: AUDIT LOG */}
                  {activeTab === 'audit' && (
                     <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-in slide-in-from-right-2 duration-300">
                        <h3 className="text-sm font-bold text-gray-900 mb-6 flex items-center gap-2"><History size={16}/> Full Activity History</h3>
                        <div className="relative pl-6 border-l-2 border-gray-100 space-y-8">
                           {selectedIncident.updates.slice().reverse().map((update, idx) => (
                              <div key={idx} className="relative group">
                                 <div className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${update.type==='creation'?'bg-green-500':'bg-gray-400'}`}></div>
                                 <div className="flex justify-between items-start mb-1">
                                    <span className="font-bold text-sm text-gray-900">{update.user}</span>
                                    <span className="text-xs text-gray-400 font-mono">{new Date(update.timestamp).toLocaleString()}</span>
                                 </div>
                                 <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                                    {update.message}
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}

               </div>
             </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandCenterScreen;
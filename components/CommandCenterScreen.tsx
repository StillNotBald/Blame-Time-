import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Incident, LOVData, IncidentFilters } from '../types';
import FilterBar from './FilterBar';
import { Clock, MessageSquare, User, Save, ChevronRight, Layout, AlertOctagon, Trash2, X, Filter, Check } from 'lucide-react';

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
  
  const [filters, setFilters] = useState<IncidentFilters>({
    search: '', category: '', priority: '', status: '', warroom: '', impactCategory: ''
  });

  // Sync Filters with URL Search Params (Deep Linking)
  useEffect(() => {
    const newFilters: IncidentFilters = {
      search: '', category: '', priority: '', status: '', warroom: '', impactCategory: ''
    };
    
    // Read standard params
    const w = searchParams.get('warroom');
    if (w) newFilters.warroom = w === 'Unassigned' ? 'Unassigned' : w;
    
    const p = searchParams.get('priority');
    if (p) newFilters.priority = p;

    const s = searchParams.get('status');
    if (s) newFilters.status = s;

    const sg = searchParams.get('statusGroup');
    if (sg === 'active' || sg === 'bau' || sg === 'resolved' || sg === 'closed') {
      newFilters.statusGroup = sg;
    }

    setFilters(prev => ({ ...prev, ...newFilters }));
  }, [searchParams]);

  const clearFilters = () => {
    setFilters({ search: '', category: '', priority: '', status: '', warroom: '', impactCategory: '' });
    setSearchParams({}); // Clear URL
  };

  // Helper to check Status Groups
  const checkStatusGroup = (incident: Incident, group?: string) => {
    const activeStatuses = ['New', 'Acknowledged', 'In Progress', 'ReOpen', 'Outage', 'Need more info'];
    const bauStatuses = ['Return to BAU', 'Duplicate', 'Invalid Issue', 'Post Hypercare'];

    if (group === 'active') return activeStatuses.includes(incident.status);
    if (group === 'bau') return bauStatuses.includes(incident.status);
    if (group === 'resolved') return incident.status === 'Resolved';
    if (group === 'closed') return incident.status === 'Closed';
    return true;
  };

  // Derived filtered list
  const filteredList = useMemo(() => {
    return incidents.filter(item => {
      if (filters.search) {
        const s = filters.search.toLowerCase();
        if (!item.summary.toLowerCase().includes(s) && !item.id.toLowerCase().includes(s)) return false;
      }
      if (filters.category && item.category !== filters.category) return false;
      
      // Fuzzy priority match if passed from dashboard (e.g., "P1" matches "P1: Critical")
      if (filters.priority) {
        if (!item.priority.includes(filters.priority)) return false;
      }

      if (filters.status && item.status !== filters.status) return false;
      if (filters.warroom && item.warroom !== filters.warroom) return false;
      if (filters.impactCategory && item.impactCategory !== filters.impactCategory) return false;
      
      // Status Group Logic
      if (filters.statusGroup && !checkStatusGroup(item, filters.statusGroup)) return false;

      return true;
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [incidents, filters]);

  const selectedIncident = useMemo(() => incidents.find(i => i.id === selectedId), [incidents, selectedId]);

  const [editForm, setEditForm] = useState<Partial<Incident>>({});
  const [newComment, setNewComment] = useState('');

  // Update local form when selection changes
  useEffect(() => {
    if (selectedIncident) {
      setEditForm(JSON.parse(JSON.stringify(selectedIncident))); // Deep copy
      setNewComment('');
      setIsDeleting(false);
    }
  }, [selectedIncident]);

  // Select handler
  const handleSelect = (incident: Incident) => {
    setSelectedId(incident.id);
  };

  const handleDelete = () => {
    if (isDeleting && selectedId) {
      onDeleteIncident(selectedId);
      setSelectedId(null);
      setIsDeleting(false);
    } else {
      setIsDeleting(true);
      // Auto reset after 3s
      setTimeout(() => setIsDeleting(false), 3000);
    }
  };

  // Save handler
  const handleSave = () => {
    if (!selectedIncident) return;
    
    const updated: Incident = {
      ...selectedIncident,
      ...editForm,
      updatedAt: new Date().toISOString(),
      updates: [...selectedIncident.updates]
    };

    // Determine what changed for the audit log
    const changes: string[] = [];
    if (editForm.status !== selectedIncident.status) changes.push(`Status: ${editForm.status}`);
    if (editForm.priority !== selectedIncident.priority) changes.push(`Priority: ${editForm.priority}`);
    if (editForm.warroom !== selectedIncident.warroom) changes.push(`Warroom: ${editForm.warroom}`);
    if (editForm.sme !== selectedIncident.sme) changes.push(`SME: ${editForm.sme}`);
    if (editForm.requestorName !== selectedIncident.requestorName) changes.push('Requestor Name');
    if (editForm.storeId !== selectedIncident.storeId) changes.push('Store ID');

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

    // Handle Resolution timestamp
    if ((updated.status === 'Resolved' || updated.status === 'Closed') && !selectedIncident.resolvedAt) {
      updated.resolvedAt = new Date().toISOString();
    }

    onUpdateIncident(updated);
    setNewComment('');
  };

  // Helper for Aging
  const getAge = (isoString: string) => {
    const diff = Date.now() - new Date(isoString).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  };

  const handleChange = (field: keyof Incident, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Top Filter Bar */}
      <div className="p-4 bg-white border-b border-gray-200">
        <FilterBar 
          filters={filters} 
          setFilters={setFilters} 
          lovs={lovs} 
          onClear={clearFilters} 
        />
        
        {/* Active Preset Indicator */}
        {(filters.statusGroup || filters.warroom || filters.priority) && (
           <div className="mt-2 flex items-center gap-2">
             <span className="text-xs font-semibold text-gray-500">Active View:</span>
             <div className="flex flex-wrap gap-2">
               {filters.statusGroup && (
                 <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs font-medium capitalize">
                   {filters.statusGroup} Incidents
                   <button onClick={() => {setFilters(f => ({...f, statusGroup: undefined})); setSearchParams({})}}><X size={12}/></button>
                 </span>
               )}
               {filters.warroom && (
                 <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-purple-100 text-purple-800 text-xs font-medium">
                   Warroom: {filters.warroom}
                   <button onClick={() => {setFilters(f => ({...f, warroom: ''})); setSearchParams({})}}><X size={12}/></button>
                 </span>
               )}
               {filters.priority && (
                 <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-orange-100 text-orange-800 text-xs font-medium">
                   {filters.priority}
                   <button onClick={() => {setFilters(f => ({...f, priority: ''})); setSearchParams({})}}><X size={12}/></button>
                 </span>
               )}
             </div>
           </div>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left List Panel */}
        <div className={`w-full md:w-1/3 lg:w-96 bg-gray-50 border-r border-gray-200 overflow-y-auto custom-scrollbar ${selectedId ? 'hidden md:block' : 'block'}`}>
          <div className="p-3 border-b border-gray-200 bg-gray-100/50 flex justify-between items-center">
             <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{filteredList.length} Tickets</span>
             <span className="text-xs text-gray-400">Sorted by Newest</span>
          </div>
          {filteredList.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              <Filter size={24} className="mx-auto mb-2 opacity-20"/>
              No tickets match the current filters.
            </div>
          ) : (
            filteredList.map(item => (
              <div 
                key={item.id}
                onClick={() => handleSelect(item)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-white transition-colors group relative ${selectedId === item.id ? 'bg-white border-l-4 border-l-blue-600 shadow-sm' : 'border-l-4 border-l-transparent'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${item.priority.includes('P1') ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                    {item.priority.split(':')[0]}
                  </span>
                  <span className="text-xs text-gray-500 font-mono">{getAge(item.timestamp)}</span>
                </div>
                <h4 className="text-sm font-semibold text-gray-900 leading-snug mb-1 line-clamp-2">{item.summary}</h4>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="truncate max-w-[120px]">{item.warroom}</span>
                  <span className={`px-1.5 rounded-full ${item.status === 'Resolved' ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>{item.status}</span>
                </div>
                <ChevronRight className={`absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity ${selectedId === item.id ? 'opacity-100' : ''}`} size={16} />
              </div>
            ))
          )}
        </div>

        {/* Right Detail Panel */}
        <div className={`flex-1 overflow-y-auto bg-white custom-scrollbar ${!selectedId ? 'hidden md:flex justify-center items-center' : 'block'}`}>
          {!selectedIncident ? (
            <div className="text-center text-gray-400">
              <Layout size={48} className="mx-auto mb-4 opacity-20" />
              <p>Select an incident to manage</p>
            </div>
          ) : (
            <div className="p-6 md:p-8 max-w-4xl mx-auto">
              
              {/* Header */}
              <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xl font-bold text-gray-900">{selectedIncident.id}</span>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">{getAge(selectedIncident.timestamp)} old</span>
                    {selectedIncident.priority.includes('P1') && <span className="flex items-center gap-1 text-xs font-bold bg-red-600 text-white px-2 py-0.5 rounded animate-pulse"><AlertOctagon size={12}/> CRITICAL</span>}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 leading-tight">{selectedIncident.summary}</h2>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleDelete}
                    className={`p-2 rounded-lg transition-all flex items-center gap-2 ${isDeleting ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'}`}
                    title="Delete Ticket"
                  >
                    {isDeleting ? <span className="text-xs font-bold px-2">Confirm?</span> : <Trash2 size={20} />}
                  </button>
                  <button onClick={() => setSelectedId(null)} className="md:hidden text-gray-500 px-3 py-1 bg-gray-100 rounded">Back</button>
                </div>
              </div>

              {/* Triage / Management Grid */}
              <div className="bg-gray-50 rounded-xl p-5 mb-8 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wider">
                    <User size={16} className="text-blue-600"/> Warroom Triage
                  </div>
                  <button 
                    onClick={handleSave}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm transition-colors"
                  >
                    <Save size={16} /> Save Changes
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Priority</label>
                    <select 
                      value={editForm.priority || ''}
                      onChange={(e) => handleChange('priority', e.target.value)}
                      className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 py-1.5"
                    >
                       {lovs.priorities.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Warroom Owner</label>
                    <select 
                      value={editForm.warroom || ''}
                      onChange={(e) => handleChange('warroom', e.target.value)}
                      className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 py-1.5"
                    >
                       <option value="Unassigned">Unassigned</option>
                       {lovs.warrooms.map(w => <option key={w} value={w}>{w}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Assigned SME</label>
                    <input 
                      value={editForm.sme || ''}
                      onChange={(e) => handleChange('sme', e.target.value)}
                      placeholder="Enter Name"
                      className="w-full text-sm border border-gray-300 rounded-md shadow-sm px-2 py-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Status</label>
                    <select 
                      value={editForm.status || ''}
                      onChange={(e) => handleChange('status', e.target.value)}
                      className={`w-full text-sm font-semibold border-gray-300 rounded-md shadow-sm px-2 py-1.5 ${editForm.status === 'Resolved' ? 'text-green-600 bg-green-50 border-green-200' : ''}`}
                    >
                       {lovs.statuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <textarea 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add an internal update, root cause note, or status explanation..."
                    className="w-full text-sm border-gray-300 rounded-lg p-3 shadow-sm focus:ring-2 focus:ring-blue-100 outline-none"
                    rows={2}
                  />
                </div>
              </div>

              {/* Editable Details & Requestor Info */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                 <div>
                    <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 mb-3">Incident Details</h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="text-gray-500 block text-xs mb-1">Category</span> 
                        <select 
                          value={editForm.category || ''}
                          onChange={(e) => handleChange('category', e.target.value)}
                          className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                        >
                          {lovs.categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-xs mb-1">Description</span> 
                        <textarea 
                          value={editForm.description || ''}
                          onChange={(e) => handleChange('description', e.target.value)}
                          className="w-full text-sm border border-gray-300 rounded px-2 py-1 min-h-[100px]"
                        />
                      </div>
                      {selectedIncident.attachment && (
                        <div className="mt-2">
                           <span className="text-gray-500 block text-xs mb-1">Attachment:</span>
                           <img src={selectedIncident.attachment} alt="Attachment" className="max-w-full h-auto max-h-48 rounded border border-gray-200" />
                        </div>
                      )}
                    </div>
                 </div>

                 <div>
                    <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 mb-3">Requestor Info</h3>
                    <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm">
                       <div className="col-span-1">
                         <span className="text-gray-500 text-xs block mb-1">Name</span>
                         <input 
                           value={editForm.requestorName || ''}
                           onChange={(e) => handleChange('requestorName', e.target.value)}
                           className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                         />
                       </div>
                       <div className="col-span-1">
                         <span className="text-gray-500 text-xs block mb-1">Channel</span>
                         <select 
                            value={editForm.channelType || ''}
                            onChange={(e) => handleChange('channelType', e.target.value)}
                            className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                          >
                             {lovs.channels.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                       </div>
                       <div className="col-span-2">
                         <span className="text-gray-500 text-xs block mb-1">Email</span>
                         <input 
                           value={editForm.requestorEmail || ''}
                           onChange={(e) => handleChange('requestorEmail', e.target.value)}
                           className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                         />
                       </div>
                       <div className="col-span-1">
                         <span className="text-gray-500 text-xs block mb-1">Region</span>
                         <select 
                            value={editForm.region || ''}
                            onChange={(e) => handleChange('region', e.target.value)}
                            className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                          >
                             <option value="">Select Region</option>
                             {lovs.regions.map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                       </div>
                       <div className="col-span-1">
                         <span className="text-gray-500 text-xs block mb-1">Store ID</span>
                         <input 
                           value={editForm.storeId || ''}
                           onChange={(e) => handleChange('storeId', e.target.value)}
                           className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                         />
                       </div>
                       <div className="col-span-2">
                         <span className="text-gray-500 text-xs block mb-1">Store Name</span>
                         <input 
                           value={editForm.storeName || ''}
                           onChange={(e) => handleChange('storeName', e.target.value)}
                           className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                         />
                       </div>
                       <div className="col-span-2">
                         <span className="text-gray-500 text-xs block mb-1">Affected User</span>
                         <input 
                           value={editForm.affectedUserId || ''}
                           onChange={(e) => handleChange('affectedUserId', e.target.value)}
                           className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                         />
                       </div>
                    </div>
                 </div>
              </div>

              {/* Audit Log */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MessageSquare size={16} className="text-gray-400" />
                  Activity Log
                </h3>
                <div className="relative pl-4 border-l-2 border-gray-200 space-y-6">
                  {selectedIncident.updates.slice().reverse().map((update, idx) => (
                    <div key={idx} className="relative">
                      <div className={`absolute -left-[21px] top-0 w-3 h-3 rounded-full border-2 border-white ${update.type === 'creation' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 mb-1">
                        <span className="font-semibold text-sm text-gray-900">{update.user}</span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock size={10} />
                          {new Date(update.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded-lg inline-block">
                        {update.message}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandCenterScreen;
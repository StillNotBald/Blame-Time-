import React, { useMemo, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Incident, LOVData } from '../types';
import { useNavigate } from 'react-router-dom';
import { KanbanSquare, AlertOctagon, User, Clock, CheckCircle, MoreHorizontal, X, Save, Edit2, HelpCircle, Eye, EyeOff, AlertTriangle } from 'lucide-react';

interface KanbanBoardProps {
  incidents: Incident[];
  onUpdateIncident: (incident: Incident) => void;
  lovs: LOVData; // Need LOVs for dynamic columns
}

interface KanbanColumn {
  id: string;
  title: string;
  items: Incident[];
  isUnmapped?: boolean;
}

const KanbanBoardScreen: React.FC<KanbanBoardProps> = ({ incidents, onUpdateIncident, lovs }) => {
  const navigate = useNavigate();
  
  // Quick Edit State
  const [editingTicketId, setEditingTicketId] = useState<string | null>(null);
  const [quickEditForm, setQuickEditForm] = useState<{
    warroom: string;
    sme: string;
    note: string;
  }>({ warroom: '', sme: '', note: '' });

  // Display State
  const [showUnmapped, setShowUnmapped] = useState(true);

  // Safety Check
  if (!lovs) {
    return (
      <div className="p-8 text-center h-full flex items-center justify-center text-gray-400">
         <div className="animate-pulse">Loading Configuration...</div>
      </div>
    );
  }

  // Columns from LOV Configuration + Unmapped Handling
  const { columns, unmappedCount } = useMemo(() => {
    const config = lovs.kanbanColumns || [];
    
    // 1. Build configured columns
    const boardColumns: KanbanColumn[] = config.map(colConfig => ({
        id: colConfig.id,
        title: colConfig.title,
        items: incidents.filter(i => colConfig.statuses.includes(i.status))
                 .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    }));

    // 2. Identify "Unmapped" Statuses (Statuses not in any column config)
    const mappedStatuses = new Set(config.flatMap(c => c.statuses));
    const unmappedIncidents = incidents.filter(i => !mappedStatuses.has(i.status));
    const count = unmappedIncidents.length;

    // 3. Create an "Unmapped" column if there are orphaned tickets AND we want to show them
    if (count > 0 && showUnmapped) {
        boardColumns.unshift({
            id: 'col-unmapped',
            title: 'Unmapped Statuses',
            items: unmappedIncidents.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
            isUnmapped: true
        });
    }

    // 4. Fallback: If absolutely no columns exist (and no config), auto-generate 1 column per status
    // In this case, everything is "mapped" to an auto-column, so unmappedCount is effectively 0 for the purpose of the alert
    if (boardColumns.length === 0 && config.length === 0) {
       const autoColumns = lovs.statuses.map(status => ({
           id: `col-auto-${status}`,
           title: status,
           items: incidents.filter(i => i.status === status)
       }));
       return { columns: autoColumns, unmappedCount: 0 };
    }

    return { columns: boardColumns, unmappedCount: count };
  }, [incidents, lovs.kanbanColumns, lovs.statuses, showUnmapped]);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    
    // Prevent dropping INTO the unmapped column (it's a catch-all, not a valid target state)
    if (destination.droppableId === 'col-unmapped') {
        return; 
    }

    const incident = incidents.find(i => i.id === draggableId);
    if (!incident) return;

    // Determine new status based on dropped column
    const targetColConfig = lovs.kanbanColumns.find(c => c.id === destination.droppableId);
    
    // Default to the first status in that column's list
    let newStatus = incident.status;
    
    // If we are in "Auto-Generated" mode (no config ids match), assume column title IS the status
    if (!targetColConfig && destination.droppableId.startsWith('col-auto-')) {
         newStatus = destination.droppableId.replace('col-auto-', '');
    } else if (targetColConfig && targetColConfig.statuses.length > 0) {
        // Standard Config Mode
        if (!targetColConfig.statuses.includes(incident.status)) {
            newStatus = targetColConfig.statuses[0];
        }
    } else {
        // Fallback or empty column
        return; 
    }

    if (newStatus !== incident.status) {
      const updatedIncident = {
        ...incident,
        status: newStatus,
        updatedAt: new Date().toISOString(),
        updates: [
          ...incident.updates,
          {
            timestamp: new Date().toISOString(),
            user: 'Admin',
            type: 'status_change',
            message: `Moved to ${targetColConfig?.title || newStatus} (Status: ${newStatus}) via Kanban`
          }
        ]
      };
      
      if ((newStatus === 'Resolved' || newStatus === 'Closed') && !updatedIncident.resolvedAt) {
          // @ts-ignore
          updatedIncident.resolvedAt = new Date().toISOString();
      }

      // @ts-ignore
      onUpdateIncident(updatedIncident);
    }
  };

  const openQuickEdit = (e: React.MouseEvent, incident: Incident) => {
      e.stopPropagation();
      setEditingTicketId(incident.id);
      setQuickEditForm({
          warroom: incident.warroom,
          sme: incident.sme || '',
          note: ''
      });
  };

  const handleQuickSave = () => {
      const incident = incidents.find(i => i.id === editingTicketId);
      if (!incident) return;

      const updated = {
          ...incident,
          warroom: quickEditForm.warroom,
          sme: quickEditForm.sme,
          updatedAt: new Date().toISOString(),
          updates: [...incident.updates]
      };

      if (quickEditForm.note.trim()) {
          updated.updates.push({
              timestamp: new Date().toISOString(),
              user: 'Warroom',
              type: 'comment',
              message: quickEditForm.note
          });
      }
      
      if (quickEditForm.warroom !== incident.warroom) {
          // @ts-ignore
          updated.updates.push({ timestamp: new Date().toISOString(), user: 'Warroom', type: 'assignment', message: `Warroom changed to ${quickEditForm.warroom}`});
      }

      // @ts-ignore
      onUpdateIncident(updated);
      setEditingTicketId(null);
  };

  const getPriorityColor = (p: string) => {
    if (p.includes('P1')) return 'bg-red-100 text-red-700 border-red-200';
    if (p.includes('P2')) return 'bg-orange-100 text-orange-700 border-orange-200';
    if (p.includes('P3')) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-blue-50 text-blue-700 border-blue-200';
  };

  return (
    <div className="p-6 h-full flex flex-col bg-gray-50 overflow-hidden relative">
      <div className="flex justify-between items-start mb-6 shrink-0">
        <div className="flex items-center gap-3">
            <KanbanSquare size={24} className="text-gray-700" />
            <div>
            <h1 className="text-2xl font-bold text-gray-900">Incident Board</h1>
            <p className="text-gray-500 text-sm">Drag to move. Click edit icon for quick actions.</p>
            </div>
        </div>
        
        {/* Toggle Unmapped Button */}
        <button 
            onClick={() => setShowUnmapped(!showUnmapped)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${showUnmapped ? 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50' : 'bg-gray-800 text-white hover:bg-gray-900'}`}
            title={showUnmapped ? "Hide Unmapped Column" : "Show Unmapped Column"}
        >
            {showUnmapped ? <Eye size={16} /> : <EyeOff size={16} />}
            {showUnmapped ? 'Unmapped Visible' : 'Unmapped Hidden'}
        </button>
      </div>

      {/* Alert Notification for Hidden Unmapped Items */}
      {!showUnmapped && unmappedCount > 0 && (
          <div className="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg flex items-center gap-3 animate-in slide-in-from-top-2">
              <AlertTriangle size={20} />
              <div className="flex-1">
                  <span className="font-bold">{unmappedCount} incidents</span> are currently in statuses not mapped to any column. 
                  <button onClick={() => setShowUnmapped(true)} className="ml-2 underline hover:text-yellow-900">Show them</button>
              </div>
          </div>
      )}

      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex h-full gap-6 min-w-full pb-4">
            {columns.map(col => (
              <div key={col.id} className={`flex-1 flex flex-col min-w-[280px] max-w-[350px] rounded-xl border shadow-inner ${col.isUnmapped ? 'bg-red-50/50 border-red-200' : 'bg-gray-100/50 border-gray-200/60'}`}>
                {/* Column Header */}
                <div className={`p-4 border-b flex justify-between items-center rounded-t-xl ${col.isUnmapped ? 'bg-red-50 border-red-200' : 'bg-white/50 border-gray-200'}`}>
                  <div className="flex items-center gap-2">
                     {col.isUnmapped && <HelpCircle size={14} className="text-red-500" />}
                     <h3 className={`font-bold text-sm uppercase tracking-wide ${col.isUnmapped ? 'text-red-700' : 'text-gray-700'}`}>{col.title}</h3>
                  </div>
                  <span className="bg-white px-2 py-0.5 rounded-full text-xs font-bold text-gray-500 shadow-sm border border-gray-100">
                    {col.items.length}
                  </span>
                </div>

                {/* Droppable Area */}
                <Droppable droppableId={col.id} isDropDisabled={!!col.isUnmapped}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`flex-1 p-3 overflow-y-auto custom-scrollbar space-y-3 transition-colors ${snapshot.isDraggingOver ? 'bg-blue-50/50' : ''}`}
                    >
                      {col.items.map((item, index) => (
                        <Draggable key={item.id} draggableId={item.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => navigate(`/command-center?ticketId=${item.id}`)}
                              className={`bg-white p-4 rounded-lg shadow-sm border border-gray-200 group hover:shadow-md transition-all relative ${snapshot.isDragging ? 'shadow-lg rotate-1 z-50' : ''}`}
                              style={provided.draggableProps.style}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${getPriorityColor(item.priority)}`}>
                                  {item.priority.split(':')[0]}
                                </span>
                                <button 
                                  onClick={(e) => openQuickEdit(e, item)}
                                  className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-1 rounded transition-colors"
                                  title="Quick Edit"
                                >
                                  <Edit2 size={12} />
                                </button>
                              </div>
                              <h4 className="text-sm font-semibold text-gray-900 leading-snug mb-2 line-clamp-3">
                                {item.summary}
                              </h4>
                              <div className="flex items-center justify-between text-xs text-gray-500 mt-2 pt-2 border-t border-gray-50">
                                 <span className="truncate max-w-[100px]" title={item.warroom}>{item.warroom}</span>
                                 <span className="text-[10px] px-1.5 rounded bg-gray-100 text-gray-600">{item.status}</span>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>

      {/* Quick Edit Modal Overlay */}
      {editingTicketId && (
        <div className="absolute inset-0 z-[100] bg-black/20 backdrop-blur-[1px] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm border border-gray-200 animate-in zoom-in-95 duration-200">
               <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
                   <h3 className="font-bold text-gray-800 text-sm">Quick Update #{editingTicketId.slice(-4)}</h3>
                   <button onClick={() => setEditingTicketId(null)} className="text-gray-400 hover:text-gray-700"><X size={16}/></button>
               </div>
               <div className="p-5 space-y-4">
                   <div>
                       <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Warroom</label>
                       <select 
                         value={quickEditForm.warroom}
                         onChange={(e) => setQuickEditForm(prev => ({...prev, warroom: e.target.value}))}
                         className="w-full text-sm border-gray-300 rounded-lg p-2 bg-white focus:ring-2 focus:ring-blue-100 outline-none"
                       >
                           <option value="Unassigned">Unassigned</option>
                           {lovs.warrooms.map(w => <option key={w} value={w}>{w}</option>)}
                       </select>
                   </div>
                   <div>
                       <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Assigned SME</label>
                       <input 
                         value={quickEditForm.sme}
                         onChange={(e) => setQuickEditForm(prev => ({...prev, sme: e.target.value}))}
                         placeholder="Name..."
                         className="w-full text-sm border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-100 outline-none"
                       />
                   </div>
                   <div>
                       <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Quick Note</label>
                       <textarea 
                         value={quickEditForm.note}
                         onChange={(e) => setQuickEditForm(prev => ({...prev, note: e.target.value}))}
                         placeholder="Add a comment..."
                         rows={3}
                         className="w-full text-sm border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-100 outline-none resize-none"
                       />
                   </div>
                   <button 
                     onClick={handleQuickSave}
                     className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
                   >
                       <Save size={16} /> Save Updates
                   </button>
               </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default KanbanBoardScreen;
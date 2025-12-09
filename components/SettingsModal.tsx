import React, { useState } from 'react';
import { LOVData, KanbanColumnConfig } from '../types';
import { X, Plus, Trash2, Save, AlertTriangle, Database, Check, KanbanSquare, Edit, RefreshCw } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lovs: LOVData;
  onSave: (newLovs: LOVData) => void;
  onClearData: () => void;
  onSeedData: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, lovs, onSave, onClearData, onSeedData }) => {
  const [localLovs, setLocalLovs] = useState<LOVData>(lovs);
  const [activeTab, setActiveTab] = useState<keyof LOVData | 'kanban'>('categories');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [confirmSeed, setConfirmSeed] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  
  // Input State for New Items
  const [newItemValue, setNewItemValue] = useState('');

  if (!isOpen) return null;

  const handleAddItem = () => {
    if (!newItemValue.trim()) return;

    if (activeTab === 'kanban') {
       const title = newItemValue.trim();
       const newCol: KanbanColumnConfig = {
         id: `col-${Date.now()}`,
         title,
         statuses: []
       };
       setLocalLovs(prev => ({
         ...prev,
         kanbanColumns: [...(prev.kanbanColumns || []), newCol]
       }));
    } else {
       // Standard LOV Add
       setLocalLovs(prev => ({
         ...prev,
         [activeTab as keyof LOVData]: [...(prev[activeTab as keyof LOVData] as string[]), newItemValue.trim()]
       }));
    }
    setNewItemValue(''); // Reset input
  };

  const handleRemoveItem = (itemToRemove: string) => {
    if (confirmDelete === itemToRemove) {
      setLocalLovs(prev => ({
        ...prev,
        [activeTab as keyof LOVData]: (prev[activeTab as keyof LOVData] as string[]).filter(i => i !== itemToRemove)
      }));
      setConfirmDelete(null);
    } else {
      setConfirmDelete(itemToRemove);
      setTimeout(() => setConfirmDelete(null), 3000); // Reset after 3s
    }
  };

  const handleRemoveColumn = (colId: string) => {
    setLocalLovs(prev => ({
      ...prev,
      kanbanColumns: prev.kanbanColumns.filter(c => c.id !== colId)
    }));
  };

  const handleToggleStatusInColumn = (colId: string, status: string) => {
    setLocalLovs(prev => ({
      ...prev,
      kanbanColumns: prev.kanbanColumns.map(col => {
        if (col.id !== colId) return col;
        const exists = col.statuses.includes(status);
        return {
          ...col,
          statuses: exists ? col.statuses.filter(s => s !== status) : [...col.statuses, status]
        };
      })
    }));
  };

  const handleResetKanbanTo1to1 = () => {
    if (window.confirm("This will overwrite your board to have 1 Column for every Status. Continue?")) {
        const newCols = localLovs.statuses.map((status, idx) => ({
            id: `col-auto-${idx}`,
            title: status,
            statuses: [status]
        }));
        setLocalLovs(prev => ({ ...prev, kanbanColumns: newCols }));
    }
  };

  const handleSave = () => {
    onSave(localLovs);
    onClose();
  };

  const tabs: { key: keyof LOVData | 'kanban'; label: string }[] = [
    { key: 'categories', label: 'Categories' },
    { key: 'priorities', label: 'Priorities' },
    { key: 'statuses', label: 'Statuses' },
    { key: 'warrooms', label: 'Warrooms' },
    { key: 'impactCategories', label: 'Impacts' },
    { key: 'channels', label: 'Channels' },
    { key: 'regions', label: 'Regions' },
    { key: 'kanban', label: 'Kanban Board' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Configure Lists</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-1/3 bg-gray-50 border-r border-gray-200 overflow-y-auto">
             {tabs.map(tab => (
               <button
                 key={tab.key}
                 onClick={() => { setActiveTab(tab.key); setNewItemValue(''); }}
                 className={`w-full text-left px-4 py-3 text-sm font-medium border-b border-gray-100 transition-colors ${activeTab === tab.key ? 'bg-white text-blue-600 border-l-4 border-l-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
               >
                 {tab.label}
               </button>
             ))}
             
             {/* Danger Zone Link */}
             <div className="mt-8 px-4 space-y-3">
               <div className="text-xs font-bold text-gray-800 uppercase tracking-widest mb-2">Dev Tools</div>
               
               <button 
                 onClick={() => {
                   if(confirmSeed) {
                     onSeedData();
                     onClose();
                     setConfirmSeed(false);
                   } else {
                     setConfirmSeed(true);
                     setTimeout(() => setConfirmSeed(false), 3000);
                   }
                 }}
                 className={`w-full flex items-center gap-2 text-xs p-2 rounded border transition-colors ${confirmSeed ? 'bg-green-600 text-white border-green-700' : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'}`}
               >
                 {confirmSeed ? <Check size={12} /> : <Database size={12} />}
                 {confirmSeed ? "Click to Confirm" : "Seed 200 Mock Tickets"}
               </button>

               <div className="text-xs font-bold text-red-800 uppercase tracking-widest mt-4 mb-2">Danger Zone</div>
               <button 
                 onClick={() => {
                   if(confirmReset) {
                     onClearData();
                     setConfirmReset(false);
                   } else {
                     setConfirmReset(true);
                     setTimeout(() => setConfirmReset(false), 3000);
                   }
                 }}
                 className={`w-full flex items-center gap-2 text-xs p-2 rounded border transition-colors ${confirmReset ? 'bg-red-600 text-white border-red-700' : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'}`}
               >
                 <AlertTriangle size={12} /> 
                 {confirmReset ? "Are you sure?" : "Reset Database"}
               </button>
             </div>
          </div>

          {/* List Area */}
          <div className="w-2/3 p-4 overflow-y-auto bg-gray-50/30">
             <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-800 capitalize">
                   {activeTab === 'kanban' ? 'Board Columns' : activeTab.replace(/([A-Z])/g, ' $1').trim()}
                </h3>
                {activeTab === 'kanban' && (
                    <button 
                        onClick={handleResetKanbanTo1to1}
                        className="text-[10px] bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded flex items-center gap-1"
                        title="Auto-generate 1 column for every status"
                    >
                        <RefreshCw size={10} /> Auto-Map All
                    </button>
                )}
             </div>

             {/* Add New Item Input */}
             <div className="flex gap-2 mb-4 bg-white p-2 rounded border border-gray-200">
               <input 
                 type="text" 
                 value={newItemValue}
                 onChange={(e) => setNewItemValue(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                 placeholder={activeTab === 'kanban' ? "New Column Title..." : "Add new value..."}
                 className="flex-1 text-sm outline-none"
               />
               <button 
                  onClick={handleAddItem}
                  disabled={!newItemValue.trim()}
                  className="bg-blue-600 text-white p-1 rounded hover:bg-blue-700 disabled:opacity-50"
               >
                  <Plus size={16} />
               </button>
             </div>

             {/* Standard List Logic */}
             {activeTab !== 'kanban' && (
               <div className="space-y-2">
                 {(localLovs[activeTab as keyof LOVData] as string[]).map((item, idx) => (
                   <div key={`${item}-${idx}`} className="flex justify-between items-center bg-white border border-gray-200 p-2 rounded hover:shadow-sm">
                     <span className="text-sm text-gray-700">{item}</span>
                     <button 
                      onClick={() => handleRemoveItem(item)} 
                      className={`${confirmDelete === item ? 'text-red-600 font-bold' : 'text-gray-400 hover:text-red-500'}`}
                     >
                       {confirmDelete === item ? 'Confirm?' : <Trash2 size={14} />}
                     </button>
                   </div>
                 ))}
               </div>
             )}

             {/* Kanban Configuration Logic */}
             {activeTab === 'kanban' && (
               <div className="space-y-4">
                 <p className="text-xs text-gray-500 bg-blue-50 p-2 rounded border border-blue-100">
                   Define columns and check which Ticket Statuses appear in each column.
                 </p>
                 {localLovs.kanbanColumns?.map((col) => (
                   <div key={col.id} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                     <div className="flex justify-between items-center mb-2">
                       <input 
                         value={col.title}
                         onChange={(e) => setLocalLovs(prev => ({
                           ...prev,
                           kanbanColumns: prev.kanbanColumns.map(c => c.id === col.id ? { ...c, title: e.target.value } : c)
                         }))}
                         className="font-bold text-gray-800 text-sm border-b border-transparent focus:border-blue-500 outline-none hover:bg-gray-50 px-1"
                       />
                       <button onClick={() => handleRemoveColumn(col.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={14}/></button>
                     </div>
                     
                     {/* Status Selector */}
                     <div className="mt-2">
                       <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Mapped Statuses</span>
                       <div className="flex flex-wrap gap-2">
                         {localLovs.statuses.map(status => {
                           const isSelected = col.statuses.includes(status);
                           return (
                             <button
                               key={status}
                               onClick={() => handleToggleStatusInColumn(col.id, status)}
                               className={`text-[10px] px-2 py-1 rounded border transition-colors ${isSelected ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'}`}
                             >
                               {status}
                             </button>
                           );
                         })}
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-end bg-gray-50">
           <button onClick={onClose} className="mr-2 px-4 py-2 text-sm text-gray-600 font-medium hover:text-gray-800">Cancel</button>
           <button onClick={handleSave} className="px-4 py-2 text-sm bg-blue-600 text-white font-medium rounded hover:bg-blue-700 flex items-center gap-2">
             <Save size={16} /> Save Changes
           </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
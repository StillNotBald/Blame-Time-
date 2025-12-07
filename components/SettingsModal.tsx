import React, { useState } from 'react';
import { LOVData } from '../types';
import { X, Plus, Trash2, Save, AlertTriangle, Database, Check } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<keyof LOVData>('categories');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [confirmSeed, setConfirmSeed] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  if (!isOpen) return null;

  const handleAddItem = () => {
    const newItem = prompt("Enter new value:");
    if (newItem) {
      setLocalLovs(prev => ({
        ...prev,
        [activeTab]: [...prev[activeTab], newItem]
      }));
    }
  };

  const handleRemoveItem = (itemToRemove: string) => {
    if (confirmDelete === itemToRemove) {
      setLocalLovs(prev => ({
        ...prev,
        [activeTab]: prev[activeTab].filter(i => i !== itemToRemove)
      }));
      setConfirmDelete(null);
    } else {
      setConfirmDelete(itemToRemove);
      setTimeout(() => setConfirmDelete(null), 3000); // Reset after 3s
    }
  };

  const handleSave = () => {
    onSave(localLovs);
    onClose();
  };

  const tabs: { key: keyof LOVData; label: string }[] = [
    { key: 'categories', label: 'Categories' },
    { key: 'priorities', label: 'Priorities' },
    { key: 'statuses', label: 'Statuses' },
    { key: 'warrooms', label: 'Warrooms' },
    { key: 'impactCategories', label: 'Impacts' },
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
                 onClick={() => setActiveTab(tab.key)}
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
          <div className="w-2/3 p-4 overflow-y-auto">
             <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-800 capitalize">{activeTab.replace(/([A-Z])/g, ' $1').trim()}</h3>
                <button 
                  onClick={handleAddItem}
                  className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                >
                  <Plus size={14} /> Add New
                </button>
             </div>
             <div className="space-y-2">
               {localLovs[activeTab].map((item, idx) => (
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
import React, { useState } from 'react';
import { LOVData } from '../types';
import { PlusCircle } from 'lucide-react';

interface BroadcastFormProps {
  lovs: LOVData;
  onSubmit: (data: any) => void;
}

const BroadcastForm: React.FC<BroadcastFormProps> = ({ lovs, onSubmit }) => {
  const [summary, setSummary] = useState('');
  const [impactArea, setImpactArea] = useState('');
  
  // Defaults
  const [category, setCategory] = useState(lovs.categories[0] || '');
  const [priority, setPriority] = useState(lovs.priorities[1] || ''); // Default to P2
  const [warroom, setWarroom] = useState(lovs.warrooms[0] || '');
  const [impactCategory, setImpactCategory] = useState(lovs.impactCategories[0] || '');
  const [status, setStatus] = useState(lovs.statuses[0] || 'New');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary.trim()) return;

    onSubmit({
      summary,
      impactArea,
      category,
      priority,
      warroom,
      impactCategory,
      status
    });
    
    // Reset text fields only, keep dropdowns or reset to defaults?
    // Let's reset text fields to keep workflow fast
    setSummary('');
    setImpactArea('');
    setStatus(lovs.statuses[0] || 'New');
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
        <h2 className="text-gray-900 font-semibold flex items-center gap-2">
          <PlusCircle size={18} className="text-blue-600" />
          Broadcast Incident
        </h2>
      </div>
      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
           {/* Row 1: Core Classification */}
           <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Issue Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 outline-none">
              {lovs.categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Priority</label>
            <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 outline-none">
              {lovs.priorities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Warroom</label>
            <select value={warroom} onChange={e => setWarroom(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 outline-none">
              {lovs.warrooms.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Initial Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 outline-none">
              {lovs.statuses.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
          {/* Summary */}
          <div className="md:col-span-5">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Issue Summary</label>
            <input
              type="text"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="e.g. API Latency Spike"
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none text-gray-900"
              required
            />
          </div>

          {/* Impact Category */}
           <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Impact Category</label>
            <select value={impactCategory} onChange={e => setImpactCategory(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 outline-none">
              {lovs.impactCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Impact Area Details */}
          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Area Details</label>
            <input
              type="text"
              value={impactArea}
              onChange={(e) => setImpactArea(e.target.value)}
              placeholder="e.g. US-East Checkout"
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none text-gray-900"
            />
          </div>

          {/* Submit */}
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm hover:shadow transition-all active:scale-95"
            >
              BROADCAST
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BroadcastForm;

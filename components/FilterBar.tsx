import React, { useState } from 'react';
import { LOVData, IncidentFilters } from '../types';
import { Filter, X, Search, ChevronDown, ChevronUp } from 'lucide-react';

interface FilterBarProps {
  filters: IncidentFilters;
  setFilters: React.Dispatch<React.SetStateAction<IncidentFilters>>;
  lovs: LOVData;
  onClear: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ filters, setFilters, lovs, onClear }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleChange = (key: keyof IncidentFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const hasActiveFilters = filters.category || filters.priority || filters.status || filters.warroom || filters.impactCategory;

  return (
    <div className="bg-white border-b border-gray-200 p-3 shadow-sm sticky top-0 z-10">
      <div className="flex items-center gap-3">
        {/* Search - Always Visible */}
        <div className="flex-1 relative">
           <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
           <input
             type="text"
             placeholder="Search summary, ID, or description..."
             value={filters.search}
             onChange={(e) => handleChange('search', e.target.value)}
             className="w-full text-sm pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
           />
        </div>

        {/* Toggle Button */}
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isExpanded || hasActiveFilters ? 'bg-blue-50 text-blue-700' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
        >
          <Filter size={16} />
          Filters
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {/* Clear All */}
        {(hasActiveFilters || filters.search) && (
          <button onClick={onClear} className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors" title="Clear All">
            <X size={18} />
          </button>
        )}
      </div>
      
      {/* Expanded Filters Grid */}
      {isExpanded && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-3 pt-3 border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
          <select 
            value={filters.category} 
            onChange={(e) => handleChange('category', e.target.value)}
            className="text-xs px-3 py-2 bg-white border border-gray-300 rounded focus:border-blue-500 outline-none"
          >
            <option value="">Category: All</option>
            {lovs.categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select 
            value={filters.priority} 
            onChange={(e) => handleChange('priority', e.target.value)}
            className="text-xs px-3 py-2 bg-white border border-gray-300 rounded focus:border-blue-500 outline-none"
          >
            <option value="">Priority: All</option>
            {lovs.priorities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select 
            value={filters.status} 
            onChange={(e) => handleChange('status', e.target.value)}
            className="text-xs px-3 py-2 bg-white border border-gray-300 rounded focus:border-blue-500 outline-none"
          >
            <option value="">Status: All</option>
            {lovs.statuses.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select 
            value={filters.warroom} 
            onChange={(e) => handleChange('warroom', e.target.value)}
            className="text-xs px-3 py-2 bg-white border border-gray-300 rounded focus:border-blue-500 outline-none"
          >
            <option value="">Warroom: All</option>
            <option value="Unassigned">Unassigned</option>
            {lovs.warrooms.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select 
            value={filters.impactCategory} 
            onChange={(e) => handleChange('impactCategory', e.target.value)}
            className="text-xs px-3 py-2 bg-white border border-gray-300 rounded focus:border-blue-500 outline-none"
          >
            <option value="">Impact: All</option>
            {lovs.impactCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
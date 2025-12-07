import React from 'react';
import { LOVData, IncidentFilters } from '../types';
import { Filter, X } from 'lucide-react';

interface FilterBarProps {
  filters: IncidentFilters;
  setFilters: React.Dispatch<React.SetStateAction<IncidentFilters>>;
  lovs: LOVData;
  onClear: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ filters, setFilters, lovs, onClear }) => {
  const handleChange = (key: keyof IncidentFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Filter size={16} />
          Filters
        </h3>
        <button 
          onClick={onClear}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
        >
          <X size={12} />
          Clear All
        </button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Search */}
        <div className="col-span-2 md:col-span-1">
           <input
             type="text"
             placeholder="Search summary..."
             value={filters.search}
             onChange={(e) => handleChange('search', e.target.value)}
             className="w-full text-xs px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
           />
        </div>

        {/* Category */}
        <select 
          value={filters.category} 
          onChange={(e) => handleChange('category', e.target.value)}
          className="w-full text-xs px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none bg-white"
        >
          <option value="">All Categories</option>
          {lovs.categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* Priority */}
        <select 
          value={filters.priority} 
          onChange={(e) => handleChange('priority', e.target.value)}
          className="w-full text-xs px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none bg-white"
        >
          <option value="">All Priorities</option>
          {lovs.priorities.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* Status */}
        <select 
          value={filters.status} 
          onChange={(e) => handleChange('status', e.target.value)}
          className="w-full text-xs px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none bg-white"
        >
          <option value="">All Statuses</option>
          {lovs.statuses.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* Warroom */}
        <select 
          value={filters.warroom} 
          onChange={(e) => handleChange('warroom', e.target.value)}
          className="w-full text-xs px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none bg-white"
        >
          <option value="">All Warrooms</option>
          <option value="Unassigned">Unassigned</option>
          {lovs.warrooms.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

         {/* Impact */}
        <select 
          value={filters.impactCategory} 
          onChange={(e) => handleChange('impactCategory', e.target.value)}
          className="w-full text-xs px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none bg-white"
        >
          <option value="">All Impacts</option>
          {lovs.impactCategories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
    </div>
  );
};

export default FilterBar;
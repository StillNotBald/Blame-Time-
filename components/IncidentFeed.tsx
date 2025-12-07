import React, { useState, useMemo } from 'react';
import { Incident, LOVData, IncidentFilters } from '../types';
import IncidentCard from './IncidentCard';
import FilterBar from './FilterBar';
import { Activity } from 'lucide-react';

interface IncidentFeedProps {
  incidents: Incident[];
  onUpdateStatus: (id: string, newStatus: string) => void;
  lovs: LOVData;
}

const IncidentFeed: React.FC<IncidentFeedProps> = ({ incidents, onUpdateStatus, lovs }) => {
  const [filters, setFilters] = useState<IncidentFilters>({
    search: '',
    category: '',
    priority: '',
    status: '',
    warroom: '',
    impactCategory: ''
  });

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      priority: '',
      status: '',
      warroom: '',
      impactCategory: ''
    });
  };

  const filteredIncidents = useMemo(() => {
    return incidents.filter(item => {
      // Text Search
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const summaryMatch = item.summary.toLowerCase().includes(searchLower);
        const idMatch = item.id.toLowerCase().includes(searchLower);
        if (!summaryMatch && !idMatch) return false;
      }

      // Dropdown Filters
      if (filters.category && item.category !== filters.category) return false;
      if (filters.priority && item.priority !== filters.priority) return false;
      if (filters.status && item.status !== filters.status) return false;
      if (filters.warroom && item.warroom !== filters.warroom) return false;
      if (filters.impactCategory && item.impactCategory !== filters.impactCategory) return false;

      return true;
    });
  }, [incidents, filters]);

  return (
    <div className="space-y-4">
      
      <FilterBar 
        filters={filters} 
        setFilters={setFilters} 
        lovs={lovs} 
        onClear={clearFilters}
      />

      <div className="flex items-center gap-2 mb-4 text-gray-900 font-semibold border-b border-gray-200 pb-2">
        <Activity size={18} className="text-gray-400" />
        <h3>Live Feed</h3>
        <span className="ml-auto bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-0.5 rounded-full">
          {filteredIncidents.length} Records
        </span>
      </div>

      {filteredIncidents.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500 font-medium">No incidents match your criteria.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredIncidents.map((incident) => (
            <IncidentCard 
              key={incident.id} 
              incident={incident} 
              onUpdateStatus={onUpdateStatus}
              allStatuses={lovs.statuses}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default IncidentFeed;

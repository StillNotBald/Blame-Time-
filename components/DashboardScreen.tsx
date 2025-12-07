import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Incident, LOVData } from '../types';
import { AlertOctagon, AlertTriangle, CheckCircle2, Archive, XCircle, Layout, ArrowUpRight } from 'lucide-react';

interface DashboardProps {
  incidents: Incident[];
  lovs: LOVData;
}

const DashboardScreen: React.FC<DashboardProps> = ({ incidents, lovs }) => {
  const navigate = useNavigate();

  // Helper to construct query string
  const handleNav = (params: Record<string, string>) => {
    const search = new URLSearchParams(params).toString();
    navigate(`/command-center?${search}`);
  };

  // Advanced Stats Calculation
  const metrics = useMemo(() => {
    // Define bucket logic
    const activeStatuses = ['New', 'Acknowledged', 'In Progress', 'ReOpen', 'Outage', 'Need more info'];
    const bauStatuses = ['Return to BAU', 'Duplicate', 'Invalid Issue', 'Post Hypercare'];
    
    // Filter Lists
    const activeList = incidents.filter(i => activeStatuses.includes(i.status));
    const resolvedList = incidents.filter(i => i.status === 'Resolved');
    const closedList = incidents.filter(i => i.status === 'Closed');
    const bauList = incidents.filter(i => bauStatuses.includes(i.status));

    // Helper to count priorities
    const countPrios = (list: Incident[]) => ({
      total: list.length,
      p1: list.filter(i => i.priority.includes('P1')).length,
      p2: list.filter(i => i.priority.includes('P2')).length,
      p3: list.filter(i => i.priority.includes('P3')).length,
      p4: list.filter(i => i.priority.includes('P4')).length,
    });

    return {
      active: countPrios(activeList),
      resolved: countPrios(resolvedList),
      closed: countPrios(closedList),
      bau: {
        total: bauList.length,
        breakdown: {
          'Return to BAU': bauList.filter(i => i.status === 'Return to BAU').length,
          'Duplicate': bauList.filter(i => i.status === 'Duplicate').length,
          'Invalid Issue': bauList.filter(i => i.status === 'Invalid Issue').length,
          'Post Hypercare': bauList.filter(i => i.status === 'Post Hypercare').length,
        }
      }
    };
  }, [incidents]);

  // Matrix Calculation: Warroom x Priority
  const matrix = useMemo(() => {
    const activeStatuses = ['New', 'Acknowledged', 'In Progress', 'ReOpen', 'Outage', 'Need more info'];
    const activeIncidents = incidents.filter(i => activeStatuses.includes(i.status));

    return lovs.warrooms.map(room => {
      const roomIncidents = activeIncidents.filter(i => i.warroom === room);
      return {
        name: room,
        p1: roomIncidents.filter(i => i.priority.includes('P1')).length,
        p2: roomIncidents.filter(i => i.priority.includes('P2')).length,
        p3: roomIncidents.filter(i => i.priority.includes('P3')).length,
        p4: roomIncidents.filter(i => i.priority.includes('P4')).length,
        total: roomIncidents.length
      };
    }).sort((a, b) => b.total - a.total); // Sort by busiest warroom
  }, [incidents, lovs.warrooms]);

  // Reusable Component for 2x2 Grid (now with click handlers)
  const PriorityMatrixCard = ({ title, icon: Icon, data, colorClass, statusGroup, specificStatus }: any) => {
    
    // Base nav params
    const baseParams: Record<string, string> = {};
    if (statusGroup) baseParams.statusGroup = statusGroup;
    if (specificStatus) baseParams.status = specificStatus;

    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-2">
            <Icon size={18} className={colorClass} />
            <span className="font-semibold text-gray-700">{title}</span>
          </div>
          <button 
            onClick={() => handleNav(baseParams)}
            className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
          >
            {data.total}
          </button>
        </div>
        <div className="p-4 grid grid-cols-2 gap-4 flex-1">
          {[
            { label: 'P1 Critical', count: data.p1, key: 'P1', bg: 'bg-red-50', text: 'text-red-700' },
            { label: 'P2 High', count: data.p2, key: 'P2', bg: 'bg-orange-50', text: 'text-orange-700' },
            { label: 'P3 Medium', count: data.p3, key: 'P3', bg: 'bg-yellow-50', text: 'text-yellow-700' },
            { label: 'P4 Low', count: data.p4, key: 'P4', bg: 'bg-blue-50', text: 'text-blue-700' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => handleNav({ ...baseParams, priority: item.key })}
              className={`${item.bg} rounded-lg p-3 flex flex-col items-center justify-center border border-transparent hover:border-gray-200 hover:scale-[1.02] transition-all cursor-pointer`}
            >
              <span className={`text-xs font-bold uppercase mb-1 opacity-80 ${item.text}`}>{item.label}</span>
              <span className={`text-xl font-bold ${item.text}`}>{item.count}</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Layout className="text-gray-400" size={28} />
        <h1 className="text-2xl font-bold text-gray-900">Executive Dashboard</h1>
      </div>
      
      {/* Consolidated Scorecards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        
        {/* 1. Active Incidents (2x2) */}
        <PriorityMatrixCard 
          title="Active Incidents" 
          icon={AlertOctagon} 
          data={metrics.active} 
          colorClass="text-blue-600" 
          statusGroup="active"
        />

        {/* 2. Resolved (Retest) (2x2) */}
        <PriorityMatrixCard 
          title="Resolved (Retest)" 
          icon={CheckCircle2} 
          data={metrics.resolved} 
          colorClass="text-green-600"
          specificStatus="Resolved"
        />

        {/* 3. Passed to BAU (List Status) */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
          <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div className="flex items-center gap-2">
              <Archive size={18} className="text-gray-500" />
              <span className="font-semibold text-gray-700">Passed to BAU</span>
            </div>
            <button 
              onClick={() => handleNav({ statusGroup: 'bau' })}
              className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
            >
              {metrics.bau.total}
            </button>
          </div>
          <div className="p-4 flex-1 flex flex-col justify-center space-y-3">
             {Object.entries(metrics.bau.breakdown).map(([status, count]) => (
               <button 
                 key={status} 
                 onClick={() => handleNav({ status: status })}
                 className="flex justify-between items-center text-sm border-b border-gray-50 last:border-0 pb-1 last:pb-0 group w-full hover:bg-gray-50 rounded px-1 transition-colors"
               >
                 <span className="text-gray-600 group-hover:text-blue-600 transition-colors">{status}</span>
                 <span className="font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded-full">{count as number}</span>
               </button>
             ))}
          </div>
        </div>

        {/* 4. Closed Incidents (2x2) */}
        <PriorityMatrixCard 
          title="Overall Closed" 
          icon={XCircle} 
          data={metrics.closed} 
          colorClass="text-gray-600"
          specificStatus="Closed"
        />
      </div>

      {/* Warroom Matrix */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <div className="flex items-center gap-2">
             <AlertTriangle size={18} className="text-orange-600" />
             <h2 className="font-semibold text-gray-900">Live Warroom Matrix</h2>
          </div>
          <span className="text-xs text-gray-500 uppercase font-medium tracking-wide bg-white px-3 py-1 rounded border border-gray-200">
             Active Tickets Only
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 w-1/3">Warroom</th>
                <th className="px-6 py-3 text-center text-red-700 bg-red-50/50 border-l border-r border-red-100">P1 Critical</th>
                <th className="px-6 py-3 text-center text-orange-700 bg-orange-50/50 border-r border-orange-100">P2 High</th>
                <th className="px-6 py-3 text-center text-yellow-700 bg-yellow-50/50 border-r border-yellow-100">P3 Medium</th>
                <th className="px-6 py-3 text-center text-blue-700 bg-blue-50/50 border-r border-blue-100">P4 Low</th>
                <th className="px-6 py-3 text-center font-bold">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {matrix.map((row) => (
                <tr key={row.name} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                    {row.name}
                    <button 
                      onClick={() => handleNav({ warroom: row.name, statusGroup: 'active' })}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-600 transition-all"
                    >
                      <ArrowUpRight size={14} />
                    </button>
                  </td>
                  
                  <td className={`p-0 text-center border-l border-r border-dashed border-gray-200 ${row.p1 > 0 ? 'bg-red-50' : ''}`}>
                    <button 
                       onClick={() => handleNav({ warroom: row.name, priority: 'P1', statusGroup: 'active' })}
                       className={`w-full h-full py-4 font-bold hover:bg-red-100 transition-colors ${row.p1 > 0 ? 'text-red-600' : 'text-gray-300'}`}
                    >
                       {row.p1}
                    </button>
                  </td>
                  
                  <td className={`p-0 text-center border-r border-dashed border-gray-200`}>
                    <button 
                       onClick={() => handleNav({ warroom: row.name, priority: 'P2', statusGroup: 'active' })}
                       className={`w-full h-full py-4 font-medium hover:bg-orange-100 transition-colors ${row.p2 > 0 ? 'text-orange-600' : 'text-gray-300'}`}
                    >
                       {row.p2}
                    </button>
                  </td>
                  
                  <td className={`p-0 text-center border-r border-dashed border-gray-200`}>
                    <button 
                       onClick={() => handleNav({ warroom: row.name, priority: 'P3', statusGroup: 'active' })}
                       className={`w-full h-full py-4 font-medium hover:bg-yellow-100 transition-colors ${row.p3 > 0 ? 'text-yellow-600' : 'text-gray-300'}`}
                    >
                       {row.p3}
                    </button>
                  </td>
                  
                  <td className={`p-0 text-center border-r border-dashed border-gray-200`}>
                    <button 
                       onClick={() => handleNav({ warroom: row.name, priority: 'P4', statusGroup: 'active' })}
                       className={`w-full h-full py-4 font-medium hover:bg-blue-100 transition-colors ${row.p4 > 0 ? 'text-blue-600' : 'text-gray-300'}`}
                    >
                       {row.p4}
                    </button>
                  </td>
                  
                  <td className="p-0 text-center font-bold text-gray-900">
                    <button 
                       onClick={() => handleNav({ warroom: row.name, statusGroup: 'active' })}
                       className="w-full h-full py-4 hover:bg-gray-100 transition-colors"
                    >
                      {row.total}
                    </button>
                  </td>
                </tr>
              ))}
              {matrix.length === 0 && (
                 <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500 italic">
                       No active incidents currently assigned to warrooms.
                    </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardScreen;
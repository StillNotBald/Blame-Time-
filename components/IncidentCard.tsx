import React, { useMemo } from 'react';
import { Incident } from '../types';
import { CheckCircle, Clock, AlertTriangle, AlertOctagon, Info, Tag, Layout, Target } from 'lucide-react';

interface IncidentCardProps {
  incident: Incident;
  onUpdateStatus: (id: string, newStatus: string) => void;
  allStatuses: string[];
}

const IncidentCard: React.FC<IncidentCardProps> = ({ incident, onUpdateStatus, allStatuses }) => {
  
  // Calculate SLA
  const slaStatus = useMemo(() => {
    if (incident.status === 'Resolved' || incident.status === 'Closed') return null;

    let slaHours = 24; // default P4
    if (incident.priority.includes('P1')) slaHours = 2;
    else if (incident.priority.includes('P2')) slaHours = 4;
    else if (incident.priority.includes('P3')) slaHours = 12;

    const startTime = new Date(incident.timestamp).getTime();
    const deadline = startTime + (slaHours * 60 * 60 * 1000);
    const now = Date.now();
    const timeLeft = deadline - now;
    
    const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

    const isBreached = timeLeft < 0;

    return {
      hours: slaHours,
      timeLeftString: isBreached 
        ? `Breached by ${Math.abs(hoursLeft)}h ${Math.abs(minutesLeft)}m`
        : `${hoursLeft}h ${minutesLeft}m remaining`,
      isBreached,
      isClose: !isBreached && hoursLeft < 1 // Warning if less than 1 hour
    };
  }, [incident.priority, incident.timestamp, incident.status]);


  const getPriorityBadge = (p: string) => {
    if (p.includes('P1')) return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-800 border border-red-200">P1 CRITICAL</span>;
    if (p.includes('P2')) return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200">P2 HIGH</span>;
    if (p.includes('P3')) return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-200">P3 MEDIUM</span>;
    return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">P4 LOW</span>;
  };

  const formattedTime = new Date(incident.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col gap-4">
      
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {getPriorityBadge(incident.priority)}
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
              {incident.status}
            </span>
             {slaStatus && (
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${slaStatus.isBreached ? 'bg-red-50 text-red-700 border-red-200' : slaStatus.isClose ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                <Clock size={10} className="mr-1" />
                {slaStatus.timeLeftString}
              </span>
            )}
            <span className="text-xs text-gray-400 font-mono ml-1">#{incident.id.slice(-6)}</span>
            <span className="text-xs text-gray-500">• {formattedTime}</span>
          </div>
          
          <h3 className="text-lg font-bold text-gray-900 leading-tight mb-2">{incident.summary}</h3>
          
          {/* Metadata Grid */}
          <div className="flex flex-wrap gap-y-2 gap-x-6 text-sm text-gray-600">
            <div className="flex items-center gap-1.5" title="Category">
               <Tag size={14} className="text-gray-400" />
               <span>{incident.category}</span>
            </div>
            <div className="flex items-center gap-1.5" title="Warroom">
               <Layout size={14} className="text-gray-400" />
               <span>Warroom: {incident.warroom}</span>
            </div>
            <div className="flex items-center gap-1.5" title="Impact">
               <Target size={14} className="text-gray-400" />
               <span>{incident.impactCategory} {incident.impactArea ? `(${incident.impactArea})` : ''}</span>
            </div>
          </div>
        </div>

        {/* Action Column */}
        <div className="flex flex-col items-end gap-2 min-w-[140px]">
           <select 
             className="text-xs border border-gray-300 rounded px-2 py-1 bg-white hover:border-blue-400 focus:border-blue-500 outline-none w-full cursor-pointer"
             value={incident.status}
             onChange={(e) => onUpdateStatus(incident.id, e.target.value)}
           >
             {allStatuses.map(s => (
               <option key={s} value={s}>{s}</option>
             ))}
           </select>
           
           {incident.status !== 'Resolved' && incident.status !== 'Closed' && (
              <button
                onClick={() => onUpdateStatus(incident.id, 'Resolved')}
                className="w-full flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 rounded border border-green-200 transition-colors"
              >
                <CheckCircle size={12} />
                Quick Resolve
              </button>
           )}
        </div>
      </div>

    </div>
  );
};

export default IncidentCard;

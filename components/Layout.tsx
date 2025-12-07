import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Activity, Download, Settings, ChevronDown, ChevronRight, Hash, User, Search } from 'lucide-react';
import { LOVData } from '../types';

interface LayoutProps {
  lovs: LOVData;
  onExport: () => void;
  onOpenSettings: () => void;
}

const Layout: React.FC<LayoutProps> = ({ lovs, onExport, onOpenSettings }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCmdCenterExpanded, setIsCmdCenterExpanded] = useState(true);

  // Auto-expand if we are in command-center
  useEffect(() => {
    if (location.pathname.includes('command-center')) {
      setIsCmdCenterExpanded(true);
    }
  }, [location.pathname]);

  const handleWarroomClick = (warroom: string) => {
    // Navigate with query param
    navigate(`/command-center?warroom=${encodeURIComponent(warroom)}`);
  };

  // Helper to check if a specific warroom is active via query param
  const isWarroomActive = (warroom: string) => {
    const params = new URLSearchParams(location.search);
    return location.pathname === '/command-center' && params.get('warroom') === warroom;
  };

  const isCmdCenterRootActive = location.pathname === '/command-center' && !location.search;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col z-10 flex-shrink-0">
        <div className="h-16 flex items-center gap-3 px-6 border-b border-gray-200">
           <div className="bg-gray-900 text-white p-1.5 rounded-lg">
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
           </div>
           <span className="font-bold text-gray-900 tracking-tight">IncidentCmd</span>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-6 overflow-y-auto custom-scrollbar">
          
          {/* Group 1: General */}
          <div className="space-y-1">
            <NavLink
              to="/"
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
              `}
            >
              <LayoutDashboard size={18} />
              Dashboard
            </NavLink>
          </div>

          {/* Group 2: Requestor Zone */}
          <div>
            <div className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Requestor Zone</div>
            <div className="space-y-1">
              <NavLink
                to="/requestor"
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
                `}
              >
                <PlusCircle size={18} />
                Broadcast Incident
              </NavLink>
              <NavLink
                to="/my-status"
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
                `}
              >
                <Search size={18} />
                My Ticket Status
              </NavLink>
            </div>
          </div>

          {/* Group 3: War Room / SME */}
          <div>
            <div className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">War Room / SME</div>
            <div className="space-y-1">
              <NavLink
                to="/sme-worklist"
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
                `}
              >
                <User size={18} />
                My Assignments
              </NavLink>

              {/* Command Center with Submenu */}
              <div>
                <div 
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors ${location.pathname.includes('command-center') ? 'text-blue-800 bg-blue-50/50' : 'text-gray-600 hover:bg-gray-100'}`}
                  onClick={() => {
                    if (location.pathname !== '/command-center') {
                       navigate('/command-center');
                    } else {
                       setIsCmdCenterExpanded(!isCmdCenterExpanded);
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Activity size={18} />
                    Command Center
                  </div>
                  {isCmdCenterExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </div>

                {/* Sub Menu */}
                {isCmdCenterExpanded && (
                  <div className="ml-9 mt-1 space-y-0.5 border-l-2 border-gray-100 pl-2">
                     <div 
                       onClick={() => navigate('/command-center')}
                       className={`px-3 py-2 text-xs font-medium rounded-md cursor-pointer ${isCmdCenterRootActive ? 'text-blue-700 bg-blue-50' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
                     >
                       All Incidents
                     </div>
                     
                     <div 
                       onClick={() => handleWarroomClick('Unassigned')}
                       className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md cursor-pointer ${isWarroomActive('Unassigned') ? 'text-blue-700 bg-blue-50' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
                     >
                       <Hash size={12} /> Unassigned
                     </div>

                     {lovs.warrooms.map(room => (
                       <div 
                         key={room}
                         onClick={() => handleWarroomClick(room)}
                         className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md cursor-pointer ${isWarroomActive(room) ? 'text-blue-700 bg-blue-50' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
                       >
                         <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                         {room}
                       </div>
                     ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-gray-200 space-y-2 mt-auto">
          <button 
            onClick={onExport}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Download size={18} />
            Export Data
          </button>
          <button 
            onClick={onOpenSettings}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Settings size={18} />
            Settings
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto bg-gray-50 relative">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
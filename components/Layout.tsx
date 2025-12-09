import React, { useState, useEffect, useMemo } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Activity, Download, Settings, ChevronDown, ChevronRight, ChevronLeft, Hash, User, Search, Shield, UserCircle, KanbanSquare } from 'lucide-react';
import { LOVData, Incident } from '../types';

interface LayoutProps {
  lovs: LOVData;
  incidents: Incident[];
  onExport: () => void;
  onOpenSettings: () => void;
  userRole: 'admin' | 'user';
  setUserRole: (role: 'admin' | 'user') => void;
}

const Layout: React.FC<LayoutProps> = ({ lovs, incidents, onExport, onOpenSettings, userRole, setUserRole }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCmdCenterExpanded, setIsCmdCenterExpanded] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Auto-expand if we are in command-center
  useEffect(() => {
    if (location.pathname.includes('command-center')) {
      setIsCmdCenterExpanded(true);
    }
  }, [location.pathname]);

  const handleWarroomClick = (warroom: string) => {
    navigate(`/command-center?warroom=${encodeURIComponent(warroom)}`);
  };

  const isWarroomActive = (warroom: string) => {
    const params = new URLSearchParams(location.search);
    return location.pathname === '/command-center' && params.get('warroom') === warroom;
  };

  const isUnassignedActive = location.pathname === '/command-center' && new URLSearchParams(location.search).get('warroom') === 'Unassigned';

  const activeIncidents = useMemo(() => incidents.filter(i => !['Resolved', 'Closed'].includes(i.status)), [incidents]);
  const unassignedCount = useMemo(() => activeIncidents.filter(i => i.warroom === 'Unassigned').length, [activeIncidents]);
  
  const getWarroomCount = (name: string) => {
    return activeIncidents.filter(i => i.warroom === name).length;
  };

  // Helper for Link Classes
  const linkClass = ({ isActive }: { isActive: boolean }) => `
    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative group
    ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
    ${isSidebarCollapsed ? 'justify-center' : ''}
  `;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${isSidebarCollapsed ? 'w-20' : 'w-64'} bg-white border-r border-gray-200 flex flex-col z-20 flex-shrink-0 transition-all duration-300 relative`}>
        
        {/* Toggle Button */}
        <button 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-8 bg-white border border-gray-200 rounded-full p-1 shadow-sm text-gray-500 hover:text-blue-600 z-50"
        >
          {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Brand Header */}
        <div className={`h-16 flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'justify-start px-6 gap-3'} border-b border-gray-200 overflow-hidden whitespace-nowrap`}>
           <div className={`p-1.5 rounded-lg shrink-0 ${userRole === 'admin' ? 'bg-gray-900 text-white' : 'bg-blue-600 text-white'}`}>
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
           </div>
           {!isSidebarCollapsed && (
             <div className="flex flex-col">
               <span className="font-bold text-gray-900 tracking-tight leading-tight">IncidentCmd</span>
               {userRole === 'user' && <span className="text-[10px] text-blue-600 font-bold uppercase">User Mode</span>}
             </div>
           )}
        </div>

        <nav className="flex-1 py-6 px-3 space-y-6 overflow-y-auto custom-scrollbar overflow-x-hidden">
          
          {userRole === 'admin' && (
            <div className="space-y-1">
              <NavLink to="/" className={linkClass} title={isSidebarCollapsed ? "Dashboard" : ""}>
                <LayoutDashboard size={20} className="shrink-0" />
                {!isSidebarCollapsed && <span>Dashboard</span>}
              </NavLink>
            </div>
          )}

          <div>
            {!isSidebarCollapsed && <div className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Requestor</div>}
            <div className="space-y-1">
              <NavLink to="/requestor" className={linkClass} title={isSidebarCollapsed ? "Register Ticket" : ""}>
                <PlusCircle size={20} className="shrink-0" />
                {!isSidebarCollapsed && <span>Register Ticket</span>}
              </NavLink>
              <NavLink to="/my-status" className={linkClass} title={isSidebarCollapsed ? "My Status" : ""}>
                <Search size={20} className="shrink-0" />
                {!isSidebarCollapsed && <span>My Status</span>}
              </NavLink>
            </div>
          </div>

          {userRole === 'admin' && (
            <div>
              {!isSidebarCollapsed && <div className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">War Room</div>}
              <div className="space-y-1">
                {/* Unassigned */}
                <div 
                   onClick={() => handleWarroomClick('Unassigned')}
                   className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors relative group ${isUnassignedActive ? 'bg-purple-50 text-purple-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'} ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}
                   title="Unassigned"
                 >
                   <div className="flex items-center gap-3">
                     <Hash size={20} className="shrink-0" />
                     {!isSidebarCollapsed && <span>Unassigned</span>}
                   </div>
                   {unassignedCount > 0 && (
                     <span className={`bg-red-100 text-red-700 text-xs font-bold px-1.5 py-0.5 rounded-full ${isSidebarCollapsed ? 'absolute -top-1 -right-1' : ''}`}>
                       {unassignedCount}
                     </span>
                   )}
                 </div>

                <NavLink to="/sme-worklist" className={linkClass} title={isSidebarCollapsed ? "My Assignments" : ""}>
                  <User size={20} className="shrink-0" />
                  {!isSidebarCollapsed && <span>Assignments</span>}
                </NavLink>

                {/* Kanban Board - NEW */}
                <NavLink to="/kanban" className={linkClass} title={isSidebarCollapsed ? "Kanban Board" : ""}>
                  <KanbanSquare size={20} className="shrink-0" />
                  {!isSidebarCollapsed && <span>Kanban Board</span>}
                </NavLink>

                {/* Command Center */}
                <div>
                  <div 
                    className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors ${location.pathname.includes('command-center') && !isUnassignedActive ? 'text-blue-800 bg-blue-50/50' : 'text-gray-600 hover:bg-gray-100'} ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}
                    onClick={() => {
                      if (location.pathname !== '/command-center' || location.search) {
                         navigate('/command-center');
                         setIsCmdCenterExpanded(true);
                      } else {
                         setIsCmdCenterExpanded(!isCmdCenterExpanded);
                      }
                    }}
                    title="Command Center"
                  >
                    <div className="flex items-center gap-3">
                      <Activity size={20} className="shrink-0" />
                      {!isSidebarCollapsed && <span>Command Ctr</span>}
                    </div>
                    {!isSidebarCollapsed && (
                      <div className="flex items-center gap-2">
                         {activeIncidents.length > 0 && <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">{activeIncidents.length}</span>}
                         {isCmdCenterExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </div>
                    )}
                  </div>

                  {/* Sub Menu */}
                  {isCmdCenterExpanded && !isSidebarCollapsed && (
                    <div className="ml-9 mt-1 space-y-0.5 border-l-2 border-gray-100 pl-2">
                       {lovs.warrooms.map(room => {
                         const count = getWarroomCount(room);
                         return (
                           <div 
                             key={room}
                             onClick={() => handleWarroomClick(room)}
                             className={`flex items-center justify-between px-3 py-2 text-xs font-medium rounded-md cursor-pointer ${isWarroomActive(room) ? 'text-blue-700 bg-blue-50' : 'text-gray-500 hover:text-gray-900 hover:text-gray-50'}`}
                           >
                             <div className="flex items-center gap-2 truncate">
                               <span className="w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0"></span>
                               <span className="truncate">{room}</span>
                             </div>
                             {count > 0 && (
                               <span className="text-[10px] font-semibold bg-gray-100 text-gray-600 px-1.5 rounded-full shrink-0">
                                 {count}
                               </span>
                             )}
                           </div>
                         );
                       })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 space-y-2 mt-auto">
          {userRole === 'admin' && (
            <>
              <button onClick={onExport} className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors ${isSidebarCollapsed ? 'justify-center' : ''}`} title="Export">
                <Download size={20} className="shrink-0"/>
                {!isSidebarCollapsed && <span>Export</span>}
              </button>
              <button onClick={onOpenSettings} className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors ${isSidebarCollapsed ? 'justify-center' : ''}`} title="Settings">
                <Settings size={20} className="shrink-0"/>
                {!isSidebarCollapsed && <span>Settings</span>}
              </button>
            </>
          )}

          <div className="pt-2 border-t border-gray-100">
             {!isSidebarCollapsed ? (
               <div className="flex items-center justify-between bg-gray-100 p-1 rounded-lg">
                  <button onClick={() => setUserRole('user')} className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-semibold rounded-md transition-all ${userRole === 'user' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                    <UserCircle size={14} /> User
                  </button>
                  <button onClick={() => setUserRole('admin')} className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-semibold rounded-md transition-all ${userRole === 'admin' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                    <Shield size={14} /> Admin
                  </button>
               </div>
             ) : (
               <button 
                 onClick={() => setUserRole(userRole === 'admin' ? 'user' : 'admin')}
                 className="w-full flex justify-center p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                 title={`Switch to ${userRole === 'admin' ? 'User' : 'Admin'}`}
               >
                 {userRole === 'admin' ? <Shield size={20}/> : <UserCircle size={20}/>}
               </button>
             )}
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-gray-50 relative">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
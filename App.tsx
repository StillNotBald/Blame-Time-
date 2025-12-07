import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Incident, LOVData } from './types';
import { getStoredIncidents, saveIncidents, getStoredLOVs, saveStoredLOVs, exportIncidentsToCSV, generateMockIncidents } from './services/storageService';
import Layout from './components/Layout';
import DashboardScreen from './components/DashboardScreen';
import RequestorScreen from './components/RequestorScreen';
import CommandCenterScreen from './components/CommandCenterScreen';
import SettingsModal from './components/SettingsModal';
import RequestorStatusScreen from './components/RequestorStatusScreen';
import SMEWorklistScreen from './components/SMEWorklistScreen';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

const App: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [lovs, setLovs] = useState<LOVData>(getStoredLOVs());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Toast State
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error'; visible: boolean }>({ msg: '', type: 'success', visible: false });

  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  }, []);

  // Load initial data
  useEffect(() => {
    const data = getStoredIncidents();
    setIncidents(data);
    setIsLoaded(true);
  }, []);

  // Persist incidents
  useEffect(() => {
    if (isLoaded) {
      saveIncidents(incidents);
    }
  }, [incidents, isLoaded]);

  const handleSaveLovs = (newLovs: LOVData) => {
    setLovs(newLovs);
    saveStoredLOVs(newLovs);
    showToast("Settings saved successfully");
  };

  const handleCreateIncident = useCallback((newIncident: Incident) => {
    setIncidents(prev => [newIncident, ...prev]);
    showToast("Incident created successfully");
  }, [showToast]);

  const handleUpdateIncident = useCallback((updated: Incident) => {
    setIncidents(prev => prev.map(i => i.id === updated.id ? updated : i));
    showToast("Incident updated");
  }, [showToast]);

  const handleDeleteIncident = useCallback((id: string) => {
    // Confirmation handled by UI component now
    setIncidents(prev => prev.filter(i => i.id !== id));
    showToast("Incident deleted permanently");
  }, [showToast]);

  const handleClearAllData = useCallback(() => {
    // Confirmation handled by UI component now
    setIncidents([]);
    localStorage.removeItem('incident_command_data_v3');
    showToast("All data cleared successfully");
    // Optionally reload to ensure clean state, but state update handles UI
  }, [showToast]);

  const handleSeedData = useCallback(() => {
    try {
      const mockData = generateMockIncidents(200);
      setIncidents(prev => [...mockData, ...prev]);
      showToast("Success! 200 mock incidents generated");
    } catch (e) {
      console.error("Seed failed:", e);
      showToast("Failed to generate data", 'error');
    }
  }, [showToast]);

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={
          <Layout 
            lovs={lovs}
            onExport={() => exportIncidentsToCSV(incidents)} 
            onOpenSettings={() => setIsSettingsOpen(true)} 
          />
        }>
          <Route index element={<DashboardScreen incidents={incidents} lovs={lovs} />} />
          <Route path="requestor" element={<RequestorScreen lovs={lovs} onSubmit={handleCreateIncident} showToast={showToast} />} />
          <Route path="my-status" element={<RequestorStatusScreen incidents={incidents} onUpdateIncident={handleUpdateIncident} />} />
          
          <Route path="command-center" element={
            <CommandCenterScreen 
              incidents={incidents} 
              lovs={lovs} 
              onUpdateIncident={handleUpdateIncident}
              onDeleteIncident={handleDeleteIncident}
            />
          } />
          <Route path="sme-worklist" element={
            <SMEWorklistScreen 
              incidents={incidents} 
              lovs={lovs} 
              onUpdateIncident={handleUpdateIncident}
            />
          } />
        </Route>
      </Routes>
      
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        lovs={lovs}
        onSave={handleSaveLovs}
        onClearData={handleClearAllData}
        onSeedData={handleSeedData}
      />

      {/* Global Toast Notification */}
      <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 ${toast.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <div className={`flex items-center gap-3 px-6 py-3 rounded-full shadow-lg font-medium text-white ${toast.type === 'success' ? 'bg-gray-900' : 'bg-red-600'}`}>
           {toast.type === 'success' ? <CheckCircle2 size={18} className="text-green-400" /> : <AlertCircle size={18} />}
           {toast.msg}
           <button onClick={() => setToast(prev => ({ ...prev, visible: false }))} className="ml-2 opacity-50 hover:opacity-100"><X size={14}/></button>
        </div>
      </div>
    </HashRouter>
  );
};

export default App;
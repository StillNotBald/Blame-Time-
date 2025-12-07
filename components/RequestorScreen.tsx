import React, { useState, useRef } from 'react';
import { LOVData, Incident, IncidentUpdate } from '../types';
import { Send, Paperclip, AlertCircle, CheckCircle2 } from 'lucide-react';

interface RequestorScreenProps {
  lovs: LOVData;
  onSubmit: (incident: Incident) => void;
  showToast: (msg: string, type: 'success' | 'error') => void;
}

const RequestorScreen: React.FC<RequestorScreenProps> = ({ lovs, onSubmit, showToast }) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [form, setForm] = useState({
    requestorName: '',
    requestorEmail: '',
    channelType: 'Portal',
    storeName: '',
    storeId: '',
    region: '',
    affectedUserId: '',
    category: '',
    summary: '',
    description: '',
    attachment: '' as string
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1000000) { // 1MB limit for local storage safety
        showToast("File is too large for this prototype (Max 1MB).", 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(prev => ({ ...prev, attachment: reader.result as string }));
        showToast("Image attached successfully", 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.summary || !form.requestorName) {
      showToast("Please fill in the required fields (Name and Summary).", 'error');
      return;
    }

    const timestamp = new Date().toISOString();
    const newIncident: Incident = {
      id: `INC-${Date.now().toString().slice(-6)}`,
      timestamp,
      updatedAt: timestamp,
      status: 'New',
      priority: 'P4: Low', // Default until triaged
      warroom: 'Unassigned',
      impactCategory: 'Operation', // Default
      impactArea: '',
      
      // Form Fields
      ...form,
      
      // Empty / Defaults
      sme: '',
      fixType: '',
      rootCause: '',
      updates: [{
        timestamp,
        user: 'System',
        message: 'Incident created via Portal',
        type: 'creation'
      }]
    };

    onSubmit(newIncident);
    setIsSubmitted(true);
    
    // Reset after delay or let user navigate away
    setTimeout(() => {
        setIsSubmitted(false);
        setForm({
            requestorName: '', requestorEmail: '', channelType: 'Portal',
            storeName: '', storeId: '', region: '', affectedUserId: '',
            category: '', summary: '', description: '', attachment: ''
        });
    }, 3000);
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Broadcast Sent Successfully</h2>
        <p className="text-gray-500 max-w-md">The Warroom has been notified. You can submit another issue shortly.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Broadcast Incident</h1>
        <p className="text-gray-500 mt-1">Please provide as much detail as possible to help us triage the issue.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* Section 1: Requestor Info */}
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
            <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
            Contact Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Your Name *</label>
              <input name="requestorName" value={form.requestorName} onChange={handleChange} className="w-full px-3 py-2 border rounded-md text-sm" placeholder="John Doe" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Email</label>
              <input name="requestorEmail" value={form.requestorEmail} onChange={handleChange} className="w-full px-3 py-2 border rounded-md text-sm" placeholder="john@example.com" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Channel Type</label>
              <select name="channelType" value={form.channelType} onChange={handleChange} className="w-full px-3 py-2 border rounded-md text-sm bg-white">
                {lovs.channels.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Location/Context */}
        <div className="p-6 border-b border-gray-100">
           <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
            <div className="w-1 h-4 bg-purple-500 rounded-full"></div>
            Location & Context
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Store Name</label>
              <input name="storeName" value={form.storeName} onChange={handleChange} className="w-full px-3 py-2 border rounded-md text-sm" placeholder="Downtown Flagship" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Store ID</label>
              <input name="storeId" value={form.storeId} onChange={handleChange} className="w-full px-3 py-2 border rounded-md text-sm" placeholder="ST-1023" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Region</label>
              <select name="region" value={form.region} onChange={handleChange} className="w-full px-3 py-2 border rounded-md text-sm bg-white">
                <option value="">Select Region</option>
                {lovs.regions.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
               <label className="block text-xs font-semibold text-gray-500 mb-1">Affected User ID (if applicable)</label>
              <input name="affectedUserId" value={form.affectedUserId} onChange={handleChange} className="w-full px-3 py-2 border rounded-md text-sm" placeholder="EMP-555" />
            </div>
          </div>
        </div>

        {/* Section 3: Incident Details */}
        <div className="p-6">
           <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
            <div className="w-1 h-4 bg-red-500 rounded-full"></div>
            Issue Details
          </h3>
          
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Category</label>
            <select name="category" value={form.category} onChange={handleChange} className="w-full px-3 py-2 border rounded-md text-sm bg-white">
               <option value="">Select Category...</option>
               {lovs.categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Issue Summary *</label>
            <input name="summary" value={form.summary} onChange={handleChange} className="w-full px-3 py-2 border rounded-md text-sm font-medium" placeholder="e.g. POS Terminal Freezing on Checkout" required />
          </div>

          <div className="mb-6">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Detailed Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={5} className="w-full px-3 py-2 border rounded-md text-sm" placeholder="Describe the steps to reproduce, error messages, etc."></textarea>
          </div>

          <div className="mb-6">
             <label className="block text-xs font-semibold text-gray-500 mb-2">Attachments (Screenshot/Image)</label>
             <div className="flex items-center gap-4">
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  <Paperclip size={16} />
                  {form.attachment ? 'Change File' : 'Upload Image'}
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileChange}
                />
                {form.attachment && <span className="text-xs text-green-600 font-medium">Image attached</span>}
             </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg flex gap-3 mb-6">
            <AlertCircle className="text-blue-600 shrink-0" size={20} />
            <p className="text-xs text-blue-800 leading-relaxed">
              <strong>Note:</strong> You can submit this form with partial information. The Warroom team will categorize and prioritize it shortly.
            </p>
          </div>

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow transition-all active:scale-[0.99] flex justify-center items-center gap-2">
            <Send size={18} />
            BROADCAST INCIDENT
          </button>
        </div>
      </form>
    </div>
  );
};

export default RequestorScreen;
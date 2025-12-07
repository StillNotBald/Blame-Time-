import React, { useState, useMemo } from 'react';
import { Incident, IncidentUpdate } from '../types';
import { Search, Clock, MessageSquare, ChevronRight, CheckCircle2, AlertCircle, Send } from 'lucide-react';

interface RequestorStatusScreenProps {
  incidents: Incident[];
  onUpdateIncident: (incident: Incident) => void;
}

const RequestorStatusScreen: React.FC<RequestorStatusScreenProps> = ({ incidents, onUpdateIncident }) => {
  const [email, setEmail] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Incident | null>(null);
  const [newComment, setNewComment] = useState('');

  const myTickets = useMemo(() => {
    if (!email) return [];
    return incidents.filter(i => 
      i.requestorEmail.toLowerCase().includes(email.toLowerCase()) || 
      i.requestorName.toLowerCase().includes(email.toLowerCase())
    ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [incidents, email]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    setSelectedTicket(null);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !newComment.trim()) return;

    const updatedIncident: Incident = {
      ...selectedTicket,
      updatedAt: new Date().toISOString(),
      updates: [
        ...selectedTicket.updates,
        {
          timestamp: new Date().toISOString(),
          user: 'Requestor',
          type: 'comment',
          message: newComment
        }
      ]
    };

    onUpdateIncident(updatedIncident);
    setSelectedTicket(updatedIncident); // Update local view
    setNewComment('');
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Ticket Status</h1>
        <p className="text-gray-500 mt-1">Track the progress of your requests and communicate with the War Room.</p>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
        <form onSubmit={handleSearch} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Find your tickets
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your Email or Name..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none text-gray-900"
              />
            </div>
          </div>
          <button 
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            Track Status
          </button>
        </form>
      </div>

      {/* Results Area */}
      {hasSearched && (
        <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
          
          {/* List */}
          <div className="lg:w-1/3 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <span className="font-semibold text-gray-700">Found {myTickets.length} Tickets</span>
            </div>
            <div className="overflow-y-auto flex-1 custom-scrollbar">
              {myTickets.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <AlertCircle size={32} className="mx-auto mb-2 text-gray-300" />
                  <p>No tickets found for "{email}"</p>
                </div>
              ) : (
                myTickets.map(ticket => (
                  <div 
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${selectedTicket?.id === ticket.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-mono text-gray-500">#{ticket.id}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${ticket.status === 'Resolved' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {ticket.status}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-1">{ticket.summary}</h4>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(ticket.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Details */}
          <div className="lg:w-2/3 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
            {!selectedTicket ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
                <Search size={48} className="mb-4 opacity-20" />
                <p>Select a ticket to view details</p>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center gap-3 mb-2">
                     <h2 className="text-xl font-bold text-gray-900">{selectedTicket.summary}</h2>
                     <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${selectedTicket.status === 'Resolved' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                       {selectedTicket.status}
                     </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><span className="font-medium text-gray-500 w-24 inline-block">Ticket ID:</span> {selectedTicket.id}</p>
                    <p><span className="font-medium text-gray-500 w-24 inline-block">Category:</span> {selectedTicket.category}</p>
                    <p><span className="font-medium text-gray-500 w-24 inline-block">Created:</span> {new Date(selectedTicket.timestamp).toLocaleString()}</p>
                  </div>
                </div>

                {/* Timeline / Updates */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50 custom-scrollbar">
                   <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                     <MessageSquare size={16} /> Updates & Comments
                   </h3>
                   <div className="space-y-4">
                     {selectedTicket.updates.map((update, idx) => (
                       <div key={idx} className={`flex gap-3 ${update.user === 'Requestor' ? 'flex-row-reverse' : ''}`}>
                         <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${update.user === 'Requestor' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'}`}>
                           {update.user.charAt(0)}
                         </div>
                         <div className={`max-w-[80%] rounded-lg p-3 text-sm ${update.user === 'Requestor' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-800'}`}>
                           <p>{update.message}</p>
                           <div className={`text-xs mt-1 ${update.user === 'Requestor' ? 'text-blue-200' : 'text-gray-400'}`}>
                             {new Date(update.timestamp).toLocaleString()} • {update.user}
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                </div>

                {/* Comment Input */}
                <div className="p-4 bg-white border-t border-gray-200">
                   {selectedTicket.status === 'Resolved' || selectedTicket.status === 'Closed' ? (
                     <div className="bg-green-50 text-green-800 p-3 rounded text-sm text-center font-medium">
                       This ticket is {selectedTicket.status}. Replies are disabled.
                     </div>
                   ) : (
                     <form onSubmit={handleAddComment} className="flex gap-2">
                       <input
                         type="text"
                         value={newComment}
                         onChange={(e) => setNewComment(e.target.value)}
                         placeholder="Type your reply here..."
                         className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                       />
                       <button 
                         type="submit"
                         disabled={!newComment.trim()}
                         className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                       >
                         <Send size={18} />
                       </button>
                     </form>
                   )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestorStatusScreen;
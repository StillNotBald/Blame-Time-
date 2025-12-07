export interface IncidentUpdate {
  timestamp: string;
  user: string; // 'System' | 'Requestor' | 'Warroom'
  message: string;
  type: 'status_change' | 'comment' | 'assignment' | 'creation';
}

export interface Incident {
  id: string;
  // Core Classification
  category: string;
  priority: string;
  status: string;
  warroom: string;
  impactCategory: string;
  impactArea?: string;
  
  // Requestor / Store Info
  requestorName: string;
  requestorEmail: string;
  channelType: string;
  storeName: string;
  storeId: string;
  region: string;
  affectedUserId: string;

  // Details
  summary: string;
  description: string; // Open text
  attachment?: string; // Base64 string for demo purposes
  
  // Resolution / Warroom Info
  sme: string;
  fixType: string;
  rootCause: string;
  
  // Metadata
  timestamp: string; // ISO String (Creation)
  updatedAt: string;
  resolvedAt?: string; // ISO String
  
  // Audit Trail
  updates: IncidentUpdate[];
}

export interface LOVData {
  categories: string[];
  priorities: string[];
  statuses: string[];
  warrooms: string[];
  impactCategories: string[];
  channels: string[];
  regions: string[];
}

export interface IncidentFilters {
  search: string;
  category: string;
  priority: string;
  status: string;
  warroom: string;
  impactCategory: string;
  // New: Allows filtering by a group of statuses (Active vs BAU etc)
  statusGroup?: 'active' | 'bau' | 'resolved' | 'closed'; 
}
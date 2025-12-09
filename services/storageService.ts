import { Incident, LOVData } from '../types';

const STORAGE_KEY_INCIDENTS = 'incident_command_data_v3';
const STORAGE_KEY_LOVS = 'incident_command_lovs_v3';

const DEFAULT_LOVS: LOVData = {
  categories: [
    'Login', 'Onboarding', 'Order Management', 'Inventory Management', 
    'SFA', 'Reporting/Batch', 'Sell Through', 'Infra / 3PP', 
    'Migration', 'Sell In', 'Activation', 'Channel', 'Requirement Gap'
  ],
  priorities: [
    'P1: Critical', 'P2: High', 'P3: Medium', 'P4: Low'
  ],
  statuses: [
    'New', 'Acknowledged', 'In Progress', 'Resolved', 'Closed', 
    'ReOpen', 'Return to BAU', 'Outage', 'Duplicate', 
    'Invalid Issue', 'Post Hypercare', 'Need more info'
  ],
  warrooms: [
    'Onboarding', 'Order Management', 'SFA', 'Migration', 
    'Infra', 'Reporting/Batch', '3PPs/Integration'
  ],
  impactCategories: [
    'Customer', 'Revenue', 'Operation', 'Finance', 'Batch'
  ],
  channels: [
    'Email', 'Phone', 'Slack', 'Portal', 'Automated Alert'
  ],
  regions: [
    'North America', 'EMEA', 'APAC', 'LATAM'
  ],
  kanbanColumns: [
    { 
      id: 'col-new', 
      title: 'New / Triage', 
      statuses: ['New', 'ReOpen', 'Need more info', 'Outage'] 
    },
    { 
      id: 'col-assigned', 
      title: 'Assigned', 
      statuses: ['Acknowledged'] 
    },
    { 
      id: 'col-progress', 
      title: 'In Progress', 
      statuses: ['In Progress'] 
    },
    { 
      id: 'col-done', 
      title: 'Done', 
      statuses: ['Resolved', 'Closed', 'Return to BAU', 'Duplicate', 'Invalid Issue', 'Post Hypercare'] 
    }
  ]
};

export const getStoredIncidents = (): Incident[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_INCIDENTS);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to parse incidents from local storage", error);
    return [];
  }
};

export const saveIncidents = (incidents: Incident[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY_INCIDENTS, JSON.stringify(incidents));
  } catch (error) {
    console.error("Failed to save incidents to local storage", error);
    // Alert removed for sandbox compatibility
  }
};

export const getStoredLOVs = (): LOVData => {
  try {
    const storedStr = localStorage.getItem(STORAGE_KEY_LOVS);
    const stored = storedStr ? JSON.parse(storedStr) : {};
    
    // Merge stored values with defaults to ensure new keys exist
    // Specifically handle kanbanColumns if missing in old data
    const merged = { ...DEFAULT_LOVS, ...stored };
    if (!merged.kanbanColumns || merged.kanbanColumns.length === 0) {
      merged.kanbanColumns = DEFAULT_LOVS.kanbanColumns;
    }
    return merged;
  } catch (error) {
    return DEFAULT_LOVS;
  }
};

export const saveStoredLOVs = (lovs: LOVData): void => {
  try {
    localStorage.setItem(STORAGE_KEY_LOVS, JSON.stringify(lovs));
  } catch (error) {
    console.error("Failed to save LOVs", error);
  }
};

export const exportIncidentsToCSV = (incidents: Incident[]) => {
  if (incidents.length === 0) return;

  const headers = [
    'ID', 'Timestamp', 'Status', 'Priority', 'Warroom', 'Category', 
    'Summary', 'Requestor Name', 'Store Name', 'Region', 'SME', 'Resolved At'
  ];

  const rows = incidents.map(inc => [
    inc.id,
    inc.timestamp,
    inc.status,
    inc.priority,
    inc.warroom,
    inc.category,
    `"${inc.summary.replace(/"/g, '""')}"`,
    inc.requestorName,
    inc.storeName,
    inc.region,
    inc.sme,
    inc.resolvedAt || ''
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(r => r.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `incident_export_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Seed Generator
export const generateMockIncidents = (count: number): Incident[] => {
  const lovs = getStoredLOVs();
  const incidents: Incident[] = [];
  
  // Safe random picker
  const rand = <T>(arr: T[] | undefined): T => {
    if (!arr || arr.length === 0) return 'Unknown' as unknown as T;
    return arr[Math.floor(Math.random() * arr.length)];
  };
  
  const summaries = [
    "Login failure for multiple users",
    "Slow dashboard loading times",
    "Inventory sync mismatch",
    "POS Terminal frozen",
    "Payment gateway timeout",
    "Order status not updating",
    "Report generation failed",
    "VPN connection unstable",
    "Data migration stuck at 90%",
    "User permission denied error"
  ];
  
  const names = ["Alice Johnson", "Bob Smith", "Charlie Brown", "Diana Prince", "Evan Wright"];
  const stores = ["Flagship NYC", "Mall of America", "Downtown LA", "London Oxford St", "Online Store"];
  const smes = ["Tech Support A", "Network Team", "Database Admin", "App Dev Lead", ""];

  const DAY_MS = 86400000;
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    // Weighted Priority
    const randVal = Math.random();
    let priority = 'P4: Low';
    if (randVal < 0.05) priority = 'P1: Critical';
    else if (randVal < 0.20) priority = 'P2: High';
    else if (randVal < 0.50) priority = 'P3: Medium';

    const timeOffset = Math.floor(Math.random() * 30 * DAY_MS);
    const creationTime = new Date(now - timeOffset).toISOString();
    
    let status = rand(lovs.statuses);
    let resolvedAt: string | undefined = undefined;
    
    if (status === 'Resolved' || status === 'Closed') {
       resolvedAt = new Date(new Date(creationTime).getTime() + (Math.random() * 48 * 3600000)).toISOString();
    }

    const warroom = rand(lovs.warrooms);
    const region = rand(lovs.regions);
    const summary = `${rand(summaries)} - ${region}`;

    incidents.push({
      id: `INC-${(100000 + i).toString()}`,
      category: rand(lovs.categories),
      priority,
      status,
      warroom,
      impactCategory: rand(lovs.impactCategories),
      impactArea: `Zone ${Math.floor(Math.random() * 10)}`,
      requestorName: rand(names),
      requestorEmail: `${rand(names).split(' ')[0].toLowerCase()}@example.com`,
      channelType: rand(lovs.channels),
      storeName: rand(stores),
      storeId: `ST-${Math.floor(Math.random() * 500)}`,
      region,
      affectedUserId: `EMP-${Math.floor(Math.random() * 9000)}`,
      summary,
      description: `Automated mock incident generated for testing. Issue observed in ${warroom} domain.`,
      sme: Math.random() > 0.3 ? rand(smes) : '',
      fixType: '',
      rootCause: '',
      timestamp: creationTime,
      updatedAt: creationTime,
      resolvedAt,
      updates: [
        {
          timestamp: creationTime,
          user: 'System',
          message: 'Incident created via Mock Seed',
          type: 'creation'
        }
      ]
    });
  }
  
  return incidents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};
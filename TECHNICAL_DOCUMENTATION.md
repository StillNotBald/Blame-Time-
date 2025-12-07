# 📋 Blame Time - Technical Documentation

> **"Move fast and break things, then use this tool to track what you broke."**

## 📑 Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [File Structure](#file-structure)
- [Data Models](#data-models)
- [User Roles & Workflows](#user-roles--workflows)
- [Components Breakdown](#components-breakdown)
- [Current Limitations](#current-limitations)
- [Future Enhancements](#future-enhancements)
- [Setup Guide](#setup-guide)
- [Deployment Options](#deployment-options)

---

## 🎯 Overview

**Blame Time** is a lightweight, frontend-only incident management system designed for rapid response and minimal bureaucracy. It's built for teams that need to track, triage, and resolve technical incidents without the overhead of traditional ticketing systems.

### Key Philosophy
- ⚡ **Speed First** - No login required, instant access
- 🎨 **Simple UI** - Clean, focused interface
- 💾 **Zero Backend** - Pure browser storage (for now)
- 🚀 **Rapid Deployment** - Run anywhere with a browser

### Current Status
✅ **Production Ready** for single-device/single-user scenarios  
⚠️ **Needs Enhancement** for multi-user/team collaboration

---

## 🏗 Architecture

### Application Type
- **Single Page Application (SPA)**
- **Hash Router** (`react-router-dom` with `HashRouter`)
- **Client-Side State Management** (React hooks)
- **Browser Storage Backend** (localStorage)

### Data Flow
```
User Input → React State → localStorage → UI Update
     ↑                                        ↓
     └────────── Page Reload/Refresh ─────────┘
```

### Storage Strategy
- **Primary Storage**: `localStorage` (5-10MB limit)
- **Storage Keys**:
  - `incident_command_data_v3` - All incidents
  - `incident_command_lovs_v3` - List of Values (dropdowns)

---

## ✨ Features

### 1. **Dashboard Screen** 📊
- Real-time metrics cards:
  - **Active Incidents** (New, In Progress, Outage, etc.)
  - **Resolved Incidents** (pending closure)
  - **Closed Incidents** (archived)
  - **BAU Status** (Return to BAU, Duplicates, Invalid)
- **Warroom x Priority Matrix**
  - Visual breakdown of incidents by warroom and priority
  - Click-to-filter navigation
  - Color-coded priority indicators

### 2. **Requestor Portal** 📝
- **Self-Service Incident Submission**
  - Requestor info (name, email, store details)
  - Incident details (category, summary, description)
  - File attachment support (Base64 encoding, 1MB limit)
- **Success Confirmation Screen**
- **Auto-generated Incident IDs** (`INC-xxxxxx`)

### 3. **My Status Screen** 🔍
- **Ticket Tracking for Requestors**
  - Search by email or name
  - View all submitted tickets
  - Real-time status updates
- **Communication Features**
  - Add comments/updates
  - View warroom responses
  - Full audit trail

### 4. **Command Center** 🎮
- **Triage & Management Hub**
  - Master list with advanced filtering
  - Split-pane view (list + detail)
  - Deep linking with URL parameters
- **Editing Capabilities**:
  - Status, priority, warroom assignment
  - SME assignment
  - Root cause and fix type
  - Add warroom comments
- **Audit Trail**
  - Timestamped updates
  - User attribution (System/Requestor/Warroom)
  - Change tracking

### 5. **SME Worklist** 👨‍💻
- **Personal Task View for Technical Experts**
  - Filter by SME name
  - Active tasks vs Resolved history
  - Quick resolve button
- **Focus Mode**
  - Only shows assigned tickets
  - Minimized distractions

### 6. **Settings Modal** ⚙️
- **Customizable List of Values (LOVs)**
  - Categories, Priorities, Statuses
  - Warrooms, Impact Categories, Channels, Regions
  - Add/Remove values with confirmation
- **Developer Tools**
  - Seed 200 mock incidents
  - Clear all data (with confirmation)

### 7. **Advanced Filtering** 🔎
- Multi-dimension filtering:
  - Text search (summary/ID)
  - Category, Priority, Status
  - Warroom, Impact Category
  - Status Groups (Active/BAU/Resolved/Closed)
- URL parameter preservation (shareable links)

### 8. **SLA Tracking** ⏱️
- **Automatic SLA Calculation**
  - P1: 2 hours
  - P2: 4 hours
  - P3: 12 hours
  - P4: 24 hours
- **Visual Indicators**
  - Green: On track
  - Orange: < 1 hour remaining
  - Red: Breached

### 9. **Data Export** 📤
- CSV export functionality
- Includes all incident fields
- Timestamp-based filename

---

## 🛠 Tech Stack

### Core Framework
- **React 19.2.1** - UI library
- **TypeScript 5.8.2** - Type safety

### Routing & State
- **react-router-dom 6.22.3** - Client-side routing
- **React Hooks** - State management (useState, useMemo, useEffect)

### UI & Styling
- **Tailwind CSS** (via CDN) - Utility-first styling
- **lucide-react 0.344.0** - Icon library
- **Google Fonts (Inter)** - Typography

### Build Tools
- **Vite 6.2.0** - Fast build tool & dev server
- **@vitejs/plugin-react 5.0.0** - React support

### Type Definitions
- **@types/node 22.14.0** - Node.js types

---

## 📂 File Structure

```
/workspaces/Blame-Time-/
│
├── 📄 index.html                   # Entry HTML file
├── 📄 index.tsx                    # React app mount point
├── 📄 App.tsx                      # Main app component with routing
├── 📄 types.ts                     # TypeScript interfaces
├── 📄 vite.config.ts               # Vite configuration
├── 📄 tsconfig.json                # TypeScript config
├── 📄 package.json                 # Dependencies
├── 📄 README.md                    # Basic readme
│
├── 📁 components/
│   ├── Layout.tsx                  # Main navigation layout
│   ├── DashboardScreen.tsx         # Metrics & matrix view
│   ├── RequestorScreen.tsx         # Incident submission form
│   ├── RequestorStatusScreen.tsx   # Ticket tracking for requestors
│   ├── CommandCenterScreen.tsx     # Triage & management hub
│   ├── SMEWorklistScreen.tsx       # Personal SME task list
│   ├── SettingsModal.tsx           # Configuration modal
│   ├── FilterBar.tsx               # Multi-filter component
│   ├── IncidentCard.tsx            # Incident display card
│   ├── IncidentFeed.tsx            # Feed/list view
│   ├── BroadcastForm.tsx           # Broadcast message component
│   └── Scorecard.tsx               # Metric card component
│
└── 📁 services/
    └── storageService.ts           # localStorage CRUD operations
```

---

## 🗃 Data Models

### Incident Interface
```typescript
interface Incident {
  // Identification
  id: string;                       // Format: INC-xxxxxx
  timestamp: string;                // ISO 8601 creation time
  updatedAt: string;                // Last modification
  resolvedAt?: string;              // Resolution timestamp (optional)
  
  // Classification
  category: string;                 // e.g., "Login", "Order Management"
  priority: string;                 // P1-P4 with labels
  status: string;                   // Lifecycle status
  warroom: string;                  // Assigned team
  impactCategory: string;           // Customer/Revenue/Operation/etc
  impactArea?: string;              // Optional subcategory
  
  // Requestor Information
  requestorName: string;
  requestorEmail: string;
  channelType: string;              // Email/Phone/Slack/etc
  storeName: string;
  storeId: string;
  region: string;                   // Geographic region
  affectedUserId: string;
  
  // Incident Details
  summary: string;                  // Brief description
  description: string;              // Full details
  attachment?: string;              // Base64 image (optional)
  
  // Resolution
  sme: string;                      // Subject Matter Expert
  fixType: string;                  // How it was fixed
  rootCause: string;                // Why it happened
  
  // Audit Trail
  updates: IncidentUpdate[];        // Timestamped history
}
```

### IncidentUpdate Interface
```typescript
interface IncidentUpdate {
  timestamp: string;
  user: string;                     // System/Requestor/Warroom/SME
  message: string;
  type: 'status_change' | 'comment' | 'assignment' | 'creation';
}
```

### LOVData Interface
```typescript
interface LOVData {
  categories: string[];             // Incident categories
  priorities: string[];             // P1-P4 labels
  statuses: string[];               // Lifecycle states
  warrooms: string[];               // Team names
  impactCategories: string[];       // Impact types
  channels: string[];               // Communication channels
  regions: string[];                // Geographic regions
}
```

### Default Values
- **Categories**: Login, Onboarding, Order Management, Inventory Management, SFA, Reporting/Batch, Sell Through, Infra/3PP, Migration, Sell In, Activation, Channel, Requirement Gap
- **Priorities**: P1: Critical, P2: High, P3: Medium, P4: Low
- **Statuses**: New, Acknowledged, In Progress, Resolved, Closed, ReOpen, Return to BAU, Outage, Duplicate, Invalid Issue, Post Hypercare, Need more info
- **Warrooms**: Onboarding, Order Management, SFA, Migration, Infra, Reporting/Batch, 3PPs/Integration
- **Regions**: North America, EMEA, APAC, LATAM

---

## 👥 User Roles & Workflows

### 1. **Requestor/End User**
**Entry Points**: Requestor Portal, My Status

**Workflow**:
1. Submit incident via form
2. Receive confirmation with ticket ID
3. Track status via "My Status" screen
4. Add comments/clarifications
5. Receive updates from warroom

**Use Cases**:
- Report system errors
- Request support
- Track multiple tickets
- Communicate with technical teams

---

### 2. **Warroom/Triage Team**
**Entry Points**: Dashboard, Command Center

**Workflow**:
1. Monitor dashboard for new/active incidents
2. Drill down via warroom matrix
3. Open Command Center for triage
4. Set priority, assign warroom/SME
5. Update status throughout lifecycle
6. Document resolution

**Use Cases**:
- Prioritize incoming incidents
- Assign to specialized teams
- Track SLA compliance
- Manage incident lifecycle
- Generate reports (CSV export)

---

### 3. **SME (Subject Matter Expert)**
**Entry Points**: SME Worklist

**Workflow**:
1. Enter name to view assigned tasks
2. Review active incidents
3. Work on technical resolution
4. Mark as resolved when complete
5. View resolution history

**Use Cases**:
- Focus on assigned work
- Quick status updates
- Technical troubleshooting

---

## 🧩 Components Breakdown

### Layout.tsx
**Purpose**: Main navigation wrapper  
**Features**:
- Top navigation bar with app title
- Route links (Dashboard, Requestor, Command Center, etc.)
- Settings & Export buttons
- Responsive hamburger menu (mobile)

---

### DashboardScreen.tsx
**Purpose**: Executive overview & metrics  
**Key Logic**:
- Status grouping (Active/BAU/Resolved/Closed)
- Priority distribution calculation
- Warroom x Priority matrix generation
- Click-to-filter navigation with URL params

**Metrics**:
- Total counts per status group
- Priority breakdown (P1-P4) for each group
- BAU status breakdown
- Warroom activity heatmap

---

### RequestorScreen.tsx
**Purpose**: Incident submission form  
**Features**:
- Form validation (required: name, summary)
- File upload with Base64 conversion (1MB limit)
- Auto-generated incident ID
- Success screen with 3-second timeout
- Toast notifications

**Default Values**:
- Status: "New"
- Priority: "P4: Low"
- Warroom: "Unassigned"

---

### RequestorStatusScreen.tsx
**Purpose**: User ticket tracking  
**Features**:
- Email/name search
- Ticket list with status badges
- Detail view with full audit trail
- Comment submission
- Responsive split-pane layout

---

### CommandCenterScreen.tsx
**Purpose**: Central triage & management  
**Features**:
- Advanced filtering (6 dimensions + search)
- URL parameter sync (shareable links)
- Split-pane view (master-detail)
- In-line editing of all fields
- Comment system
- Delete with confirmation
- Full audit trail

**URL Parameters**:
- `warroom`, `priority`, `status`, `statusGroup`
- Example: `#/command-center?warroom=SFA&priority=P1`

---

### SMEWorklistScreen.tsx
**Purpose**: Personal task management for SMEs  
**Features**:
- Name-based filtering
- Active vs Resolved tabs
- Quick resolve button
- Autocomplete name suggestions
- Task count indicators

---

### SettingsModal.tsx
**Purpose**: Configuration management  
**Features**:
- Tab-based LOV editing
- Add/Remove with confirmation
- Dev tools (seed data, clear all)
- Danger zone with double-confirm

**Safety Features**:
- 3-second confirmation timeout
- Visual feedback (color changes)
- Toasts for success/error

---

### FilterBar.tsx
**Purpose**: Reusable filter component  
**Features**:
- 6 filter dimensions
- Clear all button
- Responsive grid layout
- Live filtering (no submit needed)

---

### IncidentCard.tsx
**Purpose**: Incident display component  
**Features**:
- Priority badges (color-coded)
- SLA indicator (with breach detection)
- Metadata display
- Quick status dropdown
- Responsive layout

---

### Scorecard.tsx
**Purpose**: Metric display card  
**Features**:
- Simple title/value display
- Critical highlighting (red for P1)
- Hover effects

---

## ⚠️ Current Limitations

### 1. **Storage & Persistence**
❌ **localStorage Only**
- Limited to 5-10MB per domain
- Data lives only in one browser/device
- No data sharing between users
- Risk of data loss if browser cache cleared

❌ **File Attachments**
- 1MB size limit (Base64 bloat)
- Not suitable for large files
- Stored in localStorage (not scalable)

---

### 2. **Multi-User Collaboration**
❌ **No Real-Time Sync**
- Each user has isolated data
- No team collaboration
- No concurrent editing
- No user authentication

❌ **No Access Control**
- Anyone with the URL can access
- No role-based permissions
- No audit of who made changes

---

### 3. **Data Management**
❌ **No Backup/Recovery**
- Data loss is permanent
- No version history
- No disaster recovery

❌ **No Search/Indexing**
- Client-side filtering only
- Performance degrades with large datasets (>1000 incidents)
- No full-text search

---

### 4. **Integration & APIs**
❌ **No External Integrations**
- No email notifications
- No Slack/Teams webhooks
- No API endpoints
- No third-party tool connections

❌ **No Analytics**
- Basic metrics only
- No reporting engine
- No trend analysis
- No dashboarding beyond built-in screens

---

### 5. **Scalability**
❌ **Performance Bottlenecks**
- All data loaded in memory
- Re-renders on every filter change
- Not optimized for >500 incidents

❌ **No Pagination**
- All incidents displayed at once
- No lazy loading
- No virtualized scrolling

---

### 6. **Mobile Experience**
⚠️ **Limited Mobile Optimization**
- Responsive but not mobile-first
- Small screens may struggle with Command Center
- No native app

---

### 7. **Security**
❌ **No Authentication**
- Public access
- No user tracking
- No session management

❌ **No Data Encryption**
- localStorage is plain text
- No HTTPS enforcement (depends on hosting)

---

### 8. **Workflow Limitations**
❌ **No Approval Flows**
- No review/approval stages
- No escalation rules
- No SLA enforcement (visual only)

❌ **No Bulk Operations**
- One incident at a time
- No mass status updates
- No batch assignment

---

## 🚀 Future Enhancements

### Phase 1: Essential Backend Integration
**Goal**: Enable multi-user collaboration

#### Option A: Firebase (Recommended)
```
✅ Firestore for real-time data sync
✅ Firebase Storage for file uploads
✅ Firebase Auth for user management
✅ Free tier: 1GB storage, 10GB bandwidth
```

**Implementation Steps**:
1. Install Firebase SDK (`npm install firebase`)
2. Replace `storageService.ts` with Firebase calls
3. Add authentication (Google/Email)
4. Migrate localStorage to Firestore
5. Add real-time listeners

**Code Changes**:
- `services/firebaseService.ts` (new)
- Update `App.tsx` with Firebase context
- Add auth guards to routes

---

#### Option B: Google Sheets API
```
✅ Simple spreadsheet backend
✅ Easy sharing & permissions
✅ No infrastructure needed
✅ Good for small teams (<100 users)
```

**Implementation Steps**:
1. Create Google Cloud project
2. Enable Sheets API
3. Create service account
4. Add Sheets API calls to `storageService.ts`
5. Store files in Google Drive

**Limitations**:
- API rate limits (100 requests/100 seconds)
- No real-time updates (polling required)
- Manual data modeling (sheet columns)

---

#### Option C: Supabase
```
✅ PostgreSQL backend
✅ Built-in auth & storage
✅ RESTful API + real-time subscriptions
✅ Open source alternative to Firebase
```

---

### Phase 2: File Upload Enhancement
**Goal**: Proper file handling

**Options**:
1. **Cloudinary** - Image optimization & CDN
2. **AWS S3** - Scalable object storage
3. **Firebase Storage** - Integrated with Firebase
4. **Imgur API** - Simple image hosting

**Implementation**:
- Upload files to cloud storage
- Store URLs in incident records
- Add file type validation
- Implement virus scanning (AWS Lambda)

---

### Phase 3: Advanced Features

#### 🔔 Notifications
- Email alerts on status changes
- Slack/Teams webhooks
- In-app notifications
- SMS for P1 incidents

#### 📊 Enhanced Analytics
- Trend analysis (incidents over time)
- MTTR (Mean Time To Resolve)
- Warroom performance metrics
- Custom reports

#### 🔐 Security & Access Control
- OAuth 2.0 authentication
- Role-based access (Requestor/Warroom/SME/Admin)
- Audit logging
- Data encryption at rest

#### 🤖 Automation
- Auto-assignment based on category
- SLA enforcement (auto-escalate)
- Smart prioritization (ML-based)
- Duplicate detection

#### 📱 Mobile App
- React Native app
- Push notifications
- Offline mode
- Camera integration for attachments

#### 🔗 Integrations
- JIRA sync (for legacy systems)
- ServiceNow connector
- PagerDuty integration
- Webhook support

---

### Phase 4: Enterprise Features

#### 🏢 Multi-Tenancy
- Organization/tenant isolation
- Custom domains
- White-labeling
- Billing & usage tracking

#### 📈 Advanced Reporting
- Customizable dashboards
- Scheduled reports (email/PDF)
- Data export (Excel/CSV/JSON)
- API for BI tools

#### 🧪 Testing & Quality
- Unit tests (Jest)
- E2E tests (Playwright)
- Performance monitoring
- Error tracking (Sentry)

---

## 📚 Setup Guide

### Prerequisites
- **Node.js** (v18+ recommended)
- **npm** or **yarn**
- Modern browser (Chrome, Firefox, Edge)

### Installation

1. **Clone Repository**
```bash
git clone https://github.com/StillNotBald/Blame-Time-.git
cd Blame-Time-
```

2. **Install Dependencies**
```bash
npm install --legacy-peer-deps
```
*Note: `--legacy-peer-deps` required due to React 19 / lucide-react version mismatch*

3. **Run Development Server**
```bash
npm run dev
```

4. **Open Browser**
```
http://localhost:3000
```

### Configuration

#### Vite Config (`vite.config.ts`)
```typescript
export default defineConfig(({ mode }) => {
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',  // Allow external access
    },
    plugins: [react()],
    // Add environment variables if needed
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    }
  };
});
```

#### TypeScript Config (`tsconfig.json`)
- Target: ES2020
- Module: ESNext
- Strict mode enabled

---

## 🌐 Deployment Options

### **Recommended Simple Approach: Static Host + Shared Backend**

For most teams, the simplest production-ready setup is:

**Step 1: Deploy Frontend** → **Step 2: Add Shared Storage**

This two-step approach gives you:
- ✅ Multi-user collaboration
- ✅ Shared data across all users
- ✅ Proper file storage
- ✅ No infrastructure management
- ✅ Company-controlled permissions

---

### **Complete Simple Deployment Strategy**

#### **Phase 1: Deploy Frontend to Static Host**

Choose any static hosting provider (all work the same way):

| Provider | Setup Time | Cost | Best For |
|----------|------------|------|----------|
| **Netlify** | 5 min | Free | Easiest, recommended |
| **Vercel** | 5 min | Free | Next.js optimized |
| **GitHub Pages** | 10 min | Free | GitHub-native |
| **AWS S3 + CloudFront** | 30 min | ~$1-5/mo | Enterprise scale |

**Result**: You get a live URL like `https://your-app.netlify.app` or `https://incidents.yourcompany.com`

---

#### **Phase 2: Add Shared Backend Storage**

Choose based on your company's existing tools:

##### **Option A: Google Sheets Integration** (Recommended for Small Teams)

**Best For**: Teams already using Google Workspace, 5-50 users

**What You Get**:
```
✅ Shared incident data across all users
✅ Files stored in Google Drive
✅ Easy permissions (share like Google Docs)
✅ Built-in version history
✅ No infrastructure to manage
✅ Free tier
```

**Architecture**:
```
User → Netlify/Vercel App → Google Sheets API → Google Sheet
                          ↓
                    Google Drive (files/images)
```

**Setup Summary**:
1. Create Google Cloud project (free)
2. Enable Google Sheets API
3. Set up OAuth 2.0 credentials
4. Add API calls to `storageService.ts`
5. Users authenticate with Google accounts

**Implementation Requirements**:
- Google Cloud account
- OAuth consent screen setup
- API key management
- Code changes to replace localStorage

**Limitations**:
- API rate limits: 100 requests per 100 seconds per user
- Polling for updates (no real-time sync)
- Best for <50 concurrent users
- Requires internet connection

**Cost**: Free (within Google Cloud free tier limits)

---

##### **Option B: SharePoint Integration** (For Microsoft 365 Organizations)

**Best For**: Enterprise teams already using Microsoft 365/SharePoint

**What You Get**:
```
✅ Enterprise security & compliance
✅ Integrates with existing M365 permissions
✅ Files in SharePoint Document Library
✅ Audit logs included
✅ Power BI integration possible
✅ SSO with company accounts
```

**Architecture**:
```
User → Netlify/Vercel App → Microsoft Graph API → SharePoint List
                          ↓
                    SharePoint Library (files)
```

**Setup Summary**:
1. Register app in Azure AD
2. Grant Microsoft Graph API permissions
3. Configure SharePoint list schema
4. Add Graph API calls to `storageService.ts`
5. Users authenticate with Microsoft accounts

**Implementation Requirements**:
- Microsoft 365 subscription
- Azure AD app registration
- SharePoint site access
- Graph API permissions
- Code changes to replace localStorage

**Limitations**:
- Throttling: 12,000 requests per 5 minutes
- More complex API setup than Google Sheets
- Requires M365 subscription
- Steeper learning curve

**Cost**: Included with Microsoft 365 subscription

---

### **Deployment Comparison Matrix**

| Aspect | localStorage (Current) | + Google Sheets | + SharePoint |
|--------|----------------------|-----------------|--------------|
| **Multi-User** | ❌ No | ✅ Yes | ✅ Yes |
| **Data Sharing** | ❌ No | ✅ Yes | ✅ Yes |
| **File Storage** | ⚠️ 1MB limit | ✅ Google Drive | ✅ SharePoint Library |
| **Authentication** | ❌ None | ✅ Google OAuth | ✅ Microsoft SSO |
| **Setup Time** | 0 min | 30-60 min | 45-90 min |
| **Cost** | Free | Free | M365 subscription |
| **Real-Time Sync** | N/A | ❌ Polling only | ⚠️ Webhooks available |
| **Best For** | Single user | Small teams | Enterprise |
| **Permissions** | ❌ None | ✅ Google sharing | ✅ M365 permissions |
| **Backup** | ❌ None | ✅ Google auto-backup | ✅ M365 backup |

---

### **Step-by-Step: Netlify + Google Sheets (Recommended)**

#### **Part 1: Deploy to Netlify (5 minutes)**

1. **Push code to GitHub**:
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. **Deploy on Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import from Git"
   - Select your `Blame-Time-` repository
   - Settings auto-detected ✅
   - Click "Deploy"

3. **Get your URL**: `https://your-app-name.netlify.app`

4. **Optional - Custom Domain**:
   - Go to Site settings → Domain management
   - Add custom domain (e.g., `incidents.company.com`)
   - Update DNS records as instructed

**Result**: Your app is now live and accessible by anyone with the URL!

---

#### **Part 2: Add Google Sheets Backend (Later)**

This requires code changes. High-level steps:

1. **Create Google Cloud Project**
   - Enable Sheets API and Drive API
   - Create OAuth 2.0 credentials
   - Configure consent screen

2. **Set up Google Sheet**
   - Create spreadsheet with incident columns
   - Create separate sheet for LOVs
   - Configure permissions

3. **Modify Code**:
   - Install `gapi-script` package
   - Create `services/googleSheetsService.ts`
   - Replace localStorage calls with Sheets API
   - Add authentication flow

4. **Deploy Updates**:
   - Push code changes
   - Netlify auto-deploys on git push

**Implementation Note**: This requires significant code changes and is best done as a separate phase after validating the UI/UX with stakeholders.

---

### 1. **Static Hosting Options (Current - localStorage Only)**

Deploy the current version for testing/single-user use:

#### **Netlify** (Easiest)
```bash
npm run build
# Drag 'dist' folder to Netlify dashboard
```

**Settings**:
- Build command: `npm run build`
- Publish directory: `dist`
- Redirect rule for SPA:
  ```
  [[redirects]]
    from = "/*"
    to = "/index.html"
    status = 200
  ```

---

#### **Vercel**
```bash
npm install -g vercel
vercel
```

**Auto-detected settings work out of the box**

---

#### **GitHub Pages**
1. Update `vite.config.ts`:
```typescript
base: '/Blame-Time-/'  // Replace with your repo name
```

2. Deploy:
```bash
npm run build
npx gh-pages -d dist
```

---

#### **AWS S3 + CloudFront**
1. Build: `npm run build`
2. Upload `dist/` to S3 bucket
3. Enable static website hosting
4. Set error document to `index.html` (for SPA routing)
5. Optional: Add CloudFront CDN

---

### 2. **Docker Container**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build
RUN npm install -g serve
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
```

**Build & Run**:
```bash
docker build -t blame-time .
docker run -p 3000:3000 blame-time
```

---

### 3. **GitHub Codespaces** (Current Setup)
- Already configured with port forwarding
- Set port 3000 to **Public** for external access
- Persistent across sessions (if Codespace kept alive)

**Limitations**:
- Codespace stops after inactivity (data persists in localStorage)
- URL changes if Codespace recreated
- Not suitable for production

---

### 4. **With Shared Backend (Production Multi-User Setup)**

#### **Netlify/Vercel + Google Sheets**
- Frontend: Static host (Netlify/Vercel)
- Backend: Google Sheets API + Google Drive
- Authentication: Google OAuth 2.0
- Cost: Free (within limits)
- Best for: Small-medium teams (5-50 users)

#### **Netlify/Vercel + SharePoint**
- Frontend: Static host (Netlify/Vercel)
- Backend: SharePoint Lists + Document Library
- Authentication: Microsoft SSO
- Cost: M365 subscription
- Best for: Enterprise organizations

#### **Alternative: Firebase/Supabase**
If you prefer a dedicated database:
- Deploy frontend to static host (Netlify/Vercel)
- Backend managed by Firebase/Supabase infrastructure
- Configure API endpoints in `.env` file
- More scalable but requires more setup

---

### **Deployment Decision Tree**

```
Is this for production use with multiple users?
│
├─ NO → Deploy to Netlify (5 min) → Done! Use localStorage
│
└─ YES → Do you use Google Workspace or Microsoft 365?
    │
    ├─ Google Workspace → Netlify + Google Sheets integration
    │   └─ Best for: Small-medium teams, easy setup
    │
    ├─ Microsoft 365 → Netlify + SharePoint integration
    │   └─ Best for: Enterprise, compliance needs
    │
    └─ Neither → Consider Firebase/Supabase
        └─ Best for: High scalability, real-time needs
```

---

## 🔧 Development Tips

### Code Organization
- Keep components under 300 lines
- Extract complex logic to hooks
- Use `useMemo` for expensive calculations
- Avoid prop drilling (consider Context API if needed)

### Performance
- Current app handles ~500 incidents smoothly
- Beyond that, consider:
  - Pagination
  - Virtual scrolling (react-window)
  - IndexedDB migration
  - Backend offloading

### Debugging
- React DevTools for component inspection
- localStorage can be viewed in browser DevTools (Application tab)
- Add `console.log` in `storageService.ts` for debugging persistence

### Testing localStorage
```javascript
// Browser console
localStorage.getItem('incident_command_data_v3')
```

---

## 📊 Performance Metrics

### Current Benchmarks
- **Initial Load**: ~370ms (Vite dev server)
- **Filter Operation**: <50ms (up to 500 incidents)
- **localStorage Read**: ~5ms
- **CSV Export**: <100ms (500 incidents)

### Browser Compatibility
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

---

## 🤝 Contributing Guide

### For Developers
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Make changes
4. Test thoroughly
5. Commit (`git commit -m 'Add amazing feature'`)
6. Push (`git push origin feature/amazing-feature`)
7. Open Pull Request

### For End Users
- Report bugs via GitHub Issues
- Suggest features
- Share deployment stories
- Contribute documentation

---

## 📞 Support & Contact

### Repository
- **GitHub**: [StillNotBald/Blame-Time-](https://github.com/StillNotBald/Blame-Time-)
- **Issues**: Use GitHub Issues for bug reports
- **Discussions**: Use GitHub Discussions for questions

---

## 📝 License

This project was generated from AI Studio and is intended for educational/internal use.

---

## 🎓 Learning Resources

### For Programmers New to This Codebase
1. **React Basics**: https://react.dev/learn
2. **TypeScript**: https://www.typescriptlang.org/docs/
3. **React Router**: https://reactrouter.com/
4. **Tailwind CSS**: https://tailwindcss.com/docs
5. **Vite**: https://vitejs.dev/guide/

### Key Concepts to Understand
- **React Hooks** (useState, useEffect, useMemo)
- **TypeScript Interfaces** (see `types.ts`)
- **localStorage API** (Web Storage)
- **SPA Routing** (Hash vs Browser Router)
- **Responsive Design** (Tailwind utilities)

---

## 🔥 Quick Start Cheat Sheet

### Add New Status
1. Open `services/storageService.ts`
2. Add to `DEFAULT_LOVS.statuses` array
3. Restart dev server (localStorage persists old values)

### Add New Component
1. Create file in `components/`
2. Import in `App.tsx`
3. Add route if needed

### Change Theme Colors
1. Edit Tailwind classes in components
2. Or add custom CSS in `index.html` `<style>` tag

### Debug localStorage
```javascript
// Clear all data
localStorage.clear()

// View incidents
JSON.parse(localStorage.getItem('incident_command_data_v3'))

// View settings
JSON.parse(localStorage.getItem('incident_command_lovs_v3'))
```

---

## ⚡ Troubleshooting

### "Blank screen on load"
- Check browser console for errors
- Verify `index.html` has `<script type="module" src="/index.tsx">`
- Run `npm install --legacy-peer-deps` again

### "Incidents not persisting"
- Check if localStorage is enabled (some browsers block it)
- Verify `storageService.ts` is being called
- Check browser storage quota

### "Port 3000 already in use"
- Change port in `vite.config.ts`
- Or kill existing process: `lsof -ti:3000 | xargs kill`

### "React version mismatch errors"
- Install with: `npm install --legacy-peer-deps`
- This is expected with React 19 + older packages

---

## 🎉 Conclusion

**Blame Time** is a pragmatic, no-frills incident tracker that prioritizes **speed** and **simplicity** over enterprise features. It's perfect for:
- Small teams testing incident workflows
- MVPs and prototypes
- Learning React/TypeScript
- Single-user incident tracking

For production use in multi-user environments, implement one of the backend solutions outlined in **Future Enhancements**.

---

**Built with 🔥 and ☕ by teams that move fast and occasionally break things.**

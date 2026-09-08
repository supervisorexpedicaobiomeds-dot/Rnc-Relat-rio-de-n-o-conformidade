import React, { useState, useEffect, useMemo } from 'react';
import { 
  OccurrenceRecord, 
  RncUser, 
  StandardOccurrence, 
  RncStatus,
  SectorInfo,
  AccessRequest 
} from './types/rnc';
import { 
  INITIAL_RNC_RECORDS, 
  INITIAL_RNC_USERS, 
  INITIAL_STANDARD_OCCURRENCES,
  INITIAL_ACCESS_REQUESTS,
  DEFAULT_PROFILE_PERMISSIONS,
  ORDER_SECTORS 
} from './data/rncData';
import { RncDashboard } from './components/rnc/RncDashboard';
import { RncReportsArea } from './components/rnc/RncReportsArea';
import { RncSidebar, MainNavTab } from './components/rnc/RncSidebar';
import { LoginScreen } from './components/auth/LoginScreen';
import { AccessRequestModal } from './components/auth/AccessRequestModal';
import { ShareFullscreenModal } from './components/common/ShareFullscreenModal';
import { RncFormModal } from './components/rnc/RncFormModal';
import { ManagementHubModal } from './components/admin/ManagementHubModal';
import { RncStandardOccurrenceModal } from './components/rnc/RncStandardOccurrenceModal';
import { RncDetailModal } from './components/rnc/RncDetailModal';
import { Maximize2, Menu, ShieldAlert, Plus } from 'lucide-react';
import { isFullscreenRequestedInUrl, triggerBrowserFullscreen } from './utils/fullscreenHelper';

export default function App() {
  // RNC Persistent State
  const [rncRecords, setRncRecords] = useState<OccurrenceRecord[]>(() => {
    try {
      const saved = localStorage.getItem('biomed_rnc_records');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_RNC_RECORDS;
  });

  const [sectors, setSectors] = useState<SectorInfo[]>(() => {
    try {
      const saved = localStorage.getItem('biomed_rnc_sectors');
      if (saved) {
        const parsed: SectorInfo[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return ORDER_SECTORS;
  });

  const [rncUsers, setRncUsers] = useState<RncUser[]>(() => {
    try {
      const saved = localStorage.getItem('biomed_rnc_users');
      if (saved) {
        const parsed: RncUser[] = JSON.parse(saved);
        // Ensure Elienai Silva is the master user
        const masterIdx = parsed.findIndex((u) => u.id === 'u1' || u.name.toLowerCase().includes('elienai') || u.name.toLowerCase().includes('carlos'));
        if (masterIdx !== -1) {
          parsed[masterIdx] = {
            ...parsed[masterIdx],
            id: 'u1',
            name: 'Elienai Silva',
            username: 'elienai.silva',
            role: 'Usuário Master / Supervisor Geral',
            profile: 'admin',
            email: 'supervisor.expedicao.biomeds@gmail.com',
            permissions: {
              canRegisterRnc: true,
              canResolveRnc: true,
              canDeleteRnc: true,
              canManageUsers: true,
              canManageStandardOccurrences: true,
              canExportReports: true,
            }
          };
          return parsed;
        }
        return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_RNC_USERS;
  });

  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>(() => {
    try {
      const saved = localStorage.getItem('biomed_rnc_access_requests');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_ACCESS_REQUESTS;
  });

  const [rncActiveUser, setRncActiveUser] = useState<RncUser>(() => {
    try {
      const saved = localStorage.getItem('biomed_rnc_active_user');
      if (saved) {
        const parsed: RncUser = JSON.parse(saved);
        if (parsed.id === 'u1' || parsed.name.toLowerCase().includes('carlos')) {
          return {
            ...parsed,
            id: 'u1',
            name: 'Elienai Silva',
            username: 'elienai.silva',
            role: 'Usuário Master / Supervisor Geral',
            profile: 'admin',
          };
        }
        return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_RNC_USERS[0];
  });

  const [standardOccurrences, setStandardOccurrences] = useState<StandardOccurrence[]>(() => {
    try {
      const saved = localStorage.getItem('biomed_rnc_standard_occ');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_STANDARD_OCCURRENCES;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('biomed_rnc_is_auth');
      return saved ? JSON.parse(saved) : true;
    } catch (e) {
      return true;
    }
  });

  // LocalStorage Synchronization
  useEffect(() => {
    localStorage.setItem('biomed_rnc_records', JSON.stringify(rncRecords));
  }, [rncRecords]);

  useEffect(() => {
    localStorage.setItem('biomed_rnc_sectors', JSON.stringify(sectors));
  }, [sectors]);

  useEffect(() => {
    localStorage.setItem('biomed_rnc_users', JSON.stringify(rncUsers));
  }, [rncUsers]);

  useEffect(() => {
    localStorage.setItem('biomed_rnc_active_user', JSON.stringify(rncActiveUser));
  }, [rncActiveUser]);

  useEffect(() => {
    localStorage.setItem('biomed_rnc_standard_occ', JSON.stringify(standardOccurrences));
  }, [standardOccurrences]);

  useEffect(() => {
    localStorage.setItem('biomed_rnc_access_requests', JSON.stringify(accessRequests));
  }, [accessRequests]);

  useEffect(() => {
    localStorage.setItem('biomed_rnc_is_auth', JSON.stringify(isAuthenticated));
  }, [isAuthenticated]);

  // Stage / Sector Handlers
  const handleAddSector = (sectorData: Omit<SectorInfo, 'order'>) => {
    const newSector: SectorInfo = {
      ...sectorData,
      order: sectors.length + 1,
    };
    setSectors((prev) => [...prev, newSector]);
  };

  const handleUpdateSector = (updatedSector: SectorInfo) => {
    setSectors((prev) => prev.map((s) => (s.id === updatedSector.id ? updatedSector : s)));
  };

  const handleDeleteSector = (sectorId: string) => {
    setSectors((prev) => {
      const filtered = prev.filter((s) => s.id !== sectorId);
      // re-index orders 1..N
      return filtered.map((s, idx) => ({ ...s, order: idx + 1 }));
    });
  };

  const handleReorderSectors = (reordered: SectorInfo[]) => {
    // update order numbers to match array position
    const withUpdatedOrder = reordered.map((s, idx) => ({
      ...s,
      order: idx + 1,
    }));
    setSectors(withUpdatedOrder);
  };

  const handleResetSectors = () => {
    setSectors(ORDER_SECTORS);
  };

  // RNC Action Handlers
  const handleSaveRncRecord = (newRec: Omit<OccurrenceRecord, 'id' | 'createdAt'>) => {
    const nextNum = rncRecords.length + 1;
    const recordWithId: OccurrenceRecord = {
      ...newRec,
      id: `RNC-2026-${String(nextNum).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
    };
    setRncRecords((prev) => [recordWithId, ...prev]);
  };

  const handleUpdateRncStatus = (id: string, status: RncStatus, resolutionNote?: string) => {
    setRncRecords((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        return {
          ...r,
          status,
          notes: resolutionNote ? (r.notes ? `${r.notes} | ${resolutionNote}` : resolutionNote) : r.notes,
          resolvedAt: status === 'resolvida' ? new Date().toISOString() : r.resolvedAt,
          resolvedBy: status === 'resolvida' ? rncActiveUser.name : r.resolvedBy,
        };
      })
    );
  };

  const handleDeleteRncRecord = (id: string) => {
    setRncRecords((prev) => prev.filter((r) => r.id !== id));
  };

  const handleSelectActiveUser = (user: RncUser) => {
    setRncActiveUser(user);
  };

  const handleAddUser = (user: Omit<RncUser, 'id'>) => {
    const newUser: RncUser = {
      ...user,
      id: `u-${Date.now()}`,
    };
    setRncUsers((prev) => [...prev, newUser]);
  };

  const handleUpdateUser = (updatedUser: RncUser) => {
    setRncUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    if (rncActiveUser.id === updatedUser.id) {
      setRncActiveUser(updatedUser);
    }
  };

  const handleDeleteUser = (userId: string) => {
    setRncUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const handleAddStandardOccurrence = (occ: Omit<StandardOccurrence, 'id'>) => {
    const newOcc: StandardOccurrence = {
      ...occ,
      id: `so-${Date.now()}`,
    };
    setStandardOccurrences((prev) => [...prev, newOcc]);
  };

  const handleDeleteStandardOccurrence = (occId: string) => {
    setStandardOccurrences((prev) => prev.filter((o) => o.id !== occId));
  };

  const handleResetRncData = () => {
    if (confirm('Deseja restaurar as ocorrências, setores e colaboradores para os dados padrão?')) {
      setRncRecords(INITIAL_RNC_RECORDS);
      setRncUsers(INITIAL_RNC_USERS);
      setRncActiveUser(INITIAL_RNC_USERS[0]);
      setStandardOccurrences(INITIAL_STANDARD_OCCURRENCES);
      setAccessRequests(INITIAL_ACCESS_REQUESTS);
    }
  };

  const handleCreateAccessRequest = (requestData: Omit<AccessRequest, 'id' | 'requestedAt' | 'status'>): AccessRequest => {
    const newRequest: AccessRequest = {
      ...requestData,
      id: `REQ-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`,
      status: 'pendente',
      requestedAt: new Date().toISOString(),
    };

    setAccessRequests((prev) => [newRequest, ...prev]);
    return newRequest;
  };

  const handleApproveAccessRequest = (requestId: string) => {
    const req = accessRequests.find((r) => r.id === requestId);
    if (!req) return;

    // Check if user already exists
    const existingIndex = rncUsers.findIndex((u) => u.username?.toLowerCase() === req.username.toLowerCase());
    
    if (existingIndex !== -1) {
      // Update existing user with new pin/sector
      setRncUsers((prev) => prev.map((u, idx) => idx === existingIndex ? {
        ...u,
        name: req.fullName,
        pin: req.pin,
        role: req.role,
        profile: req.profile,
        sector: req.sector,
        email: req.email || u.email,
        active: true,
        permissions: DEFAULT_PROFILE_PERMISSIONS[req.profile] || DEFAULT_PROFILE_PERMISSIONS.operador,
      } : u));
    } else {
      // Create new user
      const newUser: RncUser = {
        id: `u_${Date.now()}`,
        name: req.fullName,
        username: req.username,
        pin: req.pin,
        role: req.role,
        profile: req.profile,
        sector: req.sector,
        email: req.email,
        active: true,
        permissions: DEFAULT_PROFILE_PERMISSIONS[req.profile] || DEFAULT_PROFILE_PERMISSIONS.operador,
      };
      setRncUsers((prev) => [...prev, newUser]);
    }

    // Mark request as approved
    setAccessRequests((prev) => prev.map((r) => r.id === requestId ? {
      ...r,
      status: 'aprovado',
      reviewedAt: new Date().toISOString(),
      reviewedBy: rncActiveUser?.name || 'Administrador',
    } : r));
  };

  const handleRejectAccessRequest = (requestId: string, notes?: string) => {
    setAccessRequests((prev) => prev.map((r) => r.id === requestId ? {
      ...r,
      status: 'rejeitado',
      reviewedAt: new Date().toISOString(),
      reviewedBy: rncActiveUser?.name || 'Administrador',
      reviewNotes: notes,
    } : r));
  };

  const handleLogin = (user: RncUser) => {
    setRncActiveUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  const [activeTab, setActiveTab] = useState<MainNavTab>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // App-level Modal triggers for Sidebar & Stepper
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isManagementHubOpen, setIsManagementHubOpen] = useState(false);
  const [isStandardOccModalOpen, setIsStandardOccModalOpen] = useState(false);
  const [isAccessRequestModalOpen, setIsAccessRequestModalOpen] = useState(false);
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState<OccurrenceRecord | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isFsParamPresent, setIsFsParamPresent] = useState(false);

  // User permissions shortcuts
  const userPerms = rncActiveUser.permissions || {
    canRegisterRnc: true,
    canResolveRnc: true,
    canDeleteRnc: true,
    canManageUsers: true,
    canManageStandardOccurrences: true,
    canExportReports: true,
  };

  useEffect(() => {
    setIsFsParamPresent(isFullscreenRequestedInUrl());
  }, []);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <LoginScreen
          users={rncUsers}
          sectors={sectors}
          onLogin={handleLogin}
          onOpenShareModal={() => setIsShareModalOpen(true)}
          onOpenAccessRequest={() => setIsAccessRequestModalOpen(true)}
        />
        <ShareFullscreenModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          sectors={sectors}
          users={rncUsers}
        />
        <AccessRequestModal
          isOpen={isAccessRequestModalOpen}
          onClose={() => setIsAccessRequestModalOpen(false)}
          onSubmitRequest={handleCreateAccessRequest}
          sectors={sectors}
          existingUsers={rncUsers}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col lg:flex-row font-sans">
      {/* Lateral Panel (Sidebar) */}
      <RncSidebar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setIsMobileSidebarOpen(false);
        }}
        activeUser={rncActiveUser}
        userPerms={userPerms}
        onOpenNewRnc={() => setIsFormOpen(true)}
        onOpenManagementHub={() => setIsManagementHubOpen(true)}
        onOpenStandardOccurrences={() => setIsStandardOccModalOpen(true)}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        onOpenAccessRequest={() => setIsAccessRequestModalOpen(true)}
        pendingRequestsCount={accessRequests.filter((r) => r.status === 'pendente').length}
        onLogout={handleLogout}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Kiosk Mode Top Floating Notification if requested in URL */}
        {isFsParamPresent && !isFullscreen && (
          <div className="bg-amber-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-between shadow-md sticky top-0 z-40">
            <div className="flex items-center gap-2">
              <Maximize2 className="w-4 h-4 animate-pulse" />
              <span>Link em Modo Posto / Tela Cheia detectado. Clique no botão ao lado para expandir sem distrações.</span>
            </div>
            <button
              onClick={toggleFullscreen}
              className="px-3 py-1 bg-white text-amber-900 hover:bg-amber-50 rounded-lg text-xs font-black transition-colors cursor-pointer shadow-xs"
            >
              EXPANDIR TELA CHEIA
            </button>
          </div>
        )}

        {/* Mobile Header Bar */}
        <header className="lg:hidden bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800 sticky top-0 z-30 shadow-md">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-amber-400 cursor-pointer"
            title="Abrir Menu Lateral"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <span className="font-black text-sm text-white">Biomeds RNC</span>
          </div>
          <button
            onClick={() => setIsFormOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer shadow-xs"
          >
            + Nova RNC
          </button>
        </header>

        {/* Dynamic Main View */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-6">
          {activeTab === 'dashboard' ? (
            <RncDashboard
              records={rncRecords}
              users={rncUsers}
              activeUser={rncActiveUser}
              sectors={sectors}
              standardOccurrences={standardOccurrences}
              onSaveRecord={handleSaveRncRecord}
              onUpdateRecordStatus={handleUpdateRncStatus}
              onDeleteRecord={handleDeleteRncRecord}
              onSelectActiveUser={handleSelectActiveUser}
              onAddUser={handleAddUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
              onAddSector={handleAddSector}
              onUpdateSector={handleUpdateSector}
              onDeleteSector={handleDeleteSector}
              onReorderSectors={handleReorderSectors}
              onResetSectors={handleResetSectors}
              onAddStandardOccurrence={handleAddStandardOccurrence}
              onDeleteStandardOccurrence={handleDeleteStandardOccurrence}
              onResetData={handleResetRncData}
              onLogout={handleLogout}
              onToggleMobileMenu={() => setIsMobileSidebarOpen(true)}
              onNavigateToReports={() => setActiveTab('reports')}
            />
          ) : (
            <RncReportsArea
              records={rncRecords}
              sectors={sectors}
              users={rncUsers}
              activeUser={rncActiveUser}
              onOpenDetail={(rec) => setSelectedRecordForDetail(rec)}
            />
          )}
        </main>
      </div>

      {/* Global Modals triggered from Sidebar / Stepper */}
      <RncFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveRncRecord}
        activeUser={rncActiveUser}
        users={rncUsers}
        sectors={sectors}
        standardOccurrences={standardOccurrences}
      />

      <ManagementHubModal
        isOpen={isManagementHubOpen}
        onClose={() => setIsManagementHubOpen(false)}
        users={rncUsers}
        activeUser={rncActiveUser}
        onSelectActiveUser={handleSelectActiveUser}
        onAddUser={handleAddUser}
        onUpdateUser={handleUpdateUser}
        onDeleteUser={handleDeleteUser}
        sectors={sectors}
        onAddSector={handleAddSector}
        onUpdateSector={handleUpdateSector}
        onDeleteSector={handleDeleteSector}
        onReorderSectors={handleReorderSectors}
        onResetSectors={handleResetSectors}
        standardOccurrences={standardOccurrences}
        onAddStandardOccurrence={handleAddStandardOccurrence}
        onDeleteStandardOccurrence={handleDeleteStandardOccurrence}
        accessRequests={accessRequests}
        onApproveAccessRequest={handleApproveAccessRequest}
        onRejectAccessRequest={handleRejectAccessRequest}
      />

      <RncStandardOccurrenceModal
        isOpen={isStandardOccModalOpen}
        onClose={() => setIsStandardOccModalOpen(false)}
        occurrences={standardOccurrences}
        sectors={sectors}
        onAddOccurrence={handleAddStandardOccurrence}
        onDeleteOccurrence={handleDeleteStandardOccurrence}
      />

      <RncDetailModal
        record={selectedRecordForDetail}
        onClose={() => setSelectedRecordForDetail(null)}
        onUpdateStatus={handleUpdateRncStatus}
        currentUserName={rncActiveUser.name}
        sectors={sectors}
        canResolve={userPerms.canResolveRnc}
        canExportReports={userPerms.canExportReports}
      />

      <ShareFullscreenModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        sectors={sectors}
        users={rncUsers}
      />

      <AccessRequestModal
        isOpen={isAccessRequestModalOpen}
        onClose={() => setIsAccessRequestModalOpen(false)}
        onSubmitRequest={handleCreateAccessRequest}
        sectors={sectors}
        existingUsers={rncUsers}
      />
    </div>
  );
}

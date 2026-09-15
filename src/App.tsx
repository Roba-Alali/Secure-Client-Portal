import React, { useState, useEffect } from 'react';
import {
  UserRole,
  ClientUser,
  Project,
  DocumentItem,
  LoginLog,
  ViewLog,
  AdminNotification,
  WatermarkConfig
} from './types';
import {
  getStoredClients,
  saveStoredClients,
  getStoredProjects,
  saveStoredProjects,
  getStoredDocuments,
  saveStoredDocuments,
  getStoredWatermarkConfig,
  saveStoredWatermarkConfig,
  getStoredLoginLogs,
  saveStoredLoginLogs,
  getStoredViewLogs,
  saveStoredViewLogs,
  getStoredNotifications,
  saveStoredNotifications
} from './utils/storage';
import { Navbar } from './components/Navbar';
import { ClientLogin } from './components/client/ClientLogin';
import { ClientPortal } from './components/client/ClientPortal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { PdfViewerModal } from './components/viewers/PdfViewerModal';
import { PresentationViewerModal } from './components/viewers/PresentationViewerModal';
import { VideoViewerModal } from './components/viewers/VideoViewerModal';

export default function App() {
  // Application Data States
  const [clients, setClients] = useState<ClientUser[]>(() => getStoredClients());
  const [projects, setProjects] = useState<Project[]>(() => getStoredProjects());
  const [documents, setDocuments] = useState<DocumentItem[]>(() => getStoredDocuments());
  const [watermarkConfig, setWatermarkConfig] = useState<WatermarkConfig>(() => getStoredWatermarkConfig());
  const [loginLogs, setLoginLogs] = useState<LoginLog[]>(() => getStoredLoginLogs());
  const [viewLogs, setViewLogs] = useState<ViewLog[]>(() => getStoredViewLogs());
  const [notifications, setNotifications] = useState<AdminNotification[]>(() => getStoredNotifications());

  // Auth & Session States
  // Start authenticated with client-1 by default so the preview loads the full app immediately
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [currentRole, setCurrentRole] = useState<UserRole>('client');
  const [currentClient, setCurrentClient] = useState<ClientUser>(() => clients[0] || getStoredClients()[0]);

  // Active Viewers State
  const [activePdfDoc, setActivePdfDoc] = useState<DocumentItem | null>(null);
  const [activePresentationDoc, setActivePresentationDoc] = useState<DocumentItem | null>(null);
  const [activeVideoDoc, setActiveVideoDoc] = useState<DocumentItem | null>(null);

  // Sync with LocalStorage
  useEffect(() => {
    saveStoredClients(clients);
  }, [clients]);

  useEffect(() => {
    saveStoredProjects(projects);
  }, [projects]);

  useEffect(() => {
    saveStoredDocuments(documents);
  }, [documents]);

  useEffect(() => {
    saveStoredWatermarkConfig(watermarkConfig);
  }, [watermarkConfig]);

  useEffect(() => {
    saveStoredLoginLogs(loginLogs);
  }, [loginLogs]);

  useEffect(() => {
    saveStoredViewLogs(viewLogs);
  }, [viewLogs]);

  useEffect(() => {
    saveStoredNotifications(notifications);
  }, [notifications]);

  // Handlers
  const handleClientLoginSuccess = (client: ClientUser) => {
    setCurrentClient(client);
    setCurrentRole('client');
    setIsAuthenticated(true);
  };

  const handleAdminLogin = () => {
    setCurrentRole('admin');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  const handleRecordLogin = (log: LoginLog, notif?: AdminNotification) => {
    setLoginLogs((prev) => {
      if (prev.some((l) => l.id === log.id)) return prev;
      return [log, ...prev];
    });
    if (notif) {
      setNotifications((prev) => {
        if (prev.some((n) => n.id === notif.id)) return prev;
        return [notif, ...prev];
      });
    }
  };

  const handleRecordView = (log: ViewLog, notif?: AdminNotification) => {
    setViewLogs((prev) => {
      if (prev.some((v) => v.id === log.id)) return prev;
      return [log, ...prev];
    });
    if (notif) {
      setNotifications((prev) => {
        if (prev.some((n) => n.id === notif.id)) return prev;
        return [notif, ...prev];
      });
    }
    // Increment document view count
    setDocuments((prevDocs) =>
      prevDocs.map((doc) =>
        doc.id === log.documentId ? { ...doc, viewsCount: doc.viewsCount + 1 } : doc
      )
    );
  };

  const handleUpdateWatermark = (newConfig: WatermarkConfig) => {
    setWatermarkConfig(newConfig);
  };

  const handleAddClient = (newClient: ClientUser) => {
    setClients((prev) => [newClient, ...prev]);
  };

  const handleUpdateClient = (updatedClient: ClientUser) => {
    setClients((prev) =>
      prev.map((c) => (c.id === updatedClient.id ? updatedClient : c))
    );
    if (currentClient.id === updatedClient.id) {
      setCurrentClient(updatedClient);
    }
  };

  const handleDeleteClient = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
  };

  const handleAddProject = (newProj: Project) => {
    setProjects((prev) => [newProj, ...prev]);
  };

  const handleAddDocument = (newDoc: DocumentItem) => {
    setDocuments((prev) => [newDoc, ...prev]);
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  const handleMarkNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans selection:bg-[#E40107]/30 selection:text-[#ff4b4f]">
      {!isAuthenticated ? (
        <ClientLogin
          clients={clients}
          onLoginSuccess={handleClientLoginSuccess}
          onAdminLogin={handleAdminLogin}
          onRecordLogin={handleRecordLogin}
        />
      ) : (
        <>
          <Navbar
            currentRole={currentRole}
            currentClient={currentClient}
            clients={clients}
            notifications={notifications}
            onSwitchRole={(role) => setCurrentRole(role)}
            onSelectClient={(c) => setCurrentClient(c)}
            onLogout={handleLogout}
          />

          <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8">
            {currentRole === 'client' ? (
              <ClientPortal
                currentClient={currentClient}
                projects={projects}
                documents={documents}
                watermarkConfig={watermarkConfig}
                onOpenPdf={(doc) => setActivePdfDoc(doc)}
                onOpenPresentation={(doc) => setActivePresentationDoc(doc)}
                onOpenVideo={(doc) => setActiveVideoDoc(doc)}
                onSwitchToAdmin={() => setCurrentRole('admin')}
              />
            ) : (
              <AdminDashboard
                clients={clients}
                projects={projects}
                documents={documents}
                loginLogs={loginLogs}
                viewLogs={viewLogs}
                notifications={notifications}
                watermarkConfig={watermarkConfig}
                onUpdateWatermark={handleUpdateWatermark}
                onAddClient={handleAddClient}
                onUpdateClient={handleUpdateClient}
                onDeleteClient={handleDeleteClient}
                onAddProject={handleAddProject}
                onAddDocument={handleAddDocument}
                onDeleteDocument={handleDeleteDocument}
                onMarkNotificationsRead={handleMarkNotificationsRead}
                onPreviewDocument={(doc, client) => {
                  if (doc.fileType === 'pdf') setActivePdfDoc(doc);
                  else if (doc.fileType === 'presentation') setActivePresentationDoc(doc);
                  else if (doc.fileType === 'video') setActiveVideoDoc(doc);
                }}
              />
            )}
          </main>

          {/* ACTIVE VIEWERS MODALS */}
          {activePdfDoc && (
            <PdfViewerModal
              document={activePdfDoc}
              client={currentClient}
              watermarkConfig={watermarkConfig}
              onClose={() => setActivePdfDoc(null)}
              onRecordView={handleRecordView}
            />
          )}

          {activePresentationDoc && (
            <PresentationViewerModal
              document={activePresentationDoc}
              client={currentClient}
              watermarkConfig={watermarkConfig}
              onClose={() => setActivePresentationDoc(null)}
              onRecordView={handleRecordView}
            />
          )}

          {activeVideoDoc && (
            <VideoViewerModal
              document={activeVideoDoc}
              client={currentClient}
              watermarkConfig={watermarkConfig}
              onClose={() => setActiveVideoDoc(null)}
              onRecordView={handleRecordView}
            />
          )}
        </>
      )}
    </div>
  );
}

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
import {
  saveDocumentToFirestore,
  deleteDocumentFromFirestore,
  listenToFirestoreDocuments,
  saveAuditLogToFirestore,
  listenToFirestoreAuditLogs,
  saveWatermarkConfigToFirestore,
  listenToFirestoreWatermark,
  testConnection
} from './lib/firebase';
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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('mmg_session_auth') === 'true';
  });
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    return (localStorage.getItem('mmg_session_role') as UserRole) || 'client';
  });
  const [currentClient, setCurrentClient] = useState<ClientUser>(() => {
    try {
      const savedClientId = localStorage.getItem('mmg_session_client_id');
      const allClients = getStoredClients();
      if (savedClientId) {
        const found = allClients.find((c) => c.id === savedClientId);
        if (found) return found;
      }
      return allClients[0];
    } catch {
      return getStoredClients()[0];
    }
  });

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

  // Real-time Firestore Cloud Synchronization
  useEffect(() => {
    testConnection().catch(() => {});

    // Listen to remote documents
    const unsubDocs = listenToFirestoreDocuments((remoteDocs) => {
      if (remoteDocs && remoteDocs.length > 0) {
        setDocuments((prevDocs) => {
          const merged = [...remoteDocs];
          for (const localDoc of prevDocs) {
            if (!merged.some((d) => d.id === localDoc.id)) {
              merged.push(localDoc);
            }
          }
          return merged;
        });
      }
    });

    // Listen to remote audit logs
    const unsubLogs = listenToFirestoreAuditLogs((remoteLogs) => {
      if (remoteLogs && remoteLogs.length > 0) {
        setViewLogs((prevLogs) => {
          const merged = [...remoteLogs];
          for (const localLog of prevLogs) {
            if (!merged.some((l) => l.id === localLog.id)) {
              merged.push(localLog);
            }
          }
          return merged;
        });
      }
    });

    // Listen to remote watermark settings
    const unsubWatermark = listenToFirestoreWatermark((remoteConfig) => {
      if (remoteConfig && remoteConfig.template) {
        setWatermarkConfig((prev) => ({
          ...prev,
          ...remoteConfig
        }));
      }
    });

    return () => {
      unsubDocs();
      unsubLogs();
      unsubWatermark();
    };
  }, []);

  // Handlers
  const handleClientLoginSuccess = (client: ClientUser) => {
    localStorage.setItem('mmg_session_auth', 'true');
    localStorage.setItem('mmg_session_role', 'client');
    localStorage.setItem('mmg_session_client_id', client.id);
    setCurrentClient(client);
    setCurrentRole('client');
    setIsAuthenticated(true);
  };

  const handleAdminLogin = () => {
    localStorage.setItem('mmg_session_auth', 'true');
    localStorage.setItem('mmg_session_role', 'admin');
    setCurrentRole('admin');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('mmg_session_auth');
    localStorage.removeItem('mmg_session_role');
    localStorage.removeItem('mmg_session_client_id');
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
    // Persist audit log to Firestore
    saveAuditLogToFirestore(log).catch((err) => {
      console.warn('[Firestore] Audit log save error:', err);
    });

    if (notif) {
      setNotifications((prev) => {
        if (prev.some((n) => n.id === notif.id)) return prev;
        return [notif, ...prev];
      });
    }
    // Increment document view count
    setDocuments((prevDocs) =>
      prevDocs.map((doc) => {
        if (doc.id === log.documentId) {
          const updated = { ...doc, viewsCount: doc.viewsCount + 1 };
          saveDocumentToFirestore(updated).catch(() => {});
          return updated;
        }
        return doc;
      })
    );
  };

  const handleUpdateWatermark = (newConfig: WatermarkConfig) => {
    setWatermarkConfig(newConfig);
    saveWatermarkConfigToFirestore(newConfig).catch((err) => {
      console.warn('[Firestore] Watermark config save error:', err);
    });
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
    saveDocumentToFirestore(newDoc).catch((err) => {
      console.warn('[Firestore] Document save error:', err);
    });
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    deleteDocumentFromFirestore(id).catch((err) => {
      console.warn('[Firestore] Document delete error:', err);
    });
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
            notifications={notifications}
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

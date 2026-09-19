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
  saveClientToFirestore,
  deleteClientFromFirestore,
  listenToFirestoreClients,
  saveProjectToFirestore,
  deleteProjectFromFirestore,
  listenToFirestoreProjects,
  testConnection
} from './lib/firebase';
import { Navbar } from './components/Navbar';
import { ClientLogin } from './components/client/ClientLogin';
import { AdminLogin } from './components/admin/AdminLogin';
import { ClientPortal } from './components/client/ClientPortal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { PdfViewerModal } from './components/viewers/PdfViewerModal';
import { PresentationViewerModal } from './components/viewers/PresentationViewerModal';
import { VideoViewerModal } from './components/viewers/VideoViewerModal';
import { GlobalSecurityShield } from './components/GlobalSecurityShield';

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
  // Use sessionStorage as primary session carrier so closing the browser/tab strictly terminates session
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const isSessionAuth = sessionStorage.getItem('mmg_session_auth') === 'true';
    if (isSessionAuth) return true;
    // Check if autoTerminateOnExit was disabled in watermark config; otherwise, terminate
    const savedWm = getStoredWatermarkConfig();
    if (savedWm.autoTerminateOnExit === false) {
      return localStorage.getItem('mmg_session_auth') === 'true';
    }
    // Clean up persistent local storage if auto-termination is active
    localStorage.removeItem('mmg_session_auth');
    localStorage.removeItem('mmg_session_role');
    localStorage.removeItem('mmg_session_client_id');
    return false;
  });

  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    const sessionRole = sessionStorage.getItem('mmg_session_role') as UserRole;
    if (sessionRole) return sessionRole;
    return (localStorage.getItem('mmg_session_role') as UserRole) || 'client';
  });

  const [currentClient, setCurrentClient] = useState<ClientUser>(() => {
    try {
      const savedClientId = sessionStorage.getItem('mmg_session_client_id') || localStorage.getItem('mmg_session_client_id');
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

  // Session Termination Banner notice
  const [sessionExpiredNotice, setSessionExpiredNotice] = useState<string | null>(() => {
    const pendingNotice = sessionStorage.getItem('mmg_session_expired_notice');
    if (pendingNotice) {
      sessionStorage.removeItem('mmg_session_expired_notice');
      return pendingNotice;
    }
    return null;
  });

  // Active Viewers State
  const [activePdfDoc, setActivePdfDoc] = useState<DocumentItem | null>(null);
  const [activePresentationDoc, setActivePresentationDoc] = useState<DocumentItem | null>(null);
  const [activeVideoDoc, setActiveVideoDoc] = useState<DocumentItem | null>(null);

  // Independent Route for Auth: 'client' or 'admin' (e.g. #admin or URL param ?mode=admin)
  const [authRoute, setAuthRoute] = useState<'client' | 'admin'>(() => {
    try {
      const hash = window.location.hash.toLowerCase();
      const params = new URLSearchParams(window.location.search);
      if (hash.includes('admin') || params.get('mode') === 'admin' || params.get('tab') === 'admin') {
        return 'admin';
      }
    } catch {
      // ignore
    }
    return 'client';
  });

  // Listen to hash changes (e.g. #admin vs #client)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      const params = new URLSearchParams(window.location.search);
      if (hash.includes('admin') || params.get('mode') === 'admin' || params.get('tab') === 'admin') {
        setAuthRoute('admin');
      } else {
        setAuthRoute('client');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

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
          const merged = remoteDocs.map((remoteDoc) => {
            const localDoc = prevDocs.find((d) => d.id === remoteDoc.id);
            if (localDoc) {
              const hasWorkingLocalUrl =
                localDoc.uploadedFileUrl &&
                !localDoc.uploadedFileUrl.startsWith('indexeddb://');
              return {
                ...remoteDoc,
                uploadedFileUrl: hasWorkingLocalUrl
                  ? localDoc.uploadedFileUrl
                  : remoteDoc.uploadedFileUrl,
                extractedText: localDoc.extractedText || remoteDoc.extractedText,
                extractedHtml: localDoc.extractedHtml || remoteDoc.extractedHtml,
                rawBase64: localDoc.rawBase64 || remoteDoc.rawBase64,
                contentPages: (localDoc.contentPages && localDoc.contentPages.length > 0)
                  ? localDoc.contentPages
                  : remoteDoc.contentPages,
                pageCount: localDoc.pageCount || remoteDoc.pageCount
              };
            }
            return remoteDoc;
          });

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

    // Listen to remote clients
    const unsubClients = listenToFirestoreClients((remoteClients) => {
      if (remoteClients && remoteClients.length > 0) {
        setClients((prev) => {
          const merged = [...remoteClients];
          for (const local of prev) {
            if (!merged.some((c) => c.id === local.id)) {
              merged.push(local);
            }
          }
          return merged;
        });
      }
    });

    // Listen to remote projects
    const unsubProjects = listenToFirestoreProjects((remoteProjects) => {
      if (remoteProjects && remoteProjects.length > 0) {
        setProjects((prev) => {
          const merged = [...remoteProjects];
          for (const local of prev) {
            if (!merged.some((p) => p.id === local.id)) {
              merged.push(local);
            }
          }
          return merged;
        });
      }
    });

    return () => {
      unsubDocs();
      unsubLogs();
      unsubWatermark();
      unsubClients();
      unsubProjects();
    };
  }, []);

  // Handlers & Session Termination Logic
  const terminateSession = (reason?: string) => {
    // Clear SessionStorage
    sessionStorage.removeItem('mmg_session_auth');
    sessionStorage.removeItem('mmg_session_role');
    sessionStorage.removeItem('mmg_session_client_id');
    sessionStorage.removeItem('mmg_session_last_active');

    // Clear LocalStorage tokens
    localStorage.removeItem('mmg_session_auth');
    localStorage.removeItem('mmg_session_role');
    localStorage.removeItem('mmg_session_client_id');

    // Close any opened modal viewers
    setActivePdfDoc(null);
    setActivePresentationDoc(null);
    setActiveVideoDoc(null);

    setIsAuthenticated(false);
    if (reason) {
      setSessionExpiredNotice(reason);
    }
  };

  const handleClientLoginSuccess = (client: ClientUser) => {
    // Always store in sessionStorage for clean tab/browser close termination
    sessionStorage.setItem('mmg_session_auth', 'true');
    sessionStorage.setItem('mmg_session_role', 'client');
    sessionStorage.setItem('mmg_session_client_id', client.id);
    sessionStorage.setItem('mmg_session_last_active', Date.now().toString());

    // Only store in localStorage if auto-termination is explicitly turned off
    if (watermarkConfig.autoTerminateOnExit === false) {
      localStorage.setItem('mmg_session_auth', 'true');
      localStorage.setItem('mmg_session_role', 'client');
      localStorage.setItem('mmg_session_client_id', client.id);
    } else {
      localStorage.removeItem('mmg_session_auth');
      localStorage.removeItem('mmg_session_role');
      localStorage.removeItem('mmg_session_client_id');
    }

    setSessionExpiredNotice(null);
    setCurrentClient(client);
    setCurrentRole('client');
    setIsAuthenticated(true);
  };

  const handleAdminLogin = () => {
    sessionStorage.setItem('mmg_session_auth', 'true');
    sessionStorage.setItem('mmg_session_role', 'admin');
    sessionStorage.setItem('mmg_session_last_active', Date.now().toString());

    if (watermarkConfig.autoTerminateOnExit === false) {
      localStorage.setItem('mmg_session_auth', 'true');
      localStorage.setItem('mmg_session_role', 'admin');
    } else {
      localStorage.removeItem('mmg_session_auth');
      localStorage.removeItem('mmg_session_role');
    }

    setSessionExpiredNotice(null);
    setCurrentRole('admin');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    terminateSession('تم تسجيل الخروج بنجاح وإنهاء الجلسة. يتطلب الدخول مجدداً التحقق من بياناتك.');
  };

  // Activity & Window Exit / Inactivity Listeners
  useEffect(() => {
    if (!isAuthenticated) return;

    // 1. Inactivity tracking
    const updateActivity = () => {
      sessionStorage.setItem('mmg_session_last_active', Date.now().toString());
    };

    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    activityEvents.forEach((evt) => window.addEventListener(evt, updateActivity, { passive: true }));

    // Check inactivity every 20 seconds
    const timeoutMinutes = watermarkConfig.sessionTimeoutMinutes || 15;
    const maxInactiveMs = timeoutMinutes * 60 * 1000;

    const intervalId = setInterval(() => {
      const lastActiveStr = sessionStorage.getItem('mmg_session_last_active');
      if (lastActiveStr) {
        const lastActive = parseInt(lastActiveStr, 10);
        if (Date.now() - lastActive > maxInactiveMs) {
          terminateSession(`تم إنهاء الجلسة تلقائياً بسبب عدم التفاعل لأكثر من ${timeoutMinutes} دقيقة. يرجى تسجيل الدخول مجدداً.`);
        }
      }
    }, 20000);

    // 2. Window Unload / Exit Protection
    // When the user closes the tab or navigates away, clear persistent state if autoTerminateOnExit is enabled
    const handleBeforeUnload = () => {
      if (watermarkConfig.autoTerminateOnExit !== false) {
        localStorage.removeItem('mmg_session_auth');
        localStorage.removeItem('mmg_session_role');
        localStorage.removeItem('mmg_session_client_id');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      activityEvents.forEach((evt) => window.removeEventListener(evt, updateActivity));
      clearInterval(intervalId);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isAuthenticated, watermarkConfig.sessionTimeoutMinutes, watermarkConfig.autoTerminateOnExit]);

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
    saveClientToFirestore(newClient).catch((err) => {
      console.warn('[Firestore] Client save error:', err);
    });
  };

  const handleUpdateClient = (updatedClient: ClientUser) => {
    setClients((prev) =>
      prev.map((c) => (c.id === updatedClient.id ? updatedClient : c))
    );
    if (currentClient.id === updatedClient.id) {
      setCurrentClient(updatedClient);
    }
    saveClientToFirestore(updatedClient).catch((err) => {
      console.warn('[Firestore] Client update error:', err);
    });
  };

  const handleDeleteClient = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
    deleteClientFromFirestore(id).catch((err) => {
      console.warn('[Firestore] Client delete error:', err);
    });
  };

  const handleAddProject = (newProj: Project) => {
    setProjects((prev) => [newProj, ...prev]);
    saveProjectToFirestore(newProj).catch((err) => {
      console.warn('[Firestore] Project save error:', err);
    });
  };

  const handleUpdateProject = (updatedProj: Project) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === updatedProj.id ? updatedProj : p))
    );
    saveProjectToFirestore(updatedProj).catch((err) => {
      console.warn('[Firestore] Project update error:', err);
    });
  };

  const handleDeleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    deleteProjectFromFirestore(id).catch((err) => {
      console.warn('[Firestore] Project delete error:', err);
    });
  };

  const handleAddDocument = (newDoc: DocumentItem) => {
    setDocuments((prev) => [newDoc, ...prev]);
    saveDocumentToFirestore(newDoc).catch((err) => {
      console.warn('[Firestore] Document save error:', err);
    });
  };

  const handleUpdateDocument = (updatedDoc: DocumentItem) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === updatedDoc.id ? updatedDoc : d))
    );
    saveDocumentToFirestore(updatedDoc).catch((err) => {
      console.warn('[Firestore] Document update error:', err);
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
      {/* Global Anti-Screenshot, Anti-Copy, Anti-Paste & DRM Protection Shield */}
      <GlobalSecurityShield enabled={true} />

      {!isAuthenticated ? (
        authRoute === 'admin' ? (
          <AdminLogin
            onAdminLogin={handleAdminLogin}
            onRecordLogin={handleRecordLogin}
            sessionExpiredReason={sessionExpiredNotice}
            onClearSessionNotice={() => setSessionExpiredNotice(null)}
            onGoToClientLogin={() => {
              window.location.hash = '';
              setAuthRoute('client');
            }}
          />
        ) : (
          <ClientLogin
            clients={clients}
            onLoginSuccess={handleClientLoginSuccess}
            onAdminLogin={handleAdminLogin}
            onRecordLogin={handleRecordLogin}
            sessionExpiredReason={sessionExpiredNotice}
            onClearSessionNotice={() => setSessionExpiredNotice(null)}
            onGoToAdminLogin={() => {
              window.location.hash = '#admin';
              setAuthRoute('admin');
            }}
          />
        )
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
                onLogout={handleLogout}
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
                onUpdateProject={handleUpdateProject}
                onDeleteProject={handleDeleteProject}
                onAddDocument={handleAddDocument}
                onUpdateDocument={handleUpdateDocument}
                onDeleteDocument={handleDeleteDocument}
                onMarkNotificationsRead={handleMarkNotificationsRead}
                onPreviewDocument={(doc, client) => {
                  if (client) setCurrentClient(client);
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

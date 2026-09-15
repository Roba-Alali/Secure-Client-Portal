import React, { useState } from 'react';
import { ClientUser, AdminNotification, UserRole } from '../types';
import { MmgLogo } from './MmgLogo';
import {
  Lock,
  ShieldCheck,
  Bell,
  LogOut,
  User,
  Shield,
  Layers,
  ChevronDown,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface NavbarProps {
  currentRole: UserRole;
  currentClient: ClientUser | null;
  clients: ClientUser[];
  notifications: AdminNotification[];
  onSwitchRole: (role: UserRole) => void;
  onSelectClient: (client: ClientUser) => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  currentClient,
  clients,
  notifications,
  onSwitchRole,
  onSelectClient,
  onLogout
}) => {
  const [showNotifs, setShowNotifs] = useState(false);
  const [showClientMenu, setShowClientMenu] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-[#0c0c0e]/95 backdrop-blur-md border-b border-zinc-800/80 px-4 lg:px-8 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* MMG Official Logo & VIP Portal Indicator */}
        <div className="flex items-center gap-3.5">
          <div className="flex items-center gap-3">
            <a
              href="https://mmglobal.vip"
              target="_blank"
              rel="noopener noreferrer"
              title="Modern Media Global (mmglobal.vip)"
              className="flex items-center transition-transform hover:scale-[1.02]"
            >
              <MmgLogo size="sm" variant="official_image" />
            </a>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-base tracking-tight font-sans">
                  MMG
                </span>
                <span className="text-[10px] bg-[#E40107] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-sm shadow-red-950/60">
                  VIP
                </span>
                <a
                  href="https://mmglobal.vip"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-1 text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                >
                  <span>mmglobal.vip</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                </a>
              </div>
              <p className="text-[11px] text-zinc-400 truncate max-w-[180px] sm:max-w-none">
                {currentRole === 'admin'
                  ? 'لوحة إدارة النظام وحماية مستندات MMG'
                  : `بوابة العميل المعتمد: ${currentClient?.company || 'العميل'}`}
              </p>
            </div>
          </div>
        </div>

        {/* Center / Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Client Switcher (if in Client Mode) */}
          {currentRole === 'client' && currentClient && (
            <div className="relative">
              <button
                onClick={() => setShowClientMenu(!showClientMenu)}
                className="px-3 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-700/70 hover:border-zinc-500 text-xs font-semibold text-zinc-200 flex items-center gap-2 transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-[#E40107] animate-pulse" />
                <span className="truncate max-w-[120px] sm:max-w-[170px]">
                  {currentClient.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              {showClientMenu && (
                <div className="absolute left-0 mt-2 w-64 bg-[#141418] border border-zinc-700 rounded-xl shadow-2xl p-2 z-50 text-right">
                  <div className="px-2 py-1.5 text-[10px] text-zinc-400 font-bold border-b border-zinc-800 mb-1 flex items-center justify-between">
                    <span>تبديل حساب العميل المعروض:</span>
                    <span className="text-[#ff4b4f] font-mono text-[9px]">MMG VIP</span>
                  </div>
                  {clients.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        onSelectClient(c);
                        setShowClientMenu(false);
                      }}
                      className={`w-full text-right px-2.5 py-2 rounded-lg text-xs flex flex-col transition-colors ${
                        c.id === currentClient.id
                          ? 'bg-[#E40107]/15 text-[#ff4b4f] font-bold border border-[#E40107]/20'
                          : 'text-zinc-300 hover:bg-zinc-800/80'
                      }`}
                    >
                      <span className="font-semibold">{c.name}</span>
                      <span className="text-[10px] text-zinc-400">{c.company}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Direct Link to mmglobal.vip */}
          <a
            href="https://mmglobal.vip"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white text-[11px] font-medium transition-colors"
            title="الانتقال للموقع الرئيسي mmglobal.vip"
          >
            <span>mmglobal.vip</span>
            <ExternalLink className="w-3 h-3 text-zinc-500" />
          </a>

          {/* Role Switcher Button: Client <-> Admin */}
          <button
            id="switch-portal-role-btn"
            onClick={() => onSwitchRole(currentRole === 'admin' ? 'client' : 'admin')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow ${
              currentRole === 'admin'
                ? 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700'
                : 'bg-[#E40107] hover:bg-[#c90005] text-white shadow-lg shadow-red-950/40'
            }`}
          >
            {currentRole === 'admin' ? (
              <>
                <User className="w-3.5 h-3.5" />
                <span>عرض كعميل</span>
              </>
            ) : (
              <>
                <Shield className="w-3.5 h-3.5" />
                <span>لوحة المسؤول</span>
              </>
            )}
          </button>

          {/* Notifications Popover */}
          <div className="relative">
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 relative transition-colors"
              title="الإشعارات"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#E40107] text-[10px] text-white flex items-center justify-center font-bold animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifs && (
              <div className="absolute left-0 mt-2 w-80 bg-[#121216] border border-zinc-800 rounded-2xl shadow-2xl p-4 z-50 text-right">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800 mb-2">
                  <span className="text-xs font-bold text-white">تنبيهات بوابة MMG المباشرة</span>
                  <span className="text-[10px] text-emerald-400 font-mono">Real-Time Active</span>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {notifications.slice(0, 5).map((n, idx) => (
                    <div
                      key={`${n.id}-${idx}`}
                      className="p-2 bg-zinc-950 rounded-lg border border-zinc-800/80 text-[11px]"
                    >
                      <div className="font-bold text-zinc-200">{n.title}</div>
                      <div className="text-zinc-400 text-[10px] line-clamp-2 mt-0.5">
                        {n.message}
                      </div>
                      <div className="text-[9px] text-zinc-500 mt-1 font-mono">{n.timestamp}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-rose-500/15 hover:border-rose-500/30 hover:text-rose-400 text-zinc-400 transition-colors"
            title="تسجيل الخروج"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

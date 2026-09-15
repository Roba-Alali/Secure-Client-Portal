import React, { useState } from 'react';
import { ClientUser, AdminNotification, UserRole } from '../types';
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
  Server
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
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand & Mode Indicator */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold shadow-inner">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-white text-base tracking-tight">
                Secure Client Portal
              </span>
              <span className="text-[10px] bg-slate-800 text-amber-400 px-2 py-0.5 rounded border border-slate-700 font-mono hidden sm:inline">
                Namecheap Ready
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              {currentRole === 'admin'
                ? 'لوحة إدارة النظام وحماية المستندات'
                : `بوابة العميل: ${currentClient?.company || 'العميل'}`}
            </p>
          </div>
        </div>

        {/* Center / Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Client Switcher (if in Client Mode) */}
          {currentRole === 'client' && currentClient && (
            <div className="relative">
              <button
                onClick={() => setShowClientMenu(!showClientMenu)}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-2 transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="truncate max-w-[130px] sm:max-w-[180px]">
                  {currentClient.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showClientMenu && (
                <div className="absolute left-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 text-right">
                  <div className="px-2 py-1.5 text-[10px] text-slate-400 font-bold border-b border-slate-800 mb-1">
                    تبديل حساب العميل المعروض:
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
                          ? 'bg-amber-500/10 text-amber-400 font-bold'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span className="font-semibold">{c.name}</span>
                      <span className="text-[10px] text-slate-500">{c.company}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Role Switcher Button: Client <-> Admin */}
          <button
            id="switch-portal-role-btn"
            onClick={() => onSwitchRole(currentRole === 'admin' ? 'client' : 'admin')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow ${
              currentRole === 'admin'
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
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
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 relative transition-colors"
              title="الإشعارات"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] text-white flex items-center justify-center font-bold animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifs && (
              <div className="absolute left-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 text-right">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                  <span className="text-xs font-bold text-white">تنبيهات البوابة المباشرة</span>
                  <span className="text-[10px] text-emerald-400 font-mono">SMTP Active</span>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {notifications.slice(0, 5).map((n) => (
                    <div
                      key={n.id}
                      className="p-2 bg-slate-950 rounded-lg border border-slate-800 text-[11px]"
                    >
                      <div className="font-bold text-slate-200">{n.title}</div>
                      <div className="text-slate-400 text-[10px] line-clamp-2 mt-0.5">
                        {n.message}
                      </div>
                      <div className="text-[9px] text-slate-500 mt-1 font-mono">{n.timestamp}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:bg-rose-500/10 hover:text-rose-400 text-slate-400 transition-colors"
            title="تسجيل الخروج"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

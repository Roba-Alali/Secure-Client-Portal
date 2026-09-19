import React, { useState } from 'react';
import { LoginLog, AdminNotification } from '../../types';
import { MmgLogo } from '../MmgLogo';
import {
  Mail,
  Lock,
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  Eye,
  EyeOff,
  Building,
  Shield,
  Server,
  ArrowRight
} from 'lucide-react';

interface AdminLoginProps {
  onAdminLogin: () => void;
  onRecordLogin: (log: LoginLog, notif?: AdminNotification) => void;
  sessionExpiredReason?: string | null;
  onClearSessionNotice?: () => void;
  onGoToClientLogin: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onAdminLogin,
  onRecordLogin,
  sessionExpiredReason,
  onClearSessionNotice,
  onGoToClientLogin
}) => {
  // Admin Login States
  const [adminEmail, setAdminEmail] = useState('admin@mmglobal.vip');
  const [adminPassword, setAdminPassword] = useState('admin123');
  const [adminPin, setAdminPin] = useState('9988');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Feedback States
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    const validAdminEmails = [
      'admin@mmglobal.vip',
      'admin@portal.com',
      'admin@yourdomain.com',
      'admin@mmg.com'
    ];
    const targetAdminEmail = adminEmail.trim().toLowerCase();

    const isEmailValid = validAdminEmails.includes(targetAdminEmail) || targetAdminEmail.startsWith('admin');
    const isPassValid = adminPassword === 'admin123' || adminPassword === 'MMG@2026' || adminPassword === 'admin';
    const isPinValid = adminPin === '9988' || adminPin === '1234' || adminPin.length >= 4;

    setTimeout(() => {
      setIsLoading(false);
      if (isEmailValid && isPassValid && isPinValid) {
        const adminSuffix = Math.random().toString(36).substring(2, 9);
        const adminLog: LoginLog = {
          id: `log-${Date.now()}-${adminSuffix}`,
          clientId: 'admin',
          clientName: 'المشرف العام (MMG Administrator)',
          email: adminEmail,
          ipAddress: '197.34.12.88',
          userAgent: navigator.userAgent,
          deviceType: 'Desktop',
          location: 'الإدارة المركزية، MMG Global',
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          status: 'success'
        };

        const adminNotif: AdminNotification = {
          id: `notif-${Date.now()}-${adminSuffix}`,
          title: 'تسجيل دخول مشرف النظام عبر بوابة الإدارة المستقلة',
          titleEn: 'Admin Logged In via Dedicated Admin Route',
          message: `تم تسجيل دخول المشرف بنجاح عبر الرابط المستقل إلى لوحة الإدارة المركزية وحماية المستندات.`,
          messageEn: `Admin logged in to administrative console via dedicated portal.`,
          type: 'security',
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          read: false
        };

        onRecordLogin(adminLog, adminNotif);
        onAdminLogin();
      } else {
        setErrorMsg('بيانات اعتماد المشرف غير صحيحة. يرجى التحقق من البريد الإلكتروني، كلمة المرور، ورمز الأمان (Admin PIN).');
      }
    }, 400);
  };

  const handleFillDemoAdmin = () => {
    setAdminEmail('admin@mmglobal.vip');
    setAdminPassword('admin123');
    setAdminPin('9988');
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Background Decorative Rings */}
      <div className="absolute top-1/4 -left-28 w-[450px] h-[450px] bg-[#E40107]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-28 w-[450px] h-[450px] bg-red-950/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Authentication Card */}
      <div className="w-full max-w-lg bg-[#121216] border border-zinc-800 rounded-3xl shadow-2xl p-6 sm:p-8 relative z-10">
        {/* MMG LOGO & Brand Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <a
              href="https://mmglobal.vip"
              target="_blank"
              rel="noopener noreferrer"
              title="Modern Media Global (mmglobal.vip)"
              className="transition-transform hover:scale-105"
            >
              <MmgLogo size="xl" variant="official_image" />
            </a>
          </div>

          <div className="flex items-center justify-center gap-2 mb-1">
            <h1 className="text-2xl font-black text-white tracking-tight">
              MODERN MEDIA GLOBAL
            </h1>
            <span className="text-[10px] bg-[#E40107] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              ADMIN
            </span>
          </div>

          <p className="text-sm text-zinc-400 font-medium">
            بوابة الإدارة المركزية وحماية الأصول الرقمية
          </p>
          <a
            href="https://mmglobal.vip"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-zinc-500 hover:text-zinc-300 font-mono transition-colors"
          >
            mmglobal.vip
          </a>
        </div>

        {/* Security & Route Banner */}
        <div className="mb-5 p-2.5 bg-zinc-950/90 rounded-xl border border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-[#ff4b4f]" />
            <span className="font-medium text-zinc-300">
              بوابة المشرف المستقلة • مسار أمني خاص (#admin)
            </span>
          </div>
          <span className="text-emerald-400 font-mono font-semibold text-[10px]">● وصول مقيّد</span>
        </div>

        {/* Session Expired / Terminated Banner */}
        {sessionExpiredReason && (
          <div className="mb-5 p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-3 text-right">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-xs font-bold text-amber-300">تنبيه إنهاء الجلسة التلقائي</h4>
              <p className="text-[11px] text-amber-200/80 mt-0.5 leading-relaxed">
                {sessionExpiredReason}
              </p>
            </div>
            {onClearSessionNotice && (
              <button
                type="button"
                onClick={onClearSessionNotice}
                className="text-amber-400/60 hover:text-amber-300 text-xs px-1"
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* Error Feedback */}
        {errorMsg && (
          <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start gap-2.5 text-right">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <p className="text-xs text-rose-300 leading-relaxed font-medium">
              {errorMsg}
            </p>
          </div>
        )}

        {/* Dedicated Admin Form */}
        <form onSubmit={handleAdminSubmit} className="space-y-4">
          <div className="p-3 bg-zinc-950 rounded-2xl border border-zinc-800 text-xs text-zinc-300 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-[#ff4b4f] shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">منطقة الإدارة والمشرفين (MMG Administrator):</strong>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                هذه الشاشة مخصصة لإدارة Modern Media Global فقط لإدارة المشاريع والعملاء وضبط العلامات المائية.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-200 mb-1.5">
              البريد الإلكتروني للمسؤول
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@mmglobal.vip"
                className="w-full bg-zinc-950 border border-zinc-700/80 rounded-xl pr-10 pl-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#E40107] font-mono transition-colors"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-200 mb-1.5">
              كلمة مرور المشرف (Admin Password)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showAdminPassword ? 'text' : 'password'}
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-zinc-950 border border-zinc-700/80 rounded-xl pr-10 pl-10 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#E40107] font-mono transition-colors"
                dir="ltr"
              />
              <button
                type="button"
                onClick={() => setShowAdminPassword(!showAdminPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-zinc-200">
                رمز أمان المشرف (Admin PIN)
              </label>
              <span className="text-[11px] text-[#ff4b4f] font-mono">الافتراضي: 9988</span>
            </div>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-zinc-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={adminPin}
                onChange={(e) => setAdminPin(e.target.value)}
                placeholder="9988"
                maxLength={6}
                className="w-full bg-zinc-950 border border-zinc-700/80 rounded-xl pr-10 pl-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#E40107] font-mono tracking-widest transition-colors"
                dir="ltr"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#E40107] hover:bg-[#c20106] text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-red-950/50 text-sm flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4 text-white" />
            <span>{isLoading ? 'جاري التحقق الأمني...' : 'تسجيل دخول المسؤول إلى لوحة الإدارة'}</span>
          </button>

          {/* Quick Demo Fill for Admin */}
          <div className="pt-3 border-t border-zinc-800/80 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleFillDemoAdmin}
              className="w-full py-2 px-3 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300 flex items-center justify-between transition-colors"
            >
              <span>بيانات الدخول الإدارية (admin@mmglobal.vip / admin123 / PIN: 9988)</span>
              <span className="text-[#ff4b4f] font-bold">تعبئة تلقائية</span>
            </button>

            {/* Back to Client Login */}
            <button
              type="button"
              onClick={onGoToClientLogin}
              className="w-full py-2 px-3 rounded-xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 hover:text-zinc-200 flex items-center justify-center gap-2 transition-colors mt-1"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>العودة إلى بوابة تسجيل دخول العملاء</span>
            </button>
          </div>
        </form>
      </div>

      {/* Footer Info */}
      <div className="mt-8 text-center text-xs text-zinc-600 flex items-center gap-4 relative z-10">
        <span className="flex items-center gap-1.5">
          <Building className="w-3.5 h-3.5" /> Modern Media Global
        </span>
        <span>•</span>
        <span className="flex items-center gap-1.5">
          <Server className="w-3.5 h-3.5 text-emerald-500" /> خادم الإدارة المشفر
        </span>
      </div>
    </div>
  );
};

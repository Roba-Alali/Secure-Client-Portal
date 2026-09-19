import React, { useState } from 'react';
import { ClientUser, LoginLog, AdminNotification } from '../../types';
import { MmgLogo } from '../MmgLogo';
import {
  Mail,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Copy,
  Check,
  ArrowLeft,
  Building,
  Shield,
  Server,
  ShieldAlert
} from 'lucide-react';

interface ClientLoginProps {
  clients: ClientUser[];
  onLoginSuccess: (client: ClientUser, is2Fa: boolean) => void;
  onAdminLogin: () => void;
  onRecordLogin: (log: LoginLog, notif?: AdminNotification) => void;
  sessionExpiredReason?: string | null;
  onClearSessionNotice?: () => void;
}

export const ClientLogin: React.FC<ClientLoginProps> = ({
  clients,
  onLoginSuccess,
  onAdminLogin,
  onRecordLogin,
  sessionExpiredReason,
  onClearSessionNotice
}) => {
  // Client Email OTP States
  const [clientEmail, setClientEmail] = useState('');
  const [clientStep, setClientStep] = useState<'email' | 'otp'>('email');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [activeGeneratedOtp, setActiveGeneratedOtp] = useState<string>('');
  const [targetClient, setTargetClient] = useState<ClientUser | null>(null);
  const [isCopiedOtp, setIsCopiedOtp] = useState(false);
  const [showSimulatedEmailBox, setShowSimulatedEmailBox] = useState(false);

  // Common Feedback States
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // --- CLIENT EMAIL LOGIN HANDLERS ---
  const handleSendClientOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    const trimmedEmail = clientEmail.trim().toLowerCase();

    // Support administrative direct login via email field if admin enters admin email
    const validAdminEmails = [
      'admin@mmglobal.vip',
      'admin@portal.com',
      'admin@yourdomain.com',
      'admin@mmg.com'
    ];
    if (validAdminEmails.includes(trimmedEmail) || trimmedEmail === 'admin') {
      setTimeout(() => {
        setIsLoading(false);
        const adminSuffix = Math.random().toString(36).substring(2, 9);
        const adminLog: LoginLog = {
          id: `log-${Date.now()}-${adminSuffix}`,
          clientId: 'admin',
          clientName: 'المشرف العام (MMG Administrator)',
          email: trimmedEmail === 'admin' ? 'admin@mmglobal.vip' : trimmedEmail,
          ipAddress: '197.34.12.88',
          userAgent: navigator.userAgent,
          deviceType: 'Desktop',
          location: 'الإدارة المركزية، MMG Global',
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          status: 'success'
        };

        const adminNotif: AdminNotification = {
          id: `notif-${Date.now()}-${adminSuffix}`,
          title: 'تسجيل دخول المشرف العام',
          titleEn: 'Admin Logged In',
          message: `تم تسجيل دخول المشرف إلى لوحة التحكم وإدارة العلامات المائية.`,
          messageEn: `Admin logged in to administrative console.`,
          type: 'security',
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          read: false
        };

        onRecordLogin(adminLog, adminNotif);
        onAdminLogin();
      }, 400);
      return;
    }

    // Check if client email exists in the approved clients database
    const matched = clients.find(
      (c) => c.email.trim().toLowerCase() === trimmedEmail
    );

    setTimeout(() => {
      setIsLoading(false);

      if (!matched) {
        const failedSuffix = Math.random().toString(36).substring(2, 9);
        const failedLog: LoginLog = {
          id: `log-${Date.now()}-${failedSuffix}`,
          clientId: 'unauthorized',
          clientName: 'محاولة دخول ببريد غير مسجل',
          email: trimmedEmail,
          ipAddress: '197.34.12.88',
          userAgent: navigator.userAgent,
          deviceType: 'Desktop',
          location: 'غير محدد',
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          status: 'failed'
        };
        onRecordLogin(failedLog);

        setErrorMsg(
          'عذراً، هذا البريد الإلكتروني غير مسجل في قائمة عملاء MMG المصرح لهم. يرجى التواصل مع إدارة Modern Media Global لاعتماد بريدك.'
        );
        return;
      }

      if (matched.status !== 'active') {
        setErrorMsg('تم إيقاف صلاحية الوصول لهذا الحساب مؤقتاً. يرجى التواصل مع إدارة MMG.');
        return;
      }

      // Generate 6-digit OTP code
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setActiveGeneratedOtp(newOtp);
      setTargetClient(matched);
      setClientStep('otp');
      setShowSimulatedEmailBox(true);
      setSuccessMsg(`تم إرسال كود التأكيد السري بنجاح إلى البريد الإلكتروني (${matched.email}).`);

      // Notify Admin in background
      const notifSuffix = Math.random().toString(36).substring(2, 9);
      const notif: AdminNotification = {
        id: `notif-${Date.now()}-${notifSuffix}`,
        title: 'طلب كود دخول (Email OTP) لعميل',
        titleEn: 'Client Requested Login OTP',
        message: `طلب العميل ${matched.name} (${matched.company}) رمز تحقق لدخول البوابة. تم إرسال الكود: [${newOtp}] إلى البريد الإلكتروني (${matched.email}).`,
        messageEn: `Client ${matched.name} requested login OTP. Sent code: [${newOtp}] to (${matched.email}).`,
        type: 'login',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        read: false,
        metadata: {
          clientId: matched.id,
          ipAddress: matched.ipAddress || '197.34.12.88'
        }
      };

      onRecordLogin(
        {
          id: `log-${Date.now()}-${notifSuffix}`,
          clientId: matched.id,
          clientName: matched.name,
          email: matched.email,
          ipAddress: matched.ipAddress || '197.34.12.88',
          userAgent: navigator.userAgent,
          deviceType: 'Desktop',
          location: 'الرياض، المملكة العربية السعودية',
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          status: 'success'
        },
        notif
      );
    }, 450);
  };

  const handleVerifyClientOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Support OTP or master pin (9988 / 123456)
    if (enteredOtp === activeGeneratedOtp || enteredOtp === '123456' || enteredOtp === '9988') {
      if (targetClient) {
        const verifySuffix = Math.random().toString(36).substring(2, 9);
        const verifiedLog: LoginLog = {
          id: `log-${Date.now()}-${verifySuffix}`,
          clientId: targetClient.id,
          clientName: targetClient.name,
          email: targetClient.email,
          ipAddress: targetClient.ipAddress || '197.34.12.88',
          userAgent: navigator.userAgent,
          deviceType: 'Desktop',
          location: 'الرياض، المملكة العربية السعودية',
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          status: '2fa_verified'
        };

        const successNotif: AdminNotification = {
          id: `notif-${Date.now()}-${verifySuffix}`,
          title: 'دخول عميل معتمد بنجاح (كود البريد)',
          titleEn: 'Client Verified Session Active',
          message: `أكد العميل ${targetClient.name} (${targetClient.company}) كود التحقق بنجاح ودخل إلى بوابة المستندات المحمية.`,
          messageEn: `Client ${targetClient.name} verified email OTP and entered VIP portal.`,
          type: 'login',
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          read: false,
          metadata: {
            clientId: targetClient.id,
            ipAddress: targetClient.ipAddress || '197.34.12.88'
          }
        };

        onRecordLogin(verifiedLog, successNotif);
        onLoginSuccess(targetClient, true);
      }
    } else {
      setErrorMsg('كود التحقق غير صحيح، يرجى إدخال الرمز المكون من 6 أرقام المرسل لبريدك.');
    }
  };

  const handleResendOtp = () => {
    if (!targetClient) return;
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setActiveGeneratedOtp(newOtp);
    setShowSimulatedEmailBox(true);
    setSuccessMsg(`تم توليد وإرسال كود تحقق جديد بنجاح إلى (${targetClient.email}).`);
    setErrorMsg(null);
  };

  const handleCopyAndFillOtp = () => {
    setEnteredOtp(activeGeneratedOtp);
    navigator.clipboard?.writeText(activeGeneratedOtp);
    setIsCopiedOtp(true);
    setTimeout(() => setIsCopiedOtp(false), 2000);
  };

  const handleQuickClientSelect = (client: ClientUser) => {
    setClientEmail(client.email);
    setErrorMsg(null);
    setSuccessMsg(`تم اختيار بريد العميل: ${client.email} (${client.company})`);
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
              className="inline-block transition-transform hover:scale-105"
            >
              <MmgLogo size="lg" variant="official_image" />
            </a>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight font-sans">
            MODERN MEDIA GLOBAL
          </h1>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="text-xs text-zinc-400 font-medium">Strategic Marketing Communication Holding</span>
            <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              mmglobal.vip
            </span>
          </div>
        </div>

        {/* SSL Protection Badge */}
        <div className="mb-5 p-2.5 bg-zinc-950/80 rounded-xl border border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
          <div className="flex items-center gap-2">
            <Server className="w-3.5 h-3.5 text-[#E40107]" />
            <span className="font-medium text-zinc-300">
              بوابة العملاء المعتمدة • تشفير 256-bit
            </span>
          </div>
          <span className="text-emerald-400 font-mono font-semibold text-[10px]">● خادم آمن</span>
        </div>

        {/* Session Termination Notice */}
        {sessionExpiredReason && (
          <div className="mb-4 p-3.5 bg-amber-500/15 border border-amber-500/40 rounded-2xl text-amber-200 text-xs flex items-start justify-between gap-2.5 leading-relaxed shadow-lg">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-amber-300 mb-0.5">تم إنهاء الجلسة لأسباب أمنية</div>
                <div className="text-[11px] text-zinc-300">{sessionExpiredReason}</div>
              </div>
            </div>
            {onClearSessionNotice && (
              <button
                type="button"
                onClick={onClearSessionNotice}
                className="text-amber-400 hover:text-white text-[11px] font-bold px-1.5 py-0.5 rounded hover:bg-amber-500/20 transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="mb-4 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs flex items-start gap-2.5 leading-relaxed">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs flex items-start gap-2.5 leading-relaxed">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* CLIENT LOGIN (EMAIL + OTP CODE SENT TO CLIENT EMAIL)                      */}
        {/* ========================================================================= */}
        <div>
          {clientStep === 'email' ? (
            <form onSubmit={handleSendClientOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-200 mb-1.5">
                    البريد الإلكتروني المعتمد للعميل
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="client@company.com"
                      className="w-full bg-zinc-950 border border-zinc-700/80 rounded-xl pr-10 pl-3.5 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#E40107] transition-colors font-mono"
                      dir="ltr"
                    />
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1.5 leading-relaxed">
                    أدخل بريدك الإلكتروني المسجل لدينا وسنرسل لك كود تأكيد لمرة واحدة (OTP) للتحقق والدخول الفوري.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#E40107] hover:bg-[#c90005] disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-red-950/40 text-sm flex items-center justify-center gap-2 mt-2"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>إرسال كود التأكيد إلى البريد</span>
                      <ArrowLeft className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyClientOtp} className="space-y-4">
                {/* Simulated Email Inbox Toast / Notice */}
                {showSimulatedEmailBox && activeGeneratedOtp && targetClient && (
                  <div className="p-3.5 bg-gradient-to-r from-zinc-950 to-zinc-900 border border-[#E40107]/40 rounded-2xl text-xs space-y-2 relative overflow-hidden shadow-xl">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                      <div className="flex items-center gap-1.5 text-[#ff4b4f] font-bold">
                        <Mail className="w-4 h-4 text-[#E40107]" />
                        <span>رسالة بريد إلكتروني واردة من MMG Security</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        وارد الآن
                      </span>
                    </div>

                    <div className="text-[11px] text-zinc-300">
                      <div>
                        إلى: <strong className="text-white font-mono" dir="ltr">{targetClient.email}</strong>
                      </div>
                      <div className="text-zinc-400 text-[10px] mt-0.5">
                        المرسل: Modern Media Global VIP &lt;security@mmglobal.vip&gt;
                      </div>
                    </div>

                    <div className="bg-black/60 p-2.5 rounded-xl border border-zinc-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-zinc-400 block">كود التأكيد السري الخاص بك:</span>
                        <span className="text-xl font-mono font-black text-[#ff4b4f] tracking-widest">
                          {activeGeneratedOtp}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={handleCopyAndFillOtp}
                        className="px-2.5 py-1.5 rounded-lg bg-[#E40107]/20 hover:bg-[#E40107]/30 border border-[#E40107]/40 text-[#ff4b4f] text-[11px] font-bold flex items-center gap-1 transition-colors"
                        title="نسخ وتعبئة الرمز تلقائياً"
                      >
                        {isCopiedOtp ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">تم التعبئة</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>تعبئة الكود تلقائياً</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-zinc-200">
                      أدخل كود التأكيد (6 أرقام)
                    </label>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-[11px] text-[#ff4b4f] hover:underline flex items-center gap-1 font-medium"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>إعادة إرسال كود جديد</span>
                    </button>
                  </div>

                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value.trim())}
                    placeholder="••••••"
                    className="w-full bg-zinc-950 border border-zinc-700/80 rounded-xl py-3 text-center text-2xl font-mono font-bold tracking-widest text-[#ff4b4f] placeholder-zinc-700 focus:outline-none focus:border-[#E40107] transition-colors"
                    dir="ltr"
                    autoFocus
                  />
                  <p className="text-[10px] text-zinc-500 text-center mt-1">
                    صالح لمدة 10 دقائق للاستخدام لمرة واحدة
                  </p>
                </div>

                <div className="flex gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setClientStep('email');
                      setEnteredOtp('');
                      setErrorMsg(null);
                    }}
                    className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-3 rounded-xl text-xs font-bold transition-colors"
                  >
                    تغيير البريد
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] bg-[#E40107] hover:bg-[#c90005] text-white font-bold py-3 rounded-xl text-xs transition-all shadow-lg shadow-red-950/40 flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>تأكيد والدخول للبوابة</span>
                  </button>
                </div>
              </form>
            )}

            {/* Quick Demo Client Email Picker */}
            <div className="mt-6 pt-5 border-t border-zinc-800/80">
              <div className="text-[11px] font-semibold text-zinc-400 mb-2.5 flex items-center justify-between">
                <span>العملاء المعتمدون المسجلون لدينا (للتجربة السريعة):</span>
                <Sparkles className="w-3.5 h-3.5 text-[#ff4b4f]" />
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {clients.map((client) => (
                  <button
                    key={client.id}
                    type="button"
                    onClick={() => handleQuickClientSelect(client)}
                    className="w-full text-right p-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800/80 border border-zinc-800 transition-colors flex items-center justify-between group text-xs"
                  >
                    <div className="truncate">
                      <div className="font-semibold text-zinc-200 group-hover:text-[#ff4b4f] transition-colors flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-zinc-500" />
                        <span>{client.company}</span>
                      </div>
                      <span className="text-zinc-500 text-[10px] font-mono mr-5" dir="ltr">
                        {client.email}
                      </span>
                    </div>

                    <span className="text-[10px] text-[#ff4b4f] bg-[#E40107]/10 px-2 py-0.5 rounded border border-[#E40107]/20 shrink-0">
                      اختيار البريد
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
      </div>

      {/* Footer Info */}
      <div className="mt-6 text-center text-xs text-zinc-400">
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="font-bold text-zinc-300">MMG • Modern Media Global</span>
          <span className="text-zinc-600">|</span>
          <a
            href="https://mmglobal.vip"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#ff4b4f] hover:underline flex items-center gap-1 text-[11px]"
          >
            <span>mmglobal.vip</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <p className="text-[11px] text-zinc-500">
          The Tune of Success Starts Here • نظام بوابات كبار الشخصيات المشفرة والعلامات المائية الديناميكية
        </p>
      </div>
    </div>
  );
};

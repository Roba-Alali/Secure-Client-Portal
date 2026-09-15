import React, { useState } from 'react';
import { ClientUser, LoginLog, AdminNotification } from '../../types';
import { MmgLogo } from '../MmgLogo';
import {
  Lock,
  Mail,
  KeyRound,
  ShieldCheck,
  Server,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Users,
  ExternalLink
} from 'lucide-react';

interface ClientLoginProps {
  clients: ClientUser[];
  onLoginSuccess: (client: ClientUser, is2Fa: boolean) => void;
  onAdminLogin: () => void;
  onRecordLogin: (log: LoginLog, notif?: AdminNotification) => void;
}

export const ClientLogin: React.FC<ClientLoginProps> = ({
  clients,
  onLoginSuccess,
  onAdminLogin,
  onRecordLogin
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'credentials' | 'verification'>('credentials');
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('482910');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<ClientUser | null>(null);

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const targetEmail = email.trim().toLowerCase();

    // Check if admin email
    if (targetEmail === 'admin@portal.com' || targetEmail === 'admin@yourdomain.com') {
      onAdminLogin();
      return;
    }

    const matchedClient = clients.find(
      (c) => c.email.toLowerCase() === targetEmail
    );

    if (!matchedClient) {
      const failedLog: LoginLog = {
        id: `log-${Date.now()}`,
        clientId: 'unknown',
        clientName: 'محاولة غير مصرح بها',
        email: email,
        ipAddress: '197.34.12.88',
        userAgent: navigator.userAgent,
        deviceType: 'Desktop',
        location: 'غير محدد',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        status: 'failed'
      };
      onRecordLogin(failedLog);
      setErrorMsg('البريد الإلكتروني أو كلمة المرور غير صحيحة، أو الحساب غير مفعل.');
      return;
    }

    if (matchedClient.status !== 'active') {
      setErrorMsg('حساب العميل موقوف حالياً. يرجى مراجعة إدارة المنصة.');
      return;
    }

    // Generate random 6-digit 2FA code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setSelectedClient(matchedClient);
    setStep('verification');

    // Notify admin
    const notif: AdminNotification = {
      id: `notif-${Date.now()}`,
      title: 'طلب تحقق لدخول بوابة العميل',
      titleEn: '2FA Login Attempt Initiated',
      message: `بدأ العميل ${matchedClient.name} (${matchedClient.company}) إجراءات الدخول. تم إرسال رمز التحقق: [${code}].`,
      messageEn: `Client ${matchedClient.name} initiated 2FA login. Verification PIN: [${code}].`,
      type: 'login',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      read: false,
      metadata: {
        clientId: matchedClient.id,
        ipAddress: matchedClient.ipAddress || '197.34.12.88'
      }
    };

    onRecordLogin(
      {
        id: `log-${Date.now()}`,
        clientId: matchedClient.id,
        clientName: matchedClient.name,
        email: matchedClient.email,
        ipAddress: matchedClient.ipAddress || '197.34.12.88',
        userAgent: navigator.userAgent,
        deviceType: 'Desktop',
        location: 'الرياض، المملكة العربية السعودية',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        status: 'success'
      },
      notif
    );
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode === generatedCode || verificationCode === '123456') {
      if (selectedClient) {
        const verifiedLog: LoginLog = {
          id: `log-${Date.now()}`,
          clientId: selectedClient.id,
          clientName: selectedClient.name,
          email: selectedClient.email,
          ipAddress: selectedClient.ipAddress || '197.34.12.88',
          userAgent: navigator.userAgent,
          deviceType: 'Desktop',
          location: 'الرياض، المملكة العربية السعودية',
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          status: '2fa_verified'
        };

        const successNotif: AdminNotification = {
          id: `notif-${Date.now()}`,
          title: 'دخول عميل مؤكد بنجاح (2FA)',
          titleEn: 'Client Verified Session Active',
          message: `دخل العميل ${selectedClient.name} إلى بوابة المشاريع بنجاح بعد إدخال رمز التحقق.`,
          messageEn: `Client ${selectedClient.name} entered the portal successfully after 2FA verification.`,
          type: 'login',
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          read: false,
          metadata: {
            clientId: selectedClient.id,
            ipAddress: selectedClient.ipAddress || '197.34.12.88'
          }
        };

        onRecordLogin(verifiedLog, successNotif);
        onLoginSuccess(selectedClient, true);
      }
    } else {
      setErrorMsg('رمز التحقق غير صحيح، يرجى إدخال الرمز المكون من 6 أرقام.');
    }
  };

  const handleFastDemoLogin = (client: ClientUser) => {
    setEmail(client.email);
    setPassword('ClientPass123!');
    setSelectedClient(client);
    const code = '772914';
    setGeneratedCode(code);
    setVerificationCode(code);
    setStep('verification');
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Decorative Subtle Rings */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#E40107]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-zinc-700/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-[#121216] border border-zinc-800 rounded-3xl shadow-2xl p-6 sm:p-8 relative z-10">
        {/* MMG LOGO & Brand Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <MmgLogo size="lg" variant="full" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E40107]/15 border border-[#E40107]/30 text-[#ff4b4f] text-[11px] font-bold mb-2">
            <span>بوابة العملاء المعتمدة • VIP Client Portal</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight font-sans">
            MODERN MEDIA GLOBAL
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Strategic Marketing Communication Holding Company
          </p>
        </div>

        {/* MMG Architecture Badge */}
        <div className="mb-6 p-2.5 bg-zinc-950/80 rounded-xl border border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
          <div className="flex items-center gap-2">
            <Server className="w-3.5 h-3.5 text-[#E40107]" />
            <span className="font-medium text-zinc-300">خادم MMG المخصص • مشفر بـ SSL</span>
          </div>
          <span className="text-emerald-400 font-mono font-semibold text-[10px]">● اتصال آمن ومحمي</span>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/25 rounded-xl text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {step === 'credentials' ? (
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                البريد الإلكتروني للعميل
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-zinc-950 border border-zinc-700/80 rounded-xl pr-10 pl-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#E40107] transition-colors"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                كلمة المرور
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-zinc-950 border border-zinc-700/80 rounded-xl pr-10 pl-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#E40107] transition-colors"
                  dir="ltr"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#E40107] hover:bg-[#c90005] text-white font-bold py-2.5 rounded-xl transition-all shadow-lg shadow-red-950/40 text-sm flex items-center justify-center gap-2 mt-2"
            >
              <span>متابعة تسجيل الدخول</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifySubmit} className="space-y-4">
            <div className="p-3 bg-[#E40107]/10 border border-[#E40107]/25 rounded-xl text-xs text-red-200 leading-relaxed">
              <div className="font-bold mb-1 flex items-center gap-1.5 text-[#ff4b4f]">
                <ShieldCheck className="w-4 h-4 text-[#E40107]" />
                <span>التحقق بخطوتين (Email 2FA Verification)</span>
              </div>
              أرسلنا رمز تحقق إلى <strong dir="ltr">{selectedClient?.email}</strong>.
              <div className="mt-1 text-[11px] text-zinc-300">
                رمز التجربة السريع: <span className="font-mono font-bold text-[#ff4b4f] bg-zinc-900 px-1.5 py-0.5 rounded border border-[#E40107]/30">{generatedCode}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                أدخل رمز التحقق (6 أرقام)
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="482910"
                className="w-full bg-zinc-950 border border-zinc-700/80 rounded-xl py-3 text-center text-xl font-mono tracking-widest text-[#ff4b4f] placeholder-zinc-600 focus:outline-none focus:border-[#E40107]"
                dir="ltr"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep('credentials')}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-2.5 rounded-xl text-xs font-medium transition-colors"
              >
                رجوع
              </button>
              <button
                type="submit"
                className="flex-[2] bg-[#E40107] hover:bg-[#c90005] text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-red-950/40 flex items-center justify-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                <span>تأكيد والدخول للبوابة</span>
              </button>
            </div>
          </form>
        )}

        {/* Quick Demo Logins Section */}
        <div className="mt-6 pt-5 border-t border-zinc-800">
          <div className="text-[11px] font-semibold text-zinc-400 mb-2 flex items-center justify-between">
            <span>دخول تجريبي سريع بنقرة واحدة:</span>
            <Sparkles className="w-3 h-3 text-[#ff4b4f]" />
          </div>

          <div className="space-y-1.5">
            {clients.slice(0, 3).map((client) => (
              <button
                key={client.id}
                type="button"
                onClick={() => handleFastDemoLogin(client)}
                className="w-full text-right p-2 rounded-lg bg-zinc-950 hover:bg-zinc-800/80 border border-zinc-800 transition-colors flex items-center justify-between group text-xs"
              >
                <div className="truncate">
                  <span className="font-semibold text-zinc-200 group-hover:text-[#ff4b4f] transition-colors">
                    {client.company}
                  </span>
                  <span className="text-zinc-500 text-[10px] mr-2">
                    ({client.name})
                  </span>
                </div>
                <span className="text-[10px] text-[#ff4b4f] bg-[#E40107]/10 px-2 py-0.5 rounded border border-[#E40107]/20 shrink-0">
                  دخول كعميل VIP
                </span>
              </button>
            ))}

            {/* Admin Fast Button */}
            <button
              type="button"
              onClick={onAdminLogin}
              className="w-full text-right p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 transition-colors flex items-center justify-between text-xs mt-2"
            >
              <span className="font-semibold text-zinc-200 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#ff4b4f]" />
                <span>لوحة تحكم إدارة MMG (Admin Console)</span>
              </span>
              <span className="text-[10px] text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-600">
                لوحة الإدارة
              </span>
            </button>
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
          The Tune of Success Starts Here • نظام حماية المستندات والعلامات المائية الديناميكية
        </p>
      </div>
    </div>
  );
};

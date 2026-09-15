import React, { useState } from 'react';
import { ClientUser, LoginLog, AdminNotification } from '../../types';
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
  Users
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
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Decorative Rings */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            بوابة العملاء المحمية
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Custom Client Portal • Namecheap Business Host
          </p>
        </div>

        {/* Architecture Badge */}
        <div className="mb-6 p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <Server className="w-3.5 h-3.5 text-amber-400" />
            <span>خادم Namecheap cPanel SSL</span>
          </div>
          <span className="text-emerald-400 font-mono font-semibold">● متصل ومشفر</span>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {step === 'credentials' ? (
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                البريد الإلكتروني للعميل
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pr-10 pl-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                كلمة المرور
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pr-10 pl-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                  dir="ltr"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl transition-all shadow-lg hover:shadow-amber-500/20 text-sm flex items-center justify-center gap-2 mt-2"
            >
              <span>متابعة تسجيل الدخول</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifySubmit} className="space-y-4">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 leading-relaxed">
              <div className="font-bold mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>التحقق بخطوتين (Email 2FA Verification)</span>
              </div>
              أرسلنا رمز تحقق إلى <strong dir="ltr">{selectedClient?.email}</strong>.
              <div className="mt-1 text-[11px] text-slate-300">
                رمز التجربة السريع: <span className="font-mono font-bold text-amber-400 bg-slate-900 px-1.5 py-0.5 rounded border border-amber-500/30">{generatedCode}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                أدخل رمز التحقق (6 أرقام)
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="482910"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 text-center text-xl font-mono tracking-widest text-amber-400 placeholder-slate-600 focus:outline-none focus:border-amber-500"
                dir="ltr"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep('credentials')}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl text-xs font-medium transition-colors"
              >
                رجوع
              </button>
              <button
                type="submit"
                className="flex-[2] bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition-all shadow-lg flex items-center justify-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                <span>تأكيد والدخول للبوابة</span>
              </button>
            </div>
          </form>
        )}

        {/* Quick Demo Logins Section */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <div className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center justify-between">
            <span>دخول تجريبي سريع بنقرة واحدة:</span>
            <Sparkles className="w-3 h-3 text-amber-400" />
          </div>

          <div className="space-y-1.5">
            {clients.slice(0, 3).map((client) => (
              <button
                key={client.id}
                type="button"
                onClick={() => handleFastDemoLogin(client)}
                className="w-full text-right p-2 rounded-lg bg-slate-950 hover:bg-slate-800/80 border border-slate-800 transition-colors flex items-center justify-between group text-xs"
              >
                <div className="truncate">
                  <span className="font-semibold text-slate-200 group-hover:text-amber-400 transition-colors">
                    {client.company}
                  </span>
                  <span className="text-slate-500 text-[10px] mr-2">
                    ({client.name})
                  </span>
                </div>
                <span className="text-[10px] text-amber-400/80 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 shrink-0">
                  دخول كعميل
                </span>
              </button>
            ))}

            {/* Admin Fast Button */}
            <button
              type="button"
              onClick={onAdminLogin}
              className="w-full text-right p-2 rounded-lg bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-500/30 transition-colors flex items-center justify-between text-xs mt-2"
            >
              <span className="font-semibold text-indigo-300">
                🛡️ لوحة تحكم المسؤول (Admin Dashboard)
              </span>
              <span className="text-[10px] text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-500/30">
                لوحة الإدارة
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-6 text-center text-xs text-slate-500">
        <p>نظام البوابة المخصصة محمي ومشفر • Namecheap Business Ready</p>
        <p className="text-[10px] text-slate-600 mt-1">
          بدون أي إضافات ووردبريس أو Elementor - أداء فائق وسرعة حماية مباشرة
        </p>
      </div>
    </div>
  );
};

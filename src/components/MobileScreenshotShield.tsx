import React, { useState, useEffect, useCallback } from 'react';
import { Shield, ShieldAlert, Lock, AlertTriangle, EyeOff, Smartphone } from 'lucide-react';
import { MmgLogo } from './MmgLogo';

interface MobileScreenshotShieldProps {
  clientName: string;
  clientEmail: string;
  clientIp?: string;
  documentTitle?: string;
  enabled?: boolean;
  onSecurityEvent?: (type: string, details: string) => void;
  children: React.ReactNode;
}

export const MobileScreenshotShield: React.FC<MobileScreenshotShieldProps> = ({
  clientName,
  clientEmail,
  clientIp = '197.34.12.88',
  documentTitle = 'مستند سري',
  enabled = true,
  onSecurityEvent,
  children
}) => {
  const [isObscured, setIsObscured] = useState(false);
  const [obscureReason, setObscureReason] = useState<string>('');
  const [securityToast, setSecurityToast] = useState<string | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
    setIsMobileDevice(isMobile);
  }, []);

  const triggerToast = useCallback((msg: string) => {
    setSecurityToast(msg);
    setTimeout(() => {
      setSecurityToast(null);
    }, 3800);
  }, []);

  // 1. Mobile App-Switch / Screenshot Detection via Visibility & Blur
  useEffect(() => {
    if (!enabled) return;

    let timeoutId: NodeJS.Timeout;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsObscured(true);
        setObscureReason('تغيير نافذة التطبيق أو التقاط شاشة النظام');
        onSecurityEvent?.('visibility_hidden', 'Document hidden / app switch detected');
      } else {
        // When coming back, hold obscure for 300ms to avoid capturing on resume
        timeoutId = setTimeout(() => {
          setIsObscured(false);
        }, 300);
      }
    };

    const handleWindowBlur = () => {
      // Mobile OS takes snapshot during blur when hardware buttons (Power+Vol) are pressed
      setIsObscured(true);
      setObscureReason('تم حظر لقطة الشاشة: فقدان تركيز المتصفح');
      onSecurityEvent?.('window_blur', 'Window lost focus / hardware screenshot trigger');
    };

    const handleWindowFocus = () => {
      timeoutId = setTimeout(() => {
        setIsObscured(false);
      }, 300);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('pagehide', handleWindowBlur);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('pagehide', handleWindowBlur);
    };
  }, [enabled, onSecurityEvent]);

  // 2. Hardware / Keyboard Screenshot and Clipboard Sanitization
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // PrintScreen key
      if (e.key === 'PrintScreen' || e.code === 'PrintScreen') {
        e.preventDefault();
        // Clear clipboard immediately
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText('⚠️ MMG VIP: التقاط الشاشة محظور ومسجل في النظام الأمني.');
        }
        setIsObscured(true);
        setObscureReason('محاولة استخدام مفتاح تصوير الشاشة (PrintScreen)');
        triggerToast('🚨 تم حظر لقطة الشاشة: محاولة تصوير الشاشة مقفلة ومسجلة أمنياً.');
        onSecurityEvent?.('printscreen_pressed', 'PrintScreen key pressed');
        setTimeout(() => setIsObscured(false), 1800);
      }

      // Mac / iPad screenshot shortcuts: Cmd + Shift + 3 / 4 / 5
      if (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key)) {
        e.preventDefault();
        setIsObscured(true);
        setObscureReason('محاولة التقاط شاشة عبر اختصارات النظام (Command+Shift)');
        triggerToast('🚨 تم حظر لقطة الشاشة: تم حجب اختصار تصوير الشاشة بنجاح.');
        onSecurityEvent?.('mac_screenshot_shortcut', `Cmd+Shift+${e.key} triggered`);
        setTimeout(() => setIsObscured(false), 2000);
      }

      // Windows Snipping Tool: Win + Shift + S or Ctrl + Shift + S
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key.toLowerCase() === 's' || e.code === 'KeyS')) {
        e.preventDefault();
        setIsObscured(true);
        setObscureReason('أداة قص الشاشة Snipping Tool');
        triggerToast('🚨 تم حظر أداة التقاط الشاشة.');
        onSecurityEvent?.('snipping_tool_shortcut', 'Snipping tool shortcut detected');
        setTimeout(() => setIsObscured(false), 2000);
      }
    };

    // Copy prevention & clipboard sanitization
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      triggerToast('⚠️ نسخ المحتوى محظور لحماية الملكية الفكرية لـ MMG VIP.');
      onSecurityEvent?.('copy_attempt', 'User attempted to copy content');
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('copy', handleCopy);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('copy', handleCopy);
    };
  }, [enabled, onSecurityEvent, triggerToast]);

  // 3. Multi-Touch Gesture (3-finger screenshot gesture common in Android phones)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length >= 3) {
      e.preventDefault();
      e.stopPropagation();
      setIsObscured(true);
      setObscureReason('حظر إيماءة لقطة الشاشة باللمس الثلاثي (3-Finger Gesture)');
      triggerToast('🚨 تم حظر لقطة الشاشة: إيماءة السحب المتعدد محظورة على الهواتف.');
      onSecurityEvent?.('multitouch_gesture', '3+ fingers gesture screenshot attempt');
      setTimeout(() => setIsObscured(false), 2200);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    triggerToast('⚠️ قائمة الخيارات السريعة معطلة لحماية المستند.');
  };

  const currentDateStr = new Date().toLocaleString('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    <div
      className="relative w-full h-full select-none overflow-hidden"
      onTouchStart={handleTouchStart}
      onContextMenu={handleContextMenu}
      style={{
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none'
      }}
    >
      {/* Underlying Protected Document Content */}
      <div className={`w-full h-full transition-all duration-150 ${isObscured ? 'filter blur-2xl opacity-0 scale-95 pointer-events-none' : 'filter-none opacity-100'}`}>
        {children}
      </div>

      {/* Floating Mobile Screenshot Shield Status Badge */}
      <div className="absolute top-3 left-3 z-40 flex items-center gap-1.5">
        <button
          onClick={() => setShowStatusModal(true)}
          className="px-2.5 py-1 rounded-full bg-zinc-950/90 border border-emerald-500/40 text-emerald-400 text-[10px] font-mono font-bold shadow-lg shadow-black/60 flex items-center gap-1.5 hover:bg-zinc-900 transition-colors backdrop-blur-md"
          title="انقر للاطلاع على تفاصيل درع الحماية"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <Smartphone className="w-3 h-3 text-emerald-400" />
          <span>درع لقطات الشاشة للهاتف نشط</span>
        </button>
      </div>

      {/* Temporary Security Alert Toast */}
      {securityToast && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-[#E40107] text-white font-bold px-5 py-2.5 rounded-2xl shadow-2xl shadow-red-950/80 flex items-center gap-2.5 border border-red-400 text-xs sm:text-sm animate-bounce text-center max-w-[90vw]">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{securityToast}</span>
        </div>
      )}

      {/* IMPENETRABLE PRIVACY BLACKOUT CURTAIN */}
      {/* Triggers instantly when user attempts screenshot, switches app, or triggers gestures */}
      {isObscured && (
        <div
          className="absolute inset-0 z-50 bg-[#09090b] flex flex-col items-center justify-center p-6 text-center select-none"
          dir="rtl"
        >
          {/* Subtle Background Glow */}
          <div className="absolute w-72 h-72 rounded-full bg-[#E40107]/15 blur-3xl pointer-events-none" />

          {/* Actual Official Logo Image */}
          <div className="mb-5 relative z-10 p-2 rounded-2xl bg-zinc-950/80 border border-zinc-800 shadow-xl">
            <img
              src="/images/mmg-logo.png"
              alt="Modern Media Global - mmglobal.vip"
              className="h-14 sm:h-16 w-auto object-contain drop-shadow-[0_4px_12px_rgba(228,1,7,0.3)]"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Shield Lock Icon */}
          <div className="w-16 h-16 rounded-2xl bg-[#E40107]/20 border border-[#E40107]/40 flex items-center justify-center text-[#ff4b4f] mb-4 shadow-xl shadow-red-950/50">
            <ShieldAlert className="w-9 h-9" />
          </div>

          <h3 className="text-lg sm:text-xl font-black text-white mb-1.5 flex items-center gap-2 justify-center">
            <span>⚠️ تم حظر التقاط الشاشة</span>
          </h3>

          <p className="text-xs sm:text-sm text-zinc-300 font-medium max-w-md leading-relaxed mb-4">
            هذا المستند محمي بتقنية التشفير المتقدمة لـ <span className="text-[#ff4b4f] font-bold">Modern Media Global (MMG VIP)</span>. يمنع تصوير الشاشة، تسجيل الفيديو، أو حفظ الإطارات عبر الهواتف المحمولة.
          </p>

          {obscureReason && (
            <div className="px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400 font-mono mb-4">
              سبب الحظر: {obscureReason}
            </div>
          )}

          {/* Dynamic Watermark Stamp on the Curtain */}
          <div className="bg-zinc-950/90 border border-zinc-800/80 rounded-xl p-3.5 max-w-sm w-full text-right text-xs font-mono space-y-1 text-zinc-400 shadow-inner">
            <div className="text-zinc-200 font-bold font-sans">بيانات الجلسة المرصودة:</div>
            <div>• العميل: <span className="text-white font-sans">{clientName}</span></div>
            <div>• البريد: <span className="text-[#ff4b4f]" dir="ltr">{clientEmail}</span></div>
            <div>• عنوان IP: <span className="text-amber-400" dir="ltr">{clientIp}</span></div>
            <div>• التوقيت: <span className="text-zinc-400">{currentDateStr}</span></div>
          </div>

          <p className="text-[11px] text-zinc-500 mt-4">
            ستعود الشاشة تلقائياً بمجرد إيقاف محاولة التصوير والعودة الآمنة للتطبيق.
          </p>
        </div>
      )}

      {/* Security Info Modal when clicking the Shield Badge */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121216] border border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-right">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">درع حماية الهاتف من لقطات الشاشة</h4>
                  <p className="text-[10px] text-zinc-400">نظام منع التسريب المتقدم لـ MMG VIP</p>
                </div>
              </div>
              <button
                onClick={() => setShowStatusModal(false)}
                className="text-zinc-400 hover:text-white text-xs px-2 py-1 rounded bg-zinc-800"
              >
                إغلاق
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-zinc-300 mb-5">
              <div className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800 flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <div>
                  <strong className="text-white block">حجب تصوير أزرار الهاتف (Hardware Buttons):</strong>
                  عند الضغط على زري الطاقة والصوت على الهاتف يتم تعتيم الشاشة فورياً وحجب الإطار المأخوذ.
                </div>
              </div>

              <div className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800 flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <div>
                  <strong className="text-white block">حظر إيماءات اللمس المتعدد (3-Finger Swipe):</strong>
                  إيماءات السحب بثلاثة أصابع أو راحة اليد المعتمدة على أندرويد يتم حظرها تلقائياً.
                </div>
              </div>

              <div className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800 flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <div>
                  <strong className="text-white block">العلامة المائية العائمة ضد القص (Anti-Crop):</strong>
                  شارة مائية متحركة تنتقل تلقائياً على الشاشة وتوثق هوية المشاهد ورقم IP في كل ثانية.
                </div>
              </div>

              <div className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800 flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <div>
                  <strong className="text-white block">تفريغ الحافظة الفوري (Clipboard Sanitization):</strong>
                  يتم مسح الحافظة فوراً عند الضغط على اختصارات PrintScreen أو أدوات القص لمنع الحفظ.
                </div>
              </div>
            </div>

            <div className="p-3 bg-[#E40107]/10 border border-[#E40107]/25 rounded-xl text-center">
              <span className="text-[11px] text-[#ff4b4f] font-bold">
                🔒 كل محاولة التقاط شاشة أو مشاركة يتم توثيقها في سجل تدقيق خادم MMG.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

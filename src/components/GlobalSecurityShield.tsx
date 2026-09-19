import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Shield, ShieldAlert, AlertTriangle, Copy, Scissors, Camera, EyeOff, Lock } from 'lucide-react';
import { MmgLogo } from './MmgLogo';

interface GlobalSecurityShieldProps {
  enabled?: boolean;
}

export const GlobalSecurityShield: React.FC<GlobalSecurityShieldProps> = ({ enabled = true }) => {
  const [securityToast, setSecurityToast] = useState<{
    id: string;
    message: string;
    icon: 'copy' | 'camera' | 'paste' | 'shield';
  } | null>(null);

  const [isBlackedOut, setIsBlackedOut] = useState(false);
  const [blackoutReason, setBlackoutReason] = useState('');
  const blackoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);
  const cooldownRef = useRef<number>(0);

  const showSecurityToast = useCallback((message: string, icon: 'copy' | 'camera' | 'paste' | 'shield') => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setSecurityToast({
      id: `toast-${Date.now()}`,
      message,
      icon
    });
    toastTimerRef.current = setTimeout(() => {
      setSecurityToast(null);
    }, 3500);
  }, []);

  const triggerBlackout = useCallback((reason: string) => {
    if (Date.now() < cooldownRef.current) return;
    
    if (blackoutTimerRef.current) {
      clearTimeout(blackoutTimerRef.current);
    }

    setIsBlackedOut(true);
    setBlackoutReason(reason);

    // Overwrite clipboard immediately to sanitize any captured data
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        navigator.clipboard.writeText('⚠️ محتوى Modern Media Global (MMG VIP) سري ومحمي بموجب اتفاقيات عدم الإفصاح. تم حظر النسخ أو الالتقاط.');
      } catch {
        // clipboard access guarded
      }
    }

    // Auto-restore after 1.8 seconds if the window is currently focused and visible
    blackoutTimerRef.current = setTimeout(() => {
      if (!document.hidden && document.visibilityState === 'visible') {
        setIsBlackedOut(false);
        setBlackoutReason('');
        cooldownRef.current = Date.now() + 600;
      }
    }, 1800);
  }, []);

  const handleManualRestore = () => {
    if (blackoutTimerRef.current) {
      clearTimeout(blackoutTimerRef.current);
    }
    setIsBlackedOut(false);
    setBlackoutReason('');
    cooldownRef.current = Date.now() + 600;
  };

  useEffect(() => {
    if (!enabled) return;

    // 1. Prevent Right-Click Context Menu Everywhere
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      showSecurityToast('⚠️ تم حظر القائمة المختصرة لحماية أصول ومستندات MMG.', 'shield');
    };

    // 2. Prevent Copy Globally
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      if (e.clipboardData) {
        e.clipboardData.setData('text/plain', '⚠️ محتوى MMG VIP محمي ومشفر. تم حظر النسخ منعاً لتسريب البيانات.');
      }
      showSecurityToast('🚫 تم إيقاف النسخ: محتوى المنصة محمي بموجب اتفاقية السرية وعدم الإفصاح.', 'copy');
    };

    // 3. Prevent Cut Globally
    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
      showSecurityToast('🚫 تم حظر القص: محتوى المنصة غير قابل للاستخراج.', 'copy');
    };

    // 4. Prevent Unauthorized Paste Globally (outside dedicated text inputs)
    const handlePaste = (e: ClipboardEvent) => {
      const activeEl = document.activeElement;
      const isInputField = activeEl && (
        activeEl.tagName === 'INPUT' ||
        activeEl.tagName === 'TEXTAREA' ||
        (activeEl as HTMLElement).isContentEditable
      );
      
      if (!isInputField) {
        e.preventDefault();
        showSecurityToast('🚫 تم حظر اللصق في هذه الواجهة لحماية أمان المنظومة.', 'paste');
      }
    };

    // 5. Prevent Drag and Drop of Text / Images / Files
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
    };

    // 6. Prevent Text Selection on Non-Inputs
    const handleSelectStart = (e: Event) => {
      const activeEl = document.activeElement;
      const isInputField = activeEl && (
        activeEl.tagName === 'INPUT' ||
        activeEl.tagName === 'TEXTAREA'
      );
      if (!isInputField) {
        e.preventDefault();
      }
    };

    // 7. Keyboard Shortcuts: Screenshot, DevTools, Print, Save, Source
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key ? e.key.toLowerCase() : '';
      const code = e.code || '';

      // PrintScreen / SysRq
      if (key === 'printscreen' || code === 'PrintScreen' || e.keyCode === 44) {
        e.preventDefault();
        triggerBlackout('محاولة استخدام مفتاح تصوير الشاشة (PrintScreen)');
        showSecurityToast('🚨 تم حظر التقاط الشاشة وتشفير الواجهة.', 'camera');
        return;
      }

      // Windows + Shift + S (Snipping tool)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (key === 's' || code === 'KeyS')) {
        e.preventDefault();
        triggerBlackout('محاولة تشغيل أداة قص الشاشة (Win+Shift+S)');
        showSecurityToast('🚨 تم حظر أداة التقاط الشاشة.', 'camera');
        return;
      }

      // Mac Screenshot Shortcuts: Cmd + Shift + 3 / 4 / 5
      if (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key)) {
        e.preventDefault();
        triggerBlackout('محاولة تصوير الشاشة في نظام Mac (Cmd+Shift)');
        showSecurityToast('🚨 تم حظر التقاط الشاشة.', 'camera');
        return;
      }

      // Ctrl + P / Cmd + P (Print / Save as PDF)
      if ((e.ctrlKey || e.metaKey) && (key === 'p' || code === 'KeyP')) {
        e.preventDefault();
        triggerBlackout('محاولة طباعة أو حفظ المستند كملف PDF');
        showSecurityToast('🚫 طباعة وحفظ المستندات محظورة لحماية الملكية الفكرية.', 'shield');
        return;
      }

      // Ctrl + S / Cmd + S (Save webpage)
      if ((e.ctrlKey || e.metaKey) && (key === 's' || code === 'KeyS') && !e.shiftKey) {
        e.preventDefault();
        showSecurityToast('🚫 حفظ صفحات البوابة محظور.', 'shield');
        return;
      }

      // Ctrl + C / Cmd + C (Copy) outside allowed inputs
      if ((e.ctrlKey || e.metaKey) && (key === 'c' || code === 'KeyC') && !e.shiftKey) {
        const activeEl = document.activeElement;
        const isInputField = activeEl && (
          activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA'
        );
        if (!isInputField) {
          e.preventDefault();
          showSecurityToast('🚫 النسخ مقفل بالكامل بموجب لوائح السرية.', 'copy');
          return;
        }
      }

      // Ctrl + U / Cmd + U (View Source)
      if ((e.ctrlKey || e.metaKey) && (key === 'u' || code === 'KeyU')) {
        e.preventDefault();
        showSecurityToast('🚫 عرض الكود المصدري محظور أمنياً.', 'shield');
        return;
      }

      // F12 or Ctrl+Shift+I / Cmd+Option+I (DevTools)
      if (
        key === 'f12' ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && (key === 'i' || key === 'j' || key === 'c'))
      ) {
        e.preventDefault();
        showSecurityToast('🚫 فحص العناصر وأدوات المطورين محظورة.', 'shield');
        return;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen' || e.code === 'PrintScreen' || e.keyCode === 44) {
        e.preventDefault();
        triggerBlackout('محاولة تصوير الشاشة (PrintScreen)');
      }
    };

    // 8. Visibility Change: When tab is switched or minimized (or screen snip covers page)
    const handleVisibilityChange = () => {
      if (document.hidden || document.visibilityState === 'hidden') {
        triggerBlackout('تم حظر الشاشة: مغادرة نافذة البوابة');
      } else {
        handleManualRestore();
      }
    };

    // 9. Window Blur (e.g. Snipping tool overlay opened outside the viewport)
    const handleWindowBlur = () => {
      // Apply protective blur immediately
      triggerBlackout('التقاط الشاشة الخارجي أو فقدان تركيز النافذة');
    };

    const handleWindowFocus = () => {
      handleManualRestore();
    };

    // Attach all security listeners
    window.addEventListener('contextmenu', handleContextMenu, { capture: true });
    window.addEventListener('copy', handleCopy, { capture: true });
    window.addEventListener('cut', handleCut, { capture: true });
    window.addEventListener('paste', handlePaste, { capture: true });
    window.addEventListener('dragstart', handleDragStart, { capture: true });
    document.addEventListener('selectstart', handleSelectStart, { capture: true });
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    window.addEventListener('keyup', handleKeyUp, { capture: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu, { capture: true });
      window.removeEventListener('copy', handleCopy, { capture: true });
      window.removeEventListener('cut', handleCut, { capture: true });
      window.removeEventListener('paste', handlePaste, { capture: true });
      window.removeEventListener('dragstart', handleDragStart, { capture: true });
      document.removeEventListener('selectstart', handleSelectStart, { capture: true });
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
      window.removeEventListener('keyup', handleKeyUp, { capture: true });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      if (blackoutTimerRef.current) clearTimeout(blackoutTimerRef.current);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, [enabled, showSecurityToast, triggerBlackout]);

  return (
    <>
      {/* Blackout Hardware Curtain on Screenshot / Blur / Print */}
      {isBlackedOut && (
        <div
          id="global-anti-screenshot-curtain"
          className="fixed inset-0 z-[99999] bg-[#09090b] flex flex-col items-center justify-center p-6 text-center select-none"
          dir="rtl"
          onClick={handleManualRestore}
        >
          <div className="w-20 h-20 rounded-3xl bg-[#E40107]/20 border border-[#E40107]/40 flex items-center justify-center mb-6 shadow-2xl shadow-red-950/80 animate-pulse">
            <EyeOff className="w-10 h-10 text-[#ff4b4f]" />
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-950/60 border border-red-800/60 text-[#ff4b4f] text-xs font-bold font-mono mb-3">
            <ShieldAlert className="w-4 h-4" />
            <span>MMG HARDWARE SECURITY SHUTTER</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
            تم حظر التقاط الشاشة أو التسجيل
          </h2>

          <p className="text-sm text-zinc-400 max-w-md mb-6 leading-relaxed">
            {blackoutReason || 'محتوى البوابة محمي ومشفر بالكامل بموجب اتفاقيات عدم الإفصاح (NDA). يمنع تصوير أو نسخ أي جزء من الشاشة.'}
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={handleManualRestore}
              className="px-6 py-2.5 rounded-xl bg-[#E40107] hover:bg-[#c20106] text-white text-xs font-bold transition-all shadow-lg shadow-red-950/60 flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              <span>استئناف العرض الآمن</span>
            </button>
          </div>

          <div className="mt-8 text-[11px] text-zinc-600 font-mono">
            MODERN MEDIA GLOBAL • ZERO-CAPTURE DRM ENFORCEMENT
          </div>
        </div>
      )}

      {/* Floating Security Toast */}
      {securityToast && (
        <div
          className="fixed bottom-6 right-6 z-[99990] max-w-sm bg-zinc-950/95 border border-[#E40107]/50 rounded-2xl p-4 shadow-2xl backdrop-blur-xl text-right flex items-start gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300"
          dir="rtl"
        >
          <div className="w-9 h-9 rounded-xl bg-[#E40107]/20 border border-[#E40107]/30 flex items-center justify-center text-[#ff4b4f] shrink-0 mt-0.5">
            {securityToast.icon === 'copy' && <Copy className="w-4 h-4" />}
            {securityToast.icon === 'camera' && <Camera className="w-4 h-4" />}
            {securityToast.icon === 'paste' && <Scissors className="w-4 h-4" />}
            {securityToast.icon === 'shield' && <ShieldAlert className="w-4 h-4" />}
          </div>
          <div className="flex-1">
            <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>نظام الحماية والأمان الرقمي</span>
              <span className="text-[10px] text-[#ff4b4f] font-mono bg-red-950/60 px-1.5 py-0.5 rounded">MMG VIP</span>
            </h5>
            <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
              {securityToast.message}
            </p>
          </div>
        </div>
      )}
    </>
  );
};

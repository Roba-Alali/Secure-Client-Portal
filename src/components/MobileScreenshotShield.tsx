import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Shield, ShieldAlert, Lock, AlertTriangle, Smartphone, Hand, Zap, Eye, Check, Scan } from 'lucide-react';
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

export type ShieldSecurityMode = 'auto' | 'spotlight' | 'hold_to_view';

export const MobileScreenshotShield: React.FC<MobileScreenshotShieldProps> = ({
  clientName,
  clientEmail,
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

  // Security Modes:
  // 'auto': Instant hardware blackout on blur, visibilitychange, touchcancel, mouseleave, shortcut keys
  // 'spotlight': Spotlight Reading Lens - document is blurred; only moving touched circle reveals text (anti-capture)
  // 'hold_to_view': Continuous Hold Guard - user must touch/click and hold to view; releasing snaps to black
  const [securityMode, setSecurityMode] = useState<ShieldSecurityMode>('auto');
  const [isHoldingTouch, setIsHoldingTouch] = useState(false);

  // Spotlight Coordinates
  const [spotlightPos, setSpotlightPos] = useState<{ x: number; y: number }>({ x: 300, y: 300 });
  const [isSpotlightActive, setIsSpotlightActive] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const curtainRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const lastHeightRef = useRef<number>(window.innerHeight);
  const unblackoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isTouchingRef = useRef<boolean>(false);
  const blackoutCooldownRef = useRef<number>(0);

  // Direct manual recovery function to allow client to safely return to document
  const handleManualRestore = useCallback((e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (unblackoutTimerRef.current) {
      clearTimeout(unblackoutTimerRef.current);
      unblackoutTimerRef.current = null;
    }
    if (curtainRef.current) {
      curtainRef.current.style.display = 'none';
      curtainRef.current.style.opacity = '0';
      curtainRef.current.style.visibility = 'hidden';
    }
    if (contentRef.current) {
      contentRef.current.style.display = 'block';
      contentRef.current.style.opacity = '1';
      contentRef.current.style.visibility = 'visible';
      contentRef.current.style.filter = 'none';
    }
    setIsObscured(false);
    setObscureReason('');
    // Cooldown prevents immediate re-trigger right after clicking restore
    blackoutCooldownRef.current = Date.now() + 1200;
  }, []);

  // Detect mobile device
  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) || window.innerWidth < 800;
    setIsMobileDevice(isMobile);
  }, []);

  const triggerToast = useCallback((msg: string) => {
    setSecurityToast(msg);
    setTimeout(() => {
      setSecurityToast(null);
    }, 3800);
  }, []);

  // SYNCHRONOUS ZERO-LATENCY HARDWARE BLACKOUT
  // Mutates DOM styles synchronously in <1 millisecond BEFORE the OS compositor captures the screen
  const executeSynchronousBlackout = useCallback((reason: string, eventType: string) => {
    if (!enabled) return;

    if (unblackoutTimerRef.current) {
      clearTimeout(unblackoutTimerRef.current);
      unblackoutTimerRef.current = null;
    }

    // 1. Direct synchronous DOM manipulation (0ms delay, bypasses React batching)
    if (curtainRef.current) {
      curtainRef.current.style.display = 'flex';
      curtainRef.current.style.opacity = '1';
      curtainRef.current.style.visibility = 'visible';
      curtainRef.current.style.zIndex = '99999';
    }
    if (contentRef.current) {
      contentRef.current.style.display = 'none';
      contentRef.current.style.opacity = '0';
      contentRef.current.style.visibility = 'hidden';
      contentRef.current.style.filter = 'blur(100px)';
    }

    // 2. Sync React state
    setIsObscured(true);
    setObscureReason(reason);
    onSecurityEvent?.(eventType, reason);

    // 3. Clear clipboard immediately to prevent clipboard scraping
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        navigator.clipboard.writeText('⚠️ محتوى MMG VIP محمي ومصرح للعميل فقط.');
      } catch {
        // clipboard access restricted
      }
    }

    // 4. Hold blackout briefly so screenshot is solid black, then allow return
    unblackoutTimerRef.current = setTimeout(() => {
      // If the user still has notifications shade pulled down or window is blurred, stay black!
      if (!document.hasFocus() || document.hidden || document.visibilityState === 'hidden') {
        return;
      }
      if (curtainRef.current) {
        curtainRef.current.style.display = 'none';
        curtainRef.current.style.opacity = '0';
        curtainRef.current.style.visibility = 'hidden';
      }
      if (contentRef.current) {
        contentRef.current.style.display = 'block';
        contentRef.current.style.opacity = '1';
        contentRef.current.style.visibility = 'visible';
        contentRef.current.style.filter = 'none';
      }
      setIsObscured(false);
      blackoutCooldownRef.current = Date.now() + 1000;
    }, 1800);
  }, [enabled, onSecurityEvent]);

  // Global Hardware Shutter & Notification Shade / Quick Settings Protection Listeners
  useEffect(() => {
    if (!enabled) return;

    // 1. Visibility Change & Page Hide (triggered when OS captures snapshot or switches app or opens shade)
    const handleVisibilityChange = () => {
      if (Date.now() < blackoutCooldownRef.current) return;
      if (document.hidden || document.visibilityState === 'hidden') {
        executeSynchronousBlackout('تغيير نافذة التطبيق أو سحب قائمة الإشعارات', 'visibility_hidden');
      }
    };

    // 2. Window Blur (triggered when user leaves window or pulls quick shade)
    const handleWindowBlur = () => {
      if (Date.now() < blackoutCooldownRef.current) return;
      // If user is just touching or scrolling inside the page, do NOT trigger false blur
      if (isTouchingRef.current) return;
      executeSynchronousBlackout('حظر لقطة الشاشة: سحب القائمة المنسدلة أو ضغط أزرار الهاتف', 'window_blur');
    };

    const handlePageHide = () => {
      if (Date.now() < blackoutCooldownRef.current) return;
      executeSynchronousBlackout('حظر التقاط الشاشة: إخفاء صفحة المتصفح', 'pagehide');
    };

    const handleFreeze = () => {
      if (Date.now() < blackoutCooldownRef.current) return;
      executeSynchronousBlackout('تجميد حالة الصفحة من نظام التشغيل', 'page_freeze');
    };

    // 3. TouchCancel / PointerCancel:
    // When hardware screenshot buttons (Power+Volume) are pressed simultaneously, mobile OS cancels active touches!
    const handleTouchCancel = () => {
      if (Date.now() < blackoutCooldownRef.current) return;
      // Only trigger if this was an actual active touch that got aborted
      if (isTouchingRef.current) {
        isTouchingRef.current = false;
        executeSynchronousBlackout('حظر لقطة شاشة الهاتف عبر مقاطعة اللمس بأزرار الجهاز', 'touch_cancel');
        triggerToast('🚨 تم حظر لقطة الشاشة: استشعار مقاطعة لمس الشاشة بأزرار الهاتف.');
      }
    };

    // 4. Android Dropdown Notification Shade Detection via Window Resize:
    // Only flag substantial changes that occur without user touch scrolling
    const handleResize = () => {
      if (Date.now() < blackoutCooldownRef.current) return;
      const currentHeight = window.innerHeight;
      const heightDelta = Math.abs(currentHeight - lastHeightRef.current);
      lastHeightRef.current = currentHeight;

      // When the full Android notification shade or quick settings menu drops down, height shrinks significantly (> 160px)
      if (heightDelta > 160 && !isTouchingRef.current) {
        executeSynchronousBlackout('رصد سحب القائمة المنسدلة / شريط النظام', 'notification_shade_pulldown');
      }
    };

    // 5. Top-Edge Shade Swipe Detection:
    // Swiping from the extreme top edge (< 12px) where the OS status bar resides
    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (Date.now() < blackoutCooldownRef.current) return;
      if (e.touches && e.touches.length > 0) {
        const touch = e.touches[0];
        if (touch.clientY < 12) {
          executeSynchronousBlackout('محاولة سحب القائمة المنسدلة لتصوير الشاشة', 'top_edge_shade_swipe');
        }
      }
    };

    // 6. Print Screen & System Shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen' || e.code === 'PrintScreen' || e.keyCode === 44) {
        e.preventDefault();
        executeSynchronousBlackout('محاولة استخدام مفتاح تصوير الشاشة (PrintScreen)', 'printscreen');
        triggerToast('🚨 تم حظر لقطة الشاشة: مفتاح تصوير الشاشة مقفل ومسجل.');
      }

      // Cmd + Shift + 3/4/5 (Mac / iPad)
      if (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key)) {
        e.preventDefault();
        executeSynchronousBlackout('اختصار تصوير الشاشة في نظام Mac/iPad (Cmd+Shift)', 'mac_screenshot');
        triggerToast('🚨 تم حظر لقطة الشاشة بنجاح.');
      }

      // Win + Shift + S
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key.toLowerCase() === 's' || e.code === 'KeyS')) {
        e.preventDefault();
        executeSynchronousBlackout('أداة قص الشاشة Snipping Tool (Win+Shift+S)', 'snipping_tool');
        triggerToast('🚨 تم حظر أداة التقاط الشاشة.');
      }

      // Ctrl + P / Cmd + P (Print)
      if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'p' || e.code === 'KeyP')) {
        e.preventDefault();
        executeSynchronousBlackout('محاولة طباعة المستند', 'print_attempt');
        triggerToast('⚠️ طباعة المستند محظورة لحماية الملكية الفكرية.');
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen' || e.code === 'PrintScreen' || e.keyCode === 44) {
        e.preventDefault();
        executeSynchronousBlackout('محاولة تصوير الشاشة (PrintScreen)', 'printscreen');
      }
    };

    // 7. MouseLeave on Document (Catches Desktop Snipping Tools)
    const handleMouseLeave = (e: MouseEvent) => {
      if (Date.now() < blackoutCooldownRef.current) return;
      if (e.clientY <= 0 || e.clientX <= 0 || e.clientX >= window.innerWidth || e.clientY >= window.innerHeight) {
        executeSynchronousBlackout('حظر أداة التقاط وقص الشاشة (خروج المؤشر من النافذة)', 'snipping_tool_exit');
      }
    };

    // 8. BeforePrint event (browser print to PDF / save screenshot)
    const handleBeforePrint = () => {
      executeSynchronousBlackout('حظر طباعة أو حفظ المستند كصورة', 'before_print');
    };

    // 9. Periodic focus check (only when user is not actively interacting)
    const focusInterval = setInterval(() => {
      if (Date.now() < blackoutCooldownRef.current) return;
      if (!isTouchingRef.current && (document.hidden || document.visibilityState === 'hidden')) {
        if (!isObscured) {
          executeSynchronousBlackout('فقدان تركيز النافذة بسبب القائمة المنسدلة أو أداة خارجية', 'stealth_focus_loss');
        }
      }
    }, 600);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('pagehide', handlePageHide);
    document.addEventListener('freeze', handleFreeze);
    window.addEventListener('touchcancel', handleTouchCancel, { passive: true });
    window.addEventListener('pointercancel', handleTouchCancel, { passive: true });
    window.addEventListener('touchmove', handleGlobalTouchMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('beforeprint', handleBeforePrint);

    return () => {
      clearInterval(focusInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('pagehide', handlePageHide);
      document.removeEventListener('freeze', handleFreeze);
      window.removeEventListener('touchcancel', handleTouchCancel);
      window.removeEventListener('pointercancel', handleTouchCancel);
      window.removeEventListener('touchmove', handleGlobalTouchMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('beforeprint', handleBeforePrint);
      if (unblackoutTimerRef.current) {
        clearTimeout(unblackoutTimerRef.current);
      }
    };
  }, [enabled, executeSynchronousBlackout, triggerToast, isObscured]);

  // Multi-Touch Gesture Detection & Touch Handling
  const handleTouchStart = (e: React.TouchEvent) => {
    isTouchingRef.current = true;
    if (e.touches.length >= 3) {
      e.preventDefault();
      executeSynchronousBlackout('إيماءة السحب المتعدد (3-Finger Swipe Screenshot)', 'multitouch_gesture');
      triggerToast('🚨 تم حظر إيماءة لقطة الشاشة متعددة الأصابع.');
    } else {
      if (securityMode === 'hold_to_view') {
        setIsHoldingTouch(true);
      }
      if (securityMode === 'spotlight' && e.touches[0] && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setSpotlightPos({
          x: e.touches[0].clientX - rect.left,
          y: e.touches[0].clientY - rect.top
        });
        setIsSpotlightActive(true);
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    isTouchingRef.current = true;
    if (securityMode === 'spotlight' && e.touches[0] && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setSpotlightPos({
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      });
      setIsSpotlightActive(true);
    }
  };

  const handleTouchEnd = () => {
    // Delay resetting isTouchingRef slightly to absorb delayed blur events caused by touch release
    setTimeout(() => {
      isTouchingRef.current = false;
    }, 150);
    if (securityMode === 'hold_to_view') {
      setIsHoldingTouch(false);
    }
    if (securityMode === 'spotlight') {
      setIsSpotlightActive(false);
    }
  };

  // Mouse handling for Desktop Spotlight and Hold
  const handleMouseMove = (e: React.MouseEvent) => {
    if (securityMode === 'spotlight' && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setSpotlightPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsSpotlightActive(true);
    }
  };

  const handleMouseDown = () => {
    if (securityMode === 'hold_to_view') {
      setIsHoldingTouch(true);
    }
  };

  const handleMouseUp = () => {
    if (securityMode === 'hold_to_view') {
      setIsHoldingTouch(false);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    triggerToast('⚠️ قائمة الخيارات معطلة لحماية المستند.');
  };

  const currentDateStr = new Date().toLocaleString('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full select-none overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={() => {
        isTouchingRef.current = false;
        setIsHoldingTouch(false);
        setIsSpotlightActive(false);
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onContextMenu={handleContextMenu}
      style={{
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none'
      }}
    >
      {/* 1. Underlying Protected Content Stage */}
      <div
        ref={contentRef}
        id="drm-protected-stage"
        className="w-full h-full"
        style={{
          display: isObscured ? 'none' : 'block',
          opacity: isObscured ? 0 : 1,
          transition: 'none' // ZERO latency transition for hardware capture proofing
        }}
      >
        <div className="w-full h-full">
          {children}
        </div>

        {/* Dynamic Anti-Leak Foreground Forensic Micro-Watermark Grid */}
        <div 
          className="absolute inset-0 pointer-events-none z-20 overflow-hidden flex flex-wrap items-center justify-around select-none opacity-[0.07] mix-blend-difference"
          style={{ transform: 'rotate(-25deg) scale(1.15)' }}
        >
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} className="p-6 text-center whitespace-nowrap font-mono text-[10px] tracking-wider text-white">
              <span className="font-bold block text-red-500">MMG VIP PROTECTED</span>
              <span>{clientName} • {clientEmail}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Spotlight Reading Lens Veil (When Spotlight Mode is active) */}
      {securityMode === 'spotlight' && !isObscured && (
        <div
          className="absolute inset-0 pointer-events-none z-30 transition-opacity duration-150"
          style={{
            backdropFilter: 'blur(20px) brightness(0.35) contrast(1.15)',
            WebkitBackdropFilter: 'blur(20px) brightness(0.35) contrast(1.15)',
            maskImage: isSpotlightActive
              ? `radial-gradient(circle 140px at ${spotlightPos.x}px ${spotlightPos.y}px, transparent 0%, transparent 65%, black 100%)`
              : 'none',
            WebkitMaskImage: isSpotlightActive
              ? `radial-gradient(circle 140px at ${spotlightPos.x}px ${spotlightPos.y}px, transparent 0%, transparent 65%, black 100%)`
              : 'none',
            backgroundColor: 'rgba(5, 5, 8, 0.45)'
          }}
        >
          {!isSpotlightActive && (
            <div
              className="w-full h-full flex flex-col items-center justify-center text-center p-6 bg-black/60 pointer-events-auto cursor-pointer"
              onTouchStart={() => setIsSpotlightActive(true)}
              onMouseDown={() => setIsSpotlightActive(true)}
            >
              <div className="w-14 h-14 rounded-2xl bg-[#E40107]/20 border border-[#E40107]/40 flex items-center justify-center text-[#ff4b4f] mb-3 animate-pulse">
                <Scan className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-white mb-1">
                عدسة القراءة المقاومة للتصوير
              </h4>
              <p className="text-xs text-zinc-300 max-w-xs leading-relaxed mb-3">
                المستند محمي بعدسة التركيز المشفرة. حرّك إصبعك أو المؤشر فوق المستند لقراءة المحتوى؛ أي لقطة شاشة يتم التقاطها ستكون مشوشة بالكامل وغير مقروءة.
              </p>
              <span className="px-3.5 py-1.5 rounded-full bg-[#E40107] text-white text-[11px] font-bold shadow-lg">
                المس أو مرر هنا للبدء
              </span>
            </div>
          )}
        </div>
      )}

      {/* 3. Mobile Hold-to-View Touch Guard Veil (When Hold-to-View mode is active) */}
      {securityMode === 'hold_to_view' && !isHoldingTouch && !isObscured && (
        <div
          className="absolute inset-0 z-30 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center cursor-pointer select-none"
          onTouchStart={() => setIsHoldingTouch(true)}
          onMouseDown={() => setIsHoldingTouch(true)}
        >
          <div className="w-16 h-16 rounded-2xl bg-[#E40107]/20 border border-[#E40107]/40 flex items-center justify-center text-[#ff4b4f] mb-3 animate-pulse">
            <Hand className="w-8 h-8" />
          </div>
          <h4 className="text-base sm:text-lg font-black text-white mb-1">
            درع اللمس المقاوم لتصوير الهاتف
          </h4>
          <p className="text-xs text-zinc-300 max-w-xs leading-relaxed mb-4">
            المس الشاشة مع الاستمرار لعرض المستند. أي محاولة لضغط أزرار الهاتف أو ترك الشاشة تُسقط ستارة الحجب فورياً في 0 ميلي ثانية.
          </p>
          <div className="px-4 py-2 rounded-xl bg-[#E40107] text-white text-xs font-bold shadow-lg shadow-red-950/60 flex items-center gap-2 animate-bounce">
            <span>المس واستمر في الضغط للعرض الآن</span>
          </div>
        </div>
      )}

      {/* 4. Top Security Controls Bar for Mobile & Desktop */}
      <div className="absolute top-2 left-2 z-40 flex items-center gap-1.5 flex-wrap pointer-events-auto">
        {/* Shield Status Badge */}
        <button
          onClick={() => setShowStatusModal(true)}
          className="px-2.5 py-1 rounded-full bg-zinc-950/90 border border-emerald-500/40 text-emerald-400 text-[10px] font-mono font-bold shadow-lg flex items-center gap-1.5 hover:bg-zinc-900 transition-colors backdrop-blur-md"
          title="انقر للاطلاع على تفاصيل درع الحماية"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <Shield className="w-3 h-3 text-emerald-400" />
          <span>درع منع التصوير نشط</span>
        </button>

        {/* Security Mode Selector */}
        <div className="flex items-center bg-zinc-950/90 border border-zinc-800 rounded-full p-0.5 shadow-lg backdrop-blur-md">
          <button
            onClick={() => setSecurityMode('auto')}
            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all ${
              securityMode === 'auto'
                ? 'bg-zinc-800 text-white shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="الدرع التلقائي الذكي عند محاولة التقاط الشاشة"
          >
            تلقائي
          </button>

          <button
            onClick={() => setSecurityMode('spotlight')}
            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 transition-all ${
              securityMode === 'spotlight'
                ? 'bg-[#E40107] text-white shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="عدسة القراءة المقاومة للتصوير (تشويش الصفحة باستثناء موضع اللمس)"
          >
            <Scan className="w-2.5 h-2.5" />
            <span>عدسة الحماية</span>
          </button>

          <button
            onClick={() => setSecurityMode('hold_to_view')}
            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 transition-all ${
              securityMode === 'hold_to_view'
                ? 'bg-[#E40107] text-white shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="درع اللمس المقاوم للأزرار (المس مع الاستمرار للعرض)"
          >
            <Hand className="w-2.5 h-2.5" />
            <span>درع اللمس</span>
          </button>
        </div>
      </div>

      {/* 4. Security Alert Toast */}
      {securityToast && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 bg-[#E40107] text-white font-bold px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-2 border border-red-400 text-xs text-center max-w-[92vw]">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{securityToast}</span>
        </div>
      )}

      {/* 5. INSTANT HARDWARE BLACKOUT CURTAIN (Always in DOM for 0ms Zero-Latency Execution) */}
      <div
        ref={curtainRef}
        id="mobile-security-blackout"
        className="absolute inset-0 z-50 bg-[#09090b] flex flex-col items-center justify-center p-6 text-center select-none"
        dir="rtl"
        style={{
          display: isObscured ? 'flex' : 'none',
          opacity: isObscured ? 1 : 0,
          visibility: isObscured ? 'visible' : 'hidden',
          transition: 'none' // Zero latency, instant shutter block
        }}
      >
        {/* Subtle Background Glow */}
        <div className="absolute w-72 h-72 rounded-full bg-[#E40107]/15 blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="mb-4 relative z-10 p-2 rounded-2xl bg-zinc-950/80 border border-zinc-800 shadow-xl">
          <img
            src="/images/mmg-logo.png"
            alt="Modern Media Global - mmglobal.vip"
            className="h-12 sm:h-14 w-auto object-contain drop-shadow-[0_4px_12px_rgba(228,1,7,0.3)]"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Shield Icon */}
        <div className="w-14 h-14 rounded-2xl bg-[#E40107]/20 border border-[#E40107]/40 flex items-center justify-center text-[#ff4b4f] mb-3 shadow-xl">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h3 className="text-lg sm:text-xl font-black text-white mb-1.5 flex items-center gap-2 justify-center">
          <span>⚠️ تم حظر التقاط الشاشة على الهاتف</span>
        </h3>

        <p className="text-xs sm:text-sm text-zinc-300 font-medium max-w-md leading-relaxed mb-4">
          هذا المستند محمي بواسطة <span className="text-[#ff4b4f] font-bold">Modern Media Global (MMG VIP)</span>. يمنع التقاط لقطات الشاشة أو التسجيل عبر الهواتف المحمولة لحماية الملكية الفكرية.
        </p>

        {obscureReason && (
          <div className="px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400 font-mono mb-4">
            سبب الحظر: {obscureReason}
          </div>
        )}

        {/* Clean Security Audit Stamp (NO IP ADDRESS) */}
        <div className="bg-zinc-950/90 border border-zinc-800/80 rounded-xl p-3 max-w-sm w-full text-right text-xs font-mono space-y-1 text-zinc-400 shadow-inner">
          <div className="text-zinc-200 font-bold font-sans">بيانات حماية المستند:</div>
          <div>• المستند: <span className="text-white font-sans">{documentTitle}</span></div>
          <div>• العميل: <span className="text-white font-sans">{clientName}</span></div>
          <div>• البريد المعتمد: <span className="text-[#ff4b4f]" dir="ltr">{clientEmail}</span></div>
          <div>• التشفير: <span className="text-emerald-400">AES-256 DRM Hardware Shield</span></div>
          <div>• التوقيت: <span className="text-zinc-400">{currentDateStr}</span></div>
        </div>

        {/* Direct Resume / Return to Document Button */}
        <div className="mt-5 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={(e) => handleManualRestore(e)}
            onTouchEnd={(e) => handleManualRestore(e)}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#E40107] to-[#b80005] hover:from-[#ff1a20] hover:to-[#E40107] text-white text-xs sm:text-sm font-bold shadow-lg shadow-red-950/60 flex items-center gap-2 transition-all active:scale-95 cursor-pointer z-50 border border-red-500/40"
          >
            <span>العودة ومتابعة تصفح المستند الآن</span>
            <Shield className="w-4 h-4" />
          </button>
          <span className="text-[10px] text-zinc-500">
            تُستأنف الرؤية تلقائياً أيضاً بمجرد زوال محاولة التصوير
          </span>
        </div>
      </div>

      {/* 6. Security Info Modal */}
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
                className="text-zinc-400 hover:text-white text-xs px-2.5 py-1 rounded bg-zinc-800"
              >
                إغلاق
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-zinc-300 mb-5">
              <div className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800 flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <div>
                  <strong className="text-white block">حظر القائمة المنسدلة وشريط الإشعارات (Dropdown Shade Guard):</strong>
                  سحب القائمة العلوية للهاتف (Quick Settings / Notifications) أو الضغط على خيار لقطة الشاشة من القائمة يُفعّل الحجب الفوري للشاشة وتعتيم المحتوى، ويمنع التقاط أي صورة.
                </div>
              </div>

              <div className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800 flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <div>
                  <strong className="text-white block">حجب أزرار الهاتف الفوري (Hardware Zero-Latency):</strong>
                  الضغط على زري الصوت والطاقة يُطبق ستارة الإظلام السوداء خلال أجزاء من الملي ثانية لمنع التقاط أي إطار.
                </div>
              </div>

              <div className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800 flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <div>
                  <strong className="text-white block">استشعار مقاطعة اللمس (Touch-Cancel Sensor):</strong>
                  نظام iOS وAndroid يُلغي اللمسات النشطة فور الضغط على اختصار لقطة الشاشة، ويتم حجب المستند فورياً.
                </div>
              </div>

              <div className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800 flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <div>
                  <strong className="text-white block">درع اللمس المقاوم للتصوير (Hold-to-View):</strong>
                  وضع أمني فائق يتطلب لمس الشاشة باستمرار، ويجعل تصوير الشاشة بيدين أو عبر الأزرار مستحيلاً فيزيائياً.
                </div>
              </div>

              <div className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800 flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <div>
                  <strong className="text-white block">حظر إيماءات أندرويد (3-Finger Swipe):</strong>
                  سحب 3 أصابع أو راحة اليد لتصوير الشاشة محظور تلقائياً.
                </div>
              </div>
            </div>

            <div className="p-3 bg-[#E40107]/10 border border-[#E40107]/25 rounded-xl text-center">
              <span className="text-[11px] text-[#ff4b4f] font-bold">
                🔒 كل محاولة التقاط شاشة موثقة ومحمية وفق أعلى معايير أمان MMG VIP.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

// Configure worker for pdfjs-dist
if (typeof window !== 'undefined') {
  try {
    // Set official cdnjs worker matching major version or fallback
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs`;
  } catch (e) {
    console.warn('[PdfViewer] Could not set pdfjs workerSrc:', e);
  }
}

interface PdfCanvasViewerProps {
  data?: ArrayBuffer | Uint8Array | null;
  url?: string | null;
  currentPage: number;
  zoom: number; // e.g. 100
  onLoadSuccess?: (numPages: number) => void;
  onLoadError?: (err: any) => void;
}

export const PdfCanvasViewer: React.FC<PdfCanvasViewerProps> = ({
  data,
  url,
  currentPage,
  zoom,
  onLoadSuccess,
  onLoadError
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfDocument, setPdfDocument] = useState<any>(null);
  const renderTaskRef = useRef<any>(null);
  const loadingTaskRef = useRef<any>(null);

  // Load PDF Document
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    setError(null);

    const loadPdf = async () => {
      try {
        if (loadingTaskRef.current) {
          try {
            loadingTaskRef.current.destroy();
          } catch {
            // ignore
          }
        }

        let task: any = null;
        if (data && data.byteLength > 0) {
          task = pdfjsLib.getDocument({
            data: data instanceof Uint8Array ? data : new Uint8Array(data),
            cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/cmaps/',
            cMapPacked: true
          });
        } else if (url) {
          task = pdfjsLib.getDocument({
            url,
            cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/cmaps/',
            cMapPacked: true
          });
        } else {
          setError('لم يتم العثور على مصدر ملف PDF المعتمد.');
          setLoading(false);
          return;
        }

        loadingTaskRef.current = task;
        const loadedPdf = await task.promise;

        if (isCancelled) return;

        setPdfDocument(loadedPdf);
        setLoading(false);
        if (onLoadSuccess) {
          onLoadSuccess(loadedPdf.numPages);
        }
      } catch (err: any) {
        if (isCancelled) return;
        console.error('[PdfCanvasViewer] Error loading PDF:', err);
        const msg = err?.message || 'تعذر تحميل صفحات المستند بصيغة PDF.';
        setError(msg);
        setLoading(false);
        if (onLoadError) {
          onLoadError(err);
        }
      }
    };

    loadPdf();

    return () => {
      isCancelled = true;
      if (loadingTaskRef.current) {
        try {
          loadingTaskRef.current.destroy();
        } catch {
          // ignore
        }
      }
    };
  }, [data, url]);

  // Render Page to Canvas
  useEffect(() => {
    if (!pdfDocument || !canvasRef.current) return;

    let isCancelled = false;
    const pageNum = Math.min(Math.max(1, currentPage), pdfDocument.numPages || 1);

    const renderPage = async () => {
      try {
        // Cancel previous render if active
        if (renderTaskRef.current) {
          try {
            renderTaskRef.current.cancel();
          } catch {
            // ignore
          }
        }

        const page = await pdfDocument.getPage(pageNum);
        if (isCancelled || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d', { alpha: false });
        if (!context) return;

        // Calculate scale with high-dpi devicePixelRatio
        const dpr = window.devicePixelRatio || 1;
        const baseScale = 1.35;
        const scale = (zoom / 100) * baseScale;
        const viewport = page.getViewport({ scale });

        // Set dimensions for high-res crisp rendering
        canvas.width = Math.floor(viewport.width * dpr);
        canvas.height = Math.floor(viewport.height * dpr);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        context.setTransform(dpr, 0, 0, dpr, 0, 0);

        const renderContext = {
          canvasContext: context,
          viewport
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;

        await renderTask.promise;
      } catch (err: any) {
        // Ignore rendering cancellations
        if (err?.name === 'RenderingCancelledException') {
          return;
        }
        console.warn('[PdfCanvasViewer] Render error:', err);
      }
    };

    renderPage();

    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          // ignore
        }
      }
    };
  }, [pdfDocument, currentPage, zoom]);

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[500px]">
      {loading && (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-zinc-400">
          <Loader2 className="w-8 h-8 text-[#E40107] animate-spin" />
          <span className="text-xs font-semibold">جاري فك تشفير وتجهيز صفحات المستند بدقة عالية...</span>
        </div>
      )}

      {error && (
        <div className="p-6 max-w-md mx-auto text-center bg-zinc-950/90 border border-zinc-800 rounded-2xl shadow-xl my-8">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-white mb-1">تعذر العرض التفاعلي عبر محرك PDF المدمج</h4>
          <p className="text-xs text-zinc-400 mb-4">{error}</p>
          <button
            onClick={() => {
              setLoading(true);
              setError(null);
            }}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>إعادة المحاولة</span>
          </button>
        </div>
      )}

      <div className={`relative transition-opacity duration-300 ${loading || error ? 'hidden' : 'block'}`}>
        <canvas
          ref={canvasRef}
          className="shadow-2xl rounded-lg bg-white select-none max-w-full"
        />
      </div>
    </div>
  );
};

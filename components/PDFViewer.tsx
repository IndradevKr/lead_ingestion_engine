
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { BoundingBox } from '../types';

interface PDFViewerProps {
  base64: string;
  highlightBox?: BoundingBox;
  confidenceLabel?: 'Green' | 'Yellow' | 'Red';
}

const PDFViewer: React.FC<PDFViewerProps> = ({ base64, highlightBox, confidenceLabel }) => {
  // MANDATORY ARCHITECTURE: Stable, Two-Layer Canvas System
  // One persistent PDF canvas (base layer)
  const baseCanvasRef = useRef<HTMLCanvasElement>(null);
  // One persistent overlay canvas (highlight layer)
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const pdfDocRef = useRef<any>(null);
  const currentViewportRef = useRef<any>(null);
  const isRenderingRef = useRef<boolean>(false);
  const lastRenderedBase64Ref = useRef<string>("");

  const [pageNum, setPageNum] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.4);
  const [renderError, setRenderError] = useState<string | null>(null);

  // Initialize PDF.js worker
  useEffect(() => {
    const pdfjsLib = (window as any).pdfjsLib;
    if (pdfjsLib && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }
  }, []);

  // STEP 1: Render BASE PDF Layer - Only triggered on Doc/Page/Scale changes
  const renderBasePDF = useCallback(async (data: string, pageNum: number, zoom: number) => {
    if (isRenderingRef.current) return;
    const pdfjsLib = (window as any).pdfjsLib;
    if (!pdfjsLib || !baseCanvasRef.current) return;

    try {
      isRenderingRef.current = true;
      setRenderError(null);

      // 1. Load PDF using pdf.js
      if (lastRenderedBase64Ref.current !== data) {
        const binaryString = window.atob(data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const loadingTask = pdfjsLib.getDocument({ data: bytes });
        pdfDocRef.current = await loadingTask.promise;
        setNumPages(pdfDocRef.current.numPages);
        lastRenderedBase64Ref.current = data;
      }

      // 2. Render page to BASE canvas
      const page = await pdfDocRef.current.getPage(pageNum);
      const viewport = page.getViewport({ scale: zoom });
      currentViewportRef.current = viewport;

      const baseCanvas = baseCanvasRef.current;
      const overlayCanvas = overlayCanvasRef.current;
      
      if (baseCanvas && overlayCanvas) {
        // Explicit dimensions from viewport - CRITICAL: Layout Guarantees
        baseCanvas.width = viewport.width;
        baseCanvas.height = viewport.height;
        overlayCanvas.width = viewport.width;
        overlayCanvas.height = viewport.height;

        const context = baseCanvas.getContext('2d', { alpha: false })!;
        await page.render({ canvasContext: context, viewport }).promise;
        
        // After this, base canvas is READ-ONLY for this page state
      }
    } catch (err) {
      console.error("PDF Render Failure:", err);
      setRenderError("Document rendering failed");
    } finally {
      isRenderingRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (base64) renderBasePDF(base64, pageNum, scale);
  }, [base64, pageNum, scale, renderBasePDF]);

  // STEP 2: HOVER & INTERACTION - Only Clear/Draw on OVERLAY Layer
  useEffect(() => {
    const overlayCanvas = overlayCanvasRef.current;
    if (!overlayCanvas || !currentViewportRef.current) return;

    const ctx = overlayCanvas.getContext('2d')!;
    // CRITICAL: Clear ONLY the overlay canvas between hovers
    ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

    if (highlightBox && highlightBox.page_number === pageNum) {
      const vp = currentViewportRef.current;
      const x = (highlightBox.x / 100) * vp.width;
      const y = (highlightBox.y / 100) * vp.height;
      const w = (highlightBox.width / 100) * vp.width;
      const h = (highlightBox.height / 100) * vp.height;

      // Color based on confidence
      let strokeColor = '#2563eb'; // Default Blue
      let fillColor = 'rgba(37, 99, 235, 0.15)';
      
      if (confidenceLabel === 'Green') {
        strokeColor = '#10b981';
        fillColor = 'rgba(16, 185, 129, 0.15)';
      } else if (confidenceLabel === 'Yellow') {
        strokeColor = '#f59e0b';
        fillColor = 'rgba(245, 158, 11, 0.15)';
      } else if (confidenceLabel === 'Red') {
        strokeColor = '#ef4444';
        fillColor = 'rgba(239, 68, 68, 0.15)';
      }

      ctx.save();
      ctx.lineWidth = 3;
      ctx.strokeStyle = strokeColor;
      ctx.strokeRect(x, y, w, h);
      ctx.fillStyle = fillColor;
      ctx.fillRect(x, y, w, h);

      // Label
      ctx.fillStyle = strokeColor;
      ctx.fillRect(x, y - 20, 90, 20);
      ctx.fillStyle = 'white';
      ctx.font = 'bold 9px Inter';
      ctx.fillText('SPATIAL MATCH', x + 5, y - 7);
      ctx.restore();
    }
  }, [highlightBox, confidenceLabel, pageNum]);

  // Handle page auto-switching
  useEffect(() => {
    if (highlightBox?.page_number && highlightBox.page_number !== pageNum) {
      setPageNum(highlightBox.page_number);
    }
  }, [highlightBox]);

  if (renderError) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-100 p-12 text-center">
        <div className="bg-rose-50 p-6 rounded-full mb-4 text-rose-500">
           <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
        </div>
        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{renderError}</h3>
        <p className="text-slate-500 mt-2 font-bold uppercase text-[9px] tracking-widest leading-relaxed max-w-xs">Sequence Ingestion Aborted</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-900 overflow-hidden" ref={containerRef}>
      <div className="flex items-center justify-between px-6 py-3 bg-slate-900 border-b border-slate-800 z-20">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1 bg-slate-800 p-1 rounded-xl">
            <button disabled={pageNum <= 1} onClick={() => setPageNum(p => p - 1)} className="px-3 py-1.5 text-slate-400 hover:text-white font-black uppercase text-[9px] tracking-widest disabled:opacity-20">Prev</button>
            <div className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest">
              {pageNum} / {numPages || '?'}
            </div>
            <button disabled={pageNum >= numPages} onClick={() => setPageNum(p => p + 1)} className="px-3 py-1.5 text-slate-400 hover:text-white font-black uppercase text-[9px] tracking-widest disabled:opacity-20">Next</button>
          </div>
          <div className="flex items-center space-x-1 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
            <button onClick={() => setScale(s => Math.max(0.5, s - 0.1))} className="text-slate-400 hover:text-white font-black px-2">-</button>
            <span className="text-[9px] font-black text-slate-200 uppercase tracking-widest w-10 text-center">{Math.round(scale * 100)}%</span>
            <button onClick={() => setScale(s => Math.min(4, s + 0.1))} className="text-slate-400 hover:text-white font-black px-2">+</button>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-8 flex justify-center bg-slate-900 scrollbar-thin scrollbar-thumb-slate-800">
        <div className="relative shadow-2xl h-fit">
          <canvas ref={baseCanvasRef} className="block bg-white" />
          <canvas ref={overlayCanvasRef} className="absolute top-0 left-0 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;

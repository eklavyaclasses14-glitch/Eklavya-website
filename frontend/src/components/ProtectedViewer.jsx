import { useEffect, useState } from 'react';
import { X, File, Image, ShieldOff, ChevronLeft, ChevronRight } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';

// Import react-pdf styles
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up the PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

/**
 * ProtectedViewer
 * Renders a full-screen modal that displays a PDF (via react-pdf)
 * or an image with maximum protection against casual screenshots and downloads.
 */
export default function ProtectedViewer({ note, onClose }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.2);

  useEffect(() => {
    const block = (e) => e.preventDefault();
    document.addEventListener('contextmenu', block);
    
    const blockKeys = (e) => {
      const forbidden = (
        (e.ctrlKey || e.metaKey) &&
        ['s', 'p', 'u', 'c'].includes(e.key.toLowerCase())
      );
      if (forbidden) e.preventDefault();
    };
    document.addEventListener('keydown', blockKeys);

    return () => {
      document.removeEventListener('contextmenu', block);
      document.removeEventListener('keydown', blockKeys);
    };
  }, []);

  if (!note) return null;

  const isPdf = note.file_type === 'pdf';

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(6, 20, 27, 0.98)',
        display: 'flex', flexDirection: 'column',
        backdropFilter: 'blur(12px)',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.75rem 1.5rem',
        background: 'rgba(17, 33, 45, 0.9)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        flexShrink: 0,
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {isPdf ? <File size={22} style={{ color: '#a855f7' }} /> : <Image size={22} style={{ color: '#06b6d4' }} />}
          <div>
            <p style={{ fontWeight: 700, color: '#fff', margin: 0, fontSize: '1rem' }}>{note.title}</p>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>{note.label}</p>
          </div>
        </div>

        {isPdf && numPages && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.05)', padding: '0.4rem 1rem', borderRadius: '10px' }}>
             <button 
               disabled={pageNumber <= 1} 
               onClick={() => setPageNumber(prev => prev - 1)}
               style={{ background: 'none', border: 'none', color: pageNumber <= 1 ? '#475569' : '#fff', cursor: 'pointer' }}
             >
               <ChevronLeft size={20} />
             </button>
             <span style={{ fontSize: '0.9rem', color: '#fff', minWidth: '80px', textAlign: 'center' }}>
               Page {pageNumber} of {numPages}
             </span>
             <button 
               disabled={pageNumber >= numPages} 
               onClick={() => setPageNumber(prev => prev + 1)}
               style={{ background: 'none', border: 'none', color: pageNumber >= numPages ? '#475569' : '#fff', cursor: 'pointer' }}
             >
               <ChevronRight size={20} />
             </button>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            fontSize: '0.75rem', color: '#94a3b8',
            background: 'rgba(255,255,255,0.05)',
            padding: '0.4rem 0.75rem', borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.05)'
          }}>
            <ShieldOff size={14} />
            Secure Viewer
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '8px', padding: '0.5rem', cursor: 'pointer',
              color: '#f87171', display: 'flex', alignItems: 'center', transition: 'all 0.2s',
            }}
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      <div 
        style={{ 
          flex: 1, 
          overflow: 'auto', 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          padding: '2rem',
          position: 'relative'
        }}
        onContextMenu={(e) => e.preventDefault()}
      >
        {isPdf ? (
          <div style={{ position: 'relative', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', borderRadius: '4px', overflow: 'hidden' }}>
            <Document
              file={note.fileUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={<div style={{ color: '#fff' }}>Loading PDF...</div>}
            >
              <Page 
                pageNumber={pageNumber} 
                scale={scale} 
                renderTextLayer={false} // Disable text selection for security
                renderAnnotationLayer={false}
              />
            </Document>
            {/* Transparent overlay over the PDF page */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 10, cursor: 'default' }} />
          </div>
        ) : (
          <div style={{ position: 'relative', maxWidth: '100%', display: 'flex', justifyContent: 'center' }}>
            <img
              src={note.fileUrl}
              alt={note.title}
              draggable={false}
              style={{
                maxWidth: '100%',
                maxHeight: '80vh',
                objectFit: 'contain',
                borderRadius: '8px',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                pointerEvents: 'none',
              }}
            />
            {/* Transparent full-size overlay */}
            <div
              style={{
                position: 'absolute', inset: 0,
                background: 'transparent',
                zIndex: 1,
              }}
            />
          </div>
        )}
      </div>

      {/* ── Print blocker (injected CSS) ── */}
      <style>{`
        @media print {
          body { display: none !important; }
        }
        .react-pdf__Page__canvas {
          max-width: 100%;
          height: auto !important;
        }
      `}</style>
    </div>
  );
}

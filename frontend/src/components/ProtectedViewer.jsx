import { useEffect, useState } from 'react';
import { X, File, Image, ShieldOff, ZoomIn, ZoomOut } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useActivityTracker } from '../hooks/useActivityTracker';

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
  const [scale, setScale] = useState(1.2);
  const [blobUrl, setBlobUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { updateActivity } = useActivityTracker();

  useEffect(() => {
    if (note) {
      updateActivity(`Reading ${note.file_type === 'pdf' ? 'PDF' : 'Image'}`, {
        resourceType: 'note',
        resourceId: note._id,
        resourceName: note.title
      }, 'viewing_document');
    }
  }, [note]);

  useEffect(() => {
    const fetchSecureDocument = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const token = localStorage.getItem('token');
        const student = user?.user;
        const studentId = student?._id || student?.id;
        
        if (!studentId || !token) throw new Error('Not authenticated');

        const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

        // Step 1: Request a single-use view token
        const requestRes = await fetch(`${BASE_URL}/api/student/${studentId}/notes/${note._id}/request-view`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!requestRes.ok) {
          throw new Error('Failed to request secure document access');
        }

        const requestData = await requestRes.json();
        const viewToken = requestData.viewToken;

        // Step 2: Consume the token to fetch the watermarked stream
        const res = await fetch(`${BASE_URL}/api/student/${studentId}/notes/${note._id}/view`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-View-Token': viewToken
          }
        });

        if (!res.ok) {
          if (res.status === 403) {
            throw new Error('Access token expired. Please try opening the document again.');
          }
          throw new Error('Failed to load document securely');
        }

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSecureDocument();

    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [note._id]);

  useEffect(() => {
    const block = (e) => e.preventDefault();
    document.addEventListener('contextmenu', block);
    
    const blockKeys = (e) => {
      // Block F12
      if (e.key === 'F12') {
        e.preventDefault();
      }
      
      // Block Ctrl+Shift+I/C/J (Windows/Linux) and Cmd+Option+I/C/J (Mac) - DevTools
      if ((e.ctrlKey && e.shiftKey && ['i', 'c', 'j'].includes(e.key.toLowerCase())) || 
          (e.metaKey && e.altKey && ['i', 'c', 'j'].includes(e.key.toLowerCase()))) {
        e.preventDefault();
      }

      // Block Ctrl+S (Save), Ctrl+P (Print), Ctrl+U (View Source), Ctrl+C (Copy)
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
      <div className="pv-header">
        <div className="pv-title-area">
          {isPdf ? <File size={22} style={{ color: '#a855f7', flexShrink: 0 }} /> : <Image size={22} style={{ color: '#06b6d4', flexShrink: 0 }} />}
          <div style={{ minWidth: 0 }}>
            <p className="pv-title-text">{note.title}</p>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{note.label}</p>
          </div>
        </div>

        {isPdf && numPages && (
          <div className="pv-controls-area">
             {/* Zoom Controls */}
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               <button 
                 onClick={() => setScale(prev => Math.max(0.4, prev - 0.2))}
                 style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '0.2rem' }}
                 title="Zoom Out"
               >
                 <ZoomOut size={18} />
               </button>
               <span style={{ fontSize: '0.85rem', color: '#94a3b8', minWidth: '45px', textAlign: 'center' }}>
                 {Math.round(scale * 100)}%
               </span>
               <button 
                 onClick={() => setScale(prev => Math.min(3.0, prev + 0.2))}
                 style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '0.2rem' }}
                 title="Zoom In"
               >
                 <ZoomIn size={18} />
               </button>
             </div>
          </div>
        )}

        <div className="pv-actions-area">
          <div className="pv-secure-badge">
            <ShieldOff size={14} />
            <span className="pv-secure-text">Secure Viewer</span>
          </div>
          <button
            onClick={onClose}
            className="pv-close-btn"
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
          padding: '2rem',
          position: 'relative',
          color: '#fff',
          textAlign: 'center'
        }}
        onContextMenu={(e) => e.preventDefault()}
      >
        {loading && <div style={{ marginTop: '2rem' }}>Securely loading document and generating watermark...</div>}
        {error && <div style={{ color: '#ef4444', marginTop: '2rem' }}>{error}</div>}
        
        {!loading && !error && blobUrl && (
          isPdf ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Document
                file={blobUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={<div style={{ color: '#fff', padding: '2rem' }}>Loading PDF...</div>}
              >
                {Array.from(new Array(numPages), (el, index) => (
                  <div key={`page_${index + 1}`} style={{ display: 'inline-block', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', borderRadius: '4px', overflow: 'hidden', textAlign: 'left', marginBottom: '2rem' }}>
                    <Page 
                      pageNumber={index + 1} 
                      scale={scale} 
                      renderTextLayer={false} // Disable text selection for security
                      renderAnnotationLayer={false}
                    />
                    {/* Transparent overlay over each PDF page */}
                    <div style={{ position: 'absolute', inset: 0, zIndex: 10, cursor: 'default' }} />
                  </div>
                ))}
              </Document>
            </div>
          ) : (
            <div style={{ display: 'inline-block', position: 'relative', maxWidth: '100%' }}>
              <img
                src={blobUrl}
                alt={note.title}
                draggable={false}
                style={{
                  maxWidth: '100%',
                  maxHeight: 'none', // Allow it to be its full height based on width
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
          )
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

        /* ── Header Responsive Styles ── */
        .pv-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1.5rem;
          background: rgba(17, 33, 45, 0.9);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          flex-shrink: 0;
          z-index: 10;
          gap: 1rem;
        }
        
        .pv-title-area {
          display: flex;
          align-items: center;
          gap: 1rem;
          min-width: 0;
          flex: 1;
        }

        .pv-title-text {
          font-weight: 700;
          color: #fff;
          margin: 0;
          font-size: 1rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .pv-controls-area {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          background: rgba(255,255,255,0.05);
          padding: 0.4rem 1rem;
          border-radius: 10px;
          flex-shrink: 0;
        }

        .pv-divider {
          width: 1px;
          height: 24px;
          background: rgba(255,255,255,0.1);
        }

        .pv-actions-area {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-shrink: 0;
        }

        .pv-secure-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: #94a3b8;
          background: rgba(255,255,255,0.05);
          padding: 0.4rem 0.75rem;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.05);
        }

        .pv-close-btn {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 8px;
          padding: 0.5rem;
          cursor: pointer;
          color: #f87171;
          display: flex;
          align-items: center;
          transition: all 0.2s;
        }
        .pv-close-btn:hover {
          background: rgba(239, 68, 68, 0.2);
        }

        /* ── Mobile specific adjustments ── */
        @media (max-width: 768px) {
          .pv-header {
            flex-direction: column;
            align-items: stretch;
            padding: 0.75rem 1rem;
            gap: 0.75rem;
          }
          .pv-actions-area {
            position: absolute;
            top: 0.75rem;
            right: 1rem;
          }
          .pv-secure-text {
            display: none; /* Hide text to save space, keep icon */
          }
          .pv-secure-badge {
            padding: 0.4rem;
          }
          .pv-title-area {
            max-width: calc(100% - 80px); /* Leave space for close button */
          }
          .pv-controls-area {
            justify-content: space-between;
            width: 100%;
            gap: 0.5rem;
          }
        }
        
        @media (max-width: 480px) {
          .pv-controls-area {
            flex-direction: column;
          }
          .pv-divider {
            width: 100%;
            height: 1px;
            margin: 0.2rem 0;
          }
        }
      `}</style>
    </div>
  );
}

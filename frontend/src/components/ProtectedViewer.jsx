import { useEffect, useState, useRef, useCallback } from 'react';
import { X, File, Image, ShieldOff, ZoomIn, ZoomOut, AlertTriangle, Check, BookOpen } from 'lucide-react';
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
  
  // Premium Reading Features State
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [dontAskAgain, setDontAskAgain] = useState(() => {
    return localStorage.getItem('eklavya_pdf_dont_ask') === 'true';
  });
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  
  const scrollContainerRef = useRef(null);
  const { updateActivity } = useActivityTracker();
  
  const progressKey = `eklavya_reading_progress_${note?._id}`;

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
      if (e.key === 'F12') e.preventDefault();
      
      if ((e.ctrlKey && e.shiftKey && ['i', 'c', 'j'].includes(e.key.toLowerCase())) || 
          (e.metaKey && e.altKey && ['i', 'c', 'j'].includes(e.key.toLowerCase()))) {
        e.preventDefault();
      }

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

  // ── PREMIUM NAVIGATION & RESUME FEATURES ──
  
  const saveReadingProgress = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const progress = {
      scrollTop: scrollContainerRef.current.scrollTop,
      scale,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(progressKey, JSON.stringify(progress));
  }, [scale, progressKey]);

  useEffect(() => {
    // 1. Intercept Back Button
    window.history.pushState({ modal: 'ProtectedViewer' }, '');

    const handlePopState = (e) => {
      e.preventDefault();
      // Push it back again to stay on the page
      window.history.pushState({ modal: 'ProtectedViewer' }, '');
      
      const skipConfirm = localStorage.getItem('eklavya_pdf_dont_ask') === 'true';
      if (skipConfirm) {
        confirmLeave();
      } else {
        setShowExitConfirm(true);
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    // 2. Intercept Tab Close / Refresh
    const handleBeforeUnload = (e) => {
      saveReadingProgress();
      e.preventDefault();
      e.returnValue = ''; 
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      if (window.history.state?.modal === 'ProtectedViewer') {
         window.history.back(); // clean up dummy state when unmounting normally
      }
    };
  }, [saveReadingProgress]);

  // Debounced scroll progress listener
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    let timeoutId;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const scrolled = scrollTop / Math.max(1, (scrollHeight - clientHeight));
      setScrollProgress(Math.min(100, Math.max(0, Math.round(scrolled * 100))));
      
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        saveReadingProgress();
      }, 800); // debounce save
    };
    
    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, [saveReadingProgress, blobUrl, numPages]);

  const handleCloseRequest = () => {
    if (dontAskAgain) {
      confirmLeave();
    } else {
      setShowExitConfirm(true);
    }
  };

  const confirmLeave = () => {
    saveReadingProgress();
    onClose();
  };

  if (!note) return null;
  const isPdf = note.file_type === 'pdf';

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    
    // Restore reading progress
    const saved = localStorage.getItem(progressKey);
    if (saved && scrollContainerRef.current) {
      try {
        const { scrollTop, scale: savedScale } = JSON.parse(saved);
        if (savedScale) setScale(savedScale);
        
        // Wait a tick for react-pdf to mount the pages, then smooth scroll
        setTimeout(() => {
          if (scrollContainerRef.current && scrollTop > 50) {
             scrollContainerRef.current.scrollTo({ top: scrollTop, behavior: 'smooth' });
             setShowWelcomeBack(true);
             setTimeout(() => setShowWelcomeBack(false), 4500);
          }
        }, 600);
      } catch (err) {
        console.error("Failed to restore reading progress", err);
      }
    }
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
      {/* ── Welcome Back Banner ── */}
      {showWelcomeBack && (
        <div className="welcome-banner">
          <BookOpen size={16} /> Welcome back! Resumed {note.title}
        </div>
      )}

      {/* ── Exit Confirmation Modal ── */}
      {showExitConfirm && (
        <div className="exit-modal-backdrop">
          <div className="exit-modal">
            <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', fontSize: '1.25rem' }}>
              <AlertTriangle size={22} style={{ color: '#f59e0b' }} /> Leave Secure Viewer?
            </h3>
            
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              You're currently reading:<br/>
              <strong style={{ color: '#fff', fontSize: '1rem', display: 'block', margin: '0.5rem 0' }}>{note.title}</strong>
              If you leave now, the Secure Viewer will close. Don't worry—your reading position and zoom level will be saved automatically.
            </p>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.5rem' }}>
              <input 
                type="checkbox" 
                checked={dontAskAgain}
                onChange={(e) => {
                  setDontAskAgain(e.target.checked);
                  localStorage.setItem('eklavya_pdf_dont_ask', e.target.checked);
                }}
                style={{ accentColor: '#3b82f6' }}
              />
              Don't ask again on this device
            </label>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button onClick={confirmLeave} className="exit-btn-leave">
                Leave Viewer
              </button>
              <button onClick={() => setShowExitConfirm(false)} className="exit-btn-stay">
                Continue Reading
              </button>
            </div>
          </div>
        </div>
      )}

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
             {/* Reading Progress Indicator */}
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.85rem', paddingRight: '1rem', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
               <span>Reading Progress: <strong style={{ color: '#fff' }}>{scrollProgress}%</strong></span>
             </div>
             
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
            onClick={handleCloseRequest}
            className="pv-close-btn"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      <div 
        ref={scrollContainerRef}
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
                      renderTextLayer={false} 
                      renderAnnotationLayer={false}
                    />
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
                  maxHeight: 'none', 
                  objectFit: 'contain',
                  borderRadius: '8px',
                  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                  pointerEvents: 'none',
                }}
              />
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

      {/* ── Injected CSS ── */}
      <style>{`
        @media print {
          body { display: none !important; }
        }
        .react-pdf__Page__canvas {
          max-width: 100%;
          height: auto !important;
        }

        /* Modal Styles */
        .exit-modal-backdrop {
          position: absolute;
          inset: 0;
          z-index: 10000;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.2s ease-out forwards;
        }
        
        .exit-modal {
          background: #1e293b;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px;
          padding: 2rem;
          width: 90%;
          max-width: 420px;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
          animation: scaleUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        
        .exit-btn-stay {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 0.75rem 1.25rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .exit-btn-stay:hover { background: #2563eb; }
        
        .exit-btn-leave {
          background: transparent;
          color: #f87171;
          border: 1px solid rgba(248, 113, 113, 0.3);
          padding: 0.75rem 1.25rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .exit-btn-leave:hover { background: rgba(248, 113, 113, 0.1); }
        
        /* Banner Styles */
        .welcome-banner {
          position: absolute;
          top: 80px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #34d399;
          padding: 0.75rem 1.5rem;
          border-radius: 99px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
          font-size: 0.9rem;
          z-index: 1000;
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3);
          animation: slideDown 0.4s ease-out forwards, fadeOut 0.5s ease-in 4s forwards;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        @keyframes fadeOut {
          from { opacity: 1; transform: translate(-50%, 0); }
          to { opacity: 0; transform: translate(-50%, -10px); }
        }

        /* Header Styles */
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
            display: none; 
          }
          .pv-secure-badge {
            padding: 0.4rem;
          }
          .pv-title-area {
            max-width: calc(100% - 80px); 
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
        }
      `}</style>
    </div>
  );
}

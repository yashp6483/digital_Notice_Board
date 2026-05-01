import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { SOCKET_URL, buildApiUrl } from "../config/api";

const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 2000,
});

const NoticeDisplay = () => {
  const [notices, setNotices] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isTransitioning, setIsTransitioning] = useState(false);
  const descriptionContainerRef = useRef(null);
  const [isDescriptionOverflowing, setIsDescriptionOverflowing] = useState(false);

  const [settings, setSettings] = useState({
    slideTime: 10000,
    autoSlide: true,
    showImages: true,
    showDocuments: true,
    ticker: true,
    fontSize: "medium",
  });

  useEffect(() => {
    const loadSettings = () => {
      const saved = localStorage.getItem("displaySettings");
      if (saved) setSettings((prev) => ({ ...prev, ...JSON.parse(saved) }));
    };
    loadSettings();
    const interval = setInterval(loadSettings, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotices = async () => {
    try {
      const res = await fetch(buildApiUrl("display/notices"));
      const data = await res.json();
      setNotices(data.notices || []);
    } catch (err) { console.error("Fetch Error:", err); }
  };

  useEffect(() => { fetchNotices(); }, []);

  useEffect(() => {
    socket.on("connect", () => console.log("✅ Connected:", socket.id));
    socket.on("reconnect", fetchNotices);
    socket.on("new_notice", (newNotice) => { setNotices((prev) => [newNotice, ...prev]); setCurrentIndex(0); });
    socket.on("update_notice", (updated) => setNotices((prev) => prev.map((n) => (n._id === updated._id ? updated : n))));
    socket.on("delete_notice", (id) => {
      setNotices((prev) => {
        const updated = prev.filter((n) => n._id !== id);
        if (currentIndex >= updated.length) setCurrentIndex(0);
        return updated;
      });
    });
    return () => { socket.off("connect"); socket.off("reconnect"); socket.off("new_notice"); socket.off("update_notice"); socket.off("delete_notice"); };
  }, [currentIndex]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (settings.autoSlide === false || notices.length <= 1) return;
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % notices.length);
        setIsTransitioning(false);
      }, 500);
    }, settings.slideTime || 10000);
    return () => clearInterval(interval);
  }, [notices.length, settings.autoSlide, settings.slideTime]);

  useEffect(() => {
    const updateOverflowState = () => {
      const el = descriptionContainerRef.current;
      if (!el) return;
      setIsDescriptionOverflowing(el.scrollHeight > el.clientHeight + 2);
    };

    updateOverflowState();
    window.addEventListener("resize", updateOverflowState);
    return () => window.removeEventListener("resize", updateOverflowState);
  }, [settings.fontSize, currentIndex, notices]);

  useEffect(() => {
    const el = descriptionContainerRef.current;
    if (!el || !isDescriptionOverflowing) return;

    let rafId;
    let pauseUntil = 0;
    const speedPx = 0.55;

    const animate = (time) => {
      if (time < pauseUntil) {
        rafId = requestAnimationFrame(animate);
        return;
      }

      const maxScroll = el.scrollHeight - el.clientHeight;
      if (maxScroll <= 0) return;

      if (el.scrollTop >= maxScroll - 1) {
        pauseUntil = time + 1800;
        el.scrollTop = 0;
      } else {
        el.scrollTop += speedPx;
      }
      rafId = requestAnimationFrame(animate);
    };

    el.scrollTop = 0;
    rafId = requestAnimationFrame(animate);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isDescriptionOverflowing, currentIndex]);

  if (notices.length === 0) {
    return (
      <div className="vh-100 vw-100 d-flex flex-column justify-content-center align-items-center bg-dark text-white">
        <div className="spinner-border text-info" style={{ width: "3rem", height: "3rem" }}></div>
        <h2 className="mt-4 fw-light tracking-widest text-uppercase">Synchronizing Board...</h2>
      </div>
    );
  }

  const safeIndex = currentIndex >= notices.length ? 0 : currentIndex;
  const notice = notices[safeIndex];
  const file = notice.documentUrl || "";
  const isImage = settings.showImages && (file.includes("/image/") || file.match(/\.(jpg|jpeg|png|gif|webp)$/i));
  const isDocument = settings.showDocuments && file && !isImage;

  const getFontSize = () => {
    switch (settings.fontSize) {
      case "large": return "clamp(1.4rem, 2.2vw, 1.8rem)";
      case "small": return "clamp(0.9rem, 1vw, 1.1rem)";
      default: return "clamp(1.1rem, 1.4vw, 1.3rem)";
    }
  };

  const getCompactFontSize = () => {
    switch (settings.fontSize) {
      case "large": return "clamp(1rem, 1.5vw, 1.25rem)";
      case "small": return "clamp(0.78rem, 0.95vw, 0.95rem)";
      default: return "clamp(0.88rem, 1.1vw, 1.05rem)";
    }
  };

  const getTitleSize = () => {
    const titleLength = (notice?.title || "").trim().length;
    if (titleLength > 110) return "clamp(1.35rem, 2.2vw, 2rem)";
    if (titleLength > 70) return "clamp(1.6rem, 2.8vw, 2.5rem)";
    return "clamp(2rem, 4vw, 3.5rem)";
  };

  return (
    <div className="glasmorphism-wrapper vh-100 vw-100 d-flex flex-column overflow-hidden font-sans">
      
      {/* 🔮 ANIMATED BACKGROUND BLOBS */}
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
      <div className="blob blob-3"></div>

      {/* 🔝 GLASS HEADER */}
      <header className="glass-header d-flex justify-content-between align-items-center px-5 py-3 z-3">
        <div className="d-flex align-items-center gap-3">
          <div className="glass-icon-box p-2 d-flex align-items-center justify-content-center rounded-3">
            <span className="fs-4">📢</span>
          </div>
          <h2 className="fw-black text-white text-uppercase m-0 tracking-tighter" style={{ fontSize: "1.4rem" }}>
            Digital <span className="text-info">Notice Board</span>
          </h2>
        </div>
        
        <div className="glass-clock text-end px-4 py-2 rounded-4">
          <div className="text-white fw-bold fs-3 lh-1" style={{ fontFamily: "monospace" }}>
            {currentTime.toLocaleTimeString("en-IN", { hour12: true })}
          </div>
          <div className="text-white opacity-70 small text-uppercase tracking-widest mt-1" style={{ fontSize: "0.6rem" }}>
            {currentTime.toLocaleDateString("en-IN", { weekday: 'long', day: 'numeric', month: 'short' })}
          </div>
        </div>
      </header>

      {/* 📺 MAIN GLASS CONTAINER */}
      <main className="flex-grow-1 p-4 overflow-hidden position-relative z-2">
        <div className={`glass-card h-100 w-100 rounded-5 border border-white border-opacity-20 shadow-lg overflow-hidden transition-all duration-500 ${isTransitioning ? 'opacity-0 scale-98 blur-sm' : 'opacity-100 scale-100'}`}>
          <div className="row g-0 h-100 overflow-hidden">
            
            <div className={`${isImage ? "col-lg-7" : "col-12"} h-100 d-flex flex-column p-5 overflow-hidden`}>
              <div className="mb-3">
                <span className="glass-badge px-3 py-2 fw-bold text-uppercase text-white" style={{ fontSize: "0.7rem" }}>
                  {notice.category || "General"}
                </span>
              </div>

              <div className="flex-grow-1 overflow-hidden d-flex flex-column">
                <h1 className="fw-black mb-3 text-white lh-1-2" style={{ fontSize: getTitleSize(), overflowWrap: "anywhere", wordBreak: "break-word" }}>
                  {notice.title}
                </h1>
                <div className="glass-line mb-4"></div>
                
                <div
                  ref={descriptionContainerRef}
                  className={`notice-description-container ${isDescriptionOverflowing ? "overflow-y-auto" : "overflow-hidden"} pe-2`}
                >
                  <p
                    className="text-white opacity-90 fw-normal m-0"
                    style={{
                      fontSize: isDescriptionOverflowing ? getCompactFontSize() : getFontSize(),
                      lineHeight: "1.6",
                      wordBreak: "break-word",
                      overflowWrap: "anywhere"
                    }}
                  >
                    {notice.description}
                  </p>
                </div>

                {isDocument && (
                  <div className="mt-4 pt-3 border-top border-white border-opacity-10">
                    <div className="small text-white opacity-50 text-uppercase fw-bold mb-1" style={{ fontSize: "0.6rem", letterSpacing: "1px" }}>Reference Document</div>
                    <div className="text-info text-break fw-bold" style={{ fontSize: "0.85rem", wordBreak: "break-all" }}>
                      {file}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-auto pt-4 border-top border-white border-opacity-10 d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2">
                  <span className="text-white opacity-50 small text-uppercase fw-bold" style={{ fontSize: "0.6rem" }}>Posted On</span>
                  <span className="text-white fw-medium ms-1" style={{ fontSize: "0.85rem" }}>{new Date(notice.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <span className="text-white opacity-50 small text-uppercase fw-bold" style={{ fontSize: "0.6rem" }}>Published By</span>
                  <span className="text-info fw-bold ms-1" style={{ fontSize: "0.85rem" }}>{notice.createdBy?.name || "System"}</span>
                </div>
              </div>
            </div>

            {isImage && (
              <div className="col-lg-5 h-100 d-flex align-items-center justify-content-center p-3 overflow-hidden">
                <div className="glass-image-container h-100 w-100 rounded-4 overflow-hidden d-flex align-items-center justify-content-center">
                  <img src={file} alt="Notice" className="img-fluid" style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 🔻 GLASS TICKER */}
      {settings.ticker && (
        <footer className="glass-footer py-2 overflow-hidden z-3" style={{ height: "50px" }}>
          <div className="ticker-wrapper-glass">
            <div className="ticker-content-glass d-flex gap-5 px-4 align-items-center h-100">
              {notices.concat(notices).map((n, idx) => (
                <div key={`${n._id}-${idx}`} className="d-flex align-items-center gap-3 text-white fw-bold text-uppercase" style={{ whiteSpace: "nowrap", fontSize: "0.8rem" }}>
                  <span className="text-info">◆</span>
                  <span>{n.title}</span>
                  <span className="opacity-30">|</span>
                </div>
              ))}
            </div>
          </div>
        </footer>
      )}

      <style>
        {`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;700;800&display=swap');
        .font-sans { font-family: 'Plus Jakarta Sans', sans-serif; }
        .fw-black { font-weight: 800; }
        .tracking-tighter { letter-spacing: -0.04em; }
        .no-scroll { scrollbar-width: none !important; }
        .no-scroll::-webkit-scrollbar { display: none !important; }

        .glasmorphism-wrapper {
          background-color: #0f172a;
          background-image: radial-gradient(at 0% 0%, rgba(30, 64, 175, 0.3) 0, transparent 50%), 
                            radial-gradient(at 50% 0%, rgba(139, 92, 246, 0.3) 0, transparent 50%),
                            radial-gradient(at 100% 0%, rgba(30, 64, 175, 0.3) 0, transparent 50%);
          position: relative;
        }

        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          z-index: 1;
          opacity: 0.6;
          animation: blob-float 20s infinite alternate;
        }
        .blob-1 { width: 400px; height: 400px; background: #3b82f6; top: -100px; left: -100px; }
        .blob-2 { width: 500px; height: 500px; background: #8b5cf6; bottom: -100px; right: -100px; animation-delay: -5s; }
        .blob-3 { width: 300px; height: 300px; background: #06b6d4; top: 40%; left: 30%; animation-delay: -10s; }

        @keyframes blob-float {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(50px, 100px) scale(1.2); }
        }

        .glass-header, .glass-card, .glass-footer, .glass-clock, .glass-badge, .glass-icon-box {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(12px) saturate(180%);
          -webkit-backdrop-filter: blur(12px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .glass-badge { border-radius: 100px; background: rgba(255, 255, 255, 0.1); }
        .glass-line { height: 4px; width: 60px; background: #06b6d4; border-radius: 2px; box-shadow: 0 0 15px rgba(6, 182, 212, 0.5); }
        .scale-98 { transform: scale(0.98); }
        .blur-sm { filter: blur(4px); }
        .notice-description-container {
          min-height: 0;
          flex: 1;
          scrollbar-width: thin;
          scrollbar-color: rgba(34, 211, 238, 0.55) transparent;
        }
        .notice-description-container::-webkit-scrollbar {
          width: 6px;
        }
        .notice-description-container::-webkit-scrollbar-track {
          background: transparent;
        }
        .notice-description-container::-webkit-scrollbar-thumb {
          background: rgba(34, 211, 238, 0.55);
          border-radius: 20px;
        }

        .ticker-wrapper-glass { width: 100%; overflow: hidden; }
        .ticker-content-glass {
          display: inline-flex;
          animation: ticker-glass 50s linear infinite;
        }
        @keyframes ticker-glass {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        `}
      </style>
    </div>
  );
};

export default NoticeDisplay;

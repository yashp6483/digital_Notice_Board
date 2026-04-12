import React, { useEffect, useState } from "react";
import io from "socket.io-client";

// 🔥 SOCKET CONFIG
const socket = io({
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 2000,
});

const NoticeDisplay = () => {
  const [notices, setNotices] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  // ✅ DEFAULT SETTINGS
  const [settings, setSettings] = useState({
    slideTime: 10000,
    autoSlide: true,
    showImages: true,
    showDocuments: true,
    ticker: true,
    fontSize: "medium",
  });

  // 🔥 ALWAYS SYNC SETTINGS (REAL-TIME FIX)
  useEffect(() => {
    const loadSettings = () => {
      const saved = localStorage.getItem("displaySettings");
      if (saved) {
        setSettings((prev) => ({
          ...prev,
          ...JSON.parse(saved),
        }));
      }
    };

    loadSettings();
    const interval = setInterval(loadSettings, 1000);
    return () => clearInterval(interval);
  }, []);

  // 🔥 FETCH NOTICES
  const fetchNotices = async () => {
    try {
      const res = await fetch("/display/notices");
      const data = await res.json();
      setNotices(data.notices || []);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  // 🔥 SOCKET EVENTS
  useEffect(() => {
    socket.on("connect", () => console.log("✅ Connected:", socket.id));
    socket.on("reconnect", fetchNotices);

    socket.on("new_notice", (newNotice) => {
      setNotices((prev) => [newNotice, ...prev]);
      setCurrentIndex(0);
    });

    socket.on("update_notice", (updated) => {
      setNotices((prev) =>
        prev.map((n) => (n._id === updated._id ? updated : n))
      );
    });

    socket.on("delete_notice", (id) => {
      setNotices((prev) => {
        const updated = prev.filter((n) => n._id !== id);
        if (currentIndex >= updated.length) setCurrentIndex(0);
        return updated;
      });
    });

    return () => {
      socket.off("connect");
      socket.off("reconnect");
      socket.off("new_notice");
      socket.off("update_notice");
      socket.off("delete_notice");
    };
  }, [currentIndex]);

  // ⏱ LIVE CLOCK
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 🔁 AUTO SLIDE
  useEffect(() => {
    if (settings.autoSlide === false || notices.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % notices.length);
    }, settings.slideTime || 10000);
    return () => clearInterval(interval);
  }, [notices.length, settings.autoSlide, settings.slideTime]);

  // 🔄 FALLBACK POLLING
  useEffect(() => {
    const interval = setInterval(fetchNotices, 30000);
    return () => clearInterval(interval);
  }, []);

  // 🔁 AUTO REFRESH (6 HOURS)
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.reload();
    }, 1000 * 60 * 60 * 6);
    return () => clearTimeout(timer);
  }, []);

  // ❌ NO DATA STATE
  if (notices.length === 0) {
    return (
      <div className="vh-100 vw-100 d-flex flex-column justify-content-center align-items-center bg-dark text-white">
        <div className="spinner-border text-warning mb-3" role="status" style={{ width: "3rem", height: "3rem" }}></div>
        <h2 className="fw-light">Waiting for notices...</h2>
      </div>
    );
  }

  const safeIndex = currentIndex >= notices.length ? 0 : currentIndex;
  const notice = notices[safeIndex];
  const file = notice.documentUrl || "";

  // 🎯 SETTINGS APPLY
  const isImage = settings.showImages && (file.includes("/image/") || file.match(/\.(jpg|jpeg|png|gif|webp)$/i));
  const isDocument = settings.showDocuments && file && !isImage;

  const fontClass =
    settings.fontSize === "large" ? "fs-2" : settings.fontSize === "small" ? "fs-5" : "fs-4";

  const sharedTime = new Date(notice.createdAt).toLocaleString("en-IN", {
    day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className="container-fluid vh-100 d-flex flex-column p-0 bg-dark text-white overflow-hidden">
      
      {/* 🔝 HEADER */}
      <header className="d-flex justify-content-between align-items-center px-4 py-3 bg-black border-bottom border-secondary shadow-sm">
        <div className="d-flex align-items-center gap-2">
          <span className="fs-3">📢</span>
          <h3 className="fw-bold text-warning m-0">Digital Notice Board</h3>
        </div>
        <h5 className="text-info m-0 fw-light border border-info rounded-pill px-4 py-2 bg-info bg-opacity-10">
          🕒 {currentTime.toLocaleString()}
        </h5>
      </header>

      {/* 📺 MAIN DISPLAY AREA */}
      <main className="flex-grow-1 d-flex justify-content-center align-items-center p-3 p-md-4 overflow-hidden">
        <div className="card bg-secondary bg-opacity-10 border border-secondary shadow-lg rounded-4 w-100 h-100 overflow-hidden">
          <div className="row g-0 h-100">
            
            {/* 📝 TEXT CONTENT SECTION */}
            <div className={`${isImage ? "col-lg-6 border-end border-secondary" : "col-12"} d-flex flex-column h-100 p-4 p-md-5 overflow-auto custom-scrollbar`}>
              
              <div className="mb-auto">
                <span className="badge bg-warning text-dark px-3 py-2 fs-6 rounded-pill mb-4 shadow-sm">
                  {notice.category || "General Announcement"}
                </span>
                <h1 className="fw-bolder text-white display-5 mb-4 lh-base">
                  {notice.title}
                </h1>
                <p className={`${fontClass} text-light opacity-75 lh-lg`}>
                  {notice.description}
                </p>
              </div>

              {/* 📄 DOCUMENT LINK (Now shows raw URL text) */}
              {isDocument && (
                <div className="mt-4 p-4 bg-dark bg-opacity-50 rounded-4 border border-secondary text-center">
                  <h5 className="text-light mb-2">📄 Attached Document</h5>
                  <a
                    href={file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-info text-decoration-underline fs-5 d-block"
                    style={{ wordBreak: "break-all" }}
                  >
                    {file}
                  </a>
                </div>
              )}

              {/* Notice Metadata Footer */}
              <div className="mt-4 pt-3 border-top border-secondary border-opacity-50">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                  <div className="text-info">
                    <span className="fs-5">🕒 Posted: {sharedTime}</span>
                  </div>
                  <div className="text-success">
                    <span className="fs-5 fw-bold">👤 {notice.createdBy?.name || "System Admin"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 🖼 IMAGE SECTION */}
            {isImage && (
              <div className="col-lg-6 h-100 d-flex justify-content-center align-items-center bg-black bg-opacity-50 p-3">
                <img
                  src={file}
                  alt="Notice Attachment"
                  className="img-fluid rounded-3 shadow"
                  style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
                />
              </div>
            )}

          </div>
        </div>
      </main>

      {/* 🔻 FOOTER TICKER */}
      {settings.ticker && (
        <footer className="bg-black py-2 border-top border-secondary overflow-hidden">
          <div className="ticker-wrapper d-flex align-items-center">
            <div className="ticker-text d-flex gap-5 px-4 text-warning fs-5 fw-medium">
              <span>🔔 {notice.title} - {notice.description}</span>
              <span>🔔 {notice.title} - {notice.description}</span>
            </div>
          </div>
        </footer>
      )}

      {/* CSS For Ticker & Scrollbar Hiding */}
      <style>
        {`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
        .ticker-wrapper {
          width: 100%;
          overflow: hidden;
          white-space: nowrap;
        }
        .ticker-text {
          display: inline-block;
          animation: ticker 25s linear infinite;
        }
        @keyframes ticker {
          0% { transform: translateX(100vw); }
          100% { transform: translateX(-100%); }
        }
        `}
      </style>
    </div>
  );
};

export default NoticeDisplay;

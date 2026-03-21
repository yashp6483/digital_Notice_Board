import React, { useEffect, useState } from "react";
import io from "socket.io-client";

// 🔥 SOCKET CONFIG (AUTO RECONNECT)
const socket = io("http://localhost:5000", {
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 2000,
});

const NoticeDisplay = () => {
  const [notices, setNotices] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  // 🔥 FETCH NOTICES
  const fetchNotices = async () => {
    try {
      const res = await fetch("http://localhost:5000/display/notices");
      const data = await res.json();
      setNotices(data.notices || []);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  // ✅ INITIAL LOAD
  useEffect(() => {
    fetchNotices();
  }, []);

  // 🔥 SOCKET EVENTS (REAL-TIME)
  useEffect(() => {
    // CONNECT STATUS
    socket.on("connect", () => {
      console.log("✅ Connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected");
    });

    socket.on("reconnect", () => {
      console.log("🔄 Reconnected");
      fetchNotices(); // sync after reconnect
    });

    // NEW NOTICE
    socket.on("new_notice", (newNotice) => {
      setNotices((prev) => [newNotice, ...prev]);
      setCurrentIndex(0);
    });

    // UPDATE NOTICE
    socket.on("update_notice", (updated) => {
      setNotices((prev) =>
        prev.map((n) => (n._id === updated._id ? updated : n))
      );
    });

    // DELETE NOTICE
    socket.on("delete_notice", (id) => {
      setNotices((prev) => {
        const updated = prev.filter((n) => n._id !== id);

        if (currentIndex >= updated.length) {
          setCurrentIndex(0);
        }

        return updated;
      });
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("reconnect");
      socket.off("new_notice");
      socket.off("update_notice");
      socket.off("delete_notice");
    };
  }, [currentIndex]);

  // ⏱ LIVE CLOCK
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 🔁 AUTO SLIDE
  useEffect(() => {
    if (notices.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % notices.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [notices.length]);

  // 🔄 FALLBACK POLLING (EVERY 30 SEC)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotices();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // 🔁 AUTO PAGE REFRESH (EVERY 6 HOURS)
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.reload();
    }, 1000 * 60 * 60 * 6);

    return () => clearTimeout(timer);
  }, []);

  // ❌ NO DATA
  if (notices.length === 0) {
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center bg-dark text-white">
        <h1>No Notices Available</h1>
      </div>
    );
  }

  // 🔒 SAFE INDEX
  const safeIndex =
    currentIndex >= notices.length ? 0 : currentIndex;

  const notice = notices[safeIndex];
  const file = notice.documentUrl || "";

  // 🔍 TYPE DETECTION
  const isImage =
    file.includes("/image/") ||
    file.match(/\.(jpg|jpeg|png|gif|webp)$/i);

  const isDocument = file && !isImage;

  // 🕒 SHARED TIME (CORRECT)
  const sharedTime = new Date(
    notice.createdAt
  ).toLocaleString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });

  return (
    <div className="vh-100 vw-100 bg-black text-white d-flex flex-column">

      {/* 🔝 HEADER */}
      <div className="d-flex justify-content-between align-items-center px-5 py-3 border-bottom border-secondary bg-dark">
        <h3 className="fw-bold text-warning">
          📢 Digital Notice Board
        </h3>

        <h5 className="text-info">
          {currentTime.toLocaleString()}
        </h5>
      </div>

      {/* 📺 MAIN DISPLAY */}
      <div className="flex-grow-1 d-flex justify-content-center align-items-center">

        <div
          className="card shadow-lg border-0"
          style={{
            width: "92%",
            height: "80vh",
            borderRadius: "25px",
            overflow: "hidden",
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(15px)",
            transition: "all 0.5s ease-in-out"
          }}
        >
          <div className="row g-0 h-100">

            {/* 📝 TEXT SECTION */}
            <div className={isImage ? "col-md-6" : "col-12"}>
              <div className="h-100 d-flex flex-column justify-content-center align-items-center p-5 text-center">

                {/* CATEGORY BADGE */}
                <span className="badge bg-warning text-dark mb-3 px-3 py-2 fs-6">
                  {notice.category || "General"}
                </span>

                {/* TITLE */}
                <h1 className="fw-bold text-warning mb-4">
                  {notice.title}
                </h1>

                {/* DESCRIPTION */}
                <p className="fs-4 text-light">
                  {notice.description}
                </p>

                {/* META INFO */}
                <div className="mt-4">
                  <p className="text-info mb-1">
                    ⏰ {sharedTime}
                  </p>

                  <p className="text-success">
                    👤 {notice.createdBy?.name || "Admin"}
                  </p>
                </div>
              </div>
            </div>

            {/* 🖼 IMAGE SECTION */}
            {isImage && (
              <div className="col-md-6 d-flex justify-content-center align-items-center bg-black">
                <img
                  src={file}
                  alt="notice"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                    borderRadius: "15px"
                  }}
                />
              </div>
            )}

            {/* 📄 DOCUMENT SECTION */}
            {isDocument && (
              <div className="col-12 d-flex flex-column justify-content-center align-items-center text-center p-5">

                <i className="fa-solid fa-link fa-3x text-warning mb-3"></i>

                <h4 className="text-light mb-3">Document URL</h4>

                <p
                  className="text-info fs-5 px-4"
                  style={{
                    wordBreak: "break-all",
                    maxWidth: "80%"
                  }}
                >
                  <a
                    href={file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-info text-decoration-none"
                  >
                    {file}
                  </a>
                </p>

              </div>
            )}

          </div>
        </div>
      </div>

      {/* 🔻 FOOTER (TICKER) */}
      <div className="bg-dark py-2 overflow-hidden border-top border-secondary">
        <div
          style={{
            whiteSpace: "nowrap",
            display: "inline-block",
            animation: "ticker 18s linear infinite"
          }}
        >
          <span className="fs-5 text-warning mx-4">
            🔔 {notice.title} - {notice.description}
          </span>
        </div>
      </div>

      {/* 🔥 CSS ANIMATION */}
      <style>
        {`
        @keyframes ticker {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}
      </style>

    </div>
  );
};

export default NoticeDisplay;

import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Swal from "sweetalert2";

const DisplayControls = () => {
  const [settings, setSettings] = useState({
    slideTime: 10000,
    autoSlide: true,
    showImages: true,
    showDocuments: true,
    ticker: true,
    fontSize: "medium",
  });

  // 🔄 Load saved settings
  useEffect(() => {
    const saved = localStorage.getItem("displaySettings");
    if (saved) {
      setSettings((prev) => ({
        ...prev,
        ...JSON.parse(saved),
      }));
    }
  }, []);

  // 💾 Save settings with SweetAlert
  const saveSettings = () => {
    Swal.fire({
      title: "Save Settings?",
      text: "Do you want to apply these display settings?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Save",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.setItem(
          "displaySettings",
          JSON.stringify(settings)
        );

        // 🔥 Trigger real-time update
        window.dispatchEvent(new Event("settingsUpdated"));

        Swal.fire({
          icon: "success",
          title: "Saved!",
          text: "Settings applied successfully",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };

  const handleChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // 📺 Fullscreen
  const handleFullscreen = () => {
    document.documentElement.requestFullscreen();
  };

  return (
    <div className="d-flex">
      <Sidebar />

      {/* MAIN CONTENT */}
      <div
        className="flex-grow-1 p-4"
        style={{ background: "#f5f6fa", minHeight: "100vh" }}
      >
        <h2 className="mb-4 fw-bold">🎛️ Display Controls</h2>

        <div className="d-flex justify-content-center">
          <div
            className="card shadow-lg border-0"
            style={{
              width: "100%",
              maxWidth: "700px",
              borderRadius: "15px",
            }}
          >
            <div className="card-body p-4">

              {/* ⏱ Slide Duration */}
              <div className="mb-4">
                <label className="form-label fw-semibold">
                  Slide Duration
                </label>
                <select
                  className="form-select"
                  value={settings.slideTime}
                  onChange={(e) =>
                    handleChange("slideTime", Number(e.target.value))
                  }
                >
                  <option value={5000}>5 Seconds</option>
                  <option value={10000}>10 Seconds</option>
                  <option value={15000}>15 Seconds</option>
                  <option value={20000}>20 Seconds</option>
                </select>
              </div>

              {/* SWITCHES */}
              <div className="mb-4">

                <div className="form-check form-switch mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={settings.autoSlide}
                    onChange={(e) =>
                      handleChange("autoSlide", e.target.checked)
                    }
                  />
                  <label className="form-check-label">
                    Auto Slide
                  </label>
                </div>

                <div className="form-check form-switch mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={settings.showImages}
                    onChange={(e) =>
                      handleChange("showImages", e.target.checked)
                    }
                  />
                  <label className="form-check-label">
                    Show Images
                  </label>
                </div>

                <div className="form-check form-switch mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={settings.showDocuments}
                    onChange={(e) =>
                      handleChange("showDocuments", e.target.checked)
                    }
                  />
                  <label className="form-check-label">
                    Show Documents
                  </label>
                </div>

              </div>

              {/* 🔤 FONT SIZE */}
              <div className="mb-4">
                <label className="form-label fw-semibold">
                  Font Size
                </label>
                <select
                  className="form-select"
                  value={settings.fontSize}
                  onChange={(e) =>
                    handleChange("fontSize", e.target.value)
                  }
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>

              {/* 📢 TICKER */}
              <div className="form-check form-switch mb-4">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={settings.ticker}
                  onChange={(e) =>
                    handleChange("ticker", e.target.checked)
                  }
                />
                <label className="form-check-label">
                  Enable Ticker
                </label>
              </div>

              {/* BUTTONS */}
              <div className="d-flex gap-3">
                <button
                  className="btn btn-primary px-4"
                  onClick={saveSettings}
                >
                  💾 Save Settings
                </button>

                <button
                  className="btn btn-dark px-4"
                  onClick={handleFullscreen}
                >
                  📺 Fullscreen
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisplayControls;

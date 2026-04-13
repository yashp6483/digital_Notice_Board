import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import TopHeader from "../components/Topheader";
import { Card, Form, Button, Row, Col } from "react-bootstrap";
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

  useEffect(() => {
    const saved = localStorage.getItem("displaySettings");
    if (saved) {
      setSettings((prev) => ({ ...prev, ...JSON.parse(saved) }));
    }
  }, []);

  const saveSettings = () => {
    Swal.fire({
      title: "Apply Changes?",
      text: "New display settings will be synchronized immediately.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Apply Settings",
      confirmButtonColor: "#4e73df",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.setItem("displaySettings", JSON.stringify(settings));
        window.dispatchEvent(new Event("settingsUpdated"));
        Swal.fire({
          icon: "success",
          title: "Synchronized",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleFullscreen = () => {
    document.documentElement.requestFullscreen();
  };

  return (
    <div className="container-fluid p-0">
      <div className="d-flex min-vh-100 overflow-hidden">
        <Sidebar />

        <div className="flex-grow-1 p-3 p-md-4 overflow-auto custom-scrollbar" style={{ backgroundColor: "#f8fafc", height: "100vh" }}>
          <TopHeader />

          <div className="mb-4 text-center text-md-start">
            <h4 className="fw-bold text-dark">Display Engine Configuration</h4>
            <p className="text-muted small">Fine-tune the visual output of the digital notice board system.</p>
          </div>

          <div className="row justify-content-center g-4">
            <Col lg={8} xl={6}>
              <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                <Card.Header className="bg-white border-light py-3">
                    <h5 className="mb-0 fw-bold text-primary">Slide & Content Engine</h5>
                </Card.Header>
                <Card.Body className="p-4">
                  
                  <Form.Group className="mb-4">
                    <Form.Label className="small fw-bold text-uppercase text-muted">Slide Interval</Form.Label>
                    <Form.Select
                      className="bg-light border-0 py-2 rounded-3"
                      value={settings.slideTime}
                      onChange={(e) => handleChange("slideTime", Number(e.target.value))}
                    >
                      <option value={5000}>5 Seconds (Fast)</option>
                      <option value={10000}>10 Seconds (Standard)</option>
                      <option value={15000}>15 Seconds (Relaxed)</option>
                      <option value={20000}>20 Seconds (Extended)</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="small fw-bold text-uppercase text-muted">Typography Scaling</Form.Label>
                    <Form.Select
                      className="bg-light border-0 py-2 rounded-3"
                      value={settings.fontSize}
                      onChange={(e) => handleChange("fontSize", e.target.value)}
                    >
                      <option value="small">Small (More content)</option>
                      <option value="medium">Medium (Standard)</option>
                      <option value="large">Large (High visibility)</option>
                    </Form.Select>
                  </Form.Group>

                  <div className="bg-light p-3 rounded-4 mb-4 border border-light">
                    <Form.Label className="small fw-bold text-uppercase text-muted d-block mb-3">Engine Toggles</Form.Label>
                    <Form.Check 
                      type="switch"
                      label="Automated Sequential Sliding"
                      id="autoSlide-switch"
                      checked={settings.autoSlide}
                      onChange={(e) => handleChange("autoSlide", e.target.checked)}
                      className="mb-2 fw-medium"
                    />
                    <Form.Check 
                      type="switch"
                      label="Render Visual Media (Images)"
                      id="showImages-switch"
                      checked={settings.showImages}
                      onChange={(e) => handleChange("showImages", e.target.checked)}
                      className="mb-2 fw-medium"
                    />
                    <Form.Check 
                      type="switch"
                      label="Support PDF/Document Preview"
                      id="showDocuments-switch"
                      checked={settings.showDocuments}
                      onChange={(e) => handleChange("showDocuments", e.target.checked)}
                      className="mb-2 fw-medium"
                    />
                    <Form.Check 
                      type="switch"
                      label="Dynamic News Ticker Overlay"
                      id="ticker-switch"
                      checked={settings.ticker}
                      onChange={(e) => handleChange("ticker", e.target.checked)}
                      className="fw-medium"
                    />
                  </div>

                  <div className="d-flex flex-wrap gap-3 mt-4">
                    <Button 
                        variant="primary" 
                        className="px-4 py-2 fw-bold rounded-3 shadow-sm flex-grow-1 flex-md-grow-0"
                        onClick={saveSettings}
                    >
                      <i className="fa-solid fa-cloud-arrow-up me-2"></i> Deploy Settings
                    </Button>

                    <Button 
                        variant="dark" 
                        className="px-4 py-2 fw-bold rounded-3 shadow-sm flex-grow-1 flex-md-grow-0"
                        onClick={handleFullscreen}
                    >
                      <i className="fa-solid fa-expand me-2"></i> Launch Fullscreen
                    </Button>
                  </div>

                </Card.Body>
              </Card>
            </Col>
          </div>
        </div>
      </div>
      <style>
        {`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        `}
      </style>
    </div>
  );
};

export default DisplayControls;

import { Modal, Button } from "react-bootstrap";

export default function DocumentViewerModal({ show, onHide, documentUrl }) {
  if (!documentUrl) {
    return (
      <Modal show={show} onHide={onHide} centered>
        <Modal.Body className="text-center">
          No document available
        </Modal.Body>
      </Modal>
    );
  }
  // Safely check for .pdf even if there are query parameters at the end of the URL
  const isPdf = documentUrl.split('?')[0].toLowerCase().endsWith(".pdf");

  const previewUrl = isPdf
    ? documentUrl.includes("?")
      ? `${documentUrl}&response-content-disposition=inline`
      : `${documentUrl}?response-content-disposition=inline`
    : documentUrl;

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="xl"
      centered
      backdrop="static"
    >
      <Modal.Header closeButton>
        <Modal.Title>Document Preview</Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ height: "80vh", padding: 0 }}>
        {isPdf ? (
          <iframe
            src={previewUrl}
            width="100%"
            height="100%"
            style={{ border: "none" }}
            title="PDF Viewer"
          />
        ) : (
          <img
            src={previewUrl}
            alt="Document"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

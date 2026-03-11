import React from "react";
import { Button, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <Container className="min-vh-100 d-flex flex-column justify-content-center align-items-center text-center">
      <h2 className="mb-3">Unauthorized</h2>
      <p className="text-muted mb-4">Your session is invalid or you do not have access.</p>
      <Button onClick={() => navigate("/login")}>Go to Login</Button>
    </Container>
  );
}

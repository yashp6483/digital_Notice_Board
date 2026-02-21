import React from 'react'
import { Button } from 'react-bootstrap'

export default function ProfessorDashboard() {
  const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };
  return (
    <div>
      <h1>Professor Dashboard</h1>
      <p>Welcome to the Professor Dashboard! Here you can manage your courses, view student performance, and access teaching resources.</p>
      <h2>Course Management</h2>
      <p>Use the course management tools to create and organize your courses, upload materials, and set up assignments.</p>
      <Button onClick={logout}>logout</Button>
    </div>
  )
}

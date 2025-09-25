// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import VerificationPage from './components/VerificationPage';
import './App.css'; // Add some basic styling

function App() {
  return (
    <Router>
      <div className="App">
        <h1>User Verification System</h1>
        <Routes>
          <Route path="/" element={<AdminLogin />} />
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/verify" element={<VerificationPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
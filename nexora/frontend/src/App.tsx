import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CareerTwin from './pages/CareerTwin';
import AIMentor from './pages/AIMentor';
import OpportunityHub from './pages/OpportunityHub';
import Settings from './pages/Settings';
import AppLayout from './components/layout/AppLayout';

const App: React.FC = () => {
  useEffect(() => {
    const savedTheme = localStorage.getItem('nexora-theme');
    if (savedTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        
        {/* Protected/Internal Routes wrapped in AppLayout */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/career-twin" element={<CareerTwin />} />
          <Route path="/mentor" element={<AIMentor />} />
          <Route path="/opportunity-hub" element={<OpportunityHub />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

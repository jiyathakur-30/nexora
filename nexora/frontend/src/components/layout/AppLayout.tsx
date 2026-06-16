import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Target, Users, Settings, MessageCircle } from 'lucide-react';
import FloatingMentor from './FloatingMentor';

const Sidebar: React.FC = () => {
  return (
    <div style={{ width: '240px', backgroundColor: 'var(--color-card)', borderRight: '1px solid rgba(61,44,46,0.1)', height: '100vh', position: 'fixed', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 'var(--space-6)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Target size={20} color="white" />
        </div>
        Nexora
      </div>
      <nav style={{ flex: 1, padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <SidebarLink to="/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" />
        <SidebarLink to="/career-twin" icon={<Target size={20} />} label="Career Twin" />
        <SidebarLink to="/mentor" icon={<MessageCircle size={20} />} label="AI Mentor" />
        <SidebarLink to="/opportunity-hub" icon={<Users size={20} />} label="Opportunity Hub" />
      </nav>
      <div style={{ padding: 'var(--space-4)', borderTop: '1px solid rgba(61,44,46,0.1)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <SidebarLink to="/settings" icon={<Settings size={20} />} label="Settings" />
      </div>
    </div>
  );
};

const SidebarLink: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => {
  return (
    <NavLink 
      to={to} 
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 16px',
        borderRadius: 'var(--radius-sm)',
        color: isActive ? 'white' : 'var(--color-text)',
        backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
        textDecoration: 'none',
        fontWeight: isActive ? 600 : 500,
        transition: 'all 0.2s'
      })}
    >
      {icon}
      {label}
    </NavLink>
  );
};

export const AppLayout: React.FC = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-background)' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: '240px', position: 'relative' }}>
        <Outlet />
      </div>
      <FloatingMentor />
    </div>
  );
};

export default AppLayout;

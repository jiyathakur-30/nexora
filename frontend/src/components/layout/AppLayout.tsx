import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Target, Users, Settings, MessageCircle, Activity, User } from 'lucide-react';
import FloatingMentor from './FloatingMentor';

const Sidebar: React.FC = () => {
  return (
    <div style={{
      width: '240px',
      backgroundColor: 'var(--color-sidebar)',
      borderRight: '1px solid var(--color-border)',
      height: '100vh',
      position: 'fixed',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100
    }}>
      {/* Brand logo */}
      <div style={{
        padding: 'var(--space-5) var(--space-4)',
        fontSize: '1.25rem',
        fontWeight: 800,
        color: 'var(--color-primary)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        letterSpacing: '-0.02em'
      }}>
        <div style={{
          width: 28,
          height: 28,
          borderRadius: '7px',
          backgroundColor: 'var(--color-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Target size={16} color="white" />
        </div>
        Nexora
      </div>

      {/* Main Nav Links */}
      <nav style={{
        flex: 1,
        padding: 'var(--space-3) var(--space-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        <SidebarLink to="/dashboard" icon={<LayoutDashboard size={18} />} label="Dashboard" />
        <SidebarLink to="/career-twin" icon={<Target size={18} />} label="Career Twin" />
        <SidebarLink to="/pulse" icon={<Activity size={18} />} label="Pulse" />
        <SidebarLink to="/mentor" icon={<MessageCircle size={18} />} label="AI Mentor" />
        <SidebarLink to="/career-missions" icon={<Target size={18} />} label="Career Missions" />
        <SidebarLink to="/opportunity-hub" icon={<Users size={18} />} label="Opportunity Hub" />
      </nav>

      {/* Footer Nav Links */}
      <div style={{
        padding: 'var(--space-4)',
        borderTop: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        <SidebarLink to="/settings" icon={<Settings size={18} />} label="Settings" />
      </div>
    </div>
  );
};

const SidebarLink: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <NavLink
      to={to}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={({ isActive }) => {
        const activeBg = 'rgba(201, 106, 74, 0.08)';
        const hoverBg = 'rgba(201, 106, 74, 0.03)';
        const bg = isActive ? activeBg : (isHovered ? hoverBg : 'transparent');
        const color = isActive ? 'var(--color-primary)' : 'var(--color-text-light)';

        return {
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '10px 14px',
          borderRadius: 'var(--radius-sm)',
          color: color,
          backgroundColor: bg,
          textDecoration: 'none',
          fontSize: '0.9rem',
          fontWeight: isActive ? 600 : 500,
          transition: 'all 0.2s ease-in-out'
        };
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </span>
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

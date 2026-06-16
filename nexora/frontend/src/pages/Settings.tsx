import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings as SettingsIcon, LogOut, RefreshCw, X, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  
  // State from localStorage
  const [userName, setUserName] = useState(localStorage.getItem('nexora_user_name') || 'Guest');
  const [targetRole, setTargetRole] = useState(localStorage.getItem('nexora_user_role') || 'Software Engineer');
  const email = localStorage.getItem('nexora_user_email') || userName.toLowerCase().replace(' ', '.') + '@example.com';
  const [experience, setExperience] = useState('Entry Level (0-2 YOE)');
  
  const [theme, setTheme] = useState(localStorage.getItem('nexora-theme') || 'light');

  // Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  
  // Edit Form State
  const [editName, setEditName] = useState(userName);
  const [editRole, setEditRole] = useState(targetRole);
  const [editExp, setEditExp] = useState(experience);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
    localStorage.setItem('nexora-theme', theme);
  }, [theme]);

  const handleLogout = () => {
    localStorage.removeItem('nexora_user_name');
    localStorage.removeItem('nexora_user_email');
    localStorage.removeItem('nexora_user_role');
    localStorage.removeItem('nexora_is_analyzed');
    navigate('/login');
  };

  const executeReset = () => {
    localStorage.setItem('nexora_is_analyzed', 'false');
    navigate('/dashboard');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('nexora_user_name', editName);
    localStorage.setItem('nexora_user_role', editRole);
    setUserName(editName);
    setTargetRole(editRole);
    setExperience(editExp);
    setIsEditModalOpen(false);
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <div className="container page-enter-active" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-12)', maxWidth: 800 }}>
      <header style={{ marginBottom: 'var(--space-8)', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: 48, height: 48, borderRadius: '16px', backgroundColor: 'var(--color-card)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <SettingsIcon color="var(--color-primary)" />
        </div>
        <div>
          <h1 style={{ fontSize: '2.5rem', color: 'var(--color-text)' }}>Settings</h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--color-text-light)' }}>Manage your account and preferences.</p>
        </div>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        
        {/* Profile Card */}
        <Card hoverEffect>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: 'rgba(201,106,74,0.1)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700 }}>
                {userName.charAt(0)}
              </div>
              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 700 }}>{userName}</h3>
                <p style={{ color: 'var(--color-text-light)' }}>{email}</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>Edit Profile</Button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-light)', marginBottom: 8, textTransform: 'uppercase' }}>Target Role</label>
              <div style={{ padding: '12px 16px', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(61,44,46,0.1)' }}>
                {targetRole}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-light)', marginBottom: 8, textTransform: 'uppercase' }}>Experience Level</label>
              <div style={{ padding: '12px 16px', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(61,44,46,0.1)' }}>
                {experience}
              </div>
            </div>
          </div>
        </Card>

        {/* Appearance Section */}
        <Card hoverEffect>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 'var(--space-2)' }}>Appearance</h3>
          <p style={{ color: 'var(--color-text-light)', marginBottom: 'var(--space-6)' }}>Customize the look and feel of the platform.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div 
              onClick={() => setTheme('light')}
              style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', border: theme === 'light' ? '2px solid var(--color-primary)' : '2px solid rgba(61,44,46,0.05)', backgroundColor: 'var(--color-background)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16, transition: 'all 0.2s' }}
            >
              <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#F8F4E9', border: '1px solid #E7DCC8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sun size={24} color="#D98C3A" />
              </div>
              <div>
                <h4 style={{ fontWeight: 700, fontSize: '1.1rem' }}>Light Theme</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>Warm and clean</p>
              </div>
            </div>

            <div 
              onClick={() => setTheme('dark')}
              style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', border: theme === 'dark' ? '2px solid var(--color-primary)' : '2px solid rgba(61,44,46,0.05)', backgroundColor: 'var(--color-background)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16, transition: 'all 0.2s' }}
            >
              <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#1A1515', border: '1px solid #2A2424', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Moon size={24} color="#A08C8E" />
              </div>
              <div>
                <h4 style={{ fontWeight: 700, fontSize: '1.1rem' }}>Dark Theme</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>Sleek and focused</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Account Actions */}
        <Card hoverEffect>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 'var(--space-2)' }}>Account Actions</h3>
          <p style={{ color: 'var(--color-text-light)', marginBottom: 'var(--space-6)' }}>Manage your session and data.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-4)', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(61,44,46,0.05)' }}>
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 4 }}>Reset Career Twin</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>Clear your analysis and start over.</p>
              </div>
              <Button variant="secondary" size="sm" onClick={() => setIsResetModalOpen(true)} style={{ color: 'var(--color-warning)', borderColor: 'rgba(235,176,94,0.3)' }}>
                <RefreshCw size={16} style={{ marginRight: 8 }} /> Reset Data
              </Button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-4)', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239,83,80,0.1)' }}>
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-danger)', marginBottom: 4 }}>Logout</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>Securely end your session.</p>
              </div>
              <Button variant="secondary" size="sm" onClick={handleLogout} style={{ color: 'var(--color-danger)', borderColor: 'rgba(239,83,80,0.3)' }}>
                <LogOut size={16} style={{ marginRight: 8 }} /> Logout
              </Button>
            </div>
          </div>
        </Card>

      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)' }}
            onClick={() => setIsEditModalOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              style={{ background: 'var(--color-background)', width: '100%', maxWidth: 500, borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-4) var(--space-6)', borderBottom: '1px solid rgba(61,44,46,0.1)' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Edit Profile</h3>
                <button onClick={() => setIsEditModalOpen(false)} style={{ cursor: 'pointer', background: 'none', border: 'none', color: 'var(--color-text)' }}><X size={24} /></button>
              </div>
              
              <form onSubmit={handleSaveProfile} style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-light)', marginBottom: 8, textTransform: 'uppercase' }}>Full Name</label>
                  <input type="text" required value={editName} onChange={e => setEditName(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(61,44,46,0.1)', background: 'var(--color-background)', color: 'var(--color-text)' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-light)', marginBottom: 8, textTransform: 'uppercase' }}>Target Role</label>
                  <input type="text" required value={editRole} onChange={e => setEditRole(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(61,44,46,0.1)', background: 'var(--color-background)', color: 'var(--color-text)' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-light)', marginBottom: 8, textTransform: 'uppercase' }}>Experience Level</label>
                  <select value={editExp} onChange={e => setEditExp(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(61,44,46,0.1)', background: 'var(--color-background)', color: 'var(--color-text)' }}>
                    <option value="Student">Student</option>
                    <option value="Entry Level (0-2 YOE)">Entry Level (0-2 YOE)</option>
                    <option value="Mid Level (3-5 YOE)">Mid Level (3-5 YOE)</option>
                    <option value="Senior (5+ YOE)">Senior (5+ YOE)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: 'var(--space-4)' }}>
                  <Button variant="ghost" type="button" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                  <Button type="submit">Save Changes</Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {isResetModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)' }}
            onClick={() => setIsResetModalOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              style={{ background: 'var(--color-background)', width: '100%', maxWidth: 400, borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}
            >
              <div style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: 'rgba(235,176,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-4)' }}>
                  <RefreshCw size={32} color="var(--color-warning)" />
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 'var(--space-2)' }}>Reset Career Twin?</h3>
                <p style={{ color: 'var(--color-text-light)', marginBottom: 'var(--space-6)' }}>This will remove your analysis results and return you to the onboarding state.</p>
                
                <div style={{ display: 'flex', gap: '12px' }}>
                  <Button variant="outline" onClick={() => setIsResetModalOpen(false)} style={{ flex: 1 }}>Cancel</Button>
                  <Button onClick={executeReset} style={{ flex: 1, backgroundColor: 'var(--color-warning)' }}>Reset</Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Settings;

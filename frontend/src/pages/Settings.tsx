import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings as SettingsIcon, LogOut, RefreshCw, X, Moon, Sun, Code, Briefcase, FileText, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

import { useCareerAgent } from '../services/CareerAgent';
import { generateMissions } from '../services/MissionGenerator';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { memory, updateMemory, resetAgentMemory } = useCareerAgent();
  
  // State variables synchronized with memory
  const userName = memory.profile?.name || 'Guest';
  const targetRole = memory.targetRole || 'Software Engineer';
  const email = memory.profile?.email || 'you@example.com';
  const [experience, setExperience] = useState('Entry Level (0-2 YOE)');
  
  const [theme, setTheme] = useState(localStorage.getItem('nexora-theme') || 'light');

  // Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  
  // Edit Form State
  const [editName, setEditName] = useState(userName);
  const [editRole, setEditRole] = useState(targetRole);
  const [editExp, setEditExp] = useState(experience);

  // Connected Sources States
  const [githubVal, setGithubVal] = useState(memory.githubUsername || '');
  const [linkedinVal, setLinkedinVal] = useState(memory.linkedinUrl || '');
  const [isEditingGithub, setIsEditingGithub] = useState(false);
  const [isEditingLinkedin, setIsEditingLinkedin] = useState(false);
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [progress, setProgress] = useState(0);

  const resumeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEditingGithub) setGithubVal(memory.githubUsername || '');
  }, [memory.githubUsername, isEditingGithub]);

  useEffect(() => {
    if (!isEditingLinkedin) setLinkedinVal(memory.linkedinUrl || '');
  }, [memory.linkedinUrl, isEditingLinkedin]);

  // Sync form states with memory changes
  useEffect(() => {
    setEditName(userName);
    setEditRole(targetRole);
  }, [userName, targetRole]);

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
    localStorage.removeItem('nexora_agent_memory');
    navigate('/login');
  };

  const executeReset = () => {
    resetAgentMemory();
    navigate('/dashboard');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('nexora_user_name', editName);
    localStorage.setItem('nexora_user_role', editRole);
    updateMemory(prev => ({
      ...prev,
      profile: prev.profile ? { ...prev.profile, name: editName } : { name: editName, email: '' },
      targetRole: editRole
    }));
    setExperience(editExp);
    setIsEditModalOpen(false);
  };

  const runSettingsReanalysis = (actionLogLabel: string, updatedMemoryFields: Partial<typeof memory>) => {
    setIsReanalyzing(true);
    setProgress(0);
    
    updateMemory(prev => {
      const makeId = () => Math.random().toString(36).substr(2, 9);
      return {
        ...prev,
        ...updatedMemoryFields,
        activities: [
          ...prev.activities,
          { id: makeId(), label: actionLogLabel, timestamp: new Date().toISOString() }
        ]
      };
    });

    const stepDuration = 30;
    const progressInterval = setInterval(() => {
      setProgress(p => {
        if (p >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return p + 5;
      });
    }, stepDuration);

    fetch('http://localhost:5000/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetRole: memory.targetRole,
        resumeFileName: memory.resumeFileName,
        preferences: memory.preferences
      })
    })
      .then(res => res.json())
      .then(data => {
        console.log("ANALYZE RESPONSE =", data);
        setProgress(100);
        setTimeout(() => {
          setIsReanalyzing(false);
          updateMemory(prev => {
            const makeId = () => Math.random().toString(36).substr(2, 9);
            const newActivities = [
              ...prev.activities,
              { id: makeId(), label: 'Profile Reanalyzed', timestamp: new Date().toISOString() },
              { id: makeId(), label: 'Career Twin Refreshed', timestamp: new Date().toISOString() }
            ];

            const mentorGreeting = {
              text: `I've successfully updated your Profile Analysis! Since you updated your profile connections in Settings (${actionLogLabel}), I've re-calibrated your Career Twin, readiness scores, and custom weekly goals. Let me know what you'd like to focus on today.`,
              isAi: true,
              timestamp: new Date().toISOString()
            };

            const chatHistory = [...(prev.mentorContext?.chatHistory || []), mentorGreeting];

            const hasResume = prev.hasResume;
            const hasGithub = !!prev.githubUsername;
            const hasLinkedin = !!prev.linkedinUrl;
            const isAnalyzed = hasResume || hasGithub || hasLinkedin;

            const tempMem = {
              ...prev,
              isAnalyzed,
              
              
              isTwinGenerated: isAnalyzed,
              analysis: isAnalyzed ? data : null,
              mentorContext: {
                ...prev.mentorContext,
                chatHistory
              },
              weeklyMissions: [],
              suggestedMissions: [],
              activities: newActivities
            };

            const active = isAnalyzed ? generateMissions(tempMem, 3) : [];
            const suggestions = isAnalyzed ? generateMissions({ ...tempMem, weeklyMissions: active }, 5) : [];

            return {
              ...tempMem,
              weeklyMissions: active,
              suggestedMissions: suggestions
            };
          });
        }, 200);
      })
      .catch(err => {
        console.error(err);
        setIsReanalyzing(false);
        alert("Re-analysis failed. Please check backend connection on port 5000.");
      });
  };

  const handleDisconnectGithub = () => {
    runSettingsReanalysis('GitHub Disconnected', { githubUsername: '' });
  };

  const handleDisconnectLinkedin = () => {
    runSettingsReanalysis('LinkedIn Disconnected', { linkedinUrl: '' });
  };

  const handleRemoveResume = () => {
    runSettingsReanalysis('Resume Removed', { hasResume: false, resumeFileName: '' });
  };

  const handleSaveGithub = () => {
    if (!githubVal.trim()) return;
    runSettingsReanalysis(
      memory.githubUsername ? 'GitHub Updated' : 'GitHub Connected', 
      { githubUsername: githubVal.trim() }
    );
    setIsEditingGithub(false);
  };

  const handleSaveLinkedin = () => {
    if (!linkedinVal.trim()) return;
    runSettingsReanalysis(
      memory.linkedinUrl ? 'LinkedIn Updated' : 'LinkedIn Connected', 
      { linkedinUrl: linkedinVal.trim() }
    );
    setIsEditingLinkedin(false);
  };

  const handleResumeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      runSettingsReanalysis(
        memory.hasResume ? 'Resume Replaced' : 'Resume Connected',
        { hasResume: true, resumeFileName: file.name }
      );
    }
  };

  const hasResume = memory.hasResume;
  const hasGithub = !!memory.githubUsername;
  const hasLinkedin = !!memory.linkedinUrl;

  const completeness = (hasResume ? 40 : 0) + (hasGithub ? 30 : 0) + (hasLinkedin ? 30 : 0);

  let qualityIndicator = 'No Connected Sources';
  let qualityColor = 'var(--color-text-light)';
  if (completeness > 0) {
    if (completeness <= 40) {
      qualityIndicator = 'Basic Analysis';
      qualityColor = 'var(--color-warning)';
    } else if (completeness < 100) {
      qualityIndicator = 'Enhanced Analysis';
      qualityColor = 'var(--color-primary)';
    } else {
      qualityIndicator = 'Complete Analysis';
      qualityColor = 'var(--color-success)';
    }
  }

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

        {/* Connected Accounts Section */}
        <Card hoverEffect>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 'var(--space-2)' }}>Connected Accounts</h3>
          <p style={{ color: 'var(--color-text-light)', marginBottom: 'var(--space-6)' }}>Manage the account integrations and resume feeds that power your AI Career Twin.</p>

          {/* Completeness & Quality indicator banner */}
          <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(61,44,46,0.05)', marginBottom: 'var(--space-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-light)', textTransform: 'uppercase', marginBottom: '4px' }}>Profile Completeness</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary)' }}>{completeness}%</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-light)', textTransform: 'uppercase', marginBottom: '4px' }}>Analysis Quality</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: qualityColor }}>{qualityIndicator}</div>
            </div>
            <div style={{ width: '100%', height: 6, background: 'rgba(61,44,46,0.05)', borderRadius: 3, overflow: 'hidden', marginTop: '4px' }}>
              <div style={{ height: '100%', background: 'var(--color-primary)', width: `${completeness}%`, transition: 'width 0.3s ease' }}></div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            
            {/* Resume Source */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: 'var(--space-4)', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(61,44,46,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <FileText size={20} color="var(--color-primary)" />
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Resume</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', margin: 0 }}>Skills, education, projects</p>
                  </div>
                </div>
                <div>
                  {hasResume ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--color-success)', fontWeight: 600 }}>✓ Connected</span>
                      <Button variant="secondary" size="sm" onClick={() => alert(`Viewing connected resume: ${memory.resumeFileName || 'resume.pdf'}`)}>View</Button>
                      <Button variant="secondary" size="sm" onClick={() => resumeInputRef.current?.click()}>Replace</Button>
                      <Button variant="secondary" size="sm" onClick={handleRemoveResume} style={{ color: 'var(--color-danger)' }}>Remove</Button>
                    </div>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => resumeInputRef.current?.click()}>Upload Resume</Button>
                  )}
                  <input type="file" ref={resumeInputRef} onChange={handleResumeFileChange} style={{ display: 'none' }} accept=".pdf,.doc,.docx" />
                </div>
              </div>
              {hasResume && (
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', borderTop: '1px dashed rgba(61,44,46,0.08)', paddingTop: '6px', fontStyle: 'italic' }}>
                  Current file: {memory.resumeFileName || 'resume.pdf'}
                </div>
              )}
            </div>

            {/* GitHub Source */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: 'var(--space-4)', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(61,44,46,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Code size={20} color="var(--color-primary)" />
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>GitHub</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', margin: 0 }}>Technical activity, repositories, coding trends</p>
                  </div>
                </div>
                <div>
                  {hasGithub && !isEditingGithub ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--color-success)', fontWeight: 600 }}>✓ Connected ({memory.githubUsername})</span>
                      <Button variant="secondary" size="sm" onClick={() => setIsEditingGithub(true)}>Edit</Button>
                      <Button variant="secondary" size="sm" onClick={handleDisconnectGithub} style={{ color: 'var(--color-danger)' }}>Disconnect</Button>
                    </div>
                  ) : !hasGithub && !isEditingGithub ? (
                    <Button variant="outline" size="sm" onClick={() => setIsEditingGithub(true)}>Connect GitHub</Button>
                  ) : null}
                </div>
              </div>
              {isEditingGithub && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <input 
                    type="text" 
                    placeholder="GitHub Username" 
                    value={githubVal} 
                    onChange={e => setGithubVal(e.target.value)} 
                    style={{ flex: 1, padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(61,44,46,0.15)', fontSize: '0.85rem', background: 'var(--color-background)', color: 'var(--color-text)' }} 
                  />
                  <Button size="sm" onClick={handleSaveGithub}>Save</Button>
                  <Button variant="ghost" size="sm" onClick={() => { setIsEditingGithub(false); setGithubVal(memory.githubUsername || ''); }}>Cancel</Button>
                </div>
              )}
            </div>

            {/* LinkedIn Source */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: 'var(--space-4)', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(61,44,46,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Briefcase size={20} color="#0A66C2" />
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>LinkedIn</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', margin: 0 }}>Professional profile, experience, networking</p>
                  </div>
                </div>
                <div>
                  {hasLinkedin && !isEditingLinkedin ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--color-success)', fontWeight: 600 }}>✓ Connected</span>
                      <Button variant="secondary" size="sm" onClick={() => setIsEditingLinkedin(true)}>Edit</Button>
                      <Button variant="secondary" size="sm" onClick={handleDisconnectLinkedin} style={{ color: 'var(--color-danger)' }}>Disconnect</Button>
                    </div>
                  ) : !hasLinkedin && !isEditingLinkedin ? (
                    <Button variant="outline" size="sm" onClick={() => setIsEditingLinkedin(true)}>Connect LinkedIn</Button>
                  ) : null}
                </div>
              </div>
              {isEditingLinkedin && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <input 
                    type="url" 
                    placeholder="LinkedIn Profile URL" 
                    value={linkedinVal} 
                    onChange={e => setLinkedinVal(e.target.value)} 
                    style={{ flex: 1, padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(61,44,46,0.15)', fontSize: '0.85rem', background: 'var(--color-background)', color: 'var(--color-text)' }} 
                  />
                  <Button size="sm" onClick={handleSaveLinkedin}>Save</Button>
                  <Button variant="ghost" size="sm" onClick={() => { setIsEditingLinkedin(false); setLinkedinVal(memory.linkedinUrl || ''); }}>Cancel</Button>
                </div>
              )}
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

      {/* Reanalysis Progress Overlay */}
      <AnimatePresence>
        {isReanalyzing && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#fff' }}
          >
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} style={{ marginBottom: 16 }}>
              <Loader2 size={48} color="var(--color-primary)" />
            </motion.div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>AI Coach is Re-analyzing...</h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', margin: '0 0 16px 0' }}>Updating twin profile and learning modules</p>
            <div style={{ width: 240, height: 6, background: 'rgba(255,255,255,0.2)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'var(--color-primary)', width: `${progress}%`, transition: 'width 0.1s linear' }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Settings;

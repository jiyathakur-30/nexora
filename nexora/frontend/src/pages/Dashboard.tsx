import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, TrendingUp, Code, Briefcase, FileText, Check, Sparkles, Map, Lightbulb } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const Dashboard: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [isAnalyzed, setIsAnalyzed] = useState(localStorage.getItem('nexora_is_analyzed') === 'true');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisText, setAnalysisText] = useState('');
  const [progress, setProgress] = useState(0);

  const userName = localStorage.getItem('nexora_user_name') || 'Guest';
  const targetRole = localStorage.getItem('nexora_user_role') || 'Software Engineer';
  const firstName = userName.split(' ')[0];

  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const analysisSteps = [
    'Initializing AI Core...',
    'Analyzing Resume Constraints...',
    'Scanning GitHub Repositories...',
    'Mapping Professional Network...',
    'Building Career Twin Architecture...',
    'Predicting Future Growth Trajectories...',
    'Generating Recommendations...'
  ];

  useEffect(() => {
    fetch('http://localhost:5000/api/analyze', { method: 'POST' })
      .then(res => res.json())
      .then(d => setProfile(d));
  }, []);

  const handleAnalyze = () => {
    if (!github && !linkedin && !resumeUploaded) return;
    
    setIsAnalyzing(true);
    let currentStep = 0;
    setAnalysisText(analysisSteps[currentStep]);
    
    const stepDuration = 600;
    const textInterval = setInterval(() => {
      currentStep++;
      if (currentStep < analysisSteps.length) {
        setAnalysisText(analysisSteps[currentStep]);
      }
    }, stepDuration);

    let currentProgress = 0;
    const progressInterval = setInterval(() => {
      currentProgress += 1.5;
      setProgress(Math.min(currentProgress, 100));
      if (currentProgress >= 100) {
        clearInterval(progressInterval);
        clearInterval(textInterval);
        setTimeout(() => {
          setIsAnalyzing(false);
          setIsAnalyzed(true);
          localStorage.setItem('nexora_is_analyzed', 'true');
        }, 400);
      }
    }, (stepDuration * analysisSteps.length) / 66);
    
    return () => {
      clearInterval(textInterval);
      clearInterval(progressInterval);
    };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setResumeUploaded(true);
    }
  };

  if (isAnalyzing) {
    return (
      <div className="flex-center" style={{ height: '100vh', flexDirection: 'column', backgroundColor: 'var(--color-background)' }}>
        <motion.div animate={{ scale: [1, 1.1, 1], filter: ['blur(10px)', 'blur(20px)', 'blur(10px)'] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} style={{ position: 'absolute', width: 400, height: 400, background: 'var(--color-primary)', opacity: 0.1, borderRadius: '50%', zIndex: 0 }} />
        <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 400 }}>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} style={{ width: 64, height: 64, borderRadius: '24%', border: '4px solid var(--color-glass-border)', borderTopColor: 'var(--color-primary)', marginBottom: 'var(--space-8)' }} />
          <div style={{ width: '100%', height: 4, background: 'rgba(61,44,46,0.1)', borderRadius: 2, overflow: 'hidden', marginBottom: 'var(--space-4)' }}>
            <motion.div style={{ height: '100%', background: 'var(--color-primary)', width: `${progress}%` }} transition={{ ease: "linear" }} />
          </div>
          <AnimatePresence mode="wait">
            <motion.h2 key={analysisText} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} style={{ fontSize: '1.2rem', color: 'var(--color-text)', fontWeight: 600 }}>
              {analysisText}
            </motion.h2>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  if (!isAnalyzed) {
    return (
      <div className="container page-enter-active" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-12)', maxWidth: 800 }}>
        <header style={{ marginBottom: 'var(--space-8)', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', color: 'var(--color-text)', marginBottom: 'var(--space-2)' }}>Hello {firstName} 👋</h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--color-text-light)' }}>Welcome to Nexora. Let's build your AI Career Twin.</p>
        </header>

        <Card hoverEffect style={{ padding: 'var(--space-8)', boxShadow: 'var(--shadow-lg)', border: '2px solid var(--color-primary)' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: 'var(--space-2)' }}>Complete Your Career Profile</h2>
            <p style={{ color: 'var(--color-text-light)' }}>Provide your data sources so the AI can analyze your current readiness for <strong>{targetRole}</strong>.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-4)', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(61,44,46,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: 48, height: 48, borderRadius: '12px', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}><FileText size={24} color="var(--color-primary)" /></div>
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 4 }}>Resume</h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>Upload your latest PDF resume.</p>
                </div>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept=".pdf,.doc,.docx" />
              <Button variant={resumeUploaded ? 'ghost' : 'secondary'} size="sm" onClick={() => fileInputRef.current?.click()}>
                {resumeUploaded ? <span style={{ color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: 4 }}><Check size={16} /> Uploaded</span> : "Upload PDF"}
              </Button>
            </div>

            <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(61,44,46,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: 'var(--space-4)' }}>
                <div style={{ width: 48, height: 48, borderRadius: '12px', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}><Code size={24} /></div>
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 4 }}>GitHub Username</h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>Analyze your code commits and repos.</p>
                </div>
              </div>
              <input type="text" placeholder="e.g. torvalds" value={github} onChange={e => setGithub(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(61,44,46,0.1)' }} />
            </div>

            <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(61,44,46,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: 'var(--space-4)' }}>
                <div style={{ width: 48, height: 48, borderRadius: '12px', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}><Briefcase size={24} color="#0A66C2" /></div>
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 4 }}>LinkedIn URL</h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>Sync your professional network.</p>
                </div>
              </div>
              <input type="url" placeholder="https://linkedin.com/in/..." value={linkedin} onChange={e => setLinkedin(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(61,44,46,0.1)' }} />
            </div>

            <Button size="lg" onClick={handleAnalyze} disabled={!github && !linkedin && !resumeUploaded} style={{ marginTop: 'var(--space-4)' }}>
              Analyze My Profile
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="container page-enter-active" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-12)' }}>
      <header style={{ marginBottom: 'var(--space-8)' }}>
        <h1 style={{ fontSize: '2.5rem', color: 'var(--color-text)', marginBottom: 'var(--space-2)' }}>Hello {firstName} 👋</h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--color-text-light)' }}>Welcome to your Career Intelligence Dashboard.</p>
      </header>

      {/* Top Row: Strategic Insights */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
        <Card hoverEffect style={{ background: 'linear-gradient(to bottom right, var(--color-card), rgba(201,106,74,0.05))', border: '1px solid var(--color-primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 'var(--space-4)' }}>
            <Sparkles color="var(--color-primary)" size={24} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Recommended Next Action</h3>
          </div>
          <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: 'var(--space-2)' }}>Build an AI Agent Project</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', fontWeight: 600, textTransform: 'uppercase' }}>Expected Impact:</span>
            <span style={{ padding: '2px 8px', background: 'rgba(78, 139, 98, 0.1)', color: 'var(--color-success)', borderRadius: '12px', fontWeight: 700, fontSize: '0.85rem' }}>+15% Readiness</span>
          </div>
        </Card>

        <Card hoverEffect>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 'var(--space-4)' }}>
            <TrendingUp color="var(--color-success)" size={24} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Highest Impact Skill</h3>
          </div>
          <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: 'var(--space-2)' }}>System Design / Microservices</p>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>Mastering this closes your largest critical gap for senior roles.</p>
        </Card>

        <Card hoverEffect>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 'var(--space-4)' }}>
            <Lightbulb color="#D49F00" size={24} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Weekly AI Insight</h3>
          </div>
          <p style={{ fontSize: '0.95rem', color: 'var(--color-text)', lineHeight: 1.5 }}>
            "Your GitHub commits show strong frontend skills, but adding a backend project using Node.js will significantly increase your callback rate for Full-Stack roles."
          </p>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--space-6)' }}>
        
        {/* Left Column (Readiness & Roadmap) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <Card hoverEffect>
              <h3 style={{ fontSize: '1.1rem', marginBottom: 'var(--space-4)', color: 'var(--color-text-light)' }}>Career Readiness</h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <div style={{ fontSize: '4.5rem', fontWeight: 800, color: 'var(--color-primary)', lineHeight: 1 }}>{profile.readiness}%</div>
                <div style={{ color: 'var(--color-success)', fontWeight: 600 }}>+4% this week</div>
              </div>
              <div style={{ marginTop: 'var(--space-6)', height: 8, background: 'rgba(61,44,46,0.05)', borderRadius: 4, overflow: 'hidden' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${profile.readiness}%` }} transition={{ duration: 1, delay: 0.5 }} style={{ height: '100%', background: 'var(--color-primary)' }} />
              </div>

              <div style={{ marginTop: 'var(--space-6)', borderTop: '1px solid rgba(61,44,46,0.1)', paddingTop: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <Target size={18} color="var(--color-text-light)" />
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', textTransform: 'uppercase', fontWeight: 700 }}>Target Role</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>{targetRole}</div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <Card hoverEffect>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 'var(--space-6)' }}>
                <Map size={20} color="var(--color-text-light)" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Roadmap Preview</h3>
              </div>
              
              <div style={{ position: 'relative', paddingLeft: 24 }}>
                <div style={{ position: 'absolute', top: 6, bottom: 6, left: 7, width: 2, background: 'rgba(61,44,46,0.1)' }}></div>
                
                <div style={{ position: 'relative', marginBottom: 'var(--space-4)' }}>
                  <div style={{ position: 'absolute', top: 6, left: -24, width: 16, height: 16, borderRadius: '50%', background: 'var(--color-success)', border: '4px solid var(--color-card)' }}></div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-success)', textTransform: 'uppercase', marginBottom: 2 }}>Current Stage</div>
                  <div style={{ fontWeight: 600 }}>Internship Ready</div>
                </div>

                <div style={{ position: 'relative', marginBottom: 'var(--space-4)' }}>
                  <div style={{ position: 'absolute', top: 6, left: -24, width: 16, height: 16, borderRadius: '50%', background: 'var(--color-primary)', border: '4px solid var(--color-card)' }}></div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', marginBottom: 2 }}>Next Milestone (3 Months)</div>
                  <div style={{ fontWeight: 600 }}>Industry Ready</div>
                </div>

                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 6, left: -24, width: 16, height: 16, borderRadius: '50%', background: 'var(--color-text-light)', border: '4px solid var(--color-card)' }}></div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-light)', textTransform: 'uppercase', marginBottom: 2 }}>Ultimate Goal (12 Months)</div>
                  <div style={{ fontWeight: 600 }}>{targetRole}</div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Right Column (Analysis & Pulse) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card hoverEffect style={{ height: '100%' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: 'var(--space-4)', color: 'var(--color-success)' }}>Core Strengths</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {profile.strengths.map((s: string) => <span key={s} style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 500, backgroundColor: 'rgba(78, 139, 98, 0.1)', color: 'var(--color-success)', border: '1px solid rgba(78, 139, 98, 0.2)' }}>{s}</span>)}
                </div>
              </Card>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card hoverEffect style={{ height: '100%' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: 'var(--space-4)', color: 'var(--color-danger)' }}>Critical Gaps</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {profile.gaps.map((s: string) => <span key={s} style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 500, backgroundColor: 'rgba(192, 86, 86, 0.1)', color: 'var(--color-danger)', border: '1px solid rgba(192, 86, 86, 0.2)' }}>{s}</span>)}
                </div>
              </Card>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card hoverEffect>
              <h3 style={{ fontSize: '1.1rem', marginBottom: 'var(--space-4)', color: 'var(--color-text-light)' }}>Tech Pulse</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-4)', padding: 'var(--space-4)', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-success)', marginBottom: '0.8rem' }}>Learn Now</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 500 }}>MCP</span>
                    <span style={{ fontWeight: 500 }}>AI Agents</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-warning)', marginBottom: '0.8rem' }}>Learn Later</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 500 }}>Docker</span>
                    <span style={{ fontWeight: 500 }}>K8s</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-danger)', marginBottom: '0.8rem' }}>Ignore</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <span style={{ textDecoration: 'line-through', opacity: 0.5 }}>Mojo</span>
                    <span style={{ textDecoration: 'line-through', opacity: 0.5 }}>HTMX</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;

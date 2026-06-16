import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Play, X, Star, Zap, Target, Users, MessageCircle } from 'lucide-react';
import Button from '../components/ui/Button';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [showDemo, setShowDemo] = useState(false);

  return (
    <div className="page-enter-active" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Navbar */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-4) var(--space-8)' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)' }}>Nexora</div>
        <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
          <Button variant="ghost" onClick={() => navigate('/login?tab=login')}>Sign In</Button>
          <Button variant="primary" onClick={() => navigate('/login?tab=signup')}>Get Started</Button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: 'var(--space-8)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-8)', alignItems: 'center' }}>
          
          {/* Left Text */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', backgroundColor: 'rgba(201, 106, 74, 0.1)', color: 'var(--color-primary)', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 600, marginBottom: 'var(--space-6)' }}>
              <span style={{ width: 8, height: 8, backgroundColor: 'var(--color-primary)', borderRadius: '50%' }}></span>
              Nexora 2.0 is live
            </div>
            
            <h1 style={{ fontSize: '4.5rem', fontWeight: 800, color: 'var(--color-text)', lineHeight: 1.1, marginBottom: 'var(--space-4)' }}>
              Build Your Future <br/><span style={{ color: 'var(--color-primary)' }}>Before It Arrives.</span>
            </h1>
            
            <p style={{ fontSize: '1.25rem', color: 'var(--color-text-light)', marginBottom: 'var(--space-8)', maxWidth: '90%' }}>
              The premium AI-powered career operating system. Visualize your exact skill profile today and simulate what it will look like tomorrow.
            </p>
            
            <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
              <Button size="lg" onClick={() => navigate('/login?tab=signup')} style={{ boxShadow: 'var(--shadow-md)' }}>
                Create Your Career Twin <ArrowRight size={20} style={{ marginLeft: 8 }} />
              </Button>
              <Button size="lg" variant="secondary" onClick={() => setShowDemo(true)}>
                <Play size={20} style={{ marginRight: 8 }} /> Watch Demo
              </Button>
            </div>

            {/* Trust Indicators */}
            <div style={{ display: 'flex', gap: 'var(--space-6)', marginTop: 'var(--space-8)', alignItems: 'center' }}>
              <div style={{ display: 'flex' }}>
                {[1,2,3,4,5].map(i => <Star key={i} size={20} fill="#FBBC05" color="#FBBC05" />)}
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--color-text-light)', fontWeight: 600 }}>
                Trusted by 10,000+ Learners
              </div>
            </div>
          </motion.div>

          {/* Right Visual */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }}
            style={{ position: 'relative', height: '500px' }}
          >
            {/* Mock Career Twin UI Graphic */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(231,220,200,0.4) 0%, rgba(201,106,74,0.1) 100%)', borderRadius: '32px', border: '1px solid var(--color-glass-border)', overflow: 'hidden' }}>
              
              {/* Floating Element 1 */}
              <motion.div animate={{ y: [-10, 10, -10] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} style={{ position: 'absolute', top: 40, left: 40, background: 'white', padding: '20px', borderRadius: '16px', boxShadow: 'var(--shadow-md)', width: 200 }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', marginBottom: 4 }}>Current You</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text)' }}>72%</div>
                <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                  <span style={{ padding: '2px 8px', background: 'rgba(61,44,46,0.05)', borderRadius: 12, fontSize: '0.7rem' }}>React</span>
                  <span style={{ padding: '2px 8px', background: 'rgba(61,44,46,0.05)', borderRadius: 12, fontSize: '0.7rem' }}>Python</span>
                </div>
              </motion.div>

              {/* Floating Element 2 */}
              <motion.div animate={{ y: [10, -10, 10] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }} style={{ position: 'absolute', bottom: 60, right: 40, background: 'white', padding: '20px', borderRadius: '16px', boxShadow: 'var(--shadow-lg)', width: 220, border: '2px solid var(--color-primary)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 600, marginBottom: 4 }}>Future You (Simulated)</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary)' }}>100%</div>
                <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                  <span style={{ padding: '2px 8px', background: 'rgba(201,106,74,0.1)', color: 'var(--color-primary)', borderRadius: 12, fontSize: '0.7rem' }}>AI Agents</span>
                  <span style={{ padding: '2px 8px', background: 'rgba(201,106,74,0.1)', color: 'var(--color-primary)', borderRadius: 12, fontSize: '0.7rem' }}>AWS</span>
                </div>
              </motion.div>

              {/* Center Glow */}
              <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }} transition={{ repeat: Infinity, duration: 3 }} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 100, height: 100, background: 'var(--color-primary)', borderRadius: '50%', filter: 'blur(50px)' }}></motion.div>

            </div>
          </motion.div>
        </div>
      </main>

      {/* Demo Modal */}
      <AnimatePresence>
        {showDemo && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(61,44,46,0.8)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)' }}
            onClick={() => setShowDemo(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              style={{ background: 'var(--color-background)', width: '100%', maxWidth: 900, borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-4) var(--space-6)', borderBottom: '1px solid rgba(61,44,46,0.1)' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Nexora Platform Demo</h3>
                <button onClick={() => setShowDemo(false)} style={{ cursor: 'pointer', background: 'none', border: 'none' }}><X size={24} /></button>
              </div>
              <div style={{ padding: 'var(--space-6)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
                <DemoStep num={1} icon={<Zap/>} title="Career Intelligence" desc="Log in and instantly view your readiness score, skill gaps, and industry pulse." />
                <DemoStep num={2} icon={<Target/>} title="Career Twin" desc="Interact with your Future self. Simulate learning paths to see concrete readiness impacts." />
                <DemoStep num={3} icon={<MessageCircle/>} title="AI Mentor" desc="Get contextual advice based on your exact profile and targeted career goals." />
                <DemoStep num={4} icon={<Users/>} title="Opportunity Hub" desc="Connect instantly with matched peers, open teams, and industry mentors." />
              </div>
              <div style={{ padding: 'var(--space-4) var(--space-6)', background: 'rgba(61,44,46,0.02)', borderTop: '1px solid rgba(61,44,46,0.1)', display: 'flex', justifyContent: 'flex-end' }}>
                <Button onClick={() => navigate('/login')}>Start Interactive Demo</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DemoStep = ({ num, icon, title, desc }: any) => (
  <div style={{ display: 'flex', gap: '16px' }}>
    <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(201,106,74,0.1)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-primary)', textTransform: 'uppercase', marginBottom: 4 }}>Step {num}</div>
      <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 8 }}>{title}</h4>
      <p style={{ color: 'var(--color-text-light)', fontSize: '0.95rem' }}>{desc}</p>
    </div>
  </div>
);

export default Landing;

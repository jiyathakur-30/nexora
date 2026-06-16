import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, AlertCircle } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'signup' ? 'signup' : 'login';
  
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(initialTab);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !role) return;
    
    localStorage.setItem('nexora_user_name', name);
    localStorage.setItem('nexora_user_email', email);
    localStorage.setItem('nexora_user_role', role);
    localStorage.setItem('nexora_is_analyzed', 'false'); // Set to false initially
    
    navigate('/dashboard');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email) return;

    const storedEmail = localStorage.getItem('nexora_user_email');
    if (email !== storedEmail) {
      setError('No account found. Please check your email or sign up.');
      return;
    }
    
    navigate('/dashboard');
  };

  return (
    <div className="page-enter-active" style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
      
      {/* Left side: Branding */}
      <div style={{ backgroundColor: 'var(--color-card)', padding: 'var(--space-8)', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: '2.5rem', color: 'var(--color-primary)', fontWeight: 800, marginBottom: 'var(--space-2)' }}>Nexora</h1>
          <h2 style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.1, marginBottom: 'var(--space-6)' }}>Build Your Future<br/>Before It Arrives.</h2>
          <p style={{ fontSize: '1.2rem', color: 'var(--color-text-light)', maxWidth: 450 }}>
            Join ambitious learners mapping their career growth with the world's most advanced AI Career Twin.
          </p>
        </div>
        
        {/* Decorative Background Graphics */}
        <div style={{ position: 'absolute', right: -100, bottom: -100, width: 400, height: 400, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(201,106,74,0.2) 0%, transparent 100%)', zIndex: 0 }}></div>
      </div>

      {/* Right side: Login Form */}
      <div className="flex-center" style={{ padding: 'var(--space-8)' }}>
        <Card style={{ width: '100%', maxWidth: 440, padding: 'var(--space-8)', boxShadow: 'var(--shadow-lg)' }}>
          
          <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-8)', background: 'rgba(61,44,46,0.05)', padding: '4px', borderRadius: 'var(--radius-sm)' }}>
            <button onClick={() => { setActiveTab('login'); setError(''); }} style={{ flex: 1, padding: '10px', borderRadius: '4px', backgroundColor: activeTab === 'login' ? '#fff' : 'transparent', color: activeTab === 'login' ? 'var(--color-text)' : 'var(--color-text-light)', fontWeight: activeTab === 'login' ? 600 : 500, border: 'none', cursor: 'pointer', boxShadow: activeTab === 'login' ? 'var(--shadow-sm)' : 'none', transition: 'all 0.2s' }}>
              Login
            </button>
            <button onClick={() => { setActiveTab('signup'); setError(''); }} style={{ flex: 1, padding: '10px', borderRadius: '4px', backgroundColor: activeTab === 'signup' ? '#fff' : 'transparent', color: activeTab === 'signup' ? 'var(--color-text)' : 'var(--color-text-light)', fontWeight: activeTab === 'signup' ? 600 : 500, border: 'none', cursor: 'pointer', boxShadow: activeTab === 'signup' ? 'var(--shadow-sm)' : 'none', transition: 'all 0.2s' }}>
              Sign Up
            </button>
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', backgroundColor: 'rgba(192,86,86,0.1)', color: 'var(--color-danger)', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--space-4)', fontSize: '0.9rem', fontWeight: 600 }}>
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {activeTab === 'login' ? (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: 'var(--space-2)' }}>Welcome Back</h3>
              <p style={{ color: 'var(--color-text-light)', marginBottom: 'var(--space-4)' }}>Sign in to access your Career Intelligence.</p>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-light)', marginBottom: 8, textTransform: 'uppercase' }}>Email Address</label>
                <input type="email" required placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '14px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(61,44,46,0.1)' }} />
              </div>

              <Button type="submit" size="lg" style={{ width: '100%', marginTop: 'var(--space-2)' }}>
                Continue <ArrowRight size={18} style={{ marginLeft: 8 }} />
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: 'var(--space-2)' }}>Start Your Journey</h3>
              <p style={{ color: 'var(--color-text-light)', marginBottom: 'var(--space-4)' }}>Enter your details to generate your Career Twin.</p>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-light)', marginBottom: 8, textTransform: 'uppercase' }}>Full Name</label>
                <input type="text" required placeholder="Jiya Patel" value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: '14px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(61,44,46,0.1)' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-light)', marginBottom: 8, textTransform: 'uppercase' }}>Email Address</label>
                <input type="email" required placeholder="jiya@example.com" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '14px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(61,44,46,0.1)' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-light)', marginBottom: 8, textTransform: 'uppercase' }}>Target Role</label>
                <input type="text" required placeholder="e.g. AI Engineer, Product Manager" value={role} onChange={e => setRole(e.target.value)} style={{ width: '100%', padding: '14px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(61,44,46,0.1)' }} />
              </div>

              <Button type="submit" size="lg" style={{ width: '100%', marginTop: 'var(--space-2)' }}>
                Create My Career Twin <ArrowRight size={18} style={{ marginLeft: 8 }} />
              </Button>
            </form>
          )}

          <p style={{ marginTop: 'var(--space-8)', fontSize: '0.85rem', color: 'var(--color-text-light)', textAlign: 'center' }}>
            By continuing, you agree to Nexora's Terms of Service and Privacy Policy.
          </p>
        </Card>
      </div>

    </div>
  );
};

export default Login;

import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, Globe, Briefcase, GraduationCap, Code, FileText, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useCareerAgent } from '../services/CareerAgent';

const OpportunityHub: React.FC = () => {
  const { memory } = useCareerAgent();
  const navigate = useNavigate();

  const resumeConnected = memory.hasResume;
  const githubConnected = !!memory.githubUsername;
  const linkedinConnected = !!memory.linkedinUrl;
  const analysisGenerated = memory.isAnalyzed && !!memory.analysis;
  const twinGenerated = memory.isTwinGenerated && !!memory.analysis;

  const categories = [
    {
      id: 'internships',
      title: 'Internships & Entry-Level Roles',
      icon: <Briefcase size={24} color="var(--color-primary)" />,
      desc: 'Paid corporate positions, summer internships, and entry-level engineering placements.',
      requirements: [
        { name: 'Resume Connected', met: resumeConnected, key: 'resume' },
        { name: 'Analysis Generated', met: analysisGenerated, key: 'analysis' }
      ],
      futureAgentBehavior: 'The Career Agent will parse local and remote job boards, matching job descriptions against your resume skills and calculating an alignment score.'
    },
    {
      id: 'hackathons',
      title: 'Hackathons & Team Challenges',
      icon: <Globe size={24} color="#D49F00" />,
      desc: 'High-energy weekend sprints and collaborative prototyping competitions.',
      requirements: [
        { name: 'GitHub Connected', met: githubConnected, key: 'github' }
      ],
      futureAgentBehavior: 'The Career Agent will analyze your GitHub commits to match you with hackathons prioritizing your primary language and library stack.'
    },
    {
      id: 'opensource',
      title: 'Open Source Repositories',
      icon: <Code size={24} color="var(--color-text)" />,
      desc: 'Active open-source projects looking for contributors and reviewing pull requests.',
      requirements: [
        { name: 'GitHub Connected', met: githubConnected, key: 'github' },
        { name: 'Analysis Generated', met: analysisGenerated, key: 'analysis' }
      ],
      futureAgentBehavior: 'The Career Agent will inspect open issues on GitHub matching your critical skill gaps and suggest beginner-friendly issues.'
    },
    {
      id: 'competitions',
      title: 'Technical Competitions',
      icon: <ShieldCheck size={24} color="var(--color-success)" />,
      desc: 'Competitive programming contests, algorithm challenges, and Kaggle datasets.',
      requirements: [
        { name: 'Analysis Generated', met: analysisGenerated, key: 'analysis' }
      ],
      futureAgentBehavior: 'The Career Agent will look for challenges targeting your core strengths to build your competitive portfolio.'
    },
    {
      id: 'mentorships',
      title: 'Industry Mentorships',
      icon: <GraduationCap size={24} color="#0A66C2" />,
      desc: '1-on-1 mentorship pairings with senior engineers and domain experts.',
      requirements: [
        { name: 'LinkedIn Connected', met: linkedinConnected, key: 'linkedin' },
        { name: 'Analysis Generated', met: analysisGenerated, key: 'analysis' }
      ],
      futureAgentBehavior: 'The Career Agent will match you with mentors from your university alumni network or companies aligned with your career goals.'
    }
  ];

  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const activeCategoryData = categories.find(c => c.id === activeCategory);

  return (
    <div className="container page-enter-active" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-12)' }}>
      <header style={{ marginBottom: 'var(--space-8)' }}>
        <h1 style={{ fontSize: '2.5rem', color: 'var(--color-text)', marginBottom: 'var(--space-2)' }}>Opportunity Hub</h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--color-text-light)' }}>Discover matched projects, mentorships, and internships tailored to your skills.</p>
      </header>

      {/* Connection States Checklist Card */}
      <Card style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-8)', border: '1px solid var(--color-glass-border)' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 'var(--space-4)' }}>Matching Engine Connection Status</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
          <StatusItem label="Resume Connected" met={resumeConnected} icon={<FileText size={18} />} />
          <StatusItem label="GitHub Connected" met={githubConnected} icon={<Code size={18} />} />
          <StatusItem label="LinkedIn Connected" met={linkedinConnected} icon={<Briefcase size={18} />} />
          <StatusItem label="Analysis Generated" met={analysisGenerated} icon={<ShieldCheck size={18} />} />
          <StatusItem label="Career Twin Active" met={twinGenerated} icon={<Globe size={18} />} />
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: activeCategory ? '1fr 1fr' : '1fr', gap: 'var(--space-6)', transition: 'all 0.3s' }}>
        
        {/* Categories List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 'var(--space-2)' }}>Opportunity Categories</h3>
          {categories.map((c) => {
            const allMet = c.requirements.every(req => req.met);
            return (
              <Card 
                key={c.id} 
                hoverEffect 
                onClick={() => setActiveCategory(c.id)}
                style={{ 
                  cursor: 'pointer', 
                  border: activeCategory === c.id ? '2px solid var(--color-primary)' : '1px solid var(--color-glass-border)',
                  padding: 'var(--space-5)',
                  backgroundColor: activeCategory === c.id ? 'rgba(201,106,74,0.02)' : 'var(--color-card)',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--color-glass-border)' }}>
                    {c.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <h4 style={{ fontWeight: 700, fontSize: '1.15rem' }}>{c.title}</h4>
                      <span style={{ 
                        fontSize: '0.8rem', 
                        fontWeight: 700, 
                        color: allMet ? 'var(--color-success)' : 'var(--color-text-light)',
                        backgroundColor: allMet ? 'rgba(78, 139, 98, 0.1)' : 'rgba(61,44,46,0.05)',
                        padding: '4px 8px',
                        borderRadius: 12
                      }}>
                        {allMet ? 'Eligible for Matches' : 'Connections Required'}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)', marginBottom: 8 }}>{c.desc}</p>
                    
                    {/* Requirements summary */}
                    <div style={{ display: 'flex', gap: 12, fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
                      <span>Requires:</span>
                      {c.requirements.map(req => (
                        <span key={req.name} style={{ display: 'flex', alignItems: 'center', gap: 4, color: req.met ? 'var(--color-success)' : 'var(--color-text-light)', fontWeight: req.met ? 600 : 400 }}>
                          {req.met ? '✓' : '✗'} {req.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Selected Category Match Panel (Intelligent Empty States) */}
        {activeCategoryData && (
          <Card glass style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', border: '1px solid var(--color-glass-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: 1 }}>Opportunity Category Matcher</span>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 800 }}>{activeCategoryData.title}</h3>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setActiveCategory(null)}>Close Panel</Button>
            </div>

            <p style={{ color: 'var(--color-text)', fontSize: '0.95rem', lineHeight: 1.5, margin: 0 }}>
              {activeCategoryData.desc}
            </p>

            <div style={{ borderTop: '1px solid rgba(61,44,46,0.1)', borderBottom: '1px solid rgba(61,44,46,0.1)', padding: 'var(--space-4) 0' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-light)', textTransform: 'uppercase', marginBottom: 12 }}>Connection Requirements</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {activeCategoryData.requirements.map(req => (
                  <div key={req.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.95rem', color: 'var(--color-text)' }}>{req.name}</span>
                    <span style={{ 
                      fontSize: '0.85rem', 
                      fontWeight: 700, 
                      color: req.met ? 'var(--color-success)' : 'var(--color-danger)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 4 
                    }}>
                      {req.met ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                      {req.met ? 'Connected' : 'Missing'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-light)', textTransform: 'uppercase', marginBottom: 8 }}>Match Reasoning & Logic</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)', lineHeight: 1.5, margin: 0 }}>
                {activeCategoryData.futureAgentBehavior}
              </p>
            </div>

            {/* Match Empty State */}
            <div style={{ 
              flex: 1, 
              backgroundColor: 'rgba(255,255,255,0.4)', 
              borderRadius: 'var(--radius-md)', 
              border: '2px dashed var(--color-glass-border)',
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              textAlign: 'center',
              padding: 'var(--space-6) var(--space-4)'
            }}>
              {activeCategoryData.requirements.every(r => r.met) ? (
                <>
                  <ShieldCheck size={36} color="var(--color-success)" style={{ marginBottom: 12 }} />
                  <h4 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 4 }}>All Connections Verified</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', maxWidth: 280, margin: 0 }}>
                    We verified your credentials, but there are no active opportunities in our registry at this time. Match results will appear here as soon as new postings are indexed.
                  </p>
                </>
              ) : (
                <>
                  <ShieldAlert size={36} color="var(--color-warning)" style={{ marginBottom: 12 }} />
                  <h4 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 4 }}>Information Required</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', maxWidth: 280, marginBottom: 16 }}>
                    Connect the missing credentials list above to unlock this opportunity matcher category.
                  </p>
                  <Button size="sm" onClick={() => navigate('/dashboard')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    Configure Connections <ArrowRight size={14} />
                  </Button>
                </>
              )}
            </div>
          </Card>
        )}

      </div>
    </div>
  );
};

const StatusItem = ({ label, met, icon }: { label: string; met: boolean; icon: React.ReactNode }) => (
  <div style={{ 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: '12px 16px', 
    backgroundColor: 'var(--color-background)', 
    borderRadius: 'var(--radius-sm)',
    border: '1px solid rgba(61,44,46,0.05)'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text-light)' }}>
      {icon}
      <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text)' }}>{label}</span>
    </div>
    <span style={{ 
      fontSize: '0.8rem', 
      fontWeight: 700, 
      color: met ? 'var(--color-success)' : 'var(--color-text-light)',
      backgroundColor: met ? 'rgba(78, 139, 98, 0.1)' : 'rgba(61,44,46,0.05)',
      padding: '2px 8px',
      borderRadius: 10
    }}>
      {met ? 'Connected' : 'Not Connected'}
    </span>
  </div>
);

export default OpportunityHub;

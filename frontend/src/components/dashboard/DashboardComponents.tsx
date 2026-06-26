import React from 'react';
import { 
  ShieldCheck, Briefcase, FileText, Search, Bell, Sparkles, CheckCircle2, 
  Plus, RefreshCw, Bookmark, ArrowRight, Star, AlertCircle, TrendingUp
} from 'lucide-react';
import { Card, SectionHeader, MetricCard, Badge } from './DashboardPrimitives';
import { useNavigate } from 'react-router-dom';

// 1. Dashboard Header Component
interface DashboardHeaderProps {
  targetRole: string;
  userName: string;
  hasResume: boolean;
  onAction: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ targetRole, userName, hasResume, onAction }) => {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      marginBottom: 'var(--space-6)',
      paddingBottom: 'var(--space-4)',
      borderBottom: '1px solid var(--color-border)',
      flexWrap: 'wrap',
      gap: 'var(--space-3)',
      width: '100%'
    }}>
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text)', margin: 0, letterSpacing: '-0.03em' }}>
          Welcome, {userName || 'Jiya'} 👋
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)', marginTop: '4px', margin: 0 }}>
          Your career path is focused on <strong style={{ color: 'var(--color-primary)' }}>{targetRole || 'Software Engineer'}</strong>
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button 
          onClick={onAction}
          style={{
            backgroundColor: 'var(--color-primary)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 20px',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
            transition: 'background-color var(--transition-fast)'
          }}
          onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--color-primary-hover, #B35839)'}
          onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--color-primary)'}
        >
          {hasResume ? 'Update Resume' : 'Upload Resume'}
        </button>
      </div>
    </div>
  );
};

// 2. KPI Section Component (3 Cards)
interface KPISectionProps {
  analysis: any;
  hasResume: boolean;
}

export const KPISection: React.FC<KPISectionProps> = ({ analysis, hasResume }) => {
  const readiness = analysis ? (analysis.careerReadiness ?? analysis.alignmentScore ?? analysis.readiness ?? 72) : null;
  const atsScore = analysis ? (analysis.atsScore ?? analysis.resumeScore ?? 78) : null;
  const interviewScore = analysis ? (analysis.interviewReadiness ?? analysis.interviewScore ?? 68) : null;

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
      gap: 'var(--space-4)',
      marginBottom: 'var(--space-6)'
    }}>
      <MetricCard 
        title="Offer Readiness"
        value={readiness ? `${readiness}%` : '--'}
        trend={readiness ? '↑ 4% this month' : undefined}
        trendDirection={readiness ? 'up' : undefined}
        helperText={readiness ? "Aggregate readiness score for target companies." : "Connect resume to calculate readiness."}
      />
      <MetricCard 
        title="Resume ATS Match"
        value={atsScore ? `${atsScore}%` : '--'}
        trend={atsScore ? '↑ 12% updated' : undefined}
        trendDirection={atsScore ? 'up' : undefined}
        helperText={atsScore ? "Keyword optimization score against job specs." : "Upload resume to run ATS diagnostic."}
      />
      <MetricCard 
        title="Interview Competency"
        value={interviewScore ? `${interviewScore}%` : '--'}
        trend={interviewScore ? '↑ 5% practice' : undefined}
        trendDirection={interviewScore ? 'up' : undefined}
        helperText={interviewScore ? "Assessed logic and structural preparation." : "Complete mentor check-in to calibrate."}
      />
    </div>
  );
};

// 3. Signature Career Roadmap (Hero Area)
interface CareerRoadmapProps {
  analysis: any;
  targetRole: string;
  onOpenTwin: () => void;
}

export const CareerRoadmap: React.FC<CareerRoadmapProps> = ({ analysis, targetRole, onOpenTwin }) => {
  const roadmapSteps = analysis?.roadmap || [
    { label: "Resume Analysis", value: "Verified Profile", completed: true },
    { label: "Critical Gaps", value: "Addressing Skills", completed: false, active: true },
    { label: "Target Prep", value: "Logic & Mock Prep", completed: false },
    { label: "Dream Offer", value: "Staff Placement", completed: false }
  ];

  return (
    <Card hoverEffect={false} padding="var(--space-5)" style={{ 
      marginBottom: 'var(--space-6)', 
      border: '1.5px solid var(--color-border)',
      borderLeft: '5px solid var(--color-primary)',
      background: 'rgba(201, 106, 74, 0.015)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-5)' }}>
        <div>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>
            Where am I?
          </span>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--color-text)', margin: 0, letterSpacing: '-0.02em' }}>
            Your Personalized Career Roadmap
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', marginTop: '4px', margin: 0 }}>
            Visualizing milestones needed to secure a position as a <strong>{targetRole || 'Software Engineer'}</strong>.
          </p>
        </div>
        <button 
          onClick={onOpenTwin}
          className="nexora-link"
          style={{ border: 'none', background: 'transparent' }}
        >
          Open Career Twin <ArrowRight size={14} />
        </button>
      </div>

      {/* Unique Roadmap Horizontal Flow */}
      <div style={{ 
        position: 'relative', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        padding: '16px 0',
        marginTop: '8px'
      }}>
        {/* Curved Connection Path Line */}
        <div style={{ 
          position: 'absolute', 
          left: '12%', 
          right: '12%', 
          top: '32px', 
          height: '4px', 
          backgroundColor: 'var(--color-border)', 
          zIndex: 1,
          borderRadius: '2px'
        }}>
          {/* Completed progress fill */}
          <div style={{ 
            height: '100%', 
            width: '35%', 
            backgroundColor: 'var(--color-success)', 
            borderRadius: '2px',
            transition: 'width var(--transition-normal)'
          }} />
        </div>

        {roadmapSteps.map((step: any, idx: number) => {
          const isCompleted = step.completed || idx === 0;
          const isActive = step.active || (!step.completed && idx === 1);
          
          const dotBorderColor = isCompleted 
            ? 'var(--color-success)' 
            : isActive 
              ? 'var(--color-primary)' 
              : 'var(--color-border)';

          const labelColor = isCompleted 
            ? 'var(--color-success)' 
            : isActive 
              ? 'var(--color-primary)' 
              : 'var(--color-text-light)';

          return (
            <div key={idx} style={{ 
              position: 'relative', 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              zIndex: 2
            }}>
              {/* Outer Glow for Active Node */}
              <div style={{ 
                width: '36px', 
                height: '36px', 
                borderRadius: '50%', 
                backgroundColor: isCompleted ? 'var(--color-success)' : '#FFFFFF',
                border: `2px solid ${dotBorderColor}`,
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: isActive ? '0 0 0 4px rgba(201, 106, 74, 0.12)' : 'var(--shadow-sm)',
                color: '#FFFFFF',
                fontSize: '11px',
                fontWeight: 700,
                transition: 'all var(--transition-normal)'
              }}>
                {isCompleted ? '✓' : isActive ? '●' : ''}
              </div>

              <div style={{ marginTop: '12px', textAlign: 'center', maxWidth: '120px' }}>
                <span style={{ 
                  fontSize: '0.72rem', 
                  fontWeight: 700, 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.04em', 
                  color: labelColor, 
                  display: 'block', 
                  marginBottom: '2px' 
                }}>
                  {step.label}
                </span>
                <span style={{ 
                  fontSize: '0.82rem', 
                  fontWeight: 600, 
                  color: 'var(--color-text)', 
                  display: 'block',
                  opacity: isCompleted ? 0.75 : 1
                }}>
                  {step.value}
                </span>
                {isActive && (
                  <Badge variant="primary" style={{ marginTop: '6px', fontSize: '0.65rem' }}>
                    Immediate Target
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

// 4. Conversational AI Mentor Coach Card
interface AICoachCardProps {
  weeklyMissions: any[];
  targetRole: string;
  onComplete: (mission: any) => void;
  onSkip: (mission: any) => void;
  onAddCustom: () => void;
}

export const AICoachCard: React.FC<AICoachCardProps> = ({ 
  weeklyMissions = [], 
  targetRole, 
  onComplete, 
  onSkip,
  onAddCustom
}) => {
  const activeMission = weeklyMissions.length > 0 ? weeklyMissions[0] : null;

  return (
    <Card padding="var(--space-5)" style={{ 
      border: '1.5px solid rgba(201, 106, 74, 0.24)', 
      borderLeft: '5px solid var(--color-primary)',
      background: 'rgba(201, 106, 74, 0.035)',
      display: 'flex', 
      flexDirection: 'column', 
      gap: '16px',
      position: 'relative'
    }}>
      {/* Decorative mentor quote mark */}
      <div style={{ 
        position: 'absolute', 
        right: '24px', 
        top: '16px', 
        fontSize: '4rem', 
        fontWeight: 800, 
        color: 'rgba(201, 106, 74, 0.05)',
        lineHeight: 1,
        pointerEvents: 'none'
      }}>
        “
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <Sparkles size={16} color="var(--color-primary)" />
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            What should I do next? — AI Mentor
          </span>
        </div>
        <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-text)', margin: 0, letterSpacing: '-0.01em' }}>
          Conversational Action Item
        </h3>
      </div>

      {activeMission ? (
        <>
          <p style={{ fontSize: '1.05rem', fontWeight: 500, color: 'var(--color-text)', lineHeight: 1.5, margin: 0 }}>
            "Good morning! To optimize your preparation for <strong>{targetRole || 'Software Engineer'}</strong> roles, we need to focus on your immediate target: <strong style={{ color: 'var(--color-primary)' }}>{activeMission.text}</strong>. Completing this will boost your Offer Readiness index."
          </p>

          <div style={{ 
            backgroundColor: 'rgba(61,44,46,0.02)', 
            padding: '12px 16px', 
            borderRadius: 'var(--radius-sm)', 
            border: '1px solid var(--color-border)',
            fontSize: '0.82rem',
            color: 'var(--color-text-light)'
          }}>
            <strong>Reasoning:</strong> {activeMission.why}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Badge variant="primary">{activeMission.difficulty}</Badge>
              <Badge>{activeMission.category}</Badge>
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              {activeMission.source === 'AI Generated' && (
                <button 
                  onClick={() => onSkip(activeMission)}
                  title="Cycle recommendation"
                  style={{ 
                    border: '1px solid var(--color-border)', 
                    backgroundColor: '#FFFFFF',
                    borderRadius: 'var(--radius-sm)',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.82rem',
                    color: 'var(--color-text-light)'
                  }}
                >
                  <RefreshCw size={12} /> Replace
                </button>
              )}
              <button 
                onClick={() => onComplete(activeMission)}
                style={{ 
                  backgroundColor: 'var(--color-primary)', 
                  color: '#FFFFFF',
                  borderRadius: 'var(--radius-sm)',
                  padding: '8px 16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none',
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <CheckCircle2 size={14} /> Log Progress
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          <p style={{ fontSize: '0.95rem', color: 'var(--color-text-light)', lineHeight: 1.5, margin: 0 }}>
            "You are all caught up on your roadmap actions. Ready to define your next milestones?"
          </p>
          <button 
            onClick={onAddCustom}
            style={{ 
              backgroundColor: 'var(--color-primary)', 
              color: '#FFFFFF',
              borderRadius: 'var(--radius-sm)',
              padding: '8px 16px',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              fontSize: '0.82rem',
              width: 'fit-content',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Plus size={14} /> Add Custom Goal
          </button>
        </>
      )}
    </Card>
  );
};

// 5. Resume Insights Component
interface ResumeInsightsProps {
  analysis: any;
  hasResume: boolean;
  onOpenTwin: () => void;
}

export const ResumeInsights: React.FC<ResumeInsightsProps> = ({ analysis, hasResume, onOpenTwin }) => {
  const missingKeywords = analysis?.missingKeywords || ['System Design', 'Kubernetes', 'CI/CD Pipelines'];

  return (
    <Card padding="var(--space-4)" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div>
        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '2px' }}>
          Resume Diagnostics
        </span>
        <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>ATS Keyword Gaps</h4>
      </div>

      {hasResume && analysis ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {missingKeywords.slice(0, 4).map((kw: string) => (
              <Badge key={kw} variant="danger" style={{ fontSize: '0.75rem', padding: '3px 8px' }}>{kw}</Badge>
            ))}
          </div>
          <span 
            onClick={onOpenTwin} 
            className="nexora-link" 
            style={{ fontSize: '0.8rem', cursor: 'pointer', alignSelf: 'flex-start', marginTop: '4px' }}
          >
            Optimize in Career Twin
          </span>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0' }}>
          <FileText size={18} color="var(--color-text-light)" style={{ opacity: 0.6 }} />
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', margin: 0 }}>
            No resume analyzed. Upload one to scan for keyword gaps.
          </p>
        </div>
      )}
    </Card>
  );
};

// 6. Skills Summary Component (Top 3 Strengths & Gaps)
interface SkillsSummaryProps {
  dynamicProfile: any;
  analysis: any;
  onOpenTwin: () => void;
}

export const SkillsSummary: React.FC<SkillsSummaryProps> = ({ dynamicProfile, analysis, onOpenTwin }) => {
  const strengths = dynamicProfile?.strengths?.slice(0, 3) || ['React / TS', 'REST APIs', 'SQL Modeling'];
  const gaps = dynamicProfile?.gaps?.slice(0, 3) || ['DSA complexity', 'System Design', 'Cloud Deployments'];

  return (
    <Card padding="var(--space-4)" style={{ flex: 1.2, display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>
            Skill Profile
          </span>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Core Capability Balance</h4>
        </div>
        <span onClick={onOpenTwin} className="nexora-link" style={{ fontSize: '0.8rem' }}>
          Full Breakdown
        </span>
      </div>

      {analysis ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', flex: 1 }}>
          {/* Strengths */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-success)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Top Strengths
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {strengths.map((str: string, idx: number) => (
                <div key={idx} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  padding: '6px 8px', 
                  backgroundColor: 'rgba(79, 143, 101, 0.05)',
                  border: '1px solid rgba(79, 143, 101, 0.1)',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  color: 'var(--color-text)'
                }}>
                  <CheckCircle2 size={12} color="var(--color-success)" />
                  <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{str}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Gaps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-warning)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Development Gaps
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {gaps.map((gap: string, idx: number) => (
                <div key={idx} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  padding: '6px 8px', 
                  backgroundColor: 'rgba(217, 140, 58, 0.05)',
                  border: '1px solid rgba(217, 140, 58, 0.1)',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  color: 'var(--color-text)'
                }}>
                  <AlertCircle size={12} color="var(--color-warning)" />
                  <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{gap}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '16px 0', textAlign: 'center' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--color-text-light)', margin: 0 }}>
            Generate profile analysis to extract capabilities.
          </span>
        </div>
      )}
    </Card>
  );
};


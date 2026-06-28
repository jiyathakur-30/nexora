import React from 'react';
import {
  ShieldCheck, Briefcase, FileText, Search, Bell, Sparkles, CheckCircle2,
  Plus, RefreshCw, Bookmark, ArrowRight, Star, AlertCircle, TrendingUp
} from 'lucide-react';
import { Card, SectionHeader, MetricCard, Badge } from './DashboardPrimitives';
import { useNavigate } from 'react-router-dom';

// ─── Shared micro-styles ────────────────────────────────────────────────────

const pill: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '3px 10px',
  borderRadius: '999px',
  fontSize: '0.72rem',
  fontWeight: 600,
  letterSpacing: '0.02em',
};

const label: React.CSSProperties = {
  fontSize: '0.68rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--color-primary)',
  display: 'block',
  marginBottom: '4px',
};

const subtleBtn: React.CSSProperties = {
  border: '1px solid var(--color-border)',
  backgroundColor: 'transparent',
  borderRadius: '8px',
  padding: '7px 13px',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '5px',
  fontSize: '0.8rem',
  fontWeight: 500,
  color: 'var(--color-text-light)',
  transition: 'all 0.15s ease',
};

const primaryBtn: React.CSSProperties = {
  backgroundColor: 'var(--color-primary)',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  padding: '8px 18px',
  fontWeight: 600,
  cursor: 'pointer',
  fontSize: '0.82rem',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  transition: 'opacity 0.15s ease, transform 0.1s ease',
  letterSpacing: '-0.01em',
};

// ─── 1. Dashboard Header ────────────────────────────────────────────────────

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
      marginBottom: '32px',
      paddingBottom: '24px',
      borderBottom: '1px solid var(--color-border)',
      flexWrap: 'wrap',
      gap: '16px',
      width: '100%',
    }}>
      {/* Left: greeting + title */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <span style={{
          fontSize: '0.75rem',
          fontWeight: 500,
          color: 'var(--color-text-light)',
          letterSpacing: '0.01em',
        }}>
          Good evening 👋
        </span>

        <h1 style={{
          fontSize: 'clamp(1.45rem, 3vw, 1.9rem)',
          fontWeight: 800,
          margin: 0,
          letterSpacing: '-0.035em',
          lineHeight: 1.15,
          color: 'var(--color-text)',
        }}>
          AI Career Command Center
        </h1>

        <p style={{
          margin: 0,
          marginTop: '6px',
          fontSize: '0.85rem',
          color: 'var(--color-text-light)',
          lineHeight: 1.5,
        }}>
          Building your path to{' '}
          <strong style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
            {targetRole || 'AI Engineer'}
          </strong>
        </p>
      </div>

      {/* Right: status + actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ textAlign: 'right', marginRight: '4px' }}>
          <div style={{ fontSize: '0.68rem', color: 'var(--color-text-light)', marginBottom: '1px', fontWeight: 500 }}>
            Last updated
          </div>
          <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--color-text)' }}>
            Today
          </div>
        </div>

        <div style={{
          ...pill,
          background: '#ECFDF3',
          color: '#16A34A',
          border: '1px solid rgba(22,163,74,0.2)',
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#16A34A', display: 'inline-block' }} />
          Career Twin Active
        </div>

        <button
          onClick={onAction}
          style={primaryBtn}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.opacity = '0.88';
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.opacity = '1';
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
          }}
        >
          {hasResume ? 'Update Resume' : 'Upload Resume'}
        </button>
      </div>
    </div>
  );
};

// ─── 2. KPI Section ─────────────────────────────────────────────────────────

interface KPISectionProps {
  analysis: any;
  hasResume: boolean;
}

export const KPISection: React.FC<KPISectionProps> = ({ analysis, hasResume }) => {
  const careerReadiness =
    analysis?.careerReadiness ??
    analysis?.readiness ??
    82;

  const internshipReadiness =
    analysis?.internshipReadiness ??
    analysis?.internshipScore ??
    68;

  const targetRole = analysis?.targetRole ?? 'AI Engineer';

  const ProgressBar: React.FC<{ value: number; color?: string }> = ({ value, color = 'var(--color-primary)' }) => (
    <div style={{
      width: '100%',
      height: '5px',
      backgroundColor: 'var(--color-border)',
      borderRadius: '999px',
      overflow: 'hidden',
      margin: '10px 0 14px',
    }}>
      <div style={{
        height: '100%',
        width: `${Math.min(Math.max(value, 0), 100)}%`,
        backgroundColor: color,
        borderRadius: '999px',
        transition: 'width var(--transition-normal)',
      }} />
    </div>
  );

  const kpiCardStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid var(--color-border)',
    background: '#fff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    transition: 'box-shadow 0.18s ease, transform 0.18s ease',
    cursor: 'default',
  };

  const handleHover = (e: React.MouseEvent<HTMLDivElement>, enter: boolean) => {
    const el = e.currentTarget as HTMLDivElement;
    el.style.boxShadow = enter ? '0 6px 20px rgba(0,0,0,0.08)' : '0 1px 3px rgba(0,0,0,0.04)';
    el.style.transform = enter ? 'translateY(-2px)' : 'translateY(0)';
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '16px',
      marginBottom: '24px',
    }}>
      {/* Card 1: Career Readiness */}
      <div
        style={kpiCardStyle}
        onMouseEnter={e => handleHover(e, true)}
        onMouseLeave={e => handleHover(e, false)}
      >
        <span style={label}>Career Readiness</span>

        <span style={{
          fontSize: '2.4rem',
          fontWeight: 800,
          color: 'var(--color-text)',
          letterSpacing: '-0.03em',
          lineHeight: 1,
        }}>
          {careerReadiness}<span style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--color-text-light)' }}>%</span>
        </span>

        <ProgressBar value={careerReadiness} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingTop: '12px', borderTop: '1px solid var(--color-border)' }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Target Role
          </span>
          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-text)' }}>
            {targetRole}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--color-border)' }}>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#16A34A' }}>↗ +5% this week</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-light)', marginTop: '1px' }}>Learning faster</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-text)' }}>{careerReadiness}/100</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-light)', marginTop: '1px' }}>Overall score</div>
          </div>
        </div>
      </div>

      {/* Card 2: Internship Readiness */}
      <div
        style={kpiCardStyle}
        onMouseEnter={e => handleHover(e, true)}
        onMouseLeave={e => handleHover(e, false)}
      >
        <span style={label}>Internship Readiness</span>

        <span style={{
          fontSize: '2.4rem',
          fontWeight: 800,
          color: 'var(--color-text)',
          letterSpacing: '-0.03em',
          lineHeight: 1,
        }}>
          {internshipReadiness}<span style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--color-text-light)' }}>%</span>
        </span>

        <ProgressBar value={internshipReadiness} color="var(--color-success)" />

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--color-border)' }}>
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-text)' }}>132+</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-light)', marginTop: '1px' }}>Companies matched</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#16A34A' }}>Live</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-light)', marginTop: '1px' }}>Hiring status</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── 3. Career Roadmap ───────────────────────────────────────────────────────

interface CareerRoadmapProps {
  analysis: any;
  targetRole: string;
  onOpenTwin: () => void;
}

export const CareerRoadmap: React.FC<CareerRoadmapProps> = ({ analysis, targetRole, onOpenTwin }) => {
  const roadmapSteps = analysis?.roadmap || [
    { label: 'Resume Analysis', value: 'Verified Profile', completed: true },
    { label: 'Critical Gaps', value: 'Addressing Skills', completed: false, active: true },
    { label: 'Target Prep', value: 'Logic & Mock Prep', completed: false },
    { label: 'Dream Offer', value: 'Staff Placement', completed: false },
  ];

  return (
    <div style={{
      marginBottom: '24px',
      borderRadius: '14px',
      border: '1px solid var(--color-border)',
      borderLeft: '4px solid var(--color-primary)',
      background: 'rgba(201,106,74,0.018)',
      padding: '24px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <span style={label}>Where am I?</span>
          <h2 style={{
            fontSize: 'clamp(1.1rem, 2.5vw, 1.45rem)',
            fontWeight: 800,
            color: 'var(--color-text)',
            margin: 0,
            letterSpacing: '-0.025em',
          }}>
            Your Personalized Career Roadmap
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-light)', marginTop: '5px', lineHeight: 1.5 }}>
            Milestones to secure a position as a <strong style={{ color: 'var(--color-text)', fontWeight: 600 }}>{targetRole || 'Software Engineer'}</strong>
          </p>
        </div>
        <button
          onClick={onOpenTwin}
          className="nexora-link"
          style={{
            border: 'none',
            background: 'transparent',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: 'var(--color-primary)',
            cursor: 'pointer',
            padding: '6px 0',
          }}
        >
          Open Career Twin <ArrowRight size={13} />
        </button>
      </div>

      {/* Steps */}
      <div style={{
        position: 'relative',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: '8px 0 4px',
      }}>
        {/* Track line */}
        <div style={{
          position: 'absolute',
          left: '8%',
          right: '8%',
          top: '20px',
          height: '3px',
          backgroundColor: 'var(--color-border)',
          zIndex: 1,
          borderRadius: '2px',
        }}>
          <div style={{
            height: '100%',
            width: '35%',
            backgroundColor: 'var(--color-success)',
            borderRadius: '2px',
            transition: 'width var(--transition-normal)',
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
              zIndex: 2,
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: isCompleted ? 'var(--color-success)' : '#fff',
                border: `2px solid ${dotBorderColor}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isActive
                  ? '0 0 0 5px rgba(201,106,74,0.12)'
                  : '0 1px 3px rgba(0,0,0,0.08)',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 700,
                transition: 'all 0.2s ease',
              }}>
                {isCompleted ? '✓' : isActive ? (
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', display: 'block' }} />
                ) : ''}
              </div>

              <div style={{ marginTop: '12px', textAlign: 'center', maxWidth: '110px' }}>
                <span style={{
                  fontSize: '0.67rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: labelColor,
                  display: 'block',
                  marginBottom: '3px',
                }}>
                  {step.label}
                </span>
                <span style={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'var(--color-text)',
                  display: 'block',
                  opacity: isCompleted ? 0.7 : 1,
                }}>
                  {step.value}
                </span>
                {isActive && (
                  <Badge variant="primary" style={{ marginTop: '6px', fontSize: '0.62rem', padding: '2px 7px' }}>
                    In Progress
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── 4. AI Coach Card ────────────────────────────────────────────────────────

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
  onAddCustom,
}) => {
  const activeMission = weeklyMissions.length > 0 ? weeklyMissions[0] : null;

  return (
    <div style={{
      borderRadius: '14px',
      border: '1px solid rgba(201,106,74,0.22)',
      borderLeft: '4px solid var(--color-primary)',
      background: 'rgba(201,106,74,0.028)',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    }}>
      {/* Decorative quote mark */}
      <div style={{
        position: 'absolute',
        right: '20px',
        top: '10px',
        fontSize: '5rem',
        fontWeight: 900,
        color: 'rgba(201,106,74,0.06)',
        lineHeight: 1,
        pointerEvents: 'none',
        userSelect: 'none',
        fontFamily: 'Georgia, serif',
      }}>
        "
      </div>

      {/* Card header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '5px' }}>
          <Sparkles size={14} color="var(--color-primary)" />
          <span style={{ ...label, margin: 0, color: 'var(--color-primary)' }}>
            What should I do next? — AI Mentor
          </span>
        </div>
        <h3 style={{
          fontSize: '1.15rem',
          fontWeight: 800,
          color: 'var(--color-text)',
          margin: 0,
          letterSpacing: '-0.02em',
        }}>
          Conversational Action Item
        </h3>
      </div>

      {activeMission ? (
        <>
          <p style={{
            fontSize: '0.95rem',
            fontWeight: 500,
            color: 'var(--color-text)',
            lineHeight: 1.65,
            margin: 0,
          }}>
            "Good morning! To optimize your preparation for <strong>{targetRole || 'Software Engineer'}</strong> roles, we need to focus on your immediate target:{' '}
            <strong style={{ color: 'var(--color-primary)' }}>{activeMission.text}</strong>.
            Completing this will boost your Offer Readiness index."
          </p>

          <div style={{
            backgroundColor: 'rgba(0,0,0,0.025)',
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1px solid var(--color-border)',
            fontSize: '0.8rem',
            color: 'var(--color-text-light)',
            lineHeight: 1.55,
          }}>
            <strong style={{ color: 'var(--color-text)', fontWeight: 600 }}>Reasoning:</strong>{' '}
            {activeMission.why}
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
          }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              <Badge variant="primary">{activeMission.difficulty}</Badge>
              <Badge>{activeMission.category}</Badge>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {activeMission.source === 'AI Generated' && (
                <button
                  onClick={() => onSkip(activeMission)}
                  title="Cycle recommendation"
                  style={subtleBtn}
                  onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-primary)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)')}
                >
                  <RefreshCw size={12} /> Replace
                </button>
              )}
              <button
                onClick={() => onComplete(activeMission)}
                style={primaryBtn}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.opacity = '0.88';
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.opacity = '1';
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                }}
              >
                <CheckCircle2 size={13} /> Log Progress
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)', lineHeight: 1.6, margin: 0 }}>
            "You're all caught up on your roadmap. Ready to define your next milestones?"
          </p>
          <button
            onClick={onAddCustom}
            style={{ ...primaryBtn, alignSelf: 'flex-start' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.opacity = '0.88';
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.opacity = '1';
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
            }}
          >
            <Plus size={13} /> Add Custom Goal
          </button>
        </>
      )}
    </div>
  );
};

// ─── 5. Resume Insights ──────────────────────────────────────────────────────

interface ResumeInsightsProps {
  analysis: any;
  hasResume: boolean;
  onOpenTwin: () => void;
}

export const ResumeInsights: React.FC<ResumeInsightsProps> = ({ analysis, hasResume, onOpenTwin }) => {
  const missingKeywords = analysis?.missingKeywords || ['System Design', 'Kubernetes', 'CI/CD Pipelines'];

  return (
    <Card padding="20px" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div>
        <span style={label}>Resume Diagnostics</span>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>
          ATS Keyword Gaps
        </h4>
      </div>

      {hasResume && analysis ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
            {missingKeywords.slice(0, 4).map((kw: string) => (
              <Badge key={kw} variant="danger" style={{ fontSize: '0.72rem', padding: '3px 9px' }}>
                {kw}
              </Badge>
            ))}
          </div>
          <span
            onClick={onOpenTwin}
            className="nexora-link"
            style={{
              fontSize: '0.78rem',
              cursor: 'pointer',
              alignSelf: 'flex-start',
              fontWeight: 600,
              color: 'var(--color-primary)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            Optimize in Career Twin <ArrowRight size={11} />
          </span>
        </div>
      ) : (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 12px',
          borderRadius: '8px',
          border: '1px dashed var(--color-border)',
          background: 'rgba(0,0,0,0.015)',
        }}>
          <FileText size={16} color="var(--color-text-light)" style={{ opacity: 0.55, flexShrink: 0 }} />
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', margin: 0, lineHeight: 1.5 }}>
            No resume analyzed. Upload one to scan for keyword gaps.
          </p>
        </div>
      )}
    </Card>
  );
};

// ─── 6. Skills Summary ───────────────────────────────────────────────────────

interface SkillsSummaryProps {
  dynamicProfile: any;
  analysis: any;
  onOpenTwin: () => void;
}

export const SkillsSummary: React.FC<SkillsSummaryProps> = ({ dynamicProfile, analysis, onOpenTwin }) => {
  const strengths = dynamicProfile?.strengths?.slice(0, 3) || ['React / TS', 'REST APIs', 'SQL Modeling'];
  const gaps = dynamicProfile?.gaps?.slice(0, 3) || ['DSA complexity', 'System Design', 'Cloud Deployments'];

  return (
    <Card padding="20px" style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%', minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span style={label}>Skill Profile</span>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>
            Core Capability Balance
          </h4>
        </div>
        <span
          onClick={onOpenTwin}
          className="nexora-link"
          style={{
            fontSize: '0.78rem',
            fontWeight: 600,
            color: 'var(--color-primary)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            whiteSpace: 'nowrap',
          }}
        >
          Full Breakdown <ArrowRight size={11} />
        </span>
      </div>

      {analysis ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '16px',
          flex: 1,
        }}>
          {/* Strengths */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              color: 'var(--color-success)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}>
              Top Strengths
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {strengths.map((str: string, idx: number) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px',
                  padding: '6px 9px',
                  backgroundColor: 'rgba(22,163,74,0.05)',
                  border: '1px solid rgba(22,163,74,0.12)',
                  borderRadius: '7px',
                  fontSize: '0.78rem',
                  fontWeight: 500,
                  color: 'var(--color-text)',
                  transition: 'background 0.15s',
                }}>
                  <CheckCircle2 size={12} color="var(--color-success)" style={{ flexShrink: 0 }} />
                  <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{str}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Gaps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              color: 'var(--color-warning)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}>
              Development Gaps
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {gaps.map((gap: string, idx: number) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px',
                  padding: '6px 9px',
                  backgroundColor: 'rgba(217,140,58,0.05)',
                  border: '1px solid rgba(217,140,58,0.12)',
                  borderRadius: '7px',
                  fontSize: '0.78rem',
                  fontWeight: 500,
                  color: 'var(--color-text)',
                  transition: 'background 0.15s',
                }}>
                  <AlertCircle size={12} color="var(--color-warning)" style={{ flexShrink: 0 }} />
                  <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{gap}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px 16px',
          borderRadius: '8px',
          border: '1px dashed var(--color-border)',
          background: 'rgba(0,0,0,0.015)',
          textAlign: 'center',
        }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', lineHeight: 1.55 }}>
            Generate profile analysis to extract capabilities.
          </span>
        </div>
      )}
    </Card>
  );
};

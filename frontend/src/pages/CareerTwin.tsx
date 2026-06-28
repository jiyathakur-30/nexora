import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Clock, TrendingUp, History, Sparkles, ChevronRight, Loader2, Play, ArrowLeft, Lock, Target, Code, Briefcase, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useCareerAgent } from '../services/CareerAgent';
import { generateMissions } from '../services/MissionGenerator';

// Normalize Gemini API response to match the frontend's expected AnalysisResults shape
export function normalizeAnalysis(raw: any, targetRole: string) {
  const gaps = raw.gaps || raw.missingSkills || [];
  const insights = raw.insights || raw.recommendations || [];
  const strengths = raw.strengths || [];

  // Three-score system — fall back to single readiness for legacy cached data
  const careerReadiness = raw.careerReadiness ?? raw.readiness ?? raw.alignmentScore ?? 0;
  const internshipReadiness = raw.internshipReadiness ?? careerReadiness;
  const jobReadiness = raw.jobReadiness ?? careerReadiness;

  return {
    readiness: careerReadiness,
    alignmentScore: careerReadiness,
    careerReadiness,
    internshipReadiness,
    jobReadiness,
    strengths,
    gaps,
    currentSkills: raw.currentSkills || strengths,
    futureSkills: raw.futureSkills || gaps.slice(0, 3),
    insights,
    recommendations: insights,
    milestones: raw.milestones || [
      { threshold: 80, label: 'Intern Ready' },
      { threshold: 90, label: 'Industry Ready' },
      { threshold: 100, label: 'Dream Role Ready' },
    ],
    techPulse: raw.techPulse || {
      now: strengths.slice(0, 3),
      later: gaps.slice(0, 3),
      ignore: [],
    },
    roadmap: raw.roadmap || [
      { label: 'Current Stage', value: targetRole, color: 'var(--color-primary)' },
      { label: 'Next Skill Milestone', value: gaps[0] || 'Core Skills', color: 'var(--color-warning)' },
      { label: 'Next Career Stage', value: `Senior ${targetRole}`, color: 'var(--color-success)' },
      { label: 'Long-Term Goal', value: `Lead ${targetRole}`, color: 'var(--color-success)' },
    ],
  };
}

const SIMULATION_RULES: Record<string, { impact: number, time: string, demand: string, skills: string[], desc: string }> = {
  'aws': { impact: 8, time: '4 Weeks', demand: 'High', skills: ['AWS', 'Cloud Infrastructure', 'Deployment'], desc: 'Cloud expertise directly increases your hireability for modern infrastructure roles.' },
  'docker': { impact: 6, time: '2 Weeks', demand: 'High', skills: ['Docker', 'Containerization'], desc: 'Containerization is a foundational requirement for most backend and full-stack positions.' },
  'kubernetes': { impact: 12, time: '6 Weeks', demand: 'Very High', skills: ['Kubernetes', 'Orchestration', 'DevOps'], desc: 'Advanced orchestration skills significantly boost your value for scalable architecture teams.' },
  'system design': { impact: 15, time: '8 Weeks', demand: 'Very High', skills: ['Architecture', 'Scalability', 'Microservices'], desc: 'Mastering system design is critical for passing senior-level interviews and architecting robust systems.' },
  'ai agent': { impact: 15, time: '3 Weeks', demand: 'Very High', skills: ['AI Agents', 'LLMs', 'Workflow Automation'], desc: 'AI Agent development directly aligns with your target role and closes one of your highest-impact skill gaps.' },
  'dsa': { impact: 10, time: '8 Weeks', demand: 'High', skills: ['Algorithms', 'Data Structures', 'Problem Solving'], desc: 'Core DSA competency is required for passing technical screens at top-tier companies.' },
  'hackathon': { impact: 12, time: '1 Week', demand: 'High', skills: ['Rapid Prototyping', 'Teamwork', 'Execution'], desc: 'Winning or participating in hackathons demonstrates applied execution and teamwork under pressure.' },
  'open source': { impact: 9, time: 'Ongoing', demand: 'High', skills: ['Collaboration', 'Code Review', 'Git Workflow'], desc: 'Contributing to open source builds a public track record of your code quality.' },
  'react': { impact: 7, time: '3 Weeks', demand: 'High', skills: ['React', 'Component Design', 'State Management'], desc: 'React is the dominant frontend framework and a required skill for most product engineering roles.' },
  'typescript': { impact: 5, time: '2 Weeks', demand: 'High', skills: ['TypeScript', 'Type Safety'], desc: 'TypeScript adoption is now standard across enterprise codebases and open source projects.' },
  'python': { impact: 6, time: '3 Weeks', demand: 'High', skills: ['Python', 'Scripting', 'Data Pipelines'], desc: 'Python fluency is a baseline requirement for AI, data science, and backend engineering roles.' },
  'sql': { impact: 5, time: '2 Weeks', demand: 'High', skills: ['SQL', 'Database Querying', 'Data Analysis'], desc: 'SQL proficiency is expected for virtually every data-adjacent and backend role.' },
  'machine learning': { impact: 11, time: '6 Weeks', demand: 'Very High', skills: ['ML Fundamentals', 'Model Training', 'scikit-learn'], desc: 'ML fundamentals directly expand your eligibility for AI and data science roles.' },
  'portfolio': { impact: 4, time: '2 Weeks', demand: 'Medium', skills: ['Personal Branding', 'Project Showcase'], desc: 'A polished portfolio signals execution ability to recruiters and hiring managers.' },
  'interview': { impact: 3, time: '1-2 Weeks', demand: 'Medium', skills: ['Interview Preparation', 'Communication'], desc: 'Dedicated interview prep directly improves your conversion rate from application to offer.' },
  'certification': { impact: 4, time: '3-4 Weeks', demand: 'Medium', skills: ['Domain Knowledge', 'Credential'], desc: 'Recognized certifications provide third-party validation of your skills.' },
  'git': { impact: 3, time: '1 Week', demand: 'Medium', skills: ['Git', 'Version Control'], desc: 'Git proficiency is a baseline expectation for any software engineering role.' },
  'api': { impact: 5, time: '2 Weeks', demand: 'High', skills: ['REST APIs', 'Integration', 'Backend Development'], desc: 'API design and consumption is a core skill for full-stack and backend engineering.' },
};

// Subjects that are never career-relevant, even when preceded by a career verb.
const NON_CAREER_SUBJECTS = [
  /\b(cricket|football|soccer|basketball|baseball|tennis|golf|hockey|rugby|volleyball|badminton|swimming|cycling|running|marathon|yoga|gym|fitness|workout|exercise|crossfit|karate|boxing|wrestling|chess)\b/i,
  /\b(netflix|youtube|movie|movies|film|films|show|shows|anime|series|tv|gaming|video ?game|fortnite|minecraft|pubg|valorant|roblox|twitch|streaming)\b/i,
  /\b(cooking|baking|recipe|food|pizza|burger|sushi|biryani|coffee|tea|gardening|painting|drawing|music|singing|dancing|travelling|travel|photography|fashion|makeup|shopping)\b/i,
  /\b(party|partying|drinking|smoking|meditation|sleep|sleeping|napping|chilling|relaxing|hanging out|gossip)\b/i,
];

const CAREER_VERBS = /\b(learn|learning|study|studying|practice|practicing|master|mastering|improve|improving|develop|developing|build|building|become|prepare|preparing|work on|focus on|get better at|get good at)\b/i;

const CAREER_DOMAIN_SIGNALS = [
  /\b(skill|skills|engineer|engineering|developer|development|programming|coding|career|job|role|internship|interview|resume|portfolio|project|course|certification|bootcamp|workshop|hackathon|experience|grow|growth)\b/i,
  /\b(backend|frontend|fullstack|cloud|devops|data|ai|ml|software|product|design|architecture|infrastructure|database|security|networking|leadership|communication|management)\b/i,
  /\b(aws|docker|kubernetes|react|python|sql|typescript|javascript|java|go|rust|node|git|api|llm|dsa|algorithms|leetcode|kaggle|tensorflow|pytorch|mlops|rag|agent)\b/i,
];

const STRUCTURAL_REJECT = [
  /^[^a-zA-Z]*$/,
  /^(.)\1{4,}$/,
];

const isCareerRelevant = (input: string): boolean => {
  const trimmed = input.trim();
  for (const pattern of STRUCTURAL_REJECT) {
    if (pattern.test(trimmed)) return false;
  }
  for (const signal of CAREER_DOMAIN_SIGNALS) {
    if (signal.test(trimmed)) return true;
  }
  const verbMatch = trimmed.match(CAREER_VERBS);
  if (verbMatch) {
    const verbIndex = verbMatch.index! + verbMatch[0].length;
    const afterVerb = trimmed.slice(verbIndex).trim();
    for (const nonCareerSubject of NON_CAREER_SUBJECTS) {
      if (nonCareerSubject.test(afterVerb)) return false;
    }
    return true;
  }
  return false;
};

interface SimResult {
  action: string;
  current: number;
  projected: number;
  increase: number;
  time: string;
  demand: string;
  skills: string[];
  desc: string;
  timestamp: number;
}

// ─── Shared tokens ──────────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  fontSize: '0.68rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--color-primary)',
  display: 'block',
  marginBottom: '4px',
};

const surfaceStyle: React.CSSProperties = {
  borderRadius: '12px',
  border: '1px solid var(--color-border)',
  background: '#fff',
  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
};

const inputStyle: React.CSSProperties = {
  flex: 1,
  padding: '11px 16px',
  borderRadius: '10px',
  border: '1px solid var(--color-border)',
  fontSize: '0.9rem',
  background: 'var(--color-background)',
  color: 'var(--color-text)',
  outline: 'none',
  transition: 'border-color 0.15s ease',
};

const connectorBtnStyle: React.CSSProperties = {
  padding: '9px 16px',
  borderRadius: '9px',
  border: '1px solid var(--color-border)',
  background: '#fff',
  color: 'var(--color-text)',
  fontWeight: 600,
  fontSize: '0.8rem',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  transition: 'border-color 0.15s, background 0.15s',
};

// ─── Profile Completeness Card ───────────────────────────────────────────────

interface ProfileCompletenessCardProps {
  memory: any;
  updateMemory: any;
}

const ProfileCompletenessCard: React.FC<ProfileCompletenessCardProps> = ({ memory, updateMemory }) => {
  const [githubInput, setGithubInput] = useState('');
  const [linkedinInput, setLinkedinInput] = useState('');
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  const hasGithub = !!memory.githubUsername;
  const hasLinkedin = !!memory.linkedinUrl;
  const hasResume = memory.hasResume;

  if (hasGithub && hasLinkedin && hasResume) return null;

  const completeness = (hasResume ? 40 : 0) + (hasGithub ? 30 : 0) + (hasLinkedin ? 30 : 0);

  let qualityIndicator = 'No sources connected';
  let qualityColor = 'var(--color-text-light)';
  if (completeness > 0) {
    if (completeness <= 40) { qualityIndicator = 'Basic analysis'; qualityColor = 'var(--color-warning)'; }
    else if (completeness < 100) { qualityIndicator = 'Enhanced analysis'; qualityColor = 'var(--color-primary)'; }
    else { qualityIndicator = 'Complete analysis'; qualityColor = 'var(--color-success)'; }
  }

  const handleConnect = (type: 'github' | 'linkedin' | 'resume', val: string) => {
    if (!val.trim()) return;
    setIsReanalyzing(true);
    setProgress(10);

    updateMemory((prev: any) => {
      const makeId = () => Math.random().toString(36).substr(2, 9);
      const actionLog = type === 'resume' ? 'Resume Connected' : type === 'github' ? 'GitHub Connected' : 'LinkedIn Connected';
      return {
        ...prev,
        hasResume: type === 'resume' ? true : prev.hasResume,
        resumeFileName: type === 'resume' ? val.trim() : prev.resumeFileName,
        githubUsername: type === 'github' ? val.trim() : prev.githubUsername,
        linkedinUrl: type === 'linkedin' ? val.trim() : prev.linkedinUrl,
        activities: [...prev.activities, { id: makeId(), label: actionLog, timestamp: new Date().toISOString() }]
      };
    });

    if (type === 'github') setGithubInput('');
    else if (type === 'linkedin') setLinkedinInput('');

    const interval = setInterval(() => {
      setProgress(p => { if (p >= 90) { clearInterval(interval); return 90; } return p + 10; });
    }, 150);

    fetch('http://localhost:5000/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetRole: memory.targetRole, resumeFileName: memory.resumeFileName, preferences: memory.preferences })
    })
      .then(res => res.json())
      .then(data => {
        console.log("CAREERTWIN API RESPONSE");
        console.log(data);
        const normalized = normalizeAnalysis(data, memory.targetRole);
        setProgress(100);
        setTimeout(() => {
          setIsReanalyzing(false);
          updateMemory((prev: any) => {
            const makeId = () => Math.random().toString(36).substr(2, 9);
            const newActivities = [
              ...prev.activities,
              { id: makeId(), label: 'Profile Reanalyzed', timestamp: new Date().toISOString() },
              { id: makeId(), label: 'Career Twin Refreshed', timestamp: new Date().toISOString() }
            ];
            const mentorGreeting = {
              text: `I've successfully updated your Profile Analysis! Since you connected your ${type === 'resume' ? 'Resume' : type === 'github' ? 'GitHub' : 'LinkedIn'}, I've re-calibrated your Career Twin, readiness scores, and custom weekly goals. Let me know what you'd like to focus on today.`,
              isAi: true,
              timestamp: new Date().toISOString()
            };
            const chatHistory = [...(prev.mentorContext?.chatHistory || []), mentorGreeting];
            const tempMem = {
              ...prev,
              isAnalyzed: true,
              isTwinGenerated: true,
              analysis: normalized,
              mentorContext: { ...prev.mentorContext, chatHistory },
              weeklyMissions: [],
              suggestedMissions: [],
              activities: newActivities
            };
            const active = generateMissions(tempMem, 3);
            const suggestions = generateMissions({ ...tempMem, weeklyMissions: active }, 5);
            return { ...tempMem, weeklyMissions: active, suggestedMissions: suggestions };
          });
        }, 300);
      })
      .catch(err => {
        console.error(err);
        setIsReanalyzing(false);
        alert("Profile re-analysis failed. Please ensure the backend is running on port 5000.");
      });
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleConnect('resume', e.target.files[0].name);
    }
  };

  const sourceRow = (
    connected: boolean,
    icon: React.ReactNode,
    label: string,
    sublabel: string,
    action?: React.ReactNode
  ) => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 14px',
      borderRadius: '9px',
      background: connected ? 'rgba(22,163,74,0.04)' : 'rgba(0,0,0,0.02)',
      border: `1px solid ${connected ? 'rgba(22,163,74,0.15)' : 'var(--color-border)'}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '28px', height: '28px', borderRadius: '7px',
          background: connected ? 'rgba(22,163,74,0.08)' : 'rgba(0,0,0,0.04)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          {icon}
        </div>
        <div>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: connected ? 'var(--color-text)' : 'var(--color-text-light)' }}>
            {label}
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-light)', display: 'block', marginTop: '1px' }}>
            {sublabel}
          </span>
        </div>
      </div>
      {connected ? (
        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-success)', background: 'rgba(22,163,74,0.08)', padding: '2px 9px', borderRadius: '999px', border: '1px solid rgba(22,163,74,0.18)' }}>
          Connected
        </span>
      ) : action}
    </div>
  );

  return (
    <div style={{
      ...surfaceStyle,
      padding: '20px',
      marginBottom: '24px',
      borderStyle: 'dashed',
      borderColor: 'rgba(201,106,74,0.35)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Overlay while re-analyzing */}
      {isReanalyzing && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(255,255,255,0.9)',
          zIndex: 10,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          borderRadius: '12px', gap: '12px',
        }}>
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
            <Loader2 size={28} color="var(--color-primary)" />
          </motion.div>
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-text)', textAlign: 'center' }}>
              Enriching Twin Profile
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-light)', textAlign: 'center', marginTop: '2px' }}>
              {progress}% complete
            </div>
          </div>
          <div style={{ width: '180px', height: '4px', background: 'rgba(0,0,0,0.06)', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'var(--color-primary)', width: `${progress}%`, transition: 'width 0.3s ease', borderRadius: '999px' }} />
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <span style={labelStyle}>Profile Completeness</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.03em', lineHeight: 1 }}>
            {completeness}<span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-light)' }}>%</span>
          </div>
        </div>
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: qualityColor }}>
          {qualityIndicator}
        </span>
      </div>

      {/* Progress track */}
      <div style={{ height: '4px', background: 'rgba(0,0,0,0.06)', borderRadius: '999px', overflow: 'hidden', marginBottom: '16px' }}>
        <div style={{ height: '100%', background: 'var(--color-primary)', width: `${completeness}%`, transition: 'width 0.4s ease', borderRadius: '999px' }} />
      </div>

      {/* Source rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
        {sourceRow(hasResume, <FileText size={14} color="var(--color-primary)" />, `Resume ${hasResume ? 'Connected' : 'Not Connected'}`, 'Skills, education, projects',
          !hasResume ? (
            <>
              <button style={connectorBtnStyle} onClick={() => resumeInputRef.current?.click()}>Connect Resume</button>
              <input type="file" ref={resumeInputRef} onChange={handleResumeChange} style={{ display: 'none' }} accept=".pdf,.doc,.docx" />
            </>
          ) : undefined
        )}
        {sourceRow(hasGithub, <Code size={14} color="var(--color-primary)" />, `GitHub ${hasGithub ? 'Connected' : 'Not Connected'}`, 'Technical activity, repositories')}
        {sourceRow(hasLinkedin, <Briefcase size={14} color="#0A66C2" />, `LinkedIn ${hasLinkedin ? 'Connected' : 'Not Connected'}`, 'Professional profile, experience')}
      </div>

      {/* Inputs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {!hasGithub && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <input type="text" placeholder="GitHub username (e.g. torvalds)" value={githubInput} onChange={e => setGithubInput(e.target.value)} style={inputStyle} />
            <button style={{ ...connectorBtnStyle, background: 'var(--color-primary)', color: '#fff', border: 'none' }} onClick={() => handleConnect('github', githubInput)}>
              Connect
            </button>
          </div>
        )}
        {!hasLinkedin && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <input type="url" placeholder="LinkedIn profile URL" value={linkedinInput} onChange={e => setLinkedinInput(e.target.value)} style={inputStyle} />
            <button style={{ ...connectorBtnStyle, background: 'var(--color-primary)', color: '#fff', border: 'none' }} onClick={() => handleConnect('linkedin', linkedinInput)}>
              Connect
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Empty State ─────────────────────────────────────────────────────────────

interface CareerTwinEmptyStateProps {
  targetRole: string;
  isAnalyzed: boolean;
  onGenerate: () => void;
}

const CareerTwinEmptyState: React.FC<CareerTwinEmptyStateProps> = ({ targetRole, isAnalyzed, onGenerate }) => {
  const navigate = useNavigate();
  const { memory, updateMemory } = useCareerAgent();
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleGenerate = () => {
    if (!isAnalyzed) { navigate('/dashboard'); return; }
    setGenerating(true);
    let p = 0;
    const interval = setInterval(() => {
      p += 5;
      setProgress(Math.min(p, 100));
      if (p >= 100) { clearInterval(interval); setGenerating(false); onGenerate(); }
    }, 50);
  };

  const lockedCard = (icon: React.ReactNode, title: string, sub: string) => (
    <div style={{
      ...surfaceStyle,
      padding: '18px',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      opacity: 0.65,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Lock size={13} color="var(--color-primary)" />
        <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-text)' }}>{title}</span>
      </div>
      <p style={{ fontSize: '0.78rem', color: 'var(--color-text-light)', margin: 0, lineHeight: 1.5 }}>{sub}</p>
    </div>
  );

  return (
    <div className="container page-enter-active" style={{ paddingTop: '48px', paddingBottom: '80px' }}>
      {/* Hero */}
      <header style={{ marginBottom: '48px', textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px auto' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <motion.div
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
            style={{
              width: '64px', height: '64px', borderRadius: '18px',
              backgroundColor: 'rgba(201,106,74,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid rgba(201,106,74,0.25)',
              boxShadow: '0 4px 20px rgba(201,106,74,0.12)',
            }}
          >
            <Target size={30} color="var(--color-primary)" />
          </motion.div>
        </div>

        <h1 style={{
          fontSize: 'clamp(1.8rem, 4vw, 2.4rem)',
          fontWeight: 800,
          color: 'var(--color-text)',
          letterSpacing: '-0.035em',
          lineHeight: 1.15,
          marginBottom: '12px',
        }}>
          Your Career Twin Is Waiting
        </h1>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          background: 'rgba(201,106,74,0.08)',
          color: 'var(--color-primary)',
          padding: '5px 14px', borderRadius: '999px',
          fontSize: '0.82rem', fontWeight: 700,
          border: '1px solid rgba(201,106,74,0.18)',
          marginBottom: '20px',
        }}>
          Target Role: {targetRole}
        </div>

        <p style={{ fontSize: '1rem', color: 'var(--color-text-light)', lineHeight: 1.7, marginBottom: '28px' }}>
          {isAnalyzed
            ? "Your profile has been analyzed. Generate your living AI Career Twin to simulate future outcomes and unlock personalized guidance."
            : "Connect your professional profile to generate a personalized AI Career Twin. Nexora will analyze your skills, identify growth opportunities, and predict career readiness."}
        </p>

        {generating ? (
          <div style={{ maxWidth: '280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ width: '100%', height: '5px', background: 'rgba(0,0,0,0.06)', borderRadius: '999px', overflow: 'hidden' }}>
              <motion.div
                style={{ height: '100%', background: 'var(--color-primary)', borderRadius: '999px' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', fontWeight: 600 }}>
              Generating Career Twin — {progress}%
            </div>
          </div>
        ) : (
          <Button size="lg" onClick={handleGenerate} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            {isAnalyzed ? 'Generate My Career Twin' : 'Connect Profile & Analyze'} <ChevronRight size={17} />
          </Button>
        )}
      </header>

      {/* Profile completeness enrichment */}
      <div style={{ maxWidth: '960px', margin: '0 auto 24px auto' }}>
        <ProfileCompletenessCard memory={memory} updateMemory={updateMemory} />
      </div>

      {/* Locked preview grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', maxWidth: '960px', margin: '0 auto' }}>
        {/* Visual hero — locked */}
        <div style={{
          ...surfaceStyle,
          padding: '32px 24px',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: '16px',
          background: 'rgba(255,255,255,0.6)',
          backdropFilter: 'blur(6px)',
          gridColumn: 'span 1',
        }}>
          {/* Current You */}
          <div style={{ width: '100%', padding: '16px', background: 'rgba(0,0,0,0.03)', borderRadius: '10px', textAlign: 'center', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-light)', marginBottom: '6px' }}>Current You</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-text-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <Lock size={15} /> Locked
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <motion.div animate={{ y: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}>
              <span style={{ fontSize: '1.2rem', color: 'var(--color-primary)' }}>↓</span>
            </motion.div>
            <span style={{
              fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase',
              color: 'var(--color-primary)', background: 'rgba(201,106,74,0.08)',
              padding: '3px 10px', borderRadius: '999px', border: '1px solid rgba(201,106,74,0.18)',
            }}>
              Profile Analysis Required
            </span>
            <motion.div animate={{ y: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut', delay: 0.5 }}>
              <span style={{ fontSize: '1.2rem', color: 'var(--color-primary)' }}>↓</span>
            </motion.div>
          </div>

          {/* Future You */}
          <div style={{ width: '100%', padding: '16px', background: 'rgba(201,106,74,0.03)', borderRadius: '10px', textAlign: 'center', border: '1px solid rgba(201,106,74,0.15)' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-primary)', marginBottom: '6px' }}>Future You</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <Lock size={15} /> Locked
            </div>
          </div>
        </div>

        {/* Locked feature cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {lockedCard(<TrendingUp size={13} />, 'Readiness Score', 'Waiting for profile analysis')}
          {lockedCard(<Sparkles size={13} />, 'Future Projection', 'Generate your Career Twin first')}
          {lockedCard(<Code size={13} />, 'Skill Evolution', 'Profile data required')}
          {lockedCard(<Zap size={13} />, 'AI Simulations', 'Complete analysis to unlock')}
        </div>

        {/* Simulation placeholder */}
        <div style={{
          ...surfaceStyle,
          padding: '40px 24px',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          textAlign: 'center',
          borderStyle: 'dashed',
          borderColor: 'rgba(201,106,74,0.25)',
          background: 'rgba(201,106,74,0.02)',
        }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '14px',
            backgroundColor: 'rgba(201,106,74,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '16px',
            border: '1px solid rgba(201,106,74,0.18)',
          }}>
            <Sparkles size={22} color="var(--color-primary)" />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '8px', letterSpacing: '-0.02em', color: 'var(--color-text)' }}>
            AI Simulation Playground
          </h3>
          <p style={{ color: 'var(--color-text-light)', fontSize: '0.88rem', lineHeight: 1.65, marginBottom: '24px', maxWidth: '280px' }}>
            Simulations unlock after your Career Twin is generated.
          </p>
          <Button onClick={() => navigate('/dashboard')} style={{ width: '100%', maxWidth: '220px' }}>
            Generate Career Twin
          </Button>
        </div>
      </div>
    </div>
  );
};

// ─── Main CareerTwin ─────────────────────────────────────────────────────────

const CareerTwin: React.FC = () => {
  const { memory, updateMemory, setTwinGenerated } = useCareerAgent();

  const isTwinGenerated = memory.isTwinGenerated && !!memory.analysis;
  const isAnalyzed = memory.isAnalyzed && !!memory.analysis;
  const targetRole = memory.targetRole || 'AI Engineer';
  const baseReadiness = memory.analysis?.readiness || 0;
  const baseSkills = (memory.analysis?.strengths || []) as string[];

  const [projectedReadiness, setProjectedReadiness] = useState(baseReadiness);
  const [simulatedSkills, setSimulatedSkills] = useState<string[]>([]);
  const [simulating, setSimulating] = useState(false);
  const [simHistory, setSimHistory] = useState<SimResult[]>([]);
  const [customInput, setCustomInput] = useState('');
  const [activeResult, setActiveResult] = useState<SimResult | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  React.useEffect(() => {
    setProjectedReadiness(baseReadiness);
  }, [baseReadiness]);

  if (!isTwinGenerated) {
    return <CareerTwinEmptyState targetRole={targetRole} isAnalyzed={isAnalyzed} onGenerate={() => setTwinGenerated(true)} />;
  }

  const runSimulation = (actionName: string, query?: string) => {
    if (simulating) return;
    setValidationError(null);
    const matchText = (query || actionName).toLowerCase();
    if (query && !isCareerRelevant(matchText)) {
      setValidationError(`"${actionName}" doesn't appear to be a career-relevant action. Try something like "Learn Docker", "Build an AI Agent project", or "Contribute to open source".`);
      return;
    }
    setSimulating(true);
    let ruleKey: string | null = null;
    for (const key of Object.keys(SIMULATION_RULES)) {
      if (matchText.includes(key)) { ruleKey = key; break; }
    }
    const ruleset = ruleKey
      ? SIMULATION_RULES[ruleKey]
      : { impact: 2, time: '2-4 Weeks', demand: 'Medium', skills: ['Applied Learning', 'Domain Knowledge'], desc: 'This goal builds general competency and keeps you actively engaged in your career development.' };

    setTimeout(() => {
      const newResult: SimResult = {
        action: actionName,
        current: baseReadiness,
        projected: Math.min(100, baseReadiness + ruleset.impact),
        increase: ruleset.impact,
        time: ruleset.time,
        demand: ruleset.demand,
        skills: ruleset.skills,
        desc: ruleset.desc,
        timestamp: Date.now()
      };
      setProjectedReadiness(newResult.projected);
      setSimulatedSkills(ruleset.skills);
      setActiveResult(newResult);
      setSimHistory(prev => [newResult, ...prev]);
      setSimulating(false);
      setCustomInput('');
    }, 1500);
  };

  const handleCustomSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    setValidationError(null);
    runSimulation(customInput, customInput);
  };

  const clearSimulation = () => {
    setActiveResult(null);
    setProjectedReadiness(baseReadiness);
    setSimulatedSkills([]);
  };

  const statCell = (label: string, value: string, color?: string) => (
    <div style={{
      padding: '14px 16px',
      borderRadius: '10px',
      background: 'rgba(0,0,0,0.025)',
      border: '1px solid var(--color-border)',
      display: 'flex', flexDirection: 'column', gap: '4px',
    }}>
      <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-light)' }}>{label}</span>
      <span style={{ fontSize: '1rem', fontWeight: 700, color: color || 'var(--color-text)' }}>{value}</span>
    </div>
  );

  return (
    <div className="container page-enter-active" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
      {/* Page header */}
      <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <span style={labelStyle}>AI Career Twin</span>
          <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, color: 'var(--color-text)', margin: 0, letterSpacing: '-0.03em' }}>
            Career Simulation Engine
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-text-light)', marginTop: '6px' }}>
            Target Role: <strong style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{targetRole}</strong>
          </p>
        </div>
      </header>

      {/* Profile completeness enrichment */}
      <ProfileCompletenessCard memory={memory} updateMemory={updateMemory} />

      {/* Two-column grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>

        {/* ── Left column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Readiness visualizer */}
          <div style={{ ...surfaceStyle, padding: '24px' }}>
            <span style={labelStyle}>Readiness Visualizer</span>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '12px', alignItems: 'center', marginBottom: '20px' }}>
              {/* Current You */}
              <div style={{ padding: '16px', background: 'rgba(0,0,0,0.025)', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-light)', marginBottom: '8px' }}>Current You</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.03em' }}>{baseReadiness}</span>
                  <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-light)' }}>%</span>
                </div>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-light)', marginBottom: '6px' }}>Base Skills</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {baseSkills.map(skill => (
                    <span key={skill} style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--color-text-light)', display: 'inline-block', flexShrink: 0 }} />
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Arrow */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChevronRight size={22} color="var(--color-primary)" />
              </div>

              {/* Future You */}
              <div style={{
                padding: '16px', borderRadius: '10px',
                background: activeResult ? 'rgba(201,106,74,0.04)' : 'rgba(0,0,0,0.025)',
                border: `1px solid ${activeResult ? 'rgba(201,106,74,0.3)' : 'var(--color-border)'}`,
                transition: 'all 0.3s ease',
              }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-primary)', marginBottom: '8px' }}>Future You</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '12px' }}>
                  <motion.span
                    animate={{ color: activeResult ? 'var(--color-primary)' : 'var(--color-text)' }}
                    style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.03em' }}
                  >
                    {projectedReadiness}
                  </motion.span>
                  <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-light)' }}>%</span>
                </div>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-primary)', marginBottom: '6px' }}>
                  {activeResult ? 'New Skills' : 'Simulated Skills'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {simulatedSkills.length > 0 ? simulatedSkills.map(skill => (
                    <motion.span
                      key={skill}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '5px' }}
                    >
                      <span style={{ fontSize: '0.75rem' }}>+</span> {skill}
                    </motion.span>
                  )) : (
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', fontStyle: 'italic' }}>Run a simulation…</span>
                  )}
                </div>
              </div>
            </div>

            {/* Progress track */}
            <div style={{ position: 'relative', height: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '999px', overflow: 'hidden' }}>
              <motion.div
                style={{ position: 'absolute', top: 0, left: 0, bottom: 0, background: 'rgba(0,0,0,0.12)', borderRadius: '999px' }}
                initial={{ width: `${baseReadiness}%` }}
                animate={{ width: `${baseReadiness}%` }}
              />
              <motion.div
                style={{ position: 'absolute', top: 0, left: 0, bottom: 0, background: 'var(--color-primary)', borderRadius: '999px' }}
                initial={{ width: `${baseReadiness}%` }}
                animate={{ width: `${projectedReadiness}%` }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Ask Your Career Twin */}
          <div style={{
            ...surfaceStyle,
            padding: '24px',
            border: '1px solid rgba(201,106,74,0.25)',
            background: 'linear-gradient(135deg, #fff 0%, rgba(201,106,74,0.03) 100%)',
          }}>
            <span style={labelStyle}>Ask Your Career Twin</span>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-text)', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
              Simulate a Learning Path
            </h3>
            <p style={{ color: 'var(--color-text-light)', marginBottom: '16px', fontSize: '0.85rem', lineHeight: 1.6 }}>
              Test hypothetical skills and projects. See how they move your readiness score.
            </p>

            <form onSubmit={handleCustomSimulate} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="What if I learn Docker?"
                value={customInput}
                onChange={e => { setCustomInput(e.target.value); setValidationError(null); }}
                style={inputStyle}
                disabled={simulating}
              />
              <button
                type="submit"
                disabled={simulating || !customInput.trim()}
                style={{
                  padding: '11px 18px',
                  borderRadius: '10px',
                  background: simulating || !customInput.trim() ? 'rgba(0,0,0,0.08)' : 'var(--color-primary)',
                  color: simulating || !customInput.trim() ? 'var(--color-text-light)' : '#fff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: simulating || !customInput.trim() ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                {simulating
                  ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Loader2 size={15} /></motion.div>
                  : <Sparkles size={15} />
                }
                {simulating ? 'Predicting…' : 'Predict Impact'}
              </button>
            </form>

            {validationError && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  marginTop: '12px',
                  padding: '10px 14px',
                  background: 'rgba(192,86,86,0.07)',
                  border: '1px solid rgba(192,86,86,0.18)',
                  borderRadius: '9px',
                  color: 'var(--color-danger)',
                  fontSize: '0.82rem',
                  lineHeight: 1.55,
                }}
              >
                ⚠ {validationError}
              </motion.div>
            )}
          </div>
        </div>

        {/* ── Right column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          <AnimatePresence mode="wait">
            {activeResult ? (
              <motion.div key="result" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }}>
                <div style={{
                  ...surfaceStyle,
                  padding: '24px',
                  border: '1.5px solid rgba(201,106,74,0.3)',
                  background: 'rgba(201,106,74,0.02)',
                }}>
                  <button
                    onClick={clearSimulation}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      background: 'none', border: 'none',
                      color: 'var(--color-text-light)', fontWeight: 600,
                      fontSize: '0.8rem', cursor: 'pointer',
                      marginBottom: '16px', padding: '0',
                      transition: 'color 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-light)')}
                  >
                    <ArrowLeft size={14} /> Back to simulations
                  </button>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', gap: '12px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={labelStyle}>Simulation Complete</span>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-text)', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.3 }}>
                        {activeResult.action}
                      </h3>
                    </div>
                    <div style={{
                      padding: '6px 14px',
                      background: 'rgba(22,163,74,0.08)',
                      color: 'var(--color-success)',
                      borderRadius: '999px',
                      fontWeight: 800,
                      fontSize: '1.1rem',
                      border: '1px solid rgba(22,163,74,0.2)',
                      whiteSpace: 'nowrap',
                      letterSpacing: '-0.02em',
                    }}>
                      +{activeResult.increase}%
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-text-light)', marginBottom: '6px' }}>Why This Matters</div>
                    <p style={{ color: 'var(--color-text)', fontSize: '0.88rem', lineHeight: 1.65, margin: 0 }}>{activeResult.desc}</p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {statCell('Time Estimate', activeResult.time)}
                    {statCell('Industry Demand', activeResult.demand, activeResult.demand === 'Very High' ? 'var(--color-success)' : undefined)}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="presets" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <span style={labelStyle}>Recommended Simulations</span>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text)', margin: 0, letterSpacing: '-0.02em' }}>
                      High-Impact Learning Paths
                    </h3>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[
                      { title: 'Build AI Agent Project', rule: 'ai agent', icon: <Sparkles size={18} color="var(--color-primary)" />, bg: 'rgba(201,106,74,0.08)', impact: '+15%' },
                      { title: 'Master System Design', rule: 'system design', icon: <TrendingUp size={18} color="var(--color-success)" />, bg: 'rgba(22,163,74,0.07)', impact: '+15%' },
                      { title: 'Win a Hackathon', rule: 'hackathon', icon: <Zap size={18} color="#D49F00" />, bg: 'rgba(212,159,0,0.07)', impact: '+12%' },
                    ].map(sim => (
                      <button
                        key={sim.rule}
                        onClick={() => runSimulation(sim.title, sim.rule)}
                        style={{
                          ...surfaceStyle,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '14px',
                          padding: '14px 16px',
                          cursor: 'pointer',
                          border: '1px solid var(--color-border)',
                          background: '#fff',
                          textAlign: 'left',
                          transition: 'box-shadow 0.18s, transform 0.15s',
                          width: '100%',
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)';
                          (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
                          (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                        }}
                      >
                        <div style={{
                          width: '38px', height: '38px', borderRadius: '10px',
                          background: sim.bg,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          {sim.icon}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text)' }}>{sim.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', marginTop: '2px' }}>Predicted readiness boost</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-success)' }}>{sim.impact}</span>
                          <Play size={14} color="var(--color-text-light)" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Simulation History */}
          {simHistory.length > 0 && (
            <div style={{ ...surfaceStyle, padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <History size={15} color="var(--color-text-light)" />
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-text)' }}>Simulation History</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {simHistory.map((hist, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 0',
                      borderBottom: idx !== simHistory.length - 1 ? '1px solid var(--color-border)' : 'none',
                      gap: '12px',
                    }}
                  >
                    <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--color-text)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {hist.action}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                      <span style={{ color: 'var(--color-text-light)', fontSize: '0.82rem', fontWeight: 500 }}>{hist.current}%</span>
                      <ChevronRight size={12} color="var(--color-text-light)" />
                      <span style={{ color: 'var(--color-primary)', fontWeight: 800, fontSize: '0.88rem' }}>{hist.projected}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CareerTwin;

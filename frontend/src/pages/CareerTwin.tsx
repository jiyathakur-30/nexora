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
  const careerReadiness     = raw.careerReadiness     ?? raw.readiness ?? raw.alignmentScore ?? 0;
  const internshipReadiness = raw.internshipReadiness ?? careerReadiness;
  const jobReadiness        = raw.jobReadiness        ?? careerReadiness;

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

// Blocklist of clearly non-career activity patterns.
// Only prompts that match these (and contain NO career intent signals) are rejected.
// Everything ambiguous is allowed through with a low generic impact.
const NON_CAREER_PATTERNS = [
  /\b(watch|binge|stream)\b.*(netflix|youtube|movie|show|anime|series|tv)/i,
  /\b(play|playing)\b.*(cricket|football|soccer|chess|video game|fortnite|minecraft|pubg|valorant|roblox)/i,
  /\b(eat|eating|cook|order|grab)\b.*(pizza|food|lunch|dinner|burger|sushi|biryani)/i,
  /\b(sleep|nap|rest|chill|relax|hang out|party|drink|smoke)\b/i,
  /^[^a-zA-Z]*$/, // purely non-alphabetic (random chars, numbers only)
  /^(.)\1{4,}$/, // repeated single character like "aaaaaaa"
];

// Any of these signals that the input likely has career intent,
// even if it doesn't match a specific rule key.
const CAREER_INTENT_SIGNALS = [
  /\b(learn|learning|study|studying|practice|practicing|master|mastering|improve|improving|develop|developing|build|building|become|prepare|preparing|work on|focus on|get better|get good)\b/i,
  /\b(skill|skills|engineer|engineering|developer|development|programming|coding|career|job|role|internship|interview|resume|portfolio|project|course|certification|bootcamp|workshop|hackathon|experience|grow|growth)\b/i,
  /\b(backend|frontend|fullstack|cloud|devops|data|ai|ml|software|product|design|architecture|infrastructure|database|security|networking|leadership|communication|management)\b/i,
  /\b(aws|docker|kubernetes|react|python|sql|typescript|javascript|java|go|rust|node|git|api|llm|ml|dsa|algorithms|leetcode|kaggle|tensorflow|pytorch|mlops|rag|agent)\b/i,
];

const isCareerRelevant = (input: string): boolean => {
  const trimmed = input.trim();

  // Reject if clearly non-career
  for (const pattern of NON_CAREER_PATTERNS) {
    if (pattern.test(trimmed)) return false;
  }

  // Accept only if a positive career intent signal is present.
  // This rejects meaningless inputs (single random words, gibberish,
  // food items, greetings) that don't match the blocklist but also
  // carry no career meaning. Vague but career-adjacent phrases like
  // "improve professionally" or "gain experience" still pass because
  // they match signal words (improve, experience → via "develop").
  for (const signal of CAREER_INTENT_SIGNALS) {
    if (signal.test(trimmed)) return true;
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

  if (hasGithub && hasLinkedin && hasResume) return null; // Hide if completeness is 100%

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

  const handleConnect = (type: 'github' | 'linkedin' | 'resume', val: string) => {
    if (!val.trim()) return;
    setIsReanalyzing(true);
    setProgress(10);

    updateMemory((prev: any) => {
      const makeId = () => Math.random().toString(36).substr(2, 9);
      const actionLog = type === 'resume'
        ? 'Resume Connected'
        : type === 'github'
          ? 'GitHub Connected'
          : 'LinkedIn Connected';

      return {
        ...prev,
        hasResume: type === 'resume' ? true : prev.hasResume,
        resumeFileName: type === 'resume' ? val.trim() : prev.resumeFileName,
        githubUsername: type === 'github' ? val.trim() : prev.githubUsername,
        linkedinUrl: type === 'linkedin' ? val.trim() : prev.linkedinUrl,
        activities: [
          ...prev.activities,
          { id: makeId(), label: actionLog, timestamp: new Date().toISOString() }
        ]
      };
    });

    if (type === 'github') setGithubInput('');
    else if (type === 'linkedin') setLinkedinInput('');

    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 90) {
          clearInterval(interval);
          return 90;
        }
        return p + 10;
      });
    }, 150);

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
        console.log("CAREERTWIN API RESPONSE");
        console.log(data);
        const normalized = normalizeAnalysis(
  data,
  memory.targetRole
);
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
              analysis:normalized, 
              mentorContext: {
                ...prev.mentorContext,
                chatHistory
              },
              weeklyMissions: [],
              suggestedMissions: [],
              activities: newActivities
            };

            const active = generateMissions(tempMem, 3);
            const suggestions = generateMissions({ ...tempMem, weeklyMissions: active }, 5);

            return {
              ...tempMem,
              weeklyMissions: active,
              suggestedMissions: suggestions
            };
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

  return (
    <Card hoverEffect style={{ padding: 'var(--space-5)', border: '1px dashed var(--color-primary)', backgroundColor: 'var(--color-card)', marginBottom: 'var(--space-6)', position: 'relative' }}>
      {isReanalyzing && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.85)', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-md)' }}>
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} style={{ marginBottom: 12 }}><Loader2 size={32} color="var(--color-primary)" /></motion.div>
          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text)' }}>Enriching Twin Profile: {progress}%</div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)', flexWrap: 'wrap', gap: 8 }}>
        <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary)', margin: 0 }}>Profile Completeness: {completeness}%</h4>
        <span style={{ fontSize: '0.9rem', color: qualityColor, fontWeight: 700 }}>{qualityIndicator}</span>
      </div>

      <div style={{ height: 6, background: 'rgba(61,44,46,0.05)', borderRadius: 3, overflow: 'hidden', marginBottom: 'var(--space-4)' }}>
        <div style={{ height: '100%', background: 'var(--color-primary)', width: `${completeness}%`, transition: 'width 0.3s ease' }}></div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: hasResume ? 'var(--color-success)' : 'var(--color-danger)', fontWeight: 800 }}>{hasResume ? '✓' : '✗'}</span>
            <FileText size={16} color="var(--color-primary)" />
            <span style={{ color: hasResume ? 'var(--color-text)' : 'var(--color-text-light)', fontWeight: 600 }}>Resume {hasResume ? 'Connected' : 'Not Connected'}</span>
            <span style={{ color: 'var(--color-text-light)', fontSize: '0.75rem', marginLeft: 4 }}>(Contributes: Skills, education, projects)</span>
          </div>
          {!hasResume && (
            <div>
              <Button size="sm" onClick={() => resumeInputRef.current?.click()} style={{ padding: '4px 8px', fontSize: '0.75rem' }}>Connect Resume</Button>
              <input type="file" ref={resumeInputRef} onChange={handleResumeChange} style={{ display: 'none' }} accept=".pdf,.doc,.docx" />
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: hasGithub ? 'var(--color-success)' : 'var(--color-danger)', fontWeight: 800 }}>{hasGithub ? '✓' : '✗'}</span>
            <Code size={16} color="var(--color-primary)" />
            <span style={{ color: hasGithub ? 'var(--color-text)' : 'var(--color-text-light)', fontWeight: 600 }}>GitHub {hasGithub ? 'Connected' : 'Not Connected'}</span>
            <span style={{ color: 'var(--color-text-light)', fontSize: '0.75rem', marginLeft: 4 }}>(Contributes: Technical activity, repositories, coding trends)</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: hasLinkedin ? 'var(--color-success)' : 'var(--color-danger)', fontWeight: 800 }}>{hasLinkedin ? '✓' : '✗'}</span>
            <Briefcase size={16} color="#0A66C2" />
            <span style={{ color: hasLinkedin ? 'var(--color-text)' : 'var(--color-text-light)', fontWeight: 600 }}>LinkedIn {hasLinkedin ? 'Connected' : 'Not Connected'}</span>
            <span style={{ color: 'var(--color-text-light)', fontSize: '0.75rem', marginLeft: 4 }}>(Contributes: Professional profile, experience, networking)</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {!hasGithub && (
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              placeholder="GitHub Username (e.g. torvalds)"
              value={githubInput}
              onChange={e => setGithubInput(e.target.value)}
              style={{ flex: 1, padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(61,44,46,0.15)', fontSize: '0.85rem', background: 'var(--color-background)', color: 'var(--color-text)' }}
            />
            <Button size="sm" onClick={() => handleConnect('github', githubInput)}>Connect GitHub</Button>
          </div>
        )}
        {!hasLinkedin && (
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="url"
              placeholder="LinkedIn Profile URL"
              value={linkedinInput}
              onChange={e => setLinkedinInput(e.target.value)}
              style={{ flex: 1, padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(61,44,46,0.15)', fontSize: '0.85rem', background: 'var(--color-background)', color: 'var(--color-text)' }}
            />
            <Button size="sm" onClick={() => handleConnect('linkedin', linkedinInput)}>Connect LinkedIn</Button>
          </div>
        )}
      </div>
    </Card>
  );
};

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
    if (!isAnalyzed) {
      navigate('/dashboard');
      return;
    }
    setGenerating(true);
    let p = 0;
    const interval = setInterval(() => {
      p += 5;
      setProgress(Math.min(p, 100));
      if (p >= 100) {
        clearInterval(interval);
        setGenerating(false);
        onGenerate();
      }
    }, 50);
  };

  return (
    <div className="container page-enter-active" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-12)' }}>
      {/* 2. Career Twin Empty State Header */}
      <header style={{ marginBottom: 'var(--space-8)', textAlign: 'center', maxWidth: '700px', margin: '0 auto var(--space-8) auto' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-4)' }}>
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              backgroundColor: 'rgba(201,106,74,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--color-primary)'
            }}
          >
            <Target size={32} color="var(--color-primary)" />
          </motion.div>
        </div>
        <h1 style={{ fontSize: '2.5rem', color: 'var(--color-text)', marginBottom: 'var(--space-2)' }}>
          Your Career Twin Is Waiting
        </h1>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(201,106,74,0.1)', color: 'var(--color-primary)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 700, marginBottom: 'var(--space-4)' }}>
          Target Role: {targetRole}
        </div>
        <p style={{ fontSize: '1.15rem', color: 'var(--color-text-light)', lineHeight: 1.6, marginBottom: 'var(--space-6)' }}>
          {isAnalyzed
            ? "Your career profile has been successfully analyzed. Click below to generate your living AI Career Twin and simulate future outcomes."
            : "Connect your professional profile to generate a personalized AI Career Twin. Nexora will analyze your skills, identify growth opportunities, and predict career readiness."}
        </p>

        {generating ? (
          <div style={{ maxWidth: '300px', margin: '0 auto' }}>
            <div style={{ width: '100%', height: 6, background: 'rgba(61,44,46,0.1)', borderRadius: 3, overflow: 'hidden', marginBottom: 8 }}>
              <div style={{ height: '100%', background: 'var(--color-primary)', width: `${progress}%` }}></div>
            </div>
            <div style={{ fontSize: '0.95rem', color: 'var(--color-text-light)', fontWeight: 600 }}>Generating Career Twin: {progress}%</div>
          </div>
        ) : (
          <Button size="lg" onClick={handleGenerate} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            {isAnalyzed ? "Generate My Career Twin" : "Connect Profile & Analyze"} <ChevronRight size={18} />
          </Button>
        )}
      </header>

      {/* Profile Completeness card for progressive enrichment */}
      <div style={{ maxWidth: '1000px', margin: '0 auto var(--space-6) auto' }}>
        <ProfileCompletenessCard memory={memory} updateMemory={updateMemory} />
      </div>

      {/* Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)', maxWidth: '1000px', margin: '0 auto' }}>

        {/* Left Column: Visual Hero & Locked Sections 1 & 2 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* 3. Visual Hero */}
          <Card glass style={{
            position: 'relative',
            overflow: 'hidden',
            padding: 'var(--space-8)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: 'var(--space-4)' }}>

              {/* Current You */}
              <div style={{
                width: '100%',
                padding: 'var(--space-4)',
                backgroundColor: 'rgba(255, 255, 255, 0.4)',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center',
                border: '1px solid var(--color-glass-border)',
                filter: 'blur(0.5px)',
                position: 'relative'
              }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Current You</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Lock size={18} /> Locked
                </div>
              </div>

              {/* Arrow Indicator / Locked Step */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--color-primary)' }}>
                <motion.div animate={{ y: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>↓</span>
                </motion.div>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  letterSpacing: 1.5,
                  textTransform: 'uppercase',
                  color: 'var(--color-primary)',
                  margin: '4px 0',
                  background: 'rgba(201,106,74,0.1)',
                  padding: '4px 10px',
                  borderRadius: '12px'
                }}>
                  Profile Analysis Required
                </span>
                <motion.div animate={{ y: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: 0.5 }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>↓</span>
                </motion.div>
              </div>

              {/* Future You */}
              <div style={{
                width: '100%',
                padding: 'var(--space-4)',
                backgroundColor: 'rgba(255, 255, 255, 0.4)',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center',
                border: '1px solid var(--color-glass-border)',
                filter: 'blur(0.5px)'
              }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Future You</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Lock size={18} /> Locked
                </div>
              </div>

            </div>
          </Card>

          {/* Locked Sections 1 & 2 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            {/* 🔒 Readiness Score */}
            <Card glass hoverEffect style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: 'var(--color-text)', fontSize: '1.05rem' }}>
                <Lock size={16} color="var(--color-primary)" />
                <span>Readiness Score</span>
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--color-text-light)', fontWeight: 500 }}>
                Waiting for profile analysis
              </div>
            </Card>

            {/* 🔒 Future Projection */}
            <Card glass hoverEffect style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: 'var(--color-text)', fontSize: '1.05rem' }}>
                <Lock size={16} color="var(--color-primary)" />
                <span>Future Projection</span>
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--color-text-light)', fontWeight: 500 }}>
                Generate your Career Twin first
              </div>
            </Card>
          </div>
        </div>

        {/* Right Column: Locked Sections 3 & 4 & Simulation Placeholders */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Locked Sections 3 & 4 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            {/* 🔒 Skill Evolution */}
            <Card glass hoverEffect style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: 'var(--color-text)', fontSize: '1.05rem' }}>
                <Lock size={16} color="var(--color-primary)" />
                <span>Skill Evolution</span>
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--color-text-light)', fontWeight: 500 }}>
                Profile data required
              </div>
            </Card>

            {/* 🔒 AI Simulations */}
            <Card glass hoverEffect style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: 'var(--color-text)', fontSize: '1.05rem' }}>
                <Lock size={16} color="var(--color-primary)" />
                <span>AI Simulations</span>
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--color-text-light)', fontWeight: 500 }}>
                Complete analysis to unlock
              </div>
            </Card>
          </div>

          {/* 5. Simulation Section */}
          <Card glass style={{
            padding: 'var(--space-8)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            border: '2px dashed var(--color-glass-border)',
            flex: 1
          }}>
            <div style={{
              width: 54,
              height: 54,
              borderRadius: '50%',
              backgroundColor: 'rgba(201,106,74,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 'var(--space-4)',
              color: 'var(--color-primary)',
              border: '1px solid var(--color-glass-border)'
            }}>
              <Sparkles size={24} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 'var(--space-2)' }}>AI Simulation Playground</h3>
            <p style={{ color: 'var(--color-text-light)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 'var(--space-6)', maxWidth: '340px' }}>
              Future simulations will become available after your Career Twin has been generated.
            </p>
            <Button onClick={() => navigate('/dashboard')} style={{ width: '100%', maxWidth: '240px' }}>
              Generate Career Twin
            </Button>
          </Card>
        </div>

      </div>
    </div>
  );
};

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

    // Reject irrelevant prompts before running any simulation
    if (query && !isCareerRelevant(matchText)) {
      setValidationError(
        `"${actionName}" doesn't appear to be a career-relevant action. Try something like "Learn Docker", "Build an AI Agent project", or "Contribute to open source".`
      );
      return;
    }

    setSimulating(true);

    let ruleKey: string | null = null;
    for (const key of Object.keys(SIMULATION_RULES)) {
      if (matchText.includes(key)) {
        ruleKey = key;
        break;
      }
    }

    // If career-relevant but no exact rule match, use a small generic impact
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

  return (
    <div className="container page-enter-active" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-12)' }}>
      <header style={{ marginBottom: 'var(--space-8)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', color: 'var(--color-text)', marginBottom: 'var(--space-2)' }}>AI Career Twin</h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--color-text-light)' }}>Target Role: <strong style={{ color: 'var(--color-primary)' }}>{targetRole}</strong></p>
        </div>
      </header>

      {/* Profile Completeness card for progressive enrichment */}
      <ProfileCompletenessCard memory={memory} updateMemory={updateMemory} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>

        {/* Left Column: Visualization Centerpiece */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>

          <Card style={{ position: 'relative', overflow: 'hidden', padding: 'var(--space-8)', border: '2px solid rgba(201,106,74,0.1)' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-8)' }}>
              {/* Current You */}
              <div style={{ flex: 1, padding: 'var(--space-4)', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 'var(--space-2)' }}>Current You</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 'var(--space-4)' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-text)' }}>{baseReadiness}%</span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--color-text-light)', fontWeight: 600 }}>Readiness</span>
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-light)', textTransform: 'uppercase', marginBottom: 8 }}>Base Skills</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {baseSkills.map(skill => (
                    <span key={skill} style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--color-text)' }}>• {skill}</span>
                  ))}
                </div>
              </div>

              {/* Arrow Indicator */}
              <div style={{ padding: '0 var(--space-4)', color: 'var(--color-primary)' }}>
                <ChevronRight size={32} />
              </div>

              {/* Future You */}
              <div style={{ flex: 1, padding: 'var(--space-4)', backgroundColor: activeResult ? 'rgba(201,106,74,0.05)' : 'var(--color-background)', borderRadius: 'var(--radius-md)', border: activeResult ? '2px solid var(--color-primary)' : '2px solid transparent', transition: 'all 0.3s' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 'var(--space-2)' }}>Future You</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 'var(--space-4)' }}>
                  <motion.span animate={{ color: activeResult ? '#C96A4A' : '#3D2C2E' }} style={{ fontSize: '2.5rem', fontWeight: 800 }}>{projectedReadiness}%</motion.span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--color-text-light)', fontWeight: 600 }}>Readiness</span>
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-primary)', textTransform: 'uppercase', marginBottom: 8 }}>{activeResult ? 'New Skills' : 'Simulated Skills'}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {simulatedSkills.length > 0 ? simulatedSkills.map(skill => (
                    <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={skill} style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-primary)' }}>+ {skill}</motion.span>
                  )) : (
                    <span style={{ fontSize: '0.9rem', color: 'var(--color-text-light)', fontStyle: 'italic' }}>Run a simulation...</span>
                  )}
                </div>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div style={{ position: 'relative', height: 12, backgroundColor: 'rgba(61,44,46,0.05)', borderRadius: 6, overflow: 'hidden' }}>
              <motion.div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, backgroundColor: 'var(--color-text-light)', opacity: 0.5, borderRadius: 6 }} initial={{ width: `${baseReadiness}%` }} animate={{ width: `${baseReadiness}%` }} />
              <motion.div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, backgroundColor: 'var(--color-primary)', borderRadius: 6 }} initial={{ width: `${baseReadiness}%` }} animate={{ width: `${projectedReadiness}%` }} transition={{ duration: 0.8, ease: "easeOut" }} />
            </div>

          </Card>

          {/* Custom Simulation */}
          <Card hoverEffect style={{ border: '1px solid var(--color-primary)', background: 'linear-gradient(to bottom right, var(--color-card), rgba(201,106,74,0.05))' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 'var(--space-2)' }}>Ask Your Career Twin</h3>
            <p style={{ color: 'var(--color-text-light)', marginBottom: 'var(--space-4)', fontSize: '0.9rem' }}>Test hypothetical learning paths and projects.</p>

            <form onSubmit={handleCustomSimulate} style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <input
                type="text"
                placeholder="What if I learn Docker?"
                value={customInput}
                onChange={e => { setCustomInput(e.target.value); setValidationError(null); }}
                style={{ flex: 1, padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(61,44,46,0.1)' }}
                disabled={simulating}
              />
              <Button type="submit" disabled={simulating || !customInput.trim()} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {simulating ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Loader2 size={18} /></motion.div> : <Sparkles size={18} />}
                Predict Future Impact
              </Button>
            </form>
            {validationError && (
              <div style={{ marginTop: 10, padding: '10px 14px', background: 'rgba(192,86,86,0.08)', border: '1px solid rgba(192,86,86,0.2)', borderRadius: 'var(--radius-sm)', color: 'var(--color-danger)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                ⚠ {validationError}
              </div>
            )}
          </Card>

        </div>

        {/* Right Column: Engine & Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>

          <AnimatePresence mode="wait">
            {activeResult ? (
              <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <Card style={{ backgroundColor: 'var(--color-background)', border: '2px solid var(--color-primary)', position: 'relative' }}>

                  <button onClick={clearSimulation} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: 'var(--color-text-light)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', marginBottom: 'var(--space-4)', padding: 0 }}>
                    <ArrowLeft size={16} /> Back to Simulations
                  </button>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Simulation Complete</div>
                      <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{activeResult.action}</h3>
                    </div>
                    <div style={{ padding: '4px 12px', background: 'rgba(78, 139, 98, 0.1)', color: 'var(--color-success)', borderRadius: '16px', fontWeight: 700, fontSize: '1.2rem' }}>
                      +{activeResult.increase}%
                    </div>
                  </div>

                  <div style={{ marginBottom: 'var(--space-4)' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-light)', textTransform: 'uppercase', marginBottom: 4 }}>Why This Matters</div>
                    <p style={{ color: 'var(--color-text)', fontSize: '0.95rem', lineHeight: 1.5 }}>{activeResult.desc}</p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', background: 'var(--color-card)', borderRadius: 'var(--radius-sm)' }}>
                      <Clock color="var(--color-text-light)" size={20} />
                      <div>
                        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-light)', fontWeight: 600 }}>Time Estimate</div>
                        <div style={{ fontWeight: 700 }}>{activeResult.time}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', background: 'var(--color-card)', borderRadius: 'var(--radius-sm)' }}>
                      <TrendingUp color="var(--color-success)" size={20} />
                      <div>
                        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-light)', fontWeight: 600 }}>Industry Demand</div>
                        <div style={{ fontWeight: 700 }}>{activeResult.demand}</div>
                      </div>
                    </div>
                  </div>

                </Card>
              </motion.div>
            ) : (
              <motion.div key="presets" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 'var(--space-4)' }}>Recommended Simulations</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  {[
                    { title: "Build AI Agent Project", rule: "ai agent", icon: <Sparkles size={20} color="var(--color-primary)" /> },
                    { title: "Master System Design", rule: "system design", icon: <TrendingUp size={20} color="var(--color-success)" /> },
                    { title: "Win a Hackathon", rule: "hackathon", icon: <Zap size={20} color="#D49F00" /> }
                  ].map(sim => (
                    <Card key={sim.rule} hoverEffect style={{ padding: 'var(--space-4)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => runSimulation(sim.title, sim.rule)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--color-background)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{sim.icon}</div>
                        <h4 style={{ fontWeight: 600, fontSize: '1.05rem' }}>{sim.title}</h4>
                      </div>
                      <Button variant="ghost" size="sm"><Play size={16} /></Button>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Simulation History */}
          {simHistory.length > 0 && (
            <Card style={{ marginTop: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--space-4)' }}>
                <History size={18} color="var(--color-text-light)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Simulation History</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {simHistory.map((hist, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottom: idx !== simHistory.length - 1 ? '1px solid rgba(61,44,46,0.05)' : 'none' }}>
                    <div style={{ fontWeight: 600 }}>{hist.action}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: 'var(--color-text-light)', fontSize: '0.9rem' }}>{hist.current}% <ChevronRight size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /></span>
                      <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{hist.projected}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

        </div>

      </div>
    </div>
  );
};


export default CareerTwin;

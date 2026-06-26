import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Clock, TrendingUp, History, Sparkles, ChevronRight, Loader2, Play, ArrowLeft, Lock, Target } from 'lucide-react';
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

import { predictCareerImpact } from '../services/predictionEngine';
import type { PredictionResult } from '../services/predictionEngine';

type SimResult = PredictionResult;


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
            : "Upload a resume to generate your Career Twin. Complete your first analysis to unlock simulations."}
        </p>

        {generating ? (
          <div style={{ maxWidth: '300px', margin: '0 auto' }}>
            <div style={{ width: '100%', height: 6, background: 'rgba(61,44,46,0.1)', borderRadius: 3, overflow: 'hidden', marginBottom: 8 }}>
              <div style={{ height: '100%', background: 'var(--color-primary)', width: `${progress}%` }}></div>
            </div>
            <div style={{ fontSize: '0.95rem', color: 'var(--color-text-light)', fontWeight: 600 }}>Generating Career Twin: {progress}%</div>
          </div>
        ) : (
          <Button size="lg" onClick={isAnalyzed ? handleGenerate : () => navigate('/settings')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            {isAnalyzed ? "Generate My Career Twin" : "Upload Resume in Settings"} <ChevronRight size={18} />
          </Button>
        )}
      </header>

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
          </Card>
        </div>
      </div>
    </div>
  );
};

const RECOMMENDATIONS = [
  {
    title: "Build AI Agent Project",
    rule: "ai agent",
    icon: <Sparkles size={18} color="var(--color-primary)" />,
    whyRecommended: "Generative AI orchestration is the most demanded technical capability for target AI Engineer positions.",
    impact: 15,
    time: "3 Weeks",
    expectedImpact: "Unlocks AI Agents, LLM orchestration and workflow automation capabilities."
  },
  {
    title: "Master System Design",
    rule: "system design",
    icon: <TrendingUp size={18} color="var(--color-success)" />,
    whyRecommended: "Essential for passing senior architecture interviews and scaling robust microservices.",
    impact: 15,
    time: "8 Weeks",
    expectedImpact: "Unlocks system scaling, architecture, and microservices capability."
  },
  {
    title: "Win a Hackathon",
    rule: "hackathon",
    icon: <Zap size={18} color="#D49F00" />,
    whyRecommended: "Demonstrates rapid execution, prototyping, and team collaboration under pressure.",
    impact: 12,
    time: "1 Week",
    expectedImpact: "Unlocks collaborative prototyping and high-velocity delivery track record."
  }
];

interface AIInsightPanelProps {
  activeResult: SimResult | null;
  simulating: boolean;
  loadingMessage: string;
  baseReadiness: number;
  projectedReadiness: number;
  targetRole: string;
  onStartFirstSimulation: () => void;
}

const AIInsightPanel: React.FC<AIInsightPanelProps> = ({
  activeResult,
  simulating,
  loadingMessage,
  baseReadiness,
  projectedReadiness,
  targetRole,
  onStartFirstSimulation,
}) => {
  if (simulating) {
    return (
      <Card style={{ padding: 'var(--space-6)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-card)', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}>
            <Sparkles size={20} color="var(--color-primary)" />
          </motion.div>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: 1 }}>AI Twin Simulating</span>
        </div>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>{loadingMessage}</h3>
        <p style={{ fontSize: '0.95rem', color: 'var(--color-text-light)', margin: 0 }}>
          Analyzing skill alignments, project depth impact, and career milestone readiness scores.
        </p>
      </Card>
    );
  }

  if (!activeResult) {
    return (
      <Card style={{ padding: 'var(--space-6)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-card)', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles size={20} color="var(--color-primary)" />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: 1 }}>AI Career Prediction</span>
        </div>
        <div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 8px 0', color: 'var(--color-text)' }}>Project Your Future Career Growth</h3>
          <p style={{ fontSize: '0.95rem', color: 'var(--color-text-light)', margin: 0, lineHeight: 1.5 }}>
            Your AI Twin models industry demand and analyzes your current profile gaps. Run a recommended simulation or test a custom goal to see predicted readiness improvements, new competencies, and career milestones.
          </p>
        </div>
        <div>
          <Button size="sm" onClick={onStartFirstSimulation} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Play size={14} /> Start Your First Simulation
          </Button>
        </div>
      </Card>
    );
  }

  const isOffTopicResult = activeResult.readinessChange === 0 && activeResult.category !== "Unknown" && ["Lifestyle", "Entertainment", "Non-technical Hobby"].includes(activeResult.category);
  
  return (
    <Card style={{ padding: 'var(--space-6)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-card)', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles size={18} color="var(--color-primary)" />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: 1 }}>AI Mentor Recommendation</span>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: '12px',
            backgroundColor: activeResult.confidence === 'High' ? 'rgba(79,143,101,0.1)' : 'rgba(201,106,74,0.1)',
            color: activeResult.confidence === 'High' ? 'var(--color-success)' : 'var(--color-primary)'
          }}>
            {activeResult.confidence} Confidence
          </span>
          {activeResult.time && <span style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>({activeResult.time || '2 Weeks'})</span>}
        </div>
      </div>

      <div>
        <p style={{ fontSize: '1rem', color: 'var(--color-text)', margin: 0, fontStyle: 'italic', lineHeight: 1.6 }}>
          "{activeResult.explanation || activeResult.desc}"
        </p>
        {activeResult.confidenceReason && (
          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-light)', marginTop: 6, fontStyle: 'normal' }}>
            * {activeResult.confidenceReason}
          </span>
        )}
      </div>

      {/* Dynamic Metadata Badges */}
      {!isOffTopicResult && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '8px 0', borderTop: '1px dashed var(--color-border)' }}>
          <div style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: 4, background: 'var(--color-background)', border: '1px solid var(--color-glass-border)' }}>
            <strong>Category:</strong> {activeResult.category}
          </div>
          <div style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: 4, background: 'var(--color-background)', border: '1px solid var(--color-glass-border)' }}>
            <strong>Alignment:</strong> {activeResult.targetRoleAlignment}
          </div>
          <div style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: 4, background: 'var(--color-background)', border: '1px solid var(--color-glass-border)' }}>
            <strong>Difficulty:</strong> {activeResult.estimatedDifficulty}
          </div>
          <div style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: 4, background: 'var(--color-background)', border: '1px solid var(--color-glass-border)' }}>
            <strong>Demand:</strong> {activeResult.industryDemand}
          </div>
        </div>
      )}
    </Card>
  );
};

interface SimulationResultsCardProps {
  activeResult: SimResult;
  baseReadiness: number;
  projectedReadiness: number;
}

const SimulationResultsCard: React.FC<SimulationResultsCardProps> = ({
  activeResult,
  baseReadiness,
  projectedReadiness,
}) => {
  const isMilestoneUnlocked = baseReadiness < 90 && projectedReadiness >= 90;
  
  return (
    <Card style={{ padding: 'var(--space-6)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-card)', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Target size={18} color="var(--color-primary)" />
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: 1 }}>Simulation Results & Career Impact</span>
      </div>

      <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-light)', textTransform: 'uppercase', marginBottom: 8 }}>Skills Strengthened</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {activeResult.affectedSkills && activeResult.affectedSkills.length > 0 ? (
              activeResult.affectedSkills.map(skill => (
                <span key={skill} style={{ fontSize: '0.8rem', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', backgroundColor: 'rgba(201,106,74,0.06)', color: 'var(--color-primary)', border: '1px solid rgba(201,106,74,0.1)' }}>
                  {skill}
                </span>
              ))
            ) : (
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', fontStyle: 'italic' }}>None</span>
            )}
          </div>
        </div>
        <div>
          <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-light)', textTransform: 'uppercase', marginBottom: 8 }}>Projected Outcome</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: activeResult.readinessChange > 0 ? 'var(--color-success)' : 'var(--color-text-light)' }}>
              {activeResult.readinessChange > 0 ? `+${activeResult.readinessChange}%` : '0%'} Readiness Increase
            </div>
            {isMilestoneUnlocked ? (
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-success)' }}>
                ✓ Industry Ready Milestone Unlocked
              </div>
            ) : (
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
                Target: {projectedReadiness}% / 100%
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

const TransformationConnector: React.FC<{ active: boolean; simulating: boolean }> = ({ active, simulating }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: 40, position: 'relative' }}>
      <div style={{ height: 2, background: 'var(--color-border)', width: '100%', position: 'relative' }}>
        {(simulating || active) && (
          <motion.div
            style={{
              position: 'absolute',
              top: -3,
              left: 0,
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary)'
            }}
            animate={simulating ? {
              left: ['0%', '100%'],
            } : {
              left: '100%',
              scale: [1, 1.2, 1]
            }}
            transition={simulating ? {
              repeat: Infinity,
              duration: 1.5,
              ease: 'easeInOut'
            } : {
              duration: 0.3
            }}
          />
        )}
      </div>
    </div>
  );
};

interface TwinVisualizationProps {
  baseReadiness: number;
  projectedReadiness: number;
  baseSkills: string[];
  simulatedSkills: string[];
  gaps: string[];
  activeResult: SimResult | null;
  simulating: boolean;
}

const TwinVisualization: React.FC<TwinVisualizationProps> = ({
  baseReadiness,
  projectedReadiness,
  baseSkills,
  simulatedSkills,
  gaps,
  activeResult,
  simulating
}) => {
  const nextMilestone = baseReadiness < 80 ? 'Intern Ready (80%)' : baseReadiness < 90 ? 'Industry Ready (90%)' : 'Dream Role Ready (100%)';
  const predictedMilestone = projectedReadiness < 80 ? 'Intern Ready (80%)' : projectedReadiness < 90 ? 'Industry Ready (90%)' : 'Dream Role Ready (100%)';

  return (
    <Card style={{ padding: 'var(--space-6)', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Career Twin Evolution</h3>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Current State */}
        <div style={{ flex: 1, padding: 'var(--space-4)', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', minHeight: 180 }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>Current Profile</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--color-text)' }}>{baseReadiness}%</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', fontWeight: 600 }}>Readiness</span>
          </div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-light)', textTransform: 'uppercase', marginBottom: 6 }}>Key Strengths</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {baseSkills.slice(0, 3).map(skill => (
              <span key={skill} style={{ fontSize: '0.75rem', padding: '2px 6px', background: 'rgba(45,42,38,0.05)', color: 'var(--color-text)', borderRadius: 4, fontWeight: 500 }}>{skill}</span>
            ))}
          </div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-light)', textTransform: 'uppercase', marginTop: 12, marginBottom: 4 }}>Target Milestone</div>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text)' }}>{nextMilestone}</div>
        </div>

        {/* Connector */}
        <TransformationConnector active={!!activeResult} simulating={simulating} />

        {/* Predicted State */}
        <div style={{
          flex: 1,
          padding: 'var(--space-4)',
          backgroundColor: activeResult ? 'rgba(201,106,74,0.02)' : 'var(--color-background)',
          borderRadius: 'var(--radius-md)',
          border: activeResult ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
          minHeight: 180,
          transition: 'all 0.3s'
        }}>
          <div style={{ fontSize: '0.85rem', color: activeResult ? 'var(--color-primary)' : 'var(--color-text-light)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>Predicted Profile</div>
          
          {simulating ? (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '120px', alignItems: 'center', color: 'var(--color-text-light)' }}>
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }} style={{ marginBottom: 8 }}>
                <Loader2 size={24} color="var(--color-primary)" />
              </motion.div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Calculating path...</span>
            </div>
          ) : activeResult ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--color-primary)' }}>{projectedReadiness}%</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-success)', fontWeight: 700 }}>+{activeResult.increase}%</span>
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', marginBottom: 6 }}>Competencies Gained</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {simulatedSkills.map(skill => (
                  <span key={skill} style={{ fontSize: '0.75rem', padding: '2px 6px', background: 'rgba(201,106,74,0.1)', color: 'var(--color-primary)', borderRadius: 4, fontWeight: 600 }}>+ {skill}</span>
                ))}
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-light)', textTransform: 'uppercase', marginTop: 12, marginBottom: 4 }}>Predicted Milestone</div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: projectedReadiness > baseReadiness ? 'var(--color-success)' : 'var(--color-text)' }}>
                {predictedMilestone} {projectedReadiness > baseReadiness && '★'}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '120px', alignItems: 'center', color: 'var(--color-text-light)', textAlign: 'center', padding: '0 8px' }}>
              <span style={{ fontSize: '0.85rem', fontStyle: 'italic', lineHeight: 1.4 }}>Run a simulation to model skill evolution and projected outcomes here.</span>
            </div>
          )}
        </div>
      </div>

      {/* Visual Progress Bar */}
      <div style={{ position: 'relative', height: 8, backgroundColor: 'rgba(61,44,46,0.05)', borderRadius: 4, overflow: 'hidden' }}>
        <motion.div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, backgroundColor: 'var(--color-text-light)', opacity: 0.3, borderRadius: 4 }} initial={{ width: `${baseReadiness}%` }} animate={{ width: `${baseReadiness}%` }} />
        <motion.div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, backgroundColor: 'var(--color-primary)', borderRadius: 4 }} initial={{ width: `${baseReadiness}%` }} animate={{ width: `${projectedReadiness}%` }} transition={{ duration: 1.0, ease: "easeOut" }} />
      </div>
    </Card>
  );
};

interface SimulationOpportunityCardProps {
  title: string;
  rule: string;
  icon: React.ReactNode;
  whyRecommended: string;
  impact: number;
  time: string;
  expectedImpact: string;
  onClick: () => void;
  disabled: boolean;
}

const SimulationOpportunityCard: React.FC<SimulationOpportunityCardProps> = ({
  title,
  rule,
  icon,
  whyRecommended,
  impact,
  time,
  expectedImpact,
  onClick,
  disabled
}) => {
  return (
    <Card
      hoverEffect
      style={{
        padding: 'var(--space-4)',
        border: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer'
      }}
      onClick={onClick}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(201,106,74,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {icon}
          </div>
          <div>
            <h4 style={{ fontWeight: 700, fontSize: '1.05rem', margin: 0 }}>{title}</h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', fontWeight: 600 }}>{time} required</span>
          </div>
        </div>
        <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-success)', background: 'rgba(79,143,101,0.1)', padding: '2px 8px', borderRadius: 12 }}>
          +{impact}%
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', fontWeight: 600 }}>
          <strong>Why:</strong> {whyRecommended}
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', fontWeight: 600 }}>
          <strong>Impact:</strong> {expectedImpact}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px dashed var(--color-border)', paddingTop: 8 }}>
        <Button variant="ghost" size="sm" disabled={disabled} style={{ padding: '4px 8px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Play size={12} /> Run Simulation
        </Button>
      </div>
    </Card>
  );
};

const CareerTwin: React.FC = () => {
  const { memory, updateMemory, setTwinGenerated } = useCareerAgent();
  const navigate = useNavigate();

  const isTwinGenerated = memory.isTwinGenerated && !!memory.analysis;
  const isAnalyzed = memory.isAnalyzed && !!memory.analysis;
  const targetRole = memory.targetRole || 'AI Engineer';
  const baseReadiness = memory.analysis?.readiness || 0;
  const baseSkills = (memory.analysis?.strengths || []) as string[];
  const baseGaps = (memory.analysis?.gaps || []) as string[];

  const [projectedReadiness, setProjectedReadiness] = useState(baseReadiness);
  const [simulatedSkills, setSimulatedSkills] = useState<string[]>([]);
  const [simulating, setSimulating] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Analyzing your career scenario...');
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

  const runSimulation = (actionName: string) => {
    if (simulating) return;
    setValidationError(null);

    const inputQuery = actionName.trim();
    if (!inputQuery) return;

    setSimulating(true);
    setLoadingMessage("Analyzing your career scenario...");

    setTimeout(() => {
      setLoadingMessage("Evaluating skill relevance...");
    }, 600);

    setTimeout(() => {
      setLoadingMessage("Predicting career impact...");
    }, 1200);

    setTimeout(() => {
      const profile = {
        targetRole,
        currentReadiness: baseReadiness,
        history: simHistory.map(h => ({
          action: h.action,
          category: h.category,
          timestamp: h.timestamp
        }))
      };

      const result = predictCareerImpact(inputQuery, profile);

      setProjectedReadiness(result.projected);
      setSimulatedSkills(result.affectedSkills);
      setActiveResult(result);
      setSimHistory(prev => [result, ...prev]);
      setSimulating(false);
      setCustomInput('');
    }, 1800);
  };

  const handleCustomSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    setValidationError(null);
    runSimulation(customInput);
  };

  const clearSimulation = () => {
    setActiveResult(null);
    setProjectedReadiness(baseReadiness);
    setSimulatedSkills([]);
  };

  const startFirstSimulation = () => {
    const firstRec = RECOMMENDATIONS[0];
    runSimulation(firstRec.title);
  };

  return (
    <div className="container page-enter-active" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-12)' }}>
      <header style={{ marginBottom: 'var(--space-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', color: 'var(--color-text)', marginBottom: 'var(--space-1)', fontWeight: 800 }}>AI Career Twin</h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--color-text-light)', margin: 0 }}>Target Role: <strong style={{ color: 'var(--color-primary)' }}>{targetRole}</strong></p>
        </div>
      </header>

      {/* Asymmetric layout */}
      <div className="career-twin-grid">
        
        {/* Left Column - Core AI Twin Identity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <AIInsightPanel
            activeResult={activeResult}
            simulating={simulating}
            loadingMessage={loadingMessage}
            baseReadiness={baseReadiness}
            projectedReadiness={projectedReadiness}
            targetRole={targetRole}
            onStartFirstSimulation={startFirstSimulation}
          />

          <TwinVisualization
            baseReadiness={baseReadiness}
            projectedReadiness={projectedReadiness}
            baseSkills={baseSkills}
            simulatedSkills={simulatedSkills}
            gaps={baseGaps}
            activeResult={activeResult}
            simulating={simulating}
          />

          {activeResult && !simulating && (
            <SimulationResultsCard
              activeResult={activeResult}
              baseReadiness={baseReadiness}
              projectedReadiness={projectedReadiness}
            />
          )}
        </div>

        {/* Right Column - Controls & Supporting Data */}
        <div className="career-twin-sidebar">
          {/* Simulation Opportunities */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>Simulation Opportunities</h3>
            {RECOMMENDATIONS.map(sim => (
              <SimulationOpportunityCard
                key={sim.rule}
                title={sim.title}
                rule={sim.rule}
                icon={sim.icon}
                whyRecommended={sim.whyRecommended}
                impact={sim.impact}
                time={sim.time}
                expectedImpact={sim.expectedImpact}
                onClick={() => runSimulation(sim.title)}
                disabled={simulating}
              />
            ))}
          </div>

          {/* Ask custom twin */}
          <Card style={{ border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>Ask Your Career Twin</h3>
            <p style={{ color: 'var(--color-text-light)', margin: 0, fontSize: '0.85rem' }}>Test how a specific custom project or study topic impacts your profile readiness.</p>

            <form onSubmit={handleCustomSimulate} style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <input
                type="text"
                placeholder="What if I learn Docker?"
                value={customInput}
                onChange={e => { setCustomInput(e.target.value); setValidationError(null); }}
                style={{ flex: 1, padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontSize: '0.85rem', background: 'var(--color-background)', color: 'var(--color-text)' }}
                disabled={simulating}
              />
              <Button type="submit" disabled={simulating || !customInput.trim()} size="sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {simulating ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Loader2 size={14} /></motion.div> : <Sparkles size={14} />}
                Predict
              </Button>
            </form>
            {validationError && (
              <div style={{ marginTop: 4, padding: '8px 12px', background: 'rgba(192,86,86,0.06)', border: '1px solid rgba(192,86,86,0.15)', borderRadius: 'var(--radius-sm)', color: 'var(--color-danger)', fontSize: '0.8rem', lineHeight: 1.4 }}>
                ⚠ {validationError}
              </div>
            )}
          </Card>

          {/* Simulation History */}
          {simHistory.length > 0 && (
            <Card style={{ border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <History size={16} color="var(--color-text-light)" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Simulation History</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {simHistory.map((hist, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingBottom: idx !== simHistory.length - 1 ? 12 : 0, borderBottom: idx !== simHistory.length - 1 ? '1px solid rgba(61,44,46,0.05)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-text)' }}>{hist.action}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--color-text-light)' }}>{hist.current}%</span>
                        <ChevronRight size={10} color="var(--color-text-light)" />
                        <span style={{ color: hist.readinessChange > 0 ? 'var(--color-success)' : 'var(--color-text-light)', fontWeight: 700 }}>
                          {hist.projected}% ({hist.readinessChange > 0 ? `+${hist.readinessChange}%` : '0%'})
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
                      <span>Category: <strong>{hist.category}</strong></span>
                      <span style={{ fontSize: '0.75rem', color: hist.confidence === 'High' ? 'var(--color-success)' : 'var(--color-primary)', fontWeight: 600 }}>
                        {hist.confidence} Confidence
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', lineHeight: 1.3, fontStyle: 'italic', marginTop: 2 }}>
                      {hist.explanation || hist.desc}
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

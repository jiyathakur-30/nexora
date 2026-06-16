import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Clock, TrendingUp, History, Sparkles, ChevronRight, Loader2, Play, ArrowLeft } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const SIMULATION_RULES: Record<string, { impact: number, time: string, demand: string, skills: string[], desc: string }> = {
  'aws': { impact: 8, time: '4 Weeks', demand: 'High', skills: ['AWS', 'Cloud Infrastructure', 'Deployment'], desc: 'Cloud expertise directly increases your hireability for modern infrastructure roles.' },
  'docker': { impact: 6, time: '2 Weeks', demand: 'High', skills: ['Docker', 'Containerization'], desc: 'Containerization is a foundational requirement for most backend and full-stack positions.' },
  'kubernetes': { impact: 12, time: '6 Weeks', demand: 'Very High', skills: ['Kubernetes', 'Orchestration', 'DevOps'], desc: 'Advanced orchestration skills significantly boost your value for scalable architecture teams.' },
  'system design': { impact: 15, time: '8 Weeks', demand: 'Very High', skills: ['Architecture', 'Scalability', 'Microservices'], desc: 'Mastering system design is critical for passing senior-level interviews and architecting robust systems.' },
  'ai agent': { impact: 15, time: '3 Weeks', demand: 'Very High', skills: ['AI Agents', 'LLMs', 'Workflow Automation'], desc: 'AI Agent development directly aligns with your target role and closes one of your highest-impact skill gaps.' },
  'dsa': { impact: 10, time: '8 Weeks', demand: 'High', skills: ['Algorithms', 'Data Structures', 'Problem Solving'], desc: 'Core DSA competency is required for passing technical screens at top-tier companies.' },
  'hackathon': { impact: 12, time: '1 Week', demand: 'High', skills: ['Rapid Prototyping', 'Teamwork', 'Execution'], desc: 'Winning or participating in hackathons demonstrates applied execution and teamwork under pressure.' },
  'open source': { impact: 9, time: 'Ongoing', demand: 'High', skills: ['Collaboration', 'Code Review', 'Git Workflow'], desc: 'Contributing to open source builds a public track record of your code quality.' },
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

const CareerTwin: React.FC = () => {
  const targetRole = localStorage.getItem('nexora_user_role') || 'AI Engineer';
  const baseReadiness = 72;
  const baseSkills = ['React', 'JavaScript', 'Problem Solving'];
  
  const [projectedReadiness, setProjectedReadiness] = useState(baseReadiness);
  const [simulatedSkills, setSimulatedSkills] = useState<string[]>([]);
  const [simulating, setSimulating] = useState(false);
  const [simHistory, setSimHistory] = useState<SimResult[]>([]);
  const [customInput, setCustomInput] = useState('');
  const [activeResult, setActiveResult] = useState<SimResult | null>(null);

  const runSimulation = (actionName: string, query?: string) => {
    if (simulating) return;
    setSimulating(true);

    let ruleKey = 'general';
    const matchText = (query || actionName).toLowerCase();
    
    for (const key of Object.keys(SIMULATION_RULES)) {
      if (matchText.includes(key)) {
        ruleKey = key;
        break;
      }
    }

    const ruleset = SIMULATION_RULES[ruleKey] || { impact: 5, time: '2-4 Weeks', demand: 'Medium', skills: ['Domain Knowledge', 'Applied Learning'], desc: 'General learning goals steadily improve your overall competency profile.' };

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
                onChange={e => setCustomInput(e.target.value)} 
                style={{ flex: 1, padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(61,44,46,0.1)' }} 
                disabled={simulating}
              />
              <Button type="submit" disabled={simulating || !customInput.trim()} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {simulating ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Loader2 size={18} /></motion.div> : <Sparkles size={18} />}
                Predict Future Impact
              </Button>
            </form>
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
                      <span style={{ color: 'var(--color-text-light)', fontSize: '0.9rem' }}>{hist.current}% <ChevronRight size={14} style={{ display: 'inline', verticalAlign: 'middle' }}/></span>
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

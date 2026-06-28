import React, { useState } from 'react';
import { Send, Bot, Lightbulb, Target, FolderGit2, Lock, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useCareerAgent } from '../services/CareerAgent';
import type { MentorMessage } from '../services/CareerAgent';

const AIMentor: React.FC = () => {
  const { memory, updateMemory } = useCareerAgent();
  const navigate = useNavigate();

  const userName = memory.profile?.name || 'Guest';
  const targetRole = memory.targetRole || 'Software Engineer';
  const firstName = userName.split(' ')[0];

  const isAnalyzed = memory.isAnalyzed && !!memory.analysis;

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Initialize greeting if chatHistory is empty
  const defaultGreeting: MentorMessage = isAnalyzed
    ? { text: `Hi ${firstName}! I'm your Nexora AI Mentor. I've analyzed your Career Twin and your goal to become an ${targetRole}. What would you like to focus on today?`, isAi: true, timestamp: new Date().toISOString() }
    : { text: "I need more context before I can provide personalized guidance. Generate your Career Twin to unlock AI mentoring.", isAi: true, timestamp: new Date().toISOString() };

  const messages = memory.mentorContext.chatHistory.length > 0
    ? memory.mentorContext.chatHistory
    : [defaultGreeting];

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: MentorMessage = {
      text: text.trim(),
      isAi: false,
      timestamp: new Date().toISOString()
    };

    updateMemory(prev => ({
      ...prev,
      mentorContext: {
        ...prev.mentorContext,
        chatHistory: prev.mentorContext.chatHistory.length > 0
          ? [...prev.mentorContext.chatHistory, userMsg]
          : [defaultGreeting, userMsg],
        lastInteraction: new Date().toISOString()
      }
    }));

    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('http://localhost:5000/api/mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text })
      });
      const data = await res.json();

      const aiMsg: MentorMessage = {
        text: data.response,
        isAi: true,
        timestamp: new Date().toISOString()
      };

      updateMemory(prev => ({
        ...prev,
        mentorContext: {
          ...prev.mentorContext,
          chatHistory: [...prev.mentorContext.chatHistory, aiMsg],
          lastInteraction: new Date().toISOString()
        }
      }));
    } catch (e) {
      const errMsg: MentorMessage = {
        text: "Sorry, I'm having trouble connecting right now.",
        isAi: true,
        timestamp: new Date().toISOString()
      };

      updateMemory(prev => ({
        ...prev,
        mentorContext: {
          ...prev.mentorContext,
          chatHistory: [...prev.mentorContext.chatHistory, errMsg],
          lastInteraction: new Date().toISOString()
        }
      }));
    } finally {
      setIsTyping(false);
    }
  };

  const gap = memory.analysis?.gaps?.[0];
  const recommendedProject = gap ? {
    title: `${gap} Integration Dashboard`,
    desc: `Build a real-world integration focusing on ${gap} design patterns.`,
    prompt: `Tell me how to start a project building an ${gap} Integration Dashboard.`
  } : null;

  return (
    <div
  className="container page-enter-active"
  style={{
    paddingTop: 'var(--space-8)',
    paddingBottom: 'var(--space-12)',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column'
  }}
>
      <header
        style={{
          marginBottom: 'var(--space-8)',
          padding: '32px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg,#fff,#fdf7f4)',
          border: '1px solid rgba(201,106,74,0.08)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

          <div>
            <div
              style={{
                color: 'var(--color-primary)',
                fontSize: '.8rem',
                fontWeight: 700,
                letterSpacing: '.08em',
                textTransform: 'uppercase'
              }}
            >
              TODAY'S CHALLENGE
            </div>

            <h1
              style={{
                fontSize: '2.8rem',
                fontWeight: 800,
                margin: '10px 0'
              }}
            >
              Build Something That Gets You Hired
            </h1>

            <p
              style={{
                color: 'var(--color-text-light)',
                fontSize: '1.05rem',
                maxWidth: '650px',
                lineHeight: 1.7
              }}
            >
              Every conversation should end with a measurable improvement to your software engineering career.
            </p>

            <div
              style={{
                display: 'flex',
                gap: '12px',
                marginTop: '20px',
                flexWrap: 'wrap'
              }}
            >
              <span className="badge">🔥 Daily Mission</span>
              <span className="badge">⚡ 45 min</span>
              <span className="badge">📈 +3 Career Score</span>
            </div>
          </div>

          {isAnalyzed && (
            <Card
              style={{
                padding: 20,
                minWidth: 250
              }}
            >
              <div
                style={{
                  fontSize: '.75rem',
                  color: 'var(--color-primary)',
                  fontWeight: 700
                }}
              >
                MISSION REWARD
              </div>

              <div style={{ marginTop: 12 }}>
                ✔ Portfolio Project
              </div>

              <div>
                ✔ Interview Story
              </div>

              <div>
                ✔ System Design Practice
              </div>

              <Button
                style={{
                  width: '100%',
                  marginTop: 18
                }}
              >
                Start Today's Mission
              </Button>
            </Card>
          )}

        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr ', gap: 'var(--space-6)',  alignItems: 'start' }}>

        {/* Left Pane: Insights & Prompts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', overflowY: 'visible', paddingRight: 'var(--space-2)' }}>

          <Card
            style={{
              padding: '24px',
              background: '#fff',
              border: '1px solid rgba(201,106,74,.08)',
              borderRadius: '18px'
            }}
          >
            <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-3)' }}>
              {isAnalyzed ? <Target size={18} color="var(--color-primary)" /> : <Lock size={18} color="var(--color-primary)" />}
              Weekly Goals
            </h3>
            {isAnalyzed && memory?.weeklyMissions && memory.weeklyMissions.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {memory.weeklyMissions.map((mission: any) => (
                  <div key={mission.id} style={{
                    fontSize: '0.9rem',
                    color: 'var(--color-text)',
                    padding: '14px 16px',
                    marginBottom: '12px',
                    background: '#FAF8F6',
                    borderRadius: '12px',
                    borderLeft: '4px solid var(--color-primary)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                  }}>
                    <div style={{ fontWeight: 600, color: 'var(--color-text)', textDecoration: mission.completed ? 'line-through' : 'none' }}>
                      {mission.text}
                    </div>
                    <div style={{ display: 'flex', gap: 6, fontSize: '0.72rem', marginTop: 4, flexWrap: 'wrap' }}>
                      <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{mission.difficulty}</span>
                      <span>•</span>
                      <span>{mission.category}</span>
                    </div>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', fontStyle: 'italic', opacity: 0.8 }}>
                      {mission.why}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>
                {isAnalyzed ? "No active weekly missions at this time." : "Generate your Career Twin to unlock weekly goals."}
              </div>
            )}
          </Card>

          <Card style={{ padding: 'var(--space-4)' }}>
            <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-3)' }}>
              {isAnalyzed ? <FolderGit2 size={18} color="var(--color-primary)" /> : <Lock size={18} color="var(--color-primary)" />}
              Recommended Projects
            </h3>
            {isAnalyzed && recommendedProject ? (
              <div style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>
                <strong>{recommendedProject.title}</strong><br />
                {recommendedProject.desc}
                <Button size="sm" variant="outline" style={{ marginTop: 8, width: '100%' }} onClick={() => handleSend(recommendedProject.prompt)}>Ask Mentor</Button>
              </div>
            ) : (
              <div style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>
                {isAnalyzed ? "No recommended projects at this time." : "Profile data required."}
              </div>
            )}
          </Card>

          <Card style={{ padding: 'var(--space-4)' }}>
            <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-3)' }}>
              {isAnalyzed ? <Lightbulb size={18} color="var(--color-primary)" /> : <Lock size={18} color="var(--color-primary)" />}
              Suggested Prompts
            </h3>
            {isAnalyzed ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {["What should I learn next?", "Am I internship ready?", "Review my skill gaps."].map(p => (
                  <button key={p} onClick={() => handleSend(p)} style={{
                    textAlign: 'left',
                    fontSize: '0.92rem',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    background: '#FAF8F6',
                    color: 'var(--color-text)',
                    border: '1px solid rgba(201,106,74,.08)',
                    cursor: 'pointer',
                    transition: 'all .2s ease',
                    fontWeight: 500
                  }}
                    onMouseOver={e => {
                      e.currentTarget.style.background = '#FFF5F1';
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.background = '#FAF8F6';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>
                Complete analysis to unlock suggestions.
              </div>
            )}
          </Card>
        </div>

        {/* Right Pane: Chat Interface */}
        <Card glass style={{ display: 'flex', flexDirection: 'column', padding: 0,  minHeight: '700px' }}>
          <div
  style={{
    flex: 1,
    padding: 'var(--space-6)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-4)',
    maxHeight: '650px',
    overflowY: 'auto'
  }}
>
            {messages.map((msg, i) => (
              <div key={i} style={{
                alignSelf: msg.isAi ? 'flex-start' : 'flex-end',
                backgroundColor: msg.isAi ? 'rgba(61,44,46,0.03)' : 'var(--color-primary)',
                color: msg.isAi ? 'var(--color-text)' : 'white',
                padding: '16px 24px',
                borderRadius: '16px',
                borderBottomLeftRadius: msg.isAi ? 0 : '16px',
                borderBottomRightRadius: !msg.isAi ? 0 : '16px',
                maxWidth: '85%',
                fontSize: '1rem',
                lineHeight: 1.6,
                boxShadow: msg.isAi ? 'none' : 'var(--shadow-sm)',
                border: msg.isAi ? '1px solid rgba(61,44,46,0.05)' : 'none'
              }}>
                {msg.text}
              </div>
            ))}
            {!isAnalyzed && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                style={{ alignSelf: 'flex-start', marginTop: 'var(--space-2)' }}
              >
                <Button onClick={() => navigate('/dashboard')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  Generate My Career Twin <ChevronRight size={16} />
                </Button>
              </motion.div>
            )}
            {isTyping && (
              <div style={{ alignSelf: 'flex-start', padding: '16px 24px', borderRadius: '16px', borderBottomLeftRadius: 0, backgroundColor: 'rgba(61,44,46,0.03)', border: '1px solid rgba(61,44,46,0.05)' }}>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center', height: '24px' }}>
                  <div style={dotStyle(0)}></div><div style={dotStyle(0.2)}></div><div style={dotStyle(0.4)}></div>
                </div>
              </div>
            )}
          </div>

          <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-background)', borderTop: '1px solid var(--color-glass-border)' }}>
            <form onSubmit={(e) => { e.preventDefault(); handleSend(input); }} style={{ display: 'flex', gap: 'var(--space-3)', position: 'relative' }}>
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={isAnalyzed ? "Ask your mentor anything about your career..." : "🔒 Chat locked. Complete your profile analysis to talk to your AI Mentor."}
                disabled={!isAnalyzed}
                style={{ flex: 1, padding: '16px 24px', fontSize: '1rem', borderRadius: 'var(--radius-xl)', border: '1px solid rgba(61,44,46,0.1)', outline: 'none', backgroundColor: !isAnalyzed ? 'rgba(61,44,46,0.03)' : '#fff', boxShadow: 'var(--shadow-sm)' }}
              />
              <Button type="submit" disabled={!isAnalyzed || !input.trim()} style={{ position: 'absolute', right: 8, top: 8, bottom: 8, padding: '0 20px', borderRadius: 'var(--radius-xl)' }}>
                <Send size={18} />
              </Button>
            </form>
          </div>
        </Card>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
};

const dotStyle = (delay: number): React.CSSProperties => ({
  width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--color-text-light)',
  animation: `bounce 1s infinite ${delay}s`
});

export default AIMentor;

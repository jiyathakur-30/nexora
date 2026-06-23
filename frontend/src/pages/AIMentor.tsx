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
    <div className="container page-enter-active" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-12)', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: '2.5rem', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Bot size={40} color="var(--color-primary)" />
          AI Mentor
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--color-text-light)' }}>Your dedicated career strategist.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: 'var(--space-6)', flex: 1, minHeight: 0 }}>
        
        {/* Left Pane: Insights & Prompts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', overflowY: 'auto', paddingRight: 'var(--space-2)' }}>
          
          <Card style={{ padding: 'var(--space-4)' }}>
            <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-3)' }}>
              {isAnalyzed ? <Target size={18} color="var(--color-primary)" /> : <Lock size={18} color="var(--color-primary)" />}
              Weekly Goals
            </h3>
            {isAnalyzed && memory?.weeklyMissions && memory.weeklyMissions.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {memory.weeklyMissions.map((mission: any) => (
                  <div key={mission.id} style={{ 
                    fontSize: '0.85rem', 
                    color: 'var(--color-text-light)', 
                    padding: '8px 10px', 
                    background: 'rgba(61,44,46,0.02)', 
                    borderRadius: '4px',
                    borderLeft: `3px solid ${mission.difficulty === 'Advanced' ? 'var(--color-danger)' : (mission.difficulty === 'Intermediate' ? 'var(--color-warning)' : 'var(--color-primary)')}`
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
                <strong>{recommendedProject.title}</strong><br/>
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
                    textAlign: 'left', fontSize: '0.85rem', padding: '8px 12px', borderRadius: '8px', 
                    backgroundColor: 'rgba(61,44,46,0.05)', color: 'var(--color-text)', border: 'none', 
                    cursor: 'pointer', transition: 'background-color 0.2s' 
                  }}
                  onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(201,106,74,0.1)'}
                  onMouseOut={e => e.currentTarget.style.backgroundColor = 'rgba(61,44,46,0.05)'}
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
        <Card glass style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
          <div style={{ flex: 1, padding: 'var(--space-6)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
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

import React, { useState } from 'react';
import { Send, Bot, Lightbulb, Target, FolderGit2 } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

interface ChatMessage {
  text: string;
  isAi: boolean;
}

const AIMentor: React.FC = () => {
  const userName = localStorage.getItem('nexora_user_name') || 'Guest';
  const targetRole = localStorage.getItem('nexora_user_role') || 'AI Engineer';
  const firstName = userName.split(' ')[0];

  const [messages, setMessages] = useState<ChatMessage[]>([
    { text: `Hi ${firstName}! I'm your Nexora AI Mentor. I've analyzed your Career Twin and your goal to become an ${targetRole}. What would you like to focus on today?`, isAi: true }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    
    setMessages(prev => [...prev, { text, isAi: false }]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('http://localhost:5000/api/mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { text: data.response, isAi: true }]);
    } catch (e) {
      setMessages(prev => [...prev, { text: "Sorry, I'm having trouble connecting right now.", isAi: true }]);
    } finally {
      setIsTyping(false);
    }
  };

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
            <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-3)' }}><Target size={18} color="var(--color-primary)" /> Weekly Goals</h3>
            <ul style={{ paddingLeft: '20px', fontSize: '0.9rem', color: 'var(--color-text-light)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <li>Complete React advanced patterns</li>
              <li>Start AWS Cloud Practitioner prep</li>
            </ul>
          </Card>

          <Card style={{ padding: 'var(--space-4)' }}>
            <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-3)' }}><FolderGit2 size={18} color="var(--color-primary)" /> Recommended Projects</h3>
            <div style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>
              <strong>AI Agent Task Manager</strong><br/>
              High impact for your goal. +15% Readiness.
              <Button size="sm" variant="outline" style={{ marginTop: 8, width: '100%' }} onClick={() => handleSend("Tell me more about the AI Agent Task Manager project.")}>Ask Mentor</Button>
            </div>
          </Card>

          <Card style={{ padding: 'var(--space-4)' }}>
            <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-3)' }}><Lightbulb size={18} color="var(--color-primary)" /> Suggested Prompts</h3>
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
                placeholder="Ask your mentor anything about your career..."
                style={{ flex: 1, padding: '16px 24px', fontSize: '1rem', borderRadius: 'var(--radius-xl)', border: '1px solid rgba(61,44,46,0.1)', outline: 'none', backgroundColor: '#fff', boxShadow: 'var(--shadow-sm)' }}
              />
              <Button type="submit" style={{ position: 'absolute', right: 8, top: 8, bottom: 8, padding: '0 20px', borderRadius: 'var(--radius-xl)' }}>
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

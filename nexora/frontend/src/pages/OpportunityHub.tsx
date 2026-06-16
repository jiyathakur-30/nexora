import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Users, Globe, Briefcase, GraduationCap, MessageCircle, HeartHandshake, Send } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

interface Message {
  id: number;
  sender: string;
  text: string;
  isAi?: boolean;
  timestamp: string;
}

const OpportunityHub: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'people' | 'communities' | 'teams' | 'mentors'>('communities');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [activeCommunity, setActiveCommunity] = useState<number | null>(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/opportunities')
      .then(res => res.json())
      .then(d => setData(d));
      
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);
    
    newSocket.on('receive_message', (msg: Message) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const joinCommunity = (id: number) => {
    setActiveCommunity(id);
    setActiveTab('communities');
    setMessages([{ id: 0, sender: 'System', text: 'Welcome to the community! The AI Assistant is listening.', timestamp: new Date().toISOString() }]);
    if (socket) {
      socket.emit('join_community', id);
    }
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !socket || !activeCommunity) return;
    
    const msg = {
      id: Date.now(),
      sender: 'Aarav Patel',
      text: inputText,
      communityId: activeCommunity,
      timestamp: new Date().toISOString()
    };
    
    socket.emit('send_message', msg);
    setInputText('');
  };

  if (!data) return null;

  return (
    <div className="container page-enter-active" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-12)' }}>
      <header style={{ marginBottom: 'var(--space-8)' }}>
        <h1 style={{ fontSize: '2.5rem', color: 'var(--color-text)', marginBottom: 'var(--space-2)' }}>Opportunity Hub</h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--color-text-light)' }}>Find the people and teams to accelerate your growth.</p>
      </header>

      {/* Tabs */}
      <div style={{ gap: 'var(--space-2)', marginBottom: 'var(--space-8)', background: 'var(--color-card)', padding: '6px', borderRadius: 'var(--radius-full)', display: 'inline-flex' }}>
        <TabButton active={activeTab === 'communities'} onClick={() => { setActiveTab('communities'); setActiveCommunity(null); }} icon={<Globe size={18}/>} label="Communities" />
        <TabButton active={activeTab === 'people'} onClick={() => { setActiveTab('people'); setActiveCommunity(null); }} icon={<Users size={18}/>} label="Similar Learners" />
        <TabButton active={activeTab === 'teams'} onClick={() => { setActiveTab('teams'); setActiveCommunity(null); }} icon={<Briefcase size={18}/>} label="Open Teams" />
        <TabButton active={activeTab === 'mentors'} onClick={() => { setActiveTab('mentors'); setActiveCommunity(null); }} icon={<GraduationCap size={18}/>} label="Mentors" />
      </div>

      {activeTab === 'communities' && !activeCommunity && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 'var(--space-6)' }}>
          {data.communities.map((c: any) => (
            <Card key={c.id} hoverEffect style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(201,106,74,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Globe color="var(--color-primary)" />
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-primary)', backgroundColor: 'rgba(201,106,74,0.1)', padding: '4px 10px', borderRadius: 20 }}>
                  {c.members} Members
                </div>
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 'var(--space-2)' }}>{c.name}</h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--color-text-light)', marginBottom: 'var(--space-4)', flex: 1 }}>{c.description}</p>
              
              <div style={{ borderTop: '1px solid rgba(61,44,46,0.1)', paddingTop: 'var(--space-4)', marginTop: 'auto' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', marginBottom: 8, fontWeight: 600 }}>TRENDING TOPICS</div>
                <div style={{ display: 'flex', gap: 6, marginBottom: 'var(--space-4)' }}>
                  <span style={{ fontSize: '0.8rem', padding: '4px 8px', background: 'var(--color-background)', borderRadius: 6 }}>MCP</span>
                  <span style={{ fontSize: '0.8rem', padding: '4px 8px', background: 'var(--color-background)', borderRadius: 6 }}>AI Agents</span>
                </div>
                <Button size="md" variant="primary" style={{ width: '100%' }} onClick={() => joinCommunity(c.id)}>Join Community</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Community Chat UI remains mostly the same, just polished */}
      {activeTab === 'communities' && activeCommunity && (
        <Card glass style={{ height: '70vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: 'var(--space-4) var(--space-6)', borderBottom: '1px solid var(--color-glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Globe color="var(--color-primary)" />
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Community Chat</h3>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setActiveCommunity(null)}>Leave Chat</Button>
          </div>
          
          <div style={{ flex: 1, padding: 'var(--space-6)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {messages.map((m) => (
              <div key={m.id} style={{ 
                alignSelf: m.sender === 'Aarav Patel' ? 'flex-end' : 'flex-start',
                backgroundColor: m.isAi ? 'rgba(201,106,74,0.1)' : m.sender === 'Aarav Patel' ? 'var(--color-primary)' : '#fff',
                color: m.sender === 'Aarav Patel' ? 'white' : 'var(--color-text)',
                border: m.isAi ? '1px solid var(--color-glass-border)' : m.sender !== 'Aarav Patel' ? '1px solid rgba(61,44,46,0.1)' : 'none',
                padding: '12px 16px',
                borderRadius: '16px',
                maxWidth: '70%',
                boxShadow: m.sender !== 'Aarav Patel' && !m.isAi ? 'var(--shadow-sm)' : 'none'
              }}>
                <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: 4, fontWeight: 600 }}>
                  {m.sender} {m.isAi && '🤖 AI Assistant'}
                </div>
                <div style={{ fontSize: '1rem', lineHeight: 1.5 }}>{m.text}</div>
              </div>
            ))}
          </div>

          <form onSubmit={sendMessage} style={{ padding: 'var(--space-4) var(--space-6)', borderTop: '1px solid var(--color-glass-border)', display: 'flex', gap: 'var(--space-3)', backgroundColor: '#fff' }}>
            <input 
              type="text" 
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Message the community or ask the AI Assistant (e.g. 'summarize')..." 
              style={{ flex: 1, padding: '14px 20px', borderRadius: 'var(--radius-xl)', border: '1px solid rgba(61,44,46,0.1)', backgroundColor: 'var(--color-background)', outline: 'none' }}
            />
            <Button type="submit" style={{ borderRadius: 'var(--radius-xl)', padding: '0 24px' }}><Send size={18} /></Button>
          </form>
        </Card>
      )}

      {/* People, Teams, Mentors with Rich Previews */}
      {activeTab === 'people' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
          {data.similarPeople.map((p: any) => (
            <Card key={p.id} hoverEffect>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#fff', border: '1px solid rgba(61,44,46,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                  {p.name.charAt(0)}
                </div>
                <div style={{ backgroundColor: 'rgba(78, 139, 98, 0.1)', color: 'var(--color-success)', padding: '4px 10px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 700 }}>
                  {p.matchScore}% Match
                </div>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{p.name}</h3>
              <div style={{ fontSize: '0.9rem', color: 'var(--color-text-light)', marginBottom: 16 }}>Goal: {p.goal}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
                {p.sharedSkills.map((s: string) => <span key={s} style={{ fontSize: '0.8rem', padding: '4px 8px', backgroundColor: 'var(--color-background)', borderRadius: 6 }}>{s}</span>)}
              </div>
              <Button size="sm" variant="outline" style={{ width: '100%' }}><MessageCircle size={16} style={{marginRight: 8}}/> Connect</Button>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'teams' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 'var(--space-6)' }}>
          {data.teams.map((t: any) => (
            <Card key={t.id} hoverEffect>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: '#fff', border: '1px solid rgba(61,44,46,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Briefcase size={24} color="var(--color-primary)" />
                </div>
                <div style={{ backgroundColor: 'rgba(78, 139, 98, 0.1)', color: 'var(--color-success)', padding: '4px 10px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 700 }}>
                  {t.matchScore}% Match
                </div>
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 8 }}>{t.name}</h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--color-text-light)', marginBottom: 20 }}>Needs: <strong style={{ color: 'var(--color-text)' }}>{t.needs}</strong></p>
              <div style={{ display: 'flex', gap: 12 }}>
                <Button size="md" variant="primary" style={{ flex: 1 }}>Join Team</Button>
                <Button size="md" variant="secondary" style={{ flex: 1 }}>Message</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'mentors' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
          {data.mentors.map((m: any) => (
            <Card key={m.id} hoverEffect>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#fff', border: '1px solid rgba(61,44,46,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                  {m.name.charAt(0)}
                </div>
                <div style={{ backgroundColor: 'rgba(201,106,74,0.1)', color: 'var(--color-primary)', padding: '4px 10px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 700 }}>
                  89% Match
                </div>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{m.name}</h3>
              <p style={{ marginTop: 4, fontSize: '0.95rem', color: 'var(--color-text-light)' }}>{m.expertise}</p>
              <div style={{ marginTop: 12, marginBottom: 24, fontSize: '0.85rem', fontWeight: 600, color: m.availability === 'Available' ? 'var(--color-success)' : 'var(--color-danger)' }}>
                ● {m.availability}
              </div>
              <Button size="sm" variant="outline" style={{ width: '100%' }}><HeartHandshake size={16} style={{marginRight: 8}}/> Request Mentorship</Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick}
    style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '8px 16px', borderRadius: 'var(--radius-full)',
      backgroundColor: active ? '#fff' : 'transparent',
      color: active ? 'var(--color-text)' : 'var(--color-text-light)',
      fontWeight: active ? 600 : 500,
      border: 'none', cursor: 'pointer',
      boxShadow: active ? 'var(--shadow-sm)' : 'none',
      transition: 'all var(--transition-fast)'
    }}
  >
    {icon} {label}
  </button>
)

export default OpportunityHub;

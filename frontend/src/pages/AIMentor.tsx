import React, { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react';
import {
  Send, Target, FolderGit2, Lock, ChevronRight, Sparkles, TrendingUp,
  Map as MapIcon, Search, FileText, MessageSquare, Mic, Compass, Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useCareerAgent } from '../services/CareerAgent';
import type { MentorMessage, WeeklyMission } from '../services/CareerAgent';

// =============================================================================
// MENTOR MESSAGE RENDERER
// Lightweight markdown-lite parser for Career Copilot responses. No external
// markdown dependency — parses the small, predictable formatting vocabulary
// the mentor backend is instructed to use:
//   ## Heading        -> section heading
//   - item / • item   -> bullet list
//   1. item           -> numbered list
//   > Tip text        -> highlighted tip callout
//   ```code```        -> code block
//   **bold**          -> inline emphasis
// Parsing logic is unchanged from before; the only addition is fenced code
// block support (item 6 of the polish pass). AI output itself is untouched.
// =============================================================================

const escapeHtml = (str: string) =>
  str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const boldify = (str: string) =>
  escapeHtml(str).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

type MentorBlock =
  | { type: 'heading'; text: string }
  | { type: 'bullets'; items: string[] }
  | { type: 'numbered'; items: string[] }
  | { type: 'tip'; text: string }
  | { type: 'code'; text: string }
  | { type: 'paragraph'; text: string };

const parseMentorContent = (raw?: string): MentorBlock[] => {
  if (!raw) {
    return [
      {
        type: "paragraph",
        text: "No response received from AI."
      }
    ];
  }

  const lines = raw.split('\n');
  const blocks: MentorBlock[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];

  for (const rawLine of lines) {
    // Fenced code blocks (```...```) are tracked across multiple raw lines,
    // so leading/trailing whitespace inside the block is preserved.
    if (rawLine.trim().startsWith('```')) {
      if (inCodeBlock) {
        blocks.push({ type: 'code', text: codeBuffer.join('\n') });
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }
    if (inCodeBlock) {
      codeBuffer.push(rawLine);
      continue;
    }

    const line = rawLine.trim();
    if (!line) continue;

    if (line.startsWith('## ')) {
      blocks.push({ type: 'heading', text: line.slice(3).trim() });
      continue;
    }

    if (line.startsWith('- ') || line.startsWith('• ')) {
      const item = line.slice(2).trim();
      const last = blocks[blocks.length - 1];
      if (last && last.type === 'bullets') {
        last.items.push(item);
      } else {
        blocks.push({ type: 'bullets', items: [item] });
      }
      continue;
    }

    const numberedMatch = line.match(/^\d+\.\s+(.*)/);
    if (numberedMatch) {
      const item = numberedMatch[1].trim();
      const last = blocks[blocks.length - 1];
      if (last && last.type === 'numbered') {
        last.items.push(item);
      } else {
        blocks.push({ type: 'numbered', items: [item] });
      }
      continue;
    }

    if (line.startsWith('> ')) {
      blocks.push({ type: 'tip', text: line.slice(2).trim() });
      continue;
    }

    blocks.push({ type: 'paragraph', text: line });
  }

  // Flush an unterminated code block rather than dropping it silently.
  if (inCodeBlock && codeBuffer.length > 0) {
    blocks.push({ type: 'code', text: codeBuffer.join('\n') });
  }

  return blocks;
};

const MentorMessageContent: React.FC<{ text: string }> = memo(({ text }) => {
  const blocks = useMemo(() => parseMentorContent(typeof text === "string" ? text : ""), [text]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
      {blocks.map((block, i) => {
        if (block.type === 'heading') {
          return (
            <div
              key={i}
              style={{
                fontSize: '0.95rem',
                fontWeight: 700,
                color: 'var(--color-primary)',
                marginTop: i === 0 ? 0 : 8,
                letterSpacing: '.01em'
              }}
              dangerouslySetInnerHTML={{ __html: boldify(block.text) }}
            />
          );
        }
        if (block.type === 'bullets') {
          return (
            <ul key={i} style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 5 }}>
              {block.items.map((item, j) => (
                <li
                  key={j}
                  style={{ fontSize: '0.92rem', lineHeight: 1.65 }}
                  dangerouslySetInnerHTML={{ __html: boldify(item) }}
                />
              ))}
            </ul>
          );
        }
        if (block.type === 'numbered') {
          return (
            <ol key={i} style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 5 }}>
              {block.items.map((item, j) => (
                <li
                  key={j}
                  style={{ fontSize: '0.92rem', lineHeight: 1.65 }}
                  dangerouslySetInnerHTML={{ __html: boldify(item) }}
                />
              ))}
            </ol>
          );
        }
        if (block.type === 'tip') {
          return (
            <div
              key={i}
              style={{
                fontSize: '0.88rem',
                lineHeight: 1.6,
                background: 'rgba(201,106,74,0.07)',
                borderLeft: '3px solid var(--color-primary)',
                borderRadius: '10px',
                padding: '10px 14px',
                color: 'var(--color-text)'
              }}
            >
              <strong style={{ color: 'var(--color-primary)' }}>Tip&nbsp;</strong>
              <span dangerouslySetInnerHTML={{ __html: boldify(block.text) }} />
            </div>
          );
        }
        if (block.type === 'code') {
          return (
            <pre
              key={i}
              style={{
                margin: 0,
                background: '#2b2320',
                color: '#f5ece6',
                borderRadius: '10px',
                padding: '14px 16px',
                overflowX: 'auto',
                fontSize: '0.82rem',
                lineHeight: 1.55,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'
              }}
            >
              <code>{block.text}</code>
            </pre>
          );
        }
        return (
          <p
            key={i}
            style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.7 }}
            dangerouslySetInnerHTML={{ __html: boldify(block.text) }}
          />
        );
      })}
    </div>
  );
});
MentorMessageContent.displayName = 'MentorMessageContent';

// Formats an ISO timestamp into a small "10:42 AM" style label for chat bubbles.
const formatTime = (iso?: string) => {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
};

// =============================================================================
// CHAT BUBBLE
// Extracted + memoized so re-renders triggered elsewhere on the page (typing
// indicator, input changes) don't re-parse and re-render the full message list.
// =============================================================================
const ChatBubble: React.FC<{ msg: MentorMessage; index: number }> = memo(({ msg, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.28, ease: 'easeOut' }}
    style={{ display: 'flex', flexDirection: 'column', alignItems: msg.isAi ? 'flex-start' : 'flex-end' }}
  >
    {msg.isAi ? (
      <div style={{
        backgroundColor: '#fff',
        color: 'var(--color-text)',
        padding: '18px 22px',
        borderRadius: '16px',
        borderBottomLeftRadius: '4px',
        maxWidth: '92%',
        width: '100%',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid rgba(61,44,46,0.06)'
      }}>
        <MentorMessageContent text={msg.text} />
      </div>
    ) : (
      <div style={{
        backgroundColor: 'var(--color-primary)',
        color: 'white',
        padding: '14px 20px',
        borderRadius: '16px',
        borderBottomRightRadius: 0,
        maxWidth: '75%',
        fontSize: '0.95rem',
        lineHeight: 1.65,
        boxShadow: 'var(--shadow-sm)'
      }}>
        {msg.text}
      </div>
    )}
    <span style={{
      fontSize: '0.68rem',
      color: 'var(--color-text-light)',
      marginTop: 5,
      padding: '0 4px'
    }}>
      {formatTime(msg.timestamp)}
    </span>
  </motion.div>
));
ChatBubble.displayName = 'ChatBubble';

// =============================================================================
// QUICK ACTION DEFINITIONS
// =============================================================================

interface QuickAction {
  label: string;
  icon: React.ReactNode;
  prompt: (targetRole: string) => string;
}

const CHAT_QUICK_ACTIONS: QuickAction[] = [
  { label: 'Review my readiness', icon: <TrendingUp size={13} />, prompt: () => 'Review my current readiness scores and tell me exactly what is holding each one back.' },
  { label: 'Find skill gaps', icon: <Search size={13} />, prompt: () => 'Find and prioritize my current skill gaps based on my Career Twin.' },
  { label: 'Generate project', icon: <FolderGit2 size={13} />, prompt: (r) => `Generate a portfolio project idea that closes my biggest skill gap for a ${r} role.` },
  { label: 'Mock interview', icon: <Mic size={13} />, prompt: (r) => `Run a mock interview with me for a ${r} role, one question at a time.` },
  { label: 'Explain system design', icon: <Compass size={13} />, prompt: () => 'Explain system design to me and why it matters for my specific career goal.' },
  { label: 'Review my resume', icon: <FileText size={13} />, prompt: () => 'Review my resume against my target role and tell me what to fix first.' }
];

const SIDEBAR_QUICK_ACTIONS: QuickAction[] = [
  { label: 'Generate Learning Plan', icon: <MapIcon size={16} color="var(--color-primary)" />, prompt: (r) => `Generate a structured learning plan tailored to my goal of becoming a ${r}.` },
  { label: 'Find Skill Gaps', icon: <Search size={16} color="var(--color-primary)" />, prompt: () => 'Find and prioritize my current skill gaps based on my Career Twin.' },
  { label: 'Review Resume', icon: <FileText size={16} color="var(--color-primary)" />, prompt: () => 'Review my resume and tell me what to improve for my target role.' },
  { label: 'Prepare Interview', icon: <MessageSquare size={16} color="var(--color-primary)" />, prompt: (r) => `Help me prepare for interviews for a ${r} role based on my current gaps.` },
  { label: 'Career Roadmap', icon: <Compass size={16} color="var(--color-primary)" />, prompt: (r) => `Give me a complete long-term roadmap to become a ${r}.` },
  { label: 'Mock Interview', icon: <Mic size={16} color="var(--color-primary)" />, prompt: (r) => `Run a mock interview with me for a ${r} role.` }
];

const GAIN_BY_DIFFICULTY: Record<WeeklyMission['difficulty'], number> = {
  Beginner: 2,
  Intermediate: 3,
  Advanced: 5
};

// Small hover-lift wrapper used around sidebar cards for a more "premium"
// tactile feel. Purely presentational — no effect on data or click handlers.
const Lift: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.18, ease: 'easeOut' }}>
    {children}
  </motion.div>
);

const AIMentor: React.FC = () => {
  const { memory, updateMemory } = useCareerAgent();
  const navigate = useNavigate();

  const userName = memory.profile?.name || 'Guest';
  const targetRole = memory.targetRole || 'Software Engineer';
  const firstName = userName.split(' ')[0];

  const isAnalyzed = memory.isAnalyzed && !!memory.analysis;

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize greeting if chatHistory is empty
  const defaultGreeting: MentorMessage = useMemo(() => (
    isAnalyzed
      ? { text: `Hi ${firstName}. I'm tracking your Career Twin, GitHub analysis, and target role (${targetRole}). Ask me anything about your journey — every answer is built from your actual profile.`, isAi: true, timestamp: new Date().toISOString() }
      : { text: "I need more context before I can provide personalized guidance. Generate your Career Twin to unlock AI mentoring.", isAi: true, timestamp: new Date().toISOString() }
  ), [isAnalyzed, firstName, targetRole]);

  const messages = memory.mentorContext.chatHistory.length > 0
    ? memory.mentorContext.chatHistory
    : [defaultGreeting];

  const hasRealConversation = memory.mentorContext.chatHistory.length > 0;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length, isTyping]);

  // Build the personalization context sent with every mentor request so the
  // backend never falls back to a generic answer. (Unchanged contract.)
 const buildMentorContext = useCallback(() => ({
    targetRole,
    readiness: memory.analysis?.readiness ?? null,
    careerReadiness: memory.analysis?.careerReadiness ?? null,
    internshipReadiness: memory.analysis?.internshipReadiness ?? null,
    jobReadiness: memory.analysis?.jobReadiness ?? null,
    strengths: memory.analysis?.strengths ?? [],
    gaps: memory.analysis?.gaps ?? [],
    currentSkills: memory.analysis?.currentSkills ?? [],
    futureSkills: memory.analysis?.futureSkills ?? [],
    insights: memory.analysis?.insights ?? [],
    githubUsername: memory.githubUsername || null,
    linkedinUrl: memory.linkedinUrl || null,
    hasResume: memory.hasResume,
    isTwinGenerated: memory.isTwinGenerated,
    activeMissions: memory.weeklyMissions.map(m => ({ text: m.text, skill: m.skill, completed: m.completed })),
    careerTimelineMonths: memory.preferences.careerTimelineMonths,
 
    // ── Career Missions live state (updated) ──────────────────────────────
    // activeMissionId is now the CareerMission id (e.g. "mission_1_cloud")
    // We expose the id + checklist state so the mentor can say "you still
    // need to: Deploy to CloudFront, Add live URL to README"
    activeMissionId: memory.missionProgress?.activeMissionId ?? null,
    activeMissionStartedAt: memory.missionProgress?.startedAt ?? null,
 
    completedChecklistItems: (memory.missionProgress?.checklist ?? [])
      .filter(c => c.done).map(c => c.label),
    pendingChecklistItems: (memory.missionProgress?.checklist ?? [])
      .filter(c => !c.done).map(c => c.label),
 
    completedMissionIds: memory.missionProgress?.completedMissionIds ?? [],
    completedMissionCount: (memory.missionProgress?.completedMissionIds ?? []).length,
    missionXP: memory.missionProgress?.xp ?? 0,
    missionStreak: memory.missionProgress?.streak ?? 0,
    missionCareerScore: memory.missionProgress?.careerScore ?? 0,
    missionAchievement: memory.missionProgress?.achievement ?? 'Just Getting Started',
  }), [memory, targetRole]);

  const handleSend = useCallback(async (text: string) => {
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
        body: JSON.stringify({ prompt: text, context: buildMentorContext() })
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
  }, [defaultGreeting, buildMentorContext, updateMemory]);

  const gap = memory.analysis?.gaps?.[0];
  const recommendedProject = useMemo(() => (
    gap ? {
      title: `${gap} Integration Dashboard`,
      desc: `Build a real-world integration focusing on ${gap} design patterns.`,
      prompt: `Tell me how to start a project building an ${gap} Integration Dashboard.`
    } : null
  ), [gap]);

  const readiness = memory.analysis?.readiness ?? 0;

  const statusLine = isAnalyzed
    ? 'Using your Career Twin, Resume and GitHub analysis.'
    : 'Generate your Career Twin to unlock personalized mentoring.';

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
      {/* ===================================================================
          COMPACT CAREER COPILOT HEADER (~130px)
          =================================================================== */}
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        style={{
          marginBottom: 'var(--space-6)',
          padding: '20px 26px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg,#fff,#fdf7f4)',
          border: '1px solid rgba(201,106,74,0.08)',
          minHeight: 120,
          maxHeight: 150,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 10
        }}
      >
        <div className="copilot-header-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'rgba(201,106,74,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }}>
              <Sparkles size={20} color="var(--color-primary)" />
            </div>
            <div style={{ minWidth: 0 }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Career Copilot</h1>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-light)', margin: 0 }}>
                Your personalized AI career mentor
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '.68rem', color: 'var(--color-text-light)', fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase' }}>
                Target Role
              </div>
              <div style={{ fontSize: '.95rem', fontWeight: 700 }}>{targetRole}</div>
            </div>
            <div>
              <div style={{ fontSize: '.68rem', color: 'var(--color-text-light)', fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase' }}>
                Readiness
              </div>
              <div style={{ fontSize: '.95rem', fontWeight: 800, color: 'var(--color-primary)' }}>{readiness}%</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '.78rem', color: 'var(--color-text-light)' }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: isAnalyzed ? '#3FAE6A' : '#C9C0BA',
            display: 'inline-block', flexShrink: 0
          }} />
          {statusLine}
        </div>
      </motion.header>

      <div className="mentor-grid" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 'var(--space-6)', alignItems: 'start' }}>

        {/* Left Pane: Insights & Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', overflowY: 'visible', paddingRight: 'var(--space-2)' }}>

          <Lift>
            <Card
              style={{
                padding: '24px',
                background: '#fff',
                border: '1px solid rgba(201,106,74,.08)',
                borderRadius: '18px',
                boxShadow: '0 4px 16px rgba(61,44,46,0.04)',
                transition: 'box-shadow .2s ease'
              }}
            >
              <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-3)', fontWeight: 700 }}>
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
                      marginBottom: '4px',
                      background: '#FAF8F6',
                      borderRadius: '12px',
                      borderLeft: '4px solid var(--color-primary)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                      transition: 'transform .15s ease, box-shadow .15s ease'
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
          </Lift>

          <Lift>
            <Card style={{ padding: 'var(--space-4)', boxShadow: '0 4px 16px rgba(61,44,46,0.04)', transition: 'box-shadow .2s ease' }}>
              <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-3)', fontWeight: 700 }}>
                {isAnalyzed ? <FolderGit2 size={18} color="var(--color-primary)" /> : <Lock size={18} color="var(--color-primary)" />}
                Recommended Projects
              </h3>
              {isAnalyzed && recommendedProject ? (
                <div style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>
                  <strong style={{ color: 'var(--color-text)' }}>{recommendedProject.title}</strong><br />
                  {recommendedProject.desc}
                  <Button size="sm" variant="outline" style={{ marginTop: 10, width: '100%' }} onClick={() => handleSend(recommendedProject.prompt)}>Ask Mentor</Button>
                </div>
              ) : (
                <div style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>
                  {isAnalyzed ? "No recommended projects at this time." : "Profile data required."}
                </div>
              )}
            </Card>
          </Lift>

          <Lift>
            <Card style={{ padding: 'var(--space-4)', boxShadow: '0 4px 16px rgba(61,44,46,0.04)', transition: 'box-shadow .2s ease' }}>
              <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-3)', fontWeight: 700 }}>
                {isAnalyzed ? <Zap size={18} color="var(--color-primary)" /> : <Lock size={18} color="var(--color-primary)" />}
                Quick Actions
              </h3>
              {isAnalyzed ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {SIDEBAR_QUICK_ACTIONS.map(action => (
                    <motion.button
                      key={action.label}
                      onClick={() => handleSend(action.prompt(targetRole))}
                      whileHover={{ x: 4, backgroundColor: '#FFF5F1' }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      style={{
                        textAlign: 'left',
                        fontSize: '0.88rem',
                        padding: '12px 14px',
                        borderRadius: '12px',
                        background: '#FAF8F6',
                        color: 'var(--color-text)',
                        border: '1px solid rgba(201,106,74,.08)',
                        cursor: 'pointer',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10
                      }}
                    >
                      {action.icon}
                      {action.label}
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>
                  Complete analysis to unlock quick actions.
                </div>
              )}
            </Card>
          </Lift>
        </div>

        {/* Right Pane: Career Copilot Chat */}
        <Card glass className="mentor-chat-card" style={{ display: 'flex', flexDirection: 'column', padding: 0, minHeight: '700px' }}>

          {/* Copilot chat header */}
          <div style={{ padding: '18px var(--space-6) 6px', borderBottom: '1px solid var(--color-glass-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={17} color="var(--color-primary)" />
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>Career Copilot</h2>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-light)', margin: '5px 0 14px', lineHeight: 1.5 }}>
              I understand your profile, GitHub analysis and Career Twin. Ask me anything about your journey.
            </p>

            {isAnalyzed && (
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 12 }}>
                {CHAT_QUICK_ACTIONS.map(action => (
                  <motion.button
                    key={action.label}
                    onClick={() => handleSend(action.prompt(targetRole))}
                    whileHover={{ y: -2, backgroundColor: '#FFF5F1' }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-xl)',
                      background: '#FAF8F6',
                      color: 'var(--color-text)',
                      border: '1px solid rgba(201,106,74,.12)',
                      cursor: 'pointer'
                    }}
                  >
                    {action.icon}
                    {action.label}
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          <div
            ref={scrollRef}
            style={{
              flex: 1,
              padding: 'var(--space-6)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-5)',
              maxHeight: '560px',
              overflowY: 'auto'
            }}
          >
            {isAnalyzed && !hasRealConversation ? (
              // Empty state: nothing sent yet on an analyzed profile.
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  alignSelf: 'center',
                  textAlign: 'center',
                  maxWidth: 420,
                  margin: '24px auto',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: 'rgba(201,106,74,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 6
                }}>
                  <Sparkles size={22} color="var(--color-primary)" />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>
                  Hi! I'm your Career Copilot.
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--color-text-light)', margin: 0, lineHeight: 1.6 }}>
                  I understand your Resume, GitHub, Career Twin and readiness score. Ask me anything about your {targetRole} journey.
                </p>
              </motion.div>
            ) : (
              messages.map((msg, i) => (
                <ChatBubble key={`${msg.timestamp}-${i}`} msg={msg} index={i} />
              ))
            )}

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
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ alignSelf: 'flex-start', padding: '16px 24px', borderRadius: '16px', borderBottomLeftRadius: 4, backgroundColor: '#fff', border: '1px solid rgba(61,44,46,0.06)' }}
              >
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center', height: '24px' }}>
                  <div style={dotStyle(0)}></div><div style={dotStyle(0.2)}></div><div style={dotStyle(0.4)}></div>
                </div>
              </motion.div>
            )}
          </div>

          <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-background)', borderTop: '1px solid var(--color-glass-border)' }}>
            <form onSubmit={(e) => { e.preventDefault(); handleSend(input); }} style={{ display: 'flex', gap: 'var(--space-3)', position: 'relative' }}>
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                placeholder={
                  !isAnalyzed
                    ? "🔒 Chat locked. Complete your profile analysis to talk to your AI Mentor."
                    : isTyping
                      ? "Career Copilot is thinking..."
                      : "Ask your Career Copilot anything..."
                }
                disabled={!isAnalyzed || isTyping}
                style={{
                  flex: 1,
                  padding: '17px 26px',
                  fontSize: '1rem',
                  borderRadius: 'var(--radius-xl)',
                  border: inputFocused ? '1px solid var(--color-primary)' : '1px solid rgba(61,44,46,0.1)',
                  outline: 'none',
                  backgroundColor: (!isAnalyzed || isTyping) ? 'rgba(61,44,46,0.03)' : '#fff',
                  boxShadow: inputFocused ? '0 0 0 3px rgba(201,106,74,0.14)' : 'var(--shadow-sm)',
                  transition: 'box-shadow .18s ease, border-color .18s ease'
                }}
              />
              <Button type="submit" disabled={!isAnalyzed || isTyping || !input.trim()} style={{ position: 'absolute', right: 8, top: 8, bottom: 8, padding: '0 20px', borderRadius: 'var(--radius-xl)' }}>
                <Send size={18} />
              </Button>
            </form>
            {isAnalyzed && (
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-light)', marginTop: 8, paddingLeft: 4 }}>
                Press <strong>Enter</strong> to send
              </div>
            )}
          </div>
        </Card>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        @media (max-width: 900px) {
          .mentor-grid {
            grid-template-columns: 1fr !important;
          }
          .copilot-header-row {
            flex-direction: column;
            align-items: flex-start !important;
          }
        }

        @media (max-width: 600px) {
          .mentor-chat-card {
            min-height: 480px !important;
          }
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

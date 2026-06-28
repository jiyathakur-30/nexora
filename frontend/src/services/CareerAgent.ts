import { useState, useEffect } from 'react';

export interface UserProfile {
  name: string;
  email: string;
}

export interface SkillMilestone {
  threshold: number;
  label: string;
}

// AnalysisResults — add the two new fields
export interface AnalysisResults {
  readiness: number;
  careerReadiness?: number;       // ← new (same value as readiness, explicit alias)
  internshipReadiness?: number;   // ← new
  jobReadiness?: number;          // ← new
  strengths: string[];
  gaps: string[];
  currentSkills: string[];
  futureSkills: string[];
  alignmentScore: number;
  milestones: SkillMilestone[];
  techPulse: {
    now: string[];
    later: string[];
    ignore: string[];
  };
  roadmap: { label: string; value: string; color: string }[];
  insights: string[];
}

export interface ActivityLog {
  id: string;
  label: string;
  timestamp: string;
}

export interface OpportunityMatch {
  id: string;
  category: 'internships' | 'hackathons' | 'competitions' | 'opensource' | 'mentorships';
  title: string;
  host: string;
  matchScore: number;
  why: string[];
  status: 'open' | 'applied' | 'closed';
}

export interface MentorMessage {
  text: string;
  isAi: boolean;
  timestamp: string;
}

export interface MentorContext {
  chatHistory: MentorMessage[];
  lastInteraction?: string;
}

export interface WeeklyMission {
  id: string;
  text: string;
  completed: boolean;
  why: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  skill: string;
  category: 'Learning' | 'Project' | 'Internship' | 'Networking' | 'Certification' | 'Interview Preparation';
  source: 'AI Generated' | 'User Created' | 'User Edited';
  createdAt: string;
  completedAt?: string;
  evidence?: {
    type: 'GitHub' | 'Kaggle' | 'Portfolio' | 'Certificate' | 'Other';
    url: string;
  };
  feedback?: 'Easy' | 'Appropriate' | 'Difficult';
  pinned?: boolean;
  replacedWhy?: string;
}

export interface AgentPreferences {
  notificationFrequency: 'daily' | 'weekly' | 'realtime';
  adviceLevel: 'proactive' | 'reactive' | 'silent';
  learningIntensity: 'low' | 'medium' | 'high';
  careerTimelineMonths: number;
}

// ─── Mission Progress ──────────────────────────────────────────────────────────
// Persisted inside NexoraAgentMemory so Dashboard, AIMentor, CareerTwin, and
// CareerMissions all share the same state without a separate context.
export interface MissionChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

export interface MissionProgress {
  /** ID of the WeeklyMission currently active on the Career Missions page */
  activeMissionId: string | null;
  /** ISO timestamp when the user clicked Start Mission */
  startedAt: string | null;
  /** Per-task checklist for the active mission */
  checklist: MissionChecklistItem[];
  /** IDs of all WeeklyMissions that have been fully checked off */
  completedMissionIds: string[];
  /** Accumulated XP from mission completions */
  xp: number;
  /** Career Score — starts from analysis.readiness and grows with completions */
  careerScore: number;
  /** Current daily streak (days in a row with at least one completed mission) */
  streak: number;
  /** Achievement tier label derived from XP */
  achievement: string;
  /** Count of completed Project-category missions */
  portfolioProjects: number;
  /** 7-element boolean array (Mon–Sun), true = mission completed that day */
  weeklyActivity: boolean[];
  /** ISO date of last activity, used to detect streak breaks */
  lastActivityDate: string | null;
}

export interface NexoraAgentMemory {
  version: number;
  createdAt: string;
  updatedAt: string;
  lastAnalysisAt?: string;

  // Profile & Role
  profile: UserProfile | null;
  targetRole: string;

  // Connections (Separated explicitly)
  hasResume: boolean;
  resumeFileName: string;
  githubUsername: string;
  linkedinUrl: string;

  // Statuses (Never inferred)
  isAnalyzed: boolean;
  isTwinGenerated: boolean;

  // Core Data
  analysis: AnalysisResults | null;
  weeklyMissions: WeeklyMission[];
  suggestedMissions: WeeklyMission[];
  missionHistory: WeeklyMission[];
  activities: ActivityLog[];
  opportunities: OpportunityMatch[];
  mentorContext: MentorContext;

  // Career Missions page state — shared across Dashboard, AIMentor, CareerTwin
  missionProgress: MissionProgress;

  // Preferences
  preferences: AgentPreferences;
}

const STORAGE_KEY = 'nexora_agent_memory';
const UPDATE_EVENT = 'nexora_agent_update';

export const createDefaultMemory = (): NexoraAgentMemory => {
  const isAnalyzedLegacy = localStorage.getItem('nexora_is_analyzed') === 'true';
  const userName = localStorage.getItem('nexora_user_name') || 'Guest';
  const userEmail = localStorage.getItem('nexora_user_email') || 'you@example.com';
  const userRole = localStorage.getItem('nexora_user_role') || 'Software Engineer';
  const now = new Date().toISOString();

  return {
    version: 1,
    createdAt: now,
    updatedAt: now,
    profile: { name: userName, email: userEmail },
    targetRole: userRole,
    hasResume: isAnalyzedLegacy,
    resumeFileName: isAnalyzedLegacy ? 'resume.pdf' : '',
    githubUsername: '',
    linkedinUrl: '',
    isAnalyzed: isAnalyzedLegacy,
    isTwinGenerated: isAnalyzedLegacy,
    analysis: null,
    weeklyMissions: [],
    suggestedMissions: [],
    missionHistory: [],
    activities: [
      { id: Math.random().toString(36).substr(2, 9), label: 'Profile Registered', timestamp: now }
    ],
    opportunities: [],
    mentorContext: {
      chatHistory: []
    },
    missionProgress: {
      activeMissionId: null,
      startedAt: null,
      checklist: [],
      completedMissionIds: [],
      xp: 0,
      careerScore: 0,
      streak: 0,
      achievement: 'Just Getting Started',
      portfolioProjects: 0,
      weeklyActivity: [false, false, false, false, false, false, false],
      lastActivityDate: null,
    },
    preferences: {
      notificationFrequency: 'daily',
      adviceLevel: 'proactive',
      learningIntensity: 'medium',
      careerTimelineMonths: 12
    }
  };
};

export const getAgentMemory = (): NexoraAgentMemory => {
  const memStr = localStorage.getItem(STORAGE_KEY);
  if (memStr) {
    try {
      const parsed = JSON.parse(memStr);
      
      // Resilient migration of new fields on legacy parsed data
      if (parsed) {
        if (!parsed.weeklyMissions) {
          parsed.weeklyMissions = [];
        } else {
          parsed.weeklyMissions = parsed.weeklyMissions.map((m: any) => ({
            ...m,
            id: String(m.id),
            why: m.why || 'Assigned to close critical gaps.',
            difficulty: m.difficulty || 'Beginner',
            skill: m.skill || 'General',
            category: m.category || 'Learning',
            source: m.source || 'AI Generated',
            createdAt: m.createdAt || new Date().toISOString()
          }));
        }
        if (!parsed.resumeFileName) {
          parsed.resumeFileName = parsed.hasResume ? 'resume.pdf' : '';
        }
        if (!parsed.suggestedMissions) parsed.suggestedMissions = [];
        if (!parsed.missionHistory) parsed.missionHistory = [];
        if (!parsed.activities) parsed.activities = [];
        // Migration: add missionProgress if missing (existing users upgrading)
        if (!parsed.missionProgress) {
          parsed.missionProgress = {
            activeMissionId: null,
            startedAt: null,
            checklist: [],
            completedMissionIds: [],
            xp: 0,
            careerScore: parsed.analysis?.readiness ?? 0,
            streak: 0,
            achievement: 'Just Getting Started',
            portfolioProjects: 0,
            weeklyActivity: [false, false, false, false, false, false, false],
            lastActivityDate: null,
          };
        }
      }

      // Verify schema version, run migration if version matches legacy or old schema
      if (!parsed.version) {
        const migrated = createDefaultMemory();
        migrated.hasResume = parsed.hasResume || false;
        migrated.resumeFileName = parsed.resumeFileName || (parsed.hasResume ? 'resume.pdf' : '');
        migrated.githubUsername = parsed.githubUsername || '';
        migrated.linkedinUrl = parsed.linkedinUrl || '';
        migrated.isAnalyzed = parsed.isAnalyzed || false;
        migrated.isTwinGenerated = parsed.isAnalyzed || false;
        migrated.weeklyMissions = parsed.weeklyMissions || [];
        migrated.suggestedMissions = parsed.suggestedMissions || [];
        migrated.missionHistory = parsed.missionHistory || [];
        migrated.activities = parsed.activities || migrated.activities;
        
        // Handle analysis transition
        const legacyAnalysis = parsed.analysis || parsed.analysisData;
        if (legacyAnalysis) {
          migrated.analysis = legacyAnalysis;
        }

        saveAgentMemory(migrated);
        return migrated;
      }
      return parsed;
    } catch (e) {
      console.error('Failed to parse nexora_agent_memory, resetting...', e);
    }
  }

  const defaultMem = createDefaultMemory();
  saveAgentMemory(defaultMem);
  return defaultMem;
};

export const saveAgentMemory = (memory: NexoraAgentMemory): void => {
  const updated = {
    ...memory,
    updatedAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  
  // Bind debug utility to window object
  if (typeof window !== 'undefined') {
    (window as any).__NEXORA_AGENT_MEMORY__ = updated;
    window.dispatchEvent(new CustomEvent(UPDATE_EVENT, { detail: updated }));
  }
};

// Custom Hook for pages to consume reactive agent updates
export const useCareerAgent = () => {
  const [memory, setMemory] = useState<NexoraAgentMemory>(() => getAgentMemory());

  useEffect(() => {
    // Sync the current state to the window debug utility
    if (typeof window !== 'undefined') {
      (window as any).__NEXORA_AGENT_MEMORY__ = memory;
    }

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<NexoraAgentMemory>;
      setMemory(customEvent.detail);
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setMemory(getAgentMemory());
      }
    };

    window.addEventListener(UPDATE_EVENT, handleUpdate);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener(UPDATE_EVENT, handleUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [memory]);

  const updateMemory = (updater: (prev: NexoraAgentMemory) => NexoraAgentMemory) => {
    const prev = getAgentMemory();
    const next = updater(prev);
    saveAgentMemory(next);
  };

  const addActivity = (label: string) => {
    updateMemory(prev => ({
      ...prev,
      activities: [
        ...prev.activities,
        { id: Math.random().toString(36).substr(2, 9), label, timestamp: new Date().toISOString() }
      ]
    }));
  };

  const connectResume = () => {
    updateMemory(prev => {
      const next = { ...prev, hasResume: true };
      const nextActivities = [
        ...next.activities,
        { id: Math.random().toString(36).substr(2, 9), label: 'Resume Connected', timestamp: new Date().toISOString() }
      ];
      return { ...next, activities: nextActivities };
    });
  };

  const connectGithub = (username: string) => {
    updateMemory(prev => {
      const next = { ...prev, githubUsername: username.trim() };
      const nextActivities = [
        ...next.activities,
        { id: Math.random().toString(36).substr(2, 9), label: `GitHub Connected: ${username.trim()}`, timestamp: new Date().toISOString() }
      ];
      return { ...next, activities: nextActivities };
    });
  };

  const connectLinkedin = (url: string) => {
    updateMemory(prev => {
      const next = { ...prev, linkedinUrl: url.trim() };
      const nextActivities = [
        ...next.activities,
        { id: Math.random().toString(36).substr(2, 9), label: 'LinkedIn Profile Connected', timestamp: new Date().toISOString() }
      ];
      return { ...next, activities: nextActivities };
    });
  };

  const setTwinGenerated = (status: boolean) => {
    updateMemory(prev => ({
      ...prev,
      isTwinGenerated: status,
      activities: [
        ...prev.activities,
        { id: Math.random().toString(36).substr(2, 9), label: status ? 'Career Twin Generated' : 'Career Twin Reset', timestamp: new Date().toISOString() }
      ]
    }));
  };

  const resetAgentMemory = () => {
    const fresh = createDefaultMemory();
    saveAgentMemory(fresh);
  };

  return {
    memory,
    updateMemory,
    addActivity,
    connectResume,
    connectGithub,
    connectLinkedin,
    setTwinGenerated,
    resetAgentMemory
  };
};

// =============================================================================
// ANALYSIS NORMALIZER
// Shared utility that maps Gemini API response fields to the frontend's
// expected AnalysisResults shape. Exported here so Dashboard.tsx,
// CareerTwin.tsx, and Settings.tsx can all import from one place.
//
// Gemini returns:  { readiness, strengths, missingSkills, recommendations }
// Frontend needs:  { readiness, alignmentScore, strengths, gaps, insights,
//                    currentSkills, futureSkills, techPulse, roadmap, milestones }
//
// Fields not returned by Gemini are synthesized from strengths/gaps so the UI
// never renders empty sections.
// =============================================================================
// normalizeAnalysis — wire the three scores
export function normalizeAnalysis(raw: any, targetRole: string): AnalysisResults {
  const gaps: string[]      = raw.gaps || raw.missingSkills || [];
  const insights: string[]  = raw.insights || raw.recommendations || [];
  const strengths: string[] = raw.strengths || [];

  // Prefer the explicit careerReadiness field; fall back to legacy readiness
  const careerReadiness: number     = raw.careerReadiness ?? raw.readiness ?? raw.alignmentScore ?? 0;
  const internshipReadiness: number = raw.internshipReadiness ?? careerReadiness;
  const jobReadiness: number        = raw.jobReadiness ?? careerReadiness;

  return {
    readiness: careerReadiness,
    careerReadiness,
    internshipReadiness,
    jobReadiness,
    alignmentScore: careerReadiness,
    strengths,
    gaps,
    currentSkills:  raw.currentSkills || strengths,
    futureSkills:   raw.futureSkills  || gaps.slice(0, 3),
    insights,
    milestones: raw.milestones || [
      { threshold: 80,  label: 'Intern Ready'   },
      { threshold: 90,  label: 'Industry Ready' },
      { threshold: 100, label: 'Dream Role'     },
    ],
    techPulse: raw.techPulse || {
      now:    strengths.slice(0, 3),
      later:  gaps.slice(0, 3),
      ignore: [],
    },
    roadmap: raw.roadmap || [
      { label: 'Current Stage',     value: targetRole,               color: 'var(--color-primary)' },
      { label: 'Next Milestone',    value: gaps[0] || 'Core Skills', color: 'var(--color-warning)' },
      { label: 'Next Career Stage', value: `Senior ${targetRole}`,   color: 'var(--color-success)' },
      { label: 'Long-Term Goal',    value: `Lead ${targetRole}`,     color: 'var(--color-success)' },
    ],
  };
}
import { useState, useEffect } from 'react';

export interface UserProfile {
  name: string;
  email: string;
}

export interface SkillMilestone {
  threshold: number;
  label: string;
}

export interface AnalysisResults {
  readiness: number;
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

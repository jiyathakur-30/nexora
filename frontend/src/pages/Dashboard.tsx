import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Code, Briefcase, FileText, Check, Map, Lightbulb, Edit2, Trash2, Plus, RefreshCw, Pin, ExternalLink, CheckCircle, X, HelpCircle, Award } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useCareerAgent } from '../services/CareerAgent';
import type { WeeklyMission } from '../services/CareerAgent';
import { generateMissions, checkMissionRelevance, regenerateSingleMission, generateId } from '../services/MissionGenerator';
import { normalizeAnalysis } from '../services/CareerAgent';
import { 
  DashboardHeader, 
  KPISection, 
  CareerRoadmap, 
  AICoachCard, 
  ResumeInsights, 
  SkillsSummary 
} from '../components/dashboard/DashboardComponents';

const Dashboard: React.FC = () => {
  const {
    memory,
    updateMemory
  } = useCareerAgent();
  const navigate = useNavigate();

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisText, setAnalysisText] = useState('');
  const [progress, setProgress] = useState(0);

  // Custom Mission System States
  const [editingMission, setEditingMission] = useState<WeeklyMission | null>(null);
  const [editText, setEditText] = useState('');
  
  const [completingMission, setCompletingMission] = useState<WeeklyMission | null>(null);
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [evidenceType, setEvidenceType] = useState<'GitHub' | 'Kaggle' | 'Portfolio' | 'Certificate' | 'Other'>('GitHub');
  const [feedbackVal, setFeedbackVal] = useState<'Easy' | 'Appropriate' | 'Difficult'>('Appropriate');
  
  const [isCreatingMission, setIsCreatingMission] = useState(false);
  const [customText, setCustomText] = useState('');
  const [customCategory, setCustomCategory] = useState<WeeklyMission['category']>('Learning');
  const [customDifficulty, setCustomDifficulty] = useState<WeeklyMission['difficulty']>('Beginner');
  const [customSkill, setCustomSkill] = useState('Custom');

  const [skippingMission, setSkippingMission] = useState<WeeklyMission | null>(null);
  const [skipReason, setSkipReason] = useState('Too beginner level');
  const [isConfirmSkipModalOpen, setIsConfirmSkipModalOpen] = useState(false);

  const userName = memory.profile?.name || 'Guest';
  const targetRole = memory.targetRole || 'Software Engineer';
  const firstName = userName.split(' ')[0];

  // Inputs for onboarding card
  const [github, setGithub] = useState(memory.githubUsername || '');
  const [linkedin, setLinkedin] = useState(memory.linkedinUrl || '');
  const [resumeUploaded, setResumeUploaded] = useState(memory.hasResume);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keep local connection state in sync when memory updates (e.g. after resume upload)
  useEffect(() => {
    setResumeUploaded(memory.hasResume);
    setGithub(prev => prev || memory.githubUsername || '');
    setLinkedin(prev => prev || memory.linkedinUrl || '');
  }, [memory.hasResume, memory.githubUsername, memory.linkedinUrl]);

  // Inputs for inline connection in empty state cards
  const [githubInput, setGithubInput] = useState('');
  const [linkedinInput, setLinkedinInput] = useState('');

  const analysisSteps = [
    'Initializing AI Core...',
    'Analyzing Resume Constraints...',
    'Scanning GitHub Repositories...',
    'Mapping Professional Network...',
    'Building Career Twin Architecture...',
    'Predicting Future Growth Trajectories...',
    'Generating Recommendations...'
  ];

  const analysis = memory.isAnalyzed ? memory.analysis : null;
  const resumeConnected = memory.hasResume;
  const githubConnected = !!memory.githubUsername;
  const linkedinConnected = !!memory.linkedinUrl;
  const analysisGenerated = !!analysis;

  console.log("Agent Memory", memory);
  console.log("Analysis", memory.analysis);
  console.log("=== Nexora Dashboard Memory Debug ===");
  console.log("resumeConnected:", resumeConnected);
  console.log("githubConnected:", githubConnected);
  console.log("linkedinConnected:", linkedinConnected);
  console.log("analysisGenerated:", analysisGenerated);
  console.log("agentMemory contents:", memory);
  console.log("=====================================");

  const dynamicProfile = analysis ? {
  ...analysis,
  readiness: analysis.readiness ?? analysis.alignmentScore ?? 0,
  strengths: analysis.strengths || [],
  gaps: analysis.gaps ||  [],
  currentSkills: analysis.currentSkills || analysis.strengths || [],
  futureSkills: analysis.futureSkills || analysis.gaps || [],
} : null;

  // Background fetch to heal memory if data is missing but analysis is complete
  // useEffect(() => {
  //   if (memory.isAnalyzed && !memory.analysis) {
  //     fetch('http://localhost:5000/api/analyze', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({
  //         targetRole: memory.targetRole,
  //         resumeFileName: memory.resumeFileName,
  //         preferences: memory.preferences
  //       })
  //     })
  //       .then(res => res.json())
  //       .then(data => {
  //         updateMemory(prev => {
  //           const tempMem = { ...prev, analysis: data };
  //           const active = (prev.weeklyMissions && prev.weeklyMissions.length > 0)
  //             ? prev.weeklyMissions
  //             : generateMissions(tempMem, 3);
  //           const suggestions = (prev.suggestedMissions && prev.suggestedMissions.length > 0)
  //             ? prev.suggestedMissions
  //             : generateMissions({ ...tempMem, weeklyMissions: active }, 5);
  //           return {
  //             ...tempMem,
  //             weeklyMissions: active,
  //             suggestedMissions: suggestions
  //           };
  //         });
  //       })
  //       .catch(err => console.error(err));
  //   }
  // }, [memory.isAnalyzed, memory.analysis]);

  // Profile / Role change relevance check
  const prevRoleRef = useRef(memory.targetRole);
  useEffect(() => {
    if (memory.isAnalyzed && prevRoleRef.current !== memory.targetRole) {
      prevRoleRef.current = memory.targetRole;
      const { active, suggestions, log } = checkMissionRelevance(memory);
      
      if (log.length > 0) {
        updateMemory(prev => {
          const removed = prev.weeklyMissions.filter(m => !active.find(a => a.id === m.id) && !m.pinned);
          const archivedHistory = [...(prev.missionHistory || [])];
          removed.forEach(m => {
            archivedHistory.push({
              ...m,
              completed: false,
              completedAt: new Date().toISOString(),
              why: `Archived automatically because target role changed to ${memory.targetRole}.`
            });
          });
          
          const tempMem = {
            ...prev,
            weeklyMissions: active,
            suggestedMissions: suggestions,
            missionHistory: archivedHistory
          };

          const missingActiveCount = Math.max(0, 3 - active.length);
          const newActive = missingActiveCount > 0 ? generateMissions(tempMem, missingActiveCount) : [];
          const updatedActive = [...active, ...newActive];
          
          const missingSuggestionsCount = Math.max(0, 5 - suggestions.length);
          const newSuggestions = missingSuggestionsCount > 0 ? generateMissions({ ...tempMem, weeklyMissions: updatedActive }, missingSuggestionsCount) : [];
          const updatedSuggestions = [...suggestions, ...newSuggestions];

          return {
            ...tempMem,
            weeklyMissions: updatedActive,
            suggestedMissions: updatedSuggestions,
            activities: [
              ...prev.activities,
              {
                id: Math.random().toString(36).substr(2, 9),
                label: `Missions updated for new role: ${memory.targetRole}`,
                timestamp: new Date().toISOString()
              }
            ]
          };
        });
      }
    }
  }, [memory.targetRole, memory.isAnalyzed]);

  // Handlers for User-Controlled Mission System
  const handleCreateCustomMission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;

    if (memory.weeklyMissions.length >= 3) {
      alert("You already have 3 active missions. Please delete, skip, or complete an active mission before promoting/adding another.");
      return;
    }

    updateMemory(prev => {
      const newMission: WeeklyMission = {
        id: generateId(),
        text: customText.trim(),
        completed: false,
        why: "User created custom goal for career progression.",
        difficulty: customDifficulty,
        skill: customSkill.trim() || 'Custom',
        category: customCategory,
        source: 'User Created',
        createdAt: new Date().toISOString()
      };

      const updated = [...prev.weeklyMissions, newMission];
      return {
        ...prev,
        weeklyMissions: updated,
        activities: [
          ...prev.activities,
          { id: generateId(), label: `Added Custom Goal: "${customText.trim()}"`, timestamp: new Date().toISOString() }
        ]
      };
    });

    setCustomText('');
    setIsCreatingMission(false);
  };

  const handleEditMission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMission || !editText.trim()) return;

    updateMemory(prev => {
      const updatedActive = prev.weeklyMissions.map(m => {
        if (m.id === editingMission.id) {
          return {
            ...m,
            text: editText.trim(),
            source: 'User Edited' as const,
            why: m.why.includes("(Edited)") ? m.why : `${m.why} (Edited by user)`
          };
        }
        return m;
      });

      const updatedSuggestions = (prev.suggestedMissions || []).map(m => {
        if (m.id === editingMission.id) {
          return {
            ...m,
            text: editText.trim(),
            source: 'User Edited' as const,
            why: m.why.includes("(Edited)") ? m.why : `${m.why} (Edited by user)`
          };
        }
        return m;
      });

      return {
        ...prev,
        weeklyMissions: updatedActive,
        suggestedMissions: updatedSuggestions,
        activities: [
          ...prev.activities,
          { id: generateId(), label: `Edited Goal to: "${editText.trim()}"`, timestamp: new Date().toISOString() }
        ]
      };
    });

    setEditingMission(null);
    setEditText('');
  };

  const handleDeleteMission = (id: string) => {
    updateMemory(prev => {
      const updatedActive = prev.weeklyMissions.filter(m => m.id !== id);
      const updatedSuggestions = (prev.suggestedMissions || []).filter(m => m.id !== id);

      return {
        ...prev,
        weeklyMissions: updatedActive,
        suggestedMissions: updatedSuggestions,
        activities: [
          ...prev.activities,
          { id: generateId(), label: 'Removed active goal', timestamp: new Date().toISOString() }
        ]
      };
    });
  };

  const handleConfirmRegenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skippingMission) return;

    const id = skippingMission.id;
    const replacement = regenerateSingleMission(memory, id, skipReason);
    if (!replacement) return;

    updateMemory(prev => {
      const activeIdx = prev.weeklyMissions.findIndex(m => m.id === id);
      const updatedActive = [...prev.weeklyMissions];
      if (activeIdx > -1) {
        updatedActive[activeIdx] = replacement;
      }

      const sugIdx = (prev.suggestedMissions || []).findIndex(m => m.id === id);
      const updatedSug = [...(prev.suggestedMissions || [])];
      if (sugIdx > -1) {
        updatedSug[sugIdx] = replacement;
      }

      return {
        ...prev,
        weeklyMissions: updatedActive,
        suggestedMissions: updatedSug,
        activities: [
          ...prev.activities,
          { id: generateId(), label: `Regenerated goal: "${replacement.text}"`, timestamp: new Date().toISOString() }
        ]
      };
    });

    setSkippingMission(null);
    setIsConfirmSkipModalOpen(false);
  };

  const handlePromoteSuggestion = (id: string) => {
    if (memory.weeklyMissions.length >= 3) {
      alert("You already have 3 active missions. Please delete, skip, or complete one before promoting another.");
      return;
    }

    updateMemory(prev => {
      const suggestion = (prev.suggestedMissions || []).find(m => m.id === id);
      if (!suggestion) return prev;

      const updatedActive = [...prev.weeklyMissions, suggestion];
      const updatedSuggestions = (prev.suggestedMissions || []).filter(m => m.id !== id);

      const tempMem = {
        ...prev,
        weeklyMissions: updatedActive,
        suggestedMissions: updatedSuggestions
      };
      const missingSuggestionsCount = Math.max(0, 5 - updatedSuggestions.length);
      const newSuggestions = missingSuggestionsCount > 0 ? generateMissions(tempMem, missingSuggestionsCount) : [];

      return {
        ...prev,
        weeklyMissions: updatedActive,
        suggestedMissions: [...updatedSuggestions, ...newSuggestions],
        activities: [
          ...prev.activities,
          { id: generateId(), label: `Promoted suggested goal: "${suggestion.text}"`, timestamp: new Date().toISOString() }
        ]
      };
    });
  };

  const handleTogglePin = (id: string) => {
    updateMemory(prev => {
      const updatedActive = prev.weeklyMissions.map(m => {
        if (m.id === id) {
          return { ...m, pinned: !m.pinned };
        }
        return m;
      });

      const updatedSuggestions = (prev.suggestedMissions || []).map(m => {
        if (m.id === id) {
          return { ...m, pinned: !m.pinned };
        }
        return m;
      });

      return {
        ...prev,
        weeklyMissions: updatedActive,
        suggestedMissions: updatedSuggestions
      };
    });
  };

  const handleCompleteMissionWithEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingMission) return;

    const evidenceObj = evidenceUrl.trim() ? {
      type: evidenceType,
      url: evidenceUrl.trim()
    } : undefined;

    updateMemory(prev => {
      const target = prev.weeklyMissions.find(m => m.id === completingMission.id);
      if (!target) return prev;

      const completedMission: WeeklyMission = {
        ...target,
        completed: true,
        completedAt: new Date().toISOString(),
        evidence: evidenceObj,
        feedback: feedbackVal
      };

      const updatedActive = prev.weeklyMissions.filter(m => m.id !== completingMission.id);
      const updatedHistory = [...(prev.missionHistory || []), completedMission];

      let updatedAnalysis = prev.analysis ? { ...prev.analysis } : null;
      const newActivities = [...prev.activities];

     if (updatedAnalysis) {
  const bump = 4;
  updatedAnalysis.readiness        = Math.min(100, (updatedAnalysis.readiness        ?? 0) + bump);
  updatedAnalysis.careerReadiness  = Math.min(100, (updatedAnalysis.careerReadiness  ?? updatedAnalysis.readiness) + bump);
  updatedAnalysis.internshipReadiness = Math.min(100, (updatedAnalysis.internshipReadiness ?? updatedAnalysis.readiness) + bump);
  updatedAnalysis.jobReadiness     = Math.min(100, (updatedAnalysis.jobReadiness     ?? updatedAnalysis.readiness) + bump);
  
        if (completedMission.skill && completedMission.skill !== 'General' && completedMission.skill !== 'Custom') {
          const skillLower = completedMission.skill.toLowerCase();
          
          if (updatedAnalysis.gaps) {
            updatedAnalysis.gaps = updatedAnalysis.gaps.filter(g => g.toLowerCase() !== skillLower);
          }
          
          if (updatedAnalysis.strengths && !updatedAnalysis.strengths.some(s => s.toLowerCase() === skillLower)) {
            updatedAnalysis.strengths = [...updatedAnalysis.strengths, completedMission.skill];
          }

          if (updatedAnalysis.currentSkills && !updatedAnalysis.currentSkills.some(s => s.toLowerCase() === skillLower)) {
            updatedAnalysis.currentSkills = [...updatedAnalysis.currentSkills, completedMission.skill];
          }
        }

        if (updatedAnalysis.roadmap) {
          const firstIncompleteIdx = updatedAnalysis.roadmap.findIndex(step => !(step as any).completed);
          if (firstIncompleteIdx > -1) {
            const updatedRoadmap = [...updatedAnalysis.roadmap];
            updatedRoadmap[firstIncompleteIdx] = {
              ...updatedRoadmap[firstIncompleteIdx],
              completed: true
            } as any;
            updatedAnalysis.roadmap = updatedRoadmap;

            newActivities.push({
              id: generateId(),
              label: `Roadmap Step Achieved: ${updatedRoadmap[firstIncompleteIdx].value}`,
              timestamp: new Date().toISOString()
            });
          }
        }
      }

      newActivities.push({
        id: generateId(),
        label: `Completed Goal: "${completedMission.text}"`,
        timestamp: new Date().toISOString()
      });

      let finalActive = updatedActive;
      let finalSuggestions = prev.suggestedMissions || [];

      if (updatedActive.length === 0) {
        const tempMem = {
          ...prev,
          weeklyMissions: [],
          suggestedMissions: finalSuggestions,
          missionHistory: updatedHistory,
          analysis: updatedAnalysis
        };
        finalActive = generateMissions(tempMem, 3);
        
        const nextTempMem = { ...tempMem, weeklyMissions: finalActive };
        const missingSuggestionsCount = Math.max(0, 5 - finalSuggestions.length);
        const newSug = missingSuggestionsCount > 0 ? generateMissions(nextTempMem, missingSuggestionsCount) : [];
        finalSuggestions = [...finalSuggestions, ...newSug];

        newActivities.push({
          id: generateId(),
          label: 'Generated next batch of AI missions based on skill gains',
          timestamp: new Date().toISOString()
        });
      }

      return {
        ...prev,
        analysis: updatedAnalysis,
        weeklyMissions: finalActive,
        suggestedMissions: finalSuggestions,
        missionHistory: updatedHistory,
        activities: newActivities
      };
    });

    setCompletingMission(null);
    setEvidenceUrl('');
    setEvidenceType('GitHub');
    setFeedbackVal('Appropriate');
  };

  const formatTimestamp = (isoStr: string) => {
    const date = new Date(isoStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const getSkillHeatmapData = () => {
    if (!dynamicProfile) return [];
    
    const data: { name: string, value: number, color: string }[] = [];
    const strengths = dynamicProfile.strengths || [];
    strengths.slice(0, 3).forEach((skill: string, idx: number) => {
      data.push({
        name: skill,
        value: 85 - idx * 5,
        color: 'var(--color-success)'
      });
    });
    
    const currentSkills = dynamicProfile.currentSkills || [];
    currentSkills.filter((s: string) => !strengths.includes(s)).slice(0, 2).forEach((skill: string, idx: number) => {
      data.push({
        name: skill,
        value: 65 - idx * 8,
        color: 'var(--color-primary)'
      });
    });
    
    const gaps = dynamicProfile.gaps || [];
    gaps.slice(0, 2).forEach((skill: string, idx: number) => {
      data.push({
        name: skill,
        value: 40 - idx * 10,
        color: 'var(--color-warning)'
      });
    });
    
    return data;
  };

  const runProfileAnalysis = () => {
    setIsAnalyzing(true);
    let currentStep = 0;
    setAnalysisText(analysisSteps[currentStep]);
    
    const stepDuration = 600;
    const textInterval = setInterval(() => {
      currentStep++;
      if (currentStep < analysisSteps.length) {
        setAnalysisText(analysisSteps[currentStep]);
      }
    }, stepDuration);

    let currentProgress = 0;
    const progressInterval = setInterval(() => {
      currentProgress += 1.5;
      setProgress(Math.min(currentProgress, 100));
      if (currentProgress >= 100) {
        clearInterval(progressInterval);
        clearInterval(textInterval);
        
       setIsAnalyzing(false);

updateMemory(prev => ({
  ...prev,
  isAnalyzed: true
}));

      }
    }, (stepDuration * analysisSteps.length) / 66);
  };

 const handleAnalyze = () => {
  if (!github && !linkedin && !resumeUploaded) return;

  updateMemory(prev => ({
    ...prev,
    githubUsername: github.trim() || prev.githubUsername,
    linkedinUrl: linkedin.trim() || prev.linkedinUrl,
  }));

  // If resume already uploaded and analyzed, just mark profile as enriched
  if (resumeUploaded && memory.analysis) {
    updateMemory(prev => ({ ...prev, isAnalyzed: true }));
    return;
  }

  // For GitHub/LinkedIn-only flow (no PDF), trigger mock analysis as fallback
  if (!resumeUploaded) {
    runProfileAnalysis();
  }
};

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  if (!e.target.files || e.target.files.length === 0) return;
  const file = e.target.files[0];

  setResumeUploaded(true);
  setIsAnalyzing(true);
  setAnalysisText('Uploading resume...');
  setProgress(10);

  try {
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('targetRole', memory.targetRole || 'Software Engineer');

    setAnalysisText('Extracting resume content...');
    setProgress(30);

    const res = await fetch('http://localhost:5000/api/upload-resume', {
      method: 'POST',
      body: formData,
    });

    setProgress(60);
    setAnalysisText('Analyzing with Gemini AI...');

    let responseData: any;
    try {
      responseData = await res.json();
    } catch (parseErr) {
      const errorText = await res.text().catch(() => '');
      throw new Error(`Server returned status ${res.status}: ${errorText || 'Invalid response'}`);
    }
    if (!res.ok) {
      throw new Error(responseData?.error || responseData?.message || `Server error (Status ${res.status})`);
    }




    const { fileName, analysis: rawAnalysis } = responseData;

    setProgress(90);
    setAnalysisText('Building Career Twin...');

    // Normalize Gemini response to match frontend field expectations
   const normalizedAnalysis = normalizeAnalysis(rawAnalysis, memory.targetRole);

updateMemory(prev => {
  const tempMem = {
    ...prev,
    hasResume: true,
    resumeFileName: fileName || file.name,
    isAnalyzed: true,
    isTwinGenerated: true,
    analysis: normalizedAnalysis,
    activities: [
      ...prev.activities,
      {
        id: Math.random().toString(36).substr(2, 9),
        label: "Resume Uploaded & Analyzed",
        timestamp: new Date().toISOString(),
      },
      {
        id: Math.random().toString(36).substr(2, 9),
        label: "Career Twin Generated",
        timestamp: new Date().toISOString(),
      },
    ],
  };

  const active = generateMissions(tempMem, 3);
  const suggestions = generateMissions(
    { ...tempMem, weeklyMissions: active },
    5
  );

  return {
    ...tempMem,
    weeklyMissions: active,
    suggestedMissions: suggestions,
  };
});
    setProgress(100);
  } catch (err: any) {
    console.error('Resume upload error:', err);
    let userMsg = err.message || 'Please ensure the backend is running on port 5000.';
    if (userMsg.includes('Failed to fetch')) {
      userMsg = 'Connection refused. Please check if the backend server is running on http://localhost:5000.';
    }
    alert(`Resume analysis failed: ${userMsg}`);
    setResumeUploaded(false);
  } finally {
    setIsAnalyzing(false);
    setProgress(0);
  }
};

  const handleConnectLinkedin = () => {
    const val = linkedinInput.trim();
    if (!val) return;
    updateMemory(prev => {
      const newActivities = [...prev.activities, { id: Math.random().toString(36).substr(2, 9), label: 'LinkedIn Profile Connected', timestamp: new Date().toISOString() }];
      return {
        ...prev,
        linkedinUrl: val,
        activities: newActivities
      };
    });
    setLinkedinInput('');
    runProfileAnalysis();
  };

  const handleConnectGithub = () => {
    const val = githubInput.trim();
    if (!val) return;
    updateMemory(prev => {
      const newActivities = [...prev.activities, { id: Math.random().toString(36).substr(2, 9), label: 'GitHub Account Connected', timestamp: new Date().toISOString() }];
      return {
        ...prev,
        githubUsername: val,
        activities: newActivities
      };
    });
    setGithubInput('');
    runProfileAnalysis();
  };

  if (isAnalyzing) {
    return (
      <div className="flex-center" style={{ height: '100vh', flexDirection: 'column', backgroundColor: 'var(--color-background)' }}>
        <motion.div animate={{ scale: [1, 1.1, 1], filter: ['blur(10px)', 'blur(20px)', 'blur(10px)'] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} style={{ position: 'absolute', width: 400, height: 400, background: 'var(--color-primary)', opacity: 0.1, borderRadius: '50%', zIndex: 0 }} />
        <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 400 }}>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} style={{ width: 64, height: 64, borderRadius: '24%', border: '4px solid var(--color-glass-border)', borderTopColor: 'var(--color-primary)', marginBottom: 'var(--space-8)' }} />
          <div style={{ width: '100%', height: 4, background: 'rgba(61,44,46,0.1)', borderRadius: 2, overflow: 'hidden', marginBottom: 'var(--space-4)' }}>
            <motion.div style={{ height: '100%', background: 'var(--color-primary)', width: `${progress}%` }} transition={{ ease: "linear" }} />
          </div>
          <AnimatePresence mode="wait">
            <motion.h2 key={analysisText} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} style={{ fontSize: '1.2rem', color: 'var(--color-text)', fontWeight: 600 }}>
              {analysisText}
            </motion.h2>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  if (!memory.isAnalyzed) {
    return (
      <div className="container page-enter-active" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-12)', maxWidth: 800 }}>
        <header style={{ marginBottom: 'var(--space-8)', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', color: 'var(--color-text)', marginBottom: 'var(--space-2)' }}>Hello {firstName} 👋</h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--color-text-light)' }}>Welcome to Nexora. Let's build your AI Career Twin.</p>
        </header>

        <Card hoverEffect style={{ padding: 'var(--space-8)', boxShadow: 'var(--shadow-lg)', border: '2px solid var(--color-primary)' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: 'var(--space-2)' }}>Complete Your Career Profile</h2>
            <p style={{ color: 'var(--color-text-light)' }}>Provide your data sources so the AI can analyze your current readiness for <strong>{targetRole}</strong>.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-4)', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(61,44,46,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: 48, height: 48, borderRadius: '12px', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}><FileText size={24} color="var(--color-primary)" /></div>
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 4 }}>Resume</h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>Upload your latest PDF resume.</p>
                </div>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept=".pdf,.doc,.docx" />
              <Button variant={resumeUploaded ? 'ghost' : 'secondary'} size="sm" onClick={() => fileInputRef.current?.click()}>
                {resumeUploaded ? <span style={{ color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: 4 }}><Check size={16} /> Uploaded</span> : "Upload PDF"}
              </Button>
            </div>

            <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(61,44,46,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: 'var(--space-4)' }}>
                <div style={{ width: 48, height: 48, borderRadius: '12px', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}><Code size={24} /></div>
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 4 }}>GitHub Username</h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>Analyze your code commits and repos.</p>
                </div>
              </div>
              <input type="text" placeholder="e.g. torvalds" value={github} onChange={e => setGithub(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(61,44,46,0.1)' }} />
            </div>

            <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(61,44,46,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: 'var(--space-4)' }}>
                <div style={{ width: 48, height: 48, borderRadius: '12px', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}><Briefcase size={24} color="#0A66C2" /></div>
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 4 }}>LinkedIn URL</h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>Sync your professional network.</p>
                </div>
              </div>
              <input type="url" placeholder="https://linkedin.com/in/..." value={linkedin} onChange={e => setLinkedin(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(61,44,46,0.1)' }} />
            </div>

            <Button size="lg" onClick={handleAnalyze} disabled={!github && !linkedin && !resumeUploaded} style={{ marginTop: 'var(--space-4)' }}>
              Analyze My Profile
            </Button>
          </div>
        </Card>
      </div>
    );
  }

 
    return (
  <div
    className="container page-enter-active"
    style={{
      maxWidth: "1600px",
      margin: "0 auto",
      paddingInline: "32px",
      paddingTop: "var(--space-6)",
      paddingBottom: "var(--space-8)"
    }}
  >
      {/* Hidden file input for header CTA action */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        style={{ display: 'none' }} 
        accept=".pdf,.doc,.docx" 
      />

      {/* 1. Header (Welcome and context) */}
      <DashboardHeader 
        targetRole={targetRole} 
        userName={userName} 
        hasResume={memory.hasResume}
        onAction={() => fileInputRef.current?.click()}
      />

      {/* 2. KPI Section */}
      <KPISection analysis={analysis} hasResume={memory.hasResume} />

      {/* 3. Signature Career Roadmap Hero */}
      <CareerRoadmap 
        analysis={analysis} 
        targetRole={targetRole} 
        onOpenTwin={() => navigate('/career-twin')} 
      />

      {/* 4. Asymmetric split grid */}
     <div
  style={{
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 2fr) minmax(320px, 1fr)',
    gap: 'var(--space-5)',
    alignItems: 'start',
    width: '100%'
  }}
>
        {/* Left column (2/3 width) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {/* AI Coach Card */}
          <AICoachCard 
            weeklyMissions={memory.weeklyMissions || []}
            targetRole={targetRole}
            onComplete={(mission) => {
              setCompletingMission(mission);
              setEvidenceUrl('');
            }}
            onSkip={(mission) => {
              setSkippingMission(mission);
              setIsConfirmSkipModalOpen(true);
            }}
            onAddCustom={() => setIsCreatingMission(true)}
          />
        </div>

        {/* Right column (1/3 width) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {/* Resume Insights Diagnostics */}
          <ResumeInsights 
            analysis={analysis}
            hasResume={memory.hasResume}
            onOpenTwin={() => navigate('/career-twin')}
          />

          {/* Skills Capability balance */}
          <SkillsSummary 
            dynamicProfile={dynamicProfile}
            analysis={analysis}
            onOpenTwin={() => navigate('/career-twin')}
          />
        </div>

      </div>

      {/* 1. MISSION COMPLETION CHECK-IN MODAL */}
      {completingMission && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundColor: 'rgba(45, 42, 38, 0.4)', 
          backdropFilter: 'blur(4px)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 9999,
          padding: '16px'
        }}>
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            style={{ 
              backgroundColor: 'var(--color-card)', 
              borderRadius: 'var(--radius-md)', 
              padding: '28px', 
              maxWidth: '480px', 
              width: '100%', 
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--color-border)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle size={22} color="var(--color-success)" />
                Mission Accomplished Check-In
              </h3>
              <button onClick={() => setCompletingMission(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-light)' }}>
                <X size={18} />
              </button>
            </div>
            
            <p style={{ fontSize: '0.92rem', color: 'var(--color-text-light)', marginBottom: 'var(--space-5)' }}>
              Congratulations on finishing: <strong>"{completingMission.text}"</strong>. Submit evidence link below to lock in readiness score impact!
            </p>
            
            <form onSubmit={handleCompleteMissionWithEvidence} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-light)', marginBottom: 6 }}>
                  Proof of Completion / Evidence Link (Optional)
                </label>
                <input 
                  type="url" 
                  placeholder="e.g. https://github.com/your-username/repo" 
                  value={evidenceUrl}
                  onChange={e => setEvidenceUrl(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontSize: '0.9rem' }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-light)', marginBottom: 6 }}>
                  Evidence Source Type
                </label>
                <select 
                  value={evidenceType}
                  onChange={e => setEvidenceType(e.target.value as any)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontSize: '0.9rem' }}
                >
                  <option value="GitHub">GitHub Repository</option>
                  <option value="Kaggle">Kaggle Notebook</option>
                  <option value="Portfolio">Portfolio URL</option>
                  <option value="Certificate">Certificate Link</option>
                  <option value="Other">Other / Blog post</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-light)', marginBottom: 8 }}>
                  Difficulty Check-in: How did you find this mission?
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  {['Easy', 'Appropriate', 'Difficult'].map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setFeedbackVal(diff as any)}
                      style={{
                        padding: '10px',
                        borderRadius: 'var(--radius-sm)',
                        border: feedbackVal === diff ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                        backgroundColor: feedbackVal === diff ? 'rgba(201,106,74,0.05)' : '#FFFFFF',
                        color: feedbackVal === diff ? 'var(--color-primary)' : 'var(--color-text)',
                        fontWeight: feedbackVal === diff ? 700 : 500,
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-light)', marginTop: 6 }}>
                  Your AI Career Twin will calibrate the difficulty of future suggestions based on this.
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <Button variant="outline" type="button" onClick={() => setCompletingMission(null)}>Cancel</Button>
                <Button type="submit">Verify & Log Progress</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* 2. REGENERATE / SKIP REASON MODAL */}
      {isConfirmSkipModalOpen && skippingMission && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundColor: 'rgba(45, 42, 38, 0.4)', 
          backdropFilter: 'blur(4px)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 9999,
          padding: '16px'
        }}>
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            style={{ 
              backgroundColor: 'var(--color-card)', 
              borderRadius: 'var(--radius-md)', 
              padding: '24px', 
              maxWidth: '420px', 
              width: '100%', 
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--color-border)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                Regenerate AI Mission
              </h3>
              <button onClick={() => { setSkippingMission(null); setIsConfirmSkipModalOpen(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-light)' }}>
                <X size={18} />
              </button>
            </div>
            
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)', marginBottom: 'var(--space-4)' }}>
              Why would you like to replace the mission: <strong>"{skippingMission.text}"</strong>?
            </p>
            
            <form onSubmit={handleConfirmRegenerate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-light)', marginBottom: 6 }}>
                  Select Reason
                </label>
                <select 
                  value={skipReason}
                  onChange={e => setSkipReason(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontSize: '0.9rem' }}
                >
                  <option value="Too beginner level">Too beginner level / Already know this</option>
                  <option value="Too advanced">Too advanced / Lacking pre-requisites</option>
                  <option value="Not interested in this skill">Not interested in this skill right now</option>
                  <option value="Focusing on other roadmap items">Focusing on other roadmap items</option>
                  <option value="Completed something similar offline">Completed something similar offline</option>
                </select>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                <Button variant="outline" type="button" onClick={() => { setSkippingMission(null); setIsConfirmSkipModalOpen(false); }}>Cancel</Button>
                <Button type="submit">Regenerate Mission</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* 3. INLINE CUSTOM MISSION CREATOR MODAL */}
      {isCreatingMission && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundColor: 'rgba(45, 42, 38, 0.4)', 
          backdropFilter: 'blur(4px)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 9999,
          padding: '16px'
        }}>
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            style={{ 
              padding: '28px', 
              backgroundColor: 'var(--color-card)', 
              borderRadius: 'var(--radius-md)', 
              border: '1px solid var(--color-border)', 
              boxShadow: 'var(--shadow-lg)',
              maxWidth: '500px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: 16
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Add Custom Target Goal</h3>
              <button onClick={() => setIsCreatingMission(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-light)' }}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleCreateCustomMission} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-light)', marginBottom: 6 }}>
                  Goal Description
                </label>
                <input 
                  type="text" 
                  placeholder="What is your immediate goal? (e.g. Solve 5 SQL Joins)" 
                  value={customText}
                  onChange={e => setCustomText(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-light)', marginBottom: 6 }}>Category</label>
                  <select 
                    value={customCategory} 
                    onChange={e => setCustomCategory(e.target.value as any)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontSize: '0.85rem' }}
                  >
                    <option value="Learning">Learning</option>
                    <option value="Project">Project</option>
                    <option value="Internship">Internship</option>
                    <option value="Networking">Networking</option>
                    <option value="Certification">Certification</option>
                    <option value="Interview Preparation">Interview Prep</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-light)', marginBottom: 6 }}>Difficulty</label>
                  <select 
                    value={customDifficulty} 
                    onChange={e => setCustomDifficulty(e.target.value as any)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontSize: '0.85rem' }}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-light)', marginBottom: 6 }}>Topic / Skill</label>
                  <input 
                    type="text" 
                    placeholder="e.g. SQL" 
                    value={customSkill} 
                    onChange={e => setCustomSkill(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <Button variant="outline" type="button" onClick={() => setIsCreatingMission(false)}>Cancel</Button>
                <Button type="submit">Add to Roadmap</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

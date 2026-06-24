import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Code, Briefcase, FileText, Check, Map, Lightbulb, Edit2, Trash2, Plus, RefreshCw, Pin, ExternalLink, CheckCircle, X, HelpCircle, Award } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useCareerAgent } from '../services/CareerAgent';
import type { WeeklyMission } from '../services/CareerAgent';
import { generateMissions, checkMissionRelevance, regenerateSingleMission, generateId } from '../services/MissionGenerator';
import { normalizeAnalysis } from './CareerTwin';

const Dashboard: React.FC = () => {
  const {
    memory,
    updateMemory
  } = useCareerAgent();

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
        updatedAnalysis.readiness = Math.min(100, updatedAnalysis.readiness + 4);

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

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Upload failed');
    }

    const { fileName, analysis: rawAnalysis } = await res.json();

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
          { id: Math.random().toString(36).substr(2, 9), label: 'Resume Uploaded & Analyzed', timestamp: new Date().toISOString() },
          { id: Math.random().toString(36).substr(2, 9), label: 'Career Twin Generated', timestamp: new Date().toISOString() },
        ]
      };
      const active = generateMissions(tempMem, 3);
      const suggestions = generateMissions({ ...tempMem, weeklyMissions: active }, 5);
      return { ...tempMem, weeklyMissions: active, suggestedMissions: suggestions };
    });

    setProgress(100);
  } catch (err: any) {
    console.error('Resume upload error:', err);
    alert(`Resume analysis failed: ${err.message || 'Please ensure the backend is running on port 5000.'}`);
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
    <div className="container page-enter-active" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-12)' }}>
      <header style={{ marginBottom: 'var(--space-8)' }}>
        <h1 style={{ fontSize: '2.5rem', color: 'var(--color-text)', marginBottom: 'var(--space-2)' }}>Hello {firstName} 👋</h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--color-text-light)' }}>Welcome to your Career Intelligence Dashboard for <strong style={{ color: 'var(--color-primary)' }}>{targetRole}</strong>.</p>
      </header>

      {/* Profile Enrichment Cards */}
      {(!githubConnected || !linkedinConnected) && (
        <div style={{ display: 'grid', gridTemplateColumns: !githubConnected && !linkedinConnected ? '1fr 1fr' : '1fr', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
          {!githubConnected && (
            <Card hoverEffect style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid rgba(201,106,74,0.15)', background: 'var(--color-card)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: 'rgba(201,106,74,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                    <Code size={20} />
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Connect GitHub</h3>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)', marginBottom: '16px', lineHeight: '1.4' }}>
                  GitHub contributes <strong>technical activity, repositories, and coding trends</strong>.
                </p>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-light)', textTransform: 'uppercase', marginBottom: '8px' }}>Unlocks:</div>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85rem', color: 'var(--color-text-light)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <li>Repository analysis</li>
                    <li>Coding activity insights</li>
                    <li>Technical skill detection</li>
                  </ul>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                <input 
                  type="text" 
                  placeholder="GitHub Username" 
                  value={githubInput} 
                  onChange={e => setGithubInput(e.target.value)} 
                  style={{ flex: 1, padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(61,44,46,0.15)', fontSize: '0.85rem', background: 'var(--color-background)', color: 'var(--color-text)' }} 
                />
                <Button size="sm" onClick={handleConnectGithub}>Connect GitHub</Button>
              </div>
            </Card>
          )}

          {!linkedinConnected && (
            <Card hoverEffect style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid rgba(201,106,74,0.15)', background: 'var(--color-card)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: 'rgba(10,102,194,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A66C2' }}>
                    <Briefcase size={20} color="#0A66C2" />
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Connect LinkedIn</h3>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)', marginBottom: '16px', lineHeight: '1.4' }}>
                  LinkedIn contributes <strong>professional profile, experience, and networking</strong>.
                </p>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-light)', textTransform: 'uppercase', marginBottom: '8px' }}>Unlocks:</div>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85rem', color: 'var(--color-text-light)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <li>Professional profile analysis</li>
                    <li>Industry insights</li>
                    <li>Networking recommendations</li>
                  </ul>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                <input 
                  type="url" 
                  placeholder="LinkedIn Profile URL" 
                  value={linkedinInput} 
                  onChange={e => setLinkedinInput(e.target.value)} 
                  style={{ flex: 1, padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(61,44,46,0.15)', fontSize: '0.85rem', background: 'var(--color-background)', color: 'var(--color-text)' }} 
                />
                <Button size="sm" onClick={handleConnectLinkedin}>Connect LinkedIn</Button>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Balanced 2-Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
        
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Career Readiness */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <Card hoverEffect>
              <h3 style={{ fontSize: '1.1rem', marginBottom: 'var(--space-4)', color: 'var(--color-text-light)' }}>Career Readiness</h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <div style={{ fontSize: '4.5rem', fontWeight: 800, color: 'var(--color-primary)', lineHeight: 1 }}>
                  {analysis ? `${analysis.alignmentScore ?? analysis.readiness}%` : '--'}
                </div>
              </div>
              <div style={{ marginTop: 'var(--space-6)', height: 8, background: 'rgba(61,44,46,0.05)', borderRadius: 4, overflow: 'hidden' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: analysis ? `${analysis.alignmentScore ?? analysis.readiness}%` : '0%' }} transition={{ duration: 1, delay: 0.5 }} style={{ height: '100%', background: 'var(--color-primary)' }} />
              </div>

              <div style={{ marginTop: 'var(--space-6)', borderTop: '1px solid rgba(61,44,46,0.1)', paddingTop: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Target size={18} color="var(--color-text-light)" />
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', textTransform: 'uppercase', fontWeight: 700 }}>Target Role</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>{targetRole}</div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* 1. Internship Readiness Score */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
            <Card hoverEffect>
              <h3 style={{ fontSize: '1.1rem', marginBottom: 'var(--space-4)', color: 'var(--color-text-light)' }}>Internship Readiness</h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <div style={{ fontSize: '4.5rem', fontWeight: 800, color: 'var(--color-success)', lineHeight: 1 }}>
                  {analysis ? `${analysis.alignmentScore ?? analysis.readiness}%` : '--'}
                </div>
              </div>
              <div style={{ marginTop: 'var(--space-6)', height: 8, background: 'rgba(61,44,46,0.05)', borderRadius: 4, overflow: 'hidden' }}>
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: analysis ? `${analysis.alignmentScore ?? analysis.readiness}%` : '0%' }} 
                  transition={{ duration: 1, delay: 0.6 }} 
                  style={{ height: '100%', background: 'var(--color-success)' }} 
                />
              </div>
              <p style={{ marginTop: 'var(--space-4)', fontSize: '0.9rem', color: 'var(--color-text-light)', lineHeight: 1.5 }}>
                {analysis 
                  ? "Readiness for entry-level opportunities based on current profile and skill coverage."
                  : "Upload resume to calculate internship readiness."}
              </p>
            </Card>
          </motion.div>

          {/* 2. Learning Heatmap */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <Card hoverEffect>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 'var(--space-6)', color: 'var(--color-text-light)' }}>Learning Heatmap</h3>
              {analysis ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  {getSkillHeatmapData().map((skill) => (
                    <div key={skill.name} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 600 }}>
                        <span>{skill.name}</span>
                        <span style={{ color: skill.color }}>{skill.value}%</span>
                      </div>
                      <div style={{ height: 10, background: 'rgba(61,44,46,0.05)', borderRadius: 5, overflow: 'hidden', position: 'relative' }}>
                        <motion.div 
                          initial={{ width: 0 }} 
                          animate={{ width: `${skill.value}%` }} 
                          transition={{ duration: 0.8, ease: "easeOut" }} 
                          style={{ height: '100%', background: skill.color, borderRadius: 5 }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : memory.hasResume ? (
                <div style={{ 
                  padding: 'var(--space-6) 0', 
                  textAlign: 'center', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: 'var(--space-4)' 
                }}>
                  <p style={{ color: 'var(--color-text)', fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>
                    Resume Connected
                  </p>
                  <p style={{ color: 'var(--color-text-light)', fontSize: '0.85rem', margin: 0 }}>
                    Please run profile analysis to extract skills and calculate readiness scores.
                  </p>
                  <Button size="sm" onClick={runProfileAnalysis} style={{ fontSize: '0.85rem' }}>
                    Run Profile Analysis
                  </Button>
                </div>
              ) : (
                <div style={{ 
                  padding: 'var(--space-6) 0', 
                  textAlign: 'center', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: 'var(--space-4)' 
                }}>
                  <p style={{ color: 'var(--color-text-light)', fontSize: '0.95rem', margin: 0 }}>
                    No skill analysis available yet.
                  </p>
                  <Button size="sm" onClick={() => fileInputRef.current?.click()} style={{ fontSize: '0.85rem' }}>
                    Upload Resume
                  </Button>
                </div>
              )}
            </Card>
          </motion.div>

          {/* 2. Personalized Progression Timeline */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
            <Card hoverEffect>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 'var(--space-6)' }}>
                <Map size={20} color="var(--color-text-light)" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Personalized Progression</h3>
              </div>
              
              {analysis ? (
                <div style={{ position: 'relative', paddingLeft: 28 }}>
                  {/* Timeline vertical bar */}
                  <div style={{ position: 'absolute', top: 8, bottom: 8, left: 7, width: 2, background: 'rgba(61,44,46,0.1)' }}></div>
                  
                  {analysis.roadmap?.map((step: any, idx: number) => (
                    <div key={idx} style={{ position: 'relative', marginBottom: (analysis.roadmap && idx !== analysis.roadmap.length - 1) ? 'var(--space-5)' : 0 }}>
                      {/* Node dot */}
                      <div style={{ 
                          position: 'absolute', 
                          top: 4, 
                          left: -26, 
                          width: 16, 
                          height: 16, 
                          borderRadius: '50%', 
                          background: step.completed ? 'var(--color-success)' : step.color, 
                          border: '3px solid var(--color-card)',
                          boxShadow: 'var(--shadow-sm)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '8px',
                          fontWeight: 700
                      }}>
                        {step.completed && '✓'}
                      </div>
                      <div style={{ 
                        fontSize: '0.8rem', 
                        fontWeight: 700, 
                        color: step.completed ? 'var(--color-success)' : 'var(--color-text-light)', 
                        textTransform: 'uppercase', 
                        marginBottom: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}>
                        {step.label} {step.completed && '(Achieved)'}
                      </div>
                      <div style={{ 
                        fontSize: '1rem', 
                        fontWeight: 600, 
                        color: 'var(--color-text)',
                        textDecoration: step.completed ? 'line-through' : 'none',
                        opacity: step.completed ? 0.75 : 1
                      }}>
                        {step.value}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: 'var(--space-4) 0', textAlign: 'center' }}>
                  <p style={{ color: 'var(--color-text-light)', fontSize: '0.95rem', margin: 0 }}>
                    Generate your Career Twin to create a personalized roadmap.
                  </p>
                </div>
              )}
            </Card>
          </motion.div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          
          {/* 3. AI Insight Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card hoverEffect style={{ background: 'linear-gradient(to bottom right, var(--color-card), rgba(201,106,74,0.03))', border: '1px solid var(--color-glass-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 'var(--space-4)' }}>
                <Lightbulb color="#D49F00" size={24} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>AI Career Insights</h3>
              </div>
              {analysis ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {analysis.insights?.map((insight, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>•</span>
                      <p style={{ fontSize: '0.95rem', color: 'var(--color-text)', lineHeight: 1.5, margin: 0 }}>{insight}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: 'var(--space-4) 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <p style={{ color: 'var(--color-text-light)', fontSize: '0.95rem', margin: 0 }}>
                    Upload your profile to receive AI-powered insights.
                  </p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input 
                      type="url" 
                      placeholder="LinkedIn URL" 
                      value={linkedinInput} 
                      onChange={e => setLinkedinInput(e.target.value)} 
                      style={{ flex: 1, padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(61,44,46,0.1)', fontSize: '0.9rem' }} 
                    />
                    <Button size="sm" onClick={handleConnectLinkedin}>Connect</Button>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>

          {/* Core Strengths & Critical Gaps */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
              <Card hoverEffect style={{ height: '100%' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: 'var(--space-4)', color: 'var(--color-success)' }}>Core Strengths</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {analysis && dynamicProfile?.strengths ? (
                    dynamicProfile.strengths.map((s: string) => <span key={s} style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 500, backgroundColor: 'rgba(78, 139, 98, 0.1)', color: 'var(--color-success)', border: '1px solid rgba(78, 139, 98, 0.2)' }}>{s}</span>)
                  ) : (
                    <span style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>No strengths analyzed yet.</span>
                  )}
                </div>
              </Card>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card hoverEffect style={{ height: '100%' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: 'var(--space-4)', color: 'var(--color-danger)' }}>Critical Gaps</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {analysis && dynamicProfile?.gaps ? (
                    dynamicProfile.gaps.map((s: string) => <span key={s} style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 500, backgroundColor: 'rgba(192, 86, 86, 0.1)', color: 'var(--color-danger)', border: '1px solid rgba(192, 86, 86, 0.2)' }}>{s}</span>)
                  ) : (
                    <span style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>No skill gaps analyzed yet.</span>
                  )}
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Weekly AI Mission (User-Controlled Mission System) */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
            <Card hoverEffect>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Target size={20} color="var(--color-primary)" />
                    Personalized AI Missions & Career Coaching
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)', margin: '4px 0 0 0' }}>
                    Adaptive goals based on your target role of <strong>{targetRole}</strong>.
                  </p>
                </div>
                {analysis && memory.weeklyMissions && memory.weeklyMissions.length > 0 && (
                  <span style={{ 
                    fontSize: '0.85rem', 
                    fontWeight: 700, 
                    color: 'var(--color-success)', 
                    backgroundColor: 'rgba(78, 139, 98, 0.1)', 
                    padding: '4px 10px', 
                    borderRadius: 20 
                  }}>
                    {memory.weeklyMissions.filter(t => t.completed).length} Active
                  </span>
                )}
              </div>
              
              {analysis ? (
                <>
                  {/* ACTIVE MISSIONS SECTION */}
                  <div style={{ marginBottom: 'var(--space-6)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text)' }}>
                        Active Targets ({memory.weeklyMissions.length}/3)
                      </h4>
                      {!isCreatingMission && memory.weeklyMissions.length < 3 && (
                        <Button size="sm" variant="outline" onClick={() => setIsCreatingMission(true)} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Plus size={14} /> Custom Mission
                        </Button>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div style={{ height: 6, background: 'rgba(61,44,46,0.05)', borderRadius: 3, overflow: 'hidden', marginBottom: 'var(--space-4)' }}>
                      <motion.div 
                        animate={{ width: `${Math.round((memory.weeklyMissions.filter(t => t.completed).length / (memory.weeklyMissions.length || 3)) * 100)}%` }} 
                        transition={{ duration: 0.3 }} 
                        style={{ height: '100%', background: 'var(--color-primary)' }} 
                      />
                    </div>

                    {/* Inline Custom Mission Creator Panel */}
                    {isCreatingMission && (
                      <motion.form 
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: 'auto' }} 
                        exit={{ opacity: 0, height: 0 }}
                        onSubmit={handleCreateCustomMission} 
                        style={{ 
                          padding: '16px', 
                          background: 'var(--color-background)', 
                          borderRadius: 'var(--radius-md)', 
                          border: '1px solid rgba(61,44,46,0.1)', 
                          marginBottom: 'var(--space-4)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 12
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>New Custom Mission</span>
                          <button type="button" onClick={() => setIsCreatingMission(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-light)' }}>
                            <X size={16} />
                          </button>
                        </div>
                        <input 
                          type="text" 
                          placeholder="What is your goal? (e.g., Learn SQL joins, Complete Kaggle notebook)" 
                          value={customText}
                          onChange={e => setCustomText(e.target.value)}
                          required
                          style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(61,44,46,0.15)', fontSize: '0.9rem' }}
                        />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                          <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-light)' }}>Category</label>
                            <select 
                              value={customCategory} 
                              onChange={e => setCustomCategory(e.target.value as any)}
                              style={{ width: '100%', padding: '6px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(61,44,46,0.15)', fontSize: '0.85rem' }}
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
                            <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-light)' }}>Difficulty</label>
                            <select 
                              value={customDifficulty} 
                              onChange={e => setCustomDifficulty(e.target.value as any)}
                              style={{ width: '100%', padding: '6px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(61,44,46,0.15)', fontSize: '0.85rem' }}
                            >
                              <option value="Beginner">Beginner</option>
                              <option value="Intermediate">Intermediate</option>
                              <option value="Advanced">Advanced</option>
                            </select>
                          </div>
                          <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-light)' }}>Topic / Skill</label>
                            <input 
                              type="text" 
                              placeholder="e.g. SQL" 
                              value={customSkill} 
                              onChange={e => setCustomSkill(e.target.value)}
                              style={{ width: '100%', padding: '6px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(61,44,46,0.15)', fontSize: '0.85rem' }}
                            />
                          </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                          <Button size="sm" variant="outline" type="button" onClick={() => setIsCreatingMission(false)}>Cancel</Button>
                          <Button size="sm" type="submit">Add to Active</Button>
                        </div>
                      </motion.form>
                    )}

                    {/* Active Mission List */}
                    {memory.weeklyMissions.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                        {memory.weeklyMissions.map(task => (
                          <div 
                            key={task.id} 
                            style={{ 
                              display: 'flex', 
                              flexDirection: 'column',
                              gap: 6,
                              padding: '12px 16px', 
                              background: 'var(--color-background)', 
                              borderRadius: 'var(--radius-sm)', 
                              border: '1px solid rgba(61,44,46,0.06)',
                              transition: 'all 0.2s',
                              position: 'relative'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                                {/* Completion Checkbox */}
                                <div 
                                  onClick={() => setCompletingMission(task)}
                                  style={{ 
                                    width: 20, 
                                    height: 20, 
                                    borderRadius: 4, 
                                    border: '2px solid var(--color-text-light)',
                                    backgroundColor: 'transparent',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    color: 'var(--color-success)'
                                  }}
                                  onMouseOver={e => e.currentTarget.style.borderColor = 'var(--color-success)'}
                                  onMouseOut={e => e.currentTarget.style.borderColor = 'var(--color-text-light)'}
                                >
                                  {task.completed && '✓'}
                                </div>

                                {editingMission?.id === task.id ? (
                                  <form onSubmit={handleEditMission} style={{ display: 'flex', gap: 6, flex: 1 }}>
                                    <input 
                                      type="text" 
                                      value={editText} 
                                      onChange={e => setEditText(e.target.value)}
                                      style={{ flex: 1, padding: '4px 8px', borderRadius: 4, border: '1px solid var(--color-primary)', fontSize: '0.95rem' }}
                                      autoFocus
                                    />
                                    <Button size="sm" type="submit">Save</Button>
                                    <Button size="sm" variant="outline" onClick={() => setEditingMission(null)}>Cancel</Button>
                                  </form>
                                ) : (
                                  <span style={{ 
                                    fontSize: '0.95rem', 
                                    fontWeight: 600, 
                                    color: 'var(--color-text)'
                                  }}>
                                    {task.text}
                                  </span>
                                )}
                              </div>

                              {/* Control Action Buttons */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <button 
                                  onClick={() => handleTogglePin(task.id)} 
                                  title={task.pinned ? "Unpin mission" : "Pin mission"}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: task.pinned ? 'var(--color-primary)' : 'rgba(61,44,46,0.3)', padding: 4 }}
                                >
                                  <Pin size={15} style={{ transform: task.pinned ? 'rotate(45deg)' : 'none' }} />
                                </button>
                                <button 
                                  onClick={() => { setEditingMission(task); setEditText(task.text); }} 
                                  title="Edit mission text"
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(61,44,46,0.5)', padding: 4 }}
                                >
                                  <Edit2 size={14} />
                                </button>
                                {task.source === 'AI Generated' && (
                                  <button 
                                    onClick={() => { setSkippingMission(task); setIsConfirmSkipModalOpen(true); }} 
                                    title="Regenerate/Replace mission"
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(61,44,46,0.5)', padding: 4 }}
                                  >
                                    <RefreshCw size={14} />
                                  </button>
                                )}
                                <button 
                                  onClick={() => handleDeleteMission(task.id)} 
                                  title="Delete mission"
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-danger)', opacity: 0.7, padding: 4 }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>

                            {/* Metadata Badges */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4, alignItems: 'center' }}>
                              <span style={{ 
                                fontSize: '0.75rem', 
                                fontWeight: 700, 
                                padding: '2px 8px', 
                                borderRadius: 4,
                                backgroundColor: task.difficulty === 'Advanced' ? 'rgba(192, 86, 86, 0.1)' : (task.difficulty === 'Intermediate' ? 'rgba(230, 162, 60, 0.1)' : 'rgba(64, 158, 255, 0.1)'),
                                color: task.difficulty === 'Advanced' ? 'var(--color-danger)' : (task.difficulty === 'Intermediate' ? 'var(--color-warning)' : 'var(--color-primary)')
                              }}>
                                {task.difficulty}
                              </span>
                              <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '2px 8px', borderRadius: 4, backgroundColor: 'rgba(61,44,46,0.06)', color: 'var(--color-text-light)' }}>
                                {task.category}
                              </span>
                              <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '2px 8px', borderRadius: 4, backgroundColor: 'rgba(201,106,74,0.08)', color: 'var(--color-primary)' }}>
                                {task.source}
                              </span>
                              {task.skill && (
                                <span style={{ fontSize: '0.72rem', fontWeight: 500, color: 'var(--color-text-light)' }}>
                                  Topic: {task.skill}
                                </span>
                              )}
                            </div>

                            {/* Reasoning Text */}
                            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-light)', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Lightbulb size={12} color="var(--color-primary)" />
                              <strong>Why:</strong> {task.why}
                            </p>

                            {/* Replaced why explanation if any */}
                            {task.replacedWhy && (
                              <p style={{ fontSize: '0.78rem', color: 'var(--color-warning)', margin: '2px 0 0 0', fontStyle: 'italic' }}>
                                {task.replacedWhy}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ padding: 'var(--space-4) 0', textAlign: 'center', border: '1px dashed rgba(61,44,46,0.1)', borderRadius: 'var(--radius-md)' }}>
                        <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem', margin: 0 }}>
                          No active targets. Promote a suggestion below or create a custom mission!
                        </p>
                      </div>
                    )}
                  </div>

                  {/* SUGGESTED COACH MISSIONS SECTION */}
                  <div style={{ borderTop: '1px solid rgba(61,44,46,0.08)', paddingTop: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <HelpCircle size={16} color="var(--color-primary)" />
                      Suggestions pool from your AI Career Twin
                    </h4>
                    
                    {memory.suggestedMissions && memory.suggestedMissions.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {memory.suggestedMissions.slice(0, 3).map(sug => (
                          <div 
                            key={sug.id}
                            style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                              padding: '10px 14px', 
                              backgroundColor: 'rgba(61,44,46,0.02)',
                              border: '1px solid rgba(61,44,46,0.04)',
                              borderRadius: 'var(--radius-sm)'
                            }}
                          >
                            <div style={{ flex: 1, marginRight: 12 }}>
                              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-text)' }}>{sug.text}</span>
                                <span style={{ fontSize: '0.7rem', padding: '1px 5px', borderRadius: 3, backgroundColor: 'rgba(64, 158, 255, 0.1)', color: 'var(--color-primary)' }}>
                                  {sug.difficulty}
                                </span>
                                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-light)' }}>
                                  {sug.category}
                                </span>
                              </div>
                              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', margin: 0 }}>{sug.why}</p>
                            </div>
                            
                            <div style={{ display: 'flex', gap: 4 }}>
                              <button 
                                onClick={() => handlePromoteSuggestion(sug.id)}
                                title="Promote to active targets"
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--color-primary)', background: 'none', color: 'var(--color-primary)', cursor: 'pointer', borderRadius: '4px', width: 26, height: 26 }}
                                onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--color-primary)'}
                                onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                              >
                                +
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: 'var(--color-text-light)', fontSize: '0.85rem' }}>Analyzing profile to compile smart suggestions...</p>
                    )}
                  </div>

                  {/* MISSION HISTORY SECTION */}
                  {memory.missionHistory && memory.missionHistory.length > 0 && (
                    <div style={{ borderTop: '1px solid rgba(61,44,46,0.08)', paddingTop: 'var(--space-4)' }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Award size={16} color="var(--color-success)" />
                        Mission Accomplishments & History Log ({memory.missionHistory.length})
                      </h4>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 200, overflowY: 'auto', paddingRight: 4 }}>
                        {memory.missionHistory.slice().reverse().map((hist, idx) => (
                          <div 
                            key={hist.id || idx}
                            style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '10px 12px', 
                              backgroundColor: 'rgba(78, 139, 98, 0.03)',
                              border: '1px solid rgba(78, 139, 98, 0.08)',
                              borderRadius: 'var(--radius-sm)'
                            }}
                          >
                            <div>
                              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-text)' }}>
                                {hist.text}
                              </div>
                              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
                                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-light)' }}>
                                  Done: {hist.completedAt ? new Date(hist.completedAt).toLocaleDateString() : 'N/A'}
                                </span>
                                <span style={{ fontSize: '0.72rem', padding: '1px 5px', borderRadius: 3, backgroundColor: 'rgba(78, 139, 98, 0.1)', color: 'var(--color-success)' }}>
                                  {hist.difficulty}
                                </span>
                                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-light)' }}>
                                  {hist.category}
                                </span>
                                {hist.feedback && (
                                  <span style={{ fontSize: '0.72rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                                    Rating: {hist.feedback}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div>
                              {hist.evidence ? (
                                <a 
                                  href={hist.evidence.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  style={{ 
                                    fontSize: '0.78rem', 
                                    color: 'var(--color-primary)', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 3,
                                    textDecoration: 'none',
                                    fontWeight: 600
                                  }}
                                >
                                  <ExternalLink size={12} /> {hist.evidence.type}
                                </a>
                              ) : (
                                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', fontStyle: 'italic' }}>
                                  No evidence links
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ padding: 'var(--space-4) 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <p style={{ color: 'var(--color-text-light)', fontSize: '0.95rem', margin: 0 }}>
                    Complete profile analysis to unlock personalized missions.
                  </p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input 
                      type="text" 
                      placeholder="GitHub Username" 
                      value={githubInput} 
                      onChange={e => setGithubInput(e.target.value)} 
                      style={{ flex: 1, padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(61,44,46,0.1)', fontSize: '0.9rem' }} 
                    />
                    <Button size="sm" onClick={handleConnectGithub}>Connect</Button>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>

          {/* MISSION COMPLETION CHECK-IN MODAL */}
          {completingMission && (
            <div style={{ 
              position: 'fixed', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              backgroundColor: 'rgba(0,0,0,0.4)', 
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
                  borderRadius: 'var(--radius-lg)', 
                  padding: '28px', 
                  maxWidth: '480px', 
                  width: '100%', 
                  boxShadow: 'var(--shadow-lg)',
                  border: '1px solid rgba(61,44,46,0.1)'
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
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(61,44,46,0.15)', fontSize: '0.9rem' }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-light)', marginBottom: 6 }}>
                      Evidence Source Type
                    </label>
                    <select 
                      value={evidenceType}
                      onChange={e => setEvidenceType(e.target.value as any)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(61,44,46,0.15)', fontSize: '0.9rem' }}
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
                            border: feedbackVal === diff ? '2px solid var(--color-primary)' : '1px solid rgba(61,44,46,0.15)',
                            backgroundColor: feedbackVal === diff ? 'rgba(201,106,74,0.05)' : 'white',
                            color: feedbackVal === diff ? 'var(--color-primary)' : 'var(--color-text)',
                            fontWeight: feedbackVal === diff ? 700 : 500,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
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

          {/* REGENERATE / SKIP REASON MODAL */}
          {isConfirmSkipModalOpen && skippingMission && (
            <div style={{ 
              position: 'fixed', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              backgroundColor: 'rgba(0,0,0,0.4)', 
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
                  borderRadius: 'var(--radius-lg)', 
                  padding: '24px', 
                  maxWidth: '420px', 
                  width: '100%', 
                  boxShadow: 'var(--shadow-lg)',
                  border: '1px solid rgba(61,44,46,0.1)'
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
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(61,44,46,0.15)', fontSize: '0.9rem' }}
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

          {/* 4. Recent Activity Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card hoverEffect>
              <h3 style={{ fontSize: '1.1rem', marginBottom: 'var(--space-4)', color: 'var(--color-text-light)' }}>Recent Activity</h3>
              {memory.activities && memory.activities.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  {memory.activities.slice().reverse().map((act, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--color-primary)' }}></div>
                        <span style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--color-text)' }}>{act.label}</span>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>{formatTimestamp(act.timestamp)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: 'var(--space-4) 0', textAlign: 'center' }}>
                  <p style={{ color: 'var(--color-text-light)', fontSize: '0.95rem', margin: 0 }}>
                    No activity recorded yet.
                  </p>
                </div>
              )}
            </Card>
          </motion.div>

          {/* Tech Pulse */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
            <Card hoverEffect>
              <h3 style={{ fontSize: '1.1rem', marginBottom: 'var(--space-4)', color: 'var(--color-text-light)' }}>Tech Pulse</h3>
              {analysis ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-4)', padding: 'var(--space-4)', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-success)', marginBottom: '0.8rem' }}>Learn Now</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {analysis.techPulse?.now?.map((skill) => (
                        <span key={skill} style={{ fontWeight: 500 }}>{skill}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-warning)', marginBottom: '0.8rem' }}>Learn Later</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {analysis.techPulse?.later?.map((skill) => (
                        <span key={skill} style={{ fontWeight: 500 }}>{skill}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-danger)', marginBottom: '0.8rem' }}>Ignore</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {analysis.techPulse?.ignore?.map((skill) => (
                        <span key={skill} style={{ textDecoration: 'line-through', opacity: 0.5 }}>{skill}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ padding: 'var(--space-4) 0', textAlign: 'center' }}>
                  <p style={{ color: 'var(--color-text-light)', fontSize: '0.95rem', margin: 0 }}>
                    Complete profile analysis to view trending skills.
                  </p>
                </div>
              )}
            </Card>
          </motion.div>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;

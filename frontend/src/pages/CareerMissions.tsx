/**
 * CareerMissions.tsx
 * Nexora — Career Missions Page (Fully Functional)
 *
 * UI design is UNCHANGED from the original.
 * All state is now wired to CareerAgent (single source of truth).
 * Missions are dynamically generated from real gap analysis.
 * Checklist progress, rewards, streak, and roadmap all persist to localStorage.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useCareerAgent } from '../services/CareerAgent';
import {
  generateCareerMissions,
  recalculateUnlocks,
} from '../services/MissionGenerator';
import type { CareerMission } from '../services/MissionGenerator';

// ─── Framer Motion Variants ───────────────────────────────────────────────────

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const stagger: Variants = {
  show: { transition: { staggerChildren: 0.07 } },
};

// ─── Sub-components (unchanged visually) ─────────────────────────────────────

const StatusDot: React.FC = () => <span style={styles.statusDot} />;

const CheckItem: React.FC<{
  item: { id: string; label: string; done: boolean };
  onToggle: () => void;
  disabled: boolean;
}> = ({ item, onToggle, disabled }) => (
  <motion.div
    layout
    onClick={disabled ? undefined : onToggle}
    style={{
      ...styles.checkItem,
      opacity: item.done ? 0.6 : 1,
      cursor: disabled ? 'default' : 'pointer',
    }}
    whileHover={disabled ? {} : { backgroundColor: '#F8F3EC' }}
    whileTap={disabled ? {} : { scale: 0.99 }}
  >
    <motion.div
      style={{
        ...styles.checkBox,
        background: item.done ? 'var(--color-success, #2D7A4F)' : 'transparent',
        borderColor: item.done ? 'var(--color-success, #2D7A4F)' : '#D6C9B8',
      }}
      animate={{ scale: item.done ? [1, 1.2, 1] : 1 }}
      transition={{ duration: 0.2 }}
    >
      <AnimatePresence>
        {item.done && (
          <motion.svg
            key="check"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            width="11" height="8" viewBox="0 0 11 8" fill="none"
          >
            <path d="M1 4L4 7L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </motion.svg>
        )}
      </AnimatePresence>
    </motion.div>
    <span style={{
      ...styles.checkLabel,
      textDecoration: item.done ? 'line-through' : 'none',
      color: item.done ? 'var(--color-text-light, #9C8E7E)' : 'var(--color-text, #2C2218)',
    }}>
      {item.label}
    </span>
  </motion.div>
);

const RoadmapItem: React.FC<{
  mission: CareerMission;
  index: number;
  isLast: boolean;
  isCurrent: boolean;
  onSelect: () => void;
}> = ({ mission, isLast, isCurrent, onSelect }) => {
  const status = mission.completed ? 'done' : isCurrent ? 'active' : 'locked';

  const dotBg =
    status === 'done' ? 'var(--color-success, #2D7A4F)' :
    status === 'active' ? 'var(--color-primary, #C96A4A)' : '#EEE5DA';

  const dotShadow = status === 'active' ? '0 0 0 4px rgba(201,106,74,0.15)' : 'none';

  const nameColor =
    status === 'active' ? 'var(--color-primary, #C96A4A)' :
    status === 'locked' ? 'var(--color-text-light, #9C8E7E)' : 'var(--color-text, #2C2218)';

  return (
    <div
      onClick={mission.unlocked ? onSelect : undefined}
      style={{
        display: 'flex', gap: 14, position: 'relative',
        paddingBottom: isLast ? 0 : 4,
        cursor: mission.unlocked ? 'pointer' : 'default',
      }}
    >
      {!isLast && (
        <div style={{
          position: 'absolute', left: 11, top: 30,
          width: 2, height: 'calc(100% + 8px)',
          background: '#EEE5DA',
        }} />
      )}
      <div style={{
        width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
        background: dotBg, boxShadow: dotShadow,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: status === 'locked' ? 10 : 11,
        color: status === 'locked' ? '#9C8E7E' : '#fff',
        position: 'relative', zIndex: 1, marginTop: 2,
        border: status === 'locked' ? '2px solid #D6C9B8' : 'none',
      }}>
        {status === 'done' ? '✓' : status === 'active' ? '●' : ''}
      </div>
      <div style={{ flex: 1, paddingTop: 2, paddingBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: nameColor }}>{mission.title}</div>
        <div style={{ fontSize: 11, color: 'var(--color-text-light, #9C8E7E)', marginTop: 2 }}>
          {mission.sourceGap} · {mission.estimatedTime}
        </div>
      </div>
      {status !== 'locked' && (
        <span style={{
          fontSize: 10, fontWeight: 700,
          padding: '3px 9px', borderRadius: 4, alignSelf: 'flex-start', marginTop: 2,
          background: status === 'done' ? 'rgba(45,122,79,0.1)' : 'rgba(201,106,74,0.1)',
          color: status === 'done' ? 'var(--color-success, #2D7A4F)' : 'var(--color-primary, #C96A4A)',
        }}>
          {status === 'done' ? 'Done' : 'Active'}
        </span>
      )}
    </div>
  );
};

// Completion celebration overlay
const CompletionBanner: React.FC<{
  mission: CareerMission;
  onClaim: () => void;
}> = ({ mission, onClaim }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    style={{
      position: 'fixed', inset: 0, zIndex: 999,
      background: 'rgba(44,34,24,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(4px)',
    }}
  >
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.15 }}
      style={{
        background: '#FFFFFF', borderRadius: 20,
        padding: '40px 36px', maxWidth: 400, width: '90%',
        textAlign: 'center',
        boxShadow: '0 24px 80px rgba(44,34,24,0.2)',
      }}
    >
      <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
      <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, color: 'var(--color-text, #2C2218)' }}>
        Mission Complete!
      </div>
      <div style={{ fontSize: 15, color: 'var(--color-text-light, #9C8E7E)', marginBottom: 24, lineHeight: 1.6 }}>
        You completed <strong>{mission.title}</strong>
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
        <span style={{ ...styles.rewardChip }}>🎯 +{mission.careerGain} Career Score</span>
        <span style={{ ...styles.rewardChip }}>📈 +{mission.readinessGain}% Readiness</span>
        <span style={{ ...styles.rewardChip }}>🏅 {mission.rewardLabel}</span>
      </div>
      <motion.button
        style={styles.startBtn}
        onClick={onClaim}
        whileHover={{ y: -2, boxShadow: '0 8px 28px rgba(201,106,74,0.4)' }}
        whileTap={{ scale: 0.97 }}
      >
        Claim Reward & Continue →
      </motion.button>
    </motion.div>
  </motion.div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const WEEK_DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const CareerMissions: React.FC = () => {
  const { memory, updateMemory, addActivity } = useCareerAgent();

  // Generate missions from CareerAgent analysis (reactive to memory changes)
  const allMissions = useMemo(
    () => generateCareerMissions(memory, 7),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [memory.analysis, memory.missionProgress?.completedMissionIds?.length]
  );

  const mp = memory.missionProgress;

  // Which mission the user is currently viewing / working on
  const [selectedId, setSelectedId] = useState<string | null>(
    mp?.activeMissionId ?? allMissions.find((m) => m.unlocked && !m.completed)?.id ?? null
  );

  // Completion celebration state
  const [showCompletion, setShowCompletion] = useState(false);
  const [completedMission, setCompletedMission] = useState<CareerMission | null>(null);

  // Derive the currently selected mission (with live checklist from missionProgress)
  const activeMission = useMemo<CareerMission | null>(() => {
    const base = allMissions.find((m) => m.id === selectedId) ?? allMissions[0] ?? null;
    if (!base) return null;

    // Merge saved checklist for the active mission
    if (mp?.activeMissionId === base.id && mp.checklist.length > 0) {
      const mergedChecklist = base.checklist.map((item) => {
        const saved = mp.checklist.find((c) => c.id === item.id);
        return saved ? { ...item, done: saved.done } : item;
      });
      const doneCt = mergedChecklist.filter((c) => c.done).length;
      return {
        ...base,
        checklist: mergedChecklist,
        progress: Math.round((doneCt / mergedChecklist.length) * 100),
      };
    }
    return base;
  }, [allMissions, selectedId, mp]);

  // Sync selectedId to activeMissionId whenever it changes externally
  useEffect(() => {
    if (mp?.activeMissionId && mp.activeMissionId !== selectedId) {
      setSelectedId(mp.activeMissionId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mp?.activeMissionId]);

  const isActive = activeMission ? mp?.activeMissionId === activeMission.id : false;
  const isCompleted = activeMission?.completed ?? false;

  const doneCount = activeMission?.checklist.filter((i) => i.done).length ?? 0;
  const totalCount = activeMission?.checklist.length ?? 1;
  const progressPct = activeMission?.progress ?? 0;
  const xpFill = (mp?.careerScore ?? 0);

  // ── Actions ──────────────────────────────────────────────────────────────────

  const handleStartMission = useCallback(() => {
    if (!activeMission) return;
    updateMemory((prev) => ({
      ...prev,
      missionProgress: {
        ...prev.missionProgress,
        activeMissionId: activeMission.id,
        startedAt: new Date().toISOString(),
        checklist: activeMission.checklist.map((item) => ({ ...item, done: false })),
      },
    }));
    addActivity(`Started Mission: ${activeMission.title}`);
  }, [activeMission, updateMemory, addActivity]);

  const handleToggleCheckItem = useCallback((itemId: string) => {
    if (!activeMission || !isActive) return;

    updateMemory((prev) => {
      const currentChecklist = prev.missionProgress.checklist.length > 0
        ? prev.missionProgress.checklist
        : activeMission.checklist.map((i) => ({ ...i }));

      const updatedChecklist = currentChecklist.map((item) =>
        item.id === itemId ? { ...item, done: !item.done } : item
      );

      const allDone = updatedChecklist.every((i) => i.done);
      const doneCt = updatedChecklist.filter((i) => i.done).length;
      const progress = Math.round((doneCt / updatedChecklist.length) * 100);

      // If all done, trigger completion (handled below via effect)
      return {
        ...prev,
        missionProgress: {
          ...prev.missionProgress,
          checklist: updatedChecklist,
        },
      };
    });

    // Check if everything just became done
    setTimeout(() => {
      const latest = (() => {
        try {
          const raw = localStorage.getItem('nexora_agent_memory');
          return raw ? JSON.parse(raw) : null;
        } catch { return null; }
      })();
      if (!latest) return;
      const cl = latest.missionProgress?.checklist ?? [];
      if (cl.length > 0 && cl.every((i: any) => i.done)) {
        setCompletedMission(activeMission);
        setShowCompletion(true);
      }
    }, 50);
  }, [activeMission, isActive, updateMemory]);

  const handleClaimReward = useCallback(() => {
    if (!completedMission) return;
    setShowCompletion(false);

    updateMemory((prev) => {
      const already = prev.missionProgress.completedMissionIds ?? [];
      if (already.includes(completedMission.id)) return prev;

      const newCompleted = [...already, completedMission.id];
      const newScore = Math.min(100, (prev.missionProgress.careerScore ?? prev.analysis?.readiness ?? 0) + completedMission.careerGain);
      const newXp = (prev.missionProgress.xp ?? 0) + completedMission.careerGain * 10;
      const newReadiness = Math.min(100, (prev.analysis?.readiness ?? 0) + completedMission.readinessGain);
      const newPortfolio = completedMission.category === 'Project'
        ? (prev.missionProgress.portfolioProjects ?? 0) + 1
        : (prev.missionProgress.portfolioProjects ?? 0);

      // Streak update
      const today = new Date().toDateString();
      const lastDate = prev.missionProgress.lastActivityDate;
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const newStreak = lastDate === yesterday || lastDate === today
        ? (prev.missionProgress.streak ?? 0) + 1
        : 1;

      // Weekly activity
      const dayIndex = (new Date().getDay() + 6) % 7; // Mon = 0
      const weeklyActivity = [...(prev.missionProgress.weeklyActivity ?? [false, false, false, false, false, false, false])];
      weeklyActivity[dayIndex] = true;

      // Reduce the gap in analysis
      const updatedGaps = (prev.analysis?.gaps ?? []).filter(
        (g) => g.toLowerCase() !== completedMission.sourceGap.toLowerCase()
      );

      // Achievement label
      const xpTotal = newXp;
      const achievement =
        xpTotal >= 500 ? 'Career Champion' :
        xpTotal >= 300 ? 'Rising Star' :
        xpTotal >= 150 ? 'Momentum Builder' :
        xpTotal >= 50 ? 'Getting Started' : 'Just Getting Started';

      return {
        ...prev,
        analysis: prev.analysis
          ? {
              ...prev.analysis,
              readiness: newReadiness,
              careerReadiness: newReadiness,
              gaps: updatedGaps,
            }
          : prev.analysis,
        activities: [
          ...prev.activities,
          {
            id: Math.random().toString(36).substr(2, 9),
            label: `Completed Mission: ${completedMission.title} (+${completedMission.careerGain} Career Score)`,
            timestamp: new Date().toISOString(),
          },
        ],
        missionProgress: {
          ...prev.missionProgress,
          activeMissionId: null,
          startedAt: null,
          checklist: [],
          completedMissionIds: newCompleted,
          xp: newXp,
          careerScore: newScore,
          streak: newStreak,
          achievement,
          portfolioProjects: newPortfolio,
          weeklyActivity,
          lastActivityDate: today,
        },
      };
    });

    addActivity(`Claimed reward: ${completedMission.rewardLabel}`);
    setCompletedMission(null);

    // Auto-advance to next unlocked mission
    setTimeout(() => {
      const nextMission = allMissions.find(
        (m) => !m.completed && m.id !== completedMission.id
      );
      if (nextMission) setSelectedId(nextMission.id);
    }, 100);
  }, [completedMission, updateMemory, addActivity, allMissions]);

  // ── Derived sidebar data ──────────────────────────────────────────────────────

  const completedCount = allMissions.filter((m) => m.completed).length;
  const upcomingMissions = allMissions.filter(
    (m) => !m.completed && m.id !== activeMission?.id
  ).slice(0, 3);

  // ── Early state: not analyzed ─────────────────────────────────────────────────

  if (!memory.isAnalyzed) {
    return (
      <div style={{ ...styles.page, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🚀</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12, color: 'var(--color-text, #2C2218)' }}>
            Complete Your Analysis First
          </h2>
          <p style={{ fontSize: 14, color: 'var(--color-text-light, #9C8E7E)', lineHeight: 1.6 }}>
            Career Missions are generated from your real skill gaps. Connect your resume, GitHub, or LinkedIn and run an analysis to unlock your personalized mission path.
          </p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div style={styles.page}>

      {/* Completion overlay */}
      <AnimatePresence>
        {showCompletion && completedMission && (
          <CompletionBanner
            mission={completedMission}
            onClaim={handleClaimReward}
          />
        )}
      </AnimatePresence>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <motion.div style={styles.hero} initial="hidden" animate="show" variants={stagger}>
        <div style={styles.heroGlow} />

        <motion.span variants={fadeUp} style={styles.eyebrow}>
          🚀 AI Career Operating System
        </motion.span>

        <motion.h1 variants={fadeUp} style={styles.heroTitle}>
          Career Missions
        </motion.h1>

        <motion.p variants={fadeUp} style={styles.heroSubtitle}>
          Complete real-world missions generated from your analysis to close skill gaps,
          grow your portfolio, and raise your career score.
        </motion.p>

        <motion.div variants={fadeUp} style={styles.badgeRow}>
          <span style={{ ...styles.badge, ...styles.badgeOrange }}>
            🔥 {completedCount} of {allMissions.length} Completed
          </span>
          <span style={{ ...styles.badge, ...styles.badgeAmber }}>
            ⚡ {mp?.streak ?? 0} Day Streak
          </span>
          <span style={{ ...styles.badge, ...styles.badgeSuccess }}>
            📈 +{allMissions.reduce((s, m) => m.completed ? s + m.careerGain : s, 0)} Career Score Earned
          </span>
        </motion.div>

        <motion.button
          variants={fadeUp}
          style={styles.heroCta}
          whileHover={{ y: -2, boxShadow: '0 8px 28px rgba(201,106,74,0.4)' }}
          whileTap={{ scale: 0.97 }}
          onClick={() => document.getElementById('mission-card')?.scrollIntoView({ behavior: 'smooth' })}
        >
          {isActive ? 'Continue Mission →' : 'Start Today\'s Mission →'}
        </motion.button>

        {/* XP strip */}
        <motion.div variants={fadeUp} style={styles.xpStrip}>
          <span style={styles.xpLabel}>Career Score</span>
          <div style={styles.xpTrack}>
            <motion.div
              style={styles.xpFill}
              animate={{ width: `${Math.min(100, xpFill)}%` }}
              transition={{ duration: 0.6 }}
            />
          </div>
          <span style={styles.xpScore}>{Math.min(100, xpFill)} / 100</span>
        </motion.div>
      </motion.div>

      {/* ── MAIN GRID ─────────────────────────────────────────────────── */}
      <div style={styles.mainGrid}>

        {/* LEFT COLUMN */}
        <motion.div style={styles.leftCol} initial="hidden" animate="show" variants={stagger}>

          {/* TODAY'S MISSION CARD */}
          {activeMission && (
            <motion.div variants={fadeUp} id="mission-card" style={styles.missionCard}>
              <div style={styles.missionAccentBar} />
              <div style={styles.missionTop}>
                <div>
                  <div style={styles.cardLabel}>
                    {isCompleted ? 'Completed Mission' : isActive ? 'Active Mission' : 'Next Mission'}
                  </div>
                  <h2 style={styles.missionTitle}>{activeMission.title}</h2>
                </div>
                <div style={{
                  ...styles.statusPill,
                  background: isCompleted ? 'rgba(45,122,79,0.08)' : isActive ? 'rgba(201,106,74,0.08)' : 'rgba(44,34,24,0.05)',
                  borderColor: isCompleted ? 'rgba(45,122,79,0.25)' : isActive ? 'rgba(201,106,74,0.25)' : '#EEE5DA',
                  color: isCompleted ? 'var(--color-success, #2D7A4F)' : isActive ? 'var(--color-primary, #C96A4A)' : 'var(--color-text-light, #9C8E7E)',
                }}>
                  <StatusDot />
                  {isCompleted ? 'Complete' : isActive ? 'In Progress' : 'Ready to Start'}
                </div>
              </div>

              <p style={{ fontSize: 13, color: 'var(--color-text-light, #9C8E7E)', lineHeight: 1.6, marginBottom: 16 }}>
                {activeMission.description}
              </p>

              <div style={styles.metaRow}>
                {[
                  { label: 'Difficulty', val: activeMission.difficulty, valColor: activeMission.difficulty === 'Advanced' ? '#C96A4A' : activeMission.difficulty === 'Intermediate' ? '#B07D2A' : '#2D7A4F' },
                  { label: 'Est. Time', val: activeMission.estimatedTime, valColor: undefined },
                  { label: 'Mission', val: `#${allMissions.findIndex(m => m.id === activeMission.id) + 1} of ${allMissions.length}`, valColor: undefined },
                ].map((m) => (
                  <div key={m.label} style={styles.metaPill}>
                    <span style={styles.metaLabel}>{m.label}</span>
                    <span style={{ ...styles.metaVal, color: m.valColor ?? 'var(--color-text, #2C2218)' }}>
                      {m.val}
                    </span>
                  </div>
                ))}
              </div>

              <div style={styles.skillRow}>
                {activeMission.skillsImproved.slice(0, 4).map((s) => (
                  <span key={s} style={styles.skillTag}>{s}</span>
                ))}
              </div>

              <div style={styles.rewardRow}>
                <span style={styles.rewardChip}>🎯 +{activeMission.careerGain} Career Score</span>
                {activeMission.category === 'Project' && (
                  <span style={styles.rewardChip}>💼 +1 Portfolio Project</span>
                )}
                <span style={styles.rewardChip}>🏅 {activeMission.rewardLabel}</span>
              </div>

              {!isCompleted && !isActive && (
                <motion.button
                  style={styles.startBtn}
                  whileHover={{ y: -2, boxShadow: '0 8px 28px rgba(201,106,74,0.4)' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleStartMission}
                >
                  ⚡ Start Mission
                </motion.button>
              )}

              {isActive && !isCompleted && (
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{
                    flex: 1, background: '#F0E8DF', borderRadius: 100, height: 6, overflow: 'hidden',
                  }}>
                    <motion.div
                      style={{ height: '100%', borderRadius: 100, background: 'var(--color-primary, #C96A4A)' }}
                      animate={{ width: `${progressPct}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary, #C96A4A)', whiteSpace: 'nowrap' }}>
                    {progressPct}% done
                  </span>
                </div>
              )}

              {isCompleted && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'rgba(45,122,79,0.08)', border: '1px solid rgba(45,122,79,0.25)',
                  borderRadius: 10, padding: '10px 18px',
                  fontSize: 14, fontWeight: 700, color: 'var(--color-success, #2D7A4F)',
                }}>
                  ✓ Mission Completed — Reward Claimed
                </div>
              )}
            </motion.div>
          )}

          {/* CHECKLIST */}
          {activeMission && (
            <motion.div variants={fadeUp} style={styles.card}>
              <div style={styles.sectionHeader}>
                <span style={styles.secTitle}>Mission Checklist</span>
                <span style={styles.secTag}>{progressPct}% done</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                {activeMission.checklist.map((item) => (
                  <CheckItem
                    key={item.id}
                    item={item}
                    onToggle={() => handleToggleCheckItem(item.id)}
                    disabled={!isActive || isCompleted}
                  />
                ))}
              </div>
              {!isActive && !isCompleted && (
                <p style={{ fontSize: 12, color: 'var(--color-text-light, #9C8E7E)', fontStyle: 'italic' }}>
                  Start the mission above to unlock the checklist.
                </p>
              )}
              <div>
                <div style={styles.progressLabel}>
                  <span>Progress</span>
                  <span>{doneCount} of {totalCount} tasks</span>
                </div>
                <div style={styles.progressTrack}>
                  <motion.div
                    style={styles.progressFill}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* ROADMAP */}
          <motion.div variants={fadeUp} style={styles.card}>
            <div style={styles.sectionHeader}>
              <span style={styles.secTitle}>Mission Roadmap</span>
              <span style={{ fontSize: 12, color: 'var(--color-text-light, #9C8E7E)' }}>
                {allMissions.length} missions total
              </span>
            </div>
            {allMissions.map((mission, i) => (
              <RoadmapItem
                key={mission.id}
                mission={mission}
                index={i}
                isLast={i === allMissions.length - 1}
                isCurrent={mission.id === activeMission?.id}
                onSelect={() => {
                  if (mission.unlocked) setSelectedId(mission.id);
                }}
              />
            ))}
          </motion.div>

          {/* REWARDS */}
          <motion.div variants={fadeUp} style={styles.card}>
            <div style={styles.cardLabel}>Your Rewards</div>
            <div style={styles.rewardsGrid}>
              {[
                { icon: '🏅', val: mp?.achievement ?? 'Just Getting Started', key: 'Achievement' },
                { icon: '🔥', val: `${mp?.streak ?? 0} Days`, key: 'Current streak' },
                { icon: '⭐', val: `${mp?.xp ?? 0} XP`, key: 'Total experience' },
                { icon: '🎯', val: `${Math.min(100, mp?.careerScore ?? 0)} / 100`, key: 'Career score', primary: true },
              ].map((r) => (
                <motion.div
                  key={r.key}
                  style={styles.rewardCardItem}
                  whileHover={{ borderColor: '#C96A4A', boxShadow: '0 4px 12px rgba(201,106,74,0.1)' }}
                >
                  <span style={{ fontSize: 22, marginBottom: 4 }}>{r.icon}</span>
                  <span style={{
                    fontSize: 17, fontWeight: 800, letterSpacing: '-0.02em',
                    color: r.primary ? 'var(--color-primary, #C96A4A)' : 'var(--color-text, #2C2218)',
                  }}>
                    {r.val}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--color-text-light, #9C8E7E)', fontWeight: 500 }}>
                    {r.key}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* WHY THIS MISSION MATTERS */}
          {activeMission && (
            <motion.div variants={fadeUp} style={styles.whyCard}>
              <div style={styles.sectionHeader}>
                <span style={styles.secTitle}>Why This Mission Matters</span>
                <span style={{ fontSize: 20 }}>💡</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--color-text-light, #9C8E7E)', lineHeight: 1.6, marginBottom: 16 }}>
                {activeMission.why}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {activeMission.whyPoints.map((text) => (
                  <div key={text} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: 'var(--color-success, #2D7A4F)',
                      flexShrink: 0, marginTop: 5,
                    }} />
                    <span style={{ fontSize: 13, color: 'var(--color-text, #2C2218)' }}>{text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

        </motion.div>

        {/* RIGHT SIDEBAR */}
        <motion.div style={styles.rightCol} initial="hidden" animate="show" variants={stagger}>

          {/* AI COACH */}
          {activeMission && (
            <motion.div variants={fadeUp} style={styles.aiCoachCard}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={styles.coachAvatar}>🤖</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text, #2C2218)' }}>
                    Nexora AI Coach
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-light, #9C8E7E)' }}>
                    Mission Recommendation
                  </div>
                </div>
              </div>
              <div style={styles.coachQuote}>
                "Completing {activeMission.title.toLowerCase()} directly closes the
                '{activeMission.sourceGap}' gap in your profile and adds +{activeMission.careerGain} to your Career Score."
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'Readiness gain', val: `+${activeMission.readinessGain}%`, success: true },
                  { label: 'Est. completion', val: activeMission.estimatedTime, success: false },
                  { label: 'Career score gain', val: `+${activeMission.careerGain} pts`, success: true },
                  { label: 'Category', val: activeMission.category, success: false },
                ].map((s) => (
                  <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: 'var(--color-text-light, #9C8E7E)' }}>{s.label}</span>
                    <span style={{
                      fontSize: 13, fontWeight: 700,
                      color: s.success ? 'var(--color-success, #2D7A4F)' : 'var(--color-text, #2C2218)',
                    }}>
                      {s.val}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* WEEKLY ACTIVITY */}
          <motion.div variants={fadeUp} style={styles.card}>
            <div style={styles.cardLabel}>Weekly Activity</div>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'space-between' }}>
              {WEEK_DAYS.map((d, i) => {
                const todayIndex = (new Date().getDay() + 6) % 7;
                const isActive2 = mp?.weeklyActivity?.[i] ?? false;
                const isCurrent = i === todayIndex;
                return (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, flex: 1 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: isActive2
                        ? 'var(--color-primary, #C96A4A)'
                        : isCurrent
                          ? 'rgba(201,106,74,0.15)'
                          : '#F0E8DF',
                      border: isCurrent ? '2px solid var(--color-primary, #C96A4A)' : 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700,
                      color: isActive2 ? '#fff' : isCurrent ? 'var(--color-primary, #C96A4A)' : '#C4B5A5',
                    }}>
                      {isActive2 ? '✓' : isCurrent ? '•' : ''}
                    </div>
                    <span style={{ fontSize: 10, color: 'var(--color-text-light, #9C8E7E)', fontWeight: 600 }}>{d}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* SKILLS YOU'LL GAIN */}
          {activeMission && (
            <motion.div variants={fadeUp} style={styles.card}>
              <div style={styles.sectionHeader}>
                <span style={styles.secTitle}>Skills You'll Gain</span>
                <span style={{ fontSize: 18 }}>🎓</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {activeMission.skillsImproved.map((skill) => (
                  <div
                    key={skill}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '9px 12px', borderRadius: 10,
                      background: '#F8F3EC', border: '1px solid #EEE5DA',
                    }}
                  >
                    <div style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: 'var(--color-primary, #C96A4A)', flexShrink: 0,
                    }} />
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text, #2C2218)' }}>
                      {skill}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* DETECTED GAPS CLOSING */}
          {memory.analysis?.gaps && memory.analysis.gaps.length > 0 && (
            <motion.div variants={fadeUp} style={styles.card}>
              <div style={styles.sectionHeader}>
                <span style={styles.secTitle}>Gaps Being Closed</span>
                <span style={{ fontSize: 12, color: 'var(--color-text-light, #9C8E7E)' }}>
                  {allMissions.filter(m => m.completed).length} closed
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {memory.analysis.gaps.slice(0, 5).map((gap) => {
                  const closed = allMissions.some(m => m.completed && m.sourceGap.toLowerCase() === gap.toLowerCase());
                  return (
                    <div key={gap} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 12px', borderRadius: 10,
                      background: closed ? 'rgba(45,122,79,0.06)' : '#F8F3EC',
                      border: `1px solid ${closed ? 'rgba(45,122,79,0.2)' : '#EEE5DA'}`,
                    }}>
                      <span style={{ fontSize: 12 }}>{closed ? '✅' : '⚠️'}</span>
                      <span style={{
                        fontSize: 12, fontWeight: 500, flex: 1,
                        color: closed ? 'var(--color-success, #2D7A4F)' : 'var(--color-text, #2C2218)',
                        textDecoration: closed ? 'line-through' : 'none',
                      }}>
                        {gap}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

        </motion.div>
      </div>

      {/* ── UPCOMING MISSIONS ────────────────────────────────────────── */}
      {upcomingMissions.length > 0 && (
        <motion.div
          style={styles.upcomingSection}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
        >
          <motion.div variants={fadeUp} style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 style={styles.sectionTitle}>Upcoming AI Missions</h2>
            <span style={styles.unlocksTag}>
              {allMissions.filter(m => !m.unlocked).length} locked
            </span>
          </motion.div>
          <motion.p variants={fadeUp} style={styles.sectionSub}>
            Generated from your real skill gaps — complete active missions to unlock these.
          </motion.p>
          <motion.div
            style={{ ...styles.upcomingGrid, gridTemplateColumns: `repeat(${Math.min(upcomingMissions.length, 3)}, 1fr)` }}
            variants={stagger}
          >
            {upcomingMissions.map((m) => (
              <motion.div
                key={m.id}
                variants={fadeUp}
                whileHover={m.unlocked ? { y: -3, boxShadow: '0 8px 24px rgba(44,34,24,0.1)', borderColor: '#D6C9B8' } : {}}
                style={{ ...styles.upcomingCard, cursor: m.unlocked ? 'pointer' : 'default' }}
                onClick={() => m.unlocked && setSelectedId(m.id)}
              >
                <span style={styles.lockBadge}>
                  {m.unlocked ? '🔓 Unlocked' : '🔒 Locked'}
                </span>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{m.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, color: 'var(--color-text, #2C2218)' }}>
                  {m.title}
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-light, #9C8E7E)' }}>
                  {m.unlocked ? 'Click to view this mission' : `Unlock after completing ${allMissions[allMissions.findIndex(a => a.id === m.id) - 1]?.title ?? 'current mission'}`}
                </div>
                <div style={styles.upcomingDivider} />
                <div style={{ fontSize: 11, color: 'var(--color-text-light, #9C8E7E)', marginBottom: 8 }}>
                  Skills you'll gain
                </div>
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                  {m.skillsImproved.slice(0, 4).map((s) => (
                    <span key={s} style={styles.upcomingSkill}>{s}</span>
                  ))}
                </div>
                <div style={{ marginTop: 14, fontSize: 12, color: 'var(--color-text-light, #9C8E7E)' }}>
                  ⚡ {m.estimatedTime}&nbsp;·&nbsp;+{m.careerGain} Career Score
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}

    </div>
  );
};

// ─── Styles — Nexora Light Design System (unchanged) ─────────────────────────

const styles: Record<string, React.CSSProperties> = {
  page: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    background: '#F8F3EC',
    color: 'var(--color-text, #2C2218)',
    minHeight: '100vh',
    paddingBottom: 80,
  },
  hero: {
    padding: '56px 32px 40px',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    top: -40, left: '50%',
    transform: 'translateX(-50%)',
    width: 500, height: 260,
    background: 'radial-gradient(ellipse at center, rgba(201,106,74,0.09) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  eyebrow: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    background: 'rgba(201,106,74,0.08)',
    border: '1px solid rgba(201,106,74,0.25)',
    borderRadius: 100, padding: '5px 14px',
    fontSize: 12, fontWeight: 700,
    color: 'var(--color-primary, #C96A4A)',
    letterSpacing: '0.08em', textTransform: 'uppercase',
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 48, fontWeight: 800, lineHeight: 1.05,
    letterSpacing: '-0.03em',
    color: 'var(--color-text, #2C2218)',
    marginBottom: 14,
  },
  heroSubtitle: {
    fontSize: 16, color: 'var(--color-text-light, #9C8E7E)',
    maxWidth: 480, margin: '0 auto 32px', lineHeight: 1.65,
  },
  badgeRow: {
    display: 'flex', gap: 10, justifyContent: 'center',
    flexWrap: 'wrap', marginBottom: 32,
  },
  badge: {
    display: 'flex', alignItems: 'center', gap: 7,
    borderRadius: 100, padding: '7px 14px',
    fontSize: 13, fontWeight: 600, border: '1px solid',
  },
  badgeOrange: {
    background: 'rgba(201,106,74,0.08)',
    borderColor: 'rgba(201,106,74,0.25)',
    color: 'var(--color-primary, #C96A4A)',
  },
  badgeAmber: {
    background: 'rgba(176,125,42,0.08)',
    borderColor: 'rgba(176,125,42,0.25)',
    color: '#8A6020',
  },
  badgeSuccess: {
    background: 'rgba(45,122,79,0.08)',
    borderColor: 'rgba(45,122,79,0.25)',
    color: 'var(--color-success, #2D7A4F)',
  },
  heroCta: {
    display: 'inline-flex', alignItems: 'center', gap: 9,
    background: 'var(--color-primary, #C96A4A)', color: '#fff', border: 'none',
    borderRadius: 10, padding: '13px 26px',
    fontSize: 15, fontWeight: 700, cursor: 'pointer',
    letterSpacing: '-0.01em',
    boxShadow: '0 4px 16px rgba(201,106,74,0.3)',
  },
  xpStrip: {
    display: 'flex', alignItems: 'center', gap: 12,
    background: '#FFFFFF',
    border: '1px solid #EEE5DA',
    borderRadius: 12, padding: '12px 20px',
    margin: '20px auto 0', maxWidth: 460,
    boxShadow: '0 1px 4px rgba(44,34,24,0.06)',
  },
  xpLabel: { fontSize: 12, color: 'var(--color-text-light, #9C8E7E)', whiteSpace: 'nowrap' },
  xpTrack: { flex: 1, background: '#F0E8DF', borderRadius: 100, height: 7, overflow: 'hidden' },
  xpFill: { height: '100%', background: 'var(--color-primary, #C96A4A)', borderRadius: 100 },
  xpScore: { fontSize: 14, fontWeight: 800, color: 'var(--color-primary, #C96A4A)' },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 280px',
    gap: 20,
    padding: '0 24px',
    maxWidth: 1100,
    margin: '0 auto',
  },
  leftCol: { display: 'flex', flexDirection: 'column', gap: 18 },
  rightCol: { display: 'flex', flexDirection: 'column', gap: 18 },
  card: {
    background: '#FFFFFF',
    border: '1px solid #EEE5DA',
    borderRadius: 16,
    padding: 24,
    boxShadow: '0 1px 4px rgba(44,34,24,0.05)',
  },
  cardLabel: {
    fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
    textTransform: 'uppercase', color: 'var(--color-text-light, #9C8E7E)',
    marginBottom: 16,
  },
  sectionHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 16,
  },
  secTitle: { fontSize: 14, fontWeight: 700, color: 'var(--color-text, #2C2218)' },
  secTag: {
    fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100,
    background: 'rgba(201,106,74,0.08)',
    color: 'var(--color-primary, #C96A4A)',
    border: '1px solid rgba(201,106,74,0.2)',
  },
  missionCard: {
    background: '#FFFFFF',
    border: '1px solid #EEE5DA',
    borderRadius: 16, padding: 28,
    position: 'relative', overflow: 'hidden',
    boxShadow: '0 2px 12px rgba(44,34,24,0.07)',
  },
  missionAccentBar: {
    position: 'absolute', top: 0, left: 0,
    width: 4, height: '100%',
    background: 'var(--color-primary, #C96A4A)',
    borderRadius: '16px 0 0 16px',
  },
  missionTop: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 20,
  },
  missionTitle: {
    fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em',
    color: 'var(--color-text, #2C2218)',
  },
  statusPill: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: 'rgba(45,122,79,0.08)',
    border: '1px solid rgba(45,122,79,0.25)',
    borderRadius: 100, padding: '5px 12px',
    fontSize: 12, fontWeight: 600,
    color: 'var(--color-success, #2D7A4F)',
  },
  statusDot: {
    display: 'inline-block',
    width: 6, height: 6, borderRadius: '50%',
    background: 'currentColor',
  },
  metaRow: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 },
  metaPill: {
    background: '#F8F3EC',
    border: '1px solid #EEE5DA',
    borderRadius: 8, padding: '6px 12px',
    display: 'flex', flexDirection: 'column', gap: 2,
  },
  metaLabel: { fontSize: 10, color: 'var(--color-text-light, #9C8E7E)', fontWeight: 500 },
  metaVal: { fontSize: 13, fontWeight: 700 },
  skillRow: { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 },
  skillTag: {
    background: 'rgba(201,106,74,0.08)',
    border: '1px solid rgba(201,106,74,0.2)',
    borderRadius: 6, padding: '4px 10px',
    fontSize: 12, fontWeight: 500,
    color: 'var(--color-primary, #C96A4A)',
  },
  rewardRow: { display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 },
  rewardChip: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: 'rgba(201,106,74,0.08)',
    border: '1px solid rgba(201,106,74,0.2)',
    borderRadius: 8, padding: '6px 12px',
    fontSize: 12, fontWeight: 700,
    color: 'var(--color-primary, #C96A4A)',
  },
  startBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 9,
    background: 'var(--color-primary, #C96A4A)', color: '#fff', border: 'none',
    borderRadius: 10, padding: '12px 22px',
    fontSize: 14, fontWeight: 700, cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(201,106,74,0.25)',
  },
  checkItem: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '11px 14px', borderRadius: 10,
    background: '#FDFAF7',
    border: '1px solid #EEE5DA',
    transition: 'background 0.15s',
  },
  checkBox: {
    width: 20, height: 20, borderRadius: 6,
    border: '2px solid #D6C9B8',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  checkLabel: { fontSize: 14, fontWeight: 500 },
  progressLabel: {
    display: 'flex', justifyContent: 'space-between',
    fontSize: 12, color: 'var(--color-text-light, #9C8E7E)', marginBottom: 8,
  },
  progressTrack: { background: '#F0E8DF', borderRadius: 100, height: 6, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 100, background: 'var(--color-primary, #C96A4A)' },
  rewardsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  rewardCardItem: {
    background: '#FDFAF7',
    border: '1px solid #EEE5DA',
    borderRadius: 12, padding: 16,
    display: 'flex', flexDirection: 'column', gap: 4,
    cursor: 'default',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  whyCard: {
    background: '#FFFFFF',
    border: '1px solid #EEE5DA',
    borderLeft: '4px solid var(--color-primary, #C96A4A)',
    borderRadius: 16, padding: 24,
    boxShadow: '0 1px 4px rgba(44,34,24,0.05)',
  },
  aiCoachCard: {
    background: '#FFFFFF',
    border: '1px solid #EEE5DA',
    borderRadius: 16, padding: 22,
    boxShadow: '0 1px 4px rgba(44,34,24,0.05)',
  },
  coachAvatar: {
    width: 36, height: 36, borderRadius: '50%',
    background: 'rgba(201,106,74,0.12)',
    border: '1px solid rgba(201,106,74,0.25)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 16,
  },
  coachQuote: {
    background: '#F8F3EC',
    borderLeft: '3px solid var(--color-primary, #C96A4A)',
    borderRadius: '0 8px 8px 0',
    padding: '12px 14px',
    fontSize: 13, color: 'var(--color-text-light, #9C8E7E)',
    lineHeight: 1.6, marginBottom: 16,
    fontStyle: 'italic',
  },
  upcomingSection: {
    padding: '0 24px',
    maxWidth: 1100,
    margin: '20px auto 0',
  },
  sectionTitle: {
    fontSize: 20, fontWeight: 800, letterSpacing: '-0.01em',
    color: 'var(--color-text, #2C2218)',
  },
  unlocksTag: {
    fontSize: 12, color: 'var(--color-text-light, #9C8E7E)',
    background: '#FFFFFF',
    border: '1px solid #EEE5DA',
    borderRadius: 6, padding: '3px 10px',
  },
  sectionSub: {
    fontSize: 13, color: 'var(--color-text-light, #9C8E7E)',
    marginBottom: 20, marginTop: 4,
  },
  upcomingGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 14,
  },
  upcomingCard: {
    background: '#FFFFFF',
    border: '1px solid #EEE5DA',
    borderRadius: 16, padding: 24,
    boxShadow: '0 1px 4px rgba(44,34,24,0.05)',
    transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
  },
  lockBadge: {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    background: '#F8F3EC',
    border: '1px solid #EEE5DA',
    borderRadius: 100, padding: '4px 10px',
    fontSize: 11, fontWeight: 600,
    color: 'var(--color-text-light, #9C8E7E)',
    marginBottom: 14,
  },
  upcomingDivider: { height: 1, background: '#EEE5DA', margin: '14px 0' },
  upcomingSkill: {
    fontSize: 10, fontWeight: 500,
    color: 'var(--color-primary, #C96A4A)',
    background: 'rgba(201,106,74,0.08)',
    border: '1px solid rgba(201,106,74,0.2)',
    borderRadius: 4, padding: '3px 7px',
  },
};

export default CareerMissions;

/**
 * CareerMissions.tsx
 * Nexora — Career Missions Page
 * Restyled to Nexora light design system (warm cream, white cards, orange accent)
 * Layout, structure, animations and content unchanged.
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChecklistItem {
    id: string;
    label: string;
    done: boolean;
}

interface RoadmapNode {
    id: string;
    title: string;
    subtitle: string;
    status: "done" | "active" | "locked";
}

interface UpcomingMission {
    id: string;
    icon: string;
    title: string;
    unlockAfter: string;
    skills: string[];
    time: string;
    careerScore: string;
}

// ─── Static Data ──────────────────────────────────────────────────────────────

const CHECKLIST_ITEMS: ChecklistItem[] = [
    { id: "c1", label: "Design the API schema and routes", done: false },
    { id: "c2", label: "Implement CRUD endpoints", done: false },
    { id: "c3", label: "Test with Postman or Thunder Client", done: false },
    { id: "c4", label: "Deploy to Render or Railway", done: false },
    { id: "c5", label: "Push final code to GitHub", done: false },
];

const ROADMAP: RoadmapNode[] = [
    { id: "r1", title: "Resume Optimization", subtitle: "Tailored for ATS + recruiters", status: "done" },
    { id: "r2", title: "GitHub Profile Revamp", subtitle: "Pinned repos, README, activity", status: "done" },
    { id: "r3", title: "URL Shortener API", subtitle: "REST API with Node.js + MongoDB", status: "active" },
    { id: "r4", title: "Authentication System", subtitle: "JWT + OAuth 2.0", status: "locked" },
    { id: "r5", title: "Docker Deployment", subtitle: "Containerize your backend", status: "locked" },
    { id: "r6", title: "Kubernetes Orchestration", subtitle: "Scale to production", status: "locked" },
    { id: "r7", title: "System Design Interview", subtitle: "Design at scale", status: "locked" },
];

const UPCOMING_MISSIONS: UpcomingMission[] = [
    {
        id: "u1",
        icon: "🔐",
        title: "Build an Authentication System",
        unlockAfter: "Unlock after completing today's mission",
        skills: ["JWT", "OAuth 2.0", "bcrypt", "Sessions"],
        time: "60 min",
        careerScore: "+4",
    },
    {
        id: "u2",
        icon: "🐳",
        title: "Dockerize Your Backend",
        unlockAfter: "Unlock after Mission 4",
        skills: ["Docker", "Compose", "Containers", "CI/CD"],
        time: "90 min",
        careerScore: "+5",
    },
    {
        id: "u3",
        icon: "☸️",
        title: "Deploy on Kubernetes",
        unlockAfter: "Unlock after Mission 5",
        skills: ["K8s", "Helm", "Scaling", "kubectl"],
        time: "120 min",
        careerScore: "+6",
    },
];

const SKILLS_GAINED = [
    "REST API Design",
    "Express.js",
    "MongoDB",
    "GitHub Workflow",
    "Backend Architecture",
];

const WEEK_DAYS = ["M", "T", "W", "T", "F", "S", "S"];
const ACTIVE_DAY = 4;

// ─── Framer Motion Variants ───────────────────────────────────────────────────

import type { Variants } from "framer-motion";

const fadeUp: Variants = {
    hidden: {
        opacity: 0,
        y: 16,
    },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
        },
    },
};



const stagger: Variants = {
    show: {
        transition: {
            staggerChildren: 0.07,
        },
    },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatusDot: React.FC = () => (
    <span style={styles.statusDot} />
);

const CheckItem: React.FC<{ item: ChecklistItem; onToggle: () => void }> = ({ item, onToggle }) => (
    <motion.div
        layout
        onClick={onToggle}
        style={{ ...styles.checkItem, opacity: item.done ? 0.6 : 1 }}
        whileHover={{ backgroundColor: "#F8F3EC" }}
        whileTap={{ scale: 0.99 }}
    >
        <motion.div
            style={{
                ...styles.checkBox,
                background: item.done ? "var(--color-success, #2D7A4F)" : "transparent",
                borderColor: item.done ? "var(--color-success, #2D7A4F)" : "#D6C9B8",
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
            textDecoration: item.done ? "line-through" : "none",
            color: item.done ? "var(--color-text-light, #9C8E7E)" : "var(--color-text, #2C2218)",
        }}>
            {item.label}
        </span>
    </motion.div>
);

const RoadmapItem: React.FC<{ node: RoadmapNode; isLast: boolean }> = ({ node, isLast }) => {
    const dotBg =
        node.status === "done" ? "var(--color-success, #2D7A4F)" :
            node.status === "active" ? "var(--color-primary, #C96A4A)" :
                "#EEE5DA";

    const dotShadow = node.status === "active"
        ? "0 0 0 4px rgba(201,106,74,0.15)"
        : "none";

    const nameColor =
        node.status === "active" ? "var(--color-primary, #C96A4A)" :
            node.status === "locked" ? "var(--color-text-light, #9C8E7E)" :
                "var(--color-text, #2C2218)";

    return (
        <div style={{ display: "flex", gap: 14, position: "relative", paddingBottom: isLast ? 0 : 4 }}>
            {!isLast && (
                <div style={{
                    position: "absolute", left: 11, top: 30,
                    width: 2, height: "calc(100% + 8px)",
                    background: "#EEE5DA",
                }} />
            )}
            <div style={{
                width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                background: dotBg, boxShadow: dotShadow,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: node.status === "locked" ? 10 : 11,
                color: node.status === "locked" ? "#9C8E7E" : "#fff",
                position: "relative", zIndex: 1, marginTop: 2,
                border: node.status === "locked" ? "2px solid #D6C9B8" : "none",
            }}>
                {node.status === "done" ? "✓" : node.status === "active" ? "●" : ""}
            </div>
            <div style={{ flex: 1, paddingTop: 2, paddingBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: nameColor }}>{node.title}</div>
                <div style={{ fontSize: 11, color: "var(--color-text-light, #9C8E7E)", marginTop: 2 }}>{node.subtitle}</div>
            </div>
            {node.status !== "locked" && (
                <span style={{
                    fontSize: 10, fontWeight: 700,
                    padding: "3px 9px", borderRadius: 4, alignSelf: "flex-start", marginTop: 2,
                    background: node.status === "done" ? "rgba(45,122,79,0.1)" : "rgba(201,106,74,0.1)",
                    color: node.status === "done" ? "var(--color-success, #2D7A4F)" : "var(--color-primary, #C96A4A)",
                }}>
                    {node.status === "done" ? "Done" : "Active"}
                </span>
            )}
        </div>
    );
};

const UpcomingCard: React.FC<{ mission: UpcomingMission }> = ({ mission }) => (
    <motion.div
        variants={fadeUp}
        whileHover={{ y: -3, boxShadow: "0 8px 24px rgba(44,34,24,0.1)", borderColor: "#D6C9B8" }}
        style={styles.upcomingCard}
    >
        <span style={styles.lockBadge}>🔒 Locked</span>
        <div style={{ fontSize: 28, marginBottom: 12 }}>{mission.icon}</div>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, color: "var(--color-text, #2C2218)" }}>
            {mission.title}
        </div>
        <div style={{ fontSize: 12, color: "var(--color-text-light, #9C8E7E)" }}>{mission.unlockAfter}</div>
        <div style={styles.upcomingDivider} />
        <div style={{ fontSize: 11, color: "var(--color-text-light, #9C8E7E)", marginBottom: 8 }}>Skills you'll gain</div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {mission.skills.map((s) => (
                <span key={s} style={styles.upcomingSkill}>{s}</span>
            ))}
        </div>
        <div style={{ marginTop: 14, fontSize: 12, color: "var(--color-text-light, #9C8E7E)" }}>
            ⚡ {mission.time}&nbsp;·&nbsp;{mission.careerScore} Career Score
        </div>
    </motion.div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const CareerMissions: React.FC = () => {
    const [checklist, setChecklist] = useState<ChecklistItem[]>(CHECKLIST_ITEMS);

    const toggleItem = (id: string) => {
        setChecklist((prev) =>
            prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
        );
    };

    const doneCount = checklist.filter((i) => i.done).length;
    const totalCount = checklist.length;
    const progressPct = Math.round((doneCount / totalCount) * 100);
    const xpFill = 64 + Math.round((doneCount / totalCount) * 12);

    return (
        <div style={styles.page}>

            {/* ── HERO ─────────────────────────────────────────────────────── */}
            <motion.div
                style={styles.hero}
                initial="hidden"
                animate="show"
                variants={stagger}
            >
                {/* Subtle warm glow — very soft on light bg */}
                <div style={styles.heroGlow} />

                <motion.span variants={fadeUp} style={styles.eyebrow}>
                    🚀 AI Career Operating System
                </motion.span>

                <motion.h1 variants={fadeUp} style={styles.heroTitle}>
                    Career Missions
                </motion.h1>

                <motion.p variants={fadeUp} style={styles.heroSubtitle}>
                    Complete real-world missions generated by AI to improve your resume,
                    portfolio, interview readiness, and career score.
                </motion.p>

                <motion.div variants={fadeUp} style={styles.badgeRow}>
                    <span style={{ ...styles.badge, ...styles.badgeOrange }}>🔥 Daily Mission</span>
                    <span style={{ ...styles.badge, ...styles.badgeAmber }}>⚡ 45 Minutes</span>
                    <span style={{ ...styles.badge, ...styles.badgeSuccess }}>📈 +3 Career Score</span>
                </motion.div>

                <motion.button
                    variants={fadeUp}
                    style={styles.heroCta}
                    whileHover={{ y: -2, boxShadow: "0 8px 28px rgba(201,106,74,0.4)" }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => document.getElementById("mission-card")?.scrollIntoView({ behavior: "smooth" })}
                >
                    Start Today's Mission &nbsp;→
                </motion.button>

                {/* XP strip */}
                <motion.div variants={fadeUp} style={styles.xpStrip}>
                    <span style={styles.xpLabel}>Career Score</span>
                    <div style={styles.xpTrack}>
                        <motion.div
                            style={styles.xpFill}
                            animate={{ width: `${xpFill}%` }}
                            transition={{ duration: 0.6 }}
                        />
                    </div>
                    <span style={styles.xpScore}>74 / 100</span>
                </motion.div>
            </motion.div>

            {/* ── MAIN GRID ─────────────────────────────────────────────────── */}
            <div style={styles.mainGrid}>

                {/* LEFT COLUMN */}
                <motion.div
                    style={styles.leftCol}
                    initial="hidden"
                    animate="show"
                    variants={stagger}
                >

                    {/* TODAY'S MISSION CARD */}
                    <motion.div variants={fadeUp} id="mission-card" style={styles.missionCard}>
                        <div style={styles.missionAccentBar} />
                        <div style={styles.missionTop}>
                            <div>
                                <div style={styles.cardLabel}>Today's Mission</div>
                                <h2 style={styles.missionTitle}>Build a URL Shortener API</h2>
                            </div>
                            <div style={styles.statusPill}>
                                <StatusDot />
                                Ready to Start
                            </div>
                        </div>

                        <div style={styles.metaRow}>
                            {[
                                { label: "Difficulty", val: "Intermediate", valColor: "#B07D2A" },
                                { label: "Est. Time", val: "45 min", valColor: undefined },
                                { label: "Mission", val: "#3 of 7", valColor: undefined },
                            ].map((m) => (
                                <div key={m.label} style={styles.metaPill}>
                                    <span style={styles.metaLabel}>{m.label}</span>
                                    <span style={{ ...styles.metaVal, color: m.valColor ?? "var(--color-text, #2C2218)" }}>
                                        {m.val}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div style={styles.skillRow}>
                            {["REST API", "Node.js", "MongoDB", "Express"].map((s) => (
                                <span key={s} style={styles.skillTag}>{s}</span>
                            ))}
                        </div>

                        <div style={styles.rewardRow}>
                            <span style={styles.rewardChip}>🎯 +3 Career Score</span>
                            <span style={styles.rewardChip}>💼 +1 Portfolio Project</span>
                        </div>

                        <motion.button
                            style={styles.startBtn}
                            whileHover={{ y: -2, boxShadow: "0 8px 28px rgba(201,106,74,0.4)" }}
                            whileTap={{ scale: 0.97 }}
                        >
                            ⚡ Start Mission
                        </motion.button>
                    </motion.div>

                    {/* CHECKLIST */}
                    <motion.div variants={fadeUp} style={styles.card}>
                        <div style={styles.sectionHeader}>
                            <span style={styles.secTitle}>Mission Checklist</span>
                            <span style={styles.secTag}>{progressPct}% done</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                            {checklist.map((item) => (
                                <CheckItem key={item.id} item={item} onToggle={() => toggleItem(item.id)} />
                            ))}
                        </div>
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

                    {/* ROADMAP */}
                    <motion.div variants={fadeUp} style={styles.card}>
                        <div style={styles.sectionHeader}>
                            <span style={styles.secTitle}>Mission Roadmap</span>
                            <span style={{ fontSize: 12, color: "var(--color-text-light, #9C8E7E)" }}>7 missions total</span>
                        </div>
                        {ROADMAP.map((node, i) => (
                            <RoadmapItem key={node.id} node={node} isLast={i === ROADMAP.length - 1} />
                        ))}
                    </motion.div>

                    {/* REWARDS */}
                    <motion.div variants={fadeUp} style={styles.card}>
                        <div style={styles.cardLabel}>Your Rewards</div>
                        <div style={styles.rewardsGrid}>
                            {[
                                { icon: "🏅", val: "Backend Builder", key: "Achievement unlocked" },
                                { icon: "🔥", val: "5 Days", key: "Current streak" },
                                { icon: "⭐", val: "320 XP", key: "Total experience" },
                                { icon: "🎯", val: "74 / 100", key: "Career score", primary: true },
                            ].map((r) => (
                                <motion.div
                                    key={r.key}
                                    style={styles.rewardCardItem}
                                    whileHover={{ borderColor: "#C96A4A", boxShadow: "0 4px 12px rgba(201,106,74,0.1)" }}
                                >
                                    <span style={{ fontSize: 22, marginBottom: 4 }}>{r.icon}</span>
                                    <span style={{
                                        fontSize: 17, fontWeight: 800, letterSpacing: "-0.02em",
                                        color: r.primary ? "var(--color-primary, #C96A4A)" : "var(--color-text, #2C2218)",
                                    }}>
                                        {r.val}
                                    </span>
                                    <span style={{ fontSize: 11, color: "var(--color-text-light, #9C8E7E)", fontWeight: 500 }}>{r.key}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* WHY THIS MISSION MATTERS */}
                    <motion.div variants={fadeUp} style={styles.whyCard}>
                        <div style={styles.sectionHeader}>
                            <span style={styles.secTitle}>Why This Mission Matters</span>
                            <span style={{ fontSize: 20 }}>💡</span>
                        </div>
                        <p style={{ fontSize: 13, color: "var(--color-text-light, #9C8E7E)", lineHeight: 1.6, marginBottom: 16 }}>
                            Recruiters at top companies filter candidates on portfolio depth and real API experience.
                            This mission directly addresses that gap.
                        </p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                            {[
                                "Strengthens your resume with a tangible backend project",
                                "Adds a live GitHub repo with real commits",
                                "Boosts ATS keyword score with REST, Node.js, MongoDB",
                                "Prepares you for backend interview rounds",
                                "Demonstrates practical deployment experience",
                            ].map((text) => (
                                <div key={text} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                                    <div style={{
                                        width: 6, height: 6, borderRadius: "50%",
                                        background: "var(--color-success, #2D7A4F)",
                                        flexShrink: 0, marginTop: 5,
                                    }} />
                                    <span style={{ fontSize: 13, color: "var(--color-text, #2C2218)" }}>{text}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                </motion.div>

                {/* RIGHT SIDEBAR */}
                <motion.div
                    style={styles.rightCol}
                    initial="hidden"
                    animate="show"
                    variants={stagger}
                >

                    {/* AI COACH */}
                    <motion.div variants={fadeUp} style={styles.aiCoachCard}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                            <div style={styles.coachAvatar}>🤖</div>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text, #2C2218)" }}>
                                    Nexora AI Coach
                                </div>
                                <div style={{ fontSize: 11, color: "var(--color-text-light, #9C8E7E)" }}>Today's Recommendation</div>
                            </div>
                        </div>
                        <div style={styles.coachQuote}>
                            "Completing this mission increases your backend readiness and directly
                            strengthens your portfolio for SWE roles."
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {[
                                { label: "Interview readiness gain", val: "+3%", success: true },
                                { label: "Predicted completion", val: "45 min", success: false },
                                { label: "ATS keyword boost", val: "+12 pts", success: true },
                                { label: "Portfolio impact", val: "High", success: true },
                            ].map((s) => (
                                <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontSize: 12, color: "var(--color-text-light, #9C8E7E)" }}>{s.label}</span>
                                    <span style={{
                                        fontSize: 13, fontWeight: 700,
                                        color: s.success ? "var(--color-success, #2D7A4F)" : "var(--color-text, #2C2218)",
                                    }}>
                                        {s.val}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* WEEKLY ACTIVITY */}
                    <motion.div variants={fadeUp} style={styles.card}>
                        <div style={styles.cardLabel}>Weekly Activity</div>
                        <div style={{ display: "flex", gap: 6, justifyContent: "space-between" }}>
                            {WEEK_DAYS.map((d, i) => {
                                const isPast = i < ACTIVE_DAY;
                                const isCurrent = i === ACTIVE_DAY;
                                return (
                                    <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, flex: 1 }}>
                                        <div style={{
                                            width: 28, height: 28, borderRadius: "50%",
                                            background: isPast
                                                ? "var(--color-primary, #C96A4A)"
                                                : isCurrent
                                                    ? "rgba(201,106,74,0.15)"
                                                    : "#F0E8DF",
                                            border: isCurrent ? "2px solid var(--color-primary, #C96A4A)" : "none",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontSize: 11, fontWeight: 700,
                                            color: isPast ? "#fff" : isCurrent ? "var(--color-primary, #C96A4A)" : "#C4B5A5",
                                        }}>
                                            {isPast ? "✓" : isCurrent ? "•" : ""}
                                        </div>
                                        <span style={{ fontSize: 10, color: "var(--color-text-light, #9C8E7E)", fontWeight: 600 }}>{d}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* SKILLS YOU'LL GAIN — replaces leaderboard per feedback */}
                    <motion.div variants={fadeUp} style={styles.card}>
                        <div style={styles.sectionHeader}>
                            <span style={styles.secTitle}>Skills You'll Gain</span>
                            <span style={{ fontSize: 18 }}>🎓</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {SKILLS_GAINED.map((skill) => (
                                <div
                                    key={skill}
                                    style={{
                                        display: "flex", alignItems: "center", gap: 10,
                                        padding: "9px 12px", borderRadius: 10,
                                        background: "#F8F3EC",
                                        border: "1px solid #EEE5DA",
                                    }}
                                >
                                    <div style={{
                                        width: 6, height: 6, borderRadius: "50%",
                                        background: "var(--color-primary, #C96A4A)", flexShrink: 0,
                                    }} />
                                    <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text, #2C2218)" }}>
                                        {skill}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                </motion.div>
            </div>

            {/* ── UPCOMING MISSIONS ────────────────────────────────────────── */}
            <motion.div
                style={styles.upcomingSection}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-80px" }}
                variants={stagger}
            >
                <motion.div variants={fadeUp} style={{ marginBottom: 4, display: "flex", alignItems: "center", gap: 10 }}>
                    <h2 style={styles.sectionTitle}>Upcoming AI Missions</h2>
                    <span style={styles.unlocksTag}>Unlocks after today's mission</span>
                </motion.div>
                <motion.p variants={fadeUp} style={styles.sectionSub}>
                    Your personalized learning journey — built by AI, proven by engineers at top companies.
                </motion.p>
                <motion.div style={styles.upcomingGrid} variants={stagger}>
                    {UPCOMING_MISSIONS.map((m) => (
                        <UpcomingCard key={m.id} mission={m} />
                    ))}
                </motion.div>
            </motion.div>

        </div>
    );
};

// ─── Styles — Nexora Light Design System ──────────────────────────────────────
// Background: #F8F3EC  Cards: #FFFFFF  Border: #EEE5DA
// Primary: var(--color-primary, #C96A4A)  Primary Light: rgba(201,106,74,0.08)
// Text: var(--color-text, #2C2218)  Text Light: var(--color-text-light, #9C8E7E)
// Success: var(--color-success, #2D7A4F)  Danger: var(--color-danger)

const styles: Record<string, React.CSSProperties> = {
    page: {
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        background: "#F8F3EC",
        color: "var(--color-text, #2C2218)",
        minHeight: "100vh",
        paddingBottom: 80,
    },

    // ── Hero
    hero: {
        padding: "56px 32px 40px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
    },
    heroGlow: {
        position: "absolute",
        top: -40, left: "50%",
        transform: "translateX(-50%)",
        width: 500, height: 260,
        background: "radial-gradient(ellipse at center, rgba(201,106,74,0.09) 0%, transparent 70%)",
        pointerEvents: "none",
    },
    eyebrow: {
        display: "inline-flex", alignItems: "center", gap: 6,
        background: "rgba(201,106,74,0.08)",
        border: "1px solid rgba(201,106,74,0.25)",
        borderRadius: 100, padding: "5px 14px",
        fontSize: 12, fontWeight: 700,
        color: "var(--color-primary, #C96A4A)",
        letterSpacing: "0.08em", textTransform: "uppercase",
        marginBottom: 20,
    },
    heroTitle: {
        fontSize: 48, fontWeight: 800, lineHeight: 1.05,
        letterSpacing: "-0.03em",
        color: "var(--color-text, #2C2218)",
        marginBottom: 14,
    },
    heroSubtitle: {
        fontSize: 16, color: "var(--color-text-light, #9C8E7E)",
        maxWidth: 480, margin: "0 auto 32px", lineHeight: 1.65,
    },
    badgeRow: {
        display: "flex", gap: 10, justifyContent: "center",
        flexWrap: "wrap", marginBottom: 32,
    },
    badge: {
        display: "flex", alignItems: "center", gap: 7,
        borderRadius: 100, padding: "7px 14px",
        fontSize: 13, fontWeight: 600, border: "1px solid",
    },
    badgeOrange: {
        background: "rgba(201,106,74,0.08)",
        borderColor: "rgba(201,106,74,0.25)",
        color: "var(--color-primary, #C96A4A)",
    },
    badgeAmber: {
        background: "rgba(176,125,42,0.08)",
        borderColor: "rgba(176,125,42,0.25)",
        color: "#8A6020",
    },
    badgeSuccess: {
        background: "rgba(45,122,79,0.08)",
        borderColor: "rgba(45,122,79,0.25)",
        color: "var(--color-success, #2D7A4F)",
    },
    heroCta: {
        display: "inline-flex", alignItems: "center", gap: 9,
        background: "var(--color-primary, #C96A4A)", color: "#fff", border: "none",
        borderRadius: 10, padding: "13px 26px",
        fontSize: 15, fontWeight: 700, cursor: "pointer",
        letterSpacing: "-0.01em",
        boxShadow: "0 4px 16px rgba(201,106,74,0.3)",
    },
    xpStrip: {
        display: "flex", alignItems: "center", gap: 12,
        background: "#FFFFFF",
        border: "1px solid #EEE5DA",
        borderRadius: 12, padding: "12px 20px",
        margin: "20px auto 0", maxWidth: 460,
        boxShadow: "0 1px 4px rgba(44,34,24,0.06)",
    },
    xpLabel: { fontSize: 12, color: "var(--color-text-light, #9C8E7E)", whiteSpace: "nowrap" },
    xpTrack: {
        flex: 1, background: "#F0E8DF", borderRadius: 100, height: 7, overflow: "hidden",
    },
    xpFill: {
        height: "100%",
        background: "var(--color-primary, #C96A4A)",
        borderRadius: 100,
    },
    xpScore: { fontSize: 14, fontWeight: 800, color: "var(--color-primary, #C96A4A)" },

    // ── Layout
    mainGrid: {
        display: "grid",
        gridTemplateColumns: "1fr 280px",
        gap: 20,
        padding: "0 24px",
        maxWidth: 1100,
        margin: "0 auto",
    },
    leftCol: { display: "flex", flexDirection: "column", gap: 18 },
    rightCol: { display: "flex", flexDirection: "column", gap: 18 },

    // ── Base card — matches Dashboard KPI cards
    card: {
        background: "#FFFFFF",
        border: "1px solid #EEE5DA",
        borderRadius: 16,
        padding: 24,
        boxShadow: "0 1px 4px rgba(44,34,24,0.05)",
    },
    cardLabel: {
        fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
        textTransform: "uppercase", color: "var(--color-text-light, #9C8E7E)",
        marginBottom: 16,
    },
    sectionHeader: {
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: 16,
    },
    secTitle: {
        fontSize: 14, fontWeight: 700, color: "var(--color-text, #2C2218)",
    },
    secTag: {
        fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 100,
        background: "rgba(201,106,74,0.08)",
        color: "var(--color-primary, #C96A4A)",
        border: "1px solid rgba(201,106,74,0.2)",
    },

    // ── Mission card — white with left accent bar (like Dashboard KPI featured card)
    missionCard: {
        background: "#FFFFFF",
        border: "1px solid #EEE5DA",
        borderRadius: 16, padding: 28,
        position: "relative", overflow: "hidden",
        boxShadow: "0 2px 12px rgba(44,34,24,0.07)",
    },
    missionAccentBar: {
        position: "absolute", top: 0, left: 0,
        width: 4, height: "100%",
        background: "var(--color-primary, #C96A4A)",
        borderRadius: "16px 0 0 16px",
    },
    missionTop: {
        display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", marginBottom: 20,
    },
    missionTitle: {
        fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em",
        color: "var(--color-text, #2C2218)",
    },
    statusPill: {
        display: "flex", alignItems: "center", gap: 6,
        background: "rgba(45,122,79,0.08)",
        border: "1px solid rgba(45,122,79,0.25)",
        borderRadius: 100, padding: "5px 12px",
        fontSize: 12, fontWeight: 600,
        color: "var(--color-success, #2D7A4F)",
    },
    statusDot: {
        display: "inline-block",
        width: 6, height: 6, borderRadius: "50%",
        background: "var(--color-success, #2D7A4F)",
    },
    metaRow: { display: "flex", gap: 8, flexWrap: "wrap" as const, marginBottom: 20 },
    metaPill: {
        background: "#F8F3EC",
        border: "1px solid #EEE5DA",
        borderRadius: 8, padding: "6px 12px",
        display: "flex", flexDirection: "column" as const, gap: 2,
    },
    metaLabel: { fontSize: 10, color: "var(--color-text-light, #9C8E7E)", fontWeight: 500 },
    metaVal: { fontSize: 13, fontWeight: 700 },
    skillRow: { display: "flex", gap: 6, flexWrap: "wrap" as const, marginBottom: 20 },
    skillTag: {
        background: "rgba(201,106,74,0.08)",
        border: "1px solid rgba(201,106,74,0.2)",
        borderRadius: 6, padding: "4px 10px",
        fontSize: 12, fontWeight: 500,
        color: "var(--color-primary, #C96A4A)",
    },
    rewardRow: { display: "flex", gap: 10, flexWrap: "wrap" as const, marginBottom: 24 },
    rewardChip: {
        display: "flex", alignItems: "center", gap: 6,
        background: "rgba(201,106,74,0.08)",
        border: "1px solid rgba(201,106,74,0.2)",
        borderRadius: 8, padding: "6px 12px",
        fontSize: 12, fontWeight: 700,
        color: "var(--color-primary, #C96A4A)",
    },
    // Matches "Update Resume" button style from Dashboard
    startBtn: {
        display: "inline-flex", alignItems: "center", gap: 9,
        background: "var(--color-primary, #C96A4A)", color: "#fff", border: "none",
        borderRadius: 10, padding: "12px 22px",
        fontSize: 14, fontWeight: 700, cursor: "pointer",
        boxShadow: "0 4px 12px rgba(201,106,74,0.25)",
    },

    // ── Checklist
    checkItem: {
        display: "flex", alignItems: "center", gap: 12,
        padding: "11px 14px", borderRadius: 10,
        background: "#FDFAF7",
        border: "1px solid #EEE5DA",
        cursor: "pointer",
        transition: "background 0.15s",
    },
    checkBox: {
        width: 20, height: 20, borderRadius: 6,
        border: "2px solid #D6C9B8",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
    },
    checkLabel: { fontSize: 14, fontWeight: 500 },
    progressLabel: {
        display: "flex", justifyContent: "space-between",
        fontSize: 12, color: "var(--color-text-light, #9C8E7E)", marginBottom: 8,
    },
    // Matches Dashboard progress bar
    progressTrack: {
        background: "#F0E8DF", borderRadius: 100, height: 6, overflow: "hidden",
    },
    progressFill: {
        height: "100%", borderRadius: 100,
        background: "var(--color-primary, #C96A4A)",
    },

    // ── Rewards grid
    rewardsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
    rewardCardItem: {
        background: "#FDFAF7",
        border: "1px solid #EEE5DA",
        borderRadius: 12, padding: 16,
        display: "flex", flexDirection: "column" as const, gap: 4,
        cursor: "default",
        transition: "border-color 0.2s, box-shadow 0.2s",
    },

    // ── Why card — soft warm tint with orange left border
    whyCard: {
        background: "#FFFFFF",
        border: "1px solid #EEE5DA",
        borderLeft: "4px solid var(--color-primary, #C96A4A)",
        borderRadius: 16, padding: 24,
        boxShadow: "0 1px 4px rgba(44,34,24,0.05)",
    },

    // ── AI Coach — matches AI Mentor sidebar card
    aiCoachCard: {
        background: "#FFFFFF",
        border: "1px solid #EEE5DA",
        borderRadius: 16, padding: 22,
        boxShadow: "0 1px 4px rgba(44,34,24,0.05)",
    },
    coachAvatar: {
        width: 36, height: 36, borderRadius: "50%",
        background: "rgba(201,106,74,0.12)",
        border: "1px solid rgba(201,106,74,0.25)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 16,
    },
    // Matches AI Mentor quote block
    coachQuote: {
        background: "#F8F3EC",
        borderLeft: "3px solid var(--color-primary, #C96A4A)",
        borderRadius: "0 8px 8px 0",
        padding: "12px 14px",
        fontSize: 13, color: "var(--color-text-light, #9C8E7E)",
        lineHeight: 1.6, marginBottom: 16,
        fontStyle: "italic",
    },

    // ── Upcoming missions section
    upcomingSection: {
        padding: "0 24px",
        maxWidth: 1100,
        margin: "20px auto 0",
    },
    sectionTitle: {
        fontSize: 20, fontWeight: 800, letterSpacing: "-0.01em",
        color: "var(--color-text, #2C2218)",
    },
    unlocksTag: {
        fontSize: 12, color: "var(--color-text-light, #9C8E7E)",
        background: "#FFFFFF",
        border: "1px solid #EEE5DA",
        borderRadius: 6, padding: "3px 10px",
    },
    sectionSub: {
        fontSize: 13, color: "var(--color-text-light, #9C8E7E)",
        marginBottom: 20, marginTop: 4,
    },
    upcomingGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 14,
    },
    upcomingCard: {
        background: "#FFFFFF",
        border: "1px solid #EEE5DA",
        borderRadius: 16, padding: 24,
        cursor: "default",
        boxShadow: "0 1px 4px rgba(44,34,24,0.05)",
        transition: "border-color 0.2s, box-shadow 0.2s, transform 0.2s",
    },
    lockBadge: {
        display: "inline-flex", alignItems: "center", gap: 5,
        background: "#F8F3EC",
        border: "1px solid #EEE5DA",
        borderRadius: 100, padding: "4px 10px",
        fontSize: 11, fontWeight: 600,
        color: "var(--color-text-light, #9C8E7E)",
        marginBottom: 14,
    },
    upcomingDivider: {
        height: 1, background: "#EEE5DA",
        margin: "14px 0",
    },
    upcomingSkill: {
        fontSize: 10, fontWeight: 500,
        color: "var(--color-primary, #C96A4A)",
        background: "rgba(201,106,74,0.08)",
        border: "1px solid rgba(201,106,74,0.2)",
        borderRadius: 4, padding: "3px 7px",
    },
};

export default CareerMissions;

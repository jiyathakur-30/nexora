import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
  Brain,
  Clock,
  ExternalLink,
  Compass,
  Sparkles,
  Bookmark,
  BookmarkCheck,
  Search,
  ArrowRight,
  X,
  BookOpen,
  Activity,
  FileText,
  CheckCircle2,
  Zap,
  TrendingUp,
  AlertTriangle,
  GraduationCap,
  Globe,
  Target
} from 'lucide-react';
import styles from './Pulse.module.css';
import { useNavigate } from 'react-router-dom';
import { useCareerAgent } from '../services/CareerAgent';

interface TrendCard {
  id: string;
  title: string;
  category: 'frontend' | 'ai' | 'backend' | 'general';
  summary: string;
  whyItMatters: string;
  detailedExplanation: string;
  whyItMattersForYouTemplate?: string;
  tags: string[];
  trendStrength: number;
  source: 'Hacker News' | 'GitHub' | 'Dev.to' | 'Reddit' | 'YouTube' | 'Nexora AI';
  timestamp: string;
  matchScore?: number;
  whySelected?: string;
  recommendedAction?: string;
  primarySourceUrl?: string;
  primarySourceLabel?: string;
}

const getSourceForSkill = (skill: string): { url: string; label: string } => {
  const s = skill.toLowerCase();
  if (s.includes('react')) return { url: 'https://react.dev', label: 'React Docs' };
  if (s.includes('next.js') || s.includes('nextjs')) return { url: 'https://nextjs.org', label: 'Next.js Docs' };
  if (s.includes('typescript')) return { url: 'https://www.typescriptlang.org', label: 'TypeScript Handbook' };
  if (s.includes('node')) return { url: 'https://nodejs.org', label: 'Node.js Docs' };
  if (s.includes('system design')) return { url: 'https://github.com/donnemartin/system-design-primer', label: 'System Design Primer' };
  if (s.includes('aws') || s.includes('cloud')) return { url: 'https://aws.amazon.com', label: 'AWS Portal' };
  if (s.includes('docker')) return { url: 'https://docs.docker.com', label: 'Docker Docs' };
  if (s.includes('kubernetes') || s.includes('k8s')) return { url: 'https://kubernetes.io', label: 'Kubernetes Docs' };
  if (s.includes('python')) return { url: 'https://docs.python.org', label: 'Python Docs' };
  if (s.includes('pytorch')) return { url: 'https://pytorch.org', label: 'PyTorch Portal' };
  if (s.includes('spark')) return { url: 'https://spark.apache.org', label: 'Apache Spark Docs' };
  if (s.includes('mlops')) return { url: 'https://mlops.community', label: 'MLOps Resources' };
  if (s.includes('cyber') || s.includes('security') || s.includes('owasp')) return { url: 'https://owasp.org', label: 'OWASP Top 10' };
  if (s.includes('linux') || s.includes('bash')) return { url: 'https://www.gnu.org/software/bash', label: 'GNU Bash Manual' };
  if (s.includes('git')) return { url: 'https://git-scm.com', label: 'Git Docs' };
  if (s.includes('sql') || s.includes('postgres')) return { url: 'https://www.postgresql.org', label: 'PostgreSQL Docs' };
  
  return { 
    url: `https://www.google.com/search?q=${encodeURIComponent(skill + ' documentation standard')}`, 
    label: `Search ${skill} Docs` 
  };
};

// Unused hardcoded trends feed removed to enforce personalized Recommendations only.
const ILLUSTRATIVE_EXAMPLES: TrendCard[] = [
  {
    id: 'example-1',
    title: 'Model Context Protocol (MCP) Standardizing LLM Integrations',
    category: 'ai',
    summary: 'Anthropic\'s open standard Model Context Protocol (MCP) is rapidly becoming the universal bridge between LLMs and local/remote developer tools, databases, and filesystems.',
    whyItMatters: 'Instead of building custom tool interfaces for every new model release, developers write standard MCP servers, enabling immediate agentic tool capabilities.',
    detailedExplanation: 'The Model Context Protocol establishes a unified architecture where client applications connect to modular servers hosting resources, prompts, and tools.',
    whyItMattersForYouTemplate: 'Once analyzed, Pulse will generate personalized instructions on how MCP affects your specific target trajectory and what skills you need to build.',
    tags: ['🧠 AI Agent', '⚡ High Impact', '🔥 Trending'],
    trendStrength: 96,
    source: 'GitHub',
    timestamp: 'Demo Signal',
    primarySourceUrl: 'https://github.com/modelcontextprotocol',
    primarySourceLabel: 'MCP Specification'
  },
  {
    id: 'example-2',
    title: 'React Server Components (RSC) and Hydration-Free Architecture',
    category: 'frontend',
    summary: 'Next.js and React 19 are popularizing React Server Components, moving rendering heavy-lifting off user devices to optimize initial load and page performance.',
    whyItMatters: 'RSCs reduce client bundle sizes by executing rendering on the server, significantly boosting performance on slower devices and cellular connections.',
    detailedExplanation: 'React Server Components represent a paradigm shift in UI architecture. Unlike traditional SPA setups where the entire component tree executes on the client, RSCs run solely on the server.',
    whyItMattersForYouTemplate: 'Once analyzed, Pulse will map RSC capabilities to your frontend skillset and identify if server rendering is a gap for you.',
    tags: ['⚛️ React', '📈 Rising Fast', '🛠️ Dev Experience'],
    trendStrength: 91,
    source: 'Dev.to',
    timestamp: 'Demo Signal',
    primarySourceUrl: 'https://react.dev/reference/rsc/server-components',
    primarySourceLabel: 'RSC Docs'
  }
];

// --- HELPERS for badge/chip rendering ---
type IntentType = 'critical' | 'learning' | 'opportunity' | 'industry' | 'resource';

const getIntentMeta = (id: string): { intent: IntentType; label: string; impactLabel: string } => {
  if (id.startsWith('rec-critical-')) return { intent: 'critical', label: 'Critical', impactLabel: 'High Impact' };
  if (id.startsWith('rec-learnnow-')) return { intent: 'learning', label: 'Learning', impactLabel: 'Recommended' };
  if (id.startsWith('rec-opportunity-')) return { intent: 'opportunity', label: 'Opportunity', impactLabel: 'Trending' };
  if (id.startsWith('rec-signal-')) return { intent: 'industry', label: 'Industry', impactLabel: 'Trending' };
  if (id.startsWith('rec-resource-')) return { intent: 'resource', label: 'Learning', impactLabel: 'Recommended' };
  return { intent: 'industry', label: 'Industry', impactLabel: 'Trending' };
};

const IntentIcon: React.FC<{ intent: IntentType; size?: number }> = ({ intent, size = 14 }) => {
  switch (intent) {
    case 'critical': return <AlertTriangle size={size} />;
    case 'learning': return <GraduationCap size={size} />;
    case 'opportunity': return <Target size={size} />;
    case 'industry': return <Globe size={size} />;
    case 'resource': return <BookOpen size={size} />;
  }
};

export const Pulse: React.FC = () => {
  const { memory, updateMemory } = useCareerAgent();
  const isTwinGenerated = memory.isTwinGenerated && !!memory.analysis;
  const userRole = memory.targetRole || "Software Engineer";

  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      updateMemory(prev => ({
        ...prev,
        hasResume: true,
        resumeFileName: file.name,
        activities: [
          ...prev.activities,
          { id: Math.random().toString(36).substr(2, 9), label: 'Resume Profile Connected via Pulse', timestamp: new Date().toISOString() }
        ]
      }));
      navigate('/dashboard');
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [selectedTrend, setSelectedTrend] = useState<TrendCard | null>(null);

  useEffect(() => {
    // Load bookmarks from local storage
    const savedBookmarks = localStorage.getItem('nexora_pulse_bookmarks');
    if (savedBookmarks) {
      try {
        setBookmarks(JSON.parse(savedBookmarks));
      } catch (e) {
        console.error('Failed to parse bookmarks', e);
      }
    }
  }, []);

  // Helper to toggle bookmark status
  const toggleBookmark = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Stop click from opening the modal
    let updated: string[];
    if (bookmarks.includes(id)) {
      updated = bookmarks.filter(b => b !== id);
    } else {
      updated = [...bookmarks, id];
    }
    setBookmarks(updated);
    localStorage.setItem('nexora_pulse_bookmarks', JSON.stringify(updated));
  };

  // Helper to generate personalized recommendations based on agent memory and relational reasoning
  const getPersonalizedRecommendations = (): TrendCard[] => {
    if (!isTwinGenerated || !memory.analysis) return [];

    const analysis = memory.analysis;
    const recommendations: TrendCard[] = [];

    // Extracting user signals
    const targetRole = memory.targetRole || "Software Engineer";
    const readiness = analysis.readiness || 0;
    const alignmentScore = analysis.alignmentScore || 0;
    const gaps = analysis.gaps || [];
    const strengths = analysis.strengths || [];
    const currentSkills = analysis.currentSkills || [];
    const futureSkills = analysis.futureSkills || [];
    const timeline = memory.preferences?.careerTimelineMonths || 12;
    const intensity = memory.preferences?.learningIntensity || 'medium';

    // Get next milestone from roadmap if exists
    const activeRoadmap = analysis.roadmap || [];
    const nextMilestoneStep = activeRoadmap.find(r => r.label.toLowerCase().includes('next') || r.label.toLowerCase().includes('milestone')) || activeRoadmap[1];
    const nextMilestone = nextMilestoneStep ? nextMilestoneStep.value : "System Design Baselines";

    const primaryStrength = strengths[0] || currentSkills[0] || "Programming Fundamentals";

    // Intent 1: Critical For You (Priority score: 5)
    if (gaps.length > 0) {
      gaps.slice(0, 3).forEach((gap, index) => {
        const id = `rec-critical-${index}-${gap.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
        
        const title = `Profile Alignment: Close the ${gap} Gap for ${targetRole}`;
        const summary = `Your transition to ${targetRole} is currently constrained by experience gaps in ${gap}. To match the alignment score target of ${alignmentScore}% within your ${timeline}-month timeline, addressing this gap is the most direct pathway.`;
        
        const whyItMatters = `Resolving your ${gap} discrepancy directly addresses the requirements for the '${nextMilestone}' milestone on your path, helping you bridge the distance from your current ${readiness}% readiness baseline.`;
        
        const whySelected = `This signal was selected because your strengths in ${primaryStrength} are highly compatible, but our engine predicts that the lack of ${gap} remains your largest active blocker for ${targetRole} workflows.`;
        
        const recommendedAction = `Begin an active upskilling cycle by building a small test sandbox or repository integrating ${gap} with your existing strength in ${primaryStrength}. Maintain a ${intensity} study pace to keep this in line with your ${timeline}-month goals.`;

        const src = getSourceForSkill(gap);

        recommendations.push({
          id,
          title,
          category: 'general',
          summary,
          whyItMatters,
          detailedExplanation: `${summary} ${whyItMatters} ${whySelected}`,
          whySelected,
          recommendedAction,
          tags: ['⚠️ Critical Alert', 'Blocker Closed', 'High Impact'],
          trendStrength: 95 - index * 2,
          source: 'Nexora AI',
          timestamp: 'Alert',
          primarySourceUrl: src.url,
          primarySourceLabel: src.label
        });
      });
    }

    // Intent 2: Learn Next (Priority score: 4)
    const activeSkills = currentSkills.length > 0 ? currentSkills.slice(0, 3) : [primaryStrength];
    activeSkills.forEach((skill, index) => {
      const id = `rec-learnnow-${index}-${skill.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
      
      const title = `Skill Acceleration: Deepen Competency in ${skill}`;
      const summary = `Our agent predicts that maximizing your established capability in ${skill} is highly beneficial. By compounding your strength in ${skill} with your goal of becoming a ${targetRole}, you build immediate technical authority.`;
      
      const whyItMatters = `Improving from your current ${readiness}% readiness relies heavily on demonstrating master-level experience in core skills like ${skill} rather than just basic conceptual familiarity.`;
      
      const whySelected = `Selected because your profile highlights ${skill} as a core strength, and the target role of ${targetRole} lists this skill as a fundamental baseline.`;
      
      const recommendedAction = `Implement advanced patterns (e.g. state optimizations or design abstractions) in your existing ${skill} projects. This aligns with your preferred ${intensity} learning intensity.`;

      const src = getSourceForSkill(skill);

      recommendations.push({
        id,
        title,
        category: 'general',
        summary,
        whyItMatters,
        detailedExplanation: `${summary} ${whyItMatters} ${whySelected}`,
        whySelected,
        recommendedAction,
        tags: ['🔥 Learn Next', 'Core Strength', 'Ecosystem Peak'],
        trendStrength: 90 - index * 2,
        source: 'Nexora AI',
        timestamp: 'Active Core',
        primarySourceUrl: src.url,
        primarySourceLabel: src.label
      });
    });

    // Intent 3: Opportunities (Priority score: 3)
    if (memory.opportunities && memory.opportunities.length > 0) {
      memory.opportunities.forEach((opp, index) => {
        const id = `rec-opportunity-${index}-${opp.id}`;
        const defaultOppUrl = opp.category === 'opensource'
          ? `https://github.com/search?q=${encodeURIComponent(opp.title)}`
          : `https://www.google.com/search?q=${encodeURIComponent(opp.title + ' ' + opp.host)}`;
        recommendations.push({
          id,
          title: `Matched Opportunity: ${opp.title} at ${opp.host}`,
          category: 'general',
          summary: `A verified match for your Career Twin: the ${opp.title} listing hosted by ${opp.host}.`,
          whyItMatters: `Aligns with your readiness score (${readiness}%) and target role of ${targetRole}. Match reasons include: ${opp.why.join(', ')}.`,
          detailedExplanation: `This position requires competence in ${opp.why.join(', ')} which intersects with your profile strengths.`,
          whySelected: `Derived from matching your profile strengths in ${strengths.slice(0, 2).join(' and ')} against active requirements at ${opp.host}.`,
          recommendedAction: `Apply to this listing and customize your resume to highlight your projects in ${opp.why[0] || strengths[0]}.`,
          tags: ['💼 Opportunity', `${opp.matchScore}% Match`, opp.category],
          trendStrength: opp.matchScore,
          source: 'Nexora AI',
          timestamp: 'Opportunity',
          primarySourceUrl: defaultOppUrl,
          primarySourceLabel: `Apply at ${opp.host}`
        });
      });
    }

    // Intent 4: Industry Signals (Priority score: 2)
    if (futureSkills.length > 0) {
      futureSkills.slice(0, 3).forEach((skill, index) => {
        const id = `rec-signal-${index}-${skill.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
        
        const title = `Trajectory Shift: Emerging Shift toward ${skill}`;
        const summary = `Telemetry signals indicate a growing demand for ${skill} within active team repositories. Upskilling in ${skill} is critical to align with modern ${targetRole} workflows.`;
        
        const whyItMatters = `As you target the milestone of '${nextMilestone}', having early expertise in ${skill} prepares your Career Twin for upcoming architectural pivots in the industry.`;
        
        const whySelected = `Identified as a future skill in your profile analysis. Our engine maps this to the long-term readiness requirement of ${alignmentScore}% for ${targetRole} roles.`;
        
        const recommendedAction = `Allocate a portion of your weekly ${intensity} study cycles to research standard specifications, client libraries, and sample implementations of ${skill}.`;

        const src = getSourceForSkill(skill);

        recommendations.push({
          id,
          title,
          category: 'general',
          summary,
          whyItMatters,
          detailedExplanation: `${summary} ${whyItMatters} ${whySelected}`,
          whySelected,
          recommendedAction,
          tags: ['📡 Signal', 'Future Proof', 'Ecosystem Shift'],
          trendStrength: 85 - index * 2,
          source: 'Nexora AI',
          timestamp: 'Signal',
          primarySourceUrl: src.url,
          primarySourceLabel: src.label
        });
      });
    }

    // Intent 5: Learning Resources (Priority score: 1)
    if (gaps.length > 0) {
      gaps.slice(0, 2).forEach((gap, index) => {
        const id = `rec-resource-${index}-${gap.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
        
        const title = `Milestone Study: Bridging ${gap} for '${nextMilestone}'`;
        const summary = `A curated developer resource focusing on standard patterns, boilerplates, and tutorials for ${gap}.`;
        
        const whyItMatters = `Reaching your next milestone '${nextMilestone}' requires overcoming your blocker in ${gap}. This guide is structured to help you gain baseline familiarity.`;
        
        const whySelected = `Selected to help you transition your current readiness of ${readiness}% toward the alignment target. It targets the primary gap (${gap}) identified in your Career Twin.`;
        
        const recommendedAction = `Spend 1-2 hours going through official getting-started tutorials and coding a basic interface using ${gap}.`;

        const src = getSourceForSkill(gap);

        recommendations.push({
          id,
          title,
          category: 'general',
          summary,
          whyItMatters,
          detailedExplanation: `${summary} ${whyItMatters} ${whySelected}`,
          whySelected,
          recommendedAction,
          tags: ['📚 Resource', 'Self-Paced Guide', 'Milestone Goal'],
          trendStrength: 80 - index * 2,
          source: 'Nexora AI',
          timestamp: 'Resource',
          primarySourceUrl: src.url,
          primarySourceLabel: src.label
        });
      });
    }

    return recommendations;
  };



  const getMatchScore = (trend: TrendCard): number => {
    if (trend.id.startsWith('rec-critical-')) return 98;
    if (trend.id.startsWith('rec-learnnow-')) return 92;
    if (trend.id.startsWith('rec-opportunity-')) return 88;
    if (trend.id.startsWith('rec-signal-')) return 85;
    return 75;
  };

  const personalizedTrends = getPersonalizedRecommendations();

  // Filter & Search dynamic personalized data
  const filteredTrends = (isTwinGenerated ? personalizedTrends : [])
    .map(t => ({
      ...t,
      matchScore: getMatchScore(t)
    }))
    .filter(trend => {
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return (
          trend.title.toLowerCase().includes(q) ||
          trend.summary.toLowerCase().includes(q) ||
          trend.tags.some(tag => tag.toLowerCase().includes(q)) ||
          trend.whyItMatters.toLowerCase().includes(q) ||
          (trend.whySelected && trend.whySelected.toLowerCase().includes(q)) ||
          (trend.recommendedAction && trend.recommendedAction.toLowerCase().includes(q))
        );
      }
      return true;
    });

  // Framer motion variants
  const listVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 30,
    },
    show: {
      opacity: 1,
      y: 0,
    },
  };

  // Helper to render a specific intent group in the feed
  const renderFeedSection = (sectionTitle: string, items: TrendCard[], intent: IntentType) => {
    if (items.length === 0) return null;
    return (
      <div className={styles.intentSection}>
        <div className={styles.sectionHeader}>
          <div className={`${styles.sectionChip} ${styles[`sectionChip_${intent}`]}`}>
            <IntentIcon intent={intent} size={12} />
            <span>{sectionTitle}</span>
          </div>
          <div className={styles.sectionLine} />
          <span className={styles.sectionCount}>{items.length}</span>
        </div>
        <div className={styles.sectionCards}>
          {items.map(trend => renderTrendCard(trend))}
        </div>
      </div>
    );
  };

  // Helper to render the opportunity section with intelligent empty state
  const renderOpportunitySection = (items: TrendCard[]) => {
    return (
      <div className={styles.intentSection}>
        <div className={styles.sectionHeader}>
          <div className={`${styles.sectionChip} ${styles.sectionChip_opportunity}`}>
            <Target size={12} />
            <span>Opportunities</span>
          </div>
          <div className={styles.sectionLine} />
          <span className={styles.sectionCount}>{items.length}</span>
        </div>
        {items.length > 0 ? (
          <div className={styles.sectionCards}>
            {items.map(trend => renderTrendCard(trend))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIconRing}>
              <Target size={20} />
            </div>
            <div className={styles.emptyTitle}>No Matched Opportunities Yet</div>
            <div className={styles.emptySubtitle}>
              Connect your GitHub and LinkedIn in Settings so our agent can index relevant internships and repositories for you.
            </div>
          </div>
        )}
      </div>
    );
  };

  // Helper to render a single dynamic recommendation card
  const renderTrendCard = (trend: TrendCard) => {
    const { intent, label, impactLabel } = getIntentMeta(trend.id);
    const isBookmarked = bookmarks.includes(trend.id);

    return (
      <motion.div
        key={trend.id}
        variants={itemVariants}
        layoutId={`card-container-${trend.id}`}
        onClick={() => setSelectedTrend(trend)}
        className={`${styles.pulseCard} ${styles[`pulseCard_${intent}`]}`}
        style={{ cursor: 'pointer' }}
      >
        {/* Shimmer overlay */}
        <div className={styles.cardShimmer} />

        {/* Top Row: category chip + impact badge + match score */}
        <div className={styles.cardTopRow}>
          <div className={styles.cardChips}>
            <span className={`${styles.categoryChip} ${styles[`categoryChip_${intent}`]}`}>
              <IntentIcon intent={intent} size={10} />
              {label}
            </span>
            <span className={`${styles.impactBadge} ${styles[`impactBadge_${intent}`]}`}>
              {intent === 'critical' && <Zap size={10} />}
              {intent === 'learning' && <TrendingUp size={10} />}
              {(intent === 'industry' || intent === 'opportunity' || intent === 'resource') && <Sparkles size={10} />}
              {impactLabel}
            </span>
          </div>
          <div className={styles.matchScore}>
            <Activity size={11} />
            <span>{trend.matchScore}%</span>
          </div>
        </div>

        {/* AI Sparkle + Title row */}
        <div className={styles.cardTitleRow}>
          <Sparkles size={13} className={styles.aiSparkle} />
          <h2 className={styles.cardTitle}>{trend.title}</h2>
        </div>

        {/* Summary */}
        <p className={styles.cardSummary}>{trend.summary}</p>

        {/* Footer */}
        <div className={styles.cardFooter}>
          <div className={styles.tagsContainer}>
            {trend.tags.slice(0, 2).map((tag, idx) => (
              <span key={idx} className={styles.tagBadge}>
                {tag}
              </span>
            ))}
          </div>

          <div className={styles.actionArea}>
            <button
              className={`${styles.actionBtn} ${isBookmarked ? styles.bookmarkedBtn : ''}`}
              onClick={(e) => toggleBookmark(e, trend.id)}
              title={isBookmarked ? "Remove Bookmark" : "Save Signal"}
            >
              {isBookmarked ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
            </button>
            <span className={styles.expandLink}>
              Analyze <ArrowRight size={12} />
            </span>
          </div>
        </div>
      </motion.div>
    );
  };

  if (!isTwinGenerated) {
    return (
      <div className={styles.pageContainer}>
        {/* What Pulse Will Do For You */}
        <section className={styles.previewSection}>
          <h2 className={styles.previewSectionTitle}>What Pulse Will Do For You</h2>
          <div className={styles.previewGrid}>
            <div className={styles.previewCard}>
              <div className={styles.previewIcon}><Brain size={18} /></div>
              <div className={styles.previewTextColumn}>
                <h3 className={styles.previewCardTitle}>Skill Gap Detection</h3>
                <p className={styles.previewCardDesc}>Pinpoint and fix differences between your experience and target roles.</p>
              </div>
            </div>

            <div className={styles.previewCard}>
              <div className={styles.previewIcon}><Compass size={18} /></div>
              <div className={styles.previewTextColumn}>
                <h3 className={styles.previewCardTitle}>Opportunity Discovery</h3>
                <p className={styles.previewCardDesc}>Match with internships, open-source projects, and gigs that fit you.</p>
              </div>
            </div>

            <div className={styles.previewCard}>
              <div className={styles.previewIcon}><Activity size={18} /></div>
              <div className={styles.previewTextColumn}>
                <h3 className={styles.previewCardTitle}>Industry Signals</h3>
                <p className={styles.previewCardDesc}>Monitor emerging tools, developer patterns, and framework updates.</p>
              </div>
            </div>

            <div className={styles.previewCard}>
              <div className={styles.previewIcon}><BookOpen size={18} /></div>
              <div className={styles.previewTextColumn}>
                <h3 className={styles.previewCardTitle}>Learning Priorities</h3>
                <p className={styles.previewCardDesc}>Focus your roadmap on high-impact skills with peak industry demand.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Agent Workflow Visualization Ribbon */}
        <div className={styles.workflowContainer}>
          <div className={styles.workflowStep}>
            <span className={styles.stepNumber}>1</span>
            <span className={styles.stepText}>Observe</span>
          </div>
          <span className={styles.workflowArrow}>→</span>
          <div className={styles.workflowStep}>
            <span className={styles.stepNumber}>2</span>
            <span className={styles.stepText}>Analyze</span>
          </div>
          <span className={styles.workflowArrow}>→</span>
          <div className={styles.workflowStep}>
            <span className={styles.stepNumber}>3</span>
            <span className={styles.stepText}>Reason</span>
          </div>
          <span className={styles.workflowArrow}>→</span>
          <div className={styles.workflowStep}>
            <span className={styles.stepNumber}>4</span>
            <span className={styles.stepText}>Recommend</span>
          </div>
        </div>

        {/* Inline Empty State Experience */}
        <section className={styles.emptyStateSection}>
          <h2 className={styles.emptyStateTitle}>Your Personalized Intelligence Feed Is Waiting</h2>
          <p className={styles.emptyStateDesc}>
            Upload your resume and Pulse will start building your personalized intelligence feed.
          </p>
          <div className={styles.emptyStateActions}>
            <button
              onClick={() => fileInputRef.current?.click()}
              className={styles.actionBtnSecondary}
            >
              <FileText size={16} /> Upload Resume
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf"
              style={{ display: 'none' }}
            />
          </div>
        </section>

        {/* Example Preview Section */}
        <section className={styles.examplePreviewSection}>
          <div className={styles.previewDivider}>
            <span className={styles.previewBadge}>Example Preview • Illustrative Only</span>
          </div>

          <div className={styles.previewDisclaimer}>
            <p>
              This is a visual preview of how technology signals will appear on your feed. Once you complete your profile analysis, these general examples will be replaced with <strong>real-time, fully personalized insights</strong>.
            </p>
          </div>

          <div className={styles.previewCardsContainer}>
            {ILLUSTRATIVE_EXAMPLES.map((trend) => (
              <div
                key={trend.id}
                className={`${styles.pulseCard} ${styles.illustrativeCard}`}
              >
                {/* Illustrative Only Watermark Badge */}
                <div className={styles.illustrativeWatermark}>
                  <span>Illustrative Only</span>
                </div>

                {/* Top Row */}
                <div className={styles.cardTopRow}>
                  <div className={styles.metaGroup}>
                    <span className={`${styles.sourceBadge} ${trend.source === 'GitHub' ? styles.githubBadge : styles.devBadge}`}>
                      {trend.source}
                    </span>
                    <span className={styles.timeText}>
                      Demo Signal
                    </span>
                  </div>
                  <div className={styles.scoreIndicator} style={{ color: 'var(--color-text-light)', opacity: 0.7 }}>
                    <Activity size={14} />
                    <span>--% Match</span>
                  </div>
                </div>

                {/* Title */}
                <h2 className={styles.cardTitle} style={{ opacity: 0.8 }}>{trend.title}</h2>

                {/* Summary */}
                <p className={styles.cardSummary} style={{ opacity: 0.7 }}>{trend.summary}</p>

                {/* Footer Section */}
                <div className={styles.cardFooter} style={{ opacity: 0.6 }}>
                  <div className={styles.tagsContainer}>
                    {trend.tags.slice(0, 2).map((tag, idx) => (
                      <span key={idx} className={styles.tagBadge}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className={styles.expandLink} style={{ color: 'var(--color-text-light)' }}>
                    Locked <Clock size={12} style={{ marginLeft: 4 }} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>

      {/* 1. Premium Feed Header */}
      <header className={styles.feedHeader}>
        <div className={styles.feedHeaderLeft}>
          <div className={styles.feedTitleGroup}>
            <div className={styles.feedBadge}>
              <Sparkles size={11} />
              <span>AI Intelligence</span>
            </div>
            <h1 className={styles.feedTitle}>Nexora Pulse</h1>
          </div>
          <p className={styles.feedSubtitle}>
            Personalized career intelligence for <strong>{userRole}</strong>
          </p>
        </div>
        <div className={styles.feedStats}>
          <div className={styles.statPill}>
            <span className={styles.statDot} />
            <span>{filteredTrends.length} signals active</span>
          </div>
        </div>
      </header>

      {/* 2. Search Controls */}
      <div className={styles.controlsRow}>
        <div className={styles.searchWrapper}>
          <Search size={15} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search recommendations, skills, or tags…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* 3. Feed List - Grouped by intent */}
      <motion.div
        variants={listVariants}
        initial="hidden"
        animate="show"
        className={styles.feedStream}
      >
        <AnimatePresence mode="popLayout">
          {filteredTrends.length > 0 ? (
            <>
              {renderFeedSection("Critical For You", filteredTrends.filter(t => t.id.startsWith('rec-critical-')), 'critical')}
              {renderFeedSection("Learn Next", filteredTrends.filter(t => t.id.startsWith('rec-learnnow-')), 'learning')}
              {renderOpportunitySection(filteredTrends.filter(t => t.id.startsWith('rec-opportunity-')))}
              {renderFeedSection("Industry Signals", filteredTrends.filter(t => t.id.startsWith('rec-signal-')), 'industry')}
              {renderFeedSection("Learning Resources", filteredTrends.filter(t => t.id.startsWith('rec-resource-')), 'resource')}
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={styles.emptyState}
            >
              <div className={styles.emptyIconRing}>
                <Search size={20} />
              </div>
              <div className={styles.emptyTitle}>No matching recommendations</div>
              <div className={styles.emptySubtitle}>Try adjusting your search query to find specific advisor signals.</div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* 4. Expandable Overlay Modal */}
      <AnimatePresence>
        {selectedTrend && (() => {
          const { intent } = getIntentMeta(selectedTrend.id);
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={styles.modalOverlay}
              onClick={() => setSelectedTrend(null)}
            >
              <motion.div
                layoutId={`card-container-${selectedTrend.id}`}
                className={styles.modalContent}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  className={styles.closeBtn}
                  onClick={() => setSelectedTrend(null)}
                >
                  <X size={20} />
                </button>

                {/* Modal Header */}
                <div className={styles.modalCategoryHeader}>
                  <span className={`${styles.categoryChip} ${styles[`categoryChip_${intent}`]}`} style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                    <IntentIcon intent={intent} size={11} />
                    {getIntentMeta(selectedTrend.id).label}
                  </span>
                  <span className={styles.timeText}>{selectedTrend.timestamp}</span>
                  {isTwinGenerated && (
                    <>
                      <div className={styles.divider} />
                      <span className={styles.timeText} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Activity size={12} color="var(--color-primary)" />
                        <strong>{selectedTrend.matchScore}% Match</strong>
                      </span>
                    </>
                  )}
                </div>

                {/* Title */}
                <h2 className={styles.modalTitle}>{selectedTrend.title}</h2>

                {/* Tags */}
                <div className={styles.modalTags}>
                  {selectedTrend.tags.map((tag, idx) => (
                    <span key={idx} className={styles.tagBadge} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                      {tag}
                    </span>
                  ))}
                  <span className={styles.tagBadge} style={{ padding: '6px 12px', fontSize: '0.8rem', backgroundColor: 'rgba(201, 106, 74, 0.1)', color: 'var(--color-primary)' }}>
                    ⚡ Impact Score: {selectedTrend.trendStrength}%
                  </span>
                </div>

                {/* Overview Section */}
                <div className={styles.modalSection}>
                  <div className={styles.modalSectionTitle}>
                    <BookOpen size={16} />
                    <span>Overview</span>
                  </div>
                  <p className={styles.modalText}>{selectedTrend.summary}</p>
                </div>

                {/* Why This Matters */}
                <div className={styles.modalSection}>
                  <div className={styles.modalSectionTitle}>
                    <Sparkles size={16} />
                    <span>Why This Matters</span>
                  </div>
                  <p className={styles.modalText}>{selectedTrend.whyItMatters}</p>
                </div>

                {/* Why It Was Selected */}
                {selectedTrend.whySelected && (
                  <div className={styles.modalSection}>
                    <div className={styles.modalSectionTitle}>
                      <Activity size={16} />
                      <span>Why It Was Selected</span>
                    </div>
                    <p className={styles.modalText}>{selectedTrend.whySelected}</p>
                  </div>
                )}

                {/* Recommended Action */}
                {selectedTrend.recommendedAction && (
                  <div className={styles.modalSection} style={{ backgroundColor: 'rgba(201, 106, 74, 0.04)', padding: 'var(--space-4)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--color-primary)' }}>
                    <div className={styles.modalSectionTitle}>
                      <CheckCircle2 size={16} style={{ color: 'var(--color-primary)' }} />
                      <span style={{ color: 'var(--color-primary)' }}>Recommended Action</span>
                    </div>
                    <p className={styles.modalText} style={{ fontWeight: 600, color: 'var(--color-text)' }}>{selectedTrend.recommendedAction}</p>
                  </div>
                )}

                {/* Action Footer */}
                <div className={styles.modalFooter}>
                  <button
                    onClick={() => {
                      if (selectedTrend.primarySourceUrl) {
                        window.open(selectedTrend.primarySourceUrl, '_blank');
                      }
                    }}
                    disabled={!selectedTrend.primarySourceUrl}
                    style={{
                      backgroundColor: selectedTrend.primarySourceUrl ? 'var(--color-primary)' : 'var(--color-text-light)',
                      opacity: selectedTrend.primarySourceUrl ? 1 : 0.5,
                      color: 'white',
                      padding: '12px 24px',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      cursor: selectedTrend.primarySourceUrl ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      boxShadow: selectedTrend.primarySourceUrl ? '0 4px 14px 0 rgba(201, 106, 74, 0.39)' : 'none',
                      transition: 'all 0.2s'
                    }}
                    className={styles.modalActionBtn}
                  >
                    {selectedTrend.primarySourceUrl ? (
                      <>
                        {selectedTrend.primarySourceLabel || 'Visit Primary Source'} <ExternalLink size={16} />
                      </>
                    ) : (
                      'No source available'
                    )}
                  </button>
                </div>

              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

    </div>
  );
};

export default Pulse;

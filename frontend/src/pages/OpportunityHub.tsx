import React, { useState, useEffect, useCallback } from 'react';
import { ShieldAlert, ShieldCheck, Globe, Briefcase, GraduationCap, Code, FileText, CheckCircle2, XCircle, ArrowRight, ExternalLink, Loader2, Calendar, MapPin, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useCareerAgent } from '../services/CareerAgent';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Opportunity {
  title: string;
  organization: string;
  category: string;
  location: string;
  deadline: string;
  mode: string;
  applyUrl: string;
  description: string;
  whyMatched: string;
  matchScore: number;
}

interface OpportunityResult {
  internships: Opportunity[];
  hackathons: Opportunity[];
  opensource: Opportunity[];
  competitions: Opportunity[];
  mentorships: Opportunity[];
  fellowships: Opportunity[];
}

type CategoryId = 'internships' | 'hackathons' | 'opensource' | 'competitions' | 'mentorships';

// ── Skeleton loader — preserves existing card dimensions ──────────────────────

const SkeletonRow: React.FC = () => (
  <div style={{
    height: 18,
    borderRadius: 6,
    background: 'linear-gradient(90deg, rgba(61,44,46,0.06) 0%, rgba(61,44,46,0.12) 50%, rgba(61,44,46,0.06) 100%)',
    backgroundSize: '200% 100%',
    animation: 'nexora-shimmer 1.4s infinite',
    marginBottom: 8
  }} />
);

const SkeletonCard: React.FC = () => (
  <Card style={{ padding: 'var(--space-5)', border: '1px solid var(--color-glass-border)' }}>
    <div style={{ display: 'flex', gap: 16 }}>
      <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: 'rgba(61,44,46,0.06)', flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <SkeletonRow />
        <div style={{ height: 13, borderRadius: 6, background: 'rgba(61,44,46,0.06)', width: '60%', marginBottom: 12 }} />
        <SkeletonRow />
        <div style={{ height: 13, borderRadius: 6, background: 'rgba(61,44,46,0.06)', width: '40%' }} />
      </div>
    </div>
  </Card>
);

// ── Live opportunity card rendered inside the existing panel ──────────────────

const OpportunityCard: React.FC<{ opp: Opportunity }> = ({ opp }) => (
  <div style={{
    padding: '14px 16px',
    border: '1px solid var(--color-glass-border)',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--color-background)',
    display: 'flex',
    flexDirection: 'column',
    gap: 8
  }}>
    {/* Header row */}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
      <div style={{ flex: 1 }}>
        <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text)', display: 'block', marginBottom: 2 }}>
          {opp.title}
        </span>
        <span style={{ fontSize: '0.82rem', color: 'var(--color-text-light)', fontWeight: 600 }}>
          {opp.organization}
        </span>
      </div>
      {/* Match score badge */}
      <span style={{
        fontSize: '0.78rem',
        fontWeight: 700,
        color: opp.matchScore >= 85 ? 'var(--color-success)' : opp.matchScore >= 70 ? 'var(--color-primary)' : 'var(--color-text-light)',
        backgroundColor: opp.matchScore >= 85 ? 'rgba(78,139,98,0.1)' : opp.matchScore >= 70 ? 'rgba(201,106,74,0.1)' : 'rgba(61,44,46,0.05)',
        padding: '3px 8px',
        borderRadius: 10,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 4
      }}>
        <Zap size={11} /> {opp.matchScore}% match
      </span>
    </div>

    {/* Meta row: location, deadline, mode */}
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: '0.78rem', color: 'var(--color-text-light)' }}>
      {opp.location && (
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <MapPin size={11} /> {opp.location}
        </span>
      )}
      {opp.deadline && (
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Calendar size={11} /> {opp.deadline}
        </span>
      )}
      {opp.mode && (
        <span style={{
          fontSize: '0.72rem',
          fontWeight: 600,
          padding: '1px 7px',
          borderRadius: 8,
          backgroundColor: 'rgba(61,44,46,0.05)',
          color: 'var(--color-text-light)'
        }}>
          {opp.mode}
        </span>
      )}
    </div>

    {/* Description */}
    <p style={{ fontSize: '0.84rem', color: 'var(--color-text-light)', margin: 0, lineHeight: 1.45 }}>
      {opp.description}
    </p>

    {/* Why matched */}
    {opp.whyMatched && (
      <p style={{
        fontSize: '0.81rem',
        color: 'var(--color-primary)',
        margin: 0,
        fontStyle: 'italic',
        lineHeight: 1.4,
        padding: '6px 10px',
        backgroundColor: 'rgba(201,106,74,0.05)',
        borderRadius: 6,
        borderLeft: '2px solid var(--color-primary)'
      }}>
        {opp.whyMatched}
      </p>
    )}

    {/* Apply button */}
    {opp.applyUrl && (
      <a
        href={opp.applyUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          alignSelf: 'flex-start',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: '0.82rem',
          fontWeight: 700,
          color: 'var(--color-primary)',
          textDecoration: 'none',
          padding: '5px 0'
        }}
      >
        Apply Now <ExternalLink size={13} />
      </a>
    )}
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────

const OpportunityHub: React.FC = () => {
  const { memory } = useCareerAgent();
  const navigate = useNavigate();

  const resumeConnected = memory.hasResume;
  const githubConnected = !!memory.githubUsername;
  const linkedinConnected = !!memory.linkedinUrl;
  const analysisGenerated = memory.isAnalyzed && !!memory.analysis;
  const twinGenerated = memory.isTwinGenerated && !!memory.analysis;

  // ── Live opportunity state ──────────────────────────────────────────────────
  const [opportunities, setOpportunities] = useState<OpportunityResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<number | null>(null);

  const canFetch = analysisGenerated && !!memory.analysis;

  const fetchOpportunities = useCallback(async () => {
    console.log("fetchOpportunities called");
    if (!canFetch) return;

    // Client-side 15-min guard (mirrors server-side cache)
    if (lastFetched && Date.now() - lastFetched < 15 * 60 * 1000 && opportunities) return;

    setLoading(true);
    setFetchError(null);

    try {
      const analysis = memory.analysis!;
      const payload = {
        careerGoal: memory.targetRole || "Software Engineer",
        skills: analysis.currentSkills || analysis.strengths || [],
        experience: `Readiness: ${analysis.readiness ?? analysis.careerReadiness ?? 0}%`,
        resumeSummary: [
          ...(analysis.strengths || []),
          ...(analysis.gaps || [])
        ].join(", "),
        github: memory.githubUsername || "",
        linkedin: memory.linkedinUrl || "",
      };

      const res = await fetch("http://localhost:5000/api/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }

      const data: OpportunityResult = await res.json();
      setOpportunities(data);
      setLastFetched(Date.now());
    } catch (err: any) {
      console.error("[OpportunityHub] fetch failed:", err?.message);
      setFetchError("No live opportunities available.");
    } finally {
      setLoading(false);
    }
  }, [canFetch, lastFetched, opportunities, memory]);

  // Auto-fetch when analysis is ready
  useEffect(() => {
    if (canFetch && !opportunities && !loading) {
      fetchOpportunities();
    }
  }, [canFetch]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Categories definition (unchanged from original) ─────────────────────────

  const categories = [
    {
      id: 'internships' as CategoryId,
      title: 'Internships & Entry-Level Roles',
      icon: <Briefcase size={24} color="var(--color-primary)" />,
      desc: 'Paid corporate positions, summer internships, and entry-level engineering placements.',
      requirements: [
        { name: 'Resume Connected', met: resumeConnected, key: 'resume' },
        { name: 'Analysis Generated', met: analysisGenerated, key: 'analysis' }
      ],
      futureAgentBehavior: 'The Career Agent will parse local and remote job boards, matching job descriptions against your resume skills and calculating an alignment score.',
      liveKey: 'internships' as keyof OpportunityResult
    },
    {
      id: 'hackathons' as CategoryId,
      title: 'Hackathons & Team Challenges',
      icon: <Globe size={24} color="#D49F00" />,
      desc: 'High-energy weekend sprints and collaborative prototyping competitions.',
      requirements: [
        { name: 'GitHub Connected', met: githubConnected, key: 'github' }
      ],
      futureAgentBehavior: 'The Career Agent will analyze your GitHub commits to match you with hackathons prioritizing your primary language and library stack.',
      liveKey: 'hackathons' as keyof OpportunityResult
    },
    {
      id: 'opensource' as CategoryId,
      title: 'Open Source Repositories',
      icon: <Code size={24} color="var(--color-text)" />,
      desc: 'Active open-source projects looking for contributors and reviewing pull requests.',
      requirements: [
        { name: 'GitHub Connected', met: githubConnected, key: 'github' },
        { name: 'Analysis Generated', met: analysisGenerated, key: 'analysis' }
      ],
      futureAgentBehavior: 'The Career Agent will inspect open issues on GitHub matching your critical skill gaps and suggest beginner-friendly issues.',
      liveKey: 'opensource' as keyof OpportunityResult
    },
    {
      id: 'competitions' as CategoryId,
      title: 'Technical Competitions',
      icon: <ShieldCheck size={24} color="var(--color-success)" />,
      desc: 'Competitive programming contests, algorithm challenges, and Kaggle datasets.',
      requirements: [
        { name: 'Analysis Generated', met: analysisGenerated, key: 'analysis' }
      ],
      futureAgentBehavior: 'The Career Agent will look for challenges targeting your core strengths to build your competitive portfolio.',
      liveKey: 'competitions' as keyof OpportunityResult
    },
    {
      id: 'mentorships' as CategoryId,
      title: 'Industry Mentorships',
      icon: <GraduationCap size={24} color="#0A66C2" />,
      desc: '1-on-1 mentorship pairings with senior engineers and domain experts.',
      requirements: [
        { name: 'LinkedIn Connected', met: linkedinConnected, key: 'linkedin' },
        { name: 'Analysis Generated', met: analysisGenerated, key: 'analysis' }
      ],
      futureAgentBehavior: 'The Career Agent will match you with mentors from your university alumni network or companies aligned with your career goals.',
      liveKey: 'mentorships' as keyof OpportunityResult
    }
  ];

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const activeCategoryData = categories.find(c => c.id === activeCategory);

  // ── Derived live data for selected panel ───────────────────────────────────
  const liveOpps: Opportunity[] = activeCategoryData && opportunities
    ? (opportunities[activeCategoryData.liveKey] || [])
    : [];

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="container page-enter-active" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-12)' }}>

      {/* Shimmer keyframe injected once */}
      <style>{`
        @keyframes nexora-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <header style={{ marginBottom: 'var(--space-8)' }}>
        <h1 style={{ fontSize: '2.5rem', color: 'var(--color-text)', marginBottom: 'var(--space-2)' }}>Opportunity Hub</h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--color-text-light)' }}>Discover matched projects, mentorships, and internships tailored to your skills.</p>
      </header>

      {/* Connection States Checklist Card */}
      <Card style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-8)', border: '1px solid var(--color-glass-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 12 }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Matching Engine Connection Status</h3>
          {/* Refresh / fetch button */}
          {canFetch && (
            <Button
              size="sm"
              variant="ghost"
              onClick={fetchOpportunities}
              disabled={loading}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              {loading
                ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Fetching live opportunities…</>
                : lastFetched
                  ? 'Refresh Opportunities'
                  : 'Find Live Opportunities'
              }
            </Button>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
          <StatusItem label="Resume Connected" met={resumeConnected} icon={<FileText size={18} />} />
          <StatusItem label="GitHub Connected" met={githubConnected} icon={<Code size={18} />} />
          <StatusItem label="LinkedIn Connected" met={linkedinConnected} icon={<Briefcase size={18} />} />
          <StatusItem label="Analysis Generated" met={analysisGenerated} icon={<ShieldCheck size={18} />} />
          <StatusItem label="Career Twin Active" met={twinGenerated} icon={<Globe size={18} />} />
        </div>

        {/* Global fetch-error banner */}
        {fetchError && (
          <div style={{
            marginTop: 'var(--space-4)',
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'rgba(192,86,86,0.06)',
            border: '1px solid rgba(192,86,86,0.2)',
            fontSize: '0.88rem',
            color: 'var(--color-danger)',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <XCircle size={16} /> {fetchError}
          </div>
        )}
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: activeCategory ? '1fr 1fr' : '1fr', gap: 'var(--space-6)', transition: 'all 0.3s' }}>

        {/* Categories List — identical to original */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 'var(--space-2)' }}>Opportunity Categories</h3>
          {categories.map((c) => {
            const allMet = c.requirements.every(req => req.met);
            return (
              <Card
                key={c.id}
                hoverEffect
                onClick={() => setActiveCategory(c.id)}
                style={{
                  cursor: 'pointer',
                  border: activeCategory === c.id ? '2px solid var(--color-primary)' : '1px solid var(--color-glass-border)',
                  padding: 'var(--space-5)',
                  backgroundColor: activeCategory === c.id ? 'rgba(201,106,74,0.02)' : 'var(--color-card)',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--color-glass-border)' }}>
                    {c.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <h4 style={{ fontWeight: 700, fontSize: '1.15rem' }}>{c.title}</h4>
                      <span style={{
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: allMet ? 'var(--color-success)' : 'var(--color-text-light)',
                        backgroundColor: allMet ? 'rgba(78, 139, 98, 0.1)' : 'rgba(61,44,46,0.05)',
                        padding: '4px 8px',
                        borderRadius: 12
                      }}>
                        {allMet ? 'Eligible for Matches' : 'Connections Required'}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)', marginBottom: 8 }}>{c.desc}</p>
                    <div style={{ display: 'flex', gap: 12, fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
                      <span>Requires:</span>
                      {c.requirements.map(req => (
                        <span key={req.name} style={{ display: 'flex', alignItems: 'center', gap: 4, color: req.met ? 'var(--color-success)' : 'var(--color-text-light)', fontWeight: req.met ? 600 : 400 }}>
                          {req.met ? '✓' : '✗'} {req.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Selected Category Panel — same structure, live data injected */}
        {activeCategoryData && (
          <Card glass style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', border: '1px solid var(--color-glass-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: 1 }}>Opportunity Category Matcher</span>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 800 }}>{activeCategoryData.title}</h3>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setActiveCategory(null)}>Close Panel</Button>
            </div>

            <p style={{ color: 'var(--color-text)', fontSize: '0.95rem', lineHeight: 1.5, margin: 0 }}>
              {activeCategoryData.desc}
            </p>

            <div style={{ borderTop: '1px solid rgba(61,44,46,0.1)', borderBottom: '1px solid rgba(61,44,46,0.1)', padding: 'var(--space-4) 0' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-light)', textTransform: 'uppercase', marginBottom: 12 }}>Connection Requirements</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {activeCategoryData.requirements.map(req => (
                  <div key={req.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.95rem', color: 'var(--color-text)' }}>{req.name}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: req.met ? 'var(--color-success)' : 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      {req.met ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                      {req.met ? 'Connected' : 'Missing'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-light)', textTransform: 'uppercase', marginBottom: 8 }}>Match Reasoning & Logic</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)', lineHeight: 1.5, margin: 0 }}>
                {activeCategoryData.futureAgentBehavior}
              </p>
            </div>

            {/* ── Live Opportunities Area ── */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

              {/* Loading skeletons */}
              {loading && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              )}

              {/* Live results */}
              {!loading && !fetchError && liveOpps.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-light)', textTransform: 'uppercase', margin: 0 }}>
                      Live Matches ({liveOpps.length})
                    </h4>
                    {lastFetched && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
                        Updated {Math.round((Date.now() - lastFetched) / 60000)}m ago
                      </span>
                    )}
                  </div>
                  {liveOpps.map((opp, i) => (
                    <OpportunityCard key={`${opp.title}-${i}`} opp={opp} />
                  ))}
                </div>
              )}

              {/* Empty state — no live results for this category */}
              {!loading && !fetchError && liveOpps.length === 0 && opportunities && (
                <div style={{
                  backgroundColor: 'rgba(255,255,255,0.4)',
                  borderRadius: 'var(--radius-md)',
                  border: '2px dashed var(--color-glass-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  padding: 'var(--space-6) var(--space-4)'
                }}>
                  <ShieldCheck size={36} color="var(--color-success)" style={{ marginBottom: 12 }} />
                  <h4 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 4 }}>All Connections Verified</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', maxWidth: 280, margin: 0 }}>
                    We verified your credentials, but there are no active opportunities in our registry at this time. Match results will appear here as soon as new postings are indexed.
                  </p>
                </div>
              )}

              {/* Pre-fetch state — analysis not ready or fetch not triggered */}
              {!loading && !fetchError && !opportunities && (
                <div style={{
                  backgroundColor: 'rgba(255,255,255,0.4)',
                  borderRadius: 'var(--radius-md)',
                  border: '2px dashed var(--color-glass-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  padding: 'var(--space-6) var(--space-4)'
                }}>
                  {activeCategoryData.requirements.every(r => r.met) ? (
                    <>
                      <Loader2 size={36} color="var(--color-primary)" style={{ marginBottom: 12, animation: 'spin 1.2s linear infinite' }} />
                      <h4 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 4 }}>Scanning for live opportunities…</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', maxWidth: 280, margin: 0 }}>
                        Our AI is searching the web for real-time matches tailored to your profile.
                      </p>
                    </>
                  ) : (
                    <>
                      <ShieldAlert size={36} color="var(--color-warning)" style={{ marginBottom: 12 }} />
                      <h4 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 4 }}>Information Required</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', maxWidth: 280, marginBottom: 16 }}>
                        Connect the missing credentials above to unlock this opportunity matcher category.
                      </p>
                      <Button size="sm" onClick={() => navigate('/dashboard')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        Configure Connections <ArrowRight size={14} />
                      </Button>
                    </>
                  )}
                </div>
              )}

              {/* Error state */}
              {!loading && fetchError && (
                <div style={{
                  backgroundColor: 'rgba(255,255,255,0.4)',
                  borderRadius: 'var(--radius-md)',
                  border: '2px dashed rgba(192,86,86,0.25)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  padding: 'var(--space-6) var(--space-4)'
                }}>
                  <XCircle size={36} color="var(--color-danger)" style={{ marginBottom: 12 }} />
                  <h4 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 4 }}>No live opportunities available.</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', maxWidth: 280, marginBottom: 16 }}>
                    The AI search could not be completed. Please try again shortly.
                  </p>
                  <Button size="sm" variant="ghost" onClick={fetchOpportunities}>
                    Retry
                  </Button>
                </div>
              )}
            </div>
          </Card>
        )}

      </div>
    </div>
  );
};

// ── StatusItem — identical to original ───────────────────────────────────────

const StatusItem = ({ label, met, icon }: { label: string; met: boolean; icon: React.ReactNode }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    backgroundColor: 'var(--color-background)',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid rgba(61,44,46,0.05)'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text-light)' }}>
      {icon}
      <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text)' }}>{label}</span>
    </div>
    <span style={{
      fontSize: '0.8rem',
      fontWeight: 700,
      color: met ? 'var(--color-success)' : 'var(--color-text-light)',
      backgroundColor: met ? 'rgba(78, 139, 98, 0.1)' : 'rgba(61,44,46,0.05)',
      padding: '2px 8px',
      borderRadius: 10
    }}>
      {met ? 'Connected' : 'Not Connected'}
    </span>
  </div>
);

export default OpportunityHub;

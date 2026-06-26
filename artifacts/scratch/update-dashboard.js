const fs = require('fs');
const path = require('path');

const filePath = 'c:\\Users\\QUIKCARE COMPUTERS\\OneDrive\\Desktop\\nexora\\frontend\\src\\pages\\Dashboard.tsx';
const content = fs.readFileSync(filePath, 'utf8');

// We want to find the return statement at line 793 (or where `return (` starts after `if (!memory.isAnalyzed) {`)
// Let's find: `if (!memory.isAnalyzed) {`
const splitMarker = 'if (!memory.isAnalyzed) {';
const index = content.indexOf(splitMarker);
if (index === -1) {
  console.error("Could not find split marker");
  process.exit(1);
}

// Find the closing brace of that block. 
// We know the block ends with:
//     );
//   }
// 
//   return (
const endBlockMarker = '    );\r\n  }\r\n\r\n  return (';
const endBlockMarkerLF = '    );\n  }\n\n  return (';

let markerIndex = content.indexOf(endBlockMarker);
let markerLength = endBlockMarker.length;

if (markerIndex === -1) {
  markerIndex = content.indexOf(endBlockMarkerLF);
  markerLength = endBlockMarkerLF.length;
}

if (markerIndex === -1) {
  console.error("Could not find end block marker");
  process.exit(1);
}

// Keep everything up to: `  return (`
const keepContent = content.substring(0, markerIndex + markerLength - 'return ('.length);

const newReturnBlock = `return (
    <div className="container page-enter-active" style={{ paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-8)' }}>
      {/* 1. Header (Welcome and context) */}
      <DashboardHeader targetRole={targetRole} userName={userName} />

      {/* 2. KPI Section */}
      <KPISection analysis={analysis} hasResume={memory.hasResume} />

      {/* 3. Signature Career Roadmap Hero */}
      <CareerRoadmap 
        analysis={analysis} 
        targetRole={targetRole} 
        onOpenTwin={() => navigate('/career-twin')} 
      />

      {/* 4. Asymmetric split grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-5)', alignItems: 'stretch' }}>
        
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

          {/* Matched Opportunities */}
          <OpportunitiesPreview onSeeAll={() => navigate('/opportunity-hub')} />
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
`;

const updatedContent = keepContent + newReturnBlock;
fs.writeFileSync(filePath, updatedContent, 'utf8');
console.log("Successfully updated Dashboard.tsx");

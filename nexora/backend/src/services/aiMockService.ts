// This service layer will eventually be replaced by actual OpenAI API calls.
// For Phase 1, it returns mock data to ensure the frontend is fully functional.

export const analyzeProfile = async () => {
  // Simulating an API call delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return {
    readiness: 72,
    strengths: ['React', 'JavaScript', 'Problem Solving'],
    gaps: ['Cloud Architecture', 'System Design', 'AI Agents'],
    currentSkills: ['React', 'Node.js', 'TypeScript', 'CSS', 'Git'],
    futureSkills: ['AWS', 'Docker', 'OpenAI API', 'System Design', 'Leadership'],
    alignmentScore: 85,
    milestones: [
      { threshold: 80, label: 'Internship Ready' },
      { threshold: 90, label: 'Industry Ready' },
      { threshold: 100, label: 'Dream Role Ready' }
    ],
    techPulse: {
      now: ['React', 'TypeScript', 'Node.js'],
      later: ['AWS', 'Docker', 'Kubernetes'],
      ignore: ['PHP', 'jQuery', 'SVN']
    },
    roadmap: [
      { label: 'Current Stage', value: 'Junior Developer', color: 'var(--color-primary)' },
      { label: 'Next Skill Milestone', value: 'System Design Baselines', color: 'var(--color-warning)' },
      { label: 'Next Career Stage', value: 'Mid-Level Full Stack Engineer', color: 'var(--color-success)' },
      { label: 'Long-Term Goal', value: 'Lead System Architect', color: 'var(--color-success)' }
    ],
    insights: [
      'Your strongest skill is React.',
      'Learning AWS can increase your readiness by 8%.',
      'System Design is currently trending for your target role.'
    ]
  };
};

export const simulateAction = async (action: string) => {
  await new Promise(resolve => setTimeout(resolve, 800));

  // Generate dynamic mock data based on the action
  const actionLower = action.toLowerCase();
  
  if (actionLower.includes('aws') || actionLower.includes('cloud')) {
    return { impact: 8, time: '4 Weeks', demand: 'High', difficulty: 'Medium' };
  } else if (actionLower.includes('ai') || actionLower.includes('agent')) {
    return { impact: 12, time: '6 Weeks', demand: 'Very High', difficulty: 'Hard' };
  } else if (actionLower.includes('hackathon')) {
    return { impact: 5, time: '1 Weekend', demand: 'Medium', difficulty: 'Intense' };
  } else if (actionLower.includes('open source')) {
    return { impact: 10, time: 'Ongoing', demand: 'High', difficulty: 'Hard' };
  }
  
  return { impact: 5, time: '2 Weeks', demand: 'Medium', difficulty: 'Medium' };
};

export const getMentorAdvice = async (prompt: string) => {
  await new Promise(resolve => setTimeout(resolve, 1000));

  const promptLower = prompt.toLowerCase();
  
  if (promptLower.includes('next')) {
    return { response: 'Based on your Career Twin, learning AWS should be your next priority. It will boost your readiness by 8% and close your largest skill gap.' };
  } else if (promptLower.includes('internship')) {
    return { response: 'You are currently at 72% readiness. Most internships look for an 80% baseline. I suggest completing a full-stack project or a hackathon to cross that threshold.' };
  } else if (promptLower.includes('teammates')) {
    return { response: 'I found 3 Open Teams looking for React developers. Check out "Team VisionAI" in the Opportunity Hub; they are a 92% match for your skills.' };
  }
  
  return { response: 'That is a great question. Based on your current trajectory towards becoming an AI Engineer, I recommend focusing on bridging your System Design gaps while building out practical projects.' };
};

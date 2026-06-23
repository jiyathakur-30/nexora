// This service layer will eventually be replaced by actual OpenAI API calls.
// For Phase 1, it returns mock data to ensure the frontend is fully functional.

export const analyzeProfile = async (
  targetRole?: string,
  resumeFileName?: string,
  preferences?: any
) => {
  // Simulating an API call delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  const role = (targetRole || 'Software Engineer').toLowerCase();
  const resume = (resumeFileName || '').toLowerCase();

  // 1. Determine base profile by target role
  let baseProfile = {
    readiness: 12,
    strengths: ['JavaScript', 'HTML/CSS', 'Problem Solving'],
    gaps: ['System Design', 'Cloud Architecture', 'Testing Tools'],
    currentSkills: ['JavaScript', 'HTML', 'CSS', 'Git'],
    futureSkills: ['AWS Cloud', 'Docker Containerization', 'System Design'],
    alignmentScore: 85,
    milestones: [
      { threshold: 80, label: 'Internship Ready' },
      { threshold: 90, label: 'Industry Ready' },
      { threshold: 100, label: 'Dream Role Ready' }
    ],
    techPulse: {
      now: ['JavaScript', 'HTML', 'CSS'],
      later: ['AWS', 'Docker', 'System Design'],
      ignore: ['PHP', 'jQuery', 'SVN']
    },
    roadmap: [
      { label: 'Current Stage', value: 'Junior Developer', color: 'var(--color-primary)' },
      { label: 'Next Skill Milestone', value: 'System Design Baselines', color: 'var(--color-warning)' },
      { label: 'Next Career Stage', value: 'Mid-Level Full Stack Engineer', color: 'var(--color-success)' },
      { label: 'Long-Term Goal', value: 'Lead System Architect', color: 'var(--color-success)' }
    ],
    insights: [
      'Your strongest skill is JavaScript.',
      'Learning AWS can increase your readiness by 8%.',
      'System Design is currently trending for your target role.'
    ]
  };

  if (role.includes('frontend') || role.includes('ui') || role.includes('ux') || role.includes('web')) {
    baseProfile = {
      readiness: 74,
      strengths: ['React', 'TypeScript', 'CSS Grid', 'Problem Solving'],
      gaps: ['Webpack Configuration', 'Server-Side Rendering (SSR)', 'Tailwind CSS', 'State Management'],
      currentSkills: ['React', 'HTML5', 'CSS3', 'JavaScript', 'Git'],
      futureSkills: ['Next.js', 'GraphQL', 'Tailwind CSS', 'Web Performance'],
      alignmentScore: 88,
      milestones: [
        { threshold: 80, label: 'Frontend Intern Ready' },
        { threshold: 90, label: 'Production UI Ready' },
        { threshold: 100, label: 'Lead Frontend Ready' }
      ],
      techPulse: {
        now: ['React', 'TypeScript', 'CSS'],
        later: ['Next.js', 'GraphQL', 'Tailwind'],
        ignore: ['PHP', 'Flash', 'Silverlight']
      },
      roadmap: [
        { label: 'Current Stage', value: 'Junior UI Developer', color: 'var(--color-primary)' },
        { label: 'Next Skill Milestone', value: 'Component Optimization', color: 'var(--color-warning)' },
        { label: 'Next Career Stage', value: 'Senior Frontend Engineer', color: 'var(--color-success)' },
        { label: 'Long-Term Goal', value: 'Frontend Architect', color: 'var(--color-success)' }
      ],
      insights: [
        'Your strongest skill is React component design.',
        'Learning Next.js SSR can increase your readiness by 10%.',
        'State Management paradigms are trending for frontend targets.'
      ]
    };
  } else if (role.includes('backend') || role.includes('systems') || role.includes('cloud') || role.includes('server')) {
    baseProfile = {
      readiness: 71,
      strengths: ['Node.js', 'SQL Databases', 'RESTful APIs', 'Data Structures'],
      gaps: ['Docker Containerization', 'Kubernetes Orchestration', 'Microservices Architecture', 'gRPC'],
      currentSkills: ['Express', 'PostgreSQL', 'JavaScript', 'Linux', 'Git'],
      futureSkills: ['Docker', 'AWS Cloud', 'Redis Caching', 'System Scalability'],
      alignmentScore: 84,
      milestones: [
        { threshold: 80, label: 'Backend Intern Ready' },
        { threshold: 90, label: 'System Scalability Ready' },
        { threshold: 100, label: 'Architect Ready' }
      ],
      techPulse: {
        now: ['Node.js', 'Express', 'SQL'],
        later: ['Docker', 'Kubernetes', 'AWS'],
        ignore: ['PHP', 'jQuery', 'ColdFusion']
      },
      roadmap: [
        { label: 'Current Stage', value: 'Junior Backend Dev', color: 'var(--color-primary)' },
        { label: 'Next Skill Milestone', value: 'Distributed Systems', color: 'var(--color-warning)' },
        { label: 'Next Career Stage', value: 'Mid Backend Engineer', color: 'var(--color-success)' },
        { label: 'Long-Term Goal', value: 'Principal Cloud Architect', color: 'var(--color-success)' }
      ],
      insights: [
        'Your database query skills are a key backend strength.',
        'Containerization can increase your deployment readiness by 12%.',
        'Microservices architecture patterns are highly trending.'
      ]
    };
  } else if (role.includes('data') || role.includes('ml') || role.includes('ai') || role.includes('machine learning') || role.includes('analytics')) {
    baseProfile = {
      readiness: 68,
      strengths: ['Python', 'Pandas Dataframes', 'SQL Queries', 'Data Analytics'],
      gaps: ['Apache Spark', 'MLOps Pipelines', 'PyTorch Deep Learning', 'Data Warehousing'],
      currentSkills: ['Python', 'NumPy', 'PostgreSQL', 'Matplotlib', 'Git'],
      futureSkills: ['PyTorch', 'Docker', 'Apache Spark', 'Model Deployment'],
      alignmentScore: 82,
      milestones: [
        { threshold: 75, label: 'Data Junior Ready' },
        { threshold: 90, label: 'ML Engineer Ready' },
        { threshold: 100, label: 'AI Architect Ready' }
      ],
      techPulse: {
        now: ['Python', 'SQL', 'Pandas'],
        later: ['PyTorch', 'Spark', 'MLOps'],
        ignore: ['Excel Macro', 'SAS', 'MATLAB']
      },
      roadmap: [
        { label: 'Current Stage', value: 'Junior Data Analyst', color: 'var(--color-primary)' },
        { label: 'Next Skill Milestone', value: 'MLOps Automation', color: 'var(--color-warning)' },
        { label: 'Next Career Stage', value: 'Machine Learning Engineer', color: 'var(--color-success)' },
        { label: 'Long-Term Goal', value: 'Staff ML Scientist', color: 'var(--color-success)' }
      ],
      insights: [
        'Data cleaning and pandas manipulation are your strengths.',
        'Learning PyTorch deep learning models can lift data readiness by 15%.',
        'MLOps model deployment pipelines are critically trending.'
      ]
    };
  } else if (role.includes('cyber') || role.includes('security') || role.includes('infosec') || role.includes('network') || role.includes('penetration')) {
    baseProfile = {
      readiness: 70,
      strengths: ['Network Protocols', 'Linux Bash Scripting', 'Firewall Configurations', 'IDS/IPS'],
      gaps: ['Penetration Testing (Pentest)', 'Ethical Hacking', 'OWASP Top 10 Security', 'IAM cloud security'],
      currentSkills: ['Linux', 'Bash', 'Wireshark', 'Python', 'Git'],
      futureSkills: ['Metasploit', 'Burp Suite', 'AWS IAM', 'Zero Trust Architecture'],
      alignmentScore: 83,
      milestones: [
        { threshold: 80, label: 'SecOps Intern Ready' },
        { threshold: 90, label: 'Incident Response Ready' },
        { threshold: 100, label: 'Sec Architect Ready' }
      ],
      techPulse: {
        now: ['Linux', 'Networks', 'Bash'],
        later: ['Pentest', 'IAM', 'Zero Trust'],
        ignore: ['WordPress', 'Adobe Flash', 'Basic FTP']
      },
      roadmap: [
        { label: 'Current Stage', value: 'Security Associate', color: 'var(--color-primary)' },
        { label: 'Next Skill Milestone', value: 'Penetration Testing Authority', color: 'var(--color-warning)' },
        { label: 'Next Career Stage', value: 'Security Operations Analyst', color: 'var(--color-success)' },
        { label: 'Long-Term Goal', value: 'Principal Security Architect', color: 'var(--color-success)' }
      ],
      insights: [
        'Network telemetry and Wireshark scripting are key strengths.',
        'Ethical hacking credentials can lift security readiness by 12%.',
        'Zero trust cloud access frameworks are currently trending.'
      ]
    };
  }

  // 2. Adjust based on Resume Experience / Seniority (Beginner vs Advanced)
  if (resume.includes('beginner') || resume.includes('junior') || resume.includes('entry') || role.includes('junior') || role.includes('entry')) {
    baseProfile.readiness = Math.max(10, baseProfile.readiness - 20);
    baseProfile.alignmentScore = Math.max(30, baseProfile.alignmentScore - 15);
    baseProfile.roadmap[0].value = `Entry-Level ${baseProfile.roadmap[0].value}`;
    baseProfile.roadmap[1].value = "Core Programming Foundations";
    baseProfile.insights.push('Since you are in early-career stages, prioritize foundational syntax and Git workflows.');
  } else if (resume.includes('advanced') || resume.includes('senior') || resume.includes('lead') || role.includes('senior') || role.includes('lead')) {
    baseProfile.readiness = Math.min(98, baseProfile.readiness + 18);
    baseProfile.alignmentScore = Math.min(100, baseProfile.alignmentScore + 10);
    baseProfile.roadmap[0].value = `Senior ${baseProfile.roadmap[0].value}`;
    baseProfile.roadmap[1].value = "System Scale & Team Leadership";
    baseProfile.insights.push('With advanced experience, focus on distributed system architecture and architectural standards.');
  }

  return baseProfile;
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
    return { response: 'You are currently at 12% readiness. Most internships look for an 80% baseline. I suggest completing a full-stack project or a hackathon to cross that threshold.' };
  } else if (promptLower.includes('teammates')) {
    return { response: 'I found 3 Open Teams looking for React developers. Check out "Team VisionAI" in the Opportunity Hub; they are a 92% match for your skills.' };
  }

  return { response: 'That is a great question. Based on your current trajectory towards becoming an AI Engineer, I recommend focusing on bridging your System Design gaps while building out practical projects.' };
};

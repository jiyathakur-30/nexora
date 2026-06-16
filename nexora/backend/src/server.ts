import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import { analyzeProfile, simulateAction, getMentorAdvice } from './services/aiMockService';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// API Endpoints (Phase 1 Mock)
app.post('/api/analyze', async (req, res) => {
  // Mock analyzing a resume/profile
  const result = await analyzeProfile();
  res.json(result);
});

app.post('/api/simulate', async (req, res) => {
  const { action } = req.body;
  const result = await simulateAction(action);
  res.json(result);
});

app.post('/api/mentor', async (req, res) => {
  const { prompt } = req.body;
  const result = await getMentorAdvice(prompt);
  res.json(result);
});

// Mock Data endpoints for Opportunity Hub
app.get('/api/opportunities', (req, res) => {
  res.json({
    similarPeople: [
      { id: 1, name: 'Aman', sharedSkills: ['React', 'AI'], matchScore: 89, goal: 'AI Engineer' },
      { id: 2, name: 'Priya', sharedSkills: ['Python', 'System Design'], matchScore: 82, goal: 'Backend Developer' }
    ],
    communities: [
      { id: 1, name: 'AI Builders', description: 'Exploring LLMs and Agents', members: 1200 },
      { id: 2, name: 'React Circle', description: 'Advanced UI/UX discussions', members: 850 }
    ],
    teams: [
      { id: 1, name: 'VisionAI', needs: 'Frontend Developer', matchScore: 92 },
      { id: 2, name: 'HackData', needs: 'Data Scientist', matchScore: 78 }
    ],
    mentors: [
      { id: 1, name: 'Sarah Chen', expertise: 'Senior AI Engineer at TechCorp', matchScore: 95, availability: 'Available' },
      { id: 2, name: 'Raj Patel', expertise: 'Staff Frontend Engineer', matchScore: 88, availability: 'Busy' }
    ]
  });
});

// Socket.io Realtime Chat
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join_community', (communityId) => {
    socket.join(`community_${communityId}`);
    console.log(`User joined community ${communityId}`);
  });

  socket.on('send_message', (data) => {
    // Broadcast message
    io.to(`community_${data.communityId}`).emit('receive_message', data);
    
    // Simulate AI Community Assistant response occasionally
    if (data.text.toLowerCase().includes('help') || data.text.toLowerCase().includes('summarize')) {
      setTimeout(() => {
        io.to(`community_${data.communityId}`).emit('receive_message', {
          id: Date.now(),
          sender: 'Nexora AI',
          text: 'I can help with that! Based on the discussion, here is a quick summary and some resources...',
          isAi: true,
          timestamp: new Date().toISOString()
        });
      }, 1500);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});

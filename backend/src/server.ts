import { saveResumeAnalysis } from "./services/resumeService";
import { supabase } from './services/supabase';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import { analyzeProfile, simulateAction, getMentorAdvice } from './services/aiMockService';
import { analyzeResumeWithAI } from "./services/geminiService";
import { fetchOpportunities } from "./services/opportunityService";

import multer from "multer";
const pdfParse = require("pdf-parse");
console.log("PDF PARSE =", pdfParse);
const upload = multer({
  storage: multer.memoryStorage()
});



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
  try {
    const { targetRole, resumeFileName, preferences } = req.body || {};

    const result = await analyzeProfile(
      targetRole,
      resumeFileName,
      preferences
    );

    await saveResumeAnalysis({
      file_name: resumeFileName,
      analysis_result: result,
      score: result.readiness
    });

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to analyze resume" });
  }
});

app.post(
  "/api/upload-resume",
  upload.single("resume"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: "No resume uploaded"
        });
      }

      const pdfData = await pdfParse(req.file.buffer);

      const targetRole = req.body.targetRole || "Software Engineer";

      let analysis;

      try {
        analysis = await analyzeResumeWithAI(
          pdfData.text,
          targetRole

        );
        console.log("========== AI RESULT ==========");
        console.log(analysis);
        console.log("================================");
        console.log("================================");
        console.log("PDF LENGTH:", pdfData.text?.length);
        console.log("TARGET ROLE:", targetRole);
        console.log("ANALYSIS RESULT:", analysis);
        console.log("================================");

      } catch (err: any) {
        console.error("Gemini Error Details:", err);
        return res.status(err.status || 500).json({
          error: `AI analysis failed: ${err.message || "Failed to analyze resume with AI"}`
        });
      }
      console.log("PDF TEXT LENGTH:", pdfData.text.length);
      console.log("PDF TEXT:");
      console.log(pdfData.text);

      console.log("SAVING TO SUPABASE...");
      console.log(JSON.stringify({
        file_name: req.file.originalname,
        analysis_result: analysis,
        score: analysis?.readiness
      }, null, 2));
      await saveResumeAnalysis({
        file_name: req.file.originalname,
        extracted_text: pdfData.text,
        analysis_result: analysis,
        score: analysis.readiness
      });

      res.json({
        fileName: req.file.originalname,
        analysis
      });

    } catch (error: any) {
      console.error("PDF ERROR:", error);

      res.status(500).json({
        error: error?.message || "Failed to process PDF"
      });
    }
  }
);

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

// Opportunity hub 

app.post('/api/opportunities', async (req, res) => {
  try {
    const {
      careerGoal,
      skills,
      experience,
      resumeSummary,
      github,
      linkedin
    } = req.body || {};

    if (!careerGoal || !Array.isArray(skills)) {
      return res.status(400).json({
        error: "careerGoal and skills are required."
      });
    }

    const result = await fetchOpportunities({
      careerGoal,
      skills,
      experience: experience || "",
      resumeSummary: resumeSummary || "",
      github: github || "",
      linkedin: linkedin || ""
    });
console.log("SERVER RETURNING:");
console.log(JSON.stringify(result, null, 2));
    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to fetch opportunities"
    });
  }
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

app.get('/api/test-db', async (req, res) => {
  try {
    const result = await saveResumeAnalysis({
      user_id: '00000000-0000-0000-0000-000000000001',
      file_name: 'test.pdf',
      analysis_result: '{"status":"working"}',
      score: 100
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

app.get('/test-supabase', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .limit(1);

    if (error) {
      return res.status(500).json(error);
    }

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

app.get('/test-insert', async (req, res) => {
  try {
    const result = await analyzeProfile(
      'AI Engineer',
      'resume.pdf',
      { location: 'Remote' }
    );

    await saveResumeAnalysis({
      file_name: 'resume.pdf',
      analysis_result: result,
      score: result.readiness
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});

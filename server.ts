import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Helper with automatic fallback for transient 503 spikes
async function safeGenerateContent(aiClient: GoogleGenAI, params: any) {
  try {
    return await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      ...params,
    });
  } catch (err: any) {
    console.warn('Initial model attempt note:', err?.message?.slice(0, 100));
    // If 503 or transient unavailability, fallback to gemini-flash-latest
    return await aiClient.models.generateContent({
      model: 'gemini-flash-latest',
      ...params,
    });
  }
}

async function safeGenerateContentStream(aiClient: GoogleGenAI, params: any) {
  try {
    return await aiClient.models.generateContentStream({
      model: 'gemini-3.8-flash',
      ...params,
    });
  } catch (err: any) {
    console.warn('Initial stream model attempt note:', err?.message?.slice(0, 100));
    return await aiClient.models.generateContentStream({
      model: 'gemini-flash-latest',
      ...params,
    });
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(apiKey),
    timestamp: new Date().toISOString(),
  });
});

// Chat endpoint (supports streaming SSE)
app.post('/api/chat', async (req, res) => {
  const { messages, subject, level = 'College / Undergraduate', tone = 'Balanced' } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages array is required.' });
  }

  const systemInstruction = `You are ScholarPulse AI, an expert, encouraging, and pedagogically sound academic tutor and student assistant.
Current Academic Focus:
- Subject: ${subject || 'General Academics'}
- Student Level: ${level}
- Teaching Style: ${tone} (e.g. Socratic: guide through thoughtful inquiry; Balanced: clear explanations with intuitive examples; Comprehensive: deep academic rigor with citations/formulas; ELI5: simplified analogies for complex concepts).

Guidelines:
1. Always structure your responses with clarity: use bolding, bullet points, numbered steps, or markdown code blocks where appropriate.
2. For mathematical, scientific, or algorithmic problems, show the conceptual reason first, then the step-by-step working, and conclude with the key takeaway or formula.
3. If the student makes an error, gently point it out, explain why the misconception happens, and show how to correct it.
4. Conclude with a helpful follow-up question or quick self-check question when suitable to test understanding.`;

  if (!ai) {
    // Provide a smart academic mock response if API key is not present
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const fallbackResponse = `### Understanding ${subject || 'this concept'}

Great question! Let's break this down step-by-step:

1. **Fundamental Principle**: When approaching problems in ${subject || 'academics'}, identify the known variables and the core laws or theories that connect them.
2. **Key Insight**: Break the problem into smaller modular sub-questions. For example, verify your initial assumptions and check dimensional consistency.
3. **Application**: Apply the relevant formula or analytical framework systematically.

*Note: Live AI responses will connect automatically with your Gemini API key. Feel free to ask another question or try the Question Solver tab!*`;

    for (const chunk of fallbackResponse.split(' ')) {
      res.write(`data: ${JSON.stringify({ text: chunk + ' ' })}\n\n`);
      await new Promise((r) => setTimeout(r, 20));
    }
    res.write('data: [DONE]\n\n');
    return res.end();
  }

  try {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Build contents from conversation history
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const responseStream = await safeGenerateContentStream(ai, {
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: any) {
    console.error('Gemini Chat error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || 'Failed to generate chat response' });
    } else {
      res.write(`data: ${JSON.stringify({ error: error.message || 'Error generating response' })}\n\n`);
      res.end();
    }
  }
});

// Dedicated Question Solver endpoint
app.post('/api/solve', async (req, res) => {
  const {
    question,
    subject = 'General',
    level = 'College / Undergraduate',
    format = 'step-by-step', // 'step-by-step', 'quick', 'deep-dive', 'mcq'
    context = '',
  } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'Question content is required' });
  }

  const prompt = `Solve and thoroughly explain the following student problem in ${subject} (${level}):

Problem:
"""
${question}
"""
${context ? `Additional Context/Student Notes: """${context}"""` : ''}

Format Request: ${format}

Please format your response clearly in markdown:
1. **Direct Answer / Solution Statement**: Give the clear, concise final answer immediately.
2. **Step-by-Step Breakdown**: Number each logical step, showing calculations, intermediate logic, or code blocks.
3. **Core Concepts & Key Formulas**: Highlight the underlying theoretical principles or formulas applied.
4. **Common Pitfalls & Exam Tips**: Mention 1-2 common mistakes students make on this exact type of problem.
5. **Quick Verification / Check**: Show how to check or verify that this answer is correct.
6. **Try This Next (Practice Question)**: Provide 1 brief similar practice challenge with answer hidden in a spoiler or at the bottom.`;

  if (!ai) {
    const fallback = `### Direct Answer / Solution
The solution to your ${subject} query requires evaluating the fundamental principles of the topic.

### Step-by-Step Breakdown
1. **Identify the Given Conditions**: Review the parameters provided in the problem statement.
2. **Apply the Core Theorem**: Use standard formulation for ${subject}.
3. **Compute the Result**: Verify boundary conditions and simplify expressions.

### Key Formulas & Principles
- Standard equations and rules apply directly. Keep units and logical assumptions consistent.

### Common Pitfalls
- Double check sign conventions, algebraic distribution, and unit conversions.

*Configure your GEMINI_API_KEY in the environment to unlock dynamic real-time Gemini 3.8 problem solving.*`;

    return res.json({ solution: fallback });
  }

  try {
    const response = await safeGenerateContent(ai, {
      contents: prompt,
      config: {
        systemInstruction: `You are an elite academic problem solver specializing in ${subject}. You provide verified, rigorous, beautifully formatted educational solutions that teach students how to think.`,
        temperature: 0.4,
      },
    });

    res.json({ solution: response.text });
  } catch (error: any) {
    console.error('Solve error:', error);
    res.status(500).json({ error: error.message || 'Failed to solve question' });
  }
});

// Interactive Practice Quiz Generator
app.post('/api/quiz', async (req, res) => {
  const { subject = 'Mathematics', topic = 'General', level = 'College / Undergraduate', count = 3 } = req.body;

  if (!ai) {
    return res.json({
      questions: [
        {
          id: 'q1',
          question: `What is a fundamental concept in ${subject} related to ${topic}?`,
          options: [
            'Conservation of fundamental state parameters',
            'Arbitrary divergence without constraints',
            'Non-deterministic baseline oscillation',
            'Isolated systemic entropy reduction without work'
          ],
          correctIndex: 0,
          explanation: 'In physical and formal sciences, conservation laws and consistent baseline constraints govern state transformations.',
        },
        {
          id: 'q2',
          question: `When solving problems involving ${topic}, what is typically the first diagnostic step?`,
          options: [
            'Guessing random numbers',
            'Establishing known variables and coordinate frames',
            'Ignoring boundary conditions',
            'Skipping dimensional analysis'
          ],
          correctIndex: 1,
          explanation: 'Specifying your coordinate system and identifying known parameters prevents fundamental setup errors.',
        },
      ],
    });
  }

  try {
    const response = await safeGenerateContent(ai, {
      contents: `Create ${count} high-quality, conceptual multiple-choice quiz questions for a student studying "${subject}" on the topic of "${topic}" at the "${level}" level. Include tricky plausible distractors and clear educational explanations for why the correct answer is right.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Exactly 4 distinct multiple-choice answer choices.',
                  },
                  correctIndex: {
                    type: Type.INTEGER,
                    description: 'Index of correct answer (0, 1, 2, or 3).',
                  },
                  explanation: {
                    type: Type.STRING,
                    description: 'Detailed explanation of why this option is correct and why other choices are misconceptions.',
                  },
                },
                required: ['id', 'question', 'options', 'correctIndex', 'explanation'],
              },
            },
          },
          required: ['questions'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{"questions":[]}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Quiz error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate quiz' });
  }
});

// Flashcard Generator
app.post('/api/flashcards', async (req, res) => {
  const { subject = 'General', topic = 'Key Terms', count = 4 } = req.body;

  if (!ai) {
    return res.json({
      cards: [
        {
          front: `Core Principle of ${topic}`,
          back: `The fundamental rule defining behavior and relationships in ${subject}.`,
          hint: 'Think about foundational laws.',
          category: subject,
        },
        {
          front: `Key Application in ${subject}`,
          back: `Utilized across problem solving to transform and calculate state transitions.`,
          hint: 'Practical problem solving step.',
          category: subject,
        },
      ],
    });
  }

  try {
    const response = await safeGenerateContent(ai, {
      contents: `Generate ${count} high-impact flashcards for a student studying "${topic}" in "${subject}". Each flashcard should test an essential definition, theorem, formula, or concept.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            cards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  front: { type: Type.STRING, description: 'Question or concept on the front of the card' },
                  back: { type: Type.STRING, description: 'Clear, concise explanation or definition on the back' },
                  hint: { type: Type.STRING, description: 'Quick recall hint or mnemonic' },
                  category: { type: Type.STRING, description: 'Subtopic category' },
                },
                required: ['front', 'back', 'hint', 'category'],
              },
            },
          },
          required: ['cards'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{"cards":[]}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Flashcard error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate flashcards' });
  }
});

// Start Express server and mount Vite middleware
async function start() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ScholarPulse AI backend running on http://0.0.0.0:${PORT}`);
  });
}

start().catch(console.error);

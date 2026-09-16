require('dotenv').config(); // Load environment variables from .env (must be first)

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const path = require('path');
const { manager, train } = require('./intents');
const { train: trainEngine, processMessage } = require('./nlpEngine');

const app = express();
// Render assigns PORT dynamically; 3001 is the local-dev fallback.
const PORT = process.env.PORT || 3001;
// Bind to all interfaces so Render's proxy/health checks can reach the app
// (binding to 'localhost' would make the container unreachable externally).
const HOST = '0.0.0.0';

// CORS lockdown: only allow requests from the configured frontend origin(s).
// FRONTEND_URL accepts a comma-separated list (e.g. "http://localhost:3000,https://myapp.com").
// Falls back to the local dev servers when unset.
const FRONTEND_URLS = (process.env.FRONTEND_URL || 'http://localhost:3000,http://localhost:5173')
  .split(',')
  .map(url => url.trim())
  .filter(Boolean);

/** Returns true when the request Origin is in the allow-list (or absent, e.g. curl/Postman). */
function isAllowedOrigin(origin) {
  if (!origin) return true; // Non-browser clients send no Origin header
  return FRONTEND_URLS.includes(origin);
}

// Minimum confidence required to accept node-nlp's matched intent.
// Scores below this value are considered unreliable and trigger the fallback
// response. Configurable via CONFIDENCE_THRESHOLD in .env.
const CONFIDENCE_THRESHOLD = parseFloat(process.env.CONFIDENCE_THRESHOLD) || 0.6;

// Maximum allowed message length (characters). Longer input is truncated.
const MAX_MESSAGE_LENGTH = 500;

// Rate limiter: applied to /api/chat only — max 20 requests per minute per IP.
const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // limit each IP to 20 requests per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { error: 'Too many requests, please slow down.' }
});

// Path to the log file where low-confidence (unmatched) messages are recorded.
const UNMATCHED_LOG_PATH = path.join(__dirname, 'unmatched.log');

// Fallback response pool — mirrors the `fallback_unknown` intent answers.
// Used whenever the classification score is below CONFIDENCE_THRESHOLD.
const FALLBACK_RESPONSES = [
  "Sorry, I didn't understand that. Try asking something else.",
  "I'm not sure I follow. Could you rephrase that?",
  "Hmm, I don't quite get it. Want to try a different question?"
];

/**
 * Append a low-confidence message to unmatched.log as a JSON line.
 * Creates the file automatically if it doesn't exist (appendFileSync does
 * this by default). Wrapped in try/catch so a logging failure can never
 * crash the chat response.
 * @param {string} message - The raw user message
 * @param {string|null} guessedIntent - The intent node-nlp guessed (rejected)
 * @param {number} score - The confidence score node-nlp assigned (rejected)
 */
function logUnmatchedInput(message, guessedIntent, score) {
  try {
    const entry = {
      timestamp: new Date().toISOString(),
      message,
      guessedIntent: guessedIntent || null,
      score
    };
    fs.appendFileSync(UNMATCHED_LOG_PATH, JSON.stringify(entry) + '\n', 'utf8');
  } catch (err) {
    // Never let logging failures break the chat response
    console.error('Failed to write to unmatched.log:', err);
  }
}

// Middleware
// Origin is echoed back for allowed requests; disallowed origins are rejected
// with a CORS error in the browser (no permissive wildcard).
app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  }
}));
app.use(express.json());

// Track if the models are ready
let modelReady = false;   // v1 engine (intents.js)
let engineReady = false;  // v2 engine (nlpEngine.js)

/**
 * POST /api/chat
 * Accepts: { message: string }
 * Returns: { reply: string }
 * Rate limited: 20 requests per minute per IP
 */
app.post('/api/chat', chatLimiter, async (req, res) => {
  try {
    // Wait for model to be ready
    if (!modelReady) {
      return res.status(503).json({ 
        reply: "I'm still warming up! Please try again in a moment." 
      });
    }

    let { message } = req.body;

    // Validate input: reject missing / non-string / empty-after-trim messages
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({ 
        error: "Message is required." 
      });
    }

    // Sanitize input: strip HTML tags so raw markup never reaches the
    // NLP manager or gets stored in logs/session history
    message = message.replace(/<[^>]*>/g, '');

    // Truncate overly long input before processing
    if (message.length > MAX_MESSAGE_LENGTH) {
      message = message.slice(0, MAX_MESSAGE_LENGTH);
    }

    // Process the message through NLP
    const response = await manager.process(message.trim());
    
    // Get the reply from the response
    let reply;
    
    // Confidence threshold check: only trust node-nlp's match if the score
    // is at or above CONFIDENCE_THRESHOLD. A low score means the match isn't
    // reliable, so we use the fallback_unknown response pool instead — even
    // if node-nlp found an intent match.
    // Note: node-nlp reports intent 'None' with a high score when nothing
    // matches at all, so 'None' is always treated as unmatched too.
    if (response.intent && response.intent !== 'None' && response.score >= CONFIDENCE_THRESHOLD) {
      reply = response.answer;
    } else {
      // Log the low-confidence message so it can be reviewed later
      logUnmatchedInput(message.trim(), response.intent, response.score);
      
      // Pick a random response from the fallback pool
      reply = FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
    }

    res.json({ reply });
  } catch (error) {
    console.error('Error processing chat:', error);
    res.status(500).json({ 
      reply: "Something went wrong on my end. Please try again!" 
    });
  }
});

// Health check endpoint
// modelLoaded reflects whether train() has completed
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    modelLoaded: modelReady,
    engineLoaded: engineReady,
    uptime: process.uptime()
  });
});

/**
 * POST /api/chat/v2
 * Structured-response engine (nlpEngine.js): memory, moderation, analytics,
 * fallback escalation. Same rate limiting + sanitization as /api/chat.
 * Accepts: { message: string, sessionId?: string }
 * Returns the engine's structured result:
 * { type, content, sentiment, payload?, metadata? }
 */
app.post('/api/chat/v2', chatLimiter, async (req, res) => {
  try {
    // Wait for the v2 engine model to be ready
    if (!engineReady) {
      return res.status(503).json({
        type: 'text',
        content: "I'm still warming up! Please try again in a moment.",
        sentiment: 'neutral'
      });
    }

    let { message, sessionId } = req.body;

    // Validate input: reject missing / non-string / empty-after-trim messages
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({
        error: "Message is required."
      });
    }

    // Sanitize input: strip HTML tags so raw markup never reaches the
    // NLP manager or gets stored in logs/session history
    message = message.replace(/<[^>]*>/g, '');

    // Truncate overly long input before processing
    if (message.length > MAX_MESSAGE_LENGTH) {
      message = message.slice(0, MAX_MESSAGE_LENGTH);
    }

    // Process through the v2 engine (sessionId defaults to 'default_user')
    const result = await processMessage(message.trim(), sessionId || 'default_user');

    res.json(result);
  } catch (error) {
    console.error('Error processing chat (v2):', error);
    res.status(500).json({
      type: 'text',
      content: "Something went wrong on my end. Please try again!",
      sentiment: 'neutral'
    });
  }
});

// Start server after training the model
async function startServer() {
  try {
    console.log('Initializing chatbot...');
    await train();
    modelReady = true;
    console.log('Chatbot is ready to respond!');

    // Train/load the v2 engine (nlpEngine.js) in parallel
    await trainEngine();
    engineReady = true;
    console.log('V2 engine is ready to respond!');

    app.listen(PORT, HOST, () => {
      console.log(`Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
      console.log(`Listening on ${HOST}:${PORT}`);
      console.log(`CORS allowed origins: ${FRONTEND_URLS.join(', ')}`);
      console.log(`Test with: curl -X POST http://localhost:${PORT}/api/chat -H "Content-Type: application/json" -d '{"message":"hello"}'`);
    });
  } catch (error) {
    console.error('Failed to initialize chatbot:', error);
    process.exit(1);
  }
}

startServer();

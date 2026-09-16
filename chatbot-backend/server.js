const express = require('express');
const cors = require('cors');
const { manager, train } = require('./intents');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Track if the model is ready
let modelReady = false;

/**
 * POST /api/chat
 * Accepts: { message: string }
 * Returns: { reply: string }
 */
app.post('/api/chat', async (req, res) => {
  try {
    // Wait for model to be ready
    if (!modelReady) {
      return res.status(503).json({ 
        reply: "I'm still warming up! Please try again in a moment." 
      });
    }

    const { message } = req.body;

    // Validate input
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({ 
        reply: "Please provide a valid message." 
      });
    }

    // Process the message through NLP
    const response = await manager.process(message.trim());
    
    // Get the reply from the response
    let reply;
    
    // Check if we have a confident match (score > 0.5)
    if (response.intent && response.score > 0.5) {
      reply = response.answer;
    } else {
      // Fallback when no intent matches confidently
      reply = "Sorry, I didn't understand that. Try asking something else.";
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
app.get('/health', (req, res) => {
  res.json({ 
    status: modelReady ? 'ready' : 'initializing',
    timestamp: new Date().toISOString()
  });
});

// Start server after training the model
async function startServer() {
  try {
    console.log('Initializing chatbot...');
    await train();
    modelReady = true;
    console.log('Chatbot is ready to respond!');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Test with: curl -X POST http://localhost:${PORT}/api/chat -H "Content-Type: application/json" -d '{"message":"hello"}'`);
    });
  } catch (error) {
    console.error('Failed to initialize chatbot:', error);
    process.exit(1);
  }
}

startServer();

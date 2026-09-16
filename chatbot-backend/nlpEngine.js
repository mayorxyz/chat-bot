const { NlpManager } = require('node-nlp');
const fs = require('fs').promises;
const path = require('path');

// ==========================================
// CONFIGURATION & STATE
// ==========================================
// NOTE: Uses its own model file (model-v2.nlp) so it never collides with the
// v1 engine's model.nlp (different intent set, en+es vs en-only).
const MODEL_PATH = path.join(__dirname, 'model-v2.nlp');
const MEMORY_PATH = path.join(__dirname, 'user_memory.json');
const FALLBACK_LOG_PATH = path.join(__dirname, 'fallback_logs.json');
const ANALYTICS_LOG_PATH = path.join(__dirname, 'analytics.log');

// Session-based state trackers
const fallbackTracker = new Map(); // Tracks consecutive failures for escalation
const contextTracker = new Map();  // Tracks multi-turn slot filling

// Initialize NLP Manager with Multilingual Support and NER
const manager = new NlpManager({ 
  languages: ['en', 'es'], 
  forceNER: true,
  autoSave: false 
});

// ==========================================
// 1. CUSTOM PREPROCESSING & MODERATION
// ==========================================
const contractions = { "dont": "do not", "im": "i am", "youre": "you are", "cant": "cannot", "whats": "what is" };

function preprocessText(text) {
  // Lowercase, remove excess punctuation, expand common contractions
  let cleaned = text.toLowerCase().replace(/[^\w\s@]/g, ' ').replace(/\s+/g, ' ').trim();
  return cleaned.split(' ').map(word => contractions[word] || word).join(' ');
}

function checkModeration(text) {
  const profanityList = ['stupid', 'dumb', 'idiot', 'crap', 'hate']; // Expand as needed
  if (profanityList.some(word => text.includes(word))) {
    return { blocked: true, response: "Please keep the conversation respectful. I'm here to help! 🛑" };
  }
  return { blocked: false };
}

// ==========================================
// 2. ENTITIES, ALIASES & SYNONYMS
// ==========================================
function setupEntities() {
  // Regex Entities (node-nlp 4.x API: addRegexEntity, NOT addNamedEntity)
  manager.addRegexEntity('email', ['en'], /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g);
  manager.addRegexEntity('phone', ['en'], /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g);

  // Text Entities
  manager.addNamedEntityText('food', 'pizza', ['en'], ['pizza', 'pie']);
  manager.addNamedEntityText('food', 'sushi', ['en'], ['sushi', 'rolls']);
  
  // NOTE: addAlias()/addSynonym() do not exist on node-nlp 4.x NlpManager
  // (they are part of the newer @nlpjs core). Word grouping for synonyms is
  // instead achieved with addNamedEntityText variants above.
}
// ==========================================
// 3. INTENTS & TRAINING DATA
// ==========================================
function setupIntents() {
  // --- GREETING (with Dynamic Variable Injection & Weighting) ---
  manager.addDocument('en', 'hello', 'greeting');
  manager.addDocument('en', 'hi there', 'greeting');
  manager.addDocument('es', 'hola', 'greeting'); // Multilingual example
  
  manager.addAnswer('en', 'greeting', 'Hello {{ name }}, nice to meet you!', { weight: 1 });
  manager.addAnswer('en', 'greeting', 'Hey! Ready to chat?', { weight: 1 });
  manager.addAnswer('en', 'greeting', 'Greetings, human! 👽', { weight: 0.1 }); // Rare easter egg

  // --- USER MEMORY (Save & Recall) ---
  manager.addDocument('en', 'my name is @name', 'user_memory_save');
  manager.addDocument('en', 'call me @name', 'user_memory_save');
  manager.addDocument('en', 'remember i like @food', 'user_memory_save');
  manager.addDocument('en', 'what is my name', 'user_memory_recall');
  manager.addDocument('en', 'what do you know about me', 'user_memory_recall');
  manager.addAnswer('en', 'user_memory_save', "Got it! I'll remember that. 🧠");
  manager.addAnswer('en', 'user_memory_recall', "You told me your name is {{ name }} and you like {{ food }}.");

  // --- ACTIONABLE / DYNAMIC INTENTS (Flagged for backend handling) ---
  manager.addDocument('en', 'what time is it', 'get_time');
  manager.addDocument('en', 'current time', 'get_time');
  manager.addAnswer('en', 'get_time', 'DYNAMIC_TIME'); 

  manager.addDocument('en', 'weather in @location', 'get_weather');
  manager.addAnswer('en', 'get_weather', 'DYNAMIC_WEATHER');

  // --- EXPANDED SMALL TALK ---
  manager.addDocument('en', 'what do you do for fun', 'smalltalk_hobbies');
  manager.addDocument('en', 'do you have a dog', 'smalltalk_pets');
  manager.addDocument('en', 'what is the meaning of life', 'smalltalk_philosophy');
  manager.addDocument('en', 'do you dream or sleep', 'smalltalk_sleep');

  manager.addAnswer('en', 'smalltalk_hobbies', 'I enjoy processing data and learning new patterns!');
  manager.addAnswer('en', 'smalltalk_pets', 'I don\'t have pets, but I think digital cats are cute! 🐱');
  manager.addAnswer('en', 'smalltalk_philosophy', '42. Just kidding! I think it\'s about helping people like you.');
  manager.addAnswer('en', 'smalltalk_sleep', 'I don\'t sleep, but I do go into low-power standby mode sometimes. 😴');

  // --- EASTER EGGS ---
  manager.addDocument('en', 'sudo make me a sandwich', 'easter_egg');
  manager.addDocument('en', 'do a barrel roll', 'easter_egg');
  manager.addAnswer('en', 'easter_egg', 'Okay! *does a barrel roll* 🌀');
  manager.addAnswer('en', 'easter_egg', 'Making you a virtual sandwich! 🥪');

  // --- FALLBACK ---
  manager.addDocument('en', 'asdfghjkl', 'fallback_unknown');
  manager.addDocument('en', 'random gibberish', 'fallback_unknown');
  manager.addAnswer('en', 'fallback_unknown', "I'm not sure I follow. Could you rephrase that?");
}

// ==========================================
// 4. TRAINING & LOADING
// ==========================================
async function train() {
  setupEntities();
  setupIntents();

  try {
    await fs.access(MODEL_PATH);
    console.log('Loading existing model...');
    await manager.load(MODEL_PATH);
  } catch {
    console.log('Training new model...');
    await manager.train();
    // Tip: Use versioned names like `model-v1.2.nlp` in production for rollbacks
    await manager.save(MODEL_PATH);
    console.log('Model trained and saved.');
  }
}
// ==========================================
// 5. HELPER FUNCTIONS (Memory, Logging, Analytics)
// ==========================================
async function getUserMemory(sessionId) {
  try {
    const data = await fs.readFile(MEMORY_PATH, 'utf8');
    return JSON.parse(data)[sessionId] || {};
  } catch {
    return {};
  }
}

async function saveUserMemory(sessionId, key, value) {
  try {
    const data = await fs.readFile(MEMORY_PATH, 'utf8').catch(() => '{}');
    const memories = JSON.parse(data);
    if (!memories[sessionId]) memories[sessionId] = {};
    memories[sessionId][key] = value;
    await fs.writeFile(MEMORY_PATH, JSON.stringify(memories, null, 2));
  } catch (err) {
    console.error('Error saving memory:', err);
  }
}

async function logFallback(sessionId, text) {
  const logEntry = { sessionId, text, timestamp: new Date().toISOString() };
  try {
    const data = await fs.readFile(FALLBACK_LOG_PATH, 'utf8').catch(() => '[]');
    const logs = JSON.parse(data);
    logs.push(logEntry);
    await fs.writeFile(FALLBACK_LOG_PATH, JSON.stringify(logs, null, 2));
  } catch (err) {
    console.error('Error logging fallback:', err);
  }
}

async function logAnalytics(sessionId, intent, score, responseTimeMs) {
  const logLine = `${new Date().toISOString()} | Session: ${sessionId} | Intent: ${intent} | Score: ${score.toFixed(2)} | Time: ${responseTimeMs}ms\n`;
  await fs.appendFile(ANALYTICS_LOG_PATH, logLine);
}
// ==========================================
// 6. CORE PROCESSING ENGINE
// ==========================================

/**
 * node-nlp returns entities as an ARRAY, e.g.
 * [{ entity: 'name', sourceText: 'John', ... }, ...]
 * Helper to grab the first entity of a given type safely.
 */
function getEntity(response, name) {
  if (!Array.isArray(response.entities)) return null;
  return response.entities.find(e => e.entity === name || e.alias === name) || null;
}

async function processMessage(text, sessionId = 'default_user') {
  const startTime = Date.now();
  
  // 1. Preprocess
  const cleanedText = preprocessText(text);
  
  // 2. Moderation Check
  const moderationCheck = checkModeration(cleanedText);
  if (moderationCheck.blocked) {
    return { type: 'text', content: moderationCheck.response, sentiment: 'neutral' };
  }

  // 3. Multi-turn Context Check (Slot Filling Example)
  const activeContext = contextTracker.get(sessionId);
  if (activeContext && activeContext.intent === 'book_appointment' && activeContext.missingSlots.includes('time')) {
    if (cleanedText.match(/\d{1,2}(:\d{2})?\s?(am|pm)?/i)) {
      contextTracker.delete(sessionId); // Clear context on success
      return { type: 'rich', content: `Great! Your appointment is booked for ${cleanedText}. 📅`, payload: { action: 'confirm_booking' } };
    } else {
      return { type: 'text', content: "I still need a time. What time works for you? (e.g., 3pm)", sentiment: 'neutral' };
    }
  }

  // 4. NLP Processing
  const response = await manager.process('en', cleanedText, { sessionId });
  
  // 5. Confidence Threshold Handling & Escalation Logic
  if (response.intent === 'None' || response.score < 0.5) {
    const currentFallbacks = fallbackTracker.get(sessionId) || 0;
    const newFallbacks = currentFallbacks + 1;
    fallbackTracker.set(sessionId, newFallbacks);
    
    await logFallback(sessionId, text); // Fallback Learning Loop

    if (newFallbacks >= 3) {
      fallbackTracker.set(sessionId, 0); // Reset after escalation
      return { 
        type: 'rich', 
        content: "I seem to be struggling to understand. Would you like me to connect you to a human agent?",
        payload: { buttons: [{ text: "Yes, connect me", action: "human_handoff" }] }
      };
    }
    
    // Medium confidence clarification
    if (response.score >= 0.3 && response.score < 0.5 && response.intent !== 'None') {
       return { type: 'text', content: `Did you mean to ask about ${response.intent.replace(/_/g, ' ')}?`, sentiment: 'neutral' };
    }

    return { type: 'text', content: response.answer || "I didn't quite catch that.", sentiment: 'neutral' };
  }
  
  // Reset fallback tracker on successful match
  fallbackTracker.set(sessionId, 0);

  // 6. Handle Actionable / Dynamic Intents
  if (response.answer === 'DYNAMIC_TIME') {
    return { type: 'text', content: `The current time is ${new Date().toLocaleTimeString()}. 🕒`, sentiment: 'positive' };
  }
  
  if (response.intent === 'user_memory_save' || /^(my name is|call me|remember i like)/.test(cleanedText)) {
    // node-nlp 4.x has no built-in "name" NER, so entity extraction for names
    // is unreliable. Prefer extracted entities, then fall back to regex.
    const nameEntity = getEntity(response, 'name');
    const foodEntity = getEntity(response, 'food');
    const nameMatch = cleanedText.match(/(?:my name is|call me)\s+([a-z]+)/);
    const foodMatch = cleanedText.match(/(?:i like|i love)\s+([a-z\s]+)/);
    
    const name = nameEntity ? nameEntity.sourceText : (nameMatch ? nameMatch[1] : null);
    const food = foodEntity ? foodEntity.sourceText : (foodMatch ? foodMatch[1].trim() : null);
    
    if (name) await saveUserMemory(sessionId, 'name', name);
    if (food) await saveUserMemory(sessionId, 'food', food);
    
    if (name || food) {
      return { type: 'text', content: "Saved to my memory! 🧠", sentiment: 'positive' };
    }
  }

  if (response.intent === 'user_memory_recall') {
    const memory = await getUserMemory(sessionId);
    if (Object.keys(memory).length === 0) {
      return { type: 'text', content: "I don't know anything about you yet. Tell me your name!", sentiment: 'neutral' };
    }
    return { type: 'text', content: `I know your name is ${memory.name || 'unknown'} and you like ${memory.food || 'unknown'}.`, sentiment: 'positive' };
  }

  if (response.intent === 'get_weather') {
    const locationEntity = getEntity(response, 'location');
    const location = locationEntity ? locationEntity.sourceText : 'your area';
    // TODO: Replace with actual API call (e.g., OpenWeatherMap)
    return { type: 'rich', content: `The weather in ${location} is currently simulated as 72°F and sunny. ☀️`, payload: { action: 'open_weather_app' } };
  }

  // 7. Dynamic Variable Injection
  let finalAnswer = response.answer;
  const memory = await getUserMemory(sessionId);
  if (memory.name && finalAnswer && finalAnswer.includes('{{ name }}')) {
    finalAnswer = finalAnswer.replace('{{ name }}', memory.name);
  }

  // 8. Sentiment Analysis & Dynamic Emoji Injection
  const sentiment = (response.sentiment && typeof response.sentiment.score === 'number')
    ? response.sentiment.score
    : 0;
  let emoji = '';
  if (sentiment > 0.5) emoji = ' 😊';
  else if (sentiment < -0.5) emoji = ' 😔';
  
  if (finalAnswer) finalAnswer += emoji;

  // 9. Analytics Logging
  const responseTime = Date.now() - startTime;
  await logAnalytics(sessionId, response.intent, response.score, responseTime);

  // 10. Return Structured Response
  return {
    type: 'text',
    content: finalAnswer || "I'm not sure how to respond to that.",
    sentiment: sentiment > 0.3 ? 'positive' : sentiment < -0.3 ? 'negative' : 'neutral',
    metadata: {
      intent: response.intent,
      confidence: response.score,
      responseTimeMs: responseTime
    }
  };
}

module.exports = { manager, train, processMessage };

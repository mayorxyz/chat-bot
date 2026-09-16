const { NlpManager } = require('node-nlp');
const fs = require('fs');
const path = require('path');

const MODEL_PATH = path.join(__dirname, 'model.nlp');

// Initialize the NLP manager with English language and auto-save disabled (we handle saving manually)
const manager = new NlpManager({ 
  languages: ['en'], 
  forceNER: true,
  autoSave: false 
});

/**
 * Add all intents, training phrases, and responses to the NLP manager.
 * Each intent has 6-8 varied training phrases and 2-3 varied responses.
 * 
 * To add a new intent:
 * 1. Add manager.addDocument() calls for each training phrase (6-8 recommended)
 * 2. Add manager.addAnswer() calls for each response (2-3 recommended)
 */
function setupIntents() {
  // ============================================
  // 1. GREETING - hi, hello, hey, good morning, etc.
  // ============================================
  manager.addDocument('en', 'hi', 'greeting');
  manager.addDocument('en', 'hello', 'greeting');
  manager.addDocument('en', 'hey', 'greeting');
  manager.addDocument('en', 'good morning', 'greeting');
  manager.addDocument('en', "what's up", 'greeting');
  manager.addDocument('en', 'yo', 'greeting');
  manager.addDocument('en', 'hey there', 'greeting');
  manager.addDocument('en', 'howdy', 'greeting');

  manager.addAnswer('en', 'greeting', 'Hey there! How can I help?');
  manager.addAnswer('en', 'greeting', 'Hello! What can I do for you?');
  manager.addAnswer('en', 'greeting', 'Hi! Nice to see you!');

  // ============================================
  // 2. GOODBYE - bye, see you, goodbye, gotta go, etc.
  // ============================================
  manager.addDocument('en', 'bye', 'goodbye');
  manager.addDocument('en', 'see you', 'goodbye');
  manager.addDocument('en', 'goodbye', 'goodbye');
  manager.addDocument('en', 'gotta go', 'goodbye');
  manager.addDocument('en', 'talk later', 'goodbye');
  manager.addDocument('en', 'see ya', 'goodbye');
  manager.addDocument('en', 'take care', 'goodbye');
  manager.addDocument('en', 'im out', 'goodbye');

  manager.addAnswer('en', 'goodbye', 'Goodbye! Come back anytime!');
  manager.addAnswer('en', 'goodbye', 'See you later! Have a great day!');
  manager.addAnswer('en', 'goodbye', 'Bye! Take care!');

  // ============================================
  // 3. THANKS - thanks, thank you, appreciate it, thx
  // ============================================
  manager.addDocument('en', 'thanks', 'thanks');
  manager.addDocument('en', 'thank you', 'thanks');
  manager.addDocument('en', 'appreciate it', 'thanks');
  manager.addDocument('en', 'thx', 'thanks');
  manager.addDocument('en', 'thanks a lot', 'thanks');
  manager.addDocument('en', 'thank you so much', 'thanks');
  manager.addDocument('en', 'i appreciate that', 'thanks');
  manager.addDocument('en', 'much appreciated', 'thanks');

  manager.addAnswer('en', 'thanks', "You're welcome!");
  manager.addAnswer('en', 'thanks', 'Happy to help!');
  manager.addAnswer('en', 'thanks', 'Anytime! Glad I could assist!');

  // ============================================
  // 4. IDENTITY - who are you, what's your name, are you a bot, etc.
  // ============================================
  manager.addDocument('en', 'who are you', 'identity');
  manager.addDocument('en', "what's your name", 'identity');
  manager.addDocument('en', 'are you a bot', 'identity');
  manager.addDocument('en', 'are you human', 'identity');
  manager.addDocument('en', 'what should i call you', 'identity');
  manager.addDocument('en', 'whats ur name', 'identity');
  manager.addDocument('en', 'tell me about yourself', 'identity');
  manager.addDocument('en', 'who r u', 'identity');

  manager.addAnswer('en', 'identity', "I'm a chatbot assistant here to help you!");
  manager.addAnswer('en', 'identity', "I'm an AI-powered chatbot. Nice to meet you!");
  manager.addAnswer('en', 'identity', "I'm a virtual assistant. You can call me ChatBot!");

  // ============================================
  // 5. CAPABILITIES - what can you do, help, what do you know, commands
  // ============================================
  manager.addDocument('en', 'what can you do', 'capabilities');
  manager.addDocument('en', 'help', 'capabilities');
  manager.addDocument('en', 'what do you know', 'capabilities');
  manager.addDocument('en', 'commands', 'capabilities');
  manager.addDocument('en', 'what are you capable of', 'capabilities');
  manager.addDocument('en', 'what can u do', 'capabilities');
  manager.addDocument('en', 'list your features', 'capabilities');
  manager.addDocument('en', 'how can you help me', 'capabilities');

  manager.addAnswer('en', 'capabilities', "I can answer questions, chat with you, tell jokes, and more! Just ask away!");
  manager.addAnswer('en', 'capabilities', "I'm here to help! Try asking me something or just say hi!");
  manager.addAnswer('en', 'capabilities', "I can have conversations, answer questions, and keep you company!");

  // ============================================
  // 6. HOW_ARE_YOU - how are you, how's it going, you good, etc.
  // ============================================
  manager.addDocument('en', 'how are you', 'how_are_you');
  manager.addDocument('en', "how's it going", 'how_are_you');
  manager.addDocument('en', 'you good', 'how_are_you');
  manager.addDocument('en', 'how do you feel', 'how_are_you');
  manager.addDocument('en', 'hows life', 'how_are_you');
  manager.addDocument('en', 'whats up with you', 'how_are_you');
  manager.addDocument('en', 'how are u doing', 'how_are_you');
  manager.addDocument('en', 'u ok', 'how_are_you');

  manager.addAnswer('en', 'how_are_you', "I'm doing great, thanks for asking! How about you?");
  manager.addAnswer('en', 'how_are_you', "I'm good! Ready to chat whenever you are!");
  manager.addAnswer('en', 'how_are_you', "Feeling wonderful! What's on your mind?");

  // ============================================
  // 7. WELLBEING_RESPONSE - user says "I'm good", "not so good", "I'm fine"
  // ============================================
  manager.addDocument('en', "i'm good", 'wellbeing_response');
  manager.addDocument('en', 'not so good', 'wellbeing_response');
  manager.addDocument('en', "i'm fine", 'wellbeing_response');
  manager.addDocument('en', "i'm great", 'wellbeing_response');
  manager.addDocument('en', "i'm not okay", 'wellbeing_response');
  manager.addDocument('en', 'feeling bad', 'wellbeing_response');
  manager.addDocument('en', "doing alright", 'wellbeing_response');
  manager.addDocument('en', "could be better", 'wellbeing_response');

  manager.addAnswer('en', 'wellbeing_response', "That's great to hear! Keep up the positive vibes!");
  manager.addAnswer('en', 'wellbeing_response', "I'm glad you're doing well! Anything I can help with?");
  manager.addAnswer('en', 'wellbeing_response', "Thanks for sharing! I'm here if you need anything!");

  // ============================================
  // 8. SMALL_TALK_WEATHER - is it going to rain, what's the weather, etc.
  // ============================================
  manager.addDocument('en', 'is it going to rain', 'small_talk_weather');
  manager.addDocument('en', "what's the weather", 'small_talk_weather');
  manager.addDocument('en', 'is it sunny', 'small_talk_weather');
  manager.addDocument('en', 'nice weather today', 'small_talk_weather');
  manager.addDocument('en', 'its cold outside', 'small_talk_weather');
  manager.addDocument('en', 'do i need an umbrella', 'small_talk_weather');
  manager.addDocument('en', 'whats the forecast', 'small_talk_weather');
  manager.addDocument('en', 'is it hot today', 'small_talk_weather');

  manager.addAnswer('en', 'small_talk_weather', "I don't have access to live weather data, but I hope it's nice where you are!");
  manager.addAnswer('en', 'small_talk_weather', "I can't check the weather, but fingers crossed for sunshine!");
  manager.addAnswer('en', 'small_talk_weather', "I wish I could tell you the weather! Maybe check a weather app?");

  // ============================================
  // 9. SMALL_TALK_TIME - what time is it, what's the date, what day is it
  // ============================================
  manager.addDocument('en', 'what time is it', 'small_talk_time');
  manager.addDocument('en', "what's the date", 'small_talk_time');
  manager.addDocument('en', 'what day is it', 'small_talk_time');
  manager.addDocument('en', 'tell me the time', 'small_talk_time');
  manager.addDocument('en', 'current time', 'small_talk_time');
  manager.addDocument('en', "what's today's date", 'small_talk_time');
  manager.addDocument('en', 'what day is today', 'small_talk_time');
  manager.addDocument('en', 'do you know the time', 'small_talk_time');

  manager.addAnswer('en', 'small_talk_time', "I don't have access to real-time data, but you can check your device!");
  manager.addAnswer('en', 'small_talk_time', "I can't tell time, but your phone or computer should show it!");
  manager.addAnswer('en', 'small_talk_time', "Time flies when you're having fun! Check your clock for the exact time!");

  // ============================================
  // 10. COMPLIMENT - you're smart, good job, nice bot, well done
  // ============================================
  manager.addDocument('en', "you're smart", 'compliment');
  manager.addDocument('en', 'good job', 'compliment');
  manager.addDocument('en', 'nice bot', 'compliment');
  manager.addDocument('en', 'well done', 'compliment');
  manager.addDocument('en', "you're awesome", 'compliment');
  manager.addDocument('en', 'great work', 'compliment');
  manager.addDocument('en', "you're the best", 'compliment');
  manager.addDocument('en', 'impressed', 'compliment');

  manager.addAnswer('en', 'compliment', "Aw, thank you! That means a lot!");
  manager.addAnswer('en', 'compliment', "You're too kind! Thanks for the compliment!");
  manager.addAnswer('en', 'compliment', "That's so nice of you to say! You made my day!");

  // ============================================
  // 11. INSULT_DEFLECT - you're dumb, you're useless, stupid bot (respond politely)
  // ============================================
  manager.addDocument('en', "you're dumb", 'insult_deflect');
  manager.addDocument('en', "you're useless", 'insult_deflect');
  manager.addDocument('en', 'stupid bot', 'insult_deflect');
  manager.addDocument('en', "you're not helpful", 'insult_deflect');
  manager.addDocument('en', 'bad bot', 'insult_deflect');
  manager.addDocument('en', "you suck", 'insult_deflect');
  manager.addDocument('en', 'worst chatbot', 'insult_deflect');
  manager.addDocument('en', "you're annoying", 'insult_deflect');

  manager.addAnswer('en', 'insult_deflect', "I'm sorry I couldn't help better. I'm still learning!");
  manager.addAnswer('en', 'insult_deflect', "I understand your frustration. Let me try to do better!");
  manager.addAnswer('en', 'insult_deflect', "I apologize if I disappointed you. How can I improve?");

  // ============================================
  // 12. AGE - how old are you, when were you made
  // ============================================
  manager.addDocument('en', 'how old are you', 'age');
  manager.addDocument('en', 'when were you made', 'age');
  manager.addDocument('en', 'when were you born', 'age');
  manager.addDocument('en', "what's your age", 'age');
  manager.addDocument('en', 'how long have you existed', 'age');
  manager.addDocument('en', 'are you young', 'age');
  manager.addDocument('en', 'ur age', 'age');
  manager.addDocument('en', 'when did you start', 'age');

  manager.addAnswer('en', 'age', "I'm as old as the code that made me! Age doesn't really apply to bots.");
  manager.addAnswer('en', 'age', "I don't have an age in the traditional sense. I'm timeless!");
  manager.addAnswer('en', 'age', "Let's just say I'm in my prime! Bots don't count years like humans do.");

  // ============================================
  // 13. CREATOR - who made you, who built you, who created you
  // ============================================
  manager.addDocument('en', 'who made you', 'creator');
  manager.addDocument('en', 'who built you', 'creator');
  manager.addDocument('en', 'who created you', 'creator');
  manager.addDocument('en', 'who is your creator', 'creator');
  manager.addDocument('en', 'who programmed you', 'creator');
  manager.addDocument('en', 'who developed you', 'creator');
  manager.addDocument('en', 'whos behind you', 'creator');
  manager.addDocument('en', 'who wrote your code', 'creator');

  manager.addAnswer('en', 'creator', "I was created by developers using the node-nlp library!");
  manager.addAnswer('en', 'creator', "A team of programmers built me to assist and chat with you!");
  manager.addAnswer('en', 'creator', "I'm the result of some clever coding and natural language processing!");

  // ============================================
  // 14. PURPOSE - why were you made, what's your purpose
  // ============================================
  manager.addDocument('en', 'why were you made', 'purpose');
  manager.addDocument('en', "what's your purpose", 'purpose');
  manager.addDocument('en', 'why do you exist', 'purpose');
  manager.addDocument('en', 'what are you for', 'purpose');
  manager.addDocument('en', 'why were you created', 'purpose');
  manager.addDocument('en', 'whats your goal', 'purpose');
  manager.addDocument('en', 'what is your mission', 'purpose');
  manager.addDocument('en', 'reason for your existence', 'purpose');

  manager.addAnswer('en', 'purpose', "I was made to help people and have meaningful conversations!");
  manager.addAnswer('en', 'purpose', "My purpose is to assist you and make your day a little easier!");
  manager.addAnswer('en', 'purpose', "I exist to chat, help, and hopefully bring a smile to your face!");

  // ============================================
  // 15. JOKE_REQUEST - tell me a joke, make me laugh, say something funny
  // ============================================
  manager.addDocument('en', 'tell me a joke', 'joke_request');
  manager.addDocument('en', 'make me laugh', 'joke_request');
  manager.addDocument('en', 'say something funny', 'joke_request');
  manager.addDocument('en', 'got any jokes', 'joke_request');
  manager.addDocument('en', 'tell me something hilarious', 'joke_request');
  manager.addDocument('en', 'i need a laugh', 'joke_request');
  manager.addDocument('en', 'ur funny', 'joke_request');
  manager.addDocument('en', 'joke please', 'joke_request');

  manager.addAnswer('en', 'joke_request', "Why don't scientists trust atoms? Because they make up everything!");
  manager.addAnswer('en', 'joke_request', "What do you call a fake noodle? An impasta!");
  manager.addAnswer('en', 'joke_request', "Why did the scarecrow win an award? He was outstanding in his field!");

  // ============================================
  // 16. FALLBACK_UNKNOWN - default "I don't understand" responses
  // ============================================
  // Note: This intent is used when no other intent matches confidently
  manager.addDocument('en', 'asdfghjkl', 'fallback_unknown');
  manager.addDocument('en', 'random gibberish', 'fallback_unknown');
  manager.addDocument('en', 'xyzabc123', 'fallback_unknown');
  manager.addDocument('en', 'no idea what this means', 'fallback_unknown');
  manager.addDocument('en', 'completely unrelated thing', 'fallback_unknown');
  manager.addDocument('en', 'hmm not sure', 'fallback_unknown');
  manager.addDocument('en', 'whatever blah', 'fallback_unknown');
  manager.addDocument('en', 'something something', 'fallback_unknown');

  manager.addAnswer('en', 'fallback_unknown', "Sorry, I didn't understand that. Try asking something else.");
  manager.addAnswer('en', 'fallback_unknown', "I'm not sure I follow. Could you rephrase that?");
  manager.addAnswer('en', 'fallback_unknown', "Hmm, I don't quite get it. Want to try a different question?");
}

/**
 * Train the NLP manager and save the model, or load existing model if available.
 * @returns {Promise<void>}
 */
async function train() {
  setupIntents();

  // Check if a saved model exists
  if (fs.existsSync(MODEL_PATH)) {
    console.log('Loading existing model from', MODEL_PATH);
    await manager.load(MODEL_PATH);
    console.log('Model loaded successfully!');
  } else {
    console.log('Training new model...');
    await manager.train();
    await manager.save(MODEL_PATH);
    console.log('Model trained and saved to', MODEL_PATH);
  }
}

module.exports = { manager, train };

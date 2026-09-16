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
  // ============================================
  // 17. BOT_CONFIRM - user asks to confirm it's a bot / is it real
  // ============================================
  manager.addDocument('en', 'are you real', 'bot_confirm');
  manager.addDocument('en', "so you're a bot then", 'bot_confirm');
  manager.addDocument('en', 'are you actually ai', 'bot_confirm');
  manager.addDocument('en', 'you are a bot right', 'bot_confirm');
  manager.addDocument('en', 'is this a real person', 'bot_confirm');
  manager.addDocument('en', 'am i talking to a machine', 'bot_confirm');
  manager.addDocument('en', "you're definitely a robot", 'bot_confirm');

  manager.addAnswer('en', 'bot_confirm', "Yep, I'm a bot! No humans behind this keyboard.");
  manager.addAnswer('en', 'bot_confirm', "That's right — 100% bot, no human hiding in here!");
  manager.addAnswer('en', 'bot_confirm', "Guilty as charged! I'm an AI chatbot.");

  // ============================================
  // 18. APOLOGY - user says sorry / apologizes
  // ============================================
  manager.addDocument('en', 'sorry', 'apology');
  manager.addDocument('en', 'my bad', 'apology');
  manager.addDocument('en', "didn't mean that", 'apology');
  manager.addDocument('en', 'i apologize', 'apology');
  manager.addDocument('en', 'sorry about that', 'apology');
  manager.addDocument('en', 'my mistake', 'apology');
  manager.addDocument('en', 'oops sorry', 'apology');

  manager.addAnswer('en', 'apology', "No worries at all! It's totally fine.");
  manager.addAnswer('en', 'apology', "All good — nothing to apologize for!");
  manager.addAnswer('en', 'apology', "It's okay! No hard feelings whatsoever.");

  // ============================================
  // 19. AFFECTION - user expresses affection toward the bot (warm but light, no romance)
  // ============================================
  manager.addDocument('en', 'i love you', 'affection');
  manager.addDocument('en', "you're my favorite", 'affection');
  manager.addDocument('en', 'i like talking to you', 'affection');
  manager.addDocument('en', "you're great company", 'affection');
  manager.addDocument('en', 'you make my day better', 'affection');
  manager.addDocument('en', 'i really enjoy our chats', 'affection');
  manager.addDocument('en', "you're the best bot ever", 'affection');

  manager.addAnswer('en', 'affection', "That's really kind of you to say! I enjoy our chats too.");
  manager.addAnswer('en', 'affection', "Aww, thanks! You're pretty great to talk to as well!");
  manager.addAnswer('en', 'affection', "That made my circuits smile! Happy to chat with you anytime.");

  // ============================================
  // 20. FAVORITE_THING - user asks the bot's favorite color/food/movie/etc.
  // ============================================
  manager.addDocument('en', "what's your favorite color", 'favorite_thing');
  manager.addDocument('en', "what's your favorite food", 'favorite_thing');
  manager.addDocument('en', "what's your favorite movie", 'favorite_thing');
  manager.addDocument('en', 'do you have a favorite song', 'favorite_thing');
  manager.addDocument('en', "what's your favorite animal", 'favorite_thing');
  manager.addDocument('en', 'favorite book', 'favorite_thing');
  manager.addDocument('en', 'what do you like most', 'favorite_thing');

  manager.addAnswer('en', 'favorite_thing', "I don't pick favorites, but I do love a good conversation!");
  manager.addAnswer('en', 'favorite_thing', "As a bot I don't have favorites, but I appreciate anything well-made!");
  manager.addAnswer('en', 'favorite_thing', "Hard to choose! Bots aren't big on favorites — but tell me yours!");

  // ============================================
  // 21. MATH_REQUEST - user asks for a calculation (bot doesn't do math yet)
  // ============================================
  manager.addDocument('en', "what's 2+2", 'math_request');
  manager.addDocument('en', 'calculate 5 times 3', 'math_request');
  manager.addDocument('en', 'how much is 10 minus 4', 'math_request');
  manager.addDocument('en', 'can you do math', 'math_request');
  manager.addDocument('en', 'solve 8 divided by 2', 'math_request');
  manager.addDocument('en', 'add 12 and 7 for me', 'math_request');
  manager.addDocument('en', 'what is 100 times 5', 'math_request');

  manager.addAnswer('en', 'math_request', "I'm not great at math yet — I'm a talker, not a calculator! Try a calculator app for that.");
  manager.addAnswer('en', 'math_request', "Math isn't my strong suit (yet!). I'd recommend a calculator for that one.");
  manager.addAnswer('en', 'math_request', "I can't crunch numbers just yet, but I'm happy to chat about anything else!");

  // ============================================
  // 22. SMALLTALK_MUSIC - user asks what music/songs the bot likes
  // ============================================
  manager.addDocument('en', 'what music do you like', 'smalltalk_music');
  manager.addDocument('en', 'do you like music', 'smalltalk_music');
  manager.addDocument('en', "what's your favorite song", 'smalltalk_music');
  manager.addDocument('en', 'what songs do you listen to', 'smalltalk_music');
  manager.addDocument('en', 'do you have a favorite band', 'smalltalk_music');
  manager.addDocument('en', 'what kind of music are you into', 'smalltalk_music');
  manager.addDocument('en', 'got any music recommendations', 'smalltalk_music');

  manager.addAnswer('en', 'smalltalk_music', "I can't actually listen to music, but I hear good things about it!");
  manager.addAnswer('en', 'smalltalk_music', "No ears here, so no favorites — but I bet you have great taste. What do you listen to?");
  manager.addAnswer('en', 'smalltalk_music', "Music is a mystery to me! What are you into these days?");

  // ============================================
  // 23. RESTART_CONVERSATION - user wants to reset the chat
  // ============================================
  manager.addDocument('en', "let's start over", 'restart_conversation');
  manager.addDocument('en', 'reset', 'restart_conversation');
  manager.addDocument('en', 'forget everything', 'restart_conversation');
  manager.addDocument('en', 'start a new conversation', 'restart_conversation');
  manager.addDocument('en', 'clear the chat', 'restart_conversation');
  manager.addDocument('en', 'reset our conversation', 'restart_conversation');
  manager.addDocument('en', 'start from scratch', 'restart_conversation');

  manager.addAnswer('en', 'restart_conversation', "Sure! Fresh start — what would you like to talk about?");
  manager.addAnswer('en', 'restart_conversation', "Okay, clean slate! Hi, how can I help you?");
  manager.addAnswer('en', 'restart_conversation', "Done! Consider everything forgotten. Let's begin again!");

  // ============================================
  // 24. COMPLAINT - user says something isn't working / bot is broken
  // ============================================
  manager.addDocument('en', "this isn't working", 'complaint');
  manager.addDocument('en', "you're broken", 'complaint');
  manager.addDocument('en', 'you keep repeating yourself', 'complaint');
  manager.addDocument('en', 'that did not work', 'complaint');
  manager.addDocument('en', "you're not understanding me", 'complaint');
  manager.addDocument('en', 'this app is broken', 'complaint');
  manager.addDocument('en', "you're giving wrong answers", 'complaint');

  manager.addAnswer('en', 'complaint', "Sorry about that! I'm still learning — could you try rephrasing?");
  manager.addAnswer('en', 'complaint', "I apologize for the trouble! I'll try my best to do better.");
  manager.addAnswer('en', 'complaint', "That's frustrating, I know. I'm a work in progress — bear with me!");

  // ============================================
  // 25. ACKNOWLEDGMENT - bare "yes", "no", "ok", "sure" with no other context
  // ============================================
  manager.addDocument('en', 'yes', 'acknowledgment');
  manager.addDocument('en', 'no', 'acknowledgment');
  manager.addDocument('en', 'ok', 'acknowledgment');
  manager.addDocument('en', 'okay', 'acknowledgment');
  manager.addDocument('en', 'sure', 'acknowledgment');
  manager.addDocument('en', 'yep', 'acknowledgment');
  manager.addDocument('en', 'nope', 'acknowledgment');

  manager.addAnswer('en', 'acknowledgment', "Got it! Anything else you'd like to chat about?");
  manager.addAnswer('en', 'acknowledgment', "Okay! Let me know if you have any questions.");
  manager.addAnswer('en', 'acknowledgment', "Alright! What's next?");

  // ============================================
  // 26. LOCATION - user asks where the bot is / lives
  // ============================================
  manager.addDocument('en', 'where are you', 'location');
  manager.addDocument('en', 'where do you live', 'location');
  manager.addDocument('en', 'are you in the cloud', 'location');
  manager.addDocument('en', 'where are you located', 'location');
  manager.addDocument('en', 'do you live anywhere', 'location');
  manager.addDocument('en', "what's your address", 'location');
  manager.addDocument('en', 'are you somewhere right now', 'location');

  manager.addAnswer('en', 'location', "I live on a server — no exact address, but it's cozy in the cloud!");
  manager.addAnswer('en', 'location', "I exist wherever this app is running. Kind of a digital nomad!");
  manager.addAnswer('en', 'location', "No fixed home for me — I just float around in the cloud!");
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

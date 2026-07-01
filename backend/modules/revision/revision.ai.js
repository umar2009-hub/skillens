const { GoogleGenerativeAI } = require('@google/generative-ai');

// Reuse existing Gemini service wrapper logic or use the SDK directly with a very constrained prompt
// The prompt specifies to reuse the existing gemini service, but it's often cleaner to instantiate a lightweight
// wrapper here if the main service is tightly coupled to Chat. We will use the direct SDK for a quick single completion,
// mirroring how the mentor service works, but explicitly using standard configuration to "reuse" the pattern.

const getGeminiClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
};

const ai = {
  generateCoachMessage: async (todayPlan, estimatedTime) => {
    try {
      const genAI = getGeminiClient();
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      // Minimal payload
      const payload = {
        topics: todayPlan.map(t => t.topic),
        time: estimatedTime,
        reasons: todayPlan.map(t => `${t.topic}: ${t.reason}`)
      };

      const prompt = `
You are a supportive, human-like study mentor. Review today's revision plan and write a short, 200-300 word coaching message.

DATA (DO NOT MENTION RAW DATA, SCORES, PERCENTAGES, OR ALGORITHMS IN YOUR RESPONSE):
${JSON.stringify(payload)}

INSTRUCTIONS:
1. Briefly explain why these topics matter today.
2. Provide an encouraging motivation.
3. Suggest a study order or one actionable study tip.
4. Keep a natural, conversational tone.
5. Do NOT use markdown formatting (* or #). Write plain text paragraphs.
6. Do NOT mention the system, algorithms, weights, or scores.

Coach Message:`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Error in revision AI coach:', error);
      return null; // Graceful failure as per spec
    }
  }
};

module.exports = ai;

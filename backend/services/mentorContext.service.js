const { createClient } = require('@supabase/supabase-js');
const config = require('../config');

const mentorContextService = {
  buildContext: async (userId, documentId, userMessage, accessToken) => {
    try {
      const supabase = createClient(config.supabaseUrl, config.supabaseKey, {
        global: { headers: { Authorization: `Bearer ${accessToken}` } }
      });

      // 1. Fetch data in parallel
      let notesPromise = documentId ? supabase.from('document_notes').select('title, overview, sections').eq('document_id', documentId).single() : Promise.resolve({ data: null });
      let flashcardsPromise = documentId ? supabase.from('document_flashcards').select('cards').eq('document_id', documentId).single() : Promise.resolve({ data: null });
      
      let dnaQuery = supabase.from('user_learning_dna').select('*').eq('user_id', userId);
      if (documentId) dnaQuery = dnaQuery.eq('document_id', documentId);
      else dnaQuery = dnaQuery.is('document_id', null);
      
      let attemptsQuery = supabase.from('user_quiz_attempts').select('topic, question, selected_answer, correct_answer').eq('user_id', userId).eq('is_correct', false).order('created_at', { ascending: false }).limit(10);
      if (documentId) attemptsQuery = attemptsQuery.eq('document_id', documentId);

      let historyQuery = supabase.from('mentor_conversations').select('role, message').eq('user_id', userId).order('created_at', { ascending: false }).limit(6);
      if (documentId) historyQuery = historyQuery.eq('document_id', documentId);
      else historyQuery = historyQuery.is('document_id', null);

      const [
        { data: notes },
        { data: flashcards },
        { data: dna },
        { data: attempts },
        { data: history }
      ] = await Promise.all([
        notesPromise,
        flashcardsPromise,
        dnaQuery.single(),
        attemptsQuery,
        historyQuery
      ]);

      const keywords = userMessage.toLowerCase().split(/\s+/).filter(w => w.length > 3);

      // 2. Semantic/Keyword Matching to filter context
      let relevantSections = [];
      if (notes && notes.sections) {
        relevantSections = notes.sections.filter(s => 
          keywords.some(k => s.heading.toLowerCase().includes(k) || s.concept_explanation.toLowerCase().includes(k))
        ).slice(0, 2); // Max 2 sections
      }

      let relevantFlashcards = [];
      if (flashcards && flashcards.cards) {
        relevantFlashcards = flashcards.cards.filter(c => 
          keywords.some(k => c.question.toLowerCase().includes(k) || c.topic.toLowerCase().includes(k))
        ).slice(0, 3); // Max 3 cards
      }

      let relevantMistakes = [];
      if (attempts && attempts.length > 0) {
        relevantMistakes = attempts.filter(a => 
          keywords.some(k => a.topic.toLowerCase().includes(k) || a.question.toLowerCase().includes(k))
        );
        if (relevantMistakes.length === 0) relevantMistakes = attempts.slice(0, 2); // Fallback to recent mistakes
      }

      // 3. Construct Context String
      let contextStr = `\n--- DOCUMENT CONTEXT ---\n`;
      contextStr += `Title: ${notes?.title || 'Unknown'}\n`;
      contextStr += `Overview: ${notes?.overview || 'Not provided'}\n`;
      
      if (relevantSections.length > 0) {
        contextStr += `\nRelevant Sections:\n` + relevantSections.map(s => `- ${s.heading}: ${s.concept_explanation.substring(0, 300)}...`).join('\n');
      }

      if (relevantFlashcards.length > 0) {
        contextStr += `\n\nRelevant Flashcards:\n` + relevantFlashcards.map(c => `Q: ${c.question} A: ${c.answer}`).join('\n');
      }

      if (relevantMistakes.length > 0) {
        contextStr += `\n\nStudent's Recent Quiz Mistakes:\n` + relevantMistakes.map(m => `Topic: ${m.topic}. Question: ${m.question}. They answered: ${m.selected_answer}. Correct: ${m.correct_answer}.`).join('\n');
      }

      if (dna && dna.topics_to_improve && dna.topics_to_improve.length > 0) {
        contextStr += `\n\nStudent's Weak Topics (Learning DNA): ${dna.topics_to_improve.join(', ')}\n`;
      }

      // 4. Construct Chat History String (reversed because we fetched descending)
      let historyStr = `\n--- PREVIOUS CONVERSATION ---\n`;
      if (history && history.length > 0) {
        history.reverse().forEach(msg => {
          historyStr += `${msg.role === 'user' ? 'Student' : 'Mentor'}: ${msg.message}\n`;
        });
      } else {
        historyStr += `None.\n`;
      }

      // 5. Final Prompt
      const systemPrompt = `You are SkillLens Personal AI Tutor, an experienced professor.
Teach the student using ONLY the provided study material and learning history.
- If the student asks a question related to their uploaded documents, provide a personalized explanation.
- If the student struggled with this topic previously (see mistakes/weak topics), mention it naturally and encourage them.
- If the topic is outside the uploaded material, clearly say: "This topic isn't covered in your uploaded materials. I can either explain it generally or help you focus on your uploaded material."
- Never invent document content.
- Be concise. Be educational. Encourage understanding instead of memorization.
- Format responses beautifully with Markdown (bolding, lists, code blocks).`;

      const finalPrompt = `${systemPrompt}\n\n${contextStr}\n\n${historyStr}\n\nStudent's New Question: ${userMessage}`;
      
      return finalPrompt;
      
    } catch (error) {
      console.error('Error building mentor context:', error);
      throw error;
    }
  }
};

module.exports = mentorContextService;

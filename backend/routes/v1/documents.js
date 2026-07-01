const express = require('express');
const documentController = require('../../controllers/document.controller');

const router = express.Router();

// POST /api/v1/documents/extract
router.post('/extract', documentController.extractDocument);

// GET /api/v1/documents/:id
router.get('/:id', documentController.getDocument);

// GET /api/v1/documents/:id/summary
router.get('/:id/summary', documentController.getDocumentSummary);

// GET /api/v1/documents/:id/notes
router.get('/:id/notes', documentController.getDocumentNotes);

// GET /api/v1/documents/:id/flashcards
router.get('/:id/flashcards', documentController.getDocumentFlashcards);

// GET /api/v1/documents/:id/flashcards/progress
router.get('/:id/flashcards/progress', documentController.getFlashcardsProgress);

// POST /api/v1/documents/:id/flashcards/progress
router.post('/:id/flashcards/progress', documentController.updateFlashcardProgress);

// POST /api/v1/documents/:id/flashcards/hint
router.post('/:id/flashcards/hint', documentController.getFlashcardHint);

// POST /api/v1/documents/:id/flashcards/explain
router.post('/:id/flashcards/explain', documentController.getFlashcardExplanation);

// GET /api/v1/documents/:id/quiz
router.get('/:id/quiz', documentController.getQuiz);

// POST /api/v1/documents/:id/quiz/session
router.post('/:id/quiz/session', documentController.startQuizSession);

// POST /api/v1/documents/:id/quiz/attempt
router.post('/:id/quiz/attempt', documentController.submitQuizAttempt);

// POST /api/v1/documents/quiz/session/:sessionId/finish
router.post('/quiz/session/:sessionId/finish', documentController.finishQuizSession);

// GET /api/v1/documents/:id/quiz/analytics/:sessionId
router.get('/:id/quiz/analytics/:sessionId', documentController.getQuizAnalytics);

// POST /api/v1/documents/:id/retry
router.post('/:id/retry', documentController.retryDocument);

// POST /api/v1/documents/:id/cancel
router.post('/:id/cancel', documentController.cancelDocument);

// DELETE /api/v1/documents/:id
router.delete('/:id', documentController.deleteDocument);

module.exports = router;

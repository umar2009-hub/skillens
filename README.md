# SkillLens: AI-Powered Adaptive Learning Ecosystem

SkillLens is an intelligent educational platform that transforms static PDFs into interactive, adaptive learning experiences. By leveraging Gemini AI and advanced analytics, SkillLens maps a user's unique "Learning DNA" to construct personalized study guides, dynamic flashcards, and customized revision planners that adapt to their performance.

## 🚀 Key Features

*   **Intelligent Content Processing:** Upload any academic PDF and watch as Gemini AI instantly extracts core topics, summaries, and key concepts.
*   **Adaptive Study Materials:** Automatically generate interactive Flashcards and Quizzes tailored to the document's content.
*   **Learning DNA Generation:** As you take quizzes and study, SkillLens builds a real-time heatmap of your strengths and weaknesses.
*   **Personal AI Mentor:** Chat with a context-aware AI tutor that understands the specific document you are studying.
*   **Spaced Repetition Planner:** A smart algorithm schedules weak topics for daily review, ensuring long-term retention.

## 🛠️ Technology Stack

*   **Frontend:** React (Vite), Tailwind CSS, Framer Motion, Recharts, Lucide Icons.
*   **Backend:** Node.js, Express, PDF-Parse.
*   **Database & Auth:** Supabase (PostgreSQL, Storage, Authentication).
*   **AI Engine:** Google Gemini Pro (`@google/generative-ai`).
*   **Deployment Target:** Vercel (Frontend) & Northflank (Backend).

## 📦 Local Installation

1. **Clone the repository**
2. **Install Frontend Dependencies:**
   ```bash
   cd frontend
   npm install
   ```
3. **Install Backend Dependencies:**
   ```bash
   cd backend
   npm install
   ```
4. **Environment Variables:** 
   Duplicate `.env.example` in both `/frontend` and `/backend` and fill in your Supabase and Gemini keys.
5. **Run the App:**
   Terminal 1 (Backend): `cd backend && npm run dev`
   Terminal 2 (Frontend): `cd frontend && npm run dev`

## 🌍 Production Deployment

SkillLens is fully optimized for production deployment. Please refer to the comprehensive [Deployment Guide](docs/DEPLOYMENT_GUIDE.md) for step-by-step instructions on deploying the stack to Vercel and Northflank.

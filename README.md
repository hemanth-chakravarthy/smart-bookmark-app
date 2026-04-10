# Smart Bookmark Protocol

A high-density, professional-grade digital knowledge archive built for speed and precision. Inspired by Obsidian aesthetics and engineered for real-time synchronization.

## Core Features

###  Secure Intelligence
- **Google OAuth**: Seamless, passwordless authentication flow via Supabase Auth.
- **Private Sovereignty (RLS)**: Privacy is enforced at the database level using **Row Level Security (RLS)**. Your bookmarks are never visible to other users, guaranteed by the Postgres engine.

###  Real-Time Infrastructure
- **Postgres Live-Sync**: Powered by Supabase Realtime. Bookmark additions, deletions, and folder moves appear across all open tabs instantly without page refreshes.
- **AI Metadata Engine**: Powered by **Gemini 2.0 Flash**. Automatically crawls URLs to synthesize professional summaries and categorical tags, even for complex SPAs like Claude or Overleaf.

###  High-Density interface
- **Obsidian Aesthetic**: A luxurious Amber/Gold & Obsidian UI designed for maximum information density.
- **Knowledge Hierarchy**: Supports complex nested folders with real-time updates.

---

##  Bonus Feature: Smart Trash Protocol

We chose to implement a **Smart Trash System with Automated Purge** as our bonus feature. 

### Why this feature?
Acidental deletion is the primary source of user anxiety in information management tools. Standard "Delete" buttons are high-risk. 
- **The Protocol**: Instead of permanent deletion, items move to a "Trash Protocol" view.
- **30-Day Automated Clearance**: Each item in the trash displays a countdown. After 30 days, the database automatically purges the record.
- **Restore Capability**: Users can instantly recover items to their original folders before the purge.
- **Product Rationale**: This strikes the perfect balance between **user safety** (recovering "oops" deletes) and **database health** (automated cleanup).

---

##  Tech Stack
- **Frontend**: Next.js (App Router), TailwindCSS, Lucide.
- **Backend/Database**: Supabase (Postgres, Auth, RLS, Realtime).
- **AI**: Gemini 2.0 Flash & Text-Embedding-004.
- **Deployment**: Vercel.

##  Deployment Instructions
1. Clone the repository.
2. Configure `.env.local` with Supabase and Gemini API keys.
3. Run `npm install` and `npm run dev`.
4. Deploy to Vercel via `git push`.

---
*Developed with focus on density, speed, and safety.*

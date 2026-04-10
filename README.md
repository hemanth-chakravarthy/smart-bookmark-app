# Smart Bookmark Protocol

A high-density, professional-grade digital knowledge archive built for speed and precision. Inspired by Obsidian aesthetics and engineered for real-time synchronization.

## Core Features

###  Secure Intelligence
- **Google OAuth**: Seamless, passwordless authentication flow via Supabase Auth.
- **Private Sovereignty (RLS)**: Privacy is enforced at THE database level using **Row Level Security (RLS)**. Your bookmarks are never visible to other users, guaranteed by the Postgres engine.

###  Real-Time Infrastructure
- **Postgres Live-Sync**: Powered by Supabase Realtime. Bookmark additions, deletions, and folder moves appear across all open tabs instantly without page refreshes.
- **Resilient AI Engine**: Hybrid synthesis powered by **Groq (Llama 3.3)**. Automatically crawls URLs to synthesize professional summaries and categorical tags in <300ms.

---

### Design Inspiration 
- **Obsidian**: A luxurious Amber/Gold & Obsidian UI designed for maximum information density.
- **Notion**: A clean and modern interface for organizing information.
- **Behance Inspiration**: [Imgriff Note Platform](https://www.behance.net/gallery/203744687/Imgriff-Note-organization-platform)

---

##  Bonus Feature: Smart Trash Protocol & AI Summarization

We chose to implement a **Smart Trash System** and a **Resilient AI Synthesis Engine** as our bonus features.

### 1. Smart Trash Protocol (Safety First)
Accidental deletion is the primary source of user anxiety in information management tools. Standard "Delete" buttons are high-risk. 
- **The Protocol**: Instead of permanent deletion, items move to a "Trash Protocol" view.
- **30-Day Automated Clearance**: Each item in the trash displays a countdown. The database is primed for automated purging after 30 days.
- **Restore Capability**: Users can instantly recover items to their original folders before the purge.
- **Product Rationale**: This strikes the perfect balance between **user safety** (recovering "oops" deletes) and **database health** (automated cleanup).

### 2. AI Summarization & Resilient Meta-Logic
Traditional bookmarking requires manual tagging. We automated this using a high-performance AI pipeline.
- **Groq Integration**: By using Llama 3.3 via Groq, we achieve near-instantaneous (<3rd of a second) metadata generation—far faster than traditional LLM models.
- **Hybrid Fallback**: We implemented a **Local Keyword Extractor**. If the AI service is unreachable or rate-limited, the system automatically falls back to internal parsing logic to ensure your bookmarks *always* have tags and descriptions.
- **Intelligent Context**: The engine doesn't just read the `<meta>` tags; it scrapes the actual body content (up to 8,000 characters) to provide a deep, contextual summary that actually helps you remember why you saved the link.

---

##  Tech Stack
- **Frontend**: Next.js (App Router), TailwindCSS, Lucide.
- **Backend/Database**: Supabase (Postgres, Auth, RLS, Realtime).
- **Intelligence**: Groq (Llama 3.3-70b) for text synthesis.
- **Deployment**: Vercel.

##  Deployment Instructions
1. Clone the repository.
2. Configure `.env.local` with Supabase and Groq API keys.
3. Run `npm install` and `npm run dev`.
4. Run the consolidated SQL in `supabase/final_schema.sql` to set up RLS and Realtime.
5. Deploy to Vercel via GitHub integration.

---
*Developed with focus on density, speed, and safety.*

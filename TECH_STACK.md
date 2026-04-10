# Technology Stack Documentation

## Product: Smart Bookmark App

---

# 1. STACK OVERVIEW

### Architecture Pattern
- **Type**: Serverless + Backend-as-a-Service (BaaS)
- **Pattern**: JAMstack (Frontend + API-driven backend services)
- **Deployment Model**: Cloud-based

### Stack Summary
- **Frontend Framework**: Next.js (App Router)
- **Backend & Services**: Supabase (Auth, Database, Realtime)
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

---

# 2. FRONTEND

## Framework: Next.js (App Router)

### Description
Next.js is used as the primary frontend framework with the App Router architecture, enabling modern React patterns with server components and optimized rendering.

### Key Capabilities Used
- File-based routing using `/app` directory
- Server Components for efficient rendering
- Client Components for interactivity
- Built-in API handling (via route handlers if needed)
- Automatic code splitting and optimization

### Why Next.js (App Router)
- Supports hybrid rendering (SSR + CSR)
- Improves performance through server-side rendering
- Clean routing system aligned with scalable architecture
- Built-in optimizations (images, fonts, bundling)

### Constraints
- Must strictly use App Router (not Pages Router)
- Requires understanding of server vs client components

---

# 3. BACKEND / AUTH / DATABASE

## Platform: Supabase

### Description
Supabase acts as the complete backend solution, handling authentication, database operations, and real-time updates.

---

### 3.1 Authentication

**Type**: Google OAuth

#### Features Used
- Secure login via Google accounts
- Session management
- User identity management

#### Responsibilities
- Authenticate users
- Maintain session state
- Provide user identifiers for data isolation

#### Why Supabase Auth
- Easy integration with frontend
- Secure OAuth implementation
- Eliminates need to build custom auth system

---

### 3.2 Database

**Database Type**: PostgreSQL

#### Features Used
- Relational data storage for bookmarks
- Structured schema (users, bookmarks, tags)
- Querying and filtering

#### Responsibilities
- Store user bookmarks
- Maintain relationships (user → bookmarks)
- Ensure data consistency

#### Why PostgreSQL (via Supabase)
- Strong relational capabilities
- Reliable and scalable
- Supports structured querying

---

### 3.3 Real-Time Subscriptions

#### Features Used
- Live updates across multiple tabs
- Subscription to database changes (INSERT, DELETE)

#### Responsibilities
- Sync bookmark changes instantly
- Eliminate need for manual refresh

#### Why Supabase Realtime
- Built-in real-time capabilities
- Event-driven updates
- Minimal setup required

---

### 3.4 Security (Row Level Security - RLS)

#### Purpose
Ensure each user can only access their own data.

#### Implementation Concept
- Policies enforce:
  - Users can only read/write their own bookmarks

#### Why RLS
- Database-level security
- Prevents unauthorized access
- Ensures strict data isolation

---

# 4. STYLING

## Framework: Tailwind CSS

### Description
Tailwind CSS is used for styling with a utility-first approach.

### Key Usage
- Layout (flex, grid)
- Spacing and alignment
- Typography
- Responsive design
- Component styling

### Why Tailwind CSS
- Fast UI development
- Consistent design system
- No need for custom CSS files
- Easy responsiveness

### Requirement
- Must be used properly (not just default utilities)
- Should demonstrate structured and clean UI design

---

# 5. DEPLOYMENT

## Platform: Vercel

### Description
Vercel is used for deploying the application with seamless integration for Next.js.

### Features Used
- Automatic deployments from repository
- Preview deployments for testing
- Global CDN for fast delivery

### Responsibilities
- Host the frontend application
- Provide public live URL
- Ensure availability and performance

### Why Vercel
- Native support for Next.js
- Simple deployment process
- Optimized performance out-of-the-box

### Requirement
- Application must be publicly accessible
- Google OAuth must work in production

---

# 6. INTEGRATION FLOW

### Authentication Flow
1. User clicks "Login with Google"
2. Supabase handles OAuth
3. Session created
4. User redirected to dashboard

### Data Flow
1. User performs action (add/delete bookmark)
2. Request sent to Supabase
3. Database updated
4. Realtime event triggered
5. UI updates automatically

---

# 7. CONSTRAINTS

- Only the specified technologies are used
- No additional backend servers
- No external state management libraries
- No alternative styling frameworks
- No custom authentication systems

---

# 8. FINAL SUMMARY

This stack is designed to:
- Minimize backend complexity
- Enable rapid development
- Provide real-time capabilities
- Ensure secure user data handling
- Deliver a production-ready application with minimal infrastructure overhead
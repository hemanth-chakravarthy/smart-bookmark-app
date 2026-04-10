# Application Flow Documentation

## Product: Smart Bookmark App

---

## 1. Entry Points

### Direct Access
- Landing page via URL (e.g., `/`)
- Redirects based on authentication state

### OAuth Login
- Google OAuth login via Supabase
- Entry after successful authentication → `/dashboard`

### Deep Links
- Direct bookmark URLs (future)
- Redirects to login if unauthenticated

### Search Engines
- Public landing page indexed
- Auth-required pages blocked

### Marketing Links
- Redirect to landing → login → dashboard

---

## 2. Core User Flows

---

### Flow 1: User Onboarding / Authentication

#### Happy Path

**Step 1: Landing Page (`/`)**
- UI: App intro, "Login with Google" button
- Action: User clicks login
- System: Redirects to Google OAuth

**Step 2: Google OAuth**
- User selects account
- System authenticates via Supabase
- Validation: Valid Google account required

**Step 3: Redirect to Dashboard (`/dashboard`)**
- System creates session
- Fetch user data
- Load bookmarks

**Success Criteria:**
- User reaches dashboard with active session

---

#### Error States

- **OAuth failure:**
  - Message: "Authentication failed. Please try again."
  - Action: Retry login

- **Network failure:**
  - Message: "Network error. Check connection."
  - Retry enabled

---

#### Edge Cases

- User closes OAuth popup → return to landing
- Session expires → redirect to login
- Multiple login attempts → last session wins

---

### Flow 2: Add Bookmark

#### Happy Path

**Step 1: Dashboard (`/dashboard`)**
- UI: Bookmark list + "Add Bookmark" input/form
- Fields: URL, Title (optional), Description (optional)

**Step 2: User Input**
- Action: Enter URL + optional fields
- Validation:
  - URL must be valid (regex or URL parser)
  - Required: URL

**Step 3: Submit**
- Action: Click "Save"
- System:
  - Validate input
  - Store bookmark
  - Trigger real-time update

**Step 4: UI Update**
- Bookmark appears instantly in list

**Success Criteria:**
- Bookmark visible without refresh

---

#### Error States

- **Invalid URL:**
  - Message: "Please enter a valid URL"
- **Empty input:**
  - Message: "URL is required"
- **Server error:**
  - Message: "Failed to save bookmark. Try again"

---

#### Edge Cases

- Duplicate URL: Optional warning: "Bookmark already exists"
- Slow network: Show loading spinner
- User navigates away before save: Cancel request

---

### Flow 3: View Bookmarks

#### Happy Path

**Step 1: Dashboard Load**
- System fetches bookmarks
- UI shows:
  - List of bookmarks
  - Title, URL, timestamp

**Step 2: Display States**
- Sorted by newest first

**Success Criteria:**
- All bookmarks visible within <1 second

---

#### Error States

- **Fetch failure:**
  - Message: "Unable to load bookmarks"
  - Retry button

---

#### Edge Cases

- No bookmarks: Show empty state: "No bookmarks yet"
- Large dataset: Pagination or lazy loading

---

### Flow 4: Delete Bookmark

#### Happy Path

**Step 1: User Action**
- Click delete icon on bookmark

**Step 2: Confirmation Modal**
- Message: "Are you sure you want to delete this bookmark?"

**Step 3: Confirm**
- System deletes bookmark
- Real-time update triggered

**Step 4: UI Update**
- Bookmark removed instantly

**Success Criteria:**
- Bookmark removed across all tabs

---

#### Error States

- **Delete failure:**
  - Message: "Failed to delete bookmark"

---

#### Edge Cases

- User cancels → no action
- Bookmark already deleted → ignore
- Concurrent delete in another tab → sync resolves

---

### Flow 5: Search & Filter (P1)

#### Happy Path

**Step 1: Input Search Query**
- UI: Search bar

**Step 2: User Types Query**
- System filters bookmarks

**Step 3: Display Results**
- Matching bookmarks shown instantly

**Success Criteria:**
- Relevant results returned in <500ms

---

#### Error States

- **No results:**
  - Message: "No matching bookmarks found"

---

#### Edge Cases

- Partial matches
- Case-insensitive matching
- Empty search → show all bookmarks

---

### Flow 6: Tag Management (P1)

#### Happy Path

**Step 1: Add/Edit Bookmark**
- User adds tags

**Step 2: Save**
- Tags stored with bookmark

**Step 3: Filter**
- Click tag → filtered results

---

#### Error States

- **Invalid tag format:**
  - Message: "Invalid tag"

---

#### Edge Cases

- Duplicate tags → deduplicate
- Empty tags → ignore

---

### Flow 7: Error Recovery

#### Scenarios
- Retry failed API calls
- Redirect on auth failure
- Show fallback UI

---

## 3. Navigation Map

```
/
├── /login (redirect handled)
├── /dashboard (auth required)
│   ├── Bookmark List
│   ├── Add Bookmark
│   ├── Search
│   ├── Tag Filter
│   └── Delete Action
└── /error
```

### Access Control
- **Public:** `/`
- **Authenticated:** `/dashboard`
- **Unauthorized** → redirect to `/`

---

## 4. Screen Inventory

---

### Landing Page (`/`)
- **Access:** Public
- **Purpose:** Entry + login
- **UI:** Intro + login button
- **Actions:**
  - Login → OAuth
- **States:**
  - Default
  - Loading

---

### Dashboard (`/dashboard`)
- **Access:** Authenticated
- **Purpose:** Core functionality
- **UI:**
  - Bookmark list
  - Add form
  - Search bar
- **Actions:**
  - Add → create bookmark
  - Delete → remove bookmark
  - Search → filter results
- **States:**
  - Loading
  - Empty
  - Error
  - Success

---

### Error Page (`/error`)
- **Access:** Public
- **Purpose:** Display system errors
- **Actions:**
  - Retry
  - Go home

---

## 5. Decision Points

```
IF user is not authenticated
THEN redirect to login

IF URL input is invalid
THEN block submission + show error

IF bookmark creation succeeds
THEN update UI + trigger realtime sync

IF fetch fails
THEN show retry option

IF no bookmarks exist
THEN show empty state

IF session expires
THEN redirect to login
```

---

## 6. Error Handling

### 404 Not Found
- **Display:** "Page not found"
- **Actions:** Go to home

### 500 Server Error
- **Display:** "Something went wrong"
- **Actions:** Retry

### Network Offline
- **Display:** "You are offline"
- **Actions:** Retry / wait

### Permission Denied
- **Display:** "Unauthorized access"
- **Action:** Redirect to login

### Form Validation Errors
- Display inline errors
- Prevent submission

---

## 7. Responsive Behavior

| Device | Behavior |
|--------|----------|
| **Mobile** | Simplified layout, stack components vertically, touch-friendly buttons |
| **Tablet** | Hybrid layout, slight spacing adjustments |
| **Desktop** | Full layout, multi-column view |

---

## 8. Animations & Transitions

### Page Transitions
- Fade-in: 200–300ms

### Modals
- Slide/fade animation
- Close on outside click

### Loading States
- Spinner or skeleton UI

### Success Feedback
- Subtle highlight on added bookmark
- Toast notification: "Bookmark added"
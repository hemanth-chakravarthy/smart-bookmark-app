# Backend Structure

## Product: Smart Bookmark App

---

## 1. Architecture Overview

### System Architecture

- **Type:** Backend-as-a-Service (BaaS)
- **Pattern:** Client → Supabase (Auth + DB + Realtime)
- **Backend Layer:** Supabase (no custom server)

---

### Authentication Strategy

- Google OAuth via Supabase Auth
- Session-based authentication (handled by Supabase)
- No manual JWT handling required

---

### Data Flow

1. User interacts with frontend (Next.js)
2. Frontend sends request via Supabase client
3. Supabase:
   - Authenticates user
   - Applies Row Level Security (RLS)
   - Executes database operation
4. Database updates
5. Realtime event emitted
6. Frontend updates UI automatically

---

### Caching Strategy

- No external caching layer
- PostgreSQL handles queries efficiently
- Supabase handles performance optimizations internally

---

## 2. Database Schema

### Database: PostgreSQL (Supabase Managed)

#### Naming Convention
- `snake_case` for tables and columns
- UUID for all primary keys
- All tables include timestamps

---

### Table: bookmarks

#### Purpose
Stores user bookmarks

#### Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique ID |
| user_id | UUID | NOT NULL, FK → auth.users(id) | Owner |
| url | TEXT | NOT NULL | Bookmark URL |
| title | TEXT | NOT NULL | Title |
| description | TEXT | NULL | Optional notes |
| created_at | TIMESTAMP | DEFAULT now() | Created time |
| updated_at | TIMESTAMP | DEFAULT now() | Updated time |

#### Indexes

- PRIMARY KEY (id)
- idx_bookmarks_user_id
- idx_bookmarks_created_at DESC

#### Relationships

- Many bookmarks → one user

---

### Table: tags (Optional - P1)

#### Purpose
Stores tag metadata

#### Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Tag ID |
| user_id | UUID | FK → auth.users(id) | Owner |
| name | TEXT | NOT NULL | Tag name |
| created_at | TIMESTAMP | DEFAULT now() | Created |

#### Indexes

- idx_tags_user_id
- unique(user_id, name)

---

### Table: bookmark_tags (Optional - P1)

#### Purpose
Many-to-many relationship between bookmarks and tags

#### Columns

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| bookmark_id | UUID | FK → bookmarks(id) ON DELETE CASCADE |
| tag_id | UUID | FK → tags(id) ON DELETE CASCADE |

#### Indexes

- idx_bookmark_tags_bookmark_id
- idx_bookmark_tags_tag_id

---

## 3. Row Level Security (RLS)

### Objective
Ensure strict per-user data isolation

### Enable RLS

```sql
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
```

#### Policies

**SELECT**
```sql
user_id = auth.uid()
```

**INSERT**
```sql
user_id = auth.uid()
```

**DELETE**
```sql
user_id = auth.uid()
```

#### Guarantees
- Users cannot access others' data
- Security enforced at database level
- No dependency on frontend validation

---

## 4. Realtime Architecture

### Mechanism
Supabase Realtime listens to DB changes

### Emits events on:
- INSERT
- DELETE

### Flow
1. Bookmark added/deleted
2. Database updated
3. Realtime event triggered
4. All subscribed clients receive update
5. UI syncs instantly

### Subscription Scope
- **Table:** bookmarks
- **Filter:** user_id = current user

---

## 5. Authentication & Authorization

### Authentication
- **Provider:** Google OAuth
- **Managed by:** Supabase Auth

#### Flow
1. User clicks login
2. Redirect to Google
3. Google authenticates
4. Supabase creates session
5. User redirected back

### Authorization Levels

| Level | Access |
|-------|--------|
| Public | Landing page |
| Authenticated | Bookmarks CRUD |
| Database Level | RLS enforced |

---

## 6. Data Validation Rules

### URL
- Must be valid URL format
- Must include protocol (http/https)

### Title
- Required
- Max length: 255 characters

### Description
- Optional
- Max length: 1000 characters

### Tags
- Max length: 50 characters
- Unique per user

---

## 7. API Usage (Supabase Client)

### Create Bookmark
```javascript
supabase.from("bookmarks").insert({
  url,
  title,
  description,
  user_id
})
```

### Fetch Bookmarks
```javascript
supabase
  .from("bookmarks")
  .select("*")
  .order("created_at", { ascending: false })
```

### Delete Bookmark
```javascript
supabase
  .from("bookmarks")
  .delete()
  .eq("id", bookmarkId)
```

---

## 8. Error Handling

### Format
```json
{
  "error": {
    "message": "Error message",
    "code": "ERROR_CODE"
  }
}
```

### Common Errors

| Code | Description |
|------|-------------|
| VALIDATION_ERROR | Invalid input |
| UNAUTHORIZED | Not logged in |
| FORBIDDEN | RLS violation |
| NOT_FOUND | Resource missing |
| SERVER_ERROR | Unexpected error |

---

## 9. Performance Strategy

### Database
- Indexed queries on user_id
- Efficient sorting using created_at

### Realtime
- Subscribe only to required table
- Clean up subscriptions on component unmount

### Query Optimization
- Select only required fields
- Avoid unnecessary joins

---

## 10. Scalability

- Supabase handles horizontal scaling
- PostgreSQL handles structured data efficiently
- Realtime scales with connections

---

## 11. Constraints

- No custom backend server
- No Redis
- No manual JWT handling
- All logic handled via Supabase

---

## Final Note

This backend structure prioritizes:

- **Simplicity** (minimal infrastructure)
- **Security** (RLS-based access control)
- **Real-time UX** (instant sync)
- **Scalability** (managed services)

The system is optimized for rapid development while maintaining production-level standards.
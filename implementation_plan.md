# Knowledge Base App Implementation Plan

Building a powerful, nested knowledge base with Supabase backend, full-text search, and a premium React-based UI.

## 🗂 Project Structure
```text
knowledge-base/
├── src/
│   ├── components/
│   │   ├── Sidebar/          # Topic tree (Recursive)
│   │   ├── TopicDetail/      # Main content panel (Cards & Lists)
│   │   ├── Search/           # Search + filters
│   │   ├── AddTopic/         # Add/edit topic modal
│   │   └── AddContent/       # Add question/pdf/image/note modal
│   ├── pages/
│   │   ├── Home.jsx          # Main Dashboard
│   │   ├── Login.jsx         # Auth entry
│   │   └── Topic.jsx         # Specific Topic view
│   ├── lib/
│   │   ├── supabase.js       # Client init
│   │   ├── topics.js         # Topic CRUD & Tree builder
│   │   └── content.js        # Content CRUD & Storage logic
│   ├── hooks/
│   │   ├── useTopics.js      # Global topic state
│   │   └── useSearch.js      # Search state & filters
│   ├── App.jsx               # Routes & Auth Provider
│   └── index.css             # Design System & Design Tokens
├── .env                      # Credentials
└── package.json
```

## 🗄 Supabase Database Schema

Run this SQL in your Supabase SQL Editor:

```sql
-- 1. Topics Table
create table topics (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  aliases     text[],              -- ["algo", "dsa", "trees"]
  parent_id   uuid references topics(id) on delete cascade,
  user_id     uuid references auth.users(id),
  color       text,                -- HEX or CSS color
  icon        text,                -- Emoji or Lucide name
  created_at  timestamptz default now()
);

-- 2. Content Table
create table content (
  id          uuid primary key default gen_random_uuid(),
  topic_id    uuid references topics(id) on delete cascade,
  type        text check (type in ('question', 'pdf', 'image', 'note')),
  title       text,
  body        text,                -- Question text or Note body
  file_url    text,                -- Storage URL
  file_name   text,
  user_id     uuid references auth.users(id),
  created_at  timestamptz default now()
);

-- 3. Search Indexing
create index topics_search_idx on topics
  using gin(to_tsvector('english', name || ' ' || array_to_string(aliases, ' ')));

create index content_search_idx on content
  using gin(to_tsvector('english', coalesce(title,'') || ' ' || coalesce(body,'')));

-- 4. RLS Policies
alter table topics enable row level security;
alter table content enable row level security;

create policy "own topics" on topics using (auth.uid() = user_id);
create policy "own content" on content using (auth.uid() = user_id);
```

## ⚙️ Core Logic & Phase Breakdown

### Phase 1: Foundation (Setup & Auth)
- Initialize Vite + React.
- Set up **Supabase Client** (`lib/supabase.js`).
- Build **Login Page** with dark glassmorphism design.
- Implement **Auth Guard** in `App.jsx` using `supabase.auth.onAuthStateChange`.

### Phase 2: Core Features (Topics & Tree)
- **Topic Management**: Implement `getTopics` with a recursive `buildTree` helper in JS to convert flat DB rows into a nested JSON structure.
- **Sidebar**: Recursive component that renders children based on the tree.
- **Add Topic**: Modal for creating new nodes in the hierarchy.

### Phase 3: Content Management
- **Topic Detail**: View all content items (questions, notes, PDFs).
- **Add Content**: 
    - Question/Note -> Saved to `body`.
    - PDF/Image -> Uploaded to `knowledge-files` bucket -> URL saved to `file_url`.
- **Storage Logic**: Use `${user_id}/pdfs/${filename}` path structure.

### Phase 4: Search & Discovery
- **Search Engine**: Use `supabase.rpc` or Postgres `to_tsvector` queries for full-text search.
- **Filters**: Sort by type (PDF vs Note) and date.
- **Breadcrumbs**: Calculate path from root to item for search results.

## Verification Plan
- [ ] **Auth**: Login works and redirects to Dashboard.
- [ ] **Nesting**: Topics can be nested at least 3 levels deep.
- [ ] **Storage**: PDFs upload and are viewable via signed URLs.
- [ ] **Search**: Searching for an alias (e.g., "dsa") returns the "Algorithms" topic.

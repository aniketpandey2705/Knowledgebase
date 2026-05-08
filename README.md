# KnowledgeBase

A premium, fast, and organized personal knowledge management system built with **React 19**, **Vite**, and **Supabase**. KnowledgeBase allows you to structure your thoughts, documents, and media into a nested topic hierarchy with powerful search and media preview capabilities.

![KnowledgeBase Preview](https://raw.githubusercontent.com/aniketpandey2705/Knowledgebase/main/public/preview.png)

## Features

- **Nested Topic Hierarchy**: Organize your knowledge in a folder-like structure with infinite nesting.
- **Rich Media Support**:
  - **PDFs**: Inline preview within the app—no need to download and open separately.
  - **Images**: High-performance lightbox for full-screen viewing.
  - **Notes & Questions**: Clean, focused text content with word counts.
- **Smart Search (⌘K)**: Global search across topic names, aliases, and content body with debounced performance.
- **Organized Storage**: Intelligent file pathing (`user/type/year/month/file`) for clean cloud storage.
- **Optimistic UI**: Instant UI updates when adding/editing topics or content, syncing to the database in the background.
- **Personalized Home**: "Recently Visited" section for quick access to your most active topics.
- **Dark-Themed Aesthetics**: Sleek, modern interface with glassmorphism and subtle micro-animations.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- A [Supabase](https://supabase.com/) account and project

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/aniketpandey2705/Knowledgebase.git
   cd Knowledgebase
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory and add your Supabase credentials:

   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

## 🛠 Tech Stack

- **Frontend**: React 19, Vite, Lucide React (Icons)
- **State & Routing**: React Hooks, React Router 7
- **Backend**: Supabase (Auth, Database, Storage)
- **Styling**: Vanilla CSS with modern design tokens

## Project Structure

```text
src/
├── components/     # Reusable UI & Layout components
├── contexts/       # Auth, Modal, and Toast contexts
├── hooks/          # Custom business logic (useTopics, useSearch, etc.)
├── lib/            # Supabase client and API wrappers
├── pages/          # Main application views (Home, Settings, Login)
└── utils/          # Text and time formatting utilities
```

Built by [Aniket Pandey](https://github.com/aniketpandey2705)

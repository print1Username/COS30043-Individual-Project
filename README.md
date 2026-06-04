# Vue E-Commerce

A full-stack e-commerce web application built with **Vue 3**, **Vuetify 4**, and **Supabase**. Users can create product listings, browse a marketplace, trade products with other users, and track activity history.

---

## Tech Stack

- **Vue 3** — component-based frontend framework
- **Vue Router 5** — client-side routing
- **Pinia** — state management
- **Vuetify 4** — Material Design UI component library
- **Supabase** — backend-as-a-service (PostgreSQL database, Auth, Storage)
- **Vite 8** — build tool and dev server

---

## Prerequisites

- Node.js `^20.19.0` or `>=22.12.0`
- A [Supabase](https://supabase.com) account and project

---

## Supabase Setup

### 1. Create a Supabase Project

Go to [supabase.com](https://supabase.com), create an account, and start a new project.

### 2. Run the Database Migrations

All SQL files are located in the `database/` folder. Run them **in order** using the Supabase SQL Editor (`Project → SQL Editor → New Query`):

| Order | File                    | Description                                                    |
| ----- | ----------------------- | -------------------------------------------------------------- |
| 1     | `database/profiles.sql` | User profiles table, RLS policies, and avatar storage bucket   |
| 2     | `database/products.sql` | Products table, RLS policies, and product image storage bucket |
| 3     | `database/history.sql`  | Activity history table, RLS policies, and DB triggers          |
| 4     | `database/trades.sql`   | Trades table, RLS policies, and `create_trade` RPC function    |

Copy the contents of each file and execute them one at a time in the SQL Editor.

### 3. Configure Auth

In your Supabase project, go to **Authentication → URL Configuration** and set:

- **Site URL**: `http://localhost:5173` (for local development)
- **Redirect URLs**: `http://localhost:5173/dashboard`, `http://localhost:5173/reset`

For production, replace `localhost:5173` with your deployed domain.

### 4. Get Your API Credentials

Go to **Project Settings → API** and note down:

- **Project URL** (`VITE_SUPABASE_URL`)
- **Anon/Public Key** (`VITE_SUPABASE_PUBLISHABLE_KEY`)

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/print1Username/COS30043-Individual-Project.git
cd COS30043-Individual-Project
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example env file and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-public-key
```

---

## Running the App

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### Production Build

```bash
npm run build
```

Output is placed in the `dist/` folder. Serve it with any static host (Vercel, Netlify, Cloudflare Pages, etc.).

### Preview Production Build Locally

```bash
npm run preview
```

---

## Application Logic

### Authentication Flow

- Users sign up with a username, email, and password via Supabase Auth.
- Email confirmation is required before accessing the dashboard.
- Forgot password sends a reset link to the user's email.
- All dashboard routes are protected — unauthenticated users are redirected to `/login`.

### Core Features

**Dashboard (`/dashboard`)**
Shows a weekly chart of products the user has created, quick-access shortcuts, and a feed of recently added products from other users.

**Products (`/dashboard/products`)**
Two tabs — **Marketplace** (all users' products) and **My Products** (the current user's own listings). Products can be browsed in grid or list view with pagination.

**Create Product (`/dashboard/products/create`)**
A form to create a new product with a name, description, quantity, price, category, and up to 10 images. Images are uploaded to Supabase Storage under a per-user/per-product folder.

**Product Details (`/dashboard/products/:id`)**

- If the viewer **owns** the product: an editable view with inline editing, image management, and a delete action.
- If the viewer **does not own** the product: a read-only view with a **Trade** button.

**Trade**
Clicking Trade opens a modal where the buyer selects a quantity. On confirmation, a Supabase RPC (`create_trade`) atomically decrements the seller's stock, creates a trade record, and logs the transaction in both users' history.

**History (`/dashboard/history`)**
A paginated, expandable activity log showing product creations, edits, deletions, and completed trades. Entries are automatically created by database triggers.

**Search (`/dashboard/search`)**
A full-text search across product names and descriptions, split into two tabs: results from other users and results from the current user's own products.

**Profile (`/dashboard/profile`)**
Users can update their display name, username, and bio inline. Avatar upload uses a crop tool before saving to Supabase Storage.

---

## Project Structure

```
src/
├── assets/          # Global CSS and static files
├── components/      # Reusable Vue components
│   └── ui/          # Base UI components (buttons, fields, pagination, etc.)
├── lib/             # Supabase client and feature-specific API modules
│   ├── auth.js      # Auth helpers (login, signup, logout, password reset)
│   ├── products.js  # Product CRUD and image handling
│   ├── trades.js    # Trade creation and retrieval
│   ├── history.js   # Activity history fetching
│   ├── profile.js   # Profile and avatar management
│   ├── search.js    # Product search queries
│   ├── home.js      # Dashboard chart and recent products data
│   └── supabase.js  # Supabase client initialisation
├── router/          # Vue Router configuration and navigation guards
├── stores/          # Pinia stores
└── views/           # Page-level components mapped to routes
    └── dashboard/
        └── products/
```

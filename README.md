# SocialConnect - Modern Social Media Platform

SocialConnect is a robust, full-stack social media web application built with **Next.js 14**, **Supabase**, and **Tailwind CSS**. It allows users to register, create profiles, share posts with images, discover content through a personalized feed, and interact via likes and comments.

The architecture strictly follows a custom JWT-based authentication system storing tokens in local storage and processing API requests completely server-side via Next.js App Router, heavily inspired by standard Node/Express.js monolithic patterns.

## Features

- **Custom Authentication**: Secure JWT-based registration, login, and logout flow backed by strong `bcryptjs` password hashing.
- **User Profiles**: Create customized profiles with custom avatars, bios, website/location details, and comprehensive follow network counting.
- **Social Interactions**: Robust Follow/Unfollow user mechanics, like counts, and engage via a scalable comment system.
- **Content Creation**: Compose dynamic text posts and upload responsive images directly to Supabase Storage.
- **Personalized Feed**: A chronological home feed that conditionally renders posts precisely from the network of users you choose to follow (defaulting to the universal public firehose for new accounts).
- **Explore & Search**: Discover new friends with a dedicated user search engine hub.
- **Modern UI/UX**: State-of-the-art dark mode aesthetics leveraging Tailwind CSS, `shadcn/ui` components, custom glassmorphism backdrops, and smooth micro-animations.

## Technology Stack

- **Framework**: Next.js 14.2 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (via Supabase) & Supabase Storage API
- **Styling**: Tailwind CSS v3, Radix UI Primitives, Lucide Icons
- **Authentication**: Custom JSON Web Tokens (`jose` + `bcryptjs`)
- **Validation**: Zod schema validation

---

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn package manager
- An active Supabase Account & Project

### 1. Database Initialization (Supabase)

1. Create a new project in your [Supabase Dashboard](https://supabase.com).
2. Look for the **SQL Editor** tab on the left. Paste the exact contents of `supabase/schema.sql` into the editor and **RUN** the query to generate all required tables (`users`, `posts`, `comments`, `likes`, `follows`) alongside their respective automated timestamp triggers and base configurations.
3. Open the **Storage** dashboard tab. Tap "New bucket", name it exactly **`socialconnect`** (all lowercase letters), and make sure the **Public Bucket** toggle switch is flipped ON.

### 2. Environment Setup

1. Clone or download this repository locally.
2. Initialize your terminal to the root of the project directory and install the necessary dependencies:
   ```bash
   npm install
   ```
3. Set your local environment variables. Rename the provided `.env.example` file to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
4. Fill in your `.env.local` details with your Supabase Project credentials. They can be found in Supabase under `Project Settings > API`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_database_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_public_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_secret_service_role_key
   JWT_SECRET=your_hyper_secure_randomly_generated_string
   ```

### 3. Start the Platform

Compile and run the Next.js development server:
```bash
npm run dev
```
Navigate to `http://localhost:3000` in your web browser to view the application.

---

## Architectural Notes

- **Authentication Logic**: To circumvent standard third-party blackboxing, `socialconnect` completely opts out of standard Supabase Auth services in favor of raw JWT tokens signed on the server (`src/lib/auth.ts`) which populate user claims and attach themselves to standard `Authorization: Bearer <Token>` headers. The custom React context `AuthContext.tsx` handles syncing this to un-expiring local storage.
- **Server Bypassing**: Client browsers possess completely locked down unprivileged keys. All data mutations exclusively execute securely behind server-bound Next.js API Routes (`/api/*`) utilizing the `supabaseAdmin` service role key, simulating traditional Express.js architecture.

## UI Design

The styling paradigm aims to emulate a sleek "premium" and modern glassmorphic look. We achieve this utilizing overlapping blurred violet and fuchsia gradients behind heavily structured, translucent backdrop-blurred UI containers (`shadcn`). Interactive items instantly respond leveraging `tailwindcss` default transition utilities.

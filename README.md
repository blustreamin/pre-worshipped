# Pre-Worshipped — Car Intelligence Dashboard

Smart used car scouting for the Indian market. 75 seed cars, AI analysis, depreciation intelligence, scouting pipeline.

## Setup — Step by Step

### Step 1: Create Supabase project (free)
1. Go to [supabase.com](https://supabase.com) → sign up → New Project → name it `pre-worshipped`
2. Choose a password and region → wait for it to spin up

### Step 2: Create database tables
1. Supabase dashboard → **SQL Editor** → New Query
2. Paste contents of `supabase/schema.sql` → click **Run**

### Step 3: Get your keys
1. Supabase → **Settings** → **API**
2. Copy **Project URL** and **anon public key**

### Step 4: Configure environment
```bash
cp .env.local.example .env.local
# Edit .env.local with your Supabase URL, key, and optionally Anthropic API key
```

### Step 5: Run locally
```bash
npm install
npm run dev
# Open http://localhost:3000
```

### Step 6: Seed the database
```bash
curl -X POST http://localhost:3000/api/seed
```

### Step 7: Deploy to Vercel
```bash
vercel
# Add env vars in Vercel dashboard → Settings → Environment Variables
vercel --prod
```

### Step 8: Push to GitHub
```bash
git init && git add . && git commit -m "init" && git remote add origin YOUR_REPO && git push -u origin main
```

## Architecture
- **Frontend**: Next.js + Tailwind CSS → Vercel
- **Database**: Supabase (PostgreSQL)
- **AI**: Anthropic Claude API (server-side)
- **Scraper**: Python FastAPI (deploy separately on Railway/Render)

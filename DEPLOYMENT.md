# Special Testlab - Vercel Deployment Guide

## Project Structure
```
├── index.html              # Frontend UI
├── app.js                  # Frontend Logic (no credentials exposed)
├── style.css               # Styling
├── api/
│   └── submit-application.js   # Secure backend API (Vercel Serverless)
├── .env.local              # Local development credentials (git ignored)
├── .gitignore              # Prevents credential leaks
└── vercel.json             # Vercel configuration
```

## Security Features ✅
- **API Keys Never Exposed**: Supabase credentials stay on the backend only
- **Frontend Only Calls Your API**: No direct Supabase client in browser
- **Environment Variables**: Different credentials for dev/prod
- **.gitignore Protected**: `.env.local` won't be committed to git

## Local Development Setup

### 1. Get Your Supabase Credentials
- Go to [supabase.com](https://supabase.com)
- Create a project or use existing
- Navigate to **Settings → API**
- Copy:
  - **Project URL** → `SUPABASE_URL`
  - **anon public key** → `SUPABASE_ANON_KEY`

### 2. Create Database Table
In Supabase SQL Editor, run:
```sql
CREATE TABLE IF NOT EXISTS creator_applications (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMP DEFAULT now(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    platform TEXT,
    social_id TEXT,
    followers TEXT,
    pitch TEXT,
    status TEXT DEFAULT 'pending'
);
```

### 3. Update `.env.local`
Edit the `.env.local` file in your project root:
```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-actual-anon-key-here
```

### 4. Install Dependencies
```bash
npm install
```

### 5. Test Locally
```bash
# Run development server (opens browser automatically)
npm run dev

# Or just start the server
npm start
```

Your app will be at `http://localhost:3000`

> **Note**: The backend API won't fully work locally without additional setup. For full local testing including API calls, use Vercel CLI or set up a local Node/Express server that imports and uses the `submit-application` function.

## Vercel Deployment

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/timepass.git
git push -u origin main
```

### 2. Deploy on Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Click "Deploy" (Vercel will auto-detect the setup)

### 3. Add Environment Variables to Vercel
In your Vercel project dashboard:
1. Go to **Settings → Environment Variables**
2. Add these variables for **Production**:
   - `SUPABASE_URL` = your-supabase-url
   - `SUPABASE_ANON_KEY` = your-anon-key
3. Click "Save"

### 4. Redeploy
Your site will auto-redeploy with the new environment variables.

## How It Works

```
Frontend (app.js)
    ↓
    → Sends form data to /api/submit-application
    ↓
Backend API (vercel serverless)
    ↓
    → Uses SUPABASE_URL & SUPABASE_ANON_KEY from env (never exposed)
    ↓
    → Connects to Supabase securely
    ↓
    → Inserts data into database
    ↓
    → Returns response to frontend
```

## Testing the Connection
1. Fill out the form on your live site
2. Click "Submit Application"
3. Check your Supabase dashboard → `creator_applications` table
4. New application should appear there!

## Troubleshooting

### API Call Fails
- Check browser console (F12) for errors
- Verify environment variables are set in Vercel
- Test with a simple `curl` command to your API endpoint

### Data Not Saving
- Confirm table name is `creator_applications` (case-sensitive)
- Check Supabase Row Level Security (RLS) policies aren't blocking inserts
- Verify `SUPABASE_ANON_KEY` has INSERT permissions

### CORS Issues
The API endpoint sets proper CORS headers. If you get CORS errors:
- Check browser console for exact error
- Ensure `NEXT_PUBLIC_SITE_URL` matches your domain

## Environment Variable Reference

| Variable | Local | Vercel |
|----------|-------|--------|
| `SUPABASE_URL` | `.env.local` | Project Settings |
| `SUPABASE_ANON_KEY` | `.env.local` | Project Settings |
| `NEXT_PUBLIC_SITE_URL` | `.env.local` (optional) | Auto-detected |

## Security Checklist ✅
- [ ] `.env.local` is in `.gitignore` (check with `git status`)
- [ ] Never commit `.env.local` to GitHub
- [ ] Environment variables are set in Vercel dashboard
- [ ] Using `anon` key (not service role key)
- [ ] Database table exists in Supabase
- [ ] Supabase RLS policies allow anonymous inserts (if needed)

---

**Need Help?**
- Supabase Docs: https://supabase.com/docs
- Vercel Docs: https://vercel.com/docs
- Report Issues: Check both services' dashboards for error logs

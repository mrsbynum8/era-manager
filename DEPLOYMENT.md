# Deployment Guide

## Quick Deploy to Vercel

1. **Push to GitHub**
   ```bash
   cd /Users/sharhanda/Downloads/Custom\ Orders/Eras/era-manager
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/era-manager.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to https://vercel.com
   - Sign in with GitHub
   - Click "New Project"
   - Import your `era-manager` repository
   - Add environment variable:
     - Name: `OPENROUTER_API_KEY`
     - Value: Your OpenRouter API key
   - Click "Deploy"

3. **Done!** Your app will be live at `https://your-project.vercel.app`

## Important Notes

### Data Persistence

⚠️ **Your `data.json` file is NOT deployed** - it's excluded in `.gitignore` for security.

**Options:**
1. **Re-import on each deployment** (current setup)
2. **Upgrade to a real database** (recommended for production):
   - Vercel Postgres
   - MongoDB Atlas
   - Supabase
   - PlanetScale

### Environment Variables

Make sure to set these in Vercel:
- `OPENROUTER_API_KEY` - Your OpenRouter API key

### First Deployment Checklist

- [ ] `.gitignore` includes `data.json` and `.env.local`
- [ ] README.md is updated
- [ ] Code is pushed to GitHub
- [ ] Environment variables are set in Vercel
- [ ] Deployment is successful
- [ ] Test the live site

## Alternative: Deploy to Netlify

1. Push to GitHub (same as above)
2. Go to https://netlify.com
3. Click "Add new site" → "Import an existing project"
4. Connect to GitHub and select your repo
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
6. Add environment variable `OPENROUTER_API_KEY`
7. Deploy!

## Upgrading to a Database (Optional)

If you want persistent data across deployments, consider:

### Option 1: Vercel Postgres
```bash
npm install @vercel/postgres
```

### Option 2: MongoDB Atlas
```bash
npm install mongodb
```

### Option 3: Supabase
```bash
npm install @supabase/supabase-js
```

Then migrate your JSON database logic to use the chosen database.

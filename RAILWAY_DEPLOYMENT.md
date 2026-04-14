# Railway Deployment Guide

Deploy your Poland News Hub to Railway in 5 minutes! 🚀

## Prerequisites

- GitHub account (free)
- Railway account (free, sign up at https://railway.app)
- API keys (optional for testing):
  - NewsAPI: https://newsapi.org (free tier available)
  - OpenAI: https://platform.openai.com (optional, for translations)

## Step 1: Push Code to GitHub

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit: Poland News Hub"

# Create new repository on GitHub and push
git remote add origin https://github.com/YOUR_USERNAME/news-hub-poland.git
git branch -M main
git push -u origin main
```

## Step 2: Create Railway Project

1. Go to https://railway.app and sign up (free)
2. Click **"Create New Project"**
3. Select **"Deploy from GitHub repo"**
4. Connect your GitHub account
5. Select **`news-hub-poland`** repository
6. Click **"Deploy"**

Railway will automatically:
- ✅ Detect Node.js project
- ✅ Install dependencies
- ✅ Build the project
- ✅ Start the server

## Step 3: Add PostgreSQL Database

1. In Railway dashboard, click **"+ New"**
2. Select **"Database"** → **"PostgreSQL"**
3. Railway creates a PostgreSQL instance automatically
4. The `DATABASE_URL` environment variable is automatically set

## Step 4: Configure Environment Variables

1. In Railway dashboard, go to **"Variables"**
2. Add these environment variables:

```env
NODE_ENV=production
JWT_SECRET=generate-a-random-string-here
NEWSAPI_KEY=your-newsapi-key
GNEWS_API_KEY=your-gnews-key
OPENAI_API_KEY=your-openai-key (optional)
FRONTEND_URL=https://your-railway-domain.railway.app
```

**To generate JWT_SECRET:**
```bash
openssl rand -base64 32
```

## Step 5: Run Database Migrations

1. In Railway dashboard, click your project
2. Go to **"Deployments"**
3. Click the latest deployment
4. Click **"View Logs"**
5. Run migration command in Railway shell:

```bash
npx prisma db push
```

Or use Railway CLI:
```bash
railway run npx prisma db push
```

## Step 6: Get Your Live URL

1. In Railway dashboard, find your project
2. Click on the **"web"** service
3. Go to **"Settings"**
4. Copy the **"Public URL"** (e.g., `https://news-hub-poland-production.railway.app`)
5. Update `FRONTEND_URL` environment variable with this URL

## Step 7: Test Your Deployment

Visit: `https://your-railway-domain.railway.app`

You should see:
- ✅ Homepage with news articles
- ✅ Language switcher (5 languages)
- ✅ Dark/Light theme toggle
- ✅ Admin panel (login required)

## Admin Login

**Default Admin Account** (create in database):
- Email: `admin@example.com`
- Password: `admin123`

To create admin user via Railway shell:
```bash
railway run npm run seed
```

## Features to Test

### Public Features
- [ ] Browse articles on homepage
- [ ] Switch languages (EN, AR, PL, DE, FR)
- [ ] Toggle dark/light theme
- [ ] Search articles
- [ ] View article details

### Admin Features (after login)
- [ ] Click "Admin" in navigation
- [ ] Click "Fetch News" button
- [ ] Click "Translate" button
- [ ] Create manual article
- [ ] Delete article

## Troubleshooting

### Build Fails
**Error:** `npm ERR! code ENOENT`
- **Solution:** Check `package.json` exists in root directory

### Database Connection Error
**Error:** `Error: connect ECONNREFUSED`
- **Solution:** Wait 2-3 minutes for PostgreSQL to start
- Check `DATABASE_URL` is set in Variables

### Frontend Not Loading
**Error:** Blank page or 404
- **Solution:** Rebuild project
  1. Go to Deployments
  2. Click latest deployment
  3. Click "Redeploy"

### API Calls Failing
**Error:** 404 on `/api/*` endpoints
- **Solution:** Check backend is running
  1. View logs for errors
  2. Restart the service

## Monitoring

### View Logs
1. Dashboard → Your Project → "Deployments"
2. Click latest deployment
3. Click "View Logs"
4. Search for errors

### Check Status
- Green indicator = Running
- Yellow indicator = Building
- Red indicator = Failed

## Scaling

### Add More Resources
1. Go to your project settings
2. Increase "Memory" (default 512MB)
3. Increase "CPU" (default 0.5)

**Recommended for production:**
- Memory: 1GB
- CPU: 1

### Cost
- Free tier: $5 credit/month
- After credit: ~$5-10/month for small projects
- PostgreSQL: Included in free tier

## Automatic Deployments

Railway automatically deploys when you push to GitHub:

```bash
# Make changes locally
git add .
git commit -m "Update features"
git push origin main

# Railway automatically rebuilds and deploys!
```

## Scheduled Tasks

Your cron jobs run automatically:
- **Every 4 hours:** Fetch news from APIs
- **Every 6 hours:** Translate missing articles

Check logs to verify:
```
[CRON] News fetch scheduled task triggered
[CRON] Translation scheduled task triggered
```

## Custom Domain

To use your own domain:

1. Go to Railway project settings
2. Find "Domain"
3. Click "Add Domain"
4. Enter your domain (e.g., `news.example.com`)
5. Update DNS records as instructed

## Backup Database

Railway automatically backs up your database daily.

To export data:
```bash
railway run pg_dump $DATABASE_URL > backup.sql
```

## Update Environment Variables

To update API keys or settings:

1. Railway Dashboard → Variables
2. Edit the variable
3. Click "Save"
4. Railway automatically redeploys

## Stop/Restart Service

1. Dashboard → Your Project
2. Click the "web" service
3. Click "..." menu
4. Select "Stop" or "Restart"

## Delete Project

1. Dashboard → Your Project
2. Click "..." menu
3. Select "Delete"
4. Confirm deletion

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Project Issues: GitHub Issues

## Next Steps

After deployment:

1. **Add API Keys:**
   - Get NewsAPI key: https://newsapi.org
   - Get OpenAI key: https://platform.openai.com

2. **Test Features:**
   - Fetch news manually from admin panel
   - Verify translations work
   - Test all languages

3. **Customize:**
   - Update categories
   - Modify colors in Tailwind config
   - Add your own news sources

4. **Monitor:**
   - Check logs regularly
   - Monitor database usage
   - Track API costs

---

**Congratulations! Your news hub is live! 🎉**

Share your deployment URL with friends and start aggregating Polish news in 5 languages!

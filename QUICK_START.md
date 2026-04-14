# Quick Start Guide - Poland News Hub

Get your multilingual news aggregator running in minutes! 🚀

## 📋 Prerequisites

- Node.js 18+ ([Download](https://nodejs.org))
- PostgreSQL 14+ ([Download](https://www.postgresql.org/download))
- Git ([Download](https://git-scm.com))

## 🚀 Local Development (5 minutes)

### 1. Clone & Install

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/news-hub-poland.git
cd news-hub-poland

# Install dependencies
npm install
cd client && npm install && cd ..
```

### 2. Setup Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your settings
# Minimum required:
# - DATABASE_URL (PostgreSQL connection)
# - JWT_SECRET (any random string)
```

### 3. Setup Database

```bash
# Create database schema
npx prisma db push

# Seed with sample data
npm run seed
```

### 4. Start Development Servers

**Terminal 1 - Backend:**
```bash
npm run dev
# Backend runs on http://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
# Frontend runs on http://localhost:3000
```

### 5. Test It Out

1. Open http://localhost:3000
2. Click "Admin" in navigation
3. Login with:
   - Email: `admin@example.com`
   - Password: `admin123`
4. Click "Fetch News" to get real articles
5. Click "Translate" to translate them

## 🌍 Deploy to Railway (Free)

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/news-hub-poland.git
git push -u origin main
```

### 2. Deploy on Railway

1. Go to https://railway.app
2. Sign up (free)
3. Click "Create New Project"
4. Select "Deploy from GitHub repo"
5. Connect GitHub and select your repository
6. Railway automatically builds and deploys!

### 3. Configure Environment

In Railway dashboard:
1. Go to "Variables"
2. Add these:
   ```
   NODE_ENV=production
   JWT_SECRET=generate-random-string
   NEWSAPI_KEY=your-newsapi-key
   ```
3. Railway automatically redeploys

### 4. Get Your Live URL

Your app is live at: `https://your-railway-domain.railway.app`

## 📚 API Keys (Optional but Recommended)

### NewsAPI (Free)
1. Go to https://newsapi.org
2. Sign up for free
3. Get your API key
4. Add to `.env`: `NEWSAPI_KEY=your-key`

### OpenAI (For Translations)
1. Go to https://platform.openai.com
2. Create account
3. Generate API key
4. Add to `.env`: `OPENAI_API_KEY=your-key`

## 🎯 Key Features

### Public Features
- ✅ Browse news articles
- ✅ 5 language support (EN, AR, PL, DE, FR)
- ✅ Dark/Light theme
- ✅ Search articles
- ✅ View article details
- ✅ Bookmark articles (login required)
- ✅ Comment on articles (login required)

### Admin Features
- ✅ Fetch news from APIs (automatic every 4 hours)
- ✅ Translate articles to 5 languages
- ✅ Publish manual articles
- ✅ Edit/Delete articles
- ✅ Manage categories
- ✅ View analytics

## 📁 Project Structure

```
news-hub-poland/
├── src/                 # Backend (Node.js/Express)
├── client/              # Frontend (React)
├── prisma/              # Database schema
├── package.json         # Backend dependencies
└── README.md            # Full documentation
```

## 🔧 Common Commands

```bash
# Development
npm run dev              # Start backend
cd client && npm run dev # Start frontend

# Production
npm run build            # Build both
npm start                # Start server

# Database
npx prisma db push      # Apply migrations
npx prisma studio      # Open database GUI
npm run seed            # Seed sample data

# Code Quality
npm run check           # TypeScript check
npm run format          # Format code
npm run lint            # Lint code
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
# Or use different port
PORT=3002 npm run dev
```

### Database Connection Error
```bash
# Check PostgreSQL is running
# Update DATABASE_URL in .env
# Verify credentials
```

### Build Fails
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npm run build
```

### Blank Page After Deploy
```bash
# Rebuild on Railway
# Check logs for errors
# Verify environment variables
```

## 📖 Documentation

- **Full README:** `README.md`
- **Railway Deployment:** `RAILWAY_DEPLOYMENT.md`
- **Project Plan:** `PROJECT_PLAN.md`

## 🆘 Support

- GitHub Issues: Report bugs
- Railway Docs: https://docs.railway.app
- Discord: Join our community

## 🎉 Next Steps

1. **Get API Keys:**
   - NewsAPI: https://newsapi.org
   - OpenAI: https://platform.openai.com

2. **Customize:**
   - Edit colors in `client/tailwind.config.js`
   - Add your categories
   - Modify translations

3. **Deploy:**
   - Follow Railway deployment guide
   - Set up custom domain
   - Monitor performance

4. **Promote:**
   - Share your news hub
   - Add more news sources
   - Grow your audience

---

**Questions?** Check the full README.md or Railway deployment guide!

**Happy news aggregating! 📰**

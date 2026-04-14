# Poland News Hub - Multilingual News Aggregator

A **single-server full-stack** multilingual news aggregator for Polish news with automatic fetching from official sources, manual publishing, and AI-powered translation to 5 languages.

## 🎯 Key Features

✅ **One Server, One Database** - Everything runs on a single server
✅ **Automatic News Fetching** - Every 4 hours from official Polish news sources
✅ **Manual News Publishing** - Admin panel for creating custom articles
✅ **5 Languages** - Arabic, English, Polish, German, French
✅ **AI Translation** - Automatic translation of articles
✅ **User Features** - Bookmarks, comments, reading history, preferences
✅ **Dark/Light Theme** - Theme toggle support
✅ **Search & Filter** - Advanced search with category filtering
✅ **Admin Dashboard** - Manage articles, users, categories, and analytics
✅ **Responsive Design** - Mobile-friendly interface
✅ **Copyright Compliant** - News summaries with links to original sources

## 🏗️ Architecture

```
Single Server (e.g., DigitalOcean, Linode, AWS)
├── Node.js Backend (Express)
│   ├── API Routes (/api/*)
│   ├── Database (PostgreSQL)
│   ├── Scheduled Tasks (News Fetching)
│   └── Static File Server (React Frontend)
├── React Frontend (Built to static files)
└── PostgreSQL Database
```

## 💻 Tech Stack

### Backend
- **Runtime**: Node.js with Express
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens
- **Scheduling**: node-cron for automated tasks
- **Translation**: OpenAI/Google Translate API

### Frontend
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI + lucide-react
- **Internationalization**: i18next
- **Routing**: React Router v6
- **Build**: Vite

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Database**: PostgreSQL 15
- **Cache**: Redis (optional)
- **Compression**: gzip/Brotli

## 📁 Project Structure

```
news-hub-poland/
├── src/                          # Backend TypeScript
│   ├── server.ts                 # Express server with all routes
│   └── seed.ts                   # Database seeding
├── client/                       # React frontend
│   ├── src/
│   │   ├── components/           # React components
│   │   ├── pages/                # Page components
│   │   ├── i18n/                 # Translation files (5 languages)
│   │   ├── App.tsx               # Main app component
│   │   ├── main.tsx              # React entry point
│   │   └── index.css             # Tailwind styles
│   ├── index.html                # HTML template
│   ├── vite.config.ts            # Vite configuration
│   ├── tailwind.config.js        # Tailwind configuration
│   └── package.json              # Frontend dependencies
├── prisma/
│   └── schema.prisma             # Database schema
├── docker-compose.yml            # Docker setup
├── Dockerfile                    # Production image
├── package.json                  # Backend dependencies
├── tsconfig.json                 # TypeScript config
├── .env.example                  # Environment template
└── README.md                     # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Docker & Docker Compose (optional)

### Installation

1. **Clone and setup**
```bash
cd news-hub-poland
npm install
cd client && npm install && cd ..
```

2. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your settings
```

3. **Setup database**
```bash
npx prisma db push
npm run seed
```

4. **Development mode**
```bash
# Terminal 1: Backend
npm run dev

# Terminal 2: Frontend
cd client && npm run dev
```

Backend: `http://localhost:3001`
Frontend: `http://localhost:3000`

### Using Docker Compose

```bash
docker-compose up -d
```

This starts:
- PostgreSQL database
- Redis cache
- Node.js backend (port 3001)

## 📦 Build & Deploy

### Build for production
```bash
npm run build
```

This builds:
1. React frontend to `client/dist/`
2. TypeScript backend to `dist/`

### Start production server
```bash
npm start
```

Server runs on port 3001 and serves:
- API endpoints at `/api/*`
- Frontend at `/` (from `client/dist/`)

### Docker deployment
```bash
docker build -t news-hub-poland .
docker run -p 3001:3001 --env-file .env news-hub-poland
```

## 🔌 API Endpoints

### Public Endpoints
```
GET  /api/articles              - Get articles with pagination
GET  /api/articles/:id          - Get single article
GET  /api/articles/search       - Search articles
GET  /api/categories            - Get all categories
GET  /api/trending              - Get trending articles
GET  /api/health                - Health check
```

### Authentication
```
POST /api/auth/register         - Register user
POST /api/auth/login            - Login user
GET  /api/auth/profile          - Get user profile (authenticated)
```

### User Features (Authenticated)
```
GET  /api/bookmarks             - Get user bookmarks
POST /api/bookmarks             - Add bookmark
DELETE /api/bookmarks/:id       - Remove bookmark
POST /api/comments              - Add comment
GET  /api/articles/:id/comments - Get article comments
```

### Admin (Admin Only)
```
POST   /api/admin/articles      - Create article
PUT    /api/admin/articles/:id  - Update article
DELETE /api/admin/articles/:id  - Delete article
```

## 🗄️ Database Schema

**Core Tables:**
- `User` - User accounts with roles
- `Article` - News articles
- `ArticleTranslation` - Translations for articles
- `Category` - Article categories
- `Bookmark` - User bookmarks
- `Comment` - Article comments
- `NewsFeed` - News source configuration
- `FetchLog` - News fetching logs

## 🔐 Security

- JWT authentication with expiration
- Role-based access control (RBAC)
- Input validation on all endpoints
- SQL injection prevention (Prisma ORM)
- Password hashing (bcryptjs)
- CORS configuration
- Environment variable protection

## 🌍 Multilingual Support

5 languages supported:
- **English** (en)
- **Arabic** (ar)
- **Polish** (pl)
- **German** (de)
- **French** (fr)

Language switcher in header, translations in `client/src/i18n/locales/`

## 📊 Scheduled Tasks

**News Fetching (Every 4 hours)**
- Fetches articles from configured news APIs
- Deduplicates content
- Stores in database
- Logs fetch status

Configure in `src/server.ts` cron section.

## 🎨 Customization

### Colors
Edit `client/tailwind.config.js`:
```javascript
colors: {
  primary: '#1a3a52',    // Deep Navy
  accent: '#00a8a8',     // Vibrant Teal
  cream: '#f8f5f0',      // Warm Cream
}
```

### Fonts
Edit `client/index.html` Google Fonts link

### Categories
Add to database via admin panel or seed file

## 📈 Performance

- Database indexing on frequently queried columns
- Redis caching for popular articles
- Pagination for article lists
- Image optimization
- Gzip/Brotli compression
- Code splitting with Vite

## 🧪 Testing

```bash
# TypeScript check
npm run check

# Format code
npm run format

# Lint
npm run lint
```

## 📝 Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/news_hub

# Server
PORT=3001
NODE_ENV=production

# JWT
JWT_SECRET=your-secret-key

# News APIs
NEWSAPI_KEY=your-key
GNEWS_API_KEY=your-key

# Translation
OPENAI_API_KEY=your-key
```

## 🚢 Deployment Checklist

- [ ] Set strong `JWT_SECRET`
- [ ] Configure `DATABASE_URL` for production
- [ ] Set `NODE_ENV=production`
- [ ] Configure news API keys
- [ ] Set up SSL/HTTPS
- [ ] Configure domain
- [ ] Set up automated backups
- [ ] Configure monitoring/logging
- [ ] Test all features
- [ ] Set up CI/CD pipeline

## 📚 Hosting Options

**Recommended for single server:**
- DigitalOcean App Platform
- Heroku
- Railway
- Render
- AWS Lightsail
- Linode
- Vultr

**Cost:** $5-50/month depending on traffic

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 💬 Support

- Email: support@newshubpoland.com
- GitHub Issues: [Create an issue](https://github.com/yourusername/news-hub-poland/issues)
- Documentation: See `PROJECT_PLAN.md`

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Podcast integration
- [ ] Video news support
- [ ] ML-based personalization
- [ ] Advanced analytics
- [ ] Premium subscription
- [ ] Multi-region support
- [ ] Real-time updates (WebSocket)
- [ ] AI-generated summaries
- [ ] Push notifications

## 🎉 Getting Started

```bash
# 1. Install dependencies
npm install && cd client && npm install && cd ..

# 2. Setup environment
cp .env.example .env

# 3. Setup database
npx prisma db push

# 4. Start development
npm run dev:all

# 5. Open browser
# Backend: http://localhost:3001
# Frontend: http://localhost:3000
```

---

**Made with ❤️ for the Polish community**

*One server. One database. Infinite possibilities.*

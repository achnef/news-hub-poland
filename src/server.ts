import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import cron from 'node-cron';
import expressStaticGzip from 'express-static-gzip';
import newsFetcher from './services/newsFetcher.js';
import translator from './services/translator.js';

// Load environment variables
dotenv.config();

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Prisma with v7 configuration
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Initialize Express
const app: Express = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Authentication middleware
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    (req as any).user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Authorization middleware
export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = (req as any).user?.role;
    if (!roles.includes(userRole)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};

// ==================== API ROUTES ====================

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), environment: NODE_ENV });
});

// ==================== AUTH ROUTES ====================

app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create user (TODO: Hash password in production)
    const user = await prisma.user.create({
      data: {
        email,
        password,
        name,
      },
    });

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role }, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role }, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/auth/profile', authenticate, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: (req as any).user.id },
      select: { id: true, email: true, name: true, language: true, theme: true, role: true },
    });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// ==================== ARTICLES ROUTES ====================

app.get('/api/articles', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, category, language = 'en' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { status: 'PUBLISHED' };
    if (category) where.category = { slug: category };

    const articles = await prisma.article.findMany({
      where,
      include: {
        category: true,
        translations: {
          where: { language },
        },
      },
      orderBy: { publishedAt: 'desc' },
      skip,
      take: Number(limit),
    });

    const total = await prisma.article.count({ where });

    res.json({
      articles,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

app.get('/api/articles/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { language = 'en' } = req.query;

    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        category: true,
        translations: {
          where: { language: String(language) },
        },
        comments: {
          where: { status: 'APPROVED' },
          include: { user: { select: { name: true, avatar: true } } },
        },
      },
    });

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Increment view count
    await prisma.article.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    res.json(article);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});

app.get('/api/articles/search', async (req: Request, res: Response) => {
  try {
    const { q, language = 'en' } = req.query;

    const articles = await prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
        OR: [
          { title: { contains: String(q), mode: 'insensitive' } },
          { description: { contains: String(q), mode: 'insensitive' } },
        ],
      },
      include: {
        category: true,
        translations: {
          where: { language: String(language) },
        },
      },
      take: 20,
    });

    res.json(articles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Search failed' });
  }
});

app.get('/api/categories', async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.get('/api/trending', async (req: Request, res: Response) => {
  try {
    const { limit = 10 } = req.query;

    const trending = await prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { viewCount: 'desc' },
      take: Number(limit),
      include: { category: true },
    });

    res.json(trending);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch trending articles' });
  }
});

// ==================== BOOKMARKS ROUTES ====================

app.get('/api/bookmarks', authenticate, async (req: Request, res: Response) => {
  try {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: (req as any).user.id },
      include: { article: { include: { category: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(bookmarks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch bookmarks' });
  }
});

app.post('/api/bookmarks', authenticate, async (req: Request, res: Response) => {
  try {
    const { articleId } = req.body;

    const bookmark = await prisma.bookmark.create({
      data: {
        userId: (req as any).user.id,
        articleId,
      },
    });

    res.json(bookmark);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create bookmark' });
  }
});

app.delete('/api/bookmarks/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.bookmark.delete({
      where: { id },
    });

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete bookmark' });
  }
});

// ==================== COMMENTS ROUTES ====================

app.get('/api/articles/:id/comments', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const comments = await prisma.comment.findMany({
      where: { articleId: id, status: 'APPROVED' },
      include: { user: { select: { name: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

app.post('/api/comments', authenticate, async (req: Request, res: Response) => {
  try {
    const { articleId, content } = req.body;

    const comment = await prisma.comment.create({
      data: {
        articleId,
        userId: (req as any).user.id,
        content,
        status: 'PENDING',
      },
    });

    res.json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

// ==================== ADMIN ROUTES ====================

app.post('/api/admin/articles', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), async (req: Request, res: Response) => {
  try {
    const { title, description, content, categoryId, imageUrl } = req.body;

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const article = await prisma.article.create({
      data: {
        title,
        slug,
        description,
        content,
        categoryId,
        imageUrl,
        isManual: true,
        status: 'PUBLISHED',
      },
      include: { category: true },
    });

    // Translate article
    if (content) {
      await translator.translateArticle(article.id, title, description, content);
    }

    res.json(article);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create article' });
  }
});

app.put('/api/admin/articles/:id', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, content, categoryId, imageUrl, status } = req.body;

    const article = await prisma.article.update({
      where: { id },
      data: {
        title,
        description,
        content,
        categoryId,
        imageUrl,
        status,
      },
      include: { category: true },
    });

    res.json(article);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update article' });
  }
});

app.delete('/api/admin/articles/:id', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.article.delete({
      where: { id },
    });

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete article' });
  }
});

// Admin: Fetch news manually
app.post('/api/admin/fetch-news', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), async (req: Request, res: Response) => {
  try {
    const result = await newsFetcher.fetchAndSaveNews();
    res.json({ success: true, ...result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// Admin: Translate articles manually
app.post('/api/admin/translate', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), async (req: Request, res: Response) => {
  try {
    await translator.translateMissingArticles();
    res.json({ success: true, message: 'Translation started' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to start translation' });
  }
});

// ==================== SCHEDULED TASKS ====================

// Fetch news every 4 hours
cron.schedule('0 */4 * * *', async () => {
  console.log('\n⏰ [CRON] News fetch scheduled task triggered');
  try {
    await newsFetcher.fetchAndSaveNews();
    await translator.translateMissingArticles();
  } catch (error) {
    console.error('[CRON] Error:', error);
  }
});

// Translate missing articles every 6 hours
cron.schedule('0 */6 * * *', async () => {
  console.log('\n⏰ [CRON] Translation scheduled task triggered');
  try {
    await translator.translateMissingArticles();
  } catch (error) {
    console.error('[CRON] Error:', error);
  }
});

// ==================== STATIC FILES & SPA FALLBACK ====================

// In production, serve React build
if (NODE_ENV === 'production') {
  const clientPath = path.join(__dirname, '../client/dist');
  
  app.use(expressStaticGzip(clientPath, {
    enableBrotli: true,
    orderPreference: ['br', 'gz'],
    index: 'index.html',
  }));

  // SPA fallback - serve index.html for all non-API routes
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(clientPath, 'index.html'));
  });
}

// ==================== ERROR HANDLING ====================

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║  🚀 Poland News Hub Server Running     ║
╠════════════════════════════════════════╣
║  📍 Port: ${PORT}
║  🌍 Environment: ${NODE_ENV}
║  📊 Database: ${process.env.DATABASE_URL ? '✓ Connected' : '✗ Not configured'}
║  🔐 JWT Secret: ${process.env.JWT_SECRET ? '✓ Configured' : '✗ Not configured'}
║  📰 NewsAPI: ${process.env.NEWSAPI_KEY ? '✓ Configured' : '✗ Not configured'}
║  🌐 GNews API: ${process.env.GNEWS_API_KEY ? '✓ Configured' : '✗ Not configured'}
║  🤖 Translation: ${process.env.OPENAI_API_KEY ? 'OpenAI' : process.env.GOOGLE_TRANSLATE_API_KEY ? 'Google' : '✗ Not configured'}
╚════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

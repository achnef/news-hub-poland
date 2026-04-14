# Poland News Hub - Multilingual News Aggregator

## Project Overview

A full-stack multilingual news aggregator website for Polish news with automatic fetching from official sources, manual publishing capability, and AI-powered translation to 5 languages (Arabic, English, Polish, German, French).

## Technology Stack

### Frontend
- **Framework**: React 19 with TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui
- **State Management**: React Context + Custom Hooks
- **Internationalization**: i18next for multilingual support
- **Charts/Data**: Recharts for analytics
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js with Express
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT + OAuth
- **API Documentation**: OpenAPI/Swagger
- **Task Scheduling**: node-cron for automatic news fetching
- **AI Translation**: OpenAI API or Google Translate API
- **News APIs**: NewsAPI, GNews, or Polish news provider APIs

### Infrastructure
- **Hosting**: Manus (initially), then custom server with Docker
- **Database**: PostgreSQL
- **Caching**: Redis for performance
- **Message Queue**: Bull for background jobs

## Core Features

### 1. Automatic News Fetching
- Fetch news from official Polish sources every 4 hours
- Support multiple news APIs (NewsAPI, GNews, etc.)
- Validate and deduplicate news articles
- Store in database with metadata

### 2. Manual News Publishing
- Admin panel for creating custom news articles
- Rich text editor for content creation
- Image upload capability
- Category and tag assignment
- Publish scheduling

### 3. Multilingual Support
- 5 languages: Arabic, English, Polish, German, French
- AI-powered automatic translation
- Language switcher in UI
- Database support for multiple language versions

### 4. News Display & Discovery
- Homepage with latest news
- Category-based filtering (Politics, Business, Technology, Sports, Entertainment, Local, etc.)
- Search functionality with filters
- Trending news section
- News by language

### 5. User Features
- User authentication (signup/login)
- Bookmarks/Favorites
- Reading history
- Personalized news feed
- User preferences (language, categories, notifications)

### 6. Advanced Features
- Dark/Light theme toggle
- Comments section on articles
- Social sharing buttons
- Related articles suggestions
- Newsletter subscription
- Push notifications
- Analytics dashboard (for admins)

### 7. Admin Panel
- News management (approve, edit, delete)
- User management
- Category management
- Analytics and statistics
- API configuration
- Translation management

## Database Schema

### Core Tables

```
Users
- id (UUID)
- email (unique)
- password_hash
- name
- language (default: Polish)
- theme (light/dark)
- created_at
- updated_at

Articles
- id (UUID)
- title
- slug (unique)
- description/summary
- content
- source_url (link to original)
- source_name
- image_url
- category_id
- author
- published_at
- fetched_at
- is_manual (boolean)
- status (draft/published)
- created_at
- updated_at

ArticleTranslations
- id (UUID)
- article_id
- language (ar/en/pl/de/fr)
- title
- description
- content
- translated_at

Categories
- id (UUID)
- name
- slug
- description
- icon

Bookmarks
- id (UUID)
- user_id
- article_id
- created_at

Comments
- id (UUID)
- article_id
- user_id
- content
- status (pending/approved/rejected)
- created_at
- updated_at

NewsFeeds
- id (UUID)
- name
- api_type (newsapi/gnews/custom)
- api_key
- endpoints
- is_active
- last_fetched_at
- created_at

FetchLogs
- id (UUID)
- feed_id
- status (success/failed)
- articles_fetched
- error_message
- executed_at
```

## API Endpoints

### Public Endpoints
```
GET /api/articles - Get all articles with filters
GET /api/articles/:id - Get single article
GET /api/articles/search - Search articles
GET /api/categories - Get all categories
GET /api/trending - Get trending articles
GET /api/articles/:id/related - Get related articles
GET /api/languages - Get supported languages
```

### User Endpoints (Authenticated)
```
POST /api/auth/register - Register user
POST /api/auth/login - Login user
GET /api/auth/profile - Get user profile
PUT /api/auth/profile - Update profile
POST /api/bookmarks - Add bookmark
DELETE /api/bookmarks/:id - Remove bookmark
GET /api/bookmarks - Get user bookmarks
POST /api/comments - Add comment
GET /api/articles/:id/comments - Get article comments
```

### Admin Endpoints (Admin Only)
```
POST /api/admin/articles - Create article
PUT /api/admin/articles/:id - Edit article
DELETE /api/admin/articles/:id - Delete article
GET /api/admin/articles - Manage articles
POST /api/admin/categories - Create category
GET /api/admin/users - Manage users
GET /api/admin/analytics - Get analytics
POST /api/admin/feeds - Configure news feeds
GET /api/admin/fetch-logs - View fetch logs
```

## Implementation Roadmap

### Phase 1: Backend Setup (Week 1)
- [ ] Set up Node.js + Express server
- [ ] Configure PostgreSQL database
- [ ] Create database schema with Prisma
- [ ] Implement authentication (JWT)
- [ ] Create basic API endpoints

### Phase 2: News Fetching (Week 2)
- [ ] Integrate NewsAPI
- [ ] Implement automatic fetching scheduler (every 4 hours)
- [ ] Create article deduplication logic
- [ ] Store articles in database
- [ ] Implement fetch logging

### Phase 3: Frontend Setup (Week 2-3)
- [ ] Set up React + TypeScript project
- [ ] Configure Tailwind CSS + shadcn/ui
- [ ] Implement i18next for multilingual support
- [ ] Create responsive layout

### Phase 4: Frontend Features (Week 3-4)
- [ ] Homepage with news display
- [ ] Category filtering
- [ ] Search functionality
- [ ] Article detail page
- [ ] User authentication UI

### Phase 5: Advanced Features (Week 4-5)
- [ ] Bookmarks functionality
- [ ] Comments system
- [ ] Dark/Light theme
- [ ] User preferences
- [ ] Related articles

### Phase 6: Admin Panel (Week 5-6)
- [ ] Admin dashboard
- [ ] Manual article publishing
- [ ] User management
- [ ] Analytics dashboard
- [ ] Feed configuration

### Phase 7: AI Translation (Week 6)
- [ ] Integrate AI translation API
- [ ] Automatic translation on fetch
- [ ] Translation caching
- [ ] Language management

### Phase 8: Testing & Deployment (Week 7)
- [ ] Unit tests
- [ ] Integration tests
- [ ] Performance optimization
- [ ] Security audit
- [ ] Deployment preparation

## Security Considerations

1. **Authentication**: JWT tokens with refresh tokens
2. **Authorization**: Role-based access control (User, Admin, SuperAdmin)
3. **Data Validation**: Input validation on all endpoints
4. **SQL Injection Prevention**: Use Prisma ORM
5. **CORS**: Configure properly for frontend domain
6. **Rate Limiting**: Implement rate limiting on API endpoints
7. **HTTPS**: Use SSL/TLS in production
8. **Environment Variables**: Store secrets in .env file
9. **API Key Management**: Secure storage of news API keys
10. **Content Moderation**: Review comments before publishing

## Performance Optimization

1. **Database Indexing**: Index frequently queried columns
2. **Caching**: Redis for popular articles and categories
3. **Pagination**: Implement pagination for article lists
4. **Image Optimization**: Compress and resize images
5. **CDN**: Use CDN for static assets
6. **Database Connection Pooling**: Use connection pools
7. **API Response Compression**: Gzip compression
8. **Lazy Loading**: Implement lazy loading for images

## Deployment Strategy

### Development
- Local development with Docker Compose
- PostgreSQL in Docker container
- Redis in Docker container

### Production
- Deploy on custom server or cloud provider
- Use Docker containers for services
- Configure load balancer
- Set up monitoring and logging
- Configure automated backups
- Use environment-specific configurations

## Monitoring & Maintenance

1. **Error Logging**: Implement error tracking (Sentry)
2. **Performance Monitoring**: Track API response times
3. **Database Monitoring**: Monitor query performance
4. **Uptime Monitoring**: Monitor service availability
5. **Log Aggregation**: Centralize logs
6. **Automated Backups**: Daily database backups
7. **Security Updates**: Regular dependency updates

## Future Enhancements

1. Mobile app (React Native)
2. Podcast integration
3. Video news support
4. Machine learning for personalization
5. Advanced analytics
6. Partnerships with news organizations
7. Premium subscription model
8. Multi-region support
9. Real-time news updates (WebSocket)
10. AI-generated summaries

## Cost Estimation

### Development
- Backend development: 80 hours
- Frontend development: 100 hours
- Database design: 20 hours
- Testing & deployment: 40 hours
- **Total: ~240 hours**

### Infrastructure (Monthly)
- Server: $50-100
- Database: $20-50
- API services: $20-50
- CDN: $10-20
- Monitoring: $10-20
- **Total: ~$110-240/month**

## Team Requirements

- 1 Backend Developer (Node.js/Express)
- 1 Frontend Developer (React)
- 1 DevOps Engineer (optional, for deployment)
- 1 QA Engineer (optional)

## Success Metrics

1. **User Engagement**: Daily active users, session duration
2. **Content Quality**: Article accuracy, user satisfaction
3. **Performance**: API response time < 200ms
4. **Availability**: 99.9% uptime
5. **Growth**: User acquisition rate, retention rate
6. **Monetization**: Ad revenue, subscription revenue (future)

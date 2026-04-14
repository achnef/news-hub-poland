import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create categories
  const categories = [
    { name: 'Politics', slug: 'politics' },
    { name: 'Business', slug: 'business' },
    { name: 'Technology', slug: 'technology' },
    { name: 'Sports', slug: 'sports' },
    { name: 'Entertainment', slug: 'entertainment' },
    { name: 'Local', slug: 'local' },
    { name: 'Health', slug: 'health' },
    { name: 'Science', slug: 'science' },
  ]

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    })
  }

  console.log('✅ Categories created')

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: 'admin123', // TODO: Hash password in production
      name: 'Admin User',
      role: 'SUPER_ADMIN',
    },
  })

  console.log('✅ Admin user created:', adminUser.email)

  // Create demo user
  const demoUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      password: 'user123', // TODO: Hash password in production
      name: 'Demo User',
      role: 'USER',
    },
  })

  console.log('✅ Demo user created:', demoUser.email)

  // Create sample article
  const politicsCategory = await prisma.category.findFirst({
    where: { slug: 'politics' },
  })

  if (politicsCategory) {
    const sampleArticle = await prisma.article.upsert({
      where: { slug: 'welcome-to-poland-news-hub' },
      update: {},
      create: {
        title: 'Welcome to Poland News Hub',
        slug: 'welcome-to-poland-news-hub',
        description: 'Your multilingual news aggregator for Polish news',
        content: `
          Welcome to Poland News Hub! This is a demonstration article to show how the news aggregator works.
          
          Features:
          - Automatic news fetching from official Polish sources
          - AI-powered translation to 5 languages
          - User bookmarks and comments
          - Dark/Light theme support
          - Responsive design for all devices
          
          Start by clicking "Admin" to fetch real news articles from Polish news APIs.
        `,
        imageUrl: 'https://images.unsplash.com/photo-1504711331122-b0a3cb1a5c1d?w=800',
        categoryId: politicsCategory.id,
        status: 'PUBLISHED',
        isManual: true,
        publishedAt: new Date(),
      },
    })

    console.log('✅ Sample article created')

    // Create sample translations
    const translations = [
      {
        language: 'PL',
        title: 'Witaj w Poland News Hub',
        description: 'Twój wielojęzyczny agregator wiadomości z Polski',
        content: 'Witaj w Poland News Hub!',
      },
      {
        language: 'AR',
        title: 'مرحبا بك في Poland News Hub',
        description: 'مجمع الأخبار متعدد اللغات الخاص بك للأخبار البولندية',
        content: 'مرحبا بك في Poland News Hub!',
      },
      {
        language: 'DE',
        title: 'Willkommen bei Poland News Hub',
        description: 'Ihr mehrsprachiger Nachrichtenaggregator für polnische Nachrichten',
        content: 'Willkommen bei Poland News Hub!',
      },
      {
        language: 'FR',
        title: 'Bienvenue sur Poland News Hub',
        description: 'Votre agrégateur de nouvelles multilingue pour les actualités polonaises',
        content: 'Bienvenue sur Poland News Hub!',
      },
    ]

    for (const translation of translations) {
      await prisma.articleTranslation.upsert({
        where: {
          articleId_language: {
            articleId: sampleArticle.id,
            language: translation.language as any,
          },
        },
        update: {},
        create: {
          articleId: sampleArticle.id,
          language: translation.language as any,
          title: translation.title,
          description: translation.description,
          content: translation.content,
        },
      })
    }

    console.log('✅ Sample translations created')
  }

  console.log('✅ Database seeding completed!')
  console.log('\n📝 Test Credentials:')
  console.log('   Admin Email: admin@example.com')
  console.log('   Admin Password: admin123')
  console.log('   User Email: user@example.com')
  console.log('   User Password: user123')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

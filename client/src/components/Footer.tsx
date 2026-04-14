import { useTranslation } from 'react-i18next'
import { Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  const { t } = useTranslation()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-primary text-white mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold mb-4">{t('app.title')}</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              {t('app.description')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="/" className="hover:text-accent transition">{t('nav.home')}</a></li>
              <li><a href="/search" className="hover:text-accent transition">{t('nav.search')}</a></li>
              <li><a href="/bookmarks" className="hover:text-accent transition">{t('nav.bookmarks')}</a></li>
              <li><a href="#" className="hover:text-accent transition">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Categories</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="/category/politics" className="hover:text-accent transition">{t('categories.politics')}</a></li>
              <li><a href="/category/business" className="hover:text-accent transition">{t('categories.business')}</a></li>
              <li><a href="/category/technology" className="hover:text-accent transition">{t('categories.technology')}</a></li>
              <li><a href="/category/sports" className="hover:text-accent transition">{t('categories.sports')}</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <a href="mailto:info@newshubpoland.com" className="hover:text-accent transition">
                  info@newshubpoland.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <a href="tel:+48123456789" className="hover:text-accent transition">
                  +48 123 456 789
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Warsaw, Poland</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p>&copy; {currentYear} Poland News Hub. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-accent transition">Terms of Service</a>
              <a href="#" className="hover:text-accent transition">Privacy Policy</a>
              <a href="#" className="hover:text-accent transition">Contact</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

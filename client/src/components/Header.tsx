import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'next-themes'
import { Menu, X, Sun, Moon, Globe } from 'lucide-react'

export default function Header() {
  const { t, i18n } = useTranslation()
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLanguageOpen, setIsLanguageOpen] = useState(false)

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'ar', name: 'العربية' },
    { code: 'pl', name: 'Polski' },
    { code: 'de', name: 'Deutsch' },
    { code: 'fr', name: 'Français' },
  ]

  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code)
    localStorage.setItem('language', code)
    setIsLanguageOpen(false)
  }

  const user = JSON.parse(localStorage.getItem('user') || 'null')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">📰</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-primary">{t('app.title')}</h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">{t('app.subtitle')}</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="hover:text-accent transition">{t('nav.home')}</Link>
            <Link to="/search" className="hover:text-accent transition">{t('nav.search')}</Link>
            <Link to="/bookmarks" className="hover:text-accent transition">{t('nav.bookmarks')}</Link>
            
            {user?.role === 'ADMIN' && (
              <Link to="/admin" className="hover:text-accent transition">{t('nav.admin')}</Link>
            )}
          </nav>

          {/* Right Side Controls */}
          <div className="flex items-center gap-4">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                <Globe className="w-5 h-5" />
                <span className="text-sm font-medium uppercase">{i18n.language}</span>
              </button>
              
              {isLanguageOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`w-full text-left px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition ${
                        i18n.language === lang.code ? 'bg-accent text-white' : ''
                      }`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* User Menu */}
            {user ? (
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-sm font-medium">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                >
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login" className="px-4 py-2 text-accent hover:text-accent/80 transition">
                  {t('nav.login')}
                </Link>
                <Link to="/register" className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition">
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
            <Link to="/" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition">
              {t('nav.home')}
            </Link>
            <Link to="/search" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition">
              {t('nav.search')}
            </Link>
            <Link to="/bookmarks" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition">
              {t('nav.bookmarks')}
            </Link>
            {user?.role === 'ADMIN' && (
              <Link to="/admin" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition">
                {t('nav.admin')}
              </Link>
            )}
            {!user && (
              <>
                <Link to="/login" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition">
                  {t('nav.login')}
                </Link>
                <Link to="/register" className="block px-4 py-2 bg-accent text-white rounded transition">
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}

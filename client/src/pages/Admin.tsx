import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Loader2, Plus, Edit2, Trash2, RefreshCw, Globe } from 'lucide-react'

interface Article {
  id: string
  title: string
  description: string
  status: string
  isManual: boolean
  createdAt: string
}

export default function Admin() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [fetching, setFetching] = useState(false)
  const [translating, setTranslating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    categoryId: '',
    imageUrl: '',
  })

  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    if (!token || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      navigate('/login')
      return
    }
    fetchArticles()
  }, [token, user.role])

  const fetchArticles = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/articles?limit=100')
      const data = await response.json()
      setArticles(data.articles || [])
    } catch (error) {
      console.error('Error fetching articles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFetchNews = async () => {
    try {
      setFetching(true)
      const response = await fetch('/api/admin/fetch-news', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      alert(`✅ Fetched ${data.savedCount} new articles`)
      fetchArticles()
    } catch (error) {
      alert('❌ Failed to fetch news')
    } finally {
      setFetching(false)
    }
  }

  const handleTranslate = async () => {
    try {
      setTranslating(true)
      const response = await fetch('/api/admin/translate', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      alert('✅ Translation started')
    } catch (error) {
      alert('❌ Failed to start translation')
    } finally {
      setTranslating(false)
    }
  }

  const handlePublishArticle = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })
      if (response.ok) {
        alert('✅ Article published')
        setFormData({ title: '', description: '', content: '', categoryId: '', imageUrl: '' })
        setShowForm(false)
        fetchArticles()
      }
    } catch (error) {
      alert('❌ Failed to publish article')
    }
  }

  const handleDeleteArticle = async (id: string) => {
    if (!confirm('Are you sure?')) return
    try {
      const response = await fetch(`/api/admin/articles/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        alert('✅ Article deleted')
        fetchArticles()
      }
    } catch (error) {
      alert('❌ Failed to delete article')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary mb-4">{t('nav.admin')}</h1>
        <p className="text-gray-600">Welcome, {user.name}! Manage your news content here.</p>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <button
          onClick={handleFetchNews}
          disabled={fetching}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 transition"
        >
          <RefreshCw className={`w-5 h-5 ${fetching ? 'animate-spin' : ''}`} />
          {fetching ? 'Fetching...' : 'Fetch News'}
        </button>

        <button
          onClick={handleTranslate}
          disabled={translating}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition"
        >
          <Globe className={`w-5 h-5 ${translating ? 'animate-spin' : ''}`} />
          {translating ? 'Translating...' : 'Translate'}
        </button>

        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
        >
          <Plus className="w-5 h-5" />
          Publish Article
        </button>

        <button
          onClick={fetchArticles}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
        >
          <RefreshCw className="w-5 h-5" />
          Refresh
        </button>
      </div>

      {/* Publish Form */}
      {showForm && (
        <div className="card p-6 mb-8">
          <h2 className="text-2xl font-bold text-primary mb-4">Publish New Article</h2>
          <form onSubmit={handlePublishArticle} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input"
                placeholder="Article title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input h-24"
                placeholder="Article description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Content</label>
              <textarea
                required
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="input h-40"
                placeholder="Article content"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Image URL</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="input"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Category ID</label>
                <input
                  type="text"
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="input"
                  placeholder="Category ID"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              >
                {t('buttons.publish')}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
              >
                {t('buttons.cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Articles Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Title</th>
                <th className="px-4 py-3 text-left font-semibold">Type</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Date</th>
                <th className="px-4 py-3 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article.id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3 font-medium line-clamp-1">{article.title}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      article.isManual ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {article.isManual ? 'Manual' : 'Auto'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      article.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {article.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(article.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 flex justify-center gap-2">
                    <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteArticle(article.id)}
                      className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded transition text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {articles.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">{t('messages.noResults')}</p>
        </div>
      )}
    </div>
  )
}

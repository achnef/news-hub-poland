import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function Article() {
  const { id } = useParams()
  const { t } = useTranslation()

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-primary mb-4">Article {id}</h1>
        <p className="text-gray-600">{t('messages.loading')}...</p>
      </div>
    </div>
  )
}

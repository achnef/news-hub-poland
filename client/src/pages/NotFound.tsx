import { useTranslation } from 'react-i18next'

export default function NotFound() {
  const { t } = useTranslation()
  return <div className="container mx-auto px-4 py-12"><h1>404 - {t('messages.noResults')}</h1></div>
}

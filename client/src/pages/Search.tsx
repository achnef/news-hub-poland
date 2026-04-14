import { useTranslation } from 'react-i18next'

export default function Search() {
  const { t } = useTranslation()
  return <div className="container mx-auto px-4 py-12"><p>{t('messages.loading')}...</p></div>
}

import { useTranslation } from 'react-i18next'

export default function Login() {
  const { t } = useTranslation()
  return <div className="container mx-auto px-4 py-12"><p>{t('nav.login')}</p></div>
}

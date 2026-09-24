import { Outlet } from 'react-router-dom'
import { useRouteLanguageSync } from '../hooks/useRouteLanguageSync'

export default function FocusLayout() {
  useRouteLanguageSync()
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Outlet />
    </div>
  )
}

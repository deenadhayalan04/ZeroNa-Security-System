import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { DashboardLayout } from './components/layout/DashboardLayout.jsx'
import { OverviewPage } from './pages/OverviewPage.jsx'
import { AssessmentPage } from './pages/AssessmentPage.jsx'
import { ReportsPage } from './pages/ReportsPage.jsx'
import { RisksPage } from './pages/RisksPage.jsx'

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/assessment" element={<AssessmentPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/risks" element={<RisksPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
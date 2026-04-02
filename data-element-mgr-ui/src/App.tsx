import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import LoginPage from './pages/login/LoginPage'
import { AuthGuard } from './hooks/useAuth'

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/*" element={
        <AuthGuard>
          <MainLayout />
        </AuthGuard>
      } />
    </Routes>
  )
}

export default App

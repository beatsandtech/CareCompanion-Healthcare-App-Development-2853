import React from 'react'
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/layout/Layout'
import LoginForm from './components/auth/LoginForm'
import Dashboard from './pages/Dashboard'
import Schedule from './pages/Schedule'
import Medications from './pages/Medications'
import './App.css'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }
  
  return user ? children : <Navigate to="/login" replace />
}

// Public Route Component (redirects authenticated users)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }
  
  return user ? <Navigate to="/dashboard" replace /> : children
}

function AppContent() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <LoginForm />
              </PublicRoute>
            } 
          />

          {/* Protected Routes */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="schedule" element={<Schedule />} />
            <Route path="medications" element={<Medications />} />
            <Route path="chores" element={<div className="p-6"><h1 className="text-2xl font-bold">Chores & Safety</h1><p className="text-gray-600 mt-2">Coming soon...</p></div>} />
            <Route path="notes" element={<div className="p-6"><h1 className="text-2xl font-bold">Notes & Observations</h1><p className="text-gray-600 mt-2">Coming soon...</p></div>} />
            <Route path="chat" element={<div className="p-6"><h1 className="text-2xl font-bold">Messages</h1><p className="text-gray-600 mt-2">Coming soon...</p></div>} />
            <Route path="analytics" element={<div className="p-6"><h1 className="text-2xl font-bold">Analytics & Reports</h1><p className="text-gray-600 mt-2">Coming soon...</p></div>} />
            <Route path="users" element={<div className="p-6"><h1 className="text-2xl font-bold">User Management</h1><p className="text-gray-600 mt-2">Coming soon...</p></div>} />
            <Route path="settings" element={<div className="p-6"><h1 className="text-2xl font-bold">Settings</h1><p className="text-gray-600 mt-2">Coming soon...</p></div>} />
            <Route path="help" element={<div className="p-6"><h1 className="text-2xl font-bold">Help & Support</h1><p className="text-gray-600 mt-2">Coming soon...</p></div>} />
          </Route>

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>

        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              style: {
                background: '#22c55e',
              },
            },
            error: {
              style: {
                background: '#ef4444',
              },
            },
          }}
        />
      </div>
    </Router>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
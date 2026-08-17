import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Provider } from 'react-redux'
import { Toaster } from 'react-hot-toast'
import { store } from './store/store'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/Layout/Layout'
import Login from './pages/Login/Login'
import Dashboard from './pages/Dashboard/Dashboard'
import Hostels from './pages/Hostels/Hostels'
import Users from './pages/Users/Users'
import Reservations from './pages/Reservations/Reservations'
import Analytics from './pages/Analytics/Analytics'
import Settings from './pages/Settings/Settings'
import Database from './pages/Database/Database'
import './App.css'

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        isAuthenticated ? <Layout /> : <Navigate to="/login" replace />
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="hostels" element={<Hostels />} />
        <Route path="users" element={<Users />} />
        <Route path="reservations" element={<Reservations />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="database" element={<Database />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <Router>
          <div className="app">
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
              }}
            />
            <AppContent />
          </div>
        </Router>
      </AuthProvider>
    </Provider>
  )
}

export default App

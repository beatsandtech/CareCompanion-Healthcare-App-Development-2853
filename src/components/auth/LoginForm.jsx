import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'
import { testConnection } from '../../lib/supabase'

const { FiMail, FiLock, FiEye, FiEyeOff, FiHeart, FiAlertTriangle } = FiIcons

const LoginForm = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('checking') // checking, connected, failed
  const { signIn, loading } = useAuth()

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    const isConnected = await testConnection()
    setConnectionStatus(isConnected ? 'connected' : 'failed')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (connectionStatus === 'failed') {
      alert('Cannot sign in: Supabase connection not configured. Please check your environment variables.')
      return
    }

    try {
      await signIn(email, password)
    } catch (error) {
      console.error('Sign in error:', error)
    }
  }

  const handleDemoLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail)
    setPassword(demoPassword)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-100 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8"
      >
        {/* Logo & Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center mb-4">
            <SafeIcon icon={FiHeart} className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
          <p className="mt-2 text-gray-600">Sign in to CareCompanion</p>
        </div>

        {/* Connection Status */}
        <div className={`rounded-lg p-4 ${
          connectionStatus === 'checking' ? 'bg-blue-50 border border-blue-200' :
          connectionStatus === 'connected' ? 'bg-green-50 border border-green-200' :
          'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center space-x-2">
            <SafeIcon 
              icon={connectionStatus === 'failed' ? FiAlertTriangle : FiHeart} 
              className={`w-5 h-5 ${
                connectionStatus === 'checking' ? 'text-blue-600' :
                connectionStatus === 'connected' ? 'text-green-600' :
                'text-red-600'
              }`} 
            />
            <div>
              <p className={`font-medium ${
                connectionStatus === 'checking' ? 'text-blue-900' :
                connectionStatus === 'connected' ? 'text-green-900' :
                'text-red-900'
              }`}>
                {connectionStatus === 'checking' && 'Checking connection...'}
                {connectionStatus === 'connected' && 'Connected to Supabase'}
                {connectionStatus === 'failed' && 'Connection Failed'}
              </p>
              {connectionStatus === 'failed' && (
                <p className="text-sm text-red-700 mt-1">
                  Please set up your Supabase credentials in the .env file
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Setup Instructions (when connection failed) */}
        {connectionStatus === 'failed' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-medium text-yellow-900 mb-2">Setup Required:</h3>
            <div className="text-sm text-yellow-800 space-y-2">
              <p>1. Create a Supabase project at supabase.com</p>
              <p>2. Copy your project URL and anon key</p>
              <p>3. Create a .env file with:</p>
              <code className="block bg-yellow-100 p-2 rounded mt-2 text-xs">
                VITE_SUPABASE_URL=https://your-project.supabase.co<br/>
                VITE_SUPABASE_ANON_KEY=your-anon-key
              </code>
              <p>4. Run the SQL schema from README.md</p>
            </div>
          </div>
        )}

        {/* Demo Credentials */}
        {connectionStatus === 'connected' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Demo Accounts:</h3>
            <div className="text-sm text-blue-800 space-y-2">
              <button
                onClick={() => handleDemoLogin('caregiver@demo.com', 'demo123')}
                className="block w-full text-left hover:bg-blue-100 p-2 rounded"
              >
                <strong>Caregiver:</strong> caregiver@demo.com / demo123
              </button>
              <button
                onClick={() => handleDemoLogin('family@demo.com', 'demo123')}
                className="block w-full text-left hover:bg-blue-100 p-2 rounded"
              >
                <strong>Family:</strong> family@demo.com / demo123
              </button>
              <button
                onClick={() => handleDemoLogin('admin@demo.com', 'demo123')}
                className="block w-full text-left hover:bg-blue-100 p-2 rounded"
              >
                <strong>Admin:</strong> admin@demo.com / demo123
              </button>
            </div>
          </div>
        )}

        {/* Login Form */}
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-xl p-8 space-y-6"
        >
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email address
            </label>
            <div className="relative">
              <SafeIcon icon={FiMail} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <SafeIcon icon={FiLock} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <SafeIcon icon={showPassword ? FiEyeOff : FiEye} className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || connectionStatus !== 'connected'}
            className={`w-full py-3 px-4 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors ${
              connectionStatus === 'connected'
                ? 'bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {loading ? 'Signing in...' : 
             connectionStatus !== 'connected' ? 'Setup Required' : 'Sign in'}
          </button>

          {/* Footer */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Need help? <a href="#" className="text-primary-500 hover:text-primary-600 font-medium">Contact support</a>
            </p>
          </div>
        </motion.form>
      </motion.div>
    </div>
  )
}

export default LoginForm
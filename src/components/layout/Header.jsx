import React, { useState } from 'react'
import { motion } from 'framer-motion'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const { FiBell, FiSearch, FiLogOut, FiUser, FiSettings } = FiIcons

const Header = () => {
  const { signOut, userProfile } = useAuth()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [notifications] = useState([
    { id: 1, message: 'Medication reminder for John Doe', time: '5 min ago', unread: true },
    { id: 2, message: 'Task completed: Morning vitals check', time: '15 min ago', unread: true },
    { id: 3, message: 'New message from family member', time: '1 hour ago', unread: false }
  ])

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      toast.error('Failed to sign out')
    }
  }

  const unreadCount = notifications.filter(n => n.unread).length

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Search Bar */}
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search patients, tasks, medications..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg">
              <SafeIcon icon={FiBell} className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger-500 text-white rounded-full text-xs flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-medium text-sm">
                  {userProfile?.full_name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900">
                  {userProfile?.full_name || 'User'}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {userProfile?.role || 'caregiver'}
                </p>
              </div>
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
              >
                <button className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <SafeIcon icon={FiUser} className="w-4 h-4" />
                  <span>Profile</span>
                </button>
                <button className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <SafeIcon icon={FiSettings} className="w-4 h-4" />
                  <span>Settings</span>
                </button>
                <hr className="my-1" />
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-danger-600 hover:bg-danger-50"
                >
                  <SafeIcon icon={FiLogOut} className="w-4 h-4" />
                  <span>Sign out</span>
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'
import { useAuth } from '../../contexts/AuthContext'

const { 
  FiHome, FiCalendar, FiPill, FiCheckSquare, 
  FiFileText, FiMessageCircle, FiBarChart3, 
  FiHelpCircle, FiUsers, FiSettings, FiHeart 
} = FiIcons

const Sidebar = () => {
  const { userProfile } = useAuth()
  const location = useLocation()

  const getNavigationItems = () => {
    const baseItems = [
      { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
      { path: '/schedule', icon: FiCalendar, label: 'Schedule' },
      { path: '/medications', icon: FiPill, label: 'Medications' },
      { path: '/chores', icon: FiCheckSquare, label: 'Chores & Safety' },
      { path: '/notes', icon: FiFileText, label: 'Notes' },
      { path: '/chat', icon: FiMessageCircle, label: 'Messages' },
      { path: '/analytics', icon: FiBarChart3, label: 'Reports' },
      { path: '/help', icon: FiHelpCircle, label: 'Help' }
    ]

    // Add admin-only items
    if (userProfile?.role === 'admin') {
      baseItems.splice(-1, 0, 
        { path: '/users', icon: FiUsers, label: 'User Management' },
        { path: '/settings', icon: FiSettings, label: 'Settings' }
      )
    }

    return baseItems
  }

  const navigationItems = getNavigationItems()

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
            <SafeIcon icon={FiHeart} className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">CareCompanion</h1>
            <p className="text-sm text-gray-500">Home Health Care</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-6 px-3">
        <ul className="space-y-1">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path
            
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={`
                    flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive 
                      ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-500' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <SafeIcon 
                    icon={item.icon} 
                    className={`w-5 h-5 ${isActive ? 'text-primary-500' : 'text-gray-400'}`} 
                  />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User Profile Section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-600 font-medium text-sm">
              {userProfile?.full_name?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {userProfile?.full_name || 'User'}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {userProfile?.role || 'caregiver'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
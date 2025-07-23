import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const {
  FiSettings, FiBell, FiShield, FiGlobe, FiMoon, FiSun, FiSmartphone,
  FiMail, FiMessageCircle, FiVolume2, FiVibrate, FiEye, FiDatabase,
  FiDownload, FiTrash2, FiKey, FiLock, FiUserCheck, FiHelpCircle
} = FiIcons

const SettingsSection = ({ title, children }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
    {children}
  </div>
)

const SettingItem = ({ icon, title, description, children, action }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
    <div className="flex items-center space-x-3">
      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
        <SafeIcon icon={icon} className="w-4 h-4 text-gray-600" />
      </div>
      <div>
        <p className="font-medium text-gray-900">{title}</p>
        {description && (
          <p className="text-sm text-gray-500">{description}</p>
        )}
      </div>
    </div>
    <div className="flex items-center space-x-3">
      {children}
      {action}
    </div>
  </div>
)

const Toggle = ({ enabled, onChange, disabled = false }) => (
  <button
    onClick={() => !disabled && onChange(!enabled)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
      enabled ? 'bg-blue-600' : 'bg-gray-200'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    disabled={disabled}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
        enabled ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
)

const Settings = () => {
  const { userProfile, signOut } = useAuth()
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      sms: false,
      medication_reminders: true,
      task_updates: true,
      chat_messages: true
    },
    privacy: {
      profile_visibility: 'team',
      activity_tracking: true,
      data_sharing: false
    },
    appearance: {
      theme: 'light',
      language: 'en',
      timezone: 'America/New_York'
    },
    security: {
      two_factor: false,
      login_alerts: true,
      session_timeout: 30
    }
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userProfile?.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading settings:', error)
        return
      }

      if (data) {
        setSettings(data.settings)
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }

  const updateSettings = async (newSettings) => {
    try {
      setLoading(true)
      
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: userProfile.id,
          settings: newSettings,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      setSettings(newSettings)
      toast.success('Settings updated successfully!')
    } catch (error) {
      console.error('Error updating settings:', error)
      toast.error('Failed to update settings')
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationChange = (key, value) => {
    const newSettings = {
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: value
      }
    }
    updateSettings(newSettings)
  }

  const handlePrivacyChange = (key, value) => {
    const newSettings = {
      ...settings,
      privacy: {
        ...settings.privacy,
        [key]: value
      }
    }
    updateSettings(newSettings)
  }

  const handleAppearanceChange = (key, value) => {
    const newSettings = {
      ...settings,
      appearance: {
        ...settings.appearance,
        [key]: value
      }
    }
    updateSettings(newSettings)
  }

  const handleSecurityChange = (key, value) => {
    const newSettings = {
      ...settings,
      security: {
        ...settings.security,
        [key]: value
      }
    }
    updateSettings(newSettings)
  }

  const handlePasswordChange = () => {
    toast.success('Password change feature coming soon!')
  }

  const handleDataExport = async () => {
    try {
      setLoading(true)
      toast.success('Data export started. You will receive an email when ready.')
    } catch (error) {
      toast.error('Failed to export data')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      toast.error('Account deletion feature coming soon!')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account preferences and privacy settings</p>
        </div>
      </div>

      {/* Notifications */}
      <SettingsSection title="Notifications">
        <SettingItem
          icon={FiMail}
          title="Email Notifications"
          description="Receive updates and reminders via email"
        >
          <Toggle
            enabled={settings.notifications.email}
            onChange={(value) => handleNotificationChange('email', value)}
            disabled={loading}
          />
        </SettingItem>

        <SettingItem
          icon={FiSmartphone}
          title="Push Notifications"
          description="Get instant notifications on your device"
        >
          <Toggle
            enabled={settings.notifications.push}
            onChange={(value) => handleNotificationChange('push', value)}
            disabled={loading}
          />
        </SettingItem>

        <SettingItem
          icon={FiMessageCircle}
          title="SMS Notifications"
          description="Receive important alerts via text message"
        >
          <Toggle
            enabled={settings.notifications.sms}
            onChange={(value) => handleNotificationChange('sms', value)}
            disabled={loading}
          />
        </SettingItem>

        <SettingItem
          icon={FiBell}
          title="Medication Reminders"
          description="Get notified about medication schedules"
        >
          <Toggle
            enabled={settings.notifications.medication_reminders}
            onChange={(value) => handleNotificationChange('medication_reminders', value)}
            disabled={loading}
          />
        </SettingItem>

        <SettingItem
          icon={FiUserCheck}
          title="Task Updates"
          description="Notifications about task assignments and completions"
        >
          <Toggle
            enabled={settings.notifications.task_updates}
            onChange={(value) => handleNotificationChange('task_updates', value)}
            disabled={loading}
          />
        </SettingItem>

        <SettingItem
          icon={FiMessageCircle}
          title="Chat Messages"
          description="Notifications for new messages"
        >
          <Toggle
            enabled={settings.notifications.chat_messages}
            onChange={(value) => handleNotificationChange('chat_messages', value)}
            disabled={loading}
          />
        </SettingItem>
      </SettingsSection>

      {/* Privacy & Security */}
      <SettingsSection title="Privacy & Security">
        <SettingItem
          icon={FiEye}
          title="Profile Visibility"
          description="Control who can see your profile information"
        >
          <select
            value={settings.privacy.profile_visibility}
            onChange={(e) => handlePrivacyChange('profile_visibility', e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          >
            <option value="public">Public</option>
            <option value="team">Team Only</option>
            <option value="private">Private</option>
          </select>
        </SettingItem>

        <SettingItem
          icon={FiDatabase}
          title="Activity Tracking"
          description="Allow tracking of your activity for analytics"
        >
          <Toggle
            enabled={settings.privacy.activity_tracking}
            onChange={(value) => handlePrivacyChange('activity_tracking', value)}
            disabled={loading}
          />
        </SettingItem>

        <SettingItem
          icon={FiShield}
          title="Data Sharing"
          description="Share anonymized data to improve the service"
        >
          <Toggle
            enabled={settings.privacy.data_sharing}
            onChange={(value) => handlePrivacyChange('data_sharing', value)}
            disabled={loading}
          />
        </SettingItem>

        <SettingItem
          icon={FiLock}
          title="Two-Factor Authentication"
          description="Add an extra layer of security to your account"
        >
          <Toggle
            enabled={settings.security.two_factor}
            onChange={(value) => handleSecurityChange('two_factor', value)}
            disabled={loading}
          />
        </SettingItem>

        <SettingItem
          icon={FiBell}
          title="Login Alerts"
          description="Get notified of new login attempts"
        >
          <Toggle
            enabled={settings.security.login_alerts}
            onChange={(value) => handleSecurityChange('login_alerts', value)}
            disabled={loading}
          />
        </SettingItem>

        <SettingItem
          icon={FiKey}
          title="Change Password"
          description="Update your account password"
          action={
            <button
              onClick={handlePasswordChange}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Change
            </button>
          }
        />
      </SettingsSection>

      {/* Appearance */}
      <SettingsSection title="Appearance">
        <SettingItem
          icon={settings.appearance.theme === 'light' ? FiSun : FiMoon}
          title="Theme"
          description="Choose your preferred color scheme"
        >
          <select
            value={settings.appearance.theme}
            onChange={(e) => handleAppearanceChange('theme', e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </SettingItem>

        <SettingItem
          icon={FiGlobe}
          title="Language"
          description="Select your preferred language"
        >
          <select
            value={settings.appearance.language}
            onChange={(e) => handleAppearanceChange('language', e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
          </select>
        </SettingItem>

        <SettingItem
          icon={FiGlobe}
          title="Timezone"
          description="Set your local timezone"
        >
          <select
            value={settings.appearance.timezone}
            onChange={(e) => handleAppearanceChange('timezone', e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          >
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Denver">Mountain Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
          </select>
        </SettingItem>
      </SettingsSection>

      {/* Data Management */}
      <SettingsSection title="Data Management">
        <SettingItem
          icon={FiDownload}
          title="Export Data"
          description="Download a copy of your data"
          action={
            <button
              onClick={handleDataExport}
              disabled={loading}
              className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
            >
              {loading ? 'Exporting...' : 'Export'}
            </button>
          }
        />

        <SettingItem
          icon={FiTrash2}
          title="Delete Account"
          description="Permanently delete your account and all data"
          action={
            <button
              onClick={handleDeleteAccount}
              className="text-red-600 hover:text-red-700 font-medium"
            >
              Delete
            </button>
          }
        />
      </SettingsSection>

      {/* Help & Support */}
      <SettingsSection title="Help & Support">
        <SettingItem
          icon={FiHelpCircle}
          title="Help Center"
          description="Find answers to common questions"
          action={
            <button
              onClick={() => toast.success('Help center coming soon!')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Visit
            </button>
          }
        />

        <SettingItem
          icon={FiMessageCircle}
          title="Contact Support"
          description="Get help from our support team"
          action={
            <button
              onClick={() => toast.success('Support contact coming soon!')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Contact
            </button>
          }
        />
      </SettingsSection>

      {/* Sign Out */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <button
          onClick={signOut}
          className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}

export default Settings
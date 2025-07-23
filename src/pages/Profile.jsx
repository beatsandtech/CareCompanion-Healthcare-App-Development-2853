import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const { 
  FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiEdit3, 
  FiSave, FiX, FiCamera, FiShield, FiActivity, FiClock,
  FiHeart, FiStar, FiAward, FiTrendingUp
} = FiIcons

const ProfileStats = ({ userProfile }) => {
  const [stats, setStats] = useState({
    tasksCompleted: 0,
    medicationsLogged: 0,
    daysActive: 0,
    rating: 0
  })

  useEffect(() => {
    // Mock stats for now - would fetch from database
    setStats({
      tasksCompleted: 156,
      medicationsLogged: 89,
      daysActive: 42,
      rating: 4.8
    })
  }, [])

  const statCards = [
    {
      label: 'Tasks Completed',
      value: stats.tasksCompleted,
      icon: FiActivity,
      color: 'bg-blue-500',
      trend: '+12%'
    },
    {
      label: 'Medications Logged',
      value: stats.medicationsLogged,
      icon: FiHeart,
      color: 'bg-green-500',
      trend: '+8%'
    },
    {
      label: 'Days Active',
      value: stats.daysActive,
      icon: FiClock,
      color: 'bg-purple-500',
      trend: '+5%'
    },
    {
      label: 'Rating',
      value: stats.rating,
      icon: FiStar,
      color: 'bg-yellow-500',
      suffix: '/5'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stat.value}{stat.suffix}
              </p>
              {stat.trend && (
                <div className="flex items-center mt-2">
                  <SafeIcon icon={FiTrendingUp} className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">{stat.trend}</span>
                </div>
              )}
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}>
              <SafeIcon icon={stat.icon} className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

const ProfileForm = ({ userProfile, onUpdate }) => {
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    full_name: userProfile?.full_name || '',
    email: userProfile?.email || '',
    phone: userProfile?.phone || '',
    address: userProfile?.address || '',
    date_of_birth: userProfile?.date_of_birth || '',
    emergency_contact: userProfile?.emergency_contact || '',
    bio: userProfile?.bio || ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const { error } = await supabase
        .from('users')
        .update(formData)
        .eq('id', userProfile.id)

      if (error) throw error

      onUpdate(formData)
      setEditing(false)
      toast.success('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      full_name: userProfile?.full_name || '',
      email: userProfile?.email || '',
      phone: userProfile?.phone || '',
      address: userProfile?.address || '',
      date_of_birth: userProfile?.date_of_birth || '',
      emergency_contact: userProfile?.emergency_contact || '',
      bio: userProfile?.bio || ''
    })
    setEditing(false)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
          >
            <SafeIcon icon={FiEdit3} className="w-4 h-4" />
            <span>Edit</span>
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleCancel}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-700"
            >
              <SafeIcon icon={FiX} className="w-4 h-4" />
              <span>Cancel</span>
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <SafeIcon icon={FiSave} className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Save'}</span>
            </button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <div className="relative">
              <SafeIcon icon={FiUser} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                disabled={!editing}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                placeholder="Enter your full name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <SafeIcon icon={FiMail} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                disabled={!editing}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <SafeIcon icon={FiPhone} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                disabled={!editing}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                placeholder="Enter your phone number"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date of Birth
            </label>
            <div className="relative">
              <SafeIcon icon={FiCalendar} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                disabled={!editing}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address
          </label>
          <div className="relative">
            <SafeIcon icon={FiMapPin} className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              disabled={!editing}
              rows={2}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
              placeholder="Enter your address"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Emergency Contact
          </label>
          <div className="relative">
            <SafeIcon icon={FiShield} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={formData.emergency_contact}
              onChange={(e) => setFormData({...formData, emergency_contact: e.target.value})}
              disabled={!editing}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
              placeholder="Emergency contact name and phone"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bio
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({...formData, bio: e.target.value})}
            disabled={!editing}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
            placeholder="Tell us about yourself..."
          />
        </div>
      </form>
    </div>
  )
}

const Profile = () => {
  const { userProfile, updateProfile } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleProfileUpdate = (updatedData) => {
    updateProfile(updatedData)
  }

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    try {
      setLoading(true)
      
      // Upload to Supabase storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${userProfile.id}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Update user profile
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', userProfile.id)

      if (updateError) throw updateError

      updateProfile({ avatar_url: publicUrl })
      toast.success('Profile picture updated!')
    } catch (error) {
      console.error('Error uploading avatar:', error)
      toast.error('Failed to upload profile picture')
    } finally {
      setLoading(false)
    }
  }

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-8 text-white">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-3xl font-bold">
              {userProfile.avatar_url ? (
                <img 
                  src={userProfile.avatar_url} 
                  alt="Profile" 
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                userProfile.full_name?.charAt(0) || 'U'
              )}
            </div>
            <label className="absolute bottom-0 right-0 bg-white text-gray-600 rounded-full p-2 cursor-pointer hover:bg-gray-100 transition-colors">
              <SafeIcon icon={FiCamera} className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                disabled={loading}
              />
            </label>
          </div>
          
          <div>
            <h1 className="text-3xl font-bold">{userProfile.full_name}</h1>
            <p className="text-blue-100 text-lg capitalize">{userProfile.role}</p>
            <p className="text-blue-100 mt-2">{userProfile.email}</p>
            <div className="flex items-center mt-3">
              <SafeIcon icon={FiAward} className="w-5 h-5 mr-2" />
              <span>Member since {new Date(userProfile.created_at).getFullYear()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <ProfileStats userProfile={userProfile} />

      {/* Profile Form */}
      <ProfileForm 
        userProfile={userProfile} 
        onUpdate={handleProfileUpdate}
      />

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[
            { action: 'Completed morning medication task', time: '2 hours ago', icon: FiHeart },
            { action: 'Updated patient notes', time: '4 hours ago', icon: FiEdit3 },
            { action: 'Sent message to family', time: '6 hours ago', icon: FiMail },
            { action: 'Logged vital signs', time: '1 day ago', icon: FiActivity }
          ].map((activity, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <SafeIcon icon={activity.icon} className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Profile
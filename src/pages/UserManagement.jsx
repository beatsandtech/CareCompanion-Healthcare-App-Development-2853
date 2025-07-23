import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const {
  FiUsers,
  FiUserPlus,
  FiUserCheck,
  FiUserX,
  FiUser,
  FiSearch,
  FiFilter,
  FiEdit,
  FiTrash2,
  FiLock,
  FiUnlock,
  FiMail,
  FiPhone,
  FiSave,
  FiX,
  FiChevronDown,
  FiCheck,
  FiAlertTriangle,
  FiEye,
  FiEyeOff,
  FiRefreshCw,
  FiShield
} = FiIcons

// User role badge component
const RoleBadge = ({ role }) => {
  const getBadgeColor = () => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'caregiver':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'family':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getIcon = () => {
    switch (role) {
      case 'admin':
        return FiShield
      case 'caregiver':
        return FiUserCheck
      case 'family':
        return FiUsers
      default:
        return FiUser
    }
  }

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getBadgeColor()} flex items-center space-x-1 capitalize`}>
      <SafeIcon icon={getIcon()} className="w-3 h-3" />
      <span>{role}</span>
    </span>
  )
}

// User status badge component
const StatusBadge = ({ isActive }) => {
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center space-x-1
      ${isActive 
        ? 'bg-green-100 text-green-800 border-green-200' 
        : 'bg-gray-100 text-gray-500 border-gray-200'}`}
    >
      <SafeIcon icon={isActive ? FiCheck : FiX} className="w-3 h-3" />
      <span>{isActive ? 'Active' : 'Inactive'}</span>
    </span>
  )
}

// User edit modal component
const UserEditModal = ({ user, onClose, onSave, isNew = false }) => {
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    role: 'caregiver',
    phone: '',
    is_active: true,
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        full_name: user.full_name || '',
        role: user.role || 'caregiver',
        phone: user.phone || '',
        is_active: user.is_active !== false, // default to true
        password: '' // always empty for existing users
      })
    }
  }, [user])

  const validate = () => {
    const newErrors = {}
    if (!formData.email) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid'
    
    if (!formData.full_name) newErrors.full_name = 'Full name is required'
    
    if (isNew && !formData.password) newErrors.password = 'Password is required'
    else if (isNew && formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validate()) return
    
    try {
      setLoading(true)
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error('Error saving user:', error)
      toast.error('Failed to save user')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {isNew ? 'Create New User' : 'Edit User'}
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <SafeIcon icon={FiX} className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <SafeIcon icon={FiMail} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isNew}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg ${
                      errors.email 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    } ${!isNew ? 'bg-gray-100' : ''}`}
                    placeholder="user@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
              
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg ${
                    errors.full_name 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  placeholder="John Doe"
                />
                {errors.full_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>
                )}
              </div>
              
              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <div className="relative">
                  <SafeIcon icon={FiUsers} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 appearance-none"
                  >
                    <option value="caregiver">Caregiver</option>
                    <option value="family">Family Member</option>
                    <option value="admin">Administrator</option>
                  </select>
                  <SafeIcon 
                    icon={FiChevronDown} 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" 
                  />
                </div>
              </div>
              
              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <SafeIcon icon={FiPhone} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
              
              {/* Password (only for new users) */}
              {isNew && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <SafeIcon icon={FiLock} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-10 py-2 border rounded-lg ${
                        errors.password 
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                      placeholder="Minimum 6 characters"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <SafeIcon icon={showPassword ? FiEyeOff : FiEye} className="w-5 h-5" />
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>
              )}
              
              {/* Active Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_active"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                  Active Account
                </label>
              </div>
            </div>
            
            <div className="mt-6 flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex justify-center items-center"
              >
                {loading ? (
                  <span className="w-5 h-5 border-b-2 border-white rounded-full animate-spin"></span>
                ) : (
                  <>
                    <SafeIcon icon={FiSave} className="w-4 h-4 mr-2" />
                    <span>{isNew ? 'Create User' : 'Save Changes'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

// Delete confirmation modal
const DeleteConfirmationModal = ({ user, onClose, onConfirm }) => {
  const [loading, setLoading] = useState(false)
  
  const handleDelete = async () => {
    try {
      setLoading(true)
      await onConfirm(user.id)
      onClose()
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Failed to delete user')
      setLoading(false)
    }
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-auto"
      >
        <div className="p-6">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mr-4">
              <SafeIcon icon={FiAlertTriangle} className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Confirm Deletion</h3>
              <p className="text-gray-500">
                Are you sure you want to delete the user: <span className="font-semibold">{user?.full_name}</span>?
              </p>
            </div>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <SafeIcon icon={FiAlertTriangle} className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-red-800">Warning</h4>
                <p className="text-sm text-red-700 mt-1">
                  This action cannot be undone. This will permanently delete the user account
                  and remove all associated data.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex justify-center items-center"
            >
              {loading ? (
                <span className="w-5 h-5 border-b-2 border-white rounded-full animate-spin"></span>
              ) : (
                <>
                  <SafeIcon icon={FiTrash2} className="w-4 h-4 mr-2" />
                  <span>Delete User</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// Reset password modal
const ResetPasswordModal = ({ user, onClose, onReset }) => {
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const handleReset = async (e) => {
    e.preventDefault()
    
    if (!newPassword) {
      setError('Password is required')
      return
    }
    
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    
    try {
      setLoading(true)
      await onReset(user.id, newPassword)
      onClose()
      toast.success('Password reset successfully')
    } catch (error) {
      console.error('Error resetting password:', error)
      toast.error('Failed to reset password')
      setLoading(false)
    }
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Reset Password</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <SafeIcon icon={FiX} className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleReset}>
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Set a new password for <span className="font-medium">{user?.full_name}</span> ({user?.email}).
              </p>
              
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <SafeIcon icon={FiLock} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value)
                    setError('')
                  }}
                  className={`w-full pl-10 pr-10 py-2 border rounded-lg ${
                    error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  placeholder="Minimum 6 characters"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <SafeIcon icon={showPassword ? FiEyeOff : FiEye} className="w-5 h-5" />
                </button>
              </div>
              {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex justify-center items-center"
              >
                {loading ? (
                  <span className="w-5 h-5 border-b-2 border-white rounded-full animate-spin"></span>
                ) : (
                  <>
                    <SafeIcon icon={FiLock} className="w-4 h-4 mr-2" />
                    <span>Reset Password</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

// Main component
const UserManagement = () => {
  const { userProfile } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false)
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false)
  
  useEffect(() => {
    fetchUsers()
  }, [])
  
  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('full_name')
      
      if (error) throw error
      
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      setError('Failed to load users. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  const handleCreateUser = async (userData) => {
    try {
      // First, create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true
      })
      
      if (authError) {
        // If the admin API doesn't work, try the regular signup
        const { data: signupData, error: signupError } = await supabase.auth.signUp({
          email: userData.email,
          password: userData.password,
          options: {
            emailRedirectTo: window.location.origin
          }
        })
        
        if (signupError) throw signupError
        
        // Use the user from signup
        const newUser = signupData.user
        
        // Insert the user profile
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: newUser.id,
            email: userData.email,
            full_name: userData.full_name,
            role: userData.role,
            phone: userData.phone,
            is_active: userData.is_active
          })
        
        if (profileError) throw profileError
      } else {
        // Admin API worked, use that user
        const newUser = authData.user
        
        // Insert the user profile
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: newUser.id,
            email: userData.email,
            full_name: userData.full_name,
            role: userData.role,
            phone: userData.phone,
            is_active: userData.is_active
          })
        
        if (profileError) throw profileError
      }
      
      toast.success('User created successfully!')
      fetchUsers()
    } catch (error) {
      console.error('Error creating user:', error)
      toast.error(error.message || 'Failed to create user')
      throw error
    }
  }
  
  const handleUpdateUser = async (userData) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: userData.full_name,
          role: userData.role,
          phone: userData.phone,
          is_active: userData.is_active
        })
        .eq('id', selectedUser.id)
      
      if (error) throw error
      
      toast.success('User updated successfully')
      fetchUsers()
    } catch (error) {
      console.error('Error updating user:', error)
      toast.error('Failed to update user')
      throw error
    }
  }
  
  const handleDeleteUser = async (userId) => {
    try {
      // Delete from users table first (due to foreign key constraints)
      const { error: deleteUserError } = await supabase
        .from('users')
        .delete()
        .eq('id', userId)
      
      if (deleteUserError) throw deleteUserError
      
      // Try to delete from auth.users (may require admin privileges)
      const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(userId)
      
      if (deleteAuthError) {
        console.warn('Could not delete auth user (might require admin privileges):', deleteAuthError)
      }
      
      toast.success('User deleted successfully')
      fetchUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Failed to delete user')
      throw error
    }
  }
  
  const handleResetPassword = async (userId, newPassword) => {
    try {
      // Try using admin API
      const { error } = await supabase.auth.admin.updateUserById(
        userId,
        { password: newPassword }
      )
      
      if (error) {
        // If admin API fails, try user update (limited permissions)
        const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
        if (updateError) throw updateError
      }
      
      toast.success('Password reset successfully')
    } catch (error) {
      console.error('Error resetting password:', error)
      toast.error('Failed to reset password - may require admin privileges')
      throw error
    }
  }
  
  const handleToggleUserStatus = async (user) => {
    try {
      const newStatus = !user.is_active
      
      const { error } = await supabase
        .from('users')
        .update({ is_active: newStatus })
        .eq('id', user.id)
      
      if (error) throw error
      
      toast.success(`User ${newStatus ? 'activated' : 'deactivated'} successfully`)
      fetchUsers()
    } catch (error) {
      console.error('Error toggling user status:', error)
      toast.error('Failed to update user status')
    }
  }
  
  const filteredUsers = users.filter(user => {
    // Skip filtering current user (admin)
    if (user.id === userProfile?.id) return true
    
    // Apply search filter
    const matchesSearch = !searchTerm || 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm)
    
    // Apply role filter
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    
    // Apply status filter
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && user.is_active) || 
      (statusFilter === 'inactive' && !user.is_active)
    
    return matchesSearch && matchesRole && matchesStatus
  })
  
  const handleSaveUser = (userData) => {
    if (isNewUserModalOpen) {
      return handleCreateUser(userData)
    } else {
      return handleUpdateUser(userData)
    }
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <SafeIcon icon={FiAlertTriangle} className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Users</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={fetchUsers} 
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center space-x-2 mx-auto"
        >
          <SafeIcon icon={FiRefreshCw} className="w-5 h-5" />
          <span>Try Again</span>
        </button>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">
            Manage user accounts and permissions
          </p>
        </div>
        <button 
          onClick={() => setIsNewUserModalOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
        >
          <SafeIcon icon={FiUserPlus} className="w-5 h-5" />
          <span>Add User</span>
        </button>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
        {/* Search */}
        <div className="relative flex-grow">
          <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        {/* Role Filter */}
        <div className="flex items-center space-x-2">
          <SafeIcon icon={FiFilter} className="w-5 h-5 text-gray-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-gray-300 rounded-lg py-2 pl-3 pr-10 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Roles</option>
            <option value="admin">Administrators</option>
            <option value="caregiver">Caregivers</option>
            <option value="family">Family Members</option>
          </select>
        </div>
        
        {/* Status Filter */}
        <div className="flex items-center space-x-2">
          <SafeIcon icon={FiFilter} className="w-5 h-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg py-2 pl-3 pr-10 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
      
      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4">
                    <div className="text-center">
                      <SafeIcon icon={FiUsers} className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No users found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <motion.tr 
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={user.id === userProfile?.id ? 'bg-blue-50' : ''}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {user.full_name?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.full_name}
                            {user.id === userProfile?.id && (
                              <span className="ml-2 text-xs font-normal text-blue-600">(You)</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.phone || 'Not provided'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge isActive={user.is_active} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {user.id !== userProfile?.id ? (
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user)
                              setIsEditModalOpen(true)
                            }}
                            className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg"
                            title="Edit User"
                          >
                            <SafeIcon icon={FiEdit} className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(user)
                              setIsResetPasswordModalOpen(true)
                            }}
                            className="text-yellow-600 hover:text-yellow-900 p-2 hover:bg-yellow-50 rounded-lg"
                            title="Reset Password"
                          >
                            <SafeIcon icon={FiLock} className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleUserStatus(user)}
                            className={`${
                              user.is_active 
                                ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-50' 
                                : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                            } p-2 rounded-lg`}
                            title={user.is_active ? 'Deactivate User' : 'Activate User'}
                          >
                            <SafeIcon icon={user.is_active ? FiUserX : FiUserCheck} className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(user)
                              setIsDeleteModalOpen(true)
                            }}
                            className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg"
                            title="Delete User"
                          >
                            <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic text-xs">Current User</span>
                      )}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Summary */}
      <div className="flex flex-wrap gap-4">
        <div className="bg-white rounded-lg shadow px-6 py-4 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <SafeIcon icon={FiUsers} className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Total Users</div>
            <div className="text-2xl font-semibold text-gray-900">{users.length}</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow px-6 py-4 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <SafeIcon icon={FiUserCheck} className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Active Users</div>
            <div className="text-2xl font-semibold text-gray-900">
              {users.filter(u => u.is_active).length}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow px-6 py-4 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
            <SafeIcon icon={FiShield} className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Admins</div>
            <div className="text-2xl font-semibold text-gray-900">
              {users.filter(u => u.role === 'admin').length}
            </div>
          </div>
        </div>
      </div>
      
      {/* Modals */}
      {isEditModalOpen && selectedUser && (
        <UserEditModal
          user={selectedUser}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveUser}
        />
      )}
      
      {isNewUserModalOpen && (
        <UserEditModal
          user={null}
          onClose={() => setIsNewUserModalOpen(false)}
          onSave={handleSaveUser}
          isNew={true}
        />
      )}
      
      {isDeleteModalOpen && selectedUser && (
        <DeleteConfirmationModal
          user={selectedUser}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteUser}
        />
      )}
      
      {isResetPasswordModalOpen && selectedUser && (
        <ResetPasswordModal
          user={selectedUser}
          onClose={() => setIsResetPasswordModalOpen(false)}
          onReset={handleResetPassword}
        />
      )}
    </div>
  )
}

export default UserManagement
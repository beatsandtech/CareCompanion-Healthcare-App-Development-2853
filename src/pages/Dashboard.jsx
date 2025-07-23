import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { format, isToday, isTomorrow } from 'date-fns'

const { 
  FiCalendar, FiPill, FiCheckSquare, FiAlertTriangle, 
  FiClock, FiTrendingUp, FiUsers, FiActivity 
} = FiIcons

const Dashboard = () => {
  const { userProfile } = useAuth()
  const [stats, setStats] = useState({
    todayTasks: 0,
    completedTasks: 0,
    pendingMeds: 0,
    totalPatients: 0
  })
  const [upcomingTasks, setUpcomingTasks] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch today's tasks
      const today = new Date().toISOString().split('T')[0]
      const { data: tasks } = await supabase
        .from('tasks')
        .select('*, patients(full_name)')
        .gte('scheduled_date', today)
        .lte('scheduled_date', today + 'T23:59:59')

      // Fetch upcoming medications
      const { data: meds } = await supabase
        .from('medications')
        .select('*, patients(full_name)')
        .eq('is_active', true)

      // Fetch patients (if caregiver/admin)
      const { data: patients } = await supabase
        .from('patients')
        .select('id, full_name, status')

      // Calculate stats
      const completedToday = tasks?.filter(t => t.status === 'completed').length || 0
      const pendingMeds = meds?.filter(m => {
        const nextDose = new Date(m.next_dose_time)
        return nextDose <= new Date() && nextDose > new Date(Date.now() - 24 * 60 * 60 * 1000)
      }).length || 0

      setStats({
        todayTasks: tasks?.length || 0,
        completedTasks: completedToday,
        pendingMeds,
        totalPatients: patients?.length || 0
      })

      // Set upcoming tasks
      const upcoming = tasks?.slice(0, 5) || []
      setUpcomingTasks(upcoming)

      // Mock recent activity
      setRecentActivity([
        { id: 1, action: 'Completed morning medication for John Doe', time: '10 minutes ago', type: 'medication' },
        { id: 2, action: 'Added vital signs check', time: '25 minutes ago', type: 'task' },
        { id: 3, action: 'New message from Sarah (Family)', time: '1 hour ago', type: 'message' },
        { id: 4, action: 'Completed safety checklist', time: '2 hours ago', type: 'checklist' }
      ])

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ title, value, icon, color, trend }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && (
            <div className="flex items-center mt-2">
              <SafeIcon icon={FiTrendingUp} className="w-4 h-4 text-success-500 mr-1" />
              <span className="text-sm text-success-600">{trend}</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
          <SafeIcon icon={icon} className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {userProfile?.full_name}
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening with your patients today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Today's Tasks"
          value={stats.todayTasks}
          icon={FiCalendar}
          color="bg-primary-500"
          trend="+12% from yesterday"
        />
        <StatCard
          title="Completed Tasks"
          value={stats.completedTasks}
          icon={FiCheckSquare}
          color="bg-success-500"
        />
        <StatCard
          title="Pending Medications"
          value={stats.pendingMeds}
          icon={FiPill}
          color="bg-warning-500"
        />
        <StatCard
          title="Active Patients"
          value={stats.totalPatients}
          icon={FiUsers}
          color="bg-purple-500"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Tasks */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Tasks</h3>
            <SafeIcon icon={FiClock} className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {upcomingTasks.length > 0 ? (
              upcomingTasks.map((task) => (
                <div key={task.id} className="flex items-center space-x-4 p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <SafeIcon icon={FiActivity} className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{task.title}</p>
                    <p className="text-sm text-gray-500">
                      {task.patients?.full_name} • {format(new Date(task.scheduled_date), 'h:mm a')}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    task.priority === 'high' ? 'bg-danger-100 text-danger-700' :
                    task.priority === 'medium' ? 'bg-warning-100 text-warning-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <SafeIcon icon={FiCheckSquare} className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No upcoming tasks</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <SafeIcon icon={FiActivity} className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  activity.type === 'medication' ? 'bg-primary-100' :
                  activity.type === 'task' ? 'bg-success-100' :
                  activity.type === 'message' ? 'bg-blue-100' :
                  'bg-gray-100'
                }`}>
                  <SafeIcon 
                    icon={
                      activity.type === 'medication' ? FiPill :
                      activity.type === 'task' ? FiCheckSquare :
                      activity.type === 'message' ? FiUsers :
                      FiActivity
                    } 
                    className={`w-4 h-4 ${
                      activity.type === 'medication' ? 'text-primary-600' :
                      activity.type === 'task' ? 'text-success-600' :
                      activity.type === 'message' ? 'text-blue-600' :
                      'text-gray-600'
                    }`} 
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Add Task', icon: FiCalendar, color: 'bg-primary-500' },
            { label: 'Log Medication', icon: FiPill, color: 'bg-success-500' },
            { label: 'Safety Check', icon: FiCheckSquare, color: 'bg-warning-500' },
            { label: 'Add Note', icon: FiActivity, color: 'bg-purple-500' }
          ].map((action) => (
            <button
              key={action.label}
              className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${action.color} mb-3`}>
                <SafeIcon icon={action.icon} className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-900">{action.label}</span>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default Dashboard
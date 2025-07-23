import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'
import { format, addDays, startOfWeek, isSameDay } from 'date-fns'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const { FiCalendar, FiPlus, FiClock, FiUser, FiCheck, FiX } = FiIcons

const TaskItem = ({ task, onComplete, onEdit }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'task',
    item: { id: task.id, type: 'task' },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-danger-100 text-danger-700 border-danger-200'
      case 'medium': return 'bg-warning-100 text-warning-700 border-warning-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-success-100 text-success-700'
      case 'in_progress': return 'bg-blue-100 text-blue-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <motion.div
      ref={drag}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-3 rounded-lg border cursor-move ${
        isDragging ? 'opacity-50' : ''
      } ${getPriorityColor(task.priority)} hover:shadow-sm transition-all`}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-sm">{task.title}</h4>
        <div className="flex space-x-1">
          <button
            onClick={() => onComplete(task.id)}
            className="p-1 hover:bg-white rounded"
            disabled={task.status === 'completed'}
          >
            <SafeIcon 
              icon={FiCheck} 
              className={`w-4 h-4 ${task.status === 'completed' ? 'text-success-500' : 'text-gray-400'}`} 
            />
          </button>
        </div>
      </div>
      
      <div className="space-y-1 text-xs">
        <div className="flex items-center space-x-2">
          <SafeIcon icon={FiUser} className="w-3 h-3" />
          <span>{task.patient_name}</span>
        </div>
        <div className="flex items-center space-x-2">
          <SafeIcon icon={FiClock} className="w-3 h-3" />
          <span>{format(new Date(task.scheduled_time), 'h:mm a')}</span>
        </div>
        <div className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusColor(task.status)}`}>
          {task.status.replace('_', ' ')}
        </div>
      </div>
    </motion.div>
  )
}

const DayColumn = ({ date, tasks, onTaskDrop, onAddTask }) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'task',
    drop: (item) => onTaskDrop(item.id, date),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  })

  const dayTasks = tasks.filter(task => 
    isSameDay(new Date(task.scheduled_date), date)
  )

  const isToday = isSameDay(date, new Date())

  return (
    <div
      ref={drop}
      className={`min-h-96 p-4 rounded-lg border-2 border-dashed transition-colors ${
        isOver ? 'border-primary-300 bg-primary-50' : 'border-gray-200'
      } ${isToday ? 'bg-blue-50' : 'bg-white'}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className={`font-semibold ${isToday ? 'text-primary-700' : 'text-gray-900'}`}>
            {format(date, 'EEE')}
          </h3>
          <p className={`text-sm ${isToday ? 'text-primary-600' : 'text-gray-500'}`}>
            {format(date, 'MMM d')}
          </p>
        </div>
        <button
          onClick={() => onAddTask(date)}
          className="p-2 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
        >
          <SafeIcon icon={FiPlus} className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        {dayTasks.map(task => (
          <TaskItem
            key={task.id}
            task={task}
            onComplete={(id) => console.log('Complete task:', id)}
            onEdit={(task) => console.log('Edit task:', task)}
          />
        ))}
        
        {dayTasks.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <SafeIcon icon={FiCalendar} className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">No tasks scheduled</p>
          </div>
        )}
      </div>
    </div>
  )
}

const Schedule = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)

  useEffect(() => {
    fetchTasks()
  }, [currentWeek])

  const fetchTasks = async () => {
    try {
      const weekStart = startOfWeek(currentWeek)
      const weekEnd = addDays(weekStart, 6)

      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          patients!inner(full_name)
        `)
        .gte('scheduled_date', weekStart.toISOString().split('T')[0])
        .lte('scheduled_date', weekEnd.toISOString().split('T')[0])
        .order('scheduled_time')

      if (error) throw error

      const formattedTasks = data.map(task => ({
        ...task,
        patient_name: task.patients.full_name,
        scheduled_time: task.scheduled_time || '09:00:00'
      }))

      setTasks(formattedTasks)
    } catch (error) {
      console.error('Error fetching tasks:', error)
      toast.error('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  const handleTaskDrop = async (taskId, newDate) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          scheduled_date: format(newDate, 'yyyy-MM-dd')
        })
        .eq('id', taskId)

      if (error) throw error

      toast.success('Task moved successfully')
      fetchTasks()
    } catch (error) {
      console.error('Error moving task:', error)
      toast.error('Failed to move task')
    }
  }

  const handleAddTask = (date) => {
    setSelectedDate(date)
    setShowTaskModal(true)
  }

  const getWeekDays = () => {
    const start = startOfWeek(currentWeek)
    return Array.from({ length: 7 }, (_, i) => addDays(start, i))
  }

  const navigateWeek = (direction) => {
    setCurrentWeek(prev => addDays(prev, direction * 7))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Schedule</h1>
            <p className="text-gray-600 mt-1">
              Drag and drop tasks to reschedule
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateWeek(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <SafeIcon icon={FiX} className="w-5 h-5 transform rotate-45" />
              </button>
              <span className="font-medium text-gray-900 min-w-max">
                {format(getWeekDays()[0], 'MMM d')} - {format(getWeekDays()[6], 'MMM d, yyyy')}
              </span>
              <button
                onClick={() => navigateWeek(1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <SafeIcon icon={FiPlus} className="w-5 h-5" />
              </button>
            </div>
            
            <button
              onClick={() => setShowTaskModal(true)}
              className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2"
            >
              <SafeIcon icon={FiPlus} className="w-5 h-5" />
              <span>Add Task</span>
            </button>
          </div>
        </div>

        {/* Week View */}
        <div className="grid grid-cols-7 gap-4">
          {getWeekDays().map(day => (
            <DayColumn
              key={day.toISOString()}
              date={day}
              tasks={tasks}
              onTaskDrop={handleTaskDrop}
              onAddTask={handleAddTask}
            />
          ))}
        </div>

        {/* Task Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
              </div>
              <SafeIcon icon={FiCalendar} className="w-8 h-8 text-primary-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-success-600">
                  {tasks.filter(t => t.status === 'completed').length}
                </p>
              </div>
              <SafeIcon icon={FiCheck} className="w-8 h-8 text-success-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-warning-600">
                  {tasks.filter(t => t.status === 'pending').length}
                </p>
              </div>
              <SafeIcon icon={FiClock} className="w-8 h-8 text-warning-500" />
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  )
}

export default Schedule
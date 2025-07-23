import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'
import { supabase } from '../lib/supabase'
import { format, addHours, isAfter, isBefore } from 'date-fns'
import toast from 'react-hot-toast'

const { 
  FiPill, FiPlus, FiClock, FiUser, FiCheck, 
  FiX, FiAlertTriangle, FiEdit, FiTrash2, FiEye 
} = FiIcons

const MedicationCard = ({ medication, onLog, onEdit, onDelete }) => {
  const [showDetails, setShowDetails] = useState(false)
  const nextDose = new Date(medication.next_dose_time)
  const isOverdue = isAfter(new Date(), nextDose)
  const isDueSoon = isBefore(new Date(), addHours(nextDose, 1)) && isAfter(new Date(), nextDose)

  const getStatusColor = () => {
    if (isOverdue) return 'border-danger-200 bg-danger-50'
    if (isDueSoon) return 'border-warning-200 bg-warning-50'
    return 'border-gray-200 bg-white'
  }

  const handleLogMedication = async (status) => {
    try {
      await onLog(medication.id, status)
      toast.success(`Medication ${status}`)
    } catch (error) {
      toast.error('Failed to log medication')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-lg border p-4 ${getStatusColor()} hover:shadow-md transition-all`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="font-semibold text-gray-900">{medication.name}</h3>
            {isOverdue && (
              <SafeIcon icon={FiAlertTriangle} className="w-4 h-4 text-danger-500" />
            )}
          </div>
          <p className="text-sm text-gray-600">{medication.dosage} • {medication.frequency}</p>
          <div className="flex items-center space-x-2 mt-1">
            <SafeIcon icon={FiUser} className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">{medication.patient_name}</span>
          </div>
        </div>
        
        <div className="flex space-x-1">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <SafeIcon icon={FiEye} className="w-4 h-4 text-gray-400" />
          </button>
          <button
            onClick={() => onEdit(medication)}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <SafeIcon icon={FiEdit} className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Next Dose Info */}
      <div className={`flex items-center space-x-2 text-sm mb-4 ${
        isOverdue ? 'text-danger-600' : isDueSoon ? 'text-warning-600' : 'text-gray-600'
      }`}>
        <SafeIcon icon={FiClock} className="w-4 h-4" />
        <span>
          Next dose: {format(nextDose, 'MMM d, h:mm a')}
          {isOverdue && ' (Overdue)'}
          {isDueSoon && ' (Due soon)'}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2">
        <button
          onClick={() => handleLogMedication('taken')}
          className="flex-1 bg-success-500 text-white px-3 py-2 rounded-lg hover:bg-success-600 transition-colors flex items-center justify-center space-x-1"
        >
          <SafeIcon icon={FiCheck} className="w-4 h-4" />
          <span>Taken</span>
        </button>
        <button
          onClick={() => handleLogMedication('missed')}
          className="flex-1 bg-danger-500 text-white px-3 py-2 rounded-lg hover:bg-danger-600 transition-colors flex items-center justify-center space-x-1"
        >
          <SafeIcon icon={FiX} className="w-4 h-4" />
          <span>Missed</span>
        </button>
        <button
          onClick={() => handleLogMedication('snooze')}
          className="bg-warning-500 text-white px-3 py-2 rounded-lg hover:bg-warning-600 transition-colors"
        >
          <SafeIcon icon={FiClock} className="w-4 h-4" />
        </button>
      </div>

      {/* Expanded Details */}
      {showDetails && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 pt-4 border-t border-gray-200"
        >
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Instructions:</span>
              <span className="text-gray-900">{medication.instructions || 'Take with food'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Prescriber:</span>
              <span className="text-gray-900">{medication.prescriber || 'Dr. Smith'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Started:</span>
              <span className="text-gray-900">{format(new Date(medication.start_date), 'MMM d, yyyy')}</span>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

const Medications = () => {
  const [medications, setMedications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, due, overdue
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    fetchMedications()
  }, [])

  const fetchMedications = async () => {
    try {
      const { data, error } = await supabase
        .from('medications')
        .select(`
          *,
          patients!inner(full_name)
        `)
        .eq('is_active', true)
        .order('next_dose_time')

      if (error) throw error

      const formattedMeds = data.map(med => ({
        ...med,
        patient_name: med.patients.full_name
      }))

      setMedications(formattedMeds)
    } catch (error) {
      console.error('Error fetching medications:', error)
      toast.error('Failed to load medications')
    } finally {
      setLoading(false)
    }
  }

  const handleLogMedication = async (medicationId, status) => {
    try {
      // Log the medication
      const { error: logError } = await supabase
        .from('medication_logs')
        .insert({
          medication_id: medicationId,
          status,
          logged_at: new Date().toISOString(),
          logged_by: (await supabase.auth.getUser()).data.user.id
        })

      if (logError) throw logError

      // Update next dose time if taken
      if (status === 'taken') {
        const medication = medications.find(m => m.id === medicationId)
        const nextDose = addHours(new Date(), getHoursUntilNextDose(medication.frequency))
        
        const { error: updateError } = await supabase
          .from('medications')
          .update({ next_dose_time: nextDose.toISOString() })
          .eq('id', medicationId)

        if (updateError) throw updateError
      }

      fetchMedications()
    } catch (error) {
      console.error('Error logging medication:', error)
      throw error
    }
  }

  const getHoursUntilNextDose = (frequency) => {
    switch (frequency.toLowerCase()) {
      case 'once daily': return 24
      case 'twice daily': return 12
      case 'three times daily': return 8
      case 'four times daily': return 6
      default: return 24
    }
  }

  const getFilteredMedications = () => {
    const now = new Date()
    
    switch (filter) {
      case 'due':
        return medications.filter(med => {
          const nextDose = new Date(med.next_dose_time)
          return isBefore(nextDose, addHours(now, 1)) && isAfter(nextDose, now)
        })
      case 'overdue':
        return medications.filter(med => 
          isAfter(now, new Date(med.next_dose_time))
        )
      default:
        return medications
    }
  }

  const filteredMedications = getFilteredMedications()
  const overdueCount = medications.filter(med => 
    isAfter(new Date(), new Date(med.next_dose_time))
  ).length
  const dueCount = medications.filter(med => {
    const nextDose = new Date(med.next_dose_time)
    const now = new Date()
    return isBefore(nextDose, addHours(now, 1)) && isAfter(nextDose, now)
  }).length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Medications</h1>
          <p className="text-gray-600 mt-1">
            Manage and track medication schedules
          </p>
        </div>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2"
        >
          <SafeIcon icon={FiPlus} className="w-5 h-5" />
          <span>Add Medication</span>
        </button>
      </div>

      {/* Alert Summary */}
      {(overdueCount > 0 || dueCount > 0) && (
        <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <SafeIcon icon={FiAlertTriangle} className="w-5 h-5 text-warning-600" />
            <div>
              <p className="font-medium text-warning-800">Medication Alerts</p>
              <p className="text-sm text-warning-700">
                {overdueCount > 0 && `${overdueCount} overdue medication${overdueCount > 1 ? 's' : ''}`}
                {overdueCount > 0 && dueCount > 0 && ', '}
                {dueCount > 0 && `${dueCount} medication${dueCount > 1 ? 's' : ''} due soon`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        {[
          { key: 'all', label: 'All Medications', count: medications.length },
          { key: 'due', label: 'Due Soon', count: dueCount },
          { key: 'overdue', label: 'Overdue', count: overdueCount }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Medications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMedications.map(medication => (
          <MedicationCard
            key={medication.id}
            medication={medication}
            onLog={handleLogMedication}
            onEdit={(med) => console.log('Edit medication:', med)}
            onDelete={(id) => console.log('Delete medication:', id)}
          />
        ))}
      </div>

      {filteredMedications.length === 0 && (
        <div className="text-center py-12">
          <SafeIcon icon={FiPill} className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filter === 'all' ? 'No medications found' : `No ${filter} medications`}
          </h3>
          <p className="text-gray-500">
            {filter === 'all' 
              ? 'Add medications to start tracking schedules and doses'
              : 'All medications are on schedule'
            }
          </p>
        </div>
      )}
    </div>
  )
}

export default Medications
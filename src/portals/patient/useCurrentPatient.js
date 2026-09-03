import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { patients as defaultPatients } from '../../data/patients'
import { api } from '../../lib/api'

export function useCurrentPatient() {
  const { user } = useAuth()

  const [patient, setPatient] = useState(() => {
    // 1. Check if user matches any predefined patient in data
    const matched = defaultPatients.find((p) => p.id === user?.entityId || p.id === user?.id)
    if (matched) return matched

    // 2. Otherwise build dynamic patient model from active user session
    return {
      id: user?.entityId || user?.id || 'MK-8472-9812-3345',
      name: user?.name || 'Rahul Kumar',
      age: user?.details?.age || 32,
      gender: user?.details?.gender || 'Male',
      phone: user?.phone || '9876543210',
      dob: user?.details?.dob || '1993-03-15',
      bloodGroup: user?.details?.bloodGroup || 'O+',
      address: user?.details?.address || 'Sector 21, Lucknow, UP',
      photo: null,
      conditions: user?.details?.conditions || ['Hypertension', 'Mild Asthma'],
      medications: user?.details?.medications || ['Amlodipine 5mg', 'Salbutamol Inhaler'],
      allergies: user?.details?.allergies || ['Penicillin'],
      lastVisit: 'Today',
      redFlag: user?.details?.redFlag || { active: false, label: '' },
      consent: 'Authorised',
      emergencyContact: user?.details?.emergencyContact || {
        name: 'Sunita Kumar (Spouse)',
        phone: '9876543299'
      },
      vitals: user?.details?.vitals || {
        bp: '120/80',
        pulse: 74,
        spo2: 98,
        temp: '98.6°F',
        weight: '70 kg',
        height: "5'8\""
      },
      timeline: user?.details?.timeline || [
        { date: 'Today', type: 'Registration', hospital: 'National Health Authority', summary: 'Global Patient ID activated' }
      ],
      documents: user?.details?.documents || [
        { id: 1, name: 'ECG Report', date: '28 Aug 2026', type: 'ECG', status: 'processed' },
        { id: 2, name: 'Complete Blood Count', date: '25 Apr 2026', type: 'Lab', status: 'processed' }
      ]
    }
  })

  // Synchronize with backend API if online
  useEffect(() => {
    let isMounted = true

    async function fetchLivePatientData() {
      try {
        const res = await api.patient.getMe()
        if (res?.patient && isMounted) {
          setPatient((prev) => ({
            ...prev,
            ...res.patient
          }))
        }
      } catch {
        // Silent fallback to local user data
      }
    }

    if (user?.role === 'patient') {
      fetchLivePatientData()
    }

    return () => {
      isMounted = false
    }
  }, [user])

  const addDocument = (newDoc) => {
    setPatient((prev) => ({
      ...prev,
      documents: [newDoc, ...(prev.documents || [])]
    }))
  }

  const updateProfile = (updatedFields) => {
    setPatient((prev) => ({
      ...prev,
      ...updatedFields
    }))
  }

  const updateVitals = (newVitals) => {
    setPatient((prev) => ({
      ...prev,
      vitals: {
        ...prev.vitals,
        ...newVitals
      }
    }))
  }

  return {
    patient,
    addDocument,
    updateProfile,
    updateVitals
  }
}

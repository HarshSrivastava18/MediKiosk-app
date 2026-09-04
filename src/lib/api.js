const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001/api'

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('medikiosk_auth_token') || ''

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const errorMsg = data.detail || data.error || (typeof data === 'string' ? data : `Request failed with status ${response.status}`)
    throw new Error(errorMsg)
  }

  return data
}

export const api = {
  auth: {
    login: (role, identifier, password) =>
      apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ role, identifier, password })
      }),
    me: () => apiRequest('/auth/me'),
    registerPatient: (patientData) =>
      apiRequest('/auth/register-patient', {
        method: 'POST',
        body: JSON.stringify(patientData)
      })
  },
  patient: {
    getMe: () => apiRequest('/patient/me'),
    getById: (patientId) => apiRequest(`/patients/${patientId}`),
    getAll: () => apiRequest('/patients'),
    getTimeline: (patientId) =>
      apiRequest(`/patient/timeline${patientId ? `?patientId=${patientId}` : ''}`),
    getPrescriptions: (patientId) =>
      apiRequest(`/patient/prescriptions${patientId ? `?patientId=${patientId}` : ''}`),
    getDocuments: (patientId) =>
      apiRequest(`/patient/documents${patientId ? `?patientId=${patientId}` : ''}`),
    uploadDocument: (docData) =>
      apiRequest('/patient/documents', {
        method: 'POST',
        body: JSON.stringify(docData)
      })
  },
  doctor: {
    getDashboard: () => apiRequest('/doctor/dashboard'),
    getPatientCase: (id) => apiRequest(`/doctor/patient/${id}`),
    createPrescription: (rxData) =>
      apiRequest('/doctor/prescriptions', {
        method: 'POST',
        body: JSON.stringify(rxData)
      }),
    createReferral: (refData) =>
      apiRequest('/doctor/referrals', {
        method: 'POST',
        body: JSON.stringify(refData)
      })
  },
  hospital: {
    getDashboard: () => apiRequest('/hospital/dashboard'),
    getBranches: () => apiRequest('/hospital/branches'),
    createBranch: (branchData) =>
      apiRequest('/hospital/branches', {
        method: 'POST',
        body: JSON.stringify(branchData)
      }),
    getQueue: () => apiRequest('/hospital/reception/queue'),
    updateQueueStatus: (id, status) =>
      apiRequest(`/hospital/reception/queue/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      })
  },
  admin: {
    getDashboard: () => apiRequest('/admin/dashboard'),
    getVerificationQueue: () => apiRequest('/admin/verification/queue'),
    submitVerificationDecision: (id, action, comments) =>
      apiRequest(`/admin/verification/${id}/decision`, {
        method: 'POST',
        body: JSON.stringify({ action, comments })
      }),
    getAuditLogs: () => apiRequest('/admin/audit-logs'),
    getUsers: () => apiRequest('/admin/users')
  },
  ai: {
    generateIntakeSummary: (payload) =>
      apiRequest('/ai/intake-summary', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),
    checkRedFlags: (payload) =>
      apiRequest('/ai/red-flag-check', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),
    parseOcr: (payload) =>
      apiRequest('/ai/ocr-parser', {
        method: 'POST',
        body: JSON.stringify(payload)
      })
  }
}

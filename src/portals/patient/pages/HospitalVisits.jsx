import { useState } from 'react'
import { Building2, Calendar, User, FileText, ChevronRight, Stethoscope, Clock, CheckCircle2 } from 'lucide-react'
import Card, { CardHeader, CardBody } from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'

const visits = [
  {
    id: 'VIS-2026-081',
    hospital: 'City Hospital',
    branch: 'Lucknow Branch',
    department: 'Cardiology',
    doctor: 'Dr. Sharma',
    date: '15 Jul 2026',
    time: '10:30 AM',
    reason: 'Evaluation for intermittent chest pain and shortness of breath',
    diagnosis: 'Atypical Angina / Stage 1 Hypertension',
    status: 'Completed',
    prescriptions: ['Amlodipine 5mg', 'Aspirin 75mg'],
    reports: ['ECG Report', 'Lipid Profile'],
  },
  {
    id: 'VIS-2026-042',
    hospital: 'City Hospital',
    branch: 'Lucknow Branch',
    department: 'General Medicine',
    doctor: 'Dr. Mehta',
    date: '18 Apr 2026',
    time: '02:15 PM',
    reason: 'Routine quarterly checkup and BP monitoring',
    diagnosis: 'Essential Hypertension - Stable',
    status: 'Completed',
    prescriptions: ['Amlodipine 5mg'],
    reports: ['Basic Metabolic Panel'],
  },
  {
    id: 'VIS-2026-015',
    hospital: 'Apollo Clinic',
    branch: 'Lucknow Center',
    department: 'Pulmonology',
    doctor: 'Dr. Verma',
    date: '10 Feb 2026',
    time: '11:00 AM',
    reason: 'Seasonal asthma exacerbation review',
    diagnosis: 'Mild Persistent Asthma',
    status: 'Completed',
    prescriptions: ['Salbutamol Inhaler', 'Montelukast 10mg'],
    reports: ['Spirometry Report'],
  },
]

export default function HospitalVisits() {
  const [selectedVisit, setSelectedVisit] = useState(visits[0])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Hospital Visits</h1>
          <p className="text-sm text-slate-500 mt-0.5">Comprehensive encounter history across all participating healthcare facilities</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="primary" className="px-3 py-1 text-sm">
            Total Visits: {visits.length}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visits List */}
        <div className="lg:col-span-1 space-y-3">
          {visits.map((v) => {
            const isSelected = selectedVisit.id === v.id
            return (
              <div
                key={v.id}
                onClick={() => setSelectedVisit(v)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50/70 border-brand-500 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center">
                      <Building2 size={16} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">{v.hospital}</h4>
                      <p className="text-xs text-slate-500">{v.branch}</p>
                    </div>
                  </div>
                  <Badge variant="success" dot>{v.status}</Badge>
                </div>
                
                <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Doctor:</span>
                    <span className="font-medium text-slate-700">{v.doctor}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Date:</span>
                    <span className="font-medium text-slate-700">{v.date}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Visit Details */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="bg-slate-50/50">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-800">{selectedVisit.hospital}</h2>
                    <Badge variant="primary">{selectedVisit.department}</Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Encounter ID: {selectedVisit.id} • {selectedVisit.branch}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-800">{selectedVisit.date}</p>
                  <p className="text-xs text-slate-500">{selectedVisit.time}</p>
                </div>
              </div>
            </CardHeader>

            <CardBody className="space-y-6">
              <div>
                <h4 className="label-text mb-2">Attending Clinician</h4>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="w-10 h-10 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-sm">
                    {selectedVisit.doctor.replace('Dr. ', '').charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{selectedVisit.doctor}</p>
                    <p className="text-xs text-slate-500">{selectedVisit.department} Specialist</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="label-text mb-1">Reason for Consultation</h4>
                <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {selectedVisit.reason}
                </p>
              </div>

              <div>
                <h4 className="label-text mb-1">Clinical Diagnosis & Findings</h4>
                <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-lg text-emerald-900 text-sm font-medium flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                  {selectedVisit.diagnosis}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="label-text mb-2">Prescriptions Issued</h4>
                  <ul className="space-y-1.5">
                    {selectedVisit.prescriptions.map((rx, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs bg-slate-50 p-2 rounded-md border border-slate-100 text-slate-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                        {rx}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="label-text mb-2">Linked Diagnostics / Reports</h4>
                  <ul className="space-y-1.5">
                    {selectedVisit.reports.map((rep, i) => (
                      <li key={i} className="flex items-center justify-between text-xs bg-slate-50 p-2 rounded-md border border-slate-100 text-slate-700">
                        <div className="flex items-center gap-2">
                          <FileText size={12} className="text-violet-600" />
                          <span>{rep}</span>
                        </div>
                        <span className="text-brand-600 font-medium cursor-pointer hover:underline">View</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}

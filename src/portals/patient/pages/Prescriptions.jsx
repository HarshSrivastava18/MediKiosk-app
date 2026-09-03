import { useState } from 'react'
import { Pill, Clock, Calendar, Building2, User, Download, RefreshCw, CheckCircle } from 'lucide-react'
import Card, { CardHeader, CardBody } from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'

const prescriptions = [
  {
    id: 'RX-2026-901',
    doctor: 'Dr. Sharma',
    department: 'Cardiology',
    hospital: 'City Hospital - Lucknow Branch',
    date: '15 Jul 2026',
    status: 'Active',
    items: [
      { name: 'Amlodipine Besylate', dosage: '5 mg', freq: 'Once daily (Morning)', duration: '30 Days', instructions: 'Take with or after breakfast' },
      { name: 'Aspirin (Ecosprin)', dosage: '75 mg', freq: 'Once daily (Night)', duration: '30 Days', instructions: 'Take post-dinner' },
    ],
  },
  {
    id: 'RX-2026-442',
    doctor: 'Dr. Verma',
    department: 'Pulmonology',
    hospital: 'Apollo Clinic',
    date: '10 Feb 2026',
    status: 'Completed',
    items: [
      { name: 'Salbutamol Inhaler (Asthalin)', dosage: '100 mcg', freq: '2 puffs SOS', duration: 'As needed', instructions: 'Rinse mouth after inhalation' },
      { name: 'Montelukast Sodium', dosage: '10 mg', freq: 'Once daily (Night)', duration: '14 Days', instructions: 'Take before bedtime' },
    ],
  },
]

export default function Prescriptions() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Prescriptions & Active Medications</h1>
          <p className="text-sm text-slate-500 mt-0.5">Verified digital prescriptions issued by attending doctors across network hospitals</p>
        </div>
      </div>

      <div className="space-y-4">
        {prescriptions.map((rx) => (
          <Card key={rx.id} className="overflow-hidden border border-slate-200">
            <CardHeader className="bg-slate-50/70 py-3.5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center font-bold">
                    <Pill size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-800 text-sm">{rx.id}</h3>
                      <Badge variant={rx.status === 'Active' ? 'success' : 'inactive'} dot>
                        {rx.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Prescribed by {rx.doctor} ({rx.department}) • {rx.hospital}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar size={13} /> {rx.date}
                  </span>
                  <Button variant="secondary" size="sm" className="text-xs">
                    <Download size={13} /> PDF
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardBody className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/30 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    <th className="text-left px-5 py-2.5">Medication & Strength</th>
                    <th className="text-left px-4 py-2.5">Frequency</th>
                    <th className="text-left px-4 py-2.5">Duration</th>
                    <th className="text-left px-4 py-2.5">Special Instructions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rx.items.map((med, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="px-5 py-3 font-semibold text-slate-800">
                        {med.name}
                        <span className="ml-2 font-normal text-xs text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                          {med.dosage}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-xs">{med.freq}</td>
                      <td className="px-4 py-3 text-slate-600 text-xs">{med.duration}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs italic">{med.instructions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  )
}

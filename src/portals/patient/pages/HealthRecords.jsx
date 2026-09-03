import {
  Activity,
  Heart,
  Thermometer,
  Droplets,
  Weight,
  Ruler,
  Stethoscope,
  FileText,
  Pill,
  AlertTriangle,
} from 'lucide-react'
import Card, { CardHeader, CardBody } from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import Timeline from '../../../components/ui/Timeline'
import { patients } from '../../../data/patients'

const patient = patients[0]

const vitalsConfig = [
  { label: 'Blood Pressure', value: patient.vitals.bp,       unit: 'mmHg',  icon: Heart,       color: 'bg-red-50 border-red-100',     iconClass: 'bg-red-100 text-red-600',     valClass: 'text-red-700' },
  { label: 'Pulse Rate',     value: patient.vitals.pulse,    unit: 'bpm',   icon: Activity,    color: 'bg-blue-50 border-blue-100',   iconClass: 'bg-blue-100 text-blue-600',   valClass: 'text-blue-700' },
  { label: 'SpO₂',          value: `${patient.vitals.spo2}%`,unit: 'oxygen',icon: Droplets,    color: 'bg-cyan-50 border-cyan-100',   iconClass: 'bg-cyan-100 text-cyan-600',   valClass: 'text-cyan-700' },
  { label: 'Temperature',    value: patient.vitals.temp,     unit: '',      icon: Thermometer, color: 'bg-amber-50 border-amber-100', iconClass: 'bg-amber-100 text-amber-600', valClass: 'text-amber-700' },
  { label: 'Weight',         value: patient.vitals.weight,   unit: '',      icon: Weight,      color: 'bg-violet-50 border-violet-100',iconClass:'bg-violet-100 text-violet-600',valClass: 'text-violet-700' },
  { label: 'Height',         value: patient.vitals.height,   unit: '',      icon: Ruler,       color: 'bg-emerald-50 border-emerald-100',iconClass:'bg-emerald-100 text-emerald-600',valClass:'text-emerald-700'},
]

export default function HealthRecords() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Health Records</h1>
          <p className="text-slate-500 text-sm mt-0.5">Your complete medical history — secure &amp; always available</p>
        </div>
        <Badge variant="primary" dot>Blood Group: {patient.bloodGroup}</Badge>
      </div>

      {/* Vitals Card */}
      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-slate-800">Latest Vitals</h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
            {vitalsConfig.map((v) => {
              const Icon = v.icon
              return (
                <div
                  key={v.label}
                  className={`rounded-xl border p-3.5 flex flex-col gap-2 ${v.color}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${v.iconClass}`}>
                    <Icon size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 leading-tight">{v.label}</p>
                    <p className={`font-bold text-base mt-0.5 ${v.valClass}`}>{v.value}</p>
                    {v.unit && <p className="text-xs text-slate-400">{v.unit}</p>}
                  </div>
                </div>
              )
            })}
          </div>
        </CardBody>
      </Card>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Timeline — 2 cols */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <h2 className="text-sm font-semibold text-slate-800">Medical Timeline</h2>
          </CardHeader>
          <CardBody>
            <Timeline events={patient.timeline} />
          </CardBody>
        </Card>

        {/* Conditions, Medications, Allergies */}
        <div className="space-y-4">
          {/* Conditions */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Stethoscope size={15} className="text-red-500" />
                <h3 className="text-sm font-semibold text-slate-800">Active Conditions</h3>
              </div>
            </CardHeader>
            <CardBody className="space-y-2">
              {patient.conditions.map((c) => (
                <div key={c} className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-100 rounded-lg">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
                  <span className="text-sm text-red-700 font-medium">{c}</span>
                </div>
              ))}
            </CardBody>
          </Card>

          {/* Medications */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Pill size={15} className="text-blue-500" />
                <h3 className="text-sm font-semibold text-slate-800">Current Medications</h3>
              </div>
            </CardHeader>
            <CardBody className="space-y-2">
              {patient.medications.map((m) => (
                <div key={m} className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                  <span className="text-sm text-blue-700 font-medium">{m}</span>
                </div>
              ))}
            </CardBody>
          </Card>

          {/* Allergies */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle size={15} className="text-amber-500" />
                <h3 className="text-sm font-semibold text-slate-800">Allergies</h3>
              </div>
            </CardHeader>
            <CardBody className="space-y-2">
              {patient.allergies.length === 0 ? (
                <p className="text-sm text-slate-400">No known allergies</p>
              ) : patient.allergies.map((a) => (
                <div key={a} className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-100 rounded-lg">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full flex-shrink-0" />
                  <span className="text-sm text-amber-700 font-medium">{a}</span>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}

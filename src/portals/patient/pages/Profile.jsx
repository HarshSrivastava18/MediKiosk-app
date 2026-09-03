import { useState } from 'react'
import { User, Mail, Phone, MapPin, Heart, Shield, QrCode, CheckCircle, Save } from 'lucide-react'
import Card, { CardHeader, CardBody, CardFooter } from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import { patients } from '../../../data/patients'

export default function PatientProfile() {
  const [patient, setPatient] = useState(patients[0])
  const [saved, setSaved] = useState(false)

  const handleSave = (e) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="page-title">Global Patient Profile</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage your demographic details, emergency contacts, and linked ABHA identity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left ID Card */}
        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-blue-700 to-indigo-800 text-white p-5 text-center">
            <div className="w-20 h-20 rounded-full bg-white text-brand-700 mx-auto flex items-center justify-center font-bold text-2xl border-4 border-white/20 shadow-md">
              RK
            </div>
            <h3 className="font-bold text-lg mt-3 text-white">{patient.name}</h3>
            <p className="text-xs text-blue-200">{patient.age} yrs • {patient.gender} • Blood Group {patient.bloodGroup}</p>
            
            <div className="mt-4 pt-4 border-t border-white/20 text-left space-y-2">
              <div>
                <p className="text-[10px] text-blue-300 font-semibold uppercase">Global Patient ID</p>
                <p className="font-mono text-xs font-bold text-white tracking-wider">{patient.id}</p>
              </div>
              <div>
                <p className="text-[10px] text-blue-300 font-semibold uppercase">Identity Verification</p>
                <div className="flex items-center gap-1 text-xs text-emerald-300 font-semibold mt-0.5">
                  <CheckCircle size={12} /> Aadhaar / ABHA Linked
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 mb-2 text-slate-700 font-semibold text-xs">
              <QrCode size={16} className="text-brand-600" /> Quick Kiosk Scan QR
            </div>
            <div className="bg-white p-4 rounded-lg border border-slate-200 flex items-center justify-center">
              <div className="w-28 h-28 bg-slate-900 rounded-lg flex items-center justify-center text-white text-[10px] text-center p-2">
                QR CODE: {patient.id}
              </div>
            </div>
          </Card>
        </div>

        {/* Edit Demographics Form */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <h3 className="section-title">Demographic & Medical Details</h3>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Full Legal Name" value={patient.name} readOnly />
                  <Input label="Date of Birth" value={patient.dob} readOnly />
                  <Input label="Phone Number" value={patient.phone} />
                  <Input label="Blood Group" value={patient.bloodGroup} />
                  <Input label="Residential Address" value={patient.address} className="sm:col-span-2" />
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <h4 className="label-text mb-2">Emergency Contact</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="Contact Name" defaultValue="Sunita Kumar (Spouse)" />
                    <Input label="Emergency Phone" defaultValue="9876543219" />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  {saved && (
                    <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                      <CheckCircle size={14} /> Profile updated successfully!
                    </span>
                  )}
                  <div className="ml-auto">
                    <Button type="submit" variant="primary">
                      <Save size={14} /> Save Profile Changes
                    </Button>
                  </div>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}

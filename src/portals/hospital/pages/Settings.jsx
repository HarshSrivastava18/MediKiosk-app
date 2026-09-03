import { useState } from 'react'
import { Building2, Save, Shield, Clock, Phone, Mail, MapPin, CheckCircle, Bell, Lock } from 'lucide-react'
import Card, { CardHeader, CardBody } from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import Badge from '../../../components/ui/Badge'

export default function HospitalSettings() {
  const [saved, setSaved] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="page-title">Hospital Organization Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage institutional metadata, OPD operational hours, and ABDM/HIS integration keys</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <h3 className="section-title">Facility Information</h3>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Hospital Legal Name" defaultValue="City Hospital" />
              <Input label="Organization ID" defaultValue="ORG-001" readOnly />
              <Input label="Primary Phone" defaultValue="+91 522 2345678" />
              <Input label="Emergency Helpline" defaultValue="+91 522 1080000" />
              <Input label="Official Email" defaultValue="admin@cityhospital-lucknow.org" className="sm:col-span-2" />
              <Input label="Headquarters Address" defaultValue="14 Ashok Marg, Hazratganj, Lucknow, UP - 226001" className="sm:col-span-2" />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="section-title">OPD & Kiosk Operational Policies</h3>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Morning OPD Shift" defaultValue="08:00 AM - 02:00 PM" />
              <Input label="Evening OPD Shift" defaultValue="04:00 PM - 08:00 PM" />
              <Input label="Max Daily Kiosk Token Capacity" defaultValue="500" />
              <Input label="AI Red-Flag Alert Escalation Time (Mins)" defaultValue="3" />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="section-title">ABDM & National Health API Security</h3>
          </CardHeader>
          <CardBody className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
              <div>
                <p className="font-bold text-slate-800">ABDM Health Facility Registry (HFR) Token</p>
                <p className="font-mono text-slate-500 mt-0.5">HFR-IN-UP-LCK-8921-VERIFIED</p>
              </div>
              <Badge variant="success" dot>Connected</Badge>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
              <div>
                <p className="font-bold text-slate-800">MediKiosk FHIR R4 Connector Endpoint</p>
                <p className="font-mono text-slate-500 mt-0.5">https://api.medikiosk.in/v1/fhir/org-001</p>
              </div>
              <Badge variant="primary">Active</Badge>
            </div>
          </CardBody>
        </Card>

        <div className="flex items-center justify-between pt-2">
          {saved && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
              <CheckCircle size={16} /> Hospital settings saved successfully!
            </span>
          )}
          <div className="ml-auto">
            <Button type="submit" variant="success">
              <Save size={14} /> Save Configuration
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

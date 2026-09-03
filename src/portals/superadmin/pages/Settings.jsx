import { useState } from 'react'
import { Shield, Save, CheckCircle, Database, Server, Key, AlertTriangle } from 'lucide-react'
import Card, { CardHeader, CardBody } from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import Badge from '../../../components/ui/Badge'

export default function AdminSettings() {
  const [saved, setSaved] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="page-title">National Platform Policies & Core Engine Configuration</h1>
        <p className="text-sm text-slate-500 mt-0.5">Configure national red-flag safety protocols, LLM model gateways, and encryption parameters</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <h3 className="section-title">Clinical AI Safety & Red-Flag Protocol Thresholds</h3>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Emergency Red-Flag Confidence Threshold (%)" defaultValue="85" />
              <Input label="Mandatory Doctor Review Override" defaultValue="Enforced (Zero Autonomous Rx)" readOnly />
              <Input label="Max Adaptive AI Interview Questions" defaultValue="8" />
              <Input label="OCR Document Classification Model" defaultValue="Gemini 1.5 Flash / Vision OCR R3" readOnly />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="section-title">National Gateway Security & Encryption</h3>
          </CardHeader>
          <CardBody className="space-y-3">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-slate-800">Health Record At-Rest Encryption</p>
                <p className="text-slate-500">AES-256-GCM with Hardware Security Module (HSM) Key Rotation</p>
              </div>
              <Badge variant="success" dot>Enabled</Badge>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-slate-800">ABHA / ABDM M1, M2, M3 Milestone Conformance</p>
                <p className="text-slate-500">Certified by National Health Authority (NHA)</p>
              </div>
              <Badge variant="primary">Certified</Badge>
            </div>
          </CardBody>
        </Card>

        <div className="flex items-center justify-between pt-2">
          {saved && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
              <CheckCircle size={16} /> National platform settings saved!
            </span>
          )}
          <div className="ml-auto">
            <Button type="submit" variant="primary">
              <Save size={14} /> Save Platform Policies
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

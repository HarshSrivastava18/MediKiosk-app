import { useState } from 'react'
import { ScrollText, ShieldAlert, ShieldCheck, Search, Filter, Clock, Eye, Download } from 'lucide-react'
import Card, { CardHeader, CardBody } from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'

const auditLogs = [
  {
    id: 'AUD-99120',
    timestamp: '2026-09-02 01:45:12',
    actor: 'Dr. Sharma (DOC-001)',
    actorRole: 'Doctor',
    action: 'RECORD_ACCESSED',
    resource: 'Patient Record: MK-8472-9812-3345 (Rahul Kumar)',
    purpose: 'OPD Consultation - Consent CS-8891 Validated',
    ipAddress: '103.21.144.92',
    status: 'SUCCESS',
  },
  {
    id: 'AUD-99119',
    timestamp: '2026-09-02 01:40:05',
    actor: 'Super Admin (Administrator)',
    actorRole: 'Super Admin',
    action: 'HOSPITAL_APPROVED',
    resource: 'Hospital Entity: Jeevan Hospital (ORG-006)',
    purpose: 'National Registration Verification completed',
    ipAddress: '14.139.224.18',
    status: 'SUCCESS',
  },
  {
    id: 'AUD-99118',
    timestamp: '2026-09-02 01:22:40',
    actor: 'AI Case Engine Subsystem',
    actorRole: 'AI Daemon',
    action: 'RED_FLAG_EVALUATED',
    resource: 'Case Session #4091 (Patient: Rahul Kumar)',
    purpose: 'Rule: Chest Pain + Breathlessness = High Urgency',
    ipAddress: '10.0.4.12 (Internal RPC)',
    status: 'TRIGGERED',
  },
  {
    id: 'AUD-99117',
    timestamp: '2026-09-02 00:55:10',
    actor: 'Unauthorized API Client',
    actorRole: 'Anonymous',
    action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
    resource: '/api/v1/patients/MK-3310-5521-9981',
    purpose: 'No valid consent token presented',
    ipAddress: '45.112.88.190',
    status: 'DENIED',
  },
  {
    id: 'AUD-99116',
    timestamp: '2026-09-01 23:14:02',
    actor: 'Patient (Rahul Kumar)',
    actorRole: 'Patient',
    action: 'CONSENT_GRANTED',
    resource: 'Consent Scope: Diagnostics + Previous Rx to City Hospital',
    purpose: 'Self-service consent grant on Patient App',
    ipAddress: '106.215.72.10',
    status: 'SUCCESS',
  },
]

export default function AuditLogs() {
  const [searchTerm, setSearchTerm] = useState('')

  const filtered = auditLogs.filter(
    (log) =>
      log.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">National Audit Trail & Immutable Access Logs</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Cryptographically signed audit records capturing every data access, consent decision, and AI case generation
          </p>
        </div>
        <Button variant="secondary" size="sm">
          <Download size={14} /> Export Audit Archive
        </Button>
      </div>

      <Card>
        <CardBody className="py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Input
              icon={Search}
              placeholder="Search audit by actor, action, resource..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-80 text-xs py-1.5"
            />
            <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
              <Clock size={14} className="text-violet-600" />
              Real-time audit stream active (Log retention: 7 years)
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                <th className="text-left px-4 py-3">Audit ID & Time</th>
                <th className="text-left px-4 py-3">Actor / Principal</th>
                <th className="text-left px-4 py-3">Action Type</th>
                <th className="text-left px-4 py-3">Target Resource / Context</th>
                <th className="text-left px-4 py-3">IP Address</th>
                <th className="text-right px-4 py-3">Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-xs">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60 font-sans">
                  <td className="px-4 py-3">
                    <p className="font-bold text-slate-800 text-xs font-mono">{log.id}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{log.timestamp}</p>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <p className="font-semibold text-slate-800">{log.actor}</p>
                    <span className="text-[10px] font-medium bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                      {log.actorRole}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs font-bold text-violet-900 font-mono">
                    {log.action}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-700">
                    <p className="font-medium">{log.resource}</p>
                    <p className="text-[11px] text-slate-400 italic mt-0.5">{log.purpose}</p>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-slate-500">{log.ipAddress}</td>
                  <td className="px-4 py-3 text-right">
                    {log.status === 'SUCCESS' ? (
                      <Badge variant="success" dot>SUCCESS</Badge>
                    ) : log.status === 'TRIGGERED' ? (
                      <Badge variant="warning" dot>TRIGGERED</Badge>
                    ) : (
                      <Badge variant="rejected" dot>DENIED</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  )
}

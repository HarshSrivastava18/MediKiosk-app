import { useState } from 'react'
import { Shield, ShieldCheck, ShieldAlert, Lock, Check, X, Building2, Clock, Eye, AlertCircle, Plus } from 'lucide-react'
import Card, { CardHeader, CardBody, CardFooter } from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'

export default function ConsentSharing() {
  const [activeGrants, setActiveGrants] = useState([
    {
      id: 'CS-8891',
      hospital: 'City Hospital - Lucknow Branch',
      purpose: 'OPD Consultation & AI Diagnostics',
      requestedBy: 'Dr. Sharma (Cardiology)',
      grantedOn: '15 Jul 2026',
      expiresOn: '15 Aug 2026',
      status: 'Active',
      permissions: {
        demographics: true,
        previousDiagnosis: true,
        medications: true,
        labReports: true,
        ecgScans: true,
        fullHistory: false,
      },
    },
    {
      id: 'CS-8840',
      hospital: 'Apollo Clinic - Lucknow',
      purpose: 'Pulmonology Routine Follow-up',
      requestedBy: 'Dr. Verma (Pulmonology)',
      grantedOn: '10 Feb 2026',
      expiresOn: '10 May 2026',
      status: 'Expired',
      permissions: {
        demographics: true,
        previousDiagnosis: true,
        medications: true,
        labReports: false,
        ecgScans: false,
        fullHistory: false,
      },
    },
  ])

  const [revokedList, setRevokedList] = useState([])

  const handleRevoke = (id) => {
    const target = activeGrants.find((g) => g.id === id)
    if (target) {
      setActiveGrants(activeGrants.filter((g) => g.id !== id))
      setRevokedList([...revokedList, { ...target, status: 'Revoked', revokedOn: 'Just now' }])
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Consent & Sharing Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            You hold total cryptographic authority over which hospitals and doctors can access your health records.
          </p>
        </div>
        <Button variant="primary" size="sm">
          <Plus size={16} />
          New Access Consent
        </Button>
      </div>

      {/* Security Architecture Principle Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-start gap-3 shadow-sm">
        <ShieldCheck size={24} className="text-blue-300 flex-shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-bold text-sm text-blue-100">Zero-Trust Consent Architecture</p>
          <p className="text-blue-200 leading-relaxed">
            Hospitals and clinicians only receive time-limited, purpose-scoped tokens for the specific records you approve.
            No entity has blanket access to the MediKiosk national health database.
          </p>
        </div>
      </div>

      {/* Active Grants */}
      <div className="space-y-4">
        <h3 className="section-title">Active Consent Grants</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeGrants.map((grant) => (
            <Card key={grant.id} className="border-l-4 border-l-brand-600">
              <CardHeader className="bg-slate-50/50 pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 font-semibold">{grant.id}</span>
                    <h4 className="font-bold text-slate-800 text-sm">{grant.hospital}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{grant.requestedBy}</p>
                  </div>
                  <Badge variant={grant.status === 'Active' ? 'success' : 'pending'} dot>
                    {grant.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardBody className="py-3 space-y-3">
                <div className="text-xs">
                  <span className="text-slate-400">Purpose: </span>
                  <span className="font-medium text-slate-700">{grant.purpose}</span>
                </div>

                <div>
                  <p className="label-text text-[10px] mb-1.5">Permitted Data Scopes</p>
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    {Object.entries(grant.permissions).map(([scope, allowed]) => (
                      <div
                        key={scope}
                        className={`flex items-center gap-1.5 p-1.5 rounded text-[11px] ${
                          allowed ? 'bg-emerald-50 text-emerald-800 font-medium' : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {allowed ? <Check size={12} className="text-emerald-600" /> : <X size={12} className="text-slate-400" />}
                        <span className="capitalize">{scope.replace(/([A-Z])/g, ' $1')}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> Valid until: {grant.expiresOn}
                  </span>
                </div>
              </CardBody>

              <CardFooter className="py-2.5 flex justify-between items-center">
                <Button variant="ghost" size="sm" className="text-xs text-slate-600">
                  Modify Scopes
                </Button>
                <Button variant="danger" size="sm" className="text-xs" onClick={() => handleRevoke(grant.id)}>
                  Revoke Consent
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Revocation History */}
      {revokedList.length > 0 && (
        <div className="space-y-3">
          <h3 className="section-title text-slate-700">Revocation & Audit History</h3>
          <Card>
            <CardBody className="p-0">
              <div className="divide-y divide-slate-100">
                {revokedList.map((item) => (
                  <div key={item.id} className="p-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-slate-800">{item.hospital}</p>
                      <p className="text-slate-400">Consent Token {item.id} • Revoked: {item.revokedOn}</p>
                    </div>
                    <Badge variant="rejected">Revoked</Badge>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  )
}

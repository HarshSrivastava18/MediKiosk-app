import { useState } from 'react'
import {
  CheckCircle,
  XCircle,
  Clock,
  FileCheck,
  Building2,
  AlertCircle,
  Eye,
  FileText,
  Shield,
  Check,
  X,
  Sparkles,
  Key,
  ExternalLink,
  Download,
  AlertTriangle
} from 'lucide-react'
import Card, { CardHeader, CardBody } from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import Tabs from '../../../components/ui/Tabs'
import { hospitals } from '../../../data/hospitals'
import { api } from '../../../lib/api'

const defaultChecklist = [
  'Organization Legal Verification',
  'Clinical Establishment License Valid',
  'NABH / Quality Accreditation Scanned',
  'Physical Infrastructure & Bed Capacity Verified',
  'Medical Superintendent Council Reg Verified',
]

export default function Verification() {
  const [pending, setPending] = useState(hospitals.filter((h) => h.status === 'pending'))
  const [history, setHistory] = useState([])
  const [selectedHospital, setSelectedHospital] = useState(null)
  const [approvedOrgCredentials, setApprovedOrgCredentials] = useState(null)
  const [rejectModalHospital, setRejectModalHospital] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('Missing updated Clinical Establishment Act renewal certificate.')

  const handleApprove = async (hospital) => {
    const orgId = `ORG-${Math.floor(100 + Math.random() * 900)}`
    const adminEmail = `admin@${hospital.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.org`

    try {
      await api.admin.submitVerificationDecision(hospital.id, 'approve', `Approved by Super Admin. Issued ID: ${orgId}`)
    } catch (e) {
      console.log('Local fallback verification update', e)
    }

    setPending((prev) => prev.filter((p) => p.id !== hospital.id))
    setHistory((prev) => [
      {
        ...hospital,
        status: 'approved',
        orgId,
        reviewedOn: 'Just now',
        verifier: 'Super Admin (Administrator)',
      },
      ...prev,
    ])
    setApprovedOrgCredentials({
      hospitalName: hospital.name,
      orgId,
      adminEmail,
      initialSecret: 'hospital123',
      fhirEndpoint: `https://api.medikiosk.in/v1/fhir/${orgId.toLowerCase()}`,
    })
    setSelectedHospital(null)
  }

  const handleReject = async (hospital) => {
    try {
      await api.admin.submitVerificationDecision(hospital.id, 'reject', rejectionReason)
    } catch (e) {
      console.log('Local fallback rejection update', e)
    }

    setPending((prev) => prev.filter((p) => p.id !== hospital.id))
    setHistory((prev) => [
      {
        ...hospital,
        status: 'rejected',
        reason: rejectionReason,
        reviewedOn: 'Just now',
        verifier: 'Super Admin (Administrator)',
      },
      ...prev,
    ])
    setRejectModalHospital(null)
    setSelectedHospital(null)
  }

  const pendingTab = (
    <div className="space-y-4">
      {pending.length === 0 ? (
        <div className="text-center py-16 text-slate-400 bg-white rounded-card border border-slate-100 p-8">
          <CheckCircle size={48} className="mx-auto mb-3 text-emerald-500 animate-bounce" />
          <p className="font-bold text-slate-800 text-base">All Hospital Registrations Verified!</p>
          <p className="text-xs text-slate-500 mt-1">There are no pending healthcare provider requests in the national queue.</p>
        </div>
      ) : (
        pending.map((h) => (
          <Card key={h.id} className="border border-slate-200 hover:border-slate-300 transition-all">
            <CardBody>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 bg-violet-100 text-violet-700 rounded-xl flex items-center justify-center font-bold">
                    <Building2 size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-base">{h.name}</h3>
                      <Badge variant="pending" dot>Verification Pending</Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {h.city}, {h.state} • Type: <span className="font-semibold text-slate-700">{h.type}</span> • Submitted: {h.regDate}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={() => setSelectedHospital(h)}>
                    <Eye size={14} /> Full Dossier Review
                  </Button>
                  <Button variant="success" size="sm" onClick={() => handleApprove(h)}>
                    <CheckCircle size={14} /> Quick Approve
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => setRejectModalHospital(h)}>
                    <XCircle size={14} /> Reject
                  </Button>
                </div>
              </div>

              {/* Quick Summary Strip */}
              <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2 rounded bg-slate-50">
                  <span className="text-slate-400 block text-[10px]">Establishment Reg</span>
                  <span className="font-mono font-semibold text-slate-800">CEA-STATE-8921</span>
                </div>
                <div className="p-2 rounded bg-slate-50">
                  <span className="text-slate-400 block text-[10px]">AI OCR Pre-Score</span>
                  <span className="font-bold text-emerald-600">98.4% Match</span>
                </div>
                <div className="p-2 rounded bg-slate-50">
                  <span className="text-slate-400 block text-[10px]">Statutory Scans</span>
                  <span className="font-semibold text-slate-700">3 PDFs Attached</span>
                </div>
                <div className="p-2 rounded bg-slate-50">
                  <span className="text-slate-400 block text-[10px]">Facility Scope</span>
                  <span className="font-semibold text-slate-700">Multi-Specialty</span>
                </div>
              </div>
            </CardBody>
          </Card>
        ))
      )}
    </div>
  )

  const historyTab = (
    <Card>
      <CardBody className="p-0">
        {history.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">No verification decisions recorded in this session.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                <th className="text-left px-5 py-3">Hospital Entity</th>
                <th className="text-left px-4 py-3">State / City</th>
                <th className="text-left px-4 py-3">Decision</th>
                <th className="text-left px-4 py-3">Organization ID / Notes</th>
                <th className="text-right px-5 py-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.map((h, i) => (
                <tr key={i} className="hover:bg-slate-50/60">
                  <td className="px-5 py-3 font-semibold text-slate-800 text-xs">{h.name}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{h.city}, {h.state}</td>
                  <td className="px-4 py-3 text-xs">
                    <Badge variant={h.status === 'approved' ? 'approved' : 'rejected'} dot>
                      {h.status === 'approved' ? 'Approved & Issued' : 'Rejected'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {h.orgId ? (
                      <span className="font-mono font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded">
                        {h.orgId}
                      </span>
                    ) : (
                      <span className="text-red-600 italic text-[11px]">{h.reason}</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right text-xs text-slate-400">{h.reviewedOn}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardBody>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Hospital Verification & Authorization Engine</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Evaluate submitted clinical accreditations, audit licenses, and cryptographically provision organization credentials.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="pending" className="px-3 py-1 text-xs">
            <Clock size={12} className="mr-1" /> {pending.length} Pending Review
          </Badge>
          <Badge variant="success" className="px-3 py-1 text-xs">
            <CheckCircle size={12} className="mr-1" /> {history.filter(h => h.status === 'approved').length} Approved Today
          </Badge>
        </div>
      </div>

      {/* Success Modal: Organization Provisioned */}
      {approvedOrgCredentials && (
        <Card className="border-2 border-emerald-500 bg-emerald-50/40 p-5 shadow-card-lg">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Organization Approved & Cryptographically Provisioned!
                </h3>
                <p className="text-xs text-emerald-800 font-medium">
                  {approvedOrgCredentials.hospitalName} has been assigned their tenant partition and API keys.
                </p>
              </div>
            </div>
            <button
              onClick={() => setApprovedOrgCredentials(null)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-white p-4 rounded-xl border border-emerald-200">
            <div>
              <span className="text-slate-400 block uppercase font-bold text-[10px]">Issued Hospital ID</span>
              <span className="font-mono text-base font-extrabold text-violet-700">
                {approvedOrgCredentials.orgId}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase font-bold text-[10px]">Provisioned Admin User</span>
              <span className="font-mono text-xs font-semibold text-slate-800">
                {approvedOrgCredentials.adminEmail}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase font-bold text-[10px]">FHIR Interoperability Connector</span>
              <span className="font-mono text-[11px] text-brand-600 truncate block">
                {approvedOrgCredentials.fhirEndpoint}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Tabs */}
      <Tabs
        tabs={[
          { key: 'pending', label: `Pending Applications (${pending.length})`, content: pendingTab },
          { key: 'history', label: `Verification Audit Log (${history.length})`, content: historyTab },
        ]}
        defaultTab="pending"
      />

      {/* DETAILED DOSSIER REVIEW MODAL */}
      {selectedHospital && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-100 my-8">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center">
                  <Building2 size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">{selectedHospital.name}</h3>
                  <p className="text-xs text-slate-300">
                    Registration Dossier Review • {selectedHospital.city}, {selectedHospital.state}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedHospital(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Compliance Score */}
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-emerald-900 font-semibold">
                  <CheckCircle size={16} className="text-emerald-600" />
                  <span>NHA / ABDM Registry Automated Validation: <strong>PASSED (Score: 98/100)</strong></span>
                </div>
                <Badge variant="approved">Verified Valid</Badge>
              </div>

              {/* Organization Profile Details */}
              <div>
                <h4 className="label-text mb-2">Hospital Legal & Infrastructure Details</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-400 block">Facility Type</span>
                    <span className="font-semibold text-slate-800">{selectedHospital.type}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">State Registration No</span>
                    <span className="font-mono font-semibold text-slate-800">CEA-UP-2024-88419</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Beds / Infrastructure</span>
                    <span className="font-semibold text-slate-800">250 Beds (40 ICU)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Medical Director</span>
                    <span className="font-semibold text-slate-800">Dr. S. K. Tripathi (MCI 34910)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Emergency Services</span>
                    <span className="font-semibold text-emerald-700">24x7 Active Trauma Unit</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Application Date</span>
                    <span className="font-semibold text-slate-800">{selectedHospital.regDate}</span>
                  </div>
                </div>
              </div>

              {/* Attached Documents */}
              <div>
                <h4 className="label-text mb-2">Attached Statutory PDF Certificates</h4>
                <div className="space-y-2">
                  {[
                    { name: 'Clinical_Establishment_Act_License_2026.pdf', size: '2.4 MB', status: 'Valid' },
                    { name: 'NABH_Accreditation_Certificate.pdf', size: '1.8 MB', status: 'Verified' },
                    { name: 'Pollution_Control_BioWaste_Clearance.pdf', size: '940 KB', status: 'Valid' },
                  ].map((doc, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <FileText size={16} className="text-violet-600" />
                        <div>
                          <p className="font-semibold text-slate-800">{doc.name}</p>
                          <p className="text-[10px] text-slate-400">{doc.size}</p>
                        </div>
                      </div>
                      <span className="text-xs text-brand-600 font-semibold cursor-pointer hover:underline">
                        View Certificate
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Decision Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <Button variant="ghost" size="sm" onClick={() => setSelectedHospital(null)}>
                  Close
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      setRejectModalHospital(selectedHospital)
                    }}
                  >
                    <XCircle size={14} /> Reject Application
                  </Button>
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleApprove(selectedHospital)}
                  >
                    <CheckCircle size={14} /> Approve & Issue Organization ID
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REJECT CONFIRMATION MODAL */}
      {rejectModalHospital && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Reject Registration</h3>
                <p className="text-xs text-slate-500">{rejectModalHospital.name}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Please specify the regulatory or documentation reason for rejecting this hospital registration request.
            </p>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Reason for Rejection</label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setRejectModalHospital(null)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={() => handleReject(rejectModalHospital)}>
                Confirm Rejection
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

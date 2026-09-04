import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building2,
  Shield,
  FileText,
  Upload,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Check,
  AlertCircle,
  Clock,
  Sparkles,
  Stethoscope,
  Activity,
  Layers,
  FileCheck,
  MapPin
} from 'lucide-react'
import Card, { CardHeader, CardBody } from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import Input from '../../../components/ui/Input'
import { apiRequest } from '../../../lib/api'

const statesList = [
  'Uttar Pradesh',
  'Maharashtra',
  'Delhi',
  'Bihar',
  'Rajasthan',
  'Karnataka',
  'Tamil Nadu',
  'Gujarat',
  'West Bengal',
  'Madhya Pradesh',
]

const availableDepartments = [
  'Cardiology',
  'Neurology',
  'Emergency & Trauma (24x7)',
  'Orthopedics',
  'General Medicine',
  'Pediatrics',
  'Oncology',
  'Pulmonology',
  'Pathology Laboratory',
  'Radiology & Imaging',
  'Pharmacy Services',
]

export default function HospitalRegistration() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)

  // Step 1: Organization details
  const [hospitalName, setHospitalName] = useState('Heritage Superspecialty Hospital')
  const [hospitalType, setHospitalType] = useState('Private')
  const [regNumber, setRegNumber] = useState('CEA-UP-2024-88419')
  const [state, setState] = useState('Uttar Pradesh')
  const [city, setCity] = useState('Varanasi')
  const [pincode, setPincode] = useState('221005')
  const [officialEmail, setOfficialEmail] = useState('admin@heritagehospital.org')
  const [phone, setPhone] = useState('+91 542 2368900')
  const [medicalSuperintendent, setMedicalSuperintendent] = useState('Dr. S. K. Tripathi (MCI Reg: 34910)')

  // Step 2: Infrastructure
  const [branchesCount, setBranchesCount] = useState('2')
  const [totalBeds, setTotalBeds] = useState('250')
  const [icuBeds, setIcuBeds] = useState('40')
  const [hasEmergency, setHasEmergency] = useState(true)
  const [selectedDepts, setSelectedDepts] = useState([
    'Cardiology',
    'Emergency & Trauma (24x7)',
    'Neurology',
    'Orthopedics',
    'Pathology Laboratory',
    'Radiology & Imaging',
  ])

  // Step 3: Documents
  const [licenseFile, setLicenseFile] = useState('Clinical_Establishment_License_2026.pdf')
  const [nabhFile, setNabhFile] = useState('NABH_Accreditation_Certificate.pdf')
  const [pollutionFile, setPollutionFile] = useState('BioMedical_Waste_Clearance.pdf')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Step 4: Tracking ID
  const [trackingId, setTrackingId] = useState('APP-2026-9841')
  const [submissionError, setSubmissionError] = useState('')

  const toggleDept = (dept) => {
    if (selectedDepts.includes(dept)) {
      setSelectedDepts(selectedDepts.filter((d) => d !== dept))
    } else {
      setSelectedDepts([...selectedDepts, dept])
    }
  }

  const handleSubmitApplication = async () => {
    setSubmissionError('')
    setIsSubmitting(true)
    try {
      const res = await apiRequest('/hospitals/register', {
        method: 'POST',
        body: JSON.stringify({
          hospitalName: hospitalName.trim(),
          hospitalType,
          regNumber: regNumber.trim(),
          state,
          city,
          pincode,
          officialEmail: officialEmail.trim(),
          phone: phone.trim(),
          medicalSuperintendent: medicalSuperintendent.trim(),
          branchesCount: parseInt(branchesCount) || 1,
          totalBeds: parseInt(totalBeds) || 0,
          icuBeds: parseInt(icuBeds) || 0,
          hasEmergency,
          departments: selectedDepts,
          documents: [
            {
              document_type: 'Clinical Establishment License',
              file_name: typeof licenseFile === 'string' ? licenseFile : licenseFile.name,
              file_path: `uploads/hospitals/${typeof licenseFile === 'string' ? licenseFile : licenseFile.name}`
            },
            {
              document_type: 'NABH Quality Accreditation',
              file_name: typeof nabhFile === 'string' ? nabhFile : nabhFile.name,
              file_path: `uploads/hospitals/${typeof nabhFile === 'string' ? nabhFile : nabhFile.name}`
            },
            {
              document_type: 'BioMedical Waste Clearance',
              file_name: typeof pollutionFile === 'string' ? pollutionFile : pollutionFile.name,
              file_path: `uploads/hospitals/${typeof pollutionFile === 'string' ? pollutionFile : pollutionFile.name}`
            }
          ]
        })
      })

      if (res?.tracking_id || res?.trackingId || res?.application_id) {
        const assignedId = res.tracking_id || res.trackingId || res.application_id
        setTrackingId(assignedId)
        setStep(4)
      } else {
        throw new Error(res?.detail || res?.error || 'Registration failed to return tracking ID from database.')
      }
    } catch (err) {
      console.error('Registration failed:', err)
      setSubmissionError(err.message || 'Hospital registration was rejected by the backend.')
      // DO NOT advance to Step 4, DO NOT generate fake tracking ID!
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft size={14} /> Back to MediKiosk Gateway
          </button>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-slate-600">National Healthcare Facility Onboarding</span>
          </div>
        </div>

        {/* Hero Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100">
            <Building2 size={13} />
            Institutional Tenant Onboarding
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Hospital & Healthcare Facility Registration</h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
            Enroll your hospital, multi-branch network, or diagnostic center into the MediKiosk national health ecosystem for inter-hospital referrals, kiosk integration, and AI clinical summaries.
          </p>
        </div>

        {/* Wizard Step Progress */}
        <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-100">
          <div className="grid grid-cols-4 gap-2 text-center text-xs font-semibold">
            {[
              { num: 1, label: 'Organization Info' },
              { num: 2, label: 'Clinical Wings' },
              { num: 3, label: 'Statutory Docs' },
              { num: 4, label: 'Verification Status' },
            ].map((s) => (
              <div
                key={s.num}
                className={`flex flex-col items-center gap-1.5 ${
                  step === s.num ? 'text-emerald-700 font-bold' : step > s.num ? 'text-emerald-600' : 'text-slate-400'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-colors ${
                    step === s.num
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : step > s.num
                      ? 'bg-emerald-100 text-emerald-700 font-bold'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {step > s.num ? <Check size={14} /> : s.num}
                </div>
                <span className="text-[11px] sm:text-xs truncate">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* STEP 1: ORGANIZATION DETAILS */}
        {step === 1 && (
          <Card>
            <CardHeader className="bg-slate-50/60">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Building2 size={18} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-800">Step 1: Institutional Legal & Demographic Profile</h2>
                  <p className="text-xs text-slate-500">Provide official hospital registration details registered under the Clinical Establishment Act</p>
                </div>
              </div>
            </CardHeader>

            <CardBody className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Hospital / Clinic Legal Name"
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  placeholder="e.g. Apex Hospital & Research Institute"
                />

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Ownership / Entity Type</label>
                  <select
                    value={hospitalType}
                    onChange={(e) => setHospitalType(e.target.value)}
                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option>Private Limited</option>
                    <option>Trust / NGO Hospital</option>
                    <option>Government / Municipal</option>
                    <option>Autonomous Medical Institute</option>
                  </select>
                </div>

                <Input
                  label="Clinical Establishment / State License Number"
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                  placeholder="e.g. CEA-UP-2024-88419"
                />

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">State Jurisdiction</label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {statesList.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} />
                <Input label="Postal PIN Code" value={pincode} onChange={(e) => setPincode(e.target.value)} />
                <Input label="Official Institutional Email" type="email" value={officialEmail} onChange={(e) => setOfficialEmail(e.target.value)} />
                <Input label="Hospital Landline / Reception Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                <Input
                  label="Medical Director / Superintendent Name & Council No"
                  value={medicalSuperintendent}
                  onChange={(e) => setMedicalSuperintendent(e.target.value)}
                  className="sm:col-span-2"
                />
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
                  Cancel
                </Button>
                <Button variant="success" size="md" onClick={() => setStep(2)}>
                  Continue to Clinical Wings <ArrowRight size={15} />
                </Button>
              </div>
            </CardBody>
          </Card>
        )}

        {/* STEP 2: CLINICAL WINGS & INFRASTRUCTURE */}
        {step === 2 && (
          <Card>
            <CardHeader className="bg-slate-50/60">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Layers size={18} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-800">Step 2: Clinical Infrastructure & Department Matrix</h2>
                  <p className="text-xs text-slate-500">Configure operational branches, inpatient capacity, and active specialty services</p>
                </div>
              </div>
            </CardHeader>

            <CardBody className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Number of Operational Branches"
                  type="number"
                  value={branchesCount}
                  onChange={(e) => setBranchesCount(e.target.value)}
                />
                <Input
                  label="Total Inpatient Bed Capacity"
                  type="number"
                  value={totalBeds}
                  onChange={(e) => setTotalBeds(e.target.value)}
                />
                <Input
                  label="ICU / CCU Beds"
                  type="number"
                  value={icuBeds}
                  onChange={(e) => setIcuBeds(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">Select Active Clinical Departments & Services</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {availableDepartments.map((dept) => {
                    const isSelected = selectedDepts.includes(dept)
                    return (
                      <div
                        key={dept}
                        onClick={() => toggleDept(dept)}
                        className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span>{dept}</span>
                        {isSelected ? (
                          <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">✓</span>
                        ) : (
                          <span className="w-4 h-4 rounded-full border border-slate-300" />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <Button variant="secondary" size="sm" onClick={() => setStep(1)}>
                  <ArrowLeft size={14} /> Back
                </Button>
                <Button variant="success" size="md" onClick={() => setStep(3)}>
                  Continue to Documents <ArrowRight size={15} />
                </Button>
              </div>
            </CardBody>
          </Card>
        )}

        {/* STEP 3: STATUTORY ACCREDITATION & DOCUMENTS */}
        {step === 3 && (
          <Card>
            <CardHeader className="bg-slate-50/60">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center font-bold">
                  <FileCheck size={18} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-800">Step 3: Statutory Compliance Documents Upload</h2>
                  <p className="text-xs text-slate-500">Super Admin verification requires verified PDF scans of legal operating licenses</p>
                </div>
              </div>
            </CardHeader>

            <CardBody className="space-y-4">
              {[
                { label: 'Clinical Establishment Act License', file: licenseFile, setFile: setLicenseFile, required: true },
                { label: 'NABH / NABL Accreditation Certificate', file: nabhFile, setFile: setNabhFile, required: false },
                { label: 'State Pollution Control Board Bio-Medical Waste Clearance', file: pollutionFile, setFile: setPollutionFile, required: true },
              ].map((doc, i) => (
                <div key={i} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 flex items-center justify-center">
                      <FileText size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        {doc.label} {doc.required && <span className="text-red-500 text-xs">*</span>}
                      </p>
                      <p className="text-[11px] text-emerald-700 font-medium">
                        {typeof doc.file === 'string' ? doc.file : doc.file?.name || 'document.pdf'}
                      </p>
                    </div>
                  </div>
                  <label className="cursor-pointer">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                      <Upload size={12} /> Replace File
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          doc.setFile(e.target.files[0].name)
                        }
                      }}
                    />
                  </label>
                </div>
              ))}

              {submissionError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 shadow-sm">
                  <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-red-800">Registration Failed (FastAPI & PostgreSQL)</p>
                    <p className="mt-0.5 leading-relaxed">{submissionError}</p>
                    <p className="mt-1 text-[11px] text-red-600 font-semibold">
                      Please correct the details above. If this hospital registration number or email is already registered, you cannot register again.
                    </p>
                  </div>
                </div>
              )}

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900">
                <p className="font-semibold flex items-center gap-1.5 mb-1">
                  <CheckCircle size={14} className="text-emerald-600" />
                  PostgreSQL Institutional Onboarding
                </p>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Upon submission, your application will be validated by FastAPI, stored in PostgreSQL across 4 tables, and queued as <strong>PENDING</strong> for Super Admin review.
                </p>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <Button variant="secondary" size="sm" onClick={() => setStep(2)}>
                  <ArrowLeft size={14} /> Back
                </Button>
                <Button
                  variant="success"
                  size="md"
                  disabled={isSubmitting}
                  onClick={handleSubmitApplication}
                >
                  {isSubmitting ? 'Validating & Persisting...' : 'Submit Registration Application'}
                </Button>
              </div>
            </CardBody>
          </Card>
        )}

        {/* STEP 4: SUBMISSION CONFIRMATION */}
        {step === 4 && (
          <Card className="border-2 border-emerald-500 overflow-hidden shadow-card-lg">
            <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white">
                  <CheckCircle size={28} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Application Successfully Submitted!</h2>
                  <p className="text-xs text-emerald-200 mt-0.5">Persisted in PostgreSQL & Queued for Super Admin Verification</p>
                </div>
              </div>
            </div>

            <CardBody className="space-y-5">
              {/* Registration != Login Separation Notice */}
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-amber-800">
                  <Shield size={16} className="text-amber-600" />
                  <span>Stage 1 Complete: Registration Submitted (Registration ≠ Login)</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Under MediKiosk compliance rules, submitting an application does not immediately create an active login account. Your facility is currently in <strong>PENDING VERIFICATION</strong> state. A Super Admin must review the uploaded legal licenses before an <strong>Organization ID (ORG-XXX)</strong> and administrator credentials are generated.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Application Tracking Reference (PostgreSQL)</p>
                    <p className="text-lg font-mono font-bold text-slate-900">{trackingId}</p>
                  </div>
                  <Badge variant="pending" dot>Pending Super Admin Review</Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400">Hospital:</span>
                    <p className="font-semibold text-slate-800">{hospitalName}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Location:</span>
                    <p className="font-semibold text-slate-800">{city}, {state}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Beds / Branches:</span>
                    <p className="font-semibold text-slate-800">{totalBeds} Beds ({branchesCount} Branches)</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Official Email:</span>
                    <p className="font-semibold text-slate-800 truncate">{officialEmail}</p>
                  </div>
                </div>
              </div>

              {/* What happens next */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Verification Process Timeline</h4>
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2 p-2 rounded bg-emerald-50 text-emerald-900 font-medium">
                    <CheckCircle size={14} className="text-emerald-600" />
                    <span>Step 1: Application & Documents Stored in PostgreSQL — <strong>Completed</strong></span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded bg-amber-50 text-amber-900 font-medium">
                    <Clock size={14} className="text-amber-600" />
                    <span>Step 2: Super Admin Review & Due Diligence — <strong>Pending In Queue</strong></span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded bg-slate-50 text-slate-500">
                    <Building2 size={14} />
                    <span>Step 3: Super Admin Approves ➔ Generates ORG-ID & Hospital Admin Login Account</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <Button variant="secondary" size="sm" onClick={() => navigate('/')}>
                  Back to Main Portal
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate('/admin/verification')}
                  >
                    <Shield size={14} /> Super Admin Verification Queue (Review Application)
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  )
}

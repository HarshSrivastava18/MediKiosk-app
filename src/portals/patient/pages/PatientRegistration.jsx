import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User,
  Shield,
  CreditCard,
  Phone,
  CheckCircle,
  AlertCircle,
  QrCode,
  Download,
  ArrowRight,
  ArrowLeft,
  Heart,
  Calendar,
  MapPin,
  Sparkles,
  Activity,
  Check,
  RefreshCw,
  FileCheck2,
  Stethoscope
} from 'lucide-react'
import Card, { CardHeader, CardBody } from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import Input from '../../../components/ui/Input'

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const chronicConditionsList = [
  'Hypertension',
  'Type 2 Diabetes',
  'Asthma / Respiratory Disorder',
  'Hypothyroidism',
  'Cardiovascular Disease',
  'Chronic Kidney Disease',
  'None',
]
const commonAllergies = ['Penicillin', 'Sulfa Drugs', 'Aspirin', 'Peanuts', 'Latex', 'Dust / Pollen', 'None']

export default function PatientRegistration() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)

  // Step 1: Identity Proofing
  const [idType, setIdType] = useState('aadhaar')
  const [idNumber, setIdNumber] = useState('9876 5432 1098')
  const [mobileNumber, setMobileNumber] = useState('9876543210')
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)
  const [identityVerified, setIdentityVerified] = useState(false)

  // Step 2: Demographics
  const [fullName, setFullName] = useState('Rahul Kumar')
  const [dob, setDob] = useState('1993-03-15')
  const [gender, setGender] = useState('Male')
  const [bloodGroup, setBloodGroup] = useState('O+')
  const [email, setEmail] = useState('rahul.k93@gmail.com')
  const [address, setAddress] = useState('Sector 21, Indira Nagar, Lucknow, UP - 226016')
  const [emergencyName, setEmergencyName] = useState('Sunita Kumar')
  const [emergencyRelation, setEmergencyRelation] = useState('Spouse')
  const [emergencyPhone, setEmergencyPhone] = useState('9876543219')

  // Step 3: Medical Baseline
  const [selectedConditions, setSelectedConditions] = useState(['Hypertension', 'Asthma / Respiratory Disorder'])
  const [selectedAllergies, setSelectedAllergies] = useState(['Penicillin'])
  const [currentMeds, setCurrentMeds] = useState('Amlodipine 5mg, Salbutamol Inhaler')
  const [consentConsentShare, setConsentShare] = useState(true)

  // Step 4: Generated ID
  const [generatedId, setGeneratedId] = useState('MK-8472-9812-3345')

  const handleSendOtp = () => {
    if (!idNumber || !mobileNumber) return
    setOtpSent(true)
  }

  const handleVerifyOtp = () => {
    setIsVerifyingOtp(true)
    setTimeout(() => {
      setIsVerifyingOtp(false)
      setIdentityVerified(true)
    }, 1000)
  }

  const toggleCondition = (item) => {
    if (item === 'None') {
      setSelectedConditions(['None'])
      return
    }
    const filtered = selectedConditions.filter((c) => c !== 'None')
    if (filtered.includes(item)) {
      setSelectedConditions(filtered.filter((c) => c !== item))
    } else {
      setSelectedConditions([...filtered, item])
    }
  }

  const toggleAllergy = (item) => {
    if (item === 'None') {
      setSelectedAllergies(['None'])
      return
    }
    const filtered = selectedAllergies.filter((a) => a !== 'None')
    if (filtered.includes(item)) {
      setSelectedAllergies(filtered.filter((a) => a !== item))
    } else {
      setSelectedAllergies([...filtered, item])
    }
  }

  const handleCompleteRegistration = () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000)
    const newId = `MK-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${randomSuffix}`
    setGeneratedId(newId)
    setStep(4)
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
            <span className="text-xs font-semibold text-slate-600">National Patient Registry Connected</span>
          </div>
        </div>

        {/* Hero Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
            <Shield size={13} />
            Unified Patient Identity Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">National Global Patient Registration</h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
            Create your persistent, cross-hospital Global Patient ID. Your digital health record travels securely with you across every clinic and hospital in India.
          </p>
        </div>

        {/* Wizard Step Progress */}
        <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-100">
          <div className="grid grid-cols-4 gap-2 text-center text-xs font-semibold">
            {[
              { num: 1, label: 'Identity Proof' },
              { num: 2, label: 'Demographics' },
              { num: 3, label: 'Health Baseline' },
              { num: 4, label: 'Digital Card' },
            ].map((s) => (
              <div
                key={s.num}
                className={`flex flex-col items-center gap-1.5 ${
                  step === s.num ? 'text-brand-600 font-bold' : step > s.num ? 'text-emerald-600' : 'text-slate-400'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-colors ${
                    step === s.num
                      ? 'bg-brand-600 text-white shadow-sm'
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

        {/* STEP 1: IDENTITY PROOFING */}
        {step === 1 && (
          <Card>
            <CardHeader className="bg-slate-50/60">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-brand-600 flex items-center justify-center font-bold">
                  <CreditCard size={18} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-800">Step 1: Identity Proofing & ABHA Verification</h2>
                  <p className="text-xs text-slate-500">Fast identity authentication via Aadhaar, ABHA Number, or verified Mobile OTP</p>
                </div>
              </div>
            </CardHeader>

            <CardBody className="space-y-5">
              {/* ID Selector */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-2">Select Identity Proof Source</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'aadhaar', label: 'Aadhaar (UIDAI)' },
                    { id: 'abha', label: 'ABHA Number (ABDM)' },
                    { id: 'phone', label: 'Direct Mobile OTP' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setIdType(t.id)
                        setOtpSent(false)
                        setIdentityVerified(false)
                      }}
                      className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                        idType === t.id
                          ? 'border-brand-600 bg-blue-50/60 text-brand-700 ring-2 ring-brand-500/20 shadow-sm'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ID & Phone Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label={idType === 'aadhaar' ? '12-Digit Aadhaar Number' : idType === 'abha' ? '14-Digit ABHA ID' : 'Government Photo ID'}
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  placeholder="e.g. 9876 5432 1098"
                />
                <Input
                  label="Registered Mobile Number"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="e.g. 9876543210"
                />
              </div>

              {/* OTP Generation simulation */}
              {!identityVerified ? (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700">Two-Factor Identity Verification</span>
                    {!otpSent ? (
                      <Button size="sm" variant="primary" onClick={handleSendOtp}>
                        Send OTP via SMS
                      </Button>
                    ) : (
                      <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle size={13} /> OTP Sent to +91-******3210
                      </span>
                    )}
                  </div>

                  {otpSent && (
                    <div className="flex items-center gap-3 pt-2">
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="Enter 6-digit OTP (e.g. 123456)"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="flex-1 text-sm font-mono tracking-widest px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
                      />
                      <Button
                        size="sm"
                        variant="success"
                        disabled={isVerifyingOtp}
                        onClick={handleVerifyOtp}
                      >
                        {isVerifyingOtp ? <RefreshCw size={14} className="animate-spin" /> : 'Verify Identity'}
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-xs text-emerald-900 font-semibold">
                    <CheckCircle size={18} className="text-emerald-600" />
                    <span>Identity Proof Verified with UIDAI / ABDM Gateway!</span>
                  </div>
                  <Badge variant="approved">Verified</Badge>
                </div>
              )}

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => {
                    setIdentityVerified(true)
                    setStep(2)
                  }}
                >
                  Continue to Demographics <ArrowRight size={15} />
                </Button>
              </div>
            </CardBody>
          </Card>
        )}

        {/* STEP 2: DEMOGRAPHICS */}
        {step === 2 && (
          <Card>
            <CardHeader className="bg-slate-50/60">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <User size={18} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-800">Step 2: Patient Demographics & Master Profile</h2>
                  <p className="text-xs text-slate-500">Verified core attributes for your permanent digital healthcare record</p>
                </div>
              </div>
            </CardHeader>

            <CardBody className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                <Input label="Date of Birth" type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
                
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Blood Group</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  >
                    {bloodGroups.map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <Input label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <Input label="Residential City & State" value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>

              {/* Emergency Contact */}
              <div className="pt-3 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-3">Emergency Contact Information</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input label="Contact Person Name" value={emergencyName} onChange={(e) => setEmergencyName(e.target.value)} />
                  <Input label="Relationship" value={emergencyRelation} onChange={(e) => setEmergencyRelation(e.target.value)} />
                  <Input label="Emergency Phone" value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)} />
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <Button variant="secondary" size="sm" onClick={() => setStep(1)}>
                  <ArrowLeft size={14} /> Back
                </Button>
                <Button variant="primary" size="md" onClick={() => setStep(3)}>
                  Continue to Health Baseline <ArrowRight size={15} />
                </Button>
              </div>
            </CardBody>
          </Card>
        )}

        {/* STEP 3: MEDICAL BASELINE */}
        {step === 3 && (
          <Card>
            <CardHeader className="bg-slate-50/60">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center font-bold">
                  <Heart size={18} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-800">Step 3: Baseline Clinical Profile</h2>
                  <p className="text-xs text-slate-500">Helps AI triage and attending doctors provide safe, personalized care</p>
                </div>
              </div>
            </CardHeader>

            <CardBody className="space-y-5">
              {/* Chronic conditions */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">Known Chronic Health Conditions</label>
                <div className="flex flex-wrap gap-2">
                  {chronicConditionsList.map((cond) => {
                    const isSelected = selectedConditions.includes(cond)
                    return (
                      <button
                        key={cond}
                        type="button"
                        onClick={() => toggleCondition(cond)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {isSelected && '✓ '}
                        {cond}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Known Allergies */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">Known Drug / Environmental Allergies</label>
                <div className="flex flex-wrap gap-2">
                  {commonAllergies.map((allergy) => {
                    const isSelected = selectedAllergies.includes(allergy)
                    return (
                      <button
                        key={allergy}
                        type="button"
                        onClick={() => toggleAllergy(allergy)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          isSelected
                            ? 'bg-red-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {isSelected && '✓ '}
                        {allergy}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Medications */}
              <Input
                label="Currently Consumed Routine Medications"
                value={currentMeds}
                onChange={(e) => setCurrentMeds(e.target.value)}
                placeholder="e.g. Amlodipine 5mg OD, Inhaler SOS"
              />

              {/* Consent Opt-In */}
              <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200 flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="consentShare"
                  checked={consentConsentShare}
                  onChange={(e) => setConsentShare(e.target.checked)}
                  className="mt-0.5 rounded text-brand-600 focus:ring-brand-500"
                />
                <label htmlFor="consentShare" className="text-xs text-slate-700 leading-relaxed cursor-pointer">
                  I agree to generate a persistent **Global Patient ID** under the MediKiosk National Health Architecture. I retain full authority to grant, deny, or revoke access to any hospital at any time.
                </label>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <Button variant="secondary" size="sm" onClick={() => setStep(2)}>
                  <ArrowLeft size={14} /> Back
                </Button>
                <Button
                  variant="success"
                  size="md"
                  onClick={handleCompleteRegistration}
                >
                  <Sparkles size={15} /> Generate Global Patient ID
                </Button>
              </div>
            </CardBody>
          </Card>
        )}

        {/* STEP 4: SUCCESS & DIGITAL HEALTH CARD */}
        {step === 4 && (
          <div className="space-y-6">
            <Card className="border-2 border-emerald-500 overflow-hidden shadow-card-lg">
              <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-800 text-white p-6 relative">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center font-bold text-white">
                      <Activity size={20} />
                    </div>
                    <div>
                      <h2 className="text-lg font-extrabold tracking-wide text-white">MEDIKIOSK</h2>
                      <p className="text-[10px] text-blue-200 uppercase font-semibold">National Health Authority Digital Card</p>
                    </div>
                  </div>
                  <Badge variant="approved">ABDM Active</Badge>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-blue-200 tracking-wider">Global Patient ID</p>
                    <p className="text-xl sm:text-2xl font-mono font-extrabold text-white tracking-widest mt-0.5">
                      {generatedId}
                    </p>
                    <p className="text-sm font-semibold text-white mt-1">{fullName}</p>
                    <p className="text-xs text-blue-100">{gender} • DOB: {dob} • Blood: {bloodGroup}</p>
                  </div>

                  {/* QR Code Container */}
                  <div className="bg-white p-2.5 rounded-xl shadow-md flex flex-col items-center">
                    <div className="w-20 h-20 bg-slate-900 rounded-lg flex items-center justify-center text-white text-[9px] text-center p-1 font-mono">
                      QR: {generatedId.slice(0, 11)}...
                    </div>
                    <span className="text-[9px] font-bold text-slate-700 mt-1">Kiosk Scan Code</span>
                  </div>
                </div>
              </div>

              <CardBody className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-slate-400 font-semibold uppercase text-[10px]">Registered Address</p>
                    <p className="text-slate-700 font-medium mt-0.5">{address}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-slate-400 font-semibold uppercase text-[10px]">Emergency Contact</p>
                    <p className="text-slate-700 font-medium mt-0.5">{emergencyName} ({emergencyRelation}) - {emergencyPhone}</p>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center gap-2 text-xs text-emerald-800">
                  <CheckCircle size={16} className="text-emerald-600 flex-shrink-0" />
                  <span>Your Global Patient ID is activated and available immediately across all kiosk terminals and participating hospitals.</span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <Button variant="secondary" size="sm" onClick={() => window.print()}>
                    <Download size={14} /> Print Health Card
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => navigate('/patient')}>
                      Go to Patient Dashboard
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => navigate('/patient/my-case')}>
                      <Stethoscope size={14} /> Start AI Case Consultation
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

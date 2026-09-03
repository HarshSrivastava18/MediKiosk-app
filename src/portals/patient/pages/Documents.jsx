import { useState, useRef } from 'react'
import {
  Upload,
  FileText,
  Image as ImageIcon,
  FlaskConical,
  Heart,
  Eye,
  Trash2,
  Search,
  Filter,
  Download,
  CheckCircle,
  Clock,
  Plus
} from 'lucide-react'
import Card, { CardHeader, CardBody } from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import { useCurrentPatient } from '../useCurrentPatient'
import { apiRequest } from '../../../lib/api'

const defaultDocs = [
  { id: 1, name: 'ECG Report — Aug 2026',        date: '28 Aug 2026', type: 'ECG',          status: 'processed', size: '1.2 MB', icon: 'ecg' },
  { id: 2, name: 'Blood CBC Report',              date: '25 Apr 2026', type: 'Lab',          status: 'processed', size: '0.8 MB', icon: 'lab' },
  { id: 3, name: 'Amlodipine Prescription',       date: '29 Aug 2026', type: 'Prescription', status: 'processed', size: '0.3 MB', icon: 'rx' },
]

const typeIcon = {
  ecg: { Icon: Heart,      bg: 'bg-red-100',    text: 'text-red-600' },
  lab: { Icon: FlaskConical,bg:'bg-amber-100',  text: 'text-amber-600' },
  rx:  { Icon: FileText,   bg: 'bg-emerald-100',text: 'text-emerald-600' },
  img: { Icon: ImageIcon,  bg: 'bg-violet-100', text: 'text-violet-600' },
}

const typeVariant = {
  ECG: 'danger', Lab: 'warning', Prescription: 'success', Radiology: 'purple', Cardiology: 'blue',
}

export default function Documents() {
  const { patient, addDocument } = useCurrentPatient()
  const [search, setSearch] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const fileInputRef = useRef(null)

  const activeDocuments = patient.documents && patient.documents.length > 0 ? patient.documents : defaultDocs

  const filtered = activeDocuments.filter(
    (d) =>
      d.name?.toLowerCase().includes(search.toLowerCase()) ||
      d.type?.toLowerCase().includes(search.toLowerCase())
  )

  const handleFileUpload = async (e) => {
    const file = e.target?.files?.[0]
    if (!file) return

    const newDoc = {
      id: `DOC-${Date.now().toString().slice(-4)}`,
      name: file.name,
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      type: file.name.toLowerCase().includes('blood') || file.name.toLowerCase().includes('lab') ? 'Lab' : 'General Report',
      status: 'processed',
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      icon: file.name.toLowerCase().includes('ecg') ? 'ecg' : 'lab'
    }

    try {
      await apiRequest('/patient/documents', {
        method: 'POST',
        body: JSON.stringify({
          name: newDoc.name,
          type: newDoc.type,
          size: newDoc.size
        })
      })
    } catch {
      // Local fallback
    }

    addDocument(newDoc)
    setUploadSuccess(true)
    setTimeout(() => setUploadSuccess(false), 3000)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">My Documents</h1>
          <p className="text-slate-500 text-sm mt-0.5">Health documents for {patient.name} ({patient.id})</p>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png,.dicom"
        />
        <Button className="gap-2 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <Upload size={15} />
          Upload Document
        </Button>
      </div>

      {uploadSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle size={15} className="text-emerald-600" />
          <span>Document uploaded and added to your permanent health timeline!</span>
        </div>
      )}

      {/* Upload dropzone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          if (e.dataTransfer.files?.[0]) {
            handleFileUpload({ target: { files: e.dataTransfer.files } })
          }
        }}
        className={[
          'rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-150 cursor-pointer',
          dragOver ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-slate-50/60 hover:border-blue-400 hover:bg-blue-50/30',
        ].join(' ')}
      >
        <Upload size={28} className={`mx-auto mb-3 ${dragOver ? 'text-blue-500' : 'text-slate-400'}`} />
        <p className="text-sm font-medium text-slate-700">Drag &amp; drop files here, or click to browse</p>
        <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG, DICOM — Max 20 MB per file</p>
        <div className="flex items-center justify-center gap-2 mt-3">
          <span className="text-xs text-slate-400">Accepted types:</span>
          {['Blood Report', 'ECG', 'Prescription', 'X-Ray', 'MRI'].map((t) => (
            <span key={t} className="text-xs bg-white border border-slate-200 px-2 py-0.5 rounded-full text-slate-600 font-medium">
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Search & filter bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents…"
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
      </div>

      {/* Document grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((doc) => {
          const cfg = typeIcon[doc.icon] || typeIcon.rx
          const Icon = cfg.Icon
          return (
            <Card key={doc.id} hoverable>
              <CardBody>
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                    <Icon size={18} className={cfg.text} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{doc.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{doc.date} · {doc.size || '1.0 MB'}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={typeVariant[doc.type] || 'default'}>{doc.type || 'Document'}</Badge>
                      <Badge
                        variant={doc.status === 'processed' ? 'success' : 'warning'}
                        dot
                      >
                        {doc.status === 'processed' ? 'Processed' : 'Pending'}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                  <button className="flex-1 flex items-center justify-center gap-1.5 text-xs text-blue-600 font-medium hover:text-blue-700 transition-colors py-1 cursor-pointer">
                    <Eye size={13} /> View
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-1.5 text-xs text-slate-500 font-medium hover:text-slate-700 transition-colors py-1 cursor-pointer">
                    <Download size={13} /> Download
                  </button>
                </div>
              </CardBody>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
